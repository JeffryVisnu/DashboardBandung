import { pool } from "../db.js";

export async function resolvePeriod(tahun: unknown, semester: unknown): Promise<{ tahun: number; semester: number }> {
  if (typeof tahun === "string" && typeof semester === "string") {
    return { tahun: Number(tahun), semester: Number(semester) };
  }
  const latest = await pool.query(
    `SELECT tahun, semester_ajaran AS semester FROM smp_sekolah
     ORDER BY tahun DESC, semester_ajaran DESC LIMIT 1`
  );
  return latest.rows[0];
}

export async function getSummary(tahun: number, semester: number) {
  const sekolahResult = await pool.query(
    `SELECT COUNT(*) AS "jumlahSekolah" FROM smp_sekolah WHERE tahun = $1 AND semester_ajaran = $2`,
    [tahun, semester]
  );
  const siswaResult = await pool.query(
    `SELECT COALESCE(SUM(jumlah_siswa), 0) AS "jumlahSiswa" FROM smp_peserta_didik
     WHERE tahun = $1 AND semester_ajaran = $2`,
    [tahun, semester]
  );
  const guruResult = await pool.query(
    `SELECT COALESCE(SUM(jumlah_ptk), 0) AS "jumlahGuru" FROM smp_ptk
     WHERE tahun = $1 AND semester_ajaran = $2 AND jenis_ptk = 'GURU'`,
    [tahun, semester]
  );

  const jumlahSekolah = Number(sekolahResult.rows[0].jumlahSekolah);
  const jumlahSiswa = Number(siswaResult.rows[0].jumlahSiswa);
  const jumlahGuru = Number(guruResult.rows[0].jumlahGuru);

  return {
    tahun,
    semester,
    jumlahSekolah,
    jumlahSiswa,
    jumlahGuru,
    rataGuruPerSekolah: jumlahSekolah > 0 ? jumlahGuru / jumlahSekolah : 0,
    rataSiswaPerSekolah: jumlahSekolah > 0 ? jumlahSiswa / jumlahSekolah : 0,
  };
}

export async function getTrend() {
  const result = await pool.query(
    `SELECT pd.tahun,
            COALESCE(SUM(pd.jumlah_siswa), 0) AS "jumlahSiswa"
     FROM smp_peserta_didik pd
     WHERE pd.semester_ajaran = (
       SELECT MAX(pd2.semester_ajaran) FROM smp_peserta_didik pd2 WHERE pd2.tahun = pd.tahun
     )
     GROUP BY pd.tahun
     ORDER BY pd.tahun`
  );
  return result.rows.map((r) => ({ tahun: r.tahun, jumlahSiswa: Number(r.jumlahSiswa) }));
}

export async function getSekolahPerKecamatan(tahun: number, semester: number) {
  const result = await pool.query(
    `SELECT kemendagri_nama_kecamatan AS kecamatan, status_sekolah AS status, COUNT(*) AS jumlah
     FROM smp_sekolah
     WHERE tahun = $1 AND semester_ajaran = $2
     GROUP BY kemendagri_nama_kecamatan, status_sekolah
     ORDER BY kemendagri_nama_kecamatan, status_sekolah`,
    [tahun, semester]
  );
  return result.rows;
}

export async function getGuruSiswaPerKecamatan(tahun: number, semester: number) {
  const siswaResult = await pool.query(
    `SELECT kemendagri_nama_kecamatan AS kecamatan, COALESCE(SUM(jumlah_siswa), 0) AS "jumlahSiswa"
     FROM smp_peserta_didik
     WHERE tahun = $1 AND semester_ajaran = $2
     GROUP BY kemendagri_nama_kecamatan`,
    [tahun, semester]
  );
  const guruResult = await pool.query(
    `SELECT kemendagri_nama_kecamatan AS kecamatan, COALESCE(SUM(jumlah_ptk), 0) AS "jumlahGuru"
     FROM smp_ptk
     WHERE tahun = $1 AND semester_ajaran = $2 AND jenis_ptk = 'GURU'
     GROUP BY kemendagri_nama_kecamatan`,
    [tahun, semester]
  );

  const guruByKecamatan = new Map(guruResult.rows.map((r) => [r.kecamatan, Number(r.jumlahGuru)]));
  return siswaResult.rows.map((r) => ({
    kecamatan: r.kecamatan,
    jumlahSiswa: Number(r.jumlahSiswa),
    jumlahGuru: guruByKecamatan.get(r.kecamatan) ?? 0,
  }));
}

export async function getSiswaGender(tahun: number, semester: number) {
  const result = await pool.query(
    `SELECT jenis_kelamin AS "jenisKelamin", COALESCE(SUM(jumlah_siswa), 0) AS "jumlahSiswa"
     FROM smp_peserta_didik
     WHERE tahun = $1 AND semester_ajaran = $2
     GROUP BY jenis_kelamin`,
    [tahun, semester]
  );
  return result.rows;
}

export async function getSebaranSekolah(tahun: number, semester: number, status?: string) {
  const conditions = ["tahun = $1", "semester_ajaran = $2"];
  const params: (string | number)[] = [tahun, semester];

  if (status) {
    params.push(status.toUpperCase());
    conditions.push(`status_sekolah = $${params.length}`);
  }

  const result = await pool.query(
    `SELECT kemendagri_nama_kecamatan AS kecamatan, status_sekolah AS status, COUNT(*) AS jumlah
     FROM smp_sekolah
     WHERE ${conditions.join(" AND ")}
     GROUP BY kemendagri_nama_kecamatan, status_sekolah
     ORDER BY kemendagri_nama_kecamatan`,
    params
  );
  return result.rows;
}
