const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message    = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message    = Object.values(err.errors).map((e) => e.message).join(". ");
  }

  if (err.name === "JsonWebTokenError")  { statusCode = 401; message = "Invalid token."; }
  if (err.name === "TokenExpiredError")  { statusCode = 401; message = "Token expired. Please log in again."; }

  if (err.code === "LIMIT_FILE_SIZE")       { statusCode = 400; message = `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 10}MB.`; }
  if (err.code === "LIMIT_FILE_COUNT")      { statusCode = 400; message = "Too many files uploaded."; }
  if (err.code === "LIMIT_UNEXPECTED_FILE") { statusCode = 400; message = "Unexpected file field name."; }

  if (process.env.NODE_ENV !== "test") {
    logger.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);
    if (statusCode === 500 && err.stack) logger.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success:   false,
    message:   `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler, notFound };
