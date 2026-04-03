# Project Documentation

This folder is the maintained documentation entry point for the report builder app.

## What the app does

The application manages structured patient and report data for nutrigenomics-style reports. It includes:

- Admin editing and report generation flows in [app/admin/page.tsx](../app/admin/page.tsx)
- Authenticated session handling in [lib/auth.ts](../lib/auth.ts) and [middleware.ts](../middleware.ts)
- Database-backed persistence in [app/api/patients-data/route.ts](../app/api/patients-data/route.ts)
- Shared-link access in [app/api/share-report/route.ts](../app/api/share-report/route.ts) and [app/api/shared-access/route.ts](../app/api/shared-access/route.ts)

## Suggested reading order

1. [Architecture](architecture.md)
2. [Security](security.md)
3. [Docker](docker.md)
4. [AWS deployment](aws-deployment.md)
5. [Testing](testing.md)
