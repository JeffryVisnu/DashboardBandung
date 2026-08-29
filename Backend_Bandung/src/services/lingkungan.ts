import { pool } from "../db.js";

export async function resolveTahun(tahun: unknown): Promise<number> {
  if (typeof tahun === "string" && tahun.trim() !== "") return Number(tahun);
  const latest = await pool.query(`SELECT MAX(tahun) AS tahun FROM sampah_capaian`);
  return Number(latest.rows[0].tahun);
}

export async function getSummary(tahun: number) {
  const capaian = await pool.query(
    `SELECT COALESCE(SUM(jumlah_sampah), 0) AS "totalSampah" FROM sampah_capaian WHERE tahun = $1`,
    [tahun]
  );
  const ritasi = await pool.query(
    `SELECT COALESCE(SUM(jumlah_ritasi), 0) AS "totalRitasi" FROM sampah_ritasi WHERE tahun = $1`,
    [tahun]
  );
  const kompensasi = await pool.query(
    `SELECT COALESCE(SUM(jumlah_kompensasi), 0) AS "totalKompensasi" FROM sampah_kompensasi WHERE tahun = $1`,
    [tahun]
  );
  const jenis = await pool.query(
    `SELECT COUNT(DISTINCT jenis_sampah) AS "jumlahJenisSampah" FROM sampah_produksi WHERE tahun = $1`,
    [tahun]
  );

  return {
    tahun,
    totalSampahTon: Number(capaian.rows[0].totalSampah),
    totalRitasi: Number(ritasi.rows[0].totalRitasi),
    totalKompensasiRupiah: Number(kompensasi.rows[0].totalKompensasi),
    jumlahJenisSampah: Number(jenis.rows[0].jumlahJenisSampah),
  };
}

export async function getTrend() {
  const result = await pool.query(
    `SELECT tahun, COALESCE(SUM(jumlah_sampah), 0) AS "totalSampah"
     FROM sampah_capaian
     GROUP BY tahun
     ORDER BY tahun`
  );
  return result.rows.map((r) => ({ tahun: r.tahun, totalSampahTon: Number(r.totalSampah) }));
}

export async function getCapaianPerBulan(tahun: number) {
  const result = await pool.query(
    `SELECT bulan, jumlah_sampah AS "jumlahSampah", satuan
     FROM sampah_capaian
     WHERE tahun = $1
     ORDER BY id`,
    [tahun]
  );
  return result.rows.map((r) => ({ bulan: r.bulan, jumlahSampahTon: Number(r.jumlahSampah), satuan: r.satuan }));
}

export async function getProduksiPerJenis(tahun: number) {
  const result = await pool.query(
    `SELECT jenis_sampah AS jenis, produksi_sampah AS "produksiSampah", satuan
     FROM sampah_produksi
     WHERE tahun = $1
     ORDER BY produksi_sampah DESC`,
    [tahun]
  );
  return result.rows.map((r) => ({ jenis: r.jenis, produksiSampah: Number(r.produksiSampah), satuan: r.satuan }));
}

export async function getRitasiPerBulan(tahun: number) {
  const result = await pool.query(
    `SELECT bulan, jumlah_ritasi AS "jumlahRitasi"
     FROM sampah_ritasi
     WHERE tahun = $1
     ORDER BY id`,
    [tahun]
  );
  return result.rows.map((r) => ({ bulan: r.bulan, jumlahRitasi: Number(r.jumlahRitasi) }));
}

export async function getKompensasiPerKategori(tahun: number) {
  const result = await pool.query(
    `SELECT kategori_kompensasi AS kategori, COALESCE(SUM(jumlah_kompensasi), 0) AS jumlah
     FROM sampah_kompensasi
     WHERE tahun = $1
     GROUP BY kategori_kompensasi
     ORDER BY jumlah DESC`,
    [tahun]
  );
  return result.rows.map((r) => ({ kategori: r.kategori, jumlahRupiah: Number(r.jumlah) }));
}
