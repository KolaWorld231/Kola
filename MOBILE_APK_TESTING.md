# Mobile APK Testing Guide 📱

## Option 2: Test APK on Device

### Prerequisites Checklist

- [ ] Android Studio installed
- [ ] Android SDK installed (API 33+)
- [ ] Java JDK 11+ installed
- [ ] Android device or emulator ready
- [ ] USB debugging enabled (for physical device)

---

## Step 1: Build the APK

### Option A: Build via Command Line (Fastest)

```bash
# Build Next.js for mobile and sync
npm run mobile:build

# Build debug APK
cd android
./gradlew assembleDebug

# APK will be at: app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Build via Android Studio (Recommended for First Time)

```bash
# Build and open Android Studio
npm run mobile:run
```

Then in Android Studio:
1. Wait for Gradle sync (first time: 5-10 minutes)
2. Go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Wait for build to complete (~2-5 minutes)
4. Click **locate** in the notification

**APK Location**: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Step 2: Install on Device

### Method 1: Via USB (Recommended)

1. **Enable USB Debugging on Android Device:**
   - Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back > Developer Options
   - Enable "USB Debugging"

2. **Connect Device via USB**

3. **Verify Connection:**
   ```bash
   adb devices
   ```
   Should show your device listed

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

### Method 2: Transfer File

1. **Copy APK to Device:**
   - Transfer `app-debug.apk` to your Android device
   - Via USB, email, cloud storage, etc.

2. **Enable Unknown Sources:**
   - Settings > Security > Install unknown apps
   - Enable for your file manager or email app

3. **Install APK:**
   - Open file manager on device
   - Tap on `app-debug.apk`
   - Tap "Install"
   - Tap "Open" when done

### Method 3: Via Emulator

1. **Create AVD (Android Virtual Device):**
   - Android Studio > Device Manager
   - Click "Create Device"
   - Choose device (e.g., Pixel 5)
   - Download system image (API 33+)
   - Finish and start emulator

2. **Install APK:**
   ```bash
   # Drag APK into emulator window
   # Or use adb:
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## Step 3: Test the App

### Initial Launch Tests

1. **App Opens Successfully**
   - ✅ App launches without crashes
   - ✅ Shows splash screen (if configured)
   - ✅ Loads initial screen

2. **Authentication Flow**
   - ✅ Sign in page displays
   - ✅ Can enter credentials
   - ✅ Login works
   - ✅ Redirects correctly after login

3. **Onboarding Flow** (for new users)
   - ✅ Onboarding displays for new users
   - ✅ Can navigate through steps
   - ✅ Can select language
   - ✅ Can complete onboarding
   - ✅ Doesn't show for returning users

### Core Features Testing

4. **Learning Path**
   - ✅ Language selection page works
   - ✅ Learning path displays correctly
   - ✅ Lessons show proper states (locked/unlocked/completed)
   - ✅ Can tap on lessons
   - ✅ Lesson page opens

5. **Lesson Content**
   - ✅ Exercises display correctly
   - ✅ Can interact with exercises
   - ✅ Can submit answers
   - ✅ Feedback shows correctly
   - ✅ Can complete lessons
   - ✅ XP awards correctly

6. **Navigation**
   - ✅ Back button works
   - ✅ Bottom navigation works (if applicable)
   - ✅ Menu items work
   - ✅ Deep links work

7. **Progress Tracking**
   - ✅ Streak updates
   - ✅ XP updates
   - ✅ Hearts system works
   - ✅ Progress saves correctly

### Device-Specific Tests

8. **Screen Orientation**
   - ✅ Portrait mode works
   - ✅ Landscape mode works (if supported)
   - ✅ UI adapts correctly

9. **Touch Interactions**
   - ✅ Taps register correctly
   - ✅ Swipes work (if implemented)
   - ✅ Scroll works smoothly
   - ✅ Buttons are properly sized

10. **Performance**
    - ✅ App loads quickly
    - ✅ No lag during navigation
    - ✅ Smooth animations
    - ✅ Images load correctly
    - ✅ No memory leaks

### API & Connectivity Tests

11. **API Calls**
    - ✅ API calls work (if using server mode)
    - ✅ Error handling works
    - ✅ Loading states show
    - ✅ Offline handling works (if implemented)

12. **Data Persistence**
    - ✅ Progress saves
    - ✅ Settings persist
    - ✅ Data survives app restart

---

## Step 4: Log Collection & Debugging

### Enable Logging

1. **Connect Device via USB**

