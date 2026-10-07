# Generating exam images from the scene text

[Documentation index](./README.md)

Turns Dutch scene text into realistic images with Codex's built-in `image_gen` tool, for the
speaking Part 2-4 scenes and the Part 1 presenter portraits.

## Building the prompt

Write every prompt in English, in two steps:

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
square 1:1 image, realistic photograph, natural lighting, candid everyday scene, shallow depth of
field, 35mm lens, photorealistic, high detail, no text, no watermark
```

Example. Source `Een man scant zelf zijn groente en melk bij een zelfscankassa in de supermarkt.`
becomes:

```
A man in his forties in a casual dark jacket stands at a self-checkout machine in a bright
supermarket, scanning a red bell pepper with the hand scanner; on the counter next to him a carton
of milk and a shopping basket with fresh vegetables, rows of stocked shelves behind him, seen from
chest height with the man and the machine fully in frame. square 1:1 image, realistic photograph,
natural lighting, candid everyday scene, shallow depth of field, 35mm lens, photorealistic, high
detail, no text, no watermark
```

## Generating and saving

1. Call `image_gen` once per image with the full prompt. Distinct scenes need distinct calls; never
   use variants of one prompt to stand in for different scenes.
2. Check the result against the review list below. If it is wrong, call again with one targeted
   change to the prompt.
3. Save the chosen file from `~/.codex/generated_images/` into the staging folder as a JPG named by
   the UUID used in the exam JSON:

   ```bash
   sips -s format jpeg "<generated file>" --out "exam-export/assets/speaking/a2/exam-<N>/<uuid>.jpg"
   ```

## Conventions

- **File names are UUIDs:** `<uuid>.jpg`, matching the reference in the exam JSON.
- **One fixed style suffix** on every prompt, so the exam looks like one set.
- **Keep the final prompts.** Report the prompt used for each UUID so a bad image can be
  regenerated.

## Review every image

- **People.** Check faces and hands, and that the person does the named action with the named
  object.
- **Counts and details.** Object counts, colors, and any detail a question asks about must match
  the prompt.
- **Text.** No stray signs, labels, or watermarks unless the scene needs them.
- **Consistency.** Lighting and look should match the rest of the exam's set.

Questions must also follow the renderability rule in
[a2-exam-generation.md](./a2-exam-generation.md).
