#!/bin/bash
# Quick Deployment Setup Script

set -e

echo "🚀 Volo Deployment Setup"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Environment Variables${NC}"
echo "-----------------------------------"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Creating .env.example template..."
    cat > .env.example << 'EOF'
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Optional - OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional - Cron Jobs
CRON_SECRET="generate-with: openssl rand -base64 32"
EOF
    echo -e "${YELLOW}⚠️  Please create .env file with your production values${NC}"
    echo "   Copy .env.example to .env and update values"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Vercel CLI Setup${NC}"
echo "---------------------------"
echo ""

if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅ Vercel CLI is installed${NC}"
    vercel --version
    echo ""
    echo -e "${YELLOW}⚠️  To login to Vercel:${NC}"
    echo "   Run: vercel login"
else
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Next step:${NC}"
    echo "   Run: vercel login"
fi

echo ""
echo -e "${BLUE}Step 3: Database Migration Preparation${NC}"
echo "----------------------------------------"
echo ""

echo "Checking migration files..."
if [ -d "prisma/migrations" ]; then
    MIGRATION_COUNT=$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Found $MIGRATION_COUNT migration(s)${NC}"
    echo "   Latest: $(ls -t prisma/migrations | head -1)"
else
    echo -e "${RED}❌ No migrations directory found${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Build Verification${NC}"
echo "---------------------------"
echo ""

echo "Checking if build succeeds..."
if npm run build > /tmp/volo-build.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    rm /tmp/volo-build.log
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check build.log for details"
    tail -20 /tmp/volo-build.log
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Run: vercel login (if not logged in)"
echo "3. Run: vercel --prod (to deploy)"
echo "4. Run migrations on production database"
echo ""
echo -e "📚 See QUICK_DEPLOY.md for detailed instructions"


