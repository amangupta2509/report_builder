import { writeFile, readdir, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// POST: Upload image to /public/sports
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const label = formData.get("label") as string;

  if (!file || !label) {
    return NextResponse.json(
      { success: false, error: "Missing file or label" },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "Invalid file type" },
      { status: 400 },
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { success: false, error: "Invalid file extension" },
      { status: 400 },
    );
  }

  const safeLabel = label
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/gi, "");
  const fileName = `${safeLabel}${ext}`;
  const folderPath = path.join(process.cwd(), "public", "sports");
  const filePath = path.join(folderPath, fileName);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await mkdir(folderPath, { recursive: true });
    await writeFile(filePath, buffer);

    const publicUrl = `/sports/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save file" },
      { status: 500 },
    );
  }
}

//delete image

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Missing file parameter" },
        { status: 400 },
      );
    }

    const folderPath = path.join(process.cwd(), "public", "sports");
    const safeFileName = path.basename(fileName);
    const filePath = path.join(folderPath, safeFileName);

    if (!path.resolve(filePath).startsWith(path.resolve(folderPath))) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 },
      );
    }

    if (existsSync(filePath)) {
      await unlink(filePath);
      return NextResponse.json({ success: true, deleted: fileName });
    } else {
      return NextResponse.json(
        { success: false, error: "File does not exist" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error deleting sports image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
// GET: Return list of images in /public/sports
export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), "public", "sports");
    const files = await readdir(dirPath);

    const images = files.map((file) => ({
      label: path.parse(file).name.toLowerCase(), // "dumbbell"
      url: `/sports/${file}`,
    }));

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Failed to read sports directory:", error);
    return NextResponse.json(
      { success: false, error: "Could not read sports folder" },
      { status: 500 },
    );
  }
}
