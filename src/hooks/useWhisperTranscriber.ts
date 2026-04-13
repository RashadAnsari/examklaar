"use client";

import { useCallback, useState } from "react";

export type TranscriberStatus = "idle" | "transcribing" | "done" | "error";

export interface TranscriberState {
  status: TranscriberStatus;
  transcript: string;
  error: string | null;
  transcribe: (blob: Blob, language?: string) => void;
}

// Decode any audio blob → 16 kHz mono WAV using the Web Audio API (no ffmpeg needed)
async function blobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    await audioCtx.close();
  }

  const targetSampleRate = 16000;
  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(audioBuffer.duration * targetSampleRate),
    targetSampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  const resampled = await offlineCtx.startRendering();

  return encodeWav(resampled.getChannelData(0), targetSampleRate);
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const int16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const wavBuffer = new ArrayBuffer(44 + int16.byteLength);
  const view = new DataView(wavBuffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + int16.byteLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, int16.byteLength, true);
  new Int16Array(wavBuffer, 44).set(int16);

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export function useWhisperTranscriber(): TranscriberState {
  const [status, setStatus] = useState<TranscriberStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (blob: Blob, language = "nl") => {
    setStatus("transcribing");
    setTranscript("");
    setError(null);

    try {
      const wav = await blobToWav(blob);

      const formData = new FormData();
      formData.append("file", wav, "audio.wav");
      formData.append("language", language);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Transcription failed");
      }

      setTranscript(data.transcript);
      setStatus("done");
    } catch (err) {
      console.error("[Whisper]", err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, []);

  return { status, transcript, error, transcribe };
}
