# Exam JSON format

[Documentation index](./README.md)

Exams are JSON files under `src/data/exams/`. This is the authoring reference: directory layout,
file naming, the schema, the per-skill conventions, how to embed media, and how questions are scored.

The runtime type is `Exam` / `Question` in `src/app/exam/ExamClient.tsx`; the loader is
`src/data/exams.ts`. Keep this doc and those types in sync.

## Directory layout and file naming

```
src/data/exams/
  <skill>/
    <level>/
      <skill>-<level>-exam-<n>.json
```

- `<skill>` is one of `reading`, `listening`, `speaking`, `writing`, `knm`.
- `<level>` is a lowercase directory, `a2` or `b1`.
- `<n>` is the exam number starting at 1.

Examples: `reading/a2/reading-a2-exam-1.json`, `listening/a2/listening-a2-exam-3.json`.

**KNM is the exception: it has no level directory.** Its files are `knm/knm-exam-<n>.json` and their
`level` field is `null`.

The file name is load bearing. The loader derives the path from the exam id and the skill, so the
`id` field must equal the file name without `.json` (see below).

## Top level fields

```jsonc
{
  "id": "reading-a2-exam-1", // must equal the file name without .json
  "skill": "reading", // reading | listening | speaking | writing | knm
  "level": "A2", // "A2" | "B1" | null  (UPPERCASE; null only for knm)
  "title": "Reading Exam 1",
  "timeLimitMinutes": 65,
  "questions": [
    /* Question objects, see below */
  ],
}
```

- `id` must match the file name exactly. The loader resolves files from the id, and a mismatch
  breaks loading.
- `level` is uppercase (`"A2"`, `"B1"`) even though the directory is lowercase. KNM uses `null`.
- `timeLimitMinutes` is the countdown shown to the candidate.

## Per-skill conventions

These mirror the real DUO exams and the scoring in `src/lib/exam/scoring.ts`. Match them for new A2
exams.

| Skill       | Level dir | `level` | Question type     | Time (min) | Typical count | Pass mark     |
| ----------- | --------- | ------- | ----------------- | ---------- | ------------- | ------------- |
| `reading`   | `a2`      | `"A2"`  | `multiple_choice` | 65         | 25            | 19/25 (76%)   |
| `listening` | `a2`      | `"A2"`  | `multiple_choice` | 45         | 25            | 18/25 (72%)   |
| `speaking`  | `a2`      | `"A2"`  | `speaking`        | 35         | 16            | 60% of points |
| `writing`   | `a2`      | `"A2"`  | `writing`         | 40         | 4             | 60% of points |
| `knm`       | none      | `null`  | `multiple_choice` | 45         | 40            | 28/40 (70%)   |

Pass marks come from `getPassRate`/`getPassThreshold`. For B1, reading and listening use a 65%
approximation (the real threshold is IRT equated), so the question count is not fixed.

## Question object

```jsonc
{
  "id": "q1", // unique within the exam, "q1", "q2", ...
  "type": "multiple_choice", // multiple_choice | writing | speaking
  "content": "<p>...</p>", // HTML string (see below)
  "options": ["A", "B", "C"], // string[] for multiple_choice, otherwise null
  "correctAnswer": 1, // 0-based index into options, otherwise null
}
```

### `content` is HTML

`content` is rendered as HTML, so it holds everything the candidate sees for that question: the
reading text or scenario, any media, and the actual question prompt. Conventions seen across exams:

- Wrap intro/instructions in `<p><em>...</em></p>`.
- Separate the stimulus from the question with `<hr style="margin: 1.5rem 0;">`.
- Put the question itself in `<p><strong>...</strong></p>` at the end.
- Reading texts use normal HTML (`<h3>`, `<ul>`, `<li>`, `<p>`). Writing prompts often include a
  `<table>` mock of an email form.

### Question types

- **`multiple_choice`** (reading, listening, knm): `options` is a non-empty array of strings and
  `correctAnswer` is the 0-based index of the right option. These are auto scored by comparing the
  candidate's choice to `correctAnswer`. Two to four options are normal.
- **`writing`**: `options` and `correctAnswer` are both `null`. The candidate types free text, which
  is graded by AI (see Scoring).
- **`speaking`**: `options` and `correctAnswer` are both `null`. The candidate records audio, graded
  by AI. The prompt is delivered as a video (see below).

## Media and asset URLs

