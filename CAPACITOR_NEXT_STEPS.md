# Capacitor Next Steps 🚀

## Immediate Actions

### Step 1: Verify Setup
```bash
# Check if Capacitor is properly installed
npx cap doctor

# This will show any missing dependencies or configuration issues
```

### Step 2: Build Next.js for Mobile
```bash
# Build your Next.js app as static export for mobile
npm run mobile:build
```

This will:
- Build Next.js with static export enabled
- Sync web assets to the Android project
- Prepare everything for APK building

### Step 3: Open Android Studio
```bash
npm run mobile:open
```

Or manually:
```bash
npx cap open android
```

---

## Building Your First APK

### Option A: Using Android Studio (Recommended for First Time)

1. **Open Android Studio**
   - Wait for Gradle sync (may take 5-10 minutes first time)
   - Accept any license agreements if prompted

2. **Build Debug APK**
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Wait for build to complete (~2-5 minutes)
   - Click **locate** in the notification

3. **Find Your APK**
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Size: ~20-50 MB

4. **Install on Device**
   - Transfer APK to Android device
   - Enable "Install from Unknown Sources" in device settings
   - Tap the APK file to install

### Option B: Using Command Line (Faster)

```bash
# Navigate to Android directory
cd android

# Build debug APK
./gradlew assembleDebug

# APK will be at: app/build/outputs/apk/debug/app-debug.apk

# Install directly to connected device
./gradlew installDebug
```

---

## Testing Your APK

### On Emulator

1. **Create AVD (Android Virtual Device)**
   - Android Studio > Device Manager
   - Create Virtual Device
   - Choose device (e.g., Pixel 5)
   - Download system image (API 33+)
   - Finish and start emulator

2. **Run APK on Emulator**
   ```bash
   # From android directory
   ./gradlew installDebug
   ```
   Or drag APK into emulator window

### On Physical Device

1. **Enable USB Debugging**
   - Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back > Developer Options
   - Enable "USB Debugging"

2. **Connect Device**
   ```bash
   # Check if device is connected
   adb devices
   
   # Install APK
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## Common Issues & Solutions

### Issue: "out directory not found"
**Solution:**
```bash
# Make sure you run the build first
npm run mobile:build
```

### Issue: Gradle sync fails
**Solution:**
```bash
cd android
./gradlew clean
npx cap sync android
```

### Issue: Build errors about missing SDK
**Solution:**
1. Open Android Studio
2. SDK Manager > Install missing SDK versions
3. Usually need: Android SDK Platform 33+, Build Tools 33+

### Issue: "Unable to locate Android SDK"
**Solution:**
```bash
# Set environment variable (macOS)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Add to ~/.zshrc or ~/.bash_profile for persistence
```

### Issue: Java version error
**Solution:**
- Install JDK 11 or higher
- Set JAVA_HOME:
  ```bash
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home
  ```

---

## Development Workflow

### For Development (Hot Reload)

1. **Start Next.js Dev Server**
   ```bash
   npm run dev
   ```

2. **Update Capacitor Config** (temporarily)
   Edit `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000', // e.g., http://192.168.1.100:3000
     cleartext: true,
   }
   ```

3. **Sync and Open**
   ```bash
   npx cap sync android
   npx cap open android
   ```

4. **Run in Android Studio**
   - Click green play button
   - App will connect to your Next.js dev server

### For Production (Static Bundle)

1. **Build for Production**
   ```bash
   npm run mobile:build
   ```

2. **Build Release APK**
   - See "Building Release APK" section below

---

## Building Release APK (For Production)

### Step 1: Generate Signing Key

```bash
keytool -genkey -v -keystore volo-release-key.keystore -alias volo -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** 
- Save passwords securely!
- Keep `volo-release-key.keystore` safe (needed for updates)

### Step 2: Configure Signing

