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
 * GET /api/user/api-key
 * Retrieves the user's API key for extension auth
 * Creates one if it doesn't exist
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: CORS_HEADERS });
    }

    // Check if user has an active API key
    let apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    // Create one if doesn't exist
    if (!apiKey) {
      apiKey = await prisma.apiKey.create({
        data: {
          userId: user.id,
          name: "Extension Key",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        apiKey: apiKey.key,
        createdAt: apiKey.createdAt,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error retrieving API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
