# Generating Standard A2 Dutch Inburgering Exams

**Purpose.** This is the single source of truth for an AI agent that, on request, generates any **standard A2-level exam** for the Dutch civic-integration exam (_inburgeringsexamen_), administered by **DUO** under the **Wet inburgering 2021**. It covers all five components — **Lezen** (reading), **Luisteren** (listening), **KNM** (knowledge of Dutch society), **Schrijven** (writing), **Spreken** (speaking).

**How to use this document.** When the user asks for an exam, identify (1) which component, (2) how many questions/tasks or "a full exam," and (3) any theme focus. Then follow that component's section: copy its **structure**, **question/task types**, **calibration rules**, and **output template**. If the user just says "make me an A2 exam," ask which of the five components (or generate a full set). Always produce content in **Dutch**; explanations/labels may be in the user's language.

**Reference examples, and sourcing the rest yourself.** [`examples/`](./examples/) holds one **real official DUO exam per component**. Before generating, read the matching example to calibrate tone, register, sentence length, difficulty, question framing, distractor style, and JSON/HTML layout. **Use it for inspiration only — never copy** any text, question, option, scenario, name, or number from it; produce fresh content that merely matches its level and style. This runbook is a **starting point, not a complete dataset**: the facts, themes, and figures below are a scaffold you must **verify and expand yourself**. Actively research whatever a faithful A2 exam needs and this doc does not hand you — the current A2 vocabulary/grammar range, the full KNM eindtermen, per-component length/duration norms, theme balance, and any time-sensitive facts (fees, officials, format dates) — from authoritative sources (`inburgeren.nl`, `duo.nl`) before writing.

**Last verified:** June 2026. Flag anything time-sensitive (fees, the minister-president, format-change dates) and re-verify against `inburgeren.nl` / `duo.nl` when in doubt.

---

## 0. Shared facts across all components

| Fact                                  | Value                                                                                                                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authority                             | DUO (Dienst Uitvoering Onderwijs), under Wet inburgering 2021 (in force 1 Jan 2022)                                                                                                                              |
| The five components                   | Lezen, Luisteren, Spreken, Schrijven (A2 language) + KNM (knowledge)                                                                                                                                             |
| Also required (not exams to generate) | PVT (participatieverklaringstraject) + MAP (Module Arbeidsmarkt en Participatie), done at the gemeente                                                                                                           |
| Default route                         | **B1**; A2 still official via **afschalen** (≥600 lesson-hours at a Blik op Werk–certified school), **Z-route**, or for naturalisation/permanent residence (naturalisatietoets needs ≥A2)                        |
| Cost                                  | **€250** for all five A2 components together; **€50** per separately-taken part. Asylum-status holders: first 2 attempts per exam free (at PIP level)                                                            |
| Results                               | Within **8 weeks**, by letter + in _Mijn Inburgering_                                                                                                                                                            |
| Pass/fail                             | DUO reports **only pass/fail**; it does **not publish raw cut scores**. Any "X/Y to pass" or "≈60%" figure is **third-party/unofficial** — always label it as a practice target, never as the official threshold |
| Retakes                               | Unlimited (pay per attempt); **passed parts stay valid permanently**; only retake the part you failed                                                                                                            |
| Exam-day rules                        | Valid ID **+** the DUO _oproepbrief_; sign a _geheimhoudingsverklaring_ (secrecy); phone/bag in a locker; **no dictionary** for any A2 inburgering exam                                                          |
| Distinguish from                      | **Staatsexamen NT2** (B1 = Programma I, B2 = Programma II): a separate, higher exam with a dictionary allowed and score ≥500 to pass. Never mix NT2 specs into A2                                                |
| CEFR A2 =                             | "Basic user": short, simple, concrete, everyday language; routine exchanges; **no argumentation/abstract opinion** (that is B1+)                                                                                 |

**Cross-cutting A2 calibration (applies to every component):**

- Vocabulary ≈ high-frequency everyday words (~2000-word range), tied to _sociale redzaamheid_ (self-reliance).
- Grammar: simple main clauses (V2 word order), present tense + common perfect/past, modals (kunnen/moeten/willen), connectors **en / maar / want / omdat / dus**, sequencing **eerst / daarna / dan / ten slotte**, simple questions.
- Recurring themes: **work, health/doctor/pharmacy, school/education, family, appointments, shopping/markets, neighbours/housing/waste, leisure, travel/public transport, food/cooking, money/government/instanties.**
- Keep reading/listening load low; one clear task per item; avoid culturally confusing or stereotyping content; keep settings unmistakably Dutch and everyday.

