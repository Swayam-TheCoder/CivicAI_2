const Anthropic = require("@anthropic-ai/sdk");
const fs        = require("fs");
const path      = require("path");
const logger    = require("../utils/logger");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a civic issue detection AI for an Indian smart city platform (Pune Municipal Corporation).
Analyze images strictly for public infrastructure problems.
Be precise, factual, and concise. Never invent details.`;

const USER_PROMPT = `Analyze this image for civic/infrastructure problems.
Respond ONLY with valid JSON — no markdown, no explanation:
{
  "type": "pothole" | "garbage" | "streetlight" | "flooding" | "graffiti" | "unknown",
  "confidence": <integer 0-100>,
  "severity": "low" | "medium" | "high" | "critical",
  "title": "<concise 5-8 word issue title>",
  "description": "<one factual sentence describing the issue>",
  "action": "<one direct sentence: recommended departmental action>",
  "hazard": <true if immediate safety risk, else false>
}`;

/**
 * Analyse an image file using Claude vision.
 * @param {string} filePath  - Absolute or relative path to the image
 * @param {string} mimeType  - e.g. "image/jpeg"
 * @returns {Promise<Object>} AI result
 */
const analyzeImage = async (filePath, mimeType = "image/jpeg") => {
  try {
    const imageData = fs.readFileSync(filePath);
    const base64    = imageData.toString("base64");

    const response = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
          { type: "text",  text: USER_PROMPT },
        ],
      }],
    });

    const raw  = response.content.map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    // Validate / sanitize required fields
    return {
      type:        ["pothole","garbage","streetlight","flooding","graffiti"].includes(result.type) ? result.type : "unknown",
      confidence:  Math.min(100, Math.max(0, parseInt(result.confidence) || 50)),
      severity:    ["low","medium","high","critical"].includes(result.severity) ? result.severity : "medium",
      title:       String(result.title || "Civic Issue Detected").slice(0, 120),
      description: String(result.description || "Issue requires review.").slice(0, 500),
      action:      String(result.action || "Submit for manual inspection.").slice(0, 300),
      hazard:      Boolean(result.hazard),
      model:       "claude-sonnet-4-20250514",
      analyzedAt:  new Date(),
    };
  } catch (err) {
    logger.error(`AI analysis failed: ${err.message}`);

    // Return safe fallback so the report can still be filed
    return {
      type:        "unknown",
      confidence:  0,
      severity:    "medium",
      title:       "Analysis Unavailable",
      description: "Automatic detection failed. Manual review required.",
      action:      "Submit to General Municipal Dept. for inspection.",
      hazard:      false,
      model:       "claude-sonnet-4-20250514",
      analyzedAt:  new Date(),
      error:       err.message,
    };
  }
};

/**
 * Analyse raw base64 string (sent directly from client)
 */
const analyzeBase64 = async (base64Data, mimeType = "image/jpeg") => {
  try {
    const response = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } },
          { type: "text",  text: USER_PROMPT },
        ],
      }],
    });

    const raw   = response.content.map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return {
      type:        ["pothole","garbage","streetlight","flooding","graffiti"].includes(result.type) ? result.type : "unknown",
      confidence:  Math.min(100, Math.max(0, parseInt(result.confidence) || 50)),
      severity:    ["low","medium","high","critical"].includes(result.severity) ? result.severity : "medium",
      title:       String(result.title || "Civic Issue Detected").slice(0, 120),
      description: String(result.description || "Issue requires review.").slice(0, 500),
      action:      String(result.action || "Submit for manual inspection.").slice(0, 300),
      hazard:      Boolean(result.hazard),
      model:       "claude-sonnet-4-20250514",
      analyzedAt:  new Date(),
    };
  } catch (err) {
    logger.error(`AI (base64) analysis failed: ${err.message}`);
    return {
      type: "unknown", confidence: 0, severity: "medium",
      title: "Analysis Unavailable",
      description: "Automatic detection failed. Manual review required.",
      action: "Submit to General Municipal Dept. for inspection.",
      hazard: false, model: "claude-sonnet-4-20250514", analyzedAt: new Date(),
    };
  }
};

module.exports = { analyzeImage, analyzeBase64 };
