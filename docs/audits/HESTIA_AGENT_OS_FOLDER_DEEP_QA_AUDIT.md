# HESTIA Agent OS Folder - Deep QA Audit

Audit date: 2026-06-21  
Mode: read-only QA / documentation / architecture critique  
Report file created: `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md`  
Production code changed: no  
Target scope: `.agents/`, `skills/user/`, `.claude/settings.local.json`, `skills-lock.json`, and directly related governance docs.

## 0. Executive Summary

Verdict: use with changes.

This is not production application code. It is an Agent OS / skill governance layer for helping Claude Code or Codex work on HESTIA without drifting into generic SaaS, chatbot-first UX, decorative luxury, fake intelligence, or disconnected new modules.

The strongest part is the HESTIA-specific `skills/user/` pack. It repeatedly enforces the right doctrine: hospitality-first, evidence-bound intelligence, venue boundaries, role-aware visibility, manual-only prototypes, no automatic Venue DNA mutation, and connect-before-build. The pack is directionally right and useful now.

The weakest part is that most of the guardrails are still prose. They influence an agent that reads them, but they do not mechanically prevent a bad change. The existing `scripts/hestia-check.js` is useful but not a complete Agent OS QA layer. It does not yet enforce skill routing, fake-data detection across the full repo, old HOSPIA naming, Venue DNA mutation safety, role-scope leaks, or recommendation/memory ledger contracts.

The `.agents/` folder is more dangerous. It contains two external "taste skills" from `Leonxlnx/taste-skill`: `high-end-visual-design` and `imagegen-frontend-web`. They are good as inspiration, but they conflict with HESTIA if used by default. They push Awwwards-style visual ambition, image-led marketing compositions, huge spacing, glass effects, blobs/orbs, banned Lucide icons, and broad website/landing-page logic. HESTIA needs operational truth first. These should remain manual-only, never the default production design authority.

The real missing piece is an executable Agent OS contract:

```text
Evidence
-> Signal
-> Interpretation
-> Recommendation
-> Human Decision
-> Outcome
-> Memory / Learning
```

The docs describe this chain well. The skills enforce it rhetorically. The repo still needs schemas, ledgers, tests, and hooks/checks that make the chain unavoidable.

## 1. Verified Scope

Verified in repo:

- `.agents/skills/high-end-visual-design/SKILL.md`
- `.agents/skills/imagegen-frontend-web/SKILL.md`
- `skills/user/*.md` HESTIA skill pack
- `.claude/settings.local.json`
- `skills-lock.json`
- `docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md`
- `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md`
- `docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md`
- `docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md`
- `CLAUDE.md`
- `scripts/hestia-check.js`
- `package.json`
- required memory/source-of-truth files:
  - `memory/project_hestia_master_memory.md`
  - `docs/HESTIA_MASTER_STATE.md`
  - `docs/HESTIA_ARCHITECTURE_AUDIT.md`
  - `docs/HESTIA_CTO_ROADMAP.md`
  - `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md`
  - `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md`

Not inspected:

- `.env` values were not read.
- Runtime database contents were not opened.
- No package was installed.
- No zip was extracted. No zip target was found in the provided scope.

Target folder path:

```text
C:\Users\toamg\Desktop\Hospia AI 01.05.2026\HOSPIA_LOCAL_APP
```

Target is inside the HESTIA repo.

## 2. Repository / Folder State

Requested command results:

| Command | Result |
| --- | --- |
| `pwd` / `Get-Location` | `C:\Users\toamg\Desktop\Hospia AI 01.05.2026\HOSPIA_LOCAL_APP` |
| `ls -la` / `Get-ChildItem -Force` | Repo contains `.agents`, `.claude`, `.git`, `.local-artifacts`, `data`, `dist`, `docs`, `memory`, `node_modules`, `prototypes`, `scripts`, `skills`, `src`, root config files, logs, `server.js`, package files. |
| `git status --short` | No changed files printed, but Git warned: `unable to access 'C:\Users\toamg/.config/git/ignore': Permission denied`. |
| `git branch --show-current` | `main` |
| `git log --oneline -5` | `cddeca5 docs: add HESTIA Research Brain gem knowledge packs`; `6f5f2c5 docs: sync CLAUDE.md with Phase 1 nav posture`; `d1527b8 feat: make HESTIA AI the owner home`; `6089a6e docs: add roadmap codebase audit`; `1d60873 docs: add AI bar intelligence roadmap` |

Latest commit hash:

```text
cddeca5
```

Working tree before this audit report:

- No changed files printed by `git status --short`.
- Git emitted a user-level ignore permission warning.

Working tree after this audit report:

- This report file was created under `docs/audits/`.
- No production code was changed.

## 3. File Inventory

