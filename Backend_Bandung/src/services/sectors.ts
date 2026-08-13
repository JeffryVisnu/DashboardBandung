import { pool } from "../db.js";

export interface SectorDTO {
  id: string;
  code: string;
  name: string;
  desc: string;
  color: string;
  tint: string;
  sortOrder: number;
}

export interface SectorDatasetDTO {
  id: number;
  sectorId: string;
  title: string;
  slug: string;
  iframeUrl: string;
  width: number;
  height: number;
  views: number;
  sortOrder: number;
}

function toSector(row: Record<string, unknown>): SectorDTO {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    desc: row.description as string,
    color: row.color as string,
    tint: row.tint as string,
    sortOrder: Number(row.sort_order),
  };
}

function toDataset(row: Record<string, unknown>): SectorDatasetDTO {
  return {
    id: Number(row.id),
    sectorId: row.sector_id as string,
    title: row.title as string,
    slug: row.slug as string,
    iframeUrl: row.iframe_url as string,
    width: Number(row.width),
    height: Number(row.height),
    views: Number(row.views),
    sortOrder: Number(row.sort_order),
  };
}

export async function listSectors(): Promise<SectorDTO[]> {
  const result = await pool.query(`SELECT * FROM sectors ORDER BY sort_order, id`);
  return result.rows.map(toSector);
}

export interface SectorInput {
  id: string;
  code: string;
  name: string;
  desc: string;
  color: string;
  tint: string;
  sortOrder?: number;
}

export async function createSector(input: SectorInput): Promise<SectorDTO> {
  const result = await pool.query(
    `INSERT INTO sectors (id, code, name, description, color, tint, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [input.id, input.code, input.name, input.desc, input.color, input.tint, input.sortOrder ?? 0]
  );

  // Sektor baru langsung tampil di publik & mulai dihitung kunjungannya, sama seperti 8 sektor
  // bawaan (lihat seed di migrations/001_admin.sql & 002_sector_views.sql).
  await pool.query(
    `INSERT INTO sector_visibility (sector_id) VALUES ($1) ON CONFLICT (sector_id) DO NOTHING`,
    [input.id]
  );
  await pool.query(
    `INSERT INTO sector_views (sector_id) VALUES ($1) ON CONFLICT (sector_id) DO NOTHING`,
    [input.id]
  );

  return toSector(result.rows[0]);
}

export async function updateSector(id: string, input: Partial<SectorInput>): Promise<SectorDTO | null> {
  const columns: Record<string, unknown> = {
    code: input.code,
    name: input.name,
    description: input.desc,
    color: input.color,
    tint: input.tint,
    sort_order: input.sortOrder,
  };

  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [column, value] of Object.entries(columns)) {
    if (value === undefined) continue;
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  }
  if (sets.length === 0) {
    const result = await pool.query(`SELECT * FROM sectors WHERE id = $1`, [id]);
    return result.rows.length ? toSector(result.rows[0]) : null;
  }

  sets.push(`updated_at = now()`);
  params.push(id);
  const result = await pool.query(
    `UPDATE sectors SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows.length ? toSector(result.rows[0]) : null;
}

export async function deleteSector(id: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM sectors WHERE id = $1 RETURNING id`, [id]);
  if (result.rows.length === 0) return false;

  await pool.query(`DELETE FROM sector_visibility WHERE sector_id = $1`, [id]);
  await pool.query(`DELETE FROM sector_views WHERE sector_id = $1`, [id]);
  return true;
}

export async function listDatasets(sectorId: string): Promise<SectorDatasetDTO[]> {
  const result = await pool.query(
    `SELECT * FROM sector_datasets WHERE sector_id = $1 ORDER BY sort_order, id`,
    [sectorId]
  );
  return result.rows.map(toDataset);
}

// Dipakai API publik /api/v1/:sectorId/:dashboardSlug — 1 dashboard lewat judulnya (slug),
// bukan angka id, supaya URL API mudah dibaca (mis. /v1/pendidikan/jumlah-sd).
export async function getDatasetBySlug(slug: string): Promise<SectorDatasetDTO | null> {
  const result = await pool.query(`SELECT * FROM sector_datasets WHERE slug = $1`, [slug]);
  return result.rows.length ? toDataset(result.rows[0]) : null;
}

// Dipakai kartu "Dashboard" di /topik & beranda — semua dataset semua sektor sekaligus,
// supaya FE tidak perlu N kali fetch per sektor.
export async function listAllDatasets(): Promise<SectorDatasetDTO[]> {
  const result = await pool.query(`SELECT * FROM sector_datasets ORDER BY sector_id, sort_order, id`);
  return result.rows.map(toDataset);
}

export interface DatasetInput {
  sectorId: string;
  title: string;
  iframeUrl: string;
  width?: number;
  height?: number;
  sortOrder?: number;
}

/**
 * Link Looker Studio yang di-copy dari tombol "Share"/URL bar (mis.
 * https://lookerstudio.google.com/reporting/<id>/page/<page>) diblokir Google untuk di-iframe
 * ("refused to connect") — hanya varian "/embed/reporting/..." yang boleh di-frame. Begitu juga
 * link publik Flourish (public.flourish.studio/visualisation/<id>/) perlu akhiran "/embed" biar
 * bisa di-iframe. Perbaiki otomatis di sini supaya admin tidak perlu tahu bedanya.
 */
function normalizeIframeUrl(url: string): string {
  const looker = url.replace(
    /^(https:\/\/(?:datastudio|lookerstudio)\.google\.com)\/(?!embed\/)reporting\//,
    "$1/embed/reporting/"
  );
  if (looker !== url) return looker;

  return url.replace(
    /^(https:\/\/(?:public\.flourish\.studio|flo\.uri\.sh)\/visualisation\/\d+)\/?$/,
    "$1/embed"
  );
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "dashboard"
  );
}

// Judul dashboard dipakai sebagai slug URL API (/v1/dashboards/:slug) saat dashboard dibuat —
// kalau judulnya sama dengan dashboard lain, tambahkan akhiran -2, -3, dst. supaya tetap unik.
// Slug ini permanen (lihat updateDataset), jadi cuma dipanggil sekali di createDataset.
async function uniqueDatasetSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  for (;;) {
    const result = await pool.query(`SELECT id FROM sector_datasets WHERE slug = $1`, [slug]);
    if (result.rows.length === 0) return slug;
    slug = `${base}-${n}`;
    n++;
  }
}

export async function createDataset(input: DatasetInput): Promise<SectorDatasetDTO> {
  const slug = await uniqueDatasetSlug(input.title);
  const result = await pool.query(
    `INSERT INTO sector_datasets (sector_id, title, slug, iframe_url, width, height, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      input.sectorId,
      input.title,
      slug,
      normalizeIframeUrl(input.iframeUrl),
      input.width ?? 1600,
      input.height ?? 2400,
      input.sortOrder ?? 0,
    ]
  );
  return toDataset(result.rows[0]);
}

