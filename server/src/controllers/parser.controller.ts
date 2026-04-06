// server/src/controllers/parser.controller.ts

import { Request, Response } from "express";
import Joi from "joi";
import { parseJobText } from "../services/parser.service";
import { extractTextFromImage, validateImageMimeType } from "../services/ocr.service";
import { ParseResponse } from "../types/parser.types";

// ── Validation schema ────────────────────────────────────
const parseTextSchema = Joi.object({
  text: Joi.string().min(50).max(20000).required().messages({
    "string.min":   "Job posting text must be at least 50 characters",
    "string.max":   "Job posting text must not exceed 20,000 characters",
    "any.required": "text field is required",
  }),
});

// ── POST /parse/text ─────────────────────────────────────
/**
 * Parse a raw job posting text (EN or DE)
 * Body: { text: string }
 */
export const parseText = async (req: Request, res: Response) => {
  const { error, value } = parseTextSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      data:    null,
      message: error.details[0].message,
    } satisfies ParseResponse);
  }

  try {
    const parsed = parseJobText(value.text);

    return res.status(200).json({
      success: true,
      data:    parsed,
      message: `Parsed successfully (${parsed.language.toUpperCase()}, confidence: ${Math.round(parsed.confidence * 100)}%)`,
    } satisfies ParseResponse);
  } catch (err: any) {
    console.error("[parser.controller] parseText error:", err);
    return res.status(500).json({
      success: false,
      data:    null,
      message: "Failed to parse job posting",
    } satisfies ParseResponse);
  }
};

// ── POST /parse/image ────────────────────────────────────
/**
 * Extract text from a job posting screenshot and parse it
 * Body: multipart/form-data with field "image"
 */
export const parseImage = async (req: Request, res: Response) => {
  // multer attaches the file to req.file
  if (!req.file) {
    return res.status(400).json({
      success: false,
      data:    null,
      message: "No image file provided. Send a PNG or JPG via multipart/form-data with field name 'image'",
    } satisfies ParseResponse);
  }

  if (!validateImageMimeType(req.file.mimetype)) {
    return res.status(415).json({
      success: false,
      data:    null,
      message: `Unsupported file type: ${req.file.mimetype}. Accepted: PNG, JPG, WEBP`,
    } satisfies ParseResponse);
  }

  try {
    // Step 1: OCR → raw text
    const rawText = await extractTextFromImage(req.file.buffer);

    // Step 2: Parse the extracted text
    const parsed = parseJobText(rawText, true); // isOcr = true to enable OCR-specific cleaning/preprocessing

    return res.status(200).json({
      success: true,
      data:    parsed,
      message: `Image parsed successfully (${parsed.language.toUpperCase()}, confidence: ${Math.round(parsed.confidence * 100)}%)`,
      rawText, // include raw OCR text so the client can show it for debugging/review
    } satisfies ParseResponse);
  } catch (err: any) {
    console.error("[parser.controller] parseImage error:", err);

    const isOcrError = err.message?.startsWith("OCR");
    return res.status(isOcrError ? 422 : 500).json({
      success: false,
      data:    null,
      message: err.message || "Failed to process image",
    } satisfies ParseResponse);
  }
};