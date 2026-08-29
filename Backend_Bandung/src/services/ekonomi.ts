import { pool } from "../db.js";

async function resolveTahunFor(table: string, tahun: unknown): Promise<number> {
  if (typeof tahun === "string" && tahun.trim() !== "") return Number(tahun);
  const latest = await pool.query(`SELECT MAX(tahun) AS tahun FROM ${table}`);
  return Number(latest.rows[0].tahun);
}

export const resolveTahun = (tahun: unknown) => resolveTahunFor("pasar_modern", tahun);

export async function getSummary(tahun: number) {
  const ekspor = await pool.query(`SELECT nilai FROM ekspor_non_migas WHERE tahun = $1`, [tahun]);
  const pasar = await pool.query(
    `SELECT COALESCE(SUM(jumlah), 0) AS "jumlahPasar" FROM pasar_modern WHERE tahun = $1`,
    [tahun]
  );
  const halal = await pool.query(
    `SELECT COUNT(*) AS "jumlahSertifikasi" FROM sertifikasi_halal_umkm WHERE tahun = $1`,
    [tahun]
  );

  return {
    tahun,
    nilaiEksporUsd: ekspor.rows[0] ? Number(ekspor.rows[0].nilai) : null,
    jumlahPasarModern: Number(pasar.rows[0].jumlahPasar),
    jumlahSertifikasiHalal: Number(halal.rows[0].jumlahSertifikasi),
  };
}

export async function getTrendEkspor() {
  const result = await pool.query(`SELECT tahun, nilai FROM ekspor_non_migas ORDER BY tahun`);
  return result.rows.map((r) => ({ tahun: r.tahun, nilaiEksporUsd: Number(r.nilai) }));
}

export async function getPasarPerJenis(tahun: number) {
  const result = await pool.query(
    `SELECT jenis_pasar AS jenis, jumlah, satuan FROM pasar_modern WHERE tahun = $1 ORDER BY jumlah DESC`,
    [tahun]
  );
  return result.rows.map((r) => ({ jenis: r.jenis, jumlah: Number(r.jumlah), satuan: r.satuan }));
}

export async function getTrendSertifikasiHalal() {
  const result = await pool.query(
    `SELECT tahun, COUNT(*) AS jumlah FROM sertifikasi_halal_umkm GROUP BY tahun ORDER BY tahun`
  );
  return result.rows.map((r) => ({ tahun: r.tahun, jumlahSertifikasi: Number(r.jumlah) }));
}

export async function getDaftarSertifikasiHalal(tahun: number) {
  const result = await pool.query(
    `SELECT nama_merk AS "namaMerk", produk_dihasilkan AS "produkDihasilkan"
     FROM sertifikasi_halal_umkm
     WHERE tahun = $1
     ORDER BY nama_merk`,
    [tahun]
  );
  return result.rows;
}
