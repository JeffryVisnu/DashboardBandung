import { Router, type Request, type Response } from "express";
import { pool } from "../db.js";
import * as pendidikan from "../services/pendidikan.js";
import * as sd from "../services/sd.js";
import * as sectorViews from "../services/sectorViews.js";
import * as siteSettings from "../services/siteSettings.js";
import * as sectors from "../services/sectors.js";
import * as apiRequests from "../services/apiRequests.js";
import { sendApiRequestConfirmation, sendAdminNotification } from "../services/mailer.js";

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

// GET /api/categories/site-settings — logo, teks hero, statistik homepage (dikelola admin)
router.get("/site-settings", asyncRoute(async (_req, res) => {
  const settings = await siteSettings.getSiteSettings();
  if (!settings) {
    res.status(404).json({ error: "site_settings belum di-seed." });
    return;
  }
  res.json(settings);
}));

// GET /api/categories/sectors — daftar sektor (dikelola admin, menggantikan SECTORS statis di FE)
router.get("/sectors", asyncRoute(async (_req, res) => {
  res.json(await sectors.listSectors());
}));

// GET /api/categories/sectors/:id/datasets — dataset (embed iframe) milik 1 sektor
router.get("/sectors/:id/datasets", asyncRoute(async (req, res) => {
  res.json(await sectors.listDatasets(req.params.id));
}));

// GET /api/categories/sector-datasets — dataset semua sektor sekaligus, dipakai kartu
// "Dashboard" di /topik & beranda supaya tidak perlu fetch per sektor satu-satu.
router.get("/sector-datasets", asyncRoute(async (_req, res) => {
  res.json(await sectors.listAllDatasets());
}));

// POST /api/categories/datasets/:id/view — nambah 1 kunjungan 1 dashboard. Dipanggil sekali
// tiap halaman 1 dashboard (/dashboard/[slug]/[dashboardId]) dibuka — angka "dilihat" jadi
// per-dashboard, bukan lagi digabung per sektor.
router.post("/datasets/:id/view", asyncRoute(async (req, res) => {
  const views = await sectors.incrementDatasetView(Number(req.params.id));
  if (views === null) {
    res.status(404).json({ error: "Dashboard tidak ditemukan." });
    return;
  }
  res.json({ id: Number(req.params.id), views });
}));

// POST /api/categories/api-requests — formulir publik "Ajukan Permintaan API"
router.post("/api-requests", asyncRoute(async (req, res) => {
  const { name, institution, website, email, notes } = req.body ?? {};
  if ([name, institution, email].some((v) => typeof v !== "string" || v.trim() === "")) {
    res.status(400).json({ error: "name, institution, dan email wajib diisi." });
    return;
  }

  const created = await apiRequests.createRequest({ name, institution, website, email, notes });

  sendApiRequestConfirmation(email, name).catch(() => {});
  sendAdminNotification({ name, institution, email, website, notes }).catch(() => {});

  res.status(201).json(created);
}));

// GET /api/categories/sector-visibility — dipakai FE untuk menyaring sektor yang disembunyikan admin
router.get("/sector-visibility", asyncRoute(async (_req, res) => {
  const result = await pool.query(
    `SELECT sector_id AS "sectorId", is_visible AS "isVisible" FROM sector_visibility`
  );
  res.json(result.rows);
}));

// GET /api/categories/sector-views — jumlah kunjungan (total view) nyata per sektor,
// dipakai halaman /topik menggantikan angka dummy.
router.get("/sector-views", asyncRoute(async (_req, res) => {
  res.json(await sectorViews.getAllViews());
}));

// POST /api/categories/:slug/view — nambah 1 kunjungan sektor. Dipanggil sekali tiap
// halaman detail sektor (/dashboard/[slug]) dibuka.
router.post("/:slug/view", asyncRoute(async (req, res) => {
  const views = await sectorViews.incrementView(req.params.slug);
  res.json({ sectorId: req.params.slug, views });
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

// ─── Pendidikan (SD) — sejajar dengan /pendidikan/* (SMP) di atas ─────────────────────────────

// GET /api/categories/sd/summary?tahun=2024&semester=2
router.get("/sd/summary", asyncRoute(async (req, res) => {
  const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await sd.getSummary(tahun, semester));
}));

// GET /api/categories/sd/trend
router.get("/sd/trend", asyncRoute(async (_req, res) => {
  res.json(await sd.getTrend());
}));

// GET /api/categories/sd/sekolah-per-kecamatan?tahun=2024&semester=2
router.get("/sd/sekolah-per-kecamatan", asyncRoute(async (req, res) => {
  const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await sd.getSekolahPerKecamatan(tahun, semester));
}));

// GET /api/categories/sd/guru-siswa-per-kecamatan?tahun=2024&semester=2
router.get("/sd/guru-siswa-per-kecamatan", asyncRoute(async (req, res) => {
  const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await sd.getGuruSiswaPerKecamatan(tahun, semester));
}));

// GET /api/categories/sd/siswa-gender?tahun=2024&semester=2
router.get("/sd/siswa-gender", asyncRoute(async (req, res) => {
  const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(await sd.getSiswaGender(tahun, semester));
}));

// GET /api/categories/sd/sebaran-sekolah?status=NEGERI&tahun=2024&semester=2
router.get("/sd/sebaran-sekolah", asyncRoute(async (req, res) => {
  const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
  const { status } = req.query;
  res.json(await sd.getSebaranSekolah(tahun, semester, typeof status === "string" ? status : undefined));
}));

export default router;
