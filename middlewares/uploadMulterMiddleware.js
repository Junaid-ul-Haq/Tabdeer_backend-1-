//const multer = require("multer");
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Ensure upload folders exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others";

    if (req.baseUrl.includes("auth")) folder = "uploads/signup";
    if (req.baseUrl.includes("scholarship")) folder = "uploads/scholarships";
    if (req.baseUrl.includes("business")) folder = "uploads/businessGrants";
    if (req.baseUrl.includes("consultation")) folder = "uploads/others";


    const fullPath = path.join(__dirname, "..", folder);
    ensureDir(fullPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ✅ File filter (no duplicate path require)
const fileFilter = (req, file, cb) => {
  // Allowed extensions: images, PDF, and Word documents
  const allowed = /jpeg|jpg|png|pdf|webp|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, PDF, or Word files are allowed"), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Utility to get DB path
const getRelativePath = (absolutePath) => {
  const normalized = absolutePath.replace(/\\/g, "/"); // Windows fix
  const index = normalized.indexOf("/uploads");
  return index !== -1 ? normalized.slice(index) : normalized;
};

export { upload, getRelativePath };
