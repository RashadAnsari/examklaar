"use client";

import { useCallback, useState } from "react";

import { WHISPER_SAMPLE_RATE } from "@/lib/exam/whisper";
import type { WhisperRequest, WhisperResponse } from "./whisper.worker";

export type TranscriberStatus = "idle" | "transcribing" | "done" | "error";

export interface TranscriberState {
  status: TranscriberStatus;
  transcript: string;
  error: string | null;
  /** Percentage of the speech model downloaded so far, while the first recording waits on it. */
  modelProgress: number | null;
  transcribe: (blob: Blob, language?: string) => void;
}

// One worker for the whole page, so the model loads once however many questions are recorded
let worker: Worker | null = null;
let nextId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./whisper.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

function runWhisper(
  audio: Float32Array,
  language: string,
  onProgress: (progress: number) => void
): Promise<string> {
  const id = ++nextId;
  const w = getWorker();
  return new Promise((resolve, reject) => {
    function onMessage(event: MessageEvent<WhisperResponse>) {
      const message = event.data;
      if (message.id !== id) {
        return;
      }
      if (message.type === "loading") {
        onProgress(message.progress);
        return;
      }
      w.removeEventListener("message", onMessage);
      if (message.type === "done") {
        resolve(message.text);
      } else {
        reject(new Error(message.error));
      }
    }
    w.addEventListener("message", onMessage);
    w.postMessage({ id, audio, language } satisfies WhisperRequest);
  });
}

// Decode any audio blob into 16 kHz mono samples using the Web Audio API (no ffmpeg needed)
async function decodeAudio(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    await audioCtx.close();
  }

  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(audioBuffer.duration * WHISPER_SAMPLE_RATE),
    WHISPER_SAMPLE_RATE
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  const resampled = await offlineCtx.startRendering();

  return resampled.getChannelData(0);
}

export function useWhisperTranscriber(): TranscriberState {
  const [status, setStatus] = useState<TranscriberStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState<number | null>(null);

  const transcribe = useCallback(async (blob: Blob, language = "nl") => {
    setStatus("transcribing");
    setTranscript("");
    setError(null);

    try {
      const audio = await decodeAudio(blob);
      const text = await runWhisper(audio, language, setModelProgress);
      setModelProgress(null);
      setTranscript(text);
      setStatus("done");
    } catch (err) {
      console.error("[Whisper]", err);
      setModelProgress(null);
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, []);

  return { status, transcript, error, modelProgress, transcribe };
}
