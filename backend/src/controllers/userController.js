const User  = require("../models/User");
const Issue = require("../models/Issue");
const { success, error, paginated } = require("../utils/apiResponse");

// ── List all users (admin) ─────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password -refreshToken")
      .lean({ virtuals: true });

    return paginated(res, users, total, page, limit, "Users fetched.");
  } catch (err) {
    next(err);
  }
};

// ── Get single user ────────────────────────────────────────────────────────
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -refreshToken")
      .populate("reportedIssues", "issueId type status createdAt")
      .lean({ virtuals: true });

    if (!user) return error(res, "User not found.", 404);
    return success(res, { user }, "User fetched.");
  } catch (err) {
    next(err);
  }
};

// ── Update user role / status (admin) ────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const allowed  = ["role", "isActive", "ward"];
    const updates  = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password -refreshToken");
    if (!user) return error(res, "User not found.", 404);
    return success(res, { user }, "User updated.");
  } catch (err) {
    next(err);
  }
};

// ── Delete user (admin) ────────────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, "User not found.", 404);
    if (user._id.toString() === req.user._id.toString()) return error(res, "Cannot delete your own account.", 400);
    await user.deleteOne();
    return success(res, {}, "User deleted.");
  } catch (err) {
    next(err);
  }
};
