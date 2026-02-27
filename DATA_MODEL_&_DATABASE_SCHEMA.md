# Report Builder - Data Model & Database Schema

## 📋 Overview

This document describes the inferred database schema based on the application structure, file organization, and API routes. The actual schema is defined in `/prisma/schema.prisma`.

---

## 🗄️ Core Data Models

### 1. **User Model**

```prisma
model User {
  id          String      @id @default(cuid())
  email       String      @unique
  password    String      @secret // Hashed
  firstName   String?
  lastName    String?
  role        Role        @default(VIEWER)

  // Relations
  patientsCreated     Patient[]        @relation("CreatedBy")
  reportsCreated      Report[]         @relation("CreatedBy")
  sharesCreated       ShareToken[]     @relation("CreatedBy")
  auditLogs           AuditLog[]       @relation("PerformedBy")

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum Role {
  ADMIN      // Full access
  VIEWER     // Can view reports
}
```

### 2. **Patient Model**

```prisma
model Patient {
  id          String      @id @default(cuid())

  // Basic Info (from patient-info-admin)
  firstName   String
  lastName    String
  email       String?
  phone       String?
  dateOfBirth DateTime?
  gender      String?     // Male, Female, Other
  bloodGroup  String?

  // Address
  address     String?
  city        String?
  state       String?
  country     String?
  zipCode     String?

  // Emergency Contact
  emergencyContactName    String?
  emergencyContactPhone   String?
  emergencyContactRelation String?

  // Medical History
  medicalHistory      String?  // Notes
  currentMedications  String?  // Notes
  allergies           String?  // Notes

  // Relations
  createdBy   String
  createdByUser User    @relation("CreatedBy", fields: [createdBy], references: [id])

  reports     Report[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3. **Report Model** (Core)

```prisma
model Report {
  id          String      @id @default(cuid())

  // Reference
  patientId   String
  patient     Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)

  // Status & Metadata
  status      ReportStatus @default(DRAFT)  // DRAFT, PUBLISHED, ARCHIVED
  version     Int         @default(1)
  title       String?     @default("Health Analysis Report")
  description String?

  // Ownership
  createdBy   String
  createdByUser User      @relation("CreatedBy", fields: [createdBy], references: [id])

  // Sections (One-to-many relations)
  patientInfo         PatientInfoSection?
  nutritionData       NutritionSection?
  dietAnalysis        DietAnalysisSection?
  sportsData          SportsSection?
  sleepData           SleepSection?
  lifestyleData       LifestyleSection?
  digestiveData       DigestiveSection?
  allergyData         AllergySection?
  addictionData       AddictionSection?
  geneticData         GeneticSection?
  genomicAnalysis     GenomicSection?
  metabolicData       MetabolicSection?
  healthSummary       HealthSummarySection?
  preventiveHealth    PreventiveSection?

  // Attachments
  images      Image[]
  signatures  Signature[]

  // Sharing
  shares      ShareToken[]

  // Settings
  reportSettings ReportSettings?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
}

enum ReportStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

---

## 📊 Report Section Models

### 4. **PatientInfoSection**

```prisma
model PatientInfoSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Data (mirrors Patient but report-specific)
  firstName       String
  lastName        String
  dateOfBirth     DateTime?
  gender          String?
  bloodGroup      String?
  medicalHistory  String?
  allergies       String?
  medications     String?

  updatedAt   DateTime @updatedAt
}
```

### 5. **NutritionSection**

```prisma
model NutritionSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Nutrition Data
  dietType        String?     // Vegetarian, Vegan, Carnivore, etc.
  dailyCalories   Int?
  carbs           Float?      // %
  proteins        Float?      // %
  fats            Float?      // %

  // Micronutrients
  vitamins        String?     // JSON
  minerals        String?     // JSON
  recommendations String?     // Text/JSON

  // Foods
  favoriteFood    String?
  dislikedFood    String?
  foodIntolerances String?

  // Meta
  analysisDate    DateTime?
  analyzedBy      String?

  updatedAt   DateTime @updatedAt
}
```

### 6. **DietAnalysisSection**

