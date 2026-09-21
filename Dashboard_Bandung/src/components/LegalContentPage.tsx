"use client";

import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { I18N } from "@/lib/placeholder-data";

const s = I18N;

/** Halaman teks hukum (Ketentuan Pengguna, Kebijakan Privasi) — isinya HTML dari WYSIWYG editor
 * admin di /eksekutif, ditampilkan lewat kelas `.legal-content` di globals.css.
 *
 * Backend sudah membersihkan HTML ini sebelum disimpan, tapi disanitasi ULANG di sini sebagai
 * lapis pertahanan kedua — kalau backend lupa disanitasi (bug/regresi/sumber data lain di masa
 * depan), pengunjung publik tetap tidak kena XSS hanya karena satu lapis pertahanan gagal. */
export function LegalContentPage({ breadcrumbLabel, heading, html }: { breadcrumbLabel: string; heading: string; html: string }) {
  const safeHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "blockquote", "hr", "code", "pre"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
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

          {safeHtml.trim() === "" ? (
            <p className="text-[14px] font-medium text-bd-ink3">Konten belum diisi admin.</p>
          ) : (
            <div className="legal-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />
          )}
        </div>
      </section>
    </main>
  );
}
