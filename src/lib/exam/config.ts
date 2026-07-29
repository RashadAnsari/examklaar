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
