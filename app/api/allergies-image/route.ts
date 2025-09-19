import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const folderName = "allergies";
const folderPath = path.join(process.cwd(), "public", folderName);

// === GET: Return all allergy image URLs ===
export async function GET() {
  try {
    const files = await fs.readdir(folderPath);
    const images = files.map((file) => ({
      label: path.parse(file).name,
      url: `/${folderName}/${file}`,
    }));
    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("❌ Failed to read allergy image folder:", err);
    return NextResponse.json(
      { success: false, error: "Could not read images" },
      { status: 500 }
    );
  }
}

// === POST: Upload a new allergy image ===
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const label = formData.get("label") as string;

    if (!file || !label) {
      return NextResponse.json(
        { success: false, error: "Missing file or label" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "png";
    const safeLabel = label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/gi, "");
    const fileName = `${safeLabel}.${ext}`;
    const filePath = path.join(folderPath, fileName);

    await fs.mkdir(folderPath, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      label: safeLabel,
      url: `/${folderName}/${fileName}`,
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

// === DELETE: Remove an allergy image by filename ===
export async function DELETE(req: NextRequest) {
  try {
    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Missing filename" },
        { status: 400 }
      );
    }

    const filePath = path.join(folderPath, filename);

    // Double-check file exists before deleting
    await fs.access(filePath);
    await fs.unlink(filePath);

    return NextResponse.json({ success: true, deleted: filename });
  } catch (err: any) {
    console.error("❌ Delete failed:", err.message);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
