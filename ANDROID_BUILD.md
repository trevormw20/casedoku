# Casedoku Manor — Android (debug APK via Capacitor)

The game is wrapped for Android with **Capacitor**. The web app (`index.html` + `assets/`)
is the source of truth; `scripts/build-www.mjs` copies it into `www/` (Capacitor's web root),
which is then bundled into the native Android project under `android/`.

- **App name:** Casedoku Manor
- **Package id:** `com.eternalcrystudio.casedokumanor`
- **Orientation:** portrait (locked in `android/app/src/main/AndroidManifest.xml`)
- **Launches:** straight into the game (the WebView loads `index.html`; no splash/menu)
- Local images, the music mp3, synthesized SFX, and `localStorage` save data all work —
  they're served from Capacitor's local origin, so the relative `assets/...` paths resolve.

**Status: fully built.** Capacitor is installed, the `android/` project is configured, the
toolchain is installed, and a debug APK has been produced at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

Installed toolchain (under your user folder, no admin):
- **JDK 21** — `%LOCALAPPDATA%\Java\jdk-21.0.11+10`  (set as `JAVA_HOME`)
- **Android SDK** — `%LOCALAPPDATA%\Android\Sdk`  (set as `ANDROID_HOME`; platform-tools, android-36, build-tools 36.0.0)
- `JAVA_HOME`, `ANDROID_HOME`, and PATH (jdk\bin + platform-tools) are persisted for new terminals,
  so `npm run android:apk` works from a fresh terminal with no extra setup.

---

## Prerequisites (only if setting up on a fresh machine)

Capacitor 8 requires **JDK 21** and **Android SDK platform 36**.

### Easiest: Android Studio (bundles JDK 21 + SDK + `adb`)
1. Install Android Studio: https://developer.android.com/studio
2. Open the **`android`** folder as a project:
   File → Open → `C:\Users\maker\Documents\claude\cludoku\android`
3. Let Gradle sync. When prompted, accept the SDK 36 / build-tools downloads.
   (This also writes `android/local.properties` pointing at your SDK.)

### Alternative: command-line only (no GUI)
1. JDK 21: `winget install EclipseAdoptium.Temurin.21.JDK`
2. Android command-line tools: download from https://developer.android.com/studio#command-line-tools-only
   and unzip to `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\`
3. Install packages + accept licenses:
   ```
   sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
   sdkmanager --licenses
   ```
4. Set env vars (then restart the terminal):
   ```
   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
   setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21..."   (your JDK 21 path)
   ```
5. Create `android\local.properties` with (note the doubled backslashes):
   ```
   sdk.dir=C\:\\Users\\maker\\AppData\\Local\\Android\\Sdk
   ```

---

## Build the debug APK

**Android Studio:** Build → *Build App Bundle(s) / APK(s)* → **Build APK(s)**.
When it finishes, click **locate** in the notification.

**Terminal** (from the project root, once the toolchain is set up):
```
npm run android:apk
```
That runs: rebuild `www/` → `cap sync android` → `gradlew assembleDebug`.
(Equivalent manual form: `cd android` then `.\gradlew.bat assembleDebug`.)

### The APK lands here
```
C:\Users\maker\Documents\claude\cludoku\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## Install it on your phone (sideload)

**Option A — USB + adb (cleanest):**
1. On the phone: Settings → About phone → tap *Build number* 7× to enable Developer options;
   then Settings → Developer options → enable **USB debugging**.
2. Plug the phone in via USB, approve the "Allow USB debugging" prompt.
3. From the project (adb ships in the SDK's `platform-tools`):
   ```
   adb install -r android\app\build\outputs\apk\debug\app-debug.apk
   ```

**Option B — copy the file (no PC tools):**
1. Copy `app-debug.apk` to the phone (USB file transfer, Google Drive, email-to-self, etc.).
2. On the phone, open it with the Files app and tap Install. When asked, allow
   "install unknown apps" for that app, then confirm. The app appears as **Casedoku Manor**.

---

## After you change the game

Re-bundle and rebuild:
```
npm run android:sync      # rebuild www/ and copy into android/
```
then build again (Android Studio Build APK, or `npm run android:apk`).

> This is a **debug** APK — unsigned for release, fine for personal sideloading.
> Release signing / Play Store packaging is a separate step for later.
