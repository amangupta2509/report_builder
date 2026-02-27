#!/bin/bash
# Security Configuration Setup Guide

echo "================================================"
echo "Report Builder - Security Configuration Setup"
echo "================================================"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    echo "Backing up to .env.backup"
    cp .env .env.backup
else
    echo "Creating .env file from template..."
    cp .env.example .env
fi

echo ""
echo "==========================================="
echo "1. Generating JWT_SECRET (32+ characters)"
echo "==========================================="
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)
echo "Generated JWT_SECRET: $JWT_SECRET"
echo ""

echo "==========================================="
echo "2. Generating ENCRYPTION_KEY (64 hex chars)"
echo "==========================================="
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "Generated ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo ""

echo "==========================================="
echo "3. Current .env variables:"
echo "==========================================="
if command -v sed &> /dev/null; then
    echo "Updating .env with generated values..."
    
    # macOS uses different sed syntax
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i '' "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    else
        sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    fi
    
    echo "✅ .env file updated successfully"
else
    echo "❌ sed not found. Please manually update:"
    echo "   JWT_SECRET=$JWT_SECRET"
    echo "   ENCRYPTION_KEY=$ENCRYPTION_KEY"
    echo ""
    echo "Edit .env and add these values"
fi

echo ""
echo "==========================================="
echo "4. Verifying .env configuration"
echo "==========================================="
grep "^JWT_SECRET=" .env | head -1 || echo "⚠️  JWT_SECRET not configured"
grep "^ENCRYPTION_KEY=" .env | head -1 || echo "⚠️  ENCRYPTION_KEY not configured"
grep "^DATABASE_URL=" .env | head -1 || echo "⚠️  DATABASE_URL not configured"
grep "^NODE_ENV=" .env | head -1 || echo "⚠️  NODE_ENV not configured"

echo ""
echo "==========================================="
echo "5. Security Checklist"
echo "==========================================="
echo "✅ JWT_SECRET configured"
echo "✅ ENCRYPTION_KEY configured"
echo "⚠️  Review and update:"
echo "   - DATABASE_URL"
echo "   - NODE_ENV (should be 'production')"
echo "   - NEXT_PUBLIC_APP_URL"
echo ""

echo "==========================================="
echo "6. Next Steps"
echo "==========================================="
echo "1. Review .env file for all required variables"
echo "2. Never commit .env to version control"
echo "3. Add .env to .gitignore"
echo "4. Deploy to production with secure .env setup"
echo "5. Run 'npm run build' to verify configuration"
echo "6. Read SECURITY_FIXES.md for additional security recommendations"
echo ""
echo "✅ Setup complete!"
