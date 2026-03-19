const rateLimit = require("express-rate-limit");
const { error } = require("../utils/apiResponse");

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs:        windowMs || 15 * 60 * 1000,
    max:             max      || 100,
    standardHeaders: true,
    legacyHeaders:   false,
    handler: (req, res) => error(res, message || "Too many requests. Please try again later.", 429),
  });

const apiLimiter = createLimiter({
  max:     parseInt(process.env.RATE_LIMIT_MAX,        10) || 100,
  windowMs:parseInt(process.env.RATE_LIMIT_WINDOW_MS,  10) || 15 * 60 * 1000,
  message: "Too many requests. Please try again later.",
});

const authLimiter = createLimiter({
  max:     10,
  windowMs:15 * 60 * 1000,
  message: "Too many auth attempts. Try again in 15 minutes.",
});

const reportLimiter = createLimiter({
  max:     20,
  windowMs:60 * 60 * 1000,
  message: "Too many report submissions from this IP.",
});

const aiLimiter = createLimiter({
  max:     30,
  windowMs:60 * 60 * 1000,
  message: "AI analysis quota reached. Try again in an hour.",
});

module.exports = { apiLimiter, authLimiter, reportLimiter, aiLimiter };
