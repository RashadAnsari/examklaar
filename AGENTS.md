<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-structure -->

## UI patterns

- **Forms**: always use `<form onSubmit={...}>` with `type="submit"` on the primary button so Enter on any field submits. Use `gap-6` between fields in every form — never `gap-4` or other values.
- **Field errors**: pass as `error` prop directly to `<Input>` so they render beneath the field. Never show field errors as standalone elements elsewhere.
- **Form-level errors** (e.g. Supabase API errors): use `<ErrorBanner>` from `@/components/ui/ErrorBanner` placed just above the `<form>` element. Pass `string | null` and clear in `onHide`. Auto-dismisses after 6 s.
- **Success feedback**: use `<SuccessBanner>` from `@/components/ui/SuccessBanner` — it auto-dismisses after 4 s. Pass a `string | null` state as `message` and clear it in `onHide`. Never use inline success `<p>` text.
- **Loading state**: disable the submit button and replace its label with a `…` suffix (e.g. `"Saving…"`) while a request is in flight.

## Routing & auth protection

- Auth-protected pages are guarded in `proxy.ts` (NOT `middleware.ts` — that convention is deprecated in this Next.js version; the function must be named `proxy`).
- Public paths: `/`, `/pricing`, `/terms`, `/privacy`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/*`.
- All other pages require a valid session; unauthenticated requests are redirected to `/login`.

## Package manager

- This project uses **bun**. Always use `bun` / `bunx` — never `npm`, `npx`, or `yarn`.

## Responsive design

- **Desktop is the priority**: design for desktop first. The desktop experience must never be degraded.
- **Mobile must work**: every UI change must also be considered for mobile (≤640px). Before finishing any component, verify that it does not break, overflow, or become unusable on a small screen.

## General rules

- No duplicate components: reuse existing ones with props rather than creating variants.
- **No duplicate code**: before writing a constant, function, or utility, search the codebase first. If it already exists, import it — never redefine it. Shared logic belongs in `src/lib/`. Shared UI belongs in `src/components/ui/`. Shared constants (`EXAMS_DIR`, etc.) live in the relevant lib file.
- **Punctuation**: no period on short labels, headings, button text, and single-phrase descriptions. Use a period on full sentences, especially multi-clause ones (FAQs, warnings, longer descriptions).

<!-- END:project-structure -->
