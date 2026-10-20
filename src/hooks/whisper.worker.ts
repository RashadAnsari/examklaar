// Runs Whisper off the main thread, so the page stays responsive while a recording is transcribed.
// The model files come from Hugging Face and the ONNX runtime from jsDelivr (see next.config.ts);
// the browser caches both, so only the first transcription downloads them.
import {
  env,
  pipeline,
  type AutomaticSpeechRecognitionPipeline,
  type ProgressInfo,
} from "@huggingface/transformers";
import { WHISPER_MODEL, WHISPER_REVISION } from "@/lib/exam/whisper";

export type WhisperRequest = { id: number; audio: Float32Array; language: string };

export type WhisperResponse =
  | { id: number; type: "loading"; progress: number }
  | { id: number; type: "done"; text: string }
  | { id: number; type: "error"; error: string };

// Without this, the library first looks for the model on our own origin under /models/
env.allowLocalModels = false;
// Load the ONNX runtime from the jsDelivr path our CSP allows (next.config.ts). The plain build is
// half the size of the default one, which only WebGPU needs. With the WASM cache on, the runtime is
// imported from a blob: URL, which the CSP does not allow.
env.backends.onnx.wasm!.wasmPaths = {
  mjs: `${process.env.ORT_WASM_BASE}ort-wasm-simd-threaded.mjs`,
  wasm: `${process.env.ORT_WASM_BASE}ort-wasm-simd-threaded.wasm`,
};
env.useWasmCache = false;

let loading: Promise<AutomaticSpeechRecognitionPipeline> | null = null;
let currentId = 0;

function post(message: WhisperResponse) {
  self.postMessage(message);
}

function getTranscriber(): Promise<AutomaticSpeechRecognitionPipeline> {
  if (!loading) {
    loading = (
      pipeline("automatic-speech-recognition", WHISPER_MODEL, {
        revision: WHISPER_REVISION,
        device: "wasm",
        dtype: "q8",
        // The runtime's full graph optimisation breaks on this model's quantized decoder ("Missing
        // required scale" while creating the session); basic optimisation loads and runs it.
        session_options: { graphOptimizationLevel: "basic" },
        progress_callback: (info: ProgressInfo) => {
          if (info.status === "progress_total") {
            post({ id: currentId, type: "loading", progress: Math.round(info.progress) });
          }
        },
      }) as Promise<AutomaticSpeechRecognitionPipeline>
    ).catch((err) => {
      // Drop a failed load so the next recording retries instead of failing until a reload
      loading = null;
      throw err;
    });
  }
  return loading;
}

self.onmessage = async (event: MessageEvent<WhisperRequest>) => {
  const { id, audio, language } = event.data;
  currentId = id;
  try {
    const transcriber = await getTranscriber();
    const result = await transcriber(audio, {
      language,
      task: "transcribe",
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    const text = Array.isArray(result) ? result.map((r) => r.text).join(" ") : result.text;
    post({ id, type: "done", text: text.trim() });
  } catch (err) {
    post({ id, type: "error", error: err instanceof Error ? err.message : String(err) });
  }
};
