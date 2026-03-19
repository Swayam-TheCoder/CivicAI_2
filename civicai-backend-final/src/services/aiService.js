const Anthropic = require("@anthropic-ai/sdk");
const fs        = require("fs");
const logger    = require("../utils/logger");

// Lazily create client so tests can set env vars first
let _client = null;
const getClient = () => {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
};

const SYSTEM_PROMPT =
  "You are a civic issue detection AI for an Indian smart city platform (Pune Municipal Corporation). " +
  "Analyze images strictly for public infrastructure problems. Be precise, factual, and concise. Never invent details.";

const USER_PROMPT =
  'Analyze this image for civic/infrastructure problems.\n' +
  'Respond ONLY with valid JSON — no markdown, no explanation:\n' +
  '{\n' +
  '  "type": "pothole" | "garbage" | "streetlight" | "flooding" | "graffiti" | "unknown",\n' +
  '  "confidence": <integer 0-100>,\n' +
  '  "severity": "low" | "medium" | "high" | "critical",\n' +
  '  "title": "<concise 5-8 word issue title>",\n' +
  '  "description": "<one factual sentence describing the issue>",\n' +
  '  "action": "<one direct sentence: recommended departmental action>",\n' +
  '  "hazard": <true if immediate safety risk, else false>\n' +
  '}';

const VALID_TYPES      = ["pothole", "garbage", "streetlight", "flooding", "graffiti"];
const VALID_SEVERITIES = ["low", "medium", "high", "critical"];

const sanitize = (raw) => ({
  type:        VALID_TYPES.includes(raw.type)           ? raw.type      : "unknown",
  confidence:  Math.min(100, Math.max(0, parseInt(raw.confidence, 10) || 50)),
  severity:    VALID_SEVERITIES.includes(raw.severity)  ? raw.severity  : "medium",
  title:       String(raw.title       || "Civic Issue Detected").slice(0, 120),
  description: String(raw.description || "Issue requires review.").slice(0, 500),
  action:      String(raw.action      || "Submit for manual inspection.").slice(0, 300),
  hazard:      Boolean(raw.hazard),
  model:       "claude-sonnet-4-20250514",
  analyzedAt:  new Date(),
});

const fallback = (errMsg) => ({
  type: "unknown", confidence: 0, severity: "medium",
  title: "Analysis Unavailable",
  description: "Automatic detection failed. Manual review required.",
  action: "Submit to General Municipal Dept. for inspection.",
  hazard: false, model: "claude-sonnet-4-20250514", analyzedAt: new Date(),
  error: errMsg,
});

const callClaude = async (base64Data, mimeType) => {
  const response = await getClient().messages.create({
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
  return JSON.parse(clean);
};

/**
 * Analyse an image file from disk
 * @param {string} filePath
 * @param {string} mimeType
 */
const analyzeImage = async (filePath, mimeType = "image/jpeg") => {
  try {
    const base64 = fs.readFileSync(filePath).toString("base64");
    return sanitize(await callClaude(base64, mimeType));
  } catch (err) {
    logger.error(`AI analyzeImage failed: ${err.message}`);
    return fallback(err.message);
  }
};

/**
 * Analyse a raw base64 string (sent directly from client)
 * @param {string} base64Data
 * @param {string} mimeType
 */
const analyzeBase64 = async (base64Data, mimeType = "image/jpeg") => {
  try {
    return sanitize(await callClaude(base64Data, mimeType));
  } catch (err) {
    logger.error(`AI analyzeBase64 failed: ${err.message}`);
    return fallback(err.message);
  }
};

module.exports = { analyzeImage, analyzeBase64 };
