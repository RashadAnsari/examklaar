<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:code-review-graph -->

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool                        | Use when                                               |
| --------------------------- | ------------------------------------------------------ |
| `detect_changes`            | Reviewing code changes — gives risk-scored analysis    |
| `get_review_context`        | Need source snippets for review — token-efficient      |
| `get_impact_radius`         | Understanding blast radius of a change                 |
| `get_affected_flows`        | Finding which execution paths are impacted             |
| `query_graph`               | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes`     | Finding functions/classes by name or keyword           |
| `get_architecture_overview` | Understanding high-level codebase structure            |
| `refactor_tool`             | Planning renames, finding dead code                    |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

<!-- END:code-review-graph -->

<!-- BEGIN:project-structure -->

## UI patterns

- **Forms**: always use `<form onSubmit={...}>` with `type="submit"` on the primary button so Enter on any field submits. Use `gap-6` between fields in every form — never `gap-4` or other values.
- **Field errors**: pass as `error` prop directly to `<Input>` so they render beneath the field. Never show field errors as standalone elements elsewhere.
- **Form-level errors** (e.g. Supabase API errors): use `<ErrorBanner>` from `@/components/ui/ErrorBanner` placed just above the `<form>` element. Pass `string | null` and clear in `onHide`. Auto-dismisses after 6 s.
- **Success feedback**: use `<SuccessBanner>` from `@/components/ui/SuccessBanner` — it auto-dismisses after 4 s. Pass a `string | null` state as `message` and clear it in `onHide`. Never use inline success `<p>` text.
- **Loading state**: disable the submit button and replace its label with a `…` suffix (e.g. `"Saving…"`) while a request is in flight.

## Routing & auth protection

- Auth-protected pages are guarded in `proxy.ts` (NOT `middleware.ts` — that convention is deprecated in this Next.js version; the function must be named `proxy`).
- Public paths: `/`, `/pricing`, `/terms`, `/privacy`, `/login`, `/signup`, `/forgot-password`, `/auth/*`.
- All other pages require a valid session; unauthenticated requests are redirected to `/login`.

## Package manager

- This project uses **bun**. Always use `bun` / `bunx` — never `npm`, `npx`, or `yarn`.

## General rules

- No duplicate components: reuse existing ones with props rather than creating variants.
- **Punctuation**: no period on short labels, headings, button text, and single-phrase descriptions. Use a period on full sentences, especially multi-clause ones (FAQs, warnings, longer descriptions).

<!-- END:project-structure -->
