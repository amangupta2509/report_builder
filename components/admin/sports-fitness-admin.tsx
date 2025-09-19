"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Plus, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import type { SportsAndFitness } from "@/types/report-types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

// Define the field data structure to match the interface
interface FieldData {
  level: string;
  description: string;
}

interface SportsFitnessAdminProps {
  sportsAndFitness: SportsAndFitness;
  updateSportsAndFitness: (
    section: keyof SportsAndFitness | "quote" | "description" | "customImages",
    field: string,
    data: FieldData | string | { label: string; url: string } | null
  ) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function SportsFitnessAdmin({
  sportsAndFitness,
  updateSportsAndFitness,
  onSave,
  onReset,
}: SportsFitnessAdminProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("");
  const [newFieldName, setNewFieldName] = useState("");
  const [imageLabel, setImageLabel] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "category" | "field" | null;
    target: string;
    section?: string;
  }>({ type: null, target: "" });

  // Get categories (exclude quote, description, customImages)
  const getCategories = (): string[] => {
    return Object.keys(sportsAndFitness).filter(
      (key) =>
        !["quote", "description", "customImages"].includes(key) &&
        typeof sportsAndFitness[key] === "object" &&
        !Array.isArray(sportsAndFitness[key])
    );
  };

  // Initialize active section
  useEffect(() => {
    const categories = getCategories();
    if (!activeSection && categories.length > 0) {
      setActiveSection(categories[0]);
    }
  }, [sportsAndFitness, activeSection]);

