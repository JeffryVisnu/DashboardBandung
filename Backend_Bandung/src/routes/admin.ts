import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import * as siteSettings from "../services/siteSettings.js";
import * as sectors from "../services/sectors.js";
import * as apiRequests from "../services/apiRequests.js";
import { JWT_SECRET } from "../config.js";

const router = Router();

// Maks. 10 percobaan login per IP tiap 15 menit — mencegah brute-force password admin.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." },
});

// Hash dummy dipakai saat email tidak ditemukan, supaya bcrypt.compare tetap dijalankan dan
// waktu respons konsisten dengan kasus email valid + password salah — mencegah enumerasi email
// admin lewat timing side-channel (endpoint sama-sama balas 401 "Email atau password salah",
// tapi tanpa ini responsnya jauh lebih cepat saat email tidak dikenal, karena bcrypt dilewati).
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);

const UPLOAD_DIR = "uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// `file.mimetype`/nama file dari client tidak bisa dipercaya (gampang dipalsukan lewat
// multipart request) — jadi upload ditampung di memori dulu, isinya disniff dari magic bytes,
// baru ditulis ke disk dengan ekstensi yang berasal dari tipe HASIL SNIFF, bukan klaim client.
// Ini mencegah upload file .html/.js berkedok gambar yang lalu dieksekusi browser saat dibuka
// langsung dari /uploads (stored XSS).
const IMAGE_SIGNATURES: { ext: string; matches: (buf: Buffer) => boolean }[] = [
  { ext: "png", matches: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: "jpg", matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "gif", matches: (b) => b.length >= 6 && b.toString("ascii", 0, 6).match(/^GIF8[79]a$/) !== null },
  {
    ext: "webp",
    matches: (b) => b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
];

function sniffImageExt(buffer: Buffer): string | null {
  return IMAGE_SIGNATURES.find((sig) => sig.matches(buffer))?.ext ?? null;
}

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("File harus berupa gambar."));
      return;
    }
    cb(null, true);
  },
});

// Sniff tipe asli dari isi file, tulis ke disk sendiri (bukan lewat multer.diskStorage) supaya
// ekstensi file yang tersimpan selalu berasal dari hasil sniff, bukan dari nama file klien.
function saveValidatedImage(file: Express.Multer.File): string {
  const ext = sniffImageExt(file.buffer);
  if (!ext) {
    throw Object.assign(new Error("File bukan gambar yang valid (PNG/JPG/GIF/WEBP)."), { statusCode: 400 });
  }
  const filename = `logo-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);
  return filename;
}

// Membungkus handler async supaya kegagalan query dikembalikan sebagai response error,
// bukan men-crash seluruh proses server (pola sama seperti asyncRoute di categories.ts).
function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      // Error yang sengaja dilempar dengan statusCode (mis. validasi upload) dibalas apa
      // adanya — jangan disamaratakan jadi "database error" seperti kegagalan tak terduga lain.
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode) {
        res.status(statusCode).json({ error: (err as Error).message });
        return;
      }
      console.error(err);
      res.status(503).json({ error: "Gagal terhubung ke database, coba lagi." });
    }
  };
}

// POST /api/admin/login — { email, password } → JWT
router.post("/login", loginLimiter, asyncRoute(async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "email dan password wajib diisi." });
    return;
  }

  const result = await pool.query(
    `SELECT id, email, password_hash FROM admin_users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    res.status(401).json({ error: "Email atau password salah." });
    return;
  }

  const admin = result.rows[0];
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    res.status(401).json({ error: "Email atau password salah." });
    return;
  }

  const token = jwt.sign({ adminId: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token, email: admin.email });
}));

// Semua route di bawah ini wajib token admin valid.
router.use(requireAdmin);

// POST /api/admin/api-keys — buat API key baru untuk aplikasi eksternal (dipindahkan dari
// /api/categories/api-keys yang sebelumnya bisa dipanggil siapa saja tanpa autentikasi)
router.post("/api-keys", asyncRoute(async (req, res) => {
  const label = typeof req.body?.label === "string" && req.body.label.trim() !== "" ? req.body.label.trim() : "unnamed-app";
  const key = "bdg_live_" + crypto.randomBytes(20).toString("hex");

  await pool.query(`INSERT INTO api_keys (key, label) VALUES ($1, $2)`, [key, label]);

  res.status(201).json({ key, label });
}));

// GET /api/admin/api-keys — daftar semua API key
router.get("/api-keys", asyncRoute(async (_req, res) => {
  const result = await pool.query(
    `SELECT id, key, label, is_active AS "isActive", created_at AS "createdAt", last_used_at AS "lastUsedAt"
     FROM api_keys ORDER BY created_at DESC`
  );
  res.json(result.rows);
}));

// PATCH /api/admin/api-keys/:id — toggle aktif/nonaktif (revoke)
router.patch("/api-keys/:id", asyncRoute(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body ?? {};

  if (typeof isActive !== "boolean") {
    res.status(400).json({ error: "isActive (boolean) wajib diisi." });
    return;
  }

  const result = await pool.query(
    `UPDATE api_keys SET is_active = $1 WHERE id = $2
     RETURNING id, key, label, is_active AS "isActive", created_at AS "createdAt", last_used_at AS "lastUsedAt"`,
    [isActive, id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: "API key tidak ditemukan." });
    return;
  }

  res.json(result.rows[0]);
}));

