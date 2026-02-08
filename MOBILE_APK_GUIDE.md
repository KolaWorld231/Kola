# Android APK Generation Guide for Volo

## Overview

Volo is currently a Next.js web application. To generate an APK for Android testing, you have several options:

## Option 1: Capacitor (Recommended)

Capacitor wraps your Next.js app as a native mobile app. This is the easiest way to convert your web app to Android/iOS.

### Prerequisites

- Node.js 18+
- Android Studio installed
- Java JDK 11+
- Android SDK (installed via Android Studio)

### Installation Steps

1. **Install Capacitor CLI**
```bash
npm install -g @capacitor/cli
```

2. **Initialize Capacitor in your project**
```bash
cd /Users/visionalventure/Volo
npm install @capacitor/core @capacitor/cli
npx cap init
```

3. **Add Android platform**
```bash
npm install @capacitor/android
npx cap add android
```

4. **Build your Next.js app**
```bash
npm run build
npm run start  # Start the production server
```

5. **Copy web assets to Capacitor**
```bash
npx cap sync android
```

6. **Update Capacitor configuration**
Edit `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.volo.app',
  appName: 'Volo',
  webDir: '.next',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000', // For local testing
    cleartext: true
  }
};

export default config;
```

7. **Open in Android Studio**
```bash
npx cap open android
```

8. **Build APK in Android Studio**
- Open Android Studio
- Wait for Gradle sync to complete
- Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- Wait for build to complete
- Click **locate** when build finishes
- APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### For Production APK

1. **Generate a signing key**
```bash
keytool -genkey -v -keystore volo-release-key.keystore -alias volo -keyalg RSA -keysize 2048 -validity 10000
```

2. **Create `android/key.properties`**
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=volo
storeFile=../volo-release-key.keystore
```

3. **Update `android/app/build.gradle`**
```gradle
...
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
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

4. **Build release APK**
```bash
cd android
./gradlew assembleRelease
```

APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

---

## Option 2: Progressive Web App (PWA)

Convert Volo to a PWA that can be installed on Android. This doesn't generate an APK, but users can install it from the browser.

### Steps

1. **Install PWA dependencies**
```bash
npm install next-pwa
```

2. **Update `next.config.js`**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Your existing config
});
```

3. **Create `public/manifest.json`**
```json
{
  "name": "Volo - Learn Liberian Languages",
  "short_name": "Volo",
  "description": "Learn Liberian languages with interactive lessons",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#DC143C",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

4. **Update `app/layout.tsx`**
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#DC143C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Volo'
  }
};
```

5. **Create app icons**
- Create `public/icon-192x192.png` (192x192px)
- Create `public/icon-512x512.png` (512x512px)

6. **Build and test**
```bash
npm run build
npm run start
```

Users can install the app from Chrome's menu: **Install App**

---

## Option 3: React Native (Separate Mobile App)

Build a native mobile app using React Native that connects to your Next.js API.

### Steps

1. **Create React Native app**
```bash
npx react-native init VoloMobile --template react-native-template-typescript
cd VoloMobile
```

2. **Install dependencies**
```bash
npm install axios react-native-gesture-handler react-native-reanimated
```

3. **Build APK for testing**
```bash
cd android
./gradlew assembleDebug
```

APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

4. **Build release APK**
```bash
cd android
./gradlew assembleRelease
```

---

## Option 4: Expo (Easiest but Limited)

Use Expo to quickly generate an APK without Android Studio.

### Steps

1. **Create Expo app**
```bash
npx create-expo-app VoloMobile
cd VoloMobile
```

2. **Install EAS CLI**
```bash
npm install -g eas-cli
eas login
```

3. **Configure EAS**
```bash
eas build:configure
```

4. **Build APK**
```bash
eas build --platform android --profile preview
```

This will generate a download link for your APK (takes ~10-15 minutes).

---

## Quick Comparison

| Option | Difficulty | Time | Native Features | Offline Support |
|--------|------------|------|-----------------|-----------------|
| Capacitor | Medium | 2-3 hours | ✅ Full | ✅ Yes |
| PWA | Easy | 1 hour | ⚠️ Limited | ⚠️ Partial |
| React Native | Hard | Days/weeks | ✅ Full | ✅ Yes |
| Expo | Easy | 1-2 hours | ⚠️ Limited | ⚠️ Partial |

---

## Recommended: Capacitor Setup Script

I can create a setup script to automate the Capacitor installation. Would you like me to:

1. **Set up Capacitor** for Volo automatically
2. **Create the necessary config files**
3. **Add build scripts** to package.json
4. **Create a step-by-step guide** specific to Volo

Just let me know if you'd like me to proceed with the Capacitor setup!

---

## Troubleshooting

### Android Studio Issues

- **Gradle sync fails**: Update Android Gradle Plugin in `android/build.gradle`
- **SDK not found**: Install Android SDK via Android Studio SDK Manager
- **Java version error**: Install JDK 11+ and set JAVA_HOME

### Build Errors

- **Signing errors**: Check `key.properties` file exists and passwords are correct
- **Asset errors**: Run `npx cap sync` after building Next.js app
- **Port conflicts**: Change server URL in `capacitor.config.ts`

---

## Next Steps

Choose an option and I can help you:
1. Install and configure it
2. Set up build scripts
3. Create necessary config files
4. Test the APK generation

Which option would you like to proceed with?


