export interface SkillGroup {
  id: string;
  skill: string;
  level: string | null;
  title: string;
  description: string;
  examCount: number;
  completedCount: number;
}

export const SKILL_TITLES: Record<string, string> = {
  knm: "KNM (Knowledge)",
  reading: "Lezen (Reading)",
  listening: "Luisteren (Listening)",
  writing: "Schrijven (Writing)",
  speaking: "Spreken (Speaking)",
};

export const SKILL_DESCRIPTIONS: Record<string, string> = {
  knm: "Test your knowledge of Dutch society, history, culture, and civic rules.",
  reading: "Read Dutch texts and answer comprehension questions under timed conditions.",
  listening: "Listen to Dutch audio fragments and answer questions on what you heard.",
  writing: "Write short Dutch texts and receive instant AI feedback on grammar and vocabulary.",
  speaking: "Record your spoken answers and get AI feedback on fluency and clarity.",
};