```prisma
model DietAnalysisSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Analysis Data
  currentDietScore      Int?      // 1-100
  nutritionBalance      String?
  macroBreakdown        String?   // JSON

  // Dynamic Diet Fields
  customFields          String?   // JSON array
  meals                 String?   // JSON array of meals

  // Recommendations
  recommendations       String?
  improvementAreas      String?

  updatedAt   DateTime @updatedAt
}
```

### 7. **SportsSection**

```prisma
model SportsSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Activity Data
  primarySport        String?
  yearsOfExperience   Int?
  trainingFrequency   String?   // Times per week
  averageDuration     Int?      // Minutes

  // Fitness Metrics
  cardioLevel         String?   // Low, Average, High, Advanced
  strengthLevel       String?
  flexibility         String?
  endurance           String?

  // Health Metrics
  resting HeartRate   Int?
  vo2Max              Float?

  // Injuries & Recovery
  currentInjuries     String?
  pastInjuries        String?
  recoveryTime        Int?

  recommendations     String?

  updatedAt   DateTime @updatedAt
}
```

### 8. **SleepSection**

```prisma
model SleepSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Sleep Metrics
  averageSleepDuration    Float?  // Hours
  bedtime                 String? // HH:MM
  wakeTime                String? // HH:MM
  sleepQuality            String? // Poor, Fair, Good, Excellent

  // Sleep Patterns
  consistentSchedule      Boolean?
  midnightWakings         Int?    // Per week
  insomniaSeverity        String? // None, Mild, Moderate, Severe

  // Sleep Disorders
  apnea                   Boolean?
  restlessSyndrome        Boolean?
  narcolepsy              Boolean?

  // Factors
  screenTimeBeforeBed     Int?    // Minutes
  coffeeConsumption       String? // None, Moderate, High
  exerciseFrequency       String?
  stressLevel             String?

  recommendations         String?

  updatedAt   DateTime @updatedAt
}
```

### 9. **LifestyleSection**

```prisma
model LifestyleSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Occupation
  occupation          String?
  occupationType      String?   // Sedentary, Light, Moderate, Heavy
  workStressLevel     String?

  // Habits
  smokingStatus       String?   // Never, Former, Current
  smokeFrequency      String?   // If current
  alcoholConsumption  String?   // None, Moderate, Frequent, Heavy
  frequency           String?   // If yes

  // Physical Activity
  exerciseFrequency   Int?      // Days per week
  exerciseType        String?
  exerciseDuration    Int?      // Minutes per session

  // Mental Health
  stressManagement    String?
  relaxationMethods   String?

  // Social
  socialActivity      String?
  familyBackground    String?

  // Conditions
  conditions          String?   // JSON array

  recommendations     String?
  sensitivityLevel    String?   // Low, Medium, High

  updatedAt   DateTime @updatedAt
}
```

### 10. **DigestiveSection**

```prisma
model DigestiveSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // GI Symptoms
  frequency               String?
  bloating                Boolean?
  constipation            Boolean?
  diarrhea                Boolean?
  gastricReflux           Boolean?
  ibs                     Boolean?
  crohnsDisease           Boolean?
  ulcerativeColitis       Boolean?
  celiacDisease           Boolean?

  // Food Sensitivities
  glutenSensitivity       Boolean?
  lactoseIntolerance      Boolean?
  otherIntolerances       String?

  // Digestive Health
  gutHealth               String?
  fiberIntake             Int?    // Grams per day
  probiotics              Boolean?
  enzymes                 Boolean?

  // Dietary Habits
  mealsPerDay             Int?
  eatingOutFrequency      String?
  mealSize                String?
  chewingHabits           String?
  waterIntake             Int?    // Liters per day

  recommendations         String?

  updatedAt   DateTime @updatedAt
}
```

### 11. **AllergySection**

