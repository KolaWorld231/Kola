# 🚀 Volo Server Management Guide

**Quick reference for managing Volo development servers**

---

## ✅ Current Status

**All servers are running:**
- ✅ Next.js Development Server: http://localhost:3000
- ✅ Prisma Studio: http://localhost:5555

---

## 🚀 Starting Servers

### Option 1: Start Development Server Only

```bash
npm run dev
```

**Or**:
```bash
npm start
```

**URL**: http://localhost:3000

---

### Option 2: Start All Servers

```bash
npm run start:all
```

**Or**:
```bash
bash scripts/start-servers.sh
```

**Starts**:
- Next.js Development Server (port 3000)
- Prisma Studio (port 5555)

---

### Option 3: Start Servers Individually

**Start Next.js dev server**:
```bash
npm run dev
```

**Start Prisma Studio**:
```bash
npm run db:studio
```

---

## ⏸️ Stopping Servers

### Stop All Servers

```bash
npm run stop:all
```

**Or**:
```bash
bash scripts/stop-servers.sh
```

**Or manually**:
```bash
# Stop Next.js server
pkill -f "next dev"

# Stop Prisma Studio
pkill -f "prisma studio"
```

---

### Stop Individual Servers

**Stop Next.js server**:
- Press `Ctrl+C` in the terminal running `npm run dev`
- Or: `pkill -f "next dev"`

**Stop Prisma Studio**:
- Press `Ctrl+C` in the terminal running `npm run db:studio`
- Or: `pkill -f "prisma studio"`

---

## 🔍 Checking Server Status

### Check if Servers Are Running

```bash
# Check Next.js server
curl http://localhost:3000

# Check Prisma Studio
curl http://localhost:5555
```

**Or check ports**:
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check if port 5555 is in use
lsof -i :5555
```

---

## 📊 Server Information

### Next.js Development Server

**URL**: http://localhost:3000  
**Port**: 3000  
**Command**: `npm run dev`  
**Purpose**: Main application server

**Features**:
- Hot reload enabled
- Development mode
- Fast refresh
- Error overlay

---

### Prisma Studio

**URL**: http://localhost:5555  
**Port**: 5555  
**Command**: `npm run db:studio`  
**Purpose**: Database GUI and management

**Features**:
- Visual database browser
- Edit records
- View relationships
- Query data

---

## 🔧 Server Management Commands

### Quick Reference

```bash
# Start development server
npm run dev

# Start Prisma Studio
npm run db:studio

# Start all servers
npm run start:all

# Stop all servers
npm run stop:all

# Check server status
curl http://localhost:3000
curl http://localhost:5555
```

---

## 🛠️ Troubleshooting

### Port Already in Use

**Error**: Port 3000 or 5555 already in use

**Solution**:
```bash
# Find process using port
lsof -i :3000
lsof -i :5555

# Kill process
kill -9 <PID>
```

**Or stop servers**:
```bash
npm run stop:all
```

---

### Server Won't Start

**Check**:
1. Node.js installed: `node --version`
2. Dependencies installed: `npm install`
3. Database connection: Check DATABASE_URL
4. Port availability: Check if ports are free

**Fix**:
```bash
# Reinstall dependencies
npm install

# Generate Prisma client
npm run db:generate

# Check database connection
npm run db:studio
```

---

### Database Connection Issues

**Check**:
1. DATABASE_URL is correct in `.env`
2. Database server is accessible
3. Prisma schema is correct

**Fix**:
```bash
# Test database connection
npm run db:studio

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

---

## 📋 Server Checklist

### Before Starting
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Environment variables set (`.env` file)
- [ ] Database accessible

### While Running
- [ ] Next.js server responds at http://localhost:3000
- [ ] Prisma Studio accessible at http://localhost:5555
- [ ] No errors in terminal
- [ ] Hot reload working

### After Stopping
- [ ] All servers stopped
- [ ] Ports released
- [ ] No orphaned processes

---

## 🎯 Quick Commands

```bash
# Start everything
npm run start:all

# Stop everything
npm run stop:all

# Restart development server
pkill -f "next dev" && npm run dev

# Restart Prisma Studio
pkill -f "prisma studio" && npm run db:studio

# Check status
curl http://localhost:3000 && echo " ✅ Dev server" || echo " ❌ Dev server down"
curl http://localhost:5555 && echo " ✅ Prisma Studio" || echo " ❌ Prisma Studio down"
```

---

## 📖 Related Documentation

- **Development**: See `package.json` for all scripts
- **Database**: See `DATABASE_MIGRATION_GUIDE.md`
- **Deployment**: See `DEPLOYMENT_NEXT_STEPS.md`

---

**Current Status**: ✅ All servers running

*Last Updated: Server management guide*


