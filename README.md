# 🏙️ Dashboard Open Data Kota Bandung

Monorepo untuk dashboard open data Kota Bandung — situs publik yang menampilkan data per sektor (kependudukan, pendidikan, dll.) lewat embed Looker Studio/Flourish, dilengkapi **panel admin (CMS)** untuk mengelola seluruh konten tanpa perlu deploy kode baru, dan **REST API publik ber-API key** untuk dikonsumsi aplikasi pihak ketiga.

```
DashboardBandungProjects/
├── Backend_Bandung/     # REST API — Express + TypeScript + PostgreSQL
└── Dashboard_Bandung/   # Web frontend — Next.js App Router + TypeScript + Tailwind v4
```

---

## ✨ Fitur utama

| Area | Deskripsi |
|---|---|
| **Panel Admin** (`/eksekutif`) | Login JWT, sidebar 3 tab: **Pengaturan Situs**, **Sektor & Dashboard**, **Permintaan API & Aplikasi Eksternal** |
| **Pengaturan Situs** | Ubah logo (upload file), teks hero, dan 4 KPI beranda — tanpa hardcode |
| **Sektor & Dashboard** | CRUD penuh: tambah/hapus sektor, tambah/edit/hapus dashboard (embed iframe) per sektor, atur visibilitas tampil/sembunyi tiap sektor |
| **Ajukan Permintaan API** | Formulir publik (nama, instansi, email, dll.) → tersimpan ke DB + email konfirmasi otomatis (SMTP, opsional) |
| **API Key & aplikasi eksternal** | Generate/revoke API key, pencarian per label, pagination 10/halaman |
| **Dokumentasi API** (`/data-api`) | Endpoint dikelompokkan **per dashboard per sektor**, otomatis mengikuti data yang aktif — tambah/hapus dashboard di admin langsung tercermin di sini |
| **API publik hierarkis** | `GET /v1/{sektor}/{dashboard}/{endpoint}` — konsisten dengan struktur di atas |
| **Kunjungan per-dashboard** | Setiap dashboard (bukan cuma tiap sektor) punya angka "dilihat" sendiri |

Sektor **Pendidikan** sudah punya 2 dashboard nyata (Jumlah SMP & Jumlah SD) lengkap dengan endpoint bespoke: `summary`, `trend`, `sekolah-per-kecamatan`, `guru-siswa-per-kecamatan`, `siswa-gender`, `sebaran-sekolah`.

---

## 🚀 Menjalankan proyek

Backend harus jalan lebih dulu (port `4000`) sebelum frontend (port `3000`) bisa fetch data.

### 1. Backend_Bandung

```bash
cd Backend_Bandung
npm install
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, dst.
npm run dev             # tsx watch → http://localhost:4000
```

Migration SQL ada di `migrations/` (dijalankan manual terhadap `DATABASE_URL` — lihat `src/scripts/`). Variabel SMTP di `.env.example` opsional; kalau `SMTP_HOST` kosong, permintaan API tetap tersimpan tapi email dilewati.

Script lain:
- `npm run build` — compile TypeScript ke `dist/`
- `npm start` — jalankan hasil build

### 2. Dashboard_Bandung

```bash
cd Dashboard_Bandung
npm install
npm run dev              # → http://localhost:3000
```

Perlu `NEXT_PUBLIC_API_URL` di `.env.local` mengarah ke backend (default `http://localhost:4000/api`).

---

## 🔌 Struktur API

| Base path | Akses | Kegunaan |
|---|---|---|
| `GET /api/categories/*` | Internal (CORS dibatasi ke frontend) | Dipakai Dashboard_Bandung sendiri, tanpa API key |
| `GET /api/v1/*` | Publik, wajib API key | `/v1/sectors`, `/v1/{sektor}`, `/v1/{sektor}/{dashboard}`, `/v1/{sektor}/{dashboard}/{endpoint}` |
| `GET /api/admin/*` | Wajib token admin (JWT) | Semua operasi CRUD panel admin |
| `GET /health` | Publik | Health check |

Contoh:
```bash
curl http://localhost:4000/api/v1/pendidikan/jumlah-smp/summary \
  -H "Authorization: Bearer bdg_live_xxxxxxxxxxxxxxxxxxxx"
```

Dokumentasi endpoint lengkap & interaktif tersedia di halaman **`/data-api`** pada frontend.

---

## 📁 Detail lebih lanjut

- [Backend_Bandung/README.md](Backend_Bandung/README.md)
- [Dashboard_Bandung/README.md](Dashboard_Bandung/README.md)
