# HESTIA — Claude Refactoring Execution Guide

**Date:** 2026-06-05  
**Purpose:** Working method for Claude Code when executing the refactoring plan. This is not the refactor itself. This is the protocol.

---

## 1. Operating Rules

These rules apply to every coding session during the refactor. They override default behavior.

1. **Read before editing.** Before changing any file, read its current contents. Never edit from memory.
2. **Never rewrite large areas blindly.** If a change affects more than 50 lines, plan it first and confirm with the product owner.
3. **Preserve UI and design.** Do not change class names, colors, layouts, or visual behavior unless explicitly asked. The goal is architecture, not redesign.
4. **Prefer small commits.** One logical change per commit. A commit that changes more than 3 files unrelated to the same fix is a sign the scope is too large.
5. **Never expose secrets.** Never print API keys, passwords, email addresses, or tokens in any output, report, or file.
6. **Never delete files unless clearly dead or explicitly approved.** Prefer archiving (`_archive/`) over deletion.
7. **Do not stage unrelated changes.** Run `git status` before staging. Only stage files that are part of the current task.
8. **Do not touch unrelated files.** If you notice something wrong in a file you are not currently editing, note it in the session report. Do not fix it in the same commit.
9. **Check git status before and after every change.**
10. **Do not modify localStorage key names** in `src/config/systemConfig.js` without a migration plan. The keys use the `hospia.*` prefix and changing them clears user data.

---

## 2. Required Workflow for Each Coding Session

Follow this exact sequence every session. Do not skip steps.

**Step 1 — Read the architecture map.**
Read `docs/architecture/REPOSITORY_ARCHITECTURE_MAP.md` before starting. It describes the current state of the repository.

**Step 2 — Read the refactoring plan.**
Read `docs/architecture/REFACTORING_MASTER_PLAN.md`. Identify which phase and task you are working on.

**Step 3 — Check current git status.**
```
git status
git log --oneline -10
```
Understand what is already done, what is staged, and what is in-progress.

**Step 4 — Identify the target phase and task.**
Confirm with the product owner which phase is active. Do not advance to the next phase automatically.

**Step 5 — Inspect relevant files.**
Before editing any file, read it. Read the files it imports. Understand the current behavior.

**Step 6 — Make minimal changes.**
Only change what is required for the current task. Do not refactor surrounding code unless it is part of the task.

**Step 7 — Run validation.**
After any code change, verify the app still works. Start the dev server. Test the affected feature. Check for console errors.

**Step 8 — Report exactly what changed.**
State: which files were edited, which files were only read, what specifically changed, what was intentionally left unchanged.

**Step 9 — Suggest a commit message.**
Format: `type(scope): short description`  
Types: `fix`, `feat`, `refactor`, `docs`, `security`, `chore`

**Step 10 — Do not proceed to the next phase without being asked.**
Complete one task. Report. Wait for the product owner to confirm before moving forward.

---

## 3. How to Handle Routing Work

The most complex part of this refactor is adding real URL routing. These rules apply to Phase 3.

- **Do not fake routing with internal state if real URLs are needed.** The goal is that `/bar/lab` in the browser address bar opens the Cocktail Lab — not that an internal variable says "cocktailLab".
- **Ensure refresh keeps the user on the same page.** After routing is added, test refresh on every major page.
- **Ensure unknown routes have a safe fallback.** Any unmatched URL should redirect to the user's home page (or `/login` if not authenticated), not show a blank screen.
- **Do not duplicate navigation logic.** After React Router is added, `useNavigationState` should be the adapter between React Router and the existing hook system — it should not maintain its own parallel routing state.
- **Do not break the GuestPortal.** `/event/:token/guest` is already a working real URL. The routing upgrade must preserve this behavior exactly.
- **Do not change the auth flow behavior.** Login must redirect to the intended page after authentication. Test this explicitly.

---

## 4. How to Handle Component Extraction

When extracting logic from a large component or service:

- **Extract logic only when it improves clarity.** A 200-line component that is clear is better than two 100-line components with unclear ownership.
- **Keep visual markup stable.** Never change JSX structure or class names when extracting logic.
- **Avoid changing CSS class names or Tailwind classes** unless the visual appearance needs to change (it does not, in this refactor).
- **Create smaller files only when ownership becomes clearer.** The question to ask is: "Does this extracted file have one clear purpose?" If no, the extraction is premature.
- **Update all import paths** after moving a file. Run a search for the old import path and replace all references.
- **Verify the build succeeds** after every extraction. A missing import causes a build error.

---

## 5. How to Handle Services

When working with service files:

