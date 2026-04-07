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

# Never use this in production, it drops all data!
migrate-reset:
	bunx supabase db query --linked --yes "delete from supabase_migrations.schema_migrations;"
	bunx supabase db push --yes

seed:
	@test -n "$(USER_ID)" || (echo "Error: USER_ID is required. Usage: make seed USER_ID=<uuid>"; exit 1)
	sed 's/USER_ID_PLACEHOLDER/$(USER_ID)/g' supabase/seed.sql > /tmp/examklaar_seed.sql
	bunx supabase db query --linked --file /tmp/examklaar_seed.sql
	rm /tmp/examklaar_seed.sql
