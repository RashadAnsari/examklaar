# ---------- Development ----------

dev:
	bun run dev 2>&1 | grep --line-buffered -v "CleanUnusedInitializersAndNodeArgs"

# --------- Code quality ----------

lint:
	bun run lint
	bunx prettier --check "**/*.{ts,tsx,css,json,md}" --ignore-path .gitignore

format:
	bunx prettier --write "**/*.{ts,tsx,css,json,md}" --ignore-path .gitignore
	bun run lint --fix

# ---------- Database ----------

migrate:
	bunx supabase db push --yes
