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

    // Get the most recent resume (optional for profile data)
    const resume = user.resumes[0];

    // Extract profile data from resume's parsedData (if available)
    const parsedData = resume ? ((resume.parsedData as any) || { personal: {} }) : { personal: {} };
    const personal = parsedData.personal || {};
    const experience = parsedData.experience || [];

    const profile = {
      firstName: user.firstName || personal.firstName || "",
      lastName: user.lastName || personal.lastName || "",
      middleName: user.middleName || personal.middleName || "",
      fullName: personal.name || "",
      email: user.email || personal.email || "",
      phone: user.phone || personal.phone || "",
      extension: personal.extension || "",
      countryPhoneCode: personal.countryPhoneCode || "",
      linkedin: personal.linkedin || "",
      location: personal.location || "",
      city: user.city || personal.city || "",
      postalCode: personal.postalCode || "",
      country: user.country || personal.country || "",
      province: user.state || personal.province || "",
      github: personal.github || "",
      portfolio: personal.portfolio || "",
      twitter: personal.twitter || "",
      pronouns: personal.pronouns || "",
      salary: personal.salary || "",
      availability: personal.availability || "",
      workAuth: personal.workAuth || "",
      referral: personal.referral || "",
      currentCompany: "",
    };

    // Get current company from most recent experience
    if (Array.isArray(experience)) {
      const experiences = experience as Array<{
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

/**
 * POST /api/user/profile
 * Updates user's profile information from onboarding form
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, location, city, state, country } = body;

    // Find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email address is already in use" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // Update user profile information
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        phone: phone || user.phone,
        city: city || user.city,
        state: state || user.state,
        country: country || user.country,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        city: updated.city,
        state: updated.state,
        country: updated.country,
      }
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
