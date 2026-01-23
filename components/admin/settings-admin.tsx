"use client";

import React from "react";
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
import { Save, RotateCcw } from "lucide-react";

// Define types locally since we don't have access to the external types
interface FontSettings {
  primary: string;
  secondary: string;
  mono: string;
}

interface ReportSettings {
  title: string;
  subtitle: string;
  companyName: string;
  headerColor: string;
  accentColor: string;
  fonts: FontSettings;
}

interface SettingsAdminProps {
  settings: ReportSettings;
  updateSettings: (
    field: keyof ReportSettings,
    value: string | FontSettings
  ) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function SettingsAdmin({
  settings,
  updateSettings,
  onSave,
  onReset,
}: SettingsAdminProps) {
  // Helper function to update font settings
  const updateFontSetting = (fontType: keyof FontSettings, value: string) => {
    const updatedFonts = {
      ...settings.fonts,
      [fontType]: value,
    };
    updateSettings("fonts", updatedFonts);
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold uppercase text-center sm:text-left">
          Report Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-6">
          <Button onClick={onSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-gray-700"
            >
              Report Title
            </Label>
            <Input
              id="title"
              value={settings.title}
              onChange={(e) => updateSettings("title", e.target.value)}
              className="border-2 focus:border-purple-500 font-bold"
              placeholder="Enter report title"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="subtitle"
              className="text-sm font-semibold text-gray-700"
            >
              Report Subtitle
            </Label>
            <Input
              id="subtitle"
              value={settings.subtitle}
              onChange={(e) => updateSettings("subtitle", e.target.value)}
              className="border-2 focus:border-purple-500"
              placeholder="Enter report subtitle"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="companyName"
              className="text-sm font-semibold text-gray-700"
            >
              Company Name
            </Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => updateSettings("companyName", e.target.value)}
              className="border-2 focus:border-purple-500"
              placeholder="Enter company name"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="headerColor"
              className="text-sm font-semibold text-gray-700"
            >
              Header Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="headerColor"
                type="color"
                value={settings.headerColor}
                onChange={(e) => updateSettings("headerColor", e.target.value)}
                className="w-16 h-10 border-2 focus:border-purple-500"
              />
              <Input
                value={settings.headerColor}
                onChange={(e) => updateSettings("headerColor", e.target.value)}
                className="flex-1 border-2 focus:border-purple-500 font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="accentColor"
              className="text-sm font-semibold text-gray-700"
            >
              Accent Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={settings.accentColor}
                onChange={(e) => updateSettings("accentColor", e.target.value)}
                className="w-16 h-10 border-2 focus:border-purple-500"
              />
              <Input
                value={settings.accentColor}
                onChange={(e) => updateSettings("accentColor", e.target.value)}
                className="flex-1 border-2 focus:border-purple-500 font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="primaryFont"
              className="text-sm font-semibold text-gray-700"
            >
              Primary Font
            </Label>
            <Input
              id="primaryFont"
              value={settings.fonts.primary}
              onChange={(e) => updateFontSetting("primary", e.target.value)}
              placeholder="e.g., Helvetica, Arial, sans-serif"
              className="border-2 focus:border-purple-500"
         
            </Label>
            <Input
              id="secondaryFont"
              value={settings.fonts.secondary}
              onChange={(e) => updateFontSetting("secondary", e.target.value)}
              placeholder="e.g., Georgia, serif"
              className="border-2 focus:border-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="monoFont"
              className="text-sm font-semibold text-gray-700"
     Name="border-2 focus:border-purple-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
