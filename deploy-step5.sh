#!/bin/bash
# Step 5: Deploy to Vercel and Verify

set -e

echo "🚀 Step 5: Deploy & Verify"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

VERCEL_CMD="./node_modules/.bin/vercel"

# Check login status
echo -e "${BLUE}Checking Vercel login status...${NC}"
if $VERCEL_CMD whoami &>/dev/null; then
    USER=$($VERCEL_CMD whoami 2>/dev/null | grep -v "Vercel CLI" | grep -v "NOTE:" | head -1 | xargs)
    echo -e "${GREEN}✅ Logged in as: ${USER}${NC}"
    IS_LOGGED_IN=true
else
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    IS_LOGGED_IN=false
fi

echo ""

if [ "$IS_LOGGED_IN" = false ]; then
    echo -e "${YELLOW}To login, run:${NC}"
    echo "  $VERCEL_CMD login"
    echo ""
    echo "Or deploy via Vercel Dashboard:"
    echo "  1. Go to: https://vercel.com/new"
    echo "  2. Import your Git repository"
    echo "  3. Set environment variables (see .env.production.template)"
    echo "  4. Click 'Deploy'"
    echo ""
    exit 0
fi

# Check if project is linked
echo -e "${BLUE}Checking project status...${NC}"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ Project is linked${NC}"
    cat .vercel/project.json | head -5
else
    echo -e "${YELLOW}⚠️  Project not linked yet${NC}"
    echo "To link project, run:"
    echo "  $VERCEL_CMD link"
    echo ""
    echo "Or deploy new project:"
    echo "  $VERCEL_CMD --prod"
    echo ""
fi

echo ""

# Ask about deployment
read -p "Do you want to deploy to Vercel now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Deploying to Vercel...${NC}"
    
    # Deploy to production
    if $VERCEL_CMD --prod; then
        echo ""
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        echo ""
        echo -e "${BLUE}Next Steps:${NC}"
        echo "1. Get your deployment URL from Vercel"
        echo "2. Run migrations on production database"
        echo "3. Verify deployment"
        echo ""
        echo "To run migrations:"
        echo "  DATABASE_URL='your-production-db-url' npx prisma migrate deploy"
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${YELLOW}Deployment skipped${NC}"
    echo ""
    echo "To deploy later, run:"
    echo "  $VERCEL_CMD --prod"
fi


