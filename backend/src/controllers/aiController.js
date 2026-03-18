const { analyzeImage, analyzeBase64 } = require("../services/aiService");
const { success, error }              = require("../utils/apiResponse");
const { getFileUrl }                  = require("../middleware/upload");
const logger                          = require("../utils/logger");
const fs                              = require("fs");

/**
 * POST /api/ai/analyze
 * Accepts a photo upload (multipart) OR base64 JSON body.
 * Returns AI detection result WITHOUT creating an issue.
 */
exports.analyzePhoto = async (req, res, next) => {
  try {
    let result;

    // Option A: file uploaded via multipart
    if (req.file) {
      result = await analyzeImage(req.file.path, req.file.mimetype);
      // Clean up temp file after analysis (it's not saved to an issue yet)
      // Keep it — we return the URL so the client can attach it to a subsequent submit
      result.photoUrl      = getFileUrl(req, req.file.path);
      result.photoFilename = req.file.filename;
      result.photoPath     = req.file.path;
    }
    // Option B: base64 in JSON body
    else if (req.body?.imageBase64) {
      const mimeType = req.body.mimeType || "image/jpeg";
      result = await analyzeBase64(req.body.imageBase64, mimeType);
    } else {
      return error(res, "Provide a photo (multipart field: 'photo') or 'imageBase64' in body.", 400);
    }

    logger.info(`AI analysis complete — type: ${result.type}, confidence: ${result.confidence}%`);
    return success(res, { analysis: result }, "Analysis complete.");
  } catch (err) {
    next(err);
  }
};
