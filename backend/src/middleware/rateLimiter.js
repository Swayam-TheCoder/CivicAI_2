const rateLimit = require("express-rate-limit");
const { error }  = require("../utils/apiResponse");

const createLimiter = (options) =>
  rateLimit({
    windowMs: options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max:      options.max      || parseInt(process.env.RATE_LIMIT_MAX)        || 100,
    message:  options.message  || "Too many requests. Please try again later.",
    handler:  (req, res) => error(res, options.message || "Too many requests. Please try again later.", 429),
    standardHeaders: true,
    legacyHeaders:   false,
  });

// General API limiter
const apiLimiter = createLimiter({ max: 100, windowMs: 15 * 60 * 1000 });

// Strict limiter for auth endpoints
const authLimiter = createLimiter({
  max:     10,
  windowMs: 15 * 60 * 1000,
  message: "Too many auth attempts. Try again in 15 minutes.",
});

// Report submission limiter (extra protection for the daily-limit endpoint)
const reportLimiter = createLimiter({
  max:     20,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many report requests from this IP.",
});

// AI analysis limiter
const aiLimiter = createLimiter({
  max:     30,
  windowMs: 60 * 60 * 1000,
  message: "AI analysis quota reached. Try again in an hour.",
});

module.exports = { apiLimiter, authLimiter, reportLimiter, aiLimiter };
