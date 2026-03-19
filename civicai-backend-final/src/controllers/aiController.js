const { analyzeImage, analyzeBase64 } = require("../services/aiService");
const { success, error }              = require("../utils/apiResponse");
const { getFileUrl }                  = require("../middleware/upload");
const logger                          = require("../utils/logger");

/**
 * POST /api/ai/analyze
 * Option A: multipart form with field "photo"
 * Option B: JSON body with { imageBase64, mimeType }
 */
exports.analyzePhoto = async (req, res, next) => {
  try {
    let result;

    if (req.file) {
      result = await analyzeImage(req.file.path, req.file.mimetype);
      result.photoUrl      = getFileUrl(req, req.file.path);
      result.photoFilename = req.file.filename;
      result.photoPath     = req.file.path;
    } else if (req.body?.imageBase64) {
      const mimeType = req.body.mimeType || "image/jpeg";
      result = await analyzeBase64(req.body.imageBase64, mimeType);
    } else {
      return error(
        res,
        "Provide a photo (multipart field: 'photo') or 'imageBase64' in JSON body.",
        400
      );
    }

    logger.info(`AI analysis: type=${result.type}, confidence=${result.confidence}%`);
    return success(res, { analysis: result }, "Analysis complete.");
  } catch (err) {
    next(err);
  }
};
