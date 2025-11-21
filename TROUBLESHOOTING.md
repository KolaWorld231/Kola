# Database Connection Troubleshooting

## Current Issue
Cannot connect to Supabase database at: `db.sivnvwcgxjeytheqbeov.supabase.co:5432`

## Solutions to Try

### 1. Check Supabase Project Status
- Go to https://supabase.com/dashboard/project/sivnvwcgxjeytheqbeov
- Verify the project shows "Active" status
- Wait 2-3 minutes if the project was just created

### 2. Check IP Restrictions
In Supabase Dashboard:
- Go to **Settings > Database**
- Scroll to **"Connection Pooling"** or **"Network Restrictions"**
- Make sure there are no IP restrictions blocking connections
- If needed, add your IP address or allow all IPs (for development)

### 3. Try Connection Pooler
Sometimes the direct connection doesn't work, but the pooler does.

Update `.env` DATABASE_URL to use the pooler:
```
DATABASE_URL="postgresql://postgres:Quaresma1992%24%21@db.sivnvwcgxjeytheqbeov.supabase.co:6543/postgres?schema=public&pgbouncer=true"
```

Note: Port changed from 5432 to 6543, and added `&pgbouncer=true`

### 4. Verify Connection String Format
Make sure the connection string in `.env` is exactly:
```
DATABASE_URL="postgresql://postgres:Quaresma1992%24%21@db.sivnvwcgxjeytheqbeov.supabase.co:5432/postgres?schema=public"
```

### 5. Test from Supabase Dashboard
- Go to **SQL Editor** in Supabase
- Try running a simple query: `SELECT 1;`
- If this works, the database is up, but there might be network restrictions

### 6. Check Supabase Status Page
- Visit https://status.supabase.com
- Check if there are any service outages

## Quick Fixes

### Option A: Use Pooler Connection
```bash
# Update .env DATABASE_URL to:
DATABASE_URL="postgresql://postgres:Quaresma1992%24%21@db.sivnvwcgxjeytheqbeov.supabase.co:6543/postgres?schema=public&pgbouncer=true"
```

Then run:
```bash
npx prisma db push
```

### Option B: Wait and Retry
If project was just created, wait 2-3 minutes then:
```bash
npx prisma db push
```

### Option C: Verify Password Encoding
The password `Quaresma1992$!` is encoded as `Quaresma1992%24%21` where:
- `$` = `%24`
- `!` = `%21`

If using direct connection string without quotes, you might need to escape differently.
