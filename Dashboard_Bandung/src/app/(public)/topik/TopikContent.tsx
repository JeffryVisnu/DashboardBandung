"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { I18N } from "@/lib/placeholder-data";
import { useVisibleSectors } from "@/lib/useVisibleSectors";
import { useAllSectorDatasets } from "@/lib/useAllSectorDatasets";

export function TopikContent() {
  const s = I18N;
  const sectors = useVisibleSectors();
  const sectorDashboards = useAllSectorDatasets();
  const searchParams = useSearchParams();
  const sektorParam = searchParams.get("sektor") ?? "semua";
  const [activeSector, setActiveSector] = useState<string>(sektorParam);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Halaman ini tidak remount kalau linknya diklik saat sudah berada di /topik (mis. dari
  // footer, sektor lain) — cuma query string yang berubah, jadi state filter perlu disinkron
  // ulang tiap kali "sektor" di URL berubah, bukan cuma dibaca sekali di awal.
  useEffect(() => {
    setActiveSector(sektorParam);
  }, [sektorParam]);

  const sectorsToShow =
    activeSector === "semua"
      ? sectors
      : sectors.filter((sec) => sec.id === activeSector);

  const q = query.trim().toLowerCase();

  const sections = sectorsToShow
    .map((sec) => {
      const items = (sectorDashboards?.[sec.id] ?? []).filter(
        (item) => q === "" || item.title.toLowerCase().includes(q)
      );
      return { sec, items };
    })
    .filter((section) => section.items.length > 0);

  return (
    <main className="pb-24 bg-white">
      {/* Page Header */}
      <section className="pt-6 md:pt-10 pb-6">
        <div className="max-w-350 mx-auto px-4 md:px-10">
          <div className="flex items-center gap-2 text-[11px] font-bold text-bd-ink3 uppercase tracking-wider mb-6">
            <Link href="/" className="text-bd-ink3 hover:text-bd-blue">
              {s.breadcrumb_home}
            </Link>
            <span>/</span>
            <span className="text-bd-blue">{s.breadcrumb_topics}</span>
          </div>

          <div className="mb-6">
            <h1 className="text-[24px] md:text-[32px] font-extrabold text-bd-ink mb-3 tracking-tight">
              {s.topics_h1}
            </h1>
            <p className="text-[14px] md:text-[15px] font-medium text-bd-ink2">
              {s.topics_sub}
            </p>
          </div>

          <div className="w-full md:w-100 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bd-ink3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={s.topics_search_ph}
              className="w-full pl-10 pr-4 py-3 bg-[#F4F6F9] border-none rounded-xl text-[13px] outline-none font-medium text-bd-ink placeholder:text-bd-ink3"
            />
          </div>
        </div>
      </section>

      {/* Sidebar + Content */}
      <section className="max-w-350 mx-auto px-4 md:px-10 flex flex-col md:flex-row gap-4 md:gap-8 items-start">
        {/* Tombol buka/tutup sidebar — cuma tampil di mobile, di desktop sidebar selalu terbuka */}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-expanded={sidebarOpen}
          className="md:hidden w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-bd-surface text-[13px] font-bold text-bd-ink"
        >
          <span className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: activeSector === "semua" ? "#1F5AA8" : sectors.find((sec) => sec.id === activeSector)?.color }}
            ></span>
            {activeSector === "semua" ? s.sidebar_all_topics : sectors.find((sec) => sec.id === activeSector)?.name}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {/* Sidebar — dropdown yang bisa dibuka/tutup di mobile, kolom tetap terbuka di desktop */}
        <aside className={`${sidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-60 shrink-0 flex-col gap-1 md:sticky md:top-6`}>
          <button
            onClick={() => {
              setActiveSector("semua");
              setSidebarOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-3 ${
              activeSector === "semua"
                ? "bg-bd-blue-light text-bd-blue md:border-l-4 border-bd-blue"
                : "text-bd-ink2 hover:bg-bd-surface md:border-l-4 border-transparent"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-bd-blue shrink-0"></span>
            {s.sidebar_all_topics}
          </button>
          {sectors.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSector(sec.id);
                setSidebarOpen(false);
              }}
              className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-3 ${
                activeSector === sec.id
                  ? "bg-bd-blue-light text-bd-blue md:border-l-4 border-bd-blue"
                  : "text-bd-ink2 hover:bg-bd-surface md:border-l-4 border-transparent"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: sec.color }}
              ></span>
              {sec.name}
            </button>
          ))}
        </aside>

        {/* Sections */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-12 py-2">
          {sections.length === 0 && (
            <p className="text-[14px] font-medium text-bd-ink2 py-10 text-center">
              Tidak ada dashboard yang cocok.
            </p>
          )}

          {sections.map(({ sec, items }) => (
            <div key={sec.id}>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-bd-border">
                <div
                  className="font-extrabold text-[10px] px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: sec.tint, color: sec.color }}
                >
                  {sec.code}
                </div>
                <h2 className="text-[19px] font-extrabold text-bd-ink">
                  {sec.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/${sec.id}/${item.slug}`}
                    className="bg-white border border-bd-border rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:shadow-lg hover:border-bd-blue/30 transition-all"
                  >
                    <div
                      className="h-24 flex items-center justify-center text-[22px] font-extrabold"
                      style={{ backgroundColor: sec.tint, color: sec.color }}
                    >
                      {sec.code}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[14px] font-extrabold text-bd-ink mb-4 leading-snug flex-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="font-extrabold text-[10px] px-2.5 py-1 rounded-md"
                          style={{
                            backgroundColor: sec.tint,
                            color: sec.color,
                          }}
                        >
                          {sec.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-bd-ink3">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {item.views.toLocaleString("id")}{" "}
                        {s.dashboard_views}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
