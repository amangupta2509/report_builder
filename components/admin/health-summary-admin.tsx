"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HealthSummary, HealthSummaryEntry } from "@/types/report-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface HealthSummaryAdminProps {
  healthSummary: HealthSummary;
  onDescriptionUpdate: (value: string) => void;
  onUpdate: (
    index: number,
    field: keyof HealthSummaryEntry,
    value: string
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export default function HealthSummaryAdmin({
  healthSummary,
  onDescriptionUpdate,
  onUpdate,
  onAdd,
  onRemove,
  onSave,
  isLoading = false,
}: HealthSummaryAdminProps) {
  const { description = "", data = [] } = healthSummary || {};

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 sm:p-6 uppercase text-white">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center sm:justify-start">
            Health Summary Management
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Top Actions */}
      <div className="flex flex-row flex-wrap justify-end gap-2">
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="flex-1 sm:flex-initial min-w-[140px]"
        >
          {isLoading ? "Saving..." : "Save All Changes"}
        </Button>
        <Button
          onClick={onAdd}
          disabled={isLoading}
          className="flex-1 sm:flex-initial min-w-[140px]"
        >
          Add Summary
        </Button>
      </div>

      {/* Section Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Health Summary Description
        </label>
        <Input
          placeholder="Enter description for the health summary section..."
          value={description}
          onChange={(e) => onDescriptionUpdate(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-10 px-4 text-gray-500 border border-dashed rounded-lg bg-gray-50">
          <p className="text-lg font-medium mb-2">
            No health summary entries yet
          </p>
          <p className="text-sm">
            Click <strong>"Add Summary"</strong> to get started.
          </p>
        </div>
      )}

      {/* Entry List */}
      <div className="grid gap-6  md:grid-cols-3">
        {data.map((entry, index) => (
          <Card
            key={`health-summary-entry-${index}`}
            className="border rounded-xl shadow-sm hover:shadow-md border-gray-400 transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 rounded-t-xl">
              <span className=" bg-red-600 text-sm font-medium text-white px-3 py-1 rounded-full">
                {index + 1}
              </span>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemove(index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 p-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  placeholder="Enter entry title..."
                  value={entry.title}
                  onChange={(e) => onUpdate(index, "title", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Enter detailed description..."
                  value={entry.description}
                  onChange={(e) =>
                    onUpdate(index, "description", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-full min-h-[120px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
