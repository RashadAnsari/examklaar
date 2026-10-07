# Generating talking-head video from a portrait and audio

[Documentation index](./README.md)

Turns a presenter portrait and a spoken prompt MP3 into a lip-synced talking-head MP4 for the
speaking Part 1 prompts, locally with [SadTalker](https://github.com/OpenTalker/SadTalker) on the
CPU. The audio comes from [`dutch-text-to-speech.md`](./dutch-text-to-speech.md), the portrait from
[`image-generation.md`](./image-generation.md). `ffmpeg` converts the audio and re-encodes the video.

## One time setup

SadTalker lives at `~/.cache/examklaar-sadtalker` with its own Python 3.11 virtualenv and ~3 GB of
weights. Requires `uv` (`brew install uv`) and `ffmpeg`. Do not install from the upstream
`requirements.txt`: the script below pins working versions, installs the numpy 1.x set last, and
patches the sources for current dependencies.

Save it as `~/.cache/examklaar-sadtalker/setup.sh` and run it with `bash`. Rerunning it repairs a
broken install without downloading again.

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

Generate it with `image_gen` per [`image-generation.md`](./image-generation.md), with these rules:

- Head and shoulders, looking straight into the camera, **mouth closed**, neutral expression, plain
  background, soft even lighting.
- Match the presenter to the voice: female for `nl_BE-nathalie-medium`, male for
  `nl_NL-ronnie-medium` / `nl_NL-pim-medium`. Reuse one portrait per voice within an exam.
- Name age, hair, clothing, expression, framing, background, and lighting; vague prompts drift to
  tight, angled crops that animate poorly.

```
Head and shoulders portrait of a friendly Dutch woman in her thirties, shoulder-length brown hair,
looking directly into the camera, mouth closed, neutral warm expression, plain light gray
background, soft even studio lighting. square 1:1 image, realistic photograph, photorealistic, high
detail, no text, no watermark
```

## Rendering one video

SadTalker wants WAV audio.

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

- `--preprocess full --still` keeps the whole portrait in frame with minimal head motion.
- About 15 minutes per clip. `--size 512` or `--enhancer gfpgan` sharpen the face at 2 to 4 times
  the render time.

The result lands at `results/<timestamp>.mp4`.

## Re-encode and name the output

Re-encode to H.264 for browser playback and name the file as a fresh lowercase UUID:

```bash
ffmpeg -y -i "$WORK/results/<timestamp>.mp4" \
  -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart \
  "$(uuidgen | tr '[:upper:]' '[:lower:]').mp4"
```

Put it in `exam-export/assets/speaking/a2/exam-<n>/` and reference it with the Part 1 `<video>`
markup from [`a2-exam-generation.md`](./a2-exam-generation.md).

## Batching

Render one clip at a time (each run uses the whole CPU), then re-encode all results. Delete the
`results/` folders once the UUID files are staged.
