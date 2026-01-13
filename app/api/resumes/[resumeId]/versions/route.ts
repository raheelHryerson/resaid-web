import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/resumes/:resumeId/versions
 * Fetch version history for a resume
 * Never delete or overwrite - just add new versions
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resumeId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await context.params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get resume (verify ownership)
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== user.id) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    // Get all versions (oldest first)
    const versions = await prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        version: true,
        parsingEngine: true,
        parsedData: true,
        createdAt: true,
        // Don't return originalText in list (it's large)
      },
    });

    return NextResponse.json(
      {
        success: true,
        resumeId,
        versionCount: versions.length,
        versions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching resume versions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
