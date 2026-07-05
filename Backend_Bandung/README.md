# Backend Bandung — API

Express + TypeScript API yang menyajikan data open data Kota Bandung dari PostgreSQL (Supabase), dipakai oleh [Dashboard_Bandung](../Dashboard_Bandung) dan (via API key) aplikasi eksternal.

## Cara jalanin

```bash
npm install
npm run dev
```

Server jalan di `http://localhost:4000` (atau sesuai `PORT` di `.env`).

Scripts lain:
- `npm run build` — compile TypeScript ke `dist/`
- `npm start` — jalankan hasil build (`dist/index.js`)

## Environment variables

Buat file `.env` di root proyek ini:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
PORT=4000
```

`.env` berisi kredensial database asli dan **tidak boleh di-commit** — pastikan tetap ada di `.gitignore`.

## Struktur folder

```
src/
├── index.ts                      # entry point, setup express + cors + routing
├── db.ts                         # koneksi pool PostgreSQL (pg)
├── types.ts                      # tipe-tipe bersama BE
├── middleware/
│   └── requireApiKey.ts          # validasi header Authorization: Bearer <key> untuk /api/v1
├── routes/
│   ├── categories.ts             # endpoint internal (dipakai FE Dashboard_Bandung)
│   ├── v1.ts                     # endpoint publik ber-API key (mirror sebagian data categories)
│   └── placeholder.ts            # mock data untuk kontrak API yang belum punya data asli
├── services/
│   └── pendidikan.ts             # query & agregasi data pendidikan (dipakai categories.ts & v1.ts)
└── sync/
    └── populationByAge.ts        # script one-off: fetch data opendata.bandung.go.id → insert ke tabel population_by_age
```

## Routing & CORS

Dua jalur akses dengan kebijakan CORS berbeda (lihat `src/index.ts`):

| Prefix | CORS | Auth | Dipakai oleh |
|---|---|---|---|
| `/api/categories` | dibatasi ke `http://localhost:3000` | tidak ada | Dashboard_Bandung (internal) |
| `/api/v1` | terbuka (`origin: "*"`) | wajib `Authorization: Bearer <api_key>` | aplikasi eksternal |
| `/health` | - | - | health check (`{ "status": "ok" }`) |

API key untuk `/api/v1` dibuat lewat `POST /api/categories/api-keys` (dipakai fitur "Kunci API Anda" di halaman `/data-api` Dashboard_Bandung) dan divalidasi terhadap tabel `api_keys` di database.

## Endpoint yang tersedia

### Kategori & dataset (internal, `/api/categories`)
- `GET /api/categories` — daftar kategori data.
- `GET /api/categories/:slug/datasets` — daftar dataset dalam satu kategori.
- `POST /api/categories/api-keys` — generate API key baru.

### Kependudukan (`/api/categories/kependudukan`)
- `GET /population-summary` — total penduduk, jumlah kecamatan, pertumbuhan %, top 3 kecamatan terpadat.
- `GET /population-by-age?tahun=&kecamatan=` — rincian penduduk per usia tunggal, bisa difilter per tahun/kecamatan.

### Pendidikan — SMP (`/api/categories/pendidikan` dan mirror publik di `/api/v1/pendidikan`, wajib API key)
- `GET /summary?tahun=&semester=` — jumlah sekolah, siswa, guru, rata-rata per sekolah.
- `GET /trend` — tren jumlah siswa per tahun ajaran.
- `GET /sekolah-per-kecamatan?tahun=&semester=` — sekolah negeri vs swasta per kecamatan.
- `GET /guru-siswa-per-kecamatan?tahun=&semester=` — jumlah guru & siswa per kecamatan.
- `GET /siswa-gender?tahun=&semester=` — komposisi siswa laki-laki/perempuan.
- `GET /sebaran-sekolah?status=&tahun=&semester=` — sebaran lokasi sekolah, filter opsional berdasarkan status (NEGERI/SWASTA).

Semua parameter `tahun`/`semester` opsional — kalau kosong, `pendidikan.resolvePeriod()` otomatis memakai periode terbaru yang tersedia di database.

### Placeholder/mock (`/api/v1`)
Endpoint dengan data statis untuk memenuhi kontrak yang sudah didokumentasikan FE di `/data-api`, sebelum data aslinya siap: `GET /sektor`, `GET /sektor/:id/indikator`, `GET /kecamatan`, `GET /indikator/:id/tren`.

## Yang masih perlu dikerjakan

1. **`src/routes/placeholder.ts`** — ganti mock data (`SECTORS`, `KECAMATAN_MOCK`, tren) dengan query nyata begitu sektor tersebut (ekonomi, dll.) sudah punya tabel/data di database.
2. **Sinkronisasi data** — saat ini hanya `sync/populationByAge.ts` yang ada (script manual, `tsx src/sync/populationByAge.ts`). Sektor lain perlu script sync serupa atau dijadwalkan (cron).
3. **Rate limiting / kuota API key** — `requireApiKey` baru validasi keberadaan key, belum ada pembatasan jumlah request.
