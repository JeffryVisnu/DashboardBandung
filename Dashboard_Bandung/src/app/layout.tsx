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
    <html lang="id" className="h-full">
      <head>
        {/* Buka koneksi ke domain embed lebih awal (DNS+TLS) supaya iframe Looker
            Studio/Flourish di halaman dashboard tidak menunggu basa-basi jaringan
            saat baru mulai diminta. */}
        <link rel="preconnect" href="https://lookerstudio.google.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://lookerstudio.google.com" />
        <link rel="preconnect" href="https://public.flourish.studio" crossOrigin="" />
        <link rel="dns-prefetch" href="https://public.flourish.studio" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
