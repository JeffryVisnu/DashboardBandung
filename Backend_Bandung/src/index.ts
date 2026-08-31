import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";
import categoriesRouter from "./routes/categories.js";
import v1Router from "./routes/v1.js";
import adminRouter from "./routes/admin.js";
import { FRONTEND_ORIGIN } from "./config.js";

dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT ?? 4000;

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

app.listen(PORT, () => {
  console.log(`BE jalan di http://localhost:${PORT}`);
});

