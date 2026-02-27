# Report Builder - Quick Developer Reference Guide

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
pnpm dev

# Open in browser
# http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Lint and format
pnpm lint
pnpm format
```

---

## 📂 File Structure Quick Reference

| Path                | Purpose             | Key Files                                         |
| ------------------- | ------------------- | ------------------------------------------------- |
| `/app`              | Next.js pages & API | `page.tsx`, `layout.tsx`                          |
| `/app/api`          | API endpoints       | `auth/`, `patients-data/`, etc                    |
| `/components`       | Reusable UI         | `header-with-auth.tsx`, `theme-provider.tsx`      |
| `/components/admin` | Admin editors       | `nutrition-admin.tsx`, `sports-fitness-admin.tsx` |
| `/components/ui`    | Shadcn/ui library   | `button.tsx`, `card.tsx`, etc                     |
| `/hooks`            | Custom React hooks  | `use-toast.ts`, `use-mobile.tsx`                  |
| `/lib`              | Utilities & logic   | `auth.ts`, `encryption.ts`, `prisma.ts`           |
| `/prisma`           | Database schema     | `schema.prisma`, `migrations/`                    |
| `/public`           | Static assets       | Images organized by section                       |
| `/styles`           | CSS files           | `globals.css`                                     |
| `/types`            | TypeScript types    | `report-types.ts`, `html2pdf.d.ts`                |

---

## 🔐 Authentication Flow

### Login Process

```
1. User visits /login
2. Enters email & password
3. POST /api/auth/login
4. Server verifies credentials
5. Returns JWT token
6. Token stored in cookie/localStorage
7. Redirected to /report
8. All subsequent requests include token
```

### Protected Routes

```
middleware.ts checks each request:
  - No token → redirect to /login
  - Invalid token → redirect to /login
  - Valid token → continue
```

### Roles

- **ADMIN**: Full access (create/edit/delete reports)
- **VIEWER**: View-only access (can share but not edit)

---

## 🔌 API Endpoints Cheat Sheet

### Authentication

```
POST   /api/auth/login          Login user
POST   /api/auth/logout         Logout user
GET    /api/auth/me             Get current user
```

### Patients

```
GET    /api/patients-data       List all patients (admin only)
POST   /api/patients-data       Create new patient (admin)
GET    /api/patients-data/:id   Get patient details
PATCH  /api/patients-data/:id   Update patient info
```

### Reports

```
GET    /api/patients-data/:id/reports           List patient's reports
POST   /api/patients-data/:id/reports           Create report
GET    /api/comprehensive-report-data/:id       Get full report
PATCH  /api/comprehensive-report-data/:id/:sec  Update section
```

### File Uploads

```
POST   /api/upload-image        Upload generic image
POST   /api/upload-signature    Upload signature
POST   /api/:section-images     Upload section-specific image
```

### Sharing

```
POST   /api/share-report        Create share link
GET    /api/shared-access/:token  Validate & get shared report
DELETE /api/share-report/:id    Revoke share link
```

### Utilities

```
GET    /api/nutrition           Nutrition data endpoints
POST   /api/nutrition           Create nutrition analysis
```

---

## 🧩 Component Usage Examples

### Using a UI Component

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button onClick={() => console.log('clicked')}>
          Click Me
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Using a Hook

```typescript
import { useToast } from "@/hooks/use-toast"

export function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Operation completed",
      variant: "default"
    })
  }

  return <button onClick={handleSuccess}>Show Toast</button>
}
```

### Using Auth Provider

```typescript
import { useContext } from "react"
import { AuthContext } from "@/components/auth-provider"

export function MyComponent() {
  const { user, isAuthenticated } = useContext(AuthContext)

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome {user.email}</p>
      ) : (
        <p>Please login</p>
      )}
    </div>
  )
}
```

### Creating an Admin Section Editor

```typescript
// Template: /components/admin/my-section-admin.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function MySectionAdmin({ data, onSave }) {
  const [formData, setFormData] = useState(data || {})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    await onSave(formData)
  }

  return (
    <Card>
      <CardHeader>My Section Title</CardHeader>
      <CardContent>
        <Input
          placeholder="Enter data"
          value={formData.field || ''}
          onChange={(e) => handleChange('field', e.target.value)}
        />
        <Button onClick={handleSave} className="mt-4">Save</Button>
      </CardContent>
    </Card>
  )
}
```

---

## 📊 Common Data Patterns

### Fetching Report Data

```typescript
const [report, setReport] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchReport = async () => {
    const response = await fetch(`/api/comprehensive-report-data/${reportId}`);
    const data = await response.json();
    setReport(data);
    setLoading(false);
  };

  fetchReport();
}, [reportId]);
```

### Updating a Report Section

```typescript
const updateSection = async (sectionData) => {
  const response = await fetch(
    `/api/comprehensive-report-data/${reportId}/nutrition`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sectionData),
    },
  );

  if (response.ok) {
    toast({ title: "Saved successfully" });
  } else {
    toast({ title: "Error saving", variant: "destructive" });
  }
};
```

### Uploading Images

```typescript
const uploadImage = async (file, section) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("reportId", reportId);
  formData.append("section", section);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const { url } = await response.json();
  return url;
};
```

---

## 🗄️ Database Operations (Prisma)

### Querying with Prisma

```typescript
// In API route or server function
import { prisma } from "@/lib/prisma";

