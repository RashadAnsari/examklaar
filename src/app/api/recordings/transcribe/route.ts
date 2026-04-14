import { NextRequest, NextResponse } from "next/server";

// Singleton pipeline — loaded once per server process, reused across requests
let transcriber: ((audio: Float32Array, opts: object) => Promise<{ text: string }>) | null = null;

async function getTranscriber() {
  if (!transcriber) {
    const { pipeline, env } = await import("@xenova/transformers");
    env.allowLocalModels = false;
    transcriber = (await pipeline("automatic-speech-recognition", "Xenova/whisper-base")) as (
      audio: Float32Array,
      opts: object
    ) => Promise<{ text: string }>;
  }
  return transcriber;
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
    offset += 8 + chunkSize;
  }
  throw new Error("Invalid WAV: data chunk not found");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const language = (formData.get("language") as string) ?? "nl";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
    console.error("[/api/recordings/transcribe]", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
