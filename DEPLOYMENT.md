# HESTIA — Public Demo Deployment Guide

This deploys HESTIA as a **single Node web service**: Express serves the built
React frontend from `/dist` and also exposes the `/api/*` backend on the same
origin. No Vite dev server runs in production.

> **Scope:** This is a demo / public-review deployment (e.g. for a lecturer to
> open and inspect). It is **not** production-grade security. See *Demo access*
> and *Security* below.

---

## 1. Recommended fastest path

Use a **Render** (or Railway) **Node Web Service**. Both build the repo, run one
Node process, and give you one public HTTPS URL. Render is used in the examples.

## 2. Build & start commands

| Setting | Value |
| --- | --- |
| Build command | `npm ci && npm run build` |
| Start command | `npm start`  (runs `node server.js`) |
| Node version | **20.19+ or 22.12+ (Vite 8 requirement)** — pin `NODE_VERSION=22.12.0`. Node 18 / 20.18 **fail the build**. |

`npm run build` produces `/dist`. `npm start` runs the Express server, which in
production serves `/dist` and falls back to `dist/index.html` for any non-`/api`
route (so refreshing a deep link like `/events` does **not** 404).

## 3. Required environment variables (set in the hosting dashboard ONLY)

| Variable | Value | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | **Required** — without it Express will not serve the frontend. |
| `GEMINI_API_KEY` | *your server-side Gemini key* | Server-side only. Never `VITE_`-prefixed. |
| `MODEL` | `gemini-2.5-flash-lite` | Optional; defaults exist in code. |
| `PORT` | *(leave unset)* | The host injects `PORT`; the server reads it. Only set for local prod tests. |

Optional (only if you exercise those features in the demo):

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Legacy/secondary AI provider. |
| `REPLICATE_API_TOKEN` | Image generation. |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail SMTP for report emails. |

## 4. What NOT to set / NOT to commit

- ❌ **No `VITE_GEMINI_API_KEY`** (or any real secret in a `VITE_` variable).
  Anything prefixed `VITE_` is compiled into the public browser bundle and is
  readable by anyone. The frontend never sees the Gemini key — it calls the
  backend, which holds the key server-side.
- ❌ **No secrets in React/`src` files.**
- ❌ **Never commit `.env`.** It is git-ignored; keep it that way.
- ✅ Only `.env.example` (placeholders) is committed.

## 5. Deploy steps (Render / Railway-style Node web service)

1. Push this repo to GitHub (after the security steps below).
2. Create a new **Web Service** and connect the repo.
3. Set **Build command**: `npm ci && npm run build`
4. Set **Start command**: `npm start`
5. Add the environment variables from section 3 **in the dashboard** (not in the repo).
6. Deploy. Use the provided public HTTPS URL.

## 6. Post-deploy checks

1. Open the public URL — the HESTIA app loads at `/`.
2. Log in with a demo access code (see *Demo access*).
3. Open `/api/health` — expect `{ "ok": true, "hasKey": true, ... }`.
   `hasKey` is a boolean only; it never reveals the key or the variable name.
   If `hasKey` is `false`, `GEMINI_API_KEY` is not set in the dashboard.
4. Trigger one AI action (e.g. an AI panel / cocktail generation) and confirm a response.
5. Navigate to a frontend route and **refresh the page** — it should reload the
   app, not 404 (SPA fallback working).

## 7. Demo access (NOT production security)

Login is validated server-side, but the access codes are **hardcoded demo
codes** seeded into the database — this is **not real authentication**. Anyone
with a code can enter. Do not treat this as secure.

Suggested demo login for a lecturer:

| Role | Access code |
| --- | --- |
| Owner | `TM002` |
| Manager | `PN004` |
| Admin | `TG001` |

If you want to change or restrict these before sharing, edit the seeded users in
`server.js` (search `access_code`). For a public demo, prefer sharing only the
**owner** code (`TM002`).

## 8. EmailJS note (frontend public keys)

`src/config/systemConfig.js` contains EmailJS `serviceId` / `templateId` /
`publicKey`. These are **browser public keys** — EmailJS is designed to expose
them client-side, so they are **not** server secrets. They are, however, still
abusable (someone could send email through your template/quota), so treat them
as demo-only. They do not block the deploy and are not equivalent to leaking a
real API key. To fully lock them down later, move email sending behind a backend
route.

## 9. Security — MUST DO before public deploy

- **Rotate/revoke any key that was ever committed, uploaded, pasted, or exposed.**
  Even though `.env` is not tracked in this repo and never was, rotate any key
  that has been shared in chats, screenshots, or elsewhere.
- Generate a **new** server-side `GEMINI_API_KEY` (and other keys) *after* the
  repo is clean, and set it only in the hosting dashboard.
- **Restrict API keys** where the provider supports it (HTTP referrer / IP /
  API restrictions in the Google AI / Cloud console).
- Never paste real keys into `.env.example`, README, or any tracked file.
