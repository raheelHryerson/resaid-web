import { AutofillData } from "@/lib/resume/autofill";

export type AnswerRequest = {
  jobDescription: string;
  questions: string[];
  tone?: "concise" | "detailed" | "neutral";
  guidelines?: string; // User-provided custom instructions
};

export function buildSystemPrompt(tone: AnswerRequest["tone"] = "neutral", guidelines?: string) {
  const base = [
    "You are a helpful assistant that crafts tailored, honest, and specific application answers.",
    "Use the candidate's resume context. Never fabricate experience or credentials.",
    "Prioritize relevance to the job description. Keep the writing clear and professional.",
    tone === "concise"
      ? "Use concise paragraphs or bullet points."
      : tone === "detailed"
      ? "Provide detailed, structured responses with clear examples."
      : "Aim for balanced, readable answers with specific examples.",
  ].join(" ");

  if (guidelines && guidelines.trim()) {
    return `${base}\n\nCustom Guidelines: ${guidelines.trim()}`;
  }

  return base;
}

export function buildUserPrompt(
  autofill: AutofillData,
  req: AnswerRequest
) {
  const lines: string[] = [];
  lines.push("[JOB DESCRIPTION]");
  lines.push(req.jobDescription.trim());
  lines.push("");
  lines.push("[CANDIDATE SUMMARY]");
  lines.push(
    JSON.stringify(
      {
        name: autofill.fullName,
        email: autofill.email,
        phone: autofill.phone,
        location: autofill.location,
        yearsOfExperience: autofill.yearsOfExperience,
        currentTitle: autofill.currentTitle,
        currentCompany: autofill.currentCompany,
        topSkills: autofill.topSkills,
        latestRole: autofill.latestRole,
        latestCompany: autofill.latestCompany,
        education: {
          highestDegree: autofill.highestDegree,
          schoolName: autofill.schoolName,
          fieldOfStudy: autofill.fieldOfStudy,
        },
        links: {
          linkedin: autofill.linkedin,
          github: autofill.github,
          portfolio: autofill.portfolio,
        },
      },
      null,
      2
    )
  );
  lines.push("");
  lines.push("[QUESTIONS]");
  req.questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.trim()}`);
  });
  lines.push("");
  lines.push(
    "For each question, provide: (a) a direct answer, and (b) 2-3 pointers the candidate could use to customize further."
  );

  return lines.join("\n");
}

export type GeneratedAnswer = {
  question: string;
  answer: string;
  pointers: string[];
};
