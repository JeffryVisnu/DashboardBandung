-- Migration: ukuran asli (width/height) laporan Looker Studio per dashboard, supaya iframe
-- dirender persis sesuai kanvas aslinya (bukan asumsi 1600x2400 untuk semua) — ini yang bikin
-- sebagian laporan masih ada scrollbar internal karena tinggi kanvas aslinya beda-beda.
-- Nilai ini ada di dialog "Embed report" Looker Studio saat admin menyalin link embed.

ALTER TABLE sector_datasets
  ADD COLUMN IF NOT EXISTS width INTEGER NOT NULL DEFAULT 1600,
  ADD COLUMN IF NOT EXISTS height INTEGER NOT NULL DEFAULT 2400;
