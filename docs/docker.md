# Docker

## Build strategy

The repository now uses a multi-stage Docker build based on hardened Chainguard Node images:

1. Install dependencies with `pnpm` and the checked-in lockfile.
2. Generate the Prisma client.
3. Build the Next.js standalone server.
4. Run the app in a slim runtime image that inherits the hardened defaults from the Chainguard Node base.

## Local Docker usage

```bash
docker compose up --build
```

## AWS usage

Use [docker-compose.aws.yml](../docker-compose.aws.yml) when the database lives in RDS or another external MySQL service. The app container expects `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, and `NEXT_PUBLIC_APP_URL` to be supplied at runtime.

## Required runtime environment variables

- Shared by both local and AWS deployments: `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`.
- Local compose only: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`.
- AWS compose only: `APP_IMAGE` when you want to point the AWS compose file at an ECR image.
- Optional PDF export: `PDF_SOURCE_URL`, `PDF_OUTPUT_PATH`, `PDF_COOKIE`.

## Notes

- Secrets are injected at runtime, not at image build time.
- The build uses `pnpm` through Corepack and the checked-in `pnpm-lock.yaml`.
- A sample environment file is available at [.env.example](../.env.example).
- `.dockerignore` excludes node_modules, `.next`, test outputs, and local environment files.
- The container health check uses Node's built-in HTTP client, so it does not depend on `wget` or `curl` being installed.
- The runtime image is intentionally slim; if you need the `export:pdf` script, run it in a separate environment that has Puppeteer browser binaries available.
