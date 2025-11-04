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

async function readJsonSafe<T = any>(
  req: Request
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const txt = await req.text();
    if (!txt) return { ok: false, error: "Empty body" };
    return { ok: true, data: JSON.parse(txt) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = resolveCors(request.headers.get("Origin"), env.ALLOWED_ORIGIN);
    const baseHeaders = corsHeaders(origin);

    console.log("PATH:", url.pathname, "METHOD:", request.method, "UA:", request.headers.get("User-Agent") || "-");

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
        const fileEntry = form.get("file");
        const requested = (form.get("model") as string) || "gpt-4o-mini-transcribe";

        if (!(fileEntry instanceof Blob)) {
          return new Response(JSON.stringify({ error: "Missing audio file (field 'file')" }), {
            status: 400,
            headers: { ...baseHeaders, "Content-Type": "application/json" },
          });
        }

        const audioBlob = fileEntry as Blob;

        async function callTranscribe(model: string) {
          const upstream = new FormData();
          upstream.append("file", audioBlob, "audio.m4a");
          upstream.append("model", model);
          return fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.OPENAI_API_KEY}`,
              Accept: "application/json",
            },
            body: upstream,
          });
        }

        let r = await callTranscribe(requested);
        let txt = await r.text();
        let ct = r.headers.get("content-type") || "";

        if (!r.ok) {
          try {
            const j = txt ? JSON.parse(txt) : null;
            const code = j?.error?.code || j?.error;
            if ((r.status === 404 || r.status === 400 || r.status === 403) &&
                code === "model_not_found" &&
                requested !== "gpt-4o-mini-transcribe") {
              r = await callTranscribe("gpt-4o-mini-transcribe");
              txt = await r.text();
              ct = r.headers.get("content-type") || "";
            }
          } catch {

          }
        }

        if (!ct.includes("application/json")) {
          return new Response(
            JSON.stringify({
              error: "Upstream non-JSON response",
              upstream_status: r.status,
              raw: txt?.slice(0, 200) || "",
            }),
            { status: 502, headers: { ...baseHeaders, "Content-Type": "application/json" } }
          );
        }

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

    if (payload.model === "o4-mini" && "temperature" in payload) {
      delete payload.temperature;
    }

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
          if ((r.status === 404 || r.status === 400) &&
              code === "model_not_found" &&
              primaryModel !== "o4-mini") {
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
      const message = e?.message || "Upstream error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...baseHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
