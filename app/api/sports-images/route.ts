import { writeFile, readdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
me = 
se  (error) {
    console.error("Error deleting sports image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
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
      { status: 500 }
    );
  }
}
