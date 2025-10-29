import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { UserDoc } from '../models/User';

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string | null,
  photoURL: string | null,
  username?: string | null
) {
  const ref = doc(db, 'users', uid);
  const data: any = {
    email,
    displayName,
    username: username ?? displayName ?? null,
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

function prettifyFromEmail(email?: string | null) {
  const local = (email ?? '').split('@')[0];
  const s = local.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
  return s
    ? s
        .split(' ')
        .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ''))
        .join(' ')
    : 'there';
}

export async function getWelcomeName(): Promise<string> {
  const auth = getAuth();
  const u = auth.currentUser;
  if (!u) return 'there';
  const prof = await getUserProfile(u.uid);
  const profUsername = (prof as any)?.username;
  if (profUsername) return profUsername;
  if (prof?.displayName) return String(prof.displayName);
  if (u.displayName) return u.displayName;
  return prettifyFromEmail(u.email);
}

export async function setUsername(uid: string, username: string) {
  
  await updateUserProfile(uid, { username } as any);
}