# ---------- Development ----------

dev:
	bun run dev 2>&1 | grep -v "CleanUnusedInitializersAndNodeArgs"

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

# ---------- LLM server (for grading) ----------

start-local-llm:
	@export PATH="/Users/rashad/.lmstudio/bin:$$PATH"; \
	if ! command -v lms >/dev/null 2>&1; then \
		echo "Installing LM Studio CLI..."; \
		curl -fsSL https://lmstudio.ai/install.sh | bash; \
	fi; \
	if ! lms ls 2>/dev/null | grep -q "google/gemma-4-e2b"; then \
		echo "Downloading google/gemma-4-e2b..."; \
		lms get google/gemma-4-e2b --yes; \
	fi; \
	lms server start

stop-local-llm:
	lms server stop
