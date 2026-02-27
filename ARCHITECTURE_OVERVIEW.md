# Report Builder Application - Architecture Overview

## Project Type

**Next.js Full-Stack Application** with comprehensive health report generation and management system.

---

## Technology Stack

### Frontend

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **UI Components**: Shadcn/ui (custom component library)
- **Styling**: Tailwind CSS
- **State Management**: React Context API, Local Component State
- **Forms**: React Hook Form (inferred from component patterns)
- **PDF Generation**: html2pdf or similar library

### Backend

- **Runtime**: Node.js (via Next.js API Routes)
- **Database**: Prisma ORM (schema.prisma exists)
- **Authentication**: JWT or similar (auth.ts, middleware.ts)
- **Encryption**: Crypto utilities (encryption.ts)
- **API Style**: RESTful endpoints

### Database & ORM

- **ORM**: Prisma with migrations support
- **Models**: Multiple patient and report-related schemas

### Development Tools

- **Package Manager**: pnpm (pnpm-lock.yaml)
- **Bundler**: Next.js built-in
- **CSS Processing**: PostCSS
- **Testing**: Not visible in structure (may be in separate folder)

---

## Application Structure

### 1. **Core Application (`/app`)**

The Next.js App Router directory containing pages and API routes.

#### **Pages Hierarchy**

```
app/
├── page.tsx                    # Home/index page
├── layout.tsx                  # Root layout with global styles
├── globals.css                 # Global styles
├── login/                      # Authentication pages
│   └── page.tsx
├── report/                     # Report management pages
│   ├── page.tsx               # Report list
│   ├── [id]/                  # Dynamic report view
│   ├── pdf/                   # PDF generation
│   └── preview/               # Report preview
├── shared/                     # Shared report access
│   └── [token]/              # Token-based sharing
└── admin/                      # Admin dashboard
    └── page.tsx
```

#### **API Routes (`/app/api`)**

```
app/api/
├── auth/                       # Authentication endpoints
├── patients-data/             # Patient information CRUD
├── comprehensive-report-data/ # Full report data endpoints
├── upload-image/              # Image upload handling
├── upload-signature/          # Digital signature uploads
├── nutrition/                 # Nutrition-specific endpoints
├── share-report/              # Report sharing logic
├── shared-access/             # Access validation for shared reports
├── lifestyle-upload/          # Lifestyle data uploads
├── addiction-images/          # Addiction-related images
├── allergies-image/           # Allergy information images
├── digestive-images/          # Digestive health images
├── sleep-image/               # Sleep data images
└── sports-images/             # Athletic/fitness images
```

---

### 2. **Components (`/components`)**

Reusable UI components organized by functionality.

#### **Layout & Shell Components**

- `header-with-auth.tsx` - Navigation with authentication state
- `auth-provider.tsx` - Auth context provider wrapper
- `theme-provider.tsx` - Theme management (light/dark mode)
- `comprehensive-report-viewer.tsx` - Main report display component

#### **Admin Components (`/admin`)**

Specialized components for admin report editing and management:

- **Section Editors**:

  - `patient-info-admin.tsx` - Basic patient demographics
  - `nutrition-admin.tsx` - Nutrition analysis
  - `sports-fitness-admin.tsx` - Athletic fitness data
  - `sleep-rest-admin.tsx` - Sleep tracking
  - `lifestyle-conditions-admin.tsx` - Lifestyle parameters
  - `digestive-health-admin.tsx` - GI health
  - `allergies-sensitivity-admin.tsx` - Allergies and sensitivities
  - `genes-addiction-admin.tsx` - Addiction genetics

- **Genetic & Analysis**:

  - `GenomicAnalysisAdmin.tsx` - genomic data visualization
  - `gene-results-admin.tsx` - Gene test results display
  - `genetic-parameters-admin.tsx` - Genetic parameter configuration
  - `family-genetic-impact-admin.tsx` - Family genetics impact

- **Health Management**:

  - `health-summary-admin.tsx` - Health overview
  - `preventive-health-admin.tsx` - Preventive care recommendations
  - `metabolic-core-admin.tsx` - Metabolic analysis

- **Report Management**:

  - `report-settings-admin.tsx` - Report configuration
  - `report-summaries-admin.tsx` - Report summary sections
  - `content-admin.tsx` - General content management
  - `pdf-generator.tsx` - PDF export functionality
  - `ReportPreview.tsx` - Report preview/draft view
  - `share-management.tsx` - Report sharing controls

- **Utility**:
  - `import-export-admin.tsx` - Data import/export
  - `dynamic-field-helpers.tsx` - Dynamic form field utilities
  - `dynamic-diet-field-admin.tsx` - Diet field generator
  - `settings-admin.tsx` - Admin settings

