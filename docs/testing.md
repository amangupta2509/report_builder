# Testing

## Commands

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

## Coverage areas

- Unit tests for utility logic and security helpers.
- Integration tests for auth and middleware behavior.
- Playwright E2E tests for report viewing, sharing, file upload, and admin flows.

## Practical notes

- Run `pnpm prisma generate` before tests if the Prisma client is stale.
- Keep the test environment secrets aligned with [jest.setup.js](../jest.setup.js).
- Prefer fixing failing tests by correcting the route or component behavior rather than relaxing assertions.
