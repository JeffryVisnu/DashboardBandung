"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { I18N } from "@/lib/placeholder-data";
import { useSiteSettings, resolveLogoSrc } from "@/lib/useSiteSettings";

const s = I18N;

export function Header() {
  const pathname = usePathname();
  const site = useSiteSettings();

  const isTopics = pathname === "/topik" || pathname.startsWith("/dashboard");

  return (
    <header className="bg-white sticky top-0 z-20">
      {/* Utility Bar */}
      <div className="bg-[#0F2F57] text-white px-8 py-2 flex justify-between items-center text-[11px] font-bold tracking-wide">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5FD98A]"></span>
          {s.utility_text}
        </span>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-bd-border">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Image src={resolveLogoSrc(site.logoPath)} alt="Diskominfo Kota Bandung" height={36} width={120} unoptimized className="h-9 w-auto" />
          <div className="w-px h-8.5 bg-bd-border mx-2"></div>
          <div>
            <div className="font-extrabold text-[15px] text-bd-blue leading-tight tracking-tight">{site.heroTitle}</div>
            <div className="font-semibold text-[9px] text-bd-ink3 tracking-widest uppercase">{s.tagline}</div>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              className={`text-[13px] pb-1 border-b-[3px] ${pathname === "/" ? "font-bold text-bd-blue border-bd-blue" : "font-semibold text-bd-ink2 border-transparent hover:text-bd-blue"}`}
            >
              {s.nav_home}
            </Link>
            <Link
              href="/topik"
              className={`text-[13px] pb-1 border-b-[3px] ${isTopics ? "font-bold text-bd-blue border-bd-blue" : "font-semibold text-bd-ink2 border-transparent hover:text-bd-blue"}`}
            >
              {s.nav_topics}
            </Link>
            <Link
              href="/data-api"
              className={`text-[13px] pb-1 border-b-[3px] ${pathname === "/data-api" ? "font-bold text-bd-blue border-bd-blue" : "font-semibold text-bd-ink2 border-transparent hover:text-bd-blue"}`}
            >
              {s.nav_api}
            </Link>
          </nav>
          <Link
            href="/eksekutif"
            className="font-bold text-[13px] text-bd-blue bg-transparent border-[1.5px] border-bd-blue px-5 py-2.5 rounded-full cursor-pointer hover:bg-bd-blue hover:text-white transition-colors"
          >
            {s.btn_exec}
          </Link>
        </div>
      </div>
    </header>
  );
}
