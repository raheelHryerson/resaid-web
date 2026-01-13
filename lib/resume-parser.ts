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
        email: null,
        phone: null,
        location: null,
      },
      experience: [],
      education: [],
      skills: [],
    });
  }
}

function parsePersonal(personalLines: string[]): {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
} {
  const text = personalLines.join(" ");

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Extract phone
  const phoneMatch = text.match(
    /(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/
  );
  const phone = phoneMatch ? phoneMatch[0] : null;

  // Extract location (usually a city, state format)
  const locationMatch = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,?\s+[A-Z]{2}/);
  const location = locationMatch ? locationMatch[0] : null;

  // Name is usually the first line or first few words
  const name = personalLines[0] || null;

  return { name, email, phone, location };
}
