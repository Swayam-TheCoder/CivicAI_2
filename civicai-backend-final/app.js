const express        = require("express");
const cors           = require("cors");
const helmet         = require("helmet");
const morgan         = require("morgan");
const compression    = require("compression");
const mongoSanitize  = require("express-mongo-sanitize");
const path           = require("path");

const { apiLimiter }             = require("./src/middleware/rateLimiter");
const { errorHandler, notFound } = require("./src/middleware/errorHandler");
const logger                     = require("./src/utils/logger");

const authRoutes  = require("./src/routes/authRoutes");
const issueRoutes = require("./src/routes/issueRoutes");
const aiRoutes    = require("./src/routes/aiRoutes");
const userRoutes  = require("./src/routes/userRoutes");

const app = express();

// ── Security ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3001",
  ],
  credentials:     true,
  methods:         ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders:  ["Content-Type", "Authorization"],
}));

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── NoSQL injection sanitize ───────────────────────────────────────────────
app.use(mongoSanitize());

// ── Compression ────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip:   (req) => req.url === "/api/health",
  }));
}

// ── Static file serving for uploads ───────────────────────────────────────
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")));

// ── Global rate limiter ────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success:   true,
    status:    "UP",
    service:   "CivicAI Backend",
    version:   "1.0.0",
    env:       process.env.NODE_ENV,
    uptime:    Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",   authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/ai",     aiRoutes);
app.use("/api/users",  userRoutes);

// ── API index ──────────────────────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({
    name: "CivicAI API", version: "1.0.0",
    endpoints: {
      health:  "GET  /api/health",
      auth:    "POST /api/auth/register | POST /api/auth/login | POST /api/auth/refresh | GET /api/auth/me",
      issues:  "GET|POST /api/issues | GET|PATCH|DELETE /api/issues/:id",
      vote:    "POST /api/issues/:id/vote",
      stats:   "GET  /api/issues/stats",
      nearby:  "GET  /api/issues/nearby?lng=&lat=&radius=",
      mine:    "GET  /api/issues/my/reports",
      ai:      "POST /api/ai/analyze",
      users:   "GET  /api/users  (admin only)",
    },
  });
});

// ── 404 + Error handler ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
