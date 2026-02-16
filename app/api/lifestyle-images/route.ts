import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

function getFolderPath(folder: string) {
  return path.join(process.cwd(), "public", folder);
}

// GET: List images in a folder (e.g., /api/image-library?folder=lifestyle)
export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get("folder");
  if (!folder) {
    return NextResponse.json(
      { success: false, error: "Missing folder" },
      { status: 400 }
    );
  }

  const folderPath = getFolderPath(folder);

  try {
    const files = await fs.readdir(folderPath);
    const images = files.map((file) => ({
      label: file.split(".")[0],
      url: `/${folder}/${file}`,
    }));

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("Failed to read image folder:", err);
    return NextResponse.json(
      { success: false, error: "Could not read images" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split(".").pop() || "png";
    const safeName = `${label.replace(/\s+/g, "_").toLowerCase()}.${ext}`;
    const filePath = path.join(getFolderPath(folder), safeName);

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
      { status: 500 }
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
        { status: 400 }
      );
    }

    const filePath = path.join(getFolderPath(folder), file);
    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete failed:", err);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
