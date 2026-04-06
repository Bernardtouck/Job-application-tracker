// server/src/services/parser.service.ts
//
// Multi-layer NLP extraction engine for job postings (EN / DE)
// Strategy: pattern matching → contextual scoring → normalization
//

import {
  SupportedLanguage,
  ContractType,
  WorkMode,
  FieldConfidence,
  RawParseResult,
  ParsedJob,
} from "../types/parser.types";

// ═══════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════════

const DE_KEYWORDS = [
  "wir suchen", "stellenangebot", "stellenbeschreibung", "bewerbung",
  "aufgaben", "anforderungen", "vollzeit", "teilzeit", "gehalt",
  "standort", "homeoffice", "unbefristet", "minijob", "praktikum",
  "ihre aufgaben", "ihr profil", "wir bieten", "kenntnisse",
  "berufserfahrung", "ausbildung", "deutschkenntnisse",
];

const EN_KEYWORDS = [
  "we are looking", "job description", "requirements", "responsibilities",
  "full-time", "part-time", "salary", "location", "remote",
  "hybrid", "benefits", "qualifications", "experience", "skills",
  "apply now", "about us", "about the role", "what you'll do",
];

export function detectLanguage(text: string): SupportedLanguage {
  const lower = text.toLowerCase();
  const deScore = DE_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const enScore = EN_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  if (deScore === 0 && enScore === 0) return "unknown";
  if (deScore > enScore) return "de";
  if (enScore > deScore) return "en";
  return "en"; // default to EN on tie
}

// ═══════════════════════════════════════════════════════════
// TEXT PREPROCESSING
// ═══════════════════════════════════════════════════════════

// Major German cities for direct OCR location detection
export const DE_CITIES = [
  "Berlin","Hamburg","München","Munich","Köln","Cologne","Frankfurt",
  "Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig","Bremen",
  "Dresden","Hannover","Nürnberg","Nuremberg","Duisburg","Bochum",
  "Wuppertal","Bielefeld","Bonn","Münster","Karlsruhe","Mannheim",
  "Augsburg","Wiesbaden","Gelsenkirchen","Mönchengladbach","Braunschweig",
  "Kiel","Chemnitz","Aachen","Halle","Magdeburg","Freiburg","Krefeld",
  "Lübeck","Oberhausen","Erfurt","Mainz","Rostock","Kassel","Hagen",
  "Hamm","Saarbrücken","Mülheim","Potsdam","Ludwigshafen","Oldenburg",
  "Leverkusen","Osnabrück","Solingen","Heidelberg","Herne","Neuss",
  "Darmstadt","Paderborn","Regensburg","Ingolstadt","Würzburg","Fürth",
  "Wolfsburg","Offenbach","Ulm","Heilbronn","Pforzheim","Göttingen",
  "Bottrop","Tübingen","Recklinghausen","Reutlingen","Bremerhaven",
  "Koblenz","Bergisch","Jena","Remscheid","Erlangen","Moers","Siegen",
  "Hildesheim","Salzgitter","Cottbus",
];

/**
 * Clean OCR artifacts from raw Tesseract output.
 * Tesseract often converts icons/logos into special characters
 * like ©, ®, ™, □, ■ which pollute the extracted text.
 */
