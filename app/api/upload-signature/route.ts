import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for signatures
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only image files are allowed." },
        { status: 400 },
      );
    }

    // Validate file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file extension. Only image files are allowed." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum of ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        },
        { status: 413 },
      );
    }

    const fileName = `${randomUUID()}-${Date.now()}${fileExtension}`;
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "signatures",
    );
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/signatures/${fileName}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Signature upload error");
    return NextResponse.json(
      { error: "Failed to upload signature" },
      { status: 500 },
    );
  }
}
