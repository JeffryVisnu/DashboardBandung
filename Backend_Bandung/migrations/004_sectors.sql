-- Migration: sektor jadi data (bukan hardcode di frontend lib/placeholder-data.ts) supaya
-- admin bisa tambah/ubah/hapus sektor lewat /eksekutif. Seed dari 8 sektor yang sudah ada
-- supaya tampilan situs publik tidak berubah sebelum admin mengedit apa pun.

CREATE TABLE IF NOT EXISTS sectors (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name_id TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_id TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  color TEXT NOT NULL,
  tint TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sectors (id, code, name_id, name_en, desc_id, desc_en, color, tint, sort_order) VALUES
  ('kependudukan', 'DUK', 'Kependudukan', 'Demographics',
    'Jumlah, kepadatan, dan sebaran penduduk Kota Bandung di 30 kecamatan.',
    'Population count, density and distribution across Bandung''s 30 districts.',
    '#1F5AA8', '#E8F0FA', 1),
  ('ekonomi', 'EKO', 'Ekonomi & UMKM', 'Economy & SMEs',
    'Indikator ekonomi, PDRB, dan data UMKM aktif Kota Bandung.',
    'Economic indicators, GDP, and active SME data for Bandung City.',
    '#E8821E', '#FDEEDD', 2),
  ('kesehatan', 'KES', 'Kesehatan', 'Health',
    'Fasilitas kesehatan, kunjungan puskesmas, dan layanan kesehatan masyarakat.',
    'Health facilities, community health center visits, and public health services.',
    '#1D8348', '#E7F6ED', 3),
  ('pendidikan', 'PDK', 'Pendidikan', 'Education',
    'Sekolah, angka partisipasi sekolah, dan fasilitas pendidikan kota.',
    'Schools, school participation rate, and education facilities.',
    '#F0B429', '#FDF3DA', 4),
  ('infrastruktur', 'INF', 'Infrastruktur', 'Infrastructure',
    'Kondisi jalan, trayek transportasi umum, dan fasilitas umum kota.',
    'Road conditions, public transport routes, and urban facilities.',
    '#4C5D6B', '#F4F6F9', 5),
  ('lingkungan', 'LNG', 'Lingkungan Hidup', 'Environment',
    'Kualitas udara ISPU, ruang terbuka hijau, dan pengelolaan sampah kota.',
    'Air quality (ISPU), green open spaces, and waste management.',
    '#1D8348', '#E7F6ED', 6),
  ('anggaran', 'ANG', 'Anggaran & Keuangan', 'Budget & Finance',
    'Realisasi APBD, belanja per OPD, dan transparansi keuangan Pemkot Bandung.',
    'APBD realization, spending by department, and Bandung City financial transparency.',
    '#1F5AA8', '#E8F0FA', 7),
  ('sosial', 'SOS', 'Sosial & Kemasyarakatan', 'Social Affairs',
    'Data kemiskinan, bansos, penyandang disabilitas, dan layanan sosial kota.',
    'Poverty data, social aid, people with disabilities, and social services.',
    '#C0392B', '#FBEAE8', 8)
ON CONFLICT (id) DO NOTHING;
