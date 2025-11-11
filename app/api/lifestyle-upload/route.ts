import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const uploadFolder = path.join(process.cwd(), "public", "life");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;

    if (!file || !categoryId) {
      return NextResponse.json(
        { error: "Missing file or categoryId" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${categoryId}.${ext}`;
    const filePath = path.join(uploadFolder, fileName);

    await fs.mkdir(uploadFolder, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/life/${fileName}`;
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
