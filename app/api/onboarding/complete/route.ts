import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Update DB flag
  await prisma.user.update({
    where: { clerkId: userId },
    data: { onboardingCompleted: true },
  });

  const res = NextResponse.json({ ok: true });
  // Set a cookie to mark onboarding as complete. Auth-agnostic.
  res.cookies.set("onboardingCompleted", "true", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
