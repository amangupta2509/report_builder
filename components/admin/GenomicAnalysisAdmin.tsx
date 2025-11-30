"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type {
  GenomicAnalysisTable,
  GenomicCategoryGroup,
} from "@/types/report-types";

interface Props {
  genomicAnalysisTable: GenomicAnalysisTable;
  setGenomicAnalysisTable: (table: GenomicAnalysisTable) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function GenomicAnalysisAdmin({
  genomicAnalysisTable,
  setGenomicAnalysisTable,
  onSave,
  onReset,
}: Props) {
  const updateDescription = (value: string) => {
    setGenomicAnalysisTable({
      ...genomicAnalysisTable,
      description: value,
    });
  };

  const addCategory = () => {
    const newCategory: GenomicCategoryGroup = {
      category: "New Category",
      subcategories: [],
    };
    setGenomicAnalysisTable({
      ...genomicAnalysisTable,
      categories: [...genomicAnalysisTable.categories, newCategory],
    });
  };

  const removeCategory = (catIndex: number) => {
    setGenomicAnalysisTable({
      ...genomicAnalysisTable,
      categories: genomicAnalysisTable.categories.filter(
        (_, i) => i !== catIndex
      ),
    });
  };

  const updateCategoryName = (catIndex: number, value: string) => {
    const updated = [...genomicAnalysisTable.categories];
    updated[catIndex] = { ...updated[catIndex], category: value };
    setGenomicAnalysisTable({ ...genomicAnalysisTable, categories: updated });
  };

  const addSubcategory = (catIndex: number) => {
    const updated = [...genomicAnalysisTable.categories];
    const newSub = { area: "", trait: "", genes: [] };
    updated[catIndex] = {
      ...updated[catIndex],
      subcategories: [...updated[catIndex].subcategories, newSub],
    };
    setGenomicAnalysisTable({ ...genomicAnalysisTable, categories: updated });
  };

  const removeSubcategory = (catIndex: number, subIndex: number) => {
    const updated = [...genomicAnalysisTable.categories];
    updated[catIndex] = {
      ...updated[catIndex],
      subcategories: updated[catIndex].subcategories.filter(
        (_, i) => i !== subIndex
      ),
    };
    setGenomicAnalysisTable({ ...genomicAnalysisTable, categories: updated });
  };

  const updateSubcategory = (
    catIndex: number,
    subIndex: number,
    field: "area" | "trait" | "genes",
    value: string | string[]
  ) => {
    const updated = [...genomicAnalysisTable.categories];
    const subs = [...updated[catIndex].subcategories];
    subs[subIndex] = { ...subs[subIndex], [field]: value };
    updated[catIndex] = { ...updated[catIndex], subcategories: subs };
    setGenomicAnalysisTable({ ...genomicAnalysisTable, categories: updated });
  };

  return (
    <Card className="shadow-lg border-0 bg-white w-full">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 sm:p-5">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
          Genomic Analysis Table
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-4">
        {/* Action buttons */}
        <div className="flex justify-end gap-3 items-center">
          <Button
            onClick={addCategory}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <div className="space-x-2">
            <Button onClick={onSave}>Save Changes</Button>
          </div>
        </div>
        {/* Top description */}
        <Input
          value={genomicAnalysisTable.description}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="Enter overall description for genomic analysis..."
        />

        {/* Categories */}
        {genomicAnalysisTable.categories.map((cat, catIndex) => (
          <div
            key={catIndex}
            className="border border-gray-200 rounded-lg p-4 space-y-4"
          >
            {/* Category title */}
            <div className="flex items-center gap-2">
              <Input
                value={cat.category}
                onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                className="font-bold"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeCategory(catIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Add subcategory */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSubcategory(catIndex)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>

            {/* Subcategory table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Area</th>
                    <th className="border p-2">Trait</th>
                    <th className="border p-2">Genes (comma separated)</th>

                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.subcategories.map((row, subIndex) => (
                    <tr key={subIndex}>
                      <td className="border p-2">
                        <Input
                          value={row.area}
                          onChange={(e) =>
                            updateSubcategory(
                              catIndex,
                              subIndex,
                              "area",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          value={row.trait}
                          onChange={(e) =>
                            updateSubcategory(
                              catIndex,
                              subIndex,
                              "trait",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          value={row.genes.join(", ")}
                          onChange={(e) =>
                            updateSubcategory(
                              catIndex,
                              subIndex,
                              "genes",
                              e.target.value.split(",").map((g) => g.trim())
                            )
                          }
                        />
                      </td>

                      <td className="border p-2 text-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeSubcategory(catIndex, subIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {cat.subcategories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-gray-500">
                        No rows added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
