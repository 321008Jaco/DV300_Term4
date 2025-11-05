import AsyncStorage from '@react-native-async-storage/async-storage';

function key(uid: string) {
  return `onboarding_seen_${uid}`;
}

export async function getOnboardingSeen(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const v = await AsyncStorage.getItem(key(uid));
    return v === '1';
  } catch {
    return false;
  }
}

export async function setOnboardingSeen(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await AsyncStorage.setItem(key(uid), '1');
  } catch {}
}

export async function resetOnboarding(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await AsyncStorage.removeItem(key(uid));
  } catch {}
}
