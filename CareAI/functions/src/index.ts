import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import type { Request, Response } from 'express';

initializeApp();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
type TriageLevel = 'self-care' | 'gp' | 'emergency';

export const openaiTriage = onRequest(
  { region: 'us-central1', cors: true },
  async (req: Request, res: Response) => {
    if (req.method !== 'POST') { res.status(405).end(); return; }
    try {
      const { text } = req.body as { text: string };

      const system =
        'You are a careful medical triage assistant. You are NOT a doctor and do not diagnose. ' +
        "Return JSON with keys: condition (string), level ('self-care'|'gp'|'emergency'), dangerous (boolean), advice (string). " +
        'Prefer safety (gp/emergency when unsure). Keep advice short.';

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: `Symptoms: ${text}` },
          ],
          temperature: 0.1,
          max_tokens: 250,
        }),
      });

      const j: any = await r.json();
      const content = j?.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      const level: TriageLevel =
        parsed.level === 'emergency' ? 'emergency' :
        parsed.level === 'gp' ? 'gp' : 'self-care';

      const dangerous = level === 'emergency';

      res.json({
        condition: String(parsed.condition || 'Unclear cause'),
        level,
        dangerous,
        advice: String(
          parsed.advice ||
            (dangerous
              ? 'This could be serious. Seek emergency care immediately.'
              : level === 'gp'
              ? 'See a doctor within 24–48 hours or sooner if symptoms worsen.'
              : 'Home care may be sufficient. Monitor symptoms and seek care if they worsen.')
        ),
      });
    } catch (e: any) {
      res.status(500).json({ error: true, message: e?.message || 'error' });
    }
  }
);
