"use client";

import { useEffect, useState } from "react";
import { SECTORS } from "@/lib/placeholder-data";
import type { Sector } from "@/types/dataset";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface SectorRow {
  id: string;
  code: string;
  name: string;
  desc: string;
  color: string;
  tint: string;
  sortOrder: number;
}

const DEFAULT_EXTRAS = {
  stat: "",
  cluster: "sosial" as const,
  spark: [50, 55, 52, 58, 60, 62, 65],
  statusLabel: "Data Tersedia",
  statusColor: "#1D8348",
  statusBg: "#E7F6ED",
};

function toSector(row: SectorRow): Sector {
  const fallback = SECTORS.find((sec) => sec.id === row.id);
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    desc: row.desc,
    color: row.color,
    tint: row.tint,
    stat: fallback?.stat ?? DEFAULT_EXTRAS.stat,
    cluster: fallback?.cluster ?? DEFAULT_EXTRAS.cluster,
    spark: fallback?.spark ?? DEFAULT_EXTRAS.spark,
    statusLabel: fallback?.statusLabel ?? DEFAULT_EXTRAS.statusLabel,
    statusColor: fallback?.statusColor ?? DEFAULT_EXTRAS.statusColor,
    statusBg: fallback?.statusBg ?? DEFAULT_EXTRAS.statusBg,
  };
}

/**
 * Daftar sektor dikelola admin lewat /eksekutif (nama, deskripsi, kode, warna) — menggantikan
 * SECTORS statis. Kalau fetch gagal, tampilkan SECTORS statis apa adanya supaya situs publik
 * tidak ikut rusak karena masalah admin/backend (pola sama seperti useVisibleSectors).
 */
export function useSectors(): Sector[] {
  const [rows, setRows] = useState<SectorRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/categories/sectors`)
      .then((r) => r.json())
      .then((data: unknown) => {
        // Kalau backend lagi restart (dev) atau error, responsnya bukan array (mis. { error: "..." }).
        if (!cancelled) setRows(Array.isArray(data) ? data : null);
      })
      .catch(() => {
        if (!cancelled) setRows(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!rows) return SECTORS;
  return rows.map(toSector);
}
