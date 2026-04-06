// server/src/types/parser.types.ts

// ── Supported languages ──────────────────────────────────
export type SupportedLanguage = "en" | "de" | "unknown";

// ── Contract types (EN + DE normalized) ─────────────────
export type ContractType =
  | "full-time"
  | "part-time"
  | "internship"
  | "mini-job"
  | "freelance"
  | "temporary"
  | "unknown";

// ── Work mode ────────────────────────────────────────────
export type WorkMode = "on-site" | "hybrid" | "remote" | "unknown";

// ── Confidence score for each extracted field ────────────
export interface FieldConfidence {
  value: string | null;
  confidence: number; // 0.0 → 1.0
  source: string;     // which pattern matched, for debugging
}

// ── Raw extraction result (internal use) ─────────────────
export interface RawParseResult {
  title:        FieldConfidence;
  company:      FieldConfidence;
  location:     FieldConfidence;
  salary:       FieldConfidence;
  contractType: FieldConfidence;
  workMode:     FieldConfidence;
  language:     SupportedLanguage;
}

// ── Clean result returned to the client ──────────────────
export interface ParsedJob {
  title:        string | null;
  company:      string | null;
  location:     string | null;
  salary:       string | null;
  contractType: ContractType;
  workMode:     WorkMode;
  language:     SupportedLanguage;
  confidence:   number; // overall confidence (0.0 → 1.0)
}

// ── Request bodies ───────────────────────────────────────
export interface ParseTextRequest {
  text: string;
}

// ── API response ─────────────────────────────────────────
export interface ParseResponse {
  success: boolean;
  data:    ParsedJob | null;
  message: string;
  rawText?: string; // only present when parsed from image (for debugging)
}