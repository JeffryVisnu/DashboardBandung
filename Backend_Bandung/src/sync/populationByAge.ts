import "dotenv/config";
import { pool } from "../db.js";

const SOURCE_URL =
  "https://opendata.bandung.go.id/api/bigdata/dinas_kependudukan_dan_pencatatan_sipil/jumlah_penduduk_kota_bandung_berdasarkan_usia_tungg_1";

interface PopulationByAgeRow {
  id: number;
  kode_provinsi: number;
  nama_provinsi: string;
  bps_kode_kabupaten_kota: number;
  bps_nama_kabupaten_kota: string;
  bps_kode_kecamatan: number;
  bps_nama_kecamatan: string;
  kemendagri_kode_kecamatan: string;
  kemendagri_nama_kecamatan: string;
  usia_tahun: number;
  jumlah_penduduk: number;
  satuan: string;
  tahun: number;
}

interface ApiResponse {
  code: number;
  message: string;
  data: PopulationByAgeRow[];
}

async function fetchPage(page: number): Promise<PopulationByAgeRow[]> {
  const res = await fetch(`${SOURCE_URL}?page=${page}`);
  if (!res.ok) {
    throw new Error(`Gagal fetch page ${page}: HTTP ${res.status}`);
  }
  const body = (await res.json()) as ApiResponse;
  return body.data;
}

async function syncPopulationByAge() {
  let page = 1;
  let totalRows = 0;

  while (true) {
    const rows = await fetchPage(page);
    if (rows.length === 0) break;

    for (const row of rows) {
      await pool.query(
        `INSERT INTO population_by_age (
           id, kode_provinsi, nama_provinsi, bps_kode_kabupaten_kota, bps_nama_kabupaten_kota,
           bps_kode_kecamatan, bps_nama_kecamatan, kemendagri_kode_kecamatan, kemendagri_nama_kecamatan,
           usia_tahun, jumlah_penduduk, satuan, tahun
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
           jumlah_penduduk = EXCLUDED.jumlah_penduduk,
           tahun = EXCLUDED.tahun`,
        [
          row.id,
          row.kode_provinsi,
          row.nama_provinsi,
          row.bps_kode_kabupaten_kota,
          row.bps_nama_kabupaten_kota,
          row.bps_kode_kecamatan,
          row.bps_nama_kecamatan,
          row.kemendagri_kode_kecamatan,
          row.kemendagri_nama_kecamatan,
          row.usia_tahun,
          row.jumlah_penduduk,
          row.satuan,
          row.tahun,
        ]
      );
    }

    totalRows += rows.length;
    console.log(`Page ${page}: ${rows.length} baris disinkronkan (total ${totalRows})`);
    page += 1;
  }

  console.log(`Sync selesai. Total ${totalRows} baris.`);
  await pool.end();
}

syncPopulationByAge().catch((err) => {
  console.error(err);
  process.exit(1);
});
