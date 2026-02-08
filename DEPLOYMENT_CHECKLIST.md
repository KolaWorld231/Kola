# 🚀 Production Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] TypeScript compilation succeeds
- [x] Production build succeeds
- [x] Tests passing (18/18)
- [x] Critical linting errors fixed
- [x] Database schema migrated

### ✅ Features
- [x] Achievement system implemented
- [x] Leaderboard system complete
- [x] Admin file uploads working
- [x] Hearts recovery system complete
- [x] Watch ad feature implemented
- [x] Purchase hearts feature implemented

## Deployment Steps

### Step 1: Environment Variables Setup

Set these environment variables in your hosting platform (Vercel, Railway, etc.):

#### Required Variables
```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-strong-secret-key-here"

# Generate NEXTAUTH_SECRET:
# Use: openssl rand -base64 32
```

#### Optional Variables
```env
# OAuth Providers (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cron Jobs (for leaderboard recalculation)
CRON_SECRET="generate-a-strong-secret-key-here"

# Email Service (if using)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
FROM_EMAIL="noreply@your-domain.com"
```

### Step 2: Database Setup

#### For Production Database:

1. **Run migrations** (if using migrations):
   ```bash
   DATABASE_URL="your-production-database-url" npx prisma migrate deploy
   ```

2. **Or sync schema** (if not using migrations):
   ```bash
   DATABASE_URL="your-production-database-url" npx prisma db push
   ```

3. **Generate Prisma Client**:
   ```bash
   DATABASE_URL="your-production-database-url" npx prisma generate
   ```

4. **Seed initial data** (optional):
   ```bash
   DATABASE_URL="your-production-database-url" npm run db:seed
   ```

### Step 3: Vercel Deployment

#### Option A: Via Vercel Dashboard

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Select the Volo project

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm ci` (recommended)

3. **Environment Variables**
   - Click "Environment Variables"
   - Add all required variables (see Step 1)
   - Select environment: Production, Preview, Development
   - Save variables

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment URL

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

### Step 4: Post-Deployment

#### 4.1 Database Migration

After deployment, run migrations on production database:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.production
DATABASE_URL="$(grep DATABASE_URL .env.production)" npx prisma migrate deploy

# Option 2: Via SSH/Shell access
# Connect to your production environment and run:
npx prisma migrate deploy
```

#### 4.2 Seed Initial Data (Optional)

```bash
DATABASE_URL="your-production-database-url" npm run db:seed
```

#### 4.3 Create Admin User

After seeding, create an admin user:

1. Sign up at `https://your-domain.com/auth/signup`
2. Note your user ID
3. Add admin record in database:

```sql
INSERT INTO admin_users (id, user_id, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'your-user-id-here',
  'admin',
  NOW(),
  NOW()
);
```

Or use Prisma Studio:
```bash
npx prisma studio
# Navigate to AdminUser table and create new record
```

### Step 5: Verify Deployment

#### Health Checks

1. **Home Page**: `https://your-domain.com`
2. **Authentication**: `https://your-domain.com/auth/signin`
3. **Dashboard**: `https://your-domain.com/dashboard` (after login)
4. **API Health**: `https://your-domain.com/api/user/me`
5. **Admin Portal**: `https://your-domain.com/admin`

#### Test Critical Paths

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Language selection works
- [ ] Lesson navigation works
- [ ] Exercise completion works
- [ ] Hearts system works
- [ ] Achievement unlocking works
- [ ] Leaderboard displays correctly
- [ ] Admin portal accessible (for admin users)

### Step 6: Monitoring & Maintenance

#### Set Up Monitoring

1. **Vercel Analytics**
   - Enable in Vercel Dashboard
   - Monitor Core Web Vitals

2. **Error Tracking** (Optional)
   - Set up Sentry for error tracking
   - Configure error alerts

3. **Database Monitoring**
   - Monitor connection pool usage
   - Set up database backups
   - Monitor query performance

#### Cron Jobs Setup

If using Vercel Cron (included in `vercel.json`):

1. The cron job for leaderboard recalculation is already configured
2. Set `CRON_SECRET` environment variable
3. Cron runs every 6 hours automatically

#### Manual Cron Setup (Alternative)

If not using Vercel Cron, set up external cron service:

1. Use services like:
   - Cron-job.org
   - EasyCron
   - GitHub Actions (scheduled workflows)

2. Configure endpoint:
   ```
   POST https://your-domain.com/api/cron/leaderboard/recalculate?secret=YOUR_CRON_SECRET
   ```

3. Schedule: Every 6 hours (`0 */6 * * *`)

## Troubleshooting

### Build Fails

- Check environment variables are set
- Verify `DATABASE_URL` is correct
- Check build logs for specific errors

### Database Connection Issues

- Verify `DATABASE_URL` format is correct
- Check database firewall/IP restrictions
- Verify database is accessible from hosting platform

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Verify session cookies are working

### Migration Issues

- Use `npx prisma db push` as fallback
- Check database connection
- Verify schema matches production

## Production URLs Reference

After deployment, your URLs will be:

- **Production**: `https://your-domain.vercel.app` or `https://your-custom-domain.com`
- **API**: `https://your-domain.vercel.app/api/*`
- **Admin**: `https://your-domain.vercel.app/admin`

## Support

For issues during deployment:
1. Check deployment logs in Vercel Dashboard
2. Verify environment variables
3. Check database connection
4. Review error messages

---

**Status**: ✅ Ready for Production Deployment
**Last Updated**: 2024



