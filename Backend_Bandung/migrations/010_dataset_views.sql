-- Migration: hitungan kunjungan per Dashboard (bukan lagi cuma per sektor) — supaya angka
-- "dilihat" di kartu /topik & beranda beda-beda sesuai dashboard yang benar-benar dibuka.

ALTER TABLE sector_datasets
  ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;
