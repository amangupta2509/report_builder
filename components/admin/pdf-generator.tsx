"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, Eye } from "lucide-react";
import { useState, useRef } from "react";
import type { ComprehensiveReportData } from "@/types/report-types";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ComprehensiveReportViewer from "@/components/comprehensive-report-viewer";

interface PDFGeneratorProps {
  reportData: ComprehensiveReportData;
  reportIndex: number;
  patientCode: string;
}

export default function PDFGenerator({
  reportData,
  patientCode,
  reportIndex,
}: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [showForCapture, setShowForCapture] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  /** Print logic (unchanged) */
  const handlePrint = () => {
    const printWindow = window.open("/report/pdf", "_blank");
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print the report.",
        variant: "destructive",
      });
    }
  };

  /** Enhanced multi-page PDF capture with smart page breaks */
  const handleMultiPagePDF = async () => {
    setIsGenerating(true);
    setShowForCapture(true);
    
    try {
      // Wait for render and resources
      await new Promise((r) => setTimeout(r, 1000));

      if (!reportRef.current) {
        throw new Error("Report not found");
      }

      // Wait for fonts and images to load
      if (document.fonts?.ready) await document.fonts.ready;
      const images = reportRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
        )
      );

      // PDF configuration
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10; // 10mm margin
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;
      
      // High quality scale for better resolution
      const scale = 3;
      const element = reportRef.current;
      
      // Calculate dimensions
      const elementWidth = element.offsetWidth;
      const elementHeight = element.scrollHeight;
      
      // Calculate how much content fits per page in pixels
      const pixelsPerMM = (elementWidth * scale) / contentWidth;
      const pageHeightInPixels = contentHeight * pixelsPerMM;
      
      // Find all sections to avoid cutting them
      const sections = element.querySelectorAll('.report-section, .card, .mb-6, .space-y-4 > div, .grid > div');
      const sectionPositions: Array<{ top: number; height: number; element: Element }> = [];
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        sectionPositions.push({
          top: (rect.top - elementRect.top) * scale,
          height: rect.height * scale,
          element: section
        });
      });

      let currentY = 0;
      let pageNumber = 0;
      
      while (currentY < elementHeight * scale) {
        const remainingHeight = (elementHeight * scale) - currentY;
        let sliceHeight = Math.min(pageHeightInPixels, remainingHeight);
        
        // Find the best break point to avoid cutting sections
        if (remainingHeight > pageHeightInPixels) {
          const cutPoint = currentY + sliceHeight;
          
          // Find sections that would be cut
          const problematicSections = sectionPositions.filter(section => 
            section.top < cutPoint && 
            section.top + section.height > cutPoint &&
            section.height < pageHeightInPixels * 0.8 // Only adjust if section isn't too large
          );
          
          if (problematicSections.length > 0) {
            // Adjust slice height to end before the problematic section
            const earliestSection = problematicSections.reduce((min, section) => 
              section.top < min.top ? section : min
            );
            
            const newSliceHeight = earliestSection.top - currentY;
            if (newSliceHeight > pageHeightInPixels * 0.3) { // Ensure we don't create tiny pages
              sliceHeight = newSliceHeight;
            }
          }
        }
        
        // Capture the page slice
        const canvas = await html2canvas(element, {
          scale: scale,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#FFFFFF",
          logging: false,
          width: elementWidth,
          height: sliceHeight / scale,
          x: 0,
          y: currentY / scale,
          windowWidth: elementWidth,
          windowHeight: sliceHeight / scale,
          scrollX: 0,
          scrollY: currentY / scale
        });

        // Add page to PDF
        if (pageNumber > 0) {
          pdf.addPage();
        }
        
        // Calculate the actual content dimensions to maintain aspect ratio
        const canvasAspectRatio = canvas.width / canvas.height;
        let imgWidth = contentWidth;
        let imgHeight = contentWidth / canvasAspectRatio;
        
        // If image height exceeds page, scale it down
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight;
          imgWidth = contentHeight * canvasAspectRatio;
        }
        
        // Center the image on the page
        const xOffset = margin + (contentWidth - imgWidth) / 2;
        const yOffset = margin + (contentHeight - imgHeight) / 2;
        
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
        
        currentY += sliceHeight;
        pageNumber++;
        
        // Add a small progress indicator
        toast({
          title: "Generating PDF",
          description: `Processing page ${pageNumber}...`,
        });
      }

      // Save the PDF
      const fileName = `${patientCode || "medical-report"}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Success",
        description: `PDF generated successfully with ${pageNumber} pages`,
        variant: "default",
      });

    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowForCapture(false);
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg p-4 sm:p-5">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
          PDF Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        {/* Enhanced Offscreen Report for PDF Export */}
        {showForCapture && (
          <div
            style={{
              position: "fixed",
              top: "-10000px",
              left: "0",
              width: "210mm",
              maxWidth: "210mm",
              background: "white",
              zIndex: 9999,
              padding: "20px",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.4",
              color: "#000000"
            }}
          >
            <div 
              ref={reportRef} 
              className="report-container"
              style={{
                pageBreakInside: "avoid",
                orphans: 3,
                widows: 3
              }}
            >
              <ComprehensiveReportViewer reportData={reportData} />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={() =>
              window.open(
                `/report/preview?patient=${encodeURIComponent(
                  patientCode
                )}&report=${reportIndex}`,
                "_blank"
              )
            }
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-200 hover:bg-blue-300 transition-colors"
            disabled={isGenerating}
          >
            <Eye className="h-6 w-6" />
            <span>Preview Report</span>
          </Button>

          <Button
            onClick={handlePrint}
            disabled={isGenerating}
            className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-6 w-6" />
            <span>Print Report</span>
          </Button>

          <Button
            onClick={handleMultiPagePDF}
            disabled={isGenerating}
            className="h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            <Download className={`h-6 w-6 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating ? "Generating..." : "Download PDF"}
            </span>
          </Button>
        </div>

        {/* Report Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-3">
            Report Information
          </h4>
          <div className="grid md:grid-cols-1 gap-4 text-sm">
            <div>
              <span className="font-medium">Patient Name:</span>{" "}
              {reportData.patientInfo.name || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Sample Code:</span>{" "}
              {reportData.patientInfo.sampleCode || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Report Date:</span>{" "}
              {reportData.patientInfo.reportDate || "Not specified"}
            </div>
          </div>
        </div>

        {/* PDF Generation Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            PDF Quality Features
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• High-resolution output (3x scaling)</li>
            <li>• Smart page breaks to avoid cutting content</li>
            <li>• Proper margins and formatting</li>
            <li>• Multi-page support with progress tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}