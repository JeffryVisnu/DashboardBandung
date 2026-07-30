"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { I18N } from "@/lib/placeholder-data";
import type { Sector } from "@/types/dataset";

const s = I18N;

/** Breadcrumb Beranda / Topik & Sektor / <nama sektor> — dipakai semua halaman detail sektor. */
export function Breadcrumb({ sector }: { sector: Sector }) {
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
      <span className="text-bd-blue">{sector.name}</span>
    </div>
  );
}

/** Skala warna cartogram (biru muda → biru tua) berdasarkan posisi nilai di antara min/max. */
export function scaleColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  const t = (value - min) / range;
  if (t < 0.2) return "#DCEAFB";
  if (t < 0.4) return "#AECBEE";
  if (t < 0.6) return "#6FA0D8";
  if (t < 0.8) return "#3D74B8";
  return "#1F4E8C";
}

/** Placeholder visual untuk chart yang nanti diisi embed Tableau/Looker Studio — bukan chart asli. */
export function TableauPlaceholder({ title }: { title: string }) {
  return (
    <div className="bg-white border border-bd-border rounded-2xl p-8 shadow-sm">
      <h3 className="text-[17px] font-extrabold text-bd-ink mb-6">{title}</h3>
      <div className="h-72 rounded-xl border-2 border-dashed border-bd-border bg-bd-surface flex flex-col items-center justify-center gap-3">
        <span className="text-[28px]">📊</span>
        <span className="text-[13px] font-bold text-bd-ink3">
          Menunggu embed Tableau
        </span>
      </div>
    </div>
  );
}

/**
 * Embed chart sungguhan (Looker Studio / Flourish / dsb.) lewat iframe, tanpa card/judul
 * pembungkus — kontennya langsung dari report itu sendiri.
 *
 * Bukan di-scale pakai CSS transform (itu yang sempat bikin tooltip hover tampil tidak
 * proporsional) — atribut HTML `width`/`height` iframe di-set ulang mengikuti lebar container
 * sungguhan (lewat ResizeObserver), tinggi menyesuaikan rasio asli `width`/`height` yang
 * dikonfigurasi admin. Looker Studio/Flourish merender ulang layout chart-nya sesuai ukuran asli
 * iframe itu sendiri, jadi hasilnya proporsional dan mengisi lebar container di layar berapa pun.
 *
 * Catatan: laporan Looker Studio yang menyematkan visualisasi Community (mis. peta Flourish) di
 * dalamnya sendiri kadang menolak merender visualisasi itu ketika laporannya di-iframe di situs
 * lain (deteksi anti-nested-embedding dari pihak Data Studio/Flourish sendiri) — ini di luar
 * kendali kita (bukan soal atribut `sandbox` di sini). Solusinya: tambahkan peta Flourish itu
 * sebagai Dashboard terpisah pakai link embed Flourish-nya langsung, bukan mengandalkan peta itu
 * merender di dalam laporan Looker Studio yang di-iframe.
 */
export function ChartEmbed({ src, height = 2400, width = 1600 }: { src: string; height?: number; width?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(width);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setRenderWidth(el.offsetWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = renderWidth / width;
  const renderHeight = Math.round(height * scale);

  return (
    <div ref={containerRef} className="w-full rounded-2xl bg-white overflow-hidden">
      <iframe
        src={src}
        width={renderWidth}
        height={renderHeight}
        scrolling="no"
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{ border: 0, display: "block" }}
      />
    </div>
  );
}
