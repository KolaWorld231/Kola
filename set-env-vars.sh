#!/bin/bash
# Script to set Vercel environment variables

set -e

cd "/Users/visionalventure/Volo"

VERCEL_CMD="./node_modules/.bin/vercel"

echo "📋 Step 3: Setting Environment Variables"
echo "=========================================="
echo ""

# Check login
if ! $VERCEL_CMD whoami &>/dev/null; then
    echo "⚠️  Not logged in. Please login first:"
    $VERCEL_CMD login
fi

echo "✅ Logged in"
echo ""

# Extract secrets
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env.production.template 2>/dev/null | cut -d '=' -f2 | tr -d '"' | head -1)
CRON_SECRET=$(grep "^CRON_SECRET=" .env.production.template 2>/dev/null | cut -d '=' -f2 | tr -d '"' | head -1)

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET not found in .env.production.template"
    exit 1
fi

echo "✅ Secrets extracted from .env.production.template"
echo ""

# Function to set env var
set_env_var() {
    local var_name=$1
    local value=$2
    local description=$3
    
    echo "Setting $var_name..."
    echo "$description"
    
    if [ -n "$value" ]; then
        echo "$value" | $VERCEL_CMD env add "$var_name" production
    else
        $VERCEL_CMD env add "$var_name" production
    fi
    
    echo ""
}

# Set DATABASE_URL
echo "1️⃣  Setting DATABASE_URL"
echo "   ⚠️  You'll need to provide your PRODUCTION database connection string"
echo "   Format: postgresql://user:password@host:port/database?schema=public"
echo ""
set_env_var "DATABASE_URL" "" "Enter your production DATABASE_URL:"

# Set NEXTAUTH_URL
echo "2️⃣  Setting NEXTAUTH_URL"
echo "   📝 Using placeholder (update after first deployment)"
echo "   Enter: https://volo.vercel.app"
echo ""
set_env_var "NEXTAUTH_URL" "" "Enter NEXTAUTH_URL (use placeholder for now):"

# Set NEXTAUTH_SECRET
echo "3️⃣  Setting NEXTAUTH_SECRET"
echo "   ✅ Using secret from .env.production.template"
echo ""
echo "$NEXTAUTH_SECRET" | $VERCEL_CMD env add NEXTAUTH_SECRET production
echo ""

# Set CRON_SECRET
echo "4️⃣  Setting CRON_SECRET (optional)"
echo "   ✅ Using secret from .env.production.template"
echo ""
read -p "Add CRON_SECRET? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$CRON_SECRET" | $VERCEL_CMD env add CRON_SECRET production
    echo ""
fi

echo "✅ Environment variables set!"
echo ""
echo "📋 Summary:"
$VERCEL_CMD env ls production 2>/dev/null | head -10 || echo "   (Run 'vercel env ls production' to verify)"
echo ""
echo "Next step: Deploy to production"
echo "   ./node_modules/.bin/vercel --prod --yes"



