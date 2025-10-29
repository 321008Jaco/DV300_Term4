import {getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, onSnapshot, deleteDoc, doc, Timestamp} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export type HistoryItem = {
  id: string;
  prompt: string;
  condition: string;
  level: 'urgent' | 'self-care' | 'see-doctor' | string;
  dangerous: boolean;
  advice?: string;
  createdAt: number;
};

export async function saveHistory(input: {
  prompt: string;
  condition: string;
  level: string;
  dangerous: boolean;
  advice?: string;
}) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  const db = getFirestore();
  await addDoc(collection(db, `users/${user.uid}/history`), {
    prompt: input.prompt,
    condition: input.condition,
    level: String(input.level),
    dangerous: Boolean(input.dangerous),
    advice: input.advice ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const db = getFirestore();
  const q = query(
    collection(db, `users/${user.uid}/history`),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data()));
}

export function subscribeHistory(cb: (items: HistoryItem[]) => void) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return () => {};

  const db = getFirestore();
  const q = query(
    collection(db, `users/${user.uid}/history`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => normalize(d.id, d.data()));
    cb(items);
  });
}

export async function deleteHistory(id: string) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;
  const db = getFirestore();
  await deleteDoc(doc(db, `users/${user.uid}/history/${id}`));
}

function normalize(id: string, data: any): HistoryItem {
  const ts = data?.createdAt as Timestamp | undefined;
  const createdAt =
    ts?.toDate?.() instanceof Date ? ts.toDate().getTime() : Date.now();

  return {
    id,
    prompt: String(data?.prompt ?? ''),
    condition: String(data?.condition ?? ''),
    level: String(data?.level ?? ''),
    dangerous: Boolean(data?.dangerous),
    advice: data?.advice ?? undefined,
    createdAt,
  };
}
