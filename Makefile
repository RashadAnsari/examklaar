dev:
	bun run dev

lint:
	bunx prettier --check "**/*.{ts,tsx,css,json,md}" --ignore-path .gitignore
	bun run lint
	bunx tsc --noEmit

format:
	bunx prettier --write "**/*.{ts,tsx,css,json,md}" --ignore-path .gitignore
	bun run lint --fix

migrate:
	bunx supabase db push --yes
