import { Router, type Request, type Response } from "express";
import { requireApiKey } from "../middleware/requireApiKey.js";
import * as pendidikan from "../services/pendidikan.js";
import * as sd from "../services/sd.js";
import * as rumahSakit from "../services/rumahSakit.js";
import * as kependudukan from "../services/kependudukan.js";
import * as lingkungan from "../services/lingkungan.js";
import * as infrastruktur from "../services/infrastruktur.js";
import * as ekonomi from "../services/ekonomi.js";
import * as sosial from "../services/sosial.js";
import * as pajak from "../services/pajak.js";
import * as sectorsService from "../services/sectors.js";

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

function envelope(data: unknown, source = "Diskominfo Kota Bandung") {
  return { data, meta: { source, generatedAt: new Date().toISOString() } };
}

/**
 * Endpoint bespoke (query SQL kustom, bukan sekadar metadata dashboard) didaftarkan di sini,
 * dikelompokkan per sektor -> per dashboard -> nama endpoint. Menambah endpoint baru untuk
 * dashboard yang sudah bespoke (mis. jenjang SMA nanti) cukup menambah 1 baris di sini.
 */
const BESPOKE_ENDPOINTS: Record<string, Record<string, Record<string, (req: Request) => Promise<unknown>>>> = {
  pendidikan: {
    "dashboard-sekolah-menengah-pertama": {
      summary: async (req) => {
        const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
        return pendidikan.getSummary(tahun, semester);
      },
      trend: async () => pendidikan.getTrend(),
      "sekolah-per-kecamatan": async (req) => {
        const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
        return pendidikan.getSekolahPerKecamatan(tahun, semester);
      },
      "guru-siswa-per-kecamatan": async (req) => {
        const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
        return pendidikan.getGuruSiswaPerKecamatan(tahun, semester);
      },
      "siswa-gender": async (req) => {
        const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
        return pendidikan.getSiswaGender(tahun, semester);
      },
      "sebaran-sekolah": async (req) => {
        const { tahun, semester } = await pendidikan.resolvePeriod(req.query.tahun, req.query.semester);
        const { status } = req.query;
        return pendidikan.getSebaranSekolah(tahun, semester, typeof status === "string" ? status : undefined);
      },
    },
    "dashboard-sekolah-dasar": {
      summary: async (req) => {
        const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
        return sd.getSummary(tahun, semester);
      },
      trend: async () => sd.getTrend(),
      "sekolah-per-kecamatan": async (req) => {
        const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
        return sd.getSekolahPerKecamatan(tahun, semester);
      },
      "guru-siswa-per-kecamatan": async (req) => {
        const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
        return sd.getGuruSiswaPerKecamatan(tahun, semester);
      },
      "siswa-gender": async (req) => {
        const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
        return sd.getSiswaGender(tahun, semester);
      },
      "sebaran-sekolah": async (req) => {
        const { tahun, semester } = await sd.resolvePeriod(req.query.tahun, req.query.semester);
        const { status } = req.query;
        return sd.getSebaranSekolah(tahun, semester, typeof status === "string" ? status : undefined);
      },
    },
  },
  kesehatan: {
    "rumah-sakit": {
      summary: async (req) => rumahSakit.getSummary(await rumahSakit.resolveTahun(req.query.tahun)),
      trend: async () => rumahSakit.getTrend(),
      "rumah-sakit-per-kecamatan": async (req) =>
        rumahSakit.getRumahSakitPerKecamatan(await rumahSakit.resolveTahun(req.query.tahun)),
      "jenis-status": async (req) => rumahSakit.getJenisStatus(await rumahSakit.resolveTahun(req.query.tahun)),
      "sebaran-rumah-sakit": async (req) =>
        rumahSakit.getSebaranRumahSakit(await rumahSakit.resolveTahun(req.query.tahun)),
    },
  },
  kependudukan: {
    "demografi-dan-kepadatan-penduduk-kota-bandung": {
      summary: async (req) => kependudukan.getSummary(await kependudukan.resolveTahun(req.query.tahun)),
      trend: async () => kependudukan.getTrend(),
      "kepadatan-per-kecamatan": async (req) =>
        kependudukan.getKepadatanPerKecamatan(await kependudukan.resolveTahun(req.query.tahun)),
      "kepala-keluarga-per-kecamatan": async (req) =>
        kependudukan.getKepalaKeluargaPerKecamatan(await kependudukan.resolveTahun(req.query.tahun)),
      "luas-wilayah-per-kecamatan": async () => kependudukan.getLuasWilayahPerKecamatan(),
    },
  },
  lingkungan: {
    "pengelolaan-sampah-kebersihan-di-kota-bandung": {
      summary: async (req) => lingkungan.getSummary(await lingkungan.resolveTahun(req.query.tahun)),
      trend: async () => lingkungan.getTrend(),
      "capaian-per-bulan": async (req) => lingkungan.getCapaianPerBulan(await lingkungan.resolveTahun(req.query.tahun)),
      "produksi-per-jenis": async (req) => lingkungan.getProduksiPerJenis(await lingkungan.resolveTahun(req.query.tahun)),
      "ritasi-per-bulan": async (req) => lingkungan.getRitasiPerBulan(await lingkungan.resolveTahun(req.query.tahun)),
      "kompensasi-per-kategori": async (req) =>
        lingkungan.getKompensasiPerKategori(await lingkungan.resolveTahun(req.query.tahun)),
    },
  },
  infrastruktur: {
    "kolam-retensi-aktif-di-kota-bandung": {
      summary: async (req) => infrastruktur.getSummary(await infrastruktur.resolveTahun(req.query.tahun)),
      trend: async () => infrastruktur.getTrend(),
      "kolam-per-kecamatan": async (req) =>
        infrastruktur.getKolamPerKecamatan(await infrastruktur.resolveTahun(req.query.tahun)),
      "volume-per-kecamatan": async (req) =>
        infrastruktur.getVolumePerKecamatan(await infrastruktur.resolveTahun(req.query.tahun)),
      "sebaran-kolam": async (req) => infrastruktur.getSebaranKolam(await infrastruktur.resolveTahun(req.query.tahun)),
    },
  },
  ekonomi: {
    "perdagangan-aktivitas-ekonomi-kota-bandung": {
      summary: async (req) => ekonomi.getSummary(await ekonomi.resolveTahun(req.query.tahun)),
      "trend-ekspor": async () => ekonomi.getTrendEkspor(),
      "pasar-per-jenis": async (req) => ekonomi.getPasarPerJenis(await ekonomi.resolveTahun(req.query.tahun)),
      "trend-sertifikasi-halal": async () => ekonomi.getTrendSertifikasiHalal(),
      "daftar-sertifikasi-halal": async (req) =>
        ekonomi.getDaftarSertifikasiHalal(await ekonomi.resolveTahun(req.query.tahun)),
    },
  },
  sosial: {
    "kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung": {
      summary: async (req) => sosial.getSummary(await sosial.resolveTahun(req.query.tahun)),
      "trend-dtks": async () => sosial.getTrendDtks(),
      "dtks-per-kecamatan": async (req) => sosial.getDtksPerKecamatan(await sosial.resolveTahun(req.query.tahun)),
      "p3ke-per-kecamatan": async (req) => sosial.getP3kePerKecamatan(await sosial.resolveTahun(req.query.tahun)),
    },
  },
  anggaran: {
    "target-dan-realisasi-pajak-daerah-kota-bandung": {
      summary: async (req) => pajak.getSummary(await pajak.resolveTahun(req.query.tahun)),
      trend: async () => pajak.getTrend(),
      "pajak-per-jenis": async (req) => pajak.getPajakPerJenis(await pajak.resolveTahun(req.query.tahun)),
    },
  },
};

