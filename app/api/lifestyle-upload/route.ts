import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const uploadFolder = path.join(process.cwd(), "public", "life");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;

    if (!file || !categoryId) {
      return NextResponse.json(
        { error: "Missing file or categoryId" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only image files are allowed." },
        { status: 400 },
      );
    }

    // Sanitize categoryId - prevent path traversal
    const sanitizedCategoryId = categoryId
      .replace(/\.\./g, "")
      .replace(/\\/g, "")
      .replace(/\//g, "")
      .substring(0, 255); // Limit length

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${sanitizedCategoryId}.${ext}`;
    const filePath = path.join(uploadFolder, fileName);

    // Ensure the resolved path is within uploadFolder (prevent path traversal)
    if (!path.resolve(filePath).startsWith(path.resolve(uploadFolder))) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    await fs.mkdir(uploadFolder, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/life/${fileName}`;
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error");
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
