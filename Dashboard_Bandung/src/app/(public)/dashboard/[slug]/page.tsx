"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useRef } from "react";
import { SECTORS } from "@/lib/placeholder-data";
import { useSectors } from "@/lib/useSectors";
import { GenericSectorDetail } from "./GenericSectorDetail";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function DetailPage({ params }: Props) {
  const { slug } = use(params);
  const sectors = useSectors();
  const sector = sectors.find((sec) => sec.id === slug);

  // Sektor baru yang dibuat admin belum tentu ada di SECTORS statis (dipakai useSectors sebagai
  // fallback sementara data sungguhan masih di-fetch) — tunggu dulu, jangan langsung notFound(),
  // supaya deep-link ke sektor baru itu tidak salah dianggap 404.
  if (!sector) {
    if (sectors === SECTORS) return null;
    notFound();
  }

  // Catat 1 kunjungan nyata ke sektor ini (dipakai angka "dilihat" di halaman /topik).
  // Ref-guard supaya tidak dobel di React StrictMode (dev) yang me-mount efek 2x.
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    fetch(`${API_BASE}/categories/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return <GenericSectorDetail sector={sector} slug={slug} />;
}
