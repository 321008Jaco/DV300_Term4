export type Msg = { role: "system" | "user" | "assistant"; content: string };

const ENDPOINT = "https://careai-proxy.careai-231008.workers.dev/";
const MODEL = "o4-mini";

export const system: Msg = {
  role: "system",
  content: [
    "You are CareAI. Be cautious and DO NOT provide a medical diagnosis.",
    'Return ONLY JSON with this shape: {"condition":"<short>","level":"self-care|gp|emergency","dangerous":true|false,"advice":["tip1","tip2"]}',
    "No extra text. If info is missing, keep wording neutral. If red flags exist, set dangerous:true and include urgent care in advice."
  ].join(" ")
};

export async function careAiChat(messages: Msg[]) {
  const url = `${ENDPOINT}?t=${Date.now()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ model: MODEL, messages }),
    });
  } catch (e: any) {
    console.log("[careAiChat] network error:", e?.message || e);
    throw new Error(`Network error reaching Worker: ${e?.message || e}`);
  }

  const raw = await res.text();
  console.log("[careAiChat] status:", res.status, "body:", raw.slice(0, 300));

  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(`Worker returned non-JSON: ${raw.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg =
      data?.error?.message || data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(String(msg));
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`Worker OK but empty content. Payload: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return content;
}
