require("dotenv").config();
const http      = require("http");
const fs        = require("fs");
const app       = require("./app");
const connectDB = require("./src/config/db");
const logger    = require("./src/utils/logger");

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Ensure required directories exist on startup
["logs", process.env.UPLOAD_DIR || "uploads"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Fail fast if critical env vars are missing
const REQUIRED = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "ANTHROPIC_API_KEY"];
const missing  = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing env vars: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill in all values.");
  process.exit(1);
}

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info("─────────────────────────────────────");
      logger.info(`  CivicAI Backend  v1.0.0`);
      logger.info(`  ENV  : ${process.env.NODE_ENV}`);
      logger.info(`  PORT : ${PORT}`);
      logger.info(`  API  : http://localhost:${PORT}/api`);
      logger.info("─────────────────────────────────────");
    });
  } catch (err) {
    logger.error(`Failed to start: ${err.message}`);
    process.exit(1);
  }
};

// ── Graceful shutdown ──────────────────────────────────────────────────────
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    try {
      await require("mongoose").connection.close();
      logger.info("MongoDB connection closed.");
    } catch (_) {}
    process.exit(0);
  });
  setTimeout(() => { logger.error("Forced shutdown."); process.exit(1); }, 10000);
};

process.on("SIGTERM",            () => shutdown("SIGTERM"));
process.on("SIGINT",             () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled rejection: ${err?.message || err}`);
  shutdown("unhandledRejection");
});

start();
