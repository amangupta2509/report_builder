import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only image files are allowed.",
        },
        { status: 400 },
      );
    }

    // Validate file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file extension. Only image files are allowed.",
        },
        { status: 400 },
      );
    }

    // Validate file size
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds maximum of ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        },
        { status: 413 },
      );
    }

    // Generate safe filename with timestamp
    const sanitizedFileName = file.name
      .replace(/[^a-z0-9._-]/gi, "_")
      .toLowerCase();
    const fileName = `${Date.now()}-${sanitizedFileName}`;
    const filePath = path.join(process.cwd(), "public", "table", fileName);

    await writeFile(filePath, buffer);
    const publicUrl = `/table/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("File upload error");
    return NextResponse.json(
      { success: false, error: "Failed to save file" },
      { status: 500 },
    );
  }
}
