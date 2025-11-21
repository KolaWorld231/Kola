#!/bin/bash
echo "Testing database connection..."

# Test with different password encodings
PASS1="Quaresma1992%24%21%40"  # $!@ encoded
PASS2="Quaresma1992%24%21"     # $! encoded (if @ is separator issue)

echo ""
echo "Trying connection with full password encoded..."
DATABASE_URL="postgresql://postgres:${PASS1}@db.sivnvwcgxjeytheqbeov.supabase.co:5432/postgres?schema=public"
export DATABASE_URL
npx prisma db push --accept-data-loss 2>&1 | head -10

echo ""
echo "---"
echo "If that failed, trying with pooler connection..."
DATABASE_URL="postgresql://postgres:${PASS1}@db.sivnvwcgxjeytheqbeov.supabase.co:6543/postgres?schema=public&pgbouncer=true"
export DATABASE_URL
npx prisma db push --accept-data-loss 2>&1 | head -10
