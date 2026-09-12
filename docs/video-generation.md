# Generating talking-head video from a portrait and audio

[Documentation index](./README.md)

This is the local, free, offline pipeline for turning a portrait image plus a spoken audio clip into
a lip-synced talking-head video. Use it for the speaking exam Part 1 prompts, where a presenter on
screen asks the question, matching the real DUO exam (which shows a person on video rather than
playing bare audio).

It runs entirely on your machine, makes no cloud calls, and produces MP4 files. Videos are generated
once at authoring time and uploaded to the asset bucket, so none of this tooling ships in the app or
runs at request time.

## Tool choice

We use [SadTalker](https://github.com/OpenTalker/SadTalker), an audio-driven talking-head generator:
single portrait image + audio in, lip-synced video out. Its license is Apache 2.0 (the project
explicitly removed its earlier non-commercial restriction), so it is safe for this paid product. It
has no Apple Silicon GPU path, but CPU inference works fine for authoring-time batches.

The pipeline chains the two sibling docs: the spoken prompt comes from
[`dutch-text-to-speech.md`](./dutch-text-to-speech.md) (Piper) and the presenter portrait from
[`image-generation.md`](./image-generation.md) (mflux). `ffmpeg` converts the input audio and
re-encodes the output video.

## One time setup

The install lives at `~/.cache/examklaar-sadtalker`, outside the repo: it is a full upstream
checkout plus ~3 GB of model weights with its own Python 3.11 virtualenv (the project `.venv` is
Python 3.13, which SadTalker's dependencies do not support). Requires `uv` (`brew install uv`) and
`ffmpeg`.

> **Gotchas that cost hours if you skip them.** SadTalker is a 2023 codebase; with current
> dependencies it needs five small source patches (removed numpy/PIL/torchvision APIs) and a strict
> install order: its pinned `imageio==2.19.3` is broken (infinite plugin-import recursion), so
> imageio must be current, but upgrading imageio drags in numpy 2.x, which binary-breaks
> scikit-image and scipy. The fix is to install the numpy 1.x set (`numpy==1.26.4`, `scipy<1.14`,
> `scikit-image==0.21.0`) **last**. The setup script below encodes all of this; do not install from
> the upstream `requirements.txt`.

Save this as `~/.cache/examklaar-sadtalker/setup.sh` and run it with `bash`. It is idempotent:
rerun it after any breakage and it repairs the install without re-downloading what is already there.

```bash
#!/bin/bash
set -euo pipefail
cd ~/.cache/examklaar-sadtalker

if [ ! -d SadTalker ]; then
  git clone --quiet --depth 1 https://github.com/OpenTalker/SadTalker.git
fi
cd SadTalker

if [ ! -x .venv/bin/python ]; then
  uv venv --python 3.11 .venv
fi

uv pip install --quiet --python .venv/bin/python \
  torch torchvision torchaudio \
  "face_alignment==1.3.5" imageio imageio-ffmpeg \
  "librosa==0.9.2" numba "resampy==0.3.1" "pydub==0.25.1" \
  kornia tqdm "yacs==0.1.8" pyyaml joblib \
  "basicsr==1.4.2" "facexlib==0.3.0" gfpgan av safetensors
# Pin the numpy-1.x ABI set last so nothing drags numpy to 2.x
uv pip install --quiet --python .venv/bin/python \
  "numpy==1.26.4" "scipy<1.14" "scikit-image==0.21.0"

# Patch known breakages with modern deps
DEG=.venv/lib/python3.11/site-packages/basicsr/data/degradations.py
sed -i '' 's/from torchvision.transforms.functional_tensor import rgb_to_grayscale/from torchvision.transforms.functional import rgb_to_grayscale/' "$DEG"
sed -i '' 's/np\.float,/float,/' src/face3d/util/my_awing_arch.py
FAU=.venv/lib/python3.11/site-packages/face_alignment/utils.py
sed -i '' 's/dtype=np\.int)/dtype=int)/g; s/np\.float)/float)/g' "$FAU"
sed -i '' 's/trans_params = np.array(\[w0, h0, s, t\[0\], t\[1\]\])/trans_params = np.array([w0, h0, s, float(t[0]), float(t[1])])/' src/face3d/util/preprocess.py
sed -i '' 's/Image.ANTIALIAS/Image.LANCZOS/' src/utils/croper.py

mkdir -p checkpoints gfpgan/weights
dl() {
  if [ ! -s "$2" ]; then
    curl -sL --fail --retry 5 --retry-delay 5 -C - -o "$2" "$1"
  fi
}
BASE=https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc
dl $BASE/mapping_00109-model.pth.tar checkpoints/mapping_00109-model.pth.tar
dl $BASE/mapping_00229-model.pth.tar checkpoints/mapping_00229-model.pth.tar
dl $BASE/SadTalker_V0.0.2_256.safetensors checkpoints/SadTalker_V0.0.2_256.safetensors
dl $BASE/SadTalker_V0.0.2_512.safetensors checkpoints/SadTalker_V0.0.2_512.safetensors
dl https://github.com/xinntao/facexlib/releases/download/v0.1.0/alignment_WFLW_4HG.pth gfpgan/weights/alignment_WFLW_4HG.pth
dl https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth gfpgan/weights/detection_Resnet50_Final.pth
dl https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth gfpgan/weights/GFPGANv1.4.pth
dl https://github.com/xinntao/facexlib/releases/download/v0.2.2/parsing_parsenet.pth gfpgan/weights/parsing_parsenet.pth

.venv/bin/python -c "import face_alignment, basicsr, kornia, librosa, safetensors, torch; print('imports OK')"
echo SETUP_READY
```

## The presenter portrait

Generate it with the mflux pipeline from [`image-generation.md`](./image-generation.md). What makes
a portrait animate well:

- Head and shoulders, looking directly into the camera, **mouth closed**, neutral expression.
- Plain, uncluttered background (SadTalker animates the face and blends it back into the frame).
- **Match the presenter to the Piper voice of the prompt**: a female portrait for
  `nl_BE-nathalie-medium`, a male portrait for `nl_NL-ronnie-medium` / `nl_NL-pim-medium`. Reuse
  one portrait for all prompts spoken by the same voice within an exam, like the single examiner in
  the real exam.

As with every image prompt, write the portrait prompt complete per the completeness checklist in
[`image-generation.md`](./image-generation.md): age, hair, clothing, expression, framing, background,
and lighting all named. Vague or appearance-only prompts drift to tight, angled beauty-shot crops
that animate poorly.

Prompt that works (append the standard realistic style suffix):

```
Head and shoulders portrait of a friendly Dutch woman in her thirties, shoulder-length brown hair,
looking directly into the camera, mouth closed, neutral warm expression, plain light gray
background, soft even studio lighting. realistic photograph, natural lighting, photorealistic,
high detail
```

## Rendering one video

Inputs: the prompt MP3 from the Piper pipeline and the portrait PNG. SadTalker wants WAV audio.

```bash
WORK=~/.cache/examklaar-sadtalker
ffmpeg -y -i prompt.mp3 "$WORK/prompt.wav"

cd "$WORK/SadTalker"
.venv/bin/python inference.py \
  --driven_audio ../prompt.wav \
  --source_image ../presenter.png \
  --result_dir ../results \
  --size 256 --preprocess full --still --cpu
```

- `--preprocess full --still` keeps the whole portrait in frame with minimal head motion (right for
  an exam presenter); without them you get a cropped, moving face.
- **Timing:** about 14 minutes for a 6 second clip on an M2 Pro (CPU only). A full exam's 4 Part 1
  prompts is roughly an hour; warn before starting a batch.
- **Quality:** `--size 512` and/or `--enhancer gfpgan` sharpen the face at roughly 2 to 4x the
  render time. The 256 model animates the face at 256px inside the full frame, which reads slightly
  soft; judge the 256 output first before paying for more.

The result lands at `results/<timestamp>.mp4`.

## Re-encode and name the output

SadTalker writes legacy `mpeg4` video. Re-encode to H.264 for browser playback, and name the file
as a fresh lowercase UUID per the asset rules in [`exam-format.md`](./exam-format.md):

```bash
ffmpeg -y -i "$WORK/results/<timestamp>.mp4" \
  -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart \
  "$(uuidgen | tr '[:upper:]' '[:lower:]').mp4"
```

Place it in the staging tree (`exam-export/assets/speaking/a2/exam-<n>/<uuid>.mp4`) and reference
it from the exam JSON with the speaking **video variant** markup in
[`exam-format.md`](./exam-format.md): a `<video>` tag carrying the spoken prompt as
`data-transcription`, source `{{EXAM_ASSETS_BASE_URL}}/speaking/a2/exam-<n>/<uuid>.mp4`.

## Batching

Render sequentially (each run saturates the CPU). Loop over the Part 1 prompts, reusing the
per-voice portrait, then re-encode all results in one pass. Delete the timestamped `results/`
folders once the re-encoded UUID files are in the staging tree; everything under
`~/.cache/examklaar-sadtalker` except `setup.sh` can be regenerated.