| File / folder | Purpose | Likely user | Type | Safety | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `.agents/skills/high-end-visual-design/SKILL.md` | External high-end visual taste skill. Pushes premium agency UI, motion, glass, bento, cinematic rhythm. | Codex / Claude for visual exploration. | External design skill. | Medium risk. Conflicts with HESTIA UI rules: bans Lucide while app uses lucide, encourages large radii, cinematic motion, orbs/glass. | Keep external/manual-only. Do not copy into HESTIA doctrine. Use only for non-production visual exploration after HESTIA UI gate. |
| `.agents/skills/imagegen-frontend-web/SKILL.md` | External image generation direction for marketing/site section reference images. | Codex / image generation workflows. | External image/design skill. | Medium-high risk. Optimized for landing pages and visual comps, not operational app truth. | Keep manual-only. Use only for inspiration artifacts, not production HESTIA UI or intelligence surfaces. |
| `skills-lock.json` | Records external skill sources and hashes from `Leonxlnx/taste-skill`. | Maintainers / skill installer. | Config / provenance lock. | Safe as metadata. | Keep. Useful because it proves `.agents` skills are external taste imports, not doctrine. |
| `.claude/settings.local.json` | Local Claude permissions allowlist. | Claude Code local runtime. | Tool permission config. | Risky if copied blindly. Allows broad read paths, `npm run *`, git add/commit/push, curl login, kill/fuser commands, and opening prototype. | Do not copy as-is into shared repo defaults. Treat as local machine config only. Tighten if making project policy. |
| `skills/user/hestia-skills-orchestrator/SKILL.md` | Skill router and operating gate. Chooses skill sequence, blocks generic redesign, fake data, visual-first work, prototype shortcuts. | Claude Code / Codex. | Agent OS skill. | Safe and valuable, but prose-only. | Keep and promote as first skill. Add executable checklist/tests later. |
| `skills/user/hestia-product-design-judgment/SKILL.md` | Product doctrine: HESTIA as hospitality OS, not dashboard/chatbot/SaaS. Feature fit test, copy, architecture judgment. | Claude Code / Codex / product reviewer. | Product governance skill. | Safe and high value. | Use as core gate for product, UX, copy, architecture. |
| `skills/user/hestia-hospitality-intelligence/SKILL.md` | Hospitality operator judgment: guest journey, event DNA, service recovery, F&B, wine, accessibility, memory. | Domain reasoning agent. | Domain skill. | Safe. Broad but appropriate. | Keep. Use for hospitality logic, event, beverage, academy, service. |
| `skills/user/hestia-ui-design/SKILL.md` | HESTIA visual system: palettes, typography, components, motion, anti-patterns, copy. | UI builder / reviewer. | Design system skill. | Safe, but has minor tension with current global UI instructions and external taste skill. | Keep as production authority. Update to reflect current app components and installed fonts if needed. |
| `skills/user/hestia-venue-memory-provenance/SKILL.md` | Provenance, confidence, venue boundaries, role minimization, memory categories, no fake intelligence. | Any intelligence/memory work. | Memory/provenance skill. | High value. | Keep. Convert core concepts into schema/tests. |
| `skills/user/hestia-operational-intelligence-ui/SKILL.md` | Owner/manager operational surfaces: exception-based, action-led, no KPI wall, role visibility. | Owner/ops UI work. | Domain UI skill. | Safe. | Keep. Add test cases against OwnerAIHome / OperationalPulse. |
| `skills/user/hestia-event-manager-ui/SKILL.md` | Event Manager/Zohar rules: Event Manager owns decisions, Zohar recommends, handoffs are drafts until accepted. | Event UI/intelligence work. | Domain UI skill. | Safe and important. | Keep. Strong fit for Phase 1/2 event connections. |
| `skills/user/hestia-beverage-intelligence-ui/SKILL.md` | Beverage/Omer/CI/Cocktail Lab rules: cost honesty, source confidence, staff readiness, no fake suppliers/margins. | Beverage UI/intelligence work. | Domain UI skill. | Safe. | Keep. Correctly protects costing trust. |
| `skills/user/hestia-venue-intelligence-ui/SKILL.md` | Venue Intelligence UI rules: no generic chatbot, candidates vs confirmed DNA, confidence, open questions. | Venue Intelligence builders. | Domain UI skill. | Safe. | Keep. Needs executable Venue DNA mutation tests. |
| `skills/user/hestia-academy-design-curriculum/SKILL.md` | Academy curriculum/world design. 5x5 lesson model, drills, assessments, instructor/video direction. | Academy content/design. | Curriculum skill. | Safe but large. | Keep. Use with Academy Experience. |
| `skills/user/hestia-academy-experience/SKILL.md` | Academy UX guardrail: completion is exposure, recommendations need source, no LMS/gamification. | Academy UI/product work. | Domain UX skill. | Safe. | Keep. Good split from curriculum skill. |
| `skills/user/hestia-owner-threshold/SKILL.md` | Manual-only Owner Threshold/entry rules. Prototype-only, real venue signals only. | Owner entry exploration. | Manual-only prototype skill. | Safe if manual-only respected. | Keep manual-only. Do not auto-invoke. |
| `skills/user/hestia-story-carousel/SKILL.md` | Manual-only short guided flows. Blocks marketing carousel and fake claims. | Story/guest/owner flow exploration. | Manual-only UX skill. | Safe if manual-only respected. | Keep manual-only. Do not use for operational screens. |
| `skills/user/hestia-3d-experience/SKILL.md` | Manual-only 3D/cinematic rules. Requires purpose, reduced motion, static fallback. | 3D prototype exploration. | Manual-only UX skill. | Safe if manual-only respected. | Keep manual-only. Do not default to 3D. |
| `docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md` | Research and recommendation for gated skill sequence. | Founder / agents / future skill maintainers. | Governance doc. | Safe. | Keep. It is the best high-level explanation of how skills should be used. |
| `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md` | Prior read-only repo intelligence audit. Maps modules, risks, skills, Owner Threshold, roles. | Founder / agents. | Audit doc. | Safe. | Keep. Use as background, but newer CLAUDE/master state may supersede details. |
| `docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md` | Canonical AI doctrine index and reading order. | Any intelligence implementer. | Doctrine index. | Safe. | Keep. Should be linked from orchestrator. |
| `docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md` | Broad intelligence doctrine: layers, memory lifecycle, guardrails. | Product/architecture agents. | Canonical doctrine. | Safe. | Keep. Convert selected parts into schemas/checks. |
| `CLAUDE.md` | Current development context and hard architecture rules. | Claude Code / Codex. | Project operating instructions. | Safe, but should not be duplicated into skills blindly. | Keep as top-level authority. Align skill source order with it. |
| `scripts/hestia-check.js` | Safety check script: git state, build, critical file checks, known audit issues, secret pattern scan. | Developers / agents. | QA script. | Useful but incomplete. Build run can mutate `dist`. | Keep. Expand. Do not run automatically for read-only audits unless user approves build/output writes. |