```prisma
model AllergySection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Allergies
  foodAllergies           String?   // JSON array
  environmentalAllergies  String?   // JSON array
  medicationAllergies     String?   // JSON array
  skinAllergies           String?   // JSON array

  // Severity
  severityLevel           String?   // Mild, Moderate, Severe

  // Seasonal
  seasonalAllergies       Boolean?
  seasonalPattern         String?   // Spring, Summer, Fall, Winter

  // Reactions
  typicalReactions        String?   // JSON array
  mostSevereReaction      String?

  // Management
  currentTreatment        String?
  medicationsTaking       String?   // JSON array

  recommendations         String?
  sensitivityLevel        String?   // Low, Medium, High

  updatedAt   DateTime @updatedAt
}
```

### 12. **AddictionSection**

```prisma
model AddictionSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Substance Use
  smoking                 Boolean?
  smokingFrequency        String?
  alcohol                 Boolean?
  alcoholFrequency        String?
  cannabis                Boolean?
  cannabisFrequency       String?
  otherSubstances         String?

  // Family History
  familyHistorySmoking    Boolean?
  familyHistoryAlcohol    Boolean?
  familyHistoryDrugs      Boolean?

  // Addiction Risk
  riskLevel               String?   // Low, Medium, High
  withdrawalSymptoms      Boolean?

  // Genetic Component
  geneticPredisposition   String?   // Yes, No, Unknown, Family History

  // Treatment/Support
  inTreatment             Boolean?
  supportGroups           Boolean?
  counseling              Boolean?

  recommendations         String?

  updatedAt   DateTime @updatedAt
}
```

### 13. **GeneticSection**

```prisma
model GeneticSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Carrier Status
  carrierTestDate         DateTime?
  testingLab              String?

  // Genetic Conditions
  knownConditions         String?   // JSON array
  familyHistoryConditions String?  // JSON array

  // Risk Assessment
  inheritedRiskLevel      String?

  recommendations         String?
  familyNotification      Boolean?

  updatedAt   DateTime @updatedAt
}
```

### 14. **GenomicSection**

```prisma
model GenomicSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Test Information
  testType                String?   // Whole Genome, Exome, Gene Panel
  testDate                DateTime?
  testingCompany          String?

  // Genomic Results
  variantsFound           String?   // JSON array
  pathogenicVariants      String?   // JSON array
  beneficialVariants      String?   // JSON array

  // Analysis
  inheritancePattern      String?   // Autosomal, X-linked, Mitochondrial
  expressionLevel         String?   // JSON with gene expression data

  // Health Implications
  predictedDiseaseRisk    String?   // JSON
  pharmacogenomics        String?   // Drug response predictions

  recommendations         String?
  geneticCounseling       Boolean?

  updatedAt   DateTime @updatedAt
}
```

### 15. **MetabolicSection**

```prisma
model MetabolicSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Metabolic Health
  bmi                     Float?
  whr                     Float?  // Waist-to-Hip Ratio
  basalMetabolicRate      Int?    // Calories

  // Blood Markers
  glucose                 Float?  // mg/dL
  fastingGlucose          Float?  // mg/dL
  hemoglobinA1c           Float?  // %

  // Lipid Panel
  totalCholesterol        Float?  // mg/dL
  ldl                     Float?  // mg/dL
  hdl                     Float?  // mg/dL
  triglycerides           Float?  // mg/dL

  // Blood Pressure
  systolic                Int?    // mmHg
  diastolic               Int?    // mmHg

  // Thyroid Function
  tsh                     Float?
  t3                      Float?
  t4                      Float?

  // Inflammation Markers
  crp                     Float?  // C-Reactive Protein

  // Metabolic Syndrome
  metabolicSyndromeRisk   String? // Low, Moderate, High

  // Insulin Resistance
  homa_ir                Float?

  recommendations         String?

  updatedAt   DateTime @updatedAt
}
```

### 16. **HealthSummarySection**

```prisma
model HealthSummarySection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Summary
  executiveSummary        String?  // Main health overview
  healthScore             Int?     // 1-100

  // Risk Assessment
  highRiskAreas           String?  // JSON array
  mediumRiskAreas         String?  // JSON array
  lowRiskAreas            String?  // JSON array

  // Positive Aspects
  strengths               String?  // JSON array
  strongAreas             String?  // JSON array

  // Overall Recommendations
  topRecommendations      String?  // JSON array (top 3-5)
  lifestyleChanges        String?
  medicalFollowUp         String?

  updatedAt   DateTime @updatedAt
}
```

