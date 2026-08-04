"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { I18N } from "@/lib/placeholder-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const s = I18N;

export default function AjukanAksesPage() {

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/categories/api-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, institution, website, email, notes }),
      });
      if (!res.ok) throw new Error("failed");
      setSubmitted(true);
    } catch {
      setError(s.api_req_error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="pb-24 bg-white min-h-screen">
      <section className="pt-6">
        <div className="max-w-350 mx-auto px-8">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-bd-ink3 mb-4">
            <Link href="/" className="text-bd-ink3 hover:text-bd-blue">{s.breadcrumb_home}</Link>
            <span>/</span>
            <Link href="/data-api" className="text-bd-ink3 hover:text-bd-blue">{s.nav_api}</Link>
            <span>/</span>
            <span className="text-bd-ink">{s.api_req_h1}</span>
          </div>

          <h1 className="text-[30px] font-extrabold text-bd-ink mb-2.5">{s.api_req_h1}</h1>
          <p className="text-[15px] font-medium text-bd-ink2 max-w-xl mb-7 leading-relaxed">{s.api_req_sub}</p>
        </div>
      </section>

      <section className="max-w-350 mx-auto px-8">
        <div className="max-w-lg">
          {submitted ? (
            <div className="border border-bd-border rounded-2xl p-8">
              <div className="text-[16px] font-extrabold text-bd-ink mb-2">{s.api_req_success_title}</div>
              <p className="text-[13.5px] font-medium text-bd-ink2 leading-relaxed mb-6">{s.api_req_success_body}</p>
              <Link href="/data-api" className="text-bd-blue font-bold text-[13px] hover:underline">
                &larr; {s.api_req_back}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="border border-bd-border rounded-2xl p-8 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-bd-ink2 mb-1.5">{s.api_req_name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth: Andi Saputra"
                  required
                  className="w-full box-border border border-bd-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-bd-ink2 mb-1.5">{s.api_req_institution}</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="cth: Diskominfo Kota Bandung"
                  required
                  className="w-full box-border border border-bd-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-bd-ink2 mb-1.5">{s.api_req_website}</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="cth: https://bandung.go.id"
                  className="w-full box-border border border-bd-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-bd-ink2 mb-1.5">{s.api_req_email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cth: nama@instansi.go.id"
                  required
                  className="w-full box-border border border-bd-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-bd-ink2 mb-1.5">{s.api_req_notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="cth: Butuh akses data kependudukan untuk riset kampus."
                  rows={3}
                  className="w-full box-border border border-bd-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none resize-none"
                />
              </div>

              {error && <p className="text-[12px] font-semibold text-bd-red">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-bd-blue border-none text-white font-bold px-5 py-3 rounded-lg cursor-pointer text-[13.5px] disabled:opacity-60"
              >
                {submitting ? s.api_req_submitting : s.api_req_submit}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
