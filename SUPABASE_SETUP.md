# Supabase Setup Guide

## Step 1: Create Supabase Account & Project

1. **Go to https://supabase.com**
2. **Sign up** for a free account (or sign in if you have one)
3. **Click "New Project"**
4. **Fill in project details:**
   - Organization: Select or create one
   - Name: `volo-liberian-languages` (or any name you prefer)
   - Database Password: Create a strong password (SAVE THIS - you'll need it!)
   - Region: Choose closest to you
   - Pricing Plan: Free tier is fine for development
5. **Click "Create new project"**
   - Wait 1-2 minutes for project to be created

## Step 2: Get Connection String

1. **Go to your project dashboard**
2. **Click on "Settings" (gear icon) in left sidebar**
3. **Click "Database"** in the settings menu
4. **Scroll down to "Connection string"**
5. **Select "URI" tab**
6. **Copy the connection string** - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
7. **Replace `[YOUR-PASSWORD]`** with the password you created in Step 1

## Step 3: Update .env File

The connection string format should be:
```
postgresql://postgres:your_actual_password@db.xxxxx.supabase.co:5432/postgres?schema=public
```

Make sure to:
- Replace `your_actual_password` with your database password
- Keep `?schema=public` at the end (or add it if missing)

## Step 4: Test Connection

After updating `.env`, we'll run:
```bash
npx prisma db push
```

This will create all the tables in your Supabase database.

## Alternative: Connection Pooler

Supabase also offers a connection pooler. If you plan to use serverless functions, use:
- **Session mode**: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
- **Transaction mode**: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres`

For development, the regular connection string works fine.







