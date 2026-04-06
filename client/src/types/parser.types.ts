// src/types/parser.types.ts

export type SupportedLanguage = "en" | "de" | "unknown";
export type ContractType = "full-time" | "part-time" | "internship" | "mini-job" | "freelance" | "temporary" | "unknown";
export type WorkMode = "on-site" | "hybrid" | "remote" | "unknown";

export interface ParsedJob {
  title:        string | null;
  company:      string | null;
  location:     string | null;
  salary:       string | null;
  contractType: ContractType;
  workMode:     WorkMode;
  language:     SupportedLanguage;
  confidence:   number;
}

export interface ParseResponse {
  success: boolean;
  data:    ParsedJob | null;
  message: string;
  rawText?: string;
}