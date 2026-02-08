# Mobile Prerequisites Setup 🔧

## Next Steps Option 1: Prerequisites for Building APK

### Current Status

- ❌ Java/JDK not installed
- ⚠️  Android Studio not found in PATH (may still be installed)
- ⚠️  ANDROID_HOME not set

### What You Need to Build APK

1. **Java JDK 11+** - Required for Android builds
2. **Android Studio** - For building and testing
3. **Android SDK** - Installed via Android Studio
4. **Gradle** - Comes with Android project

---

## Step 1: Install Java JDK

### macOS (Recommended Method)

**Using Homebrew:**
```bash
# Install OpenJDK 11
brew install openjdk@11

# Link it (if needed)
sudo ln -sfn /opt/homebrew/opt/openjdk@11/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-11.jdk

# Set JAVA_HOME (add to ~/.zshrc or ~/.bash_profile)
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
export PATH="$JAVA_HOME/bin:$PATH"

# Reload shell
source ~/.zshrc  # or source ~/.bash_profile
```

**Verify Installation:**
```bash
java -version
# Should show: openjdk version "11.x.x"
```

**Alternative: Download from Oracle**
- Download: https://adoptium.net/
- Install the .dmg file
- Set JAVA_HOME as above

### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk

# Set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
```

### Windows

1. Download: https://adoptium.net/
2. Install JDK 11
3. Set JAVA_HOME:
   - System Properties > Environment Variables
   - Add JAVA_HOME: `C:\Program Files\Java\jdk-11`
   - Add to PATH: `%JAVA_HOME%\bin`

---

## Step 2: Install Android Studio

### macOS

1. **Download Android Studio:**
   - Go to: https://developer.android.com/studio
   - Download macOS version (.dmg file)

2. **Install:**
   - Open downloaded .dmg
   - Drag Android Studio to Applications
   - Open Android Studio from Applications

3. **First Launch Setup:**
   - Follow setup wizard
   - Install Android SDK (API 33+)
   - Install Android SDK Platform-Tools
   - Accept license agreements

4. **Set ANDROID_HOME (optional but recommended):**
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   
   # Reload shell
   source ~/.zshrc
   ```

### Linux

1. **Download:**
   - Go to: https://developer.android.com/studio
   - Download Linux version (.tar.gz)

2. **Extract and Install:**
   ```bash
   cd /opt
   sudo tar -xzf ~/Downloads/android-studio-*.tar.gz
   sudo mv android-studio /opt/
   ```

3. **Create Desktop Entry** (optional):
   ```bash
   sudo ln -s /opt/android-studio/bin/studio.sh /usr/local/bin/studio
   ```

4. **Set ANDROID_HOME:**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Windows

1. **Download:**
   - Go to: https://developer.android.com/studio
   - Download Windows version (.exe)

2. **Install:**
   - Run installer
   - Follow installation wizard
   - Install Android SDK

3. **Set Environment Variables:**
   - System Properties > Environment Variables
   - Add ANDROID_HOME: `C:\Users\YourName\AppData\Local\Android\Sdk`
   - Add to PATH: `%ANDROID_HOME%\platform-tools`

---

## Step 3: Configure Android SDK

### Via Android Studio

1. **Open Android Studio**

2. **SDK Manager:**
   - Go to: **Tools > SDK Manager**
   - Or: **More Actions > SDK Manager**

3. **Install Required SDKs:**
   - ✅ Android SDK Platform 33 (or latest)
   - ✅ Android SDK Build-Tools 33.x
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator (optional, for testing)

4. **SDK Tools Tab:**
   - ✅ Android SDK Command-line Tools
   - ✅ Google Play services
   - ✅ Intel x86 Emulator Accelerator (HAXM) - if on Intel Mac

### Verify SDK Installation

```bash
# Check if SDK exists
ls $ANDROID_HOME

# Check adb (Android Debug Bridge)
adb version
# Should show version info

# List installed packages
sdkmanager --list
```

---

## Step 4: Verify Everything is Installed

### Check Prerequisites

```bash
# Check Java
java -version
# Should show: openjdk version "11.x.x" or higher

# Check Java Home
echo $JAVA_HOME
# Should show: /path/to/jdk-11

# Check Android SDK
echo $ANDROID_HOME
# Should show: /path/to/android/sdk

# Check adb
adb version
# Should show version info

# Check Gradle (will be in Android project)
cd android
./gradlew --version
```

### Expected Outputs

**Java:**
```
openjdk version "11.0.x"
OpenJDK Runtime Environment
OpenJDK 64-Bit Server VM
```

**Android SDK:**
```
$ANDROID_HOME should point to SDK directory
```

**adb:**
```
Android Debug Bridge version x.x.x
```

---

## Step 5: Test Build (After Installation)

Once prerequisites are installed:

```bash
# 1. Build Next.js for mobile
npm run mobile:build

# 2. Build APK (from android directory)
cd android
./gradlew assembleDebug

# Should complete successfully
```

---

## Quick Install Script (macOS)

If you have Homebrew, you can run:

```bash
# Install Java
brew install openjdk@11

# Set JAVA_HOME (add to ~/.zshrc)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 11)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Download Android Studio
# Go to: https://developer.android.com/studio
# Download and install manually
```

---

## Troubleshooting

### Java Issues

**"java: command not found"**
- Solution: Install JDK and set JAVA_HOME
- See Step 1 above

**"Wrong Java version"**
- Solution: Ensure JDK 11+ is installed
- Check with: `java -version`

### Android Studio Issues

**"Android Studio not found"**
- Solution: Install from https://developer.android.com/studio
- Or add to PATH if installed elsewhere

**"SDK not found"**
- Solution: Install SDK via Android Studio SDK Manager
- Set ANDROID_HOME environment variable

**"License not accepted"**
- Solution: Run: `sdkmanager --licenses`
- Accept all licenses

### Gradle Issues

**"Gradle sync fails"**
- Solution: Open Android Studio and let it sync
- Or: `cd android && ./gradlew wrapper --gradle-version 8.0`

---

## Alternative: Build Without Android Studio

If you just want to build APK without full Android Studio:

```bash
# Install command-line tools only
# Download from: https://developer.android.com/studio#command-tools

# Then use Gradle directly
cd android
./gradlew assembleDebug
```

However, Android Studio is **strongly recommended** for first-time setup and troubleshooting.

---

## Next Steps After Installation

1. ✅ Verify all prerequisites installed
2. ✅ Test build: `npm run mobile:build && cd android && ./gradlew assembleDebug`
3. ✅ Build APK successfully
4. ✅ Install on device
5. ✅ Test app functionality

See `BUILD_APK_NOW.md` for building instructions after prerequisites are installed.

---

## Installation Time Estimates

- **Java JDK**: 5-10 minutes (download + install)
- **Android Studio**: 15-30 minutes (download + install + setup)
- **SDK Installation**: 10-20 minutes (first time)
- **Total**: ~30-60 minutes

---

**Once prerequisites are installed, proceed to `BUILD_APK_NOW.md`** 🚀


