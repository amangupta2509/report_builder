# Report Builder - Detailed Folder Organization & Component Dependencies

## 📁 Directory Tree with Descriptions

```
report_builder/
│
├── 📄 Configuration Files
│   ├── next.config.mjs                 (Next.js configuration)
│   ├── tsconfig.json                   (TypeScript settings)
│   ├── tailwind.config.ts              (Tailwind CSS customization)
│   ├── postcss.config.mjs              (CSS processing)
│   ├── components.json                 (Shadcn/ui registry)
│   ├── package.json                    (Project dependencies)
│   ├── middleware.ts                   (Auth middleware, redirects)
│   └── next-env.d.ts                   (Next.js generated types)
│
├── 📂 /app (Next.js App Router - Pages & API Routes)
│   ├── 📄 page.tsx                     (Home page / Root entry)
│   ├── 📄 layout.tsx                   (Root layout wrapper)
│   ├── 📄 globals.css                  (Global application styles)
│   │
│   ├── 🔐 /login
│   │   └── 📄 page.tsx                 (Login page - auth entry)
│   │
│   ├── 📊 /report (Patient Reports)
│   │   ├── 📄 page.tsx                 (Report list & management)
│   │   ├── 📂 /[id]                    (Dynamic report ID route)
│   │   ├── 📂 /pdf                     (PDF generation path)
│   │   └── 📂 /preview                 (Report preview path)
│   │
│   ├── 🔗 /shared (Shared Access)
│   │   └── 📂 /[token]                 (Token-based sharing)
│   │
│   ├── ⚙️ /admin (Admin Dashboard)
│   │   └── 📄 page.tsx                 (Admin landing page)
│   │
│   └── 🔌 /api (RESTful API Routes)
│       ├── 📂 /auth                    (Authentication endpoints)
│       ├── 📂 /patients-data           (Patient CRUD)
│       ├── 📂 /comprehensive-report-data (Full report data)
│       ├── 📂 /upload-image            (Generic image upload)
│       ├── 📂 /upload-signature        (Signature upload)
│       ├── 📂 /nutrition               (Nutrition-specific)
│       ├── 📂 /share-report            (Report sharing logic)
│       ├── 📂 /shared-access           (Access validation)
│       ├── 📂 /lifestyle-upload        (Lifestyle data)
│       ├── 📂 /addiction-images        (Addiction section images)
│       ├── 📂 /allergies-image         (Allergies section images)
│       ├── 📂 /digestive-images        (Digestive section images)
│       ├── 📂 /sleep-image             (Sleep section images)
│       └── 📂 /sports-images           (Sports section images)
│
├── 🧩 /components (Reusable UI Components)
│   ├── 📄 auth-provider.tsx            (Auth context provider)
│   ├── 📄 comprehensive-report-viewer.tsx (Main report display)
│   ├── 📄 header-with-auth.tsx         (Navigation header with auth)
│   ├── 📄 theme-provider.tsx           (Theme/dark mode provider)
│   │
│   ├── 👨‍💼 /admin (Admin-only Components)
│   │   │
│   │   ├── 📝 Form/Input Components
│   │   │   ├── dynamic-field-helpers.tsx    (Form field utilities)
│   │   │   ├── dynamic-diet-field-admin.tsx (Diet field generator)
│   │   │   ├── patient-info-admin.tsx       (Basic patient demographics)
│   │   │   ├── nutrition-admin.tsx          (Nutrition analysis form)
│   │   │   ├── diet-analysis-admin.tsx      (Diet analysis form)
│   │   │   ├── lifestyle-conditions-admin.tsx (Lifestyle editor)
│   │   │   ├── sports-fitness-admin.tsx     (Sports/fitness editor)
│   │   │   ├── sleep-rest-admin.tsx         (Sleep data editor)
│   │   │   ├── digestive-health-admin.tsx   (GI health editor)
│   │   │   ├── allergies-sensitivity-admin.tsx (Allergy editor)
│   │   │   ├── genes-addiction-admin.tsx    (Addiction genetics editor)
│   │   │   └── preventive-health-admin.tsx  (Preventive care editor)
│   │   │
│   │   ├── 🧬 Genetic Components
│   │   │   ├── GenomicAnalysisAdmin.tsx          (Genomic visualization)
│   │   │   ├── gene-results-admin.tsx            (Gene test results)
│   │   │   ├── genetic-parameters-admin.tsx      (Parameter config)
│   │   │   ├── family-genetic-impact-admin.tsx   (Family genetics)
│   │   │   └── metabolic-core-admin.tsx          (Metabolic analysis)
│   │   │
│   │   ├── 📋 Report Management Components
│   │   │   ├── content-admin.tsx         (General content editor)
│   │   │   ├── report-settings-admin.tsx (Report configuration)
│   │   │   ├── report-summaries-admin.tsx (Summary sections)
│   │   │   ├── health-summary-admin.tsx  (Health overview)
│   │   │   ├── ReportPreview.tsx         (Preview view)
│   │   │   ├── pdf-generator.tsx         (PDF export)
│   │   │   ├── share-management.tsx      (Sharing controls)
│   │   │   ├── import-export-admin.tsx   (Data import/export)
│   │   │   └── settings-admin.tsx        (Admin settings)
│   │
│   └── 🎨 /ui (Shadcn/ui Component Library)
│       ├── 📄 accordion.tsx              (Collapsible sections)
│       ├── 📄 alert.tsx                  (Alert banner)
│       ├── 📄 alert-dialog.tsx           (Modal alert)
│       ├── 📄 aspect-ratio.tsx           (Layout ratio)
│       ├── 📄 avatar.tsx                 (User avatar)
│       ├── 📄 badge.tsx                  (Status badge)
│       ├── 📄 breadcrumb.tsx             (Navigation breadcrumb)
│       ├── 📄 button.tsx                 (Core button)
│       ├── 📄 calendar.tsx               (Date picker)
│       ├── 📄 card.tsx                   (Card container)
│       ├── 📄 carousel.tsx               (Image carousel)
│       ├── 📄 chart.tsx                  (Chart/graph display)
│       ├── 📄 checkbox.tsx               (Checkbox input)
│       ├── 📄 collapsible.tsx            (Collapsible control)
│       ├── 📄 command.tsx                (Command palette)
│       ├── 📄 context-menu.tsx           (Right-click menu)
│       ├── 📄 dialog.tsx                 (Modal dialog)
│       ├── 📄 dropdown-menu.tsx          (Dropdown menu)
│       ├── 📄 form.tsx                   (Form layout)
│       ├── 📄 input.tsx                  (Text input)
│       ├── 📄 label.tsx                  (Form label)
│       ├── 📄 modal.tsx                  (Modal wrapper)
│       ├── 📄 pagination.tsx             (List pagination)
│       ├── 📄 popover.tsx                (Popover container)
│       ├── 📄 progress.tsx               (Progress bar)
│       ├── 📄 radio-group.tsx            (Radio button group)
│       ├── 📄 scroll-area.tsx            (Scrollable container)
│       ├── 📄 select.tsx                 (Dropdown select)
│       ├── 📄 separator.tsx              (Visual separator)
│       ├── 📄 sheet.tsx                  (Side sheet panel)
│       ├── 📄 slider.tsx                 (Range slider)
│       ├── 📄 switch.tsx                 (Toggle switch)
│       ├── 📄 table.tsx                  (Data table)
│       ├── 📄 tabs.tsx                   (Tab navigation)
│       ├── 📄 textarea.tsx               (Multi-line input)
│       ├── 📄 toggle.tsx                 (Toggle button)
│       ├── 📄 toggle-group.tsx           (Toggle button group)
│       ├── 📄 tooltip.tsx                (Tooltip popup)
│       └── 📄 ... (additional UI components)
│
├── 🎣 /hooks (Custom React Hooks)
│   ├── 📄 use-mobile.tsx                (Mobile detection hook)
│   └── 📄 use-toast.ts                  (Toast notification hook)
│
├── 📚 /lib (Utilities & Libraries)
│   ├── 📄 auth.ts                       (Auth logic, JWT handling)
│   ├── 📄 encryption.ts                 (Encrypt/decrypt utilities)
│   ├── 📄 prisma.ts                     (Prisma client singleton)
│   └── 📄 utils.ts                      (Helper functions, cn())
│
├── 🗄️ /prisma (Database)
│   ├── 📄 schema.prisma                 (Data model definition)
│   └── 📂 /migrations                   (Database migration history)
│       ├── migration_timestamp_name/
│       └── ... (migration files)
│
├── 📦 /public (Static Assets)
│   ├── 📂 /addiction                    (Addiction section images)
│   ├── 📂 /allergies                    (Allergy images)
│   ├── 📂 /assets                       (General assets)
│   ├── 📂 /coverpages                   (Report cover images)
│   ├── 📂 /digestive                    (Digestive health images)
│   ├── 📂 /life                         (General lifestyle)
│   ├── 📂 /lifestyle                    (Lifestyle-specific images)
│   ├── 📂 /lifestylesensetivelevel      (Sensitivity level images)
│   ├── 📂 /sensitivity                  (Sensitivity images)
│   ├── 📂 /sleep                        (Sleep tracking images)
│   ├── 📂 /sports                       (Sports/fitness images)
│   ├── 📂 /table                        (Table graphics)
│   ├── 📂 /thankyou                     (Thank you page assets)
│   └── 📂 /uploads                      (User-uploaded files)
│
├── 🛠️ /scripts (Utility Scripts)
│   └── 📄 migrate-data.ts               (Data migration script)
│
├── 📝 /styles (Global Styles)
│   └── 📄 globals.css                   (Global CSS)
│
├── 📋 /types (TypeScript Type Definitions)
│   ├── 📄 html2pdf.d.ts                 (Type definitions for html2pdf)
│   └── 📄 report-types.ts               (Report domain types)
│
└── 📄 script.py                          (Python utility script)
```

