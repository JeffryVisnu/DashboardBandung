import "dotenv/config";

/**
 * Env var wajib diisi (mis. JWT_SECRET) — sengaja bikin proses langsung gagal start kalau
 * kosong, daripada diam-diam jalan dengan nilai kosong/tidak aman (mis. token admin
 * ditandatangani pakai secret "" dan bisa dipalsukan siapa pun).
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Env var ${name} wajib diisi di .env — cek .env.example.`);
  }
  return value;
}

export const JWT_SECRET = requireEnv("JWT_SECRET");

/** Origin frontend yang boleh akses /api/categories, /api/admin, dan /uploads (bukan /api/v1,
 * yang memang dibuka untuk aplikasi luar). Default ke localhost cuma buat kemudahan development. */
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