export function cleanOcrArtifacts(raw: string): string {
  return raw
    // Remove common OCR icon substitutions
    .replace(/[©®™°•·§¶†‡]/g, " ")
    // Remove box-drawing and block characters (icon remnants)
    .replace(/[\u2500-\u257F\u2580-\u259F\u25A0-\u25FF]/g, " ")
    // Remove other common OCR noise characters
    .replace(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    // Remove isolated single non-alphanumeric chars (often icon OCR noise)
    .replace(/(^|\n|\s)[^\w\säöüÄÖÜß\n.,;:!?€$£%\-\/()]{1}(\s|$)/g, " ")
    // Collapse multiple spaces created by removals
    .replace(/ {2,}/g, " ")
    .trim();
}

export function preprocessText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Full pipeline: clean OCR artifacts then preprocess.
 * Used when input comes from Tesseract (image mode).
 */
export function preprocessOcrText(raw: string): string {
  return preprocessText(cleanOcrArtifacts(raw));
}

// ═══════════════════════════════════════════════════════════
// TITLE EXTRACTION
// ═══════════════════════════════════════════════════════════

const TITLE_PATTERNS_EN = [
  { re: /(?:position|role|job title|title)\s*[:\-–]\s*(.+)/i,           score: 0.95 },
  { re: /(?:hiring|looking for|seeking)\s+(?:a\s+|an\s+)?(.+?)(?:\s+to|\s+who|\s+with|$)/i, score: 0.85 },
  { re: /^(.{5,60}?)\s*[\|\-–]\s*(?:jobs?|careers?|apply)/im,           score: 0.80 },
  { re: /^([A-Z][a-zA-Z\s\-\/]{4,50})$/m,                               score: 0.60 },
];

const TITLE_PATTERNS_DE = [
  { re: /(?:position|stelle|jobtitel|berufsbezeichnung)\s*[:\-–]\s*(.+)/i, score: 0.95 },
  { re: /(?:wir suchen)\s+(?:eine[nm]?\s+)?(.+?)(?:\s+für|\s+mit|\s+zur|$)/i, score: 0.85 },
  { re: /^((?:[A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\s\-\/]{4,60}))(?:\s*[\|\-–]|\s*\()/m, score: 0.75 },
  { re: /Stellenangebot(?:\s*:\s*|\s+als\s+)(.+)/i,                     score: 0.90 },
];

const TITLE_NOISE = [
  /^(jobs?|karriere|career|apply|bewerben|stellenangebote|home)$/i,
  /\d{4,}/,         // contains long numbers
  /http/,           // URLs
  /[<>{}[\]]/,      // HTML remnants
];

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*[\|\-–]\s*(jobs?|careers?|karriere|gmbh|ag|inc\.|ltd\.).*/i, "")
    .replace(/\s*\(m\/w\/d\)/i, " (m/w/d)")
    .replace(/\s*\(f\/m\/d\)/i, " (f/m/d)")
    .trim();
}

function extractTitle(text: string, lang: SupportedLanguage): FieldConfidence {
  const patterns = lang === "de" ? TITLE_PATTERNS_DE : TITLE_PATTERNS_EN;
  for (const { re, score } of patterns) {
    const match = text.match(re);
    if (match && match[1]) {
      const value = cleanTitle(match[1]);
      if (value.length < 3 || value.length > 100) continue;
      if (TITLE_NOISE.some((n) => n.test(value))) continue;
      return { value, confidence: score, source: re.source };
    }
  }
  // Fallback: first non-empty line that looks like a title
  const firstLine = text.split("\n").find((l) => {
    const t = l.trim();
    return t.length > 5 && t.length < 80 && /[a-zA-ZäöüÄÖÜß]/.test(t);
  });
  if (firstLine) {
    return { value: cleanTitle(firstLine), confidence: 0.40, source: "first-line-fallback" };
  }
  return { value: null, confidence: 0, source: "no-match" };
}

// ═══════════════════════════════════════════════════════════
// COMPANY EXTRACTION
// ═══════════════════════════════════════════════════════════

const COMPANY_PATTERNS_EN = [
  { re: /(?:company|employer|organisation|organization)\s*[:\-–]\s*(.+)/i,    score: 0.95 },
  { re: /(?:at|@|join)\s+([A-Z][a-zA-Z0-9\s&\-\.]{2,40})(?:\s+as|\s+we|\.|,)/i, score: 0.85 },
  { re: /^([A-Z][a-zA-Z0-9\s&\-\.]{2,40})\s+is\s+(?:looking|hiring|seeking)/im, score: 0.90 },
  { re: /([A-Z][a-zA-Z0-9\s&\-\.]{2,40})\s+(?:GmbH|AG|Inc\.|Ltd\.|LLC|SE|NV|BV)/i, score: 0.92 },
];

