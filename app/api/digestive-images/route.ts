import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const folderName = "digestive";
const folderPath = path.join(process.cwd(), "public", folderName);
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

export async function GET() {
  try {
    const files = await fs.readdir(folderPath);

    const images = files
      .map((file) => ({
        label: file.split(".")[0], // e.g., "gut"
        url: `/${folderName}/${file}`, // e.g., "/digestive/gut.png"
      }))
      .filter((image) => /\.(jpg|jpeg|png|gif|webp)$/i.test(image.url));

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("Failed to read digestive image folder:", err);
    return NextResponse.json(
      { success: false, error: "Could not read images" },
      { status: 500 },
    );
  }
}

// DELETE handler for /api/digestive-images
export async function DELETE(req: NextRequest) {
  try {
    const { file } = await req.json();

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file name" },
        { status: 400 },
      );
    }

    const safeFileName = path.basename(file);
    const filePath = path.join(folderPath, safeFileName);

    if (!path.resolve(filePath).startsWith(path.resolve(folderPath))) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 },
      );
    }
    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete digestive image:", err);
    return NextResponse.json(
      { success: false, error: "Could not delete image" },
      { status: 500 },
    );
  }
}

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

    if (folder !== folderName) {
      return NextResponse.json(
        { success: false, error: "Invalid folder" },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 },
      );
    }

    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: "Invalid file extension" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeLabel = label
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_+/g, "_");
    const safeName = `${safeLabel}${fileExtension}`;
    const filePath = path.join(process.cwd(), "public", folder, safeName);

    if (!path.resolve(filePath).startsWith(path.resolve(folderPath))) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 },
      );
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/${folder}/${safeName}`,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}
