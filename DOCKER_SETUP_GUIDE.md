# Docker Setup Guide - Report Builder

## 📋 Quick Start

### 1. Generate Secure Secrets

**On Windows:**

```bash
.\generate-secrets.bat
```

**On macOS/Linux:**

```bash
bash generate-secrets.sh
```

Or manually generate:

```bash
# JWT Secret (32 character base64)
openssl rand -base64 32

# Encryption Key (64 hex characters)
openssl rand -hex 32
```

### 2. Configure Environment

Copy the generated secrets to `.env.local`:

```env
DATABASE_URL=mysql://report_user:reportpassword@localhost:3306/report_builder
JWT_SECRET=<generated-jwt-secret>
ENCRYPTION_KEY=<generated-encryption-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start Services with Docker Compose

```bash
# Start all services (MySQL + App)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

## 🐳 Environment Variables

| Variable              | Required | Description                          | Example                                 |
| --------------------- | -------- | ------------------------------------ | --------------------------------------- |
| `DATABASE_URL`        | Yes      | MySQL connection string              | `mysql://user:pass@localhost:3306/db`   |
| `JWT_SECRET`          | Yes      | JWT signing secret (min 32 chars)    | Generated via `openssl rand -base64 32` |
| `ENCRYPTION_KEY`      | Yes      | Data encryption key (64 hex chars)   | Generated via `openssl rand -hex 32`    |
| `NEXT_PUBLIC_APP_URL` | Yes      | Public app URL                       | `http://localhost:3000`                 |
| `NODE_ENV`            | No       | Environment (development/production) | `production`                            |
| `DEBUG`               | No       | Enable debug logging                 | `false`                                 |

## 🚀 Deployment Scenarios

### Local Development

```bash
# 1. Create .env.local with development values
# 2. Run Docker Compose
docker-compose up -d

# 3. Access application
# Open http://localhost:3000
```

### Production on Server

**Option 1: Using Docker Compose**

```bash
# 1. Create .env.production with production secrets
# 2. Edit docker-compose.yml to update service names
# 3. Set NEXT_PUBLIC_APP_URL to your domain
# 4. Deploy
docker-compose -f docker-compose.yml up -d
```

**Option 2: Using Docker Build + Manual Running**

```bash
# Build image
docker build -t report-builder:v1.0.0 .

# Run with external MySQL
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@mysql-server:3306/report_builder" \
  -e JWT_SECRET="<secret>" \
  -e ENCRYPTION_KEY="<key>" \
  -e NEXT_PUBLIC_APP_URL="https://yourdomain.com" \
  --restart unless-stopped \
  report-builder:v1.0.0
```

**Option 3: Using Kubernetes**

```bash
# Create ConfigMap for environment
kubectl create configmap report-builder-config \
  --from-file=.env.production

# Deploy (configure deployment.yaml first)
kubectl apply -f deployment.yaml
```

## 🔒 Security Best Practices

### Secrets Management

1. **Never commit secrets to git** - Use `.env.local` (in .gitignore)
2. **Use strong secrets** - Generate with `openssl` as shown above
3. **Rotate regularly** - Update JWT_SECRET and ENCRYPTION_KEY periodically
4. **Use env files** - Load from `.env.production` in production

### Docker Security

1. **Non-root user** - App runs as `nextjs` user (UID: 1001)
2. **Health checks** - Automatically restart failing containers
3. **Resource limits** - Add memory/CPU limits in production
4. **Network isolation** - Services communicate via Docker network

```yaml
# Add to service in docker-compose.yml for production
deploy:
  resources:
    limits:
      cpus: "2"
      memory: 2G
    reservations:
      cpus: "1"
      memory: 1G
```

## 📊 Database

### Initial Migration

```bash
# Run Prisma migrations inside container
docker-compose exec app npx prisma migrate deploy

# Or use included migration scripts
docker-compose exec app npm run migrate
```

### Database Access

```bash
# Connect to MySQL in container
docker-compose exec mysql mysql -u report_user -p report_builder
# Enter password: reportpassword

# Or from host (if port 3306 is exposed)
mysql -h 127.0.0.1 -u report_user -p report_builder
```

### Backup Database

```bash
# Backup to file
docker-compose exec mysql mysqldump -u report_user -p report_builder > backup.sql

# Restore from file
docker-compose exec -T mysql mysql -u report_user -p report_builder < backup.sql
```

## 🧪 Testing Services

### Health Check Status

```bash
# Check if services are healthy
docker-compose ps

# Manual health checks
curl http://localhost:3000/
mysql -h localhost -u report_user -p -e "SELECT 1"
```

### View Logs

```bash
# Application logs
docker-compose logs app

# Database logs
docker-compose logs mysql

# Follow logs real-time
docker-compose logs -f
```

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check MySQL is running
docker-compose ps

# Check database logs
docker-compose logs mysql

# Verify connection string in .env.local
# Format: mysql://user:password@mysql:3306/database
```

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Verify secrets are set
echo $JWT_SECRET
echo $ENCRYPTION_KEY

# Ensure .env.local exists with all required variables
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml
# Or stop other services using those ports

# Find what's using port 3000
netstat -tlnp | grep 3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows
```

## 📦 Image Size Optimization

Current multi-stage build:

- **Builder image**: ~500MB (includes build tools)
- **Final image**: ~200MB (optimized runtime)
- **Reduction**: ~60% smaller than single-stage

## 🔄 Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Push Docker Image
        run: |
          docker build -t report-builder:${{ github.sha }} .
          docker push your-registry/report-builder:${{ github.sha }}
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**Need help?** Check logs with `docker-compose logs -f` for detailed error messages.
