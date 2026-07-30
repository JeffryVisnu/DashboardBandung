"use client";

import Link from "next/link";
import { I18N } from "@/lib/placeholder-data";
import { useSectorDatasets } from "@/lib/useSectorDatasets";
import type { Sector } from "@/types/dataset";
import { Breadcrumb } from "./shared";

const s = I18N;

/** Ringkasan sektor — 1 kartu per "Dashboard" (mis. Data SMP, Data SD), masing-masing punya
 * halaman sendiri di /dashboard/[slug]/[dashboardId]. Isi kartunya sepenuhnya dari data yang
 * ditambahkan admin lewat /eksekutif, tidak ada lagi yang hardcode. */
export function GenericSectorDetail({ sector, slug }: { sector: Sector; slug: string }) {
  const datasets = useSectorDatasets(slug);

  return (
    <main className="bg-bd-surface pb-24">
      {/* Page Header */}
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
              <h1 className="text-[32px] font-extrabold text-bd-ink mb-2">{sector.name}</h1>
              <p className="text-[15px] font-medium text-bd-ink2">{sector.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 1 kartu per Dashboard */}
      <section className="max-w-350 mx-auto px-10 pt-8">
        {datasets === null && (
          <div className="bg-white border border-bd-border rounded-2xl p-10 text-center text-[13px] font-bold text-bd-ink3">
            {s.dataset_loading}
          </div>
        )}

        {datasets !== null && datasets.length === 0 && (
          <div className="bg-white border border-bd-border rounded-2xl p-10 text-center text-[13px] font-bold text-bd-ink3">
            {s.dataset_empty}
          </div>
        )}

        {datasets !== null && datasets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {datasets.map((dataset) => (
              <Link
                key={dataset.id}
                href={`/dashboard/${slug}/${dataset.slug}`}
                className="bg-white border border-bd-border rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:shadow-lg hover:border-bd-blue/30 transition-all"
              >
                <div
                  className="h-24 flex items-center justify-center text-[22px] font-extrabold"
                  style={{ backgroundColor: sector.tint, color: sector.color }}
                >
                  {sector.code}
                </div>
                <div className="p-5">
                  <h3 className="text-[14px] font-extrabold text-bd-ink leading-snug">{dataset.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
