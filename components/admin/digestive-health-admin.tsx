"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, RotateCcw, Eye, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type {
  DigestiveHealth,
  DigestiveHealthEntry,
} from "@/types/report-types";

interface DigestiveHealthAdminProps {
  digestiveHealth: DigestiveHealth;
  updateField: (key: string, data: Partial<DigestiveHealthEntry>) => void;
  addField: (key: string) => void;
  deleteField: (key: string) => void;
  updateQuoteAndDescription: (quote: string, description: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function DigestiveHealthAdmin({
  digestiveHealth,
  updateField,
  addField,
  deleteField,
  updateQuoteAndDescription,
  onSave,
  onReset,
}: DigestiveHealthAdminProps) {
  const [newFieldName, setNewFieldName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [showImageForm, setShowImageForm] = useState(false);
  const [imageLabel, setImageLabel] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImageList, setShowImageList] = useState(false);

  // Image preview for file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
      setSelectedFile(null);
    }
  };

  const clearImagePreview = () => {
    setImagePreview("");
    setSelectedFile(null);
    setImageLabel("");
  };

  // Fetch image list from /api/digestive-images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/digestive-images");
        const data = await res.json();
        if (data.success) {
          const imageMap: Record<string, string> = {};
          data.images.forEach((img: { label: string; url: string }) => {
            imageMap[img.label.toLowerCase()] = img.url;
          });
          setCustomImages(imageMap);
        }
      } catch (err) {
        console.error("Failed to load digestive images", err);
      }
    };
    fetchImages();
  }, []);

  const handleQuoteChange = (quote: string) =>
    updateQuoteAndDescription(quote, digestiveHealth.description);

  const handleDescriptionChange = (desc: string) =>
    updateQuoteAndDescription(digestiveHealth.quote, desc);

  const handleAddNewField = () => {
    const key = newFieldName.trim();
    if (!key || digestiveHealth.data[key]) return;
    addField(key);
    setNewFieldName("");
  };

  const handleDeleteFieldConfirm = () => {
    if (deleteKey) deleteField(deleteKey);
    setShowDeleteModal(false);
    setDeleteKey(null);
  };

  const handleImageUpload = async () => {
    const label = imageLabel.trim().toLowerCase();
    const file = selectedFile;

    if (!file || !label) {
      alert("Both label and file required");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "digestive");
    uploadData.append("label", label);

    try {
      const response = await fetch("/api/digestive-images", {
        method: "POST",
        body: uploadData,
      });
      const result = await response.json();

      if (result.success) {
        setCustomImages((prev) => ({
          ...prev,
          [label]: result.url,
        }));
        clearImagePreview();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload error");
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 sm:p-5">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
            Digestive Health
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="text-end mt4">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote & Description Card */}
        <Card className="shadow-md">
          <CardContent className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quote</Label>
              <Input
                value={digestiveHealth.quote}
                onChange={(e) => handleQuoteChange(e.target.value)}
                placeholder="Enter inspirational quote..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Input
                value={digestiveHealth.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Enter description..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-800">
              Image Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 col-span-2">
            <Button
              variant="outline"
              onClick={() => setShowImageForm(!showImageForm)}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {showImageForm ? "Hide Upload Form" : "Upload New Image"}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-black text-white"
                >
                  Available Images
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Uploaded Images</DialogTitle>
                  <DialogDescription>
                    Click the trash icon to delete an image. This action is
                    irreversible.
                  </DialogDescription>
                </DialogHeader>

                <div className="divide-y divide-gray-200 mt-4">
                  {Object.entries(customImages).map(([label, url]) => {
                    const fileName = url.split("/").pop();

                    return (
                      <div
                        key={label}
                        className="flex items-center justify-between py-3 gap-4"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <Image
                            src={url}
                            alt={label}
                            width={48}
                            height={48}
                            className="rounded border object-cover w-12 h-12"
                          />
                          <div className="text-sm font-medium truncate">
                            {label}
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={async () => {
                            if (!fileName) return;

                            const confirmed = confirm(
                              `Are you sure you want to delete "${fileName}"?`
                            );
                            if (!confirmed) return;

                            try {
                              const res = await fetch("/api/digestive-images", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ file: fileName }),
                              });

                              const result = await res.json();
                              if (result.success) {
                                const updated = { ...customImages };
                                delete updated[label];
                                setCustomImages(updated);
                              } else {
                                alert("Delete failed");
                              }
                            } catch (err) {
                              console.error("Failed to delete image", err);
                              alert("Delete failed");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* <div className="mt-4 text-right">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </div> */}
              </DialogContent>
            </Dialog>

            {showImageForm && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Image Label</Label>
                  <Input
                    type="text"
                    placeholder="e.g. gut, stomach, liver"
                    value={imageLabel}
                    onChange={(e) => setImageLabel(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {imagePreview && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="relative inline-block">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={120}
                        height={120}
                        className="rounded-lg border-2 border-gray-200 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={clearImagePreview}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex w-fit gap-2">
                  <Button onClick={handleImageUpload} className="flex-1">
                    Upload Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add New Condition Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800">
            Add New Condition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g., Gut Health, Digestion, Metabolism"
                className="w-full"
              />
            </div>
            <Button
              onClick={handleAddNewField}
              className="bg-red-600 hover:bg-red-700 sm:w-auto w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl text-gray-800">
            Conditions Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View - Hidden on mobile and tablet */}
          <div className="hidden xl:block overflow-x-auto">
            <div className="grid grid-cols-11 bg-red-500 rounded text-white text-sm font-semibold">
              <div className="col-span-2 text-center p-3">Title</div>
              <div className="col-span-2 text-center p-3">Icon</div>
              <div className="col-span-2 text-center p-3">Sensitivity</div>
              <div className="col-span-2 text-center p-3">Low</div>
              <div className="col-span-2 text-center p-3">High</div>
              <div className="col-span-1 text-center p-3">Actions</div>
            </div>

            {Object.entries(digestiveHealth.data).map(([key, entry]) => {
              const iconUrl = customImages[entry.icon?.toLowerCase() || ""];

              return (
                <div
                  key={key}
                  className="grid grid-cols-11 gap-3 items-center border-b border-gray-200 p-3 hover:bg-gray-50"
                >
                  {/* Title */}
                  <div className="col-span-2">
                    <Input
                      value={entry.title}
                      onChange={(e) =>
                        updateField(key, { title: e.target.value })
                      }
                      className="border-gray-200 focus:border-red-300"
                    />
                  </div>

                  {/* Icon */}
                  <div className="col-span-2">
                    <Select
                      value={entry.icon}
                      onValueChange={(val) => updateField(key, { icon: val })}
                    >
                      <SelectTrigger className="text-xs h-9 border-gray-200 focus:border-red-300">
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(customImages).map(
                          ([imgKey, imgUrl]) => (
                            <SelectItem key={imgKey} value={imgKey}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={imgUrl}
                                  alt={imgKey}
                                  width={20}
                                  height={20}
                                  className="rounded object-cover"
                                />
                                <span>{imgKey.toUpperCase()}</span>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sensitivity */}
                  <div className="col-span-2">
                    <Select
                      value={entry.sensitivity}
                      onValueChange={(val) =>
                        updateField(key, { sensitivity: val as "Low" | "High" })
                      }
                    >
                      <SelectTrigger className="text-xs h-9 border-gray-200 focus:border-red-300">
                        <SelectValue placeholder="Select sensitivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Good Textarea */}
                  <div className="col-span-2">
                    <Input
                      value={entry.good}
                      onChange={(e) =>
                        updateField(key, { good: e.target.value })
                      }
                      className="border-gray-200 focus:border-red-300 resize-none"
                      placeholder="Good factors..."
                    />
                  </div>

                  {/* Bad Textarea */}
                  <div className="col-span-2">
                    <Input
                      value={entry.bad}
                      onChange={(e) =>
                        updateField(key, { bad: e.target.value })
                      }
                      className="border-gray-200 focus:border-red-300 resize-none"
                      placeholder="Bad factors..."
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 bg-red-500 text-white"
                      onClick={() => {
                        setDeleteKey(key);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet List View */}
          <div className="hidden md:block xl:hidden">
            <div className="bg-red-500 text-white p-4 text-sm font-semibold">
              Conditions Management
            </div>
            <div className="space-y-3 p-4">
              {Object.entries(digestiveHealth.data).map(([key, entry]) => {
                const iconUrl = customImages[entry.icon?.toLowerCase() || ""];

                return (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 relative"
                  >
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 w-8 h-8 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setDeleteKey(key);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-4 pr-10">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">
                            Title
                          </Label>
                          <Input
                            value={entry.title}
                            onChange={(e) =>
                              updateField(key, { title: e.target.value })
                            }
                            className="border-gray-200 focus:border-red-300"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">
                            Icon
                          </Label>
                          <div className="flex items-center gap-3">
                            {iconUrl && (
                              <Image
                                src={iconUrl}
                                alt="Icon"
                                width={40}
                                height={40}
                                className="rounded border border-gray-200 object-cover"
                              />
                            )}
                            <Select
                              value={entry.icon}
                              onValueChange={(val) =>
                                updateField(key, { icon: val })
                              }
                            >
                              <SelectTrigger className="border-gray-200 focus:border-red-300">
                                <SelectValue placeholder="Select icon" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(customImages).map(
                                  ([imgKey, imgUrl]) => (
                                    <SelectItem key={imgKey} value={imgKey}>
                                      <div className="flex items-center gap-2">
                                        <Image
                                          src={imgUrl}
                                          alt={imgKey}
                                          width={20}
                                          height={20}
                                          className="rounded object-cover"
                                        />
                                        <span>{imgKey.toUpperCase()}</span>
                                      </div>
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">
                            Sensitivity
                          </Label>
                          <Select
                            value={entry.sensitivity}
                            onValueChange={(val) =>
                              updateField(key, {
                                sensitivity: val as "Low" | "High",
                              })
                            }
                          >
                            <SelectTrigger className="border-gray-200 focus:border-red-300">
                              <SelectValue placeholder="Select sensitivity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-green-700 mb-1 block">
                            Good Factors
                          </Label>
                          <Textarea
                            value={entry.good}
                            onChange={(e) =>
                              updateField(key, { good: e.target.value })
                            }
                            rows={3}
                            className="border-gray-200 focus:border-green-300 resize-none"
                            placeholder="Enter good factors..."
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-red-700 mb-1 block">
                            Bad Factors
                          </Label>
                          <Textarea
                            value={entry.bad}
                            onChange={(e) =>
                              updateField(key, { bad: e.target.value })
                            }
                            rows={3}
                            className="border-gray-200 focus:border-red-300 resize-none"
                            placeholder="Enter bad factors..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-3 sm:p-4">
            {Object.entries(digestiveHealth.data).map(([key, entry]) => {
              const iconUrl = customImages[entry.icon?.toLowerCase() || ""];

              return (
                <Card
                  key={key}
                  className="border border-gray-200 shadow-sm relative"
                >
                  <CardContent className="p-4 space-y-4 ">
                    {/* Icon Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 bg-red-500 right-2 w-8 h-8 text-white z-10"
                        onClick={() => {
                          setDeleteKey(key);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="flex-shrink-0">
                        {iconUrl ? (
                          <Image
                            src={iconUrl}
                            alt="Icon"
                            width={100}
                            height={50}
                            className="rounded-lg text-center object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-400">
                              No Icon
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full sm:w-auto">
                        <Label className="text-sm font-medium text-gray-700">
                          Icon Selection
                        </Label>
                        <Select
                          value={entry.icon}
                          onValueChange={(val) =>
                            updateField(key, { icon: val })
                          }
                        >
                          <SelectTrigger className="mt-1 border-gray-200 focus:border-red-300">
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(customImages).map(
                              ([imgKey, imgUrl]) => (
                                <SelectItem key={imgKey} value={imgKey}>
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src={imgUrl}
                                      alt={imgKey}
                                      width={20}
                                      height={20}
                                      className="rounded object-cover"
                                    />
                                    <span>{imgKey.toUpperCase()}</span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Title & Sensitivity */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Title
                        </Label>
                        <Input
                          value={entry.title}
                          onChange={(e) =>
                            updateField(key, { title: e.target.value })
                          }
                          className="border-gray-200 focus:border-red-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Sensitivity
                        </Label>
                        <Select
                          value={entry.sensitivity}
                          onValueChange={(val) =>
                            updateField(key, {
                              sensitivity: val as "Low" | "High",
                            })
                          }
                        >
                          <SelectTrigger className="border-gray-200 focus:border-red-300">
                            <SelectValue placeholder="Select sensitivity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Good & Bad Factors */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-700">
                          Good Factors
                        </Label>
                        <Textarea
                          value={entry.good}
                          onChange={(e) =>
                            updateField(key, { good: e.target.value })
                          }
                          rows={3}
                          className="min-h-[80px] border-gray-200 focus:border-green-300 resize-none"
                          placeholder="Enter good factors..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-red-700">
                          Bad Factors
                        </Label>
                        <Textarea
                          value={entry.bad}
                          onChange={(e) =>
                            updateField(key, { bad: e.target.value })
                          }
                          rows={3}
                          className="min-h-[80px] border-gray-200 focus:border-red-300 resize-none"
                          placeholder="Enter bad factors..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteKey && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the condition{" "}
              <strong className="text-gray-900">"{deleteKey}"</strong>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteFieldConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
