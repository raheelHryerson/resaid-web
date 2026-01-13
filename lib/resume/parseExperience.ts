/**
 * PHASE 5: SECTION-SPECIFIC PARSING
 * Parse experience section with heuristic rules
 * 
 * Rules:
 * - Detect date ranges (2020-2023, Jan 2020 - Dec 2023, etc.)
 * - Group bullet points under nearest role
 * - Title/company on same or adjacent lines
 * - Preserve bullets verbatim
 */

import { ExperienceEntry } from "./schema";

// Date patterns
const DATE_PATTERNS = {
  yearRange: /(\d{4})\s*[-–]\s*(\d{4}|present|current|ongoing|today)/gi,
  monthYear:
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}/gi,
  slashDate: /\d{1,2}\/\d{1,2}\/\d{4}/g,
};

function extractDateRange(line: string): { startDate: string | null; endDate: string | null } {
  const yearMatch = line.match(DATE_PATTERNS.yearRange);
  const monthMatch = line.match(DATE_PATTERNS.monthYear);

  if (yearMatch && yearMatch.length > 0) {
    return {
      startDate: yearMatch[0].split(/[-–]/)[0].trim(),
      endDate: yearMatch[0].split(/[-–]/)[1].trim(),
    };
  }

  if (monthMatch && monthMatch.length > 0) {
    return {
      startDate: monthMatch[0] || null,
      endDate: monthMatch[1] || null,
    };
  }

  return { startDate: null, endDate: null };
}

function isBulletPoint(line: string): boolean {
  return /^[•\-*→]\s/.test(line.trim());
}

function extractBulletText(line: string): string {
  return line.trim().replace(/^[•\-*→]\s+/, "").trim();
}

export function parseExperience(experienceLines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  
  // Join all lines to process as text
  const text = experienceLines.join("\n");
  
  // Split by potential role separators (multiple newlines, blank lines with text after)
  const roleSections = text.split(/\n\n+/).filter((s) => s.trim());

  for (const section of roleSections) {
    const lines = section.split("\n").filter((l) => l.trim());
    if (lines.length === 0) continue;

    const entry: Partial<ExperienceEntry> = {
      title: null,
      organization: null,
      startDate: null,
      endDate: null,
      location: null,
      bullets: [],
    };

    let bulletStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Try to extract dates
      const { startDate, endDate } = extractDateRange(line);
      if (startDate) {
        entry.startDate = startDate;
        entry.endDate = endDate;
        // Mark where bullets should start (after date line)
        if (bulletStartIndex === -1) bulletStartIndex = i + 1;
        continue;
      }

      // Check if this is a bullet point
      if (isBulletPoint(line)) {
        entry.bullets = entry.bullets || [];
        entry.bullets.push(extractBulletText(line));
        if (bulletStartIndex === -1) bulletStartIndex = i;
        continue;
      }

      // If we haven't found title yet
      if (!entry.title) {
        // Check if line looks like a title
        const isTitleLike = /\b(engineer|developer|manager|analyst|designer|director|lead|architect|specialist|intern|associate|consultant|officer|executive|coordinator|administrator|specialist|technical|senior|junior)\b/i.test(
          line
        );

        if (isTitleLike || line.length < 80) {
          entry.title = line.substring(0, 100);
          continue;
        }
      }

      // If we have title but not organization
      if (entry.title && !entry.organization && !isBulletPoint(line)) {
        entry.organization = line.substring(0, 100);
        if (bulletStartIndex === -1) bulletStartIndex = i + 1;
        continue;
      }

      // If we have both title and org, maybe this is location
      if (entry.title && entry.organization && !entry.location && !isBulletPoint(line)) {
        entry.location = line.substring(0, 100);
        continue;
      }
    }

    // Only add entry if it has at least a title or organization
    if (entry.title || entry.organization) {
      entries.push({
        title: entry.title || null,
        organization: entry.organization || null,
        startDate: entry.startDate || null,
        endDate: entry.endDate || null,
        location: entry.location || null,
        bullets: entry.bullets || [],
      });
    }
  }

  return entries;
}
