"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { AllergiesAndSensitivity, AllergyEntry } from "@/types/report-types";
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
} from "@/components/ui/alert-dialog";


interface Notification {
  type: "success" | "error";
  message: string;
  show: boolean;
}

export default function AllergiesSensitivityAdmin({
  allergiesAndSensitivity,
  updateAllergiesAndSensitivity,
  onSave,
  onReset,
}: AllergiesSensitivityAdminProps) {
  const [quote, setQuote] = useState(allergiesAndSensitivity.quote || "");
  const [description, setDescription] = useState(
    allergiesAndSensitivity.description || ""
  );
  const [generalAdvice, setGeneralAdvice] = useState(
    allergiesAndSensitivity.generalAdvice || ""
  );
  const [entries, setEntries] = useState<Record<string, AllergyEntry>>(
    allergiesAndSensitivity.data || {}
  );
  const [newTitle, setNewTitle] = useState("");
  const [images, setImages] = useState<Record<string, string>>({});
  const [imageLabel, setImageLabel] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImageField, setSelectedImageField] = useState<string | null>(
    null
  );

  // New state for confirmations and notifications
  const [deleteDialog, setDeleteDialog] = useState({
    show: false,
    key: "",
    title: "",
  });

  const [imageDeleteDialog, setImageDeleteDialog] = useState<{
    show: boolean;
    label: string;
    filename: string;
  }>({ show: false, label: "", filename: "" });

  const [notification, setNotification] = useState<Notification>({
    type: "success",
    message: "",
    show: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    updateAllergiesAndSensitivity({
      quote,
      description,
      generalAdvice,
      data: entries,
    });
  }, [quote, description, generalAdvice, entries]);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/allergies-image");
      const json = await res.json();
      if (json.success) {
        const map: Record<string, string> = {};
        for (const img of json.images) {
          map[img.label] = img.url;
        }
        setImages(map);
      }
    };
    fetchImages();
  }, []);

  // Show notification function
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleUploadImage = async () => {
    if (!imageLabel.trim() || !imageFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append(
        "label",
        imageLabel.trim().toLowerCase().replace(/\s+/g, "_")
      );
      formData.append("folder", "allergies");

      const res = await fetch("/api/allergies-image", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setImages((prev) => ({ ...prev, [json.label]: json.url }));
        setImageLabel("");
        setImageFile(null);
        showNotification("success", "Image uploaded successfully!");
      } else {
        showNotification("error", json.message || "Failed to upload image");
      }
    } catch (error) {
      showNotification("error", "An error occurred while uploading the image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFieldChange = (
    key: string,
    field: keyof AllergyEntry,
    value: string
  ) => {
    const updated = {
      ...entries,
      [key]: {
        ...entries[key],
        [field]: value,
      },
    };
    setEntries(updated);
  };

  const handleAddEntry = () => {
    if (!newTitle.trim()) return;
    const newKey = `entry_${Date.now()}`;
    setEntries({
      ...entries,
      [newKey]: { title: newTitle.trim(), image: "" },
    });
    setNewTitle("");
    showNotification("success", "New allergy entry added successfully!");
  };

  const handleDeleteClick = (key: string, title: string) => {
    setDeleteDialog({ show: true, key, title });
  };

  const handleDeleteConfirm = () => {
    const updated = { ...entries };
    delete updated[deleteDialog.key];
    setEntries(updated);
    updateAllergiesAndSensitivity({
      data: updated,
      quote,
      description,
      generalAdvice,
    });
    setDeleteDialog({ show: false, key: "", title: "" });
    showNotification("success", "Allergy entry deleted successfully!");
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 ">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Notification Toast */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
              notification.type === "success"
                ? "bg-gray-800 text-white border border-gray-600"
                : "bg-gray-900 text-white border border-gray-700"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
              className="ml-2 hover:bg-white/20 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <Card className="shadow-xl border border-gray-300">
          <CardHeader className=" bg-zinc-600 text-white rounded-lg p-4 sm:p-5">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
              Allergies & Sensitivity Management
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="text-end my-4">
          <Button onClick={handleSave}>
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Quote & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
          <Card className="shadow-lg border border-gray-300 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-gray-300 to-gray-400 text-black rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-2">
                Content Settings
              </CardTitle>
            </CardHeader>
            <Label className="text-sm font-medium px-6">Quote</Label>
            <CardContent className="p-6 bg-white">
              <Input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="e.g. 'Allergies are not your destiny, they're just a part of your journey...'"
                className="resize-none border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800"
              />
            </CardContent>
            <Label className="text-sm font-medium px-6">Description</Label>
            <CardContent className="p-6 bg-white rounded-lg">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive description for the allergies section..."
                className="resize-none border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800"
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-300 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-gray-300 to-pink-200 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-2">
                Upload New Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Image Label
                  </Label>
                  <Input
                    placeholder="e.g. peanut_allergy"
                    value={imageLabel}
                    onChange={(e) => setImageLabel(e.target.value)}
                    className="border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Select File
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800"
                  />
                </div>
                <Button
                  onClick={handleUploadImage}
                  disabled={!imageLabel || !imageFile || isUploading}
                  className="bg-gray-800 hover:bg-black text-white font-semibold py-3"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowImageModal(true)}
                  className="text-gray-700 border-gray-400 hover:bg-gray-100"
                >
                  View Uploaded Images
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Allergy Entry */}
        <Card className="shadow-lg border border-gray-300 hover:shadow-xl transition-shadow m-4">
          <CardHeader className="bg-gradient-to-r from-pink-300 to-pink-400 text-white rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              Add New Allergy Entry
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 rounded-lg bg-white">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end rounded-lg">
              {/* Input Field */}
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Allergy Title
                </Label>
                <Input
                  placeholder="e.g. Peanut Allergy, Dust Mites, etc."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                  className="border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800"
                />
              </div>

              {/* Button */}
              <Button
                onClick={handleAddEntry}
                disabled={!newTitle.trim()}
                className="w-full sm:w-auto bg-gray-800 hover:bg-black text-white font-semibold py-3 sm:px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Allergy Entries */}
        {Object.keys(entries).length > 0 && (
          <div className="rounded-lg shadow-lg border border-gray-300 hover:shadow-xl transition-shadow p-4 m-4 sm:p-6 bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              Allergy Entries ({Object.keys(entries).length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ">
              {Object.entries(entries).map(([key, entry], idx) => (
                <Card
                  key={key}
                  className="shadow-lg border border-gray-300 hover:shadow-xl "
                >
                  <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold">
                        {entry.title || `Allergy ${idx + 1}`}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => handleDeleteClick(key, entry.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 bg-white rounded-lg">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Title
                      </Label>
                      <Input
                        value={entry.title}
                        onChange={(e) =>
                          handleFieldChange(key, "title", e.target.value)
                        }
                        className="border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Associated Image
                      </Label>
                      <Select
                        value={entry.image}
                        onValueChange={(val) =>
                          handleFieldChange(key, "image", val)
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800">
                          <SelectValue placeholder="Choose an image" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300">
                          {Object.entries(images).map(([label, url]) => (
                            <SelectItem
                              key={label}
                              value={label}
                              className="hover:bg-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                <Image
                                  src={url}
                                  alt={label}
                                  width={24}
                                  height={24}
                                  className="rounded"
                                />
                                <span className="capitalize text-gray-800">
                                  {label.replace(/_/g, " ")}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* General Advice */}
        <Card className="shadow-lg border border-gray-300 hover:shadow-xl transition-shadow m-4">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-black text-white rounded-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              General Advice & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <Textarea
              rows={6}
              value={generalAdvice}
              onChange={(e) => setGeneralAdvice(e.target.value)}
              placeholder="Enter comprehensive guidance for allergy management, prevention tips, emergency procedures, etc..."
              className="min-h-[160px] resize-none border-2 border-gray-300 focus:border-gray-500 bg-white text-gray-800"
            />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.show}
          onOpenChange={(open) =>
            !open && setDeleteDialog({ show: false, key: "", title: "" })
          }
        >
          <AlertDialogContent className="max-w-md bg-white border border-gray-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                <Trash2 className="w-5 h-5" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete the allergy entry "
                {deleteDialog.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-semibold border-gray-300 text-gray-700 hover:bg-gray-100">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-gray-800 hover:bg-black text-white font-semibold"
              >
                Delete Entry
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={imageDeleteDialog.show}
          onOpenChange={(open) =>
            !open &&
            setImageDeleteDialog({ show: false, label: "", filename: "" })
          }
        >
          <AlertDialogContent className="max-w-md bg-white border border-gray-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                <Trash2 className="w-5 h-5" />
                Delete Image: {imageDeleteDialog.label.replace(/_/g, " ")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete this image? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-semibold border-gray-300 text-gray-700 hover:bg-gray-100">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    const res = await fetch("/api/allergies-image", {
                      method: "DELETE",
                      body: JSON.stringify({
                        filename: imageDeleteDialog.filename,
                      }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    const json = await res.json();
                    if (json.success) {
                      const updated = { ...images };
                      delete updated[imageDeleteDialog.label];
                      setImages(updated);
                      showNotification(
                        "success",
                        "Image deleted successfully!"
                      );
                    } else {
                      showNotification(
                        "error",
                        json.error || "Failed to delete image"
                      );
                    }
                  } catch (err) {
                    console.error("Error deleting image:", err);
                    showNotification("error", "Error deleting image");
                  } finally {
                    setImageDeleteDialog({
                      show: false,
                      label: "",
                      filename: "",
                    });
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Image List Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 ">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-gray-100 to-pink-100">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Uploaded Allergy Images
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-3">
                  {Object.entries(images).map(([label, url]) => {
                    const filename = url.split("/").pop()!;
                    return (
                      <div
                        key={label}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border px-4 py-3 rounded-md hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                          <Image
                            src={url}
                            alt={label}
                            width={50}
                            height={50}
                            className="rounded-md object-cover flex-shrink-0"
                          />
                          <span className="capitalize text-sm text-gray-700 truncate w-full">
                            {label.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="flex justify-end sm:justify-start">
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                              setImageDeleteDialog({
                                show: true,
                                label,
                                filename,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