### 17. **PreventiveSection**

```prisma
model PreventiveSection {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Screening Guidelines
  recommendedScreenings   String?  // JSON array
  lastScreeningDate       DateTime?

  // Vaccinations
  vaccinationStatus       String?  // JSON
  missingVaccines         String?  // JSON array

  // Primary Prevention
  riskFactorsToAddress    String?  // JSON array
  preventiveInterventions String?  // JSON array

  // Lifestyle Prevention
  dietaryRecommendations  String?
  exerciseRecommendations String?
  stressManagement        String?
  sleepHygiene            String?

  // Monitoring
  indicatorsToMonitor     String?  // JSON array
  monitoringFrequency     String?

  updatedAt   DateTime @updatedAt
}
```

---

## 📎 Supporting Models

### 18. **Image Model**

```prisma
model Image {
  id          String    @id @default(cuid())
  reportId    String
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Image Details
  sectionType String    // patient_info, nutrition, sports, etc.
  fileName    String
  fileUrl     String    // Cloud storage URL or local path
  fileSize    Int       // Bytes

  // Metadata
  altText     String?
  caption     String?
  displayOrder Int?

  uploadedAt  DateTime @default(now())
  deletedAt   DateTime?
}
```

### 19. **Signature Model**

```prisma
model Signature {
  id          String    @id @default(cuid())
  reportId    String
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Signature
  signatureUrl String  // Data URL or image path
  signedBy    String?  // User ID or name
  signedAt    DateTime @default(now())
}
```

### 20. **ShareToken Model**

```prisma
model ShareToken {
  id          String    @id @default(cuid())
  reportId    String
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Token
  token       String    @unique  // Unique share link token

  // Settings
  requiresPassword Boolean?
  password        String? @secret // Hashed
  expiresAt   DateTime?
  oneTimeOnly Boolean?    @default(false)
  viewCount   Int         @default(0)

  // Ownership
  createdBy   String
  createdByUser User    @relation("CreatedBy", fields: [createdBy], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  revokedAt   DateTime?
}
```

### 21. **ReportSettings Model**

```prisma
model ReportSettings {
  id          String    @id @default(cuid())
  reportId    String    @unique
  report      Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Display Settings
  theme           String?     // Light, Dark, Custom
  colorScheme     String?     // CSS color values or theme name
  fontFamily      String?
  fontSize        Int?        // Base font size

  // Content Settings
  includeStatistics Boolean?  @default(true)
  includeCharts   Boolean?    @default(true)
  includeRecommendations Boolean? @default(true)

  // Report Sections to Include
  sections        String?     // JSON array of section names

  // Footer/Header
  footerText      String?
  headerText      String?
  companyLogo     String?

  updatedAt   DateTime @updatedAt
}
```

### 22. **AuditLog Model**

```prisma
model AuditLog {
  id          String    @id @default(cuid())

  // Action Details
  action      String    // CREATE, UPDATE, DELETE, VIEW, EXPORT
  entity      String    // Report, Patient, User, ShareToken
  entityId    String    // ID of modified entity

  // Change Details
  changes     String?   // JSON of before/after values
  ipAddress   String?
  userAgent   String?

  // User
  performedBy String
  performedByUser User  @relation("PerformedBy", fields: [performedBy], references: [id])

  createdAt   DateTime @default(now())
}
```

---

## 🔑 Relationships Summary

### One-to-One Relations

- Report ↔ Report Settings
- Report ↔ Patient Info Section
- Report ↔ Each Section Model (Nutrition, Sports, Sleep, etc.)

### One-to-Many Relations

- User → Patients (created by)
- User → Reports (created by)
- User → Share Tokens (created by)
- User → Audit Logs (performed by)
- Patient → Reports
- Report → Images
- Report → Signatures
- Report → Share Tokens

### Polymorphic Relations (Simulated)

- Image.sectionType → Links to any section
- AuditLog → Can log any entity type

---

## 📊 Entity Relationship Diagram

