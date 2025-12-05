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
    
  );
}
