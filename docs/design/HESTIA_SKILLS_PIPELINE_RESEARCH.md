# HESTIA Skills Pipeline Research

## 1. Executive Decision

HESTIA should use a gated sequence of small skills, not a single "make it beautiful" skill.

The pipeline should be:

| Step | Skill | Purpose | Invocation |
| --- | --- | --- | --- |
| 1 | `hestia-skills-orchestrator` | Decide which HESTIA skills apply, force source reading, and stop generic redesign work before it starts. | Auto for product, UI, architecture, and strategic work. |
| 2 | `hestia-product-design-judgment` | Validate whether the work connects existing HESTIA systems instead of adding another disconnected module. | Auto for product and UX decisions. |
| 3 | Domain skill | Apply the relevant operating domain: hospitality, events, beverage, academy, owner, memory, or guest flow. | Auto when the domain is clear. |
| 4 | `hestia-ui-design` | Apply the HESTIA visual system after the product logic is correct. | Auto for production UI. |
| 5 | Implementation skill or Codex repo workflow | Build only inside existing architecture, hooks, features, routes, services, and permissions. | Manual or task-driven. |
| 6 | Verification skill | Use build checks, role checks, browser/Playwright-style visual checks, reduced-motion checks, and source/provenance checks. | Required after UI or workflow changes. |

This means HESTIA should improve the skills layer before recommending more design experiments. The first missing piece is not another visual skill. It is an orchestration skill that makes Codex choose the right sequence.

## 2. Core Principle

HESTIA is under-connected, not under-built.

The project already has Owner Intelligence, Venue Intelligence, Venue Memory, Venue DNA, Event Manager, Zohar, Cocktail Intelligence, Academy, Shift Brain, Chef workflows, roles, permissions, and multi-venue foundations. The risk is that a broad design skill will add more attractive but disconnected surfaces. That would make HESTIA feel more like a generic SaaS dashboard, a luxury mockup, or an AI chatbot wrapper.

The PDF research reaches the same conclusion: one giant skill is the wrong tool. The useful pattern is a pipeline of focused skills: strategy/spec first, domain judgment second, design direction third, implementation fourth, verification last. Official skills such as `frontend-design`, `web-artifacts-builder`, `webapp-testing`, `pptx`, `doc-coauthoring`, `skill-creator`, and `mcp-builder` are useful only when placed in the right position in that sequence.

For HESTIA, visual quality must come after operational truth. Every skill must preserve role awareness, provenance, memory compounding, venue-specific context, mobile usability, and the distinction between verified intelligence and interpretation.

## 3. Current Skills Inventory

