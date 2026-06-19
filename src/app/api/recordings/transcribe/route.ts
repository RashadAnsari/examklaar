import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Singleton pipeline — loaded once per server process, reused across requests
let initPromise: Promise<(audio: Float32Array, opts: object) => Promise<{ text: string }>> | null =
  null;

async function getTranscriber() {
  if (!initPromise) {
    initPromise = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      return pipeline("automatic-speech-recognition", "Xenova/whisper-base") as Promise<
        (audio: Float32Array, opts: object) => Promise<{ text: string }>
      >;
    })();
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
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_BYTES) {
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
