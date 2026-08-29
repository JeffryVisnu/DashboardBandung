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
        path: "/v1/pendidikan/dashboard-sekolah-menengah-pertama/summary",
        dashboardSlug: "dashboard-sekolah-menengah-pertama",
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
        path: "/v1/pendidikan/dashboard-sekolah-menengah-pertama/trend",
        dashboardSlug: "dashboard-sekolah-menengah-pertama",
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
        path: "/v1/pendidikan/dashboard-sekolah-menengah-pertama/sekolah-per-kecamatan",
        dashboardSlug: "dashboard-sekolah-menengah-pertama",
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
        path: "/v1/pendidikan/dashboard-sekolah-menengah-pertama/guru-siswa-per-kecamatan",
        dashboardSlug: "dashboard-sekolah-menengah-pertama",
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
        path: "/v1/pendidikan/dashboard-sekolah-menengah-pertama/siswa-gender",
        dashboardSlug: "dashboard-sekolah-menengah-pertama",
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
        path: "/v1/pendidikan/dashboard-sekolah-menengah-pertama/sebaran-sekolah",
        dashboardSlug: "dashboard-sekolah-menengah-pertama",
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
        path: "/v1/pendidikan/dashboard-sekolah-dasar/summary",
        dashboardSlug: "dashboard-sekolah-dasar",
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
        path: "/v1/pendidikan/dashboard-sekolah-dasar/trend",
        dashboardSlug: "dashboard-sekolah-dasar",
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
        path: "/v1/pendidikan/dashboard-sekolah-dasar/sekolah-per-kecamatan",
        dashboardSlug: "dashboard-sekolah-dasar",
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
        path: "/v1/pendidikan/dashboard-sekolah-dasar/guru-siswa-per-kecamatan",
        dashboardSlug: "dashboard-sekolah-dasar",
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
        path: "/v1/pendidikan/dashboard-sekolah-dasar/siswa-gender",
        dashboardSlug: "dashboard-sekolah-dasar",
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
        path: "/v1/pendidikan/dashboard-sekolah-dasar/sebaran-sekolah",
        dashboardSlug: "dashboard-sekolah-dasar",
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
  {
    sectorId: "kependudukan",
    endpoints: [
      {
        method: "GET",
        path: "/v1/kependudukan/demografi-dan-kepadatan-penduduk-kota-bandung/summary",
        dashboardSlug: "demografi-dan-kepadatan-penduduk-kota-bandung",
        summary: "Ringkasan Demografi Kota Bandung",
        description: "Rata-rata kepadatan penduduk, total kepala keluarga, total luas wilayah, dan jumlah kecamatan.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": {
    "tahun": 2025,
    "jumlahKecamatan": 30,
    "rataKepadatan": 16540.33,
    "totalKepalaKeluarga": 864954,
    "totalLuasWilayah": 167.31
  },
  "meta": { "source": "Disdukcapil Kota Bandung", "generatedAt": "2026-08-13T01:18:21.052Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kependudukan/demografi-dan-kepadatan-penduduk-kota-bandung/trend",
        dashboardSlug: "demografi-dan-kepadatan-penduduk-kota-bandung",
        summary: "Tren Kepadatan Penduduk",
        description: "Rata-rata kepadatan penduduk (jiwa/km²) Kota Bandung per tahun, 2018–2025.",
        exampleResponse: `{
  "data": [
    { "tahun": 2018, "rataKepadatan": 15531.23 },
    { "tahun": 2024, "rataKepadatan": 16458.43 },
    { "tahun": 2025, "rataKepadatan": 16540.33 }
  ],
  "meta": { "source": "Disdukcapil Kota Bandung", "generatedAt": "2026-08-13T01:18:21.171Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kependudukan/demografi-dan-kepadatan-penduduk-kota-bandung/kepadatan-per-kecamatan",
        dashboardSlug: "demografi-dan-kepadatan-penduduk-kota-bandung",
        summary: "Kepadatan Penduduk per Kecamatan",
        description: "Kepadatan penduduk (jiwa/km²) di tiap kecamatan Kota Bandung.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "kepadatan": 26853, "satuan": "JIWA/KM2" },
    { "kecamatan": "ANTAPANI", "kepadatan": 21854, "satuan": "JIWA/KM2" }
  ],
  "meta": { "source": "Disdukcapil Kota Bandung", "generatedAt": "2026-08-13T01:18:21.300Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kependudukan/demografi-dan-kepadatan-penduduk-kota-bandung/kepala-keluarga-per-kecamatan",
        dashboardSlug: "demografi-dan-kepadatan-penduduk-kota-bandung",
        summary: "Kepala Keluarga per Kecamatan",
        description: "Jumlah kepala keluarga per kecamatan, dirinci berdasarkan jenis kelamin kepala keluarga.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "jumlahKkLaki": 25795, "jumlahKkPerempuan": 8262, "totalKk": 34057 }
  ],
  "meta": { "source": "Disdukcapil Kota Bandung", "generatedAt": "2026-08-13T01:18:21.400Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/kependudukan/demografi-dan-kepadatan-penduduk-kota-bandung/luas-wilayah-per-kecamatan",
        dashboardSlug: "demografi-dan-kepadatan-penduduk-kota-bandung",
        summary: "Luas Wilayah per Kecamatan",
        description: "Luas wilayah (km²) tiap kecamatan Kota Bandung. Data batas administratif relatif tetap, tidak berubah tiap tahun.",
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "luasWilayah": 3.71, "satuan": "KILOMETER PERSEGI", "tahun": 2022 }
  ],
  "meta": { "source": "Disdukcapil Kota Bandung", "generatedAt": "2026-08-13T01:18:21.500Z" }
}`,
      },
    ],
  },
  {
    sectorId: "ekonomi",
    endpoints: [
      {
        method: "GET",
        path: "/v1/ekonomi/perdagangan-aktivitas-ekonomi-kota-bandung/summary",
        dashboardSlug: "perdagangan-aktivitas-ekonomi-kota-bandung",
        summary: "Ringkasan Ekonomi & Perdagangan Kota Bandung",
        description: "Nilai ekspor non-migas, jumlah pasar modern, dan jumlah sertifikasi halal UMKM di tahun terkait.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": { "tahun": 2025, "nilaiEksporUsd": 327113895.73, "jumlahPasarModern": 827, "jumlahSertifikasiHalal": 100 },
  "meta": { "source": "Dinas Koperasi, UKM, dan Perdagangan Kota Bandung", "generatedAt": "2026-08-29T05:32:31.666Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/ekonomi/perdagangan-aktivitas-ekonomi-kota-bandung/trend-ekspor",
        dashboardSlug: "perdagangan-aktivitas-ekonomi-kota-bandung",
        summary: "Tren Nilai Ekspor Non-Migas",
        description: "Nilai ekspor non-migas Kota Bandung (USD) per tahun, 2011–2025.",
        exampleResponse: `{
  "data": [
    { "tahun": 2011, "nilaiEksporUsd": 653590705.7 },
    { "tahun": 2025, "nilaiEksporUsd": 327113895.73 }
  ],
  "meta": { "source": "Dinas Koperasi, UKM, dan Perdagangan Kota Bandung", "generatedAt": "2026-08-29T05:32:31.700Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/ekonomi/perdagangan-aktivitas-ekonomi-kota-bandung/pasar-per-jenis",
        dashboardSlug: "perdagangan-aktivitas-ekonomi-kota-bandung",
        summary: "Pasar Modern per Jenis",
        description: "Jumlah pasar modern (minimarket, supermarket, hypermarket, dst.) berdasarkan jenisnya.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "jenis": "MINIMARKET", "jumlah": 718, "satuan": "UNIT" },
    { "jenis": "SUPERMARKET", "jumlah": 83, "satuan": "UNIT" }
  ],
  "meta": { "source": "Dinas Koperasi, UKM, dan Perdagangan Kota Bandung", "generatedAt": "2026-08-29T05:32:31.885Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/ekonomi/perdagangan-aktivitas-ekonomi-kota-bandung/trend-sertifikasi-halal",
        dashboardSlug: "perdagangan-aktivitas-ekonomi-kota-bandung",
        summary: "Tren Sertifikasi Halal UMKM",
        description: "Jumlah UMKM yang mendapat sertifikasi halal per tahun.",
        exampleResponse: `{
  "data": [
    { "tahun": 2017, "jumlahSertifikasi": 300 },
    { "tahun": 2025, "jumlahSertifikasi": 100 }
  ],
  "meta": { "source": "Dinas Koperasi, UKM, dan Perdagangan Kota Bandung", "generatedAt": "2026-08-29T05:32:32.000Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/ekonomi/perdagangan-aktivitas-ekonomi-kota-bandung/daftar-sertifikasi-halal",
        dashboardSlug: "perdagangan-aktivitas-ekonomi-kota-bandung",
        summary: "Daftar UMKM Bersertifikasi Halal",
        description: "Nama merk dan produk UMKM yang mendapat sertifikasi halal di tahun terkait.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "namaMerk": "5LIMAFOODS", "produkDihasilkan": "BAKSO FROZEN" },
    { "namaMerk": "6 JAGOAN", "produkDihasilkan": "TELOR ASIN" }
  ],
  "meta": { "source": "Dinas Koperasi, UKM, dan Perdagangan Kota Bandung", "generatedAt": "2026-08-29T05:32:32.100Z" }
}`,
      },
    ],
  },
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
  {
    sectorId: "infrastruktur",
    endpoints: [
      {
        method: "GET",
        path: "/v1/infrastruktur/kolam-retensi-aktif-di-kota-bandung/summary",
        dashboardSlug: "kolam-retensi-aktif-di-kota-bandung",
        summary: "Ringkasan Kolam Retensi Kota Bandung",
        description: "Jumlah kolam retensi, jumlah kecamatan yang punya kolam, dan total volume tampungan.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": { "tahun": 2025, "jumlahKolam": 42, "jumlahKecamatan": 12, "totalVolumeMeterKubik": 0 },
  "meta": { "source": "Dinas Perumahan, Kawasan Permukiman, dan Penataan Ruang Kota Bandung", "generatedAt": "2026-08-29T05:32:01.412Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/infrastruktur/kolam-retensi-aktif-di-kota-bandung/trend",
        dashboardSlug: "kolam-retensi-aktif-di-kota-bandung",
        summary: "Tren Jumlah Kolam Retensi",
        description: "Jumlah kolam retensi aktif per tahun, 2020–2025.",
        exampleResponse: `{
  "data": [
    { "tahun": 2020, "jumlahKolam": 29 },
    { "tahun": 2025, "jumlahKolam": 42 }
  ],
  "meta": { "source": "Dinas Perumahan, Kawasan Permukiman, dan Penataan Ruang Kota Bandung", "generatedAt": "2026-08-29T05:32:01.526Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/infrastruktur/kolam-retensi-aktif-di-kota-bandung/kolam-per-kecamatan",
        dashboardSlug: "kolam-retensi-aktif-di-kota-bandung",
        summary: "Kolam Retensi per Kecamatan",
        description: "Jumlah kolam retensi di tiap kecamatan Kota Bandung.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "CIBIRU", "jumlahKolam": 19 },
    { "kecamatan": "BUAHBATU", "jumlahKolam": 6 }
  ],
  "meta": { "source": "Dinas Perumahan, Kawasan Permukiman, dan Penataan Ruang Kota Bandung", "generatedAt": "2026-08-29T05:32:01.600Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/infrastruktur/kolam-retensi-aktif-di-kota-bandung/volume-per-kecamatan",
        dashboardSlug: "kolam-retensi-aktif-di-kota-bandung",
        summary: "Volume Tampungan per Kecamatan",
        description: "Total volume tampungan kolam retensi (meter kubik) di tiap kecamatan. Catatan: data volume terbaru yang terekam sampai tahun 2024, satu tahun di belakang data jumlah kolam.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2024. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "CIBIRU", "volumeMeterKubik": 1327.12 }
  ],
  "meta": { "source": "Dinas Perumahan, Kawasan Permukiman, dan Penataan Ruang Kota Bandung", "generatedAt": "2026-08-29T05:32:01.700Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/infrastruktur/kolam-retensi-aktif-di-kota-bandung/sebaran-kolam",
        dashboardSlug: "kolam-retensi-aktif-di-kota-bandung",
        summary: "Sebaran Kolam Retensi",
        description: "Daftar tiap kolam retensi lengkap nama, kecamatan, sub-DAS, dan nama sungai.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANTAPANI", "nama": "KOLAM RETENSI CIBODAS", "subDas": "SUB-DAS CIDURIAN", "namaSungai": "SUNGAI CICADAS", "jumlahKolam": 1 }
  ],
  "meta": { "source": "Dinas Perumahan, Kawasan Permukiman, dan Penataan Ruang Kota Bandung", "generatedAt": "2026-08-29T05:32:01.800Z" }
}`,
      },
    ],
  },
  {
    sectorId: "lingkungan",
    endpoints: [
      {
        method: "GET",
        path: "/v1/lingkungan/pengelolaan-sampah-kebersihan-di-kota-bandung/summary",
        dashboardSlug: "pengelolaan-sampah-kebersihan-di-kota-bandung",
        summary: "Ringkasan Pengelolaan Sampah Kota Bandung",
        description: "Total sampah terangkut, total ritasi truk, total kompensasi dampak negatif, dan jumlah jenis sampah tercatat.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": { "tahun": 2025, "totalSampahTon": 338667.926, "totalRitasi": 57399, "totalKompensasiRupiah": 3400994445, "jumlahJenisSampah": 9 },
  "meta": { "source": "Dinas Lingkungan Hidup dan Kebersihan Kota Bandung", "generatedAt": "2026-08-29T05:28:02.474Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/lingkungan/pengelolaan-sampah-kebersihan-di-kota-bandung/trend",
        dashboardSlug: "pengelolaan-sampah-kebersihan-di-kota-bandung",
        summary: "Tren Jumlah Sampah Terangkut",
        description: "Total sampah terangkut (ton) per tahun, 2017–2025.",
        exampleResponse: `{
  "data": [
    { "tahun": 2017, "totalSampahTon": 401933.497 },
    { "tahun": 2025, "totalSampahTon": 338667.926 }
  ],
  "meta": { "source": "Dinas Lingkungan Hidup dan Kebersihan Kota Bandung", "generatedAt": "2026-08-29T05:28:02.600Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/lingkungan/pengelolaan-sampah-kebersihan-di-kota-bandung/capaian-per-bulan",
        dashboardSlug: "pengelolaan-sampah-kebersihan-di-kota-bandung",
        summary: "Capaian Pengangkutan Sampah per Bulan",
        description: "Jumlah sampah terangkut (ton) tiap bulan di tahun terkait.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "bulan": "JANUARI", "jumlahSampahTon": 24519.712, "satuan": "TON" }
  ],
  "meta": { "source": "Dinas Lingkungan Hidup dan Kebersihan Kota Bandung", "generatedAt": "2026-08-29T05:28:02.700Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/lingkungan/pengelolaan-sampah-kebersihan-di-kota-bandung/produksi-per-jenis",
        dashboardSlug: "pengelolaan-sampah-kebersihan-di-kota-bandung",
        summary: "Produksi Sampah per Jenis",
        description: "Rata-rata produksi sampah harian (ton/hari) berdasarkan jenisnya (sisa makanan, plastik, kertas, dst.).",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "jenis": "SISA MAKANAN", "produksiSampah": 382.9939, "satuan": "TON/HARI" }
  ],
  "meta": { "source": "Dinas Lingkungan Hidup dan Kebersihan Kota Bandung", "generatedAt": "2026-08-29T05:28:02.800Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/lingkungan/pengelolaan-sampah-kebersihan-di-kota-bandung/ritasi-per-bulan",
        dashboardSlug: "pengelolaan-sampah-kebersihan-di-kota-bandung",
        summary: "Ritasi Truk Sampah per Bulan",
        description: "Jumlah rit (ritasi) truk pengangkut sampah tiap bulan di tahun terkait.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "bulan": "JANUARI", "jumlahRitasi": 5182 }
  ],
  "meta": { "source": "Dinas Lingkungan Hidup dan Kebersihan Kota Bandung", "generatedAt": "2026-08-29T05:28:02.900Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/lingkungan/pengelolaan-sampah-kebersihan-di-kota-bandung/kompensasi-per-kategori",
        dashboardSlug: "pengelolaan-sampah-kebersihan-di-kota-bandung",
        summary: "Kompensasi Dampak Pengelolaan Sampah",
        description: "Total kompensasi (rupiah) yang dibayarkan ke masyarakat sekitar TPA, per kategori kompensasi.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kategori": "KOMPENSASI DAMPAK NEGATIF", "jumlahRupiah": 3400994445 }
  ],
  "meta": { "source": "Dinas Lingkungan Hidup dan Kebersihan Kota Bandung", "generatedAt": "2026-08-29T05:28:03.036Z" }
}`,
      },
    ],
  },
  {
    sectorId: "anggaran",
    endpoints: [
      {
        method: "GET",
        path: "/v1/anggaran/target-dan-realisasi-pajak-daerah-kota-bandung/summary",
        dashboardSlug: "target-dan-realisasi-pajak-daerah-kota-bandung",
        summary: "Ringkasan Target & Realisasi Pajak Daerah",
        description: "Total target, total realisasi, persentase capaian, dan jumlah jenis pajak daerah di tahun terkait.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": { "tahun": 2025, "totalTargetRupiah": 3052122426267, "totalRealisasiRupiah": 3379066179476, "persentaseCapaian": 110.71, "jumlahJenisPajak": 12 },
  "meta": { "source": "Badan Pengelolaan Pajak dan Retribusi Daerah Kota Bandung", "generatedAt": "2026-08-29T05:32:43.648Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/anggaran/target-dan-realisasi-pajak-daerah-kota-bandung/trend",
        dashboardSlug: "target-dan-realisasi-pajak-daerah-kota-bandung",
        summary: "Tren Target & Realisasi Pajak",
        description: "Total target dan realisasi pajak daerah (rupiah) per tahun, 2014–2025.",
        exampleResponse: `{
  "data": [
    { "tahun": 2014, "totalTargetRupiah": 1400000000000, "totalRealisasiRupiah": 1399488903872 }
  ],
  "meta": { "source": "Badan Pengelolaan Pajak dan Retribusi Daerah Kota Bandung", "generatedAt": "2026-08-29T05:32:43.700Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/anggaran/target-dan-realisasi-pajak-daerah-kota-bandung/pajak-per-jenis",
        dashboardSlug: "target-dan-realisasi-pajak-daerah-kota-bandung",
        summary: "Target & Realisasi per Jenis Pajak",
        description: "Rincian target dan realisasi (rupiah) untuk tiap jenis pajak daerah (PBB, pajak hotel, pajak restoran, dst.) di tahun terkait.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2025. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "jenis": "B P H T B", "targetRupiah": 537847874605, "realisasiRupiah": 691299811794 }
  ],
  "meta": { "source": "Badan Pengelolaan Pajak dan Retribusi Daerah Kota Bandung", "generatedAt": "2026-08-29T05:32:43.800Z" }
}`,
      },
    ],
  },
  {
    sectorId: "sosial",
    endpoints: [
      {
        method: "GET",
        path: "/v1/sosial/kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung/summary",
        dashboardSlug: "kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung",
        summary: "Ringkasan Kesejahteraan Sosial Kota Bandung",
        description: "Total individu dalam DTKS, total individu P3KE, dan jumlah kecamatan tercakup di tahun terkait.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2024. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": { "tahun": 2024, "totalIndividuDtks": 759309, "jumlahKecamatan": 30, "totalIndividuP3ke": 60167 },
  "meta": { "source": "Dinas Sosial Kota Bandung", "generatedAt": "2026-08-29T05:32:43.157Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/sosial/kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung/trend-dtks",
        dashboardSlug: "kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung",
        summary: "Tren Jumlah Individu DTKS",
        description: "Total individu dalam Data Terpadu Kesejahteraan Sosial (DTKS) per tahun, 2021–2024.",
        exampleResponse: `{
  "data": [
    { "tahun": 2021, "totalIndividu": 752936 },
    { "tahun": 2024, "totalIndividu": 759309 }
  ],
  "meta": { "source": "Dinas Sosial Kota Bandung", "generatedAt": "2026-08-29T05:32:43.263Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/sosial/kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung/dtks-per-kecamatan",
        dashboardSlug: "kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung",
        summary: "DTKS per Kecamatan",
        description: "Jumlah individu dalam DTKS di tiap kecamatan Kota Bandung.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2024. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "jumlahIndividu": 36911 }
  ],
  "meta": { "source": "Dinas Sosial Kota Bandung", "generatedAt": "2026-08-29T05:32:43.400Z" }
}`,
      },
      {
        method: "GET",
        path: "/v1/sosial/kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung/p3ke-per-kecamatan",
        dashboardSlug: "kemiskinan-ekstrem-kesejahteraan-sosial-di-kota-bandung",
        summary: "P3KE per Kecamatan",
        description: "Jumlah individu dalam Pendataan Percepatan Penghapusan Kemiskinan Ekstrem (P3KE) di tiap kecamatan. Catatan: data P3KE baru tersedia untuk tahun 2024.",
        queryParams: [{ name: "tahun", required: false, desc: "Tahun data, mis. 2024. Default: tahun terbaru yang tersedia." }],
        exampleResponse: `{
  "data": [
    { "kecamatan": "ANDIR", "jumlahIndividu": 3120 }
  ],
  "meta": { "source": "Dinas Sosial Kota Bandung", "generatedAt": "2026-08-29T05:32:43.500Z" }
}`,
      },
    ],
  },
];
