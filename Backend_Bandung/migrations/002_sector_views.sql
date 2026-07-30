-- Migration: penghitung kunjungan (total view) per sektor
-- Dipakai halaman /topik untuk menampilkan angka "dilihat" asli, bukan dummy.

CREATE TABLE IF NOT EXISTS sector_views (
  sector_id TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sector_views (sector_id) VALUES
  ('kependudukan'), ('ekonomi'), ('kesehatan'), ('pendidikan'),
  ('infrastruktur'), ('lingkungan'), ('anggaran'), ('sosial')
ON CONFLICT (sector_id) DO NOTHING;
