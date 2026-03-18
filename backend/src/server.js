require("dotenv").config();
const http      = require("http");
const app       = require("./app");
const connectDB = require("./config/db");
const logger    = require("./utils/logger");
const fs        = require("fs");

const PORT = parseInt(process.env.PORT) || 5000;

// Ensure required directories exist
["logs", process.env.UPLOAD_DIR || "uploads"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Validate critical env vars
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "ANTHROPIC_API_KEY"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(", ")}`);
  logger.error("Copy .env.example to .env and fill in all values.");
  process.exit(1);
}

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info("─────────────────────────────────────────");
      logger.info(`  CivicAI Backend v1.0.0`);
      logger.info(`  ENV  : ${process.env.NODE_ENV}`);
      logger.info(`  PORT : ${PORT}`);
      logger.info(`  API  : http://localhost:${PORT}/api`);
      logger.info("─────────────────────────────────────────");
    });
  } catch (err) {
    logger.error(`Server failed to start: ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    require("mongoose").connection.close(false, () => {
      logger.info("MongoDB connection closed.");
      process.exit(0);
    });
  });
  // Force exit after 10s
  setTimeout(() => { logger.error("Forced shutdown."); process.exit(1); }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  shutdown("unhandledRejection");
});

startServer();
