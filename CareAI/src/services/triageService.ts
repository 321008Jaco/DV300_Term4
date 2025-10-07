export type TriageLevel = 'self-care' | 'gp' | 'emergency';

export type TriageAnswer = {
  condition: string;
  level: TriageLevel;
  dangerous: boolean;
  advice: string;
};

export async function triageText(text: string): Promise<TriageAnswer> {
  const t = text.toLowerCase();

  if (/(chest pain|shortness of breath|severe bleeding|stroke|one side weak|fainting|confusion|seizure)/.test(t)) {
    return {
      condition: 'Possible cardiac/neurological emergency',
      level: 'emergency',
      dangerous: true,
      advice: 'This could be serious. Seek emergency care immediately or call local emergency services.',
    };
  }

  if (/(fever).*(cough)|cough|sore throat|flu|body aches/.test(t)) {
    return {
      condition: 'Flu-like illness or upper respiratory infection',
      level: 'gp',
      dangerous: false,
      advice: 'Rest, fluids, and analgesics may help. Arrange a GP visit within 24–48 hours or sooner if symptoms worsen.',
    };
  }

  if (/(vomit|diarrhea|stomach bug|food poisoning)/.test(t)) {
    return {
      condition: 'Gastroenteritis or food-related illness',
      level: 'gp',
      dangerous: false,
      advice: 'Hydrate and monitor. See a GP if unable to keep fluids, blood in stool, or symptoms >48 hours.',
    };
  }

  if (/(severe headache|worst headache|stiff neck|vision loss)/.test(t)) {
    return {
      condition: 'Severe headache with red flags',
      level: 'emergency',
      dangerous: true,
      advice: 'Potentially serious. Seek urgent medical care now.',
    };
  }

  if (/(rash|itchy skin|hives)/.test(t)) {
    return {
      condition: 'Dermatitis or allergic reaction',
      level: 'gp',
      dangerous: false,
      advice: 'Consider antihistamines if appropriate and see a GP if spreading, painful, or with breathing issues.',
    };
  }

  if (/(mild headache|tension|stress headache)/.test(t)) {
    return {
      condition: 'Tension-type headache',
      level: 'self-care',
      dangerous: false,
      advice: 'Hydration, rest, and OTC analgesics may help. Seek care if it persists or worsens.',
    };
  }

  return {
    condition: 'Unclear cause',
    level: 'gp',
    dangerous: false,
    advice: 'Monitor symptoms and arrange a GP visit for assessment. Seek urgent care if red flags develop.',
  };
}
