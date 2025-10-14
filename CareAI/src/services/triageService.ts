import { postJSON } from './backend';

export type TriageLevel = 'self-care' | 'gp' | 'emergency';
export type TriageAnswer = { condition: string; level: TriageLevel; dangerous: boolean; advice: string };

export async function triageText(text: string): Promise<TriageAnswer> {
  const res = await postJSON('openaiTriage', { text });
  return { condition: res.condition, level: res.level, dangerous: res.dangerous, advice: res.advice };
}
