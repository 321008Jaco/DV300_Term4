import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export type HistoryItem = {
  id: string;
  prompt: string;
  condition: string;
  level: "mild" | "moderate" | "severe" | "urgent" | "self-care" | "see-doctor" | string;
  dangerous: boolean;
  advice?: string[];
  createdAt: number;
};

export type HistoryInput = {
  prompt: string;
  condition: string;
  level: string; 
  dangerous: boolean;
  advice?: string[]; 
};

export async function saveHistory(input: HistoryInput) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const db = getFirestore();

  const advice =
    Array.isArray(input.advice)
      ? input.advice.map(String)
      : typeof input.advice === "string"
        ? [input.advice]
        : null;

  await addDoc(collection(db, `users/${user.uid}/history`), {
    prompt: String(input.prompt),
    condition: String(input.condition),
    level: String(input.level),
    dangerous: Boolean(input.dangerous),
    advice,
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
    orderBy("createdAt", "desc")
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
    orderBy("createdAt", "desc")
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

  let adviceArr: string[] | undefined = undefined;
  if (Array.isArray(data?.advice)) {
    adviceArr = data.advice.map((x: any) => String(x));
  } else if (typeof data?.advice === "string" && data.advice.trim().length) {
    adviceArr = [data.advice];
  }

  return {
    id,
    prompt: String(data?.prompt ?? ""),
    condition: String(data?.condition ?? ""),
    level: String(data?.level ?? ""),
    dangerous: Boolean(data?.dangerous),
    advice: adviceArr,
    createdAt,
  };
}
