const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { success, created, error } = require("../utils/apiResponse");
const logger = require("../utils/logger");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, ward } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return error(res, "Email already registered.", 409);

    const user = await User.create({ name, email, password, phone, ward });

    const accessToken  = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin    = new Date();
    await user.save();

    logger.info(`New user registered: ${email}`);

    return created(res, {
      user:        user.toPublicJSON(),
      accessToken,
      refreshToken,
      expiresIn:   process.env.JWT_EXPIRES_IN || "7d",
    }, "Registration successful.");
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user)          return error(res, "Invalid email or password.", 401);
    if (!user.isActive) return error(res, "Account deactivated. Contact support.", 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, "Invalid email or password.", 401);

    const accessToken  = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin    = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    return success(res, {
      user:        user.toPublicJSON(),
      accessToken,
      refreshToken,
      expiresIn:   process.env.JWT_EXPIRES_IN || "7d",
    }, "Login successful.");
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, "Refresh token required.", 400);

    const decoded = verifyRefreshToken(refreshToken);
    const user    = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return error(res, "Invalid or expired refresh token.", 401);
    }

    const newAccessToken  = signAccessToken(user._id, user.role);
    const newRefreshToken = signRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return success(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Token refreshed.");
  } catch (err) {
    if (err.name === "TokenExpiredError") return error(res, "Refresh token expired. Please log in again.", 401);
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return success(res, {}, "Logged out successfully.");
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("reportedIssues", "issueId type status priority createdAt")
      .lean({ virtuals: true });
    return success(res, { user }, "Profile fetched.");
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "ward"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return success(res, { user: user.toPublicJSON() }, "Profile updated.");
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return error(res, "Both passwords required.", 400);
    if (newPassword.length < 6)           return error(res, "New password must be at least 6 characters.", 400);

    const user    = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return error(res, "Current password is incorrect.", 401);

    user.password = newPassword;
    await user.save();

    return success(res, {}, "Password changed successfully.");
  } catch (err) {
    next(err);
  }
};
