import { pool } from "../db.js";

export async function resolveTahun(tahun: unknown): Promise<number> {
  if (typeof tahun === "string" && tahun.trim() !== "") return Number(tahun);
  const latest = await pool.query(`SELECT MAX(tahun) AS tahun FROM rumah_sakit`);
  return Number(latest.rows[0].tahun);
}

export async function getSummary(tahun: number) {
  const result = await pool.query(
    `SELECT COUNT(*) AS "jumlahRumahSakit",
            COUNT(*) FILTER (WHERE status_rs = 'SWASTA') AS "jumlahSwasta",
            COUNT(*) FILTER (WHERE status_rs != 'SWASTA') AS "jumlahPemerintah",
            COUNT(DISTINCT bps_nama_kecamatan) AS "jumlahKecamatan"
     FROM rumah_sakit
     WHERE tahun = $1`,
    [tahun]
  );
  const row = result.rows[0];
  return {
    tahun,
    jumlahRumahSakit: Number(row.jumlahRumahSakit),
    jumlahSwasta: Number(row.jumlahSwasta),
    jumlahPemerintah: Number(row.jumlahPemerintah),
    jumlahKecamatan: Number(row.jumlahKecamatan),
  };
}

export async function getTrend() {
  const result = await pool.query(
    `SELECT tahun, COUNT(*) AS "jumlahRumahSakit"
     FROM rumah_sakit
     GROUP BY tahun
     ORDER BY tahun`
  );
  return result.rows.map((r) => ({ tahun: r.tahun, jumlahRumahSakit: Number(r.jumlahRumahSakit) }));
}

export async function getRumahSakitPerKecamatan(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, COUNT(*) AS jumlah
     FROM rumah_sakit
     WHERE tahun = $1
     GROUP BY bps_nama_kecamatan
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({ kecamatan: r.kecamatan, jumlah: Number(r.jumlah) }));
}

export async function getJenisStatus(tahun: number) {
  const jenis = await pool.query(
    `SELECT jenis_rs AS jenis, COUNT(*) AS jumlah FROM rumah_sakit WHERE tahun = $1 GROUP BY jenis_rs ORDER BY COUNT(*) DESC`,
    [tahun]
  );
  const status = await pool.query(
    `SELECT status_rs AS status, COUNT(*) AS jumlah FROM rumah_sakit WHERE tahun = $1 GROUP BY status_rs ORDER BY COUNT(*) DESC`,
    [tahun]
  );
  return {
    tahun,
    jenis: jenis.rows.map((r) => ({ jenis: r.jenis, jumlah: Number(r.jumlah) })),
    status: status.rows.map((r) => ({ status: r.status, jumlah: Number(r.jumlah) })),
  };
}

export async function getSebaranRumahSakit(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, jenis_rs AS jenis, status_rs AS status, kelas,
            latitude, longitude
     FROM rumah_sakit
     WHERE tahun = $1
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({
    kecamatan: r.kecamatan,
    jenis: r.jenis,
    status: r.status,
    kelas: r.kelas,
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
  }));
}
