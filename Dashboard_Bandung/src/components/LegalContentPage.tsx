"use client";

import Link from "next/link";
import { I18N } from "@/lib/placeholder-data";

const s = I18N;

/** Halaman teks hukum (Ketentuan Pengguna, Kebijakan Privasi) — isinya HTML dari WYSIWYG editor
 * admin di /eksekutif, ditampilkan apa adanya lewat kelas `.legal-content` di globals.css. */
export function LegalContentPage({ breadcrumbLabel, heading, html }: { breadcrumbLabel: string; heading: string; html: string }) {
  return (
    <main className="pb-24 bg-white min-h-screen">
      <section className="pt-6">
        <div className="max-w-250 mx-auto px-8">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-bd-ink3 mb-6">
            <Link href="/" className="text-bd-ink3 hover:text-bd-blue">{s.breadcrumb_home}</Link>
            <span>/</span>
            <span className="text-bd-ink">{breadcrumbLabel}</span>
          </div>

          <h1 className="text-[28px] font-extrabold text-bd-ink mb-8 tracking-tight">{heading}</h1>

          {html.trim() === "" ? (
            <p className="text-[14px] font-medium text-bd-ink3">Konten belum diisi admin.</p>
          ) : (
            <div className="legal-content" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </section>
    </main>
  );
}
