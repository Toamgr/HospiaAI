# RENDER EMERGENCY FIX — HESTIA build/deploy

Use this when a Render deploy fails **during build**. The most common cause is a
Node version mismatch: HESTIA builds with **Vite 8**, which requires
**Node >= 20.19.0 or >= 22.12.0**. If Render builds on Node 18 or 20.18, the
build fails.

## Required Render settings (verify in Dashboard)

| Setting | Required value |
| --- | --- |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Root Directory | **empty** — unless `package.json` is inside a subfolder, then set it to that subfolder |
| `NODE_VERSION` env var | `22.12.0` |

## Required environment variables (set in Dashboard only — never in the repo)

```
NODE_ENV=production
NODE_VERSION=22.12.0
GEMINI_API_KEY=<set in Render dashboard only>
MODEL=gemini-2.5-flash-lite
```

Optional (only if those features are exercised): `OPENAI_API_KEY`,
`REPLICATE_API_TOKEN`, `EMAIL_USER`, `EMAIL_PASS`.

## Node version — the usual root cause

The repo pins the runtime three ways so Render should pick it up:

- `package.json` -> `"engines": { "node": ">=20.19.0" }`
- `.node-version` -> `22.12.0`
- `render.yaml` / Dashboard env var -> `NODE_VERSION=22.12.0`

**If the build still fails, confirm `NODE_VERSION` in the Dashboard is NOT set to
Node 18 or 20.18.** A stale `NODE_VERSION` env var in the Dashboard overrides
`.node-version`. Set it to `22.12.0` (or remove it so `.node-version` is used).

## Root Directory

`package.json` for this service lives in the repository subfolder
`HOSPIA_LOCAL_APP/`. If the Render service is connected to the repo root, set
**Root Directory = `HOSPIA_LOCAL_APP`**. If the service is connected such that
the repo root already IS this folder, leave Root Directory empty. A wrong Root
Directory makes `npm ci` fail with "no package.json".

## Quick verification after a successful deploy

1. Open the public URL — the app loads at `/`.
2. Open `/api/health` — expect `{ "ok": true, "hasKey": true, ... }`.
   `hasKey: false` means `GEMINI_API_KEY` is not set in the Dashboard.
3. Refresh a deep link (e.g. `/events`) — it should reload the app, not 404.

## Do NOT

- Do not put real secret values in `render.yaml` or any tracked file
  (secrets use `sync: false`; set values only in the Dashboard).
- Do not add a `VITE_GEMINI_API_KEY` — `VITE_`-prefixed vars are compiled into
  the public browser bundle. The Gemini key is server-side only.
