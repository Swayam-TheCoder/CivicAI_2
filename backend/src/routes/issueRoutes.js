const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/issueController");
const { protect, restrict, optionalAuth } = require("../middleware/auth");
const { reportLimiter }  = require("../middleware/rateLimiter");
const { uploadPhoto, uploadPhotos, handleUpload } = require("../middleware/upload");
const {
  createIssueRules, updateIssueRules,
  issueQueryRules, mongoIdRule, validate,
} = require("../middleware/validators");

// ── Public / optional-auth ─────────────────────────────────────────────────
router.get("/",        optionalAuth, issueQueryRules, validate, ctrl.getIssues);
router.get("/stats",   ctrl.getStats);
router.get("/nearby",  ctrl.getNearbyIssues);
router.get("/:id",     optionalAuth, mongoIdRule("id"), validate, ctrl.getIssue);

// ── Citizen (authenticated) ────────────────────────────────────────────────
router.use(protect);

router.get("/my/reports", ctrl.getMyIssues);

router.post(
  "/",
  reportLimiter,
  (req, res, next) => handleUpload(uploadPhoto)(req, res).then(next).catch(next),
  createIssueRules,
  validate,
  ctrl.createIssue
);

router.post("/:id/vote", mongoIdRule("id"), validate, ctrl.voteIssue);

// ── Officer / Admin only ───────────────────────────────────────────────────
router.patch(
  "/:id",
  restrict("officer", "admin"),
  mongoIdRule("id"),
  updateIssueRules,
  validate,
  ctrl.updateIssue
);

router.delete(
  "/:id",
  restrict("admin"),
  mongoIdRule("id"),
  validate,
  ctrl.deleteIssue
);

module.exports = router;
