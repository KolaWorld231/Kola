# 🗄️ Production Database Migrations

## Current Status

⚠️ **Database Authentication Error**: Migrations failed due to authentication issue.

## Error Details

```
Error: P1000: Authentication failed against database server
The provided database credentials for `postgres` are not valid.
```

## Troubleshooting Steps

### Step 1: Verify DATABASE_URL in Vercel

1. **Check Vercel Dashboard**:
   - Go to your Vercel project: https://vercel.com/dashboard
   - Navigate to: Settings → Environment Variables
   - Verify `DATABASE_URL` for Production environment

2. **Check DATABASE_URL Format**:
   ```
   postgresql://user:password@host:port/database?schema=public
   ```

### Step 2: Verify Database Credentials

Ensure your production database credentials are correct:
- **Username**: `postgres` (or your database user)
- **Password**: URL-encoded password (special characters must be encoded)
- **Host**: Database host address
- **Port**: `5432` (or your database port)
- **Database**: Database name

### Step 3: Update DATABASE_URL (if needed)

If DATABASE_URL needs to be updated:

```bash
cd "/Users/visionalventure/Volo"

# Remove old DATABASE_URL
./node_modules/.bin/vercel env rm DATABASE_URL production

# Add new DATABASE_URL
./node_modules/.bin/vercel env add DATABASE_URL production
# When prompted, paste your production DATABASE_URL
```

**Important**: Make sure to URL-encode special characters in the password:
- `@` → `%40`
- `$` → `%24`
- `!` → `%21`
- `#` → `%23`
- etc.

### Step 4: Test Database Connection

After updating DATABASE_URL, test the connection:

```bash
# Pull updated environment variables
./node_modules/.bin/vercel env pull .env.production --environment=production

# Extract DATABASE_URL
export DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d '=' -f2- | tr -d '"' | head -1)

# Test connection (using psql if available)
# psql "$DATABASE_URL" -c "SELECT 1;"

# Or test with Prisma
npx prisma db pull --schema=prisma/schema.prisma
```

### Step 5: Run Migrations

Once connection is verified:

```bash
# Set DATABASE_URL
export DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d '=' -f2- | tr -d '"' | head -1)

# Run migrations
npx prisma migrate deploy
```

## Alternative: Use Prisma Studio to Verify Connection

```bash
export DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d '=' -f2- | tr -d '"' | head -1)
npx prisma studio
```

This will open Prisma Studio in your browser, allowing you to:
- Verify connection
- Browse database schema
- Check if migrations are needed

## Quick Migration Script

Create a script to simplify migration process:

```bash
#!/bin/bash
# migrate-production.sh

cd "/Users/visionalventure/Volo"

echo "📋 Pulling production environment variables..."
./node_modules/.bin/vercel env pull .env.production --environment=production

echo ""
echo "🔐 Extracting DATABASE_URL..."
DATABASE_URL=$(grep "^DATABASE_URL=" .env.production | cut -d '=' -f2- | tr -d '"' | head -1)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env.production"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""
echo "🚀 Running migrations..."
export DATABASE_URL
npx prisma migrate deploy

echo ""
echo "✅ Migrations complete!"
```

## Common Issues

### Issue 1: Password Encoding
**Problem**: Special characters in password not URL-encoded
**Solution**: Encode special characters in DATABASE_URL

### Issue 2: IP Restrictions
**Problem**: Database doesn't allow connections from your IP
**Solution**: 
- Check database firewall settings
- Add your IP to allowed list
- Or disable IP restrictions for development

### Issue 3: Wrong Environment
**Problem**: Using development DATABASE_URL instead of production
**Solution**: Ensure you're pulling production environment variables:
```bash
./node_modules/.bin/vercel env pull .env.production --environment=production
```

## Next Steps

1. ✅ Verify DATABASE_URL in Vercel dashboard
2. ✅ Update DATABASE_URL if needed
3. ✅ Test database connection
4. ✅ Run migrations: `npx prisma migrate deploy`
5. ✅ Verify migrations in database

---

**Status**: ⏳ Waiting for DATABASE_URL verification


