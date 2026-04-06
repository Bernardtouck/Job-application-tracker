// src/api/parser.api.ts

import API from "./axios";
import type { ParseResponse } from "../types/parser.types";

/**
 * Parse a raw job posting text (EN or DE)
 */
export const parseJobText = async (text: string): Promise<ParseResponse> => {
  const res = await API.post<ParseResponse>("/parse/text", { text });
  return res.data;
};

/**
 * Parse a job posting screenshot (PNG / JPG / WEBP)
 */
export const parseJobImage = async (file: File): Promise<ParseResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await API.post<ParseResponse>("/parse/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};