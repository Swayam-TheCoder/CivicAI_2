const mongoose = require("mongoose");

const ISSUE_TYPES = ["pothole", "garbage", "streetlight", "flooding", "graffiti", "unknown"];
const STATUSES    = ["New", "Assigned", "In Progress", "Resolved", "Critical", "Closed"];
const PRIORITIES  = ["low", "medium", "high", "critical"];
const DEPARTMENTS = {
  pothole:     { label: "Roads & Infrastructure Dept.", code: "PWD-01", officer: "Suresh Patil" },
  garbage:     { label: "Waste Management Dept.",       code: "SWM-02", officer: "Meena Sharma" },
  streetlight: { label: "Electrical Works Dept.",       code: "EWD-03", officer: "Rajiv Kulkarni" },
  flooding:    { label: "Drainage & Waterways Dept.",   code: "DRN-04", officer: "Anjali Nair" },
  graffiti:    { label: "Public Property Dept.",        code: "PPD-05", officer: "Vikram Desai" },
  unknown:     { label: "General Municipal Dept.",      code: "GMD-00", officer: "Municipal Office" },
};

// ── Sub-schema: AI analysis result ────────────────────────────────────────
const aiResultSchema = new mongoose.Schema({
  type:        { type: String, enum: ISSUE_TYPES },
  confidence:  { type: Number, min: 0, max: 100 },
  severity:    { type: String, enum: PRIORITIES },
  title:       String,
  description: String,
  action:      String,
  hazard:      { type: Boolean, default: false },
  model:       { type: String, default: "claude-sonnet-4-20250514" },
  analyzedAt:  { type: Date, default: Date.now },
}, { _id: false });

// ── Sub-schema: location ──────────────────────────────────────────────────
const locationSchema = new mongoose.Schema({
  address: { type: String, trim: true },
  ward:    { type: String, trim: true },
  city:    { type: String, default: "Pune" },
  coords:  {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
}, { _id: false });

// ── Sub-schema: status history ────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, enum: STATUSES },
  note:      String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

// ── Main Issue schema ──────────────────────────────────────────────────────
const issueSchema = new mongoose.Schema(
  {
    // Human-readable ID e.g. CIV-2025-0042
    issueId: {
      type: String,
      unique: true,
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Core fields
    type:        { type: String, enum: ISSUE_TYPES, required: true },
    status:      { type: String, enum: STATUSES, default: "New" },
    priority:    { type: String, enum: PRIORITIES, default: "medium" },
    title:       { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    notes:       { type: String, trim: true, maxlength: 500 }, // citizen additional notes

    // Department routing
    department: {
      label:   String,
      code:    String,
      officer: String,
    },

    // Photos
    photos: [{
      filename:    String,
      originalName:String,
      path:        String,
      url:         String,
      size:        Number,
      mimetype:    String,
      uploadedAt:  { type: Date, default: Date.now },
    }],

    // AI result
    aiAnalysis: aiResultSchema,

    // Location
    location: locationSchema,

    // Voting / deduplication
    votes: { type: Number, default: 1 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Co-reporters (duplicate detection — same location + type)
    reporters:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reporterCount: { type: Number, default: 1 },
    isMerged:      { type: Boolean, default: false },
    mergedInto:    { type: mongoose.Schema.Types.ObjectId, ref: "Issue", default: null },

    // Status history log
    statusHistory: [statusHistorySchema],

    // ETA from department
    eta: { type: String },

    resolvedAt: { type: Date },
    assignedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
issueSchema.index({ issueId: 1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ type: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ "location.coords": "2dsphere" }); // geo queries
issueSchema.index({ type: 1, status: 1 });

// ── Auto-generate issueId before save ─────────────────────────────────────
issueSchema.pre("save", async function (next) {
  if (!this.issueId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Issue").countDocuments();
    this.issueId = `CIV-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  // Auto-assign department based on type
  if (this.isModified("type") || !this.department?.code) {
    this.department = DEPARTMENTS[this.type] || DEPARTMENTS.unknown;
  }

  // Auto-escalate priority based on votes
  if (this.isModified("votes")) {
    if (this.votes >= 25)      this.priority = "critical";
    else if (this.votes >= 12) this.priority = "high";
    else if (this.votes >= 5)  this.priority = "medium";
  }

  // Record resolvedAt
  if (this.isModified("status") && this.status === "Resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }

  next();
});

// ── Virtual: days open ────────────────────────────────────────────────────
issueSchema.virtual("daysOpen").get(function () {
  const end = this.resolvedAt || new Date();
  return Math.floor((end - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Issue", issueSchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.ISSUE_TYPES = ISSUE_TYPES;
