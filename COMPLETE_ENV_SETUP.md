# 📋 Step 3: Complete Environment Variables Setup

## Current Status

✅ **NEXTAUTH_SECRET** - Successfully added!
⏳ **DATABASE_URL** - Needs your production database URL
⏳ **NEXTAUTH_URL** - Needs placeholder or deployment URL  
⏳ **CRON_SECRET** - Optional (can add after deployment)

## Quick Commands to Complete

Run these commands in your terminal:

### 1. Set DATABASE_URL

You'll need your **production database connection string**. 

```bash
cd "/Users/visionalventure/Volo"
./node_modules/.bin/vercel env add DATABASE_URL production
```

**When prompted**, paste your production DATABASE_URL:
- Format: `postgresql://user:password@host:port/database?schema=public`
- Example: `postgresql://postgres:password@db.example.com:5432/postgres?schema=public`

**Note**: This should be your **production database**, not your development database.

### 2. Set NEXTAUTH_URL

Use a placeholder for now (we'll update after first deployment):

```bash
echo 'https://volo.vercel.app' | ./node_modules/.bin/vercel env add NEXTAUTH_URL production
```

**After deployment**, you'll get a URL like `https://volo-xxx.vercel.app`. Update it then:

```bash
# Remove old value
./node_modules/.bin/vercel env rm NEXTAUTH_URL production

# Add new value with actual URL
echo 'https://your-actual-deployment-url.vercel.app' | ./node_modules/.bin/vercel env add NEXTAUTH_URL production
```

### 3. Set CRON_SECRET (Optional)

```bash
# Get secret from template and set it
CRON_SECRET=$(grep "^CRON_SECRET=" .env.production.template | cut -d '=' -f2 | tr -d '"' | head -1)
echo "$CRON_SECRET" | ./node_modules/.bin/vercel env add CRON_SECRET production
```

Or manually copy from `.env.production.template`:

```bash
./node_modules/.bin/vercel env add CRON_SECRET production
# When prompted, paste the CRON_SECRET value from .env.production.template
```

## Verify Environment Variables

After setting all variables, verify they're set:

```bash
./node_modules/.bin/vercel env ls production
```

You should see:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET
- ✅ CRON_SECRET (if added)

## What's Next?

After all environment variables are set:

1. **Deploy to production**:
   ```bash
   ./node_modules/.bin/vercel --prod --yes
   ```

2. **Update NEXTAUTH_URL** with your actual deployment URL

3. **Run database migrations** on production database

4. **Verify deployment** by testing the URLs

---

**Ready to continue?** Run the commands above to complete Step 3!