  const addNewCategory = () => {
    const key = newCategoryName.trim().replace(/\s+/g, "_").toLowerCase();

    if (!key || key in sportsAndFitness) {
      toast({
        title: "Error",
        description: "Invalid or existing category name",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    // Initialize new category with empty object
    updateSportsAndFitness(key as keyof SportsAndFitness, "__init__", {
      level: "",
      description: "",
    });

    setNewCategoryName("");
    setActiveSection(key);

    toast({
      title: "Category Added",
      description: `Successfully created category "${key}"`,
      duration: 1500,
      variant: "success",
    });
  };

  const addNewField = () => {
    if (!activeSection) return;

    const fieldKey = newFieldName.toLowerCase().replace(/\s+/g, "_");
    const currentSection = sportsAndFitness[activeSection];

    if (
      typeof currentSection === "object" &&
      !Array.isArray(currentSection) &&
      currentSection[fieldKey]
    ) {
      toast({
        title: "Error",
        description: "Field already exists",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    updateSportsAndFitness(activeSection as keyof SportsAndFitness, fieldKey, {
      level: "",
      description: "",
    });

    setNewFieldName("");

    toast({
      title: "Field Added",
      description: `Successfully added field "${newFieldName}"`,
      duration: 1500,
      variant: "success",
    });
  };

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const label = (formData.get("imageLabel") as string)?.trim().toLowerCase();
    const file = formData.get("imageFile") as File;

    if (!file || !label) {
      toast({
        title: "Error",
        description: "Both label and image file are required",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("label", label);
    uploadData.append("folder", "sports");

    try {
      const response = await fetch("/api/sports-images", {
        method: "POST",
        body: uploadData,
      });

      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        console.error("Invalid JSON from server:", text);
        toast({
          title: "Upload Failed",
          description: "Server returned invalid response",
          variant: "destructive",
          duration: 1500,
        });
        return;
      }

      if (result.success) {
        setCustomImages((prev) => ({
          ...prev,
          [label]: result.url,
        }));

        updateSportsAndFitness("customImages" as any, label, {
          label,
          url: result.url,
        });

        form.reset();
        setImageLabel("");

        toast({
          title: "Image Uploaded",
          description: `Successfully uploaded image "${label}"`,
          duration: 1500,
          variant: "success",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
          duration: 1500,
        });
      }
    } catch (err) {
      console.error("Upload error", err);
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading",
        variant: "destructive",
        duration: 1500,
      });
    }
  };

  const deleteField = (field: string) => {
    setDeleteConfirm({
      type: "field",
      target: field,
      section: activeSection,
    });
  };

  const deleteCategory = (section: string) => {
    setDeleteConfirm({
      type: "category",
      target: section,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.type === "field" && deleteConfirm.section) {
      // Delete field by passing null as the data
      updateSportsAndFitness(
        deleteConfirm.section as keyof SportsAndFitness,
        deleteConfirm.target,
        null
      );

      toast({
        title: "Field Deleted",
        description: `Successfully deleted field "${deleteConfirm.target}"`,
        duration: 1500,
        variant: "success",
      });
    } else if (deleteConfirm.type === "category") {
      updateSportsAndFitness(
        deleteConfirm.target as keyof SportsAndFitness,
        "__delete_category__",
        null
      );

      const categories = getCategories().filter(
        (cat) => cat !== deleteConfirm.target
      );
      setActiveSection(categories[0] || "");

      toast({
        title: "Category Deleted",
        description: `Successfully deleted category "${deleteConfirm.target}"`,
        duration: 1500,
        variant: "success",
      });
    }

    setDeleteConfirm({ type: null, target: "" });
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/sports-images");
        const data = await res.json();

        if (data.success) {
          const imageMap: Record<string, string> = {};
          data.images.forEach((img: { label: string; url: string }) => {
            imageMap[img.label.toLowerCase()] = img.url;
          });
          setCustomImages(imageMap);
        }
      } catch (err) {
        console.error("Failed to load images", err);
        toast({
          title: "Load Error",
          description: "Failed to load custom images",
          variant: "destructive",
          duration: 1500,
        });
      }
    };

    fetchImages();
  }, [toast]);

  const handleFieldUpdate = (
    section: string,
    field: string,
    data: Partial<FieldData>
  ) => {
    const currentSection = sportsAndFitness[section];
    if (typeof currentSection === "object" && !Array.isArray(currentSection)) {
      const currentField = currentSection[field];
      if (typeof currentField === "object") {
        updateSportsAndFitness(section as keyof SportsAndFitness, field, {
          ...currentField,
          ...data,
        });
        toast({
          title: "Field Updated",
          description: `Successfully updated ${field}`,
          duration: 1500,
          variant: "success",
        });
      }
    }
  };

  const renderExerciseField = (
    section: string,
    field: string,
    data: FieldData
  ) => {
    const selectedImageKey = data.level?.toLowerCase();
    const imageUrl =
      customImages?.[selectedImageKey] || `/sports/${selectedImageKey}.png`;

    return (
      <Card
        key={field}
        className="border border-green-200 hover:border-green-300 transition-colors"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-green-800 truncate">
              {field.replace(/_/g, " ").toUpperCase()}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteField(field)}
              className="text-red-600 hover:bg-red-100 hover:text-red-700 flex-shrink-0 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">
              Image Type
            </Label>
            <Select
              value={data.level}
              onValueChange={(value) =>
                handleFieldUpdate(section, field, { level: value })
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>

              <SelectContent>
                {Object.keys(customImages).map((option) => {
                  const cleanLabel = option
                    .replace(/^\d+-/, "")
                    .replace(/\.png$/i, "");
                  const imagePath =
                    customImages[option.toLowerCase()] ||
                    `/sports/${cleanLabel.toLowerCase()}.png`;

                  return (
                    <SelectItem key={`image-${option}`} value={cleanLabel}>
                      <div className="flex items-center space-x-2 gap-9">
                        <img
                          src={imagePath}
                          alt={cleanLabel}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <span>{cleanLabel.toUpperCase()}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">
              Description
            </Label>
            <Input
              value={data.description}
              onChange={(e) =>
                handleFieldUpdate(section, field, {
                  description: e.target.value,
                })
              }
              className="text-xs resize-none"
              placeholder="Enter description..."
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const getSectionTitle = (section: string) =>
    section.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  const getSectionIcon = (section: string) => {
    if (section.toLowerCase().includes("performance")) return "";
    if (section.toLowerCase().includes("exercise")) return "";
    if (section.toLowerCase().includes("cardio")) return "";
    if (section.toLowerCase().includes("strength")) return "";
    return "";
  };

  const categories = getCategories();

  return (
    <div className="w-full rounded-lg max-w-8xl mx-auto">
      <Card className="shadow-lg border-0 bg-white">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 sm:p-6">
          <CardTitle className="text-base sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
            Sports & Fitness
          </CardTitle>
        </CardHeader>

        <div className="text-end mt-4">
          <Button onClick={onSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid gap-4 mb-8">
            <div>
              <label className="block font-semibold text-sm mb-1">Quote</label>
              <Input
                value={sportsAndFitness.quote || ""}
                onChange={(e) =>
                  updateSportsAndFitness("quote", "", e.target.value)
                }
                placeholder="Enter a motivational quote related to fitness"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm mb-1">
                Description
              </label>
              <Input
                value={sportsAndFitness.description || ""}
                onChange={(e) =>
                  updateSportsAndFitness("description", "", e.target.value)
                }
                placeholder="Provide a short description of the Sports & Fitness section"
              />
            </div>
          </div>

          {/* Category Navigation */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Category Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((section) => (
                  <div key={section} className="relative">
                    <Button
                      variant={
                        activeSection === section ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveSection(section)}
                      className="flex items-center gap-2 pr-8 text-xs sm:text-sm w-full"
                    >
                      <span>{getSectionIcon(section)}</span>
                      <span className="capitalize hidden sm:inline">
                        {section.replace(/([A-Z_])/g, " $1").trim()}
                      </span>
                      <span className="capitalize sm:hidden">
                        {section.slice(0, 8)}...
                      </span>
                    </Button>

                    <button
                      onClick={() => deleteCategory(section)}
                      className="absolute -right-1 -top-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Delete Category"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Category */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="w-full sm:w-52 h-9 text-sm"
                />
                <Button size="sm" onClick={addNewCategory} className="h-9">
                  <Plus className="h-4 w-4 mr-1" /> Add Category
                </Button>
              </div>
            </div>

            {/* Field Management */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Input
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value.toUpperCase())}
                placeholder="New field name"
                className="w-full sm:w-64 h-9 text-sm"
                disabled={!activeSection}
              />
              <Button
                size="sm"
                onClick={addNewField}
                className="h-9 w-full sm:w-auto"
                disabled={!activeSection}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
            </div>

            {/* Custom Image Management */}
            <div className="rounded-lg justify-start">
              <div className="flex items-center mb-3">
                <h4 className="text-sm font-medium mr-3 text-gray-700">
                  Custom Images
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowImageForm(!showImageForm)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4" />
                  {showImageForm ? "Hide" : "Add Image"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowImageViewer(true)}
                  className="h-8 m-3"
                >
                  View Images
                </Button>
              </div>

              {showImageForm && (
                <form
                  onSubmit={handleImageUpload}
                  encType="multipart/form-data"
                  className="flex flex-col sm:flex-row gap-2 items-center"
                >
                  <Input
                    type="text"
                    name="imageLabel"
                    value={imageLabel}
                    onChange={(e) =>
                      setImageLabel(e.target.value.toUpperCase())
                    }
                    placeholder="Image Name (e.g. dumbbell)"
                    className="w-full sm:w-40 h-9 text-sm"
                    required
                  />

                  <Input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    className="w-full sm:flex-1 h-9 text-sm"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {activeSection && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base sm:text-lg font-medium text-gray-700 border-l-4 border-green-400 pl-3">
                    {getSectionTitle(activeSection)}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {sportsAndFitness[activeSection] &&
                    typeof sportsAndFitness[activeSection] === "object" &&
                    !Array.isArray(sportsAndFitness[activeSection])
                      ? Object.keys(sportsAndFitness[activeSection]).length
                      : 0}{" "}
                    items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sportsAndFitness[activeSection] &&
                    typeof sportsAndFitness[activeSection] === "object" &&
                    !Array.isArray(sportsAndFitness[activeSection]) &&
                    Object.entries(sportsAndFitness[activeSection]).map(
                      ([fieldKey, fieldData]) => {
                        if (
                          typeof fieldData === "object" &&
                          "level" in fieldData &&
                          "description" in fieldData
                        ) {
                          return renderExerciseField(
                            activeSection,
                            fieldKey,
                            fieldData
                          );
                        }
                        return null;
                      }
                    )}
                </div>
              </div>
            )}

            {(!activeSection ||
              !sportsAndFitness[activeSection] ||
              typeof sportsAndFitness[activeSection] !== "object" ||
              Array.isArray(sportsAndFitness[activeSection]) ||
              Object.keys(sportsAndFitness[activeSection]).length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-lg font-medium mb-2">No fields available</p>
                <p className="text-sm">
                  {!activeSection
                    ? "Select a category or add one to get started"
                    : "Add some fields to get started"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uploaded Custom Images</DialogTitle>
          </DialogHeader>

          {Object.entries(customImages).length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No images uploaded.
            </div>
          ) : (
            <ul className="space-y-3 mt-4">
              {Object.entries(customImages).map(([label, url]) => (
                <li
                  key={label}
                  className="flex items-center justify-between bg-gray-50 border rounded p-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={url}
                      alt={label}
                      className="w-12 h-12 rounded object-cover border"
                    />
                    <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                      {label}
                    </span>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const confirm = window.confirm(
                        `Delete image "${label}"?`
                      );
                      if (!confirm) return;

                      const fileName = url.split("/").pop();
                      try {
                        const res = await fetch(
                          `/api/sports-images?file=${fileName}`,
                          {
                            method: "DELETE",
                          }
                        );
                        const result = await res.json();

                        if (result.success) {
                          const updated = { ...customImages };
                          delete updated[label];
                          setCustomImages(updated);

                          updateSportsAndFitness("customImages" as any, label, {
                            label,
                            url: "",
                          });

                          toast({
                            title: "Image Deleted",
                            description: `Successfully deleted image "${label}"`,
                            duration: 1500,
                            variant: "success",
                          });
                        } else {
                          toast({
                            title: "Delete Failed",
                            description:
                              result.error || "Failed to delete image",
                            variant: "destructive",
                            duration: 1500,
                          });
                        }
                      } catch (err) {
                        console.error("Deletion error", err);
                        toast({
                          title: "Delete Error",
                          description: "Error occurred while deleting image",
                          variant: "destructive",
                          duration: 1500,
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.type !== null}
        onOpenChange={() => setDeleteConfirm({ type: null, target: "" })}
      >
        <AlertDialogContent className="w-[90%] rounded-md max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg md:text-xl">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base leading-relaxed">
              {deleteConfirm.type === "category" ? (
                <>
                  Are you sure you want to delete the category{" "}
                  <span className="text-red-600 font-medium">
                    {deleteConfirm.target}
                  </span>
                  ? This action cannot be undone and will remove all fields
                  within this category.
                </>
              ) : (
                <>
                  Are you sure you want to delete the field{" "}
                  <span className="text-red-600 font-medium">
                    {deleteConfirm.target}
                  </span>
                  ? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
