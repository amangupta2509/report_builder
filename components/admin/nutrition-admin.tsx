"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Plus, Trash2, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface NutrientData {
  score: number;
  healthImpact: string;
  intakeLevel: string;
  source: string;
}

interface FullNutritionData {
  quote?: string;
  description?: string;
  data: Record<string, Record<string, NutrientData>>;
}

interface NutritionAdminProps {
  nutritionData?: FullNutritionData;
  updateNutritionData?: (
    section: string,
    field: string,
    data: Partial<NutrientData> | Record<string, NutrientData> | string
  ) => void;
  onSave?: () => void;
  onUpdateHeader?: (quote: string, description: string) => void;
}

export default function NutritionAdmin({
  nutritionData: propNutritionData,
  updateNutritionData: propUpdateNutritionData,
  onSave: propOnSave,
}: NutritionAdminProps) {
  // Default data structure
  const defaultNutrientData: NutrientData = {
    score: 5,
    healthImpact: "",
    intakeLevel: "NORMAL INTAKE",
    source: "DIET",
  };

  // State management
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEditMode, setIsEditMode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<null | string>(null);
  const { toast } = useToast();
  const [quote, setQuote] = useState(propNutritionData?.quote || "");
  const [description, setDescription] = useState(
    propNutritionData?.description || ""
  );
  const [localNutritionData, setLocalNutritionData] =
    useState<FullNutritionData>({
      data: propNutritionData?.data || {},
    });

  const [activeSection, setActiveSection] = useState<string>("");

  // New nutrient form state
  const [newNutrient, setNewNutrient] = useState({
    name: "",
    score: 5,
    healthImpact: "",
    intakeLevel: "NORMAL INTAKE",
    source: "DIET",
  });

  // ✅ FIXED: Proper delete field function
  const handleDeleteField = async (sectionName: string, fieldName: string) => {
    try {
      // 1. Update local state first
      const updatedSection = { ...localNutritionData.data[sectionName] };
      delete updatedSection[fieldName];

      setLocalNutritionData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [sectionName]: updatedSection,
        },
      }));

      // 2. Update parent state
      if (propUpdateNutritionData) {
        propUpdateNutritionData(sectionName, "", updatedSection);
      }

      toast({
        title: "Field Deleted",
        description: `"${fieldName}" removed from ${sectionName}.`,
        variant: "destructive",
        duration: 3000,
      });
    } catch (error) {
      console.error("Delete field error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  };

  // ✅ FIXED: Proper delete section function
  const handleDeleteSection = (sectionName: string) => {
    try {
      // 1. Update local state
      const updatedData = { ...localNutritionData.data };
      delete updatedData[sectionName];

      setLocalNutritionData((prev) => ({
        ...prev,
        data: updatedData,
      }));

      // 2. Update parent state with deletion signal
      if (propUpdateNutritionData) {
        propUpdateNutritionData(sectionName, "", "__delete__");
      }

      // 3. Reset active section if needed
      if (activeSection === sectionName) {
        const remaining = Object.keys(updatedData);
        setActiveSection(remaining[0] || "");
      }

      // 4. Call parent save
      if (propOnSave) {
        propOnSave();
      }

      toast({
        title: "Deleted",
        description: `Deleted section "${sectionName}" successfully.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Delete section error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  // ✅ FIXED: Proper rename function
  const renameNutrient = (
    section: string,
    oldField: string,
    newName: string
  ) => {
    try {
      if (!localNutritionData.data || !newName.trim()) {
        return false;
      }

      const newField = newName.toLowerCase().replace(/\s+/g, "");

      // Check if name unchanged
      if (newField === oldField) {
        return true;
      }

      // Check if new name already exists
      if (localNutritionData.data[section]?.[newField]) {
        return false;
      }

      // Create updated section with renamed field
      const updatedSection = { ...localNutritionData.data[section] };
      updatedSection[newField] = updatedSection[oldField];
      delete updatedSection[oldField];

      // Update local state
      setLocalNutritionData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [section]: updatedSection,
        },
      }));

      // Update parent state
      if (propUpdateNutritionData) {
        propUpdateNutritionData(section, "", updatedSection);
      }

      toast({
        title: "Renamed",
        description: `Nutrient renamed from "${oldField}" to "${newField}"`,
        variant: "success",
      });

      return true;
    } catch (error) {
      console.error("Rename error:", error);
      toast({
        title: "Rename Failed",
        description: "Failed to rename nutrient",
        variant: "destructive",
      });
      return false;
    }
  };

  // ✅ FIXED: Proper save function
  const onSave = async () => {
    try {
      // Sync quote & description into parent
      if (propUpdateNutritionData) {
        propUpdateNutritionData("quote", "", quote);
        propUpdateNutritionData("description", "", description);
      }

      if (propOnSave) {
        propOnSave();
      }

      toast({
        title: "Updated",
        description: "Nutrition data has been saved successfully.",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Save error:", err);
      toast({
        title: "Save Failed",
        description: err.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  // ✅ FIXED: Proper add category function
  const addNewCategory = () => {
    const key = newSectionName.trim().toLowerCase().replace(/\s+/g, "");

    if (!key) {
      toast({
        title: "Add Failed",
        description: "Category name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (localNutritionData.data[key]) {
      toast({
        title: "Add Failed",
        description: "Category already exists.",
        variant: "destructive",
      });
      return;
    }

    setLocalNutritionData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: {},
      },
    }));

    if (propUpdateNutritionData) {
      propUpdateNutritionData(key, "", {});
    }

    setActiveSection(key);
    setNewSectionName(""); // reset input
    setIsAddSectionDialogOpen(false);

    toast({
      title: "Category Added",
      description: `"${key}" was created successfully.`,
      variant: "success",
    });
  };

  // ✅ FIXED: Proper add nutrient function
  const handleAddNutrient = () => {
    if (!activeSection) {
      toast({
        title: "Add Failed",
        description: "Please select a section first.",
        variant: "destructive",
      });
      return;
    }

    if (addNutrient(activeSection, newNutrient)) {
      setNewNutrient({
        name: "",
        score: 5,
        healthImpact: "",
        intakeLevel: "NORMAL INTAKE",
        source: "DIET",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Added",
        description: "New nutrient added successfully",
        variant: "success",
        duration: 3000,
      });
    } else {
      toast({
        title: "Add Failed",
        description: "Invalid name or nutrient already exists!",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // ✅ FIXED: Proper rename handler
  const handleRename = (section: string, field: string) => {
    if (renameNutrient(section, field, editingName)) {
      setIsEditMode(null);
      setEditingName("");
    } else {
      toast({
        title: "Rename Failed",
        description: "Invalid name or nutrient already exists!",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // ✅ FIXED: Proper add nutrient function
  const addNutrient = (section: string, nutrientData: typeof newNutrient) => {
    if (!localNutritionData.data || !nutrientData.name.trim()) {
      return false;
    }

    const fieldName = nutrientData.name.toLowerCase().replace(/\s+/g, "");

    if (localNutritionData.data[section]?.[fieldName]) {
      return false;
    }

    const newEntry: NutrientData = {
      score: nutrientData.score,
      healthImpact: nutrientData.healthImpact,
      intakeLevel: nutrientData.intakeLevel,
      source: nutrientData.source,
    };

    // Update local state
    setLocalNutritionData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: {
          ...prev.data[section],
          [fieldName]: newEntry,
        },
      },
    }));

    // Update parent state
    if (propUpdateNutritionData) {
      propUpdateNutritionData(section, fieldName, newEntry);
    }

    return true;
  };

  // ✅ FIXED: Proper local update function
  const updateLocalNutritionData = (
    section: string,
    field: string,
    data: Partial<NutrientData> | Record<string, NutrientData>
  ) => {
    setLocalNutritionData((prev) => {
      const updated = { ...prev.data };

      if (!updated[section]) {
        updated[section] = {};
      }

      if (field && typeof data === "object" && !Array.isArray(data)) {
        // Update specific field
        updated[section][field] = {
          ...(updated[section][field] || {}),
          ...(data as Partial<NutrientData>),
        };
      } else if (!field && typeof data === "object" && !Array.isArray(data)) {
        // Update entire section
        updated[section] = {
          ...(updated[section] || {}),
          ...(data as Record<string, NutrientData>),
        };
      }

      return {
        ...prev,
        data: updated,
      };
    });

    // Also update parent state
    if (propUpdateNutritionData) {
      propUpdateNutritionData(section, field, data);
    }
  };

  const resetAddForm = () => {
    setNewNutrient({
      name: "",
      score: 5,
      healthImpact: "",
      intakeLevel: "NORMAL INTAKE",
      source: "DIET",
    });
  };

  // ✅ FIXED: Proper useEffect
  useEffect(() => {
    if (propNutritionData) {
      setQuote(propNutritionData.quote || "");
      setDescription(propNutritionData.description || "");
      setLocalNutritionData({
        data: propNutritionData.data || {},
      });

      const keys = Object.keys(propNutritionData.data || {});
      if (keys.length > 0 && !activeSection) {
        setActiveSection(keys[0]);
      }
    }
  }, [propNutritionData]); // ✅ Watch for prop changes

  if (!localNutritionData || typeof localNutritionData.data !== "object") {
    return <div>Loading nutrition data...</div>;
  }

  const renderNutrientField = (
    section: string,
    field: string,
    data: NutrientData,
    title: string
  ) => (
    <Card key={field} className="border-2 border-green-100 bg-green-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl md:text-2xl text-green-800 flex items-center justify-between">
          {isEditMode === field ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="text-lg font-semibold border-2 focus:border-green-500"
                onKeyPress={(e) =>
                  e.key === "Enter" && handleRename(section, field)
                }
              />
              <Button size="sm" onClick={() => handleRename(section, field)}>
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditMode(null);
                  setEditingName("");
                }}
              >
                ✗
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span>{title}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditMode(field);
                  setEditingName(title);
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${
                data.score >= 7
                  ? "border-red-500 text-red-700"
                  : data.score >= 4
                  ? "border-yellow-500 text-yellow-700"
                  : "border-green-500 text-green-700"
              }`}
            >
              Score: {data.score}/10
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteField(section, field)}
              className="text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Score (1-10)</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={data.score}
              onChange={(e) => {
                const score = Math.max(
                  1,
                  Math.min(10, Number.parseInt(e.target.value) || 1)
                );
                updateLocalNutritionData(section, field, { score });
              }}
              className="border-2 focus:border-green-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Health Impact</Label>
            <Input
              value={data.healthImpact}
              onChange={(e) =>
                updateLocalNutritionData(section, field, {
                  healthImpact: e.target.value,
                })
              }
              placeholder="e.g., Skin & Vision"
              className="border-2 focus:border-green-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Intake Level</Label>
          <Select
            value={data.intakeLevel}
            onValueChange={(value) =>
              updateLocalNutritionData(section, field, { intakeLevel: value })
            }
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENHANCED INTAKE">ENHANCED INTAKE</SelectItem>
              <SelectItem value="NORMAL INTAKE">NORMAL INTAKE</SelectItem>
              <SelectItem value="RESTRICTED INTAKE">
                RESTRICTED INTAKE
              </SelectItem>
              <SelectItem value="ENHANCED INTAKE (METHYLCOBALAMIN)">
                ENHANCED INTAKE (METHYLCOBALAMIN)
              </SelectItem>
              <SelectItem value="ENHANCED INTAKE (L METHYLFOLATE)">
                ENHANCED INTAKE (L METHYLFOLATE)
              </SelectItem>
              <SelectItem value="ENHANCED INTAKE & SUN EXPOSURE">
                ENHANCED INTAKE & SUN EXPOSURE
              </SelectItem>
              <SelectItem value="ENHANCED INTAKE (VEG SOURCES)">
                ENHANCED INTAKE (VEG SOURCES)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Source</Label>
          <Select
            value={data.source}
            onValueChange={(value) =>
              updateLocalNutritionData(section, field, { source: value })
            }
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIET">DIET</SelectItem>
              <SelectItem value="SUPPLEMENTS">SUPPLEMENTS</SelectItem>
              <SelectItem value="DIET & SUPPLEMENTS">
                DIET & SUPPLEMENTS
              </SelectItem>
              <SelectItem value="DIET & SUN EXPOSURE">
                DIET & SUN EXPOSURE
              </SelectItem>
              <SelectItem value="ENHANCED INTAKE (VEG/FISH OIL) & DIET">
                ENHANCED INTAKE (VEG/FISH OIL) & DIET
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "vitamins":
        return "Vitamins";
      default:
        return section;
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 sm:p-6 text-white uppercase">
        <CardTitle className="text-base sm:text-xl md:text-2xl font-bold flex items-center justify-center sm:justify-start text-center sm:text-left">
          Nutrition Analysis
        </CardTitle>
      </CardHeader>

      <div className="text-end my-2 sm:my-4 px-4 sm:px-6 md:px-8">
        <Button onClick={onSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
      <CardContent className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8">
        {/* Quote and Description Section */}
        <div className="space-y-3 sm:space-y-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Quote</Label>
            <Input
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter a motivating quote..."
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary for this page..."
              className="mt-1"
            />
          </div>
        </div>

        {/* Section Navigation and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 p-3 sm:p-4 rounded-lg">
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {Object.entries(localNutritionData.data).map(
              ([section, fields]) => (
                <div key={section} className="relative">
                  <Button
                    variant={activeSection === section ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection(section)}
                    className="flex items-center gap-2 pr-6 text-xs sm:text-sm"
                  >
                    <span className="capitalize">
                      {section.replace(/([A-Z])/g, " $1")}
                    </span>
                  </Button>
                  <button
                    onClick={() => setConfirmDelete(section)}
                    className="absolute -right-1 -top-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Delete Category"
                  >
                    ✕
                  </button>
                </div>
              )
            )}

            <Dialog
              open={!!confirmDelete}
              onOpenChange={(open) => !open && setConfirmDelete(null)}
            >
              <DialogContent className="mx-4 sm:mx-0 max-w-sm sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the category{" "}
                    <strong>{confirmDelete}</strong>?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirmDelete) {
                        handleDeleteSection(confirmDelete);
                        setConfirmDelete(null);
                      }
                    }}
                    className="w-full sm:w-auto"
                  >
                    Yes, Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Add New Nutrient Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 flex-1 sm:flex-none text-xs sm:text-sm"
                  disabled={!activeSection}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 sm:mx-0 max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    Add New{" "}
                    {getSectionTitle(activeSection)
                      .replace(/[^\w\s]/gi, "")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                    Item
                  </DialogTitle>

                  <DialogDescription className="text-sm">
                    Enter the details for the new nutrient in the{" "}
                    {activeSection} section.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 sm:space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nutrientName">Nutrient Name *</Label>
                    <Input
                      id="nutrientName"
                      value={newNutrient.name}
                      onChange={(e) =>
                        setNewNutrient({ ...newNutrient, name: e.target.value })
                      }
                      placeholder="e.g., Vitamin E, Selenium, etc."
                      className="border-2 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nutrientScore">Score (1-10)</Label>
                      <Input
                        id="nutrientScore"
                        type="number"
                        min="1"
                        max="10"
                        value={newNutrient.score}
                        onChange={(e) =>
                          setNewNutrient({
                            ...newNutrient,
                            score: Math.max(
                              1,
                              Math.min(10, Number.parseInt(e.target.value) || 1)
                            ),
                          })
                        }
                        className="border-2 focus:border-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nutrientImpact">Health Impact</Label>
                      <Input
                        id="nutrientImpact"
                        value={newNutrient.healthImpact}
                        onChange={(e) =>
                          setNewNutrient({
                            ...newNutrient,
                            healthImpact: e.target.value,
                          })
                        }
                        placeholder="e.g., Skin & Vision"
                        className="border-2 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nutrientIntake">Intake Level</Label>
                    <Select
                      value={newNutrient.intakeLevel}
                      onValueChange={(value) =>
                        setNewNutrient({ ...newNutrient, intakeLevel: value })
                      }
                    >
                      <SelectTrigger className="border-2 focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENHANCED INTAKE">
                          ENHANCED INTAKE
                        </SelectItem>
                        <SelectItem value="NORMAL INTAKE">
                          NORMAL INTAKE
                        </SelectItem>
                        <SelectItem value="RESTRICTED INTAKE">
                          RESTRICTED INTAKE
                        </SelectItem>
                        <SelectItem value="ENHANCED INTAKE (METHYLCOBALAMIN)">
                          ENHANCED INTAKE (METHYLCOBALAMIN)
                        </SelectItem>
                        <SelectItem value="ENHANCED INTAKE (L METHYLFOLATE)">
                          ENHANCED INTAKE (L METHYLFOLATE)
                        </SelectItem>
                        <SelectItem value="ENHANCED INTAKE & SUN EXPOSURE">
                          ENHANCED INTAKE & SUN EXPOSURE
                        </SelectItem>
                        <SelectItem value="ENHANCED INTAKE (VEG SOURCES)">
                          ENHANCED INTAKE (VEG SOURCES)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nutrientSource">Source</Label>
                    <Select
                      value={newNutrient.source}
                      onValueChange={(value) =>
                        setNewNutrient({ ...newNutrient, source: value })
                      }
                    >
                      <SelectTrigger className="border-2 focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DIET">DIET</SelectItem>
                        <SelectItem value="SUPPLEMENTS">SUPPLEMENTS</SelectItem>
                        <SelectItem value="DIET & SUPPLEMENTS">
                          DIET & SUPPLEMENTS
                        </SelectItem>
                        <SelectItem value="DIET & SUN EXPOSURE">
                          DIET & SUN EXPOSURE
                        </SelectItem>
                        <SelectItem value="ENHANCED INTAKE (VEG/FISH OIL) & DIET">
                          ENHANCED INTAKE (VEG/FISH OIL) & DIET
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetAddForm();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNutrient}
                    disabled={!newNutrient.name.trim()}
                    className="w-full sm:w-auto"
                  >
                    Add Nutrient
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isAddSectionDialogOpen}
              onOpenChange={setIsAddSectionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 sm:mx-0 max-w-sm sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category (e.g., "aminoAcids", "fiber", etc.)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Label htmlFor="sectionName">Category Name *</Label>
                  <Input
                    id="sectionName"
                    placeholder="e.g., aminoAcids"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                  />
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddSectionDialogOpen(false);
                      setNewSectionName("");
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addNewCategory}
                    disabled={!newSectionName.trim()}
                    className="w-full sm:w-auto"
                  >
                    Add Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Section Content */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 border-b-2 border-green-200 pb-2">
              {getSectionTitle(activeSection)
                .replace(/[^\w\s]/gi, "")
                .replace(/^(\w)/, (c) => c.toUpperCase())}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(localNutritionData.data[activeSection] || {}).map(
              ([key, item]) =>
                renderNutrientField(
                  activeSection,
                  key,
                  item as NutrientData,
                  key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                )
            )}
          </div>
          {Object.keys(localNutritionData.data[activeSection] || {}).length ===
            0 && (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mx-2 sm:mx-0">
              <div className="text-gray-500 text-base sm:text-lg mb-2">
                No items in this section
              </div>
              <div className="text-gray-400 text-sm">
                Click "Add New" to add your first nutrient
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
