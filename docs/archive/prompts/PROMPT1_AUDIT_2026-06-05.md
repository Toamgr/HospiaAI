You are working on my HESTIA repository.

This is a serious architecture/refactoring task. Do not start by changing code. First, understand the repository deeply.

My goal is not a UI redesign. Keep the existing visual language, design direction, styling, and product feel unless there is a clear technical reason to reorganize code. The goal is to improve architecture, routing, maintainability, reliability, page structure, state handling, and developer clarity.

Important:
- Do not rely on assumptions from prior conversations.
- Treat the repository itself as the source of truth.
- Read the codebase carefully and infer the actual current architecture.
- Do not invent features or describe systems that are not really present.
- Do not expose secrets, API keys, tokens, or environment values in any report.
- If you find secrets committed or present in unsafe places, report that as a security issue without printing the values.

Core problem I want solved:
The app should not behave like everything is running from one giant main page. It should have a proper page/module architecture. Users must be able to refresh the browser on a specific page and stay on that page, instead of the app resetting, rerunning the wrong main flow, or losing navigation context. Routing, layout boundaries, page ownership, and state persistence need to be reviewed seriously.

Your task has three deliverables before writing implementation code.

---

# DELIVERABLE 1 — Repository Architecture Map

Create a Markdown file:

`docs/architecture/REPOSITORY_ARCHITECTURE_MAP.md`

This document should explain the repository as it actually exists today.

Include:

1. High-level overview
   - What kind of app this is.
   - Main frontend/backend structure.
   - Main entry points.
   - Main runtime flow.
   - Main data flow.

2. Folder-by-folder map
   - Explain each important folder.
   - Explain what belongs there.
   - Explain what currently feels misplaced, duplicated, or unclear.

3. Page and routing architecture
   - Identify all pages/routes/views/modules.
   - Explain how navigation currently works.
   - Explain whether routing is real URL routing, internal state navigation, or a hybrid.
   - Identify what breaks or resets on refresh.
   - Identify where routing should be improved.

4. Component architecture
   - Identify large components that are doing too much.
   - Identify components that mix UI, business logic, API calls, state, and persistence.
   - Identify reusable components that are good and should be preserved.
   - Identify duplicated components or patterns.

5. Services and business logic
   - Identify service files.
   - Identify where business logic currently lives.
   - Identify logic that should move out of components.
   - Identify AI-related logic, prompt builders, parsing, validation, and API calls.

6. State and persistence
   - Identify local state, global state, localStorage/sessionStorage usage, server persistence, and API persistence.
   - Explain what state must survive refresh.
   - Explain what state should not survive refresh.
   - Identify fragile or duplicated persistence logic.

7. Backend/API architecture
   - Identify server entry points.
   - Identify API routes.
   - Identify data storage approach.
   - Identify security/auth patterns.
   - Identify any API routes that are too broad, unsafe, duplicated, or unclear.

8. Security and environment review
   - Check for exposed secrets, unsafe client-side keys, hardcoded credentials, .env misuse, or accidental sensitive files.
   - Do not print the secret values.
   - Recommend what should be moved server-side, rotated, ignored, or documented.

9. Build/dev/deployment assumptions
   - Explain scripts, package structure, build tools, and how the app appears to run.
   - Identify anything confusing or risky.

10. Architecture strengths
   - What is already good and should not be destroyed.

11. Architecture risks
   - What will become dangerous as the app grows.

This document must be specific and file-referenced. Mention exact files and folders.

---

# DELIVERABLE 2 — Full Refactoring Plan

Create a second Markdown file:

`docs/architecture/REFACTORING_MASTER_PLAN.md`

This should be a practical refactoring plan for the whole project.

Important constraints:
- Do not redesign the UI.
- Do not rewrite the app from scratch.
- Do not change the product language or visual identity.
- Do not break working features.
- Refactor incrementally.
- Each step should be safe, reviewable, and commit-sized.
- Prefer improving architecture around the existing product rather than replacing it.

The plan should include:

1. Refactoring goals
   - Proper page/module architecture.
   - Better routing.
   - Refresh-safe navigation.
   - Cleaner folder structure.
   - Better separation between UI, services, business logic, prompts, API calls, and persistence.
   - Safer environment/secrets handling.
   - Easier future development.

