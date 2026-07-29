# ---------- Development ----------

up:
	docker compose up -d

down:
	docker compose down

migrate:
	bun scripts/migrate.ts

db-shell:
	docker compose exec postgres psql -U examklaar -d examklaar

dev:
	bun run dev 2>&1 | grep --line-buffered -v "CleanUnusedInitializersAndNodeArgs"

# --------- Code quality ----------

local: format lint typecheck

lint:
	bun run lint
	bunx prettier --check "**/*.{ts,tsx,css,json,md}" --ignore-path .gitignore

format:
	bunx prettier --write "**/*.{ts,tsx,css,json,md}" --ignore-path .gitignore
	bun run lint --fix

typecheck:
	bun run typecheck
