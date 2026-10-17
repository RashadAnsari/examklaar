# Project agent instructions

These rules are the source of truth for working in this repository. Always read and follow this file before making code changes or refactors.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## UI patterns

- **Forms**: always use `<form onSubmit={...}>` with `type="submit"` on the primary button so Enter on any field submits. Use `gap-6` between fields in every form — never `gap-4` or other values.
- **Field errors**: pass as `error` prop directly to `<Input>` so they render beneath the field. Never show field errors as standalone elements elsewhere.
- **Form-level errors** (e.g. server API errors): use `<ErrorBanner>` from `@/components/ui/ErrorBanner` placed just above the `<form>` element. Pass `string | null` and clear in `onHide`. Auto-dismisses after 6 s.
- **Success feedback**: use `<SuccessBanner>` from `@/components/ui/SuccessBanner` — it auto-dismisses after 4 s. Pass a `string | null` state as `message` and clear it in `onHide`. Never use inline success `<p>` text.
- **Loading state**: disable the submit button and replace its label with a `…` suffix (e.g. `"Saving…"`) while a request is in flight.

## Package manager

- This project uses **bun**. Always use `bun` / `bunx` — never `npm`, `npx`, or `yarn`.

## Responsive design

- **Desktop is the priority**: design for desktop first. The desktop experience must never be degraded.
- **Mobile must work**: every UI change must also be considered for mobile (≤640px). Before finishing any component, verify that it does not break, overflow, or become unusable on a small screen.

## Verification

- After every change, run `make local` (format, lint, typecheck, tests) and fix anything it reports before considering the work done.
- `typecheck` runs `next typegen` before `tsc`. Route types such as `PageProps<"/exams/[id]">` are generated into `.next/types`, not imported, so a bare `tsc --noEmit` on a clean checkout fails with "Cannot find name 'PageProps'".
- Tests run with `bun test`. Pure logic (access rules, redirect validation, the proxy routing table) is tested directly; route handlers are tested with a stub pool, see `test/stubPool.ts`. `test/setup.ts` neutralises `server-only` for the test runtime.

## General rules

- No duplicate components: reuse existing ones with props rather than creating variants.
- **No duplicate code**: before writing a constant, function, or utility, search the codebase first. If it already exists, import it — never redefine it. Shared logic belongs in `src/lib/`. Shared UI belongs in `src/components/ui/`. Shared constants (`EXAMS_DIR`, etc.) live in the relevant lib file.
- **Punctuation**: no period on short labels, headings, button text, and single-phrase descriptions. Use a period on full sentences, especially multi-clause ones (FAQs, warnings, longer descriptions).
- **Em dash**: never use the em dash character (—) in any user-facing text, copy, labels, or metadata. Use a colon, comma, or period instead.
