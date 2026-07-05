import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0F2F57] text-white pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <Image src="/assets/logo-diskominfo.jpg" alt="Diskominfo Kota Bandung" height={40} width={140} className="h-10 w-auto mb-6 bg-white p-1.5 rounded-lg shadow-sm" />
          <p className="text-[13px] text-white/80 leading-relaxed font-medium">
            Dashboard Bandung adalah kanal data terbuka resmi Kota Bandung, dikelola oleh Diskominfo untuk mendukung transparansi dan kebijakan berbasis data.
          </p>
        </div>

        <div>
          <div className="font-extrabold text-[11px] uppercase tracking-wider mb-6">Tautan</div>
          <ul className="flex flex-col gap-4 text-[13px] text-white/80 font-medium">
            <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
            <li><Link href="/topik" className="hover:text-white transition-colors">Topik & Sektor</Link></li>
            <li><Link href="/data-api" className="hover:text-white transition-colors">Data API</Link></li>
            <li><Link href="/eksekutif" className="hover:text-white transition-colors">Login Eksekutif</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-extrabold text-[11px] uppercase tracking-wider mb-6">Sektor</div>
          <ul className="flex flex-col gap-4 text-[13px] text-white/80 font-medium">
            <li className="cursor-default">Pemerintahan & Anggaran</li>
            <li className="cursor-default">Ekonomi & Ketenagakerjaan</li>
            <li className="cursor-default">Kependudukan</li>
            <li className="cursor-default">Pendidikan</li>
            <li className="cursor-default">Kesehatan</li>
            <li className="cursor-default">Infrastruktur & Tata Ruang</li>
            <li className="cursor-default">Lingkungan Hidup</li>
            <li className="cursor-default">Pariwisata & Ekonomi Kreatif</li>
          </ul>
        </div>

        <div>
          <div className="font-extrabold text-[11px] uppercase tracking-wider mb-6">Kontak</div>
          <ul className="flex flex-col gap-4 text-[13px] text-white/80 font-medium leading-relaxed">
            <li>Jl. Wastukancana No. 2, Bandung 40117</li>
            <li>diskominfo@bandung.go.id</li>
            <li>(022) 123-4567</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-10 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/50 font-medium gap-4">
        <div>© 2026 Dinas Komunikasi dan Informatika Kota Bandung</div>
        <div>Data ilustratif — menunggu integrasi data resmi.</div>
      </div>
    </footer>
  );
}
