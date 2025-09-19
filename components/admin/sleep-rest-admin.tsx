"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Plus, Upload, Trash2, X } from "lucide-react";
import Image from "next/image";
import { SleepAndRest } from "@/types/report-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SleepImage {
  label: string;
  url: string;
}

interface Props {
  data: SleepAndRest;
  updateData: (data: Partial<SleepAndRest>) => void;
  onSave: () => void;
  onReset: () => void;
}

interface SleepEntry {
  title: string;
  intervention: string;
  image: string;
}

export default function SleepRestAdmin({
  data,
  updateData,
  onSave,
  onReset,
}: Props) {
  const [quote, setQuote] = useState(data.quote || "");
  const [description, setDescription] = useState(data.description || "");
  const [entries, setEntries] = useState<Record<string, SleepEntry>>(
    data.data || {}
  );
  const [newEntryTitle, setNewEntryTitle] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageField, setSelectedImageField] = useState<string | null>(
    null
  );
  const [imageLabel, setImageLabel] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    updateData({ quote, description });
  }, [quote, description]);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/sleep-image");
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

  const handleUploadImage = async () => {
    if (!imageLabel.trim() || !imageFile) return;

    const customLabel = imageLabel.trim().toLowerCase();
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("label", customLabel);
    formData.append("folder", "sleep");

    const res = await fetch("/api/sleep-image", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (json.success) {
      // Use the custom label you provided, not what the API returns
      setImages((prev) => ({ ...prev, [customLabel]: json.url }));
      setImageLabel("");
      setImageFile(null);
    }
  };

  const handleFieldChange = (
    key: string,
    field: keyof SleepEntry,
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
    updateData({ data: updated });
  };

  const handleDeleteField = (key: string) => {
    const updated = { ...entries };
    delete updated[key];
    setEntries(updated);
    updateData({ data: updated });
  };

  const handleAddField = () => {
    const newKey = `entry_${Date.now()}`;
    const updated = {
      ...entries,
      [newKey]: {
        title: newEntryTitle.trim(),
        intervention: "",
        image: "",
      },
    };
    setEntries(updated);
    updateData({ data: updated });
    setNewEntryTitle("");
    setShowAddModal(false);
  };

  const handleImageUpload = async (file: File, key: string) => {
    const label = `entry_image_${Date.now()}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", label);
    formData.append("folder", "sleep");

    const res = await fetch("/api/sleep-image", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (json.success) {
      handleFieldChange(key, "image", json.label || label);
      setImages((prev) => ({ ...prev, [json.label || label]: json.url }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 ">
      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-lg p-4 sm:p-5">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
                Sleep & Rest Management
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="my-4 text-end">
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Content Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Content Management
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quote Section */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <CardTitle className="text-lg text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Inspirational Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Write a sleep-related inspirational quote..."
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>

            {/* Description Section */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <CardTitle className="text-lg text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Section Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a comprehensive description for the Sleep & Rest section..."
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Management Section */}
        {/* Image Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Image Management
          </h2>
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
              <CardTitle className="text-lg text-gray-700 flex items-center">
                <Upload className="w-5 h-5 mr-3 text-orange-500" />
                Upload New Image
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Image Label Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageLabel" className="text-sm font-medium">
                    Image Label
                  </Label>
                  <Input
                    id="imageLabel"
                    placeholder="e.g., sleep_cycle"
                    value={imageLabel}
                    onChange={(e) => setImageLabel(e.target.value)}
                  />
                </div>

                {/* Image File Picker */}
                <div className="space-y-2">
                  <Label htmlFor="imageFile" className="text-sm font-medium">
                    Select File
                  </Label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>

                <Button
                  onClick={handleUploadImage}
                  disabled={!imageLabel || !imageFile}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowImageModal(true)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  View Uploaded Images
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sleep Entries Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Sleep Entries
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {Object.keys(entries).length} entries
            </span>
          </div>

          {/* Add Entry Button */}
          <div className="mb-6  justify-end">
            <Button
              variant="outline"
              className="py-6 border-red-600"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-2" />
              Add Sleep Entry
            </Button>
          </div>

          {/* Entries Grid */}
          {Object.entries(entries).length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(entries).map(([key, entry], idx) => (
                <Card key={key} className=" border-black">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 ">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-700 line-clamp-2">
                          {entry.title || `Sleep Entry ${idx + 1}`}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Entry #{idx + 1}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                        onClick={() => handleDeleteField(key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`title-${key}`}
                        className="text-sm font-medium"
                      >
                        Title
                      </Label>
                      <Input
                        id={`title-${key}`}
                        value={entry.title}
                        onChange={(e) =>
                          handleFieldChange(key, "title", e.target.value)
                        }
                        placeholder="e.g. Sleep Cycle Disruption"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`image-${key}`}
                        className="text-sm font-medium"
                      >
                        Associated Image
                      </Label>
                      <Select
                        value={entry.image}
                        onValueChange={(val) =>
                          handleFieldChange(key, "image", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an image" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(images).map(([label, url]) => (
                            <SelectItem key={label} value={label}>
                              <div className="flex items-center gap-3">
                                <Image
                                  src={url}
                                  alt={label}
                                  width={24}
                                  height={24}
                                  className="rounded"
                                />
                                <span className="capitalize">
                                  {label.replace(/_/g, " ")}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`intervention-${key}`}
                        className="text-sm font-medium"
                      >
                        Intervention Advice
                      </Label>
                      <Input
                        id={`intervention-${key}`}
                        value={entry.intervention}
                        onChange={(e) =>
                          handleFieldChange(key, "intervention", e.target.value)
                        }
                        placeholder="Provide intervention advice..."
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-xl font-semibold text-gray-800">
                  Add New Sleep Entry
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="newEntryTitle"
                    className="text-sm font-medium"
                  >
                    Entry Title
                  </Label>
                  <Input
                    id="newEntryTitle"
                    placeholder="Enter title for the new entry"
                    value={newEntryTitle}
                    onChange={(e) => setNewEntryTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddField}
                  disabled={!newEntryTitle.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Entry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-xl font-semibold text-gray-800">
                  Select Sleep Image
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-3">
                {Object.entries(images).map(([label, url]) => {
                  const fileName = url.split("/").pop();

                  return (
                    <div
                      key={label}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border px-4 py-3 rounded-md hover:bg-gray-50 transition"
                    >
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => {
                          if (selectedImageField) {
                            handleFieldChange(
                              selectedImageField,
                              "image",
                              label
                            );
                            setShowImageModal(false);
                          }
                        }}
                      >
                        <Image
                          src={url}
                          alt={label}
                          width={50}
                          height={50}
                          className="rounded-md object-cover shrink-0"
                        />
                        <span className="capitalize text-sm text-gray-700 truncate">
                          {label.replace(/_/g, " ")}
                        </span>
                      </div>

                      <Button
                        size="icon"
                        variant="destructive"
                        className="shrink-0"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!fileName) return;

                          const confirmed = confirm(
                            `Delete image "${fileName}"?`
                          );
                          if (!confirmed) return;

                          try {
                            const res = await fetch(
                              `/api/sleep-image?file=${fileName}`,
                              {
                                method: "DELETE",
                              }
                            );

                            const json = await res.json();
                            if (json.success) {
                              const updated = { ...images };
                              delete updated[label];
                              setImages(updated);
                            } else {
                              alert("Delete failed");
                            }
                          } catch (err) {
                            console.error("Error deleting image:", err);
                            alert("Delete error");
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
