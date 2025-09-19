"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Upload,
  Plus,
  Save,
  ImageIcon,
  Edit3,
  Check,
  FileText,
  Activity,
  AlertTriangle,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Types (these would be imported from your types file)
interface HealthConditionStatus {
  status: "strength" | "improvement";
  description?: string;
  sensitivity?: "low" | "medium" | "high";
  avoid?: string[];
  follow?: string[];
  consume?: string[];
  monitor?: string[];
  avoidLabel?: string;
  followLabel?: string;
  consumeLabel?: string;
  monitorLabel?: string;
}

interface LifestyleConditions {
  quote?: string;
  description?: string;
  [categoryId: string]:
    | Record<string, HealthConditionStatus>
    | string
    | undefined;
}

interface LifestyleCategoryImages {
  [categoryId: string]: string;
}

type EditableLabelKey =
  | "avoidLabel"
  | "followLabel"
  | "consumeLabel"
  | "monitorLabel";

interface Props {
  lifestyleConditions: LifestyleConditions;
  lifestyleCategoryImages: LifestyleCategoryImages;
  addCategory: (categoryId: string) => void;
  addField: (
    categoryId: string,
    fieldName: string,
    status: HealthConditionStatus["status"]
  ) => void;
  updateFieldStatus: (
    categoryId: string,
    fieldName: string,
    updated: Partial<HealthConditionStatus>
  ) => void;
  deleteField: (categoryId: string, fieldName: string) => void;
  deleteCategory: (categoryId: string) => void;
  updateQuoteAndDescription: (quote: string, description: string) => void;
  updateCategoryImage: (categoryId: string, imageUrl: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function LifestyleConditionsAdmin({
  lifestyleConditions,
  lifestyleCategoryImages,
  updateQuoteAndDescription,
  updateCategoryImage,
  addCategory,
  addField,
  updateFieldStatus,
  deleteCategory,
  deleteField,
  onSave,
  onReset,
}: Props) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newField, setNewField] = useState<Record<string, string>>({});
  const [availableImages, setAvailableImages] = useState<
    { label: string; url: string }[]
  >([]);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageLabel, setNewImageLabel] = useState("");
  const [showSensitivityDropdown, setShowSensitivityDropdown] = useState<{
    [key: string]: boolean;
  }>({});

  // Confirmation popup states
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "category" | "field" | null;
    categoryId?: string;
    fieldName?: string;
    categoryName?: string;
  }>({ type: null });

  const quote = lifestyleConditions.quote ?? "";
  const description = lifestyleConditions.description ?? "";

  const [editingLabels, setEditingLabels] = useState<{
    [categoryId: string]: {
      [field: string]: {
        [key in EditableLabelKey]?: boolean;
      };
    };
  }>({});

  const toggleEditLabel = (
    categoryId: string,
    field: string,
    key: EditableLabelKey
  ) => {
    setEditingLabels((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: {
          ...prev[categoryId]?.[field],
          [key]: !prev[categoryId]?.[field]?.[key],
        },
      },
    }));
  };

  const loadAvailableImages = async () => {
    try {
      const res = await fetch("/api/lifestyle-images?folder=lifestyle");
      const data = await res.json();
      if (data.success) {
        setAvailableImages(data.images);
      }
    } catch (err) {
      console.error("Failed to load lifestyle images:", err);
    }
  };

  useEffect(() => {
    loadAvailableImages();
  }, []);

  const handleImageUpload = async () => {
    if (!newImageFile || !newImageLabel) return;

    const formData = new FormData();
    formData.append("file", newImageFile);
    formData.append("label", newImageLabel);
    formData.append("folder", "lifestyle");

    try {
      const response = await fetch("/api/lifestyle-images", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setNewImageFile(null);
        setNewImageLabel("");
        loadAvailableImages(); // refresh list
        alert("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setDeleteConfirmation({
      type: "category",
      categoryId,
      categoryName: categoryId.replace(/([A-Z])/g, " $1"),
    });
  };

  const handleDeleteField = (categoryId: string, fieldName: string) => {
    setDeleteConfirmation({
      type: "field",
      categoryId,
      fieldName,
      categoryName: categoryId.replace(/([A-Z])/g, " $1"),
    });
  };

  const confirmDelete = () => {
    if (
      deleteConfirmation.type === "category" &&
      deleteConfirmation.categoryId
    ) {
      deleteCategory(deleteConfirmation.categoryId);
    } else if (
      deleteConfirmation.type === "field" &&
      deleteConfirmation.categoryId &&
      deleteConfirmation.fieldName
    ) {
      deleteField(deleteConfirmation.categoryId, deleteConfirmation.fieldName);
    }
    setDeleteConfirmation({ type: null });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ type: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Header Section */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-4 sm:p-6">
            <CardTitle className="text-base sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
              Lifestyle Conditions
            </CardTitle>
          </CardHeader>
          
          <div className="text-end mt-4">
            <Button onClick={onSave}>
              <Save className="h-3 w-3 mr-2" />
              Save Changes
            </Button>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Quote and Description */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-semibold text-gray-800">
                    Motivational Quote
                  </Label>
                </div>
                <Input
                  value={quote}
                  onChange={(e) =>
                    updateQuoteAndDescription(e.target.value, description)
                  }
                  placeholder="Enter an inspiring quote..."
                  className="border-2 border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-semibold text-gray-800">
                    Add New Category
                  </Label>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Category name (e.g., Nutrition, Exercise)..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="border-2 border-gray-200 focus:border-green-500"
                  />
                  <Button
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        addCategory(newCategoryName.trim());
                        setNewCategoryName("");
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="font-semibold text-gray-800">
                  Introduction Description
                </Label>
              </div>
              <Textarea
                value={description}
                onChange={(e) =>
                  updateQuoteAndDescription(quote, e.target.value)
                }
                placeholder="Write a comprehensive introduction..."
                rows={4}
                className="border-2 border-gray-200 focus:border-purple-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Image Library Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="imageLabel">Image Label</Label>
                <Input
                  id="imageLabel"
                  placeholder="e.g., sleep, nutrition, exercise"
                  value={newImageLabel}
                  onChange={(e) => setNewImageLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="imageFile">Select Image</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                disabled={!newImageLabel || !newImageFile}
                onClick={handleImageUpload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="space-y-6">
          {Object.entries(lifestyleConditions)
            .filter(
              ([categoryId]) => !["quote", "description"].includes(categoryId)
            )
            .map(([categoryId, conditions]) => {
              const fieldMap = conditions as Record<
                string,
                HealthConditionStatus
              >;

              return (
                <Card
                  key={categoryId}
                  className="shadow-lg rounded-lg border-0"
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        {/* Category Image Preview */}
                        {lifestyleCategoryImages[categoryId] && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden">
                            <img
                              src={lifestyleCategoryImages[categoryId]}
                              alt={categoryId}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 capitalize">
                            {categoryId
                              .replace(/([a-z])([A-Z])/g, "$1 $2")
                              .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                              .replace(/&/g, " & ")
                              .replace(/\s+/g, " ")
                              .trim()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {Object.keys(fieldMap).length} conditions managed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Image Selection */}
                        <div className="min-w-[200px]">
                          <Select
                            value={lifestyleCategoryImages[categoryId] || ""}
                            onValueChange={(val) =>
                              updateCategoryImage(categoryId, val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select image" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableImages.map((img) => (
                                <SelectItem value={img.url} key={img.url}>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={img.url}
                                      alt={img.label}
                                      className="w-6 h-6 rounded object-cover"
                                    />
                                    <span>{img.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(categoryId)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Add New Condition */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter new condition name..."
                          value={newField[categoryId] ?? ""}
                          onChange={(e) =>
                            setNewField((prev) => ({
                              ...prev,
                              [categoryId]: e.target.value,
                            }))
                          }
                          className="flex-1 border-2 border-blue-200 focus:border-blue-400"
                        />
                        <Button
                          onClick={() => {
                            const fieldName = newField[categoryId]?.trim();
                            if (fieldName) {
                              addField(categoryId, fieldName, "strength");
                              setNewField((prev) => ({
                                ...prev,
                                [categoryId]: "",
                              }));
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Condition
                        </Button>
                      </div>
                    </div>

                    {/* Conditions List */}
                    <div className="space-y-6">
                      {Object.entries(fieldMap).map(([field, fieldData]) => (
                        <div
                          key={field}
                          className="bg-white border-2 border-gray-100 rounded-lg p-4 sm:p-6"
                        >
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <h4 className="font-semibold text-gray-800 text-base sm:text-lg">
                              {field}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Radio group */}
                              <div className="flex flex-wrap gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`${categoryId}-${field}`}
                                    checked={fieldData.status === "strength"}
                                    onChange={() =>
                                      updateFieldStatus(categoryId, field, {
                                        status: "strength",
                                      })
                                    }
                                    className="w-4 h-4 text-green-600"
                                  />
                                  <span className="text-green-700 font-medium text-sm sm:text-base">
                                    Strength
                                  </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`${categoryId}-${field}`}
                                    checked={fieldData.status === "improvement"}
                                    onChange={() =>
                                      updateFieldStatus(categoryId, field, {
                                        status: "improvement",
                                      })
                                    }
                                    className="w-4 h-4 text-red-600"
                                  />
                                  <span className="text-red-700 font-medium text-sm sm:text-base">
                                    Needs Improvement
                                  </span>
                                </label>
                              </div>
                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteField(categoryId, field)
                                }
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2 mb-4">
                            <Label className="text-sm font-semibold text-gray-700">
                              Description
                            </Label>
                            <Textarea
                              rows={4}
                              placeholder="Describe this condition..."
                              value={fieldData.description || ""}
                              onChange={(e) =>
                                updateFieldStatus(categoryId, field, {
                                  description: e.target.value,
                                })
                              }
                              className="border-2 border-gray-200 focus:border-blue-500 resize-y text-sm"
                            />
                          </div>

                          {/* Sensitivity */}
                          <div className="space-y-2 mb-6">
                            <Label className="text-sm font-semibold text-gray-700">
                              Sensitivity Level
                            </Label>
                            <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-6">
                              {(["low", "medium", "high"] as const).map(
                                (level) => (
                                  <div
                                    key={level}
                                    className={`cursor-pointer border-2 p-3 rounded-lg transition-all flex flex-col items-center ${
                                      fieldData.sensitivity === level
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() =>
                                      updateFieldStatus(categoryId, field, {
                                        sensitivity: level,
                                      })
                                    }
                                  >
                                    <img
                                      src={
                                        level === "low"
                                          ? "/lifestylesensetivelevel/1.png"
                                          : level === "medium"
                                          ? "/lifestylesensetivelevel/2.png"
                                          : "/lifestylesensetivelevel/3.png"
                                      }
                                      alt={`${level} sensitivity`}
                                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                                    />
                                    <p className="text-xs sm:text-sm mt-1 capitalize">
                                      {level}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {(
                              ["avoid", "follow", "consume", "monitor"] as const
                            ).map((key) => {
                              const labelKey =
                                `${key}Label` as EditableLabelKey;
                              const colors = {
                                avoid: "red",
                                follow: "green",
                                consume: "blue",
                                monitor: "yellow",
                              };

                              return (
                                <div key={key} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    {editingLabels?.[categoryId]?.[field]?.[
                                      labelKey
                                    ] ? (
                                      <>
                                        <Input
                                          className="flex-1 text-sm"
                                          value={fieldData[labelKey] || ""}
                                          onChange={(e) =>
                                            updateFieldStatus(
                                              categoryId,
                                              field,
                                              {
                                                [labelKey]: e.target.value,
                                              }
                                            )
                                          }
                                          placeholder={`Label for ${key}`}
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            toggleEditLabel(
                                              categoryId,
                                              field,
                                              labelKey
                                            )
                                          }
                                          className="h-8 w-8"
                                        >
                                          <Check className="w-3 h-3" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Label
                                          className={`flex-1 font-semibold text-${colors[key]}-700 text-xs sm:text-sm uppercase`}
                                        >
                                          {fieldData[labelKey] ||
                                            key.toUpperCase()}
                                        </Label>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            toggleEditLabel(
                                              categoryId,
                                              field,
                                              labelKey
                                            )
                                          }
                                          className="h-8 w-8"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                  <Textarea
                                    rows={4}
                                    placeholder={`Enter ${key} recommendations (one per line)...`}
                                    defaultValue={(
                                      (fieldData[key] as string[]) || []
                                    ).join("\n")}
                                    onBlur={(e) => {
                                      const items = e.target.value
                                        .split("\n")
                                        .map((v) => v.trim())
                                        .filter(Boolean);
                                      updateFieldStatus(categoryId, field, {
                                        [key]: items,
                                      });
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="text-sm resize-y min-h-[80px]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.type && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              {deleteConfirmation.type === "category" ? (
                <p className="text-gray-700">
                  Are you sure you want to delete the{" "}
                  <strong>"{deleteConfirmation.categoryName}"</strong> category?
                  This will permanently remove all conditions and data.
                </p>
              ) : (
                <p className="text-gray-700">
                  Are you sure you want to delete{" "}
                  <strong>"{deleteConfirmation.fieldName}"</strong>
                  from <strong>"{deleteConfirmation.categoryName}"</strong>? All
                  recommendations will be permanently removed.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
