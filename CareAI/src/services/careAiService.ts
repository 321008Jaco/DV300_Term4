export type Msg = { role: "system" | "user" | "assistant"; content: string };

const ENDPOINT = "https://careai-proxy.careai-231008.workers.dev";
const MODEL = "o4-mini";

export const system: Msg = {
  role: "system",
  content: [
    "You are CareAI. Be cautious and DO NOT provide a medical diagnosis.",
    "Return ONLY JSON with this shape:",
    '{ "condition": "<short label>", "level": "<mild|moderate|severe>", "dangerous": <true|false>, "advice": ["<tip1>", "<tip2>"] }',
    "No extra text. If info is missing (age, duration, severity, temperature, meds, history, pregnancy), keep wording neutral.",
    "If red flags exist, set dangerous:true and include seeking urgent care in advice."
  ].join(" ")
};

export async function careAiChat(messages: Msg[]) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages
    }),
  });

  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Bad JSON from API: ${text.slice(0, 300)}`);
  }

  if (!res.ok) {
    const msg =
      data?.error?.message || data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(String(msg));
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty response from model");
  }
  return content;
}
