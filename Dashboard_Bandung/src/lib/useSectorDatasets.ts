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
 * Dataset (embed iframe Looker Studio/dsb.) milik 1 sektor, dikelola admin lewat /eksekutif.
 * Null saat masih memuat, array kosong kalau sektor belum punya dataset atau fetch gagal.
 */
export function useSectorDatasets(sectorId: string): SectorDataset[] | null {
  const [datasets, setDatasets] = useState<SectorDataset[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDatasets(null);

    fetch(`${API_BASE}/categories/sectors/${sectorId}/datasets`)
      .then((r) => r.json())
      .then((data: unknown) => {
        // Kalau backend lagi restart (dev) atau error, responsnya bukan array (mis. { error: "..." })
        // — anggap gagal daripada crash di pemanggil yang mengasumsikan array.
        if (!cancelled) setDatasets(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setDatasets([]);
      });

    return () => {
      cancelled = true;
    };
  }, [sectorId]);

  return datasets;
}
