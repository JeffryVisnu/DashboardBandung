import { pool } from "../db.js";

export async function resolveTahun(tahun: unknown): Promise<number> {
  if (typeof tahun === "string" && tahun.trim() !== "") return Number(tahun);
  const latest = await pool.query(`SELECT MAX(tahun) AS tahun FROM kolam_retensi`);
  return Number(latest.rows[0].tahun);
}

export async function getSummary(tahun: number) {
  const kolam = await pool.query(
    `SELECT COALESCE(SUM(jumlah_kolam), 0) AS "jumlahKolam", COUNT(DISTINCT bps_nama_kecamatan) AS "jumlahKecamatan"
     FROM kolam_retensi WHERE tahun = $1`,
    [tahun]
  );
  const volume = await pool.query(
    `SELECT COALESCE(SUM(volume_tampungan_total), 0) AS "totalVolume" FROM kolam_retensi_volume WHERE tahun = $1`,
    [tahun]
  );

  return {
    tahun,
    jumlahKolam: Number(kolam.rows[0].jumlahKolam),
    jumlahKecamatan: Number(kolam.rows[0].jumlahKecamatan),
    totalVolumeMeterKubik: Number(volume.rows[0].totalVolume),
  };
}

export async function getTrend() {
  const result = await pool.query(
    `SELECT tahun, COALESCE(SUM(jumlah_kolam), 0) AS "jumlahKolam"
     FROM kolam_retensi
     GROUP BY tahun
     ORDER BY tahun`
  );
  return result.rows.map((r) => ({ tahun: r.tahun, jumlahKolam: Number(r.jumlahKolam) }));
}

export async function getKolamPerKecamatan(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, COALESCE(SUM(jumlah_kolam), 0) AS jumlah
     FROM kolam_retensi
     WHERE tahun = $1
     GROUP BY bps_nama_kecamatan
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({ kecamatan: r.kecamatan, jumlahKolam: Number(r.jumlah) }));
}

export async function getVolumePerKecamatan(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, COALESCE(SUM(volume_tampungan_total), 0) AS volume
     FROM kolam_retensi_volume
     WHERE tahun = $1
     GROUP BY bps_nama_kecamatan
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({ kecamatan: r.kecamatan, volumeMeterKubik: Number(r.volume) }));
}

export async function getSebaranKolam(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, nama, sub_das AS "subDas", nama_sungai AS "namaSungai", jumlah_kolam AS "jumlahKolam"
     FROM kolam_retensi
     WHERE tahun = $1
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({
    kecamatan: r.kecamatan,
    nama: r.nama,
    subDas: r.subDas,
    namaSungai: r.namaSungai,
    jumlahKolam: Number(r.jumlahKolam),
  }));
}