## 4. What This Package Is

Verified:

- A HESTIA-specific Agent OS / skills governance layer.
- A set of Codex/Claude instruction files, not runtime code.
- A doctrine and workflow safety system for future agent work.
- A guardrail layer for product, UI, domain intelligence, provenance, event, beverage, academy, owner, 3D, and prototype work.
- A small external taste-skill add-on folder under `.agents/`.
- A local Claude settings file with broad permissions.

What it is not:

- Not production app code.
- Not an implementation of Venue Memory, Venue Intelligence, Venue DNA, or Owner AI Home.
- Not an enforceable security layer.
- Not a DB migration or permissions model.
- Not a test suite by itself.
- Not safe to blindly copy into `.claude/agents` or production workflows without verification.

Role it can play:

- It can become HESTIA's agent discipline layer: the thing that makes future Claude Code/Codex sessions read the right sources, choose the right domain skill, preserve evidence boundaries, and avoid disconnected, pretty-but-false features.

## 5. Why It Exists

Inferred intention:

1. Make HESTIA less fragmented by forcing "connect before build."
2. Improve Claude Code/Codex performance by providing project-specific operating rules.
3. Create reusable skills for HESTIA domains instead of relying on generic design or coding behavior.
4. Prevent fake intelligence, fake costs, fake venue signals, fake staff capability, fake KPIs, and fake progress.
5. Preserve HESTIA's premium hospitality feel while keeping operational truth ahead of visual polish.
6. Keep experimental visual/prototype tools out of production paths unless explicitly requested.

Validation:

- This interpretation is strongly supported by `hestia-skills-orchestrator`, `HESTIA_SKILLS_PIPELINE_RESEARCH.md`, `hestia-venue-memory-provenance`, and the external taste-skill warnings.

Challenge:

- The folder is currently better at "telling agents what to do" than "proving they did it." The next level is executable enforcement: check scripts, schemas, fixtures, snapshot audits, and pre-implementation review prompts.

## 6. How HESTIA Could Use It

What should go into the repo:

- Keep `skills/user/` as project-level HESTIA skill doctrine.
- Keep `docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md` as governance rationale.
- Keep `docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md` and doctrine docs as implementation reading order.
- Keep `skills-lock.json` for provenance of external skills.

What should stay external or manual-only:

- `.agents/skills/high-end-visual-design`
- `.agents/skills/imagegen-frontend-web`
- image generation prompts
- 3D/cinematic workflows
- story carousel workflows
- Owner Threshold prototype implementation details

What should become `CLAUDE.md`:

- Only the top-level source order and hard prohibitions:
  - read master memory
  - read current state / architecture audit / roadmap
  - do not inspect secrets
  - no production code changes during audits
  - no auth/venue/role/DB changes without explicit approval
  - skills are gated by `hestia-skills-orchestrator`

What should become `.claude/skills` or equivalent:

- `hestia-skills-orchestrator`
- `hestia-product-design-judgment`
- `hestia-venue-memory-provenance`
- `hestia-hospitality-intelligence`
- domain-specific skills only if the agent runtime supports skill routing reliably.

What should become `.claude/agents`:

- None as-is. These are skills, not autonomous agents.
- If subagents are created later, they should be narrow reviewers:
  - `hestia-provenance-reviewer`
  - `hestia-role-scope-reviewer`
  - `hestia-ui-doctrine-reviewer`
  - `hestia-fake-data-auditor`
  - `hestia-event-handoff-reviewer`

What should become docs only:

- Skills pipeline research.
- Owner Threshold and story/3D concept rationale.
- External taste-skill usage policy.

What should never be blindly copied:

- `.claude/settings.local.json`
- external taste skills as production design doctrine
- prototype Owner Threshold code
- any generated visual references as "product truth"
- any permission config that includes git push/commit permissions without a human gate

## 7. Product Value

Agent planning:

- Strong improvement. The orchestrator forces source reading and skill sequencing.
- Risk: it still relies on agent compliance.

Claude Code discipline:

- Strong improvement. The skills define what not to touch and when to pause.
- Risk: overlapping instructions can confuse priority unless source order is explicit.

QA:

- Medium improvement. `hestia-check.js` exists and protects some known risks.
- Risk: it is not currently an Agent OS quality gate for all doctrine.

Design quality:

- Strong HESTIA UI doctrine exists.
- External visual skills can improve inspiration, but they also threaten operational clarity.

No-fake-data discipline:

- Very strong in prose.
- Needs automated checks for fake venues, demo imports, placeholder metrics, invented scores, and unlabelled benchmarks.

