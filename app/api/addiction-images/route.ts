import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Interface for image objects
interface AddictionImage {
  label: string;
  url: string;
}

// GET handler - Fetch all addiction images
export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), "public");
    const iconsPath = path.join(publicPath, "addiction", "icons");
    const sensitivityPath = path.join(publicPath, "addiction", "sensitivity");

    // Initialize arrays for images
    const icons: AddictionImage[] = [];
    const sensitivities: AddictionImage[] = [];

    // Read icons directory
    if (existsSync(iconsPath)) {
      try {
        const iconFiles = await readdir(iconsPath);
        for (const file of iconFiles) {
          if (file.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            const label = path.parse(file).name; // Remove extension
            icons.push({
              label,
              url: `/addiction/icons/${file}`,
            });
          }
        }
      } catch (error) {
        console.warn("Could not read icons directory:", error);
      }
    }

    // Read sensitivity directory
    if (existsSync(sensitivityPath)) {
      try {
        const sensitivityFiles = await readdir(sensitivityPath);
        for (const file of sensitivityFiles) {
          if (file.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            const label = path.parse(file).name; // Remove extension
            sensitivities.push({
              label,
              url: `/addiction/sensitivity/${file}`,
            });
          }
        }
      } catch (error) {
        console.warn("Could not read sensitivity directory:", error);
      }
    }

    return NextResponse.json({
      success: true,
      icons,
      sensitivities,
    });
  } catch (error) {
    console.error("Error fetching addiction images:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch images",
      },
      { status: 500 }
    );
  }
}

// POST handler - Upload new addiction images
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const label = formData.get("label") as string;
    const folder = formData.get("folder") as string; // "addiction/icons" or "addiction/sensitivity"

    // Validation
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!label) {
      return NextResponse.json(
        { success: false, error: "No label provided" },
        { status: 400 }
      );
    }

    if (
      !folder ||
      (!folder.includes("addiction/icons") &&
        !folder.includes("addiction/sensitivity"))
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid folder specified" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload an image file.",
        },
        { status: 400 }
      );
    }

    // Create file extension based on MIME type
    const getFileExtension = (mimeType: string): string => {
      const extensions: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
        "image/webp": ".webp",
      };
      return extensions[mimeType] || ".jpg";
    };

    const fileExtension = getFileExtension(file.type);
    const cleanLabel = label.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const fileName = `${cleanLabel}${fileExtension}`;

    // Create directory path
    const publicPath = path.join(process.cwd(), "public");
    const uploadDir = path.join(publicPath, folder);
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating directory:", error);
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate the public URL
    const publicUrl = `/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      label: cleanLabel,
      url: publicUrl,
      filename: fileName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
      },
      { status: 500 }
    );
  }
}

// DELETE handler - Optional: Delete addiction images
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");
    const folder = searchParams.get("folder");

    if (!fileName || !folder) {
      return NextResponse.json(
        { success: false, error: "Missing file or folder parameter" },
        { status: 400 }
      );
    }

    const publicPath = path.join(process.cwd(), "public");
    const filePath = path.join(publicPath, folder, fileName);

    // Check if file exists and delete it
    if (existsSync(filePath)) {
      const fs = await import("fs/promises");
      await fs.unlink(filePath);

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete file",
      },
      { status: 500 }
    );
  }
}
