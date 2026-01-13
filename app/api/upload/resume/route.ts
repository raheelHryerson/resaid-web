import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { parseResume } from "@/lib/resume-parser";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Max 10MB file size
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

// Create Supabase client with service role key for uploads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    console.log("=== UPLOAD ENDPOINT ===");
    console.log("Auth userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the FormData from request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Get user from database by clerkId
    console.log("Looking for user with clerkId:", userId);
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    console.log("User found:", user?.id, user?.email);

    if (!user) {
      console.error("User not found in database for clerkId:", userId);
      const allUsers = await prisma.user.findMany();
      console.error("All users in DB:", allUsers.map(u => ({ id: u.id, clerkId: u.clerkId, email: u.email })));
      return NextResponse.json(
        { error: "User not found in database. Please sign out and sign in again." },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.type === "application/pdf" ? "pdf" : "docx";
    const fileName = `${user.id}-${timestamp}.${fileExt}`;
    const storagePath = `resumes/${user.id}/${fileName}`;

    // Upload to Supabase Storage using service role
    console.log("Uploading to Supabase:", storagePath);
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from("resume")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      console.error("Error details:", JSON.stringify(uploadError));
      return NextResponse.json(
        { error: `Failed to upload file to storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Store the file path (signed URLs can be generated on-demand for downloads)
    const fileUrl = storagePath;

    // Parse resume to extract skills, experience, education
    console.log("Parsing resume...");
    let parsedData;
    let originalText = "";
    try {
      const { extractText } = await import("@/lib/resume/extractText");
      originalText = await extractText(buffer, file.type);
      parsedData = await parseResume(buffer, file.type);
      console.log("Resume parsed successfully:", parsedData);
    } catch (parseError) {
      console.error("Resume parsing error:", parseError);
      parsedData = {
        personal: { name: null, email: null, phone: null, location: null },
        skills: [],
        experience: [],
        education: [],
      };
    }

    // PHASE 7: Create Resume record + version history (never overwrite)
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        parsedData: parsedData as any,
        isDefault: false,
        // Create initial version
        versions: {
          create: {
            originalText: originalText,
            parsedData: parsedData as any,
            parsingEngine: file.type === "application/pdf" ? "pdf2json-v1" : "mammoth-v1",
            version: 1,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    console.log(`Resume created with ${resume.versions.length} version(s)`);

    return NextResponse.json(
      {
        success: true,
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          fileSize: resume.fileSize,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resume upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
