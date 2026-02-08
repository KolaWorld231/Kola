#!/bin/bash

# Volo Server Startup Script
# Starts all required development servers

echo "🚀 Starting Volo Development Servers..."
echo ""

# Check if ports are in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use"
    echo "   Next.js dev server may already be running"
fi

if lsof -Pi :5555 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5555 is already in use"
    echo "   Prisma Studio may already be running"
fi

echo ""
echo "📋 Starting services:"
echo "   • Next.js Development Server (port 3000)"
echo "   • Prisma Studio (port 5555)"
echo ""

# Start Next.js dev server in background
echo "🌐 Starting Next.js development server..."
npm run dev > /dev/null 2>&1 &
NEXTJS_PID=$!

# Start Prisma Studio in background
echo "🗄️  Starting Prisma Studio..."
npm run db:studio > /dev/null 2>&1 &
PRISMA_PID=$!

# Wait a moment for servers to start
sleep 5

# Check if servers started
if ps -p $NEXTJS_PID > /dev/null; then
    echo "✅ Next.js server started (PID: $NEXTJS_PID)"
else
    echo "❌ Next.js server failed to start"
fi

if ps -p $PRISMA_PID > /dev/null; then
    echo "✅ Prisma Studio started (PID: $PRISMA_PID)"
else
    echo "❌ Prisma Studio failed to start"
fi

echo ""
echo "📊 Server Status:"
echo "=================="
echo ""
echo "🌐 Development Server:"
echo "   • URL: http://localhost:3000"
echo "   • PID: $NEXTJS_PID"
echo ""
echo "🗄️  Prisma Studio:"
echo "   • URL: http://localhost:5555"
echo "   • PID: $PRISMA_PID"
echo ""
echo "⏸️  To stop servers:"
echo "   kill $NEXTJS_PID $PRISMA_PID"
echo "   or: ./scripts/stop-servers.sh"
echo ""

# Keep script running
wait


