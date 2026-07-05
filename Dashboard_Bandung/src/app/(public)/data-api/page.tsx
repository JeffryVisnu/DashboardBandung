"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { I18N, SECTORS } from "@/lib/placeholder-data";
import { API_DOCS } from "@/lib/api-docs-data";
import { useLang } from "@/lib/lang-context";
import type { ApiEndpointDoc } from "@/types/dataset";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function EndpointCard({ endpoint, lang }: { endpoint: ApiEndpointDoc; lang: "id" | "en" }) {
  const s = I18N[lang];
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-bd-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer bg-white hover:bg-bd-surface transition-colors text-left"
      >
        <span className="bg-bd-green-light text-bd-green px-2 py-1 rounded text-[10.5px] font-bold uppercase tracking-wider shrink-0">
          {endpoint.method}
        </span>
        <span className="font-mono text-[12.5px] font-semibold text-bd-ink shrink-0">{endpoint.path}</span>
        <span className="text-[12.5px] font-medium text-bd-ink2 truncate flex-1">{endpoint.summary[lang]}</span>
        <span className={`text-bd-ink3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>&darr;</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-bd-border bg-bd-surface/40">
          <p className="text-[12.5px] font-medium text-bd-ink2 leading-relaxed my-3">{endpoint.description[lang]}</p>

          {endpoint.queryParams && endpoint.queryParams.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider mb-2">{s.api_params_title}</div>
              <div className="flex flex-col gap-2">
                {endpoint.queryParams.map((p) => (
                  <div key={p.name} className="flex items-start gap-2 text-[12px]">
                    <span className="font-mono font-bold text-bd-ink shrink-0">{p.name}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${p.required ? "bg-bd-gold-light text-bd-orange" : "bg-[#F4F6F9] text-bd-ink3"}`}>
                      {p.required ? s.api_param_required : s.api_param_optional}
                    </span>
                    <span className="text-bd-ink2 font-medium">{p.desc[lang]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider mb-2">{s.api_example_response_title}</div>
          <div className="bg-bd-blue-dark rounded-[10px] px-4 py-3.5 overflow-x-auto">
            <pre className="m-0 font-mono text-[11px] leading-relaxed text-[#8FD19E] whitespace-pre">{endpoint.exampleResponse}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataApiPage() {
  const { lang } = useLang();
  const s = I18N[lang];
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSector, setActiveSector] = useState<string>("semua");
  const [query, setQuery] = useState("");

  async function generateKey() {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/categories/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "dashboard-web-user" }),
      });
      const json = await res.json();
      setApiKey(json.key ?? null);
    } catch {
      setApiKey(null);
    } finally {
      setGenerating(false);
    }
  }

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const q = query.trim().toLowerCase();

  const sectionsToShow = useMemo(() => {
    const docsToShow = activeSector === "semua" ? API_DOCS : API_DOCS.filter((d) => d.sectorId === activeSector);
    return docsToShow
      .map((docs) => {
        const sector = SECTORS.find((sec) => sec.id === docs.sectorId);
        const endpoints = docs.endpoints.filter(
          (ep) =>
            q === "" ||
            ep.path.toLowerCase().includes(q) ||
            ep.summary[lang].toLowerCase().includes(q) ||
            ep.description[lang].toLowerCase().includes(q)
        );
        return { sector, endpoints, hasAny: docs.endpoints.length > 0 };
      })
      .filter((section) => section.sector && (q === "" || section.endpoints.length > 0));
  }, [activeSector, q, lang]);

  return (
    <main className="pb-24 bg-white">
      {/* Page Header */}
      <section className="pt-6">
        <div className="max-w-350 mx-auto px-8">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-bd-ink3 mb-4">
            <Link href="/" className="text-bd-ink3 hover:text-bd-blue">{s.breadcrumb_home}</Link>
            <span>/</span>
            <span className="text-bd-ink">{s.nav_api}</span>
          </div>

          <h1 className="text-[30px] font-extrabold text-bd-ink mb-2.5">{s.api_h1}</h1>
          <p className="text-[15px] font-medium text-bd-ink2 max-w-xl mb-7 leading-relaxed">{s.api_sub}</p>
        </div>
      </section>

      {/* API key + quickstart */}
      <section className="max-w-350 mx-auto px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border border-bd-border rounded-2xl p-5.5">
          <div className="text-[14px] font-bold text-bd-ink mb-1.5">{s.api_key_title}</div>
          <div className="text-[12.5px] font-normal text-bd-ink2 leading-relaxed mb-4">{s.api_key_desc}</div>

          {apiKey ? (
            <div className="flex items-center gap-2.5 bg-bd-surface border border-bd-border rounded-lg px-3.5 py-3">
              <span className="flex-1 font-mono text-[13px] text-bd-ink overflow-hidden text-ellipsis whitespace-nowrap">
                {apiKey}
              </span>
              <button
                onClick={copyKey}
                className="bg-bd-blue border-none text-white font-bold px-3 py-1.5 rounded-md cursor-pointer text-[11.5px] whitespace-nowrap"
              >
                {copied ? (lang === "id" ? "Tersalin!" : "Copied!") : s.api_copy_btn}
              </button>
            </div>
          ) : (
            <button
              onClick={generateKey}
              disabled={generating}
              className="bg-bd-blue border-none text-white font-bold px-4.5 py-2.5 rounded-lg cursor-pointer text-[12.5px] disabled:opacity-60"
            >
              {generating ? (lang === "id" ? "Membuat…" : "Generating…") : s.api_generate_btn}
            </button>
          )}
        </div>

        <div className="border border-bd-border rounded-2xl p-5.5">
          <div className="text-[14px] font-bold text-bd-ink mb-3.5">{s.api_quickstart_title}</div>
          <div className="bg-bd-blue-dark rounded-[10px] px-4.5 py-4 overflow-x-auto">
            <pre className="m-0 font-mono text-[11.5px] leading-relaxed text-[#CFE3F7] whitespace-pre">
{`curl ${API_BASE}/v1/pendidikan/summary \\
  -H "Authorization: Bearer ${apiKey ?? "bdg_live_xxxxxxxxxxxxxxxxxxxx"}"`}
            </pre>
          </div>
        </div>
      </section>

      {/* Endpoint reference: search + sidebar + accordion docs */}
      <section className="max-w-350 mx-auto px-8">
        <div className="w-full max-w-md mb-6 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bd-ink3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.api_search_ph}
            className="w-full pl-10 pr-4 py-3 bg-[#F4F6F9] border-none rounded-xl text-[13px] outline-none font-medium text-bd-ink placeholder:text-bd-ink3"
          />
        </div>

        <div className="flex gap-8 items-start pb-10">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 flex flex-col gap-1 sticky top-6">
            <button
              onClick={() => setActiveSector("semua")}
              className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
                activeSector === "semua" ? "bg-bd-blue-light text-bd-blue" : "text-bd-ink2 hover:bg-bd-surface"
              }`}
            >
              {s.api_all_sectors}
            </button>
            {SECTORS.map((sec) => {
              const docs = API_DOCS.find((d) => d.sectorId === sec.id);
              const count = docs?.endpoints.length ?? 0;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSector(sec.id)}
                  className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-between gap-2 ${
                    activeSector === sec.id ? "bg-bd-blue-light text-bd-blue" : "text-bd-ink2 hover:bg-bd-surface"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sec.color }}></span>
                    {sec.name[lang]}
                  </span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${count > 0 ? "bg-bd-green-light text-bd-green" : "bg-[#F4F6F9] text-bd-ink3"}`}>
                    {count > 0 ? count : "—"}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">
            {sectionsToShow.length === 0 && (
              <p className="text-[14px] font-medium text-bd-ink2 py-10 text-center">{s.api_no_results}</p>
            )}

            {sectionsToShow.map(({ sector, endpoints, hasAny }) => (
              <div key={sector!.id}>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-bd-border">
                  <div className="font-extrabold text-[10px] px-2.5 py-1 rounded-md" style={{ backgroundColor: sector!.tint, color: sector!.color }}>
                    {sector!.code}
                  </div>
                  <h2 className="text-[16px] font-extrabold text-bd-ink">{sector!.name[lang]}</h2>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      hasAny ? "bg-bd-green-light text-bd-green" : "bg-[#F4F6F9] text-bd-ink3"
                    }`}
                  >
                    {hasAny ? s.api_status_available : s.api_status_soon}
                  </span>
                </div>

                {endpoints.length === 0 ? (
                  <p className="text-[13px] font-medium text-bd-ink2 py-2">{s.api_no_endpoints_yet}</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {endpoints.map((ep) => (
                      <EndpointCard key={ep.path} endpoint={ep} lang={lang} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate limit + docs */}
      <section className="max-w-350 mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-bd-surface rounded-2xl p-5">
          <div className="text-[13.5px] font-bold text-bd-ink mb-1.5">{s.api_rate_title}</div>
          <div className="text-[12.5px] font-normal text-bd-ink2 leading-relaxed">{s.api_rate_desc}</div>
        </div>

        <a href="#" className="flex items-center justify-center gap-2 font-bold text-[13px] bg-bd-blue text-white px-5.5 py-3.5 rounded-lg no-underline">
          {s.api_docs_btn} &rarr;
        </a>
      </section>
    </main>
  );
}
