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
import { Save, RotateCcw, Plus, Trash2, Dna } from "lucide-react";
import type {
  FamilyGeneticImpact,
  FamilyGeneticImpactSection,
} from "@/types/report-types";

interface FamilyGeneticImpactAdminProps {
  familyGeneticImpactSection: FamilyGeneticImpactSection;
  setFamilyGeneticImpactSection: (section: FamilyGeneticImpactSection) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function FamilyGeneticImpactAdmin({
  familyGeneticImpactSection,
  setFamilyGeneticImpactSection,
  onSave,
  onReset,
}: FamilyGeneticImpactAdminProps) {
  const addFamilyGeneticImpact = () => {
    setFamilyGeneticImpactSection({
      ...familyGeneticImpactSection,
      impacts: [
        ...familyGeneticImpactSection.impacts,
        {
          gene: "",
          normalAlleles: "",
          yourResult: "",
          healthImpact: "",
        },
      ],
    });
  };

  const updateFamilyGeneticImpact = (
    index: number,
    field: keyof FamilyGeneticImpact,
    value: string
  ) => {
    const updatedImpacts = [...familyGeneticImpactSection.impacts];
    updatedImpacts[index] = { ...updatedImpacts[index], [field]: value };
    setFamilyGeneticImpactSection({
      ...familyGeneticImpactSection,
      impacts: updatedImpacts,
    });
  };

  const removeFamilyGeneticImpact = (index: number) => {
    setFamilyGeneticImpactSection({
      ...familyGeneticImpactSection,
      impacts: familyGeneticImpactSection.impacts.filter((_, i) => i !== index),
    });
  };

  const setDescription = (value: string) => {
    setFamilyGeneticImpactSection({
      ...familyGeneticImpactSection,
      description: value,
    });
  };

  return (
    <div className="w-full max-w-8xl mx-auto ">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-blue-50/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-white rounded-lg p-4 sm:p-5">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
            Family Genetic Impact Management
          </CardTitle>
        </CardHeader>

        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mt-3 gap-4 mb-4 p-4 ">
          <Button onClick={addFamilyGeneticImpact}>
            <Plus className="h-4 w-4 mr-2" />
            Add Genetic Impact
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <CardContent className="mt-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Introductory Description
            </Label>
            <Textarea
              rows={9}
              value={familyGeneticImpactSection.description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the overall family genetic impact, key findings, and any recommendations..."
              className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm bg-white hover:border-gray-300 transition-colors resize-none"
            />
          </div>
          {/* Action Buttons */}

          {/* Family Genetic Impact List */}
          <div className="space-y-6">
            {familyGeneticImpactSection.impacts.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <Dna className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  No Genetic Impacts Added
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start building your family genetic profile by adding the first
                  genetic impact analysis.
                </p>
                <Button
                  onClick={addFamilyGeneticImpact}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Impact
                </Button>
              </div>
            )}

            {familyGeneticImpactSection.impacts?.map((impact, index) => (
              <Card
                key={index}
                className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        Genetic Impact Analysis
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Configure genetic variation #{index + 1}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeFamilyGeneticImpact(index)}
                      size="sm"
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Gene Identifier
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Required
                        </span>
                      </Label>
                      <Input
                        value={impact.gene}
                        onChange={(e) =>
                          updateFamilyGeneticImpact(
                            index,
                            "gene",
                            e.target.value
                          )
                        }
                        placeholder="e.g., MnSOD, COMT, MTHFR"
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm bg-white hover:border-gray-300 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Normal Alleles
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Reference
                        </span>
                      </Label>
                      <Input
                        value={impact.normalAlleles}
                        onChange={(e) =>
                          updateFamilyGeneticImpact(
                            index,
                            "normalAlleles",
                            e.target.value
                          )
                        }
                        placeholder="e.g., AA, GG, CC"
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm bg-white hover:border-gray-300 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Your Result
                        <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded">
                          Current
                        </span>
                      </Label>
                      <Input
                        value={impact.yourResult}
                        onChange={(e) =>
                          updateFamilyGeneticImpact(
                            index,
                            "yourResult",
                            e.target.value
                          )
                        }
                        placeholder="e.g., AG, CT, TT"
                        className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono font-bold text-sm bg-blue-50 hover:border-blue-300 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      Health Impact Analysis
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Detailed
                      </span>
                    </Label>
                    <Textarea
                      value={impact.healthImpact}
                      onChange={(e) =>
                        updateFamilyGeneticImpact(
                          index,
                          "healthImpact",
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Describe the potential health implications, recommendations, and any relevant family considerations..."
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm bg-white hover:border-gray-300 transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide detailed analysis of how this genetic variation
                      may impact health outcomes
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
