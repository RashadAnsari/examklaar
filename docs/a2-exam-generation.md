# Generating standard A2 Dutch Inburgering exams

[Documentation index](./README.md)

**Purpose.** This is the single source of truth for an AI agent that, on request, generates any **standard A2-level exam** for the Dutch civic-integration exam (_inburgeringsexamen_), administered by **DUO** under the **Wet inburgering 2021**. It covers all five components: **Lezen** (reading), **Luisteren** (listening), **KNM** (knowledge of Dutch society), **Schrijven** (writing), **Spreken** (speaking).

**How to use this document.** When the user asks for an exam, identify (1) which component, (2) how many questions/tasks or "a full exam," and (3) any theme focus. Then follow that component's section: copy its **structure**, **question/task types**, **calibration rules**, and **output template**. If the user just says "make me an A2 exam," ask which of the five components (or generate a full set). Always produce content in **Dutch**; explanations/labels may be in the user's language.

**Reference examples, and sourcing the rest yourself.** [`examples/`](./examples/) holds one **real official DUO exam per component**. Before generating, read the matching example to calibrate tone, register, sentence length, difficulty, question framing, distractor style, and JSON/HTML layout. **Use it for inspiration only, never copy** any text, question, option, scenario, name, or number from it; produce fresh content that merely matches its level and style. This runbook is a **starting point, not a complete dataset**: the facts, themes, and figures below are a scaffold you must **verify and expand yourself**. Actively research whatever a faithful A2 exam needs and this doc does not hand you: the current A2 vocabulary/grammar range, the full KNM eindtermen, per-component length/duration norms, theme balance, and any time-sensitive facts (fees, officials, format dates), and do it from authoritative sources (`inburgeren.nl`, `duo.nl`) before writing.

Re-verify time-sensitive facts (fees, the minister-president, format-change dates) against `inburgeren.nl` / `duo.nl` before using them.

---

## 0. Shared facts across all components

| Fact                                  | Value                                                                                                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authority                             | DUO (Dienst Uitvoering Onderwijs), under Wet inburgering 2021 (in force 1 Jan 2022)                                                                                                                             |
| The five components                   | Lezen, Luisteren, Spreken, Schrijven (A2 language) + KNM (knowledge)                                                                                                                                            |
| Also required (not exams to generate) | PVT (participatieverklaringstraject) + MAP (Module Arbeidsmarkt en Participatie), done at the gemeente                                                                                                          |
| Default route                         | **B1**; A2 still official via **afschalen** (≥600 lesson-hours at a Blik op Werk–certified school), **Z-route**, or for naturalisation/permanent residence (naturalisatietoets needs ≥A2)                       |
| Cost                                  | **€250** for all five A2 components together; **€50** per separately-taken part. Asylum-status holders: first 2 attempts per exam free (at PIP level)                                                           |
| Results                               | Within **8 weeks**, by letter + in _Mijn Inburgering_                                                                                                                                                           |
| Pass/fail                             | DUO reports **only pass/fail**; it does **not publish raw cut scores**. Any "X/Y to pass" or "≈60%" figure is **third-party/unofficial**: always label it as a practice target, never as the official threshold |
| Retakes                               | Unlimited (pay per attempt); **passed parts stay valid permanently**; only retake the part you failed                                                                                                           |
| Exam-day rules                        | Valid ID **+** the DUO _oproepbrief_; sign a _geheimhoudingsverklaring_ (secrecy); phone/bag in a locker; **no dictionary** for any A2 inburgering exam                                                         |
| Distinguish from                      | **Staatsexamen NT2** (B1 = Programma I, B2 = Programma II): a separate, higher exam with a dictionary allowed and score ≥500 to pass. Never mix NT2 specs into A2                                               |
| CEFR A2 =                             | "Basic user": short, simple, concrete, everyday language; routine exchanges; **no argumentation/abstract opinion** (that is B1+)                                                                                |

**Cross-cutting A2 calibration (applies to every component):**

- Vocabulary ≈ high-frequency everyday words (~2000-word range), tied to _sociale redzaamheid_ (self-reliance).
- Grammar: simple main clauses (V2 word order), present tense + common perfect/past, modals (kunnen/moeten/willen), connectors **en / maar / want / omdat / dus**, sequencing **eerst / daarna / dan / ten slotte**, simple questions.
- Recurring themes: **work, health/doctor/pharmacy, school/education, family, appointments, shopping/markets, neighbours/housing/waste, leisure, travel/public transport, food/cooking, money/government/instanties.**
- Keep reading/listening load low; one clear task per item; avoid culturally confusing or stereotyping content; keep settings unmistakably Dutch and everyday.

