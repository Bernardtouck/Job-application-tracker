// server/src/services/ocr.service.ts
//
// OCR service using Tesseract.js
// Supports English and German job posting screenshots
//

import Tesseract from "tesseract.js";

// ── Tesseract config ─────────────────────────────────────
const TESSERACT_CONFIG = {
  // PSM 3 = fully automatic page segmentation (best for job postings)
  tessedit_pageseg_mode: "3",
  // Preserve interword spaces
  preserve_interword_spaces: "1",
};

/**
 * Extract text from an image buffer using Tesseract OCR.
 * Tries EN+DE combined first for best coverage on bilingual postings.
 *
 * @param imageBuffer - Buffer of the uploaded image (PNG / JPG / WEBP)
 * @returns Extracted raw text string
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    // Use combined EN+DE language model for best coverage
    const { data } = await Tesseract.recognize(imageBuffer, "eng+deu", {
      logger: () => {}, // suppress progress logs in production
    });

    const text = data.text.trim();

    if (!text || text.length < 20) {
      throw new Error("OCR extracted insufficient text — image may be too low quality");
    }

    return text;
  } catch (err: any) {
    // Re-throw with a clean message for the controller
    throw new Error(`OCR failed: ${err.message}`);
  }
}

/**
 * Validate that an uploaded file is an accepted image type.
 * Called before passing the buffer to Tesseract.
 */
export function validateImageMimeType(mimetype: string): boolean {
  const accepted = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  return accepted.includes(mimetype.toLowerCase());
}