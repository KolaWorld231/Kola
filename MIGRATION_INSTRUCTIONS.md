# Migration Instructions: Add Grammar Tip to Exercises

## Migration Created
**Migration Name:** `add_grammar_tip_to_exercises`
**Location:** `prisma/migrations/add_grammar_tip_to_exercises/migration.sql`

## What This Migration Does
Adds a new `grammar_tip` column to the `exercises` table to store optional grammar explanations for exercises.

## SQL Command
```sql
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "grammar_tip" TEXT;
```

## How to Apply the Migration

### Option 1: Using Prisma Migrate (Recommended)
Once your database is accessible:

```bash
npx prisma migrate deploy
```

This will apply all pending migrations, including the grammar tip migration.

### Option 2: Manual SQL Execution
If you prefer to run the SQL directly:

1. Connect to your database (via Supabase dashboard, psql, or your preferred client)
2. Run the SQL command:
```sql
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "grammar_tip" TEXT;
```

### Option 3: Mark as Applied (if already applied manually)
If you've already applied the migration manually:

```bash
npx prisma migrate resolve --applied add_grammar_tip_to_exercises
```

## Verify Migration
After applying, verify the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exercises' AND column_name = 'grammar_tip';
```

You should see:
```
column_name  | data_type
-------------|----------
grammar_tip  | text
```

## Notes
- The `grammar_tip` column is **optional** (nullable) - existing exercises won't be affected
- The migration uses `IF NOT EXISTS` to prevent errors if the column already exists
- After migration, regenerate Prisma Client: `npx prisma generate`

## Rollback (if needed)
To remove the column:

```sql
ALTER TABLE "exercises" DROP COLUMN IF EXISTS "grammar_tip";
```







