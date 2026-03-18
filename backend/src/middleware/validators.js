const { body, param, query, validationResult } = require("express-validator");
const { error } = require("../utils/apiResponse");

/**
 * Run after validation rules — returns 400 with error list if invalid
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`);
    return error(res, messages[0], 400, errors.array());
  }
  next();
};

// ── Auth validators ────────────────────────────────────────────────────────

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 60 }),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").optional().matches(/^[0-9+\-\s]{7,15}$/).withMessage("Invalid phone number"),
  body("ward").optional().trim().isLength({ max: 50 }),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Issue validators ───────────────────────────────────────────────────────

const createIssueRules = [
  body("type")
    .isIn(["pothole", "garbage", "streetlight", "flooding", "graffiti", "unknown"])
    .withMessage("Invalid issue type"),
  body("description").optional().trim().isLength({ max: 1000 }),
  body("notes").optional().trim().isLength({ max: 500 }),
  body("location.address").optional().trim().isLength({ max: 200 }),
  body("location.ward").optional().trim().isLength({ max: 60 }),
  body("location.coords.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be [lng, lat]"),
];

const updateIssueRules = [
  body("status")
    .optional()
    .isIn(["New", "Assigned", "In Progress", "Resolved", "Critical", "Closed"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),
  body("notes").optional().trim().isLength({ max: 500 }),
];

const issueQueryRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1–100"),
  query("type").optional().isIn(["pothole", "garbage", "streetlight", "flooding", "graffiti", "unknown", ""]),
  query("status").optional().isIn(["New", "Assigned", "In Progress", "Resolved", "Critical", "Closed", ""]),
  query("priority").optional().isIn(["low", "medium", "high", "critical", ""]),
];

const mongoIdRule = (field = "id") =>
  param(field).isMongoId().withMessage(`Invalid ${field}`);

module.exports = {
  validate,
  registerRules,
  loginRules,
  createIssueRules,
  updateIssueRules,
  issueQueryRules,
  mongoIdRule,
};