Memory architecture:

- Strong conceptual foundation.
- Missing executable schemas and ledgers.

Evidence-bound reports:

- Strong principle.
- Needs enforced output contract: source refs, confidence, missing data, human decision, outcome.

Venue intelligence:

- Strong skill support for Venue DNA and memory provenance.
- Needs explicit "DNA change request" flow and tests.

Academy loops:

- Good distinction: lesson completion is exposure, not capability.
- Missing executable training recommendation provenance checks.

Event-to-shift connections:

- The skills support the doctrine, but no implementation is in this folder.
- Use as checklist for Phase 1/2 work, not proof that those connections exist.

F&B/report intelligence:

- Beverage skill is excellent on cost honesty.
- Missing machine-readable cost-source schema enforcement beyond existing app code.

Owner decision intelligence:

- Operational Intelligence skill correctly blocks KPI walls and fake summaries.
- Needs recommendation ledger and owner decision ledger enforcement.

## 8. Architecture Review

Does the folder support:

```text
Evidence
-> Signal
-> Interpretation
-> Recommendation
-> Human Decision
-> Outcome
-> Memory / Learning
```

Yes, conceptually.

Where it appears:

- `HESTIA_INTELLIGENCE_DOCTRINE_V1.md` has a full memory lifecycle.
- `hestia-venue-memory-provenance` defines raw input, operational observation, confirmed fact, inference, recommendation, memory candidate, Venue DNA candidate, confirmed Venue DNA, drift signal, unknown.
- `hestia-operational-intelligence-ui` requires recommendations to separate fact, interpretation, confidence, action, owner/role, venue boundary, memory impact.
- `hestia-event-manager-ui` says Zohar recommendations remain drafts until accepted, edited, or sent by the Event Manager.
- `hestia-beverage-intelligence-ui` requires cost status, source, event boundary, staff readiness, and approval state.
- `hestia-academy-experience` says training recommendations require source and that completion is not capability.

What is missing:

| Missing concept | Status | Why it matters |
| --- | --- | --- |
| Evidence item schema | Missing as enforceable Agent OS artifact. | Agents need a stable object shape for source, venue, role, timestamp, confidence. |
| Source references | Present in doctrine, not enforced broadly. | Prevents fake intelligence. |
| Confidence scoring | Present in prose, not centralized. | Avoids inconsistent "low/medium/high" semantics. |
| Missing data notes | Present in prose, not testable. | HESTIA must say what it does not know. |
| Agent run logs | Missing. | Needed to know what an agent read, inferred, changed, and skipped. |
| Recommendation ledger | Partially present in doctrine, not enforced here. | Needed for accepted/rejected/outcome learning. |
| Human approval ledger | Missing in this folder. | Required before high-impact recommendations mutate records or DNA. |
| Outcome ledger | Missing. | Without outcomes, recommendations do not learn. |
| Memory write proposals | Conceptual only. | Needed to prevent direct, unreviewed memory/DNA mutation. |
| Venue DNA change request flow | Present as rule, not schema/workflow. | Critical safety gate. |
| Audit trail | Mentioned in doctrine, not implemented here. | Required for production intelligence trust. |
| Multi-venue scoping | Strongly mentioned. | Needs tests that every intelligence route respects active venue. |
| Role-based permissions | Strongly mentioned. | Needs route/component review checks. |
| No fake data enforcement | Strong in docs. | Needs repo scan and fixture policy. |
| Test strategy | Partial via `hestia-check.js` and package scripts. | Not complete for Agent OS governance. |

Architecture conclusion:

- This package is a good doctrine layer.
- It is not yet an architecture implementation.
- Do not confuse "the agent was told to preserve evidence" with "the system preserves evidence."

## 9. Agent / Skill Review

### HESTIA skills

| Skill | Supposed to do | Focus | Risk | Useful now? | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `hestia-skills-orchestrator` | Route tasks to the right HESTIA skills and block bad defaults. | Focused enough. | Could become ceremonial if agents skip it. Routing table references skills that may not always exist in other environments. | Yes. | Make it the first skill for HESTIA work. Add a short machine-checkable checklist. |
| `hestia-product-design-judgment` | Product/UX/architecture decision guard. | Broad but necessary. | Could be overused for pure factual tasks. | Yes. | Keep. Pair with domain skill for anything real. |
| `hestia-hospitality-intelligence` | Hospitality operator reasoning. | Broad domain skill. | Can generate advisory prose if not tied to files/workflows. | Yes. | Keep. Require source/context when used for product recommendations. |
| `hestia-ui-design` | Production HESTIA design system. | Good but large. | Some rules may conflict with app-level icon/library choices and generic Codex UI rules. | Yes. | Keep as visual authority; refresh against actual current components. |
| `hestia-venue-memory-provenance` | Evidence/confidence/memory/venue boundary guardrail. | Excellent. | Prose-only. | Yes. | Convert into schemas/tests. |
| `hestia-operational-intelligence-ui` | Owner/manager operational intelligence UI. | Focused. | Needs actual component examples. | Yes. | Keep. Add fixtures and review checklist. |
| `hestia-event-manager-ui` | Event Manager/Zohar/handoff governance. | Focused. | Good, but must be checked against real EventDetail current tab count/state. | Yes. | Keep. Use for Phase 1/2 event connections. |
| `hestia-beverage-intelligence-ui` | Beverage/Omer/CI cost honesty and operations. | Focused. | Path references include `src/domain/hospitality/bar/cocktailLabPricingAdapter.js`, but audit context says adapter is in services/features; verify path before relying. | Yes. | Keep. Fix any stale path references. |
| `hestia-venue-intelligence-ui` | Venue Intelligence UI and DNA candidates. | Focused. | Needs executable DNA mutation workflow. | Yes. | Keep. Add DNA change request schema. |
| `hestia-academy-design-curriculum` | Curriculum structure and lesson design. | Large but useful. | Could overprescribe 5x5 when the product needs small interventions. | Yes for Academy. | Keep. Use with Academy Experience. |
| `hestia-academy-experience` | Academy UX and capability/progress truth. | Focused. | Overlaps with curriculum skill but split is reasonable. | Yes. | Keep. |
| `hestia-owner-threshold` | Manual-only Owner Entry/Threshold rules. | Focused. | Could seduce agents into theatrical entry work if manual-only ignored. | Not by default. | Keep manual-only. |
| `hestia-story-carousel` | Manual-only guided sequence rules. | Focused. | Carousels can hide operational data. | Limited. | Keep manual-only. |
| `hestia-3d-experience` | Manual-only 3D/cinematic rules. | Focused. | 3D can create fake venue reality/performance risk. | Rarely. | Keep manual-only. |

