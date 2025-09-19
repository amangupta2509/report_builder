import { notFound } from "next/navigation";
import ComprehensiveReportViewer from "@/components/comprehensive-report-viewer";
import type { ComprehensiveReportData } from "@/types/report-types";

interface ReportPageProps {
  params: {
    id: string;
  };
}

async function getReportData(
  id: string
): Promise<ComprehensiveReportData | null> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/patients-data`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch report data: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    return data as ComprehensiveReportData;
  } catch (error) {
    console.error("Error fetching report data:", error);
    return null;
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  const reportData = await getReportData(params.id);

  if (!reportData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <ComprehensiveReportViewer reportData={reportData} />
    </div>
  );
}
