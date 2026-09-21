import "dotenv/config";
import dns from "node:dns";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import categoriesRouter from "./routes/categories.js";
import v1Router from "./routes/v1.js";
import adminRouter from "./routes/admin.js";
import { FRONTEND_ORIGIN } from "./config.js";

dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT ?? 4000;
// Default ke 127.0.0.1 supaya server dev tidak otomatis nyambung dari perangkat lain di
// jaringan/WiFi yang sama — set HOST=0.0.0.0 secara eksplisit kalau memang butuh diakses dari
// luar mesin ini (mis. di dalam container produksi di belakang reverse proxy).
const HOST = process.env.HOST ?? "127.0.0.1";

// crossOriginResourcePolicy dilonggarkan ke "cross-origin" karena /uploads (logo situs) memang
// sengaja dimuat lintas origin oleh Dashboard_Bandung (port beda dari backend ini).
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(express.json());

// File yang diunggah admin (logo situs, dsb.) — dilayani statis.
app.use("/uploads", cors({ origin: FRONTEND_ORIGIN }), express.static("uploads"));

// Dipakai internal oleh frontend Dashboard Bandung sendiri — dibatasi ke origin-nya saja.
app.use("/api/categories", cors({ origin: FRONTEND_ORIGIN }), categoriesRouter);

// API publik ber-key untuk dikonsumsi aplikasi lain (mis. aplikasi pemerintah lain) — origin dibuka.
app.use("/api/v1", cors({ origin: "*" }), v1Router);

// Panel admin (login, kelola API key, pantau sync, visibilitas sektor) — dibatasi ke origin FE saja.
app.use("/api/admin", cors({ origin: FRONTEND_ORIGIN }), adminRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handler terakhir — menangkap error yang lolos dari semua route (mis. body JSON tidak
// valid dilempar oleh express.json() sebelum masuk ke router mana pun). Tanpa ini, Express
// membalas dengan halaman default berisi stack trace & path absolut server ke klien mana pun,
// bahkan yang tidak terautentikasi.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(400).json({ error: "Request tidak valid." });
});

app.listen(Number(PORT), HOST, () => {
  console.log(`BE jalan di http://${HOST}:${PORT}`);
});

