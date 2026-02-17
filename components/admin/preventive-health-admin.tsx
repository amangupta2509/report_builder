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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Stethoscope,
  TestTube,
  Pill,
  Calendar,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import type { PreventiveHealth } from "@/types/report-types";

interface PreventiveHealthAdminProps {
  preventiveHealth: PreventiveHealth;
  updatePreventiveHealth: (section: keyof PreventiveHealth, data: any) => void;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
}

export default function PreventiveHealthAdmin({
  preventiveHealth,
  updatePreventiveHealth,
  onSave,
  onReset,
  loading = false,
}: PreventiveHealthAdminProps) {
  const [showTestModal, setShowTestModal] = useState(false);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestType, setNewTestType] = useState<"halfYearly" | "yearly">(
    "halfYearly"
  );
  const [newSupplementName, setNewSupplementName] = useState("");

  // Ensure preventiveHealth has default values
  const safePreventiveHealth: PreventiveHealth = {
    description: preventiveHealth?.description || "",
    diagnosticTests: {
      halfYearly: preventiveHealth?.diagnosticTests?.halfYearly || [],
      yearly: preventiveHealth?.diagnosticTests?.yearly || [],
    },
    nutritionalSupplements: preventiveHealth?.nutritionalSupplements || [],
  };

  const addDiagnosticTest = (type: "halfYearly" | "yearly", name?: string) => {
    updatePreventiveHealth("diagnosticTests", {
      ...safePreventiveHealth.diagnosticTests,
      [type]: [...safePreventiveHealth.diagnosticTests[type], name || ""],
    });
  };

  const handleAddTest = () => {
    if (newTestName.trim()) {
      addDiagnosticTest(newTestType, newTestName.trim());
      setNewTestName("");
      setShowTestModal(false);
    }
  };

  const handleAddSupplement = () => {
    if (newSupplementName.trim()) {
      updatePreventiveHealth("nutritionalSupplements", [
        ...safePreventiveHealth.nutritionalSupplements,
        {
          id: crypto.randomUUID(),
          supplement: newSupplementName.trim(),
          needed: true,
        },
      ]);
      setNewSupplementName("");
      setShowSupplementModal(false);
    }
  };

  const updateDiagnosticTest = (
    type: "halfYearly" | "yearly",
    index: number,
    value: string
  ) => {
    const newTests = [...safePreventiveHealth.diagnosticTests[type]];
    newTests[index] = value;
    updatePreventiveHealth("diagnosticTests", {
      ...safePreventiveHealth.diagnosticTests,
      [type]: newTests,
    });
  };

  const removeDiagnosticTest = (
    type: "halfYearly" | "yearly",
    index: number
  ) => {
    updatePreventiveHealth("diagnosticTests", {
      ...safePreventiveHealth.diagnosticTests,
      [type]: safePreventiveHealth.diagnosticTests[type].filter(
        (_, i) => i !== index
      ),
    });
  };

  const updateNutritionalSupplement = (
    index: number,
    field: "supplement" | "needed",
    value: string | boolean
  ) => {
    const newSupplements = [...safePreventiveHealth.nutritionalSupplements];
    newSupplements[index] = { ...newSupplements[index], [field]: value };
    updatePreventiveHealth("nutritionalSupplements", newSupplements);
  };

  const removeNutritionalSupplement = (index: number) => {
    updatePreventiveHealth(
      "nutritionalSupplements",
      safePreventiveHealth.nutritionalSupplements.filter((_, i) => i !== index)
    );
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    action: "test" | "supplement"
  ) => {
    if (e.key === "Enter") {
      if (action === "test") handleAddTest();
      else handleAddSupplement();
    } else if (e.key === "Escape") {
      if (action === "test") {
        setShowTestModal(false);
        setNewTestName("");
      } else {
        setShowSupplementModal(false);
        setNewSupplementName("");
      }
    }
  };

  return (
    <div className="w-full max-w-8xl">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-teal-50/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white rounded-lg  sm:p-5">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
            Preventive Health Management
          </CardTitle>
        </CardHeader>

        <div className="my-4 text-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <CardContent className="mt-4">
          {/* Description Section */}
          <div className="space-y-2 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Description
              </h3>
            </div>

            <Card className="border-0 bg-white shadow-lg  hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div>
                  <Input
                    value={preventiveHealth.description || ""}
                    onChange={(e) =>
                      updatePreventiveHealth("description", e.target.value)
                    }
                    placeholder="Enter a general description for preventive health recommendations..."
                    className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-vertical"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Diagnostic Tests Section */}
          <div className="space-y-6 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Diagnostic Tests
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Half-Yearly Tests */}
              <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        Half-Yearly Tests
                      </CardTitle>
                      <p className="text-sm text-blue-600 mt-1">
                        Every 6 months
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setNewTestType("halfYearly");
                        setShowTestModal(true);
                      }}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                    >
                      Add Test
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {preventiveHealth.diagnosticTests.halfYearly.map(
                    (test, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100"
                      >
                        <Input
                          value={test}
                          onChange={(e) =>
                            updateDiagnosticTest(
                              "halfYearly",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Enter test name..."
                          className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm bg-white"
                        />
                        <Button
                          onClick={() =>
                            removeDiagnosticTest("halfYearly", index)
                          }
                          size="sm"
                          variant="destructive"
                          className="px-2 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  )}
                  {preventiveHealth.diagnosticTests.halfYearly.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-4">
                        No half-yearly tests configured
                      </p>
                      <Button
                        onClick={() => {
                          setNewTestType("halfYearly");
                          setShowTestModal(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        Add First Test
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Yearly Tests */}
              <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                        Yearly Tests
                      </CardTitle>
                      <p className="text-sm text-green-600 mt-1">
                        Annual screening
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setNewTestType("yearly");
                        setShowTestModal(true);
                      }}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white shadow-md"
                    >
                      Add Test
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {preventiveHealth.diagnosticTests.yearly.map(
                    (test, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-green-50/50 rounded-lg border border-green-100"
                      >
                        <Input
                          value={test}
                          onChange={(e) =>
                            updateDiagnosticTest(
                              "yearly",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Enter test name..."
                          className="border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm bg-white"
                        />
                        <Button
                          onClick={() => removeDiagnosticTest("yearly", index)}
                          size="sm"
                          variant="destructive"
                          className="px-2 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  )}
                  {preventiveHealth.diagnosticTests.yearly.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-4">
                        No yearly tests configured
                      </p>
                      <Button
                        onClick={() => {
                          setNewTestType("yearly");
                          setShowTestModal(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-600 hover:bg-green-50"
                      >
                        Add First Test
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Nutritional Supplements Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Nutritional Supplements
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
            </div>

            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                      Recommended Supplements
                    </CardTitle>
                  </div>
                  <Button
                    onClick={() => setShowSupplementModal(true)}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white shadow-md"
                  >
                    Add Supplement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {preventiveHealth.nutritionalSupplements.map(
                  (supplement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-lg border border-purple-100"
                    >
                      <Input
                        value={supplement.supplement}
                        onChange={(e) =>
                          updateNutritionalSupplement(
                            index,
                            "supplement",
                            e.target.value
                          )
                        }
                        placeholder="Enter supplement name..."
                        className="flex-1 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm bg-white"
                      />
                      <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-purple-200">
                        <Checkbox
                          id={`needed-${index}`}
                          checked={supplement.needed}
                          onCheckedChange={(checked: boolean) =>
                            updateNutritionalSupplement(
                              index,
                              "needed",
                              checked
                            )
                          }
                          className="border-purple-300"
                        />
                        <Label
                          htmlFor={`needed-${index}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          Required
                        </Label>
                      </div>
                      <Button
                        onClick={() => removeNutritionalSupplement(index)}
                        size="sm"
                        variant="destructive"
                        className="px-2 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                )}
                {preventiveHealth.nutritionalSupplements.length === 0 && (
                  <div className="text-center py-12">
                    <Pill className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 mb-2">
                      No supplements configured
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Add nutritional supplements based on genetic
                      recommendations
                    </p>
                    <Button
                      onClick={() => setShowSupplementModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Supplement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Add Diagnostic Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TestTube className="h-5 w-5 text-blue-600" />
                  </div>
                  Add Diagnostic Test
                </h3>
                <Button
                  onClick={() => {
                    setShowTestModal(false);
                    setNewTestName("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Test Type
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setNewTestType("halfYearly")}
                      variant={
                        newTestType === "halfYearly" ? "default" : "outline"
                      }
                      className="text-sm"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Half-Yearly
                    </Button>
                    <Button
                      onClick={() => setNewTestType("yearly")}
                      variant={newTestType === "yearly" ? "default" : "outline"}
                      className="text-sm"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Yearly
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Test Name
                  </Label>
                  <Input
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, "test")}
                    placeholder="Enter diagnostic test name..."
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => {
                    setShowTestModal(false);
                    setNewTestName("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTest}
                  disabled={!newTestName.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplement Modal */}
      {showSupplementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Pill className="h-5 w-5 text-purple-600" />
                  </div>
                  Add Supplement
                </h3>
                <Button
                  onClick={() => {
                    setShowSupplementModal(false);
                    setNewSupplementName("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Supplement Name
                  </Label>
                  <Input
                    value={newSupplementName}
                    onChange={(e) => setNewSupplementName(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, "supplement")}
                    placeholder="Enter supplement name..."
                    className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The supplement will be marked as required by default
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => {
                    setShowSupplementModal(false);
                    setNewSupplementName("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSupplement}
                  disabled={!newSupplementName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