| Skill name | Location | Source | Purpose | Use now? | Risk | Recommended invocation |
| --- | --- | --- | --- | --- | --- | --- |
| `hestia-ui-design` | `skills/user/hestia-ui-design/SKILL.md` | HESTIA | Defines HESTIA visual language, palettes, typography, component tone, and anti-SaaS design rules. | Yes | Can become visual-first if used before product judgment. | Auto for production UI after product/domain skill. |
| `hestia-product-design-judgment` | `skills/user/hestia-product-design-judgment/SKILL.md` | HESTIA | Guards product decisions against dashboard bloat, generic SaaS, fake KPIs, chatbot-first UX, and disconnected widgets. | Yes | Too broad if used without a domain skill. | Auto for product, UX, feature, copy, and workflow decisions. |
| `hestia-hospitality-intelligence` | `skills/user/hestia-hospitality-intelligence/SKILL.md` | HESTIA | Applies hospitality-native judgment, service logic, guest journey thinking, recovery, accessibility, luxury standards, and memory discipline. | Yes | Can drift into advisory language if not tied to real files and workflows. | Auto for hospitality workflows, Zohar, CI, service, guest, and memory work. |
| `hestia-academy-design-curriculum` | `skills/user/hestia-academy-design-curriculum/SKILL.md` | HESTIA | Keeps Academy as professional formation, not a generic LMS. | Yes | Needs to be connected to live Academy components and role workflows. | Auto for Academy only. |
| `high-end-visual-design` | `.agents/skills/high-end-visual-design/SKILL.md` | Taste Skill | General high-end visual design standards. | Later | Can conflict with HESTIA's own visual system and push decorative polish before operational clarity. | Manual only. Never default. |
| `imagegen-frontend-web` | `.agents/skills/imagegen-frontend-web/SKILL.md` | Taste Skill | Generates premium landing-page or section-level image references. | Later | Strong risk of reference-driven visuals disconnected from HESTIA runtime truth. | Manual only for non-production visual exploration. |
| `skill-creator` | `C:/Users/toamg/.codex/skills/.system/skill-creator/SKILL.md` | System / official skill pattern | Guides creation and improvement of focused Codex skills. | Yes | Can encourage too many skills if there is no owner/orchestrator layer. | Manual when creating or upgrading skills. |
| `imagegen` | `C:/Users/toamg/.codex/skills/.system/imagegen/SKILL.md` | System | Generates raster images. | Later | Decorative luxury and fake venue imagery risk. | Manual only. |
| `frontend-design` | Discussed in attached PDF, not found as local project skill | Anthropic / Claude Code research | Design ideation, UI direction, hierarchy, color, and layout from a brief. | Later | Generic UI direction unless HESTIA constraints are supplied first. | Manual only, after HESTIA product/domain skills. |
| `web-artifacts-builder` | Discussed in attached PDF, not found as local project skill | Anthropic / Claude Code research | Builds React/HTML artifacts from a spec. | Later | Prototype code can bypass HESTIA architecture. | Manual only for prototypes, never default for production repo work. |
| `webapp-testing` | Discussed in attached PDF; local equivalent available through Browser/testing workflow | Anthropic / Claude Code research | Browser-based testing, screenshots, DOM checks, logs, and interaction verification. | Yes | Weak if it only checks appearance and not role/source behavior. | Auto after UI changes where feasible. |
| `pptx` | Discussed in attached PDF; local equivalent is `presentations:Presentations` | Anthropic / Claude Code research | Creates and edits investor, sales, board, or product presentation decks. | Later | Can overclaim product maturity. | Manual only for investor/presentation outputs. |
| `doc-coauthoring` | Discussed in attached PDF; local equivalent is `documents:documents` | Anthropic / Claude Code research | Creates and edits structured strategy/spec documents. | Later | Can produce theory without repository grounding. | Manual only for docs/spec tasks. |
| `canvas-design` | Discussed in attached PDF; Canva plugin available | Anthropic / Canva-adjacent research | Static design, moodboard, presentation, or Canva output. | Later | Can create non-runtime artifacts that feel like product decisions. | Manual only. |
| `mcp-builder` | Discussed in attached PDF, not found as local project skill | Anthropic / Claude Code research | Builds external API/MCP integrations. | Later | High risk before PMS/POS/CRM contract clarity. | Manual only for integration spikes. |
| Browser control skill | `C:/Users/toamg/.codex/plugins/cache/openai-bundled/browser/.../skills/control-in-app-browser/SKILL.md` | Plugin | Opens, inspects, screenshots, and verifies local apps in-browser. | Yes | Needs clear scenarios; screenshots alone do not prove intelligence correctness. | Auto after meaningful frontend changes. |
| Presentations skill | `C:/Users/toamg/.codex/plugins/cache/openai-primary-runtime/presentations/.../skills/presentations/SKILL.md` | Plugin | Builds PowerPoint decks. | Later | Investor narrative can exceed real product truth. | Manual only. |
| Documents skill | `C:/Users/toamg/.codex/plugins/cache/openai-primary-runtime/documents/.../skills/documents/SKILL.md` | Plugin | Creates and edits document artifacts. | Later | Not needed for normal repository markdown. | Manual only. |
| `find-skills` | `C:/Users/toamg/.agents/skills/find-skills/SKILL.md` | Other | Helps discover installable skills. | No | Could distract from building the HESTIA-specific pack. | Manual only when explicitly researching installable skills. |

## 4. Recommended Pipeline by Work Type

