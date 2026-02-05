import { writeFile, readdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
me = 
se  (error) {
    console.error("Error deleting sports image:", error);
   st dirPath = path.join(process.cwd(), "public", "sports");
    const files = await readdir(dirPath);

    cone.error("Failed to read sports directory:", error);
    return NextResponse.json(
      { success: false, error: "Could not read sports folder" },
      { status: 500 }
    );
  }
}
