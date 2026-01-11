const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function migrateJsonToDB() {
  try {
    console.log("🚀 Starting migration from JSON to MySQL...\n");

    // Try multiple possible locations for your data
    const possiblePaths = [
      path.join(process.cwd(), "data", "patients.json"),
      path.join(process.cwd(), "data.json"),
      path.join(process.cwd(), "patients.json"),
      path.join(process.cwd(), "src", "data", "patients.json"),
      path.join(process.cwd(), "public", "data", "patients.json"),
    ];

    let jsonPath = null;
    let jsonData = null;

    // Check each possible path
    for (const pathToCheck of possiblePaths) {
      if (fs.existsSync(pathToCheck)) {
        jsonPath = pathToCheck;
        console.log(`📁 Found data file at: ${jsonPath}`);
        break;
      }
    }

    // If no file found, create sample data for testing
    if (!jsonPath) {
      console.log(
        "⚠️  No existing data file found. Creating sample data for testing..."
      );
      jsonData = createSampleData();
    } else {
      try {
        const fileContent = fs.readFileSync(jsonPath, "utf8");
        jsonData = JSON.parse(fileContent);
      } catch (parseError) {
        console.error("❌ Error parsing JSON file:", parseError.message);
        console.log("Creating sample data instead...");
        jsonData = createSampleData();
      }
    }

    if (!Array.isArray(jsonData)) {
      console.log("Data is not an array, wrapping in array...");
      jsonData = [jsonData];
    }

    console.log(`📊 Found ${jsonData.length} patient(s) to migrate...\n`);

    let migratedCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const patient = jsonData[i];
      console.log(
        `👤 Migrating patient ${i + 1}/${jsonData.length}: ${
          patient.info?.name || patient.info?.sampleCode || "Unknown"
        }`
      );

      try {
        // Create patient with safe defaults
        const createdPatient = await prisma.patient.create({
          data: {
            name: patient.info?.name || "",
            gender: patient.info?.gender || "MALE",
            birthDate: patient.info?.birthDate || "",
            sampleCode: patient.info?.sampleCode || `SAMPLE_${Date.now()}_${i}`,
            sampleDate: patient.info?.sampleDate || "",
            reportDate: patient.info?.reportDate || "",
            checkedBy: patient.info?.checkedBy || "",
            scientificContent: patient.info?.scientificContent || "",
            disclaimer: patient.info?.disclaimer || "",
            signature1: patient.info?.signature1 || null,
            signature2: patient.info?.signature2 || null,
          },
        });

        // Create reports for this patient
        const reports = patient.reports || [{}]; // Default to one empty report if none exist

        for (let j = 0; j < reports.length; j++) {
          const report = reports[j];
          console.log(`  📄 Creating report ${j + 1}/${reports.length}...`);

          const createdReport = await prisma.report.create({
            data: {
              patientId: createdPatient.id,
              // Content
              introduction: report.content?.introduction || "",
              genomicsExplanation: report.content?.genomicsExplanation || "",
              genesHealthImpact: report.content?.genesHealthImpact || "",
              fundamentalsPRS: report.content?.fundamentalsPRS || "",
              utilityDoctors: report.content?.utilityDoctors || "",
              microarrayExplanation:
                report.content?.microarrayExplanation || "",
              microarrayData: report.content?.microarrayData || "",
              // Settings
              title: report.settings?.title || "",
              subtitle: report.settings?.subtitle || "",
              companyName: report.settings?.companyName || "",
              headerColor: report.settings?.headerColor || "#000000",
              accentColor: report.settings?.accentColor || "#000000",
              primaryFont:
                report.settings?.fonts?.primary || "Arial, sans-serif",
              secondaryFont:
                report.settings?.fonts?.secondary || "Georgia, serif",
              monoFont:
                report.settings?.fonts?.mono || "Courier New, monospace",
              // Quotes and descriptions
              nutritionQuote: report.nutritionData?.quote || null,
              nutritionDescription: report.nutritionData?.description || null,
              lifestyleQuote:
                typeof report.lifestyleConditions?.quote === "string"
                  ? report.lifestyleConditions.quote
                  : null,
              lifestyleDescription:
                typeof report.lifestyleConditions?.description === "string"
                  ? report.lifestyleConditions.description
                  : null,
              metabolicQuote:
                typeof report.metabolicCore?.quote === "string"
                  ? report.metabolicCore.quote
                  : null,
              metabolicDescription:
                typeof report.metabolicCore?.description === "string"
                  ? report.metabolicCore.description
                  : null,
              digestiveQuote: report.digestiveHealth?.quote || null,
              digestiveDescription: report.digestiveHealth?.description || null,
              addictionQuote: report.genesAndAddiction?.quote || null,
              addictionDescription:
                report.genesAndAddiction?.description || null,
              sleepQuote: report.sleepAndRest?.quote || null,
              sleepDescription: report.sleepAndRest?.description || null,
              allergyQuote: report.allergiesAndSensitivity?.quote || "",
              allergyDescription:
                report.allergiesAndSensitivity?.description || "",
              allergyGeneralAdvice:
                report.allergiesAndSensitivity?.generalAdvice || "",
              // Summaries
              nutrigenomicsSummary:
                report.summaries?.nutrigenomicsSummary || "",
              exerciseGenomicsSummary:
                report.summaries?.exerciseGenomicsSummary || "",
              // Metabolic summary
              metabolicStrengths: report.metabolicSummary?.strengths || [],
              metabolicWeaknesses: report.metabolicSummary?.weaknesses || [],
              // Diet categories
              dietFieldCategories: report.dietFieldCategories || [],
            },
          });

          // Migrate related data with progress indicators
          await migrateReportData(createdReport.id, report);

          console.log(`  ✅ Report ${j + 1} migrated successfully`);
        }

        migratedCount++;
        console.log(`✅ Patient ${i + 1} migrated successfully\n`);
      } catch (patientError) {
        console.error(
          `❌ Error migrating patient ${i + 1}:`,
          patientError.message
        );
        if (patientError.code === "P2002") {
          console.log(
            "  💡 This appears to be a duplicate sample code. Skipping...\n"
          );
        }
        continue;
      }
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(
      `📈 Results: ${migratedCount}/${jsonData.length} patients migrated to the database.`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateReportData(reportId, report) {
  try {
    // Migrate Dynamic Diet Fields
    if (
      report.dynamicDietFieldDefinitions &&
      Array.isArray(report.dynamicDietFieldDefinitions)
    ) {
      for (const field of report.dynamicDietFieldDefinitions) {
        await prisma.dynamicDietField.create({
          data: {
            reportId: reportId,
            uuid: field._uuid || `uuid_${Date.now()}_${Math.random()}`,
            fieldId: field.id || "",
            label: field.label || "",
            category: field.category || "",
            min: typeof field.min === "number" ? field.min : 0,
            max: typeof field.max === "number" ? field.max : 100,
            highRecommendation: field.highRecommendation || "",
            normalRecommendation: field.normalRecommendation || "",
            lowRecommendation: field.lowRecommendation || "",
            quote: field.quote || null,
            description: field.description || null,
          },
        });
      }
    }

    // Migrate Patient Diet Analysis
    if (
      report.patientDietAnalysisResults &&
      Array.isArray(report.patientDietAnalysisResults)
    ) {
      for (const analysis of report.patientDietAnalysisResults) {
        await prisma.patientDietAnalysis.create({
          data: {
            reportId: reportId,
            fieldId: analysis.fieldId || "",
            score: typeof analysis.score === "number" ? analysis.score : 0,
            level: analysis.level || "NORMAL",
            recommendation: analysis.recommendation || "",
            lowRecommendation: analysis.recommendations?.LOW || "",
            normalRecommendation: analysis.recommendations?.NORMAL || "",
            highRecommendation: analysis.recommendations?.HIGH || "",
            selectedLevel: analysis.selectedLevel || "NORMAL",
          },
        });
      }
    }

    // Migrate Nutrition Data
    if (
      report.nutritionData?.data &&
      typeof report.nutritionData.data === "object"
    ) {
      for (const [section, fields] of Object.entries(
        report.nutritionData.data
      )) {
        if (fields && typeof fields === "object") {
          for (const [field, data] of Object.entries(fields)) {
            if (data && typeof data === "object") {
              await prisma.nutritionData.create({
                data: {
                  reportId: reportId,
                  section,
                  field,
                  score: typeof data.score === "number" ? data.score : 0,
                  healthImpact: data.healthImpact || "",
                  intakeLevel: data.intakeLevel || "",
                  source: data.source || "",
                },
              });
            }
          }
        }
      }
    }

    // Migrate Gene Test Results
    if (report.geneTestResults && Array.isArray(report.geneTestResults)) {
      for (const geneTest of report.geneTestResults) {
        await prisma.geneTestResult.create({
          data: {
            reportId: reportId,
            geneName: geneTest.geneName || "",
            variation: geneTest.variation || "",
            result: geneTest.result || "",
          },
        });
      }
    }

    // Migrate Genetic Categories
    if (report.categories && Array.isArray(report.categories)) {
      for (const category of report.categories) {
        await prisma.geneticCategory.create({
          data: {
            reportId: reportId,
            categoryId: category.id || `cat_${Date.now()}_${Math.random()}`,
            category: category.category || "",
            imageUrl: category.imageUrl || "",
            description: category.description || "",
            parameters: Array.isArray(category.parameters)
              ? category.parameters
              : [],
            isActive:
              category.isActive !== undefined ? category.isActive : true,
            order: typeof category.order === "number" ? category.order : 0,
          },
        });
      }
    }
  } catch (error) {
    console.log(
      `    ⚠️ Warning: Some report data could not be migrated:`,
      error.message
    );
  }
}

function createSampleData() {
  return [
    {
      id: "sample-patient-1",
      info: {
        name: "John Doe",
        gender: "MALE",
        birthDate: "1990-01-15",
        sampleCode: "DNL0000000001",
        sampleDate: "2025-01-01",
        reportDate: "2025-01-15",
        checkedBy: "Lab Technician",
        scientificContent: "Dr. Johnson",
        disclaimer: "This is a sample disclaimer for genetic testing results.",
        signature1: null,
        signature2: null,
      },
      reports: [
        {
          id: "sample-report-1",
          content: {
            introduction: "Welcome to your genetic report.",
            genomicsExplanation: "Genomics is the study of your DNA.",
            genesHealthImpact: "Your genes affect your health in various ways.",
            fundamentalsPRS: "Polygenic Risk Scores explained.",
            utilityDoctors: "How doctors can use this information.",
            microarrayExplanation: "Microarray technology explanation.",
            microarrayData: "Your microarray results.",
          },
          settings: {
            title: "Genetic Health Report",
            subtitle: "Personalized Insights",
            companyName: "Sample Genetics Inc.",
            headerColor: "#2563eb",
            accentColor: "#dc2626",
            fonts: {
              primary: "Arial, sans-serif",
              secondary: "Georgia, serif",
              mono: "Courier New, monospace",
            },
          },
          dynamicDietFieldDefinitions: [],
          patientDietAnalysisResults: [],
          dietFieldCategories: [],
          nutritionData: { quote: "", description: "", data: {} },
          sportsAndFitness: {
            exerciseType: [],
            performance: [],
            customImages: {},
          },
          lifestyleConditions: {},
          lifestyleCategoryImages: {},
          metabolicCore: {},
          digestiveHealth: { quote: "", description: "", data: {} },
          genesAndAddiction: { quote: "", description: "", data: {} },
          sleepAndRest: { quote: "", description: "", data: {} },
          allergiesAndSensitivity: {
            quote: "",
            description: "",
            generalAdvice: "",
            data: {},
          },
          geneTestResults: [],
          categories: [],
          summaries: {
    
          metabolicSummary: { strengths: [], weaknesses: [] },
          preventiveHealth: {
            diagnosticTests: { halfYearly: [], yearly: [] },
            nutritionalSupplements: [],
          },
          familyGeneticImpact: [],
        },
      ],
    },
  ];
}

// Run the migration
console.log("🔬 Genetic Reports Database Migration Tool");
console.log("==========================================\n");

migrateJsonToDB();