---

## 1. Project integration (examklaar)

This runbook produces exam **content**. In this project that content ships as **JSON files plus media assets**, not as the plain text templates. After writing an exam, convert it to the project format below. The authoritative schema is [`exam-format.md`](./exam-format.md); asset generation is covered by [`dutch-text-to-speech.md`](./dutch-text-to-speech.md) (audio), [`image-generation.md`](./image-generation.md) (images), and [`video-generation.md`](./video-generation.md) (talking-head video for speaking Part 1). The per-component "Output template" blocks in this doc emit that JSON directly.

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
- **Listening:** `<p><em>context</em></p><p><em>Lees eerst de vraag.<br>Luister daarna naar de tekst.</em></p><hr>` then the `<audio>` element, then `<hr>` then the question.
- **Speaking image tasks:** `<p><em>Kijk naar het plaatje.</em></p>` (one image) or `<p><em>Kijk naar de plaatjes.</em></p>` (two/three), then `<hr>`, then the image(s), then `<hr>` then the question. Part 1 is a talking-head `<video>` prompt (see [`video-generation.md`](./video-generation.md)) with no context line.
- **Writing:** form label cells use `width: 180px`; content points as `<ul>`; messages get an Aan/Onderwerp header table with an empty body cell.
- **Fixed style tokens** (copy verbatim): `<audio>`/`<video>` `style="width: 100%; margin: 0.75rem 0; display: block;"` (video adds `max-width: 560px;`); speaking image styles depend on the image count: one image `style="max-width: 300px; max-height: 260px; object-fit: contain; margin: 0.75rem 0; display: block;"`; two images in a flex `<div style="display: flex; gap: 1rem; flex-wrap: wrap; margin: 0.75rem 0;">` each `style="max-width: 48%; max-height: 220px; object-fit: contain;"`; three images in the same flex div each `style="max-width: 32%; max-height: 180px; object-fit: contain;"`. See the examples in `examples/` for the exact tokens.

**Media and assets.** Audio and images are embedded in `content` as HTML tags. Never hardcode a host; every asset URL uses the placeholder `{{EXAM_ASSETS_BASE_URL}}` (substituted at read time). Every asset file name is a fresh **UUID** plus extension, under:

```
{{EXAM_ASSETS_BASE_URL}}/<skill>/a2/exam-<n>/<uuid>.<ext>   // knm would be /knm/exam-<n>/… but see below
```

Generate the media: **audio** (listening fragments, speaking prompt speech) via Piper, **images** (speaking scenes and presenter portraits) via Codex's built-in image generation in the fixed **photorealistic** style, and **video** (speaking Part 1 talking-head prompts: presenter portrait + prompt audio) via SadTalker. See the three sibling docs.

**Pass thresholds are set in code, not here.** `src/lib/exam/scoring.ts` is the source of truth: reading A2 = 19/25, listening A2 = 18/25, KNM = 28/40 (70%), writing & speaking = 60% of points. Use those, not the generic "unofficial" figures elsewhere in this doc, when calibrating difficulty for this app.

**Project-specific decisions (override the generic component rules below):**

- **KNM is text-only in this app.** Do not generate or reference photos. Each KNM `content` is just `<p>question</p>`; keep the scene in mind for context but do not emit an image tag.
- **Listening fragments are `<audio>` clips.** **Speaking Part 1 is a talking-head `<video>` clip** carrying the spoken prompt as a `data-transcription` attribute. Speaking Parts 2-4 use generated **images**.
- **Writing** has no assets; the form/message/open task is rendered as HTML (tables for forms and email headers).

**Build workflow.** Write the JSON to `src/data/exams/…`, generate the media with UUID names into `exam-export/assets/<skill>/a2/exam-<n>/` (mirroring the bucket), verify every `{{EXAM_ASSETS_BASE_URL}}` reference resolves to a file, then upload the `assets/` tree to the `exam-assets` bucket.

---

## 2. LEZEN (Reading): A2

**Structure & administration**

