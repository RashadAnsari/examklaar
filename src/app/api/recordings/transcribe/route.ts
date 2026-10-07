import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { MAX_AUDIO_UPLOAD_BYTES } from "@/lib/exam/config";
import { WHISPER_MODEL, WHISPER_MODEL_DIR } from "@/lib/exam/whisper";

type Transcriber = (audio: Float32Array, opts: object) => Promise<{ text: string }>;

// Singleton pipeline — loaded once per server process, reused across requests
let initPromise: Promise<Transcriber> | null = null;

// Built from its parts rather than with pipeline(): pipeline() falls back to a CTC model when the
// Whisper model fails to load and reports only "Unsupported model type: whisper", hiding the cause.
async function loadTranscriber(): Promise<Transcriber> {
  const {
    env,
    AutoTokenizer,
    AutoProcessor,
    AutoModelForSpeechSeq2Seq,
    AutomaticSpeechRecognitionPipeline,
  } = await import("@xenova/transformers");
  // The image ships the model in WHISPER_MODEL_DIR; without it (local dev) it is downloaded
  env.localModelPath = WHISPER_MODEL_DIR;
  const [tokenizer, processor, model] = await Promise.all([
    AutoTokenizer.from_pretrained(WHISPER_MODEL),
    AutoProcessor.from_pretrained(WHISPER_MODEL),
    AutoModelForSpeechSeq2Seq.from_pretrained(WHISPER_MODEL),
  ]);
  const asr = new AutomaticSpeechRecognitionPipeline({
    task: "automatic-speech-recognition",
    model,
    tokenizer,
    processor,
  });
  return (audio, opts) => asr(audio, opts) as Promise<{ text: string }>;
}

function getTranscriber(): Promise<Transcriber> {
  if (!initPromise) {
    // Drop a failed load so the next request retries instead of failing until a restart
    initPromise = loadTranscriber().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

// Parse a WAV buffer (16-bit PCM) → Float32Array. Scans for the 'data' chunk dynamically.
function decodeWav(buffer: Buffer): Float32Array {
  let offset = 12; // skip RIFF/WAVE header
  while (offset < buffer.length - 8) {
    const chunkId = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    if (chunkId === "data") {
      const dataStart = offset + 8;
      const numSamples = chunkSize / 2; // Int16 = 2 bytes per sample
      const float32 = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        float32[i] = buffer.readInt16LE(dataStart + i * 2) / 32768;
      }
      return float32;
    }
    // RIFF chunks are WORD-aligned: skip the padding byte when chunkSize is odd
    offset += 8 + chunkSize + (chunkSize & 1);
  }
  throw new Error("Invalid WAV: data chunk not found");
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      console.warn("[transcribe] No file provided in request — user=%s", user.id);
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "audio/wav" && file.type !== "audio/wave") {
      console.warn("[transcribe] Invalid file type — user=%s", user.id);
      return NextResponse.json(
        { error: "Invalid file type. Only WAV audio is accepted." },
        { status: 415 }
      );
    }

    if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
      console.warn("[transcribe] File too large — user=%s", user.id);
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const language = (formData.get("language") as string) ?? "nl";
    if (language !== "nl") {
      console.warn("[transcribe] Unsupported language — user=%s", user.id);
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const audio = decodeWav(buffer);
    const pipe = await getTranscriber();
    const result = await pipe(audio, {
      language,
      task: "transcribe",
      chunk_length_s: 30,
      stride_length_s: 5,
      sampling_rate: 16000,
    });

    return NextResponse.json({ transcript: result.text.trim() });
  } catch (err) {
    console.error("[transcribe] Failed to transcribe audio — user=%s error=%o", user.id, err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
