"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import ComprehensiveReportViewer from "@/components/comprehensive-report-viewer";
import type { Report, Patient } from "@/types/report-types";

interface ReportPreviewProps {
  selectedReport: Report;
  selectedPatient: Patient;
}

export default function ReportPreview({
  selectedReport,
  selectedPatient,
}: ReportPreviewProps) {
  // ✅ Ref to the DOM node
  const reportRef = useRef<HTMLDivElement>(null);

  // ✅ Use contentRef instead of content for v3+
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Report_${selectedPatient.info?.sampleCode || "Patient"}`,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button onClick={handlePrint}>Print / Save as PDF</Button>
      </div>

      {/* Ref should be on a DOM node */}
      <div ref={reportRef}>
        <ComprehensiveReportViewer
          reportData={{
            ...selectedReport,
            patientInfo: selectedPatient.info,
          }}
        />
      </div>
    </div>
  );
}
