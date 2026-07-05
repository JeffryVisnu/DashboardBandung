"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/lang-context";

export function Header() {
  const { lang, setLang } = useLang();
  const pathname = usePathname();

  const isTopics = pathname === "/topik" || pathname.startsWith("/dashboard");

  return (
    <header className="bg-white sticky top-0 z-20">
      {/* Utility Bar */}
      <div className="bg-[#0F2F57] text-white px-8 py-2 flex justify-between items-center text-[11px] font-bold tracking-wide">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5FD98A]"></span>
          Portal Resmi Pemerintah Kota Bandung
        </span>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setLang("id")}
            className={`bg-transparent border-none cursor-pointer pb-0.5 border-b-2 ${lang === "id" ? "text-white border-white" : "text-white/50 border-transparent hover:text-white"}`}
          >
            ID
          </button>
          <span className="text-white/30">|</span>
          <button
            onClick={() => setLang("en")}
            className={`bg-transparent border-none cursor-pointer pb-0.5 border-b-2 ${lang === "en" ? "text-white border-white" : "text-white/50 border-transparent hover:text-white"}`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-bd-border">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Image src="/assets/logo-diskominfo.jpg" alt="Diskominfo Kota Bandung" height={36} width={120} className="h-9 w-auto" />
          <div className="w-[1px] h-[34px] bg-bd-border mx-2"></div>
          <div>
            <div className="font-extrabold text-[15px] text-bd-blue leading-tight tracking-tight">Dashboard Bandung</div>
            <div className="font-semibold text-[9px] text-bd-ink3 tracking-widest uppercase">Satu Data, Satu Bandung</div>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              className={`text-[13px] pb-1 border-b-[3px] ${pathname === "/" ? "font-bold text-bd-blue border-bd-blue" : "font-semibold text-bd-ink2 border-transparent hover:text-bd-blue"}`}
            >
              Beranda
            </Link>
            <Link
              href="/topik"
              className={`text-[13px] pb-1 border-b-[3px] ${isTopics ? "font-bold text-bd-blue border-bd-blue" : "font-semibold text-bd-ink2 border-transparent hover:text-bd-blue"}`}
            >
              Topik & Sektor
            </Link>
            <Link
              href="/data-api"
              className={`text-[13px] pb-1 border-b-[3px] ${pathname === "/data-api" ? "font-bold text-bd-blue border-bd-blue" : "font-semibold text-bd-ink2 border-transparent hover:text-bd-blue"}`}
            >
              Data API
            </Link>
          </nav>
          <Link
            href="/eksekutif"
            className="font-bold text-[13px] text-bd-blue bg-transparent border-[1.5px] border-bd-blue px-5 py-2.5 rounded-full cursor-pointer hover:bg-bd-blue hover:text-white transition-colors"
          >
            Login Eksekutif
          </Link>
        </div>
      </div>
    </header>
  );
}
