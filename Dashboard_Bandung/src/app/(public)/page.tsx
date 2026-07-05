"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SECTORS, SECTOR_DASHBOARDS, SECTOR_DETAILS } from "@/lib/placeholder-data";
import { useLang } from "@/lib/lang-context";

export default function Home() {
  const { lang } = useLang();

  const featuredDashboards = SECTORS.map((sec) => {
    const item = SECTOR_DASHBOARDS[sec.id]?.[0];
    return item ? { sector: sec, item } : null;
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const [highlightSectorId, setHighlightSectorId] = useState(SECTORS[0].id);
  useEffect(() => {
    const random = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    setHighlightSectorId(random.id);
  }, []);

  const highlightSector = SECTORS.find((sec) => sec.id === highlightSectorId)!;
  const highlightDetail = SECTOR_DETAILS[highlightSectorId];
  const highlightDashboard = SECTOR_DASHBOARDS[highlightSectorId]?.[0];
  const highlightTrendMin = Math.min(...highlightDetail.trend);
  const highlightTrendMax = Math.max(...highlightDetail.trend);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-bd-blue-dark text-white relative overflow-hidden flex flex-col pt-24 px-8 shadow-xl">
        <div className="absolute top-0 right-0 w-250 h-250 pointer-events-none">
          <div className="absolute right-0 top-0 w-full h-full border border-white/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute right-10 top-10 w-[90%] h-[90%] border border-white/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute right-20 top-20 w-[80%] h-[80%] border border-white/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
        </div>

        <div className="max-w-350 mx-auto w-full relative z-10 flex flex-col items-start px-2">
          <div className="text-bd-orange font-extrabold text-[13px] mb-4 tracking-wide uppercase">Portal Data Terbuka Kota Bandung</div>
          <h1 className="font-extrabold text-6xl mb-6 tracking-tight leading-none">Dashboard Bandung</h1>
          <p className="font-medium text-[18px] text-white/90 max-w-150 mb-16 leading-relaxed">
            Satu kanal angka, metrik, dan visualisasi data resmi Kota Bandung untuk warga dan pengambil kebijakan.
          </p>

          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 mt-auto mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">2,52 Juta</div>
              <div className="text-[13px] font-medium text-white/80">Populasi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">167,3 km²</div>
              <div className="text-[13px] font-medium text-white/80">Luas Wilayah</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">30</div>
              <div className="text-[13px] font-medium text-white/80">Kecamatan</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-extrabold text-white mb-1">151</div>
              <div className="text-[13px] font-medium text-white/80">Kelurahan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Pilihan */}
      <section className="max-w-350 mx-auto px-6 py-12">
        <div className="px-4 mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-[26px] font-extrabold text-bd-ink mb-1">Dashboard Pilihan</h2>
            <p className="text-bd-ink2 text-[15px]">Pilihan dashboard dari berbagai topik yang bisa dijelajahi lebih lanjut.</p>
          </div>
          <Link href="/topik" className="text-bd-blue font-bold text-[14px] hover:underline">
            Eksplor lebih banyak &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4 px-4">
          {featuredDashboards.map(({ sector, item }) => (
            <Link
              key={sector.id}
              href={`/dashboard/${sector.id}`}
              className="bg-white border border-bd-border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-bd-blue/30 flex flex-col"
            >
              <div
                className="h-28 relative flex items-center justify-center text-[24px] font-extrabold"
                style={{ backgroundColor: sector.tint, color: sector.color }}
              >
                {sector.code}
                <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-bd-ink text-[11px]">
                  &#8599;
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-[14px] font-extrabold text-bd-ink leading-snug line-clamp-2">{item.title[lang]}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Highlight Section */}
      <section className="max-w-350 mx-auto px-10 pb-16 pt-8">
        <div className="bg-bd-surface rounded-3xl p-10 flex flex-col">
          <div className="text-bd-orange font-extrabold text-[11px] uppercase tracking-wider mb-2">Sorotan Data</div>
          <h3 className="text-[22px] font-extrabold text-bd-ink mb-10">
            {highlightDashboard?.title[lang] ?? highlightSector.name[lang]}
          </h3>

          <div className="flex flex-row gap-12 items-center">
            <div className="flex-1 h-35 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={highlightSector.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={highlightDetail.trend.map((val, i) => {
                    const x = (i / (highlightDetail.trend.length - 1)) * 100;
                    const y = 100 - ((val - highlightTrendMin) / (highlightTrendMax - highlightTrendMin || 1)) * 100;
                    return `${x},${y}`;
                  }).join(" ")}
                />
              </svg>
            </div>

            <div className="w-95 flex flex-col gap-4">
              {highlightDetail.kpis.slice(0, 2).map((kpi, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-5 flex flex-col justify-center shadow-sm ${i === 0 ? "bg-bd-blue-light" : "bg-bd-gold-light"}`}
                >
                  <div className={`text-2xl font-extrabold mb-1 ${i === 0 ? "text-bd-blue" : "text-bd-orange"}`}>
                    {kpi.value}
                  </div>
                  <div className="text-[13px] font-medium text-bd-ink2">{kpi.label[lang]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
