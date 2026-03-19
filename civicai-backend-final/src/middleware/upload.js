const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const MAX_SIZE   = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;
const ALLOWED    = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,image/jpg").split(",");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Disk storage — organised by YYYY/MM
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const dir = path.join(
      UPLOAD_DIR,
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, "0")
    );
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Only ${ALLOWED.join(", ")} allowed.`
      ),
      false
    );
  }
};

/** Single photo — field name: "photo" */
const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
}).single("photo");

/** Multiple photos — field name: "photos", max 3 */
const uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 3 },
}).array("photos", 3);

/** Build a public URL from a relative file path */
const getFileUrl = (req, filePath) => {
  const rel = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${rel}`;
};

/** Wrap multer middleware in a promise for async/await usage */
const handleUpload = (multerFn) => (req, res) =>
  new Promise((resolve, reject) => {
    multerFn(req, res, (err) => (err ? reject(err) : resolve()));
  });

module.exports = { uploadPhoto, uploadPhotos, getFileUrl, handleUpload };
