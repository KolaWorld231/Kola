#!/bin/bash

# Volo Server Stop Script
# Stops all running development servers

echo "⏸️  Stopping Volo Development Servers..."
echo ""

# Stop Next.js dev server
echo "🌐 Stopping Next.js development server..."
pkill -f "next dev" && echo "✅ Next.js server stopped" || echo "⚠️  Next.js server not running"

# Stop Prisma Studio
echo "🗄️  Stopping Prisma Studio..."
pkill -f "prisma studio" && echo "✅ Prisma Studio stopped" || echo "⚠️  Prisma Studio not running"

echo ""
echo "✅ All servers stopped"
echo ""