### External `.agents` skills

| Skill | Supposed to do | Risk | Useful now? | Recommendation |
| --- | --- | --- | --- | --- |
| `high-end-visual-design` | Produce premium agency-grade UI code and motion. | High if used for production. Conflicts with HESTIA operational density, lucide usage, 8px radii, restrained motion, no orbs/blobs. | Only for inspiration. | Do not auto-use. Never production authority. |
| `imagegen-frontend-web` | Generate premium website section images. | High if used as product truth. Optimized for marketing/landing pages, not HESTIA app workflows. | Only for non-production visual references. | Do not auto-use. Label all outputs as inspiration. |

### Claude Code vs Codex

- Better for Claude Code: the skill files are formatted for Claude-style skill invocation and repo work.
- Good for Codex: as read-first governance docs and audit checklists.
- Should be prompts only: external taste skills, Owner Threshold, Story Carousel, 3D.
- Can become real project skills: orchestrator, product judgment, memory provenance, event, beverage, operational, venue, academy.
- Should be rewritten or tightened: any skill with stale paths, broad "always use" wording, or manual-only boundaries not backed by a check.

Dangerous repo-change risk:

- The HESTIA skills themselves mostly instruct caution.
- `.claude/settings.local.json` is the higher risk because it allows broad shell/git operations.
- External visual skills could trigger broad UI rewrites if invoked by default.

## 10. Design QA

What protects HESTIA from generic SaaS:

- `hestia-ui-design` has clear palettes, typography, component patterns, copy rules, anti-patterns, motion guidance, and editorial references.
- `hestia-product-design-judgment` blocks dashboards, KPI walls, generic chatbot surfaces, empty widgets, and disconnected modules.
- `hestia-operational-intelligence-ui` insists on exception-based operational surfaces.
- `hestia-academy-experience` blocks generic LMS/gamification.
- `hestia-owner-threshold`, `hestia-story-carousel`, and `hestia-3d-experience` are manual-only and explicitly anti-gimmick.

Does it make HESTIA feel closer to Aman / Monocle / 50Best / PRADA / Four Seasons / Apple?

- Yes in vocabulary and intent.
- Partially in practical design rules.
- Not fully in executable examples.

What is strong:

- Palette A / Palette B distinction.
- Hospitality-native copy examples.
- No fake metrics / no fake AI claims.
- Editorial-world vs operational-world split.
- Motion restraint.
- Mobile-first Academy and operational rules.
- Strong anti-LMS and anti-dashboard language.

What is weak:

- Too many references can become taste fog if not tied to actual components.
- The UI design skill says "HESTIA is a world they inhabit", which is emotionally useful but can encourage over-designed environments unless the product gate comes first.
- External taste skill conflicts:
  - recommends `rounded-[2rem]`, while HESTIA operational cards want 4-8px.
  - bans Lucide, while project/developer guidance prefers lucide icons.
  - encourages glowing orbs/glass, which HESTIA rules avoid.
  - encourages huge `py-24` to `py-40`, which can fail 2 AM operational density.
- There are not enough concrete before/after examples tied to existing HESTIA files.

Design QA conclusion:

- Production authority should be:

```text
hestia-product-design-judgment
-> relevant domain skill
-> hestia-ui-design
-> browser/mobile/role/provenance QA
```

- External visual skills should only enter after that, and only as labeled inspiration.

## 11. QA / Safety Review

Good existing checks:

- `scripts/hestia-check.js` reports git state.
- It runs build when invoked.
- It checks critical file presence.
- It checks several known UI/navigation audit items.
- It warns about `.env` file presence without printing values.
- It scans tracked source files for obvious hardcoded secret patterns.
- `package.json` contains multiple test scripts for beverage intelligence, F&B ledger, venue DNA completeness, owner AI home completeness, investor demo readiness, first-run zero-state, and venue intelligence chat quality.

Missing QA checks:

