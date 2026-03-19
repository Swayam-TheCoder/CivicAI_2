const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/issueController");
const { protect, restrict, optionalAuth } = require("../middleware/auth");
const { reportLimiter } = require("../middleware/rateLimiter");
const { uploadPhoto, handleUpload } = require("../middleware/upload");
const {
  createIssueRules, updateIssueRules,
  issueQueryRules, mongoIdRule, validate,
} = require("../middleware/validators");

// ── Public ─────────────────────────────────────────────────────────────────
router.get("/",       optionalAuth, issueQueryRules, validate, ctrl.getIssues);
router.get("/stats",  ctrl.getStats);
router.get("/nearby", ctrl.getNearbyIssues);

// ── Authenticated ─────────────────────────────────────────────────────────
router.use(protect);

// IMPORTANT: /my/reports MUST be defined BEFORE /:id
// otherwise Express treats "my" as a Mongo ObjectId → CastError
router.get("/my/reports", ctrl.getMyIssues);

router.get("/:id", mongoIdRule("id"), validate, ctrl.getIssue);

router.post(
  "/",
  reportLimiter,
  (req, res, next) => handleUpload(uploadPhoto)(req, res).then(next).catch(next),
  createIssueRules,
  validate,
  ctrl.createIssue
);

router.post("/:id/vote",
  mongoIdRule("id"), validate,
  ctrl.voteIssue
);

// ── Officer / Admin ────────────────────────────────────────────────────────
router.patch(
  "/:id",
  restrict("officer", "admin"),
  mongoIdRule("id"), updateIssueRules, validate,
  ctrl.updateIssue
);

router.delete(
  "/:id",
  restrict("admin"),
  mongoIdRule("id"), validate,
  ctrl.deleteIssue
);

module.exports = router;