1. **Create `android/key.properties`**
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=volo
   storeFile=../volo-release-key.keystore
   ```

2. **Update `android/app/build.gradle`**

   Add this before the `android` block:
   ```gradle
   def keystorePropertiesFile = rootProject.file("key.properties")
   def keystoreProperties = new Properties()
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```

   Update `signingConfigs`:
   ```gradle
   signingConfigs {
       release {
           if (keystorePropertiesFile.exists()) {
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
               storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
               storePassword keystoreProperties['storePassword']
           }
       }
   }
   ```

   Update `buildTypes`:
   ```gradle
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled false
           proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
       }
   }
   ```

### Step 3: Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Customization

### Update App Icon

Replace icons in:
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

Or use Android Studio's Asset Studio:
- Right-click `res` folder > New > Image Asset

### Update App Name

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Volo</string>
</resources>
```

### Update Package Name

1. Edit `android/app/build.gradle`:
   ```gradle
   applicationId "com.volo.app"
   ```

2. Edit `capacitor.config.ts`:
   ```typescript
   appId: 'com.volo.app'
   ```

3. Sync:
   ```bash
   npx cap sync android
   ```

### Add Permissions

Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<!-- Add more as needed -->
```

---

## Performance Optimization

### Enable ProGuard (Reduce APK Size)

1. Edit `android/app/build.gradle`:
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
       }
   }
   ```

2. Create `android/app/proguard-rules.pro`:
   ```
   # Keep Capacitor classes
   -keep class com.getcapacitor.** { *; }
   -keep interface com.getcapacitor.** { *; }
   
   # Keep your app classes
   -keep class com.volo.app.** { *; }
   ```

### Optimize Images

Already configured in `next.config.js`:
- WebP format
- Responsive sizes
- Lazy loading

---

## Publishing to Google Play Store

### Step 1: Build Android App Bundle (AAB)

1. **Update Capacitor Config**
   Edit `capacitor.config.ts`:
   ```typescript
   android: {
     buildOptions: {
       releaseType: 'AAB' as const,
     },
   },
   ```

2. **Build AAB**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

   AAB at: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 2: Create Play Console Account

1. Go to https://play.google.com/console
2. Pay one-time $25 registration fee
3. Create new app

### Step 3: Upload and Configure

1. **Upload AAB/APK** in Play Console
2. **Complete store listing:**
   - App name, description, screenshots
   - Feature graphic, icon
   - Privacy policy URL
3. **Content rating** questionnaire
4. **Pricing & distribution**
5. **Submit for review**

### Step 4: Release

- Start with **Internal testing** track
- Test with testers
- Then promote to **Production**

---

## Monitoring & Updates

### Track App Performance

- Integrate Firebase Analytics
- Use Sentry (already configured) for crash reporting
- Monitor Play Console metrics

### Release Updates

1. **Update version** in:
   - `package.json`
   - `android/app/build.gradle` (versionCode, versionName)

2. **Build new APK/AAB**
   ```bash
   npm run mobile:build
   cd android && ./gradlew bundleRelease
   ```

3. **Upload to Play Console**

---

## Troubleshooting Checklist

- [ ] Android Studio installed
- [ ] Android SDK installed (API 33+)
- [ ] Java JDK 11+ installed
- [ ] Environment variables set (ANDROID_HOME, JAVA_HOME)
- [ ] Gradle sync successful
- [ ] Next.js build successful
- [ ] Capacitor sync successful
- [ ] Device/emulator connected (for testing)

---

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Google Play Console](https://play.google.com/console)

---

## Quick Commands Reference

```bash
# Build and sync
npm run mobile:build

# Open Android Studio
npm run mobile:open

# Sync only
npm run mobile:sync

# Build APK (from android directory)
cd android && ./gradlew assembleDebug

# Build release APK
cd android && ./gradlew assembleRelease

# Install to connected device
cd android && ./gradlew installDebug

# Check connected devices
adb devices
```

---

**Ready to build your APK!** 🎉

Start with: `npm run mobile:run`


