const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const MAX_SIZE   = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;
const ALLOWED    = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,image/jpg").split(",");

// Ensure upload directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Disk storage — organise by YYYY/MM
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now  = new Date();
    const dir  = path.join(UPLOAD_DIR, String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${uuidv4()}${ext}`;
    cb(null, name);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Only ${ALLOWED.join(", ")} are allowed.`), false);
  }
};

// Single photo upload (field: "photo")
const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
}).single("photo");

// Multiple photos (field: "photos", max 3)
const uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 3 },
}).array("photos", 3);

/**
 * Build public URL for an uploaded file
 */
const getFileUrl = (req, filePath) => {
  const relative = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${relative}`;
};

/**
 * Wrap multer in a promise so we can use async/await
 */
const handleUpload = (uploadFn) => (req, res) => {
  return new Promise((resolve, reject) => {
    uploadFn(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = { uploadPhoto, uploadPhotos, getFileUrl, handleUpload };
