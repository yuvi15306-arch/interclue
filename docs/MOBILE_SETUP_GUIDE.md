# InterClue Mobile Setup & Build Guide

## 1. Running the Mobile App Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app installed on your physical iOS/Android device (or Android Studio / Xcode Simulator)

### Quick Start
```bash
cd frontend
npm install
npm run start
```

### Preview Options
- **Physical Phone**: Scan the QR code displayed in the terminal using the Expo Go camera (Android) or default Camera app (iOS).
- **Web Browser Preview**: Press `w` in the terminal to launch the web preview at `http://localhost:8081`.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal (macOS only).

---

## 2. Environment Configuration
The frontend automatically connects to the FastAPI backend. You can customize the backend URL in `frontend/src/config.ts`:
```typescript
export const API_BASE_URL = __DEV__ 
  ? "http://10.0.2.2:8000" // For Android Emulator, or your local machine IP (e.g. http://192.168.1.5:8000) for physical phone
  : "https://interclue-api.onrender.com";
```

---

## 3. Building Production APK / AAB for Google Play Store

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log into your Expo account:
   ```bash
   eas login
   ```
3. Configure project build:
   ```bash
   eas build:configure
   ```
4. Build Android App Bundle (AAB) for Google Play:
   ```bash
   eas build --platform android --profile production
   ```
5. Submit directly to Google Play Internal Testing:
   ```bash
   eas submit --platform android
   ```
