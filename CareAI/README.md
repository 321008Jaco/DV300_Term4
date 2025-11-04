<h1 align="center">CareAI</h1>

<p align="center">
  Your AI-powered health companion — type or speak your symptoms and get instant, reliable triage guidance.
  <br />
  <a href="#installation"><strong>Install</strong></a>
  ·
  <a href="#usage"><strong>Usage</strong></a>
  ·
  <a href="#screens--features"><strong>Features</strong></a>
  ·
  <a href="#development-notes"><strong>Dev Notes</strong></a>
</p>

<p align="center">
NOTE: Work from branch= "restore-dc87c12"
</p>

<p align="center">
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-51%2B-000?logo=expo&logoColor=white" alt="Expo" /></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-ffca28?logo=firebase&logoColor=black" alt="Firebase" /></a>
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React%20Native-0.7x-61dafb?logo=react&logoColor=black" alt="RN" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
</p>

---

## Table of Contents

- [About](#about)
- [Built With](#built-with)
- [Screens & Features](#screens--features)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [1) Clone](#1-clone)
  - [2) Install dependencies](#2-install-dependencies)
  - [3) Configure Firebase](#3-configure-firebase)
  - [4) Run locally](#4-run-locally)
- [Usage](#usage)
- [Security & Environment](#security--environment)
- [Development Notes](#development-notes)
- [Screenshots / Mockups](#screenshots--mockups)
- [License](#license)
- [Authors](#authors)
- [Acknowledgements](#acknowledgements)

[⬆️ Back to top](#careai)

---

## About

**CareAI** is a cross-platform mobile app built with **React Native + Firebase**.  
It allows users to **type or speak their symptoms**, and receive AI-powered health triage advice in seconds.

---

### Core Features:
-  Animated splash screen with logo
-  AI-driven symptom triage via text or voice
-  Dynamic risk classification (mild, moderate, critical)
-  Voice-to-text support
-  Firebase Auth for secure login & signup
-  Saved history of all previous triage sessions
-  Custom onboarding with disclaimer and usage guide

[⬆️ Back to top](#careai)

---

## Built With

- **Expo / React Native (TypeScript)**
- **Firebase** Auth · Firestore · Storage
- **Expo AV + Speech + Lottie**
- **React Navigation** (Stack + Bottom Tabs)
- **React Native Paper** (UI Components)
- **AsyncStorage** (Onboarding + Session control)

[⬆️ Back to top](#careai)

---

## Screens & Features

| Area | Highlights |
|------|-------------|
| **Splash** | Animated CareAI logo using Lottie |
| **Login / Signup** | Firebase Auth, password reset, onboarding trigger |
| **Onboarding Modal** | Disclaimer + app usage tutorial shown once |
| **Home Screen** | Text or voice-based triage requests |
| **Voice Mode** | Live microphone input & transcription |
| **AI Reply** | Severity-level response with advice array |
| **History** | All previous triage entries stored in Firestore |
| **Settings** | Account preferences and logout |

[⬆️ Back to top](#careai)

---

## Project Structure

```bash
CareAI/
├── App.tsx
├── app.json
├── assets/
│   ├── animations/
│   │   └── careai-logo.json
│   ├── images/
│   │   ├── splash-static.png
│   │   └── icons/
├── src/
│   ├── Component/
│   │   ├── AiReply.tsx
│   │   ├── AnimatedSplash.tsx
│   │   └── OnboardingModal.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── triageService.ts
│   │   ├── voiceService.ts
│   │   ├── onboarding.ts
│   │   └── historyService.ts
│   └── theme/
│       └── theme.ts

```

---

## Installation

1) Clone the repository
```bash
git clone https://github.com/321008Jaco/CareAI.git
cd CareAI
```
2) Install dependencies
```bash
npm install
```
3) Configure Firebase
```bash
Edit /src/services/firebase.ts with your Firebase project credentials:

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```
4) Run locally
```bash
npx expo start
```

⬆️ Back to top

---

## Usage

Open CareAI — you’ll see the animated splash logo.

Sign up or log in securely using Firebase.

View the onboarding modal for the disclaimer and app walkthrough.

On the Home Screen, type or use your voice to describe symptoms.

The AI system will respond with:

Identified condition or symptom group

Severity level (e.g. Self-care / Potentially serious)

Recommended actions or treatments

View your previous triage results in the History tab.

Access Settings to log out or manage your account.

⬆️ Back to top

---

## Development Notes

The splash screen uses Lottie animation from /assets/animations/careai-logo.json.

Onboarding persistence is managed with AsyncStorage to show it once per login.

Voice recognition is powered by Expo AV recording and transcription service.

The app flow:
Splash ➜ Login ➜ Onboarding ➜ Home ➜ History / Settings.

AuthContext maintains user session state globally.

The app theme is consistent across all pages using src/theme/theme.ts.

⬆️ Back to top

---

## Screenshots / Mockups



⬆️ Back to top

---

## License

MIT © CareAI

⬆️ Back to top

---

## Authors

Jaco Mostert – GitHub

⬆️ Back to top

---

## Acknowledgements

Open Window, School of Creative Technologies

Firebase – Authentication & Storage

Expo – Development Framework

React Native Paper – UI Components

Google Cloud Speech API

Figma & Stack Overflow – Design & Community Support

⬆️ Back to top

---

## Demo Video



---