Media is embedded directly in `content` as HTML tags. Never hardcode the storage host. Every asset
URL starts with the placeholder `{{EXAM_ASSETS_BASE_URL}}`, which `src/data/exams.ts` substitutes
with the `EXAM_ASSETS_BASE_URL` env var when the exam is read. Authoring a literal `https://...host`
into the JSON is a mistake; use the placeholder.

Asset path convention under the bucket:

```
{{EXAM_ASSETS_BASE_URL}}/<skill>/<level>/exam-<n>/<uuid>.<ext>   // leveled skills
{{EXAM_ASSETS_BASE_URL}}/knm/exam-<n>/<uuid>.<ext>               // knm (no level)
```

**Every asset file name MUST be a UUID plus its extension, for example
`0e90341c-aa18-400d-abb9-1b1d46173507.mp4`. This is required, not a suggestion.** Generate a fresh
UUID per file with `uuidgen`. Never use descriptive, sequential, or human-chosen names like
`waiting-room.jpg` or `q1-audio.mp3`. The UUID is what makes each asset globally unique and stable:
files from different exams or skills can share a storage bucket without ever colliding, an asset can
be moved or re-referenced without renaming, and there is no meaning encoded in the name to drift out
of sync with the content. The extension must match the real media type (`.mp4`, `.mp3`, `.jpg`, ...).

Tag patterns:

- **Image:** in speaking and writing questions, its `data-description` attribute describes in
  English, in detail, what the image actually shows (see
  [`image-generation.md`](./image-generation.md)). The grader reads that attribute instead of the
  image, so it is required there. Multiple-choice questions never reach the grader and need none.

  ```html
  <img
    src="{{EXAM_ASSETS_BASE_URL}}/speaking/a2/exam-1/<uuid>.jpg"
    data-description="A man rides a bicycle on a city street."
    style="max-width: 300px; max-height: 260px; object-fit: contain; margin: 0.75rem 0; display: block;"
  />
  ```

- **Audio (listening):**

  ```html
  <audio controls style="width: 100%; margin: 0.75rem 0; display: block;">
    <source src="{{EXAM_ASSETS_BASE_URL}}/listening/a2/exam-1/<uuid>.mp3" type="audio/mpeg" />
  </audio>
  ```

- **Video (listening stimulus):**

  ```html
  <video controls style="width: 100%; max-width: 560px; margin: 0.75rem 0; display: block;">
    <source src="{{EXAM_ASSETS_BASE_URL}}/listening/a2/exam-1/<uuid>.mp4" type="video/mp4" />
  </video>
  ```

- **Speaking prompt:** a talking-head `<video>` whose `data-transcription` attribute holds the
  spoken prompt text. The grader reads that attribute instead of fetching the clip, so it is
  required on every speaking prompt.

  ```html
  <video
    controls
    data-transcription="Waar maakt u graag huiswerk? Vertel ook waarom."
    style="width: 100%; max-width: 560px; margin: 0.75rem 0; display: block;"
  >
    <source src="{{EXAM_ASSETS_BASE_URL}}/speaking/a2/exam-1/<uuid>.mp4" type="video/mp4" />
  </video>
  ```

For two-image speaking prompts ("choose one of the pictures"), put two `<img>` tags inside a flex
`<div>`.

## Scoring

- **Multiple choice** (reading, listening, knm) is scored automatically from `correctAnswer`. The
  total is the question count; the pass threshold is the per-skill rate above.
- **Writing and speaking** have no `correctAnswer`. Answers are graded by AI in `src/lib/exam/grader.ts`
  against fixed criteria: writing is scored out of 10 points per question (5 criteria), speaking out
  of 12 (6 criteria). The pass mark is 60% of total points.

## Authoring checklist

- [ ] File is at the right path and `id` equals the file name without `.json`.
- [ ] `skill` is valid; `level` is uppercase (`"A2"`/`"B1"`) or `null` for KNM.
- [ ] `timeLimitMinutes` and question count match the per-skill table.
- [ ] Every question has a unique `id`.
- [ ] `multiple_choice` questions have a non-empty `options` array and a valid 0-based
      `correctAnswer`; `writing`/`speaking` have both set to `null`.
- [ ] All asset URLs use the `{{EXAM_ASSETS_BASE_URL}}` placeholder, never a literal host.
- [ ] Every asset file name is a UUID plus extension (e.g. `<uuid>.mp4`), never a descriptive name.
- [ ] Speaking prompts (`<video>` or `<audio>`) carry a `data-transcription` attribute.
- [ ] The file is valid JSON (run it through a parser).
