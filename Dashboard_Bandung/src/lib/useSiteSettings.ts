"use client";

import { useEffect, useState } from "react";
import { I18N } from "@/lib/placeholder-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export interface SiteSettings {
  logoPath: string | null;
  heroEyebrow: string;
  heroTitle: string;
  heroSub: string;
  kpiPop: { label: string; value: string };
  kpiArea: { label: string; value: string };
  kpiKec: { label: string; value: string };
  kpiKel: { label: string; value: string };
}

const FALLBACK: SiteSettings = {
  logoPath: "/assets/logo-diskominfo.jpg",
  heroEyebrow: I18N.hero_eyebrow,
  heroTitle: I18N.hero_title,
  heroSub: I18N.hero_sub,
  kpiPop: { label: I18N.kpi_pop, value: I18N.kpi_pop_val },
  kpiArea: { label: I18N.kpi_area, value: I18N.kpi_area_val },
  kpiKec: { label: I18N.kpi_kec, value: I18N.kpi_kec_val },
  kpiKel: { label: I18N.kpi_kel, value: I18N.kpi_kel_val },
};

/** Resolusi path logo relatif (mis. "/uploads/logo-xxx.jpg") jadi URL absolut ke backend. */
export function resolveLogoSrc(logoPath: string | null): string {
  if (!logoPath) return FALLBACK.logoPath!;
  if (logoPath.startsWith("http")) return logoPath;
  if (logoPath.startsWith("/uploads")) return `${BACKEND_ORIGIN}${logoPath}`;
  return logoPath;
}

/**
 * Pengaturan situs (logo, teks hero, statistik homepage) dikelola admin lewat /eksekutif.
 * Kalau fetch gagal, tampilkan teks bawaan supaya situs publik tidak ikut rusak.
 */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/categories/site-settings`)
      .then((r) => r.json())
      .then((data: SiteSettings) => {
        if (!cancelled && data?.heroTitle) setSettings(data);
      })
      .catch(() => {
        // Fetch gagal — biarkan FALLBACK tetap dipakai.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
