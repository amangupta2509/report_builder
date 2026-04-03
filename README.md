# Report Builder

Next.js 15 application for generating, editing, and sharing genetic/nutrigenomic reports with authenticated admin access, shared report links, and Prisma-backed persistence.

## Quick Start

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

Copy [.env.example](.env.example) to `.env.local` or `.env.production` and fill in the secrets before starting Docker.

## Docker

```bash
docker compose up --build
```

## AWS Deployment

For an EC2 or RDS deployment path, see [docs/aws-deployment.md](docs/aws-deployment.md) and [docker-compose.aws.yml](docker-compose.aws.yml).

## Documentation

- [Project overview](docs/README.md)
- [Architecture](docs/architecture.md)
- [Security](docs/security.md)
- [Docker](docs/docker.md)
- [AWS deployment](docs/aws-deployment.md)
- [Testing](docs/testing.md)
