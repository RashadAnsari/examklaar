<div align="center">

<img src="../public/examklaar-logo.svg" alt="ExamKlaar" width="72" height="72" />

# ExamKlaar documentation

Everything needed to author exam content, generate its media, and run the app in production.

[![Exams](https://img.shields.io/badge/practice_exams-25-1b6b4a)](../src/data/exams)
[![Level](https://img.shields.io/badge/level-A2-1b6b4a)](./a2-exam-generation.md)
[![Guides](https://img.shields.io/badge/guides-9-1b6b4a)](#authoring-exam-content)

[**Back to the project README**](../README.md) · [**Repository conventions**](../AGENTS.md)

</div>

---

## Authoring exam content

Start here when adding or changing an exam.

| Guide                                                 | What it covers                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [Exam JSON format](./exam-format.md)                  | Directory layout, file naming, the schema, per-skill conventions, embedding media, and scoring  |
| [A2 exam generation runbook](./a2-exam-generation.md) | The single source of truth for generating a standard A2 exam for any of the five components     |
| [Reference example exams](./examples/README.md)       | Real official DUO A2 exams, kept as a fixed calibration reference, plus where their media lives |

## Generating exam media

Three local, free, offline pipelines. Media is generated once at authoring time and uploaded to the
asset bucket, so none of this tooling ships in the app or runs at request time.

| Guide                                             | Produces                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Dutch text-to-speech](./dutch-text-to-speech.md) | MP3 audio from Dutch text, with several distinct voices for multi-speaker dialogues |
| [Image generation](./image-generation.md)         | PNG scene images from the Dutch scene text, on Apple Silicon                        |
| [Video generation](./video-generation.md)         | Lip-synced MP4 talking-head video for the speaking Part 1 prompts                   |

The video pipeline chains the other two: it takes the spoken prompt from the text-to-speech guide and
the presenter portrait from the image guide.

## Running the app

| Guide                                                     | What it covers                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Infrastructure](./infrastructure.md)                     | Database and migrations, auth, storage, billing modes, environment         |
| [Deployment](./deployment.md)                             | The two compose stacks, the workflows that drive them, backups and restore |
| [Testing payment webhooks](./testing-payment-webhooks.md) | Receiving real Paddle webhooks against a local dev server through a tunnel |

## Conventions

[`AGENTS.md`](../AGENTS.md) is the source of truth for how changes are made in this repository: UI
and form patterns, copy and punctuation rules, the package manager, responsive priorities, and the
verification gate. It applies to people and to coding agents alike.
