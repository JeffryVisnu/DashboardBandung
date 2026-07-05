"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import {
  I18N,
  SECTORS,
  SECTOR_DETAILS,
  KECAMATAN_DATA,
} from "@/lib/placeholder-data";
import { useLang } from "@/lib/lang-context";
import type { Lang, Sector } from "@/types/dataset";

interface Props {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function scaleColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  const t = (value - min) / range;
  if (t < 0.2) return "#DCEAFB";
  if (t < 0.4) return "#AECBEE";
  if (t < 0.6) return "#6FA0D8";
  if (t < 0.8) return "#3D74B8";
  return "#1F4E8C";
}

function normalizeKec(name: string): string {
  return name.toUpperCase().replace(/[^A-Z]/g, "");
}

function Breadcrumb({ lang, sector }: { lang: Lang; sector: Sector }) {
  const s = I18N[lang];
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold text-bd-ink3 uppercase tracking-wider mb-6">
      <Link href="/" className="text-bd-ink3 hover:text-bd-blue">
        {s.breadcrumb_home}
      </Link>
      <span>/</span>
      <Link href="/topik" className="text-bd-ink3 hover:text-bd-blue">
        {s.breadcrumb_topics}
      </Link>
      <span>/</span>
      <span className="text-bd-blue">{sector.name[lang]}</span>
    </div>
  );
}

export default function DetailPage({ params }: Props) {
  const { slug } = use(params);
  const sector = SECTORS.find((sec) => sec.id === slug);
  if (!sector) notFound();

  if (slug === "pendidikan") {
    return <PendidikanDetail sector={sector} />;
  }
  return <GenericSectorDetail sector={sector} slug={slug} />;
}

// ─── Sektor lain — masih dummy/placeholder ────────────────────────────────────

