"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { I18N, SECTORS, DINAS_BUDGET, EXEC_ALERTS, KECAMATAN_SKOR } from "@/lib/placeholder-data";
import { useLang } from "@/lib/lang-context";

export default function EksekutifPage() {
  const { lang } = useLang();
  const s = I18N[lang];

  const [execUnlocked, setExecUnlocked] = useState(false);
  const [execEmail, setExecEmail] = useState("");
  const [execPassword, setExecPassword] = useState("");

  const submitExecLogin = (e: FormEvent) => {
    e.preventDefault();
    setExecUnlocked(true);
  };

  const execLogout = () => {
    setExecUnlocked(false);
    setExecEmail("");
    setExecPassword("");
  };

  return (
    <main className="min-h-screen bg-bd-ink text-white">
      {/* Thin badge bar */}
      <div className="bg-[#08192F] px-8 py-2.5 flex items-center justify-between border-b border-white/10">
        <span className="font-bold text-[11px] text-bd-gold">&#128274; {s.exec_badge}</span>
        {execUnlocked && (
          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <div className="font-bold text-[12.5px] text-white">{s.exec_welcome}, Admin</div>
              <div className="font-medium text-[11px] text-white/50">{s.exec_role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-bd-gold flex items-center justify-center font-extrabold text-[13px] text-bd-ink flex-shrink-0">A</div>
            <button onClick={execLogout} className="bg-transparent border-[1.5px] border-white/25 text-white font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-[12px]">
              {s.exec_logout}
            </button>
          </div>
        )}
      </div>

      {!execUnlocked ? (
        /* Login gate */
        <div className="flex justify-center py-[70px] px-8">
          <div className="w-[400px]">
            <Link href="/" className="block mb-6 text-[11px] font-bold text-white/50 uppercase tracking-wider hover:text-white">
              &larr; {s.breadcrumb_home}
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-extrabold text-white mb-1.5">{s.exec_login_title}</h1>
              <p className="text-[13px] font-medium text-white/55 leading-relaxed">{s.exec_login_sub}</p>
            </div>

            <form onSubmit={submitExecLogin} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-4">
              <div className="mb-4">
                <label className="block text-[11.5px] font-semibold text-white/65 mb-1.5">{s.exec_email_label}</label>
                <input
                  type="text"
                  value={execEmail}
                  onChange={(e) => setExecEmail(e.target.value)}
                  className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3.5 py-2.5 text-[13px] text-white outline-none"
                  required
                />
              </div>
              <div className="mb-3.5">
                <label className="block text-[11.5px] font-semibold text-white/65 mb-1.5">{s.exec_password_label}</label>
                <input
                  type="password"
                  value={execPassword}
                  onChange={(e) => setExecPassword(e.target.value)}
                  className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3.5 py-2.5 text-[13px] text-white outline-none"
                  required
                />
              </div>

              <button type="submit" className="w-full mt-1.5 bg-bd-gold border-none text-bd-ink font-bold py-3.5 rounded-lg cursor-pointer text-[13.5px]">
                {s.exec_login_btn}
              </button>
              <button type="button" onClick={() => setExecUnlocked(true)} className="w-full mt-2.5 bg-transparent border-[1.5px] border-white/25 text-white font-bold py-3 rounded-lg cursor-pointer text-[13px]">
                {s.exec_demo_btn}
              </button>
            </form>

            <p className="text-center text-[11.5px] text-white/40 font-medium">{s.exec_contact}</p>
          </div>
        </div>
      ) : (
        /* Overview */
        <div className="p-8">
          <div className="text-[21px] font-extrabold text-white mb-4.5">{s.exec_overview_title}</div>

          {/* Sector KPI grid */}
          <div className="grid grid-cols-4 gap-3.5 mb-6">
            {SECTORS.map((sec) => (
              <div key={sec.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center gap-1.5 mb-2.5">
                  <span className="font-bold text-[10.5px] text-white/50">{sec.name[lang]}</span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.statusColor }}></span>
                </div>
                <div className="font-extrabold text-[19px] text-white mb-1">{sec.stat[lang]}</div>
                <div className="font-bold text-[10.5px]" style={{ color: sec.statusColor }}>{sec.statusLabel[lang]}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 mb-5">
            {/* Budget realization */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5.5">
              <div className="font-bold text-[15px] text-white mb-4.5">{s.exec_budget_title}</div>
              <div className="flex flex-col gap-3.5">
                {DINAS_BUDGET.map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-semibold text-[12px] text-white/80">{d.name[lang]}</span>
                      <span className="font-bold text-[12px] text-white">{d.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-bd-gold" style={{ width: `${d.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5.5">
              <div className="font-bold text-[15px] text-white mb-4">{s.exec_alerts_title}</div>
              <div className="flex flex-col gap-3">
                {EXEC_ALERTS.map((alert, i) => (
                  <div key={i} className="p-4 rounded-lg flex gap-2.5" style={{ backgroundColor: alert.bg }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[11px] flex-shrink-0" style={{ backgroundColor: alert.color, color: "white" }}>
                      {alert.mark}
                    </div>
                    <p className="text-[12px] font-medium leading-relaxed" style={{ color: alert.color }}>
                      {alert.text[lang]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kecamatan score */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5.5 mb-6">
            <div className="font-bold text-[15px] text-white mb-4">{s.exec_score_title}</div>
            <div className="grid grid-cols-4 gap-3">
              {KECAMATAN_SKOR.map((k, i) => (
                <div key={i} className="bg-black/[.04] rounded-lg p-3">
                  <div className="font-semibold text-[11.5px] text-white/65 mb-1">{k.name}</div>
                  <div className="font-extrabold text-[18px] text-white">{k.skor}</div>
                </div>
              ))}
            </div>
          </div>

          <a href="#" className="inline-flex items-center gap-2 font-bold text-[13px] bg-bd-gold text-bd-ink px-6 py-3 rounded-lg no-underline">
            &darr; {s.exec_export_btn}
          </a>
        </div>
      )}

      {/* Minimal exec footer */}
      <div className="px-8 py-4.5 border-t border-white/[.08] flex justify-between font-medium text-[11px] text-white/40">
        <span>{s.footer_rights}</span>
        <span>{s.exec_badge}</span>
      </div>
    </main>
  );
}
