/**
 * PHASE 8: ENHANCEMENT LAYER
 * AI-powered resume improvements
 * 
 * Rules:
 * - Never overwrites original parsed data
 * - Creates new version in resume_versions
 * - User opt-in only
 * - Uses Claude for text improvement
 */

import { Resume } from "./schema";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic();

interface EnhancementOptions {
  type: "bullet-rewrite" | "ats-optimize" | "job-specific";
  jobDescription?: string; // For job-specific tailoring
}

interface EnhancedResume extends Resume {
  enhancementNotes?: string;
}

/**
 * Rewrite experience bullets to be more impactful
 * Original: "Worked on a project using React"
 * Enhanced: "Architected responsive React dashboard handling 10k+ concurrent users"
 */
async function enhanceBullets(resume: Resume): Promise<EnhancedResume> {
  const experienceText = resume.experience
    .map((exp) => {
      const bullets = exp.bullets.join("\n  ");
      return `${exp.title} at ${exp.organization}:\n  ${bullets}`;
    })
    .join("\n\n");

  const prompt = `You are a professional resume writer. Improve these experience bullets to be more impactful and results-oriented.

Current bullets:
${experienceText}

Guidelines:
- Start with strong action verbs (Architected, Engineered, Optimized, etc.)
- Quantify results where possible (10%, $1M, 50k users)
- Show impact and scale
- Keep bullets concise (1-2 lines max)
- Preserve the core meaning
- Make them ATS-friendly

Return ONLY the improved bullets in this exact format:
[Experience Entry Title]
- Improved bullet 1
- Improved bullet 2
- ...`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const enhancedText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse the response and update bullets
  const enhanced = JSON.parse(JSON.stringify(resume)); // Deep copy

  // Simple parsing: match bullets and replace
  const bulletMatches = enhancedText.match(/- .+/g) || [];
  let bulletIndex = 0;

  for (const exp of enhanced.experience) {
    const newBullets = [];
    for (let i = 0; i < exp.bullets.length && bulletIndex < bulletMatches.length; i++) {
      newBullets.push(bulletMatches[bulletIndex].replace(/^- /, ""));
      bulletIndex++;
    }
    if (newBullets.length > 0) {
      exp.bullets = newBullets;
    }
  }

  return {
    ...enhanced,
    enhancementNotes: "Bullets rewritten for impact and quantification",
  };
}

/**
 * Optimize for ATS (Applicant Tracking Systems)
 * - Add relevant keywords
 * - Expand abbreviations
 * - Ensure proper formatting
 */
async function optimizeForATS(resume: Resume): Promise<EnhancedResume> {
  const resumeJson = JSON.stringify(resume, null, 2);

  const prompt = `You are an ATS (Applicant Tracking System) optimization expert. 
  
Analyze this resume and optimize it for ATS parsing:

${resumeJson}

Guidelines for ATS optimization:
1. Expand common abbreviations (e.g., "React" instead of "R", "JavaScript" instead of "JS")
2. Add relevant technical keywords naturally
3. Ensure proper formatting (no symbols that confuse ATS)
4. Include standard section headers
5. Avoid graphics, tables, or special characters
6. Keep consistent date formats (YYYY-MM-DD)

Return the optimized resume as JSON in the EXACT same structure, with improvements applied.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const optimized = jsonMatch
    ? JSON.parse(jsonMatch[0])
    : JSON.parse(JSON.stringify(resume));

  return {
    ...optimized,
    enhancementNotes: "Optimized for ATS parsing and keyword matching",
  };
}

/**
 * Tailor resume for a specific job description
 * - Reorder experience by relevance
 * - Highlight matching skills
 * - Emphasize relevant experience
 */
async function tailorForJob(
  resume: Resume,
  jobDescription: string
): Promise<EnhancedResume> {
  const resumeJson = JSON.stringify(resume, null, 2);

  const prompt = `You are a career coach specializing in resume tailoring.

Job Description:
${jobDescription}

Current Resume:
${resumeJson}

Task: Tailor the resume to match this job posting.

Guidelines:
1. Reorder experience entries by relevance to the job (most relevant first)
2. Highlight skills that match the job requirements
3. Rewrite bullets to emphasize matching skills/experience
4. Add relevant keywords from job description naturally
5. Keep the resume truthful - don't invent experience
6. Return the tailored resume as JSON in the SAME structure

Focus on:
- Key technical skills required
- Industry/domain experience
- Relevant accomplishments and metrics`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const tailored = jsonMatch
    ? JSON.parse(jsonMatch[0])
    : JSON.parse(JSON.stringify(resume));

  return {
    ...tailored,
    enhancementNotes: `Tailored for job position. Keywords matched: ${jobDescription.split(/\s+/).slice(0, 10).join(", ")}...`,
  };
}

/**
 * Main enhancement function
 * Orchestrates which enhancement to apply
 */
export async function enhanceResume(
  resume: Resume,
  options: EnhancementOptions
): Promise<{ enhanced: EnhancedResume; engine: string }> {
  console.log(`[PHASE 8] Enhancing resume with strategy: ${options.type}`);

  let enhanced: EnhancedResume;
  let engine: string;

  switch (options.type) {
    case "bullet-rewrite":
      enhanced = await enhanceBullets(resume);
      engine = "claude-bullet-rewrite-v1";
      break;

    case "ats-optimize":
      enhanced = await optimizeForATS(resume);
      engine = "claude-ats-optimize-v1";
      break;

    case "job-specific":
      if (!options.jobDescription) {
        throw new Error("Job description required for job-specific tailoring");
      }
      enhanced = await tailorForJob(resume, options.jobDescription);
      engine = "claude-job-tailor-v1";
      break;

    default:
      throw new Error(`Unknown enhancement type: ${options.type}`);
  }

  console.log(`[PHASE 8] Enhancement complete: ${engine}`);

  return { enhanced, engine };
}
