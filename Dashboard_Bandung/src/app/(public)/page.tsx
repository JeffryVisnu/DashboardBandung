"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { I18N } from "@/lib/placeholder-data";
import { useVisibleSectors } from "@/lib/useVisibleSectors";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { useAllSectorDatasets, type SectorDataset } from "@/lib/useAllSectorDatasets";
import type { Sector } from "@/types/dataset";

/** Fisher-Yates — dipakai untuk mengacak urutan dashboard tanpa bias. */
function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Home() {
  const s = I18N;
  const sectors = useVisibleSectors();
  const site = useSiteSettings();
  const sectorDashboards = useAllSectorDatasets();

  const allDashboardEntries = useMemo(() => {
    if (!sectorDashboards) return [];
    const entries: { sector: Sector; item: SectorDataset }[] = [];
    for (const sector of sectors) {
      for (const item of sectorDashboards[sector.id] ?? []) {
        entries.push({ sector, item });
      }
    }
    return entries;
  }, [sectors, sectorDashboards]);

  // Dashboard Pilihan: 8 dashboard acak dari seluruh sektor (boleh lebih dari 1 dari sektor yang sama).
  const featuredDashboards = useMemo(() => shuffled(allDashboardEntries).slice(0, 8), [allDashboardEntries]);

  // Highlight: 1 dashboard acak per sektor (sektor tanpa dashboard tidak ikut tampil).
  const highlightCards = useMemo(() => {
    if (!sectorDashboards) return [];
    return sectors
      .map((sector) => {
        const items = sectorDashboards[sector.id];
        if (!items || items.length === 0) return null;
        return { sector, item: items[Math.floor(Math.random() * items.length)] };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [sectors, sectorDashboards]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-bd-blue-dark text-white relative overflow-hidden flex flex-col pt-16 md:pt-24 px-5 md:px-8 shadow-xl">
        <div className="absolute top-0 right-0 w-250 h-250 pointer-events-none">
          <div className="absolute right-0 top-0 w-full h-full border border-white/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute right-10 top-10 w-[90%] h-[90%] border border-white/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute right-20 top-20 w-[80%] h-[80%] border border-white/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
        </div>

        <div className="max-w-350 mx-auto w-full relative z-10 flex flex-col items-start px-2">
          <div className="text-bd-orange font-extrabold text-[13px] mb-4 tracking-wide uppercase">{site.heroEyebrow}</div>
          <h1 className="font-extrabold text-6xl mb-6 tracking-tight leading-none">{site.heroTitle}</h1>
          <p className="font-medium text-[18px] text-white/90 max-w-150 mb-16 leading-relaxed">
            {site.heroSub}
          </p>

          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 mt-auto mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">{site.kpiPop.value}</div>
              <div className="text-[13px] font-medium text-white/80">{site.kpiPop.label}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">{site.kpiArea.value}</div>
              <div className="text-[13px] font-medium text-white/80">{site.kpiArea.label}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">{site.kpiKec.value}</div>
              <div className="text-[13px] font-medium text-white/80">{site.kpiKec.label}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">{site.kpiKel.value}</div>
              <div className="text-[13px] font-medium text-white/80">{site.kpiKel.label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Pilihan */}
      <section className="max-w-350 mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="px-2 md:px-4 mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <h2 className="text-[21px] md:text-[26px] font-extrabold text-bd-ink mb-1">{s.featured_title}</h2>
            <p className="text-bd-ink2 text-[13.5px] md:text-[15px]">{s.featured_sub}</p>
          </div>
          <Link href="/topik" className="text-bd-blue font-bold text-[13.5px] md:text-[14px] hover:underline shrink-0">
            {s.explore_more} &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-2 md:px-4">
          {featuredDashboards.map(({ sector, item }) => (
            <Link
              key={item.id}
              href={`/dashboard/${sector.id}/${item.slug}`}
              className="bg-white border border-bd-border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-bd-blue/30 flex flex-col"
            >
              <div
                className="h-20 md:h-28 relative flex items-center justify-center text-[18px] md:text-[24px] font-extrabold"
                style={{ backgroundColor: sector.tint, color: sector.color }}
              >
                {sector.code}
                <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-bd-ink text-[11px]">
                  &#8599;
                </span>
              </div>
              <div className="p-3.5 md:p-5">
                <h3 className="text-[12.5px] md:text-[14px] font-extrabold text-bd-ink leading-snug line-clamp-2">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Highlight Section */}
      {highlightCards.length > 0 && (
        <section className="max-w-350 mx-auto px-4 md:px-10 pb-16 pt-8">
          <h2 className="text-[21px] md:text-[26px] font-extrabold text-bd-ink mb-6">{s.highlight_section_title}</h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label={s.carousel_prev}
              className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-bd-border shadow-sm items-center justify-center text-bd-ink2 hover:text-bd-blue hover:border-bd-blue/30 transition-colors"
            >
              &lsaquo;
            </button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory thin-scroll pb-2"
            >
              {highlightCards.map(({ sector, item }) => (
                <Link
                  key={sector.id}
                  href={`/dashboard/${sector.id}/${item.slug}`}
                  className="snap-start shrink-0 w-[min(90vw,420px)] bg-white border border-bd-border rounded-2xl p-6 hover:border-bd-blue/30 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-[12px] shrink-0"
                      style={{ backgroundColor: sector.tint, color: sector.color }}
                    >
                      {sector.code}
                    </div>
                    <h3 className="text-[19px] font-extrabold text-bd-ink">{sector.name}</h3>
                  </div>

                  <div className="text-[14px] font-bold text-bd-ink2 leading-snug mb-4">{item.title}</div>

                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-bd-ink3">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    {item.views.toLocaleString("id")} {s.dashboard_views}
                  </div>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label={s.carousel_next}
              className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-bd-border shadow-sm items-center justify-center text-bd-ink2 hover:text-bd-blue hover:border-bd-blue/30 transition-colors"
            >
              &rsaquo;
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
