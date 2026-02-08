# Build APK Now! 🚀

## Next Steps Option 1: Build & Test APK

### Prerequisites Check

Before building, ensure you have:

- [ ] Android Studio installed
- [ ] Android SDK (API 33+) installed
- [ ] Java JDK 11+ installed
- [ ] Android device or emulator ready

---

## Step 1: Verify Prerequisites

### Check Java/JDK
```bash
java -version
# Should show Java 11 or higher
```

### Check Android SDK (if Android Studio installed)
```bash
echo $ANDROID_HOME
# Should show SDK path, e.g., /Users/yourname/Library/Android/sdk
```

### Install Prerequisites (if needed)

**Install Android Studio:**
- Download: https://developer.android.com/studio
- Install Android SDK via SDK Manager (API 33+)

**Install Java JDK:**
- macOS: `brew install openjdk@11`
- Or download from: https://adoptium.net/

---

## Step 2: Build APK

### Option A: Quick Build (Command Line)

```bash
# 1. Build Next.js for mobile (creates static export)
npm run mobile:build

# 2. Navigate to Android directory
cd android

# 3. Build debug APK
./gradlew assembleDebug

# 4. Find your APK
# Location: app/build/outputs/apk/debug/app-debug.apk
```

**Expected Output:**
```
BUILD SUCCESSFUL in Xs
```

### Option B: Build via Android Studio (Recommended for First Time)

```bash
# 1. Build and open Android Studio
npm run mobile:run
```

**In Android Studio:**

1. **Wait for Gradle Sync** (first time: 5-10 minutes)
   - Bottom right: "Gradle Sync Running"
   - Accept license agreements if prompted

2. **Build APK:**
   - Go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Wait for build (~2-5 minutes)
   - Look for notification: "Build completed successfully"

3. **Locate APK:**
   - Click **locate** in notification
   - Or manually: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Step 3: Install on Device

### Method 1: Via USB (Recommended)

1. **Enable USB Debugging on Android Device:**
   - Settings > About Phone
   - Tap "Build Number" 7 times (enables Developer Options)
   - Go back > Developer Options
   - Enable "USB Debugging"

2. **Connect Device via USB**

3. **Verify Connection:**
   ```bash
   adb devices
   ```
   Should show your device listed:
   ```
   List of devices attached
   ABC123XYZ    device
   ```

4. **Install APK:**
   ```bash
   # From android directory
   cd android
   ./gradlew installDebug
   ```
   
   Or directly:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

5. **Open App:**
   - App icon should appear on device
   - Tap to open

### Method 2: Via File Transfer

1. **Copy APK to Device:**
   - Transfer `app-debug.apk` to your Android device
   - Via USB, email, cloud storage, etc.

2. **Enable Unknown Sources:**
   - Settings > Security > Install unknown apps
   - Enable for your file manager or email app

3. **Install:**
   - Open file manager on device
   - Navigate to APK location
   - Tap on `app-debug.apk`
   - Tap "Install"
   - Tap "Open" when done

### Method 3: Via Emulator

1. **Start Emulator:**
   - Android Studio > Device Manager
   - Click play button on an AVD
   - Or create new AVD if needed

2. **Install APK:**
   ```bash
   # Drag APK into emulator window
   # Or use adb:
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## Step 4: Test the App

### Quick Test Checklist

**Basic Functionality:**
- [ ] App opens without crashing
- [ ] Login/signup page displays
- [ ] Can log in (if user exists)
- [ ] Language selection page works
- [ ] Learning path displays
- [ ] Can open a lesson
- [ ] Exercises display correctly

**Navigation:**
- [ ] Back button works
- [ ] Navigation between pages works
- [ ] Menu items work (if applicable)

**Progress:**
- [ ] XP awards after completing exercises
- [ ] Progress saves correctly
- [ ] Streak updates (if applicable)

### View Logs While Testing

```bash
# View all app logs
adb logcat | grep -i volo

# View errors only
adb logcat *:E

# Filter by app package
adb logcat | grep com.volo.app
```

---

## Step 5: Troubleshoot Issues

### Build Issues

**"Gradle sync fails"**
- Solution: Open Android Studio and let it download dependencies
- Or: `cd android && ./gradlew clean`

**"SDK not found"**
- Solution: Install Android SDK via Android Studio SDK Manager
- Set ANDROID_HOME environment variable

**"Java version error"**
- Solution: Install JDK 11+
- Set JAVA_HOME environment variable

**"out directory not found"**
- Solution: Run `npm run mobile:build` first

### Runtime Issues

**App crashes on launch**
```bash
# Check crash logs
adb logcat *:E | grep -i volo
```

**Can't connect to server**
- Check `capacitor.config.ts` server URL
- Ensure Next.js dev server is running: `npm run dev`
- Use local IP (not localhost) for development

**UI doesn't load**
- Check JavaScript errors in logcat
- Verify build completed successfully
- Try rebuilding: `npm run mobile:build`

---

## Step 6: Next Actions

### If Build Successful ✅

1. **Test thoroughly** using checklist above
2. **Document any issues** found during testing
3. **Fix issues** and rebuild if needed
4. **Create release APK** when ready

### If Build Fails ❌

1. **Check error messages** carefully
2. **Verify prerequisites** are installed
3. **Try cleaning build:**
   ```bash
   cd android
   ./gradlew clean
   npm run mobile:build
   ./gradlew assembleDebug
   ```
4. **Check documentation:**
   - `MOBILE_BUILD_FIX.md`
   - `CAPACITOR_SETUP.md`

---

## Quick Command Reference

```bash
# Build APK
npm run mobile:build
cd android && ./gradlew assembleDebug

# Install to device
cd android && ./gradlew installDebug

# View logs
adb logcat | grep -i volo

# Check connected devices
adb devices

# Uninstall app
adb uninstall com.volo.app

# Restart app
adb shell am start -n com.volo.app/.MainActivity
```

---

## Expected Timeline

- **First Build**: 10-15 minutes (downloads dependencies)
- **Subsequent Builds**: 2-5 minutes
- **APK Size**: ~20-50 MB
- **Install Time**: < 1 minute

---

## Success Indicators

✅ **Build Success:**
- "BUILD SUCCESSFUL" message
- APK file exists at expected location
- File size > 1 MB

✅ **Install Success:**
- App appears in app drawer
- Can launch app
- No crash on launch

✅ **App Working:**
- UI loads correctly
- Navigation works
- Features function as expected

---

**Ready to Build!** 🎉

Start with: `npm run mobile:run` or follow Step 2 above.


