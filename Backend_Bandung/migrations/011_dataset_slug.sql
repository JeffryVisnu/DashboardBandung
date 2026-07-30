-- Migration: slug URL-friendly per dashboard (dari judulnya) — dipakai endpoint publik
-- GET /api/v1/dashboards/:slug supaya URL API pakai judul yang mudah dibaca (mis. "jumlah-sd"),
-- bukan angka id.

ALTER TABLE sector_datasets ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slug dari title untuk baris yang sudah ada. Duplikat title (jarang, tapi bisa
-- terjadi lintas sektor) ditangani dengan akhiran -2, -3, dst. berdasarkan id terkecil duluan.
UPDATE sector_datasets sd
SET slug = sub.slug
FROM (
  SELECT id,
    CASE WHEN rn = 1 THEN base_slug ELSE base_slug || '-' || rn END AS slug
  FROM (
    SELECT id,
      trim(both '-' from regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g')) AS base_slug,
      ROW_NUMBER() OVER (
        PARTITION BY trim(both '-' from regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g'))
        ORDER BY id
      ) AS rn
    FROM sector_datasets
  ) t
) sub
WHERE sd.id = sub.id AND sd.slug IS NULL;

ALTER TABLE sector_datasets ALTER COLUMN slug SET NOT NULL;
ALTER TABLE sector_datasets ADD CONSTRAINT sector_datasets_slug_unique UNIQUE (slug);
