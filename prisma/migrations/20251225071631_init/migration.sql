-- CreateTable
CREATE TABLE `patients` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `birthDate` VARCHAR(191) NOT NULL,
    `sampleCode` VARCHAR(191) NOT NULL,
    `sampleDate` VARCHAR(191) NOT NULL,
    `reportDate` VARCHAR(191) NOT NULL,
    `checkedBy` VARCHAR(191) NOT NULL,
    `scientificContent` VARCHAR(191) NOT NULL,
    `disclaimer` TEXT NOT NULL,
    `signature1` VARCHAR(191) NULL,
    `signature2` VARCHAR(191) NULL,

    UNIQUE INDEX `patients_sampleCode_key`(`sampleCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `introduction` TEXT NULL,
    `genomicsExplanation` TEXT NULL,
    `genesHealthImpact` TEXT NULL,
    `fundamentalsPRS` TEXT NULL,
    `utilityDoctors` TEXT NULL,
    `microarrayExplanation` TEXT NULL,
    `microarrayData` TEXT NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `headerColor` VARCHAR(191) NULL,
    `accentColor` VARCHAR(191) NULL,
    `primaryFont` VARCHAR(191) NULL,
    `secondaryFont` VARCHAR(191) NULL,
    `monoFont` VARCHAR(191) NULL,
    `nutritionQuote` TEXT NULL,
    `nutritionDescription` TEXT NULL,
    `sportsAndFitness` JSON NULL,
    `preventiveHealthDescription` TEXT NULL,
    `lifestyleQuote` TEXT NULL,
    `lifestyleDescription` TEXT NULL,
    `metabolicQuote` TEXT NULL,
    `metabolicDescription` TEXT NULL,
    `digestiveQuote` TEXT NULL,
    `digestiveDescription` TEXT NULL,
    `addictionQuote` TEXT NULL,
    `addictionDescription` TEXT NULL,
    `sleepQuote` TEXT NULL,
    `sleepDescription` TEXT NULL,
    `allergyQuote` TEXT NULL,
    `allergyDescription` TEXT NULL,
    `allergyGeneralAdvice` TEXT NULL,
    `nutrigenomicsSummary` TEXT NULL,
    `exerciseGenomicsSummary` TEXT NULL,
    `metabolicStrengths` JSON NULL,
    `metabolicWeaknesses` JSON NULL,
    `dietFieldCategories` JSON NULL,
    `familyGeneticImpactDescription` TEXT NULL,
    `healthSummaryDescription` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dynamic_diet_field_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `quote` TEXT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dynamic_diet_fields` (
    `id` VARCHAR(191) NOT NULL,
    `definitionId` VARCHAR(191) NOT NULL,
    `fieldId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `min` DOUBLE NOT NULL,
    `max` DOUBLE NOT NULL,
    `highRecommendation` TEXT NOT NULL,
    `normalRecommendation` TEXT NOT NULL,
    `lowRecommendation` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_diet_analysis` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `fieldId` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `recommendation` TEXT NOT NULL,
    `lowRecommendation` TEXT NOT NULL,
    `normalRecommendation` TEXT NOT NULL,
    `highRecommendation` TEXT NOT NULL,
    `selectedLevel` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nutrition_data` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `healthImpact` TEXT NOT NULL,
    `intakeLevel` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `nutrition_data_reportId_section_field_key`(`reportId`, `section`, `field`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lifestyle_conditions` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `conditionName` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sensitivity` VARCHAR(191) NULL,
    `avoid` JSON NOT NULL,
    `follow` JSON NOT NULL,
    `consume` JSON NOT NULL,
    `monitor` JSON NOT NULL,
    `avoidLabel` VARCHAR(191) NULL,
    `followLabel` VARCHAR(191) NULL,
    `consumeLabel` VARCHAR(191) NULL,
    `monitorLabel` VARCHAR(191) NULL,

    UNIQUE INDEX `lifestyle_conditions_reportId_categoryId_conditionName_key`(`reportId`, `categoryId`, `conditionName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lifestyle_category_images` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,

    UNIQUE INDEX `lifestyle_category_images_reportId_categoryId_key`(`reportId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metabolic_core_data` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `geneName` VARCHAR(191) NOT NULL,
    `genotype` VARCHAR(191) NOT NULL,
    `impact` TEXT NOT NULL,
    `areaImpact` TEXT NULL,
    `areaAdvice` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `digestive_health_data` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `sensitivity` VARCHAR(191) NOT NULL,
    `good` TEXT NOT NULL,
    `bad` TEXT NOT NULL,

    UNIQUE INDEX `digestive_health_data_reportId_key_key`(`reportId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addiction_data` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `sensitivityIcon` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `addiction_data_reportId_key_key`(`reportId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sleep_data` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `intervention` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,

    UNIQUE INDEX `sleep_data_reportId_key_key`(`reportId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergy_data` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `image` TEXT NULL,

    UNIQUE INDEX `allergy_data_reportId_key_key`(`reportId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gene_test_results` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `genecode` VARCHAR(191) NULL,
    `geneName` VARCHAR(191) NOT NULL,
    `variation` VARCHAR(191) NOT NULL,
    `result` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genetic_categories` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `parameters` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL,
    `order` INTEGER NOT NULL,

    UNIQUE INDEX `genetic_categories_reportId_categoryId_key`(`reportId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preventive_tests` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `testName` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nutritional_supplements` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `supplement` VARCHAR(191) NOT NULL,
    `needed` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_genetic_impacts` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `gene` VARCHAR(191) NOT NULL,
    `normalAlleles` VARCHAR(191) NOT NULL,
    `yourResult` VARCHAR(191) NOT NULL,
    `healthImpact` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genomic_analysis_tables` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `genomic_analysis_tables_reportId_key`(`reportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genomic_category_groups` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `genomicAnalysisTableId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genomic_subcategories` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `genomicCategoryGroupId` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NULL,
    `trait` VARCHAR(191) NULL,
    `genes` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `health_summary_entries` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShareToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` TEXT NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `maxViews` INTEGER NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastAccessedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `ShareToken_reportId_idx`(`reportId`),
    INDEX `ShareToken_patientId_idx`(`patientId`),
    INDEX `ShareToken_expiresAt_idx`(`expiresAt`),
    UNIQUE INDEX `ShareToken_token_key`(`token`(255)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'viewer',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLogin` DATETIME(3) NULL,
    `loginAttempts` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dynamic_diet_field_definitions` ADD CONSTRAINT `dynamic_diet_field_definitions_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dynamic_diet_fields` ADD CONSTRAINT `dynamic_diet_fields_definitionId_fkey` FOREIGN KEY (`definitionId`) REFERENCES `dynamic_diet_field_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_diet_analysis` ADD CONSTRAINT `patient_diet_analysis_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_data` ADD CONSTRAINT `nutrition_data_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lifestyle_conditions` ADD CONSTRAINT `lifestyle_conditions_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lifestyle_category_images` ADD CONSTRAINT `lifestyle_category_images_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `metabolic_core_data` ADD CONSTRAINT `metabolic_core_data_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digestive_health_data` ADD CONSTRAINT `digestive_health_data_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addiction_data` ADD CONSTRAINT `addiction_data_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sleep_data` ADD CONSTRAINT `sleep_data_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allergy_data` ADD CONSTRAINT `allergy_data_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gene_test_results` ADD CONSTRAINT `gene_test_results_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `genetic_categories` ADD CONSTRAINT `genetic_categories_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preventive_tests` ADD CONSTRAINT `preventive_tests_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutritional_supplements` ADD CONSTRAINT `nutritional_supplements_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_genetic_impacts` ADD CONSTRAINT `family_genetic_impacts_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `genomic_analysis_tables` ADD CONSTRAINT `genomic_analysis_tables_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `genomic_category_groups` ADD CONSTRAINT `genomic_category_groups_genomicAnalysisTableId_fkey` FOREIGN KEY (`genomicAnalysisTableId`) REFERENCES `genomic_analysis_tables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `genomic_subcategories` ADD CONSTRAINT `genomic_subcategories_genomicCategoryGroupId_fkey` FOREIGN KEY (`genomicCategoryGroupId`) REFERENCES `genomic_category_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_summary_entries` ADD CONSTRAINT `health_summary_entries_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShareToken` ADD CONSTRAINT `ShareToken_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShareToken` ADD CONSTRAINT `ShareToken_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
