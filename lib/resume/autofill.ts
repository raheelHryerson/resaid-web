/**
 * PHASE 9: AUTOFILL READINESS
 * Normalize resume data for web/extension autofill
 * 
 * Maps complex resume structure to simple autofill fields
 * Used by:
 * - Chrome extension (form filling)
 * - Web autofill (job application forms)
 * - AI answer generation (context)
 */

import { z } from "zod";
import { Resume } from "./schema";

// Simple autofill-ready schema
export const AutofillDataSchema = z.object({
  // Personal Info
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),

  // Quick Stats
  yearsOfExperience: z.number().nullable(),
  currentTitle: z.string().nullable(),
  currentCompany: z.string().nullable(),

  // Top Skills (array for quick access)
  topSkills: z.array(z.string()).default([]),
  allSkills: z.array(z.string()).default([]),

  // Latest Experience
  latestRole: z.string().nullable(),
  latestCompany: z.string().nullable(),
  latestStartDate: z.string().nullable(),
  latestEndDate: z.string().nullable(),

  // Education
  highestDegree: z.string().nullable(),
  schoolName: z.string().nullable(),
  fieldOfStudy: z.string().nullable(),
  graduationYear: z.string().nullable(),

  // URLs/Links
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  portfolio: z.string().nullable(),

  // Summary
  summary: z.string().nullable(),
});

export type AutofillData = z.infer<typeof AutofillDataSchema>;

/**
 * Convert complex Resume structure to simple AutofillData
 * This is the normalization layer for autofill features
 */
export function resumeToAutofill(resume: Resume): AutofillData {
  // Parse name
  let firstName: string | null = null;
  let lastName: string | null = null;
  let fullName = resume.personal.name;

  if (fullName) {
    const nameParts = fullName.trim().split(/\s+/);
    firstName = nameParts[0] || null;
    lastName = nameParts.slice(1).join(" ") || null;
  }

  // Extract years of experience
  let yearsOfExperience: number | null = null;
  if (resume.experience.length > 0) {
    // Try to calculate from date ranges
    const experienceDates = resume.experience
      .filter((exp) => exp.startDate && exp.endDate)
      .map((exp) => {
        const startYear = parseInt(exp.startDate || "0");
        const endYear = parseInt(exp.endDate || "0");
        return endYear - startYear;
      });

    if (experienceDates.length > 0) {
      yearsOfExperience = Math.ceil(
        experienceDates.reduce((a, b) => a + b, 0) / experienceDates.length
      );
    }
  }

  // Get latest experience
  const latestExperience = resume.experience[0];

  // Get highest degree
  const highestDegree = resume.education[0]?.credential || null;

  // Top 5 skills
  const topSkills = resume.skills.slice(0, 5);

  // Extract location components
  let city: string | null = null;
  let state: string | null = null;
  let country: string | null = null;

  if (resume.personal.location) {
    const locationParts = resume.personal.location.split(",").map((p) => p.trim());
    if (locationParts.length >= 2) {
      city = locationParts[0];
      state = locationParts[1];
    } else if (locationParts.length === 1) {
      city = locationParts[0];
    }
  }

  const autofill: AutofillData = {
    // Personal
    firstName,
    lastName,
    fullName,
    email: resume.personal.email,
    phone: resume.personal.phone,
    location: resume.personal.location,
    city,
    state,
    country: country || null,

    // Experience Stats
    yearsOfExperience,
    currentTitle: latestExperience?.title,
    currentCompany: latestExperience?.organization,

    // Skills
    topSkills,
    allSkills: resume.skills,

    // Latest Role Details
    latestRole: latestExperience?.title,
    latestCompany: latestExperience?.organization,
    latestStartDate: latestExperience?.startDate,
    latestEndDate: latestExperience?.endDate,

    // Education
    highestDegree,
    schoolName: resume.education[0]?.institution,
    fieldOfStudy: resume.education[0]?.field,
    graduationYear: resume.education[0]?.endDate,

    // URLs (extract from resume if present, otherwise null)
    linkedin: extractURLFromResume(resume, "linkedin"),
    github: extractURLFromResume(resume, "github"),
    portfolio: extractURLFromResume(resume, "portfolio"),

    // Summary (use first few bullets as summary if available)
    summary: resume.experience[0]?.bullets?.[0] || null,
  };

  return autofill;
}

/**
 * Try to find URLs in resume text
 * (In real implementation, you'd parse from original resume text)
 */
function extractURLFromResume(
  resume: Resume,
  type: "linkedin" | "github" | "portfolio"
): string | null {
  // This is a placeholder - in production you'd parse the original text
  // For now, return null
  return null;
}

/**
 * Validate autofill data is complete and valid
 */
export function validateAutofill(data: AutofillData): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Critical fields
  if (!data.firstName || !data.lastName) missing.push("Name");
  if (!data.email) missing.push("Email");
  if (!data.phone) missing.push("Phone");

  // Warnings for incomplete data
  if (!data.currentTitle) warnings.push("No current job title found");
  if (data.allSkills.length === 0) warnings.push("No skills extracted");
  if (data.highestDegree === null) warnings.push("No education found");

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
