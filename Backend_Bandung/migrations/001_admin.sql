-- Migration: sistem admin (login + kontrol visibilitas sektor)
-- Menggantikan desain lama `categories`/`datasets` (peninggalan era Postgres lokal,
-- tidak pernah ikut dipindah ke Supabase) — lihat README §Yang masih perlu dikerjakan.

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kontrol tampil/sembunyikan sektor di dashboard publik.
-- sector_id harus cocok dengan id di SECTORS (frontend, lib/placeholder-data.ts).
CREATE TABLE IF NOT EXISTS sector_visibility (
  sector_id TEXT PRIMARY KEY,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sector_visibility (sector_id) VALUES
  ('kependudukan'), ('ekonomi'), ('kesehatan'), ('pendidikan'),
  ('infrastruktur'), ('lingkungan'), ('anggaran'), ('sosial')
ON CONFLICT (sector_id) DO NOTHING;
