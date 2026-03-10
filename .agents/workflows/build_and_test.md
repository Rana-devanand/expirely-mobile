---
description: How to build and test the mobile app with Google Sign-In
---

# Build and Test Workflow

Because Google Sign-In uses native code, it **will not work in the standard Expo Go app**. You must use a **Development Build**.

### 1. Prerequisites

- Ensure `google-services.json` is in the project root (Done).
- Ensure `.env` has the correct `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (Done).
- Ensure your Android device/emulator is connected.

### 2. Local Build (Fastest for testing)

Run this command to build the app and install it directly on your connected device or emulator.

```bash
npx expo run:android
```

_Note: This will take a few minutes the first time as it compiles the native code._

### 3. Cloud Build (If you need an APK)

If you want to create an APK that others can install, use EAS:

```bash
eas build --profile development --platform android
```

Once finished, download and install the APK on your device.

### 4. Running the Development Build

Once the app is installed on your device:

1. Start the Expo development server:
   ```bash
   npx expo start --dev-client
   ```
2. Open the app on your phone.
3. Test the Google Sign-In flow.

### 5. Troubleshooting Sign-In

- **SHA-1 Fingerprint**: Ensure the SHA-1 of your development key (found by running `npx expo fingerprint` or checking Google Play Console) is added to your Firebase project settings.
- **Web Client ID**: Double-check that `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env` matches the **Web** client ID from the Google Cloud Console, not the Android one.