const COMPANY_PATTERNS_DE = [
  { re: /(?:unternehmen|arbeitgeber|firma|gesellschaft)\s*[:\-–]\s*(.+)/i,    score: 0.95 },
  { re: /(?:bei|für)\s+(?:der\s+|die\s+|das\s+)?([A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\s&\-\.]{2,40})\s+(?:GmbH|AG|SE|KG|GbR)/i, score: 0.92 },
  { re: /^([A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\s&\-\.]{2,40})\s+(?:sucht|bietet|ist)/im, score: 0.85 },
  { re: /([A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\s&\-\.]{2,40})\s+(?:GmbH|AG|SE|KG|GbR|mbH)/i, score: 0.92 },
];

function extractCompany(text: string, lang: SupportedLanguage): FieldConfidence {
  const patterns = lang === "de" ? COMPANY_PATTERNS_DE : COMPANY_PATTERNS_EN;
  for (const { re, score } of patterns) {
    const match = text.match(re);
    if (match && match[1]) {
      const value = match[1].trim().replace(/\s+/g, " ");
      if (value.length < 2 || value.length > 80) continue;
      return { value, confidence: score, source: re.source };
    }
  }
  return { value: null, confidence: 0, source: "no-match" };
}

// ═══════════════════════════════════════════════════════════
// LOCATION EXTRACTION
// ═══════════════════════════════════════════════════════════

const LOCATION_PATTERNS_EN = [
  { re: /(?:location|office|based in|based at|city)\s*[:\-–]\s*([A-Za-z][a-zA-Z\s\-]{1,30}?)(?:[.,\n]|$)/i, score: 0.95 },
  { re: /(?:in|at)\s+([A-Z][a-zA-Z\s\-]{2,25}),?\s+(?:Germany|Deutschland|Austria|Switzerland|UK|US)/i,       score: 0.90 },
  { re: /Location\s*[:\-–]\s*([A-Za-z][a-zA-Z\s\-,]{2,40}?)(?:[.\n]|$)/i,                                   score: 0.92 },
];

const LOCATION_PATTERNS_DE = [
  { re: /(?:standort|ort|arbeitsort|einsatzort)\s*[:\-–]\s*([A-ZÄÖÜa-zäöüß][a-zA-ZäöüÄÖÜß\s\-]{1,30}?)(?:[.,\n]|$)/i, score: 0.95 },
  { re: /\b(\d{5})\s+([A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\-]{2,20})/i,                   score: 0.92 },
  { re: /([A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\-]{2,20})\s+(\d{5})\b/i,                   score: 0.90 },
  { re: /\bin\s+([A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\-]{2,20})(?:[.,\s]|$)/i,            score: 0.82 },
  { re: /(?:bei|für)\s+.+?\s+in\s+([A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\-]{2,20})(?:[.,\s]|$)/i, score: 0.85 },
];

/**
 * OCR fallback: scan for known German city names directly in the text.
 * Handles cases where city appears after an icon (\u00a9, \u00ae, box) with no keyword.
 * e.g. OCR output: "\u00a9 SoftConEx GmbH \u00a9 Berlin \u00a9 Feste Anstellung"
 */
function extractCityFromOcr(text: string): FieldConfidence {
  const lower = text.toLowerCase();
  for (const city of DE_CITIES) {
    const cityLower = city.toLowerCase();
    const escaped = cityLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordBoundary = new RegExp(
      `(^|[\\s,;|\u00a9\u00ae\-])(${escaped})([\\s,;|.\u00a9\u00ae\-]|$)`
    );
    if (wordBoundary.test(lower)) {
      return { value: city, confidence: 0.72, source: "city-list-ocr-fallback" };
    }
  }
  return { value: null, confidence: 0, source: "no-match" };
}

