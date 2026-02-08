# APK Testing Quick Start 🚀

## Fast Track to Testing Your APK

### Step 1: Build APK (Choose One)

**Option A: Command Line (Fastest)**
```bash
npm run mobile:build
cd android && ./gradlew assembleDebug
```

**Option B: Android Studio**
```bash
npm run mobile:run
# Then Build > Build APK in Android Studio
```

---

### Step 2: Install on Device

**Via USB:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Via File Transfer:**
- Copy APK to device
- Enable "Install from Unknown Sources"
- Tap APK to install

---

### Step 3: Test Checklist ✅

**Basic Tests:**
- [ ] App opens
- [ ] Login works
- [ ] Language selection works
- [ ] Learning path displays
- [ ] Lessons open
- [ ] Exercises work

**Quick Test:**
```bash
# View logs while testing
adb logcat | grep -i volo
```

---

### Common Issues

**App crashes?**
```bash
# Check crash logs
adb logcat *:E
```

**Can't connect to server?**
- Check `capacitor.config.ts` server URL
- Use your local IP (not localhost)
- Ensure `npm run dev` is running

---

### Full Guide

See `MOBILE_APK_TESTING.md` for complete testing guide.

---

**That's it!** Start testing your APK! 📱


