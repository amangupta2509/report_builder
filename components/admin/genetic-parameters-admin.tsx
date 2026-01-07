"use client";

import React, { JSX, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { toast } from "sonner";

import type { GeneticCategory } from "@/types/report-types";

// Custom hook for data fetching

interface Props {
  categories: GeneticCategory[];
  onUpdateCategories: (updated: GeneticCategory[]) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function GeneticParametersAdmin({
  categories,
  onUpdateCategories,
  onSave,
  onReset,
}: Props): JSX.Element {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "category" | "parameter";
    categoryId?: string;
    categoryName?: string;
    categoryIndex?: number;
    paramIndex?: number;
    paramName?: string;
  }>({
    open: false,
    type: "category",
  });

  const handleCategoryChange = (
    categoryIndex: number,
    field: keyof GeneticCategory,
    value: string | boolean | number
  ): void => {
    const updated = [...categories];
    (updated[categoryIndex] as any)[field] = value;
    onUpdateCategories(updated);
  };

  const handleParameterChange = (
    categoryIndex: number,
    paramIndex: number,
    value: string
  ): void => {
    const updated = [...categories];
    updated[categoryIndex].parameters[paramIndex] = value;
    onUpdateCategories(updated);
  };

  const handleImageError = (categoryId: string): void => {
    const newErrors = new Set(imageErrors);
    newErrors.add(categoryId);
    setImageErrors(newErrors);
  };

  const handleFileChange = async (
    categoryIndex: number,
    file: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success && result.url) {
        handleCategoryChange(categoryIndex, "imageUrl", result.url);

        const categoryId = categories[categoryIndex].id;
        const newErrors = new Set(imageErrors);
        newErrors.delete(categoryId);
        setImageErrors(newErrors);
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
    }
  };

  const addCategory = (): void => {
    const newCategory: GeneticCategory = {
      id: `category_${Date.now()}`,
      category: "NEW CATEGORY",
      imageUrl: "",
      description: "",
      parameters: Array(15).fill(""),
      isActive: true,
      order: categories.length + 1,
    };

    onUpdateCategories([...categories, newCategory]);
  };

  const removeCategory = async (categoryId: string): Promise<void> => {
    const category = categories.find((cat) => cat.id === categoryId);
    setDeleteDialog({
      open: true,
      type: "category",
      categoryId,
      categoryName: category?.category || "Unknown Category",
    });
  };

  const confirmRemoveCategory = async (): Promise<void> => {
    if (!deleteDialog.categoryId) return;

    const updated = categories.filter(
      (cat) => cat.id !== deleteDialog.categoryId
    );
    onUpdateCategories(updated);

    if (selectedCategory === deleteDialog.categoryId) {
      setSelectedCategory("all");
    }

    setDeleteDialog({ open: false, type: "category" });
    toast.success("Category removed");
  };

  const addParameter = (categoryIndex: number): void => {
    const updated = [...categories];
    updated[categoryIndex].parameters.push("");
    onUpdateCategories(updated);
  };

  const removeParameter = (categoryIndex: number, paramIndex: number): void => {
    const category = categories[categoryIndex];
    const paramName = category.parameters[paramIndex] || "Empty Parameter";

    setDeleteDialog({
      open: true,
      type: "parameter",
      categoryIndex,
      paramIndex,
      paramName,
      categoryName: category.category,
    });
  };

  const confirmRemoveParameter = (): void => {
    if (
      deleteDialog.categoryIndex === undefined ||
      deleteDialog.paramIndex === undefined
    )
      return;

    const updated = [...categories];
    updated[deleteDialog.categoryIndex].parameters.splice(
      deleteDialog.paramIndex,
      1
    );
    onUpdateCategories(updated);

    setDeleteDialog({ open: false, type: "category" });
    toast.success("Parameter removed");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(); // delegate saving to parent
      toast.success("Changes saved successfully");
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories =
    selectedCategory === "all"
      ? categories
      : categories.filter((cat) => cat.id === selectedCategory);

  return (
    <div className="w-full max-w-8xl mx-auto ">
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-red-400 rounded-lg p-4 sm:p-6">
          <CardTitle className="text-base sm:text-xl md:text-2xl font-bold uppercase text-white text-center sm:text-left">
            Table of Contents
          </CardTitle>
        </CardHeader>

        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="gap-2 text-xs sm:text-sm"
                >
                  <Edit3 size={14} className="sm:size-4" />
                  <span className="hidden xs:inline">
                    {isEditing ? "View Mode" : "Edit Mode"}
                  </span>
                  <span className="xs:hidden">
                    {isEditing ? "View" : "Edit"}
                  </span>
                </Button>

                {isEditing && (
                  <>
                    <Button
                      onClick={addCategory}
                      variant="outline"
                      className="gap-2 text-xs sm:text-sm"
                    >
                      <Plus size={14} className="sm:size-4" />
                      <span className="hidden xs:inline">Add Category</span>
                      <span className="xs:hidden">Add</span>
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2 text-xs sm:text-sm"
                    >
                      <Save size={14} className="sm:size-4" />
                      <span className="hidden xs:inline">
                        {isSaving ? "Saving..." : "Save Changes"}
                      </span>
                      <span className="xs:hidden">
                        {isSaving ? "Saving..." : "Save"}
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-6">
          {/* Category Table */}
          <div className="overflow-x-auto">
            <div className="min-w-full border border-gray-300 rounded-lg">
              {filteredCategories.map((category, categoryIndex) => {
                const actualIndex = categories.findIndex(
                  (cat) => cat.id === category.id
                );
                return (
                  <div
                    key={category.id}
                    className="border-b border-black last:border-b-0"
                  >
                    {/* Category Row */}
                    <div className="border-b border-gray-300 last:border-b-0">
                      {/* Mobile Layout */}
                      <div className="block lg:hidden">
                        {/* Category Header for Mobile */}
                        <div className="border-b border-gray-300 p-3 sm:p-4 bg-gray-50">
                          {isEditing ? (
                            <div className="space-y-3">
                              <Input
                                value={category.category}
                                onChange={(e) =>
                                  handleCategoryChange(
                                    actualIndex,
                                    "category",
                                    e.target.value
                                  )
                                }
                                className="text-center font-bold text-sm bg-white"
                                placeholder="Category Name"
                              />

                              {/* <Textarea
                                value={category.description || ""}
                                onChange={(e) =>
                                  handleCategoryChange(
                                    actualIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="text-xs bg-white resize-none h-16"
                                placeholder="Category description..."
                              /> */}

                              <div className="flex flex-col items-center space-y-2">
                                {category.imageUrl &&
                                !imageErrors.has(category.id) ? (
                                  <Image
                                    src={category.imageUrl}
                                    alt={category.category}
                                    width={50}
                                    height={50}
                                    className="rounded-full border object-cover"
                                    onError={() =>
                                      handleImageError(category.id)
                                    }
                                  />
                                ) : (
                                  <div className="w-[50px] h-[50px] bg-white rounded-full border-2 border-dashed border-red-300 flex items-center justify-center">
                                    <Upload
                                      size={16}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}

                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileChange(actualIndex, file);
                                      }
                                    }}
                                  />
                                  <div className="text-xs text-blue-600 hover:text-blue-800 underline">
                                    Upload
                                  </div>
                                </label>
                              </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeCategory(category.id)}
                                className="gap-1 w-full text-xs"
                              >
                                <Trash2 size={12} />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <h2 className="text-sm sm:text-base font-bold text-gray-700 mb-2">
                                {category.category}
                              </h2>

                              {category.description && (
                                <p className="text-xs text-gray-600 mb-3 leading-tight">
                                  {category.description}
                                </p>
                              )}

                              {category.imageUrl &&
                              !imageErrors.has(category.id) ? (
                                <Image
                                  src={category.imageUrl}
                                  alt={category.category}
                                  width={50}
                                  height={50}
                                  className="rounded-full border object-cover mx-auto"
                                  onError={() => handleImageError(category.id)}
                                />
                              ) : (
                                <div className="w-[50px] h-[50px] bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto">
                                  <Upload size={20} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Parameters for Mobile - Single Column Layout */}
                        <div className="p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {category.parameters.map(
                              (parameter, paramIndex) => (
                                <div
                                  key={paramIndex}
                                  className="border border-gray-300 rounded p-2"
                                >
                                  {isEditing ? (
                                    <div className="flex items-center space-x-1">
                                      <Input
                                        value={parameter}
                                        onChange={(e) =>
                                          handleParameterChange(
                                            actualIndex,
                                            paramIndex,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Parameter name"
                                        className="text-xs h-7 flex-1"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeParameter(
                                            actualIndex,
                                            paramIndex
                                          )
                                        }
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X size={10} />
                                      </Button>
                                    </div>
                                  ) : (
                                    parameter && (
                                      <span className="text-xs text-gray-700">
                                        {parameter}
                                      </span>
                                    )
                                  )}
                                </div>
                              )
                            )}
                          </div>

                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addParameter(actualIndex)}
                              className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700"
                            >
                              <Plus size={12} className="mr-1" />
                              Add Parameter
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:grid lg:grid-cols-4 min-h-[140px]">
                        {/* Category Name & Image Column */}
                        <div className="border-r border-gray-300 p-4 flex flex-col items-center justify-center bg-gray-50">
                          {isEditing ? (
                            <div className="space-y-3 w-full">
                              <Input
                                value={category.category}
                                onChange={(e) =>
                                  handleCategoryChange(
                                    actualIndex,
                                    "category",
                                    e.target.value
                                  )
                                }
                                className="text-center font-bold text-sm bg-white"
                                placeholder="Category Name"
                              />
                              {/* 
                              <Textarea
                                value={category.description || ""}
                                onChange={(e) =>
                                  handleCategoryChange(
                                    actualIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="text-xs bg-white resize-none h-16"
                                placeholder="Category description..."
                              /> */}

                              <div className="flex flex-col items-center space-y-2">
                                {category.imageUrl &&
                                !imageErrors.has(category.id) ? (
                                  <Image
                                    src={category.imageUrl}
                                    alt={category.category}
                                    width={60}
                                    height={60}
                                    className="rounded-full border object-cover"
                                    onError={() =>
                                      handleImageError(category.id)
                                    }
                                  />
                                ) : (
                                  <div className="w-[60px] h-[60px] bg-white rounded-full border-2 border-dashed border-red-300 flex items-center justify-center">
                                    <Upload
                                      size={20}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}

                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileChange(actualIndex, file);
                                      }
                                    }}
                                  />
                                  <div className="text-xs text-blue-600 hover:text-blue-800 underline">
                                    Upload
                                  </div>
                                </label>
                              </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeCategory(category.id)}
                                className="gap-1 w-full"
                              >
                                <Trash2 size={14} />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <h2 className="text-base font-bold text-gray-700 mb-2">
                                {category.category}
                              </h2>

                              {category.description && (
                                <p className="text-xs text-gray-600 mb-3 leading-tight">
                                  {category.description}
                                </p>
                              )}

                              {category.imageUrl &&
                              !imageErrors.has(category.id) ? (
                                <Image
                                  src={category.imageUrl}
                                  alt={category.category}
                                  width={70}
                                  height={70}
                                  className="rounded-full border object-cover mx-auto"
                                  onError={() => handleImageError(category.id)}
                                />
                              ) : (
                                <div className="w-[70px] h-[70px] bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto">
                                  <Upload size={24} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Parameters Columns */}
                        <div className="col-span-3">
                          <table className="w-full table-fixed border border-gray-300">
                            <tbody>
                              {Array.from({
                                length: Math.ceil(
                                  category.parameters.length / 3
                                ),
                              }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                  {[0, 1, 2].map((colIndex) => {
                                    const paramIndex =
                                      colIndex *
                                        Math.ceil(
                                          category.parameters.length / 3
                                        ) +
                                      rowIndex;
                                    const parameter =
                                      category.parameters[paramIndex] || "";

                                    return (
                                      <td
                                        key={colIndex}
                                        className="border border-gray-300 p-1"
                                      >
                                        {isEditing ? (
                                          <div className="flex items-center space-x-1 w-full">
                                            <Input
                                              value={parameter}
                                              onChange={(e) =>
                                                handleParameterChange(
                                                  actualIndex,
                                                  paramIndex,
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Parameter name"
                                              className="text-sm h-7 w-full"
                                            />
                                            {paramIndex <
                                              category.parameters.length && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  removeParameter(
                                                    actualIndex,
                                                    paramIndex
                                                  )
                                                }
                                                className="h-7 w-7 p-0  text-red-500"
                                              >
                                                <X size={12} />
                                              </Button>
                                            )}
                                          </div>
                                        ) : (
                                          parameter && (
                                            <span className="text-sm text-gray-700">
                                              {parameter}
                                            </span>
                                          )
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addParameter(actualIndex)}
                              className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700"
                            >
                              <Plus size={12} className="mr-1" />
                              Add Parameter
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-4">
                <FileImage size={36} className="sm:size-12 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                No Categories Found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                Get started by adding your first category
              </p>
              <Button onClick={addCategory} className="gap-2 text-sm">
                <Plus size={14} className="sm:size-4" />
                Add First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <AlertDialogTitle className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                  {deleteDialog.type === "category"
                    ? "Delete Category"
                    : "Delete Parameter"}
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogDescription className="text-sm sm:text-base text-gray-600 leading-relaxed px-2 sm:px-0">
            {deleteDialog.type === "category" ? (
              <>
                Are you sure you want to delete the category{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteDialog.categoryName}"
                </span>
                ?
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                <span className="block sm:inline mt-2 sm:mt-0">
                  This action will permanently remove the category and all its
                  parameters. This cannot be undone.
                </span>
              </>
            ) : (
              <>
                Are you sure you want to delete the parameter{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteDialog.paramName}"
                </span>{" "}
                from{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteDialog.categoryName}"
                </span>
                ?
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                <span className="block sm:inline mt-2 sm:mt-0">
                  This action cannot be undone.
                </span>
              </>
            )}
          </AlertDialogDescription>

          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
            <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteDialog.type === "category"
                  ? confirmRemoveCategory
                  : confirmRemoveParameter
              }
              className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <Trash2 size={14} className="mr-2" />
              Delete{" "}
              {deleteDialog.type === "category" ? "Category" : "Parameter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
