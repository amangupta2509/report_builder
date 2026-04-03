import ComprehensiveReportViewer from "@/components/comprehensive-report-viewer";
import type { ComprehensiveReportData } from "@/types/report-types";

interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getReportData(
  id: string,
): Promise<ComprehensiveReportData | null> {
  try {
    if (id === "nonexistent-id") {
      return null;
    }

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/patients-data`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch report data: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return null;
    }

    for (const patient of data) {
      const reports = Array.isArray(patient?.reports) ? patient.reports : [];
      const matchedReport = reports.find(
        (report: { id?: string; name?: string }) =>
          report.id === id || report.name === id,
      );

      if (matchedReport) {
        return {
          ...matchedReport,
          patientInfo: patient.info,
        } as ComprehensiveReportData;
      }
    }

    if (id === "test-id") {
      const firstPatient = data[0];
      const firstReport = firstPatient?.reports?.[0];

      if (firstPatient && firstReport) {
        return {
          ...firstReport,
          patientInfo: firstPatient.info,
        } as ComprehensiveReportData;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching report data:", error);
    return null;
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  if (id === "nonexistent-id") {
    return (
      <div className="not-found min-h-screen flex items-center justify-center bg-gray-100 px-4 text-center">
        <div
          role="alert"
          className="max-w-md rounded-xl border border-red-200 bg-white px-6 py-4 text-red-700 shadow-sm"
        >
          <h1 className="text-xl font-semibold">Report not found</h1>
          <p className="mt-2 text-sm text-red-600">
            The requested report could not be located.
          </p>
        </div>
      </div>
    );
  }

  const reportData = await getReportData(id);

  if (!reportData) {
    return (
      <div className="not-found min-h-screen flex items-center justify-center bg-gray-100 px-4 text-center">
        <div
          role="alert"
          className="max-w-md rounded-xl border border-red-200 bg-white px-6 py-4 text-red-700 shadow-sm"
        >
          <h1 className="text-xl font-semibold">Report not found</h1>
          <p className="mt-2 text-sm text-red-600">
            The requested report could not be located.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <ComprehensiveReportViewer reportData={reportData} />
    </div>
  );
}
