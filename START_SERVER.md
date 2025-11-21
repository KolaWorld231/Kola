# 🚀 Server Startup Guide

## Quick Start

### 1. Start Development Server
```bash
npm run dev
```

The server will start on **http://localhost:3000**

### 2. Verify Server Status

**Check if server is running:**
```bash
curl http://localhost:3000
```

**Check port usage:**
```bash
lsof -ti:3000
```

**Check Next.js process:**
```bash
ps aux | grep "next dev"
```

### 3. Database Connection

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Push schema to database:**
```bash
npx prisma db push
```

**Open Prisma Studio (optional):**
```bash
npm run db:studio
```

### 4. Available Services

#### Main Application
- **URL**: http://localhost:3000
- **Status**: ✅ Running

#### API Endpoints
- **Base URL**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/user/me

#### Prisma Studio (if started)
- **URL**: http://localhost:5555
- **Command**: `npm run db:studio`

### 5. Testing Real-time Features

#### Notifications Stream
- **SSE Endpoint**: http://localhost:3000/api/notifications/stream
- **Test**: Open in browser or use EventSource API

#### Polling Endpoint
- **URL**: http://localhost:3000/api/notifications/latest?since=2024-01-01T00:00:00Z

### 6. Environment Variables Required

Make sure `.env` file has:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 7. Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

**Database connection issues:**
```bash
# Test connection
npx prisma db push

# Check connection string
echo $DATABASE_URL
```

**Build errors:**
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### 8. Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code
npm run type-check       # Type check

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Server Status

✅ **Development Server**: Running on http://localhost:3000
✅ **Prisma Client**: Generated
✅ **Database**: Connected (verify with `npx prisma db push`)

## Next Steps

1. Open http://localhost:3000 in your browser
2. Sign up or sign in to test the application
3. Test real-time notifications
4. Test social features (friends, challenges, study groups)
5. Test performance optimizations






