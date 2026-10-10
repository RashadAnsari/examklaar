export interface SkillGroup {
  id: string;
  skill: string;
  level: string | null;
  title: string;
  description: string;
  examCount: number;
  completedCount: number;
}

/**
 * Cap on any audio the browser posts to us, both the recording stored for a
 * speaking answer and the WAV sent for local transcription. S3-compatible
 * object storage has no bucket-level size or content type limit, so the route
 * handlers are the only place either is enforced.
 */
export const MAX_AUDIO_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Cap on a whole exam submission. A speaking exam posts one recording per
 * question, so the per-file limit alone would still allow a 30 MB+ body.
 */
export const MAX_SUBMISSION_BYTES = 10 * 1024 * 1024; // 10 MB

/** Container the browser records speaking answers in (MediaRecorder default). */
export const RECORDING_MIME_TYPE = "audio/webm";

/** Rubric criteria the grader scores for each open skill, in rubric order. */
export const GRADING_CRITERIA = {
  writing: ["content", "vocabulary", "grammar", "spelling", "coherence"],
  speaking: ["content", "vocabulary", "grammar", "fluency", "coherence", "pronunciation"],
} as const;

export type CriterionKey = (typeof GRADING_CRITERIA)[keyof typeof GRADING_CRITERIA][number];

/** Every criterion is scored 0, 1 or 2. */
export const CRITERION_MAX = 2;

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  content: "Task content",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  spelling: "Spelling and punctuation",
  fluency: "Fluency",
  coherence: "Coherence",
  pronunciation: "Pronunciation",
};

/** AI grade of one writing or speaking question, as stored in exam_results.feedback. */
export interface QuestionFeedback {
  score: number;
  maxScore: number;
  /** Overall summary. Results graded before the per-criterion format only have this. */
  feedback: string;
  criteria?: { key: CriterionKey; score: number; comment: string }[];
  /** Each change from the student's answer to correctedAnswer. */
  corrections?: { original: string; corrected: string; reason: string }[];
  /** The student's answer with the fewest changes that satisfy the task. */
  correctedAnswer?: string;
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
