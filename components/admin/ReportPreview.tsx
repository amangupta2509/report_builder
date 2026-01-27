"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
i
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

  // 
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button onClick={handlePrint}>Print / Save as PDF</Button>
      </div>

      {/* Ref should be on a DOM node */}
       ...selectedReport,
            patientInfo: selectedPatient.info,
          }}
        />
      </div>
    </div>
  );
}
