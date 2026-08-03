"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { I18N } from "@/lib/placeholder-data";
import { useSiteSettings, resolveLogoSrc } from "@/lib/useSiteSettings";

const s = I18N;

export function Header() {
  const pathname = usePathname();
  const site = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTopics = pathname === "/topik" || pathname.startsWith("/dashboard");

  // Tutup menu mobile otomatis begitu pindah halaman.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLink = (href: string, active: boolean, label: string) => (
    <Link
      href={href}
      className={`text-[13px] pb-1 border-b-[3px] ${active ? "font-bold text-bd-blue border-bd-blue" : "font-semibold text-bd-ink2 border-transparent hover:text-bd-blue"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-white sticky top-0 z-20">
      {/* Utility Bar */}
      <div className="bg-[#0F2F57] text-white px-4 md:px-8 py-2 flex justify-between items-center text-[11px] font-bold tracking-wide">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5FD98A] shrink-0"></span>
          <span className="truncate">{s.utility_text}</span>
        </span>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-bd-border">
        <Link href="/" className="flex items-center gap-2 md:gap-3 cursor-pointer min-w-0">
          <Image src={resolveLogoSrc(site.logoPath)} alt="Diskominfo Kota Bandung" height={36} width={120} unoptimized className="h-7 md:h-9 w-auto shrink-0" />
          <div className="hidden sm:block w-px h-8.5 bg-bd-border mx-2 shrink-0"></div>
          <div className="min-w-0">
            <div className="font-extrabold text-[13px] md:text-[15px] text-bd-blue leading-tight tracking-tight truncate">{site.heroTitle}</div>
            <div className="hidden sm:block font-semibold text-[9px] text-bd-ink3 tracking-widest uppercase">{s.tagline}</div>
          </div>
        </Link>

        <div className="flex items-center gap-4 md:gap-8 shrink-0">
          <nav className="hidden md:flex gap-8">
            {navLink("/", pathname === "/", s.nav_home)}
            {navLink("/topik", isTopics, s.nav_topics)}
            {navLink("/data-api", pathname === "/data-api", s.nav_api)}
          </nav>
          <Link
            href="/eksekutif"
            className="font-bold text-[11.5px] md:text-[13px] text-bd-blue bg-transparent border-[1.5px] border-bd-blue px-3.5 md:px-5 py-2 md:py-2.5 rounded-full cursor-pointer hover:bg-bd-blue hover:text-white transition-colors whitespace-nowrap"
          >
            {s.btn_exec}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-bd-border text-bd-ink cursor-pointer shrink-0"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="6" y1="18" x2="18" y2="6"></line></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden flex flex-col px-4 py-3 gap-1 border-b border-bd-border bg-white">
          <Link
            href="/"
            className={`px-3 py-2.5 rounded-lg text-[13.5px] ${pathname === "/" ? "font-bold text-bd-blue bg-bd-blue-light" : "font-semibold text-bd-ink2"}`}
          >
            {s.nav_home}
          </Link>
          <Link
            href="/topik"
            className={`px-3 py-2.5 rounded-lg text-[13.5px] ${isTopics ? "font-bold text-bd-blue bg-bd-blue-light" : "font-semibold text-bd-ink2"}`}
          >
            {s.nav_topics}
          </Link>
          <Link
            href="/data-api"
            className={`px-3 py-2.5 rounded-lg text-[13.5px] ${pathname === "/data-api" ? "font-bold text-bd-blue bg-bd-blue-light" : "font-semibold text-bd-ink2"}`}
          >
            {s.nav_api}
          </Link>
        </nav>
      )}
    </header>
  );
}
