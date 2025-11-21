# 🚀 Production Deployment Steps

**Quick Guide for Deploying Volo to Production**

---

## 📋 Pre-Deployment

### 1. Final Checks

```bash
# Verify build works
npm run build

# Check for errors
npm run type-check

# Run tests (if available)
npm test

# Check linting
npm run lint
```

### 2. Environment Variables

Ensure all required environment variables are set in your deployment platform.

**Required**:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

**Recommended**:
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`

---

## 🚀 Deployment (Vercel - Recommended)

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create account
3. Click "Add New Project"
4. Import your Git repository
5. Select the Volo repository

### Step 2: Configure Project

**Build Settings** (usually auto-detected):
- Framework Preset: **Next.js**
- Root Directory: **.**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 3: Add Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add each variable for **Production** environment:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

3. **Save** all variables

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete
3. Get your production URL

### Step 5: Run Database Migrations

```bash
# Connect to production database
npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Step 6: Verify Deployment

1. Visit your production URL
2. Test critical flows:
   - Sign up
   - Sign in
   - Dashboard
   - Learning path
   - Complete a lesson

---

## 🌐 Custom Domain Setup (Vercel)

### Step 1: Add Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### Step 2: Configure DNS

Add DNS records as instructed:
- **A Record**: Point to Vercel IP
- **CNAME**: Point to Vercel domain

### Step 3: SSL Certificate

- Vercel automatically provisions SSL certificates
- Wait for DNS propagation
- SSL will be active automatically

### Step 4: Update Environment Variables

Update `NEXTAUTH_URL` to your custom domain:
```bash
NEXTAUTH_URL=https://your-custom-domain.com
```

---

## 🗄️ Database Setup (Production)

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**:
   - Go to supabase.com
   - Create new project
   - Get connection string

2. **Configure Connection**:
   - Update `DATABASE_URL` in Vercel
   - Disable IP restrictions (or add Vercel IPs)

3. **Run Migrations**:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```

4. **Verify Connection**:
   ```bash
   DATABASE_URL="your-production-url" npx prisma studio
   ```

### Option 2: Other PostgreSQL Providers

1. **Create Database**: Set up PostgreSQL database
2. **Get Connection String**: Obtain database URL
3. **Configure**: Add `DATABASE_URL` to environment variables
4. **Run Migrations**: Apply all migrations
5. **Verify**: Test database connection

---

## ✅ Post-Deployment Verification

### 1. Application Tests

```bash
# Test homepage
curl https://your-domain.com

# Test API health
curl https://your-domain.com/api/user/me
```

### 2. Database Verification

```bash
# Verify indexes
DATABASE_URL="your-production-url" npm run verify-indexes

# Check migrations
npx prisma migrate status
```

### 3. Monitoring Verification

- **Sentry**: Check Sentry dashboard for events
- **Performance**: Check Web Vitals in browser
- **Logs**: Verify logs are being collected

---

## 🔧 Post-Deployment Configuration

### 1. Configure Sentry (If Not Done)

1. Get Sentry DSN from sentry.io
2. Add to Vercel environment variables
3. Redeploy or wait for next deployment

### 2. Set Up Monitoring Alerts

- **Sentry**: Configure error alerts
- **Performance**: Set up performance alerts
- **Uptime**: Set up uptime monitoring

### 3. Configure Custom Domain

- Add domain in Vercel
- Configure DNS records
- Update `NEXTAUTH_URL`

---

## 🆘 Troubleshooting Deployment

### Build Fails

**Error**: Build command failed
**Solution**: 
1. Check build logs in Vercel
2. Verify all dependencies installed
3. Check for TypeScript/linting errors
4. Try building locally first

### Database Connection Issues

**Error**: Can't connect to database
**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check IP restrictions in database
3. Verify database is accessible
4. Check connection pooling settings

### Environment Variables Not Working

**Error**: Variables undefined
**Solution**:
1. Verify variables set in Vercel
2. Check environment (Production vs Preview)
3. Redeploy after adding variables
4. Verify variable names are correct

---

## 📊 Production Checklist

### Before Deployment
- [ ] Code reviewed and tested
- [ ] Build succeeds locally
- [ ] Environment variables prepared
- [ ] Database migrations tested
- [ ] Backup strategy in place

### During Deployment
- [ ] Deploy to platform
- [ ] Add environment variables
- [ ] Run database migrations
- [ ] Verify deployment successful

### After Deployment
- [ ] Test homepage loads
- [ ] Test sign in/sign up
- [ ] Test learning path
- [ ] Test lessons
- [ ] Verify monitoring works
- [ ] Check error tracking
- [ ] Monitor performance

---

## 🔗 Quick Reference

### Essential Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Run migrations
npm run db:migrate

# Verify indexes
npm run verify-indexes

# Check types
npm run type-check
```

### Important URLs

- **Production App**: https://your-domain.com
- **Sentry Dashboard**: https://sentry.io
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Database**: Your database provider dashboard

---

## 📞 Support

If you encounter issues:
1. Check build logs
2. Review error messages
3. Check environment variables
4. Verify database connection
5. Contact support if needed

---

**Ready to Deploy!** 🚀

*Last Updated: Production deployment guide*

