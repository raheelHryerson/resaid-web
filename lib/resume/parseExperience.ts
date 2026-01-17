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
  yearRange: /(\d{4})\s*[-–—]\s*(\d{4}|present|current|ongoing|today)/gi,
  monthYear: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}/gi,
  monthYearSingle: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\d{4}/gi,
  slashDate: /\d{1,2}\/\d{1,2}\/\d{4}/g,
};

// Helper to add spaces to CamelCase text
function addSpacesToCamelCase(text: string): string {
  // Add space before capital letters (except at start)
  return text.replace(/([a-z])([A-Z])/g, '$1 $2')
    // Add space before numbers if preceded by letters
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    // Add space after numbers if followed by letters
    .replace(/(\d)([a-zA-Z])/g, '$1 $2');
}

function extractDateRange(line: string): { startDate: string | null; endDate: string | null } {
  // Try month-year range first (May2025–Aug2025)
  const monthYearMatch = line.match(DATE_PATTERNS.monthYear);
  if (monthYearMatch && monthYearMatch.length > 0) {
    const dates = monthYearMatch[0].split(/[-–—]/);
    return {
      startDate: addSpacesToCamelCase(dates[0].trim()),
      endDate: addSpacesToCamelCase(dates[1]?.trim() || ''),
    };
  }

  // Try year range
  const yearMatch = line.match(DATE_PATTERNS.yearRange);
  if (yearMatch && yearMatch.length > 0) {
    const dates = yearMatch[0].split(/[-–—]/);
    return {
      startDate: dates[0].trim(),
      endDate: dates[1].trim(),
    };
  }

  return { startDate: null, endDate: null };
}

function isBulletPoint(line: string): boolean {
  // Match bullet at start with optional text
  if (/^[•\-*→]\s/.test(line.trim())) return true;
  // Match standalone bullet symbol
  if (/^[•\-*→]$/.test(line.trim())) return true;
  return false;
}

function isBulletSymbol(line: string): boolean {
  return /^[•\-*→]$/.test(line.trim());
}

function extractBulletText(line: string): string {
  const bulletText = line.trim().replace(/^[•\-*→]\s+/, "").trim();
  return addSpacesToCamelCase(bulletText);
}

export function parseExperience(experienceLines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  
  let currentEntry: Partial<ExperienceEntry> | null = null;
  let collectingBullets = false;
  let lastBulletIndex = -1;
  let expectingBulletText = false;

  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i].trim();
    
    if (!line) {
      // Blank line might signal end of an entry
      if (currentEntry && (currentEntry.title || currentEntry.organization)) {
        entries.push({
          title: currentEntry.title || null,
          organization: currentEntry.organization || null,
          startDate: currentEntry.startDate || null,
          endDate: currentEntry.endDate || null,
          location: currentEntry.location || null,
          bullets: currentEntry.bullets || [],
        });
        currentEntry = null;
        collectingBullets = false;
        lastBulletIndex = -1;
        expectingBulletText = false;
      }
      continue;
    }

    // Check if this is a standalone bullet symbol
    if (isBulletSymbol(line)) {
      expectingBulletText = true;
      collectingBullets = true;
      continue;
    }

    // Check if this is a bullet point with text
    if (isBulletPoint(line)) {
      if (currentEntry) {
        currentEntry.bullets = currentEntry.bullets || [];
        currentEntry.bullets.push(extractBulletText(line));
        collectingBullets = true;
        lastBulletIndex = currentEntry.bullets.length - 1;
        expectingBulletText = false;
      }
      continue;
    }

    // If we're expecting bullet text after a standalone bullet symbol
    if (expectingBulletText && currentEntry) {
      currentEntry.bullets = currentEntry.bullets || [];
      currentEntry.bullets.push(addSpacesToCamelCase(line));
      lastBulletIndex = currentEntry.bullets.length - 1;
      expectingBulletText = false;
      collectingBullets = true;
      continue;
    }

    // If collecting bullets and this is not a bullet or new role marker, it might be a continuation
    if (collectingBullets && currentEntry && lastBulletIndex >= 0) {
      // Check if this could be a continuation (not a date, not a title-like line)
      const { startDate } = extractDateRange(line);
      const isTitleLike = /\b(engineer|developer|manager|analyst|designer|director|lead|architect|specialist|intern|associate|consultant|officer|executive|coordinator|administrator|technical|senior|junior)\b/i.test(line);
      
      if (!startDate && !isTitleLike && currentEntry.bullets && currentEntry.bullets[lastBulletIndex]) {
        // Append to last bullet
        currentEntry.bullets[lastBulletIndex] += ' ' + addSpacesToCamelCase(line);
        continue;
      } else {
        // Not a continuation, stop collecting bullets
        collectingBullets = false;
        lastBulletIndex = -1;
      }
    }

    // Check if line contains dates - this likely starts a new role
    const { startDate, endDate } = extractDateRange(line);
    if (startDate && endDate) {
      // Save previous entry if exists
      if (currentEntry && (currentEntry.title || currentEntry.organization)) {
        entries.push({
          title: currentEntry.title || null,
          organization: currentEntry.organization || null,
          startDate: currentEntry.startDate || null,
          endDate: currentEntry.endDate || null,
          location: currentEntry.location || null,
          bullets: currentEntry.bullets || [],
        });
      }

      // Start new entry - line before dates is typically the title
      const titleLine = addSpacesToCamelCase(line.replace(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\d{4}\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\d{4}/gi, '').trim());
      
      currentEntry = {
        title: titleLine || null,
        organization: null,
        startDate,
        endDate,
        location: null,
        bullets: [],
      };
      collectingBullets = false;
      continue;
    }

    // If we have a current entry but no organization yet, this line is likely the organization/location
    if (currentEntry && !collectingBullets) {
      if (!currentEntry.organization) {
        // Try to split organization and location
        // Pattern: "CompanyName(Acronym)City,State,Country"
        const orgLocationMatch = line.match(/^(.+?)([A-Z][a-z]+,\s*[A-Z]{2},\s*[A-Z][a-z]+)$/);
        if (orgLocationMatch) {
          currentEntry.organization = addSpacesToCamelCase(orgLocationMatch[1].trim());
          currentEntry.location = addSpacesToCamelCase(orgLocationMatch[2].trim());
        } else {
          // Just set as organization
          currentEntry.organization = addSpacesToCamelCase(line);
        }
      } else if (!currentEntry.location) {
        currentEntry.location = addSpacesToCamelCase(line);
      }
    } else if (!currentEntry) {
      // Starting a new entry without clear date marker
      // Check if line looks like a job title
      const isTitleLike = /\b(engineer|developer|manager|analyst|designer|director|lead|architect|specialist|intern|associate|consultant|officer|executive|coordinator|administrator|technical|senior|junior)\b/i.test(line);
      
      if (isTitleLike) {
        currentEntry = {
          title: addSpacesToCamelCase(line),
          organization: null,
          startDate: null,
          endDate: null,
          location: null,
          bullets: [],
        };
        collectingBullets = false;
      }
    }
  }

  // Don't forget the last entry
  if (currentEntry && (currentEntry.title || currentEntry.organization)) {
    entries.push({
      title: currentEntry.title || null,
      organization: currentEntry.organization || null,
      startDate: currentEntry.startDate || null,
      endDate: currentEntry.endDate || null,
      location: currentEntry.location || null,
      bullets: currentEntry.bullets || [],
    });
  }

  return entries;
}
