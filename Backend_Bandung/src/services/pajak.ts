import { pool } from "../db.js";

export async function resolveTahun(tahun: unknown): Promise<number> {
  if (typeof tahun === "string" && tahun.trim() !== "") return Number(tahun);
  const latest = await pool.query(`SELECT MAX(tahun) AS tahun FROM target_realisasi_pajak`);
  return Number(latest.rows[0].tahun);
}

export async function getSummary(tahun: number) {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(nilai_pajak) FILTER (WHERE kategori = 'TARGET'), 0) AS "totalTarget",
       COALESCE(SUM(nilai_pajak) FILTER (WHERE kategori = 'REALISASI'), 0) AS "totalRealisasi",
       COUNT(DISTINCT jenis_mata_pajak) AS "jumlahJenisPajak"
     FROM target_realisasi_pajak
     WHERE tahun = $1`,
    [tahun]
  );
  const row = result.rows[0];
  const totalTarget = Number(row.totalTarget);
  const totalRealisasi = Number(row.totalRealisasi);

  return {
    tahun,
    totalTargetRupiah: totalTarget,
    totalRealisasiRupiah: totalRealisasi,
    persentaseCapaian: totalTarget > 0 ? (totalRealisasi / totalTarget) * 100 : 0,
    jumlahJenisPajak: Number(row.jumlahJenisPajak),
  };
}

export async function getTrend() {
  const result = await pool.query(
    `SELECT tahun,
            COALESCE(SUM(nilai_pajak) FILTER (WHERE kategori = 'TARGET'), 0) AS target,
            COALESCE(SUM(nilai_pajak) FILTER (WHERE kategori = 'REALISASI'), 0) AS realisasi
     FROM target_realisasi_pajak
     GROUP BY tahun
     ORDER BY tahun`
  );
  return result.rows.map((r) => ({
    tahun: r.tahun,
    totalTargetRupiah: Number(r.target),
    totalRealisasiRupiah: Number(r.realisasi),
  }));
}

export async function getPajakPerJenis(tahun: number) {
  const result = await pool.query(
    `SELECT jenis_mata_pajak AS jenis,
            COALESCE(SUM(nilai_pajak) FILTER (WHERE kategori = 'TARGET'), 0) AS target,
            COALESCE(SUM(nilai_pajak) FILTER (WHERE kategori = 'REALISASI'), 0) AS realisasi
     FROM target_realisasi_pajak
     WHERE tahun = $1
     GROUP BY jenis_mata_pajak
     ORDER BY realisasi DESC`,
    [tahun]
  );
  return result.rows.map((r) => ({
    jenis: r.jenis,
    targetRupiah: Number(r.target),
    realisasiRupiah: Number(r.realisasi),
  }));
}
