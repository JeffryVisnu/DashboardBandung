-- Migration: dataset (embed iframe Looker Studio/dsb.) per sektor, dikelola admin lewat
-- /eksekutif. Sektor tanpa data asli (lihat GenericSectorDetail di frontend) merender daftar
-- ini sebagai chart sungguhan; sektor dengan komponen custom (mis. Pendidikan) menambahkannya
-- sebagai chart tambahan di bawah embed utama.

CREATE TABLE IF NOT EXISTS sector_datasets (
  id SERIAL PRIMARY KEY,
  sector_id TEXT NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  iframe_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sector_datasets (sector_id, title_id, title_en, iframe_url, sort_order)
SELECT 'pendidikan', 'Data SD', 'Elementary School Data',
  'https://datastudio.google.com/embed/reporting/3e337b68-1942-4341-a075-1158d7a0bff8/page/BGL3F', 1
WHERE NOT EXISTS (
  SELECT 1 FROM sector_datasets WHERE sector_id = 'pendidikan' AND title_id = 'Data SD'
);
