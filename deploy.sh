#!/bin/bash
# Production Deployment Script for Volo

set -e  # Exit on error

echo "🚀 Volo Production Deployment Script"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL before running deployment"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 2: Deploy migrations
echo "🗄️  Step 2: Deploying database migrations..."
if npx prisma migrate deploy; then
    echo -e "${GREEN}✅ Migrations deployed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Migration deploy failed, trying db push instead...${NC}"
    npx prisma db push --accept-data-loss
    echo -e "${GREEN}✅ Database schema synced${NC}"
fi
echo ""

# Step 3: Verify build
echo "🔨 Step 3: Verifying production build..."
npm run build
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 4: Optional - Seed database
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run db:seed
    echo -e "${GREEN}✅ Database seeded${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping database seed${NC}"
fi
echo ""

echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set environment variables in your hosting platform"
echo "2. Deploy your application"
echo "3. Verify deployment at your production URL"
echo ""



