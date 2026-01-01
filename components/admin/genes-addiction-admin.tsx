"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Save, X, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GenesAndAddiction, AddictionEntry } from "@/types/report-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  data: GenesAndAddiction;
  updateData: (data: Partial<GenesAndAddiction>) => void;
  onSave: () => void;
  onReset: () => void;
}

interface AddictionImage {
  label: string;
  url: string;
}

export default function GenesAddictionAdmin({
  data,
  updateData,
  onSave,
  onReset,
}: Props) {
  const [quote, setQuote] = useState(data.quote || "");
  const [description, setDescription] = useState(data.description || "");
  const [fields, setFields] = useState<Record<string, AddictionEntry>>(
    data.data || {}
  );
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [labelIconLabel, setLabelIconLabel] = useState("");
  const [labelIconFile, setLabelIconFile] = useState<File | null>(null);
  const [sensitivityIconLabel, setSensitivityIconLabel] = useState("");
  const [sensitivityIconFile, setSensitivityIconFile] = useState<File | null>(
    null
  );
  const [labelIcons, setLabelIcons] = useState<Record<string, string>>({});
  const [sensitivityIcons, setSensitivityIcons] = useState<
    Record<string, string>
  >({});
  const [showIconsModal, setShowIconsModal] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/addiction-images");
        const json = await res.json();

        if (json.success && json.icons && json.sensitivities) {
          const labelMap: Record<string, string> = {};
          const sensitivityMap: Record<string, string> = {};

          for (const img of json.icons) {
            if (img.label && img.url) {
              labelMap[img.label.toLowerCase()] = img.url;
            }
          }

          for (const img of json.sensitivities) {
            if (img.label && img.url) {
              sensitivityMap[img.label.toLowerCase()] = img.url;
            }
          }

          setLabelIcons(labelMap);
          setSensitivityIcons(sensitivityMap);
        } else {
          console.warn("No images found in API response:", json);
        }
      } catch (err) {
        console.error("Failed to fetch addiction images:", err);
      }
    };

    fetchImages();
  }, []);

  const handleUploadIcon = async (type: "icon" | "sensitivityIcon") => {
    const label = type === "icon" ? labelIconLabel : sensitivityIconLabel;
    const file = type === "icon" ? labelIconFile : sensitivityIconFile;

    if (!label.trim() || !file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", label.trim().toLowerCase());
    formData.append(
      "folder",
      type === "icon" ? "addiction/icons" : "addiction/sensitivity"
    );

    const res = await fetch("/api/addiction-images", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (json.success) {
      if (type === "icon") {
        setLabelIcons((prev) => ({ ...prev, [json.label]: json.url }));
        setLabelIconFile(null);
        setLabelIconLabel("");
      } else {
        setSensitivityIcons((prev) => ({ ...prev, [json.label]: json.url }));
        setSensitivityIconFile(null);
        setSensitivityIconLabel("");
      }

      if (type === "icon") {
        setLabelIconFile(null);
        setLabelIconLabel("");
      } else {
        setSensitivityIconFile(null);
        setSensitivityIconLabel("");
      }
    }
  };

  const handleFieldChange = (
    key: string,
    field: keyof AddictionEntry,
    value: string
  ) => {
    const updated = {
      ...fields,
      [key]: {
        ...fields[key],
        [field]: value,
      },
    };
    setFields(updated);
    updateData({ data: updated });
  };

  const handleDeleteField = (key: string) => {
    const updated = { ...fields };
    delete updated[key];
    setFields(updated);
    updateData({ data: updated });
  };

  const handleAddField = () => {
    setShowAddEntryModal(true);
  };

  const confirmAddField = () => {
    if (!newEntryTitle.trim()) return;

    const newKey = `entry_${Date.now()}`;
    const updated = {
      ...fields,
      [newKey]: {
        title: newEntryTitle.trim(),
        icon: "",
        sensitivity: "Medium",
      },
    };
    setFields(updated);
    updateData({ data: updated });
    setNewEntryTitle("");
    setShowAddEntryModal(false);
  };

  useEffect(() => {
    updateData({ quote, description });
  }, [quote, description]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white rounded-lg p-4 sm:p-5">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
              Genes & Addiction Management
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="text-end mt-4">
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
          {/* Left Column - Content Settings */}
          <div className="xl:col-span-3 space-y-6">
            {/* Content Settings */}
            <Card className="shadow-md border-0 h-fit">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  Content Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Inspirational Quote
                  </Label>
                  <Textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Enter an inspiring quote about overcoming addiction..."
                    className="min-h-[100px] resize-none border-gray-200 focus:border-red-300 focus:ring-red-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Section Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a detailed description of the genes and addiction section..."
                    className="min-h-[120px] resize-none border-gray-200 focus:border-red-300 focus:ring-red-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add New Entry Section */}
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleAddField}
                    className="border-2 border-dashed border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-8 py-3 h-auto"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Addiction Entry
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Create a new addiction entry with custom icons and details
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image Management */}
          <div className="xl:col-span-3">
            <Card className="shadow-md border-0 sticky top-6 h-fit">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-600" />
                  Image Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Label Icon Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Label Icons
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Label (e.g., alcohol)"
                      value={labelIconLabel}
                      onChange={(e) => setLabelIconLabel(e.target.value)}
                      className="text-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setLabelIconFile(e.target.files?.[0] || null)
                      }
                      className="text-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                    <Button
                      onClick={() => handleUploadIcon("icon")}
                      className="bg-red-600 hover:bg-red-700 text-white w-full shadow-sm"
                      disabled={!labelIconLabel.trim() || !labelIconFile}
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Icon
                    </Button>
                  </div>
                </div>

                {/* Sensitivity Icon Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Sensitivity Icons
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Label (e.g., high_sensitivity)"
                      value={sensitivityIconLabel}
                      onChange={(e) => setSensitivityIconLabel(e.target.value)}
                      className="text-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSensitivityIconFile(e.target.files?.[0] || null)
                      }
                      className="text-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                    <Button
                      onClick={() => handleUploadIcon("sensitivityIcon")}
                      className="bg-red-600 hover:bg-red-700 text-white w-full shadow-sm"
                      disabled={
                        !sensitivityIconLabel.trim() || !sensitivityIconFile
                      }
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Icon
                    </Button>
                  </div>
                </div>

                {/* Available Icons Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Available Icons
                      </Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIconsModal(true)}
                      className="text-xs px-3 py-1 h-auto border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      View All (
                      {Object.keys(labelIcons).length +
                        Object.keys(sensitivityIcons).length}
                      )
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Addiction Entries Section */}
        <div className="space-y-6">
          {Object.entries(fields).length === 0 ? (
            <Card className="shadow-md border-0">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-gray-300 mb-6">
                  <div className="w-20 h-20 border-4 border-dashed border-gray-200 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No addiction entries yet
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-md">
                  Start building your addiction management content by adding
                  your first entry above
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Addiction Entries
                </h3>
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  {Object.entries(fields).length} entries
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(fields).map(([key, value], index) => (
                  <Card
                    key={key}
                    className="shadow-md border-0 border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 hover:border-l-red-600"
                  >
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-800">
                              {value.title || "Untitled Entry"}
                            </CardTitle>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteField(key)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Title Field */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Entry Title
                          </Label>
                          <Input
                            value={value.title}
                            onChange={(e) =>
                              handleFieldChange(key, "title", e.target.value)
                            }
                            placeholder="Enter addiction title (e.g., Alcohol Sensitivity)"
                            className="text-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
                          />
                        </div>

                        {/* Icon Selectors */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                              Label Icon
                            </Label>
                            <Select
                              value={value.icon}
                              onValueChange={(val) =>
                                handleFieldChange(key, "icon", val)
                              }
                            >
                              <SelectTrigger className="text-sm border-gray-200 focus:border-red-300 focus:ring-red-200">
                                <SelectValue placeholder="Choose an icon" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(labelIcons).map(
                                  ([label, url]) => (
                                    <SelectItem key={label} value={label}>
                                      <div className="flex items-center gap-3">
                                        <Image
                                          src={url}
                                          alt={label}
                                          width={24}
                                          height={24}
                                          className="rounded"
                                        />
                                        <span className="capitalize font-medium">
                                          {label.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                              Sensitivity Icon
                            </Label>
                            <Select
                              value={value.sensitivityIcon}
                              onValueChange={(val) =>
                                handleFieldChange(key, "sensitivityIcon", val)
                              }
                            >
                              <SelectTrigger className="text-sm border-gray-200 focus:border-red-300 focus:ring-red-200">
                                <SelectValue placeholder="Choose sensitivity level" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(sensitivityIcons).map(
                                  ([label, url]) => (
                                    <SelectItem key={label} value={label}>
                                      <div className="flex items-center gap-3">
                                        <Image
                                          src={url}
                                          alt={label}
                                          width={24}
                                          height={24}
                                          className="rounded"
                                        />
                                        <span className="capitalize font-medium">
                                          {label.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Entry Modal */}
        {showAddEntryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Add New Addiction Entry
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddEntryModal(false);
                    setNewEntryTitle("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Entry Title *
                    </Label>
                    <Input
                      value={newEntryTitle}
                      onChange={(e) => setNewEntryTitle(e.target.value)}
                      placeholder="Enter addiction title (e.g., Alcohol Sensitivity)"
                      className="border-gray-200 focus:border-red-300 focus:ring-red-200"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newEntryTitle.trim()) {
                          confirmAddField();
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    You can configure icons and other settings after creating
                    the entry.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddEntryModal(false);
                    setNewEntryTitle("");
                  }}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAddField}
                  disabled={!newEntryTitle.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Entry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Icons Modal */}
        {showIconsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Available Icons
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIconsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="space-y-8">
                  <div className="space-y-6">
                    {/* Label Icons List */}
                    {Object.keys(labelIcons).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-md font-semibold text-gray-800">
                          Label Icons
                        </h3>
                        <ul className="divide-y border rounded-md">
                          {Object.entries(labelIcons).map(([label, url]) => {
                            const fileName = url.split("/").pop();
                            const folder = "addiction/icons";

                            return (
                              <li
                                key={label}
                                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-4">
                                  <Image
                                    src={url}
                                    alt={label}
                                    width={32}
                                    height={32}
                                    className="rounded"
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {label.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="h-6 w-6"
                                  onClick={async () => {
                                    const confirmed = confirm(
                                      `Are you sure you want to delete "${label}"?`
                                    );
                                    if (!confirmed) return;

                                    try {
                                      const res = await fetch(
                                        `/api/addiction-images?file=${fileName}&folder=${folder}`,
                                        { method: "DELETE" }
                                      );
                                      const result = await res.json();
                                      if (result.success) {
                                        const updated = { ...labelIcons };
                                        delete updated[label];
                                        setLabelIcons(updated);
                                      } else {
                                        alert("Delete failed");
                                      }
                                    } catch (err) {
                                      console.error(
                                        "Failed to delete icon:",
                                        err
                                      );
                                      alert("Delete failed");
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Sensitivity Icons List */}
                    {Object.keys(sensitivityIcons).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-md font-semibold text-gray-800">
                          Sensitivity Icons
                        </h3>
                        <ul className="divide-y border rounded-md">
                          {Object.entries(sensitivityIcons).map(
                            ([label, url]) => {
                              const fileName = url.split("/").pop();
                              const folder = "addiction/sensitivity";

                              return (
                                <li
                                  key={label}
                                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                                >
                                  <div className="flex items-center gap-4">
                                    <Image
                                      src={url}
                                      alt={label}
                                      width={32}
                                      height={32}
                                      className="rounded"
                                    />
                                    <span className="text-sm font-medium capitalize">
                                      {label.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-6 w-6"
                                    onClick={async () => {
                                      const confirmed = confirm(
                                        `Are you sure you want to delete "${label}"?`
                                      );
                                      if (!confirmed) return;

                                      try {
                                        const res = await fetch(
                                          `/api/addiction-images?file=${fileName}&folder=${folder}`,
                                          { method: "DELETE" }
                                        );
                                        const result = await res.json();
                                        if (result.success) {
                                          const updated = {
                                            ...sensitivityIcons,
                                          };
                                          delete updated[label];
                                          setSensitivityIcons(updated);
                                        } else {
                                          alert("Delete failed");
                                        }
                                      } catch (err) {
                                        console.error(
                                          "Failed to delete icon:",
                                          err
                                        );
                                        alert("Delete failed");
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
     
     
}
