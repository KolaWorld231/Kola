#!/bin/bash

# Database Setup Script for Volo
# This script helps you set up your database connection

echo "🚀 Volo Database Setup"
echo "======================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You need to update DATABASE_URL in .env with your Supabase connection string"
    echo ""
    echo "To get your Supabase connection string:"
    echo "1. Go to https://supabase.com and create a project"
    echo "2. In project settings > Database, copy the URI connection string"
    echo "3. Replace [YOUR-PASSWORD] with your actual database password"
    echo "4. Make sure it ends with ?schema=public"
    echo ""
    echo "Then run this script again or manually run:"
    echo "  npx prisma db push"
    echo "  npm run db:seed"
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=\"postgresql://" .env || grep -q "YOUR_PASSWORD" .env; then
    echo "⚠️  DATABASE_URL not configured in .env file"
    echo ""
    echo "Please update DATABASE_URL in .env with your Supabase connection string"
    echo ""
    echo "Example format:"
    echo 'DATABASE_URL="postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres?schema=public"'
    echo ""
    echo "Get it from: Supabase Dashboard > Settings > Database > Connection string > URI"
    exit 1
fi

echo "✅ .env file found with DATABASE_URL"
echo ""
echo "📦 Pushing database schema..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database schema pushed successfully!"
    echo ""
    echo "🌱 Seeding database with sample data..."
    npm run db:seed
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database seeded successfully!"
        echo ""
        echo "🎉 Setup complete! You can now run:"
        echo "   npm run dev"
        echo ""
    else
        echo ""
        echo "❌ Seeding failed. Check the error above."
        exit 1
    fi
else
    echo ""
    echo "❌ Database push failed. Check your DATABASE_URL and try again."
    exit 1
fi