---

## 1. Project integration (examklaar)

This runbook produces exam **content**. In this project that content ships as **JSON files plus media assets**, not as the plain text templates. After writing an exam, convert it to the project format below. The authoritative schema is [`exam-format.md`](./exam-format.md); asset generation is covered by [`dutch-text-to-speech.md`](./dutch-text-to-speech.md) (audio) and [`image-generation.md`](./image-generation.md) (images). The per-component "Output template" blocks in this doc emit that JSON directly.

**One JSON file per exam.** Path and id:

```
src/data/exams/<skill>/a2/<skill>-a2-exam-<n>.json   // reading, listening, writing, speaking
src/data/exams/knm/knm-exam-<n>.json                 // KNM has no level dir; level is null
```

The `id` field must equal the file name without `.json`. Top-level fields: `id`, `skill`, `level` (`"A2"`, or `null` for KNM), `title`, `timeLimitMinutes`, `questions[]`.

**Question object.** `{ id, type, content, options, correctAnswer }`:

- `type`: `"multiple_choice"` (reading, listening, KNM) with a non-empty `options` array and a 0-based `correctAnswer`; or `"writing"` / `"speaking"` with `options` and `correctAnswer` both `null`.
- `content` is an HTML string holding the stimulus, any media, and the prompt.

**Content HTML conventions (keep every generated exam consistent with these):**

- Intro/instructions go in `<p><em>…</em></p>`; the question itself in `<p><strong>…</strong></p>`; separators are `<hr style="margin: 1.5rem 0;">`.
- **Reading:** `<p><em>context</em></p><p><em>Lees eerst de vraag.<br>Lees daarna de tekst.</em></p><hr>` then the stimulus, then `<hr>` then the question.
- **Listening:** `<p><em>context</em></p><p><em>Lees eerst de vraag.<br>Luister daarna naar de tekst.</em></p><hr>` then the `<audio>`, then `<hr>` then the question.
- **Speaking image tasks:** `<p><em>Kijk naar het plaatje.</em></p>` (one image) or `<p><em>Kijk naar de plaatjes.</em></p>` (two/three), then `<hr>`, then the image(s), then `<hr>` then the question. Part 1 is `<audio>` only (no context line).
- **Writing:** form label cells use `width: 180px`; content points as `<ul>`; messages get an Aan/Onderwerp header table with an empty body cell.
- **Fixed style tokens** (copy verbatim): `<audio>`/`<video>` `style="width: 100%; margin: 0.75rem 0; display: block;"` (video adds `max-width: 560px;`); speaking image `style="max-width: 300px; max-height: 260px; object-fit: contain; margin: 0.75rem 0; display: block;"`. See the examples in `examples/` for the exact tokens.

**Media and assets.** Audio and images are embedded in `content` as HTML tags. Never hardcode a host; every asset URL uses the placeholder `{{EXAM_ASSETS_BASE_URL}}` (substituted at read time). Every asset file name is a fresh **UUID** plus extension, under:

```
{{EXAM_ASSETS_BASE_URL}}/<skill>/a2/exam-<n>/<uuid>.<ext>   // knm would be /knm/exam-<n>/… but see below
```

Generate the media with the local pipelines: **audio** (listening fragments, speaking prompts) via Piper, **images** (speaking) via mflux in the fixed **photorealistic** style. See the two sibling docs.

**Pass thresholds are set in code, not here.** `src/lib/exam/scoring.ts` is the source of truth: reading A2 = 19/25, listening A2 = 18/25, KNM = 28/40 (70%), writing & speaking = 60% of points. Use those, not the generic "unofficial" figures elsewhere in this doc, when calibrating difficulty for this app.

**Project-specific decisions (override the generic component rules below):**

