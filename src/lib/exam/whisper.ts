import { join } from "node:path";

/** The speech-to-text model that transcribes speaking answers. */
export const WHISPER_MODEL = "Xenova/whisper-base";

/** Where the image keeps the model files, written by scripts/download-whisper.ts. */
export const WHISPER_MODEL_DIR = join(process.cwd(), "models");