#### **UI Components (`/components/ui`)**

Comprehensive Shadcn/ui component library including:

- `accordion.tsx` - Collapsible sections
- `alert.tsx`, `alert-dialog.tsx` - Notifications
- `avatar.tsx`, `badge.tsx` - Decorative elements
- `breadcrumb.tsx` - Navigation breadcrumbs
- `button.tsx`, `card.tsx` - Core components
- `calendar.tsx`, `carousel.tsx` - Complex controls
- `checkbox.tsx`, `command.tsx` - Form inputs
- `dialog.tsx`, `dropdown-menu.tsx` - Modals and menus
- `input.tsx`, `label.tsx` - Form elements
- `pagination.tsx`, `popover.tsx` - Lists and overlays
- `select.tsx`, `slider.tsx` - Selection controls
- `table.tsx`, `tabs.tsx` - Data display
- `textarea.tsx`, `toggle.tsx` - Text input variants

---

### 3. **Hooks (`/hooks`)**

Custom React hooks:

- `use-mobile.tsx` - Responsive mobile detection
- `use-toast.ts` - Toast notification management

---

### 4. **Libraries & Utilities (`/lib`)**

Core utility functions and configurations:

- `auth.ts` - Authentication logic and JWT handling
- `encryption.ts` - Data encryption/decryption utilities
- `prisma.ts` - Prisma client singleton
- `utils.ts` - General utility functions (cn, formatting, etc.)

---

### 5. **Database (`/prisma`)**

Database configuration and schema:

- `schema.prisma` - Prisma data model
- `migrations/` - Database migration history

---

### 6. **Public Assets (`/public`)**

Static files organized by report section:

```
public/
├── addiction/        # Addiction-related images
├── allergies/        # Allergy images
├── assets/          # General assets
├── coverpages/      # Report cover pages
├── digestive/       # Digestive health images
├── life/            # General lifestyle
├── lifestyle/       # Lifestyle-specific
├── lifestylesensetivelevel/  # Sensitivity levels
├── sensitivity/     # Sensitivity-specific
├── sleep/           # Sleep tracking images
├── sports/          # Sports/fitness images
├── table/           # Table graphics
├── thankyou/        # Thank you page assets
└── uploads/         # User-uploaded files
```

---

### 7. **Scripts (`/scripts`)**

Utility scripts:

- `migrate-data.ts` - Data migration scripts

---

### 8. **Configuration Files**

| File                 | Purpose                              |
| -------------------- | ------------------------------------ |
| `next.config.mjs`    | Next.js configuration                |
| `tsconfig.json`      | TypeScript configuration             |
| `tailwind.config.ts` | Tailwind CSS customization           |
| `postcss.config.mjs` | CSS processing configuration         |
| `components.json`    | Shadcn/ui component registry         |
| `package.json`       | Project dependencies                 |
| `middleware.ts`      | Next.js middleware (auth, redirects) |

---

## Key Features & Domains

### 1. **Patient Health Reports**

- Comprehensive multi-section health analysis
- Genetic analysis and gene results
- Lifestyle and habit tracking
- Nutritional analysis
- Sleep and rest metrics
- Sports and fitness data
- Digestive health assessment
- Allergy and sensitivity tracking
- Addiction/substance analysis
- Family genetic impact
- Preventive health recommendations
- Metabolic core analysis
- Health summaries

### 2. **Report Management**

- Create, read, update, delete reports
- Draft/publish workflow
- Report versioning
- Multi-user access control
- Share with tokens/tokens
- PDF export functionality
- Image uploads (multiple per section)

### 3. **Authentication & Authorization**

- User login/logout
- Role-based access (Viewer, Admin)
- JWT or session-based auth
- Secure token-based sharing
- Admin-only pages

### 4. **Admin Panel**

- User management (CRUD)
- System settings
- Report template configuration
- Content management per section
- Audit logging capability
- Dynamic field configuration
- Import/export functionality

### 5. **Data Management**

- Patient information storage
- Multi-section report data
- Image storage and management
- Signature uploads
- Encryption for sensitive data

---

## User Roles & Permissions

### **Public User (Unauthenticated)**

- View shared reports (with token)
- Access login page

### **Viewer User**

- View their own reports
- Download/print reports
- Share reports with public link
- Cannot edit reports

### **Admin User**

- All Viewer permissions
- Create/edit/delete reports
- Edit all report sections
- Upload images and signatures
- Configure report templates
- Manage users
- Configure system settings
- View audit logs

---

## Data Flow Architecture

### **Report Creation Flow**

1. Admin creates new report in `/admin`
2. Fills patient info, selects/uploads data per section
3. System saves to database via `/api/patients-data`
4. Each section saves independently
5. Admin publishes report

