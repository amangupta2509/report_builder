"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, Save, RotateCcw } from "lucide-react";
import type { GeneTestResult } from "@/types/report-types";

interface GeneResultsAdminProps {
  geneTestResults: GeneTestResult[];
  addGeneTestResult: () => void;
  updateGeneTestResult: (
    index: number,
    field: keyof GeneTestResult,
    value: string
  ) => void;
  removeGeneTestResult: (index: number) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function GeneResultsAdmin({
  geneTestResults,
  addGeneTestResult,
  updateGeneTestResult,
  removeGeneTestResult,
  onSave,
  onReset,
}: GeneResultsAdminProps) {
  return (
    <Card className="shadow-lg border-0 bg-white w-full max-w-full">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg p-4 sm:p-5">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
          Gene Test Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 xl:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h3 className="text-base sm:text-lg font-semibold">
            Gene Test Results ({geneTestResults.length})
          </h3>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              onClick={addGeneTestResult}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm"
            >
              Add Gene Result
            </Button>
            <Button onClick={onSave}>Save Change</Button>
          </div>
        </div>

        <div className="space-y-3">
          {geneTestResults.map((result, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 bg-gray-50"
            >
              {/* Mobile Layout - Stacked */}
              <div className="block sm:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center bg-green-100 text-indigo-800 rounded-sm px-2 py-1 text-sm font-semibold">
                    {index + 1}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the gene result for{" "}
                          <strong>
                            {result.genecode || `Gene #${index + 1}`}
                          </strong>
                          . This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeGeneTestResult(index)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">
                      Gene Code
                    </Label>
                    <Input
                      value={result.genecode}
                      onChange={(e) =>
                        updateGeneTestResult(index, "genecode", e.target.value)
                      }
                      placeholder="Gene Code"
                      className="border-2 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">
                      Gene Name
                    </Label>
                    <Input
                      value={result.geneName}
                      onChange={(e) =>
                        updateGeneTestResult(index, "geneName", e.target.value)
                      }
                      placeholder="Gene Name"
                      className="border-2 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">
                      Variation
                    </Label>
                    <Input
                      value={result.variation}
                      onChange={(e) =>
                        updateGeneTestResult(index, "variation", e.target.value)
                      }
                      placeholder="Variation"
                      className="border-2 focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">
                      Result
                    </Label>
                    <Input
                      value={result.result}
                      onChange={(e) =>
                        updateGeneTestResult(index, "result", e.target.value)
                      }
                      placeholder="Result"
                      className="border-2 focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Tablet and Desktop Layout - Inline */}
              <div className="hidden sm:flex items-center gap-2 md:gap-3 lg:gap-4">
                {/* Gene Number - Left corner */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center bg-green-100 text-indigo-800 rounded-sm px-2 py-2 text-sm font-semibold">
                    {index + 1}
                  </span>
                </div>

                {/* Four Input Fields - Responsive grid */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {/* Gene Code */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600 md:hidden">
                      Gene Code
                    </Label>
                    <Input
                      value={result.genecode}
                      onChange={(e) =>
                        updateGeneTestResult(index, "genecode", e.target.value)
                      }
                      placeholder="Gene Code"
                      className="border-2 focus:border-indigo-500"
                    />
                  </div>

                  {/* Gene Name */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600 md:hidden">
                      Gene Name
                    </Label>
                    <Input
                      value={result.geneName}
                      onChange={(e) =>
                        updateGeneTestResult(index, "geneName", e.target.value)
                      }
                      placeholder="Gene Name"
                      className="border-2 focus:border-indigo-500"
                    />
                  </div>

                  {/* Variation */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600 md:hidden">
                      Variation
                    </Label>
                    <Input
                      value={result.variation}
                      onChange={(e) =>
                        updateGeneTestResult(index, "variation", e.target.value)
                      }
                      placeholder="Variation"
                      className="border-2 focus:border-indigo-500 font-mono"
                    />
                  </div>

                  {/* Result */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600 md:hidden">
                      Result
                    </Label>
                    <Input
                      value={result.result}
                      onChange={(e) =>
                        updateGeneTestResult(index, "result", e.target.value)
                      }
                      placeholder="Result"
                      className="border-2 focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Delete Button - Right corner */}
                <div className="flex-shrink-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the gene result for{" "}
                          <strong>
                            {result.genecode || `Gene #${index + 1}`}
                          </strong>
                          . This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeGeneTestResult(index)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>

        {geneTestResults.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🧬</div>
            <p className="text-base sm:text-lg mb-3 sm:mb-4">
              No gene test results added yet
            </p>
            <Button
              onClick={addGeneTestResult}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Gene Result
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