- **KNM is text-only in this app.** Do not generate or reference photos. Each KNM `content` is just `<p>question</p>`; ignore the "PHOTO BRIEF" / photo guidance in Section 4.
- **Speaking Part 1** is delivered as an **`<audio>`** clip (spoken by Piper) carrying a `data-transcription` attribute with the prompt text, not a video actor. Parts 2-4 use generated **images**.
- **Listening** fragments are delivered as an `<audio>` clip generated from the fragment script.
- **Writing** has no assets; the form/message/open task is rendered as HTML (tables for forms and email headers).

**Build workflow.** Generate into a staging folder (e.g. `exam-export/exams/*.json` + `exam-export/assets/<skill>/a2/exam-<n>/<uuid>.<ext>` mirroring the bucket), generate the audio/images with UUID names, verify every `{{EXAM_ASSETS_BASE_URL}}` reference resolves to a file, then copy the JSON into `src/data/exams/…` and upload the `assets/` tree to the Supabase `exam-assets` bucket.

---

## 2. LEZEN (Reading) — A2

**Structure & administration**

- Computer-based. **65 minutes. ~25 multiple-choice questions** across **~9 texts**. Auto-scored.
- Options: A/B/C (occasionally 4 options). This app's pass mark is **19/25** (`scoring.ts`); DUO publishes no official cut score.

**Text types (mix all in a full exam)**

- Short functional/practical texts: signs, labels, notices, opening hours, instructions, packaging, ads, forms, schedules, short letters/emails, brochures, posters.
- Longer informational/news-style texts and short dialogues.
- Themes: the shared everyday set above.

**Question types**

1. **Detail / scan** — find a specific fact (time, price, place, name, what to do).
2. **Main idea / purpose** — what is the text about / why written / who for.
3. **Vocabulary in context** — meaning of a word/phrase from context.
4. **Inference (light)** — a simple conclusion clearly supported by the text.
5. **Reference** — what a word (hij/die/dat/er) points to.

**Construction rules**

- Each question has exactly **one** unambiguous correct answer, supported by a specific line ("evidence line").
- Distractors: plausible near-misses (wrong detail, wrong time/place, partially true, true-but-not-asked). Keep options similar length/shape.
- A2 reading load: short simple sentences; concrete topics; low idiom.
- **Distribute `correctAnswer` evenly across positions over the whole exam** (with 3 options, aim for roughly a third each at index 0/1/2; use index 3 too when a question has 4 options). Never let one position dominate, never leave a position unused, and never make them all the same. Positions are 0-based and shown to the candidate as A/B/C in order.

**Output template (project JSON, one object per question)** — the reading text is repeated in each question's `content` so every question is self-contained:

```jsonc
{
  "id": "q1",
  "type": "multiple_choice",
  "content": "<p><em>…korte context, bijv. waar de tekst staat…</em></p><p><em>Lees eerst de vraag.<br>Lees daarna de tekst.</em></p><hr style=\"margin: 1.5rem 0;\"><h3>…titel…</h3><p>…de Dutch tekst…</p><hr style=\"margin: 1.5rem 0;\"><p><strong>…vraag…</strong></p>",
  "options": ["…", "…", "…"],
  "correctAnswer": 1,
}
```

A full mock = ~9 texts, 25 questions, balanced across question types and themes; `timeLimitMinutes: 65`. This app's pass mark is **19/25** (`scoring.ts`). Vary `correctAnswer` position; keep a specific evidence line in mind for each answer even though it is not stored.

---

## 3. LUISTEREN (Listening) — A2

**Structure & administration**

- Computer-based. **~45 minutes. ~25 multiple-choice questions** across **~9 audio fragments**. Auto-scored.
- **Audio plays ONCE** (Examenstand): no pause, no replay; **~25 seconds** to read the question before each fragment. Options A/B/C (sometimes 4). This app's pass mark is **18/25** (`scoring.ts`); DUO publishes no official cut score.

**Fragment types**

- Short everyday spoken texts: announcements (station, shop, school), voicemail/answering-machine messages, short conversations/dialogues (named speakers, e.g. "Gesprek van Sara en Tom"), instructions, radio-style snippets.
- DUO instruction wording style: _"Lees de vraag goed. Kies daarna het beste antwoord."_

**Question types** — same families as Lezen but for audio: detail (who/what/when/where/how much), main idea/purpose, speaker intention/feeling (simple), what happens next / what should the listener do.

