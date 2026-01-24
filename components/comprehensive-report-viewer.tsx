"use client";
import type { ComprehensiveReportData } from "@/types/report-types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
} from "recharts";

interface HealthConditionStatus {
  status: "strength" | "improvement";
  description?: string;
  sensitivity?: string;
  avoid?: string[];
  follow?: string[];
  consume?: string[];
  monitor?: string[];
  avoidLabel?: string;
  followLabel?: string;
  consumeLabel?: string;
  monitorLabel?: string;
}

const defaultImageMap: Record<string, string> = {
  high: "/sports/high.png",
  low: "/sports/low.png",
  average: "/sports/average.png",
  normal: "/sports/normal.png",
  enhanced: "/sports/enhanced.png",
};

interface ComprehensiveReportViewerProps {
  reportData: ComprehensiveReportData;
}

const SectionTitle = ({ title, icon }: { title: string; icon: string }) => (
  <div className="w-full mb-3 mt-4 first:mt-0">
    <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
      {icon && <span className="text-lg">{icon}</span>}
      <span className="break-words text-center">{title}</span>
    </h2>
  </div>
);

const SubSectionTitle = ({ title, icon }: { title: string; icon?: string }) => (
  <div className="w-full mb-2 mt-3">
    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center justify-center gap-2">
      {icon && <span className="text-base">{icon}</span>}
      <span className="break-words text-center">{title}</span>
    </h3>
  </div>
);

const DataCard = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card
    className={`border border-gray-200 bg-gray-50/50 shadow-sm h-fit min-w-0 ${className}`}
  >
    <CardHeader className="pb-1">
      <CardTitle className="text-xs font-semibold text-gray-800 break-words leading-tight">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-xs text-gray-700 space-y-1">
      {children}
    </CardContent>
  </Card>
);