---

## 🔗 Component Dependency Graph

### Authentication Flow

```
middleware.ts
    ↓
/login/page.tsx ← auth-provider.tsx
    ↓
lib/auth.ts ← lib/encryption.ts
    ↓
/api/auth/* (JWT tokens)
```

### Report Management Flow

```
/report/page.tsx
    ├→ header-with-auth.tsx
    ├→ components/ui/table.tsx
    ├→ components/ui/pagination.tsx
    └→ /api/patients-data
        └→ /api/comprehensive-report-data

/report/[id]/page.tsx
    ├→ comprehensive-report-viewer.tsx
    │   ├→ All report section components
    │   ├→ components/ui/tabs.tsx
    │   ├→ lib/utils.ts
    │   └→ /api/comprehensive-report-data/:id
    ├→ header-with-auth.tsx
    └→ components/ui/button.tsx
```

### Admin Report Editing Flow

```
/admin/page.tsx (Dashboard)
    ├→ header-with-auth.tsx
    └→ admin section managers
        ↓
/report/[id]/edit (Full Editor)
    ├→ All /admin/*.tsx editors
    ├→ dynamic-field-helpers.tsx
    ├→ All /components/ui/* components
    ├→ /api/patients-data/:id
    ├→ /api/upload-image
    ├→ /api/upload-signature
    └→ /api/:section-images
```

