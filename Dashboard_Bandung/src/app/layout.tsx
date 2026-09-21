import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Bandung — Portal Data Terbuka Kota Bandung",
  description:
    "Satu kanal angka, metrik, dan visualisasi data resmi Kota Bandung untuk warga dan pengambil kebijakan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <head>
        {/* Buka koneksi ke domain embed lebih awal (DNS+TLS) supaya iframe Looker
            Studio/Flourish di halaman dashboard tidak menunggu basa-basi jaringan
            saat baru mulai diminta. */}
        <link rel="preconnect" href="https://lookerstudio.google.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://lookerstudio.google.com" />
        <link rel="preconnect" href="https://public.flourish.studio" crossOrigin="" />
        <link rel="dns-prefetch" href="https://public.flourish.studio" />
      </head>
      {/* suppressHydrationWarning: ekstensi browser (Grammarly, Dark Reader, password
          manager, dll.) sering menyuntik atribut ke <html>/<body> sebelum React sempat
          hydrate, memicu warning mismatch palsu — bukan bug di kode ini. Ini HANYA
          meredam warning atribut di elemen ini sendiri, bukan mematikan pengecekan
          hydration di seluruh app. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
