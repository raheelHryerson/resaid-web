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
 * GET /api/user/profile
 * Returns user's personal information extracted from their default/most recent resume
 * Used by Chrome extension for autofill
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

    // Get user with Clerk info
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

    // Extract profile data from resume
    const profile = {
      fullName: resume.fullName || "",
      email: resume.email || "",
      phone: resume.phone || "",
      linkedin: resume.linkedin || "",
      location: resume.location || "",
      currentCompany: "",
    };

    // Get current company from most recent experience
    if (resume.experience && Array.isArray(resume.experience)) {
      const experiences = resume.experience as Array<{
        organization?: string | null;
        endDate?: string | null;
      }>;
      
      // Find most recent experience (no end date or latest end date)
      const currentExp = experiences.find(exp => !exp.endDate) || experiences[0];
      if (currentExp?.organization) {
        profile.currentCompany = currentExp.organization;
      }
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