// Label sumber data ditampilkan di field "meta.source" tiap respons bespoke — per sektor supaya
// tidak selalu tertulis "Dinas Pendidikan" walau sektornya bukan pendidikan.
const BESPOKE_SOURCE_LABEL: Record<string, string> = {
  pendidikan: "Dinas Pendidikan Kota Bandung",
  kesehatan: "Dinas Kesehatan Kota Bandung",
  kependudukan: "Disdukcapil Kota Bandung",
  lingkungan: "Dinas Lingkungan Hidup dan Kebersihan Kota Bandung",
  infrastruktur: "Dinas Perumahan, Kawasan Permukiman, dan Penataan Ruang Kota Bandung",
  ekonomi: "Dinas Koperasi, UKM, dan Perdagangan Kota Bandung",
  sosial: "Dinas Sosial Kota Bandung",
  anggaran: "Badan Pengelolaan Pajak dan Retribusi Daerah Kota Bandung",
};

// GET /api/v1/sectors — daftar semua sektor Kota Bandung. Terdaftar sebelum /:sectorId supaya
// tidak ketangkap sebagai nama sektor.
router.get("/sectors", asyncRoute(async (_req, res) => {
  res.json(envelope(await sectorsService.listSectors()));
}));

// GET /api/v1/:sectorId — daftar dashboard (laporan/embed) milik 1 sektor, mis. /v1/pendidikan
router.get("/:sectorId", asyncRoute(async (req, res) => {
  res.json(envelope(await sectorsService.listDatasets(req.params.sectorId)));
}));

// GET /api/v1/:sectorId/:dashboardSlug — detail 1 dashboard (judul, link embed, ukuran, dilihat),
// mis. /v1/pendidikan/jumlah-sd
router.get("/:sectorId/:dashboardSlug", asyncRoute(async (req, res) => {
  const dashboard = await sectorsService.getDatasetBySlug(req.params.dashboardSlug);
  if (!dashboard || dashboard.sectorId !== req.params.sectorId) {
    res.status(404).json({ error: "Dashboard tidak ditemukan." });
    return;
  }
  res.json(envelope(dashboard));
}));

// GET /api/v1/:sectorId/:dashboardSlug/:endpoint — endpoint data bespoke milik 1 dashboard,
// mis. /v1/pendidikan/jumlah-sd/summary, /v1/pendidikan/jumlah-smp/trend
router.get("/:sectorId/:dashboardSlug/:endpoint", asyncRoute(async (req, res) => {
  const { sectorId, dashboardSlug, endpoint } = req.params;
  const handler = BESPOKE_ENDPOINTS[sectorId]?.[dashboardSlug]?.[endpoint];
  if (!handler) {
    res.status(404).json({ error: "Endpoint tidak ditemukan." });
    return;
  }
  res.json(envelope(await handler(req), BESPOKE_SOURCE_LABEL[sectorId] ?? "Diskominfo Kota Bandung"));
}));

export default router;
