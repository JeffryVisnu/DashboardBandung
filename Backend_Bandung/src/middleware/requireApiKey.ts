import type { NextFunction, Request, Response } from "express";
import { pool } from "../db.js";

export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const [scheme, key] = header.split(" ");

  if (scheme !== "Bearer" || !key) {
    res.status(401).json({ error: "Sertakan API key pada header Authorization: Bearer <key>." });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id FROM api_keys WHERE key = $1 AND is_active = true`,
      [key]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "API key tidak valid atau sudah dinonaktifkan." });
      return;
    }

    pool.query(`UPDATE api_keys SET last_used_at = now() WHERE key = $1`, [key]).catch(() => {});
    next();
  } catch {
    res.status(503).json({ error: "Gagal memvalidasi API key, coba lagi." });
  }
}