export async function updateDataset(id: number, input: Partial<DatasetInput>): Promise<SectorDatasetDTO | null> {
  // Slug SENGAJA tidak dibuat ulang di sini walau judul berubah — slug jadi permanen sejak
  // dashboard dibuat, supaya URL publik (/dashboard/..., /v1/.../:slug/...) dan endpoint bespoke
  // yang terdaftar berdasarkan slug (lihat BESPOKE_ENDPOINTS di routes/v1.ts) tidak putus setiap
  // kali admin ganti judul dashboard.
  const columns: Record<string, unknown> = {
    title: input.title,
    iframe_url: input.iframeUrl !== undefined ? normalizeIframeUrl(input.iframeUrl) : undefined,
    width: input.width,
    height: input.height,
    sort_order: input.sortOrder,
  };

  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [column, value] of Object.entries(columns)) {
    if (value === undefined) continue;
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  }
  if (sets.length === 0) {
    const result = await pool.query(`SELECT * FROM sector_datasets WHERE id = $1`, [id]);
    return result.rows.length ? toDataset(result.rows[0]) : null;
  }

  params.push(id);
  const result = await pool.query(
    `UPDATE sector_datasets SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows.length ? toDataset(result.rows[0]) : null;
}

export async function deleteDataset(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM sector_datasets WHERE id = $1 RETURNING id`, [id]);
  return result.rows.length > 0;
}

// Dipanggil sekali tiap halaman 1 dashboard (/dashboard/[slug]/[dashboardId]) dibuka — angka
// "dilihat" jadi per-dashboard, bukan lagi digabung per sektor (lihat sectorViews.ts).
export async function incrementDatasetView(id: number): Promise<number | null> {
  const result = await pool.query(
    `UPDATE sector_datasets SET views = views + 1 WHERE id = $1 RETURNING views`,
    [id]
  );
  return result.rows.length ? Number(result.rows[0].views) : null;
}
