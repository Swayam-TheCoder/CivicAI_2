const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");
const { error } = require("../utils/apiResponse");
const logger = require("../utils/logger");

/**
 * Protect — verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return error(res, "Access denied. No token provided.", 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) return error(res, "User not found or token invalid.", 401);
    if (!user.isActive) return error(res, "Account deactivated. Contact admin.", 403);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return error(res, "Token expired. Please log in again.", 401);
    if (err.name === "JsonWebTokenError")  return error(res, "Invalid token.", 401);
    logger.error(`Auth middleware error: ${err.message}`);
    return error(res, "Authentication error.", 500);
  }
};

/**
 * Restrict to specific roles
 * Usage: restrict("admin", "officer")
 */
const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, `Access denied. Requires role: ${roles.join(" or ")}.`, 403);
    }
    next();
  };
};

/**
 * Optional auth — attaches user if token present, continues either way
 */
const optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select("-password -refreshToken");
    }
  } catch (_) { /* silent */ }
  next();
};

module.exports = { protect, restrict, optionalAuth };
