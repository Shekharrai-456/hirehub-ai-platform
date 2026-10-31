import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadBase = path.join(__dirname, "../../uploads");
const resumesDir = path.join(uploadBase, "resumes");
const logosDir = path.join(uploadBase, "logos");

[uploadBase, resumesDir, logosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "resume") {
      cb(null, resumesDir);
    } else {
      cb(null, logosDir);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e6);
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOC/DOCX files are permitted for resumes."), false);
    }
  } else {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP, and SVG image files are allowed."), false);
    }
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
});
