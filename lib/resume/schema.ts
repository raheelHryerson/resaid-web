import { z } from "zod";

// Ground Rules (enforced in code):
// 1. Never guess missing resume data
// 2. Never overwrite original extracted data
// 3. Parsing ≠ enhancement
// 4. AI output must validate against schema

export const ExperienceEntry = z.object({
  title: z.string().nullable(),
  organization: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  location: z.string().nullable(),
  bullets: z.array(z.string()).default([]),
});

export const EducationEntry = z.object({
  institution: z.string().nullable(),
  credential: z.string().nullable(),
  field: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const ResumeSchema = z.object({
  personal: z.object({
    name: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    extension: z.string().nullable().optional(),
    countryPhoneCode: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  }),
  experience: z.array(ExperienceEntry).default([]),
  education: z.array(EducationEntry).default([]),
  skills: z.array(z.string()).default([]),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntry>;
export type EducationEntry = z.infer<typeof EducationEntry>;
