import { pool } from "../db.js";

export async function resolveTahun(tahun: unknown): Promise<number> {
  if (typeof tahun === "string" && tahun.trim() !== "") return Number(tahun);
  const latest = await pool.query(`SELECT MAX(tahun) AS tahun FROM kepadatan_penduduk`);
  return Number(latest.rows[0].tahun);
}

export async function getSummary(tahun: number) {
  const kepadatan = await pool.query(
    `SELECT COUNT(*) AS "jumlahKecamatan", COALESCE(AVG(kepadatan_penduduk), 0) AS "rataKepadatan"
     FROM kepadatan_penduduk WHERE tahun = $1`,
    [tahun]
  );
  const kk = await pool.query(
    `SELECT COALESCE(SUM(jumlah_kk), 0) AS "totalKepalaKeluarga" FROM kepala_keluarga WHERE tahun = $1`,
    [tahun]
  );
  const luas = await pool.query(`SELECT COALESCE(SUM(luas_wilayah), 0) AS "totalLuasWilayah" FROM luas_kecamatan`);

  return {
    tahun,
    jumlahKecamatan: Number(kepadatan.rows[0].jumlahKecamatan),
    rataKepadatan: Number(kepadatan.rows[0].rataKepadatan),
    totalKepalaKeluarga: Number(kk.rows[0].totalKepalaKeluarga),
    totalLuasWilayah: Number(luas.rows[0].totalLuasWilayah),
  };
}

export async function getTrend() {
  const result = await pool.query(
    `SELECT tahun, COALESCE(AVG(kepadatan_penduduk), 0) AS "rataKepadatan"
     FROM kepadatan_penduduk
     GROUP BY tahun
     ORDER BY tahun`
  );
  return result.rows.map((r) => ({ tahun: r.tahun, rataKepadatan: Number(r.rataKepadatan) }));
}

export async function getKepadatanPerKecamatan(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, kepadatan_penduduk AS kepadatan, satuan
     FROM kepadatan_penduduk
     WHERE tahun = $1
     ORDER BY bps_nama_kecamatan`,
    [tahun]
  );
  return result.rows.map((r) => ({ kecamatan: r.kecamatan, kepadatan: Number(r.kepadatan), satuan: r.satuan }));
}

export async function getKepalaKeluargaPerKecamatan(tahun: number) {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, jenis_kelamin AS "jenisKelamin", jumlah_kk AS "jumlahKk"
     FROM kepala_keluarga
     WHERE tahun = $1
     ORDER BY bps_nama_kecamatan, jenis_kelamin`,
    [tahun]
  );

  const byKecamatan = new Map<string, { kecamatan: string; laki: number; perempuan: number }>();
  for (const row of result.rows) {
    const entry = byKecamatan.get(row.kecamatan) ?? { kecamatan: row.kecamatan, laki: 0, perempuan: 0 };
    if (row.jenisKelamin === "LAKI-LAKI") entry.laki = Number(row.jumlahKk);
    else if (row.jenisKelamin === "PEREMPUAN") entry.perempuan = Number(row.jumlahKk);
    byKecamatan.set(row.kecamatan, entry);
  }

  return Array.from(byKecamatan.values()).map((r) => ({
    kecamatan: r.kecamatan,
    jumlahKkLaki: r.laki,
    jumlahKkPerempuan: r.perempuan,
    totalKk: r.laki + r.perempuan,
  }));
}

export async function getLuasWilayahPerKecamatan() {
  const result = await pool.query(
    `SELECT bps_nama_kecamatan AS kecamatan, luas_wilayah AS "luasWilayah", satuan, tahun
     FROM luas_kecamatan
     ORDER BY bps_nama_kecamatan`
  );
  return result.rows.map((r) => ({
    kecamatan: r.kecamatan,
    luasWilayah: Number(r.luasWilayah),
    satuan: r.satuan,
    tahun: r.tahun,
  }));
}
