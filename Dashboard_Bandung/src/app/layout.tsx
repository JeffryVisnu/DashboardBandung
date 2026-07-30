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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
