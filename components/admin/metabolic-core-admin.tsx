"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Minus,
} from "lucide-react";
import { useState } from "react";
import type { MetabolicCore, MetabolicGeneEntry } from "@/types/report-types";

interface MetabolicCoreAdminProps {
  metabolicCore: MetabolicCore;
  setMetabolicCore: React.Dispatch<React.SetStateAction<MetabolicCore>>;
  updateMetabolicCore: (field: string, data: any) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function MetabolicCoreAdmin({
  metabolicCore,
  setMetabolicCore,
  updateMetabolicCore,
  onSave,
  onReset,
}: MetabolicCoreAdminProps) {
  const metabolicAreas = Object.keys(metabolicCore).filter(
    (key) => key !== "quote" && key !== "description"
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    area: string;
    geneIndex?: number;
  } | null>(null);

  const handleConfirmAddArea = () => {
    const trimmedName = newAreaName.trim();
    if (!trimmedName || metabolicCore[trimmedName]) {
      alert("Invalid or duplicate name.");
      return;
    }

    const { quote, description, ...restAreas } = metabolicCore;

    // New object with quote & description first, new area next, rest after
    const reorderedCore: MetabolicCore = {
      quote: quote || "",
      description: description || "",
      [trimmedName]: { impact: "", advice: "", genes: [] },
      ...restAreas,
    };

    setMetabolicCore(reorderedCore);
    setNewAreaName("");
    setShowAddModal(false);
  };

  const deleteArea = (area: string) => {
    setDeleteTarget({ area });
    setShowDeleteModal(true);
  };

  const addGene = (area: string) => {
    const currentGenes = metabolicCore[area]?.genes ?? [];
    updateMetabolicCore(area, {
      genes: [...currentGenes, { name: "", genotype: "", impact: "" }],
    });
  };

  const removeGene = (area: string, index: number) => {
    const updatedGenes = [...metabolicCore[area].genes];
    updatedGenes.splice(index, 1);
    updateMetabolicCore(area, { genes: updatedGenes });
  };

  const updateGene = (
    area: string,
    index: number,
    updatedGene: MetabolicGeneEntry
  ) => {
    const genes = [...metabolicCore[area].genes];
    genes[index] = updatedGene;
    updateMetabolicCore(area, { genes });
  };

  const updateAreaAdvice = (area: string, advice: string) => {
    updateMetabolicCore(area, { advice });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 ">
      <div className="max-w-8xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-lg p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
              Metabolic Core Analysis
            </CardTitle>
          </CardHeader>

          <div className="text-right p-3 sm:p-4">
            <Button onClick={onSave} size="sm" className=" sm:w-auto">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>

          <CardContent className="p-3 sm:p-4 lg:p-6 space-y-6">
            {/* General Information Section */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
                  General Information
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Quote
                    </Label>
                    <Input
                      value={metabolicCore.quote || ""}
                      onChange={(e) =>
                        updateMetabolicCore("quote", e.target.value)
                      }
                      placeholder="Enter a brief summary quote about the metabolic analysis..."
                      className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Overall Description
                    </Label>
                    <Textarea
                      value={metabolicCore.description || ""}
                      onChange={(e) =>
                        updateMetabolicCore("description", e.target.value)
                      }
                      placeholder="Provide an overall description of the metabolic analysis findings..."
                      className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Metabolic Areas Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                  Metabolic Areas ({metabolicAreas.length})
                </h3>
                <Button
                  onClick={() => setShowAddModal(true)}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New Area
                </Button>
              </div>

              <div className="grid gap-4">
                {metabolicAreas.map((area) => {
                  const section = metabolicCore[area];
                  return (
                    <Card
                      key={area}
                      className="border border-slate-200 bg-slate-50/50 hover:shadow-md transition-shadow duration-200"
                    >
                      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <CardTitle className="text-base sm:text-lg lg:text-xl text-slate-800 capitalize">
                            {area
                              .replace(/([a-z])([A-Z])/g, "$1 $2")
                              .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                              .replace(/&/g, " & ")
                              .replace(/\s+/g, " ")
                              .trim()}
                          </CardTitle>
                          <Button
                            onClick={() => {
                              setDeleteTarget({ area });
                              setShowDeleteModal(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
                          >
                            <Trash2 className="h-4 w-4 mr-2 sm:mr-0" />
                            <span className="sm:hidden">Delete Area</span>
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="p-3 sm:p-4 pt-0 space-y-4">
                        {/* Area Advice */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">
                            Area Advice
                          </Label>
                          <Textarea
                            value={section.advice || ""}
                            onChange={(e) =>
                              updateAreaAdvice(area, e.target.value)
                            }
                            rows={5}
                            placeholder={`Enter advice for ${area} area...`}
                            className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[60px] sm:min-h-[80px] text-sm"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h4 className="text-sm font-medium text-slate-700">
                            Genes ({section.genes.length})
                          </h4>
                          <Button
                            onClick={() => addGene(area)}
                            size="sm"
                            variant="outline"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 w-full sm:w-auto"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Gene
                          </Button>
                        </div>

                        {section.genes.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-sm">
                            No genes added yet. Click "Add Gene" to get started.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Mobile Layout - Stacked Cards */}
                            <div className="block sm:hidden space-y-3">
                              {section.genes.map(
                                (gene: MetabolicGeneEntry, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded-lg border border-slate-200 space-y-3"
                                  >
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium text-slate-600">
                                        GENE (ALLELES)
                                      </Label>
                                      <Input
                                        placeholder="e.g., MTHFR (A>C)"
                                        value={gene.name}
                                        onChange={(e) =>
                                          updateGene(area, index, {
                                            ...gene,
                                            name: e.target.value,
                                          })
                                        }
                                        className="text-sm"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">
                                          YOUR GENOTYPE
                                        </Label>
                                        <Input
                                          placeholder="TT"
                                          value={gene.genotype}
                                          onChange={(e) =>
                                            updateGene(area, index, {
                                              ...gene,
                                              genotype: e.target.value,
                                            })
                                          }
                                          className="text-center text-sm font-mono"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">
                                          GENETIC IMPACT
                                        </Label>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-6 h-6 rounded-full flex-shrink-0 ${
                                              gene.impact
                                                ?.toLowerCase()
                                                .includes("high") ||
                                              gene.impact
                                                ?.toLowerCase()
                                                .includes("increased")
                                                ? "bg-red-500"
                                                : gene.impact
                                                    ?.toLowerCase()
                                                    .includes("normal") ||
                                                  gene.impact
                                                    ?.toLowerCase()
                                                    .includes("average")
                                                ? "bg-green-500"
                                                : gene.impact
                                                    ?.toLowerCase()
                                                    .includes("moderate")
                                                ? "bg-yellow-500"
                                                : "bg-slate-300"
                                            }`}
                                          ></div>
                                          <Select
                                            value={gene.impact}
                                            onValueChange={(val) =>
                                              updateGene(area, index, {
                                                ...gene,
                                                impact: val,
                                              })
                                            }
                                          >
                                            <SelectTrigger className="flex-1 text-sm">
                                              <SelectValue placeholder="Select Impact" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="High">
                                                High
                                              </SelectItem>
                                              <SelectItem value="Moderate">
                                                Moderate
                                              </SelectItem>
                                              <SelectItem value="Normal">
                                                Normal
                                              </SelectItem>
                                              <SelectItem value="Low">
                                                Low
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>

                                    <Button
                                      onClick={() => {
                                        setDeleteTarget({
                                          area,
                                          geneIndex: index,
                                        });
                                        setShowDeleteModal(true);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Gene
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Desktop Layout - Table */}
                            <div className="hidden sm:block overflow-x-auto">
                              <div className="min-w-full bg-white rounded-lg border border-slate-200">
                                {/* Table Header */}
                                <div className="bg-blue-500 text-white grid grid-cols-8 gap-4 p-4 rounded-t-lg text-sm font-medium">
                                  <div className="col-span-3 text-center">
                                    GENE (ALLELES)
                                  </div>
                                  <div className="col-span-2 text-center">
                                    YOUR GENOTYPE
                                  </div>
                                  <div className="col-span-2 text-center">
                                    GENETIC IMPACT
                                  </div>
                                  <div className="col-span-1 text-center">
                                    ACTION
                                  </div>
                                </div>

                                {/* Table Rows */}
                                {section.genes.map(
                                  (gene: MetabolicGeneEntry, index: number) => (
                                    <div
                                      key={index}
                                      className="grid grid-cols-8 gap-4 p-4 border-b border-slate-200 items-center hover:bg-slate-50"
                                    >
                                      <div className="col-span-3">
                                        <Input
                                          placeholder="e.g., MTHFR (A>C)"
                                          value={gene.name}
                                          onChange={(e) =>
                                            updateGene(area, index, {
                                              ...gene,
                                              name: e.target.value,
                                            })
                                          }
                                          className="border-slate-200 focus:border-indigo-500 text-center text-sm"
                                        />
                                      </div>
                                      <div className="col-span-2">
                                        <Input
                                          placeholder="TT"
                                          value={gene.genotype}
                                          onChange={(e) =>
                                            updateGene(area, index, {
                                              ...gene,
                                              genotype: e.target.value,
                                            })
                                          }
                                          className="border-slate-200 focus:border-indigo-500 text-center text-sm font-mono"
                                        />
                                      </div>
                                      <div className="col-span-2 flex justify-center">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-7 h-7 rounded-full ${
                                              gene.impact
                                                ?.toLowerCase()
                                                .includes("high") ||
                                              gene.impact
                                                ?.toLowerCase()
                                                .includes("increased")
                                                ? "bg-red-500"
                                                : gene.impact
                                                    ?.toLowerCase()
                                                    .includes("normal") ||
                                                  gene.impact
                                                    ?.toLowerCase()
                                                    .includes("average")
                                                ? "bg-green-500"
                                                : gene.impact
                                                    ?.toLowerCase()
                                                    .includes("moderate")
                                                ? "bg-yellow-500"
                                                : "bg-slate-300"
                                            }`}
                                          ></div>
                                          <Select
                                            value={gene.impact}
                                            onValueChange={(val) =>
                                              updateGene(area, index, {
                                                ...gene,
                                                impact: val,
                                              })
                                            }
                                          >
                                            <SelectTrigger className="w-[160px] border border-slate-200 bg-white">
                                              <SelectValue placeholder="Select Impact" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="High">
                                                High
                                              </SelectItem>
                                              <SelectItem value="Moderate">
                                                Moderate
                                              </SelectItem>
                                              <SelectItem value="Normal">
                                                Normal
                                              </SelectItem>
                                              <SelectItem value="Low">
                                                Low
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>

                                      <div className="col-span-1 flex justify-center">
                                        <Button
                                          onClick={() => {
                                            setDeleteTarget({
                                              area,
                                              geneIndex: index,
                                            });
                                            setShowDeleteModal(true);
                                          }}
                                          variant="outline"
                                          size="sm"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {metabolicAreas.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-slate-500">
                    <div className="mb-4">
                      <Plus className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-slate-300" />
                    </div>
                    <p className="text-base sm:text-lg mb-2">
                      No metabolic areas defined
                    </p>
                    <p className="text-xs sm:text-sm">
                      Click "Add New Area" to create your first metabolic
                      analysis section.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-sm space-y-4 border border-slate-200">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Add New Metabolic Area
            </h3>
            <Input
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="e.g., Detox Pathways"
              className="border-slate-200 focus:ring-indigo-500 text-sm"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewAreaName("");
                  setShowAddModal(false);
                }}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAddArea}
                className="bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto order-1 sm:order-2"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm space-y-4 border border-slate-200">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Confirm Deletion
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Are you sure you want to delete{" "}
              {deleteTarget.geneIndex !== undefined
                ? `this gene from ${deleteTarget.area}?`
                : `the "${deleteTarget.area}" area?`}
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (deleteTarget.geneIndex !== undefined) {
                    removeGene(deleteTarget.area, deleteTarget.geneIndex);
                  } else {
                    const updated = { ...metabolicCore };
                    delete updated[deleteTarget.area];
                    setMetabolicCore(updated);
                  }
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto order-1 sm:order-2"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
