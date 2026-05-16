# GrouPMeet - Project Vision & Roadmap

**GrouPMeet** is a "Contextual Communication App" designed to solve the _Noise-to-Signal_ problem in modern messaging. Our goal is to build a powerful messaging platform that separates a user's life (Personal & Education), uses AI to clean massive group chats, and seamlessly syncs with existing professional tools like Email.

This document serves as the master blueprint.

---

## Current Progress (Where We Are Now)

_We have successfully built the core foundation. We are currently around 30-40% of the way to a full WhatsApp clone._

### Completed So Far:

- **Authentication & User Registration:** Integrated `@clerk/expo` and `@clerk/express` with MongoDB.
- **Real-Time Messaging (The Engine):** Backend built with `Bun`, `Express`, and `Socket.io`.
- **Database Architecture:** `Chat`, `Message`, and `User` models configured in MongoDB.
- **UI & Navigation:** Expo Router set up with a safe-area Tab Layout (Chats, Groups, Profile).
- **Advanced Group Chats:** Group messaging controller implemented natively.

---

## 🛠️ Phase v1: The WhatsApp Foundation

_Goal: Match the core utility of WhatsApp and offer extensive personalization._

**11 key features** that present in WhatsApp-like application:

1. Registration
2. Real Time Messaging
3. Voice Calling
4. Video Calling
5. Multimedia Sharing
6. Settings
7. Contact Sharing
8. Location Sharing
9. Notifications
10. Business Profile
11. Chat Label

### Features to Build:

- [ ] **Multimedia Sharing:** Add `multer` to backend + Cloud Storage (S3/Cloudinary) to allow sending Images, Videos, and Documents.
- [ ] **Push Notifications:** Integrate Expo Push Tokens to alert users when the app is closed.
- [ ] **Custom UI/UX Theming:** Allow users to heavily customize their chat interface (Dark/Light mode, custom chat wallpapers, custom chat bubble colors). _Every user can make the app look and feel exactly how they want it._

---

## 🤖 Phase v2: The 3 Walled Gardens & AI "Clean It"

_Goal: Solve the "200+ Messages Noise" problem and separate personal life from school life._

### Features to Build:

- [ ] **The "Clean It" AI Button:** A revolutionary feature for large groups.
  - _How it works:_ A button that fetches unread messages, uses an AI to merge repetitive noise (e.g., _🎉 "Happy Birthday" (x45)_), and generates a clean 3-bullet point TL;DR summary of the chat.
- [ ] **The 2 Core Modes (Life Segregation) [3rd one next phase]:**
  1. **Personal:** Friends/Family (WhatsApp style).
     - _What it provides:_ Casual 1-on-1 chats, fun family groups, and quick media sharing. The focus is on intimacy and fast replies.
     - _How it looks:_ Relaxed, "bubbly" UI. Highly customizable chat wallpapers, vibrant colors, and large profile pictures. It feels like your digital living room.
  2. **Education:** College/School project groups, Teacher-Student communication, and Parent-Teacher groups. So nothing violates privacy by mistake.
     - _What it provides:_ Shared document folders (PDFs/notes), announcement broadcasts from teachers, and organized Q&A threads without ever exposing personal phone numbers to classmates or students.
     - _How it looks:_ Structured and organized (similar to Discord channels). Clean, muted professional tones, with a focus on files, links, and calendar events rather than casual chatter.

---

## Phase v3: Professional Email Sync (The "Job" Section) [ 3rd Walled ]

_Goal: Add a work section without forcing other professionals to download a new app._

### Features to Build:

- [ ] **Email Synchronization:** Instead of building a brand-new chat app for the office, GrouPMeet will sync with existing Email providers (Gmail/Outlook APIs).
  - _How it works:_ The user can read and reply to their boss's emails directly inside the "Job" section of GrouPMeet. The boss receives it as a normal email and doesn't need to change their habits.
- [ ] **AI Email Triage:** The same AI used to clean group chats can be used to summarize long work emails and create daily To-Do lists.

---

## Tech Stack & Open-Source Libraries (How to Build It)

To complete the roadmap above, here are the exact libraries and tools you should use:

- **Multimedia / Image Uploads:** Use `expo-image-picker` to select photos on the phone, and use `multer` + **AWS S3** (or **Supabase Storage**) on your Express backend to save them.
- **Push Notifications:** Use `expo-notifications` connected to **Firebase Cloud Messaging (FCM)**.
- **Voice & Video Calling:** Don't build this from scratch. Use open-source SDKs like `react-native-webrtc`, or use a pre-built service like **Agora** or **ZegoCloud** to save months of work.
- **UI & Theming State:** Use **Zustand** (a tiny, fast state manager) to globally store the user's color theme choices and update the UI instantly without reloading.
- **The "Clean It" AI:** Use the `@google/generative-ai` (Gemini API) on your Express backend. It has a massive context window and is incredibly fast for summarizing 200+ messages.
- **Email Sync (Phase 3):** Use the official `googleapis` (Google Node.js SDK) to connect the user's Gmail to your backend via OAuth.

---

## Highly Recommended "Must-Have" Features

_As an AI, if you are building this app, I highly recommend adding these 3 features to make it feel like a premium, professional product:_

1. **Local-First Architecture (Offline & 2G Network Support):**
   - _Why:_ Essential for global adoption. The app must feel instant even on slow 2G internet or fully offline.
   - _How:_
     - **Optimistic UI:** Show messages instantly when "Send" is pressed (with a clock icon 🕒), don't wait for the server.
     - **Local Database:** Use `WatermelonDB` or `Expo SQLite`. The UI should _only_ read from the local phone database, never directly from the cloud.
     - **The "Outbox":** Save unsent messages in a pending queue. As soon as the phone detects internet, silently push them via `Socket.io` and change the clock to a checkmark ✓.
     - **Delta Sync:** When reconnecting after being offline, don't download all messages. Only ask the backend for messages _after_ the last known timestamp.
2. **Read Receipts & Typing Indicators:**
   - _Why:_ The "double blue tick" and "User is typing..." features are essential for a chat app to feel "alive".
   - _How:_ You already have `Socket.io`! Just emit an `isTyping` event when the keyboard opens, and a `messageRead` event when a chat is opened.
3. **Emoji Reactions (❤️ 👍 😂):**
   - _Why:_ This actually solves the "Noise" problem manually! Instead of 10 people sending "Yes", they just long-press a message and add a 👍 reaction.
   - _How:_ Update your `Message.ts` schema to include a `reactions` array.

---

_Written to guide future development. Build one phase at a time as a solo developer. Good luck!_
