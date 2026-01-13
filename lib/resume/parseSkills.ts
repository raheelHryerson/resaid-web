/**
 * PHASE 5: SECTION-SPECIFIC PARSING
 * Parse skills section with no AI (just heuristics)
 * 
 * Rules:
 * - Split by common delimiters (comma, semicolon, bullet)
 * - Deduplicate
 * - Preserve original text
 */

const SKILL_KEYWORDS = [
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
  "next.js",
  "express",
  "vue",
  "angular",
  "rest",
  "graphql",
  "postgresql",
  "postgres",
  "mysql",
  "c#",
  "csharp",
  ".net",
  "golang",
  "rust",
  "scala",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "jest",
  "webpack",
  "vite",
  "terraform",
  "jenkins",
  "github",
  "gitlab",
  "bitbucket",
  "azure",
  "gcp",
  "firebase",
  "supabase",
  "prisma",
  "django",
  "flask",
  "fastapi",
  "go",
  "grpc",
  "protobuf",
  "redis",
  "elasticsearch",
  "kafka",
  "rabbitmq",
  "microservices",
  "rest api",
  "oauth",
  "jwt",
  "api design",
];

export function parseSkills(skillsLines: string[]): string[] {
  const text = skillsLines.join(" ");
  const lowerText = text.toLowerCase();
  const foundSkills: Set<string> = new Set();

  // Try to extract known keywords first
  SKILL_KEYWORDS.forEach((skill) => {
    if (lowerText.includes(skill)) {
      foundSkills.add(skill);
    }
  });

  // If we found keywords, return them
  if (foundSkills.size > 0) {
    return Array.from(foundSkills);
  }

  // Fallback: split by common delimiters and clean up
  const potentialSkills = text
    .split(/[,;•\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 50)
    .filter((s) => !s.includes("(") && !s.includes(")"));

  // Deduplicate (case-insensitive)
  const unique = Array.from(new Set(potentialSkills.map((s) => s.toLowerCase())));

  return unique;
}
