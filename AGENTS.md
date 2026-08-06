# AGENTS.md

Backend + frontend app that exposes LangChain/LangGraph AI agents via a FastAPI chat UI. No existing agent instruction files; README.md (Russian) is the only prose doc.

## Layout

- `app/` — FastAPI backend. Entrypoint `app/main.py` (starts at `uv run fastapi dev app`).
- `frontend/` — React 19 + Vite + TS, Material UI. Managed with **pnpm** (pnpm-lock.yaml; do not use npm).
- `tests/` — currently one placeholder (`tests/test_sample.py`); no real backend tests yet.
- `app/routers/agents.py` — registry of all agents (`AGENT_SECTIONS` / `AVAILABLE_AGENTS`) and mounts their routers.

## Commands

- Backend dev server: `uv run fastapi dev app` (root).
- Tests (matches CI `run-python-tests.yml`): `uv run pytest tests`. CI installs with `uv sync --locked --all-extras --dev`.
- Frontend dev: `pnpm dev` in `frontend/` (serves on :5173, the only CORS-allowed origin). Build: `pnpm build` (runs `tsc -b && vite build`).
- There is **no lint or formatter configured** for either side — don't invent commands.

## Environment (required to run backend)

Copy `.env` manually; README claims `.env.example` exists but it is **not in the repo**. Needed: `GROQ_API_KEY`, `SECRET_KEY`, `DB_NAME`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`.

- Requires a reachable **PostgreSQL** — `app/db/db.py` builds an async `postgresql+psycopg://` URL at import time, and `main.py` runs `Base.metadata.create_all` on startup (no Alembic/migrations). The app won't boot without a DB.
- `app/routers/ai_models.py` is a hardcoded static list; it is the source of truth for both `GET /models` and `chat_model_registry` (`init_chat_model("groq:<id>")`, which needs `GROQ_API_KEY`). Adding a model means editing that list.

## How agents work

- `personal_assistant/` — SSE-streaming endpoints (`/agents/assistant/{calendar,email,supervisor}`), tokens emitted via `app/sse.py`.
- `customer_support/` — one non-streaming JSON endpoint (`/agents/customer_support`) using LangGraph state schema + middleware + `InMemorySaver` checkpointer.
- To add an agent: create a router module under `app/<name>/app.py`, then register it in both `AGENT_SECTIONS` and `agents_router.include_router(...)` in `app/routers/agents.py`.

## Gotchas

- `Dockerfile` builds from `python:3.12-slim` but `pyproject.toml` / `.python-version` require **>=3.13** — `uv sync` in the container is currently broken. Local dev uses 3.13.
- `docker-compose.yml` only runs the prebuilt API image (no DB, no frontend) and is for the manual `deploy.yml` flow.
- Frontend `api.ts` hits `VITE_API_BASE_URL ?? http://localhost:8000`; no Vite proxy is configured.
- SSE streams have deliberate `asyncio.sleep(0.05)` per token and 2s tool-call pause — don't "fix" these.