- Skill routing compliance: no check that a report/implementation used required skills.
- Fake/demo data scan across the full repo.
- `HOSPIA` user-facing naming scan vs allowed technical identifiers.
- localStorage risk scan by domain.
- hardcoded venue/user ID scan.
- auth/role/header mutation detection.
- DB migration diff risk checker.
- Venue DNA mutation path scan.
- recommendation output contract validation.
- memory write proposal schema validation.
- role visibility leak tests.
- multi-venue scoping tests for intelligence routes.
- no automatic production use of `.agents` taste skills.
- stale path checks inside skills.
- manual-only skill invocation checks.

Checks that should become automated hooks:

- No `.env` staged.
- No production code imports from `prototypes/`.
- No `eventBrainDemoData` imports in production-rendered components except allowed fallback files.
- No new `localStorage` keys outside config/migration plan.
- No unapproved changes to auth, venue scoping, role config, DB migrations.
- No hardcoded `venue-main` introduced outside approved backend defaults/tests.
- No fake money/profit/staff-score strings in production components.
- No `Venue DNA` mutation without owner/admin confirmation path.
- No external `.agents` skill copied into `skills/user` as authority.

Checks that should stay manual:

- Premium hospitality tone.
- Whether a screen helps a real role do real work.
- Whether a recommendation is operationally useful.
- Whether a visual direction feels like HESTIA rather than a luxury website.
- Whether a strategic hypothesis is being treated as doctrine.

Checks that may be too noisy:

- Generic `HOSPIA` string bans, because some old technical identifiers are intentionally not renamed.
- Broad "dashboard" word bans, because some docs discuss dashboard avoidance.
- Broad localStorage bans, because some keys are known/roadmapped debt.

## 12. Security & Production Risk

No hardcoded secrets were found in inspected skill/config text. `.env` exists but was not read.

Risks if copied blindly:

1. `.claude/settings.local.json` contains broad permissions, including `npm run *`, git add/commit/push, kill/fuser commands, curl login, and broad read paths. This is not a safe shared policy file.
2. External taste skills can cause wide UI rewrites that violate HESTIA's operational UX.
3. `imagegen-frontend-web` can generate persuasive fake visual references disconnected from real venue data.
4. Owner Threshold / 3D / story skills could create false confidence if manual-only is ignored.
5. Prose-only guardrails could be mistaken for implemented safety.
6. Some docs mention future intelligence, agents, ledgers, and memory as if strategically real; implementation status must be checked before claims.
7. Build/check scripts can write to `dist`; not suitable for strict read-only audits unless approved.
8. Package scripts include tests, but not a single all-domain test gate.
9. Role and venue guardrails are described in skills, but route-level enforcement must be verified separately.
10. External research material is explicitly non-canonical, but agents may still quote it if not routed through doctrine.

## 13. What I Question / Skepticism

What I do not trust:

- I do not trust external taste skills near production UI.
- I do not trust `.claude/settings.local.json` as a repo-safe permission template.
- I do not trust prose guardrails to prevent bad implementation without tests.
- I do not trust any "Agent OS" claim until there are run logs, ledgers, schemas, and enforcement.

What sounds smart but may be premature:

- Multi-agent orchestration.
- 3D/cinematic Owner Threshold productionization.
- Specialist agent fleets before the evidence/memory ledger is durable.
- Broad "AI operating system" language before the core loop is executable.

What is over-engineered:

- The number of separate skills may be high for day-to-day work.
- Some manual-only experience skills may be premature until the core intelligence backbone is implemented.
- External visual design skill is too elaborate for operational HESTIA screens.

What is under-specified:

- Evidence schema.
- Recommendation ledger.
- Human approval ledger.
- Memory write proposal schema.
- Venue DNA change request flow.
- Agent run log format.
- How a skill proves it was applied.
- What exact tests must pass before an intelligence feature ships.

What could create false confidence:

- Saying "every claim needs provenance" without enforcing output contracts.
- Saying "Venue DNA requires confirmation" without tests preventing direct mutation.
- A beautiful Owner AI Home that does not read/write memory safely.
- Visual references that look premium but contain fake signals.
- A skill pack that agents can ignore.

What could confuse Claude Code:

- Multiple authority layers: AGENTS, CLAUDE, master memory, skills, design docs, architecture docs.
- External taste skill vs HESTIA UI skill conflicts.
- Manual-only skills in the same folder as auto-use skills.
- Old HOSPIA identifiers that must not be renamed without migration.
- Docs that are research-only but sound implementation-ready.

What could fragment HESTIA:

- Creating more personas.
- Adding isolated "agent" modules instead of using Venue Memory/Intelligence/DNA.
- Letting each domain skill invent its own memory/provenance shape.
- Turning Academy, Beverage, Event, and Owner into separate AI worlds rather than one shared brain.

What I would refuse to adopt without repo verification:

- Any new subagent with write access.
- Any production Owner Threshold flow.
- Any AI recommendation that writes memory directly.
- Any Venue DNA mutation flow.
- Any role/venue access change.
- Any skill-generated UI rewrite.
- Any external visual prompt as "approved design."

## 14. What I Would Do Differently

Simplify:

- Treat `hestia-skills-orchestrator`, `hestia-product-design-judgment`, and `hestia-venue-memory-provenance` as the core Agent OS.
- Treat all other skills as domain plugins.

Rename:

- Consider `hestia-skills-orchestrator` -> `hestia-agent-operating-gate`.
- Consider `hestia-venue-memory-provenance` -> `hestia-evidence-and-memory-contract`.
- Keep external `.agents` names as-is but label them "external taste skills."

Merge:

