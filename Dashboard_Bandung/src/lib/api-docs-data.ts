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
  { name: "tahun", required: false, desc: { id: "Tahun ajaran, mis. 2024. Default: tahun terbaru yang tersedia.", en: "School year, e.g. 2024. Defaults to the latest available year." } },
  { name: "semester", required: false, desc: { id: "Semester ajaran (1 atau 2). Default: semester terbaru yang tersedia.", en: "Semester (1 or 2). Defaults to the latest available semester." } },
];

export const API_DOCS: ApiSectorDocs[] = [
  {
    sectorId: "pendidikan",
    endpoints: [
      {
        method: "GET",
        path: "/v1/pendidikan/summary",
        summary: { id: "Ringkasan SMP Kota Bandung", en: "Bandung Middle School Summary" },
        description: { id: "Jumlah sekolah, peserta didik, guru, serta rata-rata guru dan peserta didik per sekolah.", en: "Number of schools, students, teachers, and average teachers/students per school." },
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
        path: "/v1/pendidikan/trend",
        summary: { id: "Tren Jumlah Peserta Didik SMP", en: "Middle School Student Trend" },
        description: { id: "Jumlah peserta didik SMP per tahun ajaran (2020–2024).", en: "Middle school student count by school year (2020–2024)." },
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
        path: "/v1/pendidikan/sekolah-per-kecamatan",
        summary: { id: "Sekolah Negeri & Swasta per Kecamatan", en: "Public & Private Schools by District" },
        description: { id: "Jumlah SMP negeri dan swasta di tiap kecamatan Kota Bandung.", en: "Number of public and private middle schools in each district of Bandung." },
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
        path: "/v1/pendidikan/guru-siswa-per-kecamatan",
        summary: { id: "Guru & Peserta Didik per Kecamatan", en: "Teachers & Students by District" },
        description: { id: "Jumlah guru dan peserta didik SMP di tiap kecamatan.", en: "Number of middle school teachers and students in each district." },
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
        path: "/v1/pendidikan/siswa-gender",
        summary: { id: "Komposisi Peserta Didik per Jenis Kelamin", en: "Student Count by Gender" },
        description: { id: "Total peserta didik SMP Kota Bandung berdasarkan jenis kelamin (laki-laki/perempuan).", en: "Total middle school students in Bandung by gender." },
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
        path: "/v1/pendidikan/sebaran-sekolah",
        summary: { id: "Sebaran Sekolah per Kecamatan", en: "School Distribution by District" },
        description: { id: "Sama seperti sekolah-per-kecamatan, bisa difilter status sekolah.", en: "Same as sekolah-per-kecamatan, filterable by school status." },
        queryParams: [
          { name: "status", required: false, desc: { id: "NEGERI atau SWASTA. Kosongkan untuk menampilkan keduanya.", en: "NEGERI or SWASTA. Leave empty to include both." } },
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
    ],
  },
  { sectorId: "kependudukan", endpoints: [] },
  { sectorId: "ekonomi", endpoints: [] },
  { sectorId: "kesehatan", endpoints: [] },
  { sectorId: "infrastruktur", endpoints: [] },
  { sectorId: "lingkungan", endpoints: [] },
  { sectorId: "anggaran", endpoints: [] },
  { sectorId: "sosial", endpoints: [] },
];