// DELETE /api/admin/api-keys/:id — hapus permanen (bukan sekadar nonaktifkan)
router.delete("/api-keys/:id", asyncRoute(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`DELETE FROM api_keys WHERE id = $1 RETURNING id`, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: "API key tidak ditemukan." });
    return;
  }

  res.status(204).end();
}));

// GET /api/admin/sector-visibility — status tampil/sembunyi tiap sektor
router.get("/sector-visibility", asyncRoute(async (_req, res) => {
  const result = await pool.query(
    `SELECT sector_id AS "sectorId", is_visible AS "isVisible", updated_at AS "updatedAt"
     FROM sector_visibility ORDER BY sector_id`
  );
  res.json(result.rows);
}));

// PATCH /api/admin/sector-visibility/:sectorId — toggle tampil/sembunyikan sektor
router.patch("/sector-visibility/:sectorId", asyncRoute(async (req, res) => {
  const { sectorId } = req.params;
  const { isVisible } = req.body ?? {};

  if (typeof isVisible !== "boolean") {
    res.status(400).json({ error: "isVisible (boolean) wajib diisi." });
    return;
  }

  const result = await pool.query(
    `UPDATE sector_visibility SET is_visible = $1, updated_at = now() WHERE sector_id = $2
     RETURNING sector_id AS "sectorId", is_visible AS "isVisible", updated_at AS "updatedAt"`,
    [isVisible, sectorId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: "Sektor tidak ditemukan." });
    return;
  }

  res.json(result.rows[0]);
}));

// PUT /api/admin/site-settings — ubah teks hero/statistik homepage
router.put("/site-settings", asyncRoute(async (req, res) => {
  const updated = await siteSettings.updateSiteSettings(req.body ?? {});
  res.json(updated);
}));

// POST /api/admin/site-settings/logo — unggah logo baru (multipart/form-data, field "logo")
router.post("/site-settings/logo", logoUpload.single("logo"), asyncRoute(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "File logo wajib disertakan (field 'logo')." });
    return;
  }
  const filename = saveValidatedImage(req.file);
  const updated = await siteSettings.updateLogoPath(`/uploads/${filename}`);
  res.json(updated);
}));

// POST /api/admin/site-settings/footer-logo — unggah logo footer (terpisah dari logo header)
router.post("/site-settings/footer-logo", logoUpload.single("logo"), asyncRoute(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "File logo wajib disertakan (field 'logo')." });
    return;
  }
  const filename = saveValidatedImage(req.file);
  const updated = await siteSettings.updateFooterLogoPath(`/uploads/${filename}`);
  res.json(updated);
}));

// ─── Sektor & dataset ──────────────────────────────────────────────────────────

router.post("/sectors", asyncRoute(async (req, res) => {
  const { id, code, name, desc, color, tint, sortOrder } = req.body ?? {};
  if ([id, code, name, desc, color, tint].some((v) => typeof v !== "string" || v.trim() === "")) {
    res.status(400).json({ error: "id, code, name, desc, color, tint wajib diisi." });
    return;
  }
  const created = await sectors.createSector({ id, code, name, desc, color, tint, sortOrder });
  res.status(201).json(created);
}));

router.put("/sectors/:id", asyncRoute(async (req, res) => {
  const updated = await sectors.updateSector(req.params.id, req.body ?? {});
  if (!updated) {
    res.status(404).json({ error: "Sektor tidak ditemukan." });
    return;
  }
  res.json(updated);
}));

router.delete("/sectors/:id", asyncRoute(async (req, res) => {
  const deleted = await sectors.deleteSector(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Sektor tidak ditemukan." });
    return;
  }
  res.status(204).end();
}));

router.post("/sectors/:id/datasets", asyncRoute(async (req, res) => {
  const { title, iframeUrl, width, height, sortOrder } = req.body ?? {};
  if ([title, iframeUrl].some((v) => typeof v !== "string" || v.trim() === "")) {
    res.status(400).json({ error: "title, iframeUrl wajib diisi." });
    return;
  }
  const created = await sectors.createDataset({
    sectorId: req.params.id,
    title,
    iframeUrl,
    width: typeof width === "number" ? width : undefined,
    height: typeof height === "number" ? height : undefined,
    sortOrder,
  });
  res.status(201).json(created);
}));

router.put("/datasets/:id", asyncRoute(async (req, res) => {
  const updated = await sectors.updateDataset(Number(req.params.id), req.body ?? {});
  if (!updated) {
    res.status(404).json({ error: "Dataset tidak ditemukan." });
    return;
  }
  res.json(updated);
}));

router.delete("/datasets/:id", asyncRoute(async (req, res) => {
  const deleted = await sectors.deleteDataset(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Dataset tidak ditemukan." });
    return;
  }
  res.status(204).end();
}));

// ─── Permintaan API ────────────────────────────────────────────────────────────

router.get("/api-requests", asyncRoute(async (_req, res) => {
  res.json(await apiRequests.listRequests());
}));

router.patch("/api-requests/:id", asyncRoute(async (req, res) => {
  const { status } = req.body ?? {};
  if (typeof status !== "string" || !["pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "status wajib salah satu dari: pending, approved, rejected." });
    return;
  }
  const updated = await apiRequests.updateStatus(Number(req.params.id), status);
  if (!updated) {
    res.status(404).json({ error: "Permintaan tidak ditemukan." });
    return;
  }
  res.json(updated);
}));

export default router;
