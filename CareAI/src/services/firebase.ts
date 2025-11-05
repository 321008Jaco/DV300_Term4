import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  inMemoryPersistence,
  getAuth,
  Auth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAkLx2MMKhtdWlGuTt3Dq97_Y0rncacHsY',
  authDomain: 'careai-d0274.firebaseapp.com',
  projectId: 'careai-d0274',
  storageBucket: 'careai-d0274.firebasestorage.app',
  messagingSenderId: '65669784085',
  appId: '1:65669784085:web:15022d89107be86438641c',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
} catch {
  auth = getAuth(app);
}

const authReadyPromise = Promise.resolve();

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, authReadyPromise, db, storage };
