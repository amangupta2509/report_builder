import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// Whitelist of allowed folders to prevent path traversal
const ALLOWED_FOLDERS = [
  "lifestyle",
  "life",
  "sports",
  "digestive",
  "sleep",
  "addiction",
  "allergies",
  "sensitivity",
  "lifestyle-conditions",
];

function getFolderPath(folder: string): string | null {
  // Sanitize folder path
  const sanitized = folder
    .replace(/\.\./g, "")
    .replace(/\\/g, "")
    .toLowerCase();

  // Check whitelist
  if (!ALLOWED_FOLDERS.includes(sanitized)) {
    return null;
  }

  const folderPath = path.join(process.cwd(), "public", sanitized);

  // Ensure the resolved path is within public directory
  const resolvedPath = path.resolve(folderPath);
  const publicPath = path.resolve(path.join(process.cwd(), "public"));

  if (!resolvedPath.startsWith(publicPath)) {
    return null;
  }

  return folderPath;
}

// GET: List images in a folder
export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get("folder");
  if (!folder) {
    return NextResponse.json(
      { success: false, error: "Missing folder" },
      { status: 400 },
    );
  }

  const folderPath = getFolderPath(folder);
  if (!folderPath) {
    return NextResponse.json(
      { success: false, error: "Invalid folder" },
      { status: 400 },
    );
  }

  try {
    const files = await fs.readdir(folderPath);
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => ({
        label: file.split(".")[0],
        url: `/${folder}/${file}`,
      }));

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("Read folder error");
    return NextResponse.json(
      { success: false, error: "Could not read images" },
      { status: 500 },
    );
  }
}

// POST: Upload new image
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;
    const label = formData.get("label") as string;

    if (!file || !folder || !label) {
      return NextResponse.json(
        { success: false, error: "Missing file, label, or folder" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only image files allowed.",
        },
        { status: 400 },
      );
    }

    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file extension. Only image files allowed.",
        },
        { status: 400 },
      );
    }

    const folderPath = getFolderPath(folder);
    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: "Invalid folder" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size
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

    const safeName = `${label
      .replace(/\s+/g, "_")
      .toLowerCase()}${fileExtension}`;
    const filePath = path.join(folderPath, safeName);

    // Ensure the resolved path is within the allowed folder
    if (!path.resolve(filePath).startsWith(path.resolve(folderPath))) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 },
      );
    }

    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/${folder}/${safeName}`,
    });
  } catch (err) {
    console.error("Upload error");
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}

// DELETE: Remove image by name
export async function DELETE(req: NextRequest) {
  try {
    const { file, folder } = await req.json();
    if (!file || !folder) {
      return NextResponse.json(
        { success: false, error: "Missing file or folder" },
        { status: 400 },
      );
    }

    const folderPath = getFolderPath(folder);
    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: "Invalid folder" },
        { status: 400 },
      );
    }

    // Sanitize filename
    const sanitizedFile = file.replace(/\.\./g, "").replace(/\\/g, "");
    const filePath = path.join(folderPath, sanitizedFile);

    // Ensure the resolved path is within the allowed folder
    if (!path.resolve(filePath).startsWith(path.resolve(folderPath))) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 },
      );
    }

    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error");
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 },
    );
  }
}
