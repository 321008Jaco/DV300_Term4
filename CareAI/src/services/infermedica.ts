export type TriageInput = {
age: number;
sex: 'male' | 'female' | 'other';
complaint: string;
};


export type TriageResult = {
level: 'self-care' | 'gp' | 'emergency';
advice: string;
redFlags?: string[];
};


export async function triage(input: TriageInput): Promise<TriageResult> {


    // Dummy content. NB!!! REPLACE WITH REAL API
const text = `${input.complaint}`.toLowerCase();
if (/(chest pain|shortness of breath|bleeding|faint)/.test(text)) {
return {
level: 'emergency',
advice: 'Seek emergency care immediately or call local emergency services.',
redFlags: ['Severe symptom keywords detected'],
};
}
if (/(fever|cough|sore throat|headache)/.test(text)) {
return {
level: 'gp',
advice: 'See a GP within 24–48 hours. Monitor symptoms and rest.',
};
}
return {
level: 'self-care',
advice: 'Home care is likely sufficient. Hydrate, rest, and re-check if symptoms worsen.',
};
}