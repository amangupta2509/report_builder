"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Database,
  Shield,
} from "lucide-react";
import type { ComprehensiveReportData } from "@/types/report-types";

interface ImportExportAdminProps {
  reportData: ComprehensiveReportData;
  setReportData: (data: ComprehensiveReportData) => void;
}

// Mock toast hook for demonstration
const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log(`Toast: ${title} - ${description} (${variant})`);
  },
});

export default function ImportExportAdmin({
  reportData,
  setReportData,
}: ImportExportAdminProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    lastModified: number;
  } | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateImportData = (data: any): boolean => {
    if (!data || typeof data !== "object") return false;

    // Check for required top-level properties
    if (!data.patientInfo) return false;
    if (!data.id || !data.content || !data.settings) return false;

    // Check patientInfo structure
    if (!data.patientInfo.name || !data.patientInfo.sampleCode) return false;

    // Check for essential report properties
    if (!data.content || typeof data.content !== "object") return false;
    if (!data.settings || typeof data.settings !== "object") return false;

    return true;
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      // Add metadata to export
      const exportData: ComprehensiveReportData & { metadata?: any } = {
        ...reportData,
        metadata: {
          version: "2.0",
          exportDate: new Date().toISOString(),
          dataVersion: "1.0",
          exportedBy: "Genomics Report System",
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const timestamp = new Date().toISOString().split("T")[0];
      const patientId = reportData.patientInfo?.sampleCode || "unknown";
      const filename = `genomics-report-${patientId}-${timestamp}.json`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Report data exported as ${filename}`,
        variant: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const processImportFile = useCallback(
    async (file: File) => {
      setIsImporting(true);
      setFileInfo({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      });

      try {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File size too large. Maximum size is 10MB.");
        }

        // Check file type
        if (!file.name.toLowerCase().endsWith(".json")) {
          throw new Error("Invalid file type. Please select a JSON file.");
        }

        const fileText = await file.text();
        const importedData = JSON.parse(fileText);

        // Validate data structure
        if (!validateImportData(importedData)) {
          throw new Error(
            "Invalid file format. Missing required patient info or report data."
          );
        }

        // Check if it's an exported file from this system
        if (importedData.metadata?.exportedBy !== "Genomics Report System") {
          console.warn(
            "File may not be from this system, proceeding with caution..."
          );
        }

        // Remove metadata before setting data (clean the imported data)
        const { metadata, ...cleanImportedData } = importedData;

        setReportData(cleanImportedData as ComprehensiveReportData);

        toast({
          title: "Import Successful",
          description: `Successfully imported data for patient: ${importedData.patientInfo.name}`,
          variant: "success",
          duration: 3000,
        });
      } catch (error: any) {
        console.error("Import error:", error);
        setFileInfo(null);

        let errorMessage = "Unknown error occurred";
        if (error instanceof SyntaxError) {
          errorMessage = "Invalid JSON format";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Import Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsImporting(false);
      }
    },
    [setReportData, toast]
  );

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImportFile(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files?.[0]) {
        processImportFile(files[0]);
      }
    },
    [processImportFile]
  );

  return (
    <div className="max-w-8xl mx-auto">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-lg p-4 sm:p-5">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
            Data Management Hub
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Export Section */}
            <Card className="border-2 border-green-200 bg-green-50/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800">
                    Export Data
                  </h3>
                </div>
                <p className="text-green-700 leading-relaxed">
                  Create a secure backup of your current report configuration.
                  Includes all patient data, analysis results, and metadata.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FileText className="h-4 w-4" />
                    <span>Current Data Summary</span>
                  </div>
                  <div className="text-sm space-y-1 text-gray-700">
                    <div>
                      Patient:{" "}
                      <span className="font-medium">
                        {reportData.patientInfo?.name || "No name"}
                      </span>
                    </div>
                    <div>
                      Patient ID:{" "}
                      <span className="font-medium">
                        {reportData.patientInfo?.sampleCode || "No ID"}
                      </span>
                    </div>
                    <div>
                      Data Size:{" "}
                      <span className="font-medium">
                        {formatFileSize(JSON.stringify(reportData).length)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={exportData}
                  disabled={isExporting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium transition-all duration-200"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Export Current Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Import Section */}
            <Card className="border-2 border-blue-200 bg-blue-50/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-800">
                    Import Data
                  </h3>
                </div>
                <p className="text-blue-700 leading-relaxed">
                  Restore previously exported data or load a new report
                  configuration. Supports drag & drop for easy file selection.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div
                  className={`
                    border-3 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                    ${
                      dragActive
                        ? "border-blue-500 bg-blue-100/70 scale-105"
                        : "border-blue-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
                    }
                    ${isImporting ? "pointer-events-none opacity-60" : ""}
                  `}
                  onDragEnter={handleDragIn}
                  onDragLeave={handleDragOut}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInput}
                    className="hidden"
                    id="import-file"
                    disabled={isImporting}
                  />
                  <Label htmlFor="import-file" className="cursor-pointer block">
                    {isImporting ? (
                      <div className="space-y-3">
                        <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
                        <div className="text-lg font-medium text-blue-700">
                          Processing File...
                        </div>
                        {fileInfo && (
                          <div className="text-sm text-blue-600">
                            {fileInfo.name} ({formatFileSize(fileInfo.size)})
                          </div>
                        )}
                      </div>
                    ) : dragActive ? (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 mx-auto text-blue-500" />
                        <div className="text-lg font-medium text-blue-700">
                          Drop your JSON file here!
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 mx-auto text-blue-400" />
                        <div className="text-lg font-medium text-blue-700">
                          Click to select or drag & drop
                        </div>
                        <div className="text-sm text-blue-600">
                          Supports JSON files up to 10MB
                        </div>
                      </div>
                    )}
                  </Label>
                </div>

                {fileInfo && !isImporting && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>File Ready for Import</span>
                    </div>
                    <div className="text-sm space-y-1 text-gray-700">
                      <div>
                        File:{" "}
                        <span className="font-medium">{fileInfo.name}</span>
                      </div>
                      <div>
                        Size:{" "}
                        <span className="font-medium">
                          {formatFileSize(fileInfo.size)}
                        </span>
                      </div>
                      <div>
                        Modified:{" "}
                        <span className="font-medium">
                          {new Date(fileInfo.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security & Guidelines Section */}
          <Card className="mt-8 border-2 border-amber-200 bg-amber-50/70">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3"></div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <ul className="text-sm text-amber-700 space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      Always export current data as backup first
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      Verify file source and authenticity
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      Check file size and modification date
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <ul className="text-sm text-amber-700 space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      Imports completely replace current configuration
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      Only use JSON files from this system
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      Save changes immediately after importing
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
