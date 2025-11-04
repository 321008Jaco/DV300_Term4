import { careAiChat, type Msg } from "./careAiService";

export type TriageAnswer = {
  condition: string;
  level: "urgent" | "see-doctor" | "self-care" | string;
  dangerous: boolean;
  advice: string[];
};

const SYSTEM: Msg = {
  role: "system",
  content:
    "You are CareAI, a cautious health assistant. Do NOT provide a diagnosis. " +
    "Return ONLY valid JSON like: " +
    `{"condition":"Likely cause (short)","level":"urgent|see-doctor|self-care","dangerous":true|false,"advice":["short action 1","short action 2","short action 3"]} ` +
    "Rules: (1) advice must be an array of 3-6 short, plain sentences; (2) no Markdown; (3) no extra keys."
};

function coerceString(v: any): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function ensurePeriod(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function normalizeAdvice(input: any): string[] {
  if (Array.isArray(input)) {
    const out = input
      .map(coerceString)
      .map(s => s.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .map(ensurePeriod);
    return out.length ? out : ["Consider basic self-care measures and monitor your symptoms."];
  }

  const text = coerceString(input).replace(/\s+/g, " ").trim();
  if (!text) return ["Consider basic self-care measures and monitor your symptoms."];

  let parts = text.split(/(?<=[.!?])\s+/g).filter(Boolean);

  if (parts.length <= 1) {
    parts = text.split(
      /\s+(?=(Seek|Schedule|Document|Avoid|Contact|Call|Go|Visit|Use|Take|Monitor|Keep|Hydrate|Apply|Rest|Watch|Return|Recheck|Consider|Arrange|Follow)\b)/g
    );
  }

  const cleaned = parts
    .map(s => s.trim())
    .filter(Boolean)
    .map(ensurePeriod)
    .slice(0, 6);

  return cleaned.length ? cleaned : ["Consider basic self-care measures and monitor your symptoms."];
}

export async function triageText(userText: string): Promise<TriageAnswer> {
  const messages: Msg[] = [
    SYSTEM,
    { role: "user", content: `Symptoms: ${userText}\nReturn JSON only.` }
  ];

  const raw: unknown = await careAiChat(messages);

  let openai: any = null;
  if (typeof raw === "string") {
    try {
      openai = JSON.parse(raw);
    } catch {
      openai = { choices: [{ message: { content: raw } }] };
    }
  } else {
    openai = raw;
  }

  const content =
    openai?.choices?.[0]?.message?.content ??
    openai?.choices?.[0]?.message ??
    openai?.choices?.[0]?.text ??
    "";

  let parsed: any = {};
  try {
    parsed = typeof content === "string" ? JSON.parse(content) : content || {};
  } catch {
    parsed = {};
  }

  const condition = coerceString(parsed?.condition || "Unknown");
  const level = coerceString(parsed?.level || "self-care") as TriageAnswer["level"];
  const dangerous = Boolean(parsed?.dangerous);
  let advice = normalizeAdvice(parsed?.advice);

  if ((!advice || advice.length === 0) && parsed?.recommendation) {
    advice = normalizeAdvice(parsed.recommendation);
  }

  return { condition, level, dangerous, advice };
}