require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { initDB } = require("./db");
const todosRouter = require("./routes");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/todos", todosRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Sayfa bulunamadı" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Beklenmeyen sunucu hatası" });
});

// ── Başlat ─────────────────────────────────────────────────
async function main() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Backend çalışıyor: http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Başlatma hatası:", err);
  process.exit(1);
});