- Merge manual-only Owner Threshold, Story Carousel, and 3D policy into a single "experimental experience policy" doc unless they are actively used.

Split:

- Split `hestia-hospitality-intelligence` into shorter domain references only if agents struggle with its size.
- Split `hestia-ui-design` into quick reference + full design bible.

Delay:

- 3D production.
- multi-agent orchestration.
- automated agent writeback.
- Owner Threshold production.
- new personas.

Make stricter:

- External taste skills manual-only.
- `.claude/settings.local.json` not shared as project policy.
- No production code changes from audit prompts.
- No memory/DNA changes without a proposal/approval schema.

Make more practical:

- Add templates:
  - recommendation object
  - memory candidate object
  - DNA change request object
  - agent audit report object
  - skill route checklist

Convert into tests:

- fake data detection
- old naming detection with allowlist
- localStorage new-key detection
- no prototype imports
- no direct Venue DNA mutation
- no unscoped intelligence route
- no unsourced cost/margin output

Convert into prompts:

- pre-implementation "source of truth" prompt
- post-change provenance audit prompt
- role-scope audit prompt
- event handoff audit prompt

Remove:

- Nothing needs deletion now.
- Do not remove `.agents`; quarantine via policy.

## 15. Missing Research

Browsing was not used. Research questions still missing before implementation:

1. Claude Code Skills best practices for project-level skill routing and invocation precedence.
2. Claude Code hooks/subagents best practices, especially safe read-only reviewers.
3. OpenAI/Codex agent guardrails for filesystem, approvals, and multi-step code changes.
4. Practical agent run log schemas for "what was read, inferred, changed, verified."
5. Recommendation ledger patterns for AI-assisted operational products.
6. Human-in-the-loop approval patterns for memory/DNA mutation.
7. Multi-tenant AI memory isolation patterns.
8. Evaluation/observability for agentic systems in high-trust domains.
9. Hospitality AI competitors and how they handle memory/provenance.
10. Premium operating system design references beyond marketing sites.
11. Staff training intelligence best practices: completion vs verified capability.
12. Multi-agent risk management and why HESTIA may not need agent fleets yet.

## 16. Recommended Adoption Plan

### Phase 0 - Read-only documentation

- Keep the skills and governance docs as documentation.
- Add a short index: "Which skill to read for which task."
- Mark `.agents` external skills as manual-only inspiration.
- Mark `.claude/settings.local.json` as local-only, not project policy.

### Phase 1 - Safe skills/docs

- Promote these as core skills:
  - `hestia-skills-orchestrator`
  - `hestia-product-design-judgment`
  - `hestia-venue-memory-provenance`
  - `hestia-hospitality-intelligence`
  - `hestia-ui-design`
- Keep domain skills as optional but recommended for relevant work.
- Add stale-path checks inside skills.

### Phase 2 - QA scripts/hooks

- Expand `hestia-check.js` or add `hestia-agent-os-check.js`.
- Add no-fake-data, no-prototype-import, no-new-localStorage-key, no-unapproved-auth/venue/role/DB-change checks.
- Add skill routing checklists to audit report templates.
- Add a "read-only audit mode" that does not run build.

### Phase 3 - Actual Intelligence Backbone design

- Define schemas:
  - `EvidenceItem`
  - `Signal`
  - `Interpretation`
  - `Recommendation`
  - `HumanDecision`
  - `Outcome`
  - `MemoryCandidate`
  - `VenueDnaChangeRequest`
  - `AgentRunLog`
- Align with existing Venue Memory, Venue Intelligence, Venue DNA, Business Memory, F&B, Event, Academy, Service, Shift Intelligence.

### Phase 4 - Implementation by Claude Code only

- Only after schemas/tests are approved.
- Implement small, vertical paths:
  - source-backed recommendation
  - human approval
  - outcome capture
  - memory candidate
  - later recall in a brief
- Never start with autonomous agents.

## 17. What Should NOT Be Copied

- Do not copy `.claude/settings.local.json` into shared project policy.
- Do not copy external taste skills into production HESTIA doctrine.
- Do not copy Owner Threshold prototype code into `src/`.
- Do not copy 3D/cinematic concepts into operational screens.
- Do not copy generated image references as product truth.
- Do not copy research archive text into implementation without doctrine conversion.
- Do not copy broad git/npm permissions into any automated agent.
- Do not copy any fake example venue, staff, cost, sales, or guest data into runtime.
- Do not copy "agent fleet" language into production until the single-brain evidence chain exists.

## 18. Final Verdict

Clear verdict:

```text
Use with changes.
```

Detailed verdict:

- `skills/user/`: use with changes. Strong, aligned, worth keeping.
- `.agents/`: use only as inspiration. Manual-only.
- `.claude/settings.local.json`: do not use as shared policy. Local only.
- docs pipeline/doctrine: use as governance, not implementation proof.
- QA script: keep and expand.
- actual intelligence backbone: needs repo audit and schema design first.

Top 10 findings:

1. This is an Agent OS / skill governance layer, not production code.
2. HESTIA-specific skills are strongly aligned with hospitality doctrine.
3. External `.agents` skills are visual inspiration, not HESTIA authority.
4. The package correctly identifies HESTIA as under-connected, not under-built.
5. Provenance and confidence are well described but not fully enforced.
6. Manual-only prototype skills are correctly cautious.
7. The existing QA script is useful but incomplete for Agent OS governance.
8. `.claude/settings.local.json` is too broad to copy as shared policy.
9. The folder supports the evidence-to-memory chain conceptually.
10. The next need is schemas/tests/ledgers, not more design or more personas.

