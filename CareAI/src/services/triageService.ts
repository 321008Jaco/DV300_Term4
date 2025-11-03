import { careAiChat, system, type Msg } from "./careAiService";

export type TriageAnswer = {
  condition: string;
  level: "mild" | "moderate" | "severe";
  dangerous: boolean;
  advice: string[];
};

function parseJsonFromText(text: string): any {
  const cleaned = String(text ?? "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function normalizeToTriage(obj: any, fallbackText?: string): TriageAnswer {
  if (!obj || typeof obj !== "object") {
    return {
      condition: "General advice",
      level: "moderate",
      dangerous: false,
      advice: [fallbackText ? String(fallbackText) : "Please try again with more detail."],
    };
  }

  const lvlRaw = String(obj.level ?? "moderate").toLowerCase();
  const level: TriageAnswer["level"] =
    lvlRaw === "mild" || lvlRaw === "severe" ? (lvlRaw as TriageAnswer["level"]) : "moderate";

  let adviceArr: string[] = [];
  if (Array.isArray(obj.advice)) {
    adviceArr = obj.advice.map((x: any) => String(x));
  } else if (typeof obj.advice === "string") {
    adviceArr = [obj.advice];
  } else if (fallbackText) {
    adviceArr = [String(fallbackText)];
  } else {
    adviceArr = ["No specific advice available."];
  }

  return {
    condition: String(obj.condition ?? "General"),
    level,
    dangerous: Boolean(obj.dangerous),
    advice: adviceArr,
  };
}

export async function triageText(prompt: string): Promise<TriageAnswer> {
  const messages: Msg[] = [
    system, 
    { role: "user", content: prompt },
  ];

  console.log("[triage] calling careAiChat…");
  const raw = await careAiChat(messages);
  console.log("[triage] raw response:", raw);

  const parsed = parseJsonFromText(raw);
  const answer = normalizeToTriage(parsed, raw);
  return answer;
}
