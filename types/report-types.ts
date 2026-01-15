export interface Patient {
  id: string;
  info: PatientInfo;
  reports: Report[];
}

export interface Report {
  id: string;
  name?: string;
  content: ReportContent;
  settings: ReportSettings;
  dynamicDietFieldDefinitions: DynamicDietFieldDefinition[];
  patientDietAnalysisResults: PatientDietAnalysisResult[];
  nutritionData: FullNutritionData;
  sportsAndFitness: SportsAndFitness;
  lifestyleConditions: LifestyleConditions;
  lifestyleCategoryImages?: LifestyleCategoryImages;
  metabolicCore: MetabolicCore;
  digestiveHealth: DigestiveHealth;
  genesAndAddiction: GenesAndAddiction;
  sleepAndRest: SleepAndRest;
  allergiesAndSensitivity: AllergiesAndSensitivity;
  geneTestResults: GeneTestResult[];
  categories: GeneticCategory[];
  metabolicSummary: MetabolicSummary;
  preventiveHealth: PreventiveHealth;
  familyGeneticImpactSection: FamilyGeneticImpactSection;
  summaries: ReportSummaries;
  dietFieldCategories: string[];
  genomicAnalysisTable?: GenomicAnalysisTable;
  healthSummary?: HealthSummary;
}

export interface HealthSummary {
  description?: string;
  data: HealthSummaryEntry[];
}

export interface HealthSummaryEntry {
  title: string;
  description: string;
}

export interface GenomicAnalysisTable {
  description: string;
  categories: GenomicCategoryGroup[];
}

export interface GenomicCategoryGroup {
  category: string;
  subcategories: {
    area: string;
    trait: string;
    genes: string[];
  }[];
}



export interface PatientInfo {
  name: string;
  gender: string;
  birthDate: string;
  sampleCode: string;
  sampleDate: string;
  reportDate: string;
  checkedBy: string;
  scientificContent: string;
  disclaimer: string;
  signature1: string | null;
  signature2: string | null;
}

export interface ReportContent {
  introduction: string;
  genomicsExplanation: string;
  genesHealthImpact: string;
  fundamentalsPRS: string;
  utilityDoctors: string;
  microarrayExplanation: string;
  microarrayData: string;
}

export interface ReportSettings {
  title: string;
  subtitle: string;
  companyName: string;
  headerColor: string;
  accentColor: string;
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
}

export interface DynamicDietFieldDefinition {
  meta: {
    quote: string;
    description: string;
  };
  fields: DynamicDiet[];
}

export interface DynamicDiet {
  id: string;
  label: string;
  category: string;
  min: number;
  max: number;
  highRecommendation: string;
  normalRecommendation: string;
  lowRecommendation: string;
}

export interface PatientDietAnalysisResult {
  fieldId: string;
  score: number;
  level: "LOW" | "NORMAL" | "HIGH";
  recommendation: string;
  recommendations: {
    LOW: string;
    NORMAL: string;
    HIGH: string;
  };
  selectedLevel: "LOW" | "NORMAL" | "HIGH";
}

export type DietFieldResult = PatientDietAnalysisResult & {
  label: string;
  lowRecommendation?: string;
  normalRecommendation?: string;
  highRecommendation?: string;
};

export interface NutrientData {
  score: number;
  healthImpact: string;
  intakeLevel: string;
  source: string;
}

export interface FullNutritionData {
  quote?: string;
  description?: string;
  data: Record<string, Record<string, NutrientData>>;
}

export interface SportsAndFitness {
  quote?: string;
  description?: string;
  customImages?: Record<string, string>;

  [categoryId: string]:
    | {
        [fieldId: string]: {
          level: string;
          description: string;
        };
      }
    | string
    | Record<string, string>
    | undefined;
}

export interface HealthConditionStatus {
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

export interface LifestyleConditions {
  quote?: string;
  description?: string;
  [categoryId: string]:
    | {
        [conditionName: string]: HealthConditionStatus;
      }
    | string
    | undefined;
}

export interface LifestyleCategoryImages {
  [categoryId: string]: string;
}

export interface MetabolicGeneEntry {
  name: string;
  genotype: string;
  impact: string;
}

export interface MetabolicGeneData {
  genes: MetabolicGeneEntry[];
  impact?: string;
  advice: string;
}

export type MetabolicCore = {
  quote?: string;
  description?: string;
} & Record<string, MetabolicGeneData>;

export interface DigestiveHealthEntry {
  title: string;
  icon: string;
  sensitivity: "Low" | "High" | "";
  good: string;
  bad: string;
}

export interface DigestiveHealth {
  quote?: string;
  description?: string;
  data: Record<string, DigestiveHealthEntry>;
}

export interface AddictionEntry {
  title: string;
  icon: string;
  sensitivityIcon: string;
}

export interface GenesAndAddiction {
  quote?: string;
  description?: string;
  data: Record<string, AddictionEntry>;
}

export interface SleepData {
  title?: string;
  intervention: string;
  image?: string;
}

export interface SleepAndRest {
  quote?: string;
  description?: string;
  data: Record<string, SleepData>;
}

export interface AllergyEntry {
  title: string;
  image: string;
}

export interface AllergiesAndSensitivity {
  quote: string;
  description: string;
  generalAdvice: string;
  data: Record<string, AllergyEntry>;
}

export interface GeneTestResult {
  genecode: string;
  geneName: string;
  variation: string;
  result: string;
}

export interface MetabolicSummary {
  strengths: string[];
  weaknesses: string[];
}

export interface PreventiveHealth {
  description?: string;
  diagnosticTests: {
    halfYearly: string[];
    yearly: string[];
  };
  nutritionalSupplements: Array<{
    supplement: string;
    needed: boolean;
  }>;
}

export interface FamilyGeneticImpactSection {
  description: string;
  impacts: FamilyGeneticImpact[];
}

export interface FamilyGeneticImpact {
  gene: string;
  normalAlleles: string;
  yourResult: string;
  healthImpact: string;
}

export interface ReportSummaries {
  nutrigenomicsSummary: string;
  exerciseGenomicsSummary: string;
}

export interface ComprehensiveReportData extends Report {
  patientInfo: PatientInfo;
}
