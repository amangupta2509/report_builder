import { PrismaClient, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { FamilyGeneticImpact } from "@prisma/client";
import { HealthConditionStatus } from "@/types/report-types";

type AllergiesAndSensitivity = {
  quote: string;
  description: string;
  generalAdvice: string;
  data: Record<string, { id?: string; title: string; image: string }>;
};

const prisma = new PrismaClient();

// STEP 1 — Include nested models
const reportInclude = Prisma.validator<Prisma.ReportInclude>()({
  dynamicDietFieldDefinitions: {
    include: {
      fields: true,
    },
  },
  patientDietAnalysis: true,
  nutritionData: true,
  lifestyleConditions: true,
  lifestyleCategoryImages: true,
  metabolicCoreData: true,
  digestiveHealthData: true,
  addictionData: true,
  sleepData: true,
  allergyData: true,
  geneTestResults: true,
  geneticCategories: true,
  preventiveTests: true,
  nutritionalSupplements: true,
  familyGeneticImpacts: true,
  healthSummaryEntries: true,
  genomicAnalysisTable: {
    include: {
      categories: {
        include: {
          subcategories: true,
        },
      },
    },
  },
});

const patientInclude = Prisma.validator<Prisma.PatientDefaultArgs>()({
  include: {
    reports: {
      include: reportInclude,
    },
  },
});

type FullPatient = Prisma.PatientGetPayload<typeof patientInclude>;

// Utility to remove undefined fields
const pickDefined = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

// ✅ GET — returns structured patient + report data
export async function GET() {
  try {
    const rawPatients: FullPatient[] = await prisma.patient.findMany({
      include: patientInclude.include,
    });

    const normalizedPatients = rawPatients.map((p) => ({
      id: p.id,
      info: {
        name: p.name ?? "",
        gender: p.gender ?? "",
        birthDate: p.birthDate ?? "",
        sampleCode: p.sampleCode ?? "",
        sampleDate: p.sampleDate ?? "",
        reportDate: p.reportDate ?? "",
        checkedBy: p.checkedBy ?? "",
        scientificContent: p.scientificContent ?? "",
        disclaimer: p.disclaimer ?? "",
        signature1: p.signature1 ?? "",
        signature2: p.signature2 ?? "",
      },
      reports: (p.reports ?? []).map((r) => {
        const preventiveHealthObj = {
          description: r.preventiveHealthDescription ?? "",
          diagnosticTests: {
            halfYearly: (r.preventiveTests ?? [])
              .filter((t: any) => t.frequency === "halfYearly")
              .map((t: any) => t.testName ?? ""),
            yearly: (r.preventiveTests ?? [])
              .filter((t: any) => t.frequency === "yearly")
              .map((t: any) => t.testName ?? ""),
          },
          nutritionalSupplements: (r.nutritionalSupplements ?? []).map(
            (s: any) => ({
              id: s.id || crypto.randomUUID(),
              supplement: s.supplement ?? "",
              needed: !!s.needed,
            })
          ),
        };

        const lifestyleConditionsObj: any = {
          quote: r.lifestyleQuote ?? "",
          description: r.lifestyleDescription ?? "",
        };
        (r.lifestyleConditions ?? []).forEach((condition: any) => {
          if (!lifestyleConditionsObj[condition.categoryId]) {
            lifestyleConditionsObj[condition.categoryId] = {};
          }
          lifestyleConditionsObj[condition.categoryId][
            condition.conditionName
          ] = {
            status: condition.status ?? "",
            description: condition.description ?? "",
            sensitivity: condition.sensitivity ?? "",
            avoid: condition.avoid ?? [],
            follow: condition.follow ?? [],
            consume: condition.consume ?? [],
            monitor: condition.monitor ?? [],
            avoidLabel: condition.avoidLabel ?? "AVOID",
            followLabel: condition.followLabel ?? "FOLLOW",
            consumeLabel: condition.consumeLabel ?? "CONSUME",
            monitorLabel: condition.monitorLabel ?? "MONITOR",
          };
        });

        // --- Transform allergyData array into object ---
        const allergiesAndSensitivityObj: AllergiesAndSensitivity = {
          quote: r.allergyQuote ?? "",
          description: r.allergyDescription ?? "",
          generalAdvice: r.allergyGeneralAdvice ?? "",
          data: {},
        };

        (r.allergyData ?? []).forEach((item: any) => {
          allergiesAndSensitivityObj.data[item.key || crypto.randomUUID()] = {
            id: item.id || crypto.randomUUID(),
            title: item.title ?? "",
            image: item.image ?? "",
          };
        });

        // --- Transform sleep data into expected format ---
        const sleepAndRestObj = {
          quote: r.sleepQuote ?? "",
          description: r.sleepDescription ?? "",
          data: (r.sleepData ?? []).reduce((acc, item) => {
            acc[item.key] = {
              id: item.id,
              title: item.title ?? "",
              intervention: item.intervention ?? "",
              image: item.image ?? "",
            };
            return acc;
          }, {} as Record<string, { id: string; title: string; intervention: string; image: string }>),
        };

        // --- Transform addictionData array into object ---
        const genesAndAddictionObj: any = {
          quote: r.addictionQuote ?? "",
          description: r.addictionDescription ?? "",
          data: {},
        };
        (r.addictionData ?? []).forEach((item: any) => {
          genesAndAddictionObj.data[item.key] = {
            id: item.id,
            title: item.title ?? "",
            icon: item.icon ?? "",
            sensitivityIcon: item.sensitivityIcon ?? "",
          };
        });

        // --- Transform lifestyleCategoryImages array into map ---
        const lifestyleCategoryImagesObj: Record<string, string> = {};
        (r.lifestyleCategoryImages ?? []).forEach((img: any) => {
          lifestyleCategoryImagesObj[img.categoryId] = img.imageUrl ?? "";
        });

        // --- Transform metabolicCoreData array into object ---
        const metabolicCoreObj: any = {
          quote: r.metabolicQuote ?? "",
          description: r.metabolicDescription ?? "",
        };

        (r.metabolicCoreData ?? []).forEach((entry: any) => {
          if (!metabolicCoreObj[entry.area]) {
            metabolicCoreObj[entry.area] = {
              impact: entry.areaImpact ?? "",
              advice: entry.areaAdvice ?? "", // Area-level advice
              genes: [],
            };
          }
          metabolicCoreObj[entry.area].genes.push({
            id: entry.id,
            name: entry.geneName ?? "",
            genotype: entry.genotype ?? "",
            impact: entry.impact ?? "",
            // No individual advice field
          });
        });

        // --- Transform digestiveHealthData array into object ---
        const digestiveHealthObj: any = {
          quote: r.digestiveQuote ?? "",
          description: r.digestiveDescription ?? "",
          data: {},
        };
        (r.digestiveHealthData ?? []).forEach((item: any) => {
          digestiveHealthObj.data[item.id] = {
            title: item.title ?? "",
            icon: item.icon ?? "",
            sensitivity: item.sensitivity ?? "",
            good: item.good ?? "",
            bad: item.bad ?? "",
          };
        });

        return {
          id: r.id,
          name: r.name,
          patientId: r.patientId,
          content: {
            introduction: r.introduction ?? "",
            genomicsExplanation: r.genomicsExplanation ?? "",
            genesHealthImpact: r.genesHealthImpact ?? "",
            fundamentalsPRS: r.fundamentalsPRS ?? "",
            utilityDoctors: r.utilityDoctors ?? "",
            microarrayExplanation: r.microarrayExplanation ?? "",
            microarrayData: r.microarrayData ?? "",
          },
          settings: {
            title: r.title ?? "",
            subtitle: r.subtitle ?? "",
            companyName: r.companyName ?? "",
            headerColor: r.headerColor ?? "",
            accentColor: r.accentColor ?? "",
            fonts: {
              primary: r.primaryFont ?? "",
              secondary: r.secondaryFont ?? "",
              mono: r.monoFont ?? "",
            },
          },
          nutrigenomicsSummary: r.nutrigenomicsSummary ?? "",
          exerciseGenomicsSummary: r.exerciseGenomicsSummary ?? "",
          metabolicSummary: {
            strengths: r.metabolicStrengths ?? [],
            weaknesses: r.metabolicWeaknesses ?? [],
          },
          dietFieldCategories: r.dietFieldCategories ?? [],
          nutritionQuote: r.nutritionQuote ?? "",
          nutritionDescription: r.nutritionDescription ?? "",
          sportsAndFitness: r.sportsAndFitness ?? {},

          digestiveHealth: digestiveHealthObj,
          genesAndAddiction: genesAndAddictionObj,
          sleepAndRest: sleepAndRestObj,
          allergiesAndSensitivity: allergiesAndSensitivityObj,

          sleepQuote: r.sleepQuote ?? "",
          sleepDescription: r.sleepDescription ?? "",
          allergyQuote: r.allergyQuote ?? "",
          allergyDescription: r.allergyDescription ?? "",
          allergyGeneralAdvice: r.allergyGeneralAdvice ?? "",

          patientDietAnalysisResults: r.patientDietAnalysis ?? [],
          nutritionData: {
            quote: r.nutritionQuote ?? "",
            description: r.nutritionDescription ?? "",
            data: (r.nutritionData ?? []).reduce((acc: any, item) => {
              if (!acc[item.section]) acc[item.section] = {};
              acc[item.section][item.field] = {
                id: item.id,
                score: item.score,
                healthImpact: item.healthImpact,
                intakeLevel: item.intakeLevel,
                source: item.source,
              };
              return acc;
            }, {}),
          },

          // 🔥 FIXED: Proper dynamic diet field transformation for GET
          dynamicDietFieldDefinitions: (
            r.dynamicDietFieldDefinitions ?? []
          ).map((definition: any) => ({
            meta: {
              quote: definition.quote ?? "",
              description: definition.description ?? "",
            },
            fields: (definition.fields ?? []).map((field: any) => ({
              id: field.fieldId ?? field.id ?? "",
              label: field.label ?? "",
              category: field.category ?? "",
              min: field.min ?? 0,
              max: field.max ?? 100,
              highRecommendation: field.highRecommendation ?? "",
              normalRecommendation: field.normalRecommendation ?? "",
              lowRecommendation: field.lowRecommendation ?? "",
            })),
          })),

          lifestyleConditions: lifestyleConditionsObj,
          lifestyleCategoryImages: lifestyleCategoryImagesObj,
          metabolicCore: metabolicCoreObj,
          preventiveHealth: preventiveHealthObj,

          sleepData: r.sleepData ?? [],
          allergyData: r.allergyData ?? [],
          geneTestResults: r.geneTestResults ?? [],
          categories: r.geneticCategories ?? [],
          nutritionalSupplements: r.nutritionalSupplements ?? [],
          familyGeneticImpactSection: {
            description: r.familyGeneticImpactDescription ?? "",
            impacts: (r.familyGeneticImpacts ?? []).map((impact: any) => ({
              id: impact.id || crypto.randomUUID(),
              gene: impact.gene ?? "",
              normalAlleles: impact.normalAlleles ?? "",
              yourResult: impact.yourResult ?? "",
              healthImpact: impact.healthImpact ?? "",
              reportId: impact.reportId ?? r.id,
            })),
          },
          genomicAnalysisTable: r.genomicAnalysisTable
            ? {
                description: r.genomicAnalysisTable.description ?? "",
                categories: (r.genomicAnalysisTable.categories ?? []).map(
                  (cat: any) => ({
                    category: cat.category ?? "",
                    subcategories: (cat.subcategories ?? []).map(
                      (sub: any) => ({
                        area: sub.area ?? "",
                        trait: sub.trait ?? "",
                        genes: sub.genes ?? [],
                      })
                    ),
                  })
                ),
              }
            : undefined,
          healthSummary: {
            description: r.healthSummaryDescription ?? "",
            data: (r.healthSummaryEntries ?? []).map((entry: any) => ({
              title: entry.title ?? "",
              description: entry.description ?? "",
            })),
          },
        };
      }),
    }));

    return NextResponse.json(normalizedPatients);
  } catch (error: any) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST — supports partial save/update
export async function POST(request: Request) {
  try {
    const patients = await request.json();

    if (!Array.isArray(patients)) {
      return NextResponse.json(
        { error: "Patients data must be an array" },
        { status: 400 }
      );
    }

    for (const patient of patients) {
      const { id, info, reports } = patient;

      if (!id || typeof id !== "string") {
        return NextResponse.json(
          { error: "Each patient must have an ID" },
          { status: 400 }
        );
      }

      const patientData = pickDefined({
        id,
        name: info?.name,
        gender: info?.gender,
        birthDate: info?.birthDate,
        sampleCode: info?.sampleCode,
        sampleDate: info?.sampleDate,
        reportDate: info?.reportDate,
        checkedBy: info?.checkedBy,
        scientificContent: info?.scientificContent,
        disclaimer: info?.disclaimer,
        signature1: info?.signature1,
        signature2: info?.signature2,
      });

      await prisma.patient.upsert({
        where: { id },
        update: patientData as Prisma.PatientUpdateInput,
        create: patientData as Prisma.PatientCreateInput,
      });

      if (Array.isArray(reports)) {
        for (const report of reports) {
          const content = report.content || {};
          const settings = report.settings || {};
          const fonts = settings.fonts || {};
          const metabolicSummary = report.metabolicSummary || {};

          const reportData = pickDefined({
            id: report.id,
            name: report.name,
            introduction: content.introduction,
            genomicsExplanation: content.genomicsExplanation,
            genesHealthImpact: content.genesHealthImpact,
            fundamentalsPRS: content.fundamentalsPRS,
            utilityDoctors: content.utilityDoctors,
            microarrayExplanation: content.microarrayExplanation,
            microarrayData: content.microarrayData,
            title: settings.title,
            subtitle: settings.subtitle,
            companyName: settings.companyName,
            headerColor: settings.headerColor,
            accentColor: settings.accentColor,
            primaryFont: fonts.primary,
            secondaryFont: fonts.secondary,
            monoFont: fonts.mono,
            nutrigenomicsSummary: report.nutrigenomicsSummary || "",
            exerciseGenomicsSummary: report.exerciseGenomicsSummary || "",
            metabolicStrengths: metabolicSummary.strengths || [],
            metabolicWeaknesses: metabolicSummary.weaknesses || [],
            dietFieldCategories: report.dietFieldCategories || [],
            nutritionQuote: report.nutritionQuote || "",
            nutritionDescription: report.nutritionDescription || "",
            lifestyleQuote: report.lifestyleQuote || "",
            lifestyleDescription: report.lifestyleDescription || "",
            metabolicQuote: report.metabolicQuote || "",
            metabolicDescription: report.metabolicDescription || "",
            digestiveQuote: report.digestiveQuote || "",
            digestiveDescription: report.digestiveDescription || "",
            addictionQuote: report.addictionQuote || "",
            addictionDescription: report.addictionDescription || "",
            sleepQuote: report.sleepQuote || "",
            sleepDescription: report.sleepDescription || "",
            allergyQuote: report.allergyQuote || "",
            allergyDescription: report.allergyDescription || "",
            allergyGeneralAdvice: report.allergyGeneralAdvice || "",
            healthSummaryDescription: report.healthSummary?.description || "",
          });

          await prisma.report.upsert({
            where: { id: report.id },
            update: {
              ...reportData,
              sportsAndFitness: report.sportsAndFitness || {},
            },
            create: {
              ...reportData,
              patient: { connect: { id } },
              sportsAndFitness: report.sportsAndFitness || {},
            },
          });

          const handleNested = async (
            model: any,
            data: any[],
            deleteWhere: object,
            injectFields: object = {}
          ) => {
            if (!Array.isArray(data)) {
              console.warn(
                "❌ handleNested: Provided data is not an array:",
                data
              );
              return;
            }

            try {
              await model.deleteMany({ where: deleteWhere });

              if (data.length === 0) {
                console.info("ℹ No data to insert for", model.name || "model");
                return;
              }

              const modelName =
                model?.name || model?.toString?.() || "Unknown Model";
              console.log(`Inserting into ${modelName}:`, data);

              await model.createMany({
                data: data.map((item) => ({ ...item, ...injectFields })),
                skipDuplicates: false,
              });
            } catch (err) {
              const modelName =
                model?.name || model?.toString?.() || "Unknown Model";
              console.error(`❌ handleNested failed for ${modelName}:`, err);
              throw err;
            }
          };

          if (
            report.healthSummary?.data &&
            Array.isArray(report.healthSummary.data)
          ) {
            const healthSummaryWithIds = report.healthSummary.data.map(
              (entry: any) => ({
                id: entry.id || crypto.randomUUID(),
                reportId: report.id,
                title: entry.title || "",
                description: entry.description || "",
              })
            );

            await handleNested(
              prisma.healthSummaryEntry,
              healthSummaryWithIds,
              {
                reportId: report.id,
              }
            );
          }

          // 🔥 COMPLETELY FIXED: Dynamic Diet Fields Processing
          if (
            report.dynamicDietFieldDefinitions &&
            Array.isArray(report.dynamicDietFieldDefinitions)
          ) {
            console.log(
              "🔍 Processing dynamic diet fields for report:",
              report.id
            );
            console.log(
              "🔍 Incoming definitions:",
              JSON.stringify(report.dynamicDietFieldDefinitions, null, 2)
            );

            // First, delete ALL existing dynamic diet field definitions and their fields
            const deleteResult =
              await prisma.dynamicDietFieldDefinition.deleteMany({
                where: { reportId: report.id },
              });
            console.log("🗑️ Deleted existing definitions:", deleteResult.count);

            // Process each definition
            for (const [
              defIndex,
              definition,
            ] of report.dynamicDietFieldDefinitions.entries()) {
              console.log(`📝 Processing definition ${defIndex}:`, {
                metaQuote: definition.meta?.quote?.substring(0, 50) + "...",
                metaDescription:
                  definition.meta?.description?.substring(0, 50) + "...",
                fieldsCount: definition.fields?.length || 0,
              });

              // Create the definition with meta information
              const createdDefinition =
                await prisma.dynamicDietFieldDefinition.create({
                  data: {
                    reportId: report.id,
                    quote: definition.meta?.quote || "",
                    description: definition.meta?.description || "",
                  },
                });
              console.log("✅ Created definition ID:", createdDefinition.id);

              // Create fields if they exist
              if (
                definition.fields &&
                Array.isArray(definition.fields) &&
                definition.fields.length > 0
              ) {
                const fieldsData = definition.fields.map(
                  (field: any, fieldIndex: number) => {
                    console.log(`  📋 Field ${fieldIndex}:`, {
                      id: field.id,
                      label: field.label,
                      category: field.category,
                      min: field.min,
                      max: field.max,
                    });

                    return {
                      definitionId: createdDefinition.id,
                      fieldId: field.id || crypto.randomUUID(), // Ensure we have a stable ID
                      label: field.label || "",
                      category: field.category || "",
                      min: typeof field.min === "number" ? field.min : 1,
                      max: typeof field.max === "number" ? field.max : 10,
                      highRecommendation: field.highRecommendation || "",
                      normalRecommendation: field.normalRecommendation || "",
                      lowRecommendation: field.lowRecommendation || "",
                    };
                  }
                );

                const fieldsResult = await prisma.dynamicDietField.createMany({
                  data: fieldsData,
                  skipDuplicates: false,
                });
                console.log(
                  `✅ Created ${fieldsResult.count} fields for definition ${createdDefinition.id}`
                );
              }
            }

            // Verify the save
            const verifyDefinitions =
              await prisma.dynamicDietFieldDefinition.findMany({
                where: { reportId: report.id },
                include: { fields: true },
              });
            console.log("🔍 VERIFICATION:");
            console.log(`  - Definitions saved: ${verifyDefinitions.length}`);
            console.log(
              `  - Fields saved: ${verifyDefinitions.reduce(
                (sum, def) => sum + def.fields.length,
                0
              )}`
            );

            verifyDefinitions.forEach((def, i) => {
              console.log(`  - Definition ${i}: ${def.fields.length} fields`);
              def.fields.forEach((field, j) => {
                console.log(
                  `    - Field ${j}: "${field.label}" (category: "${field.category}")`
                );
              });
            });
          }

          // ✅ Patient Diet Analysis with UUID
          if (report.patientDietAnalysisResults) {
            // Get all existing analysis for this report
            const existingAnalysis = await prisma.patientDietAnalysis.findMany({
              where: { reportId: report.id },
              select: { id: true, fieldId: true },
            });

            const dietAnalysisWithIds = report.patientDietAnalysisResults.map(
              (field: any) => {
                const existing = existingAnalysis.find(
                  (e) => e.fieldId === field.fieldId
                );

                return {
                  id: existing?.id || field.id || crypto.randomUUID(),
                  reportId: report.id,
                  fieldId: field.fieldId || crypto.randomUUID(),
                  score: field.score ?? 0,
                  level: field.level || "NORMAL",
                  selectedLevel: field.selectedLevel || "NORMAL",
                  recommendation: field.recommendation || "",
                  lowRecommendation:
                    field.lowRecommendation || field.recommendations?.LOW || "",
                  normalRecommendation:
                    field.normalRecommendation ||
                    field.recommendations?.NORMAL ||
                    "",
                  highRecommendation:
                    field.highRecommendation ||
                    field.recommendations?.HIGH ||
                    "",
                };
              }
            );

            await handleNested(
              prisma.patientDietAnalysis,
              dietAnalysisWithIds,
              { reportId: report.id }
            );
          }

          // In patient-data/route.ts POST section:
          if (
            report.nutritionData &&
            typeof report.nutritionData === "object"
          ) {
            const { quote, description, data } = report.nutritionData;

            const nutritionArray: any[] = [];

            if (data && typeof data === "object") {
              for (const section of Object.keys(data)) {
                const fields = data[section];
                if (fields && typeof fields === "object") {
                  // ✅ Add this check
                  for (const field of Object.keys(fields)) {
                    const nutrient = fields[field];
                    if (nutrient && typeof nutrient === "object") {
                      // ✅ Add this check
                      nutritionArray.push({
                        id: nutrient.id || crypto.randomUUID(),
                        reportId: report.id,
                        section,
                        field,
                        score: Number(nutrient.score) || 0,
                        healthImpact: nutrient.healthImpact || "",
                        intakeLevel: nutrient.intakeLevel || "",
                        source: nutrient.source || "",
                      });
                    }
                  }
                }
              }
            }

            // Save quote and description directly to report
            await prisma.report.update({
              where: { id: report.id },
              data: {
                nutritionQuote: quote || "",
                nutritionDescription: description || "",
              },
            });

            // ✅ IMPORTANT: Clear existing nutrition data before saving new data
            await prisma.nutritionData.deleteMany({
              where: { reportId: report.id },
            });

            // Save nutrition data
            if (nutritionArray.length > 0) {
              await prisma.nutritionData.createMany({
                data: nutritionArray,
              });
            }
          }

          // ✅ Lifestyle Conditions — normalize object to array before saving
          if (
            report.lifestyleConditions &&
            !Array.isArray(report.lifestyleConditions)
          ) {
            const { quote, description, ...categories } =
              report.lifestyleConditions;

            // Save quote + description to report table
            await prisma.report.update({
              where: { id: report.id },
              data: {
                lifestyleQuote: quote || "",
                lifestyleDescription: description || "",
              },
            });

            // Convert object format into array for Prisma
            const lifestyleConditionsArray = Object.entries(categories).flatMap(
              ([categoryId, conditions]) => {
                if (
                  !conditions ||
                  typeof conditions !== "object" ||
                  Array.isArray(conditions)
                ) {
                  return [];
                }
                return Object.entries(
                  conditions as Record<string, HealthConditionStatus>
                ).map(([conditionName, conditionData]) => ({
                  id: (conditionData as any).id || crypto.randomUUID(),
                  reportId: report.id,
                  categoryId,
                  conditionName,
                  status: conditionData.status || "",
                  description: conditionData.description || "",
                  sensitivity: conditionData.sensitivity || "low",
                  avoid: conditionData.avoid || [],
                  follow: conditionData.follow || [],
                  consume: conditionData.consume || [],
                  monitor: conditionData.monitor || [],
                  avoidLabel: conditionData.avoidLabel || "AVOID",
                  followLabel: conditionData.followLabel || "FOLLOW",
                  consumeLabel: conditionData.consumeLabel || "CONSUME",
                  monitorLabel: conditionData.monitorLabel || "MONITOR",
                }));
              }
            );

            await handleNested(
              prisma.lifestyleCondition,
              lifestyleConditionsArray,
              { reportId: report.id }
            );
          } else if (Array.isArray(report.lifestyleConditions)) {
            // If already array, just save directly
            const lifestyleConditionsWithIds = report.lifestyleConditions.map(
              (condition: any) => ({
                ...condition,
                id: condition.id || crypto.randomUUID(),
                reportId: report.id,
              })
            );

            await handleNested(
              prisma.lifestyleCondition,
              lifestyleConditionsWithIds,
              { reportId: report.id }
            );
          }

          // ✅ Lifestyle Category Images — normalize object to array before saving
          if (
            report.lifestyleCategoryImages &&
            !Array.isArray(report.lifestyleCategoryImages)
          ) {
            const imagesArray = Object.entries(
              report.lifestyleCategoryImages as Record<string, string>
            ).map(([categoryId, imageUrl]) => ({
              id: crypto.randomUUID(),
              reportId: report.id,
              categoryId,
              imageUrl,
            }));

            await handleNested(prisma.lifestyleCategoryImage, imagesArray, {
              reportId: report.id,
            });
          } else if (Array.isArray(report.lifestyleCategoryImages)) {
            const lifestyleCategoryImagesWithIds =
              report.lifestyleCategoryImages.map((image: any) => ({
                ...image,
                id: image.id || crypto.randomUUID(),
                reportId: report.id,
              }));

            await handleNested(
              prisma.lifestyleCategoryImage,
              lifestyleCategoryImagesWithIds,
              { reportId: report.id }
            );
          }

          // ✅ Metabolic Core Data with UUID
          if (report.metabolicCore) {
            const metabolicCoreArray: Prisma.MetabolicCoreDataUncheckedCreateInput[] =
              [];

            Object.entries(report.metabolicCore).forEach(
              ([areaName, data]: [string, any]) => {
                if (areaName === "quote" || areaName === "description") return;

                if (Array.isArray(data.genes)) {
                  data.genes.forEach((gene: any) => {
                    metabolicCoreArray.push({
                      id: gene.id || crypto.randomUUID(),
                      reportId: report.id,
                      area: areaName,
                      geneName: gene.name || "",
                      genotype: gene.genotype || "",
                      impact: gene.impact || "",
                      areaImpact: data.impact || null,
                      areaAdvice: data.advice || null,
                    });
                  });
                }
              }
            );

            await handleNested(prisma.metabolicCoreData, metabolicCoreArray, {
              reportId: report.id,
            });

            await prisma.report.update({
              where: { id: report.id },
              data: {
                metabolicQuote: report.metabolicCore.quote || null,
                metabolicDescription: report.metabolicCore.description || null,
              },
            });
          }

          // ✅ Digestive Health Data with UUID
          if (report.digestiveHealth) {
            const { quote, description, data } = report.digestiveHealth;

            // Save quote & description into Report table first
            await prisma.report.update({
              where: { id: report.id },
              data: {
                digestiveQuote: quote || "",
                digestiveDescription: description || "",
              },
            });

            // Normalize data object to array for DB
            const digestiveArray: any[] = Object.entries(data || {}).map(
              ([key, entry]: [string, any]) => ({
                id: entry.id || crypto.randomUUID(),
                reportId: report.id,
                key, // this is the logical key used in frontend
                title: entry.title || "",
                icon: entry.icon || "",
                sensitivity: entry.sensitivity || "",
                good: entry.good || "",
                bad: entry.bad || "",
              })
            );

            await handleNested(prisma.digestiveHealthData, digestiveArray, {
              reportId: report.id,
            });
          }

          // ✅ Genes & Addiction Data with UUID
          if (report.genesAndAddiction) {
            const { quote, description, data } = report.genesAndAddiction;

            // Save quote & description into Report table
            await prisma.report.update({
              where: { id: report.id },
              data: {
                addictionQuote: quote || "",
                addictionDescription: description || "",
              },
            });

            // Normalize object to array for DB
            const addictionArray: any[] = Object.entries(data || {}).map(
              ([key, entry]: [string, any]) => ({
                id: entry.id || crypto.randomUUID(),
                reportId: report.id,
                key, // ✅ Save the frontend object key back to DB
                title: entry.title || "",
                icon: entry.icon || "",
                sensitivityIcon: entry.sensitivityIcon || "",
              })
            );

            await handleNested(prisma.addictionData, addictionArray, {
              reportId: report.id,
            });
          }

          // ✅ Sleep Data with UUID
          if (report.sleepAndRest) {
            const { quote, description, data } = report.sleepAndRest;

            // 1️⃣ Save quote/description in Report table
            await prisma.report.update({
              where: { id: report.id },
              data: {
                sleepQuote: quote || "",
                sleepDescription: description || "",
              },
            });

            // 2️⃣ Prepare array for SleepData
            const sleepDataArray = Object.entries(data || {}).map(
              ([key, entry]: [string, any]) => ({
                id: entry.id || crypto.randomUUID(),
                reportId: report.id,
                key,
                title: entry.title || "", // <-- Added
                intervention: entry.intervention || "",
                image: entry.image || "",
              })
            );

            // 3️⃣ Save with handleNested
            await handleNested(prisma.sleepData, sleepDataArray, {
              reportId: report.id,
            });
          }

          // ✅ Allergies & Sensitivity — normalize object to array before saving
          if (
            report.allergiesAndSensitivity &&
            typeof report.allergiesAndSensitivity === "object"
          ) {
            const { quote, description, generalAdvice, data } =
              report.allergiesAndSensitivity;

            // 1️⃣ Save quote/description/generalAdvice directly to Report
            await prisma.report.update({
              where: { id: report.id },
              data: {
                allergyQuote: quote || "",
                allergyDescription: description || "",
                allergyGeneralAdvice: generalAdvice || "",
              },
            });

            // 2️⃣ Convert object map -> array for DB
            const allergyDataArray = Object.entries(data || {}).map(
              ([key, value]) => {
                const val = value as {
                  id?: string;
                  title?: string;
                  image?: string;
                };
                return {
                  id: val.id || crypto.randomUUID(),
                  reportId: report.id,
                  key,
                  title: val.title || "",
                  image: val.image || "",
                };
              }
            );

            // 3️⃣ Save in DB, replacing old ones
            await handleNested(prisma.allergyData, allergyDataArray, {
              reportId: report.id,
            });
          }

          // ✅ Gene Test Results with UUID
          if (report.geneTestResults) {
            const geneTestResultsWithIds = report.geneTestResults.map(
              (gene: any) => ({
                ...gene,
                id: gene.id || crypto.randomUUID(),
                reportId: report.id,
              })
            );

            await handleNested(prisma.geneTestResult, geneTestResultsWithIds, {
              reportId: report.id,
            });
          }

          // ✅ Genetic Categories with UUID (existing implementation)
          if (report.categories) {
            const categoriesWithIds = report.categories.map((cat: any) => ({
              ...cat,
              reportId: report.id,
              categoryId: cat.categoryId || crypto.randomUUID(),
            }));

            await handleNested(prisma.geneticCategory, categoriesWithIds, {
              reportId: report.id,
            });
          }

          // ✅ Preventive Health — tests + supplements
          const hasPreventivePayload =
            report.preventiveHealth !== undefined ||
            report.nutritionalSupplements !== undefined;

          if (hasPreventivePayload) {
            // Update the report with preventive health description
            if (report.preventiveHealth?.description) {
              await prisma.report.update({
                where: { id: report.id },
                data: {
                  preventiveHealthDescription:
                    report.preventiveHealth.description,
                },
              });
            }

            // Normalize diagnostic tests
            const diagnosticTests = (report.preventiveHealth
              ?.diagnosticTests ?? {
              halfYearly: [],
              yearly: [],
            }) as { halfYearly?: string[]; yearly?: string[] };

            const testsArray = [
              ...(diagnosticTests.halfYearly || []).map((name: string) => ({
                id: crypto.randomUUID(),
                testName: name ?? "",
                frequency: "halfYearly",
                reportId: report.id,
              })),
              ...(diagnosticTests.yearly || []).map((name: string) => ({
                id: crypto.randomUUID(),
                testName: name ?? "",
                frequency: "yearly",
                reportId: report.id,
              })),
            ];

            await handleNested(prisma.preventiveTest, testsArray, {
              reportId: report.id,
            });

            // Normalize supplements — prefer preventiveHealth, fallback to legacy
            const incomingSupplements =
              report.preventiveHealth?.nutritionalSupplements ??
              report.nutritionalSupplements ??
              [];

            const supplementsNormalized = Array.isArray(incomingSupplements)
              ? incomingSupplements.map((s: any) => ({
                  id: s?.id || crypto.randomUUID(),
                  supplement:
                    typeof s?.supplement === "string"
                      ? s.supplement
                      : String(s?.title ?? s ?? ""),
                  needed: typeof s?.needed === "boolean" ? s.needed : true,
                  reportId: report.id,
                }))
              : [];

            await handleNested(
              prisma.nutritionalSupplement,
              supplementsNormalized,
              {
                reportId: report.id,
              }
            );
          }

          // ✅ Genomic Analysis Table with nested structure
          if (report.genomicAnalysisTable) {
            const { description, categories } = report.genomicAnalysisTable;

            // First, create or update the genomic analysis table
            await prisma.genomicAnalysisTable.upsert({
              where: { reportId: report.id },
              update: { description: description || "" },
              create: {
                reportId: report.id,
                description: description || "",
              },
            });

            // Get the genomic analysis table ID
            const genomicTable = await prisma.genomicAnalysisTable.findUnique({
              where: { reportId: report.id },
            });

            if (genomicTable && Array.isArray(categories)) {
              // Clear existing categories and subcategories
              await prisma.genomicSubcategory.deleteMany({
                where: {
                  genomicCategoryGroup: {
                    genomicAnalysisTableId: genomicTable.id,
                  },
                },
              });
              await prisma.genomicCategoryGroup.deleteMany({
                where: { genomicAnalysisTableId: genomicTable.id },
              });

              // Create new categories and subcategories
              for (const category of categories) {
                const categoryGroup = await prisma.genomicCategoryGroup.create({
                  data: {
                    genomicAnalysisTableId: genomicTable.id,
                    category: category.category || "",
                  },
                });

                if (Array.isArray(category.subcategories)) {
                  const subcategoriesData = category.subcategories.map(
                    (sub: any) => ({
                      genomicCategoryGroupId: categoryGroup.id,
                      area: sub.area || "",
                      trait: sub.trait || "",
                      genes: sub.genes || [],
                    })
                  );

                  await prisma.genomicSubcategory.createMany({
                    data: subcategoriesData,
                  });
                }
              }
            }
          }

          // Handle family genetic impact section
          const familyGeneticImpactData = {
            description:
              report.familyGeneticImpactDescription ||
              report.familyGeneticImpactSection?.description ||
              "",
            impacts:
              report.familyGeneticImpacts ||
              report.familyGeneticImpact ||
              report.familyGeneticImpactSection?.impacts ||
              [],
          };

          // Handle Family Genetic Impact Section in a transaction
          await prisma.$transaction(async (tx) => {
            // Update the description
            await tx.report.update({
              where: { id: report.id },
              data: {
                familyGeneticImpactDescription:
                  familyGeneticImpactData.description.trim(),
              },
            });

            // Handle impacts if they exist
            if (Array.isArray(familyGeneticImpactData.impacts)) {
              const validImpacts: FamilyGeneticImpact[] =
                familyGeneticImpactData.impacts
                  .filter(
                    (imp: Partial<FamilyGeneticImpact>) =>
                      typeof imp.gene === "string" &&
                      imp.gene.trim() !== "" &&
                      typeof imp.normalAlleles === "string" &&
                      imp.normalAlleles.trim() !== "" &&
                      typeof imp.yourResult === "string" &&
                      imp.yourResult.trim() !== ""
                  )
                  .map((imp: Partial<FamilyGeneticImpact>) => ({
                    id: imp.id || crypto.randomUUID(),
                    reportId: report.id,
                    gene: imp.gene!.trim(),
                    normalAlleles: imp.normalAlleles!.trim(),
                    yourResult: imp.yourResult!.trim(),
                    healthImpact: imp.healthImpact?.trim() || "",
                  }));

              // Delete existing impacts first
              await tx.familyGeneticImpact.deleteMany({
                where: { reportId: report.id },
              });

              // Create new impacts
              if (validImpacts.length > 0) {
                await tx.familyGeneticImpact.createMany({
                  data: validImpacts,
                });
              }
            }
          });
        }
      }
    }

    return NextResponse.json({ message: "Patients saved successfully." });
  } catch (error: any) {
    console.error("❌ POST error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unknown error",
        code: error?.code || null,
        cause: error?.cause || null,
        meta: error?.meta || null,
        stack: error?.stack || null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");
    const patientId = searchParams.get("patientId");

    // Case 1: Delete a report
    if (reportId) {
      await prisma.report.delete({
        where: { id: reportId },
      });

      return NextResponse.json({
        success: true,
        type: "report",
        id: reportId,
      });
    }

    // Case 2: Delete a patient (cascade removes reports)
    if (patientId) {
      await prisma.patient.delete({
        where: { id: patientId },
      });

      return NextResponse.json({
        success: true,
        type: "patient",
        id: patientId,
      });
    }

    // No valid parameter found
    return NextResponse.json(
      { error: "Missing reportId or patientId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
