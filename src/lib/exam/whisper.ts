import { join } from "node:path";

/** The speech-to-text model that transcribes speaking answers. */
export const WHISPER_MODEL = "Xenova/whisper-base";

/** Where the server keeps the model files, written by scripts/download-whisper.ts at build time. */
export const WHISPER_MODEL_DIR = join(/*turbopackIgnore: true*/ process.cwd(), "models");
