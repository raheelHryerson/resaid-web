import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, jobTitle, status } = body;

    // Update the application
    const application = await prisma.application.updateMany({
      where: {
        id: params.id,
        userId, // Ensure user can only update their own applications
      },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(status !== undefined && { status }),
      },
    });

    if (application.count === 0) {
      return NextResponse.json(
        { error: "Application not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch the updated application
    const updatedApplication = await prisma.application.findUnique({
      where: { id: params.id },
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