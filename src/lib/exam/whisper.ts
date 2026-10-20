/** The speech-to-text model that transcribes speaking answers, in the browser. */
export const WHISPER_MODEL = "Xenova/whisper-base";

/** The model commit the browser loads, pinned so a new upload to the model repo cannot change it. */
export const WHISPER_REVISION = "64da57285918e20ea79ea5c88eed7197933abaa8";

/** Sample rate Whisper expects its audio in. */
export const WHISPER_SAMPLE_RATE = 16000;
