// src/services/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import * as Auth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAkLx2MMKhtdWlGuTt3Dq97_Y0rncacHsY',
  authDomain: 'careai-d0274.firebaseapp.com',
  projectId: 'careai-d0274',
  storageBucket: 'careai-d0274.firebasestorage.app',
  messagingSenderId: '65669784085',
  appId: '1:65669784085:web:15022d89107be86438641c',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Prefer persistent RN storage if available; otherwise fall back without breaking build
let auth: Auth.Auth;
try {
  if ((Auth as any).getReactNativePersistence) {
    auth = Auth.initializeAuth(app, {
      persistence: (Auth as any).getReactNativePersistence(AsyncStorage),
    });
  } else {
    // Older typings/builds: fall back to default (in-memory) to avoid warnings blocking you
    auth = Auth.getAuth(app);
  }
} catch {
  auth = Auth.getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
