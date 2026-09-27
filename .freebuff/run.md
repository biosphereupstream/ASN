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

## 3. Admin back-office (PRD §13 / FR-7)

Routes: `/admin/login`, `/admin/leads` (inbox), `/admin/coverage` (CRUD), `/admin/demand`.
Guard: SvelteKit server-side (`hooks.server.ts` → backend `/api/admin/me`); the whole
`/admin` tree redirects to `/admin/login?next=…` when the session cookie is invalid.

Dev credentials (seeded by `backend/src/db/seed.ts`; argon2id hashes):

| Email | Password | Role | Can |
|---|---|---|---|
| `admin@asn.net` | `admin123` | admin | leads + coverage + prices |
| `sales@asn.net` | `admin123` | sales | leads only (coverage returns 403) |

Override the admin password with `ADMIN_PASSWORD=…` before first boot (fresh DB).
Sessions are server-side records (`admin_sessions`, token-hash + expiry); the cookie holds
only the opaque token. PGlite is in-memory, so a backend restart logs everyone out.

Backend API (all session-guarded, under `/api/admin`): `POST /login`, `POST /logout`,
`GET /me`, `GET/PATCH /leads`, `POST /leads/bulk`, `GET /leads/export.csv`,
`GET/PUT /coverage/:cityId/:districtId`, `POST /coverage/bulk`, `POST /cities`,
`POST /districts`, `GET /demand`, `GET/PATCH /prices`.

## 4. Public lead capture (PRD FR-4 / FR-5.1)

Routes: `/daftar` (lead form, URL prefill: `?package=fiber-100&city=kota-bekasi&district=bekasi-timur&source=package_card`)
and `/request-area` (waitlist for not-available districts, prefilled from the checker's
Request Area / waitlist links). The homepage checker's package rows and the Flow-C banner
link to both.

Public API (no session): `POST /api/leads` (validation, UU PDP consent required,
phone normalized to E.164 +62, honeypot `website` field, per-IP rate limit 5/min +
10/hour, duplicate detection same phone+city within 30 days → stored with `duplicateOf`,
Cloudflare Turnstile verified when `TURNSTILE_SECRET_KEY` is set) and
`POST /api/area-requests` (same protections; repeat request within 30 days returns
grace `ok:true` with the original id). Errors are friendly `422` codes (`INVALID_*`,
`CONSENT_REQUIRED`), `429` rate-limited; honeypot hits pretend success.

Public submissions land in `/admin/leads` with their source tag; area requests appear
in `/admin/demand` per-district counts.

Seed demo users to trigger the public form: e.g. `Sinta Dewi / 0812-9876-5432`
(Bekasi Timur) — beware per-IP rate limits when testing repeatedly.
