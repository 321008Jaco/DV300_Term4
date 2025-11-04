export interface Env {
  OPENAI_API_KEY: string;
  ALLOWED_ORIGIN?: string;
}

type Msg = { role: "system" | "user" | "assistant"; content: string };

function resolveCors(origin: string | null | undefined, allowedCsv?: string) {
  const list = String(allowedCsv || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (list.length === 0) return origin || "*";
  if (origin && list.includes(origin)) return origin;
  return list[0];
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

async function readJsonSafe<T = any>(req: Request) {
  try {
    const txt = await req.text();
    if (!txt) return { ok: false as const, error: "Empty body" };
    return { ok: true as const, data: JSON.parse(txt) as T };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || "Invalid JSON" };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = resolveCors(request.headers.get("Origin"), env.ALLOWED_ORIGIN);
    const baseHeaders = corsHeaders(origin);

    console.log("PATH:", url.pathname, "METHOD:", request.method);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: baseHeaders });
    }

    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...baseHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/transcribe") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Use POST" }), {
          status: 405,
          headers: { ...baseHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const form = await request.formData();
        const file = form.get("file");
        const model = (form.get("model") as string) || "whisper-1";

        if (!(file instanceof Blob)) {
          return new Response(JSON.stringify({ error: "Missing audio file (field 'file')" }), {
            status: 400,
            headers: { ...baseHeaders, "Content-Type": "application/json" },
          });
        }

        const upstream = new FormData();
        upstream.append("file", file, "audio.m4a");
        upstream.append("model", model);

        const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
          body: upstream,
        });

        const txt = await r.text();
        return new Response(txt || "{}", {
          status: r.status,
          headers: { ...baseHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "Transcription error" }), {
          status: 500,
          headers: { ...baseHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST" }), {
        status: 405,
        headers: { ...baseHeaders, "Content-Type": "application/json" },
      });
    }

    // Body for chat proxy
    const parsed = await readJsonSafe<{ model?: string; temperature?: number; messages?: Msg[] }>(request);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { ...baseHeaders, "Content-Type": "application/json" },
      });
    }

    const { model, temperature, messages } = parsed.data || {};
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...baseHeaders, "Content-Type": "application/json" },
      });
    }

    const primaryModel = model || "o4-mini";

    const payload: Record<string, any> = { model: primaryModel, messages };
    if (typeof temperature === "number") payload.temperature = temperature;
    if (payload.model === "o4-mini" && "temperature" in payload) delete payload.temperature;

    console.log("model:", payload.model, "hasTemp:", "temperature" in payload);

    async function callOpenAI(body: any) {
      return fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    try {
      let r = await callOpenAI(payload);
      let txt = await r.text();

      if (!r.ok) {
        try {
          const j = txt ? JSON.parse(txt) : null;
          const code = j?.error?.code || j?.error;
          if ((r.status === 404 || r.status === 400) && code === "model_not_found" && primaryModel !== "o4-mini") {
            const fallbackPayload = { ...payload, model: "o4-mini" };
            if ("temperature" in fallbackPayload) delete (fallbackPayload as any).temperature;
            r = await callOpenAI(fallbackPayload);
            txt = await r.text();
          }
        } catch {

        }
      }

      return new Response(txt || "{}", {
        status: r.status,
        headers: { ...baseHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e?.message || "Upstream error" }), {
        status: 500,
        headers: { ...baseHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
