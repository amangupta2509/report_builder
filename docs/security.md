# Security

## What is already in place

- JWT-based session cookies with `httpOnly`, `sameSite=lax`, and production `secure` flags in [lib/auth.ts](../lib/auth.ts).
- Route protection and admin checks in [middleware.ts](../middleware.ts).
- Password hashing in [lib/encryption.ts](../lib/encryption.ts).
- Rate limiting for shared-link access in [app/api/shared-access/route.ts](../app/api/shared-access/route.ts).
- Audit logging in the auth routes and user model.

## Important fixes made in this pass

- Secrets are no longer read at module import time in auth and encryption helpers.
- Middleware now forwards user context to downstream server handlers using request headers instead of trying to set response headers.
- Image upload endpoints now reject SVG and validate file extensions before writing into `public/`.
- File delete handlers now resolve paths safely and block traversal outside the intended folder.
- Prisma clients were consolidated to the shared singleton in server routes.

## Ongoing risks to keep watching

- Do not reintroduce SVG uploads unless you also add sanitization and a clear content-disposition strategy.
- Avoid storing sensitive report data in memory or local JSON files.
- Keep `JWT_SECRET` and `ENCRYPTION_KEY` runtime-only; do not bake them into images or source-controlled `.env` files.
- Treat the legacy comprehensive-report route as deprecatable technical debt.
