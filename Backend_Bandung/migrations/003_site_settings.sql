-- Migration: pengaturan situs (logo, teks hero, statistik homepage) yang bisa diubah admin
-- lewat /eksekutif, menggantikan teks hardcode di frontend lib/placeholder-data.ts.

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  logo_path TEXT,
  hero_eyebrow_id TEXT NOT NULL,
  hero_eyebrow_en TEXT NOT NULL,
  hero_title_id TEXT NOT NULL,
  hero_title_en TEXT NOT NULL,
  hero_sub_id TEXT NOT NULL,
  hero_sub_en TEXT NOT NULL,
  kpi_pop_label_id TEXT NOT NULL,
  kpi_pop_label_en TEXT NOT NULL,
  kpi_pop_val TEXT NOT NULL,
  kpi_area_label_id TEXT NOT NULL,
  kpi_area_label_en TEXT NOT NULL,
  kpi_area_val TEXT NOT NULL,
  kpi_kec_label_id TEXT NOT NULL,
  kpi_kec_label_en TEXT NOT NULL,
  kpi_kec_val TEXT NOT NULL,
  kpi_kel_label_id TEXT NOT NULL,
  kpi_kel_label_en TEXT NOT NULL,
  kpi_kel_val TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

INSERT INTO site_settings (
  id, logo_path,
  hero_eyebrow_id, hero_eyebrow_en,
  hero_title_id, hero_title_en,
  hero_sub_id, hero_sub_en,
  kpi_pop_label_id, kpi_pop_label_en, kpi_pop_val,
  kpi_area_label_id, kpi_area_label_en, kpi_area_val,
  kpi_kec_label_id, kpi_kec_label_en, kpi_kec_val,
  kpi_kel_label_id, kpi_kel_label_en, kpi_kel_val
) VALUES (
  1, '/assets/logo-diskominfo.jpg',
  'Portal Data Terbuka Kota Bandung', 'Bandung City Open Data Portal',
  'Dashboard Bandung', 'Dashboard Bandung',
  'Satu kanal angka, metrik, dan visualisasi data resmi Kota Bandung untuk warga dan pengambil kebijakan.',
  'One channel for the official figures, metrics, and data visualizations of Bandung City — for residents and policymakers.',
  'Populasi', 'Population', '2,52 Juta',
  'Luas Wilayah', 'Area', '167,3 km²',
  'Kecamatan', 'Districts', '30',
  'Kelurahan', 'Villages', '151'
)
ON CONFLICT (id) DO NOTHING;