2. Target architecture
   Propose a better structure, for example:
   - `src/app`
   - `src/pages`
   - `src/features`
   - `src/components`
   - `src/services`
   - `src/lib`
   - `src/hooks`
   - `src/data`
   - `src/styles`
   - `src/routes`
   - `server`
   - `docs`

   But only recommend this if it fits the actual repo. Do not force a generic structure if the repo suggests a better one.

3. Routing plan
   - Explain how the app should support real page URLs.
   - Explain how each major page/module should be routed.
   - Explain what should happen on browser refresh.
   - Explain how selected page, selected tab, selected event, selected lesson, or selected module state should be represented.
   - Explain what belongs in the URL vs localStorage vs backend.

4. Module/page ownership plan
   - For each major feature/module, define where its page component should live.
   - Define where its child components should live.
   - Define where its services should live.
   - Define where its data and constants should live.
   - Define what should be extracted.

5. State management plan
   - Identify state that should be local component state.
   - Identify state that should be route params/query params.
   - Identify state that should be persisted.
   - Identify state that should be fetched from backend.
   - Identify state that should never be persisted.

6. Service extraction plan
   - Move API calls out of components.
   - Move business rules out of UI files.
   - Move AI prompt building into dedicated services.
   - Move validation/parsing into dedicated utilities.
   - Keep components focused on rendering and user interaction.

7. Backend/API plan
   - Organize backend routes clearly.
   - Separate route handlers, validation, services, storage, and auth.
   - Protect sensitive AI proxy routes.
   - Prevent client exposure of server-only keys.

8. File cleanup plan
   - Identify empty files.
   - Identify dead files.
   - Identify duplicate files.
   - Identify archive candidates.
   - Identify files that should be renamed.
   - Identify files that are too large and should be split.

9. Safety plan
   - How to avoid breaking working features.
   - What to test after each step.
   - What files are risky.
   - What should not be touched without explicit confirmation.
   - How to keep commits small and reversible.

10. Suggested implementation phases
   Create phases like:
   - Phase 0: Baseline audit and safety
   - Phase 1: Routing and refresh safety
   - Phase 2: Folder/module structure
   - Phase 3: Service extraction
   - Phase 4: Backend/API cleanup
   - Phase 5: State persistence cleanup
   - Phase 6: Dead code and docs cleanup
   - Phase 7: Final validation

   For each phase include:
   - Goal
   - Files likely involved
   - Exact tasks
   - Risks
   - Validation checklist
   - Suggested commit message

11. Definition of done
   - What must be true when the refactor is complete.

This plan must be practical enough that we can execute it step by step with Claude Code later.

---

# DELIVERABLE 3 — Claude Implementation Approach Plan

Create a third Markdown file:

`docs/architecture/CLAUDE_REFACTORING_EXECUTION_GUIDE.md`

This file should explain exactly how Claude Code should approach the actual refactor later.

This is not the refactor itself. This is the working method.

Include:

1. Operating rules
   - Always inspect before editing.
   - Never rewrite large areas blindly.
   - Preserve UI/design unless explicitly asked.
   - Prefer small commits.
   - Do not expose secrets.
   - Do not delete files unless clearly dead or explicitly approved.
   - Do not stage unrelated local changes.
   - Do not touch unrelated files.
   - Always check git status before and after changes.

2. Required workflow for each future coding session
   - Read the architecture map.
   - Read the refactoring master plan.
   - Check current git status.
   - Identify target phase/task.
   - Inspect relevant files.
   - Make minimal changes.
   - Run validation.
   - Report exactly what changed.
   - Suggest commit message.
   - Do not proceed to the next phase automatically unless asked.

3. How to handle routing work
   - Do not fake routing with only internal state if real URLs are needed.
   - Ensure refresh keeps the user on the same page.
   - Ensure unknown routes have a safe fallback.
   - Ensure navigation config and route definitions are not duplicated unnecessarily.

4. How to handle component extraction
   - Extract logic only when it improves clarity.
   - Keep visual markup stable.
   - Avoid changing class names/styles unless required.
   - Create smaller files only when ownership becomes clearer.

5. How to handle services
   - Keep API clients, prompt builders, validation, calculations, and storage helpers outside visual components.
   - Name services by domain.
   - Add clear exports.
   - Avoid circular dependencies.

6. How to handle docs
   - Update architecture docs when architecture changes.
   - Keep docs factual and current.
   - Do not write marketing language in technical docs.

