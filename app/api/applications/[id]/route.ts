import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const { companyName, jobTitle, jobUrl, status } = body;

    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found or access denied" },
        { status: 404 }
      );
    }

    if (jobUrl !== undefined && jobUrl !== existing.jobUrl) {
      const conflict = await prisma.application.findFirst({
        where: {
          userId: user.id,
          jobUrl: jobUrl,
          NOT: { id }
        }
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Another application with this job URL already exists" },
          { status: 409 }
        );
      }
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(jobUrl !== undefined && { jobUrl }),
        ...(status !== undefined && { status }),
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
      application: updatedApplication
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
