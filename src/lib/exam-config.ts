export interface SkillGroup {
  id: string;
  skill: string;
  level: string | null;
  title: string;
  description: string;
  timeLimitMinutes: number;
  examCount: number;
  locked: boolean;
}

export const SKILL_TITLES: Record<string, string> = {
  knm: "KNM (Knowledge)",
  reading: "Lezen (Reading)",
  listening: "Luisteren (Listening)",
  writing: "Schrijven (Writing)",
  speaking: "Spreken (Speaking)",
};

export const SKILL_DESCRIPTIONS: Record<string, string> = {
  knm: "Dutch society, culture, and laws.",
  reading: "Reading comprehension with Dutch texts.",
  listening: "Dutch audio clips and questions.",
  writing: "Write in Dutch and get AI-powered feedback.",
  speaking: "Practice speaking and get pronunciation feedback.",
};

export const LOCKED_SKILLS = new Set(["writing", "speaking"]);
