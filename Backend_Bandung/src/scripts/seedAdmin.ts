/**
 * Script sekali-jalan untuk membuat akun admin pertama.
 * Jalankan manual: npx tsx src/scripts/seedAdmin.ts <email> <password>
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error("Pemakaian: npx tsx src/scripts/seedAdmin.ts <email> <password>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await pool.query(`SELECT id FROM admin_users WHERE email = $1`, [email]);
  if (existing.rows.length > 0) {
    await pool.query(`UPDATE admin_users SET password_hash = $1 WHERE email = $2`, [passwordHash, email]);
    console.log(`Password admin "${email}" berhasil diperbarui.`);
  } else {
    await pool.query(`INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)`, [email, passwordHash]);
    console.log(`Admin "${email}" berhasil dibuat.`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