- Computer-based. **65 minutes. ~25 multiple-choice questions** across **~9 texts**. Auto-scored.
- Options: A/B/C (occasionally 4 options). This app's pass mark is **19/25** (`scoring.ts`); DUO publishes no official cut score.

**Text types (mix all in a full exam)**

- Short functional/practical texts: signs, labels, notices, opening hours, instructions, packaging, ads, forms, schedules, short letters/emails, brochures, posters.
- Longer informational/news-style texts and short dialogues.
- Themes: the shared everyday set above.

**Question subtypes (mix these across the exam)**: the tested skill is targeted/scanning reading (_zoekend lezen_), not inference or interpretation:

1. **Purpose / main idea**: why the text was written / who for ("Waarom krijgt X deze brief?").
2. **Detail: time/date**: scan for a time or day; distractors are other times in the text.
3. **Detail: price/number**: scan a price list/table; often a 4th option.
4. **Detail: person/place**: scan a roster/table for the right row/column.
5. **Condition / rule**: what is allowed/required/forbidden ("Wat is de regel voor kinderen jonger dan 12?").
6. **Negation**: what is NOT allowed / need NOT be done; hinges on _niet / geen / hoeft niet_.
7. **Required action**: what X must do; distractors are actions from the wrong scenario.
8. **Matching a situation to an option**: "Welk abonnement past het beste?"; the option whose conditions fit the described person.
9. **Conditional / exception**: "Wat gebeurt er bij slecht weer?"; distractors ignore the condition.

(Vocabulary-in-context and reference, what _hij/die/dat/er_ points to, also occur but are secondary at A2.)

**Construction rules**

