// src/services/voiceService.ts
import { Audio } from "expo-av";

const ENDPOINT = "https://careai-proxy.careai-231008.workers.dev";

let recording: Audio.Recording | null = null;

export async function startRecording() {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== "granted") throw new Error("Microphone permission denied");

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
}

export async function stopAndTranscribe(): Promise<string> {
  if (!recording) throw new Error("Not recording");
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;
  if (!uri) throw new Error("No recording found");

  const form = new FormData();
  form.append("file", {
    uri,
    name: "audio.m4a",
    type: "audio/m4a",
  } as any);

  const r = await fetch(`${ENDPOINT}/transcribe`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: form,
  });

  const rawText = await r.text();
  console.log("[transcribe] http", r.status, "len", rawText?.length, "head:", rawText?.slice(0, 80));

  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    console.log("[transcribe] non-JSON response:", rawText?.slice(0, 200));
    throw new Error("Transcription failed: bad server response");
  }

  if (!r.ok) {
    const msg = data?.error?.message || data?.error || `HTTP ${r.status}`;
    throw new Error(String(msg));
  }

  const text = data?.text;
  if (!text || typeof text !== "string") {
    throw new Error("Transcription returned no text");
  }
  return text;
}