```
User (1) ──── (many) Patient
  │                      │
  │                      │ (1)
  │                      │
  └──────────────────(many) Report (1) ──────────────────────┐
         │                    │                               │
         │                    │ (many)                         │
         │                    ├─→ Image                   (many) Section Models
         │                    ├─→ Signature               (  PatientInfo
         │                    ├─→ ShareToken              (  Nutrition
         │                    └─→ ReportSettings         (  DietAnalysis
         │                                               (  Sports
         △                                               (  Sleep
         │                                               (  Lifestyle
     AuditLog                                            (  Digestive
                                                         (  Allergy
                                                         (  Addiction
                                                         (  Genetic
                                                         (  Genomic
                                                         (  Metabolic
                                                         (  HealthSummary
                                                         (  Preventive
```

---

## 📈 Indexing Strategy

### Recommended Indexes

```sql
-- User indexes
User.email                  -- UNIQUE (login optimization)

-- Patient indexes
Patient.createdBy          -- For filtering by creator
Patient.email              -- For patient lookup

-- Report indexes
Report.patientId           -- Most common query filter
Report.createdBy           -- For user's reports
Report.status              -- For filtering by status
Report.createdAt           -- For sorting by date

-- ShareToken indexes
ShareToken.token           -- UNIQUE (critical for lookups)
ShareToken.reportId        -- For finding shares
ShareToken.expiresAt       -- For expiration queries

-- AuditLog indexes
AuditLog.performedBy       -- For user activity logs
AuditLog.entityId          -- For entity history
AuditLog.createdAt         -- For time-range queries

-- Image indexes
Image.reportId             -- For report's images
Image.sectionType          -- For section-specific queries
```

---

## 🔐 Data Security Considerations

1. **PII Handling**: Patient data encrypted at database and application level
2. **Password Hashing**: bcrypt or similar for User.password and ShareToken.password
3. **Secrets**: Marked with @secret in schema (not logged/exposed)
4. **Audit Trail**: All writes logged to AuditLog for compliance
5. **Soft Deletes**: Image.deletedAt allows recovery without hard deletion
6. **Token Rotation**: Share tokens should be cryptographically secure
7. **Access Control**: Row-level security should validate createdBy/ownership

---

## 📝 Query Patterns

### Common Queries

```
1. Get patient's latest report
   SELECT * FROM Report WHERE patientId = ? ORDER BY createdAt DESC LIMIT 1

2. Get all report sections
   SELECT * FROM Report WHERE id = ?
   JOIN PatientInfo ON Report.id = PatientInfo.reportId
   JOIN Nutrition ON Report.id = Nutrition.reportId
   ... (for all sections)

3. Validate share token
   SELECT Report.* FROM ShareToken
   JOIN Report ON ShareToken.reportId = Report.id
   WHERE ShareToken.token = ? AND (ShareToken.expiresAt > NOW() OR expiresAt IS NULL)

4. User audit trail
   SELECT * FROM AuditLog WHERE performedBy = ? ORDER BY createdAt DESC

5. Get public reports (for admin)
   SELECT * FROM ShareToken WHERE Report.status = 'PUBLISHED'
```

---

## 💾 Storage Estimation

For 10,000 patient records with reports:

- **Patient table**: ~5-10 MB (demographics)
- **Report metadata**: ~20-30 MB (status, dates, references)
- **Section data**: ~200-400 MB (JSON stored text)
- **Images**: ~10-50 GB (cloud storage, not in DB)
- **Share tokens**: ~5-10 MB
- **Audit logs**: ~100-200 MB

**Total DB**: ~340-650 MB (excluding images)
**Total Storage**: ~10-50+ GB (including image cloud storage)

---

## 🚀 Performance Optimizations

1. **Denormalization**: Store derived summary fields (healthScore, topRisks in HealthSummarySection)
2. **Caching**: Cache section queries with Redis
3. **Pagination**: Implement cursor-based pagination for large result sets
4. **Column Selection**: Fetch only needed fields, especially for list operations
5. **Full-Text Search**: If patient search is needed, add FTS indexes
6. **Partitioning**: For large datasets, partition Report by createdAt (yearly)

This comprehensive schema supports all features shown in the application structure while maintaining data integrity, security, and query performance.