### **Report Viewing Flow**

1. User authenticates → `/login`
2. Sees report list → `/report`
3. Selects report → `/report/[id]`
4. Fetches data from `/api/comprehensive-report-data`
5. Displays all sections via `comprehensive-report-viewer`
6. Can export PDF or share

### **Report Sharing Flow**

1. Admin/Viewer initiates share → `share-management`
2. System generates unique token
3. Creates shareable link
4. Guest accesses via `/shared/[token]`
5. Validates token against `/api/shared-access`
6. Displays report read-only

---

## API Architecture Summary

### **Authentication Endpoints**

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### **Patient Data Endpoints**

- `GET /api/patients-data` - List all patients
- `GET /api/patients-data/:patientId` - Get patient
- `POST /api/patients-data` - Create patient
- `PATCH /api/patients-data/:patientId` - Update patient
- `GET /api/patients-data/:patientId/reports` - List reports
- `GET /api/patients-data/:patientId/reports/:reportId` - Get report
- `POST /api/patients-data/:patientId/reports` - Create report
- `PATCH /api/patients-data/:patientId/reports/:reportId` - Update report
- `DELETE /api/patients-data/:patientId/reports/:reportId` - Delete report

### **Report Data Endpoints**

- `GET /api/comprehensive-report-data/:reportId` - Get full report
- `PATCH /api/comprehensive-report-data/:reportId/:section` - Update section
- `POST /api/comprehensive-report-data/:reportId/pdf` - Generate PDF
- `GET /api/comprehensive-report-data/:reportId/pdf` - Get PDF

### **Upload Endpoints**

- `POST /api/upload-image` - Upload generic image
- `POST /api/upload-signature` - Upload signature
- `POST /api/:section-images` - Section-specific images

### **Sharing Endpoints**

- `POST /api/share-report` - Create shared link
- `GET /api/shared-access/:token` - Validate & get shared report
- `DELETE /api/share-report/:shareId` - Revoke share

### **Nutrition Endpoints**

- `GET /api/nutrition` - Nutrition data
- `POST /api/nutrition` - Create nutrition analysis
- `PATCH /api/nutrition/:id` - Update nutrition

---

## Security Considerations

1. **Authentication**: JWT tokens in headers/cookies
2. **Authorization**: Role-based middleware checks
3. **Encryption**: Sensitive data encrypted at rest (encryption.ts)
4. **Share Tokens**: Unique, time-limited (configurable)
5. **CORS**: Configured for same-origin requests
6. **Database**: Prisma prevents SQL injection
7. **File Upload**: Size limits, type validation
8. **Input Validation**: Server-side validation on all endpoints

---

## Performance & Scalability

1. **Client-side**: React, Next.js built-in code splitting
2. **Server-side**: Next.js API routes with efficient database queries
3. **Database**: Indexed fields for common queries
4. **Caching**: Implementation details not visible (may use SWR/React Query)
5. **Image Optimization**: Next.js Image component likely used
6. **PDF Generation**: Client or server-side depending on html2pdf setup

---

## Development Workflow

1. **Local Development**: `pnpm dev`
2. **Building**: `pnpm build`
3. **Testing**: Configuration not visible
4. **Database**: Migrations via `prisma migrate`
5. **Version Control**: Git (inferred from typical workflow)

---

## Known Dependencies

From `package.json` (structures visible in components/pages):

- **React** & **React-DOM**
- **Next.js** 13+
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** component library
- **Prisma** ORM
- **html2pdf** or similar PDF library
- **Potential**: React Hook Form, SWR/React Query, axios/fetch

---

## Potential Improvements & Considerations

1. **State Management**: Consider Redux/Zustand for complex shared state
2. **Testing**: Add Jest, React Testing Library, Cypress
3. **API Documentation**: Swagger/OpenAPI integration
4. **Error Handling**: Centralized error boundary components
5. **Loading States**: Consistent loading skeletons
6. **Offline Support**: Service Workers, offline caching
7. **Analytics**: Integration for user behavior tracking
8. **Internationalization**: i18n support if multi-language needed
9. **Mobile Optimization**: Responsive design, touch-friendly
10. **Accessibility**: WCAG 2.1 AA compliance audit

---

## Summary

This is a **sophisticated healthcare reporting platform** built with modern Next.js and TypeScript. It emphasizes:

- **Modular component architecture** (Shadcn/ui foundation)
- **Comprehensive health data management** (multiple specialized sections)
- **Secure sharing mechanism** (token-based public access)
- **Admin flexibility** (dynamic field configuration, template management)
- **Database-driven** (Prisma with migrations)
- **Type-safe** throughout (TypeScript, Prisma-generated types)

The application is production-ready with clear separation of concerns, organized file structure, and scalable architecture.
