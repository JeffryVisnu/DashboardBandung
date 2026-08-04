/**
 * Dokumentasi endpoint Data API, dikelompokkan per sektor.
 * Sektor yang belum punya endpoint nyata cukup ditulis dengan endpoints: [] —
 * halaman /data-api otomatis menandainya "Segera Hadir".
 *
 * Menambah endpoint baru (mis. jenjang SD/SMA/SMK di Pendidikan, atau sektor lain
 * yang datanya sudah siap) cukup menambah entri di sini — tidak perlu ubah halaman.
 */

import type { ApiSectorDocs } from "@/types/dataset";

const PERIOD_PARAMS = [
  { name: "tahun", required: false, desc: "Tahun ajaran, mis. 2024. Default: tahun terbaru yang tersedia." },
  { name: "semester", required: false, desc: "Semester ajaran (1 atau 2). Default: semester terbaru yang tersedia." },
];

export const API_DOCS: ApiSectorDocs[] = [
  {
    sectorId: "pendidikan",
    endpoints: [
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-smp/summary",
        dashboardSlug: "jumlah-smp",
        summary: "Ringkasan SMP Kota Bandung",
        description: "Jumlah sekolah, peserta didik, guru, serta rata-rata guru dan peserta didik per sekolah.",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": {
    "tahun": 2024,
    "semester": 2,
    "jumlahSekolah": 268,
    "jumlahSiswa": 98230,
    "jumlahGuru": 5062,
    "rataGuruPerSekolah": 18.89,
    "rataSiswaPerSekolah": 366.53
  },
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-05T09:45:43.205Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-smp/trend",
        dashboardSlug: "jumlah-smp",
        summary: "Tren Jumlah Peserta Didik SMP",
        description: "Jumlah peserta didik SMP per tahun ajaran (2020–2024).",
        exampleResponse: `{
  "data": [
    { "tahun": 2020, "jumlahSiswa": 97864 },
    { "tahun": 2021, "jumlahSiswa": 98142 },
    { "tahun": 2024, "jumlahSiswa": 98230 }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-05T09:45:43.205Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-smp/sekolah-per-kecamatan",
        dashboardSlug: "jumlah-smp",
        summary: "Sekolah Negeri & Swasta per Kecamatan",
        description: "Jumlah SMP negeri dan swasta di tiap kecamatan Kota Bandung.",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "status": "NEGERI", "jumlah": "5" },
    { "kecamatan": "ANDIR", "status": "SWASTA", "jumlah": "15" }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-05T09:45:43.205Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-smp/guru-siswa-per-kecamatan",
        dashboardSlug: "jumlah-smp",
        summary: "Guru & Peserta Didik per Kecamatan",
        description: "Jumlah guru dan peserta didik SMP di tiap kecamatan.",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": [
    { "kecamatan": "CICENDO", "jumlahSiswa": 5419, "jumlahGuru": 316 },
    { "kecamatan": "REGOL", "jumlahSiswa": 6119, "jumlahGuru": 305 }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-05T09:45:43.205Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-smp/siswa-gender",
        dashboardSlug: "jumlah-smp",
        summary: "Komposisi Peserta Didik per Jenis Kelamin",
        description: "Total peserta didik SMP Kota Bandung berdasarkan jenis kelamin (laki-laki/perempuan).",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": [
    { "jenisKelamin": "LAKI-LAKI", "jumlahSiswa": "49329" },
    { "jenisKelamin": "PEREMPUAN", "jumlahSiswa": "48901" }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-05T09:45:43.205Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-smp/sebaran-sekolah",
        dashboardSlug: "jumlah-smp",
        summary: "Sebaran Sekolah per Kecamatan",
        description: "Sama seperti sekolah-per-kecamatan, bisa difilter status sekolah.",
        queryParams: [
          { name: "status", required: false, desc: "NEGERI atau SWASTA. Kosongkan untuk menampilkan keduanya." },
          ...PERIOD_PARAMS,
        ],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "status": "NEGERI", "jumlah": "5" },
    { "kecamatan": "ANTAPANI", "status": "NEGERI", "jumlah": "2" }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-05T09:45:43.205Z" }
}`,
      },
      // ─── SD — sejajar dengan endpoint SMP di atas, tabel sumbernya sd_* ─────────
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-sd/summary",
        dashboardSlug: "jumlah-sd",
        summary: "Ringkasan SD Kota Bandung",
        description: "Jumlah sekolah, peserta didik, guru, serta rata-rata guru dan peserta didik per sekolah — data SD.",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": {
    "tahun": 2024,
    "semester": 2,
    "jumlahSekolah": 420,
    "jumlahSiswa": 201569,
    "jumlahGuru": 0,
    "rataGuruPerSekolah": 0,
    "rataSiswaPerSekolah": 479.93
  },
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-29T11:30:10.206Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-sd/trend",
        dashboardSlug: "jumlah-sd",
        summary: "Tren Jumlah Peserta Didik SD",
        description: "Jumlah peserta didik SD per tahun ajaran.",
        exampleResponse: `{
  "data": [
    { "tahun": 2020, "jumlahSiswa": 213573 },
    { "tahun": 2023, "jumlahSiswa": 202200 },
    { "tahun": 2024, "jumlahSiswa": 201569 }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-29T11:30:10.206Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-sd/sekolah-per-kecamatan",
        dashboardSlug: "jumlah-sd",
        summary: "Sekolah Negeri & Swasta per Kecamatan (SD)",
        description: "Jumlah SD negeri dan swasta di tiap kecamatan Kota Bandung.",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "status": "NEGERI", "jumlah": "8" },
    { "kecamatan": "ANDIR", "status": "SWASTA", "jumlah": "3" }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-29T11:30:10.206Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-sd/guru-siswa-per-kecamatan",
        dashboardSlug: "jumlah-sd",
        summary: "Guru & Peserta Didik per Kecamatan (SD)",
        description: "Jumlah guru dan peserta didik SD di tiap kecamatan.",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": [
    { "kecamatan": "CICENDO", "jumlahSiswa": 4210, "jumlahGuru": 0 },
    { "kecamatan": "REGOL", "jumlahSiswa": 4890, "jumlahGuru": 0 }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-29T11:30:10.206Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-sd/siswa-gender",
        dashboardSlug: "jumlah-sd",
        summary: "Komposisi Peserta Didik per Jenis Kelamin (SD)",
        description: "Total peserta didik SD Kota Bandung berdasarkan jenis kelamin (laki-laki/perempuan).",
        queryParams: PERIOD_PARAMS,
        exampleResponse: `{
  "data": [
    { "jenisKelamin": "LAKI-LAKI", "jumlahSiswa": "104045" },
    { "jenisKelamin": "PEREMPUAN", "jumlahSiswa": "97524" }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-29T11:30:10.206Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/pendidikan/jumlah-sd/sebaran-sekolah",
        dashboardSlug: "jumlah-sd",
        summary: "Sebaran Sekolah per Kecamatan (SD)",
        description: "Sama seperti sekolah-per-kecamatan (SD), bisa difilter status sekolah.",
        queryParams: [
          { name: "status", required: false, desc: "NEGERI atau SWASTA. Kosongkan untuk menampilkan keduanya." },
          ...PERIOD_PARAMS,
        ],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "status": "NEGERI", "jumlah": "8" },
    { "kecamatan": "ANTAPANI", "status": "NEGERI", "jumlah": "4" }
  ],
  "meta": { "source": "Dinas Pendidikan Kota Bandung", "generatedAt": "2026-07-29T11:30:10.206Z" }
}`,
      },
    ],
  },
  { sectorId: "kependudukan", endpoints: [] },
  { sectorId: "ekonomi", endpoints: [] },
  {
    sectorId: "kesehatan",
    endpoints: [
      {
        method: "GET",
        path: "/v1/kesehatan/rumah-sakit/summary",
        dashboardSlug: "rumah-sakit",
        summary: "Ringkasan Rumah Sakit Kota Bandung",
        description: "Jumlah rumah sakit, rincian swasta/pemerintah, dan jumlah kecamatan yang punya rumah sakit.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": {
    "tahun": 2025,
    "jumlahRumahSakit": 42,
    "jumlahSwasta": 33,
    "jumlahPemerintah": 9,
    "jumlahKecamatan": 20
  },
  "meta": { "source": "Dinas Kesehatan Kota Bandung", "generatedAt": "2026-08-04T15:40:51.832Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kesehatan/rumah-sakit/trend",
        dashboardSlug: "rumah-sakit",
        summary: "Tren Jumlah Rumah Sakit",
        description: "Jumlah rumah sakit Kota Bandung per tahun.",
        exampleResponse: `{
  "data": [
    { "tahun": 2023, "jumlahRumahSakit": 42 },
    { "tahun": 2024, "jumlahRumahSakit": 42 },
    { "tahun": 2025, "jumlahRumahSakit": 42 }
  ],
  "meta": { "source": "Dinas Kesehatan Kota Bandung", "generatedAt": "2026-08-04T15:40:52.038Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kesehatan/rumah-sakit/rumah-sakit-per-kecamatan",
        dashboardSlug: "rumah-sakit",
        summary: "Rumah Sakit per Kecamatan",
        description: "Jumlah rumah sakit di tiap kecamatan Kota Bandung.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "jumlah": 3 },
    { "kecamatan": "CICENDO", "jumlah": 5 }
  ],
  "meta": { "source": "Dinas Kesehatan Kota Bandung", "generatedAt": "2026-08-04T15:40:52.100Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kesehatan/rumah-sakit/jenis-status",
        dashboardSlug: "rumah-sakit",
        summary: "Jenis & Status Rumah Sakit",
        description: "Rincian jumlah rumah sakit berdasarkan jenis (umum, khusus ibu-anak, dll.) dan status kepemilikan (swasta/pemerintah/TNI-Polri).",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": {
    "tahun": 2025,
    "jenis": [
      { "jenis": "RUMAH SAKIT UMUM", "jumlah": 26 },
      { "jenis": "RS KHUSUS IBU DAN ANAK", "jumlah": 6 }
    ],
    "status": [
      { "status": "SWASTA", "jumlah": 33 },
      { "status": "PEMERINTAH DAERAH", "jumlah": 3 }
    ]
  },
  "meta": { "source": "Dinas Kesehatan Kota Bandung", "generatedAt": "2026-08-04T15:40:52.630Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kesehatan/rumah-sakit/sebaran-rumah-sakit",
        dashboardSlug: "rumah-sakit",
        summary: "Sebaran Titik Rumah Sakit",
        description: "Daftar tiap rumah sakit lengkap kecamatan, jenis, status, kelas, dan koordinat lokasi — untuk kebutuhan peta.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "jenis": "RUMAH SAKIT UMUM", "status": "SWASTA", "kelas": "C", "latitude": -6.91602, "longitude": 107.59618 }
  ],
  "meta": { "source": "Dinas Kesehatan Kota Bandung", "generatedAt": "2026-08-04T15:40:53.000Z" }
}`,
      },
    ],
  },
  { sectorId: "infrastruktur", endpoints: [] },
  { sectorId: "lingkungan", endpoints: [] },
  { sectorId: "anggaran", endpoints: [] },
  { sectorId: "sosial", endpoints: [] },
];
