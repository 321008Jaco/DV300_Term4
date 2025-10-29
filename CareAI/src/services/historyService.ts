import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { TriageAnswer } from './triageService';

export async function saveHistory(prompt: string, answer: TriageAnswer) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('No user signed in');

  try {
    const colRef = collection(db, 'users', uid, 'history');
    const docRef = await addDoc(colRef, {
      prompt,
      answer,
      condition: answer.condition,
      level: answer.level,
      dangerous: answer.dangerous,
      advice: answer.advice,
      createdAt: serverTimestamp(),
    });
    console.log('[history] saved', docRef.id);
    return docRef.id;
  } catch (err: any) {
    console.error('[history] save failed', err?.code, err?.message);
    throw err;
  }
}