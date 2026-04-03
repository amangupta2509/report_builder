#!/bin/bash
# Script to generate secure secrets for environment variables

echo "🔐 Report Builder - Secret Generator"
echo "===================================="
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ openssl is not installed. Please install openssl first."
    echo "   On macOS: brew install openssl"
    echo "   On Ubuntu: sudo apt-get install openssl"
    exit 1
fi

echo "Generating secure secrets..."
echo ""

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "✅ JWT_SECRET (32 chars, base64):"
echo "   JWT_SECRET=$JWT_SECRET"
echo ""

# Generate ENCRYPTION_KEY (64 hex chars)
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "✅ ENCRYPTION_KEY (64 hex chars):"
echo "   ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""

echo "===================================="
echo "📋 Copy these values to your .env.local or .env.production file"
echo ""