**Construction rules**

- The answer must be derivable from a single hearing; key info stated clearly, not buried.
- Write a **script** for each fragment (this is what TTS or a voice actor reads); keep sentences short and natural.
- One correct answer; near-miss distractors. **Distribute `correctAnswer` evenly across positions over the whole exam** (roughly a third each at 0/1/2 for 3-option items); never let one position dominate or go unused.
- Build mode: in a study app, play audio once by default with an optional **Oefenstand** (replay / slower) toggle.

**Output template (project JSON).** Write the fragment **script**, render it to one MP3 (Piper, one UUID per fragment; multi-speaker dialogues map speakers to a female/male voice), then embed that audio in the `content` of every question about the fragment:

```jsonc
{
  "id": "q1",
  "type": "multiple_choice",
  "content": "<p><em>…intro/context…</em></p><p><em>Lees eerst de vraag.<br>Luister daarna naar de tekst.</em></p><hr style=\"margin: 1.5rem 0;\"><audio controls style=\"width: 100%; margin: 0.75rem 0; display: block;\"><source src=\"{{EXAM_ASSETS_BASE_URL}}/listening/a2/exam-1/<uuid>.mp3\" type=\"audio/mpeg\" /></audio><hr style=\"margin: 1.5rem 0;\"><p><strong>…vraag…</strong></p>",
  "options": ["…", "…", "…"],
  "correctAnswer": 0,
}
```

A full mock = ~9 fragments, 25 questions; `timeLimitMinutes: 45`; pass mark **18/25** (`scoring.ts`). The script is the input to the audio pipeline (`dutch-text-to-speech.md`); it is not stored in the JSON.

---

## 4. KNM (Kennis van de Nederlandse Maatschappij)

**Structure & administration**

- Computer-based. **40 questions, A/B/C, 45 minutes.** Auto-scored. This app's pass mark is **28/40 (70%)** (`scoring.ts`).
- **Post–1 July 2025 eindtermen:** factual-knowledge style. The real exam uses photos, but **in this app KNM is text-only** (no images generated or referenced). Keep the scene in mind for context, but the item is just a question.

**The 8 official themes (≈5 questions each in a full 40-item exam)**

1. **Werk en inkomen** — job search, contracts (vast/tijdelijk/uitzend), UWV vs gemeente, benefits, cao, vakbond, discrimination forbidden, KvK to start a business.
2. **Omgangsvormen, waarden en normen** — punctuality, making/cancelling appointments, direct communication, same-sex marriage/partnership legal, feestdagen (Koningsdag, 4/5 mei, Sinterklaas, Suikerfeest, Keti Koti, Carnaval), verenigingen/vrijwilligerswerk.
3. **Wonen** — sociale huur vs vrije sector vs koop, woningcorporatie, tenant rights, arranging energie/water/internet, meterstanden, **afval scheiden** (GFT/glas/papier/rest).
4. **Gezondheid en gezondheidszorg** — **huisarts = first point of contact**, referral to specialist, apotheek needs recept, **112 = life-threatening**, huisartsenpost (evening/weekend), zorgverzekering compulsory, eigen risico, tandarts free under 18, consultatiebureau, tolk, beroepsgeheim, wijkteam.
5. **Geschiedenis en geografie** — **Amsterdam = capital; Den Haag = seat of government**; Wilhelmus = anthem; water/dijken/Deltawerken/molens; Gouden Eeuw (handel/scheepvaart/schilderkunst); colonies & slavery; WWII & **the Holocaust** (antisemitism forbidden); 4 mei Dodenherdenking / 5 mei Bevrijdingsdag; post-war migration; EU/NAVO/VN; provinces; OV/vervoersbewijs.
6. **Instanties** — **DigiD** (secure government login), **BSN**, gemeente (verhuizing/paspoort/rijbewijs, gemeentebelastingen), Belastingdienst (aangifte, **toeslagen**: zorg/huur/kinderopvang), SVB (kinderbijslag), police (follow instructions; **ID-plicht from 14**; aangifte), ombudsman, Juridisch Loket, voedselbank, schuldhulp.
7. **Staatsinrichting en rechtsstaat** — koninkrijk; **King Willem-Alexander = head of state (ceremonial)**; the **minister-president leads the government** _(name changes per cabinet — test the ROLE, not the name, or verify the current officeholder before naming)_; **Eerste + Tweede Kamer**; regering + parlement make laws; three powers (wetgevend/uitvoerend/rechterlijk); three layers (rijk/provincie/gemeente); EU member; hoger beroep; voting rights (non-Dutch residents >5 yr vote for gemeenteraad); **Artikel 1 Grondwet** = equality/anti-discrimination; freedom of expression/religion **but law stands above religion/tradition**; privacy; bodily integrity (huiselijk geweld strafbaar); **women's zelfbeschikkingsrecht** (7.2.8).
8. **Onderwijs en opvoeding** — leerplicht 5–16, kwalificatieplicht to 18; vrijheid van onderwijs (openbaar/bijzonder); vve/bso; schools teach sexuality & diversity; binding school holidays; parents responsible/aansprakelijk (to 16); opvoedingsondersteuning; school costs + DUO tegemoetkoming.

