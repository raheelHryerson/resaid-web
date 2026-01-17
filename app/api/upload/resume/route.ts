    // Utility: Insert spaces before capital letters in CamelCase
    function spaceCamelCase(str: string | null | undefined): string | null {
      if (!str) return null;
      // Remove single-letter abbreviations (e.g., 'S.')
      const noAbbrev = str.replace(/\b\w\./g, '').trim();
      // Insert spaces before capital letters (but not at the start)
      return noAbbrev.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
    }
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
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

    // Extract raw text and use AI to parse resume
    console.log("Extracting raw text and parsing with AI...");
    let parsedData;
    let originalText = "";
    try {
      const { extractText } = await import("@/lib/resume/extractText");
      originalText = await extractText(buffer, file.type);
      const { parseResumeWithAI } = await import("@/lib/resume/parseResumeWithAI");
      const aiData = await parseResumeWithAI(originalText);
      if (!aiData) {
        parsedData = {
          personal: { name: null, email: null, phone: null, location: null },
          skills: [],
          experience: [],
          education: [],
        };
      } else {
        // Normalize: always wrap personal fields in a personal object
        // Map experience and education fields to dashboard schema
        const normalizedExperience = (aiData.experience ?? []).map((exp: any) => ({
          title: spaceCamelCase(exp.title ?? null),
          organization: spaceCamelCase(exp.organization ?? exp.company ?? null),
          startDate: exp.startDate ?? null,
          endDate: exp.endDate ?? null,
          location: spaceCamelCase(exp.location ?? null),
          bullets: Array.isArray(exp.bullets) ? exp.bullets.map(spaceCamelCase) : [],
        }));
        const normalizedEducation = (aiData.education ?? []).map((edu: any) => ({
          credential: spaceCamelCase(edu.credential ?? edu.degree ?? null),
          institution: spaceCamelCase(edu.institution ?? edu.school ?? null),
          field: spaceCamelCase(edu.field ?? null),
          startDate: edu.startDate ?? null,
          endDate: edu.endDate ?? edu.year ?? null,
        }));
        // Name normalization: ignore single-letter parts, space out CamelCase
        let rawName = aiData.personal?.name ?? aiData.name ?? null;
        let name = spaceCamelCase(rawName);
        if (name) {
          // Remove single-letter words (likely abbreviations)
          name = name.split(' ').filter(part => part.length > 1).join(' ');
        }
        parsedData = {
          personal: {
            name,
            email: aiData.personal?.email ?? aiData.email ?? null,
            phone: aiData.personal?.phone ?? aiData.phone ?? null,
            location: spaceCamelCase(aiData.personal?.location ?? aiData.location ?? null),
          },
          skills: aiData.skills ?? [],
          experience: normalizedExperience,
          education: normalizedEducation,
        };
      }
      console.log("AI resume parsed successfully (normalized):", parsedData);
    } catch (parseError) {
      console.error("Resume parsing error:", parseError);
      parsedData = {
        personal: {
          name: null,
          email: null,
          phone: null,
          location: null,
        },
        skills: [],
        experience: [],
        education: [],
      };
    }

    // Optionally, update user profile with parsed personal info (name, email, phone, location)
    const userUpdate: Record<string, any> = {};
    if (parsedData) {
      if (parsedData.email && !user.email) userUpdate.email = parsedData.email;
      if (parsedData.phone && !user.phone) userUpdate.phone = parsedData.phone;
      if (parsedData.city && !user.city) userUpdate.city = parsedData.city;
      if ((parsedData.province || parsedData.state) && !user.state) {
        userUpdate.state = parsedData.province || parsedData.state;
      }
      if (parsedData.country && !user.country) userUpdate.country = parsedData.country;
      // Split name into firstName and lastName if possible
      if (parsedData.name && (!user.firstName || !user.lastName)) {
        const nameParts = parsedData.name.split(/\s+/);
        if (!user.firstName && nameParts.length > 0) userUpdate.firstName = nameParts[0];
        if (!user.lastName && nameParts.length > 1) userUpdate.lastName = nameParts.slice(1).join(" ");
      }
    }
    // Remove any invalid fields (like 'name') before updating
    delete userUpdate.name;
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdate,
      });
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
          parsedData: resume.parsedData,
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
