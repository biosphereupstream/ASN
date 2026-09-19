# Run doc — ASN.NET website preview

Project: ASN.NET marketing site (monorepo). Active workspace for the preview: `frontend/`
(SvelteKit + Svelte 5 + Threlte/Three.js + Tailwind 4) + `backend/` (ElysiaJS + Drizzle +
in-process PostgreSQL via PGlite — PRD §10). There is no `.env` / `.env.local` to copy
from the main checkout; the backend needs no env vars in dev (PGlite is embedded and
`BACKEND_PORT` defaults to 3001).

## 1. Reproduce the artifacts

From the repository root (`C:\Users\Anindya\Documents\Apps\ASN`):

```bash
# 1) Install dependencies (Bun workspaces; root package.json wires frontend/)
#    Bun is not on PATH in this machine's Git-Bash; invoke it by full path:
"$HOME/.bun/bin/bun.exe" install

# 2) (Only if svelte-check/build tooling misbehaves) regenerate SvelteKit tsconfig:
cd frontend && "$HOME/.bun/bin/bun.exe" run prepare

# 3) Backend: apply migrations + seed on first boot (automatic when server starts,
#    but generated SQL lives in backend/drizzle — regenerate only after schema edits):
"$HOME/.bun/bin/bun.exe" run --cwd backend db:generate
```

DB note: dev uses PGlite (in-process Postgres; data lives in memory, re-seeded each boot).
Production PostgreSQL later = set DATABASE_URL and swap the driver in `backend/src/db/client.ts` (§10.4).

That is all — the dev server serves from source; no build artifacts are required for preview.

## 2. Run the server

Port: **5199** (hardcoded as default in `frontend/package.json` `dev` script; 3000/5173 were
avoided as commonly occupied ports). The server must bind `127.0.0.1`.

Two servers (start backend first so the frontend proxy has a target):

```bash
# 1) Backend — ElysiaJS on http://127.0.0.1:3001 (migrates + seeds on boot)
cd backend
"$HOME/.bun/bin/bun.exe" run dev

# 2) Frontend — SvelteKit on http://127.0.0.1:5199 (proxies /api/* → :3001)
cd frontend
"$HOME/.bun/bin/bun.exe" run dev --host 127.0.0.1 --port 5199
# → http://127.0.0.1:5199/
```

### Hero scene A/B variants (PRD §7.2)

The 3D hero has two scene concepts, switchable via query param (no reload needed between visits):

| URL | Scene |
|---|---|
| `http://127.0.0.1:5199/` or `?hero=a` | Concept A — fiber strands into chrome orb (default) |
| `http://127.0.0.1:5199/?hero=b` | Concept B — fiber globe with city nodes + connection arcs |

Production preview (alternative):

```bash
cd frontend && "$HOME/.bun/bin/bun.exe" run build
"$HOME/.bun/bin/bun.exe" run preview --host 127.0.0.1 --port 5199
```

Notes:
- Other threads/users may run dev servers; check the port first with
  `netstat -ano | findstr :5199` (or pick another free port and adjust the command flags).
- To stop: kill the pid (e.g. `taskkill /PID <pid> /F` on Windows).
