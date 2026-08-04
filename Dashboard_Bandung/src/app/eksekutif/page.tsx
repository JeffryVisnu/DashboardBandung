"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { I18N } from "@/lib/placeholder-data";
import { resolveLogoSrc, type SiteSettings } from "@/lib/useSiteSettings";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_STORAGE_KEY = "bd_admin_token";

interface ApiKeyRow {
  id: number;
  key: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

interface SectorVisibilityRow {
  sectorId: string;
  isVisible: boolean;
  updatedAt: string;
}

interface SectorRow {
  id: string;
  code: string;
  name: string;
  desc: string;
  color: string;
  tint: string;
  sortOrder: number;
}

interface SectorDatasetRow {
  id: number;
  sectorId: string;
  title: string;
  iframeUrl: string;
  width: number;
  height: number;
  sortOrder: number;
}

interface ApiRequestRow {
  id: number;
  name: string;
  institution: string;
  website: string | null;
  email: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

const EMPTY_SECTOR_FORM = { id: "", code: "", name: "", desc: "", color: "#1F5AA8", tint: "#E8F0FA" };
const EMPTY_DATASET_FORM = { title: "", iframeUrl: "", width: "1600", height: "2400" };

type AdminTab = "situs" | "sektor" | "api";

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "situs", label: "Pengaturan Situs" },
  { id: "sektor", label: "Sektor & Dashboard" },
  { id: "api", label: "Permintaan API & Aplikasi Eksternal" },
];

