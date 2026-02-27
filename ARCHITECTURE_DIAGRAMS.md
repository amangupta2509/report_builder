# Report Builder - Architecture Diagrams & Visual References

## 📊 Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WEB BROWSER (Client)                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend (React)                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐    │  │
│  │  │  /login  │  │ /report  │  │ /shared  │  │ /admin          │    │  │
│  │  │  Page    │  │  Pages   │  │  Pages   │  │ Dashboard       │    │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘    │  │
│  │         │            │            │                 │               │  │
│  │         └────────────┴────────────┴─────────────────┘               │  │
│  │                      │                                              │  │
│  │            ┌─────────▼─────────┐                                   │  │
│  │            │  Components Layer │                                   │  │
│  │            │  ┌─────────────┐  │                                   │  │
│  │            │  │ UI Library  │  │  (Shadcn/ui)                      │  │
│  │            │  │ Admin Editors    │  (Dynamic forms)            │  │
│  │            │  │ Report Viewers   │  (Display)                  │  │
│  │            │  └─────────────┘  │                                   │  │
│  │            └────────┬──────────┘                                   │  │
│  │                     │                                              │  │
│  │            ┌────────▼──────────┐                                   │  │
│  │            │  Hooks & Context  │                                   │  │
│  │            │  Auth, Toast, etc │                                   │  │
│  │            └────────┬──────────┘                                   │  │
│  │                     │                                              │  │
│  │            ┌────────▼──────────┐                                   │  │
│  │            │  API Layer (HTTP) │                                   │  │
│  │            │  REST Endpoints   │                                   │  │
│  │            └────────┬──────────┘                                   │  │
│  │                     │                                              │  │
│  └─────────────────────┼──────────────────────────────────────────────┘  │
│                        │                                                   │
└────────────────────────┼───────────────────────────────────────────────────┘
                         │ HTTP/HTTPS (Fetch/Axios)
                         │
