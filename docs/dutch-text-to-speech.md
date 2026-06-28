# Generating Dutch speech from text

This is the local, free, offline pipeline for turning Dutch text into natural sounding audio. Use it
whenever exam content needs spoken audio: listening fragments, dialogues, voicemails, announcements,
spoken prompts, or any other text where a human voice is expected.

It runs entirely on your machine, makes no cloud calls, and produces MP3 files. Audio is generated
once at authoring time and committed, so none of this tooling ships in the app or runs at request
time.

## Tool choice

We use [Piper](https://github.com/OHF-Voice/piper1-gpl), a fast local neural text-to-speech engine. It
sounds natural and supports several distinct Dutch voices, which is what makes multi speaker
dialogues possible.

`ffmpeg` does the audio assembly (silence, concatenation, MP3 encoding).

## One time setup

### 1. Install system dependencies

```bash
brew install espeak-ng ffmpeg
```

`espeak-ng` is required by Piper for phonemization. `ffmpeg` assembles and encodes the audio. Both
come from Homebrew.

> **Gotcha that costs an hour if you skip it.** The current `piper-tts` PyPI wheel (1.4.x) ships a
> broken espeak bridge: it ignores its own bundled phoneme data and fails looking for a hardcoded CI
> build path (`/Users/runner/.../espeak-ng-data/phontab`). The fix is to install espeak-ng with
> Homebrew and point Piper at its data dir with the `ESPEAK_DATA_PATH` environment variable (used in
> every command below). Do not bother with the standalone Piper binary release (its dylibs are
> missing) or `piper-tts==1.2.0` (no installable `piper-phonemize` for this Python/arch). Both are
> dead ends on macOS arm64.

### 2. Create a project local virtualenv

The virtualenv lives at `.venv/` in the project root and is gitignored. Keeping it in the project
means the voices and tooling travel with the repo checkout, but nothing heavy gets committed.

```bash
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install piper-tts
```

### 3. Download the Dutch voices

```bash
mkdir -p .venv/voices
.venv/bin/python -m piper.download_voices \
  --download-dir .venv/voices \
  nl_NL-pim-medium nl_NL-ronnie-medium nl_BE-nathalie-medium
```

Each voice is a `.onnx` + `.onnx.json` pair (~60 MB). They sit under `.venv/`, so they are gitignored
too.

| Voice                   | Accent            | Sound      |
| ----------------------- | ----------------- | ---------- |
| `nl_NL-ronnie-medium`   | Netherlands Dutch | male       |
| `nl_NL-pim-medium`      | Netherlands Dutch | male (alt) |
| `nl_BE-nathalie-medium` | Flemish (nl_BE)   | female     |

More Dutch voices are available (`nl_NL-mls-medium`, `nl_NL-alex-medium`, `nl_BE-rdh-medium`, and
others); list them with `.venv/bin/python -m piper.download_voices` and run a sample to pick what you
like. `nl_NL-mls-medium` is multi speaker: pass `--speaker <id>` to select a specific voice within
it, which is one way to get a female Netherlands Dutch voice without the Flemish accent.

## Rendering a single piece of text

Piper writes a WAV; `ffmpeg` converts it to MP3.

```bash
export ESPEAK_DATA_PATH=/opt/homebrew/share/espeak-ng-data
echo "Goedemorgen, waarmee kan ik u helpen?" \
  | .venv/bin/piper -m .venv/voices/nl_NL-ronnie-medium.onnx -f line.wav
ffmpeg -y -i line.wav -codec:a libmp3lame -qscale:a 3 line.mp3
```

`ESPEAK_DATA_PATH` must be set for every invocation (see the gotcha above).

## Rendering text with multiple speakers

For a dialogue or any text with more than one speaker, render each turn with that speaker's voice,
drop a short silence between turns, then concatenate everything into one MP3. Assign one voice per
speaker (any number of speakers works, just map each to a distinct voice).

This reusable script takes a tab separated script file on stdin where each line is
`VOICE<TAB>TEXT`, and writes a single MP3:

```bash
#!/usr/bin/env bash
# Usage: ./render.sh "$(uuidgen).mp3" < script.tsv
# script.tsv lines:  <voice-name><TAB><text to speak>
set -euo pipefail
export ESPEAK_DATA_PATH=/opt/homebrew/share/espeak-ng-data
PIPER=.venv/bin/piper
VOICES=.venv/voices
OUT=${1:?usage: render.sh <uuid>.mp3 < script.tsv}

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# one 0.45s silence clip, reused between turns
ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=22050:cl=mono -t 0.45 "$work/sil.wav"

list="$work/list.txt"; : > "$list"
i=0
while IFS=$'\t' read -r voice text; do
  [ -z "${voice:-}" ] && continue            # skip blank lines
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

Example script file (`script.tsv`), a two speaker dialogue with an opening narration:

```
nl_NL-ronnie-medium	Gesprek aan de balie van de gemeente.
nl_BE-nathalie-medium	Goedemorgen, ik kom mijn nieuwe paspoort ophalen.
nl_NL-ronnie-medium	Dat kan. Hebt u uw afspraakbevestiging bij u?
nl_BE-nathalie-medium	Natuurlijk, hier is het.
```

```bash
./render.sh "$(uuidgen).mp3" < script.tsv
```

A single speaker piece (voicemail, announcement, monologue) is just a script file where every line
uses the same voice. A narrator is simply another voice, typically a neutral one, on the intro line.

## Conventions

- **One voice per speaker.** Pick distinct voices so listeners can tell speakers apart. For two
  speakers a male/female pair is clearest. Watch accents: pairing the Flemish `nl_BE-nathalie` with a
  Netherlands Dutch male mixes accents within one dialogue. It is intelligible but not strictly
  standard Netherlands Dutch; use an `nl_NL` pair when that matters.
- **Silence between turns.** 0.45s reads naturally. Increase it for slower, easier material.
- **Output format.** Mono, 22050 Hz, `libmp3lame -qscale:a 3` (~120 kbps VBR). Ample for speech and
  keeps files small.
- **File names are UUIDs.** Each output file is named `<uuid>.mp3` (generate with `uuidgen`). Store
  the UUID on the content it belongs to so the app can resolve text to its audio file, for example
  `public/audio/<uuid>.mp3`.
