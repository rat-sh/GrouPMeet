# GrouPMeet: Complete Setup & Installation Guide

Welcome to the GrouPMeet repository! This guide provides step-by-step instructions for a new developer to set up the environment, install dependencies, and run the complete Full-Stack architecture (Backend, Web, and Mobile).

---

## 1. System Requirements & Prerequisites

Before cloning the repository, ensure you have the following installed on your machine:

1. **[Bun](https://bun.sh/) (v1.x+)** - We use Bun as our primary package manager and JavaScript runtime for extreme speed.
2. **[Node.js](https://nodejs.org/) (v20+)** - Required as a fallback runtime for certain React Native/Expo scripts.
3. **[MongoDB](https://www.mongodb.com/)** - You need a local MongoDB instance running, or a free cloud cluster from MongoDB Atlas.
4. **Mobile Native Build Tools:**
   *Because this app uses High-Performance Nitro Modules and MMKV (C++ JSI), it cannot run in the standard Expo Go app. You must compile the native code.*
   - **For Android:** Install [Android Studio](https://developer.android.com/studio), setup the Android SDK, and configure an Android Emulator.
   - **For iOS (Mac only):** Install [Xcode](https://developer.apple.com/xcode/) from the Mac App Store and install CocoaPods (`sudo gem install cocoapods`).

---

## 2. Environment Variables (.env)

You need to create three separate `.env` files for the three different parts of the stack. Ask the lead developer for the actual Clerk API keys.

### Backend (`backend/.env`)
Create a file named `.env` inside the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/groupmeet
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
FRONTEND_URL=http://localhost:5173
```

### Web (`web/.env.local`)
Create a file named `.env.local` inside the `web` folder:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Mobile (`mobile/.env.local`)
Create a file named `.env.local` inside the `mobile` folder:
```env
# Note: Use your machine's local IP address (e.g., 192.168.1.X) instead of localhost for the emulator to connect to your backend!
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
EXPO_PUBLIC_API_URL=http://192.168.1.X:5000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.X:5000
```

---

## 3. Installation Commands

Open your terminal and run the following commands to install dependencies for all three projects.

```bash
# 1. Install Backend Dependencies
cd backend
bun install

# 2. Install Web Dependencies
cd ../web
bun install

# 3. Install Mobile Dependencies
cd ../mobile
bun install
```

---

## 4. Running the Complete Stack

You need to run three separate terminal windows to boot up the entire architecture.

### Terminal 1: Start the Express/Socket Backend
```bash
cd backend
bun run dev
```
*You should see "Server running on port 5000" and "MongoDB Connected".*

### Terminal 2: Start the Web App
```bash
cd web
bun run dev
```
*Open `http://localhost:5173` in your browser. You can now use the Web App.*

### Terminal 3: Start the Mobile App (Custom Dev Client)
Because we use **Nitro Modules** and **MMKV** for ultra-fast storage, you must build the native app.

**To run on Android Emulator:**
```bash
cd mobile
bun expo run:android
```

**To run on iOS Simulator (Mac Only):**
```bash
cd mobile
bun expo run:ios
```

*Note: The first time you run these commands, it will take a few minutes to compile the C++ and Swift/Kotlin code. Subsequent runs will be much faster.*

---

## 5. Troubleshooting

- **Mobile App cannot connect to Backend:** If you see "Network Error" on mobile, ensure your `EXPO_PUBLIC_API_URL` uses your computer's actual Wi-Fi IP address (e.g., `192.168.1.15`) instead of `localhost`, because the Android emulator treats `localhost` as the phone itself.
- **App crashes on startup:** Ensure you ran `bun expo run:android` and NOT `bun start`. Nitro Modules require the custom native build.
- **Clerk Auth Fails:** Double-check that your Publishable and Secret keys are exactly correct in all three `.env` files.
