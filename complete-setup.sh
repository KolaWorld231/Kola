#!/bin/bash

echo "🚀 Volo Complete Setup"
echo "======================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if DATABASE_URL is configured
if ! grep -q "DATABASE_URL=\"postgresql://" .env; then
    echo "❌ DATABASE_URL not configured in .env"
    exit 1
fi

echo "✅ .env file found"
echo ""

echo "📦 Step 1: Pushing database schema..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database schema pushed successfully!"
    echo ""
    echo "🌱 Step 2: Seeding database with sample data..."
    npm run db:seed
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database seeded successfully!"
        echo ""
        echo "🎉 Setup Complete!"
        echo ""
        echo "📋 Summary:"
        echo "  ✅ Database schema created"
        echo "  ✅ Sample data loaded (10 languages + Kpelle lessons)"
        echo "  ✅ Ready to start the app!"
        echo ""
        echo "🚀 Next: Start the development server"
        echo "   npm run dev"
        echo ""
        echo "Then open http://localhost:3000 in your browser"
    else
        echo ""
        echo "❌ Seeding failed. Check the error above."
        exit 1
    fi
else
    echo ""
    echo "❌ Database push failed!"
    echo ""
    echo "Common issues:"
    echo "  1. IP restrictions in Supabase (check IMPORTANT_SETUP.md)"
    echo "  2. Incorrect DATABASE_URL in .env"
    echo "  3. Supabase project not fully initialized (wait 2-3 minutes)"
    echo ""
    echo "See IMPORTANT_SETUP.md for troubleshooting"
    exit 1
fi