**Construction rules**

- Two item families: **factual** ("Wat doet…?", "Waar ga je heen als…?", "Welk nummer bel je bij…?") and **practical first-step / situational** ("X is net verhuisd… wat kan zij het beste doen?"). Avoid the retired "wat hoort u te doen/zeggen?" moral-judgement framing.
- Correct answer = the legally/administratively correct fact or the mainstream Dutch procedural norm (use official channels, act in time, equality and rule-of-law are non-negotiable).
- Distractors: near-miss institution/number/date, common misconception, or a non-Dutch-norm action framed neutrally (never stereotyping).
- A2 language; 3 options. **Distribute `correctAnswer` evenly across positions over the 40-item exam** (about 13-14 each at index 0/1/2); never let one position dominate or go unused (a common failure is making the correct answer index 0 every time). Tag each item with theme + eindterm code.

**Output template (project JSON).** Text-only in this app, so no image tag:

```jsonc
{
  "id": "q1",
  "type": "multiple_choice",
  "content": "<p>…vraag…</p>",
  "options": ["…", "…", "…"],
  "correctAnswer": 0,
}
```

A full mock = 40 items, 5 per theme; `timeLimitMinutes: 45`; pass mark **28/40** (`scoring.ts`). Still design each item against its theme + eindterm and keep an explanation/norm in mind, even though neither is stored.

---

## 5. SCHRIJVEN (Writing) — A2

**Structure & administration**

- Real DUO exam: pen-and-paper, by hand, human-assessed. **In this app** it is delivered on computer and AI-graded (`grader.ts`, 60% of points to pass). **40 minutes. 4 tasks. No dictionary.**
- Official composition: **1 form + 1–2 short messages/emails + 1–2 open writing tasks** (4 total).
- ⚠️ **"Zinnen afmaken" (sentence completion) is NOT a standard exam task** — it's a prep-book exercise. Do not put it in a mock exam (word order is tested _inside_ the writing instead).

**The standard task types**

1. **Formulier invullen** — realistic Dutch form: achternaam, voornaam/voorletters, geboortedatum, adres, postcode + woonplaats, telefoon, e-mail, nationaliteit, handtekening, etc., plus 1–2 **open fields** needing a full sentence. Cue: _"Sommige gegevens mag u zelf verzinnen."_
2. **Kort bericht / e-mail / briefje** — a situation + explicit content points: e.g. ziekmelding to manager; briefje to the babysitter; abonnement opzeggen; afspraak afzeggen; bedankje; reageren op een uitnodiging/advertentie. ~40–60 words.
3. **Open schrijfopdracht** — ≥3 (or 4) full sentences: wijkkrant piece, introduce yourself to neighbours, describe a favourite place/person, write about a nice day (past tense), give a friend advice. ~40–50 words.

**Construction rules**