Top 10 risks:

1. Prose guardrails create false confidence.
2. External visual skills can distort HESTIA into a luxury mockup.
3. Agent routing can be skipped.
4. Manual-only skills can be misused.
5. No enforced evidence schema.
6. No recommendation/human decision/outcome ledger.
7. No automatic Venue DNA mutation safety test.
8. Broad local Claude permissions.
9. Research docs may be mistaken for implementation authority.
10. Too many skills can confuse agents if source order is not enforced.

Top 10 recommendations:

1. Keep the HESTIA skill pack.
2. Quarantine `.agents` as manual-only inspiration.
3. Add `hestia-agent-os-check.js` or expand `hestia-check.js`.
4. Create evidence/recommendation/memory/DNA change schemas.
5. Add a read-only audit template.
6. Add no-prototype-import and no-fake-data scans.
7. Add no-unapproved-auth/venue/role/DB-change checks.
8. Add stale-path checks in skills.
9. Convert the memory lifecycle into actual ledgers.
10. Delay autonomous/multi-agent work until the evidence chain is real.

Exact next step:

```text
Create a read-only Agent OS adoption plan that turns the current skill pack into:
1. a short skill routing index,
2. an audit checklist,
3. a hestia-agent-os-check.js proposal,
4. evidence/recommendation/memory/DNA change schema drafts,
without touching production code.
```

## 19. Next Claude Code Prompt

Use this prompt:

```text
# HESTIA Agent OS Adoption Plan - Read-Only

You are working in the HESTIA repo. Read first:
- memory/project_hestia_master_memory.md
- docs/HESTIA_MASTER_STATE.md
- docs/HESTIA_ARCHITECTURE_AUDIT.md
- docs/HESTIA_CTO_ROADMAP.md
- docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md
- skills/user/hestia-skills-orchestrator/SKILL.md
- skills/user/hestia-venue-memory-provenance/SKILL.md
- docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md
- docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md

Hard guardrails:
- Read-only planning only.
- Do not change production code.
- Do not modify auth, venue scoping, permissions, DB migrations, role logic, app flows, or Venue DNA logic.
- Do not install packages.
- Do not commit or push.
- If creating a file, create only docs/plans/HESTIA_AGENT_OS_ADOPTION_PLAN.md.

Task:
Create a practical adoption plan for the Agent OS / skill pack. Include:
1. Which skills become core project skills.
2. Which skills stay manual-only.
3. Which external .agents skills are inspiration-only.
4. A proposed hestia-agent-os-check.js checklist, without implementing it.
5. Draft schemas for EvidenceItem, Signal, Interpretation, Recommendation, HumanDecision, Outcome, MemoryCandidate, VenueDnaChangeRequest, and AgentRunLog.
6. A read-only audit template future agents must use.
7. Risks and sequencing.

Do not claim any implementation exists unless verified in the repo.
```

## 20. Commands Run / Files Inspected / Changes Made

Commands run:

```text
Get-Location
Get-ChildItem -Force
git status --short
git branch --show-current
git log --oneline -5
rg --files .agents
rg --files .claude
rg --files skills
rg -n "Agent OS|agent os|add-on|addon|add on|agent" .agents .claude docs skills package.json
rg --files .agents skills .claude docs\design docs\architecture | rg "(SKILL\.md|settings|SKILLS_PIPELINE|PROJECT_INTELLIGENCE_AUDIT|AI_DOCTRINE|INTELLIGENCE_DOCTRINE)"
Get-ChildItem -Recurse -Force -File -LiteralPath '.agents','skills','.claude'
Get-Content -Raw [listed files]
```

Files inspected:

```text
memory/project_hestia_master_memory.md
docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md
docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md
docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md
docs/HESTIA_MASTER_STATE.md
docs/HESTIA_ARCHITECTURE_AUDIT.md
docs/HESTIA_CTO_ROADMAP.md
docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md
docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md
docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md
docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md
CLAUDE.md
.claude/settings.local.json
.agents/skills/high-end-visual-design/SKILL.md
.agents/skills/imagegen-frontend-web/SKILL.md
skills-lock.json
skills/user/hestia-skills-orchestrator/SKILL.md
skills/user/hestia-product-design-judgment/SKILL.md
skills/user/hestia-hospitality-intelligence/SKILL.md
skills/user/hestia-ui-design/SKILL.md
skills/user/hestia-venue-memory-provenance/SKILL.md
skills/user/hestia-operational-intelligence-ui/SKILL.md
skills/user/hestia-event-manager-ui/SKILL.md
skills/user/hestia-beverage-intelligence-ui/SKILL.md
skills/user/hestia-venue-intelligence-ui/SKILL.md
skills/user/hestia-academy-design-curriculum/SKILL.md
skills/user/hestia-academy-experience/SKILL.md
skills/user/hestia-owner-threshold/SKILL.md
skills/user/hestia-story-carousel/SKILL.md
skills/user/hestia-3d-experience/SKILL.md
scripts/hestia-check.js
package.json
```

Changes made:

- Created this audit report only:

```text
docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md
```

Production code changes:

```text
None.
```

Build/tests:

```text
Not run. This was a read-only audit. Running `npm run build` or `npm run hestia:check` can write build output under `dist`, so it was intentionally avoided.
```

