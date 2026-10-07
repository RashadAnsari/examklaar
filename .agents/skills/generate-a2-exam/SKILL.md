---
name: generate-a2-exam
description: Generates a new A2 Dutch inburgering practice exam for one component, writes its JSON into the app's exam data, and stages its media for the exam-assets bucket. Use when the user asks to "generate an a2 exam", "make a new <component> exam", or runs "$generate-a2-exam <component>". The component is one of reading, listening, writing, speaking, knm.
---

# Generate an A2 exam

Write one new, complete A2 exam in authentic, calibrated Dutch, as a DUO exam author would.

## Input

The component: `reading`, `listening`, `writing`, `speaking`, or `knm`. If it is missing or invalid,
stop and print `Usage: $generate-a2-exam <reading|listening|writing|speaking|knm>`.

## Read first

- `docs/a2-exam-generation.md`: structure, calibration, and output template per component. Follow it.
- `docs/exam-format.md`: JSON schema and asset rules.
- `docs/examples/<component>-*.json`: real exams, for tone and level only. Never copy their content.
- Media: `docs/dutch-text-to-speech.md`, `docs/image-generation.md`, `docs/video-generation.md`.

Research what the runbook does not give you (vocabulary range, KNM eindtermen, current facts) on
`inburgeren.nl` and `duo.nl`; never invent it.

## Steps

1. **Number.** `N` = highest existing exam number + 1 in `src/data/exams/<component>/a2/`
   (`<component>-a2-exam-<n>.json`), or `src/data/exams/knm/` (`knm-exam-<n>.json`) for knm.
2. **Write the exam** in Dutch per the runbook and save it to that folder. `id` is the file name
   without `.json`. Give every asset a fresh `uuidgen` name, referenced as
   `{{EXAM_ASSETS_BASE_URL}}/<component>/a2/exam-<N>/<uuid>.<ext>`.
3. **Generate the media** into `exam-export/assets/<component>/a2/exam-<N>/`:
   - reading, writing, knm: none.
   - listening: one MP3 per fragment (`docs/dutch-text-to-speech.md`).
   - speaking Parts 2-4: one `image_gen` call per image, saved as `<uuid>.jpg`, then a
     detailed `data-description` of what the saved image shows on its `<img>`
     (`docs/image-generation.md`).
   - speaking Part 1: per prompt, an MP3 (`docs/dutch-text-to-speech.md`), then a talking-head MP4
     from that MP3 and a presenter portrait (`docs/video-generation.md`). One portrait per voice,
     made with `image_gen`. Videos take about 15 minutes each; tell the user before starting.
4. **Verify** that every `{{EXAM_ASSETS_BASE_URL}}` reference resolves to a staged file.
5. **Run `make local`** and fix what it reports.
6. **Review.** Spawn the `exam_reviewer` agent with the JSON path and the assets folder (or "no
   assets"). Apply its fixes and resolve what it flags.

## Report

- The JSON path.
- For listening and speaking: the assets folder, to upload to the root of the `exam-assets` bucket.
- For speaking: the prompt used for each image UUID.
