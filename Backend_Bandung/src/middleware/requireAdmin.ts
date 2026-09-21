import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { pool } from "../db.js";

export interface AdminTokenPayload {
  adminId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

// Selain verifikasi signature, cek juga admin-nya masih ada di DB — supaya token yang sudah
// diterbitkan langsung berhenti berlaku begitu akun admin dihapus, tanpa perlu menunggu expiry.
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Sertakan token admin pada header Authorization: Bearer <token>." });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    const result = await pool.query(`SELECT id FROM admin_users WHERE id = $1`, [payload.adminId]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: "Token admin tidak valid atau sudah kedaluwarsa." });
      return;
    }
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token admin tidak valid atau sudah kedaluwarsa." });
  }
}
