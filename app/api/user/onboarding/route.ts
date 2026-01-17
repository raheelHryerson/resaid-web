import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ onboardingCompleted: false }, { status: 200 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const onboardingCompleted = !!user?.onboardingCompleted;
  return NextResponse.json({ onboardingCompleted });
}