// Get patient with all reports
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
  include: { reports: true },
});

// Get report with all sections
const report = await prisma.report.findUnique({
  where: { id: reportId },
  include: {
    patientInfo: true,
    nutritionData: true,
    sportsData: true,
    // ... other sections
  },
});

// Create report
const newReport = await prisma.report.create({
  data: {
    patientId,
    createdBy: userId,
    status: "DRAFT",
  },
});

// Update section
const updated = await prisma.nutritionSection.update({
  where: { reportId },
  data: { dailyCalories: 2000 },
});
```

### Running Migrations

```bash
# Create a new migration
npx prisma migrate dev --name describe_change

# Apply pending migrations
npx prisma migrate deploy

# View current schema
npx prisma db push

# Reset database (development only!)
npx prisma migrate reset
```

---

## 🔒 Security Checklist

- [ ] Environment variables set (.env.local)
- [ ] JWT tokens validated on all protected routes
- [ ] User role checked before admin operations
- [ ] CORS configured properly
- [ ] Sensitive data encrypted (encryption.ts)
- [ ] File uploads validated (type, size)
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS prevented (React escapes by default)
- [ ] CSRF protection on forms
- [ ] Rate limiting on auth endpoints
- [ ] Audit logs enabled for compliance

---

## 🐛 Common Issues & Solutions

### "Cannot find module" Error

```
Solution: Clear node_modules and reinstall
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
```

### Prisma Client Not Generated

```
Solution: Generate Prisma client
  npx prisma generate
```

### Database Connection Error

```
Solution: Check .env.local DATABASE_URL
  - Verify server is running
  - Check credentials
  - Verify network access
```

### Middleware Not Working

```
Solution: Check middleware.ts matches Next.js version
  - Ensure correct matcher pattern
  - Check token extraction logic
```

### Shadcn Component Not Showing

```
Solution: Ensure component is added to registry
  - Check components.json
  - Run: npx shadcn-ui@latest add [component-name]
```

---

## 📚 Code Style Guide

### TypeScript

```typescript
// ✅ Good
interface UserData {
  id: string
  email: string
  role: 'admin' | 'viewer'
}

const user: UserData = { ... }

// ❌ Avoid
const user: any = { ... }
```

### Component Names

```
// ✅ Use descriptive, PascalCase names
export function PatientInfoAdmin() { }
export function ReportViewer() { }

// ❌ Avoid
export function admin() { }
export function report_viewer() { }
```

### File Organization

```
// ✅ Group related files
/components/admin/
  patient-info-admin.tsx
  nutrition-admin.tsx
  sports-fitness-admin.tsx

/components/ui/
  button.tsx
  card.tsx

// ❌ Avoid flat structure
/components/
  patient-info.tsx
  nutrition.tsx
  button.tsx
  card.tsx
```

### Import Order

```typescript
// 1. External packages
import React from "react";
import { useState } from "react";

// 2. Internal components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 3. Utilities
import { cn } from "@/lib/utils";

// 4. Types
import type { Report } from "@/types/report-types";
```

---

## 📝 Common Task Checklist

### Adding a New Report Section

1. **Create database model** in `prisma/schema.prisma`

   ```prisma
   model NewSection {
     id String @id @default(cuid())
     reportId String @unique
     report Report @relation(fields: [reportId], references: [id])
     // ... fields
   }
   ```

2. **Run migration**

   ```bash
   npx prisma migrate dev --name add_new_section
   ```

3. **Create admin component** in `/components/admin/new-section-admin.tsx`

4. **Add to report page** in `/app/report/[id]/edit/page.tsx`

5. **Create API endpoint** for section updates

6. **Add to display** in `comprehensive-report-viewer.tsx`

### Adding a New Role/Permission

1. Update `Role` enum in `prisma/schema.prisma`
2. Update middleware.ts authorization checks
3. Update API route permission checks
4. Update component visibility logic

### Adding New Admin Settings

1. Create new admin component
2. Add to admin dashboard page
3. Create API endpoint to save settings
4. Update ReportSettings model if persistent

---

## 🔗 Important Links & Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Tools

- Prisma Studio: `npx prisma studio`
- Format code: `pnpm format`
- Check types: `pnpm type-check`
- Build check: `pnpm build`

---

## 👥 Team Contacts

| Role       | Responsibility     | Notes                  |
| ---------- | ------------------ | ---------------------- |
| Full Stack | Features & API     | Main development       |
| DevOps     | Deployment & Infra | Environment setup      |
| QA         | Testing            | Bug reports            |
| PM         | Requirements       | Feature prioritization |

---

## 📅 Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request
# Request review
# Merge after approval
```

### Code Review Checklist

- [ ] Follows code style guide
- [ ] TypeScript strict mode passes
- [ ] No console errors/warnings
- [ ] API contract matches
- [ ] Database migrations included
- [ ] Tested locally
- [ ] Documentation updated

---

This quick reference covers the most common development tasks. For detailed information, refer to the other documentation files in the project.
