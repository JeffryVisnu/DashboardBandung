# Dashboard Kota Bandung — Frontend

Frontend dashboard open data Kota Bandung. Next.js (App Router) + TypeScript + Tailwind CSS v4, mendukung Bahasa Indonesia & Inggris (i18n via `lang-context`).

## Cara jalanin

```bash
npm install
npm run dev
```

Buka http://localhost:3000

Perlu `Backend_Bandung` jalan di `http://localhost:4000` untuk data kategori (lihat [../Backend_Bandung/README.md](../Backend_Bandung/README.md)).

Scripts lain:
- `npm run build` — production build
- `npm start` — jalankan hasil build
- `npm run lint` — ESLint

## Environment variables

Buat file `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Struktur folder

```
src/
├── app/
│   ├── layout.tsx                    # root layout, font, metadata, LangProvider
│   ├── globals.css                   # design tokens (warna, font) via Tailwind v4 @theme
│   ├── eksekutif/page.tsx            # dashboard ringkasan eksekutif
│   └── (public)/
│       ├── layout.tsx                # layout publik (Header + Footer)
│       ├── page.tsx                  # landing page (hero + grid kategori)
│       ├── topik/page.tsx            # daftar/filter semua sektor topik data
│       ├── dashboard/[slug]/page.tsx # halaman detail per kategori/sektor
│       └── data-api/page.tsx         # dokumentasi Data API publik + generate API key
├── components/
│   ├── layout/                       # Header, Footer
│   └── dashboard/                    # CategoryCard, ContourMotif, dll.
├── lib/
│   ├── api-docs-data.ts              # sumber data dokumentasi endpoint /data-api (per sektor)
│   ├── lang-context.tsx              # context provider bahasa ID/EN
│   └── placeholder-data.ts           # data dummy sektor/kecamatan sebelum semua sektor tersambung ke BE
└── types/
    └── dataset.ts                    # tipe data: Category/Dataset (kontrak lama BE) + Sector/KecamatanData/dll (UI)
```

## Status integrasi data

Kategori **kependudukan** dan **pendidikan** sudah punya endpoint nyata di backend (lihat dokumentasi BE). Sektor lain (ekonomi, dll.) masih memakai `src/lib/placeholder-data.ts` sebagai data dummy sambil menunggu tabel & endpoint aslinya siap — begitu backend menambah sektor baru, ganti pemanggilan dummy dengan fetch ke `NEXT_PUBLIC_API_URL`.

Halaman `/data-api` menampilkan dokumentasi endpoint dari `src/lib/api-docs-data.ts`; sektor yang belum punya `endpoints` diberi tanda "Segera Hadir" otomatis — tambah endpoint baru cukup dengan menambah entri di file tersebut, tanpa mengubah halaman.

## Catatan desain

Palet warna ("Cekungan Bandung") dan motif kontur di hero section terinspirasi dari geografi Bandung (cekungan vulkanik dikelilingi perbukitan) sekaligus menyinggung sifat geospasial data opendata. Semua token warna & font didefinisikan di `globals.css` lewat Tailwind v4 `@theme inline` — cukup ubah di satu tempat kalau mau reskin.

Font pakai `geist` (package npm, self-hosted) bukan `next/font/google`, supaya build nggak gantung ke koneksi Google Fonts.
