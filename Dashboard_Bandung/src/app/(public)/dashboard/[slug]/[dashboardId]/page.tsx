"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useRef } from "react";
import { SECTORS } from "@/lib/placeholder-data";
import { useSectors } from "@/lib/useSectors";
import { useSectorDatasets } from "@/lib/useSectorDatasets";
import { Breadcrumb, ChartEmbed } from "../shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Props {
  params: Promise<{ slug: string; dashboardId: string }>;
}

/** Halaman 1 dashboard tunggal (mis. "Data SMP" saja) — tiap dashboard di sebuah sektor
 * punya halaman & kartunya sendiri, tidak digabung/ditumpuk dengan dashboard lain. */
export default function DashboardDetailPage({ params }: Props) {
  const { slug, dashboardId } = use(params);
  const sectors = useSectors();
  const sector = sectors.find((sec) => sec.id === slug);
  const datasets = useSectorDatasets(slug);
  // dashboardId di URL sekarang adalah slug (judul), bukan lagi angka id — konsisten dengan
  // endpoint publik /v1/:sectorId/:dashboardSlug.
  const dataset = datasets?.find((d) => d.slug === dashboardId);

  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    fetch(`${API_BASE}/categories/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  // Kunjungan per-dashboard (bukan cuma per-sektor) — dipakai angka "dilihat" di kartu /topik &
  // beranda. Tunggu dataset ketemu dulu (perlu id numeriknya, bukan slug) sebelum mengirim.
  const datasetCounted = useRef(false);
  useEffect(() => {
    if (datasetCounted.current || !dataset) return;
    datasetCounted.current = true;
    fetch(`${API_BASE}/categories/datasets/${dataset.id}/view`, { method: "POST" }).catch(() => {});
  }, [dataset]);

  // Sektor/daftar dataset masih fallback/loading — tunggu dulu sebelum memvonis 404.
  if (!sector) {
    if (sectors === SECTORS) return null;
    notFound();
  }
  if (datasets === null) return null;
  if (!dataset) notFound();

  return (
    <main className="bg-bd-surface pb-24">
      <section className="bg-white border-b border-bd-border pt-10 pb-8">
        <div className="max-w-350 mx-auto px-10">
          <Breadcrumb sector={sector} />

          <div className="flex gap-5 items-start">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-[15px]"
              style={{ backgroundColor: sector.tint, color: sector.color }}
            >
              {sector.code}
            </div>
            <div>
              <h1 className="text-[32px] font-extrabold text-bd-ink mb-2">{dataset.title}</h1>
              <p className="text-[15px] font-medium text-bd-ink2">{sector.name}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-350 mx-auto px-10 pt-8">
        <ChartEmbed src={dataset.iframeUrl} width={dataset.width} height={dataset.height} />
      </section>
    </main>
  );
}
