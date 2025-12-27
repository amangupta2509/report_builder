"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ComprehensiveReportViewer from "@/components/comprehensive-report-viewer";
import type { ComprehensiveReportData } from "@/types/report-types";

export default function ReportPreviewPage() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<ComprehensiveReportData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const patientCode = searchParams.get("patient");
    const reportIndexStr = searchParams.get("report");

    if (!patientCode || !reportIndexStr) {
      setError("Missing 'patient' or 'report' query parameters.");
      return;
    }

    const reportIndex = parseInt(reportIndexStr);
    if (isNaN(reportIndex)) {
      setError("Invalid report index.");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/patients-data", { cache: "no-store" });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const patients = await res.json();

        const patient = patients.find(
          (p: any) => p.info?.sampleCode === patientCode
        );
        if (!patient) {
          setError(`No patient found with sampleCode "${patientCode}".`);
          return;
        }

        const report = patient.reports?.[reportIndex];
        if (!report) {
          setError(
            `No report found at index ${reportIndex} for patient "${patientCode}".`
          );
          return;
        }

        setReportData({
          ...report,
          patientInfo: patient.info,
        });
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report data.");
      }
    };

    fetchData();
  }, [searchParams]);



  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <ComprehensiveReportViewer reportData={reportData} />
    </div>
  );
}
