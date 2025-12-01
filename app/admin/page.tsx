"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import ComprehensiveReportViewer from "@/components/comprehensive-report-viewer";
import ReportPreview from "@/components/admin/ReportPreview";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Patient,
  Report,
  PatientInfo,
  ReportContent,
  ReportSettings,
  NutrientData,
  GeneTestResult,
  ReportSummaries,
  SportsAndFitness,
  LifestyleConditions,
  HealthConditionStatus,
  MetabolicCore,
  DigestiveHealth,
  DigestiveHealthEntry,
  GenesAndAddiction,
  SleepAndRest,
  SleepData,
  AllergiesAndSensitivity,
  PreventiveHealth,
  FamilyGeneticImpact,
  DynamicDietFieldDefinition,
  PatientDietAnalysisResult,
  GenomicAnalysisTable,
  GenomicCategoryGroup,
  HealthSummary,
  HealthSummaryEntry,
  ComprehensiveReportData,
} from "@/types/report-types";

// Corrected imports for admin components
import PatientInfoAdmin from "@/components/admin/patient-info-admin";
import ContentAdmin from "@/components/admin/content-admin";
import SettingsAdmin from "@/components/admin/settings-admin";
import HealthSummaryAdmin from "@/components/admin/health-summary-admin";
import DynamicDietFieldAdmin from "@/components/admin/dynamic-diet-field-admin";
import GeneResultsAdmin from "@/components/admin/gene-results-admin";
import ImportExportAdmin from "@/components/admin/import-export-admin";
import NutritionAdmin from "@/components/admin/nutrition-admin";
import SportsFitnessAdmin from "@/components/admin/sports-fitness-admin";
import LifestyleConditionsAdmin from "@/components/admin/lifestyle-conditions-admin";
import DigestiveHealthAdmin from "@/components/admin/digestive-health-admin";
import GenesAddictionAdmin from "@/components/admin/genes-addiction-admin";
import SleepRestAdmin from "@/components/admin/sleep-rest-admin";
import AllergiesSensitivityAdmin from "@/components/admin/allergies-sensitivity-admin";
import PreventiveHealthAdmin from "@/components/admin/preventive-health-admin";
import FamilyGeneticImpactAdmin from "@/components/admin/family-genetic-impact-admin";
import PDFGenerator from "@/components/admin/pdf-generator";
import MetabolicCoreAdmin from "@/components/admin/metabolic-core-admin";
import GeneticParametersAdmin from "@/components/admin/genetic-parameters-admin";
import GenomicAnalysisAdmin from "@/components/admin/GenomicAnalysisAdmin";

const getEmptyReport = (name?: string): Report => ({
  id: crypto.randomUUID(),
  name: name || "", // Add the name field
  content: {
    introduction: "",
    genomicsExplanation: "",
    genesHealthImpact: "",
    fundamentalsPRS: "",
    utilityDoctors: "",
    microarrayExplanation: "",
    microarrayData: "",
  },
  settings: {
    title: "",
    subtitle: "",
    companyName: "",
    headerColor: "#000000",
    accentColor: "#000000",
    fonts: {
      primary: "Arial, sans-serif",
      secondary: "Georgia, serif",
      mono: "Courier New, monospace",
    },
  },
  dynamicDietFieldDefinitions: [],
  patientDietAnalysisResults: [],
  dietFieldCategories: [],
  nutritionData: {
    quote: "",
    description: "",
    data: {},
  },
  sportsAndFitness: {
    customImages: {},
  },
  lifestyleConditions: {},
  lifestyleCategoryImages: {},
  metabolicCore: {},
  digestiveHealth: {
    quote: "",
    description: "",
    data: {},
  },
  genesAndAddiction: {
    quote: "",
    description: "",
    data: {},
  },
  sleepAndRest: {
    quote: "",
    description: "",
    data: {},
  },
  allergiesAndSensitivity: {
    quote: "",
    description: "",
    generalAdvice: "",
    data: {},
  },
  geneTestResults: [],
  preventiveHealth: {
    diagnosticTests: {
      halfYearly: [],
      yearly: [],
    },
    nutritionalSupplements: [],
  },
  familyGeneticImpactSection: {
    description: "",
    impacts: [],
  },
  categories: [],
  summaries: {
    nutrigenomicsSummary: "",
    exerciseGenomicsSummary: "",
  },
  metabolicSummary: {
    strengths: [],
    weaknesses: [],
  },
});

const getEmptyPatient = (): Patient => ({
  id: crypto.randomUUID(),
  info: {
    name: "",
    gender: "MALE",
    birthDate: "",
    sampleCode: "",
    sampleDate: "",
    reportDate: "",
    checkedBy: "",
    scientificContent: "",
    disclaimer: "",
    signature1: null,
    signature2: null,
  },
  reports: [getEmptyReport()],
});

const getEmptyPatientInfo = (): PatientInfo => ({
  name: "",
  gender: "MALE",
  birthDate: "",
  sampleCode: "",
  sampleDate: "",
  reportDate: "",
  checkedBy: "",
  scientificContent: "",
  disclaimer: "",
  signature1: null,
  signature2: null,
});

const AdminPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPatientIndex = Number(searchParams.get("patientIndex")) || 0;
  const initialReportIndex = Number(searchParams.get("reportIndex")) || 0;

  const [selectedPatientIndex, setSelectedPatientIndex] =
    useState(initialPatientIndex);
  const [selectedReportIndex, setSelectedReportIndex] =
    useState(initialReportIndex);

  const [dataLoaded, setDataLoaded] = useState(false);

  const selectedPatient = patients[selectedPatientIndex];
  const selectedReport = selectedPatient?.reports[selectedReportIndex];
  const [isLoading, setIsLoading] = useState(true);
  const [newSampleCode, setNewSampleCode] = useState("");
  const { toast } = useToast();
  const [newReportName, setNewReportName] = useState("");
  const [showAddReportModal, setShowAddReportModal] = useState(false);

  const [activeTab, setActiveTab] = useState("");

  // Load from localStorage on mount

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab) {
      setActiveTab(urlTab);
      return;
    }
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("activeTab");
      if (saved) setActiveTab(saved);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("patientIndex", String(selectedPatientIndex));
    params.set("reportIndex", String(selectedReportIndex));
    params.set("tab", activeTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedPatientIndex, selectedReportIndex, activeTab]);

  useEffect(() => {
    const len = selectedPatient?.reports?.length ?? 0;
    if (len === 0) return;
    if (selectedReportIndex >= len) {
      setSelectedReportIndex(len - 1);
    }
  }, [selectedPatient?.reports?.length, selectedReportIndex]);

  // Load data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/patients-data");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setPatients(data);
            setDataLoaded(true);
          } else {
            // If the backend returns an empty list, treat as "no data"
            setPatients([]);
            setDataLoaded(true); // still loaded, but empty
          }

          toast({
            description: "Report data has been loaded from the backend.",
            variant: "success",
            duration: 2000,
          });
        } else {
          // non-200 (server says nothing found or error)
          console.warn("No existing data found, starting with empty structure");
          setPatients([]);
          setDataLoaded(false);
          toast({
            title: "No existing data",
            description:
              "Starting with empty report structure. Add your data and save.",
            variant: "default",
            duration: 1500,
          });
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error fetching data",
          description:
            "Starting with empty report structure due to connection error.",
          variant: "destructive",
          duration: 1500,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Add this useEffect after the existing one
  useEffect(() => {
    if (!isLoading && patients.length === 0) {
      setPatients([getEmptyPatient()]);
    }
  }, [isLoading, patients.length]);

  const addNewPatient = (sampleCode: string) => {
    const isDuplicate = patients.some(
      (patient) => patient.info.sampleCode === sampleCode
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate Sample Code",
        description: "A patient with this sample code already exists.",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    const newPatient: Patient = {
      id: crypto.randomUUID(),
      info: {
        name: "",
        gender: "MALE",
        birthDate: "",
        sampleCode,
        sampleDate: "",
        reportDate: "",
        checkedBy: "",
        scientificContent: "",
        disclaimer: "",
        signature1: null,
        signature2: null,
      },
      reports: [getEmptyReport()],
    };

    setPatients((prev) => [...prev, newPatient]);
    setSelectedPatientIndex(patients.length); // switch to new
    setSelectedReportIndex(0);
  };

  const findPatientBySampleCode = (sampleCode: string): Patient | undefined => {
    return patients.find((patient) => patient.info.sampleCode === sampleCode);
  };

  // Function to handle the add report button click
  const handleAddReportClick = () => {
    setShowAddReportModal(true);
  };

  // Function to handle the modal form submission
  const handleAddReportSubmit = () => {
    const reportName = newReportName.trim();
    if (!reportName) {
      toast({
        title: "Report Name Required",
        description: "Please enter a name for the new report.",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    const existingReportNames = selectedPatient.reports.map((r) =>
      r.name?.toLowerCase()
    );
    if (existingReportNames.includes(reportName.toLowerCase())) {
      toast({
        title: "Duplicate Report Name",
        description: "A report with this name already exists for this patient.",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    addReportToSelectedPatient(reportName);
    setNewReportName("");
    setShowAddReportModal(false);
  };

  // Function to update report name
  const updateReportName = (newName: string) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      reports[selectedReportIndex] = {
        ...reports[selectedReportIndex],
        name: newName,
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const deleteSelectedReport = async () => {
    if (!selectedPatient) return;

    const confirmed = confirm("Are you sure you want to delete this report?");
    if (!confirmed) return;

    if (selectedPatient.reports.length <= 1) {
      alert("At least one report must remain for a patient.");
      return;
    }

    const reportToDelete = selectedPatient.reports[selectedReportIndex];
    if (!reportToDelete) return;

    const deletedReportName =
      reportToDelete.name || `Report ${selectedReportIndex + 1}`;

    try {
      // Call API to delete in DB
      await fetch(`/api/patients-data?reportId=${reportToDelete.id}`, {
        method: "DELETE",
      });

      // Update local state
      setPatients((prev) => {
        const updated = [...prev];
        const patient = { ...updated[selectedPatientIndex] };
        const newReports = patient.reports.filter(
          (r) => r.id !== reportToDelete.id
        );

        updated[selectedPatientIndex] = { ...patient, reports: newReports };
        return updated;
      });

      setSelectedReportIndex(
        selectedReportIndex < selectedPatient.reports.length - 1
          ? selectedReportIndex
          : selectedReportIndex - 1
      );

      toast({
        title: "Report Deleted",
        description: `Report "${deletedReportName}" has been removed.`,
        variant: "destructive",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete the report.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const deleteSelectedPatient = async () => {
    if (!selectedPatient) return;

    const confirmed = confirm("Are you sure you want to delete this patient?");
    if (!confirmed) return;

    if (patients.length <= 1) {
      alert("At least one patient must remain.");
      return;
    }

    const patientToDelete = selectedPatient;
    const deletedPatientName =
      patientToDelete.info?.name || `Patient ${selectedPatientIndex + 1}`;

    try {
      // Call API to delete in DB
      await fetch(`/api/patients-data?patientId=${patientToDelete.id}`, {
        method: "DELETE",
      });

      // Update local state
      setPatients((prev) => {
        const updated = [...prev];
        updated.splice(selectedPatientIndex, 1);

        // Adjust selection
        const newIndex = Math.max(0, selectedPatientIndex - 1);
        setSelectedPatientIndex(newIndex);
        setSelectedReportIndex(0);

        return updated;
      });

      toast({
        title: "Patient Deleted",
        description: `Patient "${deletedPatientName}" has been removed.`,
        variant: "destructive",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete the patient.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const addReportToSelectedPatient = (reportName: string = "") => {
    let newReportIndex = 0;
    let updatedPatientName = "";

    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };

      // Create a completely new report with the specified name
      const newReport = getEmptyReport(reportName);

      // Create a new reports array and add the new report at the end
      const newReports = [...patient.reports, newReport];

      // Update the patient with the new reports array
      const updatedPatient = {
        ...patient,
        reports: newReports,
      };

      updated[selectedPatientIndex] = updatedPatient;

      // Calculate the index of the newly added report
      newReportIndex = newReports.length - 1;
      updatedPatientName = patient.info.name || "the patient";

      return updated;
    });

    // Set the selected report index to the newly created report
    setSelectedReportIndex(newReportIndex);

    toast({
      title: "New Report Added",
      description: `Report "${
        reportName || `Report ${newReportIndex + 1}`
      }" was added to ${updatedPatientName}.`,
      variant: "success",
      duration: 1500,
    });
  };

  const saveReportData = async () => {
    try {
      const response = await fetch("/api/patients-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patients),
      });

      if (response.ok) {
        toast({
          title: "Report data saved!",
          description: "Your progress has been saved to the backend.",
          variant: "success",
          duration: 1500,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to save data",
          description:
            errorData.error || "An error occurred while saving data.",
          variant: "destructive",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Error saving report data:", error);
      toast({
        title: "Error saving data",
        description: "An unexpected error occurred while saving data.",
        variant: "destructive",
        duration: 1500,
      });
    }
  };

  const resetSection = (sectionKey: keyof Report) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const report = { ...reports[selectedReportIndex] };

      const emptyReport = getEmptyReport();

      // report[sectionKey] = emptyReport[sectionKey] as Report[typeof sectionKey];

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const resetPatientInfo = () => {
    setPatients((prev) => {
      const updated = [...prev];
      updated[selectedPatientIndex] = {
        ...updated[selectedPatientIndex],
        info: getEmptyPatientInfo(),
      };
      return updated;
    });
  };

  // Patient Info Update Functions
  const updatePatientInfo = (field: keyof PatientInfo, value: string) => {
    setPatients((prevPatients) => {
      const newPatients = [...prevPatients];
      newPatients[selectedPatientIndex] = {
        ...newPatients[selectedPatientIndex],
        info: {
          ...newPatients[selectedPatientIndex].info,
          [field]: value,
        },
      };
      return newPatients;
    });
  };

  // Report Content Update Functions
  const updateReportContent = (field: keyof ReportContent, value: string) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const report = {
        ...reports[selectedReportIndex],
        content: {
          ...reports[selectedReportIndex].content,
          [field]: value,
        },
      };
      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Report Settings Update Functions
  const updateReportSettings = <K extends keyof ReportSettings>(
    field: K,
    value: ReportSettings[K]
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentSettings = reports[selectedReportIndex].settings;

      const report = {
        ...reports[selectedReportIndex],
        settings: {
          ...currentSettings,
          [field]: value,
        },
      };

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // ✅ Helper functions to add to your parent component

  const updateHealthSummaryDescription = (
    patientIndex: number,
    reportIndex: number,
    value: string
  ) => {
    setPatients((prev) => {
      const updatedPatients = [...prev];
      const updatedReports = [...updatedPatients[patientIndex].reports];
      const report = { ...updatedReports[reportIndex] };

      if (!report.healthSummary) {
        report.healthSummary = { description: "", data: [] };
      }

      report.healthSummary = {
        ...report.healthSummary,
        description: value,
      };

      updatedReports[reportIndex] = report;
      updatedPatients[patientIndex] = {
        ...updatedPatients[patientIndex],
        reports: updatedReports,
      };

      return updatedPatients;
    });
  };

  const updateHealthSummaryEntry = (
    patientIndex: number,
    reportIndex: number,
    entryIndex: number,
    field: keyof HealthSummaryEntry,
    value: string
  ) => {
    setPatients((prev) => {
      const updatedPatients = [...prev];
      const updatedReports = [...updatedPatients[patientIndex].reports];
      const report = { ...updatedReports[reportIndex] };

      if (!report.healthSummary) {
        report.healthSummary = { description: "", data: [] };
      }

      const updatedData = [...report.healthSummary.data];
      if (!updatedData[entryIndex]) {
        updatedData[entryIndex] = { title: "", description: "" };
      }
      updatedData[entryIndex] = {
        ...updatedData[entryIndex],
        [field]: value,
      };

      report.healthSummary = {
        ...report.healthSummary,
        data: updatedData,
      };

      updatedReports[reportIndex] = report;
      updatedPatients[patientIndex] = {
        ...updatedPatients[patientIndex],
        reports: updatedReports,
      };

      return updatedPatients;
    });
  };

  const addHealthSummaryEntry = (patientIndex: number, reportIndex: number) => {
    setPatients((prev) => {
      const updatedPatients = [...prev];
      const updatedReports = [...updatedPatients[patientIndex].reports];
      const report = { ...updatedReports[reportIndex] };

      if (!report.healthSummary) {
        report.healthSummary = { description: "", data: [] };
      }

      const updatedData = [
        ...report.healthSummary.data,
        { title: "", description: "", quote: "" },
      ];

      report.healthSummary = {
        ...report.healthSummary,
        data: updatedData,
      };

      updatedReports[reportIndex] = report;
      updatedPatients[patientIndex] = {
        ...updatedPatients[patientIndex],
        reports: updatedReports,
      };

      return updatedPatients;
    });
  };

  const removeHealthSummaryEntry = (
    patientIndex: number,
    reportIndex: number,
    entryIndex: number
  ) => {
    setPatients((prev) => {
      const updatedPatients = [...prev];
      const updatedReports = [...updatedPatients[patientIndex].reports];
      const report = { ...updatedReports[reportIndex] };

      if (report.healthSummary) {
        const updatedData = report.healthSummary.data.filter(
          (_, idx) => idx !== entryIndex
        );
        report.healthSummary = {
          ...report.healthSummary,
          data: updatedData,
        };
      }

      updatedReports[reportIndex] = report;
      updatedPatients[patientIndex] = {
        ...updatedPatients[patientIndex],
        reports: updatedReports,
      };

      return updatedPatients;
    });
  };

  // Dynamic Diet Field Functions
  const updateDynamicDietFieldDefinitions = (
    definitions: DynamicDietFieldDefinition[]
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      // Replace the entire array
      reports[selectedReportIndex] = {
        ...reports[selectedReportIndex],
        dynamicDietFieldDefinitions: definitions,
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const updatePatientDietAnalysisResult = (
    fieldId: string,
    data: Partial<PatientDietAnalysisResult>
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentReport = { ...reports[selectedReportIndex] };
      const existingIndex = currentReport.patientDietAnalysisResults.findIndex(
        (r) => r.fieldId === fieldId
      );

      const newResults = [...currentReport.patientDietAnalysisResults];

      if (existingIndex > -1) {
        newResults[existingIndex] = {
          ...newResults[existingIndex],
          ...data,
        };
      } else {
        newResults.push({
          fieldId,
          score: 0,
          level: "NORMAL",
          recommendation: "",
          recommendations: {
            LOW: "",
            NORMAL: "",
            HIGH: "",
          },
          selectedLevel: "NORMAL",
          ...data,
        });
      }

      reports[selectedReportIndex] = {
        ...currentReport,
        patientDietAnalysisResults: newResults,
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Nutrition Data Update Functions
  const updateNutritionData = (
    section: string,
    field: string,
    data: Partial<NutrientData> | string | Record<string, NutrientData>
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const report = { ...reports[selectedReportIndex] };

      const nutritionData = report.nutritionData || {
        quote: "",
        description: "",
        data: {},
      };

      // ✅ FIXED: Handle quote/description updates
      if (section === "quote" || section === "description") {
        report.nutritionData = {
          ...nutritionData,
          [section]: data as string,
        };
      }
      // ✅ FIXED: Handle section deletion
      else if (field === "" && data === "__delete__") {
        const updatedData = { ...nutritionData.data };
        delete updatedData[section];
        report.nutritionData = {
          ...nutritionData,
          data: updatedData,
        };
      }
      // ✅ FIXED: Handle field updates and section replacement
      else {
        const currentSection = nutritionData.data?.[section] || {};
        let updatedSection;

        // Replace entire section
        if (field === "") {
          updatedSection = data as Record<string, NutrientData>;
        }
        // Update specific field
        else {
          const prevField = currentSection[field] || {};
          updatedSection = {
            ...currentSection,
            [field]: {
              ...prevField,
              ...(data as Partial<NutrientData>),
            },
          };
        }

        report.nutritionData = {
          ...nutritionData,
          data: {
            ...nutritionData.data,
            [section]: updatedSection,
          },
        };
      }

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Sports and Fitness Update Functions
  const updateSportsAndFitness = (
    section: keyof SportsAndFitness | "customImages" | "quote" | "description",
    field: string,
    data:
      | Partial<{ level: string; description: string }>
      | { label: string; url: string }
      | string
      | null
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const report = { ...reports[selectedReportIndex] };
      const current = { ...(report.sportsAndFitness || {}) };

      // Handle quote or description update
      if (section === "quote" || section === "description") {
        report.sportsAndFitness = {
          ...current,
          [section]: data as string,
        };
      }
      // Handle custom image update
      else if (section === "customImages") {
        const { label, url } = data as { label: string; url: string };
        report.sportsAndFitness = {
          ...current,
          customImages: {
            ...(current.customImages || {}),
            [label]: url,
          },
        };
      }
      // Handle category deletion
      else if (field === "__delete_category__") {
        const { [section]: _, ...rest } = current;
        report.sportsAndFitness = rest;
      }
      // Handle new category creation
      else if (field === "__init__") {
        report.sportsAndFitness = {
          ...current,
          [section]: {},
        };
      }
      // Handle field deletion (NEW: check for null data)
      else if (data === null) {
        const category = current[section] as Record<
          string,
          { level: string; description: string }
        >;
        if (
          category &&
          typeof category === "object" &&
          !Array.isArray(category)
        ) {
          const { [field]: _, ...rest } = category;
          report.sportsAndFitness = {
            ...current,
            [section]: rest,
          };
        }
      }
      // Handle field deletion (OLD: for backward compatibility)
      else if (field.startsWith("__delete_field_")) {
        const fieldKey = field.replace("__delete_field_", "");
        const category = current[section] as Record<
          string,
          { level: string; description: string }
        >;
        if (
          category &&
          typeof category === "object" &&
          !Array.isArray(category)
        ) {
          const { [fieldKey]: _, ...rest } = category;
          report.sportsAndFitness = {
            ...current,
            [section]: rest,
          };
        }
      }
      // Handle field addition or update
      else {
        const sectionData = current[section] as
          | Record<string, { level: string; description: string }>
          | undefined;
        report.sportsAndFitness = {
          ...current,
          [section]: {
            ...(sectionData || {}),
            [field]: {
              ...(sectionData?.[field] || {}),
              ...(data as { level: string; description: string }),
            },
          },
        };
      }

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Lifestyle Conditions Update Functions
  const updateFieldStatus = (
    categoryId: string,
    fieldName: string,
    updated: Partial<HealthConditionStatus>
  ) => {
    setPatients((prev) => {
      const updatedPatients = [...prev];
      const patient = { ...updatedPatients[selectedPatientIndex] };
      const reports = [...patient.reports];
      const report = { ...reports[selectedReportIndex] };

      const prevConditions = report.lifestyleConditions || {};

      const prevCategory = prevConditions[categoryId];
      const safeCategory =
        typeof prevCategory === "object" && prevCategory !== null
          ? prevCategory
          : {};

      const existingField = safeCategory[fieldName] || {
        status: "strength",
        description: "",
        sensitivity: "low",
        avoid: [],
        follow: [],
        consume: [],
        monitor: [],
        avoidLabel: "AVOID",
        followLabel: "FOLLOW",
        consumeLabel: "CONSUME",
        monitorLabel: "MONITOR",
      };

      const updatedField = {
        ...existingField,
        ...updated,
      };

      const updatedCategory = {
        ...safeCategory,
        [fieldName]: updatedField,
      };

      const updatedConditions = {
        ...prevConditions,
        [categoryId]: updatedCategory,
      };

      report.lifestyleConditions = updatedConditions;
      reports[selectedReportIndex] = report;
      updatedPatients[selectedPatientIndex] = { ...patient, reports };
      return updatedPatients;
    });
  };

  // Metabolic Core Update Functions
  const updateMetabolicCore = (area: string, data: any) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentReport = { ...reports[selectedReportIndex] };

      if (area === "quote" || area === "description") {
        currentReport.metabolicCore = {
          ...currentReport.metabolicCore,
          [area]: data,
        };
      } else {
        currentReport.metabolicCore = {
          ...currentReport.metabolicCore,
          [area]: {
            ...(currentReport.metabolicCore[area] || {}),
            ...data,
          },
        };
      }

      reports[selectedReportIndex] = currentReport;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Digestive Health Update Functions
  const updateDigestiveHealth = (
    key: string,
    data: Partial<DigestiveHealthEntry>
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const current = reports[selectedReportIndex];

      const existingField = current.digestiveHealth.data[key] || {
        title: "",
        icon: "",
        sensitivity: "",
        good: "",
        bad: "",
      };

      const newDigestiveHealth = {
        ...current.digestiveHealth,
        data: {
          ...current.digestiveHealth.data,
          [key]: {
            ...existingField,
            ...data,
          },
        },
      };

      reports[selectedReportIndex] = {
        ...current,
        digestiveHealth: newDigestiveHealth,
      };
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const addDigestiveField = (key: string) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      const report = { ...reports[selectedReportIndex] };
      report.digestiveHealth = {
        ...report.digestiveHealth,
        data: {
          ...report.digestiveHealth.data,
          [key]: {
            title: key,
            icon: "",
            sensitivity: "",
            good: "",
            bad: "",
          },
        },
      };

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const deleteDigestiveField = (key: string) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      const report = { ...reports[selectedReportIndex] };
      const updatedData = { ...report.digestiveHealth.data };
      delete updatedData[key];

      report.digestiveHealth = {
        ...report.digestiveHealth,
        data: updatedData,
      };

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const updateDigestiveQuoteAndDescription = (
    quote: string,
    description: string
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      const report = {
        ...reports[selectedReportIndex],
        digestiveHealth: {
          ...reports[selectedReportIndex].digestiveHealth,
          quote,
          description,
        },
      };

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Genes and Addiction Update Functions
  const updateGenesAndAddiction = (
    field: keyof GenesAndAddiction["data"],
    data: Partial<GenesAndAddiction>
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentReport = { ...reports[selectedReportIndex] };

      const addictionData = {
        ...currentReport.genesAndAddiction.data,
        [field]: {
          ...(currentReport.genesAndAddiction.data?.[field] || {}),
          ...data,
        },
      };

      currentReport.genesAndAddiction = {
        ...currentReport.genesAndAddiction,
        data: addictionData,
      };

      reports[selectedReportIndex] = currentReport;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Sleep and Rest Update Functions
  const updateSleepAndRest = (
    field: keyof SleepAndRest["data"],
    data: Partial<SleepData>
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const report = {
        ...reports[selectedReportIndex],
        sleepAndRest: {
          ...reports[selectedReportIndex].sleepAndRest,
          data: {
            ...reports[selectedReportIndex].sleepAndRest.data,
            [field]: {
              ...(reports[selectedReportIndex].sleepAndRest.data?.[field] ||
                {}),
              ...data,
            },
          },
        },
      };
      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Allergies and Sensitivity Update Functions
  const updateAllergiesAndSensitivity = (
    data: Partial<AllergiesAndSensitivity>
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const report = {
        ...reports[selectedReportIndex],
        allergiesAndSensitivity: {
          ...reports[selectedReportIndex].allergiesAndSensitivity,
          ...data,
        },
      };
      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Preventive Health Update Functions
  const updatePreventiveHealth = (
    section: keyof PreventiveHealth,
    data: any
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      // Get the current preventiveHealth, or use defaults
      const currentPreventiveHealth = reports[selectedReportIndex]
        .preventiveHealth ?? {
        description: "",
        diagnosticTests: { halfYearly: [], yearly: [] },
        nutritionalSupplements: [],
      };

      const report = {
        ...reports[selectedReportIndex],
        preventiveHealth: {
          ...currentPreventiveHealth,
          [section]: data,
        },
      };

      reports[selectedReportIndex] = report;
      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Family Genetic Impact Functions
  const addFamilyGeneticImpact = () => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentReport = reports[selectedReportIndex];

      // Get current section or create default
      const currentSection = currentReport.familyGeneticImpactSection || {
        description: "",
        impacts: [],
      };

      const impacts = [...currentSection.impacts];

      impacts.push({
        gene: "",
        normalAlleles: "",
        yourResult: "",
        healthImpact: "",
      });

      reports[selectedReportIndex] = {
        ...currentReport,
        familyGeneticImpactSection: {
          ...currentSection,
          impacts: impacts,
        },
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const updateFamilyGeneticImpact = (
    index: number,
    field: keyof FamilyGeneticImpact,
    value: string
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentReport = reports[selectedReportIndex];

      // Get current section or create default
      const currentSection = currentReport.familyGeneticImpactSection || {
        description: "",
        impacts: [],
      };

      const impacts = [...currentSection.impacts];
      impacts[index] = { ...impacts[index], [field]: value };

      reports[selectedReportIndex] = {
        ...currentReport,
        familyGeneticImpactSection: {
          ...currentSection,
          impacts: impacts,
        },
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const removeFamilyGeneticImpact = (index: number) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentReport = reports[selectedReportIndex];

      // Get current section or create default
      const currentSection = currentReport.familyGeneticImpactSection || {
        description: "",
        impacts: [],
      };

      reports[selectedReportIndex] = {
        ...currentReport,
        familyGeneticImpactSection: {
          ...currentSection,
          impacts: currentSection.impacts.filter((_, i) => i !== index),
        },
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // You'll also need to add a function to update the description
  const updateFamilyGeneticImpactDescription = (description: string) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const currentReport = reports[selectedReportIndex];

      // Get current section or create default
      const currentSection = currentReport.familyGeneticImpactSection || {
        description: "",
        impacts: [],
      };

      reports[selectedReportIndex] = {
        ...currentReport,
        familyGeneticImpactSection: {
          ...currentSection,
          description: description,
        },
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Gene Test Results Functions
  const updateGeneTestResult = (
    index: number,
    field: keyof GeneTestResult,
    value: string
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const geneTests = [...reports[selectedReportIndex].geneTestResults];

      geneTests[index] = { ...geneTests[index], [field]: value };

      reports[selectedReportIndex] = {
        ...reports[selectedReportIndex],
        geneTestResults: geneTests,
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const addGeneTestResult = () => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];
      const geneTests = [...reports[selectedReportIndex].geneTestResults];

      geneTests.push({ genecode: "", geneName: "", variation: "", result: "" });

      reports[selectedReportIndex] = {
        ...reports[selectedReportIndex],
        geneTestResults: geneTests,
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const removeGeneTestResult = (index: number) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      reports[selectedReportIndex] = {
        ...reports[selectedReportIndex],
        geneTestResults: reports[selectedReportIndex].geneTestResults.filter(
          (_, i) => i !== index
        ),
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  // Genomic Analysis Table Update Functions
  const updateGenomicAnalysisTable = (newTable: GenomicAnalysisTable) => {
    setPatients((prev) => {
      const updated = [...prev];
      const patient = { ...updated[selectedPatientIndex] };
      const reports = [...patient.reports];

      reports[selectedReportIndex] = {
        ...reports[selectedReportIndex],
        genomicAnalysisTable: newTable,
      };

      updated[selectedPatientIndex] = { ...patient, reports };
      return updated;
    });
  };

  const updateGenomicCategoryGroup = (
    index: number,
    newGroup: GenomicCategoryGroup
  ) => {
    setPatients((prev) => {
      const updated = [...prev];
      const report = updated[selectedPatientIndex].reports[selectedReportIndex];
      const genomicAnalysisTable = report.genomicAnalysisTable ?? {
        description: "",
        categories: [],
      };
      const newCategories = [...genomicAnalysisTable.categories];
      newCategories[index] = newGroup;
      updated[selectedPatientIndex].reports[selectedReportIndex] = {
        ...report,
        genomicAnalysisTable: {
          ...genomicAnalysisTable,
          categories: newCategories,
        },
      };
      return updated;
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedPatient || !selectedReport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500">
              No patient or report data found. Please select a patient and
              report to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 no-print space-y-4">
        {/* Patient & Report Selectors */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Patient Selector */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-sm font-medium text-gray-700">
              Select Patient
            </label>
            <div className="relative">
              <Select
                value={String(selectedPatientIndex)}
                onValueChange={(value) =>
                  setSelectedPatientIndex(Number(value))
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select Patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p, i) => (
                    <SelectItem key={p.id} value={String(i)}>
                      {p.info.name || `Patient ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Report Selector */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-sm font-medium text-gray-700">
              Select Report
            </label>
            <div className="relative">
              <Select
                value={String(selectedReportIndex)}
                onValueChange={(value) => setSelectedReportIndex(Number(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Report" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPatient?.reports?.map((r, i) => (
                    <SelectItem key={r.id} value={String(i)}>
                      {r.name || `Report ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">
              Report Name
            </label>
            <Input
              placeholder="Enter report name"
              value={selectedReport?.name || ""}
              onChange={(e) => updateReportName(e.target.value)}
              className="w-[200px]"
              title="Edit the name of the currently selected report"
            />
          </div> */}

          {/* Save Button */}
          <div className="ml-auto">
            <Button
              onClick={saveReportData}
              className="px-7 py-2.5"
              title="Save all current patient and report data to storage"
            >
              Save Data
            </Button>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* New Patient */}
          <div className="flex gap-2 flex-1 min-w-[250px]">
            <Input
              placeholder="Sample Code (e.g. DNL0000000001)"
              value={newSampleCode}
              onChange={(e) => setNewSampleCode(e.target.value)}
              className="flex-1 border-1 border-red-400"
              title="Enter a unique sample code for the new patient"
            />
            <Button
              onClick={() => addNewPatient(newSampleCode)}
              className="whitespace-nowrap"
              title="Create a new patient with the entered sample code"
            >
              Add Patient
            </Button>
          </div>

          {/* Add Report */}
          <Button
            onClick={handleAddReportClick}
            className="whitespace-nowrap"
            title="Add a new report to the currently selected patient"
          >
            Add Report
          </Button>

          {/* Delete Buttons */}
          <Button
            variant="destructive"
            onClick={deleteSelectedReport}
            disabled={(selectedPatient?.reports?.length ?? 0) <= 1}
            className="whitespace-nowrap"
            title="Permanently delete the currently selected report"
          >
            Delete Report
          </Button>

          <Button
            variant="destructive"
            onClick={deleteSelectedPatient}
            className="whitespace-nowrap"
            title="Permanently delete the currently selected patient and all their reports"
          >
            Delete Patient
          </Button>
        </div>

        {showAddReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Add New Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name
                  </label>
                  <Input
                    placeholder="Enter report name (e.g., Initial Assessment, Follow-up, etc.)"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddReportSubmit();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddReportModal(false);
                      setNewReportName("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddReportSubmit}>Add Report</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto scrollbar-hide mb-4 sm:mb-6">
          <TabsList className="flex gap-1 sm:gap-2 min-w-max bg-white shadow-sm px-2 sm:px-4 py-2 rounded-md border border-gray-200">
            <TabsTrigger
              value="settings"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Front Page
            </TabsTrigger>
            <TabsTrigger
              value="patient-info"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Patient Info
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="genetic-parameters"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Table Of Content
            </TabsTrigger>

            <TabsTrigger
              value="health-summary"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Health Summary
            </TabsTrigger>

            <TabsTrigger
              value="diet-fields"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Diet Fields
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Nutrition
            </TabsTrigger>
            <TabsTrigger
              value="sports-fitness"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Sports & Fitness
            </TabsTrigger>
            <TabsTrigger
              value="lifestyle-conditions"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Lifestyle
            </TabsTrigger>
            <TabsTrigger
              value="metabolic-core"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Metabolic Core
            </TabsTrigger>
            <TabsTrigger
              value="digestive-health"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Digestive Health
            </TabsTrigger>
            <TabsTrigger
              value="genes-addiction"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Genes & Addiction
            </TabsTrigger>
            <TabsTrigger
              value="sleep-rest"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Sleep & Rest
            </TabsTrigger>
            <TabsTrigger
              value="allergies-sensitivity"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Allergies
            </TabsTrigger>
            <TabsTrigger
              value="preventive-health"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Preventive Health
            </TabsTrigger>
            <TabsTrigger
              value="family-genetic-impact"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Family Impact
            </TabsTrigger>
            <TabsTrigger
              value="genomic-analysis"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Genomic Analysis
            </TabsTrigger>
            <TabsTrigger
              value="genes"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Gene Results
            </TabsTrigger>

            <TabsTrigger
              value="summaries"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Summaries
            </TabsTrigger>

            <TabsTrigger
              value="pdf-export"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              PDF Export
            </TabsTrigger>
            <TabsTrigger
              value="import-export"
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Import/Export
            </TabsTrigger>

            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <div className="w-full overflow-x-auto">
          <TabsContent className="w-full min-w-0" value="patient-info">
            <PatientInfoAdmin
              patientInfo={selectedPatient?.info}
              updatePatientInfo={updatePatientInfo}
              onSave={saveReportData}
              onReset={resetPatientInfo}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="content">
            <ContentAdmin
              content={selectedReport.content}
              updateContent={updateReportContent}
              onSave={saveReportData}
              onReset={() => resetSection("content")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="genetic-parameters">
            <GeneticParametersAdmin
              categories={selectedReport.categories}
              onUpdateCategories={(updated) => {
                setPatients((prev) => {
                  const updatedPatients = [...prev];
                  const patient = { ...updatedPatients[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = {
                    ...reports[selectedReportIndex],
                    categories: updated,
                  };
                  reports[selectedReportIndex] = report;
                  updatedPatients[selectedPatientIndex] = {
                    ...patient,
                    reports,
                  };
                  return updatedPatients;
                });
              }}
              onSave={saveReportData}
              onReset={() => resetSection("categories")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="settings">
            <SettingsAdmin
              settings={selectedReport.settings}
              updateSettings={updateReportSettings}
              onSave={saveReportData}
              onReset={() => resetSection("settings")}
            />
          </TabsContent>

          <TabsContent value="health-summary">
            <HealthSummaryAdmin
              healthSummary={
                selectedReport.healthSummary || {
                  description: "",
                  data: [],
                }
              }
              onDescriptionUpdate={(value) =>
                updateHealthSummaryDescription(
                  selectedPatientIndex,
                  selectedReportIndex,
                  value
                )
              }
              onUpdate={(entryIndex, field, value) =>
                updateHealthSummaryEntry(
                  selectedPatientIndex,
                  selectedReportIndex,
                  entryIndex,
                  field,
                  value
                )
              }
              onAdd={() =>
                addHealthSummaryEntry(selectedPatientIndex, selectedReportIndex)
              }
              onRemove={(entryIndex) =>
                removeHealthSummaryEntry(
                  selectedPatientIndex,
                  selectedReportIndex,
                  entryIndex
                )
              }
              onSave={saveReportData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="diet-fields">
            <DynamicDietFieldAdmin
              dynamicDietFieldDefinitions={
                selectedReport.dynamicDietFieldDefinitions
              }
              patientDietAnalysisResults={
                selectedReport.patientDietAnalysisResults
              }
              categories={selectedReport.dietFieldCategories}
              onUpdateCategories={(newCats) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = {
                    ...reports[selectedReportIndex],
                    dietFieldCategories: newCats,
                  };
                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              onUpdateFields={(fields) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = {
                    ...reports[selectedReportIndex],
                    dynamicDietFieldDefinitions: fields,
                  };
                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              onUpdateResults={(results) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = {
                    ...reports[selectedReportIndex],
                    patientDietAnalysisResults: results,
                  };
                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              onSave={saveReportData}
              onReset={() => resetSection("dynamicDietFieldDefinitions")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="nutrition">
            <NutritionAdmin
              nutritionData={selectedReport.nutritionData}
              updateNutritionData={updateNutritionData}
              onSave={saveReportData}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="sports-fitness">
            <SportsFitnessAdmin
              sportsAndFitness={selectedReport.sportsAndFitness}
              updateSportsAndFitness={updateSportsAndFitness}
              onSave={saveReportData}
              onReset={() => resetSection("sportsAndFitness")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="lifestyle-conditions">
            <LifestyleConditionsAdmin
              lifestyleConditions={selectedReport.lifestyleConditions}
              lifestyleCategoryImages={
                selectedReport.lifestyleCategoryImages ?? {}
              }
              addCategory={(categoryId: string) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = { ...reports[selectedReportIndex] };

                  const existing = report.lifestyleConditions?.[categoryId];
                  if (typeof existing === "object" && existing !== null)
                    return prev;

                  report.lifestyleConditions = {
                    ...report.lifestyleConditions,
                    [categoryId]: {},
                  };

                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              addField={(categoryId, fieldName, status) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = { ...reports[selectedReportIndex] };
                  const category = report.lifestyleConditions?.[categoryId];

                  if (typeof category !== "object" || category === null)
                    return prev;

                  report.lifestyleConditions = {
                    ...report.lifestyleConditions,
                    [categoryId]: {
                      ...category,
                      [fieldName]: {
                        status,
                        description: "",
                        sensitivity: "low",
                        avoid: [],
                        follow: [],
                        consume: [],
                        monitor: [],
                        avoidLabel: "AVOID",
                        followLabel: "FOLLOW",
                        consumeLabel: "CONSUME",
                        monitorLabel: "MONITOR",
                      },
                    },
                  };

                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              updateFieldStatus={updateFieldStatus} // already refactored previously
              deleteField={(categoryId, fieldName) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = { ...reports[selectedReportIndex] };
                  const category = report.lifestyleConditions?.[categoryId];

                  if (typeof category !== "object" || category === null)
                    return prev;

                  const { [fieldName]: _, ...restFields } = category;

                  report.lifestyleConditions = {
                    ...report.lifestyleConditions,
                    [categoryId]: restFields,
                  };

                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              deleteCategory={(categoryId: string) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = { ...reports[selectedReportIndex] };

                  const { [categoryId]: _, ...restConditions } =
                    report.lifestyleConditions;
                  const { [categoryId]: __, ...restImages } =
                    report.lifestyleCategoryImages ?? {};

                  report.lifestyleConditions = restConditions;
                  report.lifestyleCategoryImages = restImages;

                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              updateQuoteAndDescription={(
                quote: string,
                description: string
              ) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = {
                    ...reports[selectedReportIndex],
                    lifestyleConditions: {
                      ...reports[selectedReportIndex].lifestyleConditions,
                      quote,
                      description,
                    },
                  };
                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              updateCategoryImage={(categoryId: string, imageUrl: string) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];
                  const report = {
                    ...reports[selectedReportIndex],
                    lifestyleCategoryImages: {
                      ...(reports[selectedReportIndex]
                        .lifestyleCategoryImages ?? {}),
                      [categoryId]: imageUrl,
                    },
                  };
                  reports[selectedReportIndex] = report;
                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              onSave={saveReportData}
              onReset={() => resetSection("lifestyleConditions")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="metabolic-core">
            <MetabolicCoreAdmin
              metabolicCore={selectedReport.metabolicCore}
              setMetabolicCore={(valueOrUpdater) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];

                  const prevMetabolicCore =
                    reports[selectedReportIndex].metabolicCore;
                  const nextMetabolicCore =
                    typeof valueOrUpdater === "function"
                      ? (
                          valueOrUpdater as (
                            prev: MetabolicCore
                          ) => MetabolicCore
                        )(prevMetabolicCore)
                      : valueOrUpdater;

                  reports[selectedReportIndex] = {
                    ...reports[selectedReportIndex],
                    metabolicCore: nextMetabolicCore,
                  };

                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              updateMetabolicCore={updateMetabolicCore}
              onSave={saveReportData}
              onReset={() => resetSection("metabolicCore")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="digestive-health">
            <DigestiveHealthAdmin
              digestiveHealth={selectedReport.digestiveHealth}
              updateField={updateDigestiveHealth}
              addField={addDigestiveField}
              deleteField={deleteDigestiveField}
              updateQuoteAndDescription={updateDigestiveQuoteAndDescription}
              onSave={saveReportData}
              onReset={() => resetSection("digestiveHealth")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="genes-addiction">
            <GenesAddictionAdmin
              data={selectedReport.genesAndAddiction}
              updateData={(updated) => {
                setPatients((prev) => {
                  const updatedPatients = [...prev];
                  const patient = { ...updatedPatients[selectedPatientIndex] };
                  const reports = [...patient.reports];

                  reports[selectedReportIndex] = {
                    ...reports[selectedReportIndex],
                    genesAndAddiction: {
                      ...reports[selectedReportIndex].genesAndAddiction,
                      ...updated,
                    },
                  };

                  updatedPatients[selectedPatientIndex] = {
                    ...patient,
                    reports,
                  };
                  return updatedPatients;
                });
              }}
              onSave={saveReportData}
              onReset={() => resetSection("genesAndAddiction")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="sleep-rest">
            <SleepRestAdmin
              data={selectedReport.sleepAndRest}
              updateData={(update) => {
                setPatients((prev) => {
                  const updatedPatients = [...prev];
                  const patient = { ...updatedPatients[selectedPatientIndex] };
                  const reports = [...patient.reports];

                  reports[selectedReportIndex] = {
                    ...reports[selectedReportIndex],
                    sleepAndRest: {
                      ...reports[selectedReportIndex].sleepAndRest,
                      ...update,
                    },
                  };

                  updatedPatients[selectedPatientIndex] = {
                    ...patient,
                    reports,
                  };
                  return updatedPatients;
                });
              }}
              onSave={saveReportData}
              onReset={() => resetSection("sleepAndRest")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="allergies-sensitivity">
            <AllergiesSensitivityAdmin
              allergiesAndSensitivity={
                selectedReport.allergiesAndSensitivity || {
                  quote: "",
                  description: "",
                  generalAdvice: "",
                  data: {},
                }
              }
              updateAllergiesAndSensitivity={updateAllergiesAndSensitivity}
              onSave={saveReportData}
              onReset={() => resetSection("allergiesAndSensitivity")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="preventive-health">
            <PreventiveHealthAdmin
              preventiveHealth={selectedReport.preventiveHealth}
              updatePreventiveHealth={updatePreventiveHealth}
              onSave={saveReportData}
              onReset={() => resetSection("preventiveHealth")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="family-genetic-impact">
            <FamilyGeneticImpactAdmin
              familyGeneticImpactSection={
                selectedReport.familyGeneticImpactSection || {
                  description: "",
                  impacts: [],
                }
              }
              setFamilyGeneticImpactSection={(section) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];

                  reports[selectedReportIndex] = {
                    ...reports[selectedReportIndex],
                    familyGeneticImpactSection: section,
                  };

                  updated[selectedPatientIndex] = { ...patient, reports };
                  return updated;
                });
              }}
              onSave={saveReportData}
              onReset={() => resetSection("familyGeneticImpactSection")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="genomic-analysis">
            <GenomicAnalysisAdmin
              genomicAnalysisTable={
                selectedReport.genomicAnalysisTable || {
                  description: "",
                  categories: [],
                }
              }
              setGenomicAnalysisTable={updateGenomicAnalysisTable}
              onSave={saveReportData}
              onReset={() => resetSection("genomicAnalysisTable")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="genes">
            <GeneResultsAdmin
              geneTestResults={selectedReport.geneTestResults}
              updateGeneTestResult={updateGeneTestResult}
              addGeneTestResult={addGeneTestResult}
              removeGeneTestResult={removeGeneTestResult}
              onSave={saveReportData}
              onReset={() => resetSection("geneTestResults")}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="pdf-export">
            {selectedPatient && selectedReport && (
              <PDFGenerator
                reportData={{
                  ...selectedReport,
                  patientInfo: selectedPatient.info,
                }}
                reportIndex={selectedReportIndex}
                patientCode={selectedPatient.info.sampleCode}
              />
            )}
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="import-export">
            <ImportExportAdmin
              reportData={{
                ...selectedReport,
                patientInfo: selectedPatient.info,
              }}
              setReportData={(updatedReport: ComprehensiveReportData) => {
                setPatients((prev) => {
                  const updated = [...prev];
                  const patient = { ...updated[selectedPatientIndex] };
                  const reports = [...patient.reports];

                  // Destructure into patientInfo and the rest of the report
                  const { patientInfo, ...reportRest } = updatedReport;

                  reports[selectedReportIndex] = reportRest; // already typed as Report

                  updated[selectedPatientIndex] = {
                    ...patient,
                    reports,
                    info: patientInfo,
                  };

                  return updated;
                });
              }}
            />
          </TabsContent>

          <TabsContent className="w-full min-w-0" value="preview">
            {selectedReport && selectedPatient ? (
              <ReportPreview
                selectedReport={selectedReport}
                selectedPatient={selectedPatient}
              />
            ) : (
              <div className="text-center text-gray-500 italic py-10">
                No patient or report selected for preview.
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminPage;
