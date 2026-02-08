#!/bin/bash
# Interactive CLI Deployment Script

set -e

echo "🚀 Volo CLI Deployment - Interactive Steps"
echo "==========================================="
echo ""

cd "/Users/visionalventure/Volo"

VERCEL_CMD="./node_modules/.bin/vercel"

# Step 1: Login (if needed)
echo "Step 1: Verifying Vercel Login"
echo "-------------------------------"
if $VERCEL_CMD whoami &>/dev/null; then
    echo "✅ Already logged in"
else
    echo "⚠️  Not logged in. Please login:"
    $VERCEL_CMD login
fi
echo ""

# Step 2: Link Project
echo "Step 2: Linking Project"
echo "-----------------------"
echo "This will create or link your Vercel project."
echo "Press Enter to continue..."
read

$VERCEL_CMD link
echo ""

# Step 3: Get secrets from template
echo "Step 3: Preparing Environment Variables"
echo "----------------------------------------"
if [ -f ".env.production.template" ]; then
    NEXTAUTH_SECRET=$(grep NEXTAUTH_SECRET .env.production.template | cut -d '=' -f2 | tr -d '"')
    CRON_SECRET=$(grep CRON_SECRET .env.production.template | cut -d '=' -f2 | tr -d '"')
    echo "✅ Secrets loaded from .env.production.template"
else
    echo "⚠️  .env.production.template not found"
    echo "Please generate secrets manually"
fi
echo ""

# Step 4: Set Environment Variables
echo "Step 4: Setting Environment Variables"
echo "--------------------------------------"
echo "You'll be prompted to enter values. Press Enter to start..."
read

echo ""
echo "Setting DATABASE_URL..."
echo "⚠️  Enter your PRODUCTION database URL:"
$VERCEL_CMD env add DATABASE_URL production

echo ""
echo "Setting NEXTAUTH_URL..."
echo "⚠️  Enter your deployment URL (or placeholder for now):"
echo "   Format: https://your-project.vercel.app"
$VERCEL_CMD env add NEXTAUTH_URL production

echo ""
echo "Setting NEXTAUTH_SECRET..."
if [ -n "$NEXTAUTH_SECRET" ]; then
    echo "Using generated secret..."
    echo "$NEXTAUTH_SECRET" | $VERCEL_CMD env add NEXTAUTH_SECRET production
else
    $VERCEL_CMD env add NEXTAUTH_SECRET production
fi

echo ""
echo "Setting CRON_SECRET (optional)..."
if [ -n "$CRON_SECRET" ]; then
    echo "Using generated secret..."
    echo "$CRON_SECRET" | $VERCEL_CMD env add CRON_SECRET production
else
    read -p "Add CRON_SECRET? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $VERCEL_CMD env add CRON_SECRET production
    fi
fi

echo ""
echo "✅ Environment variables set"
echo ""

# Step 5: Deploy
echo "Step 5: Deploying to Production"
echo "-------------------------------"
echo "Deploying to Vercel production..."
$VERCEL_CMD --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Note your deployment URL"
echo "2. Update NEXTAUTH_URL if needed"
echo "3. Run migrations on production database"
echo "4. Verify deployment"
echo ""