### Owner Threshold / Owner Entry

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-owner-threshold`, using `prototypes/owner-threshold.html`, `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md`, and `memory/project_hestia_master_memory.md`. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design`; optional manual `hestia-story-carousel` later for an entry sequence. |
| Implementation skill | Normal Codex repo workflow only after a production spec exists. Do not use prototype builders directly against `src/`. |
| Testing/verification skill | Browser or `webapp-testing` equivalent, with role, venue, reduced-motion, mobile, and empty-state checks. |
| Risks and guardrails | Keep the current prototype as prototype only. Ban fake venue signals, fake faculty observations, fake operational urgency, and direct production integration. |

### Owner AI Chat / Executive Intelligence Room

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-operational-intelligence-ui` plus future `hestia-venue-memory-provenance`. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design`. |
| Implementation skill | Work through existing Owner Intelligence and memory surfaces, not a new chatbot-first module. Relevant files from the audit include `src/features/OwnerPulse.jsx`, `src/features/owner/`, `src/services/ownerReportService.js`, and `src/services/venueBrainService.js`. |
| Testing/verification skill | Browser checks, role checks, source/provenance checks, and no-cross-venue leakage checks. |
| Risks and guardrails | Do not turn Owner Intelligence into a generic assistant. Every recommendation needs a source, confidence, role boundary, and operational next step. |

### Event Manager Calendar + Event Detail

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-event-manager-ui`. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design` plus `hestia-hospitality-intelligence`. |
| Implementation skill | Existing event architecture first: `src/features/events/EventCalendar.jsx`, `src/features/events/EventDetail.jsx`, `src/features/events/EventZoharPanel.jsx`, `src/features/events/EventTimeline.jsx`, `src/features/events/EventTeam.jsx`, and `src/hooks/useEventState.js`. |
| Testing/verification skill | Browser flow tests for calendar, detail, mobile event review, role exposure, and Zohar recommendations. |
| Risks and guardrails | Do not rebuild Event Manager as a generic CRM. Do not add a second calendar model. Do not hide operational states behind decorative cards. |

### Zohar-to-Departments Connections

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-venue-memory-provenance` plus future `hestia-event-manager-ui`. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design` with restrained operational UI. |
| Implementation skill | Connect existing event intelligence to existing department surfaces instead of making new modules. Relevant files from the audit include `src/features/events/EventZoharPanel.jsx`, `src/features/events/EventBrain.jsx`, `src/services/zoharEventService.js`, `src/services/eventToCIDraftAdapter.js`, `src/features/chef/ChefDashboard.jsx`, and `src/features/shift-brain/`. |
| Testing/verification skill | Source/provenance checks, department visibility checks, and regression checks around event status changes. |
| Risks and guardrails | Zohar must not become an all-purpose persona. Department recommendations need context, source, confidence, and role-safe exposure. |

### Beverage / Cocktail Intelligence

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-beverage-intelligence-ui`. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design` plus `hestia-hospitality-intelligence`. |
| Implementation skill | Existing beverage architecture first: `src/features/ci/`, `src/features/bar/CocktailLabStudio.jsx`, `src/features/bar/CocktailBuildExperience.jsx`, `src/features/bar-management/`, `src/domain/hospitality/bar/`, and `src/services/cocktailLabPricingAdapter.js`. |
| Testing/verification skill | Cost confidence checks, source label checks, mobile usability, and event-menu handoff checks. |
| Risks and guardrails | No fake costs, no benchmark-as-verified pricing, no unsourced supplier claims, no recipe facts invented from missing data. |

