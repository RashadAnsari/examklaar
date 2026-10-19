// Downloads the Whisper model the transcribe route loads into models/, so the server reads it from
// disk. Run at build time (Dockerfile, netlify.toml): a Netlify function cannot write to its disk.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { WHISPER_MODEL, WHISPER_MODEL_DIR } from "../src/lib/exam/whisper";

const FILES = [
  "config.json",
  "generation_config.json",
  "preprocessor_config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "onnx/encoder_model_quantized.onnx",
  "onnx/decoder_model_merged_quantized.onnx",
];

for (const file of FILES) {
  const url = `https://huggingface.co/${WHISPER_MODEL}/resolve/main/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} downloading ${url}`);
  }
  const dest = join(WHISPER_MODEL_DIR, WHISPER_MODEL, file);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`downloaded ${dest}`);
}
