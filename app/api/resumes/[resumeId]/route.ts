import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/resumes/:resumeId
 * Fetch a single resume with all details
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

    // Get resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get latest version
        },
      },
    });

    if (!resume || resume.userId !== user.id) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          fileSize: resume.fileSize,
          parsedData: resume.parsedData,
          isDefault: resume.isDefault,
          createdAt: resume.createdAt,
          latestVersion: resume.versions[0],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/resumes/:resumeId
 * Update parsed data for a resume
 * Creates a new version in resume_versions table
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ resumeId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await context.params;
    const { parsedData } = await request.json();

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

    // Get resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!resume || resume.userId !== user.id) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    // PHASE 7: Update resume and create new version (never overwrite)
    const latestVersion = resume.versions[0];
    const nextVersion = (latestVersion?.version || 0) + 1;

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parsedData: parsedData as any,
        updatedAt: new Date(),
        versions: {
          create: {
            originalText: latestVersion?.originalText || "", // Keep original text
            parsedData: parsedData as any,
            parsingEngine: "manual-edit-v1", // Track that this was manually edited
            version: nextVersion,
          },
        },
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    console.log(
      `Resume ${resumeId} updated by user ${user.id}, new version: ${nextVersion}`
    );

    return NextResponse.json(
      {
        success: true,
        resume: {
          id: updated.id,
          fileName: updated.fileName,
          parsedData: updated.parsedData,
          latestVersion: updated.versions[0],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
