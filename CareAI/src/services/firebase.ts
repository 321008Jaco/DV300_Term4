// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkLx2MMKhtdWlGuTt3Dq97_Y0rncacHsY",
  authDomain: "careai-d0274.firebaseapp.com",
  projectId: "careai-d0274",
  storageBucket: "careai-d0274.firebasestorage.app",
  messagingSenderId: "65669784085",
  appId: "1:65669784085:web:15022d89107be86438641c"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };