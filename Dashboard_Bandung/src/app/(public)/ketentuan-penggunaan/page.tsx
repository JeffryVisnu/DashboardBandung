"use client";

import { I18N } from "@/lib/placeholder-data";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { LegalContentPage } from "@/components/LegalContentPage";

export default function KetentuanPenggunaanPage() {
  const site = useSiteSettings();
  return <LegalContentPage breadcrumbLabel={I18N.footer_terms_title} heading={I18N.legal_terms_h1} html={site.ketentuanPenggunaan} />;
}
