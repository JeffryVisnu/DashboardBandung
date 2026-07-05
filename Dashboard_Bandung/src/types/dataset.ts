// ─── Tipe lama (kompatibel dengan BE existing) ────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Dataset {
  id: number;
  categoryId: number;
  sourceId: string;
  name: string;
  sourceApiUrl: string;
  syncFrequency: "weekly" | "monthly";
  lastSyncedAt: string | null;
}

export interface DatasetEntry<T = Record<string, unknown>> {
  id: number;
  datasetId: number;
  period: string;
  region: string | null;
  data: T;
  ingestedAt: string;
}

export interface CategorySummary {
  slug: string;
  name: string;
  description: string;
  datasetCount: number;
}

export interface PopulationSummary {
  tahun: number;
  totalPenduduk: number;
  jumlahKecamatan: number;
  pertumbuhanPersen: number | null;
  kecamatanTerpadat: { kecamatan: string; jumlahPenduduk: string }[];
}

// ─── Tipe baru — Dashboard Bandung (Turn 2 / README spec) ─────────────────────

/** Cluster filter untuk pills */
export type SectorCluster = "gov" | "sosial" | "fisik";

/** Kartu sektor di Home & Topics */
export interface Sector {
  id: string;
  code: string;          // singkatan 2-3 huruf, e.g. "DUK"
  name: { id: string; en: string };
  desc: { id: string; en: string };
  stat: { id: string; en: string };
  color: string;         // hex warna utama
  tint: string;          // hex warna latar badge
  cluster: SectorCluster;
  spark: number[];       // data sparkline (array angka)
  statusLabel: { id: string; en: string };
  statusColor: string;   // warna dot status
  statusBg: string;      // background chip status
}

/** 30 kecamatan untuk cartogram & tabel */
export interface KecamatanData {
  name: string;
  val: number;           // kepadatan jiwa/km²
  pop: number;           // jumlah penduduk
  share: string;         // % dari total, e.g. "3.2"
  color: string;         // warna berdasarkan kepadatan
  colorPop: string;      // warna berdasarkan populasi
}

/** Kelompok usia untuk bar chart komposisi */
export interface AgeBand {
  label: { id: string; en: string };
  male: number;   // persentase
  female: number; // persentase
}

/** Realisasi anggaran per Dinas (exec screen) */
export interface DinasBudget {
  name: { id: string; en: string };
  pct: number;
}

/** Notifikasi / peringatan di exec screen */
export interface ExecAlert {
  mark: string;     // tanda/simbol
  color: string;    // warna teks
  bg: string;       // background
  text: { id: string; en: string };
}

/** Skor kinerja kecamatan (exec screen) */
export interface KecamatanSkor {
  name: string;
  skor: number;
}

/** Bahasa aktif */
export type Lang = "id" | "en";

/** Filter sektor */
export type SectorFilter = "semua" | SectorCluster;

/** Satu kartu KPI di halaman detail sektor */
export interface SectorKpi {
  label: { id: string; en: string };
  value: string;
  accent?: "green" | "ink";
}

/** Satu baris breakdown (bar chart dua kategori) di halaman detail sektor */
export interface SectorBreakdownRow {
  label: { id: string; en: string };
  a: number; // persentase kategori A
  b: number; // persentase kategori B
}

/** Satu kartu "dashboard/laporan" di dalam grid Eksplorasi Dashboard (per sektor bisa >1) */
export interface SectorDashboardItem {
  title: { id: string; en: string };
  year: number;
  views: number;
}

/** Satu parameter query pada dokumentasi endpoint API */
export interface ApiQueryParam {
  name: string;
  required: boolean;
  desc: { id: string; en: string };
}

/** Satu endpoint di halaman dokumentasi Data API */
export interface ApiEndpointDoc {
  method: "GET";
  path: string;
  summary: { id: string; en: string };
  description: { id: string; en: string };
  queryParams?: ApiQueryParam[];
  exampleResponse: string;
}

/** Dokumentasi API untuk satu sektor (bisa berisi banyak endpoint atau belum ada sama sekali) */
export interface ApiSectorDocs {
  sectorId: string;
  endpoints: ApiEndpointDoc[];
}

/** Konten dummy khusus halaman detail per sektor */
export interface SectorDetail {
  kpis: SectorKpi[];
  trend: number[];
  trendPeriods: (string | number)[];
  breakdownTitle: { id: string; en: string };
  breakdownLegendA: { id: string; en: string };
  breakdownLegendB: { id: string; en: string };
  breakdownRows: SectorBreakdownRow[];
  /** Label kolom nilai di tabel/cartogram kecamatan, mis. "Jumlah UMKM" */
  kecamatanValueLabel: { id: string; en: string };
  kecamatanUnit: string;
  /** Kalikan populasi kecamatan dengan faktor ini untuk memperoleh nilai dummy sektor */
  kecamatanFactor: number;
}

