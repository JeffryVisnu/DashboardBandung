-- Migration: "Data SMP" (embed Looker Studio yang sebelumnya hardcode di PendidikanDetail.tsx)
-- dipindah jadi baris sector_datasets biasa, sejajar dengan "Data SD" — supaya sektor
-- Pendidikan sepenuhnya lewat GenericSectorDetail (tab dashboard dari admin), tidak ada lagi
-- komponen custom/hardcode per sektor.

INSERT INTO sector_datasets (sector_id, title_id, title_en, iframe_url, sort_order)
SELECT 'pendidikan', 'Data SMP', 'Junior High School Data',
  'https://datastudio.google.com/embed/reporting/ea8cf13b-32c3-4ee8-831e-afdf42e9fd7f/page/BGL3F', 0
WHERE NOT EXISTS (
  SELECT 1 FROM sector_datasets WHERE sector_id = 'pendidikan' AND title_id = 'Data SMP'
);

-- Pastikan Data SMP tampil sebelum Data SD di tab (urutan lama pakai sort_order 1 untuk SD).
UPDATE sector_datasets SET sort_order = 1 WHERE sector_id = 'pendidikan' AND title_id = 'Data SD';
