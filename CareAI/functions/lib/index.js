"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiTriage = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
(0, app_1.initializeApp)();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
exports.openaiTriage = (0, https_1.onRequest)({ region: 'us-central1', cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }
    try {
        const { text } = req.body;
        const system = 'You are a careful medical triage assistant. You are NOT a doctor and do not diagnose. ' +
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
        const j = await r.json();
        const content = j?.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        const level = parsed.level === 'emergency' ? 'emergency' :
            parsed.level === 'gp' ? 'gp' : 'self-care';
        const dangerous = level === 'emergency';
        res.json({
            condition: String(parsed.condition || 'Unclear cause'),
            level,
            dangerous,
            advice: String(parsed.advice ||
                (dangerous
                    ? 'This could be serious. Seek emergency care immediately.'
                    : level === 'gp'
                        ? 'See a doctor within 24–48 hours or sooner if symptoms worsen.'
                        : 'Home care may be sufficient. Monitor symptoms and seek care if they worsen.')),
        });
    }
    catch (e) {
        res.status(500).json({ error: true, message: e?.message || 'error' });
    }
});