7. How to report progress
   Each report should include:
   - Files changed
   - Files read
   - What was improved
   - What was intentionally not changed
   - Risks remaining
   - Validation performed
   - Suggested next step

8. Stop conditions
   Claude should stop and ask before:
   - Major UI/design changes
   - Deleting large folders
   - Changing authentication/security model
   - Replacing routing library
   - Replacing state management approach
   - Touching secrets/env/deployment configuration beyond documenting risks
   - Making changes that affect many unrelated modules at once

---

# AFTER CREATING THE THREE MARKDOWN FILES

After the three documents are created, provide a final report in the chat with:

1. The exact files created.
2. A short summary of what each file contains.
3. The top 10 architecture/refactoring issues discovered.
4. The recommended first coding phase.
5. Any security issues found, without printing secret values.
6. Confirmation that no product UI redesign was performed.
7. Confirmation whether any code files were changed. Ideally, for this task, code files should not be changed.

Do not implement the refactor yet unless I explicitly ask.


---

# IMPORTANT — QUESTIONS FOR THE PRODUCT OWNER

After completing the three Markdown files and the final report, add a final section called:

`Questions for the Product Owner`

In this section, ask any important questions that came up while reviewing the repository.

Important rules for the questions:
- Do not ask deeply technical questions that only a developer would understand.
- Do not ask the user to decide implementation details such as libraries, file structure mechanics, state-management internals, routing internals, build tooling, or code patterns.
- If the question is technical, make a professional recommendation yourself instead of asking the user.
- Only ask questions that relate to product behavior, business logic, user experience expectations, operational workflows, permissions, data ownership, content rules, or important decisions about how the software should behave.
- Ask broad, clear, human questions.
- Phrase the questions in a way that a non-technical product owner can answer.
- Group the questions by topic if there are many.

Good examples:
- “When a user refreshes the page inside an event, should they return to the exact selected event and table, or only to the event overview?”
- “Which parts of the system should feel private to managers only?”
- “Should employees see only their own shifts/tasks, or also team-wide information?”
- “Which modules are most important to preserve exactly as they are during refactoring?”
- “Are there any workflows that must never be interrupted even if the architecture changes?”
- “Which data should be remembered between sessions, and which should reset every time?”

Bad examples:
- “Should we use React Router or another routing library?”
- “Should state be stored in context or Zustand?”
- “Should this component be split into hooks?”
- “Should we normalize the folder structure?”
- “Should API handlers be moved into separate controllers?”

If a question has a clear technical answer, do not ask it. Decide professionally, document the decision, and explain the reasoning briefly.


The user is the product owner, not the technical architect. Protect the user from unnecessary technical decisions. Ask only the questions that affect how HESTIA should behave as a product.


```markdown
---

# Markdown Documentation Cleanup

As part of the repository audit and refactoring plan, review all existing `.md` files in the repository.

The goal is to keep the documentation clean, current, and useful.

Important rules:
- Do not delete Markdown files automatically unless they are clearly irrelevant, outdated, duplicated, empty, misleading, or no longer connected to the current repository.
- Be very careful with Markdown files that contain useful architecture notes, implementation history, product decisions, research, audits, or handoff context.
- If a Markdown file is still relevant, preserve it.
- If a Markdown file is partially useful but messy or outdated, recommend updating or archiving it instead of deleting it.
- If a Markdown file is clearly obsolete but may still have historical value, move it to an appropriate archive folder instead of deleting it.
- Only delete Markdown files that are clearly safe to remove.
- Before deleting or moving any Markdown file, document the reason.

Create a Markdown documentation inventory inside:

`docs/architecture/MARKDOWN_DOCUMENTATION_AUDIT.md`

For each important `.md` file, include:
- File path
- Current purpose
- Status: Keep / Update / Archive / Delete
- Reason
- Risk level of changing/removing it

Rules for deletion:
- Delete only files marked as `Delete`
- Do not delete files marked as `Keep`, `Update`, or `Archive`
- If there is any doubt, do not delete the file
- Prefer archiving over deleting when the file may contain useful history
- Do not remove documentation that helps Claude or future developers understand the system

After the cleanup, report:
1. Markdown files kept
2. Markdown files recommended for update
3. Markdown files archived
4. Markdown files deleted
5. Markdown files that should not be touched
6. Any documentation gaps that should be filled later
```