export default function ComprehensiveReportViewer({
  reportData,
}: ComprehensiveReportViewerProps) {
  if (!reportData) {
    return (
      <div className="w-full max-w-4xl mx-auto py-4 px-3 bg-white shadow-lg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            No Report Data Available
          </h2>
          <p className="text-gray-600 text-sm">
            Please provide valid report data to display the comprehensive
            report.
          </p>
        </div>
      </div>
    );
  }

  const {
    patientInfo = {
      name: "",
      gender: "",
      birthDate: "",
      sampleCode: "",
      sampleDate: "",
      reportDate: "",
      signature1: "",
      signature2: "",
      checkedBy: "",
      scientificContent: "",
      disclaimer: "",
      reportAuth: "",
    },
    content = {
      introduction: "",
      genomicsExplanation: "",
      genesHealthImpact: "",
      fundamentalsPRS: "",
      utilityDoctors: "",
      microarrayExplanation: "",
      microarrayData: "",
    },
    settings = {
      title: "Comprehensive Genetic Report",
      subtitle: "Personalized Health Analysis",
      headerColor: "#3B82F6",
      companyName: "Genetic Health Solutions",
      fonts: { primary: "Arial, sans-serif", secondary: "Arial, sans-serif" },
    },
    dynamicDietFieldDefinitions = [
      {
        meta: { quote: "", description: "" },
        fields: [],
      },
    ],
    patientDietAnalysisResults = [],
    nutritionData = { data: {} },
    sportsAndFitness = {
      customImages: {},
      quote: undefined,
      description: undefined,
    },
    lifestyleConditions = {},
    metabolicCore = {},
    digestiveHealth = { data: {} },
    genesAndAddiction = { data: {} },
    sleepAndRest = { data: {} },
    allergiesAndSensitivity = { data: {} },
    geneTestResults = [],
    preventiveHealth = {
      diagnosticTests: { halfYearly: [], yearly: [] },
      nutritionalSupplements: [],
    },
    familyGeneticImpactSection = {
      description: "",
      impacts: [],
    },
    summaries = { nutrigenomicsSummary: "", exerciseGenomicsSummary: "" },
    categories = [],
    healthSummary = { description: "", data: [] },
  } = reportData;

  type DietFieldResult = (typeof patientDietAnalysisResults)[0] & {
    label: string;
    score: number;
  };

  const groupedDietFields = patientDietAnalysisResults.reduce((acc, result) => {
    const allFields = dynamicDietFieldDefinitions.flatMap(
      (def) => def.fields || []
    );
    const fieldDef = allFields.find((field) => field.id === result.fieldId);

    if (fieldDef) {
      if (!acc[fieldDef.category]) acc[fieldDef.category] = [];
      acc[fieldDef.category].push({
        ...result,
        label: fieldDef.label,
        score: result.score ?? 0,

        recommendations: {
          LOW: fieldDef.lowRecommendation,
          NORMAL: fieldDef.normalRecommendation,
          HIGH: fieldDef.highRecommendation,
        },

        lowRecommendation: fieldDef.lowRecommendation,
        normalRecommendation: fieldDef.normalRecommendation,
        highRecommendation: fieldDef.highRecommendation,
      });
    }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <style jsx global>{`
        @media print {
          /* Make PDF one tall page instead of multiple A4 pages */
          @page {
            size: auto; /* Automatically fit content height */
            margin: 0; /* No print margins */
          }
          html,
          body {
            height: auto !important;
            font-size: 9px;
            line-height: 1.2;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
        @media screen {
          .report-container {
            max-width: 210mm; /* Keep same on-screen width */
            margin: 0 auto;
            background: white;
            // border: 1px solid gray;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>

      <div className="report-container w-full mx-auto py-3 px-3 bg-white shadow-lg min-h-screen">
        {/* Report Header */}
        <header
          className="w-full max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between rounded-lg px-4 sm:px-6 md:px-8 py-2 sm:py-7 print:rounded-none print:p-1 print:min-h-screen print:max-w-none"
          style={{ backgroundColor: settings.headerColor, color: "#fff" }}
        >
          {/* Top Section - Company/Title */}
          <div className="text-center space-y-4 sm:space-y-6 mt-4 sm:mt-6 md:mt-8 print:mt-16">
            {/* Main Title */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-3 md:mb-4 break-words leading-tight tracking-wide px-2 print:text-5xl print:mb-6"
                style={{ fontFamily: settings.fonts.primary }}
              >
                {settings.title}
              </h1>
              <div className="w-20 sm:w-24 md:w-32 h-0.5 sm:h-0.5 md:h-1 bg-white mx-auto opacity-80 rounded print:w-40 print:h-1.5"></div>
              <p
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-light mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-xs sm:max-w-md md:max-w-2xl mx-auto px-4 print:text-2xl print:mb-12"
                style={{ fontFamily: settings.fonts.secondary }}
              >
                {settings.subtitle}
              </p>
            </div>
          </div>

          {/* Middle Section - Patient Information Card */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 md:px-0">
            <div className="bg-white bg-opacity-95 text-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg w-full print:max-w-2xl print:p-12">
              <h2
                className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-6 md:mb-8 print:text-3xl print:mb-12"
                style={{
                  fontFamily: settings.fonts.primary,
                  color: settings.headerColor,
                }}
              >
                Patient Information
              </h2>

              <div className="space-y-4 sm:space-y-5 md:space-y-6 print:space-y-4">
                {/* Patient Name */}
                <div className="text-center border-b border-gray-200 pb-3 sm:pb-4 print:pb-4">
                  <p
                    className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2 print:text-base"
                    style={{ fontFamily: settings.fonts.secondary }}
                  >
                    Patient Name
                  </p>
                  <p
                    className="text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight px-2 print:text-3xl"
                    style={{
                      fontFamily: settings.fonts.primary,
                      color: settings.headerColor,
                    }}
                  >
                    {patientInfo.name}
                  </p>
                </div>

                {/* Sample Code */}
                <div className="text-center border-b border-gray-200 pb-3 sm:pb-4 md:pb-4 print:pb-6">
                  <p
                    className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2 print:text-base"
                    style={{ fontFamily: settings.fonts.secondary }}
                  >
                    Sample Code
                  </p>
                  <p
                    className="text-base sm:text-lg md:text-xl font-mono font-bold break-all tracking-wider px-2 print:text-2xl"
                    style={{ color: settings.headerColor }}
                  >
                    {patientInfo.sampleCode}
                  </p>
                </div>

                {/* Report Details */}
                <div className="text-center space-y-2 sm:space-y-3 print:space-y-4">
                  <div>
                    <p
                      className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 print:text-base"
                      style={{ fontFamily: settings.fonts.secondary }}
                    >
                      Report Date
                    </p>
                    <p
                      className="text-sm sm:text-base md:text-lg font-semibold print:text-xl"
                      style={{
                        fontFamily: settings.fonts.secondary,
                        color: settings.headerColor,
                      }}
                    >
                      {patientInfo.reportDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Company Info */}
          <div className="relative flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 md:mb-8 print:mb-16">
            <div className="w-16 sm:w-20 md:w-24 h-0.5 bg-white mx-auto opacity-60 rounded print:w-32"></div>

            <p
              className="text-sm sm:text-base md:text-lg font-medium tracking-wide print:text-xl"
              style={{ fontFamily: settings.fonts.secondary }}
            >
              Generated by
            </p>
            <p
              className="text-xl sm:text-xl md:text-2xl font-bold tracking-wide print:text-3xl"
              style={{ fontFamily: settings.fonts.primary }}
            >
              {settings.companyName}
            </p>
            <p
              className="text-xs sm:text-sm opacity-90 px-4 print:text-base"
              style={{ fontFamily: settings.fonts.secondary }}
            >
              Professional Health Report • Confidential
            </p>

            <div className="flex justify-between items-end w-full px-4 mt-8">
              <img
                src="/thankyou/dyalystt.png"
                alt="Dnal.st Logo"
                className="w-24 sm:w-32 md:w-40 lg:w-48  opacity-90"
              />
              <img
                src="/thankyou/molsys.png"
                alt="Molsys Logo"
                className="w-24 sm:w-32 md:w-40 lg:w-48 object-contain opacity-90"
              />
            </div>
          </div>
        </header>

        <Separator className="my-6" />

        {/* Patient Information */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:border-2 print:border-gray-800 print:p-4 print:mb-4">
          {/* Section Header */}
          <div className="flex items-center mb-6 pb-3 border-b border-gray-200 print:mb-4 print:pb-2">
            <div className="w-1 h-6 bg-orange-500 rounded-full mr-3 print:bg-black"></div>
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide print:text-base print:font-extrabold">
              Personal Details
            </h3>
          </div>

          {/* Modern Table-Style Grid */}
          <div className="bg-gradient-to-br rounded-lg from-gray-50 to-gray-100 overflow-hidden border border-gray-200 print:bg-white print:border-gray-800">
            <div className="divide-y divide-gray-200 print:divide-gray-600">
              {/* Patient Name Row */}
              <div className="flex items-center py-4 px-6 hover:bg-white/50 transition-all duration-200 print:py-3 print:px-4">
                <div className="w-2/5">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide print:text-xs print:font-extrabold">
                    Name
                  </label>
                </div>
                <div className="w-px h-8 bg-gray-300 print:bg-gray-600 mx-4"></div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 break-words print:text-sm print:font-bold">
                    {patientInfo.name}
                  </p>
                </div>
              </div>

              {/* Gender Row */}
              <div className="flex items-center py-4 px-6 hover:bg-white/50 transition-all duration-200 print:py-3 print:px-4">
                <div className="w-2/5">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide print:text-xs print:font-extrabold">
                    Gender
                  </label>
                </div>
                <div className="w-px h-8 bg-gray-300 print:bg-gray-600 mx-4"></div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 capitalize print:text-sm print:font-bold">
                    {patientInfo.gender}
                  </p>
                </div>
              </div>

              {/* Birth Date Row */}
              <div className="flex items-center py-4 px-6 hover:bg-white/50 transition-all duration-200 print:py-3 print:px-4">
                <div className="w-2/5">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide print:text-xs print:font-extrabold">
                    Birth Date
                  </label>
                </div>
                <div className="w-px h-8 bg-gray-300 print:bg-gray-600 mx-4"></div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 print:text-sm print:font-bold">
                    {patientInfo.birthDate}
                  </p>
                </div>
              </div>

              {/* Sample Code Row */}
              <div className="flex items-center py-4 px-6 hover:bg-white/50 transition-all duration-200 print:py-3 print:px-4">
                <div className="w-2/5">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide print:text-xs print:font-extrabold">
                    Sample Code
                  </label>
                </div>
                <div className="w-px h-8 bg-gray-300 print:bg-gray-600 mx-4"></div>
                <div className="flex-1">
                  <p className="text-base font-mono font-bold text-orange-600 break-all tracking-wide print:text-sm print:text-black print:font-extrabold">
                    {patientInfo.sampleCode}
       </div>

              {/* Sample/Data Date Row */}
              <div className="flex items-center py-4 px-6 hover:bg-white/50 transition-all duration-200 print:py-3 print:px-4">
                <div className="w-2/5">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide print:text-xs print:font-extrabold">
                    Sample Collection Date
                  </label>
                </div>
                <div className="w-px h-8 bg-gray-300 print:bg-gray-600 mx-4"></div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 print:text-sm print:font-bold">
                    {patientInfo.sampleDate}
                  </p>
                </div>
              </div>
label className="text-sm font-bold text-gray-700 uppercase tracking-wide print:text-xs print:font-extrabold">
                    Report Date
             tion & Analytics
          </h3>
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div className="text-center space-y-3">
              <p className="text-xs font-semibold text-gray-700">
                Genomic Data Analytics - Checked & Verified By
              </p>
              <div className="flex justify-center py-2">
                {patientInfo.signature1 ? (
                  <img
                    src={patientInfo.signature1 || "/placeholder.svg"}
                    alt="Primary Signature"
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <p className="italic text-gray-500 text-xs">
                    No signature available
                  </p>
                )}
              </div>
              <p className="text-xs break-words text-gray-600">
                {patientInfo.checkedBy}
              </p>
            </div>
            <div className="text-center space-y-3">
              <p className="text-xs font-semibold text-gray-700">
                Scientific Content - Checked & Verified By
              </p>
              <div className="flex justify-center py-2">
                {patientInfo.signature2 ? (
                  <img
                    src={patientInfo.signature2 || "/placeholder.svg"}
                    alt="Secondary Signature"
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <p className="italic text-gray-500 text-xs">
                    No signature available
                  </p>
                )}
              </div>
              <p className="text-xs break-words text-gray-600">
                {patientInfo.scientificContent}
              </p>
            </div>
          </div>
          <DataCard title="Disclaimer" className="text-center">
            <p className="text-justify whitespace-pre-wrap break-words text-xs leading-relaxed">
              {patientInfo.disclaimer}
            </p>
          </DataCard>
        </div>

        <Separator className="my-4" />
        {/* Preface Section */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            PREFACE
          </h2>
        </div>

        <div className="m-3 w-1/2">
          {content.introduction.split(/\n\s*\n/).map((para, idx) => (
            <p
              key={idx}
              className="text-xs mb-4"
              style={{ textAlign: "justify", textJustify: "inter-word" }}
            >
              {para}
            </p>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <div className="text-center mb-3">
            <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
              WELCOME TO THE WORLD OF GENOMICS
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <DataCard title="What is Genomics?">
              <p className="text-justify whitespace-pre-line text-xs">
                {content.genomicsExplanation}
              </p>
            </DataCard>
            <div className="flex justify-center items-center">
              <img
                src="/assets/genomic1.png"
                alt="What is Genomics Illustration"
                className="w-[440px] h-[380px] object-contain rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <DataCard title="Genes and Health Impact">
              <p className="text-justify whitespace-pre-line text-xs">
                {content.genesHealthImpact}
              </p>
            </DataCard>
            <div className="flex justify-center items-center">
              <img
                src="/assets/genomic2.png"
                alt="Genes and Health Impact Illustration"
                className="w-[480px] h-[390px] object-contain rounded"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-center mb-3">
            <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
              WHAT IS NUTRIGENOMICS
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <DataCard title="Fundamentals and PRS">
              <p className="text-justify whitespace-pre-line text-xs ">
                {content.fundamentalsPRS}
              </p>
            </DataCard>
            <div className="flex justify-center items-center ">
              <img
                src="/assets/genomics3.png"
                alt="Fundamentals and PRS Illustration"
                className="w-full max-w-55 h-auto object-contain rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <DataCard title="Utility for Doctors and Dietitians">
              <p className="text-justify whitespace-pre-line text-xs">
                {content.utilityDoctors}
              </p>
            </DataCard>
            <div className="flex justify-center items-center ">
              <img
                src="/assets/genomics4.png"
                alt="Utility for Doctors and Dietitians Illustration"
                className="w-full max-w-55 h-auto object-contain rounded"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-center mb-3">
            <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
              ABOUT MICROARRAY
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <DataCard title="Microarray Explanation">
                <p className="text-justify whitespace-pre-line text-xs">
                  {content.microarrayExplanation}
                </p>
              </DataCard>
              <DataCard title="Your Microarray Data" className="mt-4">
                <p className="text-justify whitespace-pre-line text-xs">
                  {content.microarrayData}
                </p>
              </DataCard>
            </div>

            <div className="flex justify-center items-center">
              <img
                src="/assets/genomic5.png"
                alt="Microarray Illustration"
                className="w-full max-w-55 h-170 object-contain rounded"
              />
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        {/* Table of Contents */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded uppercase">
            Area Covered in the Report
          </h2>
        </div>
        {categories?.map((category) => {
          const columns: string[][] = [[], [], []];
          category.parameters.forEach((param, index) => {
            columns[index % 3].push(param);
          });

          return (
            <div
              key={category.id}
              className="mb-4 border-b border-gray-300 pb-3"
            >
              <div className="flex gap-3">
                <div className="w-1/4 flex flex-col items-center ml-3 justify-center gap-2 mb-2 min-h-20 md:flex-row md:justify-start md:items-center md:min-h-auto">
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl || "/placeholder.svg"}
                      alt={category.category}
                      className="w-12 h-12 object-cover  flex-shrink-0"
                    />
                  )}
                  <h2 className="p-2 sm:px-3 text-xs sm:text-sm md:text-base lg:text-sm font-bold text-gray-800 uppercase break-words text-center md:text-left leading-tight">
                    {category.category}
                  </h2>
                </div>
                <div className="w-3/4">
                  <div className="grid grid-cols-3 gap-2">
                    {columns.map((col, colIndex) => (
                      <ul key={colIndex} className="list-none space-y-1">
                        {col.map((param, idx) => (
                          <li
                            key={idx}
                            className="text-gray-800 text-xs break-words"
                          >
                            {param}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <Separator className="my-4" />

        {/* Health Summary Section */}
        {(healthSummary.description || healthSummary.data.length > 0) && (
          <div className="space-y-4">
            {/* Section Title */}
            <div className="text-center mb-3">
              <h2 className="text-base font-bold mb-2 bg-blue-300 text-white py-2 px-2 rounded uppercase">
                DISTRIBUTION OF YOUR GENOMIC ANALYSIS
              </h2>
            </div>

            {/* Top description */}
            {healthSummary.description && (
              <p className="text-gray-700 text-sm text-justify p-3">
                {healthSummary.description}
              </p>
            )}

            {/* Two-column table entries */}
            {healthSummary.data.map((entry, index) => (
              <div
                key={`health-summary-${index}`}
                className="grid grid-cols-12 gap-0 w-full"
              >
                {/* Left Column: Title */}
                <div className="col-span-3 flex items-center justify-center p-2 sm:p-4">
                  <span
                    className={`text-white font-bold text-[10px] sm:text-sm px-2 sm:px-5 py-4 sm:py-7 rounded uppercase text-center w-full break-words
        ${
          entry.title.toLowerCase() === "strengths"
            ? "bg-green-500"
            : entry.title.toLowerCase() === "weaknesses"
            ? "bg-orange-500"
            : entry.title.toLowerCase().includes("diet")
            ? "bg-blue-500"
            : entry.title.toLowerCase().includes("exercise")
            ? "bg-gray-400"
            : entry.title.toLowerCase().includes("preventive")
            ? "bg-yellow-500 text-black"
            : "bg-blue-500"
        }`}
                  >
                    {entry.title}
                  </span>
                </div>

                {/* Right Column: Description */}
                <div className="col-span-9 border border-gray-400 p-2 sm:p-4 flex flex-col justify-center rounded-md">
                  {entry.description &&
                    (() => {
                      const lines = entry.description
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean);
                      const isBulletList =
                        lines.length > 1 &&
                        (lines.every((line) => /^[-•\d]/.test(line)) ||
                          lines.length <= 6);

                      return isBulletList ? (
                        <ul className="list-disc list-inside text-gray-700 text-xs sm:text-sm normal-case leading-relaxed space-y-1 sm:space-y-2">
                          {lines.map((line, i) => (
                            <li key={i}>{line.replace(/^[-•\d. ]+/, "")}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700 text-xs sm:text-sm normal-case leading-relaxed text-justify">
                          {entry.description}
                        </p>
                      );
                    })()}
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/Diet.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Diet Section */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-green-600 text-white py-2 px-2 rounded">
            GENOMICS & DIET
          </h2>
        </div>
        {Object.keys(groupedDietFields).length === 0 && (
          <p className="text-center text-gray-500 italic mb-4">
            No diet analysis results available.
          </p>
        )}

        {reportData?.dynamicDietFieldDefinitions?.[0]?.meta?.quote && (
          <div className="mb-3 text-center">
            <p className="text-sm font-semibold italic text-gray-800">
              "{reportData.dynamicDietFieldDefinitions[0].meta.quote}"
            </p>
          </div>
        )}

        {reportData?.dynamicDietFieldDefinitions?.[0]?.meta?.description && (
          <div className="mb-3">
            <p className="text-gray-700 p-3 text-xs text-justify">
              {reportData.dynamicDietFieldDefinitions[0].meta.description}
            </p>
          </div>
        )}

        <div className="w-full max-w-4xl mx-auto mb-6 print:mb-0 print:max-w-none print:w-full">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[700px] table-fixed text-xs border-2 border-gray-300 bg-white print:text-[9px] print:border-gray-300 print:min-w-full">
              <tbody>
                {Object.entries(groupedDietFields).flatMap(
                  ([category, fields]) =>
                    fields.map((data, index) => {
                      const score = Number(data.score ?? 0);

                      // Determine selected level from score
                      let selectedLevel: "LOW" | "NORMAL" | "HIGH" = "NORMAL";
                      if (score <= 3) selectedLevel = "LOW";
                      else if (score >= 7) selectedLevel = "HIGH";

                      const scoreColor =
                        score <= 3
                          ? "bg-green-600 print:bg-green-700"
                          : score <= 6
                          ? "bg-yellow-500 print:bg-yellow-600"
                          : "bg-red-600 print:bg-red-600";

                      const renderAdviceCell = (
                        level: "LOW" | "NORMAL" | "HIGH"
                      ) => (
                        <td className="p-3 border border-gray-300 align-top w-[17%] print:p-2 print:text-[7px]">
                          <div
                            className={`text-xs font-bold mb-2 uppercase tracking-wide text-center print:text-[7px] print:mb-1 print:font-extrabold ${
                              selectedLevel === level
                                ? "text-black"
                                : "text-gray-400 print:text-gray-500"
                            }`}
                          >
                            {level}
                          </div>
                          <div
                            className={`text-xs leading-relaxed text-center print:text-[6px] print:leading-normal overflow-hidden ${
                              selectedLevel === level
                                ? "text-gray-900 font-medium"
                                : "text-gray-400 print:text-gray-500"
                            }`}
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              hyphens: "auto",
                            }}
                          >
                            {(() => {
                              // Prefer new flat field (e.g. lowRecommendation), fallback to legacy structure
                              const key = (level.toLowerCase() +
                                "Recommendation") as
                                | "lowRecommendation"
                                | "normalRecommendation"
                                | "highRecommendation";
                              return (
                                (key in data
                                  ? (data as any)[key]
                                  : undefined) ||
                                data?.recommendations?.[level] ||
                                "-"
                              );
                            })()}
                          </div>
                        </td>
                      );

                      return (
                        <tr
                          key={`${category}-${index}`}
                          className="border-t border-gray-100 print:break-inside-avoid"
                        >
                          {/* Category cell - show only once per group */}
                          {index === 0 && (
                            <td
                              rowSpan={fields.length}
                              className="p-2 border border-gray-300 font-bold text-blue-800 bg-gray-50 text-left align-middle uppercase tracking-wider w-[18%] print:p-2 print:bg-gray-100 print:text-black print:text-[8px] print:font-extrabold"
                            >
                              <div className="text-center">
                                {category
                                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                                  .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                                  .replace(/&/g, " & ")
                                  .replace(/\s+/g, " ")
                                  .trim()}
                              </div>
                            </td>
                          )}

                          {/* Trait name */}
                          <td className="p-3 border border-gray-300 text-center font-semibold text-gray-800 uppercase text-xs leading-tight w-[20%] print:p-2 print:text-[7px] print:font-bold align-middle">
                            <div
                              className="flex items-center justify-center break-words overflow-hidden text-center h-full"
                              style={{
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                hyphens: "auto",
                              }}
                            >
                              {data.label}
                            </div>
                          </td>

                          {/* Score badge */}
                          <td className="p-3 border border-gray-300 text-center align-middle w-[10%] print:p-2">
                            <span
                              className={`inline-block px-5 py-1 rounded-md text-white font-bold text-sm min-w-8 print:px-2 print:py-1 print:text-[8px] print:min-w-6 print:rounded ${scoreColor}`}
                            >
                              {score}
                            </span>
                          </td>

                          {/* Advice columns */}
                          {renderAdviceCell("LOW")}
                          {renderAdviceCell("NORMAL")}
                          {renderAdviceCell("HIGH")}
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/Nutition.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Nutrition Section */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            NUTRITION
          </h2>
        </div>
        <SectionTitle title="Nutrition Analysis" icon="" />
        {reportData.nutritionData?.quote && (
          <div className="mb-3">
            <p className="text-sm font-semibold italic text-center text-gray-700">
              {reportData.nutritionData.quote}
            </p>
          </div>
        )}
        {reportData.nutritionData?.description && (
          <div className="mb-4">
            <p className="text-gray-600 text-justify leading-relaxed p-3 text-xs">
              {reportData.nutritionData.description}
            </p>
          </div>
        )}

        <div className="w-full print:w-[700px] mx-auto mb-6 print:mb-4">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[700px] text-[13px] border border-gray-300 print:text-[12px] table-fixed print:min-w-full">
              <thead className="bg-gray-200 text-gray-700 uppercase text-[11px]">
                <tr>
                  <th className="p-2 border border-gray-300 w-[18%] text-center align-middle">
                    Category
                  </th>
                  <th className="p-2 border border-gray-300 w-[21%] text-center align-middle">
                    Nutrient
                  </th>
                  <th className="p-2 border border-gray-300 w-[10%] text-center align-middle">
                    Score
                  </th>
                  <th className="p-2 border border-gray-300 w-[18%] text-center align-middle">
                    Health Impact
                  </th>
                  <th className="p-2 border border-gray-300 w-[18%] text-center align-middle">
                    Intake Level
                  </th>
                  <th className="p-2 border border-gray-300 w-[15%] text-center align-middle">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(reportData.nutritionData?.data || {}).flatMap(
                  ([sectionName, sectionData]) => {
                    const entries = Object.entries(sectionData);

                    const formattedCategory = sectionName
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());

                    // Helper to format nutrient names
                    const formatNutrientName = (name: string) => {
                      let label = name
                        .replace(/([A-Z])/g, " $1") // space before capitals
                        .replace(/^./, (str) => str.toUpperCase()); // uppercase first letter

                      // Special handling for Vitamin patterns
                      label = label.replace(
                        /^Vitamin\s?([a-z])(\d+)?$/i,
                        (_, letter, number) =>
                          `Vitamin ${letter.toUpperCase()}${number || ""}`
                      );

                      return label;
                    };

                    return entries.map(([key, data], index) => {
                      const formattedLabel = formatNutrientName(key);

                      const score = Number(data.score ?? 0);
                      const scoreColor =
                        score <= 3
                          ? "bg-green-600"
                          : score <= 6
                          ? "bg-yellow-500"
                          : "bg-orange-500";

                      return (
                        <tr
                          key={`${sectionName}-${key}`}
                          className="border-t border-gray-200 break-inside-avoid"
                        >
                          {index === 0 && (
                            <td
                              rowSpan={entries.length}
                              className="p-2 border border-gray-300 font-bold text-blue-800 uppercase bg-gray-50 text-center align-middle"
                            >
                              {formattedCategory}
                            </td>
                          )}
                          <td className="p-2 border border-gray-300 font-medium text-gray-800 text-center align-middle">
                            {formattedLabel}
                          </td>
                          <td className="p-2 border border-gray-300 text-center align-middle">
                            <span
                              className={`inline-block px-5 py-1 rounded text-white font-bold ${scoreColor}`}
                            >
                              {score}
                            </span>
                          </td>
                          <td className="p-2 border border-gray-300 text-center text-gray-700 break-words whitespace-pre-line align-middle">
                            {data.healthImpact || "-"}
                          </td>
                          <td className="p-2 border border-gray-300 text-center text-gray-700 break-words whitespace-pre-line align-middle">
                            {data.intakeLevel || "-"}
                          </td>
                          <td className="p-2 border border-gray-300 text-center text-gray-700 break-words whitespace-pre-line align-middle">
                            {data.source || "-"}
                          </td>
                        </tr>
                      );
                    });
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/sports.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            SPORTS AND FITNESS
          </h2>
        </div>
        <div className="space-y-4 mb-4">
          {/* Quote */}
          {sportsAndFitness.quote && (
            <p className="text-sm font-semibold italic text-center text-red-600 mb-3">
              {sportsAndFitness.quote}
            </p>
          )}

          {/* Description */}
          {sportsAndFitness.description && (
            <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
              {sportsAndFitness.description}
            </p>
          )}

          {/* Table */}
          <div className="w-full overflow-x-auto mb-4">
            <table className="w-full min-w-[500px] text-xs border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-1/5 border border-gray-300 p-2 text-xs font-bold text-center uppercase">
                    CATEGORY
                  </th>
                  <th className="w-1/4 border border-gray-300 p-2 text-xs font-bold text-center uppercase">
                    TRAIT
                  </th>
                  <th className="w-1/6 border border-gray-300 p-2 text-xs font-bold text-center uppercase">
                    IMAGE
                  </th>
                  <th className="w-1/2 border border-gray-300 p-2 text-xs font-bold text-center uppercase">
                    DESCRIPTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sportsAndFitness)
                  .filter(
                    ([key]) =>
                      key !== "quote" &&
                      key !== "description" &&
                      key !== "customImages"
                  )
                  .map(([categoryKey, fields]) => {
                    if (
                      !fields ||
                      typeof fields !== "object" ||
                      Array.isArray(fields)
                    ) {
                      return null;
                    }

                    const fieldEntries = Object.entries(
                      fields as Record<
                        string,
                        { level: string; description: string; label?: string }
                      >
                    );

                    return fieldEntries.map(([fieldKey, fieldData], index) => {
                      const selectedImageKey = fieldData.level
                        ?.split("-")
                        .pop()
                        ?.toLowerCase();

                      const imageUrl =
                        (
                          sportsAndFitness.customImages as
                            | Record<string, string>
                            | undefined
                        )?.[selectedImageKey ?? ""] ||
                        defaultImageMap[selectedImageKey ?? ""] ||
                        "/sports/default.png";

                      return (
                        <tr
                          key={`${categoryKey}-${fieldKey}`}
                          className="border-b border-gray-300 align-middle"
                        >
                          {index === 0 && (
                            <td
                              rowSpan={fieldEntries.length}
                              className="text-center font-semibold text-red-700 w-1/5 uppercase align-middle border border-gray-300 p-1 text-xs"
                            >
                              {categoryKey
                                .replace(/_/g, " ") // <-- replace underscores with spaces
                                .replace(/([A-Z])/g, " $1")}
                            </td>
                          )}
                          <td className="text-center font-medium uppercase text-gray-800 w-1/4 border border-gray-300 p-1 text-xs align-middle">
                            {(fieldData.label || fieldKey).replace(/_/g, " ")}{" "}
                            {/* <-- replace underscores */}
                          </td>
                          <td className="text-center w-1/5 border border-gray-300 p-1 align-middle">
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={selectedImageKey}
                              className="w-16 h-17 p-1 mx-auto rounded-lg"
                            />
                          </td>
                          <td className="text-center text-gray-600 text-xs w-1/2 border border-gray-300 p-1 align-middle">
                            {fieldData.description}
                          </td>
                        </tr>
                      );
                    });
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/lifestyle.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Lifestyle Conditions */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            LIFESTYLE CONDITIONS
          </h2>
        </div>

        {reportData.lifestyleConditions && (
          <div className="mb-6">
            {reportData.lifestyleConditions.quote && (
              <p className="text-sm font-semibold italic text-center text-red-600 mb-3">
                "{reportData.lifestyleConditions.quote}"
              </p>
            )}

            {reportData.lifestyleConditions.description && (
              <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
                {reportData.lifestyleConditions.description}
              </p>
            )}

            <div className="w-full overflow-x-auto mb-6">
              <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden text-xs">
                <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
                  <tr>
                    <th className="px-2 py-2 w-64 text-center align-middle">
                      Category
                    </th>
                    <th className="px-2 py-2 text-center align-middle">
                      Condition
                    </th>
                    <th className="px-2 py-2 text-center align-middle">
                      Your Strengths
                    </th>
                    <th className="px-2 py-2 text-center align-middle">
                      Improvement Needed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.lifestyleConditions)
                    .reverse() // 🔄 reverse order
                    .map(([categoryId, categoryData]) => {
                      if (
                        categoryId === "quote" ||
                        categoryId === "description" ||
                        typeof categoryData !== "object"
                      )
                        return null;

                      const fields = Object.entries(
                        categoryData as Record<string, HealthConditionStatus>
                      ).reverse(); // 🔄 reverse conditions inside category

                      return fields.map(([condition, { status }], index) => (
                        <tr
                          key={`${categoryId}-${condition}`}
                          className="border-t text-center align-middle "
                        >
                          {index === 0 && (
                            <td
                              rowSpan={fields.length}
                              className="px-2 py-5 font-medium text-center align-middle text-gray-900 "
                            >
                              <div className="flex items-center gap-2">
                                {reportData.lifestyleCategoryImages?.[
                                  categoryId
                                ] ? (
                                  <img
                                    src={
                                      reportData.lifestyleCategoryImages[
                                        categoryId
                                      ] || "/placeholder.svg"
                                    }
                                    alt={categoryId}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-4 h-4 bg-gray-300 rounded " />
                                )}
                                <span className="capitalize">
                                  {categoryId === categoryId.toUpperCase()
                                    ? categoryId
                                    : categoryId.replace(/([A-Z])/g, " $1")}
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="px-3 py-3 ">{condition}</td>
                          <td className="px-2 py-1 text-center">
                            {status === "strength" && (
                              <Check className="text-green-600 inline w-3 h-3" />
                            )}
                          </td>
                          <td className="px-2 py-1 text-center">
                            {status === "improvement" && (
                              <Check className="text-red-600 inline w-3 h-3" />
                            )}
                          </td>
                        </tr>
                      ));
                    })}
                </tbody>
              </table>
            </div>

            <div className="text-center mb-7">
              <h2 className=" mb- bg-gray-300 text-white py-1 px-1 rounded"></h2>
            </div>

            {Object.entries(reportData.lifestyleConditions)
              .filter(([key]) => !["quote", "description"].includes(key))
              .map(([categoryId, conditions]) => (
                <div key={categoryId} className="mb-6">
                  <div className="text-center">
                    <div className="text-base font-bold mb-3 bg-red-400 text-white py-0.5 px-2 rounded inline-block">
                      {categoryId
                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                        .replace(/&/g, " & ")
                        .replace(/\s+/g, " ")
                        .trim()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(
                      conditions as Record<string, HealthConditionStatus>
                    ).map(([fieldKey, data]) => (
                      <div
                        key={fieldKey}
                        className="border rounded-lg border-gray-400 shadow-md bg-white p-3 space-y-2"
                      >
                        <div className="flex justify-between gap-2 items-stretch">
                          <div className="w-[76%]">
                            <h3 className="text-sm font-bold text-red-400 mb-1 uppercase">
                              {fieldKey
                                .replace(/([a-z])([A-Z])/g, "$1 $2")
                                .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                                .replace(/&/g, " & ")
                                .replace(/\s+/g, " ")
                                .trim()}
                            </h3>

                            {data.description && (
                              <p className="text-xs text-gray-700 leading-relaxed text-justify">
                                {data.description}
                              </p>
                            )}
                          </div>
                          <div className="w-[24%] flex items-center p-3 justify-center">
                            {data.sensitivity && (
                              <img
                                src={`/sensitivity/${data.sensitivity}.png`}
                                alt={data.sensitivity}
                                className="w-auto h-auto object-contain max-w-full max-h-29 print:max-h-25"
                              />
                            )}
                          </div>
                        </div>
                        <hr className="border-t border-gray-200" />
                        <div className="grid grid-cols-4 gap-2">
                          {(
                            ["avoid", "follow", "consume", "monitor"] as const
                          ).map((key) =>
                            data[key]?.length && data[key]?.length > 0 ? (
                              <div key={key}>
                                <p className="text-xs font-bold uppercase mb-1 ml-2">
                                  {data[`${key}Label`] || key.toUpperCase()}
                                </p>
                                <ul className="list-disc list-outside pl-5 text-xs text-gray-700 space-y-1">
                                  {data[key]?.flatMap((item, idx) =>
                                    typeof item === "string"
                                      ? item
                                          .split("\n")
                                          .filter((line) => line.trim() !== "")
                                          .map((line, subIdx) => (
                                            <li key={`${idx}-${subIdx}`}>
                                              {line.trim()}
                                            </li>
                                          ))
                                      : null
                                  )}
                                </ul>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/metabloic.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Metabolic Core */}
        <div className="text-center my-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            METABOLIC CORE
          </h2>
        </div>

        <div className="space-y-4">
          {metabolicCore.quote && (
            <p className="text-sm font-semibold italic text-center text-red-600 mb-3">
              "{metabolicCore.quote}"
            </p>
          )}
          {metabolicCore.description && (
            <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
              {metabolicCore.description}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border border-blue-500  text-xs">
              <thead className="bg-blue-500 text-white text-center uppercase text-xs">
                <tr>
                  <th className="py-1 px-2 w-[20%]">Metabolic Area</th>
                  <th className="py-1 px-2 w-[20%]">Gene (Alleles)</th>
                  <th className="py-1 px-2 w-[15%]">Your Genotype</th>
                  <th className="py-1 px-2 w-[15%]">Genetic Impact</th>
                  <th className="py-1 px-2 w-[30%]">Advice</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {Object.entries(metabolicCore)
                  .filter(([key]) => key !== "quote" && key !== "description")
                  .map(([areaKey, areaData]) => {
                    const genes = areaData.genes || [];
                    const totalRows = Math.max(genes.length, 1);
                    return genes.length > 0 ? (
                      genes.map((gene, index) => (
                        <tr
                          key={`${areaKey}-${index}`}
                          className="border-t  border-slate-200"
                        >
                          {index === 0 ? (
                            <>
                              <td
                                rowSpan={totalRows}
                                className="font-bold align-middle px-2 py-2.5 text-blue-700 uppercase text-center border-r border-slate-200"
                              >
                                {areaKey
                                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                                  .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                                  .replace(/&/g, " & ")
                                  .replace(/\s+/g, " ")
                                  .trim()}
                              </td>
                            </>
                          ) : null}
                          <td className="px-2 py-1">{gene.name}</td>
                          <td className="px-2 py-1 font-mono">
                            {gene.genotype}
                          </td>
                          <td className="px-2 py-1">
                            <div className="flex justify-center items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-full inline-block ${
                                  gene.impact?.toLowerCase().includes("high")
                                    ? "bg-red-500"
                                    : gene.impact?.toLowerCase().includes("low")
                                    ? "bg-slate-400"
                                    : gene.impact
                                        ?.toLowerCase()
                                        .includes("moderate") ||
                                      gene.impact
                                        ?.toLowerCase()
                                        .includes("average")
                                    ? "bg-yellow-400"
                                    : "bg-green-500"
                                }`}
                              ></span>
                            </div>
                          </td>
                          {index === 0 ? (
                            <td
                              rowSpan={totalRows}
                              className="px-2 py-1 text-left align-middle border-l border-slate-200"
                            >
                              <div className=" text-center whitespace-pre-wrap text-xs">
                                {areaData.advice || "No advice provided"}
                              </div>
                            </td>
                          ) : null}
                        </tr>
                      ))
                    ) : (
                      // Show row even if no genes, to display area advice
                      <tr key={areaKey} className="border-t border-slate-200">
                        <td className="font-bold px-2 py-2.5 text-blue-700 uppercase text-center border-r border-slate-200">
                          {areaKey
                            .replace(/([a-z])([A-Z])/g, "$1 $2")
                            .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                            .replace(/&/g, " & ")
                            .replace(/\s+/g, " ")
                            .trim()}
                        </td>
                        <td className="px-2 py-1 text-gray-400">No genes</td>
                        <td className="px-2 py-1 text-gray-400">-</td>
                        <td className="px-2 py-1 text-gray-400">-</td>
                        <td className="px-2 py-1 text-left">
                          <div className="whitespace-pre-wrap text-xs">
                            {areaData.advice || "No advice provided"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/digestive.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Digestive Health */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            DIGESTIVE HEALTH
          </h2>
        </div>

        {digestiveHealth?.quote && (
          <p className="text-sm font-semibold italic text-center text-red-600 mb-3">
            "{digestiveHealth.quote}"
          </p>
        )}
        {digestiveHealth?.description && (
          <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
            {digestiveHealth.description}
          </p>
        )}
        <div className="overflow-x-auto rounded-sm shadow">
          {digestiveHealth?.data &&
          Object.keys(digestiveHealth.data).length > 0 ? (
            <table className="min-w-full text-xs text-center border border-gray-300 table-fixed">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="w-[20%] p-2 border border-gray-300">Title</th>
                  <th className="w-[20%] p-2 border border-gray-300">Icon</th>
                  <th className="w-[30%] p-2 text-center border border-gray-300">
                    LOW
                  </th>
                  <th className="w-[30%] p-2 text-center border border-gray-300">
                    HIGH
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(digestiveHealth.data).map(([key, item]) => {
                  const iconPath = item.icon
                    ? `/digestive/${item.icon}.png`
                    : null;
                  const isLow = item.sensitivity === "Low";
                  const isHigh = item.sensitivity === "High";

                  return (
                    <tr key={key} className="border-t border-gray-200">
                      <td className="p-2 border border-gray-300 font-medium text-center uppercase">
                        {item.title || <span className="italic">Untitled</span>}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {iconPath ? (
                          <img
                            src={iconPath}
                            alt={item.title || "icon"}
                            className="w-15 h-auto mx-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "/digestive/placeholder.png";
                            }}
                          />
                        ) : (
                          <span className="text-slate-400 italic">No Icon</span>
                        )}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center whitespace-pre-line ${
                          isLow ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {item.good || <span className="italic">—</span>}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center whitespace-pre-line ${
                          isHigh ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {item.bad || <span className="italic">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-sm text-gray-500 p-4 italic">
              No digestive health data available.
            </p>
          )}
        </div>

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/addiction.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-" />

        {/* Genes & Addiction */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded uppercase">
            Genes & Addiction
          </h2>
        </div>
        <div className="mb-4">
          {genesAndAddiction.quote && (
            <p className="text-sm font-semibold italic text-center text-red-600 mb-3">
              "{genesAndAddiction.quote}"
            </p>
          )}

          {genesAndAddiction.description && (
            <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
              {genesAndAddiction.description}
            </p>
          )}

          <div className="w-full">
            <table className="w-full table-fixed border border-gray-300 bg-white border-collapse text-xs">
              <thead className="bg-blue-300">
                <tr>
                  <th className="p-2 text-xs font-bold text-white text-left border border-gray-300 uppercase w-1/2">
                    Addictive Habit
                  </th>
                  <th className="p-2 text-xs font-bold text-white text-center border border-gray-300 uppercase w-1/2">
                    Chance of Addiction
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(genesAndAddiction.data || {}).map(
                  ([key, entry], index) => (
                    <tr
                      key={key}
                      className={`transition-all duration-200 text-center ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-0 border border-gray-300">
                        <table className="w-full h-full table-fixed border-collapse">
                          <tbody>
                            <tr>
                              <td className="w-1/3 p-2 align-middle bg-blue-100">
                                <span className="text-xs font-semibold text-gray-800 uppercase">
                                  {entry.title}
                                </span>
                              </td>
                              <td className="w-[2px] border-gray-300"></td>
                              <td className="w-2/3 p-2 text-center">
                                {entry.icon && (
                                  <img
                                    src={`/addiction/icons/${entry.icon}.png`}
                                    alt={entry.title}
                                    className="w-20 h-24 object-contain mx-auto"
                                  />
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td
                        className="text-center border border-gray-300 align-middle"
                        style={{ width: "200px" }} // lock column width
                      >
                        {entry.sensitivityIcon && (
                          <div className="flex justify-center items-center h-full">
                            <img
                              src={`/addiction/sensitivity/${entry.sensitivityIcon}.png`}
                              alt="Chance of Addiction"
                              className="max-w-[170px] max-h-[100px] object-contain"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="mt-7" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/sleep.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />
        {/* Sleep & Rest */}

        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded uppercase">
            Sleep & Rest
          </h2>
        </div>
        <SectionTitle title="Sleep & Rest" icon="" />

        {sleepAndRest?.quote && (
          <p className="text-sm font-semibold italic text-center text- text-red-600 mb-3">
            "{sleepAndRest.quote}"
          </p>
        )}

        {sleepAndRest?.description && (
          <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
            {sleepAndRest.description}
          </p>
        )}

        <div className="overflow-x-auto rounded-sm shadow mb-4">
          <table className="min-w-full text-xs text-center border border-gray-300 table-fixed">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="w-[25%] p-1 border border-gray-300">
                  Sleep Parameter
                </th>
                <th className="w-[25%] p-1 border border-gray-300">
                  Genetic Icon
                </th>
                <th className="w-[50%] p-1 border border-gray-300">
                  Intervention Advice
                </th>
              </tr>
            </thead>
            <tbody>
              {sleepAndRest?.data &&
                Object.entries(sleepAndRest.data).map(([key, entry], index) => (
                  <tr
                    key={key}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {/* Sleep Parameter */}
                    <td className="p-1 border border-gray-300 bg-blue-200 font-medium text-center capitalize">
                      {entry.title?.trim()
                        ? entry.title
                        : key?.replace(/_/g, " ") || "No parameter"}
                    </td>

                    {/* Genetic Icon */}
                    <td className="p-1 border border-gray-300">
                      {entry.image ? (
                        <img
                          src={`/sleep/${entry.image}.png`}
                          alt={entry.title || key}
                          className="w-24 h-26 object-contain mx-auto"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/sleep/placeholder.png";
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 italic">No Image</span>
                      )}
                    </td>

                    {/* Intervention Advice */}
                    <td className="p-1 border border-gray-300 text-left whitespace-pre-line text-gray-700">
                      {entry.intervention?.trim() ? (
                        entry.intervention
                      ) : (
                        <span className="italic text-gray-400">
                          No advice available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/allergies.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Allergies & Sensitivity */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded uppercase">
            Allergies & Sensitivity
          </h2>
        </div>

        {typeof allergiesAndSensitivity === "object" &&
          ("quote" in allergiesAndSensitivity ||
            "description" in allergiesAndSensitivity) &&
          ((allergiesAndSensitivity as any).quote ||
            (allergiesAndSensitivity as any).description) && (
            <div className="mb-3 space-y-2">
              {"quote" in allergiesAndSensitivity &&
                (allergiesAndSensitivity as any).quote && (
                  <div className="text-sm font-semibold italic text-center text-red-600 mb-3">
                    "{(allergiesAndSensitivity as any).quote}"
                  </div>
                )}
              {"description" in allergiesAndSensitivity &&
                (allergiesAndSensitivity as any).description && (
                  <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
                    {(allergiesAndSensitivity as any).description}
                  </p>
                )}
            </div>
          )}

        <div className="overflow-x-auto shadow mb-4">
          <table className="min-w-full text-xs text-center border border-gray-300 table-fixed">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="w-[35%] p-2 border border-gray-300">
                  ALLERGIES
                </th>
                <th className="w-[65%] p-2 border border-gray-300">
                  TENDENCY OF ALLERGY
                </th>
              </tr>
            </thead>
            <tbody>
              {allergiesAndSensitivity.data &&
                Object.entries(allergiesAndSensitivity.data).map(
                  ([key, entry], index) => (
                    <tr
                      key={key}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-2 border border-gray-300 font-medium text-center capitalize">
                        {entry.title || `Allergy ${index + 1}`}
                      </td>
                      <td
                        className="p-2 border border-gray-300"
                        style={{ width: "100px" }}
                      >
                        {entry.image ? (
                          <img
                            src={`/allergies/${entry.image}.png`}
                            alt={entry.title}
                            className="max-w-[170px] max-h-[130px] object-contain mx-auto"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "/allergies/placeholder.png";
                            }}
                          />
                        ) : (
                          <span className="text-slate-400 italic">
                            No Image
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>

        {/* General Advice */}
        {typeof allergiesAndSensitivity === "object" &&
          "generalAdvice" in allergiesAndSensitivity &&
          typeof allergiesAndSensitivity.generalAdvice === "string" &&
          allergiesAndSensitivity.generalAdvice.trim() && (
            <div className="rounded shadow border border-gray-300 mt-4 overflow-hidden">
              {/* <div className="bg-orange-600 text-white px-2 py-2 font-semibold text-xs text-left">
                General Advice
              </div> */}
              <div className="bg-white p-2 text-xs text-justify whitespace-pre-line break-words leading-relaxed">
                {allergiesAndSensitivity.generalAdvice}
              </div>
            </div>
          )}

        <Separator className="my-4" />

        <div className="w-full max-w-4xl">
          <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
            <img
              src="/coverpages/summary.jpg"
              alt="What is Genomics Illustration"
              className="absolute top-0 left-0 w-full h-full object-contain rounded"
            />
          </div>
        </div>

        <Separator className="my-4" />
        {/* Preventive Health */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            PREVENTIVE HEALTH
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Diagnostic Tests Table */}
          <table className="min-w-full border border-gray-300 text-sm text-left">
            <thead>
              <tr className="bg-gray-400 text-white uppercase">
                <th
                  colSpan={3}
                  className="px-3 py-2 border text-black border-gray-400 text-center"
                >
                  Diagnostic Tests
                </th>
              </tr>
              <tr className="bg-gray-300 text-gray-900 uppercase">
                <th className="px-3 py-2 border border-gray-400 text-center">
                  Tests
                </th>
                <th className="px-3 py-2 border border-gray-400 text-center">
                  Half Yearly
                </th>
                <th className="px-3 py-2 border border-gray-400 text-center">
                  Yearly
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ...preventiveHealth.diagnosticTests.halfYearly.map((test) => ({
                  test,
                  half: "YES",
                  year: "",
                })),
                ...preventiveHealth.diagnosticTests.yearly.map((test) => ({
                  test,
                  half: "",
                  year: "YES",
                })),
              ].map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  <td className="px-3 py-2 border border-gray-300">
                    {row.test}
                  </td>
                  <td className="px-3 py-2 border border-gray-300 text-center">
                    {row.half}
                  </td>
                  <td className="px-3 py-2 border border-gray-300 text-center">
                    {row.year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Nutritional Supplements Table */}
          <table className="min-w-full border border-gray-300 text-sm text-left">
            <thead>
              <tr className="bg-blue-500 text-white uppercase">
                <th
                  colSpan={2}
                  className="px-3 py-2 border border-blue-500 text-center"
                >
                  Nutritional Supplements
                </th>
              </tr>
              <tr className="bg-blue-300 text-blue-900 uppercase">
                <th className="px-3 py-2 border border-blue-300 text-center">
                  Supplements
                </th>
                <th className="px-3 py-2 border border-blue-300 text-center">
                  Yes/No
                </th>
              </tr>
            </thead>
            <tbody>
              {preventiveHealth.nutritionalSupplements.map(
                (supplement, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-blue-100" : "bg-white"}
                  >
                    <td className="px-3 py-2 border border-gray-300">
                      {supplement.supplement}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 text-center">
                      {supplement.needed ? "YES" : ""}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Description Section at the Bottom */}

        <p className="text-sm text-black whitespace-pre-line text-justify mt-6">
          {preventiveHealth.description || "No description provided."}
        </p>

        <Separator className="my-4" />
        {/* Family Genetic Impact */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            FAMILY GENETIC IMPACT
          </h2>
        </div>
        <div className="overflow-x-auto">
          {familyGeneticImpactSection.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 p-3 whitespace-pre-line">
              {familyGeneticImpactSection.description}
            </p>
          )}

          {familyGeneticImpactSection.impacts.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              No family genetic impacts recorded.
            </p>
          ) : (
            <table className="w-full border border-blue-500 text-xs">
              <thead className="bg-blue-500 text-white text-center uppercase text-xs">
                <tr>
                  <th className="py-2 px-2 w-[20%]">Genes</th>
                  <th className="py-2 px-2 w-[30%]">Normal/Common Alleles</th>
                  <th className="py-2 px-2 w-[15%]">Your Result</th>
                  <th className="py-2 px-2 w-[35%]">Impact on Health</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {familyGeneticImpactSection.impacts.map((impact, index) => (
                  <tr key={index} className="border-t border-slate-200">
                    <td className="px-2 py-2 font-bold text-blue-700 uppercase border-r border-slate-200">
                      {impact.gene}
                    </td>
                    <td className="px-2 py-2">{impact.normalAlleles}</td>
                    <td className="px-2 py-2 font-mono">{impact.yourResult}</td>
                    <td className="px-2 py-2 text-center">
                      {impact.healthImpact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex justify-center items-center">
            <img
              src="/Family.png"
              alt="Family Genetic Impact"
              className="w-[400px] h-[400px] object-contain mt-4"
            />
          </div>
        </div>

        <Separator className="my-4" />
        {/* ===== Genomic Analysis Section (Moved Up) ===== */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            GENOMIC ANALYSIS
          </h2>
        </div>

        {/* Show description if available */}
        {reportData.genomicAnalysisTable?.description && (
          <p className="text-gray-600 text-justify leading-relaxed mb-4 p-3 text-xs">
            {reportData.genomicAnalysisTable.description}
          </p>
        )}
        <div className="mb-4 overflow-x-auto">
          {reportData.genomicAnalysisTable?.categories?.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              No genomic analysis data recorded.
            </p>
          ) : (
            <table className="w-full border border-blue-500 text-xs text-center">
              <thead className=" text-white bg-blue-400 uppercase text-xs">
                <tr>
                  <th className="py-2 px-2 w-[20%] border  border-blue-500">
                    Category
                  </th>
                  <th className="py-2 px-2 w-[22%] border border-blue-500">
                    Area
                  </th>
                  <th className="py-2 px-2 w-[28%] border border-blue-500">
                    Traits
                  </th>
                  <th className="py-2 px-2 w-[30%] border border-blue-500">
                    Genes
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.genomicAnalysisTable?.categories?.map(
                  (cat, catIndex) => {
                    // Sort by area while keeping other data intact
                    const sortedSubs = [...(cat.subcategories || [])].sort(
                      (a, b) => (a.area || "").localeCompare(b.area || "")
                    );

                    const subLen = sortedSubs.length || 1;
                    return sortedSubs.length > 0 ? (
                      sortedSubs.map((sub, subIndex) => (
                        <tr
                          key={`${catIndex}-${subIndex}`}
                          className="bg-white"
                        >
                          {subIndex === 0 && (
                            <td
                              className="px-3 py-2 border border-gray-300 text-center font-bold align-middle text-xs"
                              rowSpan={subLen}
                            >
                              {cat.category}
                            </td>
                          )}
                          <td className="px-3 py-2 border border-gray-300 text-center break-words text-xs">
                            {sub.area || "-"}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center break-words text-xs">
                            {sub.trait || "-"}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center break-words text-xs">
                            {sub.genes?.join(", ") || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key={`${catIndex}-empty`} className="bg-white">
                        <td className="px-3 py-2 border border-gray-300 text-center font-bold align-middle text-xs">
                          {cat.category}
                        </td>
                        <td
                          colSpan={3}
                          className="px-3 py-2 border border-gray-300 text-center italic text-gray-500 text-xs"
                        >
                          No rows added
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Now render the rest of the sections BELOW this */}
        <Separator className="my-4" />
        {/* Gene Test Results */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded uppercase">
            Gene Test Results
          </h2>
        </div>
        <div className="mb-4 overflow-x-auto">
          {geneTestResults.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              No gene test results recorded.
            </p>
          ) : (
            <table className="min-w-full border border-gray-200 text-xs text-left">
              <thead className="bg-blue-300 text-white">
                <tr>
                  <th className="px-3 py-2 border text-center uppercase">
                    Gene Code
                  </th>
                  <th className="px-3 py-2 border text-center uppercase">
                    Gene Name
                  </th>
                  <th className="px-3 py-2 border text-center uppercase">
                    Variation
                  </th>
                  <th className="px-3 py-2 border text-center uppercase">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {geneTestResults.map((result, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 border border-gray-300 font-mono whitespace-normal text-center break-words">
                      {result.genecode || "-"}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 whitespace-normal text-center break-words">
                      {result.geneName || "-"}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 font-mono whitespace-normal text-center break-words">
                      {result.variation || "-"}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 font-mono font-bold whitespace-normal text-center break-words">
                      {result.result || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Separator className="my-4" />
        {/* Enhanced Comprehensive Summary */}
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-2 bg-blue-600 text-white py-2 px-2 rounded">
            COMPREHENSIVE REPORT SUMMARY
          </h2>
        </div>
        {/* Generate comprehensive summary based on all data */}
        {(() => {
          // Analyze diet data in detail
          const dietAnalysis = Object.entries(groupedDietFields).reduce(
            (acc, [category, fields]) => {
              const scores = fields.map((f) => f.score);
              const levels = fields.map((f) => f.level);
              const highScores = fields.filter((f) => f.score >= 7);
              const mediumScores = fields.filter(
                (f) => f.score >= 4 && f.score < 7
              );
              const lowScores = fields.filter((f) => f.score < 4);
              const avgScore =
                scores.reduce((sum, score) => sum + score, 0) / scores.length ||
                0;

              const recommendations = fields.reduce((recAcc, field) => {
                if (field.recommendations) {
                  Object.entries(field.recommendations).forEach(
                    ([level, rec]) => {
                      if (field.selectedLevel === level) {
                        recAcc.push(`${field.label}: ${rec}`);
                      }
                    }
                  );
                } else if (field.recommendation) {
                  recAcc.push(`${field.label}: ${field.recommendation}`);
                }
                return recAcc;
              }, [] as string[]);

              acc[category] = {
                highScores: highScores.length,
                mediumScores: mediumScores.length,
                lowScores: lowScores.length,
                avgScore,
                total: fields.length,
                fields: fields,
                recommendations: recommendations.slice(0, 3), // Top 3 recommendations
              };
              return acc;
            },
            {} as Record<
              string,
              {
                highScores: number;
                mediumScores: number;
                lowScores: number;
                avgScore: number;
                total: number;
                fields: any[];
                recommendations: string[];
              }
            >
          );

          // Analyze nutrition data in detail
          const nutritionAnalysis = Object.entries(
            reportData.nutritionData?.data || {}
          ).reduce(
            (acc, [section, data]) => {
              const entries = Object.entries(data);
              const highImpact = entries.filter(
                ([_, item]) =>
                  item.healthImpact?.toLowerCase().includes("high") ||
                  item.healthImpact?.toLowerCase().includes("increased")
              );
              const lowImpact = entries.filter(
                ([_, item]) =>
                  item.healthImpact?.toLowerCase().includes("low") ||
                  item.healthImpact?.toLowerCase().includes("reduced")
              );
              const normalImpact = entries.filter(
                ([_, item]) =>
                  item.healthImpact?.toLowerCase().includes("normal") ||
                  item.healthImpact?.toLowerCase().includes("average")
              );
              const avgScore =
                entries.reduce((sum, [_, item]) => sum + (item.score || 0), 0) /
                  entries.length || 0;

              const detailedItems = entries.map(([key, item]) => ({
                name: key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase()),
                score: item.score,
                impact: item.healthImpact,
                level: item.intakeLevel,
                source: item.source,
              }));

              acc[section] = {
                highImpact: highImpact.length,
                lowImpact: lowImpact.length,
                normalImpact: normalImpact.length,
                avgScore,
                total: entries.length,
                items: detailedItems,
              };
              return acc;
            },
            {} as Record<
              string,
              {
                highImpact: number;
                lowImpact: number;
                normalImpact: number;
                avgScore: number;
                total: number;
                items: any[];
              }
            >
          );

          // Analyze lifestyle conditions in detail
          const lifestyleAnalysis = Object.entries(
            reportData.lifestyleConditions || {}
          )
            .filter(([key]) => !["quote", "description"].includes(key))
            .reduce(
              (acc, [category, conditions]) => {
                const entries = Object.entries(
                  conditions as Record<string, HealthConditionStatus>
                );
                const strengths = entries.filter(
                  ([_, data]) => data.status === "strength"
                );
                const improvements = entries.filter(
                  ([_, data]) => data.status === "improvement"
                );

                const detailedConditions = entries.map(([condition, data]) => ({
                  name: condition,
                  status: data.status,
                  description: data.description,
                  sensitivity: data.sensitivity,
                  recommendations: {
                    avoid: data.avoid || [],
                    follow: data.follow || [],
                    consume: data.consume || [],
                    monitor: data.monitor || [],
                  },
                }));

                acc[category] = {
                  strengths: strengths.length,
                  improvements: improvements.length,
                  total: entries.length,
                  conditions: detailedConditions,
                  hasImages: !!reportData.lifestyleCategoryImages?.[category],
                };
                return acc;
              },
              {} as Record<
                string,
                {
                  strengths: number;
                  improvements: number;
                  total: number;
                  conditions: any[];
                  hasImages: boolean;
                }
              >
            );

          // Analyze metabolic core in detail
          const metabolicAnalysis = Object.entries(metabolicCore)
            .filter(([key]) => key !== "quote" && key !== "description")
            .reduce(
              (acc, [area, data]) => {
                let genes: any[] = [];
                if (
                  typeof data === "object" &&
                  data !== null &&
                  "genes" in data &&
                  Array.isArray((data as any).genes)
                ) {
                  genes = (data as any).genes;
                }

                // Filter genes by impact level
                const highImpact = genes.filter((g) =>
                  g.impact?.toLowerCase().includes("high")
                );

                const lowImpact = genes.filter((g) =>
                  g.impact?.toLowerCase().includes("low")
                );

                const moderateImpact = genes.filter(
                  (g) =>
                    g.impact?.toLowerCase().includes("moderate") ||
                    g.impact?.toLowerCase().includes("average")
                );

                // Add normal impact filter
                const normalImpact = genes.filter((g) =>
                  g.impact?.toLowerCase().includes("normal")
                );

                const detailedGenes = genes.map((gene) => ({
                  name: gene.name,
                  genotype: gene.genotype,
                  impact: gene.impact,
                  advice: gene.advice,
                }));

                acc[area] = {
                  highImpact: highImpact.length,
                  moderateImpact: moderateImpact.length,
                  normalImpact: normalImpact.length, // Add this line
                  lowImpact: lowImpact.length,
                  total: genes.length,
                  genes: detailedGenes,
                };

                return acc;
              },
              {} as Record<
                string,
                {
                  highImpact: number;
                  moderateImpact: number;
                  normalImpact: number; // Add this to type definition
                  lowImpact: number;
                  total: number;
                  genes: any[];
                }
              >
            );

          // Analyze sports and fitness in detail
          const sportsAnalysis = Object.entries(sportsAndFitness)
            .filter(
              ([key]) => !["quote", "description", "customImages"].includes(key)
            )
            .reduce((acc, [section, groups]) => {
              if (Array.isArray(groups)) {
                const allFields = groups.reduce((fieldAcc, group) => {
                  return fieldAcc.concat(Object.entries(group.fields || {}));
                }, [] as any[]);

                const detailedTraits = allFields.map(
                  ([trait, data]: [string, any]) => {
                    const selectedImageKey = data.level
                      ?.split("-")
                      .pop()
                      ?.toLowerCase();
                    const hasImage = !!(
                      reportData.sportsAndFitness.customImages?.[
                        selectedImageKey
                      ] || defaultImageMap[selectedImageKey]
                    );

                    return {
                      name: trait,
                      level: data.level,
                      description: data.description,
                      label: data.label,
                      imageKey: selectedImageKey,
                      hasImage: hasImage,
                    };
                  }
                );

                acc[section] = {
                  totalTraits: allFields.length,
                  traits: detailedTraits,
                };
              }
              return acc;
            }, {} as Record<string, { totalTraits: number; traits: any[] }>);

          // Analyze digestive health in detail
          const digestiveAnalysis = Object.entries(
            digestiveHealth.data || {}
          ).reduce((acc, [key, item]) => {
            acc[key] = {
              title: item.title,
              sensitivity: item.sensitivity,
              good: item.good,
              bad: item.bad,
              icon: item.icon,
              hasIcon: !!item.icon,
            };
            return acc;
          }, {} as Record<string, any>);

          // Analyze genes & addiction in detail
          // Analyze genes & addiction in detail
          const addictionAnalysis = Object.entries(
            genesAndAddiction.data || {}
          ).reduce((acc, [key, entry]) => {
            acc[key] = {
              title: entry.title,
              icon: entry.icon, // Add this line
              sensitivityIcon: entry.sensitivityIcon, // Add this line
              hasIcon: !!entry.icon,
              hasSensitivityIcon: !!entry.sensitivityIcon,
            };
            return acc;
          }, {} as Record<string, any>);

          // Analyze sleep & rest in detail
          const sleepAnalysis = Object.entries(sleepAndRest.data || {}).reduce(
            (acc, [key, entry]) => {
              acc[key] = {
                title: entry.title,
                intervention: entry.intervention,
                image: (entry as any).image,
                hasImage: !!entry.image,
              };
              return acc;
            },
            {} as Record<string, any>
          );

          // Analyze allergies in detail
          const allergyAnalysis = Object.entries(
            allergiesAndSensitivity.data || {}
          ).reduce((acc, [key, entry]) => {
            const allergyEntry = entry as { title?: string; image?: string };
            acc[key] = {
              title: allergyEntry.title,
              image: allergyEntry.image,
              hasImage: !!allergyEntry.image,
            };
            return acc;
          }, {} as Record<string, any>);

          // Calculate overall scores and metrics
          const totalDietScore =
            Object.values(dietAnalysis).reduce(
              (sum, cat) => sum + cat.avgScore,
              0
            ) / Object.keys(dietAnalysis).length || 0;
          const totalNutritionScore =
            Object.values(nutritionAnalysis).reduce(
              (sum, cat) => sum + cat.avgScore,
              0
            ) / Object.keys(nutritionAnalysis).length || 0;
          const totalLifestyleStrengths = Object.values(
            lifestyleAnalysis
          ).reduce((sum, cat) => sum + cat.strengths, 0);
          const totalLifestyleImprovements = Object.values(
            lifestyleAnalysis
          ).reduce((sum, cat) => sum + cat.improvements, 0);
          const totalMetabolicHigh = Object.values(metabolicAnalysis).reduce(
            (sum, area) => sum + area.highImpact,
            0
          );
          const totalMetabolicLow = Object.values(metabolicAnalysis).reduce(
            (sum, area) => sum + area.lowImpact,
            0
          );
          const totalMetabolicModerate = Object.values(
            metabolicAnalysis
          ).reduce((sum, area) => sum + area.moderateImpact, 0);

          const totalMetabolicNormal = Object.values(metabolicAnalysis).reduce(
            (total, area) => total + (area.normalImpact || 0),
            0
          );

          return (
            <div className="space-y-4 mb-4">
              {/* Detailed Diet Analysis */}
              {Object.keys(dietAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-center mb-5 text-green-800">
                      COMPREHENSIVE DIETARY GENETIC ANALYSIS
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-xs text-gray-700">
                    <div className="w-full h-full text-center border rounded p-2 bg-gradient-to-br from-green-50 to-green-100">
                      <p className="font-semibold text-green-700 mb-1">
                        GENOMICS & DIET
                      </p>
                      <div className="h-80">
                        {" "}
                        {/* doubled height */}
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={Object.values(groupedDietFields).flatMap(
                              (fields) =>
                                fields.map((data) => ({
                                  field: data.label,
                                  score: Number(
                                    data.score ??
                                      (data.high ? 8 : data.medium ? 6 : 4)
                                  ),
                                }))
                            )}
                            margin={{ top: 10, right: 8, left: 30, bottom: 60 }}
                          >
                            <XAxis
                              dataKey="field"
                              axisLine
                              tickLine
                              tick={{ fontSize: 9, fill: "#16a34a" }}
                              stroke="#16a34a"
                              height={40}
                              angle={-45}
                              textAnchor="end"
                              interval={0}
                              tickFormatter={(value) => {
                                const str = String(value).toLowerCase();
                                return (
                                  str.charAt(0).toUpperCase() + str.slice(1)
                                );
                              }}
                            />

                            <YAxis
                              axisLine
                              tickLine
                              tick={{ fontSize: 9, fill: "#16a34a" }}
                              stroke="#16a34a"
                              width={30}
                              domain={[1, 10]}
                              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#f0fdf4",
                                border: "1px solid #16a34a",
                                borderRadius: "4px",
                                fontSize: "10px",
                              }}
                              formatter={(value, name, props) => [
                                value,
                                props.payload.field,
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#16a34a"
                              strokeWidth={2}
                              dot={{ fill: "#16a34a", strokeWidth: 1, r: 3 }}
                              activeDot={{
                                r: 4,
                                fill: "#16a34a",
                                stroke: "#fff",
                                strokeWidth: 1,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs mt-1">
                        Diet-related genetic scores
                      </p>
                    </div>

                    <div className="mb-3 p-2">
                      <p className="font-semibold my-3">
                        OVERALL DIET COMPATIBILITY: {totalDietScore.toFixed(1)}
                        /10
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-green-600 font-bold">
                            {Object.values(dietAnalysis).reduce(
                              (sum, cat) => sum + cat.highScores,
                              0
                            )}
                          </p>
                          <p className="text-xs">High Performers (7-10)</p>
                        </div>
                        <div>
                          <p className="text-yellow-600 font-bold">
                            {Object.values(dietAnalysis).reduce(
                              (sum, cat) => sum + cat.mediumScores,
                              0
                            )}
                          </p>
                          <p className="text-xs">Moderate (4-6)</p>
                        </div>
                        <div>
                          <p className="text-red-600 font-bold">
                            {Object.values(dietAnalysis).reduce(
                              (sum, cat) => sum + cat.lowScores,
                              0
                            )}
                          </p>
                          <p className="text-xs">Need Attention (0-3)</p>
                        </div>
                      </div>
                    </div>

                    {/* Visual Graph Section */}

                    <div className="mb-10 h-70">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={Object.entries(dietAnalysis).map(
                            ([category, data]) => ({
                              category:
                                category.charAt(0).toUpperCase() +
                                category.slice(1),
                              avgScore: Number(data.avgScore.toFixed(1)),
                              highScores: data.highScores,
                              mediumScores: data.mediumScores,
                              lowScores: data.lowScores,
                            })
                          )}
                          margin={{ top: 10, right: 8, left: 35, bottom: 60 }}
                        >
                          <XAxis
                            dataKey="category"
                            axisLine
                            tickLine
                            tick={{ fontSize: 9, fill: "#16a34a" }}
                            stroke="#16a34a"
                            height={30}
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis
                            axisLine
                            tickLine
                            tick={{ fontSize: 9, fill: "#16a34a" }}
                            stroke="#16a34a"
                            width={30}
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f0fdf4",
                              border: "1px solid #16a34a",
                              borderRadius: "4px",
                              fontSize: "10px",
                            }}
                            formatter={(value, name, props) => {
                              if (name === "avgScore") {
                                return [`${value}/10`, "Average Score"];
                              }
                              return [value, name];
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="avgScore"
                            stroke="#16a34a"
                            strokeWidth={2}
                            dot={{ fill: "#16a34a", strokeWidth: 1, r: 4 }}
                            activeDot={{
                              r: 5,
                              fill: "#16a34a",
                              stroke: "#fff",
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(dietAnalysis).map(([category, data]) => (
                        <div key={category} className=" rounded p-2 ">
                          <p className="font-semibold text-center capitalize mb-1">
                            {category}
                          </p>
                          <div className="mb-2">
                            <p>
                              Average Score:{" "}
                              <span
                                className={`font-bold ${
                                  data.avgScore >= 6
                                    ? "text-green-600"
                                    : data.avgScore >= 4
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {data.avgScore.toFixed(1)}/10
                              </span>
                            </p>
                            <p>
                              Distribution: {data.highScores}High /{" "}
                              {data.mediumScores}Medium / {data.lowScores}Low
                            </p>
                          </div>

                          {/* Mini Bar Chart for Distribution */}
                          <div className=" p-1 h-auto  mt-3 rounded">
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={[
                                    {
                                      name: "High",
                                      value: data.highScores,
                                      color: "#dc2626",
                                    },
                                    {
                                      name: "Medium",
                                      value: data.mediumScores,
                                      color: "#ca8a04",
                                    },
                                    {
                                      name: "Low",
                                      value: data.lowScores,
                                      color: "#16a34a",
                                    },
                                  ]}
                                  margin={{
                                    top: 5,
                                    right: 5,
                                    left: 5,
                                    bottom: 15,
                                  }}
                                >
                                  <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 8, fill: "#374151" }}
                                  />
                                  <YAxis hide />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#f9fafb",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "4px",
                                      fontSize: "10px",
                                      height: "full",
                                      borderBottomColor: "black",
                                    }}
                                    formatter={(value, name) => [
                                      `${value} genes`,
                                      name,
                                    ]}
                                  />
                                  <Bar
                                    dataKey="value"
                                    fill="#16a34a"
                                    radius={[2, 2, 0, 0]}
                                  >
                                    {[
                                      {
                                        name: "High",
                                        value: data.highScores,
                                        color: "#dc2626",
                                      },
                                      {
                                        name: "Medium",
                                        value: data.mediumScores,
                                        color: "#ca8a04",
                                      },
                                      {
                                        name: "Low",
                                        value: data.lowScores,
                                        color: "#16a34a",
                                      },
                                    ].map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {data.recommendations.length > 0 && (
                            <div>
                              <p className="font-semibold text-xs mb-1">
                                Key Recommendations:
                              </p>
                              <ul className="list-disc list-inside space-y-0">
                                {data.recommendations.map((rec, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs truncate"
                                    title={rec}
                                  >
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Nutrition Analysis */}
              {Object.keys(nutritionAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-center text-blue-800">
                      DETAILED NUTRITIONAL GENOMICS PROFILE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-700">
                    <div className="w-full print:w-[700px] mx-auto mb-6 print:mb-4">
                      {/* Chart for Nutrition */}
                      <div className="mb-4 text-center border rounded p-2 bg-gradient-to-br from-blue-50 to-blue-100">
                        <p className="font-semibold text-blue-700 mb-1">
                          NUTRITION SCORE OVERVIEW
                        </p>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={Object.entries(
                                reportData.nutritionData?.data || {}
                              ).flatMap(([sectionName, sectionData]) =>
                                Object.entries(sectionData).map(
                                  ([key, data]) => ({
                                    field: key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      ),
                                    score: Number(
                                      data.score ??
                                        (data.high ? 8 : data.medium ? 6 : 4)
                                    ),
                                  })
                                )
                              )}
                              margin={{
                                top: 10,
                                right: 8,
                                left: 30,
                                bottom: 60,
                              }}
                            >
                              <XAxis
                                dataKey="field"
                                axisLine
                                tickLine
                                tick={{ fontSize: 9, fill: "#2563eb" }}
                                stroke="#2563eb"
                                height={40}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                              />
                              <YAxis
                                axisLine
                                tickLine
                                tick={{ fontSize: 9, fill: "#2563eb" }}
                                stroke="#2563eb"
                                width={30}
                                domain={[1, 10]}
                                ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#eff6ff",
                                  border: "1px solid #2563eb",
                                  borderRadius: "4px",
                                  fontSize: "10px",
                                }}
                                formatter={(value, name, props) => [
                                  value,
                                  props.payload.field,
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ fill: "#2563eb", strokeWidth: 1, r: 3 }}
                                activeDot={{
                                  r: 4,
                                  fill: "#2563eb",
                                  stroke: "#fff",
                                  strokeWidth: 1,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs mt-1">
                          Nutrient-level genetic scores
                        </p>
                      </div>
                    </div>
                    <div className="mb-3 p-2 ">
                      <p className="font-semibold my-3">
                        NUTRITION GENETIC SCORE:{" "}
                        {totalNutritionScore.toFixed(1)}/10
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-red-600 font-bold">
                            {Object.values(nutritionAnalysis).reduce(
                              (sum, cat) => sum + cat.highImpact,
                              0
                            )}
                          </p>
                          <p className="text-xs">High Impact Factors</p>
                        </div>
                        <div>
                          <p className="text-yellow-600 font-bold">
                            {Object.values(nutritionAnalysis).reduce(
                              (sum, cat) => sum + cat.normalImpact,
                              0
                            )}
                          </p>
                          <p className="text-xs">Normal Impact</p>
                        </div>
                        <div>
                          <p className="text-green-600 font-bold">
                            {Object.values(nutritionAnalysis).reduce(
                              (sum, cat) => sum + cat.lowImpact,
                              0
                            )}
                          </p>
                          <p className="text-xs">Low Impact Factors</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(nutritionAnalysis).map(
                        ([section, data]) => (
                          <div
                            key={section}
                            className="border rounded p-2 bg-white"
                          >
                            <p className="font-semibold text-center uppercase mb-1">
                              {section.replace(/([A-Z])/g, " $1")}
                            </p>
                            <div className="mb-2">
                              <p>
                                Avg Score:{" "}
                                <span className="font-bold text-blue-600">
                                  {data.avgScore.toFixed(1)}/10
                                </span>
                              </p>
                              <p>
                                Impact Distribution: {data.highImpact}H /{" "}
                                {data.normalImpact}N / {data.lowImpact}L
                              </p>
                            </div>

                            {data.items.length > 0 && (
                              <div>
                                <p className="font-semibold text-xs mb-1">
                                  Key Nutrients:
                                </p>
                                <div className="space-y-1">
                                  {data.items.slice(0, 3).map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs flex items-center"
                                    >
                                      <div
                                        className={`w-2 h-2 rounded-full mr-1 ${
                                          item.score >= 7
                                            ? "bg-green-500"
                                            : item.score >= 4
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                      ></div>
                                      <span className="font-medium">
                                        {item.name}:
                                      </span>{" "}
                                      {item.impact} ({item.score}/10)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Lifestyle Analysis */}
              {Object.keys(lifestyleAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-center font-bold mb-4 text-yellow-800">
                      COMPREHENSIVE LIFESTYLE GENETIC ASSESSMENT
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-700">
                    <div className="mb-3 p-2 ">
                      <p className="font-semibold mb-3">
                        LIFESTYLE BALANCE OVERVIEW
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-green-600 font-bold text-lg">
                            {totalLifestyleStrengths}
                          </p>
                          <p className="text-xs">
                            Genetic Strengths to Leverage
                          </p>
                        </div>
                        <div>
                          <p className="text-red-600 font-bold text-lg">
                            {totalLifestyleImprovements}
                          </p>
                          <p className="text-xs">Areas Requiring Attention</p>
                        </div>
                      </div>
                    </div>

                    {/* Simple Overview Chart */}
                    <div className="mb-4 p-2 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded border">
                      <p className="font-semibold text-yellow-700 mb-2 text-center">
                        YOUR LIFESTYLE BALANCE
                      </p>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(lifestyleAnalysis).map(
                              ([category, data]) => ({
                                category: category
                                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                                  .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                                  .replace(/&/g, " & ")
                                  .replace(/\s+/g, " ")
                                  .trim(),
                                strengths: data.strengths,
                                improvements: data.improvements,
                              })
                            )}
                            margin={{ top: 10, right: 8, left: 15, bottom: 40 }}
                          >
                            <XAxis
                              dataKey="category"
                              axisLine
                              tickLine
                              tick={{ fontSize: 9, fill: "#a16207" }}
                              stroke="#a16207"
                              angle={-45}
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis
                              axisLine
                              tickLine
                              tick={{ fontSize: 9, fill: "#a16207" }}
                              stroke="#a16207"
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fffbeb",
                                border: "1px solid #a16207",
                                borderRadius: "4px",
                                fontSize: "10px",
                              }}
                            />
                            <Bar
                              dataKey="strengths"
                              fill="#16a34a"
                              name="Strengths"
                              radius={[2, 2, 0, 0]}
                            />
                            <Bar
                              dataKey="improvements"
                              fill="#dc2626"
                              name="Need Attention"
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-xs text-yellow-700">
                            Your Strengths
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span className="text-xs text-yellow-700">
                            Need Attention
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(lifestyleAnalysis).map(
                        ([category, data]) => (
                          <div
                            key={category}
                            className="border rounded p-2 bg-white"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {data.hasImages &&
                                reportData.lifestyleCategoryImages?.[
                                  category
                                ] && (
                                  <img
                                    src={
                                      reportData.lifestyleCategoryImages[
                                        category
                                      ] || "/placeholder.svg"
                                    }
                                    alt={category}
                                    className="w-4 h-4 rounded object-cover"
                                  />
                                )}
                              <p className="font-semibold capitalize">
                                {category.replace(/([A-Z])/g, " $1")}
                              </p>
                            </div>

                            <div className="mb-2">
                              <p>
                                Balance:{" "}
                                <span className="text-green-600 font-bold">
                                  {data.strengths}
                                </span>{" "}
                                strengths /{" "}
                                <span className="text-red-600 font-bold">
                                  {data.improvements}
                                </span>{" "}
                                improvements
                              </p>
                              <p>Total Conditions: {data.total}</p>
                            </div>

                            {/* Simple Balance Visualization */}
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-green-600">
                                  Strengths
                                </span>
                                <span className="text-red-600">
                                  Need Attention
                                </span>
                              </div>
                              <div className="flex h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="bg-green-500"
                                  style={{
                                    width:
                                      data.total > 0
                                        ? `${
                                            (data.strengths / data.total) * 100
                                          }%`
                                        : "0%",
                                  }}
                                ></div>
                                <div
                                  className="bg-red-500"
                                  style={{
                                    width:
                                      data.total > 0
                                        ? `${
                                            (data.improvements / data.total) *
                                            100
                                          }%`
                                        : "0%",
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-green-600">
                                  {data.strengths}
                                </span>
                                <span className="text-red-600">
                                  {data.improvements}
                                </span>
                              </div>
                            </div>

                            {data.conditions.length > 0 && (
                              <div>
                                <p className="font-semibold text-xs mb-1">
                                  Key Conditions:
                                </p>
                                <div className="space-y-1">
                                  {data.conditions
                                    .slice(0, 3)
                                    .map((condition, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs flex items-center gap-1"
                                      >
                                        {condition.status === "strength" ? (
                                          <Check className="text-green-600 w-2 h-2" />
                                        ) : (
                                          <Check className="text-red-600 w-2 h-2" />
                                        )}
                                        <span className="truncate">
                                          {condition.name}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Metabolic Analysis */}
              {Object.keys(metabolicAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  {/* HEADER SECTION */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-red-800">
                      COMPREHENSIVE METABOLIC GENETIC PROFILE
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-xs text-gray-700">
                    {/* TOP STATISTICS GRID - Shows total counts for each impact category */}
                    <div className="mb-3 p-2">
                      <p className="font-semibold mb-1">
                        METABOLIC GENE IMPACT DISTRIBUTION
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {/* High Impact Count */}
                        <div>
                          <p className="text-red-600 font-bold text-lg">
                            {totalMetabolicHigh}
                          </p>
                          <p className="text-xs">High Impact</p>
                        </div>

                        {/* Moderate Impact Count */}
                        <div>
                          <p className="text-yellow-600 font-bold text-lg">
                            {totalMetabolicModerate}
                          </p>
                          <p className="text-xs">Moderate</p>
                        </div>

                        {/* Normal Impact Count - NEW */}
                        <div>
                          <p className="text-blue-600 font-bold text-lg">
                            {totalMetabolicNormal}
                          </p>
                          <p className="text-xs">Normal</p>
                        </div>

                        {/* Low Impact Count */}
                        <div>
                          <p className="text-green-600 font-bold text-lg">
                            {totalMetabolicLow}
                          </p>
                          <p className="text-xs">Low Impact</p>
                        </div>
                      </div>
                    </div>

                    {/* MAIN CHART CONTAINER */}
                    <div className="mb-4 p-2 bg-gradient-to-br from-red-50 to-red-100 rounded border">
                      <p className="font-semibold text-red-700 mb-2 text-center">
                        YOUR METABOLIC GENE IMPACT
                      </p>

                      {/* OVERALL IMPACT PROGRESS BAR */}
                      <div className="mb-3">
                        {/* Labels above the bar */}
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-red-600">High</span>
                          <span className="text-yellow-600">Moderate</span>
                          <span className="text-blue-600">Normal</span>
                          <span className="text-green-600">Low</span>
                        </div>

                        {/* The actual progress bar */}
                        <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                          {/* High Impact Section - Red */}
                          <div
                            className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              width: `${
                                (totalMetabolicHigh /
                                  (totalMetabolicHigh +
                                    totalMetabolicModerate +
                                    totalMetabolicNormal +
                                    totalMetabolicLow)) *
                                  100 || 0
                              }%`,
                            }}
                          >
                            {/* Only show number if greater than 0 */}
                            {totalMetabolicHigh > 0 && totalMetabolicHigh}
                          </div>

                          {/* Moderate Impact Section - Yellow */}
                          <div
                            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              width: `${
                                (totalMetabolicModerate /
                                  (totalMetabolicHigh +
                                    totalMetabolicModerate +
                                    totalMetabolicNormal +
                                    totalMetabolicLow)) *
                                  100 || 0
                              }%`,
                            }}
                          >
                            {totalMetabolicModerate > 0 &&
                              totalMetabolicModerate}
                          </div>

                          {/* Normal Impact Section - Blue (NEW) */}
                          <div
                            className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              width: `${
                                (totalMetabolicNormal /
                                  (totalMetabolicHigh +
                                    totalMetabolicModerate +
                                    totalMetabolicNormal +
                                    totalMetabolicLow)) *
                                  100 || 0
                              }%`,
                            }}
                          >
                            {totalMetabolicNormal > 0 && totalMetabolicNormal}
                          </div>

                          {/* Low Impact Section - Green */}
                          <div
                            className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              width: `${
                                (totalMetabolicLow /
                                  (totalMetabolicHigh +
                                    totalMetabolicModerate +
                                    totalMetabolicNormal +
                                    totalMetabolicLow)) *
                                  100 || 0
                              }%`,
                            }}
                          >
                            {totalMetabolicLow > 0 && totalMetabolicLow}
                          </div>
                        </div>
                      </div>

                      {/* STACKED BAR CHART BY METABOLIC AREA */}
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(metabolicAnalysis).map(
                              ([area, data]) => ({
                                // Format area name for display
                                area: area
                                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                                  .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                                  .replace(/&/g, " & ")
                                  .replace(/\s+/g, " ")
                                  .trim(),
                                // Data for each impact level
                                high: data.highImpact,
                                moderate: data.moderateImpact,
                                normal: data.normalImpact, // NEW
                                low: data.lowImpact,
                                total: data.total,
                              })
                            )}
                            margin={{
                              top: 10,
                              right: 8,
                              left: 15,
                              bottom: 100,
                            }}
                          >
                            {/* X-Axis - Metabolic Area Names */}
                            <XAxis
                              dataKey="area"
                              axisLine
                              tickLine
                              tick={{ fontSize: 9, fill: "#991b1b" }}
                              stroke="#991b1b"
                              angle={-45}
                              textAnchor="end"
                              interval={0}
                            />

                            {/* Y-Axis - Gene Count */}
                            <YAxis
                              axisLine
                              tickLine
                              tick={{ fontSize: 9, fill: "#991b1b" }}
                              stroke="#991b1b"
                              label={{
                                value: "Gene Count",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />

                            {/* Tooltip on hover */}
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fef2f2",
                                border: "1px solid #991b1b",
                                borderRadius: "4px",
                                fontSize: "10px",
                              }}
                            />

                            {/* Stacked Bars - Each impact level */}
                            {/* High Impact Bar - Red */}
                            <Bar
                              dataKey="high"
                              stackId="impact"
                              fill="#dc2626"
                              name="High Impact"
                              radius={[0, 0, 0, 0]}
                            />

                            {/* Moderate Impact Bar - Yellow */}
                            <Bar
                              dataKey="moderate"
                              stackId="impact"
                              fill="#eab308"
                              name="Moderate Impact"
                              radius={[0, 0, 0, 0]}
                            />

                            {/* Normal Impact Bar - Blue (NEW) */}
                            <Bar
                              dataKey="normal"
                              stackId="impact"
                              fill="#3b82f6"
                              name="Normal"
                              radius={[0, 0, 0, 0]}
                            />

                            {/* Low Impact Bar - Green */}
                            <Bar
                              dataKey="low"
                              stackId="impact"
                              fill="#16a34a"
                              name="Low Impact"
                              radius={[2, 2, 0, 0]} // Rounded top corners
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* CHART LEGEND */}
                      <div className="flex justify-center gap-3 mt-1">
                        {/* High Impact Legend */}
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span className="text-xs text-red-700">
                            High Impact
                          </span>
                        </div>

                        {/* Moderate Impact Legend */}
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span className="text-xs text-red-700">Moderate</span>
                        </div>

                        {/* Normal Impact Legend - NEW */}
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-xs text-red-700">Normal</span>
                        </div>

                        {/* Low Impact Legend */}
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-xs text-red-700">
                            Low Impact
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DETAILED AREA BREAKDOWN CARDS */}
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(metabolicAnalysis).map(([area, data]) => (
                        <div key={area} className="border rounded p-2 bg-white">
                          {/* Area Name */}
                          <p className="font-semibold capitalize mb-1">
                            {area
                              .replace(/([a-z])([A-Z])/g, "$1 $2")
                              .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
                              .replace(/&/g, " & ")
                              .replace(/\s+/g, " ")
                              .trim()}
                          </p>

                          {/* Area Statistics */}
                          <div className="mb-2">
                            <p>Total Genes: {data.total}</p>
                            <p>
                              Impact:{" "}
                              <span className="text-red-600">
                                {data.highImpact}H
                              </span>{" "}
                              /{" "}
                              <span className="text-yellow-600">
                                {data.moderateImpact}M
                              </span>{" "}
                              /{" "}
                              <span className="text-blue-600">
                                {data.normalImpact}N
                              </span>{" "}
                              /{" "}
                              <span className="text-green-600">
                                {data.lowImpact}L
                              </span>
                            </p>
                          </div>

                          {/* Area-Specific Progress Bar */}
                          <div className="mb-2">
                            <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                              {/* High Impact Section */}
                              <div
                                className="bg-red-500"
                                style={{
                                  width:
                                    data.total > 0
                                      ? `${
                                          (data.highImpact / data.total) * 100
                                        }%`
                                      : "0%",
                                }}
                              ></div>

                              {/* Moderate Impact Section */}
                              <div
                                className="bg-yellow-500"
                                style={{
                                  width:
                                    data.total > 0
                                      ? `${
                                          (data.moderateImpact / data.total) *
                                          100
                                        }%`
                                      : "0%",
                                }}
                              ></div>

                              {/* Normal Impact Section - NEW */}
                              <div
                                className="bg-blue-500"
                                style={{
                                  width:
                                    data.total > 0
                                      ? `${
                                          (data.normalImpact / data.total) * 100
                                        }%`
                                      : "0%",
                                }}
                              ></div>

                              {/* Low Impact Section */}
                              <div
                                className="bg-green-500"
                                style={{
                                  width:
                                    data.total > 0
                                      ? `${
                                          (data.lowImpact / data.total) * 100
                                        }%`
                                      : "0%",
                                }}
                              ></div>
                            </div>

                            {/* Numbers under the progress bar */}
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-red-600">
                                {data.highImpact}
                              </span>
                              <span className="text-yellow-600">
                                {data.moderateImpact}
                              </span>
                              <span className="text-blue-600">
                                {data.normalImpact}
                              </span>
                              <span className="text-green-600">
                                {data.lowImpact}
                              </span>
                            </div>
                          </div>

                          {/* KEY GENES LIST */}
                          {data.genes.length > 0 && (
                            <div>
                              <p className="font-semibold text-xs mb-1">
                                Key Genes:
                              </p>
                              <div className="space-y-1">
                                {/* Show only first 3 genes */}
                                {data.genes.slice(0, 3).map((gene, idx) => (
                                  <div key={idx} className="text-xs">
                                    <div className="flex items-center gap-1">
                                      {/* Color-coded impact indicator */}
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          gene.impact
                                            ?.toLowerCase()
                                            .includes("high")
                                            ? "bg-red-500"
                                            : gene.impact
                                                ?.toLowerCase()
                                                .includes("moderate") ||
                                              gene.impact
                                                ?.toLowerCase()
                                                .includes("average")
                                            ? "bg-yellow-500"
                                            : gene.impact
                                                ?.toLowerCase()
                                                .includes("normal")
                                            ? "bg-blue-500" // NEW
                                            : "bg-green-500" // Low impact
                                        }`}
                                      ></span>
                                      {/* Gene name and genotype */}
                                      <span className="font-medium">
                                        {gene.name}:
                                      </span>{" "}
                                      {gene.genotype}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sports & Fitness Analysis (only if data exists) */}
              {Object.keys(sportsAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-orange-800">
                      DETAILED FITNESS GENETIC POTENTIAL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-700">
                    <div className="mb-3 p-2 bg-white rounded border">
                      <p className="font-semibold mb-1">
                        FITNESS GENETIC OVERVIEW
                      </p>
                      <p>
                        Total Traits Analyzed:{" "}
                        {Object.values(sportsAnalysis).reduce(
                          (sum, section) => sum + section.totalTraits,
                          0
                        )}{" "}
                        across {Object.keys(sportsAnalysis).length} categories
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(sportsAnalysis).map(([section, data]) => (
                        <div
                          key={section}
                          className="border rounded p-2 bg-white"
                        >
                          <p className="font-semibold capitalize mb-1">
                            {section.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="mb-2">Traits: {data.totalTraits}</p>

                          {data.traits.length > 0 && (
                            <div>
                              <p className="font-semibold text-xs mb-1">
                                Key Traits:
                              </p>
                              <div className="space-y-1">
                                {data.traits.slice(0, 3).map((trait, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs flex items-center gap-2"
                                  >
                                    {trait.hasImage && (
                                      <img
                                        src={
                                          reportData.sportsAndFitness
                                            .customImages?.[trait.imageKey] ||
                                          defaultImageMap[trait.imageKey] ||
                                          "/sports/default.png"
                                        }
                                        alt={trait.imageKey}
                                        className="w-4 h-4 object-contain"
                                      />
                                    )}
                                    <div>
                                      <span className="font-medium">
                                        {trait.label}:
                                      </span>{" "}
                                      {trait.level
                                        ?.split("-")
                                        .pop()
                                        ?.toUpperCase()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Digestive Health Analysis (only if data exists) */}
              {Object.keys(digestiveAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-pink-800">
                      DIGESTIVE HEALTH GENETIC ANALYSIS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-700">
                    <div className="mb-3 p-2">
                      <p className="font-semibold mb-1">
                        DIGESTIVE SENSITIVITY OVERVIEW
                      </p>
                      <p>
                        Total Parameters:{" "}
                        {Object.keys(digestiveAnalysis).length}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-center mt-2">
                        <div>
                          <p className="text-red-600 font-bold">
                            {
                              Object.values(digestiveAnalysis).filter(
                                (item) => item.sensitivity === "High"
                              ).length
                            }
                          </p>
                          <p className="text-xs">High Sensitivity</p>
                        </div>
                        <div>
                          <p className="text-green-600 font-bold">
                            {
                              Object.values(digestiveAnalysis).filter(
                                (item) => item.sensitivity === "Low"
                              ).length
                            }
                          </p>
                          <p className="text-xs">Low Sensitivity</p>
                        </div>
                      </div>
                    </div>

                    {/* Simple Overview Chart */}
                    <div className="mb-4 p-2 bg-gradient-to-br from-pink-50 to-pink-100 rounded border">
                      <p className="font-semibold text-pink-700 mb-2 text-center">
                        YOUR DIGESTIVE SENSITIVITY PROFILE
                      </p>

                      {/* Overall Sensitivity Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-red-600">High Sensitivity</span>
                          <span className="text-green-600">
                            Low Sensitivity
                          </span>
                        </div>
                        <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              width: `${
                                (Object.values(digestiveAnalysis).filter(
                                  (item) => item.sensitivity === "High"
                                ).length /
                                  Object.keys(digestiveAnalysis).length) *
                                  100 || 0
                              }%`,
                            }}
                          >
                            {Object.values(digestiveAnalysis).filter(
                              (item) => item.sensitivity === "High"
                            ).length > 0 &&
                              Object.values(digestiveAnalysis).filter(
                                (item) => item.sensitivity === "High"
                              ).length}
                          </div>
                          <div
                            className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              width: `${
                                (Object.values(digestiveAnalysis).filter(
                                  (item) => item.sensitivity === "Low"
                                ).length /
                                  Object.keys(digestiveAnalysis).length) *
                                  100 || 0
                              }%`,
                            }}
                          >
                            {Object.values(digestiveAnalysis).filter(
                              (item) => item.sensitivity === "Low"
                            ).length > 0 &&
                              Object.values(digestiveAnalysis).filter(
                                (item) => item.sensitivity === "Low"
                              ).length}
                          </div>
                        </div>
                        <p className="text-xs text-center mt-1 text-pink-600">
                          {Object.values(digestiveAnalysis).filter(
                            (item) => item.sensitivity === "High"
                          ).length >
                          Object.values(digestiveAnalysis).filter(
                            (item) => item.sensitivity === "Low"
                          ).length
                            ? "You may need to be more careful with certain foods"
                            : "You have good genetic tolerance for most foods"}
                        </p>
                      </div>

                      {/* Simple Visual List */}
                      <div className="h-full overflow-y-auto">
                        <div className="space-y-2">
                          {Object.entries(digestiveAnalysis)
                            .sort(([, a], [, b]) =>
                              a.sensitivity === "High" ? -1 : 1
                            )
                            .map(([key, item]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between bg-white rounded p-2 border"
                              >
                                <div className="flex items-center gap-2">
                                  {item.icon && (
                                    <img
                                      src={`/digestive/${item.icon}.png`}
                                      alt={item.title}
                                      className="w-3 h-3 object-contain"
                                    />
                                  )}
                                  <span className="text-xs font-medium">
                                    {item.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      item.sensitivity === "High"
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-xs font-bold ${
                                      item.sensitivity === "High"
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {item.sensitivity}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-pink-700">
                            High Sensitivity
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-pink-700">
                            Low Sensitivity
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 h-full">
                      {Object.entries(digestiveAnalysis).map(([key, item]) => (
                        <div
                          key={key}
                          className="border rounded p-2 h-full bg-white"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {item.icon && (
                              <img
                                src={`/digestive/${item.icon}.png`}
                                alt={item.title}
                                className="w-4 h-4 object-contain"
                              />
                            )}
                            <p className="font-semibold">{item.title}</p>
                          </div>

                          {/* Sensitivity Indicator Bar */}
                          <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs">
                                Sensitivity Level:
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  item.sensitivity === "High"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {item.sensitivity}
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  item.sensitivity === "High"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width:
                                    item.sensitivity === "High" ? "85%" : "25%",
                                }}
                              ></div>
                            </div>
                          </div>

                          {item.sensitivity === "High" && item.bad && (
                            <p className="text-xs text-red-700">
                              {item.bad.substring(0, 5000)}...
                            </p>
                          )}
                          {item.sensitivity === "Low" && item.good && (
                            <p className="text-xs text-green-700">
                              {item.good.substring(0, 5000)}...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Addiction Analysis (only if data exists) */}
              {Object.keys(addictionAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-indigo-800">
                      ADDICTION SUSCEPTIBILITY GENETIC PROFILE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-700">
                    <div className="mb-3 p-2 bg-white rounded ">
                      <p className="font-semibold mb-1">
                        ADDICTION GENETIC FACTORS
                      </p>
                      <p>
                        Total Substances Analyzed:{" "}
                        {Object.keys(addictionAnalysis).length}
                      </p>
                    </div>

                    {/* Simple Risk Overview */}
                    <div className="mb-4 p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded border">
                      <p className="font-semibold text-indigo-700 mb-2 text-center">
                        YOUR GENETIC SUSCEPTIBILITY OVERVIEW
                      </p>

                      {/* Risk Level Summary */}
                      <div className="mb-3 p-2 bg-white rounded border">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-red-600 font-bold text-lg">
                              {
                                Object.values(addictionAnalysis).filter(
                                  (item) =>
                                    item.sensitivityIcon?.includes("high") ||
                                    item.title?.toLowerCase().includes("high")
                                ).length
                              }
                            </p>
                            <p className="text-xs">Higher Risk</p>
                          </div>
                          <div>
                            <p className="text-yellow-600 font-bold text-lg">
                              {
                                Object.values(addictionAnalysis).filter(
                                  (item) =>
                                    item.sensitivityIcon?.includes("medium") ||
                                    item.sensitivityIcon?.includes(
                                      "moderate"
                                    ) ||
                                    item.title
                                      ?.toLowerCase()
                                      .includes("medium") ||
                                    item.title
                                      ?.toLowerCase()
                                      .includes("moderate")
                                ).length
                              }
                            </p>
                            <p className="text-xs">Moderate Risk</p>
                          </div>
                          <div>
                            <p className="text-green-600 font-bold text-lg">
                              {
                                Object.values(addictionAnalysis).filter(
                                  (item) =>
                                    item.sensitivityIcon?.includes("low") ||
                                    item.title?.toLowerCase().includes("low")
                                ).length
                              }
                            </p>
                            <p className="text-xs">Lower Risk</p>
                          </div>
                        </div>
                      </div>

                      {/* Awareness Message */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                        <p className="text-xs text-blue-800 text-center">
                          <strong>Important:</strong> Genetics is just one
                          factor. Environment, lifestyle, and personal choices
                          play major roles in addiction risk.
                        </p>
                      </div>

                      {/* Simple Visual List with Risk Levels */}
                      <div className="h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {Object.entries(addictionAnalysis)
                            .sort(([, a], [, b]) => {
                              // Sort by risk level (high risk first)
                              const getRiskLevel = (item) => {
                                if (
                                  item.sensitivityIcon?.includes("high") ||
                                  item.title?.toLowerCase().includes("high")
                                )
                                  return 3;
                                if (
                                  item.sensitivityIcon?.includes("medium") ||
                                  item.sensitivityIcon?.includes("moderate") ||
                                  item.title
                                    ?.toLowerCase()
                                    .includes("medium") ||
                                  item.title?.toLowerCase().includes("moderate")
                                )
                                  return 2;
                                return 1;
                              };
                              return getRiskLevel(b) - getRiskLevel(a);
                            })
                            .map(([key, item]) => {
                              const isHighRisk =
                                item.sensitivityIcon?.includes("high") ||
                                item.title?.toLowerCase().includes("high");
                              const isMediumRisk =
                                item.sensitivityIcon?.includes("medium") ||
                                item.sensitivityIcon?.includes("moderate") ||
                                item.title?.toLowerCase().includes("medium") ||
                                item.title?.toLowerCase().includes("moderate");
                              const riskLevel = isHighRisk
                                ? "Higher"
                                : isMediumRisk
                                ? "Moderate"
                                : "Lower";
                              const riskColor = isHighRisk
                                ? "red"
                                : isMediumRisk
                                ? "yellow"
                                : "green";

                              return (
                                <div
                                  key={key}
                                  className="flex items-center justify-between bg-white rounded p-2 border"
                                >
                                  <div className="flex items-center gap-2">
                                    {item.icon && (
                                      <img
                                        src={`/addiction/icons/${item.icon}.png`}
                                        alt={item.title}
                                        className="w-4 h-4 object-contain"
                                      />
                                    )}
                                    <span className="text-xs font-medium">
                                      {item.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          riskColor === "red"
                                            ? "bg-red-500"
                                            : riskColor === "yellow"
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                      ></div>
                                      <span
                                        className={`text-xs font-bold ${
                                          riskColor === "red"
                                            ? "text-red-600"
                                            : riskColor === "yellow"
                                            ? "text-yellow-600"
                                            : "text-green-600"
                                        }`}
                                      >
                                        {riskLevel}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-indigo-700">
                            Higher Risk
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-indigo-700">
                            Moderate Risk
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-indigo-700">
                            Lower Risk
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(addictionAnalysis).map(([key, item]) => {
                        const isHighRisk =
                          item.sensitivityIcon?.includes("high") ||
                          item.title?.toLowerCase().includes("high");
                        const isMediumRisk =
                          item.sensitivityIcon?.includes("medium") ||
                          item.sensitivityIcon?.includes("moderate") ||
                          item.title?.toLowerCase().includes("medium") ||
                          item.title?.toLowerCase().includes("moderate");
                        const riskLevel = isHighRisk
                          ? "Higher Risk"
                          : isMediumRisk
                          ? "Moderate Risk"
                          : "Lower Risk";
                        const riskColor = isHighRisk
                          ? "red"
                          : isMediumRisk
                          ? "yellow"
                          : "green";

                        return (
                          <div
                            key={key}
                            className="border rounded p-2 bg-white"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {item.icon && (
                                <img
                                  src={`/addiction/icons/${item.icon}.png`}
                                  alt={item.title}
                                  className="w-6 h-6 object-contain"
                                />
                              )}
                              <p className="font-semibold">{item.title}</p>
                            </div>

                            {/* Risk Level Indicator */}
                            <div className="mb-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs">Genetic Risk:</span>
                                <span
                                  className={`text-xs font-bold ${
                                    riskColor === "red"
                                      ? "text-red-600"
                                      : riskColor === "yellow"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {riskLevel}
                                </span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    riskColor === "red"
                                      ? "bg-red-500"
                                      : riskColor === "yellow"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{
                                    width: isHighRisk
                                      ? "80%"
                                      : isMediumRisk
                                      ? "55%"
                                      : "30%",
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex justify-center">
                              {item.sensitivityIcon && (
                                <img
                                  src={`/addiction/sensitivity/${item.sensitivityIcon}.png`}
                                  alt="Addiction Sensitivity"
                                  className="w-16 h-auto object-contain"
                                />
                              )}
                            </div>

                            {/* Helpful Context */}
                            <div className="mt-2 p-1 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 text-center">
                                {isHighRisk
                                  ? "Extra awareness recommended"
                                  : isMediumRisk
                                  ? "Moderate caution advised"
                                  : "Lower genetic predisposition"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sleep Analysis (only if data exists) */}
              {Object.keys(sleepAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-teal-800">
                      SLEEP & REST GENETIC ANALYSIS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-700">
                    <div className="mb-3 p-2 bg-white rounded border">
                      <p className="font-semibold mb-1">
                        SLEEP GENETIC PARAMETERS
                      </p>
                      <p>
                        Total Sleep Factors: {Object.keys(sleepAnalysis).length}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(sleepAnalysis).map(([key, item]) => (
                        <div key={key} className="border rounded p-2 bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            {item.hasImage && (
                              <img
                                src={`/sleep/${item.image}.png`}
                                alt={item.title}
                                className="w-6 h-6 object-contain"
                              />
                            )}
                            <p className="font-semibold">{item.title}</p>
                          </div>
                          {item.intervention && (
                            <p className="text-xs">
                              {item.intervention.substring(0, 80)}...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Allergy Analysis (only if data exists) */}
              {Object.keys(allergyAnalysis).length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-amber-800">
                      ALLERGY & SENSITIVITY GENETIC PROFILE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-700">
                    <div className="mb-3 p-2 bg-white rounded border">
                      <p className="font-semibold mb-1">
                        ALLERGY GENETIC FACTORS
                      </p>
                      <p>
                        Total Allergies Analyzed:{" "}
                        {Object.keys(allergyAnalysis).length}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(allergyAnalysis).map(([key, item]) => (
                        <div key={key} className="border rounded p-2 bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            {item.hasImage && (
                              <img
                                src={`/allergies/${item.image}.png`}
                                alt={item.title}
                                className="w-6 h-6 object-contain"
                              />
                            )}
                            <p className="font-semibold">{item.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comprehensive Recommendations */}
              <Card className="border-2 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-indigo-800">
                    COMPREHENSIVE GENETIC RECOMMENDATIONS
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="font-semibold text-red-700">
                        IMMEDIATE PRIORITY ACTIONS
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {totalLifestyleImprovements > 0 && (
                          <li>
                            Address {totalLifestyleImprovements} lifestyle
                            genetic improvement areas immediately
                          </li>
                        )}
                        {totalMetabolicHigh > 0 && (
                          <li>
                            Closely monitor and manage {totalMetabolicHigh}{" "}
                            high-impact metabolic genetic factors
                          </li>
                        )}
                        {totalDietScore < 5 && (
                          <li>
                            Implement comprehensive dietary modifications based
                            on genetic profile
                          </li>
                        )}
                        {Object.values(dietAnalysis).some(
                          (cat) => cat.lowScores > cat.highScores
                        ) && (
                          <li>
                            Focus intensive effort on underperforming dietary
                            genetic categories
                          </li>
                        )}
                        {Object.values(nutritionAnalysis).reduce(
                          (sum, cat) => sum + cat.highImpact,
                          0
                        ) > 0 && (
                          <li>
                            Address{" "}
                            {Object.values(nutritionAnalysis).reduce(
                              (sum, cat) => sum + cat.highImpact,
                              0
                            )}{" "}
                            high-impact nutritional genetic factors
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-green-700">
                        GENETIC STRENGTHS TO LEVERAGE
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {totalLifestyleStrengths > 0 && (
                          <li>
                            Maximize and build upon {totalLifestyleStrengths}{" "}
                            genetic lifestyle strengths
                          </li>
                        )}
                        {totalMetabolicLow > 0 && (
                          <li>
                            Maintain current approach for {totalMetabolicLow}{" "}
                            favorable metabolic genetic traits
                          </li>
                        )}
                        {totalDietScore >= 6 && (
                          <li>
                            Continue and optimize current dietary approach -
                            excellent genetic compatibility
                          </li>
                        )}
                        {Object.values(dietAnalysis).some(
                          (cat) => cat.highScores > cat.lowScores
                        ) && (
                          <li>
                            Further optimize high-performing dietary genetic
                            categories for maximum benefit
                          </li>
                        )}
                        {Object.values(nutritionAnalysis).reduce(
                          (sum, cat) => sum + cat.lowImpact,
                          0
                        ) > 0 && (
                          <li>
                            Leverage{" "}
                            {Object.values(nutritionAnalysis).reduce(
                              (sum, cat) => sum + cat.lowImpact,
                              0
                            )}{" "}
                            low-impact nutritional factors as genetic advantages
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="font-semibold mb-3">
                      GENETIC HEALTH SCORE BREAKDOWN
                    </p>

                    {/* Chart Container */}
                    <div className="h-64 mb-4">
                      <svg viewBox="0 0 600 240" className="w-full h-full">
                        {/* Grid lines */}
                        <defs>
                          <pattern
                            id="grid"
                            width="60"
                            height="24"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 60 0 L 0 0 0 24"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="0.5"
                            />
                          </pattern>
                        </defs>
                        <rect width="600" height="240" fill="url(#grid)" />

                        {/* Y-axis labels */}
                        <text
                          x="20"
                          y="20"
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          10
                        </text>
                        <text
                          x="20"
                          y="44"
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          8
                        </text>
                        <text
                          x="20"
                          y="68"
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          6
                        </text>
                        <text
                          x="20"
                          y="92"
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          4
                        </text>
                        <text
                          x="20"
                          y="116"
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          2
                        </text>
                        <text
                          x="20"
                          y="140"
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          0
                        </text>

                        {/* Bars */}
                        {/* Diet Compatibility */}
                        <rect
                          x="60"
                          y={140 - totalDietScore * 12}
                          width="100"
                          height={totalDietScore * 12}
                          fill={
                            totalDietScore >= 6
                              ? "#10b981"
                              : totalDietScore >= 4
                              ? "#f59e0b"
                              : "#ef4444"
                          }
                          rx="4"
                        />
                        <text
                          x="110"
                          y="160"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Diet
                        </text>
                        <text
                          x="110"
                          y="175"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Compatibility
                        </text>
                        <text
                          x="110"
                          y="192"
                          fontSize="12"
                          fontWeight="bold"
                          fill={
                            totalDietScore >= 6
                              ? "#059669"
                              : totalDietScore >= 4
                              ? "#d97706"
                              : "#dc2626"
                          }
                          textAnchor="middle"
                        >
                          {totalDietScore.toFixed(1)}
                        </text>

                        {/* Nutrition Alignment */}
                        <rect
                          x="180"
                          y={140 - totalNutritionScore * 12}
                          width="100"
                          height={totalNutritionScore * 12}
                          fill={
                            totalNutritionScore >= 6
                              ? "#10b981"
                              : totalNutritionScore >= 4
                              ? "#f59e0b"
                              : "#ef4444"
                          }
                          rx="4"
                        />
                        <text
                          x="230"
                          y="160"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Nutrition
                        </text>
                        <text
                          x="230"
                          y="175"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Alignment
                        </text>
                        <text
                          x="230"
                          y="192"
                          fontSize="12"
                          fontWeight="bold"
                          fill={
                            totalNutritionScore >= 6
                              ? "#059669"
                              : totalNutritionScore >= 4
                              ? "#d97706"
                              : "#dc2626"
                          }
                          textAnchor="middle"
                        >
                          {totalNutritionScore.toFixed(1)}
                        </text>

                        {/* Lifestyle Balance */}
                        <rect
                          x="300"
                          y={
                            140 -
                            (totalLifestyleStrengths > 0
                              ? (totalLifestyleStrengths /
                                  (totalLifestyleStrengths +
                                    totalLifestyleImprovements)) *
                                10
                              : 0) *
                              12
                          }
                          width="100"
                          height={
                            (totalLifestyleStrengths > 0
                              ? (totalLifestyleStrengths /
                                  (totalLifestyleStrengths +
                                    totalLifestyleImprovements)) *
                                10
                              : 0) * 12
                          }
                          fill={
                            totalLifestyleStrengths > totalLifestyleImprovements
                              ? "#10b981"
                              : totalLifestyleStrengths ===
                                totalLifestyleImprovements
                              ? "#f59e0b"
                              : "#ef4444"
                          }
                          rx="4"
                        />
                        <text
                          x="350"
                          y="160"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Lifestyle
                        </text>
                        <text
                          x="350"
                          y="175"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Balance
                        </text>
                        <text
                          x="350"
                          y="192"
                          fontSize="12"
                          fontWeight="bold"
                          fill={
                            totalLifestyleStrengths > totalLifestyleImprovements
                              ? "#059669"
                              : totalLifestyleStrengths ===
                                totalLifestyleImprovements
                              ? "#d97706"
                              : "#dc2626"
                          }
                          textAnchor="middle"
                        >
                          {totalLifestyleStrengths > 0
                            ? (
                                (totalLifestyleStrengths /
                                  (totalLifestyleStrengths +
                                    totalLifestyleImprovements)) *
                                10
                              ).toFixed(1)
                            : "0.0"}
                        </text>

                        {/* Metabolic Risk - inverted scale (lower is better) */}
                        <rect
                          x="420"
                          y={
                            140 -
                            (totalMetabolicHigh === 0
                              ? 10
                              : totalMetabolicHigh <= 2
                              ? 6
                              : 3) *
                              12
                          }
                          width="100"
                          height={
                            (totalMetabolicHigh === 0
                              ? 10
                              : totalMetabolicHigh <= 2
                              ? 6
                              : 3) * 12
                          }
                          fill={
                            totalMetabolicHigh === 0
                              ? "#10b981"
                              : totalMetabolicHigh <= 2
                              ? "#f59e0b"
                              : "#ef4444"
                          }
                          rx="4"
                        />
                        <text
                          x="470"
                          y="160"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Metabolic
                        </text>
                        <text
                          x="470"
                          y="175"
                          fontSize="11"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          Risk
                        </text>
                        <text
                          x="470"
                          y="192"
                          fontSize="12"
                          fontWeight="bold"
                          fill={
                            totalMetabolicHigh === 0
                              ? "#059669"
                              : totalMetabolicHigh <= 2
                              ? "#d97706"
                              : "#dc2626"
                          }
                          textAnchor="middle"
                        >
                          {totalMetabolicHigh === 0
                            ? "Low"
                            : totalMetabolicHigh <= 2
                            ? "Med"
                            : "High"}
                        </text>

                        {/* Reference lines */}
                        <line
                          x1="45"
                          y1="68"
                          x2="540"
                          y2="68"
                          stroke="#10b981"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                          opacity="0.6"
                        />
                        <text x="545" y="72" fontSize="9" fill="#10b981">
                          Good (6+)
                        </text>

                        <line
                          x1="45"
                          y1="92"
                          x2="540"
                          y2="92"
                          stroke="#f59e0b"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                          opacity="0.6"
                        />
                        <text x="545" y="96" fontSize="9" fill="#f59e0b">
                          Fair (4+)
                        </text>
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center space-x-4 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                        <span>Excellent/Low Risk</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                        <span>Good/Medium Risk</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                        <span>Needs Attention/High Risk</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expert Summaries with Enhanced Detail */}
              <div className="grid grid-cols-2 gap-3">
                <DataCard title="Expert Nutrigenomics Analysis">
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="font-semibold text-xs mb-1">
                        Professional Assessment:
                      </p>
                      <p className="text-justify break-words text-xs">
                        {summaries.nutrigenomicsSummary}
                      </p>
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold">Key Metrics:</p>
                      <ul className="list-disc list-inside space-y-0">
                        <li>
                          Nutritional genetic factors:{" "}
                          {Object.values(nutritionAnalysis).reduce(
                            (sum, cat) => sum + cat.total,
                            0
                          )}
                        </li>
                        <li>
                          Average compatibility score:{" "}
                          {totalNutritionScore.toFixed(1)}/10
                        </li>
                        <li>
                          High-impact factors requiring attention:{" "}
                          {Object.values(nutritionAnalysis).reduce(
                            (sum, cat) => sum + cat.highImpact,
                            0
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                </DataCard>

                <DataCard title="Expert Exercise Genomics Analysis">
                  <div className="space-y-2">
                    <div className="p-2 bg-orange-50 rounded">
                      <p className="font-semibold text-xs mb-1">
                        Professional Assessment:
                      </p>
                      <p className="text-justify break-words text-xs">
                        {summaries.exerciseGenomicsSummary}
                      </p>
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold">Key Metrics:</p>
                      <ul className="list-disc list-inside space-y-0">
                        {Object.keys(sportsAnalysis).length > 0 && (
                          <li>
                            Fitness genetic traits analyzed:{" "}
                            {Object.values(sportsAnalysis).reduce(
                              (sum, section) => sum + section.totalTraits,
                              0
                            )}
                          </li>
                        )}
                        <li>
                          Lifestyle genetic strengths: {totalLifestyleStrengths}
                        </li>
                        <li>
                          Areas for improvement: {totalLifestyleImprovements}
                        </li>
                        <li>
                          Metabolic genetic considerations:{" "}
                          {totalMetabolicHigh +
                            totalMetabolicModerate +
                            totalMetabolicLow}{" "}
                          genes
                        </li>
                      </ul>
                    </div>
                  </div>
                </DataCard>
              </div>
            </div>
          );
        })()}

        <Separator className="my-4" />

        {/* Final Thank You Page */}
        <div className="h-[270mm] bg-gradient-to-br from-blue-100 rounded-lg via-purple-100 to-pink-100 page-break-before flex flex-col text-white relative font-sans">
          {/* Main content section */}
          <div className="flex flex-1 pt-16">
            {/* Left - Thank you text */}
            <div className="flex-1 flex flex-col justify-start px-8">
              <h1 className="text-5xl tracking-wide mb-8 text-gray-800">
                Thank You...
              </h1>
              <div className="mb-6">
                <p className="text-lg font-medium mb-2 text-gray-700">To,</p>
                <p className="text-xl font-semibold text-gray-900">
                  {patientInfo.name}
                </p>
              </div>
              <p className="text-base leading-relaxed mb-8 text-gray-800 font-light max-w-lg text-justify">
                Thank you for taking the time to review our nutrigenomics
                report. We appreciate the opportunity to conduct this analysis
                for you. For further inquiries or personalized guidance, please
                feel free to connect with us using the contact details provided
                below.
              </p>
              <div className="text-sm leading-relaxed text-gray-700 space-y-4">
                <div>
                  <p className="font-bold text-gray-900 mb-1">
                    Molsys Private Limited
                  </p>
                  <p className="font-light leading-relaxed">
                    Regd. Office: 1st Floor, #524, 13th Main, 23rd Cross,
                    Judicial Layout, Yelahanka
                  </p>
                  <p className="font-light leading-relaxed">
                    {" "}
                    Bengaluru, Karnataka, Pin: 560065
                  </p>
                  <a
                    href="https://www.molsys.in"
                    className="font-light "
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website: https://www.molsys.in
                  </a>

                  <br />

                  <a href="mailto:wellness@molsys.in" className="font-light ">
                    Email: wellness@molsys.in
                  </a>

                  <p className="font-light">
                    Contact no: 8271502582 / 8073193805
                  </p>
                </div>

                <div className="pt-5">
                  <p className="font-bold text-gray-900 mb-1">
                    Molsys Private Limited (R&D)
                  </p>
                  <p className="font-light leading-relaxed">
                    Yenepoya Technology Incubator, Yenepoya (deemed-to-be)
                    University,
                  </p>
                  <p className="font-light leading-relaxed">
                    Deralakatte, Ullal, DK Pin: 575020
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom logos */}
          <div className="absolute bottom-4 left-4">
            <img
              src="/thankyou/dyalyst.png"
              alt="Dnal.st Logo"
              className="w-52 object-contain opacity-90"
            />
          </div>
          <div className="absolute bottom-4 right-4">
            <img
              src="/thankyou/molsys.png"
              alt="Molsys Logo"
              className="w-52 mb-6 object-contain opacity-90"
            />
          </div>
        </div>

        {/* <footer className="text-center mt-4 py-3 text-gray-600 text-xs border-t border-gray-200">
          <div className="space-y-1">
            <p>
              &copy; {new Date().getFullYear()} {settings.companyName}. All
              rights reserved.
            </p>
            <p className="break-words">
              Report Authentication: {patientInfo.reportAuth}
            </p>
          </div>
        </footer> */}
      </div>
    </>
  );
}
