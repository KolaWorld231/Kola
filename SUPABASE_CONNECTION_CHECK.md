# Supabase Connection Setup Guide

## Current Issue
Cannot connect to Supabase database at `db.sivnvwcgxjeytheqbeov.supabase.co:5432`

## Your Supabase Details
- **Project Reference**: `sivnvwcgxjeytheqbeov`
- **Supabase URL**: `https://sivnvwcgxjeytheqbeov.supabase.co`
- **Password**: `Quaresma1992$!@`

## Step-by-Step Fix

### Step 1: Get Exact Connection String from Supabase

1. **Go to your Supabase Dashboard**:
   https://supabase.com/dashboard/project/sivnvwcgxjeytheqbeov

2. **Navigate to**: Settings → Database

3. **Scroll to "Connection string" section**

4. **Select "URI" tab** (not Session mode or Transaction mode)

5. **Copy the connection string** - it should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.sivnvwcgxjeytheqbeov.supabase.co:5432/postgres
   ```

6. **IMPORTANT**: 
   - Replace `[YOUR-PASSWORD]` with your actual password: `Quaresma1992$!@`
   - But in the connection string, you may need to URL-encode special characters:
     - `$` → `%24`
     - `!` → `%21`
     - `@` → `%40`
   
   So the password part becomes: `Quaresma1992%24%21%40`

7. **Add `?schema=public`** at the end if not present

### Step 2: Check IP Restrictions

1. In **Settings → Database**
2. Scroll to **"Connection Pooling"** section
3. Look for **"IP Restrictions"** or **"Network Access"**
4. **For development**, you may need to:
   - Disable IP restrictions, OR
   - Add your current IP address

### Step 3: Verify Project Status

- Make sure project shows **"Active"** (green) in dashboard
- If project was just created, wait 2-3 minutes for full initialization

### Step 4: Alternative - Use Supabase Client

If direct PostgreSQL connection doesn't work due to restrictions, we can use Supabase's JavaScript client instead of direct Prisma connection for some operations.

## Updated .env File

The `.env` file currently has:
```env
DATABASE_URL="postgresql://postgres:Quaresma1992%24%21%40@db.sivnvwcgxjeytheqbeov.supabase.co:5432/postgres?schema=public"
```

**Next Steps:**
1. Copy the exact connection string from Supabase dashboard (URI tab)
2. Update `.env` with that exact string
3. Make sure IP restrictions are disabled for development
4. Try `npx prisma db push` again







