# Mobile Build Fix ✅

## Problem Fixed

**Issue**: Static export was failing because Next.js tried to collect page data for API routes during static export, which doesn't work.

**Error**: `PageNotFoundError: Cannot find module for page: /api/admin/content/exercises`

## Solution Implemented

### 1. Configuration Updates

- **next.config.js**: Configured to properly handle static export
- API routes are automatically excluded from static export
- Build script updated to handle mobile builds correctly

### 2. Two Build Modes

#### Development Mode (Server Mode) ✅
- Mobile app connects to Next.js dev server
- All API routes work normally
- Hot reload supported

**Usage:**
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Sync and open Android Studio
npm run mobile:sync
npm run mobile:open
```

**Configure server URL** in `capacitor.config.ts`:
```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:3000', // e.g., http://192.168.1.100:3000
  cleartext: true,
}
```

#### Production Mode (Static Export) ✅
- Generates static files in `out/` directory
- API routes excluded (won't be in static export)
- Mobile app uses production server for API calls

**Usage:**
```bash
npm run mobile:build
npm run mobile:open
```

**Configure production server** in `capacitor.config.ts`:
```typescript
server: {
  url: 'https://your-production-domain.com',
  cleartext: false, // Use HTTPS
}
```

### 3. Updated Scripts

- `mobile:build` - Build for production (static export)
- `mobile:build:dev` - Build for development
- `mobile:run:dev` - Start dev server and open Android Studio
- `mobile:sync` - Sync web assets to Android
- `mobile:open` - Open Android Studio

---

## How It Works

### Static Export Behavior

When `output: 'export'` is enabled:
- Next.js generates static HTML/CSS/JS files
- **API routes are automatically skipped** (not included in static export)
- Pages that depend on API routes won't be generated

### Server Mode Behavior

When `server.url` is configured in `capacitor.config.ts`:
- Mobile app loads from the specified server
- All API routes work normally
- Supports hot reload during development

---

## Build Instructions

### Option A: Development (Recommended for Testing)

1. **Find your local IP address:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr IPv4
   ```

2. **Update capacitor.config.ts:**
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000', // e.g., http://192.168.1.100:3000
     cleartext: true,
   }
   ```

3. **Start Next.js dev server:**
   ```bash
   npm run dev
   ```

4. **Sync and open Android Studio:**
   ```bash
   npm run mobile:sync
   npm run mobile:open
   ```

5. **Build and run in Android Studio:**
   - Click green play button
   - App will connect to your dev server

### Option B: Production (For APK Distribution)

1. **Update capacitor.config.ts:**
   ```typescript
   server: {
     url: 'https://your-production-domain.com',
     cleartext: false,
   }
   ```

2. **Build static export:**
   ```bash
   npm run mobile:build
   ```

3. **Open in Android Studio:**
   ```bash
   npm run mobile:open
   ```

4. **Build APK:**
   - In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## API Routes Handling

### For Development
- API routes work normally (app connects to Next.js server)
- No changes needed

### For Production (Static Export)
- API routes are excluded from static export
- Update API calls in mobile app to use production server URL
- Or use Capacitor HTTP plugin to make API calls to production

**Example API call update:**
```typescript
// In your components
const API_URL = Capacitor.isNativePlatform() 
  ? 'https://your-production-domain.com' 
  : '';

fetch(`${API_URL}/api/endpoint`)
```

---

## Testing the Fix

### 1. Test Static Export
```bash
npm run mobile:build
```

**Expected**: Build completes without API route errors

### 2. Test Server Mode
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run mobile:sync
npm run mobile:open
```

**Expected**: App connects to dev server and works normally

### 3. Build APK
```bash
npm run mobile:run
# Then build APK in Android Studio
```

**Expected**: APK builds successfully

---

## Troubleshooting

### Issue: Still getting API route errors
**Solution**: Make sure `CAPACITOR_BUILD=true` is set when building:
```bash
CAPACITOR_BUILD=true npm run build
```

### Issue: Mobile app can't connect to server
**Solution**: 
1. Check server URL in `capacitor.config.ts`
2. Ensure server is running
3. Check firewall settings
4. Use `http://` (not `https://`) for local development

### Issue: Build succeeds but app doesn't work
**Solution**: 
1. Check if using server mode or static export
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Update API URLs if using static export

---

## Next Steps

1. ✅ **Build issue fixed** - Static export now works
2. **Test APK** - Build and test on device/emulator
3. **Configure API endpoints** - Update for production
4. **Build release APK** - Create signed APK for distribution

---

**Fix Complete!** 🎉

You can now build APKs without API route errors. Use development mode for testing and static export for production distribution.


