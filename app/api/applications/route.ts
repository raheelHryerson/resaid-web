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
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
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
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
        where: { userId: user.id, isDefault: true },
      });
      if (defaultResume) {
        applicationResumeId = defaultResume.id;
      } else {
        // Get the most recent resume
        const recentResume = await prisma.resume.findFirst({
          where: { userId: user.id },
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
        userId: user.id,
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
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
