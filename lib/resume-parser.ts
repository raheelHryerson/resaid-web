import * as pdfParse from "pdf-parse/lib/pdf-parse.js";
import * as mammoth from "mammoth";

interface ParsedResumeData {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration?: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year?: string;
  }>;
  summary?: string;
}

// Extract text from PDF
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

// Extract text from DOCX
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

// Parse text to extract structured data
function parseResumeText(text: string): ParsedResumeData {
  const data: ParsedResumeData = {
    skills: [],
    experience: [],
    education: [],
  };

  // Convert to lowercase for matching while preserving original case for display
  const lowerText = text.toLowerCase();
  const lines = text.split("\n").map((line) => line.trim());

  // Extract skills (look for common keywords)
  const skillKeywords = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "node.js",
    "sql",
    "mongodb",
    "aws",
    "docker",
    "kubernetes",
    "git",
    "html",
    "css",
    "tailwind",
    "nextjs",
    "express",
    "vue",
    "angular",
    "rest",
    "graphql",
    "postgresql",
    "mysql",
  ];

  skillKeywords.forEach((skill) => {
    if (lowerText.includes(skill) && !data.skills.includes(skill)) {
      data.skills.push(skill);
    }
  });

  // Extract experience (look for common job title patterns and keywords)
  const jobTitlePatterns =
    /(?:Software|Senior|Junior|Lead|Principal)\s+(?:Engineer|Developer|Architect|Manager|Designer|Analyst)/gi;
  const jobTitles = text.match(jobTitlePatterns) || [];

  jobTitles.forEach((title) => {
    // Try to find company and duration near the job title
    const titleIndex = text.indexOf(title);
    const contextWindow = text.substring(
      Math.max(0, titleIndex - 100),
      Math.min(text.length, titleIndex + 200)
    );

    data.experience.push({
      title: title.trim(),
      company: "Unknown Company",
      duration: "Unknown Duration",
    });
  });

  // Extract education (look for degree keywords)
  const degreePatterns =
    /(?:Bachelor|Master|PhD|Associates?|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|MBA|BS|MS|BA|MA)\s+(?:in|of)?\s+([A-Za-z\s]+)(?:,|\s|$)/gi;
  const degrees = text.match(degreePatterns) || [];

  degrees.forEach((degree) => {
    if (degree.trim()) {
      data.education.push({
        degree: degree.trim(),
        school: "Unknown School",
      });
    }
  });

  // Extract summary (first 2-3 sentences if available)
  const summaryEndIndex = text.indexOf("\n\n") || text.indexOf("\n\n");
  if (summaryEndIndex > 0) {
    const potentialSummary = text.substring(0, summaryEndIndex).trim();
    if (
      potentialSummary.length < 500 &&
      potentialSummary.split(" ").length < 100
    ) {
      data.summary = potentialSummary;
    }
  }

  return data;
}

// Main parse function
export async function parseResume(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedResumeData> {
  let text = "";

  if (mimeType === "application/pdf") {
    text = await extractPdfText(buffer);
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await extractDocxText(buffer);
  } else {
    throw new Error("Unsupported file type");
  }

  return parseResumeText(text);
}
