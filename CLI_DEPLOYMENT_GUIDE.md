# 🚀 CLI Deployment Guide - Step by Step

## Current Status

✅ **Step 1-4**: Complete
✅ **Vercel Login**: Completed
⏳ **Project Link**: Needs to be done
⏳ **Environment Variables**: Need to be set
⏳ **Deployment**: Ready to deploy

## Step-by-Step CLI Deployment

### Step 1: Link Project

```bash
cd "/Users/visionalventure/Volo"
./node_modules/.bin/vercel link
```

This will prompt you to:
- Create a new project OR
- Link to an existing project
- Select scope (your team/personal account)
- Set project name (e.g., "volo")

### Step 2: Set Environment Variables

After linking, set environment variables one by one:

```bash
# Set DATABASE_URL
./node_modules/.bin/vercel env add DATABASE_URL production
# Paste your production database URL when prompted

# Set NEXTAUTH_URL (will be your deployment URL)
./node_modules/.bin/vercel env add NEXTAUTH_URL production
# First deployment: Use placeholder (will update after first deploy)
# Enter: https://your-project-name.vercel.app

# Set NEXTAUTH_SECRET
./node_modules/.bin/vercel env add NEXTAUTH_SECRET production
# Copy from .env.production.template when prompted

# Set CRON_SECRET (optional)
./node_modules/.bin/vercel env add CRON_SECRET production
# Copy from .env.production.template when prompted
```

### Step 3: Deploy to Production

```bash
./node_modules/.bin/vercel --prod
```

This will:
- Build your application
- Deploy to Vercel
- Give you a production URL

### Step 4: Update NEXTAUTH_URL (After First Deploy)

After first deployment, you'll get a URL like `https://volo-xxx.vercel.app`

Update NEXTAUTH_URL:
```bash
./node_modules/.bin/vercel env rm NEXTAUTH_URL production
./node_modules/.bin/vercel env add NEXTAUTH_URL production
# Enter your actual deployment URL
```

Then redeploy:
```bash
./node_modules/.bin/vercel --prod
```

### Step 5: Run Database Migrations

After deployment, run migrations on production database:

```bash
# Get production DATABASE_URL
./node_modules/.bin/vercel env pull .env.production

# Extract DATABASE_URL
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"' | head -1)

# Run migrations
npx prisma migrate deploy
```

### Step 6: Verify Deployment

Test these URLs:
- Home: `https://your-project.vercel.app`
- Auth: `https://your-project.vercel.app/auth/signin`
- API: `https://your-project.vercel.app/api/user/me`

## Quick Commands Reference

```bash
# Check login status
./node_modules/.bin/vercel whoami

# Link project
./node_modules/.bin/vercel link

# List projects
./node_modules/.bin/vercel projects ls

# Add environment variable
./node_modules/.bin/vercel env add VARIABLE_NAME production

# List environment variables
./node_modules/.bin/vercel env ls

# Deploy to production
./node_modules/.bin/vercel --prod

# Pull environment variables
./node_modules/.bin/vercel env pull .env.production
```

## Troubleshooting

### Credentials Not Found
If you see "No existing credentials found":
```bash
# Try logging in again
./node_modules/.bin/vercel login
```

### Project Already Exists
If project exists:
```bash
# Link to existing project
./node_modules/.bin/vercel link
# Select existing project when prompted
```

### Environment Variables Not Working
After setting variables, you may need to:
1. Redeploy: `./node_modules/.bin/vercel --prod`
2. Check variables: `./node_modules/.bin/vercel env ls`

---

**Ready to continue?** Run the commands above step by step!