- **Keep API clients, prompt builders, validation, calculations, and storage helpers outside visual components.** Components should call services, not implement them.
- **Name services by domain.** `cocktailPromptBuilder.js`, `shiftBrainService.js`, `eventsApi.js` — the name should tell you what domain and what kind of service it is.
- **Export only what is needed.** Do not use `export *` from service files. Named exports make it clear what the public API is.
- **Avoid circular dependencies.** Services can import utilities and domain files. Services must not import hooks. Hooks can import services.
- **When splitting `geminiCocktailAgent.js`:** The public API (the two exported async functions) does not change. Only the file structure changes. Any file that imports from `geminiCocktailAgent.js` does not need to be updated — leave a re-export shim.

---

## 6. How to Handle Docs

- **Update architecture docs when architecture changes.** After completing a phase, update `REPOSITORY_ARCHITECTURE_MAP.md` to reflect the new state.
- **Keep docs factual and current.** If a section no longer applies, update or remove it. Do not let docs drift from reality.
- **Do not write marketing language in technical docs.** Docs describe what the code does, not how good it is.
- **Do not create new doc files for ephemeral session notes.** Use git commit messages and PR descriptions for session context.

---

## 7. How to Report Progress

At the end of each task, provide this report. Do not skip sections.

```
## Session Report — [Phase] [Task name]

**Files changed:**
- path/to/file.js — what changed

**Files read (not changed):**
- path/to/file.js — why it was read

**What was improved:**
- [Specific improvement]

**What was intentionally not changed:**
- [Specific thing you considered but left alone, and why]

**Risks remaining:**
- [Any risk introduced or unresolved]

**Validation performed:**
- [What you tested and what you saw]

**Suggested next step:**
- [The next task from the plan]

**Suggested commit message:**
- `type(scope): description`
```

---

## 8. Stop Conditions

Claude must stop and ask the product owner before proceeding if the task would involve:

- **Major UI or design changes** — any change to layout, colors, component visual behavior, or copy that was not in the original task
- **Deleting large folders** — any deletion of more than 5 files at once requires confirmation
- **Changing the authentication or security model** — auth flow, token handling, CORS policy, or role definitions
- **Replacing the routing library** — if a different routing library than planned seems better, discuss before switching
- **Replacing the state management approach** — if the hook architecture needs to be abandoned or restructured beyond the plan
- **Touching secrets or environment configuration beyond what is specified** — do not add or remove `.env` variables beyond what Phase 1 specifies
- **Making changes that affect many unrelated modules at once** — if a planned change cascades into many files not in scope, stop and re-evaluate the approach

When stopping, explain:
1. What the task was
2. What was discovered that requires the stop
3. What options exist
4. What recommendation you have (if any)

---

## 9. Quick Reference — Key Files

| File | Purpose | Change frequency |
|------|---------|-----------------|
| `src/config/navigationConfig.js` | All page metadata and nav groups | When adding new pages |
| `src/config/roleConfig.js` | Permission rules | When adding new roles |
| `src/config/systemConfig.js` | localStorage keys, EmailJS config, API_BASE | Rarely |
| `src/hooks/useNavigationState.js` | Navigation state | Phase 3 (routing) |
| `src/hooks/useSessionState.js` | Auth state | Phase 3 or 6 |
| `src/App.jsx` | Composition + orchestration | Rarely — CLAUDE.md restricts this |
| `server.js` | All backend logic | Phase 4 (split) |
| `.env` | API keys and config | Phase 1 (security fix) |
| `src/services/geminiCocktailAgent.js` | AI cocktail generation | Phase 5 (split) |

---

## 10. Roles and Access Quick Reference

| Role | Main areas | Notes |
|------|-----------|-------|
| `employee` | employeeWorkflow, academy, employeeShifts, cocktailsMagazineArea | Mobile-first UX |
| `manager` | dailyOps, cocktailIntelligence, cocktailsMagazineArea | Also sees operations pages |
| `bar_manager` | barManagement, cocktailIntelligence, shiftOrganizer, staffArea, cocktailsMagazineArea | |
| `fb_director` | barManagement, cocktailIntelligence, staffArea, cocktailsMagazineArea | |
| `events_manager` | eventsArea, cocktailsMagazineArea | |
| `chef` | chefArea, cocktailsMagazineArea | |
| `owner` | command, planning, ownerIntelligence, system, cocktailIntelligence, staffArea, chefApproval, cocktailsMagazineArea | |
| `admin` | All areas | Developer/superuser role |

---

## 11. Naming Conventions

| Pattern | Convention |
|---------|-----------|
| Hook files | `use[Domain]State.js` or `use[Domain].js` |
| API client files | `[domain]Api.js` |
| Service files | `[domain]Service.js` or `[domain]Agent.js` |
| Feature components | `PascalCase.jsx` |
| Config files | `camelCase.js` |
| Route files (server) | `[domain].js` |
| localStorage keys | `hospia.[key]` (do not change) |

---

## 12. Validation Commands

```bash
# Start the full dev stack
npm run start

# Start only the backend
npm run server

# Start only the frontend
npm run dev

# Build the frontend
npm run build
```

After any code change, run `npm run start` and verify:
1. No console errors on startup
2. Login works
3. The affected feature works
4. Unrelated features are not broken
