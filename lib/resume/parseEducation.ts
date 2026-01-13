/**
 * PHASE 5: SECTION-SPECIFIC PARSING
 * Parse education section with heuristic rules
 */

import { EducationEntry } from "./schema";

const DEGREE_PATTERNS = {
  bachelor: /bachelor['\s]?s?|b\.?[as]\.?|undergraduate|b.a|b.s/i,
  master: /master['\s]?s?|m\.?[as]\.?|m\.?b\.?a\.?|mba/i,
  phd: /ph\.?d\.?|doctorate|doctoral/i,
  associate: /associate['\s]?s?|a\.?[as]\.?/i,
};

const FIELD_KEYWORDS = [
  "computer science",
  "software engineering",
  "information technology",
  "business administration",
  "data science",
  "artificial intelligence",
  "machine learning",
  "electrical engineering",
  "mechanical engineering",
  "civil engineering",
  "chemistry",
  "physics",
  "mathematics",
  "biology",
  "psychology",
  "economics",
  "finance",
  "accounting",
  "marketing",
  "management",
];

function extractDegree(text: string): string | null {
  for (const [type, pattern] of Object.entries(DEGREE_PATTERNS)) {
    if (pattern.test(text)) {
      // Extract the degree text
      const match = text.match(pattern);
      return match ? match[0] : type;
    }
  }
  return null;
}

function extractField(text: string): string | null {
  const lowerText = text.toLowerCase();
  for (const field of FIELD_KEYWORDS) {
    if (lowerText.includes(field)) {
      return field;
    }
  }

  // Fallback: extract "in X" or "of X" pattern
  const match = text.match(/(?:in|of)\s+([A-Za-z\s&]+?)(?:,|$)/i);
  return match ? match[1].trim() : null;
}

function extractYear(text: string): string | null {
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : null;
}

export function parseEducation(educationLines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const text = educationLines.join("\n");

  // Split by double newlines or bullet points to separate entries
  const entryTexts = text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  for (const entryText of entryTexts) {
    const lines = entryText.split("\n").map((l) => l.trim());
    
    // Find which line has the degree
    let degreeLineIdx = -1;
    let credential: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const deg = extractDegree(lines[i]);
      if (deg) {
        credential = deg;
        degreeLineIdx = i;
        break;
      }
    }

    // If no degree found, skip this entry
    if (!credential) continue;

    const institution = findInstitutionInLines(lines);
    const field = extractField(entryText);

    // Look for years
    let startDate: string | null = null;
    let endDate: string | null = null;
    
    const yearMatches = entryText.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches) {
      startDate = yearMatches[0];
      if (yearMatches.length > 1) {
        endDate = yearMatches[yearMatches.length - 1];
      }
    }

    entries.push({
      credential,
      institution,
      field,
      startDate,
      endDate,
    });
  }

  return entries;
}

function findInstitutionInLines(lines: string[]): string | null {
  for (const line of lines) {
    const institution = extractInstitution(line);
    if (institution) return institution;
  }
  return null;
}

function extractInstitution(text: string): string | null {
  // Common patterns:
  // "Bachelor's in CS, University of X"
  // "BS Computer Science - MIT"
  // "University of X - Bachelor's"

  // Try to find university names
  const universityPatterns = [
    /(?:university|college|institute|academy|school)\s+(?:of\s+)?([A-Za-z\s&]+?)(?:,|–|-|$)/i,
    /([A-Za-z\s&]+?)(?:\s+university|\s+college|\s+institute)(?:,|$)/i,
  ];

  for (const pattern of universityPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 100);
    }
  }

  // Fallback: look for capitalized phrases
  const capitalMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
  return capitalMatch ? capitalMatch[0].substring(0, 100) : null;
}
