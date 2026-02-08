# Capacitor Quick Start Guide 🚀

## Fast Track to Building Your First APK

### Prerequisites Check
```bash
# Verify Capacitor is installed
npx cap doctor
```

### Step 1: Build Next.js for Mobile (First Time)
```bash
# This creates the 'out' directory with static files
npm run mobile:build
```

### Step 2: Open Android Studio
```bash
npm run mobile:open
```

### Step 3: Build APK in Android Studio

1. Wait for Gradle sync (first time: 5-10 minutes)
2. Go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Wait for build (~2-5 minutes)
4. Click **locate** in notification
5. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Install on Device

**Option A: Via USB**
```bash
cd android
./gradlew installDebug
```

**Option B: Transfer File**
- Copy APK to Android device
- Enable "Install from Unknown Sources"
- Tap APK to install

---

## Quick Command Reference

```bash
# All-in-one: Build and open
npm run mobile:run

# Just sync (after code changes)
npm run mobile:sync

# Build APK from command line (faster)
cd android && ./gradlew assembleDebug

# Install to connected device
cd android && ./gradlew installDebug
```

---

## Troubleshooting

### "out directory not found"
```bash
npm run mobile:build
```

### Gradle sync fails
- Install Android SDK (API 33+) in Android Studio
- Accept license agreements

### Android Studio not found
- Download from: https://developer.android.com/studio
- Install Android SDK via SDK Manager

---

## Need More Help?

- **Complete Guide**: See `CAPACITOR_NEXT_STEPS.md`
- **Setup Details**: See `CAPACITOR_SETUP.md`
- **Options Comparison**: See `MOBILE_APK_GUIDE.md`

---

**That's it!** Start with `npm run mobile:run` 🎉


