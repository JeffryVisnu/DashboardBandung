"use client";

import Image from "next/image";
import Link from "next/link";
import { I18N } from "@/lib/placeholder-data";
import { useVisibleSectors } from "@/lib/useVisibleSectors";
import { useSiteSettings, resolveLogoSrc } from "@/lib/useSiteSettings";

export function Footer() {
  const s = I18N;
  const sectors = useVisibleSectors();
  const site = useSiteSettings();

  return (
    <footer className="bg-[#0F2F57] text-white pt-16 pb-8">
      <div className="max-w-350 mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <Image src={resolveLogoSrc(site.footerLogoPath)} alt="Diskominfo Kota Bandung" height={40} width={140} unoptimized className="h-10 w-auto mb-6" />
          <p className="text-[13px] text-white/80 leading-relaxed font-medium">
            {s.footer_about_body}
          </p>
        </div>

        <div>
          <div className="font-extrabold text-[11px] uppercase tracking-wider mb-6">{s.footer_links_title}</div>
          <ul className="flex flex-col gap-4 text-[13px] text-white/80 font-medium">
            <li><Link href="/" className="hover:text-white transition-colors">{s.nav_home}</Link></li>
            <li><Link href="/topik" className="hover:text-white transition-colors">{s.nav_topics}</Link></li>
            <li><Link href="/data-api" className="hover:text-white transition-colors">{s.nav_api}</Link></li>
            <li><Link href="/eksekutif" className="hover:text-white transition-colors">{s.btn_exec}</Link></li>
            <li><Link href="/ketentuan-penggunaan" className="hover:text-white transition-colors">{s.footer_terms_title}</Link></li>
            <li><Link href="/kebijakan-privasi" className="hover:text-white transition-colors">{s.footer_privacy_title}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-extrabold text-[11px] uppercase tracking-wider mb-6">{s.footer_sectors_title}</div>
          <ul className="flex flex-col gap-4 text-[13px] text-white/80 font-medium">
            {sectors.map((sector) => (
              <li key={sector.id}>
                <Link href={`/topik?sektor=${sector.id}`} className="hover:text-white transition-colors">
                  {sector.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-extrabold text-[11px] uppercase tracking-wider mb-6">{s.footer_contact_title}</div>
          <ul className="flex flex-col gap-4 text-[13px] text-white/80 font-medium leading-relaxed">
            <li>Jl. Wastukancana No. 2, Bandung 40117</li>
            <li>diskominfo@bandung.go.id</li>
            <li>(022) 123-4567</li>
          </ul>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-10 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/50 font-medium gap-4">
        <div>{s.footer_rights}</div>
        <div>{s.footer_disclaimer}</div>
      </div>
    </footer>
  );
}
