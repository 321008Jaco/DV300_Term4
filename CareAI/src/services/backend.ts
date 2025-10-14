export const API_BASE = 'https://us-central1-careai-d0274.cloudfunctions.net';

export async function postJSON(path: string, body: any, timeoutMs = 20000) {
  const url = `${API_BASE}/${path}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log('[postJSON] →', url, body);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(id);

    const text = await res.text().catch(() => '');
    console.log('[postJSON] ←', res.status, text);

    if (!res.ok) throw new Error(`HTTP ${res.status} ${text || ''}`.trim());
    return text ? JSON.parse(text) : {};
  } catch (err: any) {
    clearTimeout(id);
    console.log('[postJSON] error', err?.message || err);
    throw new Error(
      err?.name === 'AbortError'
        ? 'Request timed out. Check your internet and try again.'
        : err?.message || 'Network request failed'
    );
  }
}
