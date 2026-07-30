-- Migration: hapus dukungan dwibahasa (Indonesia/Inggris) — situs ini Indonesia-only,
-- fitur ganti bahasa tidak pernah benar-benar dipakai (tidak ada tombolnya di FE). Kolom
-- "_en" dihapus, kolom "_id" di-rename jadi nama polos (tanpa suffix bahasa).

ALTER TABLE site_settings
  DROP COLUMN IF EXISTS hero_eyebrow_en,
  DROP COLUMN IF EXISTS hero_title_en,
  DROP COLUMN IF EXISTS hero_sub_en,
  DROP COLUMN IF EXISTS kpi_pop_label_en,
  DROP COLUMN IF EXISTS kpi_area_label_en,
  DROP COLUMN IF EXISTS kpi_kec_label_en,
  DROP COLUMN IF EXISTS kpi_kel_label_en;

ALTER TABLE site_settings RENAME COLUMN hero_eyebrow_id TO hero_eyebrow;
ALTER TABLE site_settings RENAME COLUMN hero_title_id TO hero_title;
ALTER TABLE site_settings RENAME COLUMN hero_sub_id TO hero_sub;
ALTER TABLE site_settings RENAME COLUMN kpi_pop_label_id TO kpi_pop_label;
ALTER TABLE site_settings RENAME COLUMN kpi_area_label_id TO kpi_area_label;
ALTER TABLE site_settings RENAME COLUMN kpi_kec_label_id TO kpi_kec_label;
ALTER TABLE site_settings RENAME COLUMN kpi_kel_label_id TO kpi_kel_label;

ALTER TABLE sectors
  DROP COLUMN IF EXISTS name_en,
  DROP COLUMN IF EXISTS desc_en;

ALTER TABLE sectors RENAME COLUMN name_id TO name;
-- "desc" adalah kata kunci SQL (ORDER BY ... DESC) — pakai "description" supaya tidak perlu
-- di-quote terus-menerus di query lain.
ALTER TABLE sectors RENAME COLUMN desc_id TO description;

ALTER TABLE sector_datasets DROP COLUMN IF EXISTS title_en;
ALTER TABLE sector_datasets RENAME COLUMN title_id TO title;
