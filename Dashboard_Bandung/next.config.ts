import type { NextConfig } from "next";

// Backend berjalan di origin terpisah (port beda saat dev, domain beda saat produksi) — dipakai
// untuk fetch data (connect-src) dan menampilkan logo dari /uploads (img-src). Diturunkan dari
// env yang sama dipakai src/lib/useSiteSettings.ts supaya CSP tidak ketinggalan kalau env berubah.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

// Domain penyedia embed dashboard (Looker Studio, Flourish) — satu-satunya yang boleh dimuat
// lewat <iframe> di halaman detail dashboard.
const EMBED_SOURCES = [
  "https://lookerstudio.google.com",
  "https://datastudio.google.com",
  "https://public.flourish.studio",
  "https://flo.uri.sh",
].join(" ");

const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  // Next.js App Router menyuntik script inline untuk hydration/RSC payload — 'unsafe-inline'
  // di sini masih perlu sampai app ini pindah ke CSP berbasis nonce (lihat catatan pentest).
  // 'unsafe-eval' HANYA ditambahkan saat dev (React pakai eval() untuk stack trace/HMR di mode
  // development, tidak pernah dipakai di production build) — jangan bawa ke production.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${BACKEND_ORIGIN}`,
  "font-src 'self' data:",
  // ws://localhost di dev untuk koneksi HMR (Hot Module Replacement) Turbopack.
  `connect-src 'self' ${BACKEND_ORIGIN}${isDev ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
  `frame-src ${EMBED_SOURCES}`,
  // Situs ini sendiri tidak pernah perlu ditampilkan di dalam iframe situs lain.
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          // Duplikat frame-ancestors di atas untuk browser lama yang belum dukung CSP level 2.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
