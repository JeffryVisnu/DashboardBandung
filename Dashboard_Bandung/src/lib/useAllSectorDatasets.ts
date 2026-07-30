"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface SectorDataset {
  id: number;
  sectorId: string;
  title: string;
  slug: string;
  iframeUrl: string;
  width: number;
  height: number;
  views: number;
  sortOrder: number;
}

/**
 * Semua "Dashboard" (dataset/embed iframe) semua sektor sekaligus, dikelompokkan per
 * sectorId — dipakai kartu Dashboard Pilihan di beranda & /topik. Null saat masih memuat,
 * objek kosong kalau fetch gagal (kartu jadi tidak tampil, bukan dummy).
 */
export function useAllSectorDatasets(): Record<string, SectorDataset[]> | null {
  const [grouped, setGrouped] = useState<Record<string, SectorDataset[]> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/categories/sector-datasets`)
      .then((r) => r.json())
      .then((rows: unknown) => {
        if (cancelled) return;
        // Kalau backend lagi restart (dev) atau error, responsnya bukan array (mis. { error: "..." }).
        if (!Array.isArray(rows)) {
          setGrouped({});
          return;
        }
        const next: Record<string, SectorDataset[]> = {};
        for (const row of rows as SectorDataset[]) {
          (next[row.sectorId] ??= []).push(row);
        }
        setGrouped(next);
      })
      .catch(() => {
        if (!cancelled) setGrouped({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return grouped;
}
