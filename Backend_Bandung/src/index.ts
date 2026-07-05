import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";
import categoriesRouter from "./routes/categories.js";
import placeholderRouter from "./routes/placeholder.js";
import v1Router from "./routes/v1.js";

dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());

// Dipakai internal oleh frontend Dashboard Bandung sendiri — dibatasi ke origin-nya saja.
app.use("/api/categories", cors({ origin: "http://localhost:3000" }), categoriesRouter);

// API publik ber-key untuk dikonsumsi aplikasi lain (mis. aplikasi pemerintah lain) — origin dibuka.
app.use("/api/v1", cors({ origin: "*" }), v1Router);
app.use("/api/v1", cors({ origin: "*" }), placeholderRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`BE jalan di http://localhost:${PORT}`);
});