- Give a short **context line first** naming a person with a concrete need (a time, price, rule, action) so the task is to scan; then the question.
- Each question has exactly **one** unambiguous correct answer, provable from **one specific line** ("evidence line"), never from outside knowledge or multi-step inference.
- **Four distractor strategies** (the main lever at A2): (a) **other real values from the same text** (another time/price/day/person, punishing skim-reading, this is how DUO builds _strikvragen_); (b) **keyword lures** (reuse a salient word but state the wrong fact); (c) **negation/quantifier traps** flipping the small words that decide the answer: `niet, geen, alleen, uiterlijk, vanaf, tot, voor, na, behalve, hoeft niet`; (d) **plausible-but-unstated** (sounds logical but isn't in the text). Never "all/none of the above"; keep options parallel in length and grammar.
- **Calibrate difficulty by data density, not vocabulary.** Keep words easy; create difficulty by placing several similar values (multiple times/prices/days) in one text so careless scanning fails. This is the single most authentic reading-difficulty lever.
- **A2 text size:** ~40-90 words / 5-10 short sentences per text, roughly ≤10-12 words per sentence; concrete transactional topics; low idiom.
- **Distribute `correctAnswer` evenly across positions over the whole exam** (with 3 options, aim for roughly a third each at index 0/1/2; use index 3 too when a question has 4 options). Never let one position dominate, never leave a position unused, and never make them all the same. Positions are 0-based and shown to the candidate as A/B/C in order.

**Output template (project JSON, one object per question)**: the reading text is repeated in each question's `content` so every question is self-contained:

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

## 3. LUISTEREN (Listening): A2

**Structure & administration**

- Computer-based. **~45 minutes. ~25 multiple-choice questions** across **~9 fragments**. Auto-scored. The real DUO exam mixes short films and audio-only texts; **in this app each fragment is an `<audio>` clip**.
- **~25 seconds** to read the question before each fragment. Options A/B/C (sometimes 4). This app's pass mark is **18/25** (`scoring.ts`); DUO publishes no official cut score.
- **Playback count is a per-app setting, not a fixed DUO fact:** "plays once" is documented only for the higher NT2 B1/B2 exam; for A2 third-party sources say twice. The app controls replay, so do not assert a count in the content.

**Fragment types**

- Short everyday spoken texts: announcements (station, shop, school), voicemail/answering-machine messages, short conversations/dialogues (named speakers, e.g. "Gesprek van Sara en Tom"), instructions, radio-style snippets.
- DUO instruction wording style: _"Lees de vraag goed. Kies daarna het beste antwoord."_

**Question types**: same families as Lezen but for audio: detail (who/what/when/where/how much), main idea/purpose, speaker intention/feeling (simple), what happens next / what should the listener do.

**Construction rules**

- The answer must be derivable from a single hearing; put the key info in **one clear utterance** (the "answer line"), not buried.
- Write a **script** for each fragment (this is the input to the media pipeline); keep sentences short and natural, with sparse fillers (_nou, eh, ja_).
- **A2 fragment size:** ~20-45 seconds, ~40-110 words, dialogues 4-8 turns; one question per short fragment (a longer fragment may carry 2-3).
- **Speech features:** slow-to-normal tempo, clearly articulated, standard pronunciation; an accent is fine but **never dialect**; key info always clear.
- **Four audio-specific distractor traps** (the listening equivalent of _strikvragen_): (a) a value **mentioned then corrected** ("om drie uur… nee, om vier uur"); (b) a detail said by **the wrong speaker**; (c) a **negated** detail ("niet de bus maar de tram"); (d) a **number changed mid-sentence**. Each distractor should reference something actually heard but wrong; avoid options guessable from the stem alone or requiring outside knowledge.
- One correct answer. **Distribute `correctAnswer` evenly across positions over the whole exam** (roughly a third each at 0/1/2 for 3-option items); never let one position dominate or go unused.

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

> **KNM vs KNS: keep distinct.** KNM is the in-country A2 knowledge exam covered here. KNS (Kennis van de Nederlandse Samenleving) is the separate A1 exam of the _basisexamen inburgering buitenland_ (taken abroad, built around the film "Naar Nederland", ~30 questions, 2 options). Never mix KNS specs into KNM.

> **The 1 July 2025 shift:** items moved from behavioural ("wat kan iemand het beste doen/zeggen?") to **direct factual knowledge**, films removed. New/strengthened content: the **Holocaust** and recognition of antisemitism; **women's zelfbeschikkingsrecht (7.2.8)**; **digitalisation** (DigiD, BSN, e-government, privacy); diversity, equal treatment, and that the law stands above religion/tradition.

**The 8 official themes and their eindtermen (≈5 questions each in a 40-item exam).** Tag every item with theme + eindterm code (e.g. `4.3`).

1. **Werk en inkomen**: _1.1 job search:_ vacancies via own network / vacaturebanken / uitzendbureaus; CV + sollicitatiebrief; interview prep; hiring factors (opleiding, ervaring, taal, motivatie); **UWV (with work history) vs gemeente (none)** for registration + benefits; safety net (bijstand, WW, toeslagen); benefit duties (accept suitable work, report income changes). _1.2 in a work organisation:_ arbeidscontract (werktijden, salaris, verlof, ziekte); CAO; **vast vs tijdelijk vs uitzend** contract; beoordelingsgesprek; ondernemingsraad; vakbond; employer withholds premies + tax. _1.3_ discrimination at work is **forbidden** (use vertrouwenspersoon/vakbond). _1.4 own business:_ register at **KvK**; benefit usually stops; arrange own pension + arbeidsongeschiktheidsverzekering.
2. **Omgangsvormen, waarden en normen**: _2.1_ customs vary by group/region/generation; many Dutch communicate **directly**; make appointments in advance and value **punctuality + timely cancellation**; cohabitation forms incl. **same-sex**; geregistreerd partnerschap + huwelijk in law; feest-/gedenkdagen (Pasen, **Koningsdag**, **4 & 5 mei**, Kerst, Oud en Nieuw; group-specific Sinterklaas, Carnaval, Suikerfeest, Keti Koti). _2.2_ networks via **verenigingen + vrijwilligerswerk**; customs at verjaardag/geboorte/bruiloft/overlijden.
3. **Wonen**: _3.1_ routes to housing (**sociale huur / vrije huursector / koop**); huurcontract; tenant rights + where to get help (onterechte huurverhoging, achterstallig onderhoud); register promptly as **woningzoekende**. _3.2_ arrange energie/water/internet; choose leverancier; read/report **meterstanden**; report storingen; temp vs fixed tariff. _3.3_ **afval scheiden** per local rules (GFT/glas/papier/rest) and why.
4. **Gezondheid en gezondheidszorg**: _4.1 no referral:_ **huisarts (+ POH) = first contact** incl. mental health; choose/register + make appointment; right to a **tolk**; **medisch beroepsgeheim**; apotheek needs a **recept**; tandarts/mondhygiënist; consultatiebureau. _4.2_ huisarts refers to specialist. _4.3 emergencies:_ **huisartsenpost** evenings/weekends; **112 for life-threatening**. _4.4 financial:_ **zorgverzekering compulsory** (+ optional aanvullend); switch yearly; **eigen risico** (huisarts doesn't count); under-18 tandarts/fysio free; **DigiD** to apply/declare. _4.5_ gemeenteloket/wijkteam welfare help.
5. **Geschiedenis en geografie**: _5.1_ Gouden Eeuw trade/shipping + art; **colonies + slavery**; life with water (polders, molens, dijken, **Deltawerken**); **Wilhelmus = anthem**, the flag; WWII occupation, **the Holocaust** (many Dutch Jews killed) and **antisemitism forbidden by law**; 1945 liberation, **4 mei Dodenherdenking / 5 mei Bevrijdingsdag**; post-war migration; EU/NAVO/VN; since the 1960s value on individual freedom/emancipation/tolerance; abortion, same-sex marriage, euthanasia legally regulated. _5.2_ **Amsterdam = capital; government sits in Den Haag**; provinces; own region; OV + vervoersbewijzen.
6. **Instanties**: _6.1_ government info mostly digital; safe use of **BSN + DigiD**; help bodies (Nibud, schuldhulp, voedselbank, GGD, Juridisch Loket, maatschappelijk werk, jeugdzorg). _6.2 gemeente/BRP:_ report geboorte/huwelijk/echtscheiding/overlijden/**verhuizing**; verblijfsvergunning/paspoort/rijbewijs; naturalisatie (in principe geen dubbele nationaliteit); gemeentelijke belastingen (ozb, riool-, afvalstoffenheffing, parkeer). _6.3 tax:_ salarisstrook/jaaropgave, bruto vs netto; income-tax **aangifte**; tax funds public services; **Belastingdienst toeslagen** (zorg/huur/kinderopvang); **kinderbijslag via SVB**. _6.4 police:_ follow instructions; report serious crimes; **ID-plicht from 14** (12 in OV). _6.5_ make **bezwaar**; ombudsman; Juridisch Loket; corruption punishable. _6.6 insurance:_ zorgverzekering compulsory; WA advisable; motor WA + tax compulsory; opstalverzekering for owners.
7. **Staatsinrichting en rechtsstaat**: _7.1_ kingdom with royal house; **King = ceremonial head of state**; democratic rule-of-law state; **Eerste + Tweede Kamer** + government make laws; parties form a government; the **minister-president** leads _(test the ROLE, not the name; verify + use the current officeholder if you must name one)_; **rijk/provincie/gemeente**; **EU** member; **separation of powers** (wetgevend/uitvoerend/rechterlijk); accept a judge's ruling but may appeal (**hoger beroep**); kiesrecht + elections; non-Dutch residents >5 yr vote in **gemeenteraad**. _7.2_ women and men **legally equal**; freedom of expression (within the law); freedom of religion **but the law stands above religion and tradition**; **Artikel 1 Grondwet** = equal treatment, discrimination forbidden (godsdienst, ras, geslacht, handicap, seksuele gerichtheid, …); privacy; bodily integrity (huiselijk geweld/eerwraak/vrouwenbesnijdenis **strafbaar**); organ donation default unless registered otherwise; **7.2.8 women's zelfbeschikkingsrecht**.
8. **Onderwijs en opvoeding**: _8.1 system 0-18+:_ vve for under-4s; school types; special-needs; **vrijheid van onderwijs** (openbaar vs bijzonder); **leerplicht 5-16, kwalificatieplicht 16-18**; binding school holidays; schools must teach **seksualiteit + seksuele diversiteit**. _8.2_ parents legally responsible/liable (to 16); schools expect involvement (oudergesprekken); opvoedingsondersteuning (gemeente/jeugdzorg). _8.3 costs:_ vrijwillige ouderbijdrage, leermiddelen, reiskosten; **tegemoetkoming via DUO**.

**Cross-cutting _algemene redzaamheid_ (underlies many items):** select and use information sources, use formal/informal help, and **act in time (let no deadline lapse)**: hence frequent "where do you find this?" / "who do you contact first?" items.

**Construction rules**

- Two item families: **factual** ("Wat doet…?", "Waar ga je heen als…?", "Welk nummer bel je bij…?") and **practical first-step / situational** ("X is net verhuisd… wat kan zij het beste doen?"). Avoid the retired "wat hoort u te doen/zeggen?" moral-judgement framing.
- Correct answer = the legally/administratively correct fact or the mainstream Dutch procedural norm (use official channels, act in time, equality and rule-of-law are non-negotiable).
- Distractors: (a) **near-miss institution/number/date/document** (e.g. gemeente vs UWV vs SVB vs Belastingdienst; a wrong emergency number); (b) **common misconceptions** (going straight to the ziekenhuis/SEH for a non-urgent complaint instead of the huisarts; chemical waste in the GFT bin; "all foreigners may vote in all elections"); (c) a **culturally-different-but-not-Dutch-norm** action framed neutrally and respectfully, never as ridicule or stereotype (wrong because it doesn't match the Dutch legal/procedural norm). Keep the 3 options the same grammatical shape and length.
- No regionally-variable specifics presented as national facts (waste-collection days, exact rents); no outdated facts (use MAP not ONA, the €50 fee, the current officeholder).
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

## 5. SCHRIJVEN (Writing): A2

**Structure & administration**

- Real DUO exam: pen-and-paper, by hand, human-assessed. **In this app** it is delivered on computer and AI-graded (`grader.ts`, 60% of points to pass). **40 minutes. 4 tasks. No dictionary.**
- Official composition: **1 form + 1–2 short messages/emails + 1–2 open writing tasks** (4 total).
- ⚠️ **"Zinnen afmaken" (sentence completion) is NOT a standard exam task**: it's a prep-book exercise. Do not put it in a mock exam (word order is tested _inside_ the writing instead).

**The standard task types**

1. **Formulier invullen**: realistic Dutch form: achternaam, voornaam/voorletters, geboortedatum, adres, postcode + woonplaats, telefoon, e-mail, nationaliteit, handtekening, etc., plus 1–2 **open fields** needing a full sentence. Cue: _"Sommige gegevens mag u zelf verzinnen."_
2. **Kort bericht / e-mail / briefje**: a situation + explicit content points: e.g. ziekmelding to manager; briefje to the babysitter; abonnement opzeggen; afspraak afzeggen; bedankje; reageren op een uitnodiging/advertentie. ~40–60 words.
3. **Open schrijfopdracht**: ≥3 (or 4) full sentences: wijkkrant piece, introduce yourself to neighbours, describe a favourite place/person, write about a nice day (past tense), give a friend advice. ~40–50 words.

**Construction rules**

- Structure each message/open task as **situation → instruction → explicit content points** ("Schrijf in je bericht: …" with 2–4 points).
- Content-point bullets must be grammatical Dutch: never stack "Schrijf" directly before another imperative ("Schrijf bedank haar", "Schrijf stel een vraag" are wrong). Either use the bare imperative ("Stel twee vragen …", "Vraag wat …") or a subordinate clause ("Schrijf dat je haar bedankt …").
- Choose register deliberately and keep it consistent: **"u"** for employer/school/authority/company; **"je"** for neighbour/friend/family. Never mix within one text.
- Calibrate: 2–4 content points; ≥3 sentences for open tasks; **never require opinion/argumentation** (that's B1).
- For forms: authentic field labels + 1–2 open fields with a reason. The open fields go **inside the form table as rows** (label cell + empty answer cell with extra height), never as a floating paragraph after the table. Choices (e.g. jongen/meisje) are static text with `&#9675;` circle markers, never interactive elements like `<select>` or `<input>`: the `content` HTML is a read-only stimulus and the candidate answers in the separate text area.

**Assessment.** The app AI-grades via `grader.ts` with the official DUO models below (PDFs in `src/data/grading/`; 10 pts per free-writing/correspondence task, 7 per form, pass 60%). Mark the form task with `"form": true` so it is graded on the form model. The two aspect sets and their scales:

- Free-writing/correspondence: **adequaatheid/begrijpelijkheid** (0-3, precondition; if 0 → all others 0), **grammatica** (0-2), **spelling** (0-2), **woordgebruik** (0-2), **coherentie** (0-1, via en/maar/want/omdat).
- Form: **adequaatheid** (0-3, same precondition), **spelling** (0-2, "persoonlijke gegevens correct gespeld"), **woordgebruik** (0-2). No grammatica/coherentie aspect for forms.

**Output template (project JSON).** No assets. The whole task (situation, instruction, content points, and any form fields or email header) is rendered as HTML in `content`; `options` and `correctAnswer` are `null`:

```jsonc
{
  "id": "q1",
  "type": "writing", // add "form": true on the form task only
  "content": "<p><strong>…titel…</strong></p><p>…situatie…</p><p><em>…instructie…</em></p><ul style=\"list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;\"><li>Schrijf …</li></ul><table style=\"border-collapse: collapse; width: 100%; margin: 1rem 0;\">…Aan / Onderwerp / leeg tekstvak…</table>",
  "options": null,
  "correctAnswer": null,
}
```

A full mock = exactly 4 tasks (1 form + 1-2 messages + 1-2 open); `timeLimitMinutes: 40`. Not auto-scored: writing is AI-graded (`grader.ts`, DUO models: 10 pts per task, 7 for the form, pass 60%). The form task carries `"form": true`. Render forms as a field table (label cells + input cells) and messages with an Aan/Onderwerp header table plus an empty body cell.

---

## 6. SPREKEN (Speaking): A2

**Structure & administration**

- Computer-based; the candidate **records their own voice** (no live examiner). **35 minutes.** Real DUO exam is human-assessed; **in this app** it is AI-graded (`grader.ts`, 60% of points to pass).
- **Since 1 March 2025: multiple-choice removed.** The exam is **16 spoken tasks in 4 parts of 4**: never include "choose the best response" items.
- **Per-question timing is NOT officially published** by DUO, so treat any speaking-seconds value as an app convention, not an official rule.

**The four parts (4 tasks each = 16)**

1. **React to a spoken prompt**: a presenter on video (a talking-head `<video>` clip in this app, see below) makes a model statement + asks a question ("…Vertel ook waarom/wanneer/hoe."). Candidate gives a 2–3 sentence reply. Functions: greeting, giving info, accepting/declining, asking, reacting to news, simple preference.
2. **One image**: describe + add the requested detail/opinion ("Wat ziet u? Vertel ook…" / "Vertel wat over X. Noem drie dingen.").
3. **Two images**: **choose one** and justify ("Kies een van de plaatjes. Wat doet u liever? Vertel ook waarom.").
4. **Three images**: narrate a short sequence covering all three ("Vertel wat X doet. Vertel iets over alle plaatjes." → use eerst/daarna/ten slotte).

**Construction rules**

- Part 1: write a short, clearly-articulated A2 spoken-prompt line = **model statement + direct question + "Vertel ook …"** (rendered to a talking-head video, see the output template).
- Parts 2–4: give **image-production notes** (scene description per picture) + the **exact spoken question** in simple Dutch. The notes must be complete prompts per the completeness checklist in [`image-generation.md`](./image-generation.md): subject with age and clothing, the exact action, every object the question relies on by name, setting, background, and framing; never a bare one-liner.
- **Write questions the image pipeline can deliver.** Images are generated from your notes alone, so only build questions around scenes a text-to-image model renders reliably: one or two people performing a single, concrete, everyday action with common objects (shopping, cycling, cooking, cleaning, waiting for a bus). Never let the answer depend on things image models routinely get wrong:
  - **readable text or numbers** in the picture (signs, price tags, clocks, timetables, screens, letters);
  - **exact counts** above two ("noem drie dingen" is fine only if the three things are large, distinct objects named in the prompt);
  - fine hand or finger detail, specific brands or logos, maps or floor plans;
  - precise spatial relations (left/right of) or a **detail so small it may render wrong**;
  - two or three images that must show the **same person or object consistently** (each image is rendered independently); Part 4 sequences must read as a sequence through the scenes themselves, not through a recurring recognizable character.

  The question must be answerable from the overall scene at a glance. For Part 3, the two options must be obviously different subjects (bus vs bicycle), never subtle variants of the same scene.

- One clear communicative task per item + a sub-instruction to elicit a reason/detail; concrete familiar topics; **no B1 argumentation**; spread themes; no repeated situations.

**Assessment.** The app AI-grades via `grader.ts` with DUO's official model (PDF in `src/data/grading/`), which scores each answer on six aspects (12 pts): **adequaatheid/begrijpelijkheid** (0-3, precondition; if 0 → all others 0), **woordgebruik** (0-2), **grammatica** (0-2), **vloeiendheid** (0-2), **coherentie** (0-1), **uitspraak** (0-2).

**Output template (project JSON).** All 16 tasks are `type: "speaking"` with `options`/`correctAnswer` `null`.

Part 1 (spoken prompt → MP3 via Piper → talking-head MP4 via [`video-generation.md`](./video-generation.md), embedded as video carrying the prompt text as `data-transcription`; the presenter portrait's gender matches the Piper voice):

```jsonc
{
  "id": "q1",
  "type": "speaking",
  "content": "<video controls data-transcription=\"…model + vraag + Vertel ook…\" style=\"width: 100%; max-width: 560px; margin: 0.75rem 0; display: block;\"><source src=\"{{EXAM_ASSETS_BASE_URL}}/speaking/a2/exam-1/<uuid>.mp4\" type=\"video/mp4\" /></video>",
  "options": null,
  "correctAnswer": null,
}
```

Parts 2-4 (1 / 2 / 3 generated images + the exact spoken question) open with a `<p><em>Kijk naar het plaatje.</em></p>` (or `Kijk naar de plaatjes.` for two/three) context line and an `<hr>`; two or three images go in a flex `<div>` with the per-count image style from the Section 1 style tokens (48%/220px for two, 32%/180px for three), never the single-image 300px style:

```jsonc
{
  "id": "q5",
  "type": "speaking",
  "content": "<p><em>Kijk naar het plaatje.</em></p><hr style=\"margin: 1.5rem 0;\"><img src=\"{{EXAM_ASSETS_BASE_URL}}/speaking/a2/exam-1/<uuid>.jpg\" data-description=\"…what the image shows, in English…\" style=\"max-width: 300px; max-height: 260px; object-fit: contain; margin: 0.75rem 0; display: block;\" /><hr style=\"margin: 1.5rem 0;\"><p><strong>…exacte vraag…</strong></p>",
  "options": null,
  "correctAnswer": null,
}
```

A full mock = 16 tasks (4+4+4+4); `timeLimitMinutes: 35`. Not auto-scored: speaking is AI-graded (`grader.ts`, DUO model, 12 pts/task, pass 60%); the grader reads the `data-transcription` text and each image's `data-description` instead of the media, so the transcription must match the spoken prompt and the description must match what the final image actually shows. Anything the spoken question asks the candidate to describe must be named in the image prompt.

---

## 7. Generation checklist (the agent runs this every time)

1. **Identify** component + size (full exam vs N items) + any theme focus. If unclear, ask which component.
2. **Apply that component's structure exactly** (counts, time, options, format). Use the post-2025 rules: KNM = factual, 8 themes (**text-only in this app**); Spreken = 16 spoken tasks, no MC; Schrijven = 4 tasks, no sentence-completion.
3. **Calibrate to A2**: simple language, concrete everyday themes, one clear task per item, no argumentation; spread themes; balance question/task types.
4. **For MC components** (Lezen/Luisteren/KNM): one unambiguous answer + near-miss distractors; **distribute `correctAnswer` evenly across all option positions over the whole exam** (roughly a third each at 0/1/2, plus index 3 on 4-option items), never all the same position; tag KNM with theme + eindterm.
5. **For productive components** (Schrijven/Spreken): give explicit content points / exact prompts; set register (u/je); **do not auto-score**: present the official assessment criteria for self-check.
6. **Always in Dutch.** Emit the project JSON (Section 1), then generate the media: listening audio (`dutch-text-to-speech.md`), speaking images (`image-generation.md`), and speaking Part 1 talking-head videos (`video-generation.md`, from the Piper prompt audio + a Codex-generated presenter portrait), each with a UUID file name and a `{{EXAM_ASSETS_BASE_URL}}` reference. KNM stays text-only.
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
| **Spreken**   | Computer (record voice) | 35 min  | 16 tasks (4+4+4+4)   | video prompt + 1/2/3 images         | **AI (`grader.ts`)** | 60% of points                       |

_All A2, DUO, Wet inburgering 2021. DUO itself reports only pass/fail and publishes no raw cut score; the marks above are this app's thresholds in `src/lib/exam/scoring.ts`, used for the results UI. Real DUO Schrijven is pen-and-paper, but this app collects writing on computer and grades it with AI._