### Admin Components Hierarchy

```
[Report Editor Root]
    │
    ├── patient-info-admin.tsx
    ├── nutrition-admin.tsx
    │   └── dynamic-diet-field-admin.tsx
    ├── diet-analysis-admin.tsx
    ├── sports-fitness-admin.tsx
    ├── sleep-rest-admin.tsx
    ├── lifestyle-conditions-admin.tsx
    ├── digestive-health-admin.tsx
    ├── allergies-sensitivity-admin.tsx
    ├── genes-addiction-admin.tsx
    ├── GenomicAnalysisAdmin.tsx
    │   ├── gene-results-admin.tsx
    │   ├── genetic-parameters-admin.tsx
    │   └── family-genetic-impact-admin.tsx
    ├── metabolic-core-admin.tsx
    ├── health-summary-admin.tsx
    ├── preventive-health-admin.tsx
    ├── report-settings-admin.tsx
    ├── report-summaries-admin.tsx
    ├── content-admin.tsx
    ├── pdf-generator.tsx
    ├── ReportPreview.tsx
    ├── share-management.tsx
    ├── import-export-admin.tsx
    └── settings-admin.tsx
```

### Shared Report Access Flow

```
/shared/[token]/page.tsx
    ├→ /api/shared-access/:token (validation)
    ├→ header-with-auth.tsx
    └→ comprehensive-report-viewer.tsx (read-only)
        └→ /api/comprehensive-report-data/:id
```