function extractLocation(text: string, lang: SupportedLanguage, isOcr = false): FieldConfidence {
  const patterns = lang === "de" ? LOCATION_PATTERNS_DE : LOCATION_PATTERNS_EN;
  for (const { re, score } of patterns) {
    const match = text.match(re);
    if (match) {
      // For zip code pattern, combine zip + city
      const value = match[2]
        ? `${match[1]} ${match[2]}`.trim()
        : match[1].trim().replace(/\s+/g, " ");
      if (value.length < 2 || value.length > 60) continue;
      return { value, confidence: score, source: re.source };
    }
  }
  // OCR fallback: scan for known German cities (handles icon-separated layouts)
  if (isOcr && lang === "de") {
    return extractCityFromOcr(text);
  }
  return { value: null, confidence: 0, source: "no-match" };
}

// ═══════════════════════════════════════════════════════════
// SALARY EXTRACTION + NORMALIZATION
// ═══════════════════════════════════════════════════════════

const SALARY_PATTERNS = [
  // EN: $80,000 - $100,000 / year
  { re: /\$\s*(\d[\d,\.]+)\s*(?:[-–to]+\s*\$?\s*(\d[\d,\.]+))?\s*(?:\/?\s*(year|yr|month|mo|hour|hr|k))?/i, score: 0.92, lang: "en" },
  // EN: £45,000
  { re: /£\s*(\d[\d,\.]+)\s*(?:[-–]\s*£?\s*(\d[\d,\.]+))?\s*(?:\/?\s*(year|month|hour|k))?/i,              score: 0.92, lang: "en" },
  // DE: 45.000 € - 55.000 € / Jahr
  { re: /(\d[\d\.,]+)\s*(?:[-–]\s*(\d[\d\.,]+))?\s*€\s*(?:\/?\s*(Jahr|Monat|Stunde|monatlich|jährlich))?/i, score: 0.92, lang: "de" },
  // DE: € 45.000
  { re: /€\s*(\d[\d\.,]+)\s*(?:[-–]\s*€?\s*(\d[\d\.,]+))?\s*(?:\/?\s*(Jahr|Monat|Stunde))?/i,               score: 0.90, lang: "de" },
  // Generic: salary: 50000
  { re: /(?:salary|gehalt|vergütung|entlohnung)\s*[:\-–]\s*([\d\.,]+(?:\s*[-–]\s*[\d\.,]+)?(?:\s*[€$£k])?(?:\s*\/\s*\w+)?)/i, score: 0.88, lang: "both" },
];

function normalizeSalary(raw: string, lang: SupportedLanguage): string {
  let s = raw.trim();
  // DE uses period as thousand separator → remove
  if (lang === "de") s = s.replace(/(\d)\.(\d{3})/g, "$1$2").replace(",", ".");
  // EN uses comma as thousand separator → remove
  if (lang === "en") s = s.replace(/,/g, "");
  return s.replace(/\s+/g, " ").trim();
}

function extractSalary(text: string, lang: SupportedLanguage): FieldConfidence {
  for (const { re, score, lang: pLang } of SALARY_PATTERNS) {
    if (pLang !== "both" && pLang !== lang) continue;
    const match = text.match(re);
    if (match) {
      const normalized = normalizeSalary(match[0], lang);
      return { value: normalized, confidence: score, source: re.source };
    }
  }
  return { value: null, confidence: 0, source: "no-match" };
}

// ═══════════════════════════════════════════════════════════
// CONTRACT TYPE EXTRACTION
// ═══════════════════════════════════════════════════════════

