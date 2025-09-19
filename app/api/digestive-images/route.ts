import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const folderName = "digestive";
const folderPath = path.join(process.cwd(), "public", folderName);

export async function GET() {
  try {
    const files = await fs.readdir(folderPath);

    const images = files.map((file) => ({
      label: file.split(".")[0], // e.g., "gut"
      url: `/${folderName}/${file}`, // e.g., "/digestive/gut.png"
    }));

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("Failed to read digestive image folder:", err);
    return NextResponse.json(
      { success: false, error: "Could not read images" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const filePath = path.join(folderPath, file);
    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete digestive image:", err);
    return NextResponse.json(
      { success: false, error: "Could not delete image" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split(".").pop() || "png";
    const safeName = `${label.replace(/\s+/g, "_").toLowerCase()}.${ext}`;
    const filePath = path.join(process.cwd(), "public", folder, safeName);

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
