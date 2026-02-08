# 🚀 Manual Deployment Steps - Option B (CLI)

## Current Status

✅ **Steps 1-4**: Complete
✅ **Vercel Login**: Completed (but may need to re-login in new terminal)
⏳ **Next**: Link project and deploy

## Manual Steps to Complete Deployment

Since Vercel CLI requires interactive input, please run these commands manually in your terminal:

### Step 1: Navigate to Project

```bash
cd "/Users/visionalventure/Volo"
```

### Step 2: Login to Vercel (if needed)

```bash
./node_modules/.bin/vercel login
```

Visit the URL shown and authenticate in your browser.

### Step 3: Link Project

```bash
./node_modules/.bin/vercel link
```

**Prompts:**
- **Set up and develop?** → Enter `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → Enter `N` (for new project)
- **Project name?** → Enter `volo` or your preferred name
- **Directory?** → Press Enter (use current directory)

### Step 4: Set Environment Variables

Get your secrets from `.env.production.template`:

```bash
cat .env.production.template
```

Then set each variable:

```bash
# Set DATABASE_URL (your production database)
./node_modules/.bin/vercel env add DATABASE_URL production
# When prompted, paste your production DATABASE_URL

# Set NEXTAUTH_URL (will be your deployment URL)
./node_modules/.bin/vercel env add NEXTAUTH_URL production
# Enter: https://your-project-name.vercel.app
# Or use placeholder for now: https://volo.vercel.app

# Set NEXTAUTH_SECRET
./node_modules/.bin/vercel env add NEXTAUTH_SECRET production
# Copy value from .env.production.template when prompted

# Set CRON_SECRET (optional)
./node_modules/.bin/vercel env add CRON_SECRET production
# Copy value from .env.production.template when prompted
```

### Step 5: Deploy to Production

```bash
./node_modules/.bin/vercel --prod
```

This will:
- Build your application
- Deploy to Vercel
- Give you a production URL (e.g., `https://volo-xxx.vercel.app`)

**Save this URL!** You'll need it for the next steps.

### Step 6: Update NEXTAUTH_URL (After First Deploy)

After deployment, update NEXTAUTH_URL with your actual deployment URL:

```bash
# Remove old value
./node_modules/.bin/vercel env rm NEXTAUTH_URL production

# Add new value with actual URL
./node_modules/.bin/vercel env add NEXTAUTH_URL production
# Enter your actual deployment URL (e.g., https://volo-xxx.vercel.app)

# Redeploy to apply changes
./node_modules/.bin/vercel --prod
```

### Step 7: Run Database Migrations

After deployment, run migrations on your **production** database:

```bash
# Get production DATABASE_URL from Vercel
./node_modules/.bin/vercel env pull .env.production

# Extract and use DATABASE_URL
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"' | head -1)

# Run migrations
npx prisma migrate deploy

# Or if migrations don't work, use:
npx prisma db push
```

### Step 8: Verify Deployment

Test these URLs (replace with your actual domain):

1. **Home**: `https://your-project.vercel.app`
2. **Auth**: `https://your-project.vercel.app/auth/signin`
3. **API**: `https://your-project.vercel.app/api/user/me`
4. **Dashboard**: `https://your-project.vercel.app/dashboard` (after login)

## Quick Reference

### Your Generated Secrets

Check `.env.production.template` for:
- `NEXTAUTH_SECRET` - Copy this value when setting env var
- `CRON_SECRET` - Copy this value when setting env var

### Useful Commands

```bash
# Check login status
./node_modules/.bin/vercel whoami

# List projects
./node_modules/.bin/vercel projects ls

# List environment variables
./node_modules/.bin/vercel env ls

# View deployment logs
./node_modules/.bin/vercel logs

# Open project in browser
./node_modules/.bin/vercel open
```

## Troubleshooting

### "No existing credentials found"
```bash
./node_modules/.bin/vercel login
```

### Project link fails
Make sure you're in the project directory:
```bash
cd "/Users/visionalventure/Volo"
./node_modules/.bin/vercel link
```

### Environment variables not working
After setting variables, always redeploy:
```bash
./node_modules/.bin/vercel --prod
```

---

**Ready to deploy!** Run the commands above in your terminal.



