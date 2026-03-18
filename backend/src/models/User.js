const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ["citizen", "officer", "admin"],
      default: "citizen",
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, "Invalid phone number"],
    },
    ward: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Daily report tracking
    dailyReports: {
      count: { type: Number, default: 0 },
      date: { type: String, default: "" }, // YYYY-MM-DD
    },
    // Track reported issue IDs
    reportedIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
    // Track voted issue IDs
    votedIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ── Pre-save: hash password ────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ─────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: check daily report limit ─────────────────────────────
userSchema.methods.canReport = function () {
  const today = new Date().toISOString().split("T")[0];
  const limit = parseInt(process.env.REPORT_DAILY_LIMIT || "3");
  if (this.dailyReports.date !== today) return true; // new day, reset
  return this.dailyReports.count < limit;
};

userSchema.methods.incrementDailyReport = async function () {
  const today = new Date().toISOString().split("T")[0];
  if (this.dailyReports.date !== today) {
    this.dailyReports = { count: 1, date: today };
  } else {
    this.dailyReports.count += 1;
  }
  await this.save();
};

// ── Virtual: reports remaining today ──────────────────────────────────────
userSchema.virtual("reportsRemainingToday").get(function () {
  const today = new Date().toISOString().split("T")[0];
  const limit = parseInt(process.env.REPORT_DAILY_LIMIT || "3");
  if (this.dailyReports.date !== today) return limit;
  return Math.max(0, limit - this.dailyReports.count);
});

// ── Remove sensitive fields from JSON ─────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
