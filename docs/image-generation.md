# Generating exam images from the scene text

[Documentation index](./README.md)

When content describes a picture in text and needs an actual image, this is the local, free, offline
pipeline for turning that Dutch scene text into realistic images.

It runs entirely on your machine (Apple Silicon), makes no cloud calls, and produces PNG files.
Images are generated once at authoring time and committed, so none of this tooling ships in the app
or runs at request time.

## Tool and model

We use [mflux](https://github.com/filipstrand/mflux), a native Apple Silicon (MLX) implementation of
the FLUX image models. It runs locally on the GPU with no server or API.

The model is **FLUX.1-schnell** at 4-bit quantization. This choice is deliberate:

- **License.** FLUX.1-schnell is Apache-2.0, so it is safe for commercial use (this is a paid
  product). The higher quality **FLUX.1-dev** is non-commercial licensed and must not be used here.
- **Speed.** schnell is step distilled: 4 inference steps produce a full image in roughly 75 seconds
  on an M2 Pro, peaking around 19 GB of memory (fine on 32 GB).

For more fidelity you can switch to the 8-bit weights (`dhairyashil/FLUX.1-schnell-mflux-8bit`,
~13 GB). Same license, sharper textures, slightly slower. The 4-bit model is the default.

## One time setup

### 1. Create the project virtualenv

mflux requires Python 3.10+. The system `python3` is 3.9, so build the project venv with
`python3.13`. The same `.venv` hosts the text-to-speech tooling (see
[dutch-text-to-speech.md](./dutch-text-to-speech.md)); it lives at `.venv/` and is gitignored.

```bash
python3.13 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install mflux
```

### 2. Get the model (note the HuggingFace gating)

mflux downloads the model from HuggingFace on first use. The official
`black-forest-labs/FLUX.1-schnell` repo is **gated**: it needs a free HuggingFace account, accepting
the gate on the model page, and an auth token. Unauthenticated downloads are also heavily throttled.

Two ways to get the weights:

- **Authenticate (recommended for a shipped product).** Create a free token at
  `https://huggingface.co/settings/tokens`, accept the gate at
  `https://huggingface.co/black-forest-labs/FLUX.1-schnell`, then `huggingface-cli login` (or export
  `HF_TOKEN`). Downloads are first party and fast. Pass `--model schnell --quantize 4`.
- **Ungated 4-bit mirror (quick start).** The community repo `dhairyashil/FLUX.1-schnell-mflux-4bit`
  re-hosts the same Apache-2.0 weights, already 4-bit quantized (~7 GB), no login required. Pass
  `--model dhairyashil/FLUX.1-schnell-mflux-4bit --base-model schnell` and omit `--quantize` (it is
  already quantized).

The commands below use the mirror; swap in `--model schnell --quantize 4` once authenticated.

## Building the prompt

FLUX understands English far better than Dutch, so each Dutch scene becomes an English prompt in two
steps:

1. **Translate and fully expand** the scene into a complete prompt. The model draws only what the
   prompt names: a thin one-line prompt produces a generic, often wrongly framed image, so write
   every prompt out in full (typically 3 to 6 dense clauses). Keep it faithful to the source; do not
   invent a different situation.
2. **Append the fixed style suffix**, identical on every image, so the whole set looks consistent.

**Completeness checklist.** Every prompt must specify all of these:

- **Subject(s):** who, approximate age, clothing, expression or posture.
- **Action:** exactly what they are doing, with which object.
- **Objects:** every item the scene or question relies on, by name, with color or size when it
  matters. If a question will ask about a detail, that detail must be named in the prompt.
- **Setting:** the kind of place, indoor or outdoor, everyday Dutch context.
- **Background:** what is visible behind the subject; keep it plausible and uncluttered.
- **Composition:** camera distance and angle, and what is in frame (for example "seen from chest
  height", "head and shoulders", "whole person visible"). Underspecified framing is the most common
  failure: portrait-style prompts drift to tight, angled beauty-shot crops.

Realistic style suffix:

```
realistic photograph, natural lighting, candid everyday scene, shallow depth of field,
35mm lens, photorealistic, high detail
```

Example. Source `Een man scant zelf zijn groente en melk bij een zelfscankassa in de supermarkt.`
becomes:

```
A man in his forties in a casual dark jacket stands at a self-checkout machine in a bright
supermarket, scanning a red bell pepper with the hand scanner; on the counter next to him a carton
of milk and a shopping basket with fresh vegetables, rows of stocked shelves behind him, seen from
chest height with the man and the machine fully in frame. realistic photograph, natural lighting,
candid everyday scene, shallow depth of field, 35mm lens, photorealistic, high detail
```

## Rendering one image

```bash
.venv/bin/mflux-generate \
  --model dhairyashil/FLUX.1-schnell-mflux-4bit --base-model schnell \
  --steps 4 --width 1024 --height 1024 --seed 7 \
  --prompt "A man at a self-checkout machine in a supermarket, scanning his own groceries: fresh vegetables and a carton of milk, shelves and baskets behind him. realistic photograph, natural lighting, candid everyday scene, shallow depth of field, 35mm lens, photorealistic, high detail" \
  --output "$(uuidgen).png"
```

- `--seed` makes a render reproducible. Drop it (or pass several with `--seed a b c`) to get
  variations when one result is weak.
- Square 1024x1024 is the house format. For extra fidelity, render larger (for example 1280x1280)
  and downscale.

## Batching

To generate many images, collect the scene descriptions into a list, build the English prompt for
each (translate, expand, append the style suffix), and run the render step per scene.

A simple driver reads one prompt per line from a file and writes a UUID named PNG each:

```bash
#!/usr/bin/env bash
# Usage: ./render-images.sh prompts.txt out_dir/
# prompts.txt: one fully built English prompt (incl. style suffix) per line
set -euo pipefail
MODEL="dhairyashil/FLUX.1-schnell-mflux-4bit"
PROMPTS=${1:?usage: render-images.sh prompts.txt out_dir/}
OUTDIR=${2:?usage: render-images.sh prompts.txt out_dir/}
mkdir -p "$OUTDIR"

while IFS= read -r prompt; do
  [ -z "$prompt" ] && continue
  out="$OUTDIR/$(uuidgen).png"
  .venv/bin/mflux-generate \
    --model "$MODEL" --base-model schnell \
    --steps 4 --width 1024 --height 1024 \
    --prompt "$prompt" --output "$out" >/dev/null 2>&1
  echo "wrote $out"
done < "$PROMPTS"
```

At ~75 s per image this is a long but one time run for a large batch.

## Conventions

- **File names are UUIDs.** Each image is `<uuid>.png` (generate with `uuidgen`). Store the UUID on
  the content it belongs to so the app can resolve a scene to its image, for example
  `public/images/<uuid>.png`.
- **One fixed style suffix** on every prompt, so the whole exam looks like one set.
- **Square 1024x1024** unless a specific layout needs otherwise.

## Caveats for realistic images

- **People are the weak spot.** Rooms, objects, and wider shots come out convincingly, but faces and
  especially hands can look wrong in close-ups. Many speaking prompts feature a person doing an
  action, so expect to re-roll the seed on some, or phrase prompts to keep the person a bit further
  from the camera.
- **Consistency takes effort.** Photoreal is harder to keep uniform across dozens of images than a
  flat illustration would be. The fixed style suffix, fixed lighting words, and fixed aspect ratio
  are what hold the set together, so keep them identical.
- **Review every image.** Generated scenes can contain odd text, wrong object counts, or culturally
  off details. Check each one before committing it.