2. **View Logs:**
   ```bash
   # View all logs
   adb logcat

   # Filter for Volo app
   adb logcat | grep -i volo

   # Filter for errors only
   adb logcat *:E
   ```

3. **View Capacitor Logs:**
   ```bash
   adb logcat | grep -i capacitor
   ```

### Common Issues & Solutions

#### Issue: App Crashes on Launch

**Check:**
- View crash logs: `adb logcat *:E`
- Check for missing permissions
- Verify API endpoints are accessible

**Solution:**
- Check `capacitor.config.ts` server URL
- Verify Android permissions in `AndroidManifest.xml`
- Check for native plugin issues

#### Issue: Can't Connect to Server

**Check:**
- Verify server is running: `npm run dev`
- Check server URL in `capacitor.config.ts`
- Test URL from device browser

**Solution:**
- Use your local IP (not localhost)
- Ensure firewall allows connections
- Check if server is accessible from network

#### Issue: API Calls Fail

**Check:**
- Verify API endpoints exist
- Check network requests in logcat
- Test API endpoints directly

**Solution:**
- Update API URLs to use production server
- Or use Capacitor HTTP plugin
- Check CORS settings

#### Issue: UI Doesn't Load Properly

**Check:**
- Verify build completed successfully
- Check for JavaScript errors in logcat
- Test in browser first

**Solution:**
- Rebuild: `npm run mobile:build`
- Clear Android cache: `./gradlew clean`
- Re-sync: `npx cap sync android`

---

## Step 5: Performance Testing

### Memory Usage

```bash
# Monitor memory usage
adb shell dumpsys meminfo com.volo.app
```

### CPU Usage

```bash
# Monitor CPU usage
adb shell top | grep volo
```

### Network Usage

```bash
# Monitor network traffic
adb shell cat /proc/net/xt_qtaguid/stats | grep volo
```

---

## Step 6: Test Checklist

### Functionality Checklist

- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] Authentication works
- [ ] Onboarding works for new users
- [ ] Onboarding doesn't show for returning users
- [ ] Language selection works
- [ ] Learning path displays correctly
- [ ] Lessons can be opened
- [ ] Exercises work correctly
- [ ] Progress saves
- [ ] Navigation works
- [ ] Back button works
- [ ] Settings work (if applicable)
- [ ] Logout works

### UI/UX Checklist

- [ ] UI looks correct on device
- [ ] Text is readable
- [ ] Buttons are properly sized
- [ ] Images display correctly
- [ ] Animations are smooth
- [ ] Loading states work
- [ ] Error messages display
- [ ] Dark mode works (if applicable)
- [ ] Responsive design works

### Performance Checklist

- [ ] App loads quickly
- [ ] No lag during navigation
- [ ] Smooth scrolling
- [ ] Images load efficiently
- [ ] No memory leaks
- [ ] Battery usage is reasonable

### Device-Specific Checklist

- [ ] Works on different screen sizes
- [ ] Works in portrait mode
- [ ] Works in landscape mode (if supported)
- [ ] Handles device rotation
- [ ] Works with different Android versions
- [ ] Works on tablets (if supported)

---

## Step 7: Create Test Report

### Test Report Template

```markdown
# Volo APK Test Report

## Test Environment
- Device: [Device Model]
- Android Version: [Version]
- Screen Size: [Size]
- APK Version: [Version]
- Build Date: [Date]

## Test Results

### ✅ Passed Tests
- [List passed tests]

### ❌ Failed Tests
- [List failed tests with details]

### ⚠️  Issues Found
- [List issues with severity]

## Screenshots
[Attach screenshots of issues]

## Logs
[Attach relevant log files]

## Recommendations
- [List recommendations]
```

---

## Quick Commands Reference

```bash
# Build APK
npm run mobile:build
cd android && ./gradlew assembleDebug

# Install to device
cd android && ./gradlew installDebug
# Or
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep -i volo

# Check connected devices
adb devices

# Uninstall app
adb uninstall com.volo.app

# Clear app data
adb shell pm clear com.volo.app

# Restart app
adb shell am start -n com.volo.app/.MainActivity
```

---

## Next Steps After Testing

1. **Fix Issues Found**
   - Document all issues
   - Prioritize fixes
   - Create fixes
   - Re-test

2. **Build Release APK**
   - Generate signing key
   - Configure signing
   - Build release APK
   - Test release APK

3. **Submit to Play Store**
   - Create Play Console account
   - Upload APK/AAB
   - Complete store listing
   - Submit for review

---

**Ready to Test!** 🎉

Start with: `npm run mobile:run` then build and test the APK.


