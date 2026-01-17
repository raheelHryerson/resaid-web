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

export async function GET(request: Request) {
  try {
    // Try Clerk auth first
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (e) {
      // ignore, will try API key
    }

    // If no Clerk auth, try API key
    if (!userId) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const apiKeyValue = authHeader.substring(7);
        const apiKeyRecord = await prisma.apiKey.findUnique({
          where: { key: apiKeyValue, isActive: true },
          include: { user: true },
        });

        if (apiKeyRecord) {
          userId = apiKeyRecord.user.clerkId;
          await prisma.apiKey.update({
            where: { id: apiKeyRecord.id },
            data: { lastUsedAt: new Date() },
          });
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Get all resumes for this user
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        resumes: resumes.map((resume) => {
          const parsed = (resume.parsedData as any) || {
            skills: [],
            experience: [],
            education: [],
          };
          return {
            id: resume.id,
            fileName: resume.fileName,
            fileUrl: resume.fileUrl,
            fileSize: resume.fileSize,
            skills: parsed.skills || [],
            experience: parsed.experience || [],
            education: parsed.education || [],
            createdAt: resume.createdAt,
            parsedData: parsed, // <-- include full parsedData for onboarding auto-fill
          };
        }),
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
