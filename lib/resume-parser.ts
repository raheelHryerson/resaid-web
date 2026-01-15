/**
 * MAIN PARSER ORCHESTRATOR
 * Coordinates all parsing phases:
 * Phase 3: Text Extraction
 * Phase 4: Section Detection
 * Phase 5: Section-Specific Parsing
 * Phase 6: Validation & Repair
 */

import { extractText } from "./resume/extractText";
import { detectSections } from "./resume/detectSections";
import { parseSkills } from "./resume/parseSkills";
import { parseExperience } from "./resume/parseExperience";
import { parseEducation } from "./resume/parseEducation";
import { ResumeSchema, type Resume } from "./resume/schema";

export async function parseResume(
  buffer: Buffer,
  mimeType: string
): Promise<Resume> {
  try {
    // PHASE 3: Extract raw text
    console.log("[PHASE 3] Extracting text...");
    const text = await extractText(buffer, mimeType);
    console.log(`[PHASE 3] Extracted ${text.length} characters`);

    // PHASE 4: Detect sections
    console.log("[PHASE 4] Detecting sections...");
    const sections = detectSections(text);
    console.log(
      `[PHASE 4] Found sections:`,
      Object.fromEntries(
        Object.entries(sections).map(([k, v]) => [k, v.length])
      )
    );

    // PHASE 5: Parse each section
    console.log("[PHASE 5] Parsing sections...");

    // Parse skills
    const skills = parseSkills(sections.skills);
    console.log(`[PHASE 5] Extracted ${skills.length} skills`);

    // Parse experience
    const experience = parseExperience(sections.experience);
    console.log(`[PHASE 5] Extracted ${experience.length} experience entries`);

    // Parse education
    const education = parseEducation(sections.education);
    console.log(`[PHASE 5] Extracted ${education.length} education entries`);

    // Parse personal (contact) info
    const personal = parsePersonal(sections.personal);

    // PHASE 6: Validate with Zod
    console.log("[PHASE 6] Validating with schema...");
    const parsedResume: Resume = {
      personal,
      experience,
      education,
      skills,
    };

    const validated = ResumeSchema.parse(parsedResume);
    console.log("[PHASE 6] Validation passed");

    return validated;
  } catch (error) {
    console.error("[ERROR] Resume parsing failed:", error);

    // Return empty validated structure on failure
    // This ensures we never have invalid data
    return ResumeSchema.parse({
      personal: {
        name: null,
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        extension: null,
        countryPhoneCode: null,
        location: null,
        city: null,
        postalCode: null,
        country: null,
      },
      experience: [],
      education: [],
      skills: [],
    });
  }
}

function parsePersonal(personalLines: string[]): {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  extension: string | null;
  countryPhoneCode: string | null;
  location: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
} {
  const text = personalLines.join(" ");

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Extract phone with country code (e.g., +1, +44, etc.)
  const phoneWithCodeMatch = text.match(/\+(\d{1,3})\s*[-.\s]?(\d{3,4})[-.\s]?(\d{3})[-.\s]?(\d{4})/);
  let phone = null;
  let countryPhoneCode = null;
  let extension = null;

  if (phoneWithCodeMatch) {
    countryPhoneCode = phoneWithCodeMatch[1];
    phone = `${phoneWithCodeMatch[2]}-${phoneWithCodeMatch[3]}-${phoneWithCodeMatch[4]}`;
  } else {
    // Try without country code
    const phoneMatch = text.match(/(?:\(\d{3}\)|\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})(?:\s*(?:ext|x|extension)\s*(\d+))?/i);
    if (phoneMatch) {
      phone = phoneMatch[0].split(/\s+(?:ext|x|extension)/i)[0].trim();
      extension = phoneMatch[3] || null;
    }
  }

  // Extract location (city, state)
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+([A-Z]{2})/);
  let location = null;
  let city = null;
  let country = null;

  if (locationMatch) {
    city = locationMatch[1];
    country = locationMatch[2]; // State abbreviation or country code
    location = locationMatch[0];
  }

  // Extract postal code (US format: 5 or 9 digits)
  const postalMatch = text.match(/\b\d{5}(-\d{4})?\b/);
  const postalCode = postalMatch ? postalMatch[0] : null;

  // Extract name and split into first/last
  const name = personalLines[0] || null;
  let firstName = null;
  let lastName = null;

  if (name) {
    const nameParts = name.trim().split(/\s+/);
    firstName = nameParts[0] || null;
    lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;
  }

  return { 
    name, 
    firstName, 
    lastName, 
    email, 
    phone, 
    extension,
    countryPhoneCode,
    location, 
    city, 
    postalCode, 
    country 
  };
}