### Academy / Training Experience

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Existing `hestia-academy-design-curriculum`; consider upgrading or renaming to `hestia-academy-experience`. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design`. |
| Implementation skill | Existing Academy architecture first: `src/features/academy/AcademyDashboard.jsx`, `src/features/academy/LessonPlayer.jsx`, `src/features/academy/CourseDetail.jsx`, `src/features/academy/WineAtlas.jsx`, and `src/hooks/useAcademyState.js`. |
| Testing/verification skill | Lesson flow, mobile, role, progress semantics, and copy checks. |
| Risks and guardrails | Do not make Academy a generic LMS. Progress should not pretend skill mastery. Training must connect to venue standards and operational formation. |

### Venue Intelligence / Venue DNA

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-venue-memory-provenance`. |
| Product judgment skill | `hestia-product-design-judgment` plus `hestia-hospitality-intelligence`. |
| Design direction skill | `hestia-ui-design`. |
| Implementation skill | Existing files first: `src/features/venue-intelligence/VenueIntelligenceDashboard.jsx`, `src/features/venue-intelligence/VenueDnaProfile.jsx`, `src/hooks/useVenueIntelligenceState.js`, `src/services/venueBrainService.js`, `src/services/venueDnaModel.js`, and `src/services/venueBridgeService.js`. |
| Testing/verification skill | Venue isolation, owner/admin access, source confidence, and memory mutation checks. |
| Risks and guardrails | Do not let Venue DNA become decorative brand text. DNA changes should be grounded, source-aware, and reviewable. |

### Guest-facing Hospitality Flows

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | `hestia-hospitality-intelligence`; future `hestia-story-carousel` for guided guest flows. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design`; manual `frontend-design` or `imagegen-frontend-web` only for reference exploration. |
| Implementation skill | Existing guest files first: `src/features/guest/GuestPortal.jsx`, `src/features/guest/GuestRsvpPage.jsx`, and `src/hooks/useGuestPortalState.js`. |
| Testing/verification skill | Mobile-first testing, accessibility, privacy language, reduced motion, and RSVP/guest-state checks. |
| Risks and guardrails | No hidden-fee patterns, no fake personalization, no excessive upsell, no chatbot dependency for basic guest tasks. |

### Investor / Presentation Outputs

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | `doc-coauthoring` equivalent for narrative specs, then `pptx` or local `presentations:Presentations` for deck output. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design`; manual `high-end-visual-design` only if it does not override HESTIA rules. |
| Implementation skill | Presentations plugin or PPTX skill, not production app code. |
| Testing/verification skill | Rendered slide review and claim audit against `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md` and `memory/project_hestia_master_memory.md`. |
| Risks and guardrails | Do not overstate maturity. Mark prototype, partial, localStorage-only, and production-ready areas accurately. |

