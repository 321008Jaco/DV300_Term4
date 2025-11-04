import { Audio } from "expo-av";

const ENDPOINT = "https://careai-proxy.careai-231008.workers.dev";

let recording: Audio.Recording | null = null;
let started = false;

export function isRecording() {
  return started;
}

export async function startRecording() {
  const perm = await Audio.requestPermissionsAsync();
  if (perm.status !== "granted") throw new Error("Microphone permission denied");

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  started = true;
}

export async function cancelRecording() {
  if (!started || !recording) {

    return;
  }
  try {
    await recording.stopAndUnloadAsync();
  } catch {

  } finally {
    started = false;
    recording = null;
  }
}

export async function stopAndTranscribe(): Promise<string> {
  if (!started || !recording) throw new Error("Not recording");

  try {
    await recording.stopAndUnloadAsync();
  } finally {
    started = false;
  }

  const uri = recording.getURI();
  recording = null;
  if (!uri) throw new Error("No recording found");

  const form = new FormData();
  form.append("file", {
    uri,
    name: "audio.m4a",
    type: "audio/m4a",
  } as any);
  form.append("model", "gpt-4o-mini-transcribe");

  const r = await fetch(`${ENDPOINT}/transcribe`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });

  const raw = await r.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    console.log("[transcribe] non-JSON:", raw?.slice(0, 200));
    throw new Error("Transcription failed: bad server response");
  }

  if (!r.ok) {
    const msg = data?.error?.message || data?.error || `HTTP ${r.status}`;
    throw new Error(String(msg));
  }

  const text = data?.text;
  if (!text || typeof text !== "string") throw new Error("Transcription returned no text");
  return text;
}