---

## 📊 File Organization by Feature Domain

### **Authentication Domain**

```
Files: middleware.ts
       app/login/page.tsx
       lib/auth.ts
       lib/encryption.ts
       components/auth-provider.tsx
       components/header-with-auth.tsx
API:   /api/auth/*
```

### **Patient Management Domain**

```
Files: app/report/page.tsx
       components/ui/table.tsx
       lib/prisma.ts
       types/report-types.ts
API:   /api/patients-data/*
```

### **Report Viewing Domain**

```
Files: app/report/[id]/page.tsx
       components/comprehensive-report-viewer.tsx
       components/ui/tabs.tsx
       components/ui/accordion.tsx
       components/ui/card.tsx
API:   /api/comprehensive-report-data/:id
```

### **Report Editing Domain**

```
Files: All /components/admin/*.tsx files
       app/report/[id]/edit/page.tsx (inferred)
       lib/utils.ts
       hooks/use-toast.ts
API:   /api/patients-data/:id
       /api/:section-images
       /api/upload-*
```

### **PDF Export Domain**

```
Files: components/admin/pdf-generator.tsx
       app/report/[id]/pdf (page/route)
       types/html2pdf.d.ts
API:   /api/comprehensive-report-data/:id/pdf
```

### **Report Sharing Domain**

```
Files: components/admin/share-management.tsx
       app/shared/[token]/page.tsx
API:   /api/share-report/*
       /api/shared-access/:token
```

---

## 🔌 API Routes Organization by Purpose

### Authentication (3 routes assumed)

```
/api/auth/login     → POST
/api/auth/logout    → POST
/api/auth/me        → GET
```

### Patient Data (6+ routes)

```
/api/patients-data             → GET, POST
/api/patients-data/:id         → GET, PATCH
/api/patients-data/:id/reports → GET, POST
```

### Report Data (5+ routes)

```
/api/comprehensive-report-data/:id           → GET
/api/comprehensive-report-data/:id/:section  → PATCH
/api/comprehensive-report-data/:id/pdf       → GET, POST
```

### File Uploads (7+ routes)

```
/api/upload-image       → POST
/api/upload-signature   → POST
/api/addiction-images   → POST
/api/allergies-image    → POST
/api/digestive-images   → POST
/api/sleep-image        → POST
/api/sports-images      → POST
/api/lifestyle-upload   → POST
```

### Sharing & Access (3+ routes)

```
/api/share-report       → POST, DELETE
/api/shared-access      → GET (validate token)
/api/nutrition          → GET, POST, PATCH
```

---

## 💾 Database Model Hierarchy (from Prisma)

### Core Entities (inferred from API routes)

```
User
├── id
├── email
├── role (Admin, Viewer)
├── created_at
└── updated_at

Patient
├── id
├── name
├── age
├── gender
├── contact
├── created_by (FK to User)
└── created_at

Report
├── id
├── patient_id (FK to Patient)
├── status (draft, published)
├── created_by (FK to User)
├── version
├── created_at
└── updated_at

ReportSection (polymorphic or individual sections)
├── id
├── report_id (FK to Report)
├── section_type (patient_info, nutrition, lifestyle, etc.)
├── data (JSON)
└── updated_at

Image
├── id
├── report_id (FK to Report)
├── section_type
├── url
├── uploaded_at

ShareToken
├── id
├── report_id (FK to Report)
├── token (unique)
├── expires_at
├── created_by (FK to User)
└── created_at
```

