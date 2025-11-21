# 🚀 Starting Volo Local Servers

## Quick Start

### 1. Development Server (Main)

```bash
cd "/Users/visionalventure/Volo"
npm run dev
```

**Access:** http://localhost:3000

The server will automatically:
- Watch for file changes
- Hot reload on save
- Show compilation errors in terminal and browser

---

## Optional Services

### 2. Prisma Studio (Database GUI)

To visually browse and edit your database:

```bash
cd "/Users/visionalventure/Volo"
npm run db:studio
```

**Access:** http://localhost:5555

This opens a web interface to:
- Browse all database tables
- View and edit data
- Run queries
- Check relationships

---

## Server Management

### Check Server Status

```bash
# Check if server is running
lsof -ti:3000

# Check all Node processes
ps aux | grep node
```

### Stop Server

Press `Ctrl+C` in the terminal where the server is running, or:

```bash
# Kill process on port 3000
kill $(lsof -ti:3000)
```

### Restart Server

1. Stop the server (Ctrl+C)
2. Start again: `npm run dev`

---

## Environment Setup

### Required Environment Variables

Make sure you have a `.env` file with:

```env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### Database Connection

Volo uses PostgreSQL (via Supabase). Ensure:
- Database is accessible
- DATABASE_URL is correct
- Migrations are applied: `npm run db:push` or `npm run db:migrate`

---

## Common Issues

### Port Already in Use

If port 3000 is busy:
- Next.js will automatically try port 3001, 3002, etc.
- Check terminal output for the actual port
- Or kill the existing process: `kill $(lsof -ti:3000)`

### Database Connection Errors

If you see database errors:
1. Check `.env` file has correct `DATABASE_URL`
2. Verify database is accessible
3. Run migrations: `npm run db:push`

### Prisma Client Not Generated

If you see Prisma errors:
```bash
npm run db:generate
```

---

## Development Workflow

1. **Start server**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Make changes**: Edit files in `app/`, `components/`, etc.
4. **See updates**: Browser auto-refreshes
5. **Check terminal**: Watch for errors and warnings

---

## Server URLs

- **Main App**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (when running `db:studio`)
- **API Routes**: http://localhost:3000/api/*

---

**Status**: Development server should be running on port 3000!