┌────────────────────────▼───────────────────────────────────────────────────┐
│                 Next.js Backend (Node.js)                                  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    API Routes (app/api/*)                            │ │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  ┌────────────┐  │ │
│  │  │ /auth  │  │/patients│  │/report │  │  /upload │  │/share-token│  │ │
│  │  └────────┘  └────────┘  └────────┘  └──────────┘  └────────────┘  │ │
│  │                                                                       │ │
│  └──────────────────────┬───────────────────────────────────────────────┘ │
│                         │                                                 │
│  ┌──────────────────────▼───────────────────────────────────────────────┐ │
│  │              Business Logic Layer (lib/*)                            │ │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │   auth   │  │ encryption│  │ utils    │  │ prisma   │           │ │
│  │  │  (JWT)   │  │ (secrets) │  │ (helpers)│  │ (ORM)    │           │ │
│  │  └──────────┘  └───────────┘  └──────────┘  └──────────┘           │ │
│  │                                                                       │ │
│  └──────────────────────┬───────────────────────────────────────────────┘ │
│                         │                                                 │
└────────────────────────┼─────────────────────────────────────────────────┘
                         │ SQL Queries
                         │
┌────────────────────────▼─────────────────────────────────────────────────┐
│                    PostgreSQL/MySQL Database                             │
│                                                                          │
│  ┌─────────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐              │
│  │ User        │  │ Patient │  │ Report  │  │ Sections │              │
│  │ Credentials │  │ Details │  │ Metadata│  │ & Data   │              │
│  │             │  │         │  │         │  │          │              │
│  └─────────────┘  └─────────┘  └─────────┘  └──────────┘              │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  ┌─────────────┐     │
│  │ ShareTokens │  │  AuditLogs  │  │  Images   │  │ Signatures  │     │
│  │             │  │  (tracking) │  │           │  │             │     │
│  └─────────────┘  └─────────────┘  └───────────┘  └─────────────┘     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────────────┐
                        │  Cloud Storage (S3-like) │
                        │  Images, Signatures      │
                        └──────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Report Creation Flow

```
Admin User
    │
    ▼
/admin Dashboard (Landing)
    │
    ├─→ Click "Create New Report"
    │
    ▼
Patient Selection/Creation
    │
    ├─→ POST /api/patients-data (if new)
    │
    ▼
Report Created (DRAFT status)
    │
    ├─→ POST /api/patients-data/:id/reports
    │
    ▼
/report/[id]/edit (Full Editor)
    │
    ├─→ Patient Info Section ──→ PATCH /api/patients-data/:id
    ├─→ Nutrition Section ─────→ PATCH /api/comprehensive-report-data/:id/nutrition
    ├─→ Sports Section ────────→ PATCH /api/comprehensive-report-data/:id/sports
    ├─→ Image Uploads ─────────→ POST /api/upload-image
    ├─→ Signature Upload ──────→ POST /api/upload-signature
    └─→ All Other Sections ────→ PATCH /api/comprehensive-report-data/:id/:section
    │
    ▼
Admin Clicks "Publish"
    │
    ├─→ PATCH /api/patients-data/:id/reports/:id (status = PUBLISHED)
    │
    ▼
Report Published
    │
    └─→ Viewers can now access via /report/[id]
```

### 2. Report Viewing Flow

```
User (Any Role)
    │
    ▼
/report (List Page)
    │
    ├─→ GET /api/patients-data (if admin)
    ├─→ GET /api/patients-data/my-reports (if viewer)
    │
    ▼
See List of Reports
    │
    ├─→ Click on Report
    │
    ▼
/report/[id] (View Page)
    │
    ├─→ GET /api/comprehensive-report-data/:id
    │
    ▼
Load All Sections:
    ├─→ PatientInfo
    ├─→ Nutrition
    ├─→ Sports
    ├─→ Sleep
    ├─→ Lifestyle
    ├─→ Digestive
    ├─→ Allergies
    ├─→ Addiction
    ├─→ Genetic
    ├─→ Genomic
    ├─→ Metabolic
    ├─→ HealthSummary
    └─→ Preventive
    │
    ▼
comprehensive-report-viewer Component
    ├─→ Display all sections with tabs/accordion
    ├─→ Show charts and visualizations
    ├─→ Display images per section
    │
    ▼
User Options:
    ├─→ Download as PDF ───────→ POST /api/comprehensive-report-data/:id/pdf
    ├─→ Share Report ──────────→ POST /api/share-report
    └─→ Print Report
```

### 3. Report Sharing Flow

```
Authenticated User
    │
    ▼
/report/[id] (View Page)
    │
    ├─→ Click "Share Report"
    │
    ▼
Share Configuration Dialog
    │
    ├─→ Set Expiration Date (optional)
    ├─→ Set Password (optional)
    ├─→ Set One-Time View (optional)
    │
    ▼
Click "Generate Link"
    │
    ├─→ POST /api/share-report
    │   └─→ Create ShareToken with unique token
    │   └─→ Return: https://domain.com/shared/ABC123XYZ
    │
    ▼
Copy & Share Link
    │
    └─→ User sends to external person
       │
       └─→ Guest clicks link
           │
           ▼
           /shared/[token]
           │
           ├─→ GET /api/shared-access/:token
           │   └─→ Validate token exists
           │   └─→ Check expiration
           │   └─→ Check one-time view
           │   └─→ Verify password if required
           │
           ▼
           comprehensive-report-viewer (Read Only)
           │
           └─→ Can view & download PDF only
               Cannot edit or access other reports
```

### 4. Authentication Flow

```
Anonymous User
    │
    ▼
Visit http://domain.com
    │
    ├─→ middleware.ts checks for auth token
    │
    ▼
No Token Found?
    │
    └─→ Redirect to /login
       │
       ▼
       Login Page
       │
       ├─→ User enters email & password
       │
       ▼
       Click "Login"
       │
       ├─→ POST /api/auth/login
       │   └─→ Hash password check against User.password
       │   └─→ Verify role (admin/viewer)
       │   └─→ Generate JWT token
       │   └─→ Store in secure HTTP-only cookie
       │   └─→ Return token + user data
       │
       ▼
       Token Stored
       │
       ├─→ Client cookie: auth-token=JWT
       │
       ▼
       Redirect to /report
       │
       ▼
       All Future Requests
       │
       ├─→ Include cookie/header with JWT
       ├─→ Server validates JWT
       ├─→ Extract user data from token
       ├─→ Check role permissions
       └─→ Process request
```

---

## 🗂️ Data Model Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                            │
│                                                                     │
│  ┌──────────┐                                                      │
│  │  User    │◄──────────────────────────────────┐                 │
│  │  ────────│ (1)                               │ (many)           │
│  │ id       │                                    │                 │
│  │ email    │──────────────────────────────────┐                  │
│  │ password │                                   │                 │
│  │ role     │                          ┌───────▼──────────────────┤  │
│  └──────────┘                          │                         │  │
│       │ (1)                            │                         │  │
│       │ createdBy                      │                         │  │
│       │                                │                         │  │
│       ▼ (many)                         │                         │  │
│  ┌──────────┐                          │                         │  │
│  │ Patient  │                          │                         │  │
│  │ ────────│                          │                         │  │
│  │ id       │                     ┌───▼─────┬──────────────────┤  │
│  │ name     │                     │         │                  │  │
│  │ email    │     (1)            │         │                  │  │
│  │ phone    │──────┬──────────►  │         │                  │  │
│  │ dob      │      │            │         │                  │  │
│  └──────────┘      │            │         │                  │  │
│       │ (1)        │            │         │                  │  │
│       │            │            │         │                  │  │
│       ▼ (many)     │            │         ▼                  │  │
│  ┌─────────────┐   │            │   ┌──────────────┐         │  │
│  │Report       │   │            │   │Report        │         │  │
│  │─────────────│   │            │   │──────────────│         │  │
│  │ id          │   │            │   │ id           │         │  │
│  │ patientId   │───┘            │   │ patientId    │         │  │
│  │ status      │                │   │ createdBy    │◄────────┘  │
│  │ version     │                │   │ status       │         │  │
│  │ createdBy   │────────────────┤   │ createdAt    │         │  │
│  │ createdAt   │                │   └──────┬───────┘         │  │
│  └─────────────┘                │          │                 │  │
│       │ (1)                      │          │                 │  │
│       ├──┬────────────────────┐  │          ▼ (many)          │  │
│       │  │                    │  │      ┌──────────────────┐  │  │
│       ▼  ▼                    │  │      │ Section Models   │  │  │
│  ┌─────────────────┐          │  │      │ (Nutrition,      │  │  │
│  │  Sections      │          │  │      │  Sports,         │  │  │
│  │  (1-to-1):     │          │  │      │  Sleep, etc)     │  │  │
│  │ ────────────────│          │  │      │ ──────────────   │  │  │
│  │ PatientInfo    │◄─┘        │  │      │ id               │  │  │
│  │ Nutrition      │           │  │      │ reportId         │  │  │
│  │ DietAnalysis   │           │  │      │ (section data)   │  │  │
│  │ Sports         │           │  │      │ updatedAt        │  │  │
│  │ Sleep          │           │  │      └──────────────────┘  │  │
│  │ Lifestyle      │           │  │                            │  │
│  │ Digestive      │           │  │                            │  │
│  │ Allergy        │           │  │                            │  │
│  │ Addiction      │           │  │                            │  │
│  │ Genetic        │           │  │                            │  │
│  │ Genomic        │           │  │                            │  │
│  │ Metabolic      │           │  │                            │  │
│  │ HealthSummary  │           │  │                            │  │
│  │ Preventive     │           │  │                            │  │
│  └─────────────────┘           │  │                            │  │
│       │                        │  │                            │  │
│       ▼ (many)                 │  │                            │  │
│  ┌──────────────┐              │  │                            │  │
│  │Image         │              │  │                            │  │
│  │──────────────│              │  │                            │  │
│  │id            │              │  │                            │  │
│  │reportId      ◄──────────────┼──┘                            │  │
│  │sectionType   │              │                              │  │
│  │filename      │              │                              │  │
│  │fileUrl       │              │                              │  │
│  └──────────────┘              │                              │  │
│       │ (many)                 │                              │  │
│       ▼                        │                              │  │
│   Cloud Storage                │                              │  │
│   (S3-like)                    │                              │  │
│                                │                              │  │
│  ┌────────────────┐            │                              │  │
│  │ Signature      │            │                              │  │
│  │────────────────│            │                              │  │
│  │ id             │◄───────────┼──────────────────────────────┘  │
│  │ reportId       │            │                              │  │
│  │ signatureUrl   │            │                              │  │
│  │ signedAt       │            │                              │  │
│  └────────────────┘            │                              │  │
│                                │                              │  │
│  ┌────────────────────┐        │                              │  │
│  │ ShareToken         │        │                              │  │
│  │────────────────────│        │                              │  │
│  │ id                 │        │                              │  │
│  │ reportId           │◄───────┼──────────────────────────────┘  │
│  │ token (unique)     │        │                              │  │
│  │ expiresAt          │        │                              │  │
│  │ requiresPassword    │        │                              │  │
│  │ password (hashed)   │        │                              │  │
│  │ oneTimeOnly        │        │                              │  │
│  │ createdBy          ├────────┘                              │  │
│  └────────────────────┘                                       │  │
│                                                                │  │
│  ┌──────────────────────┐                                     │  │
│  │ AuditLog             │                                     │  │
│  │──────────────────────│                                     │  │
│  │ id                   │                                     │  │
│  │ action (CREATE, etc) │                                     │  │
│  │ entity               │                                     │  │
│  │ entityId             │                                     │  │
│  │ changes (JSON)       │                                     │  │
│  │ performedBy          ├─────────────────────────────────────┘  │
│  │ createdAt            │                                     │  │
│  └──────────────────────┘                                     │  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Access Control Flow

```
Request Comes In
    │
    ▼
middleware.ts
    │
    ├─→ Extract JWT from cookie/header
    │
    ▼
Token Valid?
    │
    ├─→ No: Redirect to /login
    │
    ├─→ Yes: Continue
    │
    ▼
Extract User from Token
    │
    ├─→ Get user.id
    ├─→ Get user.role
    ├─→ Get user.email
    │
    ▼
Route-Specific Check
    │
    ├─→ Public Routes (/login, /shared/[token])
    │   └─→ No check needed
    │
    ├─→ Protected Routes (/report, /api/patients-data)
    │   └─→ Check: isAuthenticated == true
    │
    ├─→ Admin Routes (/admin, /report/[id]/edit)
    │   └─→ Check: role == 'ADMIN'
    │
    ▼
API Endpoint Authorization
    │
    ├─→ GET /api/patients-data
    │   └─→ Admin only
    │
    ├─→ GET /api/patients-data/:id/reports
    │   └─→ Admin OR (Viewer AND owner)
    │
    ├─→ PATCH /api/patients-data/:id/reports/:id
    │   └─→ Admin only (creator of report)
    │
    ├─→ GET /api/comprehensive-report-data/:id
    │   └─→ Admin OR Report owner
    │
    ├─→ GET /api/shared-access/:token
    │   └─→ Public (validate token)
    │
    ▼
Request Allowed
    │
    └─→ Process & return data
```

---

## 📋 Component Hierarchy Tree

```
Root Layout (/app/layout.tsx)
│
├─ AuthProvider
│   └─ ThemeProvider
│       └─ HeaderWithAuth
│           │
│           ├─ Login Page (/login)
│           │   ├─ Card
│           │   ├─ Input
│           │   ├─ Button
│           │   └─ Form Validation
│           │
│           ├─ Report List (/report)
│           │   ├─ Table
│           │   ├─ Pagination
│           │   ├─ Search/Filter
│           │   └─ Action Buttons
│           │
│           ├─ Report View (/report/[id])
│           │   └─ ComprehensiveReportViewer
│           │       ├─ Tabs/Accordion
│           │       ├─ PatientInfo Display
│           │       ├─ Chart Component
│           │       ├─ Image Gallery
│           │       └─ Export/Share Buttons
│           │
│           ├─ Report Edit (/report/[id]/edit)
│           │   ├─ PatientInfoAdmin
│           │   ├─ NutritionAdmin
│           │   ├─ DietAnalysisAdmin
│           │   ├─ SportsAdmin
│           │   ├─ SleepAdmin
│           │   ├─ LifestyleAdmin
│           │   ├─ DigestiveAdmin
│           │   ├─ AllergyAdmin
│           │   ├─ AddictionAdmin
│           │   ├─ GenomicAnalysisAdmin
│           │   │   ├─ GeneResultsAdmin
│           │   │   ├─ GeneticParametersAdmin
│           │   │   └─ FamilyGeneticImpactAdmin
│           │   ├─ MetabolicCoreAdmin
│           │   ├─ HealthSummaryAdmin
│           │   ├─ PreventiveHealthAdmin
│           │   ├─ ReportSettingsAdmin
│           │   ├─ PDFGenerator
│           │   ├─ ShareManagement
│           │   └─ SettingsAdmin
│           │
│           ├─ Admin Dashboard (/admin)
│           │   └─ Overview & Links
│           │
│           ├─ Shared Access (/shared/[token])
│           │   └─ ComprehensiveReportViewer (Read-only)
│           │
│           └─ All Pages Use
│               ├─ UI Components Library (/components/ui/*)
│               ├─ Hooks (useToast, useMobile)
│               └─ useContext (Auth, Theme)
```

---

## 🌊 Request-Response Cycle Example

### Example: Updating Nutrition Section

```
1. BROWSER - User Action
   └─→ Admin clicks "Save" in NutritionAdmin

2. FRONTEND - Component
   NutritionAdmin.tsx
      │
      ├─→ handleSave() called
      │
      ├─→ Validate form inputs
      │
      ├─→ Prepare data: { dailyCalories, carbs, proteins, ... }
      │
      ▼
3. FRONTEND - HTTP Request
   fetch('/api/comprehensive-report-data/:id/nutrition', {
     method: 'PATCH',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer JWT_TOKEN'
     },
     body: JSON.stringify(data)
   })

4. BACKEND - Route Handler
   /app/api/comprehensive-report-data/[id].ts
      │
      ├─→ Extract JWT from headers
      │
      ├─→ Verify token & get user
      │
      ├─→ Check: user has access to report
      │
      ▼
5. BACKEND - Business Logic
   lib/auth.ts & lib/utils.ts
      │
      ├─→ Validate request data
      │
      ├─→ Sanitize inputs
      │
      ├─→ Check user role (admin required)
      │
      ▼
6. BACKEND - Database
   lib/prisma.ts
      │
      ├─→ prisma.nutritionSection.update({
      │     where: { reportId: id },
      │     data: { ...validatedData }
      │   })
      │
      ├─→ Database transaction
      │
      ├─→ Log to AuditLog
      │
      ▼
7. BACKEND - Response
   return Response.json({ success: true, data: updated })

8. FRONTEND - Handle Response
   .then(response => {
     if (response.ok) {
       toast({ title: "Saved successfully" })
       // Optionally refresh data
     } else {
       toast({ variant: "destructive", title: "Error" })
     }
   })

9. BROWSER - UI Update
   └─→ Toast notification shown
   └─→ Data re-fetched or optimistic update applied
```

---

## 📡 API Endpoint Categories

```
Authentication APIs (Public)
├─ POST /api/auth/login
├─ POST /api/auth/logout
└─ GET  /api/auth/me

Patient APIs (Protected: Admin)
├─ GET    /api/patients-data
├─ POST   /api/patients-data
├─ GET    /api/patients-data/:id
└─ PATCH  /api/patients-data/:id

Report APIs (Protected: Admin/Owner)
├─ GET    /api/patients-data/:id/reports
├─ POST   /api/patients-data/:id/reports
├─ GET    /api/comprehensive-report-data/:id
├─ PATCH  /api/comprehensive-report-data/:id/:section
└─ DELETE /api/patients-data/:id/reports/:id

File Upload APIs (Protected: Admin)
├─ POST /api/upload-image
├─ POST /api/upload-signature
├─ POST /api/addiction-images
├─ POST /api/allergies-image
├─ POST /api/digestive-images
├─ POST /api/sleep-image
├─ POST /api/sports-images
└─ POST /api/lifestyle-upload

Sharing APIs (Public: Token-based)
├─ POST   /api/share-report
├─ GET    /api/shared-access/:token
└─ DELETE /api/share-report/:id

Nutrition APIs
├─ GET    /api/nutrition
├─ POST   /api/nutrition
└─ PATCH  /api/nutrition/:id
```

---

## 🔄 Real-time Update Flow (Future Enhancement)

```
Currently: Polling/Manual Refresh
├─ User makes change
├─ Sends API request
├─ Waits for response
└─ Refreshes page

Future: WebSocket/Real-time
├─ User makes change
├─ Sends via WebSocket
├─ Server broadcasts to other users
├─ UI updates in real-time
└─ No page refresh needed

Implementation:
├─ Add WebSocket handler
├─ Connect on Auth
├─ Subscribe to report channels
└─ Listen for change events
```

This comprehensive visual guide demonstrates the complete architecture, data flows, and relationships in the Report Builder application.
