"use client";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Save,
  RotateCcw,
  Trash2,
  GripVertical,
  X,
  File,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  FieldInput,
  FieldTextarea,
  FieldSelect,
} from "@/components/admin/dynamic-field-helpers";
import type {
  DynamicDietFieldDefinition,
  DynamicDiet,
  PatientDietAnalysisResult,
} from "@/types/report-types";

interface DynamicDietFieldAdminProps {
  dynamicDietFieldDefinitions: DynamicDietFieldDefinition[];
  onUpdateFields: (definitions: DynamicDietFieldDefinition[]) => void;
  onSave: () => Promise<void> | void; // allow async saves
  onReset: () => void;
  categories: string[];
  onUpdateCategories: (updated: string[]) => void;
  patientDietAnalysisResults: PatientDietAnalysisResult[];
  onUpdateResults: (results: PatientDietAnalysisResult[]) => void;
}

export default function DynamicDietFieldAdmin({
  dynamicDietFieldDefinitions,
  onUpdateFields,
  onSave,
  onReset,
  categories,
  onUpdateCategories,
  patientDietAnalysisResults,
  onUpdateResults,
}: DynamicDietFieldAdminProps) {
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [enteredScore, setEnteredScore] = useState<number>(5);
  const [fieldScores, setFieldScores] = useState<Record<string, number>>({});
  const [results, setResults] = useState<PatientDietAnalysisResult[]>(
    patientDietAnalysisResults || []
  );
  const [existingFieldIds, setExistingFieldIds] = useState<
    Record<string, string>
  >({});
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Updated to handle the new structure - get meta from first definition
  const [quote, setQuote] = useState(
    dynamicDietFieldDefinitions?.[0]?.meta?.quote || ""
  );
  const [description, setDescription] = useState(
    dynamicDietFieldDefinitions?.[0]?.meta?.description || ""
  );

  const [localDefinitions, setLocalDefinitions] = useState<
    DynamicDietFieldDefinition[]
  >(dynamicDietFieldDefinitions || []);
  const [localCategories, setLocalCategories] = useState<string[]>(
    categories || []
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFieldData, setNewFieldData] = useState<Omit<DynamicDiet, "id">>(
    () => ({
      label: "",
      category: localCategories.length > 0 ? localCategories[0] : "",
      min: 1,
      max: 10,
      highRecommendation: "",
      normalRecommendation: "",
      lowRecommendation: "",
    })
  );
  const { toast } = useToast();

  // Helper function to get all fields from all definitions
  const getAllFields = (): DynamicDiet[] => {
    return localDefinitions.flatMap((def) => def.fields || []);
  };

  const handleAddCategory = () => {
    const newCategory = prompt("Enter new category name:");
    if (newCategory && !localCategories.includes(newCategory)) {
      const updated = [...localCategories, newCategory];
      setLocalCategories(updated);
      onUpdateCategories(updated);
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Delete "${cat}"?`)) {
      const updated = localCategories.filter((c) => c !== cat);
      setLocalCategories(updated);
      onUpdateCategories(updated);
    }
  };

  useEffect(() => {
    if (localCategories.length > 0 && !newFieldData.category) {
      setNewFieldData((prev) => ({
        ...prev,
        category: localCategories[0],
      }));
    }
  }, [localCategories, newFieldData.category]);

  useEffect(() => {
    setLocalDefinitions(dynamicDietFieldDefinitions || []);
  }, [dynamicDietFieldDefinitions]);

  useEffect(() => {
    setResults(patientDietAnalysisResults || []);
  }, [patientDietAnalysisResults]);

  useEffect(() => {
    setLocalCategories(categories || []);
  }, [categories]);

  useEffect(() => {
    const newDefinitions = dynamicDietFieldDefinitions || [];
    setLocalDefinitions(newDefinitions);

    const firstDef = newDefinitions[0];
    if (firstDef?.meta) {
      setQuote(firstDef.meta.quote || "");
      setDescription(firstDef.meta.description || "");
    }
  }, [dynamicDietFieldDefinitions]);

  // Updated to handle meta changes
  useEffect(() => {
    if (localDefinitions.length > 0) {
      const currentMeta = localDefinitions[0]?.meta;
      // Only update if the meta actually changed
      if (
        currentMeta?.quote !== quote ||
        currentMeta?.description !== description
      ) {
        const updatedDefinitions = [...localDefinitions];
        updatedDefinitions[0] = {
          ...updatedDefinitions[0],
          meta: {
            quote,
            description,
          },
        };
        setLocalDefinitions(updatedDefinitions);
        onUpdateFields(updatedDefinitions);
      }
    }
  }, [quote, description]);

  const addNewField = () => {
    if (!newFieldData.label.trim()) {
      toast({
        title: "Validation Error",
        description: "Field label is required.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // ✅ Check if categories exist
    if (localCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one category first.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // ✅ Ensure category is set
    const categoryToUse = newFieldData.category || localCategories[0];

    // Generate a unique ID for the field
    const fieldId = crypto.randomUUID();

    // Check for duplicates by label across all fields
    const allFields = getAllFields();
    const isDuplicate = allFields.some(
      (field) => field.label.toLowerCase() === newFieldData.label.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Validation Error",
        description: "A field with this label already exists.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const newField: DynamicDiet = {
      id: fieldId,
      ...newFieldData,
      category: categoryToUse, // ✅ Ensure category is always set
    };

    console.log("➕ FRONTEND: Adding new field:", newField);

    // Add to the first definition, or create a new one if none exist
    const updatedDefinitions = [...localDefinitions];
    if (updatedDefinitions.length === 0) {
      updatedDefinitions.push({
        meta: { quote: quote || "", description: description || "" }, // ✅ Use current quote/description
        fields: [newField],
      });
    } else {
      updatedDefinitions[0] = {
        ...updatedDefinitions[0],
        fields: [...(updatedDefinitions[0].fields || []), newField],
      };
    }

    setLocalDefinitions(updatedDefinitions);
    onUpdateFields(updatedDefinitions);
    setShowCreateModal(false);
    setNewFieldData({
      label: "",
      category: localCategories[0] || "",
      min: 1,
      max: 10,
      highRecommendation: "",
      normalRecommendation: "",
      lowRecommendation: "",
    });
    toast({
      title: "Field Added",
      description: `"${newField.label}" has been added. Remember to Save Changes.`,
      variant: "success",
      duration: 3000,
    });
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setNewFieldData({
      label: "",
      category: localCategories[0] || "",
      min: 1,
      max: 10,
      highRecommendation: "",
      normalRecommendation: "",
      lowRecommendation: "",
    });
  };

  // Updated to handle field updates within definitions
  const updateLocalField = (
    fieldId: string,
    key: keyof DynamicDiet,
    value: any
  ) => {
    if (key === "id") {
      toast({
        title: "Validation Error",
        description: "Field ID cannot be modified (it's auto-generated).",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Check for duplicate labels (excluding current field)
    if (key === "label") {
      const allFields = getAllFields();
      const isDuplicate = allFields.some(
        (f) =>
          f.id !== fieldId &&
          f.label.toLowerCase() === String(value).toLowerCase()
      );
      if (isDuplicate) {
        toast({
          title: "Validation Error",
          description: "Field label must be unique.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
    }

    const updatedDefinitions = localDefinitions.map((definition) => ({
      ...definition,
      fields: (definition.fields || []).map((field) =>
        field.id === fieldId ? { ...field, [key]: value } : field
      ),
    }));

    setLocalDefinitions(updatedDefinitions);
    onUpdateFields(updatedDefinitions);
  };

  const handleBatchAddResults = () => {
    const updatedResults: PatientDietAnalysisResult[] = [...results];
    const allFields = getAllFields();

    Object.entries(fieldScores).forEach(([fieldId, score]) => {
      const field = allFields.find((f) => f.id === fieldId);
      if (!field || score < field.min || score > field.max) return;

      let level: "LOW" | "NORMAL" | "HIGH" = "NORMAL";
      if (score <= 3) level = "LOW";
      else if (score >= 7) level = "HIGH";

      const recommendations = {
        LOW: field.lowRecommendation,
        NORMAL: field.normalRecommendation,
        HIGH: field.highRecommendation,
      };

      const recommendation = recommendations[level];

      const existingIndex = updatedResults.findIndex(
        (r) => r.fieldId === fieldId
      );

      if (existingIndex >= 0) {
        // ✅ Update existing
        updatedResults[existingIndex] = {
          ...updatedResults[existingIndex],
          score,
          level,
          recommendation,
          recommendations,
          selectedLevel: level,
        };
      } else {
        // ➕ Add new
        updatedResults.push({
          id: existingFieldIds[fieldId] || undefined,
          fieldId,
          score,
          level,
          recommendation,
          recommendations,
          selectedLevel: level,
        } as PatientDietAnalysisResult);
      }
    });

    setResults(updatedResults);
    onUpdateResults(updatedResults);
    setShowResultModal(false);

    toast({
      title: "Results Saved",
      description: "Diet analysis results updated successfully.",
      variant: "success",
      duration: 3000,
    });
  };

  const handleDeleteResult = (fieldId: string) => {
    const updated = results.filter((r) => r.fieldId !== fieldId);
    setResults(updated);
    onUpdateResults(updated);

    toast({
      title: "Result Deleted",
      description: `Analysis result for "${fieldId}" has been removed.`,
      variant: "destructive",
      duration: 3000,
    });
  };

  const deleteField = (fieldId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this field? This action cannot be undone."
      )
    ) {
      return;
    }

    const updatedDefinitions = localDefinitions.map((definition) => ({
      ...definition,
      fields: (definition.fields || []).filter((field) => field.id !== fieldId),
    }));

    setLocalDefinitions(updatedDefinitions);
    onUpdateFields(updatedDefinitions);
    toast({
      title: "Field Deleted",
      description: "Field removed. Remember to Save Changes.",
      variant: "destructive",
      duration: 3000,
    });
  };

  // Updated drag and drop to work with flattened fields
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const allFields = getAllFields();
    const reordered = Array.from(allFields);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Update the first definition with reordered fields
    const updatedDefinitions = [...localDefinitions];
    if (updatedDefinitions.length > 0) {
      updatedDefinitions[0] = {
        ...updatedDefinitions[0],
        fields: reordered,
      };
    }

    setLocalDefinitions(updatedDefinitions);
    onUpdateFields(updatedDefinitions);
    toast({
      title: "Fields Reordered",
      description: "Order updated. Remember to Save Changes.",
      variant: "default",
      duration: 3000,
    });
  };

  // New: ensure latest local state is pushed to parent before calling onSave
  const handleSaveAll = async () => {
    console.log("🚀 FRONTEND: About to save data:");
    console.log("  - Local definitions:", localDefinitions.length);
    console.log("  - Local categories:", localCategories);
    console.log("  - Results:", results.length);

    // ✅ Merge latest field data and ensure IDs
    const mergedDefinitions = localDefinitions.map((def) => ({
      ...def,
      fields: (Array.isArray(def.fields) ? def.fields : []).map((f) => ({
        ...f,
        id: f.id || crypto.randomUUID(), // ensure stable ID for backend
      })),
    }));

    console.log(
      "📤 FRONTEND: Sending definitions:",
      JSON.stringify(mergedDefinitions, null, 2)
    );

    // Push updated values to parent state
    onUpdateFields(mergedDefinitions);
    onUpdateResults(results);
    onUpdateCategories(localCategories);

    try {
      const maybePromise = onSave();
      if (maybePromise && typeof (maybePromise as any).then === "function") {
        await (maybePromise as Promise<any>);
      }
      toast({
        title: "Saved",
        description: "All changes were submitted to the server.",
        variant: "success",
        duration: 1500,
      });
    } catch (err) {
      console.error("❌ FRONTEND: Save failed:", err);
      toast({
        title: "Save failed",
        description:
          "Something went wrong while saving. Check console or server logs.",
        variant: "destructive",
        duration: 1500,
      });
    }
  };

  return (
    <div>
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-4 sm:p-6 uppercase text-white">
          <CardTitle className="text-base sm:text-xl md:text-2xl font-bold flex items-center justify-center sm:justify-start text-center sm:text-left">
            Dynamic Diet Field Management
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              Configured Fields
            </h3>

            {/* Action Buttons */}
            <div className="flex flex-row flex-wrap justify-end gap-2 w-full">
              <Button
                onClick={() => setShowCreateModal(true)}
                size="sm"
                className="flex-1 sm:flex-initial min-w-[160px]"
              >
                Add New Field
              </Button>

              <Button
                className="flex-1 sm:flex-initial min-w-[160px]"
                onClick={() => {
                  const scores: Record<string, number> = {};
                  const ids: Record<string, string> = {};

                  (patientDietAnalysisResults || []).forEach((res) => {
                    scores[res.fieldId] = res.score;
                    ids[res.fieldId] = (res as any).id ?? "";
                  });

                  setFieldScores(scores);
                  setExistingFieldIds(ids);
                  setShowResultModal(true);
                }}
                size="sm"
              >
                Add Analysis Result
              </Button>

              <Button
                onClick={() => setShowResultsModal(true)}
                size="sm"
                className="flex-1 sm:flex-initial min-w-[160px]"
              >
                View Saved Results
              </Button>

              <Button
                onClick={handleSaveAll}
                size="sm"
                className="flex-1 sm:flex-initial min-w-[160px]"
              >
                Save All Changes
              </Button>
            </div>
          </div>

          {/* Categories Management Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h4 className="font-semibold text-gray-700 mb-4 text-base sm:text-lg">
              Diet Field Categories
            </h4>

            <div className="space-y-3">
              {/* Categories List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {localCategories.map((cat) => (
                  <div
                    key={cat}
                    className="flex justify-between items-center bg-white px-3 py-2 rounded-md shadow-sm border"
                  >
                    <span className="text-sm font-medium truncate mr-2">
                      {cat}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(cat)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleAddCategory}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Label>Quote</Label>
            <Input
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter inspirational quote..."
              className="mb-4"
            />

            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or note for this section..."
            />
          </div>

          {/* Fields List */}
          {getAllFields().length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4"></div>
              <p className="text-lg">No dynamic diet fields defined yet.</p>
              <p className="text-sm mt-2">
                Click "Add New Field" to get started.
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="fields">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {getAllFields().map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 sm:p-6 bg-white shadow-sm transition-all duration-200 ${
                              snapshot.isDragging
                                ? "bg-gray-100 ring-2 ring-blue-500 shadow-lg"
                                : "hover:shadow-md"
                            }`}
                          >
                            {/* Field Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span
                                  {...provided.dragHandleProps}
                                  className="cursor-grab text-gray-400 flex-shrink-0 touch-none"
                                >
                                  <GripVertical className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                    {index + 1}. {field.label}
                                  </h4>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteField(field.id)}
                                className="flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">
                                  Delete
                                </span>
                              </Button>
                            </div>

                            {/* Field Form */}
                            <div className="space-y-4">
                              {/* Basic Info Row */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FieldInput
                                  label="Label"
                                  value={field.label}
                                  onChange={(val) =>
                                    updateLocalField(field.id, "label", val)
                                  }
                                />

                                {/* Fixed Category Select with label */}
                                <div className="flex flex-col">
                                  <label className="mb-1 text-sm font-medium text-gray-700">
                                    Category
                                  </label>
                                  <Select
                                    value={field.category}
                                    onValueChange={(val) =>
                                      updateLocalField(
                                        field.id,
                                        "category",
                                        val
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {localCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                          {cat}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <FieldInput
                                  label="Min Score"
                                  type="number"
                                  value={field.min}
                                  onChange={(val) =>
                                    updateLocalField(field.id, "min", val)
                                  }
                                  min={0}
                                  max={field.max}
                                />
                                <FieldInput
                                  label="Max Score"
                                  type="number"
                                  value={field.max}
                                  onChange={(val) =>
                                    updateLocalField(field.id, "max", val)
                                  }
                                  min={field.min}
                                />
                              </div>

                              {/* Recommendations Row */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <FieldTextarea
                                  label="High Recommendation"
                                  value={field.highRecommendation}
                                  onChange={(val) =>
                                    updateLocalField(
                                      field.id,
                                      "highRecommendation",
                                      val
                                    )
                                  }
                                />
                                <FieldTextarea
                                  label="Normal Recommendation"
                                  value={field.normalRecommendation}
                                  onChange={(val) =>
                                    updateLocalField(
                                      field.id,
                                      "normalRecommendation",
                                      val
                                    )
                                  }
                                />
                                <FieldTextarea
                                  label="Low Recommendation"
                                  value={field.lowRecommendation}
                                  onChange={(val) =>
                                    updateLocalField(
                                      field.id,
                                      "lowRecommendation",
                                      val
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Create New Field Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
            <h3 className="text-lg font-bold mb-4 text-center">
              Add Diet Analysis Results
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto mb-6">
              {getAllFields().map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between"
                >
                  <label className="mr-4 w-2/3 font-medium">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    className="w-20 border rounded px-2 py-1"
                    value={fieldScores[field.id] ?? ""}
                    onChange={(e) =>
                      setFieldScores((prev) => ({
                        ...prev,
                        [field.id]: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResultModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBatchAddResults}>Save All</Button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b">
              <h3 className="text-base sm:text-lg md:text-xl font-bold">
                Add New Diet Field Definition
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateModalClose}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-2 sm:p-4 md:p-6">
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FieldInput
                    label="Field Label"
                    value={newFieldData.label}
                    onChange={(val) =>
                      setNewFieldData({ ...newFieldData, label: String(val) })
                    }
                    placeholder="e.g., Gluten Sensitivity"
                    required
                  />

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newFieldData.category}
                      onValueChange={(val) =>
                        setNewFieldData({ ...newFieldData, category: val })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {localCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Score Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FieldInput
                    label="Min Score"
                    type="number"
                    value={newFieldData.min}
                    onChange={(val) =>
                      setNewFieldData({ ...newFieldData, min: Number(val) })
                    }
                    min={0}
                    max={newFieldData.max}
                  />
                  <FieldInput
                    label="Max Score"
                    type="number"
                    value={newFieldData.max}
                    onChange={(val) =>
                      setNewFieldData({ ...newFieldData, max: Number(val) })
                    }
                    min={newFieldData.min}
                  />
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <FieldTextarea
                    label="High Recommendation"
                    value={newFieldData.highRecommendation}
                    onChange={(val) =>
                      setNewFieldData({
                        ...newFieldData,
                        highRecommendation: val,
                      })
                    }
                  />
                  <FieldTextarea
                    label="Normal Recommendation"
                    value={newFieldData.normalRecommendation}
                    onChange={(val) =>
                      setNewFieldData({
                        ...newFieldData,
                        normalRecommendation: val,
                      })
                    }
                  />
                  <FieldTextarea
                    label="Low Recommendation"
                    value={newFieldData.lowRecommendation}
                    onChange={(val) =>
                      setNewFieldData({
                        ...newFieldData,
                        lowRecommendation: val,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t rounded-md bg-gray-50">
              <Button
                variant="outline"
                onClick={handleCreateModalClose}
                className="w-full sm:w-auto bg-transparent order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addNewField}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Add Field
              </Button>
            </div>
          </div>
        </div>
      )}

      {showResultsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-4 max-h-[80vh] overflow-y-auto relative scrollbar-hide">
            <button
              onClick={() => setShowResultsModal(false)}
              className="absolute top-3 left-3 text-gray-500 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Delete All Button */}
            <div className="mb-4 flex justify-end">
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete all analysis results?"
                    )
                  ) {
                    setResults([]);
                    onUpdateResults([]);
                    toast({
                      title: "All Results Deleted",
                      description:
                        "All diet analysis results have been cleared.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Results
              </Button>
            </div>

            {results.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                No analysis results yet.
              </p>
            ) : (
              <div className="space-y-3">
                {results.map((res) => (
                  <div
                    key={res.fieldId}
                    className="flex justify-between items-center border p-3 rounded-md bg-gray-50"
                  >
                    <div>
                      {/* <p className="font-medium">{res.fieldId}</p> */}

                      <p className="text-sm text-gray-600">
                        Score: {res.score}, Level: {res.level}
                      </p>
                      <p className="text-sm text-gray-600">
                        Recommendation: {res.recommendation}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteResult(res.fieldId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
