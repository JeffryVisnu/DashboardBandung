"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { I18N } from "@/lib/placeholder-data";
import { API_DOCS } from "@/lib/api-docs-data";
import { useVisibleSectors } from "@/lib/useVisibleSectors";
import { useAllSectorDatasets, type SectorDataset } from "@/lib/useAllSectorDatasets";
import type { ApiEndpointDoc } from "@/types/dataset";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const s = I18N;

/** Endpoint 1 dashboard tunggal (mis. "Jumlah SMP" saja, terpisah dari "Jumlah SD") — dibuat
 * otomatis untuk SETIAP dashboard yang ada di database sekarang. Begitu admin menambah dashboard
 * baru lewat panel admin, entri dokumentasi baru langsung muncul di sini tanpa perlu kode baru,
 * karena daftarnya diambil langsung dari data yang sungguhan sedang aktif. */
function buildSingleDashboardEndpoint(dashboard: SectorDataset): ApiEndpointDoc {
  const example = {
    data: {
      id: dashboard.id,
      sectorId: dashboard.sectorId,
      title: dashboard.title,
      slug: dashboard.slug,
      iframeUrl: dashboard.iframeUrl,
      width: dashboard.width,
      height: dashboard.height,
      views: dashboard.views,
    },
    meta: { source: "Diskominfo Kota Bandung", generatedAt: new Date().toISOString() },
  };
  return {
    method: "GET",
    path: `/v1/${dashboard.sectorId}/${dashboard.slug}`,
    summary: `Dashboard: ${dashboard.title}`,
    description: `Detail dashboard "${dashboard.title}" saja — judul, link embed, ukuran, dan jumlah dilihat.`,
    exampleResponse: JSON.stringify(example, null, 2),
  };
}

const SECTORS_ENDPOINT: ApiEndpointDoc = {
  method: "GET",
  path: "/v1/sectors",
  summary: "Daftar Semua Sektor",
  description:
    "Daftar seluruh sektor Kota Bandung beserta kode, warna, dan deskripsinya. Otomatis bertambah begitu admin menambah sektor baru lewat panel admin.",
  exampleResponse: `{
  "data": [
    { "id": "pendidikan", "code": "PDK", "name": "Pendidikan", "desc": "...", "color": "#F0B429", "tint": "#FDF3DA", "sortOrder": 4 }
  ],
  "meta": { "source": "Diskominfo Kota Bandung", "generatedAt": "2026-07-29T06:00:00.000Z" }
}`,
};

