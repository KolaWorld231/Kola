# Prerequisites Quick Setup 🚀

## Fast Track to Building APK

### Current Status
- ❌ Java not installed
- ⚠️  Android Studio not found

### Quick Install (macOS)

```bash
# 1. Install Java JDK 11
brew install openjdk@11

# 2. Set JAVA_HOME (add to ~/.zshrc)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 11)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc

# 3. Reload shell
source ~/.zshrc

# 4. Verify
java -version
```

### Install Android Studio

1. **Download:**
   - Go to: https://developer.android.com/studio
   - Download and install

2. **First Launch:**
   - Install Android SDK (API 33+)
   - Accept licenses

3. **Set ANDROID_HOME** (add to ~/.zshrc):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Verify Setup

```bash
java -version        # Should show JDK 11+
echo $ANDROID_HOME   # Should show SDK path
adb version          # Should show version
```

### Then Build APK

```bash
npm run mobile:build
cd android && ./gradlew assembleDebug
```

---

**Full Guide**: See `MOBILE_PREREQUISITES_SETUP.md`