const CONTRACT_MAP: Array<{ patterns: RegExp[]; type: ContractType; score: number }> = [
  {
    patterns: [/full[\s-]?time/i, /vollzeit/i, /unbefristet/i, /permanent/i],
    type: "full-time", score: 0.95,
  },
  {
    patterns: [/part[\s-]?time/i, /teilzeit/i],
    type: "part-time", score: 0.95,
  },
  {
    patterns: [/intern(?:ship)?/i, /praktikum/i, /werkstudent/i],
    type: "internship", score: 0.95,
  },
  {
    patterns: [/mini[\s-]?job/i, /450[\s-]?€/i, /geringfügig/i],
    type: "mini-job", score: 0.95,
  },
  {
    patterns: [/freelance/i, /freiberuflich/i, /selbstständig/i, /contractor/i],
    type: "freelance", score: 0.90,
  },
  {
    patterns: [/temporar/i, /befristet/i, /fixed[\s-]?term/i, /zeitlich/i],
    type: "temporary", score: 0.90,
  },
];

function extractContractType(text: string): FieldConfidence {
  for (const { patterns, type, score } of CONTRACT_MAP) {
    for (const re of patterns) {
      if (re.test(text)) {
        return { value: type, confidence: score, source: re.source };
      }
    }
  }
  return { value: "unknown", confidence: 0, source: "no-match" };
}

// ═══════════════════════════════════════════════════════════
// WORK MODE EXTRACTION
// ═══════════════════════════════════════════════════════════

const WORK_MODE_MAP: Array<{ patterns: RegExp[]; mode: WorkMode; score: number }> = [
  {
    patterns: [/\bhybrid\b/i, /hybrides?\s+arbeiten/i, /hybrid[\s-]?work/i],
    mode: "hybrid", score: 0.95,
  },
  {
    patterns: [/\bremote\b/i, /home[\s-]?office/i, /homeoffice/i, /fully\s+remote/i, /100%\s+remote/i, /work\s+from\s+home/i],
    mode: "remote", score: 0.95,
  },
  {
    patterns: [/on[\s-]?site/i, /vor\s+ort/i, /präsenz/i, /in[\s-]?office/i, /in[\s-]?person/i],
    mode: "on-site", score: 0.90,
  },
];

function extractWorkMode(text: string): FieldConfidence {
  for (const { patterns, mode, score } of WORK_MODE_MAP) {
    for (const re of patterns) {
      if (re.test(text)) {
        return { value: mode, confidence: score, source: re.source };
      }
    }
  }
  return { value: "unknown", confidence: 0, source: "no-match" };
}

// ═══════════════════════════════════════════════════════════
// OVERALL CONFIDENCE SCORE
// ═══════════════════════════════════════════════════════════

function computeOverallConfidence(result: RawParseResult): number {
  const fields = [
    { conf: result.title.confidence,        weight: 0.30 },
    { conf: result.company.confidence,      weight: 0.25 },
    { conf: result.location.confidence,     weight: 0.20 },
    { conf: result.salary.confidence,       weight: 0.10 },
    { conf: result.contractType.confidence, weight: 0.08 },
    { conf: result.workMode.confidence,     weight: 0.07 },
  ];
  const score = fields.reduce((acc, { conf, weight }) => acc + conf * weight, 0);
  return Math.round(score * 100) / 100;
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════

/**
 * Parse a raw job posting text (EN or DE) and extract structured data.
 * @param rawText - The raw text to parse
 * @param isOcr   - Set to true when text comes from Tesseract OCR
 *                  Enables OCR-specific cleaning and city list fallback
 */
export function parseJobText(rawText: string, isOcr = false): ParsedJob {
  const text      = isOcr ? preprocessOcrText(rawText) : preprocessText(rawText);
  const language  = detectLanguage(text);

  const raw: RawParseResult = {
    title:        extractTitle(text, language),
    company:      extractCompany(text, language),
    location:     extractLocation(text, language, isOcr),
    salary:       extractSalary(text, language),
    contractType: extractContractType(text),
    workMode:     extractWorkMode(text),
    language,
  };

  const confidence = computeOverallConfidence(raw);

  return {
    title:        raw.title.value,
    company:      raw.company.value,
    location:     raw.location.value,
    salary:       raw.salary.value,
    contractType: (raw.contractType.value ?? "unknown") as ContractType,
    workMode:     (raw.workMode.value ?? "unknown") as WorkMode,
    language,
    confidence,
  };
}