- Structure each message/open task as **situation → instruction → explicit content points** ("Schrijf in je bericht: …" with 2–4 points).
- Choose register deliberately and keep it consistent: **"u"** for employer/school/authority/company; **"je"** for neighbour/friend/family. Never mix within one text.
- Calibrate: 2–4 content points; ≥3 sentences for open tasks; **never require opinion/argumentation** (that's B1).
- For forms: authentic field labels + 1–2 open fields with a reason.

**Assessment (describe to the user; do not auto-score)**

- Free-writing/correspondence criteria: **adequaatheid/begrijpelijkheid** (precondition; 0 → all 0), **grammatica, spelling, woordgebruik, coherentie** (en/maar/want/omdat).
- Form criteria: **adequaatheid, spelling, woordgebruik** (no grammar/coherence aspect).

**Output template (project JSON).** No assets. The whole task (situation, instruction, content points, and any form fields or email header) is rendered as HTML in `content`; `options` and `correctAnswer` are `null`:

```jsonc
{
  "id": "q1",
  "type": "writing",
  "content": "<p><strong>…titel…</strong></p><p>…situatie…</p><p><em>…instructie…</em></p><ul style=\"list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;\"><li>Schrijf …</li></ul><table style=\"border-collapse: collapse; width: 100%; margin: 1rem 0;\">…Aan / Onderwerp / leeg tekstvak…</table>",
  "options": null,
  "correctAnswer": null,
}
```

A full mock = exactly 4 tasks (1 form + 1-2 messages + 1-2 open); `timeLimitMinutes: 40`. Not auto-scored: writing is AI-graded (`grader.ts`, 5 criteria, 10 pts/task, pass 60%). Render forms as a field table (label cells + input cells) and messages with an Aan/Onderwerp header table plus an empty body cell.

---

## 6. SPREKEN (Speaking) — A2

**Structure & administration**

- Computer-based; the candidate **records their own voice** (no live examiner). **35 minutes.** Real DUO exam is human-assessed; **in this app** it is AI-graded (`grader.ts`, 60% of points to pass).
- **Since 1 March 2025: multiple-choice removed.** The exam is **16 spoken tasks in 4 parts of 4** — never include "choose the best response" items.
- **Per-question timing is NOT officially published** by DUO — treat any speaking-seconds value as an app convention, not an official rule.

**The four parts (4 tasks each = 16)**

1. **React to a spoken prompt** — a recorded voice (delivered as an `<audio>` clip in this app, see below) makes a model statement + asks a question ("…Vertel ook waarom/wanneer/hoe."). Candidate gives a 2–3 sentence reply. Functions: greeting, giving info, accepting/declining, asking, reacting to news, simple preference.
2. **One image** — describe + add the requested detail/opinion ("Wat ziet u? Vertel ook…" / "Vertel wat over X. Noem drie dingen.").
3. **Two images** — **choose one** and justify ("Kies een van de plaatjes. Wat doet u liever? Vertel ook waarom.").
4. **Three images** — narrate a short sequence covering all three ("Vertel wat X doet. Vertel iets over alle plaatjes." → use eerst/daarna/ten slotte).

**Construction rules**

- Part 1: write a short, clearly-articulated A2 spoken-prompt line = **model statement + direct question + "Vertel ook …"** (rendered to audio, see the output template).
- Parts 2–4: give **image-production notes** (scene description per picture) + the **exact spoken question** in simple Dutch.
- One clear communicative task per item + a sub-instruction to elicit a reason/detail; concrete familiar topics; **no B1 argumentation**; spread themes; no repeated situations.

**Assessment (describe to the user; do not auto-score)** — six categories: **adequaatheid/begrijpelijkheid** (precondition), **woordgebruik, grammatica, vloeiendheid, coherentie, uitspraak**.

**Output template (project JSON).** All 16 tasks are `type: "speaking"` with `options`/`correctAnswer` `null`.

Part 1 (spoken prompt → one MP3 via Piper, embedded as audio carrying the prompt text as `data-transcription`):

```jsonc
{
  "id": "q1",
  "type": "speaking",
  "content": "<audio controls data-transcription=\"…model + vraag + Vertel ook…\" style=\"width: 100%; margin: 0.75rem 0; display: block;\"><source src=\"{{EXAM_ASSETS_BASE_URL}}/speaking/a2/exam-1/<uuid>.mp3\" type=\"audio/mpeg\" /></audio>",
  "options": null,
  "correctAnswer": null,
}
```

Parts 2-4 (1 / 2 / 3 generated images + the exact spoken question) open with a `<p><em>Kijk naar het plaatje.</em></p>` (or `Kijk naar de plaatjes.` for two/three) context line and an `<hr>`; two or three images go in a flex `<div>`:

```jsonc
{
  "id": "q5",
  "type": "speaking",
  "content": "<p><em>Kijk naar het plaatje.</em></p><hr style=\"margin: 1.5rem 0;\"><img src=\"{{EXAM_ASSETS_BASE_URL}}/speaking/a2/exam-1/<uuid>.jpg\" style=\"max-width: 300px; max-height: 260px; object-fit: contain; margin: 0.75rem 0; display: block;\" /><hr style=\"margin: 1.5rem 0;\"><p><strong>…exacte vraag…</strong></p>",
  "options": null,
  "correctAnswer": null,
}
```

A full mock = 16 tasks (4+4+4+4); `timeLimitMinutes: 35`. Not auto-scored: speaking is AI-graded (`grader.ts`, 6 criteria, 12 pts/task, pass 60%); the `data-transcription` text is what the grader reads for context, so it must match the spoken prompt. Write image briefs as English prompts for the image pipeline.

---

## 7. Generation checklist (the agent runs this every time)

1. **Identify** component + size (full exam vs N items) + any theme focus. If unclear, ask which component.
2. **Apply that component's structure exactly** (counts, time, options, format). Use the post-2025 rules: KNM = factual, 8 themes (**text-only in this app**); Spreken = 16 spoken tasks, no MC; Schrijven = 4 tasks, no sentence-completion.
3. **Calibrate to A2**: simple language, concrete everyday themes, one clear task per item, no argumentation; spread themes; balance question/task types.
4. **For MC components** (Lezen/Luisteren/KNM): one unambiguous answer + near-miss distractors; **distribute `correctAnswer` evenly across all option positions over the whole exam** (roughly a third each at 0/1/2, plus index 3 on 4-option items) — never all the same position; tag KNM with theme + eindterm.
5. **For productive components** (Schrijven/Spreken): give explicit content points / exact prompts; set register (u/je); **do not auto-score** — present the official assessment criteria for self-check.
6. **Always in Dutch.** Emit the project JSON (Section 1), then generate the media: listening/speaking audio (`dutch-text-to-speech.md`) and speaking images (`image-generation.md`), each with a UUID file name and a `{{EXAM_ASSETS_BASE_URL}}` reference. KNM stays text-only.
7. **Use the app's thresholds** from `scoring.ts` (reading 19/25, listening 18/25, KNM 28/40, writing/speaking 60%) when calibrating; verify the current minister-president before naming; fees/format dates may change.
8. **Validate before delivering**: correct item count and per-theme/per-part distribution; every MC item has a valid 0-based `correctAnswer` and every productive item its content/prompt; **the correct-answer positions are spread roughly evenly (count them: each of 0/1/2 should appear a comparable number of times, none zero, none dominating)**; the file is valid JSON; and **every `{{EXAM_ASSETS_BASE_URL}}` reference resolves to a generated asset file**.

---

## 8. Quick reference table

| Component     | Medium                  | Time    | Items                | Format                              | Scored by            | This app's pass mark (`scoring.ts`) |
| ------------- | ----------------------- | ------- | -------------------- | ----------------------------------- | -------------------- | ----------------------------------- |
| **Lezen**     | Computer                | 65 min  | ~25 Q / ~9 texts     | MC A/B/C                            | Auto                 | 19/25                               |
| **Luisteren** | Computer                | ~45 min | ~25 Q / ~9 fragments | MC A/B/C, audio                     | Auto                 | 18/25                               |
| **KNM**       | Computer                | 45 min  | 40 Q                 | MC A/B/C, 8 themes (text-only here) | Auto                 | 28/40 (70%)                         |
| **Schrijven** | Computer here           | 40 min  | 4 tasks              | form + messages + open              | **AI (`grader.ts`)** | 60% of points                       |
| **Spreken**   | Computer (record voice) | 35 min  | 16 tasks (4+4+4+4)   | audio prompt + 1/2/3 images         | **AI (`grader.ts`)** | 60% of points                       |

_All A2, DUO, Wet inburgering 2021. DUO itself reports only pass/fail and publishes no raw cut score; the marks above are this app's thresholds in `src/lib/exam/scoring.ts`, used for the results UI. Real DUO Schrijven is pen-and-paper, but this app collects writing on computer and grades it with AI._
