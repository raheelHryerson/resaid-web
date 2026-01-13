/**
 * PHASE 4: SECTION DETECTION
 * Critical Step: Split resume into sections WITHOUT parsing
 * 
 * Approach:
 * - Iterate line-by-line
 * - Detect headers using uppercase + bold markers
 * - Use section synonyms
 * 
 * Output: Groups of lines organized by section
 * 
 * ⚠️ Do NOT parse yet. Only group lines.
 */

interface SectionLines {
  personal: string[];
  experience: string[];
  education: string[];
  skills: string[];
  other: string[];
}

// Common section headers and their synonyms
const SECTION_HEADERS = {
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "work history",
    "career history",
  ],
  education: [
    "education",
    "academic",
    "qualifications",
    "degrees",
    "certifications",
    "training",
  ],
  skills: [
    "skills",
    "technical skills",
    "core competencies",
    "competencies",
    "expertise",
    "proficiencies",
  ],
  personal: [
    "contact",
    "personal",
    "summary",
    "objective",
    "professional summary",
    "professional profile",
  ],
};

function normalizeHeader(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z\s]/g, "");
}

function detectSectionType(line: string): keyof SectionLines | null {
  const normalized = normalizeHeader(line);

  for (const [section, headers] of Object.entries(SECTION_HEADERS)) {
    if (headers.some((h) => normalized.includes(h))) {
      return section as keyof SectionLines;
    }
  }

  return null;
}

function isLikelyHeader(line: string): boolean {
  const trimmed = line.trim();

  // Empty lines are not headers
  if (!trimmed) return false;

  // Too long to be a header
  if (trimmed.length > 100) return false;

  // All uppercase (EXPERIENCE, EDUCATION, SKILLS)
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) return true;

  // Title case with limited words (Experience, Education, Skills)
  const words = trimmed.split(/\s+/);
  if (words.length <= 3 && words.length > 0) {
    const titleCaseRatio =
      words.filter((w) => w[0] === w[0].toUpperCase()).length / words.length;
    if (titleCaseRatio > 0.5) return true;
  }

  // Starts with all caps word(s) followed by nothing
  if (/^[A-Z\s&]+$/.test(trimmed) && trimmed.length < 50) return true;

  return false;
}

export function detectSections(text: string): SectionLines {
  const lines = text.split("\n");
  const sections: SectionLines = {
    personal: [],
    experience: [],
    education: [],
    skills: [],
    other: [],
  };

  let currentSection: keyof SectionLines = "personal"; // Start with personal (contact info usually first)

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip completely empty lines
    if (!trimmed) {
      // Preserve blank lines within sections for structure
      if (sections[currentSection].length > 0) {
        sections[currentSection].push("");
      }
      continue;
    }

    // Check if this line is a section header
    if (isLikelyHeader(line)) {
      const detectedSection = detectSectionType(line);
      if (detectedSection) {
        currentSection = detectedSection;
        continue; // Skip the header line itself
      }
    }

    // Add line to current section
    sections[currentSection].push(trimmed);
  }

  return sections;
}
