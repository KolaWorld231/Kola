# 🚀 Quick Start Guide - Supabase Setup

## What You Need to Do Right Now

### Step 1: Create Supabase Project

1. Visit: **https://supabase.com**
2. Sign up / Sign in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `volo-liberian-languages`
   - **Database Password**: Create a strong password (SAVE IT!)
   - **Region**: Choose closest to you
5. Wait ~2 minutes for project creation

### Step 2: Get Your Connection String

1. In Supabase dashboard, click **Settings** (⚙️ icon)
2. Click **Database**
3. Scroll to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
7. Add `?schema=public` at the end if it's not there

### Step 3: Create .env File

In the project root (`/Users/visionalventure/Volo/`), create a file named `.env` with this content:

```env
# Database - REPLACE WITH YOUR SUPABASE CONNECTION STRING
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@db.xxxxx.supabase.co:5432/postgres?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="yuFD9kc4tTLIofeUPYkTdKHX4wIan/i5fHbUL5K4oIg="

# OAuth Providers (optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AI/ML Services (optional - for future features)
OPENAI_API_KEY=""
ELEVENLABS_API_KEY=""
```

**Replace the DATABASE_URL** with your actual Supabase connection string!

### Step 4: After .env is Ready

Once you've created the `.env` file with your Supabase connection string, I can help you:

1. Push the database schema
2. Seed the database with sample data
3. Start the development server

---

## 🎯 Current Status

✅ Code is ready  
✅ Dependencies installed  
✅ Prisma client generated  
⚠️ **Waiting for .env file with Supabase DATABASE_URL**

## 📞 Next Steps

**After you've created your Supabase project and added the DATABASE_URL to .env**, let me know and I'll proceed with:

```bash
npx prisma db push      # Create all tables
npm run db:seed         # Add sample data (10 languages + Kpelle lessons)
npm run dev             # Start the app!
```







