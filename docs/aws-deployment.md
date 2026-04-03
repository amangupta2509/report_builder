# AWS Deployment

## Recommended shape

The safest production layout is:

- Build the app image locally or in CI.
- Push the image to Amazon ECR.
- Run the container on EC2, ECS, or another AWS compute service.
- Keep MySQL in Amazon RDS instead of running the database in the same container host.

If you want a single-server setup, you can still run the existing [docker-compose.yml](../docker-compose.yml) on EC2, but the database will also live on that host and you will need to manage backups and disk growth yourself.

## Files to use

- [Dockerfile](../Dockerfile) for the production image.
- [docker-compose.aws.yml](../docker-compose.aws.yml) for an AWS app-only runtime.
- [.env.example](../.env.example) as the base environment template.

## Environment values

Copy [.env.example](../.env.example) to `.env.production` and update:

- `DATABASE_URL` to point at your RDS MySQL instance.
- `NEXT_PUBLIC_APP_URL` to your public AWS domain or load balancer URL.
- `JWT_SECRET` and `ENCRYPTION_KEY` to fresh secrets generated for production.
- `APP_IMAGE` to the ECR image URI if you are not using the default local tag.

Example production values:

```env
APP_IMAGE=123456789012.dkr.ecr.us-east-1.amazonaws.com/report-builder:latest
DATABASE_URL=mysql://report_user:strong-password@report-builder.xxxxxx.us-east-1.rds.amazonaws.com:3306/report_builder
NEXT_PUBLIC_APP_URL=https://reports.example.com
JWT_SECRET=generate-a-long-random-value
ENCRYPTION_KEY=generate-a-64-character-hex-key
```

## Build and push to ECR

```bash
aws ecr create-repository --repository-name report-builder

aws ecr get-login-password --region <region> |
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker build -t report-builder:latest .
docker tag report-builder:latest <account-id>.dkr.ecr.<region>.amazonaws.com/report-builder:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/report-builder:latest
```

## Run on EC2

Install Docker and the Compose plugin, copy `.env.production` onto the instance, then start the app:

```bash
docker compose --env-file .env.production -f docker-compose.aws.yml up -d
```

If you are using an ECR image, set `APP_IMAGE` before starting the stack.

## Single EC2 host

If you want MySQL and the app on the same EC2 instance, use [docker-compose.yml](../docker-compose.yml) instead of the AWS app-only file.

Use the Compose v1 command that is installed on your server:

```bash
docker-compose --env-file .env.production up -d mysql
docker-compose --env-file .env.production up -d app
```

For this setup, `DATABASE_URL` must use the internal Docker service name:

```env
DATABASE_URL=mysql://report_user:<MYSQL_PASSWORD>@mysql:3306/report_builder
```

Do not use `mysql-host` or the EC2 public IP inside `DATABASE_URL`. The app container reaches MySQL over the private Compose network.

## Database migrations

The runtime image is trimmed down for serving the app, so run migrations from the builder stage when you need Prisma CLI access:

```bash
docker build --target builder -t report-builder-builder .
docker run --rm --env-file .env.production report-builder-builder pnpm prisma migrate deploy
```

## Verification

```bash
docker compose -f docker-compose.aws.yml ps
curl http://127.0.0.1:3000/
```

If you place the app behind an Application Load Balancer or reverse proxy, verify the public URL through that front door as well.

## Operational notes

- Keep uploads on persistent storage or move them to S3 if the uploaded image data must survive host replacement.
- Ship container logs to CloudWatch or another central log sink.
- Use TLS termination at an ALB, CloudFront, or Nginx reverse proxy.
- Treat `docker-compose.yml` as the local/single-host path and `docker-compose.aws.yml` as the production path.
