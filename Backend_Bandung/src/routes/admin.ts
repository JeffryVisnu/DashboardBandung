import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import * as siteSettings from "../services/siteSettings.js";
import * as sectors from "../services/sectors.js";
import * as apiRequests from "../services/apiRequests.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "";

const UPLOAD_DIR = "uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `logo-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("File harus berupa gambar."));
      return;
    }
    cb(null, true);
  },
});

// Membungkus handler async supaya kegagalan query dikembalikan sebagai response error,
// bukan men-crash seluruh proses server (pola sama seperti asyncRoute di categories.ts).
function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.status(503).json({ error: "Gagal terhubung ke database, coba lagi." });
    }
  };
}

// POST /api/admin/login — { email, password } → JWT
router.post("/login", asyncRoute(async (req, res) => {
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
  const updated = await siteSettings.updateLogoPath(`/uploads/${req.file.filename}`);
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
