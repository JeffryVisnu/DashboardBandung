import { pool } from "../db.js";

export interface SiteSettings {
  logoPath: string | null;
  footerLogoPath: string | null;
  heroEyebrow: string;
  heroTitle: string;
  heroSub: string;
  kpiPop: { label: string; value: string };
  kpiArea: { label: string; value: string };
  kpiKec: { label: string; value: string };
  kpiKel: { label: string; value: string };
  ketentuanPenggunaan: string;
  kebijakanPrivasi: string;
}

function toSiteSettings(row: Record<string, unknown>): SiteSettings {
  return {
    logoPath: row.logo_path as string | null,
    footerLogoPath: row.footer_logo_path as string | null,
    heroEyebrow: row.hero_eyebrow as string,
    heroTitle: row.hero_title as string,
    heroSub: row.hero_sub as string,
    kpiPop: { label: row.kpi_pop_label as string, value: row.kpi_pop_val as string },
    kpiArea: { label: row.kpi_area_label as string, value: row.kpi_area_val as string },
    kpiKec: { label: row.kpi_kec_label as string, value: row.kpi_kec_val as string },
    kpiKel: { label: row.kpi_kel_label as string, value: row.kpi_kel_val as string },
    ketentuanPenggunaan: row.ketentuan_penggunaan as string,
    kebijakanPrivasi: row.kebijakan_privasi as string,
  };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const result = await pool.query(`SELECT * FROM site_settings WHERE id = 1`);
  if (result.rows.length === 0) return null;
  return toSiteSettings(result.rows[0]);
}

const EDITABLE_COLUMNS: Record<string, string> = {
  heroEyebrow: "hero_eyebrow",
  heroTitle: "hero_title",
  heroSub: "hero_sub",
  kpiPopLabel: "kpi_pop_label",
  kpiPopVal: "kpi_pop_val",
  kpiAreaLabel: "kpi_area_label",
  kpiAreaVal: "kpi_area_val",
  kpiKecLabel: "kpi_kec_label",
  kpiKecVal: "kpi_kec_val",
  kpiKelLabel: "kpi_kel_label",
  kpiKelVal: "kpi_kel_val",
  ketentuanPenggunaan: "ketentuan_penggunaan",
  kebijakanPrivasi: "kebijakan_privasi",
};

export async function updateSiteSettings(fields: Record<string, unknown>): Promise<SiteSettings> {
  const sets: string[] = [];
  const params: unknown[] = [];

  for (const [key, column] of Object.entries(EDITABLE_COLUMNS)) {
    if (typeof fields[key] === "string") {
      params.push(fields[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }

  if (sets.length === 0) {
    const current = await getSiteSettings();
    if (!current) throw new Error("site_settings belum di-seed.");
    return current;
  }

  sets.push(`updated_at = now()`);
  const result = await pool.query(
    `UPDATE site_settings SET ${sets.join(", ")} WHERE id = 1 RETURNING *`,
    params
  );
  return toSiteSettings(result.rows[0]);
}

export async function updateLogoPath(logoPath: string): Promise<SiteSettings> {
  const result = await pool.query(
    `UPDATE site_settings SET logo_path = $1, updated_at = now() WHERE id = 1 RETURNING *`,
    [logoPath]
  );
  return toSiteSettings(result.rows[0]);
}

export async function updateFooterLogoPath(logoPath: string): Promise<SiteSettings> {
  const result = await pool.query(
    `UPDATE site_settings SET footer_logo_path = $1, updated_at = now() WHERE id = 1 RETURNING *`,
    [logoPath]
  );
  return toSiteSettings(result.rows[0]);
}
