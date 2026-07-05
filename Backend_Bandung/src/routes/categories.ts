import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { pool } from "../db.js";
import * as pendidikan from "../services/pendidikan.js";

const router = Router();

// Membungkus handler async supaya kegagalan query (mis. DB tidak bisa dihubungi)
// dikembalikan sebagai response error, bukan men-crash seluruh proses server.
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

// POST /api/categories/api-keys — buat API key baru untuk fitur "Kunci API Anda" di /data-api
router.post("/api-keys", asyncRoute(async (req, res) => {
  const label = typeof req.body?.label === "string" && req.body.label.trim() !== "" ? req.body.label.trim() : "dashboard-web-user";
  const key = "bdg_live_" + crypto.randomBytes(20).toString("hex");

  await pool.query(`INSERT INTO api_keys (key, label) VALUES ($1, $2)`, [key, label]);

  res.status(201).json({ key, label });
}));

// GET /api/categories
router.get("/", asyncRoute(async (_req, res) => {
  const result = await pool.query(
    `SELECT id, slug, name, description, dataset_count AS "datasetCount"
     FROM categories ORDER BY id`
  );
  res.json(result.rows);
}));

// GET /api/categories/:slug/datasets
router.get("/:slug/datasets", asyncRoute(async (req, res) => {
  const { slug } = req.params;

  const categoryResult = await pool.query(
    `SELECT id FROM categories WHERE slug = $1`,
    [slug]
  );

  if (categoryResult.rows.length === 0) {
    res.status(404).json({ error: `Kategori '${slug}' tidak ditemukan.` });
    return;
  }

  const categoryId = categoryResult.rows[0].id;
  const datasetsResult = await pool.query(
    `SELECT id, category_id AS "categoryId", source_id AS "sourceId", name,
            source_api_url AS "sourceApiUrl", sync_frequency AS "syncFrequency",
            last_synced_at AS "lastSyncedAt"
     FROM datasets WHERE category_id = $1 ORDER BY id`,
    [categoryId]
  );
  res.json(datasetsResult.rows);
}));

// GET /api/categories/kependudukan/population-summary
router.get("/kependudukan/population-summary", asyncRoute(async (_req, res) => {
  const yearsResult = await pool.query(
    `SELECT DISTINCT tahun FROM population_by_age ORDER BY tahun DESC LIMIT 2`
  );
  const [latestYear, previousYear] = yearsResult.rows.map((r) => r.tahun);

  const totalResult = await pool.query(
    `SELECT SUM(jumlah_penduduk) AS total, COUNT(DISTINCT bps_nama_kecamatan) AS "jumlahKecamatan"
     FROM population_by_age WHERE tahun = $1`,
    [latestYear]
  );

  let previousTotal: number | null = null;
  if (previousYear) {
    const previousResult = await pool.query(
      `SELECT SUM(jumlah_penduduk) AS total FROM population_by_age WHERE tahun = $1`,
      [previousYear]
    );
    previousTotal = Number(previousResult.rows[0].total);
  }

  const topKecamatanResult = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, SUM(jumlah_penduduk) AS "jumlahPenduduk"
     FROM population_by_age WHERE tahun = $1
     GROUP BY bps_nama_kecamatan ORDER BY SUM(jumlah_penduduk) DESC LIMIT 3`,
    [latestYear]
  );

  const totalPenduduk = Number(totalResult.rows[0].total);

  res.json({
    tahun: latestYear,
    totalPenduduk,
    jumlahKecamatan: Number(totalResult.rows[0].jumlahKecamatan),
    pertumbuhanPersen:
      previousTotal !== null ? ((totalPenduduk - previousTotal) / previousTotal) * 100 : null,
    kecamatanTerpadat: topKecamatanResult.rows,
  });
}));

// GET /api/categories/kependudukan/population-by-age?tahun=2024&kecamatan=SUKASARI
router.get("/kependudukan/population-by-age", asyncRoute(async (req, res) => {
  const { tahun, kecamatan } = req.query;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (typeof tahun === "string") {
    params.push(Number(tahun));
    conditions.push(`tahun = $${params.length}`);
  }
  if (typeof kecamatan === "string") {
    params.push(kecamatan.toUpperCase());
    conditions.push(`bps_nama_kecamatan = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS "kecamatan", usia_tahun AS "usiaTahun",
            jumlah_penduduk AS "jumlahPenduduk", tahun
     FROM population_by_age
     ${where}
     ORDER BY tahun, bps_nama_kecamatan, usia_tahun`,
    params
  );
  res.json(result.rows);
}));

// ─── Pendidikan (SMP) ──────────────────────────────────────────────────────────

// GET /api/categories/pendidikan/summary?tahun=2024&semester=2
router.get("/pendidikan/summary", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await pendidikan.getSummary(tahun, semester));
}));

// GET /api/categories/pendidikan/trend
router.get("/pendidikan/trend", asyncRoute(async (_req, res) => {
  res.json(await pendidikan.getTrend());
}));

// GET /api/categories/pendidikan/sekolah-per-kecamatan?tahun=2024&semester=2
router.get("/pendidikan/sekolah-per-kecamatan", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await pendidikan.getSekolahPerKecamatan(tahun, semester));
}));

// GET /api/categories/pendidikan/guru-siswa-per-kecamatan?tahun=2024&semester=2
router.get("/pendidikan/guru-siswa-per-kecamatan", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await pendidikan.getGuruSiswaPerKecamatan(tahun, semester));
}));

// GET /api/categories/pendidikan/siswa-gender?tahun=2024&semester=2
router.get("/pendidikan/siswa-gender", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await pendidikan.getSiswaGender(tahun, semester));
}));

// GET /api/categories/pendidikan/sebaran-sekolah?status=NEGERI&tahun=2024&semester=2
router.get("/pendidikan/sebaran-sekolah", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  const { status } = req.query;
  res.json(await pendidikan.getSebaranSekolah(tahun, semester, typeof status === "string" ? status : undefined));
}));

export default router;