---

## 🎯 Component Usage Patterns

### Form Components Pattern

**Files**: All `/admin/*-admin.tsx` files

```
export function XyzAdmin({ data, onChange }) {
  return (
    <Card>
      <CardHeader>...</CardHeader>
      <CardContent>
        <Input />
        <Textarea />
        <Select />
        <Button onClick={handleSave} />
      </CardContent>
    </Card>
  )
}
```

### UI Component Composition

**Files**: `/components/ui/*`

```
- Used with shadcn/ui patterns
- Styled with Tailwind CSS
- Composed into larger admin/page components
- Reusable with props/slots
```

### Page Component Pattern

**Files**: `app/*/page.tsx`

```
export default function Page() {
  return (
    <Layout>
      <Header />
      <MainContent />
      <Footer />
    </Layout>
  )
}
```

### Hook Pattern

**Files**: `/hooks/*.ts`

```
export function useX() {
  return { ... }
}
// Usage: const { x } = useX()
```

---

## 🔐 Security Boundaries

### Public Routes

- `/login`
- `/shared/[token]`
- `/api/auth/*`
- `/api/shared-access/*`

### Protected Routes (Viewer+)

- `/report/*`
- `/api/patients-data/*` (own data only)
- `/api/comprehensive-report-data/*` (own reports only)

### Admin-Only Routes

- `/admin`
- `/report/[id]/edit`
- All components in `/components/admin/`
- `/api/patients-data` (all data)

---

## 📦 Key Technologies by Folder

| Folder           | Technology             | Purpose                     |
| ---------------- | ---------------------- | --------------------------- |
| `/app`           | Next.js 13+ App Router | Page routing & API          |
| `/components`    | React + TypeScript     | UI components               |
| `/components/ui` | Shadcn/ui              | Pre-built component library |
| `/lib`           | Node.js utilities      | Backend logic               |
| `/prisma`        | Prisma ORM             | Database abstraction        |
| `/public`        | Static files           | Asset storage               |
| `/styles`        | Tailwind CSS           | Styling                     |
| `/types`         | TypeScript             | Type definitions            |
| `/hooks`         | React                  | Custom logic hooks          |

---

## 📈 Application Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│          Pages (app/*.tsx)                          │
│  - Login, Report, Admin, Shared Access             │
└────────────────┬────────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────────┐
│    Components (UI + Admin Components)               │
│  - Header, Report Viewer, Form Editors             │
│  - Shadcn/ui library components                    │
└────────────────┬────────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────────┐
│     Hooks & Context (State Management)              │
│  - useToast, useMobile, AuthProvider               │
└────────────────┬────────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────────┐
│         API Routes (app/api/*)                      │
│  - Authentication, Data CRUD, File Upload          │
└────────────────┬────────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────────┐
│   Libraries & Utilities (lib/*)                     │
│  - Auth, Encryption, Prisma, Utils                 │
└────────────────┬────────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────────┐
│  Database (Prisma → PostgreSQL/MySQL)              │
└─────────────────────────────────────────────────────┘
```

---

## Summary Statistics

- **Total Pages**: ~15 main page routes
- **API Endpoints**: ~30+ RESTful endpoints
- **UI Components**: 30+ shadcn/ui components
- **Admin Components**: 20+ specialized editors
- **Custom Hooks**: 2 custom hooks
- **Utility Libraries**: 4 main utilities
- **Database Models**: ~6-8 estimated Prisma models
- **Asset Categories**: 12 public asset folders
- **Total Configuration Files**: 7 main configs

This architecture demonstrates a **professional, scalable healthcare application** with clear separation of concerns, modular components, and comprehensive domain organization.
