import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

/**
 * GET /api/user/resume
 * Returns the user's most recent resume data
 * Used by Chrome extension for AI question answering
 * Supports both Clerk auth and API key auth
 */
export async function GET(request: Request) {
  try {
    // Try Clerk authentication first
    let userId = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (e) {
      // Clerk auth failed, will try API key
    }

    // If no Clerk auth, try API key
    if (!userId) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
      }

      const apiKey = authHeader.substring(7);
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKey, isActive: true },
        include: { user: true },
      });

      if (!apiKeyRecord) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: CORS_HEADERS });
      }

      userId = apiKeyRecord.user.clerkId;

      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() },
      });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    // Get user with their most recent resume
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        resumes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: CORS_HEADERS });
    }

    // Get the most recent resume
    const resume = user.resumes[0];

    if (!resume) {
      return NextResponse.json({
        error: "No resume found. Please upload a resume first."
      }, { status: 404, headers: CORS_HEADERS });
    }

    // Return the resume data in the format expected by the extension
    return NextResponse.json({
      id: resume.id,
      fileName: resume.fileName,
      parsedData: resume.parsedData,
      content: resume.content,
      createdAt: resume.createdAt,
    }, { headers: CORS_HEADERS });

  } catch (error) {
    console.error("Error fetching user resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}