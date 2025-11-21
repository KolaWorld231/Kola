# Setup Instructions

## ✅ Step 1: Dependencies Installed
Dependencies have been successfully installed.

## ⚠️ Step 2: Database Setup Required

You need to set up a PostgreSQL database before proceeding. You have two options:

### Option A: Local PostgreSQL
1. Install PostgreSQL locally if you haven't already
2. Create a database:
   ```bash
   createdb volo_db
   ```
3. Update `.env` file with:
   ```
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/volo_db?schema=public"
   ```

### Option B: Supabase (Recommended for Development)
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (it will look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your database password
6. Update `.env` file with this connection string

### After Setting Up Database:
```bash
# Push the schema to database
npx prisma db push

# Seed the database with sample data
npm run db:seed
```

## ✅ Step 3: Environment Variables
The `.env` file has been created with:
- ✅ `NEXTAUTH_SECRET` - Generated and set
- ⚠️ `DATABASE_URL` - **You need to update this** (see Step 2 above)

Optional (for OAuth):
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Leave empty if not using Google OAuth

## Step 4: Start Development Server
Once your database is set up:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Quick Database Setup Commands

If you're using Supabase or have PostgreSQL ready:

```bash
# 1. Update DATABASE_URL in .env file first, then:

# 2. Push schema to database
npx prisma db push

# 3. Seed with sample data (all 10 languages + Kpelle lessons)
npm run db:seed

# 4. Start the app
npm run dev
```

## Creating an Admin User

After seeding and creating your first user account:
1. Go to http://localhost:3000/auth/signup and create an account
2. Note your user ID from the database or Prisma Studio
3. Run Prisma Studio:
   ```bash
   npm run db:studio
   ```
4. In Prisma Studio, go to "AdminUser" and create a new record:
   - `userId`: Your user ID
   - `role`: "admin"
   - `permissions`: null (or JSON object)

Or use SQL:
```sql
INSERT INTO admin_users (id, user_id, role, created_at, updated_at)
VALUES (gen_random_uuid(), 'your-user-id-here', 'admin', NOW(), NOW());
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running (if local)
- Verify DATABASE_URL is correct in `.env`
- Check if your Supabase project is active (if using Supabase)

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Port Already in Use
If port 3000 is taken:
```bash
PORT=3001 npm run dev
```






