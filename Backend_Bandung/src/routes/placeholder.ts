import { Router } from "express";

const router = Router();

// Mock data minimalis untuk memenuhi kontrak API yang ada di halaman API Documentation
// Karena Dashboard saat ini menggunakan client-side state + dummy data, 
// endpoint ini disediakan khusus bagi pengguna eksternal yang mencoba memanggil API.

const SECTORS = [
  {
    id: "kependudukan",
    code: "DUK",
    name: "Kependudukan",
    cluster: "sosial",
    indicators_count: 5
  },
  {
    id: "ekonomi",
    code: "EKO",
    name: "Ekonomi & UMKM",
    cluster: "gov",
    indicators_count: 12
  }
];

const KECAMATAN_MOCK = [
  { id: "1", name: "Andir", population: 592000, density: 18500 },
  { id: "2", name: "Astanaanyar", population: 489000, density: 19800 }
];

// GET /api/v1/sektor
router.get("/sektor", (req, res) => {
  res.json({
    status: "success",
    data: SECTORS
  });
});

// GET /api/v1/sektor/:id/indikator
router.get("/sektor/:id/indikator", (req, res) => {
  const { id } = req.params;
  res.json({
    status: "success",
    sector_id: id,
    data: [
      { indicator_id: "pop_total", name: "Total Penduduk", unit: "jiwa" },
      { indicator_id: "pop_density", name: "Kepadatan Penduduk", unit: "jiwa/km2" }
    ]
  });
});

// GET /api/v1/kecamatan
router.get("/kecamatan", (req, res) => {
  res.json({
    status: "success",
    total: 30,
    data: KECAMATAN_MOCK // sebagian saja untuk contoh
  });
});

// GET /api/v1/indikator/:id/tren
router.get("/indikator/:id/tren", (req, res) => {
  res.json({
    status: "success",
    indicator_id: req.params.id,
    data: [
      { year: 2022, value: 2475000 },
      { year: 2023, value: 2490000 },
      { year: 2024, value: 2500000 },
      { year: 2025, value: 2510000 },
      { year: 2026, value: 2520000 }
    ]
  });
});

export default router;
