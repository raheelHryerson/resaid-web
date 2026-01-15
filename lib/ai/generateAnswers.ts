import { getAIClient } from "./client";
import { AnswerRequest, buildSystemPrompt, buildUserPrompt, GeneratedAnswer } from "./prompt";

export async function generateAnswers(
  autofill: any,
  req: AnswerRequest
): Promise<{ answers: GeneratedAnswer[]; model: string }> {
  const { client, model } = getAIClient();

  const system = buildSystemPrompt(req.tone, req.guidelines);
  const user = buildUserPrompt(autofill, req);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.3,
  });

  const content = completion.choices?.[0]?.message?.content ?? "";

  // Attempt to parse a structured block. If not JSON, split heuristically.
  const answers: GeneratedAnswer[] = parseAnswers(content, req.questions);

  return { answers, model };
}

function parseAnswers(output: string, questions: string[]): GeneratedAnswer[] {
  // Heuristic: split by numbered sections or double newlines
  const blocks = output
    .split(/\n\s*\n/g)
    .map((b) => b.trim())
    .filter(Boolean);

  const result: GeneratedAnswer[] = [];
  let qIdx = 0;

  for (const block of blocks) {
    if (qIdx >= questions.length) break;
    const pointers = extractBullets(block).slice(0, 3);
    result.push({
      question: questions[qIdx],
      answer: block,
      pointers,
    });
    qIdx++;
  }

  // If fewer blocks than questions, fill remaining with the whole output
  while (qIdx < questions.length) {
    result.push({ question: questions[qIdx], answer: output, pointers: [] });
    qIdx++;
  }

  return result;
}

function extractBullets(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const bullets: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*[-*•]\s+(.*)$/);
    if (m) bullets.push(m[1].trim());
  }
  return bullets;
}
