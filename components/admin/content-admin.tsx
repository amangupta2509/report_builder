"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react"; // Import icons
import type { ReportContent } from "@/types/report-types";

interface ContentAdminProps {
  content: ReportContent;
  updateContent: (field: keyof ReportContent, value: string) => void;
  onSave: () => void; // Added onSave
  onReset: () => void; // Added onReset
}

export default function ContentAdmin({
  content,
  updateContent,
  onSave,
  onReset,
}: ContentAdminProps) {
  // Prevent crash when content or its fields are undefined
  const safeContent: ReportContent = {
    introduction: content?.introduction ?? "",
    genomicsExplanation: content?.genomicsExplanation ?? "",
    genesHealthImpact: content?.genesHealthImpact ?? "",
    fundamentalsPRS: content?.fundamentalsPRS ?? "",
    utilityDoctors: content?.utilityDoctors ?? "",
    microarrayExplanation: content?.microarrayExplanation ?? "",
    microarrayData: content?.microarrayData ?? "",
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold uppercase text-center sm:text-left">
          Report Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 w-full">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 my-6">
          <Button onClick={onSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="introduction"
            className="text-lg font-semibold text-gray-800"
          >
            Welcome Letter Introduction
          </Label>
          <Textarea
            id="introduction"
            value={safeContent.introduction}
            onChange={(e) => updateContent("introduction", e.target.value)}
            placeholder="Enter introduction text"
            rows={9}
            className="border-2 focus:border-green-500 text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="genomicsExplanation"
            className="text-lg font-semibold text-gray-800"
          >
            What is Genomics?
          </Label>
          <Input
            id="genomicsExplanation"
            value={safeContent.genomicsExplanation}
            onChange={(e) =>
              updateContent("genomicsExplanation", e.target.value)
            }
            placeholder="Enter genomics explanation"
            className="border-2 focus:border-green-500 text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="genesHealthImpact"
            className="text-lg font-semibold text-gray-800"
          >
            Genes and Health Impact
          </Label>
          <Input
            id="genesHealthImpact"
            value={safeContent.genesHealthImpact}
            onChange={(e) => updateContent("genesHealthImpact", e.target.value)}
            placeholder="Enter genes and health impact content"
            className="border-2 focus:border-green-500 text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="fundamentalsPRS"
            className="text-lg font-semibold text-gray-800"
          >
            Fundamentals and PRS
          </Label>
          <Input
            id="fundamentalsPRS"
            value={safeContent.fundamentalsPRS}
            onChange={(e) => updateContent("fundamentalsPRS", e.target.value)}
            placeholder="Enter fundamentals and PRS content"
            className="border-2 focus:border-green-500 text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="utilityDoctors"
            className="text-lg font-semibold text-gray-800"
          >
            Utility for Doctors and Dietitians
          </Label>
          <Input
            id="utilityDoctors"
            value={safeContent.utilityDoctors}
            onChange={(e) => updateContent("utilityDoctors", e.target.value)}
            placeholder="Enter utility for doctors content"
            className="border-2 focus:border-green-500 text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="microarrayExplanation"
            className="text-lg font-semibold text-gray-800"
          >
            Microarray Explanation
          </Label>
          <Input
            id="microarrayExplanation"
            value={safeContent.microarrayExplanation}
            onChange={(e) =>
              updateContent("microarrayExplanation", e.target.value)
            }
            placeholder="Enter microarray explanation"
            className="border-2 focus:border-green-500 text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="microarrayData"
            className="text-lg font-semibold text-gray-800"
          >
            Your Microarray Data
          </Label>
          <Input
            id="microarrayData"
            value={safeContent.microarrayData}
            onChange={(e) => updateContent("microarrayData", e.target.value)}
            placeholder="Enter microarray data content"
            className="border-2 focus:border-green-500 text-sm leading-relaxed"
          />
        </div>
      </CardContent>
    </Card>
  );
}
