# Contributing

Thanks for helping. Issues and pull requests are welcome.

## Before you start

- For a bug, open an issue with the steps to reproduce it. For a larger change, open an issue first
  so we can agree on the approach before you write the code.
- Security problems go through a private report, not an issue: see [SECURITY.md](SECURITY.md).

## Setup

Follow the [Quick start](README.md#quick-start). The project uses **bun**; do not use npm or yarn.

## Making a change

- Follow [AGENTS.md](AGENTS.md). It holds the conventions for every change, for people and coding
  agents alike: UI patterns, copy rules, and where shared code lives.
- Run `make local` (format, lint, typecheck, test) and make it pass. CI runs the same checks.
- Keep a pull request to one change, and describe what it does and why.

## Exam content

New exams follow [docs/exam-format.md](docs/exam-format.md) and
[docs/a2-exam-generation.md](docs/a2-exam-generation.md). Never copy texts or questions from DUO's
own exams or from other publishers.

## License

By contributing, you agree that your contribution is licensed under the
[GNU Affero General Public License v3.0](LICENSE).