/** Label di atas field, dipakai semua form admin supaya konsisten. */
function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-semibold text-white/60 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function EksekutifPage() {
  const s = I18N;

  const [activeTab, setActiveTab] = useState<AdminTab>("situs");
  const [token, setToken] = useState<string | null>(null);
  const [checkingStoredToken, setCheckingStoredToken] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKeyRow[] | null>(null);
  const [sectorVisibility, setSectorVisibility] = useState<SectorVisibilityRow[] | null>(null);

  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Pengaturan Situs
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [siteForm, setSiteForm] = useState<Record<string, string> | null>(null);
  const [savingSite, setSavingSite] = useState(false);
  const [siteSaved, setSiteSaved] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Sektor & Dataset
  const [sectorList, setSectorList] = useState<SectorRow[] | null>(null);
  const [sectorForm, setSectorForm] = useState(EMPTY_SECTOR_FORM);
  const [creatingSector, setCreatingSector] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [sectorDatasets, setSectorDatasets] = useState<SectorDatasetRow[] | null>(null);
  const [datasetForm, setDatasetForm] = useState(EMPTY_DATASET_FORM);
  const [creatingDataset, setCreatingDataset] = useState(false);
  const [editingDatasetId, setEditingDatasetId] = useState<number | null>(null);
  const [editDatasetForm, setEditDatasetForm] = useState(EMPTY_DATASET_FORM);
  const [savingDatasetEdit, setSavingDatasetEdit] = useState(false);

  // Permintaan API
  const [apiRequests, setApiRequests] = useState<ApiRequestRow[] | null>(null);

  // API Keys — pencarian per label + pagination 10/halaman
  const [apiKeySearch, setApiKeySearch] = useState("");
  const [apiKeyPage, setApiKeyPage] = useState(1);
  const API_KEY_PAGE_SIZE = 10;

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) setToken(stored);
    setCheckingStoredToken(false);
  }, []);

  async function authedFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      logout();
      throw new Error("Sesi admin berakhir, silakan login lagi.");
    }
    if (res.status === 204) return null;
    return res.json();
  }

  async function loadAll() {
    const [keys, visibility, settings, sectorRows, requests] = await Promise.all([
      authedFetch("/admin/api-keys"),
      authedFetch("/admin/sector-visibility"),
      fetch(`${API_BASE}/categories/site-settings`).then((r) => r.json()),
      fetch(`${API_BASE}/categories/sectors`).then((r) => r.json()),
      authedFetch("/admin/api-requests"),
    ]);
    setApiKeys(keys);
    setSectorVisibility(visibility);
    setSiteSettings(settings);
    setSectorList(sectorRows);
    setApiRequests(requests);
  }

  async function loadSectorDatasets(sectorId: string) {
    const rows: SectorDatasetRow[] = await fetch(`${API_BASE}/categories/sectors/${sectorId}/datasets`).then((r) => r.json());
    setSectorDatasets(rows);
  }

  useEffect(() => {
    if (token) loadAll().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!siteSettings) return;
    setSiteForm({
      heroEyebrow: siteSettings.heroEyebrow,
      heroTitle: siteSettings.heroTitle,
      heroSub: siteSettings.heroSub,
      kpiPopLabel: siteSettings.kpiPop.label,
      kpiPopVal: siteSettings.kpiPop.value,
      kpiAreaLabel: siteSettings.kpiArea.label,
      kpiAreaVal: siteSettings.kpiArea.value,
      kpiKecLabel: siteSettings.kpiKec.label,
      kpiKecVal: siteSettings.kpiKec.value,
      kpiKelLabel: siteSettings.kpiKel.label,
      kpiKelVal: siteSettings.kpiKel.value,
    });
  }, [siteSettings]);

  async function submitLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLoginError(s.admin_login_error);
        return;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, json.token);
      setToken(json.token);
    } catch {
      setLoginError(s.admin_login_error);
    } finally {
      setLoggingIn(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setApiKeys(null);
    setSectorVisibility(null);
    setSiteSettings(null);
    setSiteForm(null);
    setSectorList(null);
    setSectorDatasets(null);
    setSelectedSectorId(null);
    setApiRequests(null);
  }

  async function saveSiteSettings(e: FormEvent) {
    e.preventDefault();
    if (!siteForm) return;
    setSavingSite(true);
    setSiteSaved(false);
    try {
      const updated = await authedFetch("/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteForm),
      });
      setSiteSettings(updated);
      setSiteSaved(true);
      setTimeout(() => setSiteSaved(false), 2500);
    } finally {
      setSavingSite(false);
    }
  }

  async function uploadLogo() {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const res = await fetch(`${API_BASE}/admin/site-settings/logo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const updated = await res.json();
      setSiteSettings(updated);
      setLogoFile(null);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function createSector(e: FormEvent) {
    e.preventDefault();
    setCreatingSector(true);
    try {
      await authedFetch("/admin/sectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectorForm),
      });
      setSectorForm(EMPTY_SECTOR_FORM);
      const sectorRows = await fetch(`${API_BASE}/categories/sectors`).then((r) => r.json());
      setSectorList(sectorRows);
      const visibility = await authedFetch("/admin/sector-visibility");
      setSectorVisibility(visibility);
    } finally {
      setCreatingSector(false);
    }
  }

  async function deleteSector(row: SectorRow) {
    if (!window.confirm(`Hapus sektor "${row.name}"? Semua dashboard di dalamnya ikut terhapus.`)) return;

    await authedFetch(`/admin/sectors/${row.id}`, { method: "DELETE" });
    setSectorList((prev) => prev!.filter((r) => r.id !== row.id));
    setSectorVisibility((prev) => prev?.filter((r) => r.sectorId !== row.id) ?? prev);
    if (selectedSectorId === row.id) {
      setSelectedSectorId(null);
      setSectorDatasets(null);
    }
  }

  async function selectSectorForDatasets(sectorId: string) {
    setSelectedSectorId(sectorId);
    setDatasetForm(EMPTY_DATASET_FORM);
    cancelEditDataset();
    await loadSectorDatasets(sectorId);
  }

  async function createDataset(e: FormEvent) {
    e.preventDefault();
    if (!selectedSectorId) return;
    setCreatingDataset(true);
    try {
      await authedFetch(`/admin/sectors/${selectedSectorId}/datasets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...datasetForm,
          width: Number(datasetForm.width) || undefined,
          height: Number(datasetForm.height) || undefined,
        }),
      });
      setDatasetForm(EMPTY_DATASET_FORM);
      await loadSectorDatasets(selectedSectorId);
    } finally {
      setCreatingDataset(false);
    }
  }

  async function deleteDataset(row: SectorDatasetRow) {
    if (!window.confirm("Hapus dashboard ini?")) return;
    await authedFetch(`/admin/datasets/${row.id}`, { method: "DELETE" });
    setSectorDatasets((prev) => prev!.filter((r) => r.id !== row.id));
  }

  function startEditDataset(row: SectorDatasetRow) {
    setEditingDatasetId(row.id);
    setEditDatasetForm({ title: row.title, iframeUrl: row.iframeUrl, width: String(row.width), height: String(row.height) });
  }

  function cancelEditDataset() {
    setEditingDatasetId(null);
    setEditDatasetForm(EMPTY_DATASET_FORM);
  }

  async function saveEditDataset(e: FormEvent) {
    e.preventDefault();
    if (editingDatasetId === null) return;
    setSavingDatasetEdit(true);
    try {
      const updated = await authedFetch(`/admin/datasets/${editingDatasetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editDatasetForm,
          width: Number(editDatasetForm.width) || undefined,
          height: Number(editDatasetForm.height) || undefined,
        }),
      });
      setSectorDatasets((prev) => prev!.map((r) => (r.id === editingDatasetId ? updated : r)));
      cancelEditDataset();
    } finally {
      setSavingDatasetEdit(false);
    }
  }

  async function updateApiRequestStatus(row: ApiRequestRow, status: string) {
    const updated = await authedFetch(`/admin/api-requests/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setApiRequests((prev) => prev!.map((r) => (r.id === row.id ? updated : r)));
  }

  async function toggleApiKey(row: ApiKeyRow) {
    const updated = await authedFetch(`/admin/api-keys/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    setApiKeys((prev) => prev!.map((r) => (r.id === row.id ? updated : r)));
  }

  async function createApiKey(e: FormEvent) {
    e.preventDefault();
    setCreatingKey(true);
    try {
      const created = await authedFetch("/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newKeyLabel.trim() || "unnamed-app" }),
      });
      setJustCreatedKey(created.key);
      setNewKeyLabel("");
      await loadAll();
    } finally {
      setCreatingKey(false);
    }
  }

  function copyJustCreatedKey() {
    if (!justCreatedKey) return;
    navigator.clipboard.writeText(justCreatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteApiKey(row: ApiKeyRow) {
    if (!window.confirm(`Hapus permanen API key "${row.label}"? Aksi ini tidak bisa dibatalkan.`)) return;

    await authedFetch(`/admin/api-keys/${row.id}`, { method: "DELETE" });
    setApiKeys((prev) => prev!.filter((r) => r.id !== row.id));
  }

  async function toggleSectorVisibility(row: SectorVisibilityRow) {
    const updated = await authedFetch(`/admin/sector-visibility/${row.sectorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !row.isVisible }),
    });
    setSectorVisibility((prev) => prev!.map((r) => (r.sectorId === row.sectorId ? updated : r)));
  }

  const dateFmt = (d: string | null) =>
    d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : s.admin_never_used;

  const filteredApiKeys = useMemo(() => {
    const q = apiKeySearch.trim().toLowerCase();
    const all = apiKeys ?? [];
    return q === "" ? all : all.filter((row) => row.label.toLowerCase().includes(q));
  }, [apiKeys, apiKeySearch]);

  const apiKeyTotalPages = Math.max(1, Math.ceil(filteredApiKeys.length / API_KEY_PAGE_SIZE));
  const apiKeyPageSafe = Math.min(apiKeyPage, apiKeyTotalPages);
  const pagedApiKeys = filteredApiKeys.slice(
    (apiKeyPageSafe - 1) * API_KEY_PAGE_SIZE,
    apiKeyPageSafe * API_KEY_PAGE_SIZE
  );

  return (
    <main className="min-h-screen bg-bd-ink text-white">
      {/* Thin badge bar */}
      <div className="bg-[#08192F] px-4 md:px-8 py-2.5 flex items-center justify-between gap-3 border-b border-white/10">
        <span className="font-bold text-[10.5px] md:text-[11px] text-bd-gold shrink-0">&#128274; {s.exec_badge}</span>
        {token && (
          <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-[12.5px] text-white">{s.exec_welcome}, Admin</div>
              <div className="font-medium text-[11px] text-white/50">{s.exec_role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-bd-gold flex items-center justify-center font-extrabold text-[13px] text-bd-ink shrink-0">A</div>
            <button onClick={logout} className="bg-transparent border-[1.5px] border-white/25 text-white font-bold px-3 md:px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-[11.5px] md:text-[12px] shrink-0 whitespace-nowrap">
              {s.exec_logout}
            </button>
          </div>
        )}
      </div>

      {checkingStoredToken ? null : !token ? (
        /* Login gate */
        <div className="flex justify-center py-17.5 px-8">
          <div className="w-100">
            <Link href="/" className="block mb-6 text-[11px] font-bold text-white/50 uppercase tracking-wider hover:text-white">
              &larr; {s.breadcrumb_home}
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-extrabold text-white mb-1.5">{s.exec_login_title}</h1>
              <p className="text-[13px] font-medium text-white/55 leading-relaxed">{s.exec_login_sub}</p>
            </div>

            <form onSubmit={submitLogin} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-4">
              <div className="mb-4">
                <label className="block text-[11.5px] font-semibold text-white/65 mb-1.5">{s.exec_email_label}</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="cth: admin@bandung.go.id"
                  className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3.5 py-2.5 text-[13px] text-white outline-none"
                  required
                />
              </div>
              <div className="mb-3.5">
                <label className="block text-[11.5px] font-semibold text-white/65 mb-1.5">{s.exec_password_label}</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3.5 py-2.5 text-[13px] text-white outline-none"
                  required
                />
              </div>

              {loginError && <p className="text-[12px] font-semibold text-bd-red mb-3">{loginError}</p>}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full mt-1.5 bg-bd-gold border-none text-bd-ink font-bold py-3.5 rounded-lg cursor-pointer text-[13.5px] disabled:opacity-60"
              >
                {loggingIn ? "…" : s.exec_login_btn}
              </button>
            </form>

            <p className="text-center text-[11.5px] text-white/40 font-medium">{s.exec_contact}</p>
          </div>
        </div>
      ) : (
        /* Admin panel */
        <div className="p-4 md:p-8">
          <div className="text-[18px] md:text-[21px] font-extrabold text-white mb-4 md:mb-6">{s.exec_overview_title}</div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-start">
            {/* Sidebar — strip horizontal di mobile, kolom tetap di desktop */}
            <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible thin-scroll md:sticky md:top-6 pb-1 md:pb-0">
              {ADMIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 whitespace-nowrap text-left px-4 py-2.5 rounded-xl text-[12.5px] md:text-[13px] font-bold transition-colors cursor-pointer border-none ${
                    activeTab === tab.id ? "bg-bd-gold text-bd-ink" : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 w-full">
              {activeTab === "situs" && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6 p-5.5">
            <div className="font-bold text-[15px] text-white mb-4">{s.admin_site_settings_title}</div>

            <div className="flex items-center gap-4 mb-5">
              <img
                src={resolveLogoSrc(siteSettings?.logoPath ?? null)}
                alt="logo"
                className="h-12 w-auto bg-white/10 rounded-lg px-2 py-1"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                className="text-[12px] text-white/70"
              />
              <button
                onClick={uploadLogo}
                disabled={!logoFile || uploadingLogo}
                className="bg-bd-gold border-none text-bd-ink font-bold px-3.5 py-2 rounded-lg cursor-pointer text-[12px] disabled:opacity-50"
              >
                {uploadingLogo ? "…" : s.admin_upload_logo_btn}
              </button>
            </div>

            {siteForm && (
              <form onSubmit={saveSiteSettings} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {([
                  ["heroEyebrow", "Eyebrow", "cth: Portal Data Terbuka Kota Bandung"],
                  ["heroTitle", "Judul", "cth: Dashboard Bandung"],
                  ["heroSub", "Deskripsi", "cth: Satu kanal angka, metrik, dan visualisasi data resmi Kota Bandung."],
                  ["kpiPopLabel", "Label Populasi", "cth: Populasi"],
                  ["kpiPopVal", "Nilai Populasi", "cth: 2,52 Juta"],
                  ["kpiAreaLabel", "Label Luas", "cth: Luas Wilayah"],
                  ["kpiAreaVal", "Nilai Luas", "cth: 167,3 km²"],
                  ["kpiKecLabel", "Label Kecamatan", "cth: Kecamatan"],
                  ["kpiKecVal", "Nilai Kecamatan", "cth: 30"],
                  ["kpiKelLabel", "Label Kelurahan", "cth: Kelurahan"],
                  ["kpiKelVal", "Nilai Kelurahan", "cth: 151"],
                ] as const).map(([key, label, ph]) => (
                  <div key={key}>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">{label}</label>
                    {key === "heroSub" ? (
                      <textarea
                        value={siteForm[key] ?? ""}
                        onChange={(e) => setSiteForm((prev) => ({ ...prev!, [key]: e.target.value }))}
                        placeholder={ph}
                        rows={2}
                        className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12.5px] text-white outline-none resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={siteForm[key] ?? ""}
                        onChange={(e) => setSiteForm((prev) => ({ ...prev!, [key]: e.target.value }))}
                        placeholder={ph}
                        className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12.5px] text-white outline-none"
                      />
                    )}
                  </div>
                ))}

                <div className="md:col-span-2 flex items-center gap-3 mt-1">
                  <button
                    type="submit"
                    disabled={savingSite}
                    className="bg-bd-gold border-none text-bd-ink font-bold px-4 py-2 rounded-lg cursor-pointer text-[12.5px] disabled:opacity-60"
                  >
                    {savingSite ? "…" : s.admin_save_btn}
                  </button>
                  {siteSaved && <span className="text-[12px] font-semibold text-bd-green">{s.admin_saved_label}</span>}
                </div>
              </form>
            )}
          </div>
              )}

              {activeTab === "sektor" && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6 p-5.5">
            <div className="font-bold text-[15px] text-white mb-4">{s.admin_sectors_title}</div>

            <form onSubmit={createSector} className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mb-4">
              <Field label="ID (Slug)">
                <input placeholder="cth: kesehatan" value={sectorForm.id} onChange={(e) => setSectorForm({ ...sectorForm, id: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
              </Field>
              <Field label="Kode">
                <input placeholder="cth: KES" value={sectorForm.code} onChange={(e) => setSectorForm({ ...sectorForm, code: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
              </Field>
              <Field label="Nama Sektor">
                <input placeholder="cth: Kesehatan" value={sectorForm.name} onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
              </Field>
              <Field label="Deskripsi" className="md:col-span-2">
                <input placeholder="cth: Fasilitas kesehatan, kunjungan puskesmas, dan layanan kesehatan masyarakat." value={sectorForm.desc} onChange={(e) => setSectorForm({ ...sectorForm, desc: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
              </Field>
              <Field label="Warna Utama">
                <input type="color" value={sectorForm.color} onChange={(e) => setSectorForm({ ...sectorForm, color: e.target.value })} className="bg-black/20 border border-white/15 rounded-lg h-9 w-full" />
              </Field>
              <Field label="Warna Latar (Tint)">
                <input type="color" value={sectorForm.tint} onChange={(e) => setSectorForm({ ...sectorForm, tint: e.target.value })} className="bg-black/20 border border-white/15 rounded-lg h-9 w-full" />
              </Field>
              <button type="submit" disabled={creatingSector} className="bg-bd-gold border-none text-bd-ink font-bold px-4 py-2 rounded-lg cursor-pointer text-[12px] disabled:opacity-60 md:col-span-2 self-end">
                {creatingSector ? "…" : s.admin_add_sector_btn}
              </button>
            </form>

            <div className="overflow-x-auto mb-4">
            <table className="w-full text-left border-collapse min-w-125">
              <thead>
                <tr className="border-t border-white/10">
                  <th className="py-2.5 px-3 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_sector}</th>
                  <th className="py-2.5 px-3 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_visibility_title}</th>
                  <th className="py-2.5 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {(sectorList ?? []).map((row) => {
                  const visibility = sectorVisibility?.find((v) => v.sectorId === row.id);
                  return (
                    <tr key={row.id} className="border-t border-white/5">
                      <td className="py-2.5 px-3 font-semibold text-[12.5px] text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }}></span>
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3">
                        {visibility && (
                          <button
                            onClick={() => toggleSectorVisibility(visibility)}
                            className={`font-bold text-[10.5px] px-2.5 py-1.5 rounded-md cursor-pointer uppercase tracking-wider border-none ${
                              visibility.isVisible ? "bg-bd-green-light text-bd-green" : "bg-white/10 text-white/50"
                            }`}
                          >
                            {visibility.isVisible ? s.admin_visibility_shown : s.admin_visibility_hidden}
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button onClick={() => selectSectorForDatasets(row.id)} className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-white/20 text-white hover:bg-white/10 transition-colors mr-2">
                          {s.admin_manage_datasets_btn}
                        </button>
                        <button onClick={() => deleteSector(row)} className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-bd-red/40 text-bd-red hover:bg-bd-red/10 transition-colors">
                          {s.admin_btn_delete}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            {selectedSectorId && (
              <div className="bg-black/20 rounded-lg p-4">
                <div className="font-bold text-[13px] text-white mb-3">
                  {s.admin_datasets_for} {sectorList?.find((r) => r.id === selectedSectorId)?.name}
                </div>

                <form onSubmit={createDataset} className="grid grid-cols-1 md:grid-cols-6 gap-2.5 mb-1.5">
                  <Field label="Judul Dashboard" className="md:col-span-2">
                    <input placeholder="cth: Jumlah Rumah Sakit" value={datasetForm.title} onChange={(e) => setDatasetForm({ ...datasetForm, title: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
                  </Field>
                  <Field label="Iframe URL (Embed)" className="md:col-span-2">
                    <input placeholder="cth: https://lookerstudio.google.com/embed/reporting/xxxx/page/yyyy" value={datasetForm.iframeUrl} onChange={(e) => setDatasetForm({ ...datasetForm, iframeUrl: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
                  </Field>
                  <Field label="Width (px)">
                    <input type="number" placeholder="cth: 1600" value={datasetForm.width} onChange={(e) => setDatasetForm({ ...datasetForm, width: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
                  </Field>
                  <Field label="Height (px)">
                    <input type="number" placeholder="cth: 2400" value={datasetForm.height} onChange={(e) => setDatasetForm({ ...datasetForm, height: e.target.value })} className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none" />
                  </Field>
                  <button type="submit" disabled={creatingDataset} className="bg-bd-gold border-none text-bd-ink font-bold px-4 py-2 rounded-lg cursor-pointer text-[12px] disabled:opacity-60 md:col-span-6">
                    {creatingDataset ? "…" : s.admin_add_dataset_btn}
                  </button>
                </form>
                <p className="text-[11px] text-white/40 font-medium mb-3">
                  Pakai link "Embed report" dari Looker Studio (menu File → Embed report) beserta width/height yang ditampilkan di dialog itu juga — supaya laporan tampil utuh 1 halaman tanpa scroll. Bukan link embed akan otomatis dikoreksi, tapi lebih aman salin dari sana langsung.
                </p>

                <div className="flex flex-col gap-2">
                  {(sectorDatasets ?? []).map((row) =>
                    editingDatasetId === row.id ? (
                      <form
                        key={row.id}
                        onSubmit={saveEditDataset}
                        className="grid grid-cols-1 md:grid-cols-6 gap-2.5 bg-white/5 rounded-lg px-3 py-2"
                      >
                        <Field label="Judul Dashboard" className="md:col-span-2">
                          <input
                            placeholder="cth: Jumlah Rumah Sakit"
                            value={editDatasetForm.title}
                            onChange={(e) => setEditDatasetForm({ ...editDatasetForm, title: e.target.value })}
                            className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none"
                          />
                        </Field>
                        <Field label="Iframe URL (Embed)" className="md:col-span-2">
                          <input
                            placeholder="cth: https://lookerstudio.google.com/embed/reporting/xxxx/page/yyyy"
                            value={editDatasetForm.iframeUrl}
                            onChange={(e) => setEditDatasetForm({ ...editDatasetForm, iframeUrl: e.target.value })}
                            className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none"
                          />
                        </Field>
                        <Field label="Width (px)">
                          <input
                            type="number"
                            placeholder="cth: 1600"
                            value={editDatasetForm.width}
                            onChange={(e) => setEditDatasetForm({ ...editDatasetForm, width: e.target.value })}
                            className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none"
                          />
                        </Field>
                        <Field label="Height (px)">
                          <input
                            type="number"
                            placeholder="cth: 2400"
                            value={editDatasetForm.height}
                            onChange={(e) => setEditDatasetForm({ ...editDatasetForm, height: e.target.value })}
                            className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3 py-2 text-[12px] text-white outline-none"
                          />
                        </Field>
                        <div className="flex gap-2 md:col-span-6">
                          <button
                            type="submit"
                            disabled={savingDatasetEdit}
                            className="flex-1 bg-bd-gold border-none text-bd-ink font-bold px-3 py-2 rounded-lg cursor-pointer text-[12px] disabled:opacity-60"
                          >
                            {savingDatasetEdit ? "…" : s.admin_save_btn}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditDataset}
                            className="font-bold text-[11.5px] px-3 py-2 rounded-md cursor-pointer border-[1.5px] border-white/20 text-white hover:bg-white/10 transition-colors"
                          >
                            {s.admin_btn_cancel}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div key={row.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div className="text-[12.5px] font-semibold text-white truncate mr-3">{row.title}</div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEditDataset(row)} className="font-bold text-[11px] px-2.5 py-1 rounded-md cursor-pointer border-[1.5px] border-white/20 text-white hover:bg-white/10 transition-colors">
                            {s.admin_btn_edit}
                          </button>
                          <button onClick={() => deleteDataset(row)} className="font-bold text-[11px] px-2.5 py-1 rounded-md cursor-pointer border-[1.5px] border-bd-red/40 text-bd-red hover:bg-bd-red/10 transition-colors">
                            {s.admin_btn_delete}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  {sectorDatasets?.length === 0 && (
                    <div className="text-[12px] text-white/50 py-2">—</div>
                  )}
                </div>
              </div>
            )}
          </div>
              )}

              {activeTab === "api" && (
                <>
          {/* Permintaan API */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
            <div className="font-bold text-[15px] text-white p-5.5 pb-4">{s.admin_api_requests_title}</div>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="border-t border-white/10">
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_name}</th>
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_institution}</th>
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_email}</th>
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_status}</th>
                  <th className="py-2.5 px-5.5"></th>
                </tr>
              </thead>
              <tbody>
                {(apiRequests ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="py-3 px-5.5 font-semibold text-[12.5px] text-white">{row.name}</td>
                    <td className="py-3 px-5.5 text-[12px] font-medium text-white/70">{row.institution}</td>
                    <td className="py-3 px-5.5 text-[12px] font-medium text-white/70">{row.email}</td>
                    <td className="py-3 px-5.5">
                      <span
                        className={`font-bold text-[10.5px] px-2 py-1 rounded uppercase tracking-wider ${
                          row.status === "approved" ? "bg-bd-green-light text-bd-green" : row.status === "rejected" ? "bg-bd-red/20 text-bd-red" : "bg-white/10 text-white/50"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-5.5 text-right whitespace-nowrap">
                      <button onClick={() => updateApiRequestStatus(row, "approved")} className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-white/20 text-white hover:bg-white/10 transition-colors mr-2">
                        {s.admin_btn_approve}
                      </button>
                      <button onClick={() => updateApiRequestStatus(row, "rejected")} className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-bd-red/40 text-bd-red hover:bg-bd-red/10 transition-colors">
                        {s.admin_btn_reject}
                      </button>
                    </td>
                  </tr>
                ))}
                {apiRequests?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-5.5 text-center text-[12.5px] text-white/50">—</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
            <div className="font-bold text-[15px] text-white p-5.5 pb-4">{s.admin_api_keys_title}</div>

            <form onSubmit={createApiKey} className="flex items-end gap-2.5 px-5.5 pb-4">
              <Field label="Label API Key" className="flex-1 max-w-xs">
                <input
                  type="text"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder={s.admin_new_key_ph}
                  className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3.5 py-2 text-[12.5px] text-white outline-none"
                />
              </Field>
              <button
                type="submit"
                disabled={creatingKey}
                className="bg-bd-gold border-none text-bd-ink font-bold px-4 py-2 rounded-lg cursor-pointer text-[12.5px] disabled:opacity-60"
              >
                {creatingKey ? "…" : s.admin_new_key_btn}
              </button>
            </form>

            {justCreatedKey && (
              <div className="mx-5.5 mb-4 flex items-center gap-2.5 bg-black/20 border border-bd-gold/40 rounded-lg px-3.5 py-3">
                <span className="text-[11px] font-bold text-bd-gold shrink-0">{s.admin_new_key_created}</span>
                <span className="flex-1 font-mono text-[12.5px] text-white overflow-hidden text-ellipsis whitespace-nowrap">
                  {justCreatedKey}
                </span>
                <button
                  onClick={copyJustCreatedKey}
                  className="bg-bd-gold border-none text-bd-ink font-bold px-3 py-1.5 rounded-md cursor-pointer text-[11.5px] whitespace-nowrap shrink-0"
                >
                  {copied ? "Tersalin!" : s.api_copy_btn}
                </button>
              </div>
            )}

            <div className="px-5.5 pb-3">
              <Field label="Cari Label" className="max-w-xs">
                <input
                  type="text"
                  value={apiKeySearch}
                  onChange={(e) => {
                    setApiKeySearch(e.target.value);
                    setApiKeyPage(1);
                  }}
                  placeholder="cth: mobile"
                  className="w-full box-border bg-black/20 border border-white/15 rounded-lg px-3.5 py-2 text-[12.5px] text-white outline-none"
                />
              </Field>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="border-t border-white/10">
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_label}</th>
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_status}</th>
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_last_used}</th>
                  <th className="py-2.5 px-5.5 text-[10.5px] font-bold text-white/50 uppercase">{s.admin_col_created}</th>
                  <th className="py-2.5 px-5.5"></th>
                </tr>
              </thead>
              <tbody>
                {pagedApiKeys.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="py-3 px-5.5 font-semibold text-[12.5px] text-white">{row.label}</td>
                    <td className="py-3 px-5.5">
                      <span
                        className={`font-bold text-[10.5px] px-2 py-1 rounded uppercase tracking-wider ${
                          row.isActive ? "bg-bd-green-light text-bd-green" : "bg-white/10 text-white/50"
                        }`}
                      >
                        {row.isActive ? s.admin_status_active : s.admin_status_revoked}
                      </span>
                    </td>
                    <td className="py-3 px-5.5 text-[12px] font-medium text-white/70">{dateFmt(row.lastUsedAt)}</td>
                    <td className="py-3 px-5.5 text-[12px] font-medium text-white/70">{dateFmt(row.createdAt)}</td>
                    <td className="py-3 px-5.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleApiKey(row)}
                        className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-white/20 text-white hover:bg-white/10 transition-colors mr-2"
                      >
                        {row.isActive ? s.admin_btn_revoke : s.admin_btn_activate}
                      </button>
                      <button
                        onClick={() => deleteApiKey(row)}
                        className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-bd-red/40 text-bd-red hover:bg-bd-red/10 transition-colors"
                      >
                        {s.admin_btn_delete}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredApiKeys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-5.5 text-center text-[12.5px] text-white/50">—</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            {filteredApiKeys.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-5.5 py-3.5 border-t border-white/10">
                <span className="text-[11.5px] font-medium text-white/50">
                  Halaman {apiKeyPageSafe} dari {apiKeyTotalPages} &middot; {filteredApiKeys.length} key
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setApiKeyPage((p) => Math.max(1, p - 1))}
                    disabled={apiKeyPageSafe <= 1}
                    className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-white/20 text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    &larr; Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiKeyPage((p) => Math.min(apiKeyTotalPages, p + 1))}
                    disabled={apiKeyPageSafe >= apiKeyTotalPages}
                    className="font-bold text-[11.5px] px-3 py-1.5 rounded-md cursor-pointer border-[1.5px] border-white/20 text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Selanjutnya &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Minimal footer */}
      <div className="px-8 py-4.5 border-t border-white/8 flex justify-between font-medium text-[11px] text-white/40">
        <span>{s.footer_rights}</span>
        <span>{s.exec_badge}</span>
      </div>
    </main>
  );
}
