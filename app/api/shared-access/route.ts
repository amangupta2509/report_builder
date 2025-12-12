import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parseSharePayload, verifyPassword } from "@/lib/encryption";

const prisma = new PrismaClient();

/**
 * POST - Verify and access shared report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Find share token
    const shareToken = await prisma.shareToken.findUnique({
      where: { token },
      include: {
        report: {
          include: {
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
          },
        },
        patient: true,
      },
    });

    if (!shareToken) {
      return NextResponse.json(
        { error: "Invalid or expired share link" },
        { status: 404 }
      );
    }

    // Check if token is active
    if (!shareToken.isActive) {
      return NextResponse.json(
        { error: "This share link has been revoked" },
        { status: 403 }
      );
    }

    // Check expiration
    if (shareToken.expiresAt && new Date() > shareToken.expiresAt) {
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 403 }
      );
    }

    // Check password if required
    if (shareToken.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required", requiresPassword: true },
          { status: 401 }
        );
      }

      const isValidPassword = await verifyPassword(
        password,
        shareToken.password
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid password", requiresPassword: true },
          { status: 401 }
        );
      }
    }

    // Simple view count increment (counts every access)
    // No unique viewer tracking - anyone with password can access unlimited times
    await prisma.shareToken.update({
      where: { id: shareToken.id },
      data: {
        viewCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    // Transform report data (use same transformation as patients-data GET route)
    const report = shareToken.report;
    const patient = shareToken.patient;

    // Transform lifestyle conditions
    const lifestyleConditionsObj: any = {
      quote: report.lifestyleQuote ?? "",
      description: report.lifestyleDescription ?? "",
    };
    (report.lifestyleConditions ?? []).forEach((condition: any) => {
      if (!lifestyleConditionsObj[condition.categoryId]) {
        lifestyleConditionsObj[condition.categoryId] = {};
      }
      lifestyleConditionsObj[condition.categoryId][condition.conditionName] = {
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

    // Transform lifestyle category images
    const lifestyleCategoryImagesObj: Record<string, string> = {};
    (report.lifestyleCategoryImages ?? []).forEach((img: any) => {
      lifestyleCategoryImagesObj[img.categoryId] = img.imageUrl ?? "";
    });

    // Transform metabolic core data
    const metabolicCoreObj: any = {
      quote: report.metabolicQuote ?? "",
      description: report.metabolicDescription ?? "",
    };
    (report.metabolicCoreData ?? []).forEach((entry: any) => {
      if (!metabolicCoreObj[entry.area]) {
        metabolicCoreObj[entry.area] = {
          impact: entry.areaImpact ?? "",
          advice: entry.areaAdvice ?? "",
          genes: [],
        };
      }
      metabolicCoreObj[entry.area].genes.push({
        id: entry.id,
        name: entry.geneName ?? "",
        genotype: entry.genotype ?? "",
        impact: entry.impact ?? "",
      });
    });

    // Transform digestive health data
    const digestiveHealthObj: any = {
      quote: report.digestiveQuote ?? "",
      description: report.digestiveDescription ?? "",
      data: {},
    };
    (report.digestiveHealthData ?? []).forEach((item: any) => {
      digestiveHealthObj.data[item.id] = {
        title: item.title ?? "",
        icon: item.icon ?? "",
        sensitivity: item.sensitivity ?? "",
        good: item.good ?? "",
        bad: item.bad ?? "",
      };
    });

    // Transform genes and addiction data
    const genesAndAddictionObj: any = {
      quote: report.addictionQuote ?? "",
      description: report.addictionDescription ?? "",
      data: {},
    };
    (report.addictionData ?? []).forEach((item: any) => {
      genesAndAddictionObj.data[item.key] = {
        id: item.id,
        title: item.title ?? "",
        icon: item.icon ?? "",
        sensitivityIcon: item.sensitivityIcon ?? "",
      };
    });

    // Transform sleep data
    const sleepAndRestObj = {
      quote: report.sleepQuote ?? "",
      description: report.sleepDescription ?? "",
      data: (report.sleepData ?? []).reduce((acc, item) => {
        acc[item.key] = {
          id: item.id,
          title: item.title ?? "",
          intervention: item.intervention ?? "",
          image: item.image ?? "",
        };
        return acc;
      }, {} as Record<string, { id: string; title: string; intervention: string; image: string }>),
    };

    // Transform allergies and sensitivity data
    const allergiesAndSensitivityObj: any = {
      quote: report.allergyQuote ?? "",
      description: report.allergyDescription ?? "",
      generalAdvice: report.allergyGeneralAdvice ?? "",
      data: {},
    };
    (report.allergyData ?? []).forEach((item: any) => {
      allergiesAndSensitivityObj.data[item.key || crypto.randomUUID()] = {
        id: item.id || crypto.randomUUID(),
        title: item.title ?? "",
        image: item.image ?? "",
      };
    });

    // Transform preventive health
    const preventiveHealthObj = {
      description: report.preventiveHealthDescription ?? "",
      diagnosticTests: {
        halfYearly: (report.preventiveTests ?? [])
          .filter((t: any) => t.frequency === "halfYearly")
          .map((t: any) => t.testName ?? ""),
        yearly: (report.preventiveTests ?? [])
          .filter((t: any) => t.frequency === "yearly")
          .map((t: any) => t.testName ?? ""),
      },
      nutritionalSupplements: (report.nutritionalSupplements ?? []).map(
        (s: any) => ({
          id: s.id || crypto.randomUUID(),
          supplement: s.supplement ?? "",
          needed: !!s.needed,
        })
      ),
    };

    const transformedReport = {
      id: report.id,
      name: report.name,
      content: {
        introduction: report.introduction || "",
        genomicsExplanation: report.genomicsExplanation || "",
        genesHealthImpact: report.genesHealthImpact || "",
        fundamentalsPRS: report.fundamentalsPRS || "",
        utilityDoctors: report.utilityDoctors || "",
        microarrayExplanation: report.microarrayExplanation || "",
        microarrayData: report.microarrayData || "",
      },
      settings: {
        title: report.title || "",
        subtitle: report.subtitle || "",
        companyName: report.companyName || "",
        headerColor: report.headerColor || "",
        accentColor: report.accentColor || "",
        fonts: {
          primary: report.primaryFont || "",
          secondary: report.secondaryFont || "",
          mono: report.monoFont || "",
        },
      },
      patientInfo: {
        name: patient.name || "",
        gender: patient.gender || "",
        birthDate: patient.birthDate || "",
        sampleCode: patient.sampleCode || "",
        sampleDate: patient.sampleDate || "",
        reportDate: patient.reportDate || "",
        checkedBy: patient.checkedBy || "",
        scientificContent: patient.scientificContent || "",
        disclaimer: patient.disclaimer || "",
        signature1: patient.signature1 || null,
        signature2: patient.signature2 || null,
      },
      dynamicDietFieldDefinitions: (
        report.dynamicDietFieldDefinitions || []
      ).map((def: any) => ({
        meta: {
          quote: def.quote || "",
          description: def.description || "",
        },
        fields: (def.fields || []).map((field: any) => ({
          id: field.fieldId || field.id || "",
          label: field.label || "",
          category: field.category || "",
          min: field.min || 0,
          max: field.max || 100,
          highRecommendation: field.highRecommendation || "",
          normalRecommendation: field.normalRecommendation || "",
          lowRecommendation: field.lowRecommendation || "",
        })),
      })),
      patientDietAnalysisResults: report.patientDietAnalysis || [],
      dietFieldCategories: report.dietFieldCategories || [],
      nutritionData: {
        quote: report.nutritionQuote || "",
        description: report.nutritionDescription || "",
        data: (report.nutritionData || []).reduce((acc: any, item) => {
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
      sportsAndFitness: report.sportsAndFitness || {},
      lifestyleConditions: lifestyleConditionsObj,
      lifestyleCategoryImages: lifestyleCategoryImagesObj,
      metabolicCore: metabolicCoreObj,
      digestiveHealth: digestiveHealthObj,
      genesAndAddiction: genesAndAddictionObj,
      sleepAndRest: sleepAndRestObj,
      allergiesAndSensitivity: allergiesAndSensitivityObj,
      geneTestResults: report.geneTestResults || [],
      categories: report.geneticCategories || [],
      summaries: {
        nutrigenomicsSummary: report.nutrigenomicsSummary || "",
        exerciseGenomicsSummary: report.exerciseGenomicsSummary || "",
      },
      metabolicSummary: {
        strengths: report.metabolicStrengths || [],
        weaknesses: report.metabolicWeaknesses || [],
      },
      preventiveHealth: preventiveHealthObj,
      familyGeneticImpactSection: {
        description: report.familyGeneticImpactDescription ?? "",
        impacts: (report.familyGeneticImpacts ?? []).map((impact: any) => ({
          id: impact.id || crypto.randomUUID(),
          gene: impact.gene ?? "",
          normalAlleles: impact.normalAlleles ?? "",
          yourResult: impact.yourResult ?? "",
          healthImpact: impact.healthImpact ?? "",
        })),
      },
      genomicAnalysisTable: report.genomicAnalysisTable
        ? {
            description: report.genomicAnalysisTable.description ?? "",
            categories: (report.genomicAnalysisTable.categories ?? []).map(
              (cat: any) => ({
                category: cat.category ?? "",
                subcategories: (cat.subcategories ?? []).map((sub: any) => ({
                  area: sub.area ?? "",
                  trait: sub.trait ?? "",
                  genes: sub.genes ?? [],
                })),
              })
            ),
          }
        : undefined,
      healthSummary: {
        description: report.healthSummaryDescription ?? "",
        data: (report.healthSummaryEntries ?? []).map((entry: any) => ({
          title: entry.title ?? "",
          description: entry.description ?? "",
        })),
      },
    };

    return NextResponse.json({
      success: true,
      report: transformedReport,
      shareInfo: {
        viewCount: shareToken.viewCount + 1,
        maxViews: shareToken.maxViews,
        expiresAt: shareToken.expiresAt,
        isReadOnly: true,
      },
    });
  } catch (error: any) {
    console.error("Error accessing shared report:", error);
    return NextResponse.json(
      { error: "Failed to access shared report", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
