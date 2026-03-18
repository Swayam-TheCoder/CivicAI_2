const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/aiController");
const { protect }   = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimiter");
const { uploadPhoto, handleUpload } = require("../middleware/upload");

router.use(protect);

/**
 * POST /api/ai/analyze
 * Body: multipart with field "photo"  — OR — JSON { imageBase64, mimeType }
 */
router.post(
  "/analyze",
  aiLimiter,
  (req, res, next) => {
    // Only run multer if content-type is multipart
    if (req.headers["content-type"]?.includes("multipart")) {
      return handleUpload(uploadPhoto)(req, res).then(next).catch(next);
    }
    next();
  },
  ctrl.analyzePhoto
);

module.exports = router;
