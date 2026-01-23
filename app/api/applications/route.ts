import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

/**
 * GET /api/applications
 * Get all applications for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        resume: {
          select: {
            fileName: true,
            parsedData: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      applications
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST /api/applications
 * Create a new application (called by Chrome extension)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobUrl, companyName, jobTitle, jobDescription, resumeId } = body;

    if (!jobUrl || !companyName || !jobTitle) {
      return NextResponse.json(
        { error: "Missing required fields: jobUrl, companyName, jobTitle" },
        { status: 400 }
      );
    }

    // Get user's default resume if none specified
    let applicationResumeId = resumeId;
    if (!applicationResumeId) {
      const defaultResume = await prisma.resume.findFirst({
        where: { userId, isDefault: true },
      });
      if (defaultResume) {
        applicationResumeId = defaultResume.id;
      } else {
        // Get the most recent resume
        const recentResume = await prisma.resume.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (recentResume) {
          applicationResumeId = recentResume.id;
        } else {
          return NextResponse.json(
            { error: "No resume found. Please upload a resume first." },
            { status: 400 }
          );
        }
      }
    }

    // Create the application (unique constraint will prevent duplicates)
    const application = await prisma.application.create({
      data: {
        userId,
        resumeId: applicationResumeId,
        jobUrl,
        companyName,
        jobTitle,
        jobDescription: jobDescription || "",
      },
      include: {
        resume: {
          select: {
            fileName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application
    });
  } catch (error: any) {
    console.error("Error creating application:", error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Application already exists for this job" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}