import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserDoc } from '../models/User';

export async function createUserProfile(uid: string, email: string, displayName: string | null, photoURL: string | null) {
  const ref = doc(db, 'users', uid);
  const data: UserDoc = {
    email,
    displayName,
    photoURL,
    role: 'user',
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    lastLoginAt: serverTimestamp() as any,
  };
  await setDoc(ref, data, { merge: true });
}

export async function touchLastLogin(uid: string) {
  await updateDoc(doc(db, 'users', uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function updateUserProfile(uid: string, partial: Partial<UserDoc>) {
  await updateDoc(doc(db, 'users', uid), {
    ...partial,
    updatedAt: serverTimestamp(),
  });
}
