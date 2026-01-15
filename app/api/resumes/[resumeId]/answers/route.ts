import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResumeSchema } from "@/lib/resume/schema";
import { resumeToAutofill } from "@/lib/resume/autofill";
import { generateAnswers } from "@/lib/ai/generateAnswers";

// Allow CORS for extension
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resumeId: string }> }
) {
  try {
    // Try Clerk auth first, then API key auth
    let userId: string | null = null;
    let user = null;

    // Method 1: Clerk authentication
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      userId = clerkUserId;
      user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
      });
    }

    // Method 2: API key authentication (for extension)
    if (!userId) {
      const authHeader = request.headers.get("Authorization") || "";
      const apiKey = authHeader.replace("Bearer ", "");

      if (apiKey) {
        const foundApiKey = await prisma.apiKey.findUnique({
          where: { key: apiKey },
          include: { user: true },
        });

        if (foundApiKey && foundApiKey.isActive) {
          user = foundApiKey.user;
          userId = foundApiKey.user.id;
          
          // Update last used timestamp
          await prisma.apiKey.update({
            where: { key: apiKey },
            data: { lastUsedAt: new Date() },
          });
        }
      }
    }

    if (!userId || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const jobDescription: string = (body?.jobDescription || "").toString();
    const questions: string[] = Array.isArray(body?.questions)
      ? body.questions.map((q: unknown) => String(q || "").trim()).filter(Boolean)
      : [];
    const tone: "concise" | "detailed" | "neutral" = body?.tone || "neutral";
    const guidelines: string | undefined = body?.guidelines ? String(body.guidelines).trim() : undefined;

    if (!jobDescription || questions.length === 0) {
      return NextResponse.json(
        { error: "jobDescription and questions[] are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { resumeId } = await context.params;

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.userId !== user.id) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    const parsed = ResumeSchema.safeParse(resume.parsedData as any);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Resume parsedData is invalid" },
        { status: 422 }
      );
    }

    const autofill = resumeToAutofill(parsed.data);

    const { answers, model } = await generateAnswers(autofill, {
      jobDescription,
      questions,
      tone,
      guidelines,
    });

    return NextResponse.json(
      { success: true, model, answers },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    const message =
      err?.message?.includes("AI provider not configured")
        ? "AI provider not configured. Set OPENAI_API_KEY or Azure OpenAI env variables."
        : "Internal server error";
    console.error("Answers API error:", err);
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
