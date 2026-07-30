"use client";

import { useEffect, useState } from "react";
import { useSectors } from "@/lib/useSectors";
import type { Sector } from "@/types/dataset";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Sektor yang tampil di dashboard publik, sesuai visibilitas yang diatur admin
 * (lihat /eksekutif → "Visibilitas Sektor"). Kalau fetch gagal, tampilkan semua
 * sektor apa adanya supaya situs publik tidak ikut rusak karena masalah admin.
 */
export function useVisibleSectors(): Sector[] {
  const sectors = useSectors();
  const [visibleIds, setVisibleIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/categories/sector-visibility`)
      .then((r) => r.json())
      .then((rows: { sectorId: string; isVisible: boolean }[]) => {
        if (cancelled) return;
        setVisibleIds(new Set(rows.filter((r) => r.isVisible).map((r) => r.sectorId)));
      })
      .catch(() => {
        if (!cancelled) setVisibleIds(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visibleIds) return sectors;
  return sectors.filter((sec) => visibleIds.has(sec.id));
}
