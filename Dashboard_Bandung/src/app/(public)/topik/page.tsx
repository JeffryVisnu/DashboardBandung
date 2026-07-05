"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { I18N, SECTORS, SECTOR_DASHBOARDS } from "@/lib/placeholder-data";
import { useLang } from "@/lib/lang-context";

export default function TopikPage() {
  const { lang } = useLang();
  const s = I18N[lang];
  const searchParams = useSearchParams();
  const initialSector = searchParams.get("sektor") ?? "semua";
  const [activeSector, setActiveSector] = useState<string>(initialSector);
  const [query, setQuery] = useState("");

  const sectorsToShow =
    activeSector === "semua"
      ? SECTORS
      : SECTORS.filter((sec) => sec.id === activeSector);

  const q = query.trim().toLowerCase();

  const sections = sectorsToShow
    .map((sec) => {
      const items = (SECTOR_DASHBOARDS[sec.id] ?? []).filter(
        (item) => q === "" || item.title[lang].toLowerCase().includes(q)
      );
      return { sec, items };
    })
    .filter((section) => section.items.length > 0);

  return (
    <main className="pb-24 bg-white">
      {/* Page Header */}
      <section className="pt-10 pb-6">
        <div className="max-w-350 mx-auto px-10">
          <div className="flex items-center gap-2 text-[11px] font-bold text-bd-ink3 uppercase tracking-wider mb-6">
            <Link href="/" className="text-bd-ink3 hover:text-bd-blue">
              {s.breadcrumb_home}
            </Link>
            <span>/</span>
            <span className="text-bd-blue">{s.breadcrumb_topics}</span>
          </div>

          <div className="mb-6">
            <h1 className="text-[32px] font-extrabold text-bd-ink mb-3 tracking-tight">
              {s.topics_h1}
            </h1>
            <p className="text-[15px] font-medium text-bd-ink2">
              {s.topics_sub}
            </p>
          </div>

          <div className="w-100 relative">
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
      <section className="max-w-350 mx-auto px-10 flex gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 flex flex-col gap-1 sticky top-6">
          <button
            onClick={() => setActiveSector("semua")}
            className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-3 ${
              activeSector === "semua"
                ? "bg-bd-blue-light text-bd-blue border-l-4 border-bd-blue"
                : "text-bd-ink2 hover:bg-bd-surface border-l-4 border-transparent"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-bd-blue shrink-0"></span>
            {s.sidebar_all_topics}
          </button>
          {SECTORS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSector(sec.id)}
              className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-3 ${
                activeSector === sec.id
                  ? "bg-bd-blue-light text-bd-blue border-l-4 border-bd-blue"
                  : "text-bd-ink2 hover:bg-bd-surface border-l-4 border-transparent"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: sec.color }}
              ></span>
              {sec.name[lang]}
            </button>
          ))}
        </aside>

        {/* Sections */}
        <div className="flex-1 min-w-0 flex flex-col gap-12 py-2">
          {sections.length === 0 && (
            <p className="text-[14px] font-medium text-bd-ink2 py-10 text-center">
              {lang === "id"
                ? "Tidak ada dashboard yang cocok."
                : "No matching dashboards."}
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
                  {sec.name[lang]}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {items.map((item, i) => (
                  <Link
                    key={i}
                    href={`/dashboard/${sec.id}`}
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
                        {item.title[lang]}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="font-extrabold text-[10px] px-2.5 py-1 rounded-md"
                          style={{
                            backgroundColor: sec.tint,
                            color: sec.color,
                          }}
                        >
                          {sec.name[lang]}
                        </span>
                        <span className="font-extrabold text-[10px] px-2.5 py-1 rounded-md bg-[#F4F6F9] text-bd-ink2">
                          {item.year}
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
                        {item.views.toLocaleString(lang === "id" ? "id" : "en")}{" "}
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

      {/* Request CTA */}
      <section className="max-w-350 mx-auto px-10 mt-16">
        <div className="bg-bd-surface border border-bd-border rounded-2xl p-8 flex justify-between items-center">
          <div>
            <h3 className="text-[17px] font-extrabold text-bd-ink mb-1">
              {s.request_title}
            </h3>
            <p className="text-[13px] font-medium text-bd-ink2">
              {s.request_body}
            </p>
          </div>
          <button className="bg-bd-blue text-white font-bold px-6 py-3 rounded-lg cursor-pointer hover:bg-bd-blue-dark transition-colors text-[13px]">
            {s.request_btn}
          </button>
        </div>
      </section>
    </main>
  );
}