function EndpointCard({ endpoint }: { endpoint: ApiEndpointDoc }) {
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
        <span className="text-[12.5px] font-medium text-bd-ink2 truncate flex-1">{endpoint.summary}</span>
        <span className={`text-bd-ink3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>&darr;</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-bd-border bg-bd-surface/40">
          <p className="text-[12.5px] font-medium text-bd-ink2 leading-relaxed my-3">{endpoint.description}</p>

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
                    <span className="text-bd-ink2 font-medium">{p.desc}</span>
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

function matchesQuery(ep: ApiEndpointDoc, q: string): boolean {
  return (
    q === "" ||
    ep.path.toLowerCase().includes(q) ||
    ep.summary.toLowerCase().includes(q) ||
    ep.description.toLowerCase().includes(q)
  );
}

export default function DataApiPage() {
  const sectors = useVisibleSectors();
  const sectorDashboards = useAllSectorDatasets();
  const [activeSector, setActiveSector] = useState<string>("semua");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  // Struktur: per sektor -> per dashboard (mis. "Jumlah SMP", "Jumlah SD") -> endpoint-nya
  // sendiri (1 endpoint generik "detail dashboard ini" + endpoint bespoke yang ditandai untuk
  // dashboard itu, mis. summary/trend/dsb.). Semua otomatis mengikuti dashboard yang sungguhan
  // aktif sekarang — sektor/dashboard baru dari admin langsung punya bagian sendiri di sini, dan
  // begitu sektor/dashboard-nya dihapus admin, bagian & endpoint terkait langsung hilang juga
  // (endpoint bespoke yang slug-nya sudah tidak ada di dashboard aktif dibuang, bukan disimpan
  // sebagai "Lainnya").
  const sectorsWithGroups = useMemo(() => {
    return sectors.map((sector) => {
      const dashboards = sectorDashboards?.[sector.id] ?? [];
      const bespokeAll = API_DOCS.find((d) => d.sectorId === sector.id)?.endpoints ?? [];
      const taggedSlugs = new Set(dashboards.map((d) => d.slug));

      const groups = dashboards.map((dashboard) => ({
        dashboard,
        endpoints: [
          buildSingleDashboardEndpoint(dashboard),
          ...bespokeAll.filter((ep) => ep.dashboardSlug === dashboard.slug),
        ],
      }));

      const activeBespokeCount = bespokeAll.filter((ep) => ep.dashboardSlug && taggedSlugs.has(ep.dashboardSlug)).length;
      const endpointCount = groups.reduce((sum, g) => sum + g.endpoints.length, 0);

      return { sector, groups, hasAny: activeBespokeCount > 0, endpointCount };
    });
  }, [sectors, sectorDashboards]);

  const sectionsToShow = useMemo(() => {
    const toShow = activeSector === "semua" ? sectorsWithGroups : sectorsWithGroups.filter((sec) => sec.sector.id === activeSector);
    return toShow
      .map(({ sector, groups, hasAny }) => {
        const filteredGroups = groups
          .map((g) => ({ ...g, endpoints: g.endpoints.filter((ep) => matchesQuery(ep, q)) }))
          .filter((g) => q === "" || g.endpoints.length > 0);
        return { sector, groups: filteredGroups, hasAny };
      })
      .filter((section) => q === "" || section.groups.length > 0);
  }, [sectorsWithGroups, activeSector, q]);

  const showGeneralSection =
    activeSector === "semua" &&
    (q === "" || [SECTORS_ENDPOINT.path, SECTORS_ENDPOINT.summary, SECTORS_ENDPOINT.description].some((t) => t.toLowerCase().includes(q)));

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
          <Link
            href="/data-api/ajukan-akses"
            className="inline-block bg-bd-blue border-none text-white font-bold px-4.5 py-2.5 rounded-lg cursor-pointer text-[12.5px] no-underline"
          >
            {s.api_generate_btn}
          </Link>
        </div>

        <div className="border border-bd-border rounded-2xl p-5.5">
          <div className="text-[14px] font-bold text-bd-ink mb-3.5">{s.api_quickstart_title}</div>
          <div className="bg-bd-blue-dark rounded-[10px] px-4.5 py-4 overflow-x-auto">
            <pre className="m-0 font-mono text-[11.5px] leading-relaxed text-[#CFE3F7] whitespace-pre">
{`curl ${API_BASE}/v1/pendidikan/dashboard-sekolah-menengah-pertama/summary \\
  -H "Authorization: Bearer bdg_live_xxxxxxxxxxxxxxxxxxxx"`}
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
            {sectorsWithGroups.map(({ sector, endpointCount }) => (
              <button
                key={sector.id}
                onClick={() => setActiveSector(sector.id)}
                className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-between gap-2 ${
                  activeSector === sector.id ? "bg-bd-blue-light text-bd-blue" : "text-bd-ink2 hover:bg-bd-surface"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sector.color }}></span>
                  {sector.name}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 bg-bd-green-light text-bd-green">
                  {endpointCount}
                </span>
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">
            {sectionsToShow.length === 0 && !showGeneralSection && (
              <p className="text-[14px] font-medium text-bd-ink2 py-10 text-center">{s.api_no_results}</p>
            )}

            {showGeneralSection && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-bd-border">
                  <div className="font-extrabold text-[10px] px-2.5 py-1 rounded-md bg-[#F4F6F9] text-bd-ink2">UMUM</div>
                  <h2 className="text-[16px] font-extrabold text-bd-ink">Lintas Sektor</h2>
                </div>
                <div className="flex flex-col gap-2.5">
                  <EndpointCard endpoint={SECTORS_ENDPOINT} />
                </div>
              </div>
            )}

            {sectionsToShow.map(({ sector, groups, hasAny }) => (
              <div key={sector.id}>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-bd-border">
                  <div className="font-extrabold text-[10px] px-2.5 py-1 rounded-md" style={{ backgroundColor: sector.tint, color: sector.color }}>
                    {sector.code}
                  </div>
                  <h2 className="text-[16px] font-extrabold text-bd-ink">{sector.name}</h2>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      hasAny ? "bg-bd-green-light text-bd-green" : "bg-[#F4F6F9] text-bd-ink3"
                    }`}
                  >
                    {hasAny ? s.api_status_available : s.api_status_soon}
                  </span>
                </div>

                {groups.length === 0 && (
                  <p className="text-[13px] font-medium text-bd-ink2 py-2">{s.api_no_endpoints_yet}</p>
                )}

                <div className="flex flex-col gap-6">
                  {groups.map(({ dashboard, endpoints }) => (
                    <div key={dashboard.id}>
                      <h3 className="text-[13px] font-extrabold text-bd-ink2 uppercase tracking-wide mb-2.5">
                        {dashboard.title}
                      </h3>
                      <div className="flex flex-col gap-2.5">
                        {endpoints.map((ep) => (
                          <EndpointCard key={ep.path} endpoint={ep} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
