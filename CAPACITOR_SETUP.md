# Capacitor Setup Complete ✅

## What's Been Installed

- ✅ `@capacitor/core` - Core Capacitor runtime
- ✅ `@capacitor/cli` - Capacitor command-line interface
- ✅ `@capacitor/android` - Android platform support
- ✅ Android project created in `/android` directory

## Project Structure

```
Volo/
├── android/              # Android native project (new)
├── capacitor.config.ts   # Capacitor configuration
└── package.json          # Updated with mobile scripts
```

## Available Scripts

### Development & Building

```bash
# Build Next.js app for mobile and sync with Android
npm run mobile:build

# Sync web assets to Android (after building)
npm run mobile:sync

# Open Android project in Android Studio
npm run mobile:open

# Build and open Android Studio (all-in-one)
npm run mobile:run
```

## Building Your First APK

### Prerequisites

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (via SDK Manager)
   - Install Java JDK 11 or higher

2. **Set Environment Variables** (optional but recommended)
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   export ANDROID_HOME=$HOME/Android/Sdk          # Linux
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Step 1: Build Next.js App for Mobile

```bash
# This creates a static export in the 'out' directory
npm run mobile:build
```

### Step 2: Open in Android Studio

```bash
npm run mobile:open
```

Or manually:
```bash
npx cap open android
```

### Step 3: Build Debug APK

In Android Studio:

1. Wait for Gradle sync to complete (first time may take 5-10 minutes)
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Wait for build to complete
4. Click **locate** when notification appears
5. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Install on Device

**Via USB:**
```bash
# Enable USB debugging on your Android device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Via File Transfer:**
- Transfer `app-debug.apk` to your Android device
- Open the file on your device and install

## Building Release APK (for Production)

### Step 1: Generate Signing Key

```bash
keytool -genkey -v -keystore volo-release-key.keystore -alias volo -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save the keystore file and passwords securely! You'll need them for updates.

### Step 2: Configure Signing

1. Create `android/key.properties`:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=volo
storeFile=../volo-release-key.keystore
```

2. Update `android/app/build.gradle`:

Find the `android` section and update:
```gradle
...
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 3: Build Release APK

**Via Command Line:**
```bash
cd android
./gradlew assembleRelease
```

**Via Android Studio:**
1. Go to **Build > Generate Signed Bundle / APK**
2. Select **APK**
3. Choose your keystore file
4. Enter passwords
5. Select **release** build variant
6. Click **Finish**

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Configuration

### Capacitor Config (`capacitor.config.ts`)

The config is set up for:
- **App ID**: `com.volo.app`
- **App Name**: `Volo`
- **Web Directory**: `out` (Next.js static export)

### Development vs Production

**Development Mode** (testing locally):
- Next.js runs as a server
- Capacitor connects to `http://localhost:3000`
- Use: `npm run dev` then `npm run mobile:sync`

**Production Mode** (APK):
- Next.js exports static files
- Files bundled in APK
- Use: `npm run mobile:build`

### Changing Server URL

For development, you can change the server URL in `capacitor.config.ts`:

```typescript
server: {
  url: 'http://192.168.1.100:3000', // Your local IP
  cleartext: true,
}
```

## Troubleshooting

### Issue: "out directory not found"

**Solution:** 
```bash
# Build Next.js with static export enabled
CAPACITOR_BUILD=true npm run build
npx cap sync android
```

### Issue: Gradle sync fails

**Solutions:**
1. Update Android Gradle Plugin in `android/build.gradle`
2. Update Gradle wrapper: `cd android && ./gradlew wrapper --gradle-version 8.0`
3. Clean and rebuild: `cd android && ./gradlew clean`

### Issue: SDK not found

**Solution:**
1. Open Android Studio
2. Go to **Preferences > Appearance & Behavior > System Settings > Android SDK**
3. Install required SDK versions
4. Set `ANDROID_HOME` environment variable

### Issue: Java version error

**Solution:**
1. Install JDK 11 or higher
2. Set `JAVA_HOME` environment variable:
   ```bash
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home  # macOS
   ```

### Issue: Build fails with "duplicate resources"

**Solution:**
```bash
cd android
./gradlew clean
npx cap sync android
```

## Testing the APK

### On Emulator

1. Create an Android Virtual Device (AVD) in Android Studio
2. Start the emulator
3. Build and run from Android Studio (green play button)

### On Physical Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Run: `adb devices` to verify connection
5. Build and install APK

## Next Steps

1. **Test the APK** on a device or emulator
2. **Customize app icon** - Update `android/app/src/main/res/` icon files
3. **Update app name** - Edit `android/app/src/main/res/values/strings.xml`
4. **Add permissions** - Update `android/app/src/main/AndroidManifest.xml` if needed
5. **Configure app settings** - Update `capacitor.config.ts` for production

## Publishing to Google Play Store

1. Build a **signed release APK** or **AAB** (Android App Bundle)
2. Create a Google Play Console account ($25 one-time fee)
3. Create a new app in Play Console
4. Upload the APK/AAB
5. Complete store listing, screenshots, etc.
6. Submit for review

For AAB (recommended for Play Store):
- Change `releaseType` in `capacitor.config.ts` to `'AAB'`
- Build: `cd android && ./gradlew bundleRelease`

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console](https://play.google.com/console)

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Capacitor logs: `npx cap sync android --verbose`
3. Check Android Studio's Build output for detailed errors
4. Consult Capacitor community: https://forum.ionicframework.com/

---

**Setup Complete!** 🎉

You're ready to build Android APKs for Volo. Start with `npm run mobile:run` to build and open Android Studio.


