# Reference examples (official DUO A2 exams)

[Documentation index](../README.md)

The exam generation skill and the exam reviewer read real official A2 exams from this folder, one or
more per component:

- `reading-a2-exam-*.json` (Lezen)
- `listening-a2-exam-*.json` (Luisteren)
- `knm-exam-*.json` (KNM)
- `writing-a2-exam-*.json` (Schrijven)
- `speaking-a2-exam-*.json` (Spreken)

They are DUO's material, so they are not in this repository and `.gitignore` keeps them out. To
generate exams, put your own copies here in the [exam JSON format](../exam-format.md).

## What these are for

They exist to **inspire**, not to be reused. When generating a new exam, read the matching example
to feel the real thing: the tone and register of the Dutch, sentence length and difficulty, how a
question is framed, how distractors are shaped, how a text/fragment/task is structured, and how the
JSON and its HTML `content` are laid out.

## Rules

- **Inspiration only. Do not copy.** Never reuse a text, question, option, scenario, name, or number
  from these files. Produce fresh content that merely matches their level and style.
- **Gather everything else yourself.** These examples do not teach you the A2 vocabulary range, the
  DUO facts, the KNM themes and eindtermen, current fees or officials, or the latest format rules.
  The generation runbook ([`../a2-exam-generation.md`](../a2-exam-generation.md)) gives a starting
  point, but you are expected to research and verify the rest from authoritative sources
  (`inburgeren.nl`, `duo.nl`) before writing.
- **Never commit them.** They are official exam items.
