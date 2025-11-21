# 🚀 Quick Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ Production PostgreSQL database (Supabase, Railway, etc.)
- ✅ Vercel account (or your preferred hosting platform)
- ✅ Git repository connected to your hosting platform

## Quick Start (5 Steps)

### Step 1: Set Environment Variables

In your hosting platform (Vercel Dashboard):

**Required:**
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

**Optional:**
```env
CRON_SECRET="generate-with: openssl rand -base64 32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Step 2: Deploy to Vercel

**Option A: Via Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Add environment variables
4. Click "Deploy"

**Option B: Via CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Step 3: Run Database Migrations

After deployment, run migrations on production database:

```bash
# Get production DATABASE_URL from Vercel
vercel env pull .env.production

# Run migrations
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2)" \
npx prisma migrate deploy
```

**Or via Vercel CLI:**
```bash
vercel env pull .env.production
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2)
npx prisma migrate deploy
```

### Step 4: Seed Database (Optional)

```bash
DATABASE_URL="your-production-database-url" npm run db:seed
```

### Step 5: Verify Deployment

Test these URLs:
- ✅ Home: `https://your-domain.com`
- ✅ Auth: `https://your-domain.com/auth/signin`
- ✅ API: `https://your-domain.com/api/user/me`
- ✅ Admin: `https://your-domain.com/admin`

## Using Deployment Script

For automated deployment:

```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="your-production-database-url"

# Run deployment script
./deploy.sh
```

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check build logs in Vercel Dashboard

### Migration Fails
- Use `npx prisma db push` as fallback
- Verify database connection
- Check database permissions

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain exactly
- Check NEXTAUTH_SECRET is set
- Verify session cookies are enabled

## Full Documentation

For detailed instructions, see:
- 📚 `DEPLOYMENT_CHECKLIST.md` - Complete step-by-step guide
- 📚 `PRODUCTION_DEPLOYMENT_READY.md` - Status and requirements

---

**Ready to deploy?** Follow the 5 steps above! 🚀


