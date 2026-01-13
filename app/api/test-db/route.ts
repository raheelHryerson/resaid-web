import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    const users = await prisma.user.findMany();
    return NextResponse.json(
      {
        success: true,
        userCount: users.length,
        users: users,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Database error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