### 3D / Cinematic Interaction Layers

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-3d-experience`. |
| Product judgment skill | `hestia-product-design-judgment`. |
| Design direction skill | `hestia-ui-design`; manual `high-end-visual-design` only for visual reference. |
| Implementation skill | Three.js or React Three Fiber only in isolated prototypes or carefully bounded production components. |
| Testing/verification skill | Browser screenshot, canvas-pixel checks, performance checks, reduced-motion fallback, keyboard escape paths, and mobile checks. |
| Risks and guardrails | 3D should be rare. It must reveal operational or hospitality meaning, not act as a luxury decoration. |

### QA / Visual Testing

| Pipeline layer | Recommendation |
| --- | --- |
| Strategy/spec skill | Future `hestia-skills-orchestrator` chooses the relevant QA route. |
| Product judgment skill | `hestia-product-design-judgment` checks whether the verified behavior matches product intent. |
| Design direction skill | `hestia-ui-design` checks spacing, hierarchy, role clarity, visual tone, and mobile fit. |
| Implementation skill | Browser control skill, `webapp-testing` equivalent, build scripts, and any repo-specific check scripts. |
| Testing/verification skill | Required for UI changes: desktop, mobile, role exposure, reduced motion, empty/error states, and source/provenance labels where intelligence is shown. |
| Risks and guardrails | A screenshot is not enough. HESTIA QA must verify operational truth, not only visual polish. |

## 5. What Should Be Custom HESTIA Skills

| Skill | Priority | Why it exists | What it prevents | Project files it should reference | Rules it should enforce | Allowed tools | Invocation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `hestia-skills-orchestrator` | First | Chooses the correct skill sequence for each request. | Visual-first work, random skill use, generic redesigns, disconnected modules. | `memory/project_hestia_master_memory.md`, `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md`, `skills/user/hestia-ui-design/SKILL.md`, `skills/user/hestia-product-design-judgment/SKILL.md`, `skills/user/hestia-hospitality-intelligence/SKILL.md`. | Read source of truth first; connect before building; choose domain skill; require verification; never bypass secrets rules. | File read/search, browser testing, build/test commands when needed, skill references. | Auto. |
| `hestia-owner-threshold` | Later | Converts the Owner Threshold idea into a governed production decision process. | Direct prototype integration, fake faculties, theatrical entry screens, invented operational signals. | `prototypes/owner-threshold.html`, `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md`, `src/features/auth/VenueSelector.jsx`, `src/features/owner/`, `src/services/venueBrainService.js`, `src/services/venueBridgeService.js`. | Prototype remains prototype; production entry uses real venue state; no fake urgency; reduced motion; role-safe owner view. | File read/search, browser testing, no image generation by default. | Manual only until production scope is approved. |
| `hestia-operational-intelligence-ui` | High | Governs Owner Intelligence, Shift Brain, action queues, reports, and operational recommendations. | KPI-wall dashboards, chatbot-first UX, unsourced recommendations, duplicate intelligence logic. | `src/features/OwnerPulse.jsx`, `src/features/actions/ActionBoard.jsx`, `src/features/shift-brain/`, `src/services/shiftBrainService.js`, `src/hooks/useShiftBrainState.js`, `src/services/ownerReportService.js`. | Intelligence must be embedded in workflow; recommendations need source/confidence; no duplicated intelligence in components; role boundaries stay visible. | File read/search, build/test, browser. | Auto for owner/operations/intelligence UI. |
| `hestia-event-manager-ui` | High | Protects Event Manager as hospitality operations, not generic CRM. | Rebuilding calendar/detail flows, Zohar as generic assistant, disconnected department handoffs. | `src/features/events/EventCalendar.jsx`, `src/features/events/EventDetail.jsx`, `src/features/events/EventZoharPanel.jsx`, `src/features/events/EventBrain.jsx`, `src/hooks/useEventState.js`, `src/services/zoharEventService.js`. | Use existing event model; preserve event lifecycle; Zohar recommendations must connect to departments; no fake event data in production. | File read/search, build/test, browser. | Auto for event work. |
| `hestia-beverage-intelligence-ui` | High | Governs CI, Omer, Cocktail Lab, bar costing, and event beverage handoffs. | Fake costs, supplier hallucinations, benchmark-as-truth, generic cocktail app drift. | `src/features/ci/`, `src/features/bar/CocktailLabStudio.jsx`, `src/features/bar/CocktailBuildExperience.jsx`, `src/domain/hospitality/bar/`, `src/services/cocktailLabPricingAdapter.js`, `docs/architecture/HESTIA_BAR_PRODUCT_FOUNDATION.md`. | Preserve costing honesty; show confidence/source; no invented costs or recipe facts; connect beverage work to event and venue context. | File read/search, build/test, browser. | Auto for beverage/cocktail work. |
| `hestia-academy-experience` | Medium | Upgrade or rename the existing Academy skill into a broader experience skill. | LMS grids, badges, shallow progress, disconnected training. | `skills/user/hestia-academy-design-curriculum/SKILL.md`, `src/features/academy/`, `src/hooks/useAcademyState.js`, relevant Academy docs. | Academy is professional formation; lessons connect to venue standards; progress is exposure unless assessed. | File read/search, build/test, browser. | Auto for Academy work. |
| `hestia-venue-memory-provenance` | High | Adds source, confidence, memory, and venue-specific truth rules across intelligence surfaces. | Fake operational intelligence, memory fragmentation, cross-venue leakage, overconfident DNA. | `src/domain/hospitality/hospitalityMemoryMap.js`, `src/services/venueDnaModel.js`, `src/services/venueBridgeService.js`, `src/features/venue-intelligence/`, `docs/research/researches for Venue Intelligence/HESTIA Intelligence Doctrine v1.md`, `docs/research/researches for Venue Intelligence/THE VENUE INTELLIGENCE RESEARCH.md`. | Every intelligence claim needs source/provenance; memory candidates are not facts until confirmed; venue boundaries are enforced. | File read/search, build/test, browser. | Auto for memory/intelligence work. |
| `hestia-story-carousel` | Later | Creates guided narrative flows for owner entry, guest journeys, onboarding, and package explanation. | Static cards, overbuilt 3D, generic marketing carousels. | Attached PDF research, `prototypes/owner-threshold.html`, `src/features/guest/`, `src/features/auth/`. | Narrative flows must be short, operationally true, accessible, mobile-first, and skip-friendly. | Browser testing; optional imagegen only manually. | Manual only. |
| `hestia-3d-experience` | Later | Governs rare cinematic layers for venue, event, or hospitality scenes. | Decorative 3D, performance failure, inaccessible motion, fake luxury. | Attached PDF research, `skills/user/hestia-ui-design/SKILL.md`, any future 3D prototype folder. | 3D must reveal real context; provide reduced-motion fallback; verify performance; do not use as default navigation. | Browser, canvas checks, build/test. | Manual only; never default. |

The first 3-6 custom skills to build or improve should be:

| Rank | Skill | Action |
| --- | --- | --- |
| 1 | `hestia-skills-orchestrator` | Create. |
| 2 | `hestia-venue-memory-provenance` | Create. |
| 3 | `hestia-operational-intelligence-ui` | Create. |
| 4 | `hestia-event-manager-ui` | Create. |
| 5 | `hestia-beverage-intelligence-ui` | Create. |
| 6 | `hestia-academy-experience` | Improve existing `hestia-academy-design-curriculum` or split it if it becomes too broad. |

## 6. Owner Threshold Decision

Owner Threshold should remain prototype only for now. It may be productionized later, but only by rebuilding it as a real operational-awareness entry, not by integrating `prototypes/owner-threshold.html` directly.

Use these skills:

| Use | Reason |
| --- | --- |
| `hestia-skills-orchestrator` | To choose the correct route and stop prototype-to-production shortcuts. |
| `hestia-product-design-judgment` | To validate whether the entry helps owners understand venue state. |
| Future `hestia-owner-threshold` | To govern the specific Owner Entry pattern. |
| Future `hestia-venue-memory-provenance` | To require real signals, source labels, and venue boundaries. |
| `hestia-ui-design` | To apply HESTIA visual language after the operational model is real. |
| Manual `hestia-story-carousel` | Only if the entry becomes a short guided sequence. |

Do not use these by default:

| Do not default to | Reason |
| --- | --- |
| `high-end-visual-design` | It can push theatrical luxury before operational truth. |
| `imagegen-frontend-web` | It can create persuasive visuals that do not match runtime data. |
| `web-artifacts-builder` | It can bypass HESTIA architecture if treated as production implementation. |
| `hestia-3d-experience` | 3D is not justified for Owner Entry until a real operational reason exists. |

The production Owner Entry should show real venue signals, not invented faculties. It may reference existing named intelligences such as Omer or Zohar only when their actual domain is involved. It should not add new personas. It should not show hardcoded "operational observations", demo states, fake venue pressure, fake quiet/busy judgments, fake memory confidence, fake event urgency, cross-venue data, guest PII, or any intelligence claim without source and confidence.

## 7. Install and Invocation Strategy

| Level | Recommendation |
| --- | --- |
| Project-level | Keep HESTIA-specific skills in `skills/user/`. Add `hestia-skills-orchestrator`, `hestia-venue-memory-provenance`, `hestia-operational-intelligence-ui`, `hestia-event-manager-ui`, and `hestia-beverage-intelligence-ui` there. |
| Global-level | Keep generic helpers such as `skill-creator`, browser testing, documents, presentations, and image generation global. They are tools, not HESTIA doctrine. |
| Manual only | `high-end-visual-design`, `imagegen-frontend-web`, `frontend-design`, `web-artifacts-builder`, `pptx`, `doc-coauthoring`, `canvas-design`, `mcp-builder`, `hestia-story-carousel`, and `hestia-3d-experience`. |
| Should not be installed | Generic SaaS dashboard skills, chatbot builder skills, broad CRM template skills, hotel booking template skills, and all-in-one "luxury app" skills. |
| Should not auto-invoke | Any visual reference/image skill, 3D skill, presentation skill, MCP/API builder, or prototype builder. |

The auto-invoked layer should be HESTIA-specific and conservative. The manual layer can be more exploratory, but only after the HESTIA gate has defined the product truth.

## 8. Risk Analysis

| Risk | Why it matters | Skill guardrail |
| --- | --- | --- |
| Generic SaaS drift | HESTIA can collapse into cards, charts, filters, and KPI summaries. | `hestia-product-design-judgment` before `hestia-ui-design`. |
| Dashboard/card drift | The audit found repeated dashboards and large surfaces. More cards will not connect the product. | `hestia-operational-intelligence-ui` and `hestia-event-manager-ui`. |
| AI chatbot drift | Owner, Zohar, Omer, and Academy can become generic chat windows. | Domain skills must require embedded workflow intelligence. |
| Decorative luxury | Taste skills and image generation can make the app look premium without making it operationally useful. | Manual-only visual inspiration; HESTIA UI skill remains production authority. |
| Fake operational intelligence | Hardcoded observations or demo recommendations break trust. | `hestia-venue-memory-provenance`; source/confidence required. |
| Too many personas | HESTIA already has Omer and Zohar plus intelligence surfaces. More personas can fragment responsibility. | Orchestrator blocks new personas unless a workflow requires them. |
| Hardcoded demo data | Prototype content can leak into production expectations. | Domain skills must identify fake/demo data and keep it labeled or isolated. |
| Role leakage | Owner, admin, manager, staff, chef, and guest surfaces must not expose the wrong intelligence. | QA pipeline includes role checks. |
| Performance | Owner entry, 3D, visual motion, and large dashboards can slow mobile use. | Browser testing, reduced-motion checks, and 3D manual-only policy. |
| Accessibility and reduced motion | Hospitality workflows must work under pressure, on mobile, and for users with motion sensitivity. | QA skill requires mobile, keyboard, contrast, and reduced-motion checks. |
| Memory fragmentation | Venue Memory, Venue DNA, reports, Zohar, CI, and Academy can maintain separate truths. | `hestia-venue-memory-provenance` as a cross-cutting skill. |
| Backend monolith risk | The audit flagged a large backend surface. New integration skills could add endpoints without clear contracts. | `mcp-builder` and API work stay manual until integration boundaries are defined. |

## 9. 30-Day Roadmap

| Week | Work | Output |
| --- | --- | --- |
| Week 1 | Create `hestia-skills-orchestrator` and `hestia-venue-memory-provenance`. Use `skill-creator` to keep both small and reference-driven. | A project-level skill gate that forces source reading, domain selection, memory/provenance rules, and verification. |
| Week 2 | Create `hestia-operational-intelligence-ui`, `hestia-event-manager-ui`, and `hestia-beverage-intelligence-ui`. Test them against one real task each without changing production behavior. | Domain-specific guidance that connects Owner, Event, Zohar, CI, Omer, Shift Brain, and Cocktail Lab instead of adding modules. |
| Week 3 | Upgrade `hestia-academy-design-curriculum` into `hestia-academy-experience` if needed. Draft manual-only `hestia-story-carousel` for Owner Entry and guest-facing flows. | Academy remains formation-centered, while story flows get a bounded pattern that does not become generic marketing. |
| Week 4 | Run the pipeline on three near-term HESTIA tasks: one Owner/operations task, one Event/Zohar handoff task, and one Beverage/CI task. Document gaps and revise the skills. | A tested HESTIA Skill Pack that improves current work quality without redesigning the product or adding disconnected modules. |

## 10. Final Answer

The first HESTIA skill we should build or upgrade is: `hestia-skills-orchestrator`

HESTIA already has domain skills, visual rules, and product judgment, but it does not yet have a reliable gate that chooses the correct sequence. Without that gate, Codex can still jump straight to visual polish, prototype building, or generic UI advice. The orchestrator should force every strategic or UI task to start with `memory/project_hestia_master_memory.md`, the project audit, and the relevant domain skill. It should make "connect existing systems first" the default behavior. It should also decide when Taste Skills, image generation, presentations, 3D, or web artifact builders are allowed, which should usually mean manual-only. This skill prevents the most expensive failure mode: making HESTIA look more finished while leaving its intelligence layers disconnected.
