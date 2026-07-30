import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_FROM = process.env.SMTP_FROM ?? "no-reply@bandung.go.id";
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;

// Transport hanya dibuat kalau kredensial SMTP diisi di .env — di lingkungan dev/staging
// tanpa SMTP, form permintaan API tetap tersimpan ke DB, hanya email yang dilewati.
const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null;

export async function sendApiRequestConfirmation(to: string, name: string): Promise<void> {
  if (!transporter) {
    console.warn("SMTP belum dikonfigurasi — lewati pengiriman email konfirmasi permintaan API.");
    return;
  }
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject: "Permohonan Akses API Dashboard Bandung Diterima",
      text: `Halo ${name},\n\nPermohonan akses API Anda sudah kami terima dan sedang diproses, kurang lebih 2 hari kerja. Informasi selanjutnya akan disampaikan melalui email ini, mohon cek email Anda secara berkala.\n\nTerima kasih,\nDiskominfo Kota Bandung`,
    });
  } catch (err) {
    console.error("Gagal mengirim email konfirmasi permintaan API:", err);
  }
}

export async function sendAdminNotification(payload: {
  name: string;
  institution: string;
  email: string;
  website?: string | null;
  notes?: string | null;
}): Promise<void> {
  if (!transporter || !ADMIN_NOTIFY_EMAIL) return;
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: ADMIN_NOTIFY_EMAIL,
      subject: "Permintaan Akses API Baru — Dashboard Bandung",
      text: `Ada permintaan akses API baru:\n\nNama: ${payload.name}\nInstansi: ${payload.institution}\nEmail: ${payload.email}\nWebsite: ${payload.website ?? "-"}\nCatatan: ${payload.notes ?? "-"}\n\nTinjau di panel admin /eksekutif.`,
    });
  } catch (err) {
    console.error("Gagal mengirim notifikasi admin permintaan API:", err);
  }
}
