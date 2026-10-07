# Generating Dutch speech from text

[Documentation index](./README.md)

Turns Dutch text into MP3 audio locally with [Piper](https://github.com/OHF-Voice/piper1-gpl), for
listening fragments and speaking prompts. `ffmpeg` handles silence, concatenation, and encoding.

## One time setup

```bash
brew install espeak-ng ffmpeg
python3.13 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install piper-tts
mkdir -p .venv/voices
.venv/bin/python -m piper.download_voices \
  --download-dir .venv/voices \
  nl_NL-pim-medium nl_NL-ronnie-medium nl_BE-nathalie-medium
```

Every Piper command needs `ESPEAK_DATA_PATH=/opt/homebrew/share/espeak-ng-data`; without it Piper
fails looking for its phoneme data.

| Voice                   | Accent            | Sound      |
| ----------------------- | ----------------- | ---------- |
| `nl_NL-ronnie-medium`   | Netherlands Dutch | male       |
| `nl_NL-pim-medium`      | Netherlands Dutch | male (alt) |
| `nl_BE-nathalie-medium` | Flemish (nl_BE)   | female     |

## Rendering one piece of text

```bash
export ESPEAK_DATA_PATH=/opt/homebrew/share/espeak-ng-data
echo "Goedemorgen, waarmee kan ik u helpen?" \
  | .venv/bin/piper -m .venv/voices/nl_NL-ronnie-medium.onnx -f line.wav
ffmpeg -y -i line.wav -codec:a libmp3lame -qscale:a 3 "$(uuidgen).mp3"
```

## Rendering text with multiple speakers

Render each turn with its speaker's voice, put 0.45 s of silence between turns, and concatenate into
one MP3. The script reads `VOICE<TAB>TEXT` lines on stdin:

```bash
#!/usr/bin/env bash
# Usage: ./render.sh "$(uuidgen).mp3" < script.tsv
set -euo pipefail
export ESPEAK_DATA_PATH=/opt/homebrew/share/espeak-ng-data
PIPER=.venv/bin/piper
VOICES=.venv/voices
OUT=${1:?usage: render.sh <uuid>.mp3 < script.tsv}

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=22050:cl=mono -t 0.45 "$work/sil.wav"

list="$work/list.txt"; : > "$list"
i=0
while IFS=$'\t' read -r voice text; do
  [ -z "${voice:-}" ] && continue
  printf -v idx '%03d' "$i"
  echo "$text" | "$PIPER" -m "$VOICES/$voice.onnx" -f "$work/seg_$idx.wav" >/dev/null 2>&1
  echo "file '$work/seg_$idx.wav'" >> "$list"
  echo "file '$work/sil.wav'"      >> "$list"
  i=$((i+1))
done

ffmpeg -y -loglevel error -f concat -safe 0 -i "$list" \
  -ar 22050 -ac 1 -codec:a libmp3lame -qscale:a 3 "$OUT"
echo "wrote $OUT ($i segments)"
```

Example `script.tsv`:

```
nl_NL-ronnie-medium	Gesprek aan de balie van de gemeente.
nl_BE-nathalie-medium	Goedemorgen, ik kom mijn nieuwe paspoort ophalen.
nl_NL-ronnie-medium	Dat kan. Hebt u uw afspraakbevestiging bij u?
nl_BE-nathalie-medium	Natuurlijk, hier is het.
```

A single-speaker piece is a script where every line uses the same voice.

## Conventions

- **One voice per speaker**; a male/female pair is clearest for two speakers.
- **0.45 s silence** between turns.
- **Mono, 22050 Hz, `libmp3lame -qscale:a 3`.**
- **File names are UUIDs:** `<uuid>.mp3`, matching the reference in the exam JSON.
