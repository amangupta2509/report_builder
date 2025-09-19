import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const reportFilePath = path.join(process.cwd(), "data", "report-data.json");

async function readReportData() {
  try {
    const data = await fs.readFile(reportFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Failed to read report-data.json:", error);
    return {};
  }
}

async function writeReportData(data: any) {
  try {
    await fs.writeFile(reportFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("❌ Failed to write report-data.json:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (
      !body.nutritionData ||
      typeof body.nutritionData !== "object" ||
      typeof body.nutritionData.data !== "object"
    ) {
      return NextResponse.json(
        { error: "Invalid nutritionData format" },
        { status: 400 }
      );
    }

    const reportData = await readReportData();

    // ✅ Overwrite the entire nutritionData object
    reportData.nutritionData = {
      quote: body.nutritionData.quote || "",
      description: body.nutritionData.description || "",
      data: body.nutritionData.data || {},
    };

    await writeReportData(reportData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ API error in POST /api/nutrition:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
