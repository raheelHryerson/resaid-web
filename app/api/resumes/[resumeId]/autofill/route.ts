import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { resumeToAutofill, validateAutofill } from "@/lib/resume/autofill";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/resumes/:resumeId/autofill
 * Get normalized autofill data from a resume
 * Used by Chrome extension and web form filling
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
    });

    if (!resume || resume.userId !== user.id) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    // Convert to autofill format
    const parsedData = (resume.parsedData as any) || {
      personal: { name: null, email: null, phone: null, location: null },
      experience: [],
      education: [],
      skills: [],
    };

    const autofillData = resumeToAutofill(parsedData);
    const validation = validateAutofill(autofillData);

    return NextResponse.json(
      {
        success: true,
        resumeId,
        autofill: autofillData,
        validation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating autofill data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