function GenericSectorDetail({
  sector,
  slug,
}: {
  sector: Sector;
  slug: string;
}) {
  const { lang } = useLang();
  const s = I18N[lang];
  const detail = SECTOR_DETAILS[slug];
  if (!detail) notFound();

  const kecamatanRows = useMemo(() => {
    const rows = KECAMATAN_DATA.map((k) => ({
      name: k.name,
      value: Math.round(k.pop * detail.kecamatanFactor),
      share: k.share,
    }));
    return rows.sort((a, b) => b.value - a.value);
  }, [detail.kecamatanFactor]);

  const kecamatanMin = Math.min(...kecamatanRows.map((r) => r.value));
  const kecamatanMax = Math.max(...kecamatanRows.map((r) => r.value));

  const trendMin = Math.min(...detail.trend);
  const trendMax = Math.max(...detail.trend);

  return (
    <main className="bg-bd-surface pb-24">
      {/* Page Header */}
      <section className="bg-white border-b border-bd-border pt-10 pb-8">
        <div className="max-w-350 mx-auto px-10">
          <Breadcrumb lang={lang} sector={sector} />

          <div className="flex justify-between items-start">
            <div className="flex gap-5 items-start">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-[15px]"
                style={{ backgroundColor: sector.tint, color: sector.color }}
              >
                {sector.code}
              </div>
              <div>
                <h1 className="text-[32px] font-extrabold text-bd-ink mb-2">
                  {sector.name[lang]}
                </h1>
                <p className="text-[15px] font-medium text-bd-ink2">
                  {sector.desc[lang]}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-[11px] font-bold text-bd-ink3">
                {s.detail_source}: {s.source_name} - {s.detail_updated}:{" "}
                {s.updated_date}
              </div>
              <button className="bg-white border border-bd-blue text-bd-blue font-bold px-6 py-2.5 rounded-lg cursor-pointer hover:bg-bd-blue hover:text-white transition-colors text-[13px] flex items-center gap-2">
                &darr; {s.detail_download}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="max-w-350uto px-10 pt-8 mb-8">
        <div className="bg-white border border-bd-border rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            {detail.kpis.map((kpi, i) => (
              <div key={i} className="bg-[#F4F6F9] rounded-xl p-6">
                <div
                  className={`text-[26px] font-extrabold mb-1 ${
                    kpi.accent === "green" ? "text-bd-green" : "text-bd-ink"
                  }`}
                >
                  {kpi.value}
                </div>
                <div className="text-[13px] font-bold text-bd-ink2">
                  {kpi.label[lang]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Line Chart */}
      <section className="max-w-350 mx-auto px-10 mb-6">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-10">
            {s.chart_trend_title}
          </h3>
          <div className="h-60 relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke={sector.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={detail.trend
                  .map((val, i) => {
                    const x = (i / (detail.trend.length - 1)) * 100;
                    const y =
                      100 -
                      ((val - trendMin) / (trendMax - trendMin || 1)) * 100;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>
          <div className="flex justify-between mt-6 text-[11px] font-bold text-bd-ink3 px-2">
            {detail.trendPeriods.map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="max-w-350 mx-auto px-10 mb-6">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-10">
            {detail.breakdownTitle[lang]}
          </h3>
          <div className="flex flex-col gap-3">
            {detail.breakdownRows.map((row, i) => (
              <div key={i} className="flex items-center">
                <div className="w-20 text-left font-bold text-[12px] text-bd-ink2">
                  {row.label[lang]}
                </div>
                <div className="flex-1 flex justify-end pr-2">
                  <div
                    className="bg-bd-blue h-4"
                    style={{ width: `${row.a}%` }}
                  ></div>
                </div>
                <div className="flex-1 flex justify-start pl-2">
                  <div
                    className="bg-bd-gold h-4"
                    style={{ width: `${row.b}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 font-bold text-[11px] text-bd-ink2">
              <span className="w-3 h-3 bg-bd-blue"></span>{" "}
              {detail.breakdownLegendA[lang]}
            </div>
            <div className="flex items-center gap-2 font-bold text-[11px] text-bd-ink2">
              <span className="w-3 h-3 bg-bd-gold"></span>{" "}
              {detail.breakdownLegendB[lang]}
            </div>
          </div>
        </div>
      </section>

      {/* Cartogram Map */}
      <section className="max-w-350 mx-auto px-10 mb-6">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-6">
            {detail.kecamatanValueLabel[lang]} per Kecamatan
          </h3>
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-10 gap-2 w-full">
              {kecamatanRows.map((k) => (
                <div
                  key={k.name}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: scaleColor(
                      k.value,
                      kecamatanMin,
                      kecamatanMax
                    ),
                  }}
                  title={`${k.name}: ${k.value.toLocaleString("id")} ${
                    detail.kecamatanUnit
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="max-w-350 mx-auto px-10">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-6">
            {s.table_title}
          </h3>
          <div className="overflow-auto max-h-85 thin-scroll pr-2 -mr-2 border border-bd-border rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#F4F6F9] z-10">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider border-b border-bd-border">
                    {s.table_col_kec}
                  </th>
                  <th className="py-4 px-6 text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider border-b border-bd-border text-right">
                    {detail.kecamatanValueLabel[lang]} ({detail.kecamatanUnit})
                  </th>
                  <th className="py-4 px-6 text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider border-b border-bd-border text-right">
                    {s.table_col_share}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-bold text-bd-ink">
                {kecamatanRows.map((k) => (
                  <tr
                    key={k.name}
                    className="border-b border-bd-surface hover:bg-bd-surface transition-colors"
                  >
                    <td className="py-4 px-6">{k.name}</td>
                    <td className="py-4 px-6 text-right">
                      {k.value.toLocaleString("id")}
                    </td>
                    <td className="py-4 px-6 text-right">{k.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── Pendidikan — data asli dari backend/Supabase ─────────────────────────────

interface PendidikanSummary {
  tahun: number;
  semester: number;
  jumlahSekolah: number;
  jumlahSiswa: number;
  jumlahGuru: number;
  rataGuruPerSekolah: number;
  rataSiswaPerSekolah: number;
}

interface PendidikanApiData {
  summary: PendidikanSummary;
  trend: { tahun: number; jumlahSiswa: number }[];
  sekolahPerKecamatan: { kecamatan: string; status: string; jumlah: string }[];
  gender: { jenisKelamin: string; jumlahSiswa: string }[];
}

// Backend sesekali gagal koneksi ke Supabase (DNS flaky) dan membalas
// { error: "..." } alih-alih data — retry singkat + validasi shape sebelum dipakai.
async function fetchJsonArray(url: string, retries = 2): Promise<unknown[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !Array.isArray(json)) throw new Error("Response bukan array yang diharapkan.");
      return json;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 700));
    }
  }
  return [];
}

async function fetchJsonObject(url: string, retries = 2): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || typeof json !== "object" || json === null || Array.isArray(json)) {
        throw new Error("Response bukan object yang diharapkan.");
      }
      return json;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 700));
    }
  }
  return {};
}

function usePendidikanData() {
  const [data, setData] = useState<PendidikanApiData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summary, trend, sekolahPerKecamatan, gender] = await Promise.all([
          fetchJsonObject(`${API_BASE}/categories/pendidikan/summary`),
          fetchJsonArray(`${API_BASE}/categories/pendidikan/trend`),
          fetchJsonArray(`${API_BASE}/categories/pendidikan/sekolah-per-kecamatan`),
          fetchJsonArray(`${API_BASE}/categories/pendidikan/siswa-gender`),
        ]);
        if (!cancelled) {
          setData({
            summary: summary as unknown as PendidikanSummary,
            trend: trend as unknown as PendidikanApiData["trend"],
            sekolahPerKecamatan: sekolahPerKecamatan as unknown as PendidikanApiData["sekolahPerKecamatan"],
            gender: gender as unknown as PendidikanApiData["gender"],
          });
        }
      } catch {
        if (!cancelled)
          setError("Gagal memuat data dari server. Coba refresh halaman ini.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}

function PendidikanDetail({ sector }: { sector: Sector }) {
  const { lang } = useLang();
  const s = I18N[lang];
  const { data, error } = usePendidikanData();

  const kecamatanRows = useMemo(() => {
    if (!data) return [];
    const totals = new Map<string, number>();
    for (const row of data.sekolahPerKecamatan) {
      const key = normalizeKec(row.kecamatan);
      totals.set(key, (totals.get(key) ?? 0) + Number(row.jumlah));
    }
    const totalSekolah = data.summary.jumlahSekolah || 1;
    const rows = KECAMATAN_DATA.map((k) => {
      const value = totals.get(normalizeKec(k.name)) ?? 0;
      return {
        name: k.name,
        value,
        share: ((value / totalSekolah) * 100).toFixed(1),
      };
    });
    return rows.sort((a, b) => b.value - a.value);
  }, [data]);

  const breakdownRows = useMemo(() => {
    if (!data) return [];
    const byKec = new Map<string, { negeri: number; swasta: number }>();
    for (const row of data.sekolahPerKecamatan) {
      const key = row.kecamatan;
      const entry = byKec.get(key) ?? { negeri: 0, swasta: 0 };
      if (row.status === "NEGERI") entry.negeri += Number(row.jumlah);
      else entry.swasta += Number(row.jumlah);
      byKec.set(key, entry);
    }
    const rows = Array.from(byKec.entries()).map(([kecamatan, v]) => ({
      kecamatan,
      ...v,
      total: v.negeri + v.swasta,
    }));
    rows.sort((a, b) => b.total - a.total);
    const top = rows.slice(0, 8);
    const max = Math.max(...top.map((r) => Math.max(r.negeri, r.swasta)), 1);
    return top.map((r) => ({
      label: r.kecamatan.replace(/\b\w/g, (c) => c.toUpperCase()),
      a: (r.negeri / max) * 100,
      b: (r.swasta / max) * 100,
    }));
  }, [data]);

  const genderSplit = useMemo(() => {
    if (!data) return null;
    const laki = Number(
      data.gender.find((g) => g.jenisKelamin === "LAKI-LAKI")?.jumlahSiswa ?? 0
    );
    const perempuan = Number(
      data.gender.find((g) => g.jenisKelamin === "PEREMPUAN")?.jumlahSiswa ?? 0
    );
    const total = laki + perempuan || 1;
    return {
      laki,
      perempuan,
      lakiPct: (laki / total) * 100,
      perempuanPct: (perempuan / total) * 100,
    };
  }, [data]);

  if (error) {
    return (
      <main className="bg-bd-surface pb-24 pt-10">
        <div className="max-w-350 mx-auto px-10">
          <Breadcrumb lang={lang} sector={sector} />
          <div className="bg-white border border-bd-border rounded-2xl p-8 flex items-center justify-between gap-4">
            <span className="text-[14px] font-medium text-bd-ink2">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="bg-bd-blue text-white font-bold px-5 py-2.5 rounded-lg cursor-pointer hover:bg-bd-blue-dark transition-colors text-[13px] shrink-0"
            >
              {lang === "id" ? "Refresh Halaman" : "Refresh Page"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="bg-bd-surface pb-24 pt-10">
        <div className="max-w-350 mx-auto px-10">
          <Breadcrumb lang={lang} sector={sector} />
          <div className="bg-white border border-bd-border rounded-2xl p-8 text-[14px] font-medium text-bd-ink2">
            {lang === "id" ? "Memuat data…" : "Loading data…"}
          </div>
        </div>
      </main>
    );
  }

  const { summary, trend } = data;
  const trendValues = trend.map((t) => t.jumlahSiswa);
  const trendMin = Math.min(...trendValues);
  const trendMax = Math.max(...trendValues);
  const kecamatanMin = Math.min(...kecamatanRows.map((r) => r.value));
  const kecamatanMax = Math.max(...kecamatanRows.map((r) => r.value));

  const numberFmt = (n: number) =>
    Math.round(n).toLocaleString(lang === "id" ? "id" : "en");

  return (
    <main className="bg-bd-surface pb-24">
      {/* Page Header */}
      <section className="bg-white border-b border-bd-border pt-10 pb-8">
        <div className="max-w-350 mx-auto px-10">
          <Breadcrumb lang={lang} sector={sector} />

          <div className="flex justify-between items-start">
            <div className="flex gap-5 items-start">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-[15px]"
                style={{ backgroundColor: sector.tint, color: sector.color }}
              >
                {sector.code}
              </div>
              <div>
                <h1 className="text-[32px] font-extrabold text-bd-ink mb-2">
                  {sector.name[lang]}
                </h1>
                <p className="text-[15px] font-medium text-bd-ink2">
                  {sector.desc[lang]}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-[11px] font-bold text-bd-ink3">
                {s.detail_source}: Dinas Pendidikan Kota Bandung -{" "}
                {s.detail_updated}: {summary.tahun} / Sem. {summary.semester}
              </div>
              <button className="bg-white border border-bd-blue text-bd-blue font-bold px-6 py-2.5 rounded-lg cursor-pointer hover:bg-bd-blue hover:text-white transition-colors text-[13px] flex items-center gap-2">
                &darr; {s.detail_download}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="max-w-350 mx-auto px-10 pt-8 mb-8">
        <div className="bg-white border border-bd-border rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#F4F6F9] rounded-xl p-6">
              <div className="text-[26px] font-extrabold mb-1 text-bd-ink">
                {numberFmt(summary.jumlahSekolah)}
              </div>
              <div className="text-[13px] font-bold text-bd-ink2">
                {lang === "id" ? "Jumlah Sekolah SMP" : "Number of Schools"}
              </div>
            </div>
            <div className="bg-[#F4F6F9] rounded-xl p-6">
              <div className="text-[26px] font-extrabold mb-1 text-bd-ink">
                {numberFmt(summary.jumlahSiswa)}
              </div>
              <div className="text-[13px] font-bold text-bd-ink2">
                {lang === "id" ? "Jumlah Peserta Didik SMP" : "Number of Students"}
              </div>
            </div>
            <div className="bg-[#F4F6F9] rounded-xl p-6">
              <div className="text-[26px] font-extrabold mb-1 text-bd-ink">
                {numberFmt(summary.jumlahGuru)}
              </div>
              <div className="text-[13px] font-bold text-bd-ink2">
                {lang === "id" ? "Jumlah Guru SMP" : "Number of Teachers"}
              </div>
            </div>
            <div className="bg-[#F4F6F9] rounded-xl p-6">
              <div className="text-[26px] font-extrabold mb-1 text-bd-ink">
                {summary.rataGuruPerSekolah.toFixed(1)}
              </div>
              <div className="text-[13px] font-bold text-bd-ink2">
                {lang === "id" ? "Rata² Guru/Sekolah" : "Avg. Teachers/School"}
              </div>
            </div>
            <div className="bg-[#F4F6F9] rounded-xl p-6">
              <div className="text-[26px] font-extrabold mb-1 text-bd-ink">
                {summary.rataSiswaPerSekolah.toFixed(1)}
              </div>
              <div className="text-[13px] font-bold text-bd-ink2">
                {lang === "id" ? "Rata² Peserta Didik/Sekolah" : "Avg. Students/School"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Line Chart */}
      <section className="max-w-350 mx-auto px-10 mb-6">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-10">
            {lang === "id"
              ? "Tren Jumlah Peserta Didik SMP"
              : "Middle School Student Count Trend"}
          </h3>
          <div className="h-60 relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke={sector.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={trendValues
                  .map((val, i) => {
                    const x = (i / (trendValues.length - 1)) * 100;
                    const y =
                      100 -
                      ((val - trendMin) / (trendMax - trendMin || 1)) * 100;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>
          <div className="flex justify-between mt-6 text-[11px] font-bold text-bd-ink3 px-2">
            {trend.map((t) => (
              <span key={t.tahun}>{t.tahun}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="max-w-350 mx-auto px-10 mb-6">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-10">
            {lang === "id"
              ? "SMP Negeri vs Swasta per Kecamatan"
              : "Public vs Private Schools by District"}
          </h3>
          <div className="flex flex-col gap-3">
            {breakdownRows.map((row, i) => (
              <div key={i} className="flex items-center">
                <div className="w-28 text-left font-bold text-[11px] text-bd-ink2">
                  {row.label}
                </div>
                <div className="flex-1 flex justify-end pr-2">
                  <div
                    className="bg-bd-blue h-4"
                    style={{ width: `${row.a}%` }}
                  ></div>
                </div>
                <div className="flex-1 flex justify-start pl-2">
                  <div
                    className="bg-bd-gold h-4"
                    style={{ width: `${row.b}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 font-bold text-[11px] text-bd-ink2">
              <span className="w-3 h-3 bg-bd-blue"></span>{" "}
              {lang === "id" ? "Negeri" : "Public"}
            </div>
            <div className="flex items-center gap-2 font-bold text-[11px] text-bd-ink2">
              <span className="w-3 h-3 bg-bd-gold"></span>{" "}
              {lang === "id" ? "Swasta" : "Private"}
            </div>
          </div>
        </div>
      </section>

      {/* Gender Pie */}
      {genderSplit && (
        <section className="max-w-350 mx-auto px-10 mb-6">
          <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm flex items-center gap-10">
            <div
              className="w-32 h-32 rounded-full shrink-0"
              style={{
                background: `conic-gradient(#1F5AA8 0% ${genderSplit.lakiPct}%, #E8821E ${genderSplit.lakiPct}% 100%)`,
              }}
            ></div>
            <div>
              <h3 className="text-[17px] font-extrabold text-bd-ink mb-4">
                {lang === "id"
                  ? "Komposisi Peserta Didik SMP per Jenis Kelamin"
                  : "Middle School Student Gender Composition"}
              </h3>
              <div className="flex gap-8">
                <div className="flex items-center gap-2 font-bold text-[13px] text-bd-ink2">
                  <span className="w-3 h-3 bg-bd-blue"></span>{" "}
                  {lang === "id" ? "Laki-laki" : "Male"}:{" "}
                  {numberFmt(genderSplit.laki)} (
                  {genderSplit.lakiPct.toFixed(1)}%)
                </div>
                <div className="flex items-center gap-2 font-bold text-[13px] text-bd-ink2">
                  <span className="w-3 h-3 bg-bd-gold"></span>{" "}
                  {lang === "id" ? "Perempuan" : "Female"}:{" "}
                  {numberFmt(genderSplit.perempuan)} (
                  {genderSplit.perempuanPct.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cartogram Map */}
      <section className="max-w-350 mx-auto px-10 mb-6">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-6">
            {lang === "id"
              ? "Sebaran Jumlah Sekolah SMP per Kecamatan"
              : "Middle School Distribution by District"}
          </h3>
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-10 gap-2 w-full">
              {kecamatanRows.map((k) => (
                <div
                  key={k.name}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: scaleColor(
                      k.value,
                      kecamatanMin,
                      kecamatanMax
                    ),
                  }}
                  title={`${k.name}: ${k.value} sekolah`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="max-w-350 mx-auto px-10">
        <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
          <h3 className="text-[17px] font-extrabold text-bd-ink mb-6">
            {s.table_title}
          </h3>
          <div className="overflow-auto max-h-85 thin-scroll pr-2 -mr-2 border border-bd-border rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#F4F6F9] z-10">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider border-b border-bd-border">
                    {s.table_col_kec}
                  </th>
                  <th className="py-4 px-6 text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider border-b border-bd-border text-right">
                    {lang === "id" ? "Jumlah Sekolah" : "School Count"}
                  </th>
                  <th className="py-4 px-6 text-[11px] font-extrabold text-bd-ink3 uppercase tracking-wider border-b border-bd-border text-right">
                    {s.table_col_share}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-bold text-bd-ink">
                {kecamatanRows.map((k) => (
                  <tr
                    key={k.name}
                    className="border-b border-bd-surface hover:bg-bd-surface transition-colors"
                  >
                    <td className="py-4 px-6">{k.name}</td>
                    <td className="py-4 px-6 text-right">{k.value}</td>
                    <td className="py-4 px-6 text-right">{k.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
