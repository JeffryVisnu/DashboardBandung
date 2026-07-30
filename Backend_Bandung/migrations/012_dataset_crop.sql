-- Migration: potong (crop) tampilan iframe secara vertikal — dipakai saat 1 laporan Looker
-- Studio perlu dipecah jadi beberapa "Dashboard" terpisah (mis. bagian atas sebelum peta
-- Flourish yang gagal dimuat, lalu peta Flourish-nya disisipkan manual sebagai Dashboard
-- tersendiri, baru bagian bawah laporan yang sama dilanjutkan lagi).
--
-- crop_top/crop_bottom dalam satuan piksel NATIVE (skala width/height asli dashboard, bukan
-- skala tampilan di layar). NULL di keduanya = tampil utuh seperti biasa (tanpa crop).

ALTER TABLE sector_datasets
  ADD COLUMN IF NOT EXISTS crop_top INTEGER,
  ADD COLUMN IF NOT EXISTS crop_bottom INTEGER;
