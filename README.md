# Dashboard Open Data Kota Bandung

Monorepo untuk dashboard open data Kota Bandung: frontend Next.js yang menampilkan data per kategori (kependudukan, pendidikan, dll.) dan backend Express yang menyediakan datanya lewat REST API (internal + publik ber-API key).

## Struktur proyek

```
DashboardBandungProjects/
├── Backend_Bandung/     # REST API (Express + TypeScript + PostgreSQL)
└── Dashboard_Bandung/   # Web frontend (Next.js App Router + TypeScript + Tailwind v4)
```

## Backend_Bandung

Express API yang membaca data dari PostgreSQL dan menyajikannya dalam dua jalur:

- `GET /api/categories/*` — dipakai internal oleh Dashboard_Bandung sendiri (CORS dibatasi ke `http://localhost:3000`).
- `GET /api/v1/*` — API publik ber-API key untuk dikonsumsi aplikasi lain (CORS terbuka, wajib header API key lewat middleware `requireApiKey`).
- `GET /health` — health check.

Kategori data yang sudah tersedia: **kependudukan** (ringkasan populasi, populasi per usia/kecamatan) dan **pendidikan** (ringkasan, tren, sebaran sekolah, guru-siswa per kecamatan, siswa per gender).

### Menjalankan

```bash
cd Backend_Bandung
npm install
npm run dev      # tsx watch, jalan di http://localhost:4000
```

Perlu file `.env` berisi koneksi database PostgreSQL (lihat `src/db.ts`).

Script lain:
- `npm run build` — compile TypeScript ke `dist/`
- `npm start` — jalankan hasil build

## Dashboard_Bandung

Frontend Next.js (App Router) yang menampilkan landing page kategori data, halaman detail per kategori (`/dashboard/[slug]`), halaman topik, dan dokumentasi API publik (`/data-api`).

### Menjalankan

```bash
cd Dashboard_Bandung
npm install
npm run dev      # jalan di http://localhost:3000
```

Perlu `NEXT_PUBLIC_API_URL` di `.env.local` mengarah ke backend (default `http://localhost:4000/api`).

Detail struktur folder dan catatan desain ada di [Dashboard_Bandung/README.md](Dashboard_Bandung/README.md).

## Menjalankan keduanya

Jalankan backend dan frontend di dua terminal terpisah — backend harus jalan lebih dulu (port 4000) sebelum frontend (port 3000) bisa fetch data kategori.
