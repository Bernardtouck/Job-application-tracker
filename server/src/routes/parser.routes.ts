// server/src/routes/parser.routes.ts

import { Router } from "express";
import multer from "multer";
import { authenticateJWT } from "../middleware/auth.middleware";
import { parseText, parseImage } from "../controllers/parser.controller";

const router = Router();

// ── Multer config ────────────────────────────────────────
// Store in memory (no disk writes) — buffer passed directly to Tesseract
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const accepted = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (accepted.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ── Routes ───────────────────────────────────────────────

/**
 * POST /parse/text
 * Parse a raw job posting text (EN or DE)
 * Protected — requires JWT
 * Body: { text: string }
 */
router.post("/text", authenticateJWT, parseText);

/**
 * POST /parse/image
 * Parse a job posting screenshot (PNG / JPG / WEBP)
 * Protected — requires JWT
 * Body: multipart/form-data, field "image"
 */
router.post("/image", authenticateJWT, upload.single("image"), parseImage);

export default router;