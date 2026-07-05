import { Router, type Request, type Response } from "express";
import { requireApiKey } from "../middleware/requireApiKey.js";
import * as pendidikan from "../services/pendidikan.js";

const router = Router();

router.use(requireApiKey);

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

function envelope(data: unknown) {
  return { data, meta: { source: "Dinas Pendidikan Kota Bandung", generatedAt: new Date().toISOString() } };
}

// GET /api/v1/pendidikan/summary?tahun=2024&semester=2
router.get("/pendidikan/summary", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(envelope(await pendidikan.getSummary(tahun, semester)));
}));

// GET /api/v1/pendidikan/trend
router.get("/pendidikan/trend", asyncRoute(async (_req, res) => {
  res.json(envelope(await pendidikan.getTrend()));
}));

// GET /api/v1/pendidikan/sekolah-per-kecamatan?tahun=2024&semester=2
router.get("/pendidikan/sekolah-per-kecamatan", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(envelope(await pendidikan.getSekolahPerKecamatan(tahun, semester)));
}));

// GET /api/v1/pendidikan/guru-siswa-per-kecamatan?tahun=2024&semester=2
router.get("/pendidikan/guru-siswa-per-kecamatan", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(envelope(await pendidikan.getGuruSiswaPerKecamatan(tahun, semester)));
}));

// GET /api/v1/pendidikan/siswa-gender?tahun=2024&semester=2
router.get("/pendidikan/siswa-gender", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  res.json(envelope(await pendidikan.getSiswaGender(tahun, semester)));
}));

// GET /api/v1/pendidikan/sebaran-sekolah?status=NEGERI&tahun=2024&semester=2
router.get("/pendidikan/sebaran-sekolah", asyncRoute(async (req, res) => {
  const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
  const { status } = req.query;
  res.json(envelope(await pendidikan.getSebaranSekolah(tahun, semester, typeof status === "string" ? status : undefined)));
}));

export default router;
