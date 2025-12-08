import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const folderName = "sleep";
const folderPath = path.join(process.cwd(), "public", folderName);

// GET: List all sleep images
export async function GET() {
  try {
    const files = await fs.readdir(folderPath);

    const images = files.map((file) => ({
      label: file.split(".")[0], // This will now be your custom label
      url: `/${folderName}/${file}`,
    }));

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("Failed to read sleep image folder:", err);
    return NextResponse.json(
      { success: false, error: "Could not read images" },
      { status: 500 }
    );
  }
}

// POST: Upload a new image to /public/sleep
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const customLabel = formData.get("label") as string; // Get the custom label

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use custom label if provided, otherwise use original filename
    const fileExtension = path.extname(file.name);
    const fileName = customLabel
      ? `${customLabel.replace(/\s+/g, "_")}${fileExtension}`
      : file.name.replace(/\s+/g, "_");

    const filePath = path.join(folderPath, fileName);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      label: customLabel || file.name.split(".")[0], // Return the label used
      url: `/${folderName}/${fileName}`,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an image from /public/sleep
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file parameter" },
        { status: 400 }
      );
    }

    const filePath = path.join(folderPath, file);
    await fs.unlink(filePath);

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (err) {
    console.error("Deletion failed:", err);
    return NextResponse.json(
      { success: false, error: "Deletion failed" },
      { status: 500 }
    );
  }
}