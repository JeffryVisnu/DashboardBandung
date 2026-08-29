import { pool } from "../db.js";

export async function resolveTahun(tahun: unknown): Promise<number> {
  if (typeof tahun === "string" && tahun.trim() !== "") return Number(tahun);
  const latest = await pool.query(`SELECT MAX(tahun) AS tahun FROM dtks`);
  return Number(latest.rows[0].tahun);
}

export async function getSummary(tahun: number) {
  const dtks = await pool.query(
    `SELECT COALESCE(SUM(jumlah_individu), 0) AS total, COUNT(DISTINCT bps_nama_kecamatan) AS "jumlahKecamatan"
     FROM dtks WHERE tahun = $1`,
    [tahun]
  );
  const p3ke = await pool.query(
    `SELECT COALESCE(SUM(jumlah_individu), 0) AS total FROM p3ke WHERE tahun = $1`,
    [tahun]
  );

  return {
    tahun,
    totalIndividuDtks: Number(dtks.rows[0].total),
    jumlahKecamatan: Number(dtks.rows[0].jumlahKecamatan),
    totalIndividuP3ke: Number(p3ke.rows[0].total),
  };
}

export async function getTrendDtks() {
  const result = await pool.query(
    `SELECT tahun, COALESCE(SUM(jumlah_individu), 0) AS total
     FROM dtks
     GROUP BY tahun
     ORDER BY tahun`
  );
  return result.rows.map((r) => ({ tahun: r.tahun, totalIndividu: Number(r.total) }));
}

export async function getDtksPerKecamatan(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, COALESCE(SUM(jumlah_individu), 0) AS jumlah
     FROM dtks
     WHERE tahun = $1
     GROUP BY bps_nama_kecamatan
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({ kecamatan: r.kecamatan, jumlahIndividu: Number(r.jumlah) }));
}

export async function getP3kePerKecamatan(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, COALESCE(SUM(jumlah_individu), 0) AS jumlah
     FROM p3ke
     WHERE tahun = $1
     GROUP BY bps_nama_kecamatan
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({ kecamatan: r.kecamatan, jumlahIndividu: Number(r.jumlah) }));
}
