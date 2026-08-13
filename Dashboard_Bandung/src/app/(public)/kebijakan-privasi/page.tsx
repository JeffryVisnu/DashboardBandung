"use client";

import { I18N } from "@/lib/placeholder-data";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { LegalContentPage } from "@/components/LegalContentPage";

export default function KebijakanPrivasiPage() {
  const site = useSiteSettings();
  return <LegalContentPage breadcrumbLabel={I18N.footer_privacy_title} heading={I18N.legal_privacy_h1} html={site.kebijakanPrivasi} />;
}
