# HESTIA Skill Alignment Audit

Audit date: 2026-06-08

Scope:

- `skills/user/hestia-hospitality-intelligence/SKILL.md`
- `skills/user/hestia-product-design-judgment/SKILL.md`
- Zohar Event Director
- Cocktail Intelligence
- Event Architect
- Service School
- Wine Academy
- Operational Memory

This audit reviews alignment only. No code changes were made.

## Executive Read

HESTIA already has strong foundations for deterministic operational intelligence, especially in Zohar, Event Architect, Cocktail Intelligence, and the hospitality ontology. The strongest alignment is with the product skill's architecture rules: hooks own state, services/utilities own intelligence, components mostly render, and missing data is often handled honestly rather than invented.

The main gap is not effort; it is hospitality depth at runtime. Several systems understand readiness, tasks, menus, and progress, but they do not yet consistently reason through guest emotion, arrival/welcome/farewell, accessibility, recovery, event-type DNA, or memory capture.

The second major gap is memory maturity. HESTIA has a live `business_memory` flow and a rich `hospitalityMemoryMap`, but they are not yet unified. Live memory is mostly flat `type/title/detail/date` records, while the skill requires provenance, confidence, sensitivity, role access, source events, and recall at the moment of service.

The third gap is product focus. Some live surfaces still show demo/future/investor/module language inside operational workflows. That conflicts with the product judgment skill's instruction to avoid dashboard bloat, fake/demo signals, and software-facing module language.

## Source Surfaces Reviewed

Primary implementation files reviewed:

- `src/features/events/utils/zoharBriefOrchestrator.js`
- `src/features/events/utils/zoharRiskEngine.js`
- `src/features/events/utils/zoharCoordinationEngine.js`
- `src/features/events/utils/zoharTimelineEngine.js`
- `src/features/events/tabs/EventZohar.jsx`
- `src/features/events/EventBrain.jsx`
- `src/features/events/components/ZoharPanel.jsx`
- `src/features/events/utils/eventMenuDNA.js`
- `src/features/events/components/EventBriefMenuGenerator.jsx`
- `src/features/cocktail-intelligence/CocktailIntelligenceDashboard.jsx`
- `src/features/cocktail-intelligence/MenuGenerator.jsx`
- `src/features/cocktail-intelligence/BeverageDirector.jsx`
- `src/features/cocktail-intelligence/RejectionMemory.jsx`
- `src/prompts/geminiCocktailPrompts.js`
- `src/services/geminiCocktailAgent.js`
- `src/features/academy/Courses.jsx`
- `src/features/academy/LessonPlayer.jsx`
- `src/data/academy/universityManifest.js`
- `src/data/academy/serviceDoctrine.js`
- `src/features/academy/WineKnowledge.jsx`
- `src/features/wine-atlas/WineAtlas.jsx`
- `src/features/wine-atlas/pages/AtlasAcademy.jsx`
- `src/hooks/useReportsState.js`
- `src/hooks/useOperationsState.js`
- `src/domain/hospitality/hospitalityMemoryMap.js`
- `src/services/shiftBrainService.js`
- `server.js`

## 1. Zohar Event Director

### 1. What Already Follows The Skills

- Zohar is deterministic and data-honest. `zoharBriefOrchestrator`, `zoharRiskEngine`, `zoharCoordinationEngine`, and `zoharTimelineEngine` are pure utilities with no AI calls, no side effects, and null-safe behavior.
- It follows the product skill's service-readiness principle. It produces readiness scores, missing inputs, risk assessment, department coordination, next best action, and event director summaries.
- It connects events into food, cocktail, seating, tasks, timeline, and briefing flows, which strongly matches the product skill's Event Integration Rule.
- It uses real event fields and marks incomplete planning with missing inputs rather than inventing data.
- It creates bar and kitchen briefs from event context, which aligns with the hospitality skill's practical food/cocktail/event flow guidance.

### 2. What Violates The Skills

- Event-type intelligence is too narrow. Runtime event logic mainly supports `wedding`, `corporate`, `private`, `bar_event`, and `other`, while the hospitality skill defines richer DNA for luxury weddings, executive events, brand launches, luxury brand launches, wine events, resort events, hotel events, desert events, charity galas, and VIP events.
- Zohar is still more operational coordinator than world-class Event Director. It sees readiness and risk, but only lightly represents guest emotion, host anxiety, privacy, welcome/farewell, accessibility, service recovery, and peak memory moments.
- Some phrasing still leans toward task mechanics rather than hospitality outcomes. Example: "Create cocktail menu task" is operationally useful but does not explain what guest/host feeling the action protects.
- Timeline intelligence says phases are inferred, but it lacks a memory-capture or post-event reflection layer, so the journey ends at planning rather than compounding.

### 3. Missing Hospitality Intelligence

- Guest journey stages: before arrival, arrival, welcome, experience, peak moments, farewell, and after-departure memory.
- Event-specific emotional contracts beyond the current short type map.
- Host anxiety detection and host-protection recommendations.
- Accessibility hospitality: mobility routes, restroom access, communication needs, dietary dignity, sensory considerations, and privacy.
- Service recovery planning: who owns guest trust if a failure occurs.
- Luxury standards: privacy, discretion, calm confidence, personalization, and invisible preparation.
- Wine-specific, charity, VIP, desert, hotel, resort, and luxury brand launch logic.

### 4. Missing Product Judgment

- Zohar should produce a clearer role-specific Event Manager output: what to brief, what to assign, what to escalate, what to verify, what to remember.
- The brief currently exposes department sections, but there is not yet a strong "team handoff" output for each department.
- Missing data is listed, but the system does not always state planning confidence or what cannot yet be trusted.
- Zohar does not yet create a closed loop from recommendation to task to outcome to memory.

### 5. Missing Operational Memory

- No event-end learning capture: what worked, what failed, bar pressure, kitchen timing, guest feedback, recovery actions, dietary issues, supplier issues, host preferences, and rebooking signals.
- No structured memory candidate output with source, confidence, sensitivity, and recommended owner.
- No distinction between confirmed fact, observation, inference, and unknown inside the Zohar brief.
- No recall of prior client/event memory when building a new brief.

### 6. Recommended Improvements

- Add a deterministic `eventHospitalityDNA` layer mirroring the new hospitality skill's event types and emotional contracts.
- Extend Zohar brief output with `hospitalityRead`, `journeyRisks`, `peakMoments`, `accessibilityChecks`, `serviceRecoveryPlan`, and `memoryCandidates`.
- Convert next-best actions into role-aware briefing language: Event Manager, Bar Manager, Chef/F&B, Service Captain, Host/Guest Relations.
- Add planning confidence labels for inferred timeline, inferred event type, missing guest profile, missing dietary/accessibility data, and unconfirmed VIP handling.
- Add post-event Zohar review prompts that write structured operational memory candidates instead of flat notes.

## 2. Cocktail Intelligence

### 1. What Already Follows The Skills

- Cocktail Intelligence strongly reflects the hospitality skill's Cocktail Program DNA. Prompts and services evaluate menu role, guest psychology, speed, prep burden, waste, margin, bar pressure, and premium perception.
- The Beverage Director persona is not a generic chatbot in intent. It pushes back on weak requests, protects the operation, and behaves like a professional consultant.
- Rejection Memory and Taste DNA are strong examples of compounding memory. They avoid passing unconfirmed patterns to the Beverage Director until the user confirms them.
- Event-scoped cocktail generation connects Zohar briefs to cocktail menus through `EventBriefMenuGenerator`, `eventMenuDNA`, and event cocktail menu persistence.
- The system preserves costing honesty in the broader bar/cocktail lab foundation and avoids silently treating uncertain costs as verified.
- Zero-proof parity, batchability, welcome drinks, service speed, and guest demographics appear in the prompts and event menu logic.

### 2. What Violates The Skills

- The main dashboard still reads as a collection of modules in places: "Module 1", "Module 2", "Module 6", "Module 10", "5PM Emergency Mode coming in Module 10." The product skill asks HESTIA to avoid software/module surfaces that make users manage the app instead of hospitality.
- "AI Beverage Director" and "AI-generated cocktail photography" are more software-forward than the product skill prefers. HESTIA AI should feel embedded, not pasted in.
- Emergency Mode is visible but not live. Showing a prominent urgent control that leads to "coming in Module 10" is a product judgment violation for an operational tool.
- The Beverage Director chat surface risks feeling like a chatbot, even though the underlying voice is strong.

### 3. Missing Hospitality Intelligence

- Event cocktail generation should explicitly include welcome-drink readiness, first-hour bar pressure, hydration/food support, responsible-service risks, and guest demographic fit as first-class checks.
- Cocktail menus should carry event-type emotional contract labels: wedding inclusion, executive discretion, brand-launch identity, VIP privacy, desert hydration, charity ceremony, wine-event confidence.
- Luxury cocktail guidance should distinguish restraint, temperature, texture, glassware, rhythm, and bartender room-reading from visual theater.
- Service recovery for bar failures is missing: delayed bar queue, wrong drink, allergy/ingredient concern, intoxication risk, flat welcome serve, failed batch.

### 4. Missing Product Judgment

- The live dashboard should be converted from "modules" to workflow commands: build event menu, audit current menu, brief bar team, review rejected patterns, prepare emergency service.
- Future modules should be hidden or moved to roadmap/docs until live.
- The Beverage Director should stay inside concrete workflows more often: menu approval, event brief, audit, rejection review, margin review, service prep.
- Output should more consistently end with actionable decisions: approve, reject, simplify, batch, brief staff, update menu, save memory.

### 5. Missing Operational Memory

- Rejection memory is strong, but acceptance/outcome memory is weaker. The system should remember which generated cocktails were approved, sold, rejected, edited, profitable, slow, praised, or operationally painful.
- Event cocktail menus do not appear to write structured post-event learnings into venue memory.
- Emergency decisions are not yet captured as service-pressure memory.
- Taste DNA does not yet include confidence explanations visible across event contexts.

### 6. Recommended Improvements

- Rename live modules into hospitality workflows and hide non-live modules.
- Add a Cocktail Service Readiness output for every generated event menu: batch plan, garnish plan, ice plan, glassware plan, station plan, zero-proof parity, water/food support, and queue risk.
- Add acceptance memory alongside rejection memory: "works well for weddings", "too slow above 120 guests", "strong guest praise", "high waste", "low-margin but brand-important."
- Add post-event cocktail debrief capture: top ordered drinks, slow builds, batch misses, guest praise, waste, queue pressure, recovery actions.
- Add a first-class `memoryCandidates` payload when menus are approved, rejected, audited, or used in an event.

## 3. Event Architect

### 1. What Already Follows The Skills

- Event Architect directly improves real event work: floor plan, seating, guest assignment, VIP table warnings, capacity warnings, service paths, and Zohar intelligence.
- It connects the event brief into seating, bar, kitchen, timeline, and printed operational brief surfaces.
- The architecture generally follows the product skill's "preserve modules and connect them" principle by using deterministic utilities and passing structured intelligence into rendering components.
- It supports event-linked plans and persists floor plan changes per event.
- It has practical operational actions: assign guest, unassign guest, change table capacity/type, print brief, open Zohar intelligence.

### 2. What Violates The Skills

- The operational studio still falls back to demo data and displays "Demo architect plan shown" when event data is unavailable. That is acceptable for a prototype, but it violates the product skill's warning against fake/demo operational surfaces.
- `EventBrain.jsx` includes `InvestorValueCard` and `PilotValueCard` inside the live Event Architect screen. That is not hospitality workflow and creates product bloat.
- The default table arrangement can be saved as a plan even when it is not tied to a real event, which risks confusing simulation with operational truth.
- Some UI language is software-oriented: demo, plan saved, default plan, Event Architect Studio, rather than an event captain's operational language.

### 3. Missing Hospitality Intelligence

- Accessibility-aware floor planning: wheelchair routes, restroom proximity, quiet seating, sensory needs, elder comfort, terrain/weather constraints.
- Guest psychology: family dynamics, VIP privacy, host anxiety, table status hierarchy, conversation comfort, sightlines for peak moments.
- Journey-based layout: arrival path, welcome drink station, coat check, restroom path, bar queue, photo moment, speech sightlines, farewell/transport.
- Event-type layout DNA: corporate networking flow differs from wedding family seating, executive privacy, luxury launch density control, and desert event safety.
- Service recovery planning for floor-plan failures: overflow, blocked route, VIP exposed, dietary guest seated far from service owner.

### 4. Missing Product Judgment

- The system should not show investor/pilot proof cards in an operational tool.
- Demo fallback should be gated behind a clearly separate "simulation" or "example" route, not the same path used for real planning.
- Event Architect should prioritize briefing and handoff outputs over value cards.
- The floor plan should create role-aware actions: host, captain, bar, kitchen, runners, accessibility owner.

### 5. Missing Operational Memory

- Floor plan changes do not appear to write structured memory about event layout outcomes.
- There is no post-event feedback loop: which layout caused queues, which VIP placement worked, where service paths failed, what should be reused.
- Guest/table assignment memory is not lifted into guest/client memory after the event.
- No confidence/provenance metadata on inferred layout recommendations.

### 6. Recommended Improvements

- Split demo/simulation from real operational Event Architect.
- Remove investor/pilot cards from the live planning view.
- Add a `guestJourneyMap` panel: arrival, welcome, bar, seating, peak moment, farewell.
- Add `accessibilityReadiness` and `servicePathReadiness` intelligence.
- Add event-type floor-plan rules: wedding family flow, corporate networking, executive privacy, luxury brand density, desert safety, gala donor recognition.
- Add a post-event layout review that writes memory candidates for future Event Architect planning.

## 4. Service School

### 1. What Already Follows The Skills

- Service School is correctly framed as professional formation, not generic training. The live copy says guests are people we host, not customers.
- `universityManifest.js` contains rich hospitality learning content: objective, doctrine, technical depth, common failures, amateur vs professional, real service context, guest application, manager notes, drills, and assessment questions.
- The Lesson Player turns lessons into guided steps: introduction, foundation, vocabulary, common failures, real service, standards/recovery, manager notes, practice, and recap.
- The system supports progress and lesson sequencing, which matches the product skill's role-aware workflow.
- The Service Doctrine file contains strong service markers: personalized greeting, tailored pacing, table maintenance, discreet service, and farewell.

### 2. What Violates The Skills

- The live Courses hub still uses generic education mechanics in places: completed lessons, open academy, course grid, progress. It is functional, but not always the "professional formation environment" implied by the skills.
- The Service School is not yet connected to operational incidents, staff coaching, service recovery outcomes, or shift memory.
- The training system can mark completion without evidence of service application or manager review.
- Some academy content and docs are richer than the live experience; the runtime does not fully express the hospitality intelligence already designed.

### 3. Missing Hospitality Intelligence

- Room-reading, anticipation, guest states, welcome/farewell rituals, recovery judgment, accessibility, dietary dignity, and luxury discretion need to be consistently present across lesson recommendations.
- Scenario-based simulations should map to real HESTIA incidents and event contexts.
- Service School should teach not only "what to do" but how the action changes guest emotion.
- There is no explicit guest journey curriculum surface tying threshold, table, service, recovery, and farewell into one loop.

### 4. Missing Product Judgment

- Service School should be less like a course catalog and more like role development tied to service readiness.
- It should connect to Shift Brain and manager coaching: repeated incident patterns should recommend specific lessons.
- It should support role-aware workflows for employee, manager, service captain, host, bartender, and event staff.
- Lesson completion should create meaningful readiness or coaching signals, not just progress metrics.

### 5. Missing Operational Memory

- Lesson completion does not appear to write operational memory beyond academy progress.
- There is no memory of which lesson helped resolve which operational pattern.
- No staff development memory connects lesson completion, drills, manager notes, incidents, and observed improvement.
- No confidence or review status exists for staff skill memory.

### 6. Recommended Improvements

- Add a Service School memory loop: incident pattern -> recommended lesson -> completion -> manager observation -> resolved/not resolved.
- Add role-specific lesson recommendations from Shift Brain and Operational Memory.
- Add manager-reviewed practice outcomes for recovery, greeting, pacing, accessibility, and farewell lessons.
- Add a "service judgment" layer to each lesson: guest feeling, operational behavior, mistake prevented, memory to capture.
- Convert generic course language into hospitality-native formation language where possible.

## 5. Wine Academy

### 1. What Already Follows The Skills

- Wine Atlas is visually and educationally strong. It uses an editorial learning world with WSET-inspired structure, palate calibration, blind tasting logic, aroma memory, regions, grapes, pairing, and service psychology.
- The Wine Atlas Academy includes structured modules, sensory science, narrative learning, and exam-style reasoning.
- `WineKnowledge.jsx` explicitly frames the future target as WSET Level 3 depth with guest-facing language.
- Wine service appears inside the broader academy manifest through event wine service at scale, bottle allocation, temperature, pour control, and guest experience.

### 2. What Violates The Skills

- `WineKnowledge.jsx` is clearly a foundation/stub surface with "Future target" and "Sample sections only." That is honest, but it means Wine Academy is not yet production-grade as a live system.
- Wine Atlas includes mock AI sommelier responses selected randomly. That can feel like simulated intelligence rather than an embedded professional assistant.
- Wine learning is not yet connected to service workflows, menus, events, guest confidence, or operational memory.
- The academy is more knowledge-rich than hospitality-actionable in the live app.

### 3. Missing Hospitality Intelligence

- Guest confidence building as a live workflow: choosing wine without intimidation, translating style, reducing price anxiety, and calibrating vocabulary.
- Table-reading and sommelier discretion: collector vs novice, business meal vs celebration, host budget sensitivity.
- Pairing recommendations tied to actual Food Intelligence or event menus.
- Luxury wine operations: temperature, glassware, pacing, storage confidence, bottle presentation, VIP discretion.
- Non-alcoholic pairing parity.
- Wine service recovery: corked bottle, wrong wine, warm sparkling, slow pour, guest embarrassment.

### 4. Missing Product Judgment

- Wine Academy needs a clearer product role: education only, event support, menu pairing, staff training, or sommelier assistant.
- Avoid random/mock AI responses in production-facing academy moments unless labeled as simulation.
- Connect Wine Academy to real workflows: event wine plan, staff briefing, pairing language, service standards, guest recommendation scripts.
- Ensure Wine Academy is not a disconnected editorial island.

### 5. Missing Operational Memory

- No memory loop for staff wine confidence, tasting progress, pairing outcomes, guest preferences, wine complaints, or bottle/service issues.
- No event wine debrief: bottle yield, warm/cold service issues, guest praise, pairing success, over-pour, glassware shortage.
- No guest or client wine preference memory with sensitivity/confidence controls.

### 6. Recommended Improvements

- Decide whether Wine Academy is a learning world, sommelier assistant, or both; then route interactions accordingly.
- Add `Wine Hospitality Brief` outputs for events: wine expectation, pairing logic, guest vocabulary level, service risks, temperature/glassware plan, and memory capture.
- Replace random mock sommelier responses with deterministic educational feedback or a clearly labeled simulation until real AI is wired.
- Connect wine lessons to Service School and Event Architect: wine service at scale, VIP wine handling, pairing with event menus.
- Add wine memory candidates: guest style preference, event pairing success, bottle yield, service issue, staff confidence gap.

## 6. Operational Memory

### 1. What Already Follows The Skills

- HESTIA has real memory plumbing through `useReportsState`, `/api/business-memory`, incidents, reports, actions, shift snapshots, event plans, and pre-shift briefing snapshots.
- `hospitalityMemoryMap.js` is excellent as a long-term foundation. It defines guest, staff, and operational memory types with sensitivity, retention, update policy, confidence policy, human review, and privacy warnings.
- Shift Brain can consume memory count and generate owner briefs from reports, incidents, actions, tasks, and memory.
- Service incidents and event plans currently create business memory entries, which supports the product skill's "memory should compound" direction.
- Static fake `BUSINESS_MEMORY` and `PROFIT_LEAKS` arrays are empty, which is safer than invented metrics.

### 2. What Violates The Skills

- Live memory records are flat: `id`, `date`, `type`, `title`, `detail`. They do not implement the skill's required distinction between fact, observation, inference, and unknown.
- Memory lacks provenance, source event links, confidence, sensitivity, role access, revocation, and human review status.
- Some memory writes are best-effort and silent on failure, which may be acceptable operationally but makes memory reliability hard to understand.
- Business Memory page is archived/pre-seed scope, so the main memory surface is not clearly available as a production workflow.
- Memory is still more log than judgment layer.

### 3. Missing Hospitality Intelligence

- Guest memory: preferences, allergies, accessibility, VIP handling, recovery history, celebration style.
- Event client memory: host preferences, layout preferences, menu feedback, timing preferences, anxiety points, rebooking signals.
- Service recovery memory: what failed, how it was resolved, whether trust was rebuilt.
- Food/cocktail/wine outcomes as future recommendation inputs.
- Accessibility memory with privacy and consent.
- Memory recall at moments that matter: arrival, event confirmation, pre-shift briefing, server handoff, menu generation, post-event review.

### 4. Missing Product Judgment

- Operational Memory should be a workflow layer, not an owner archive only.
- Memory capture should happen at natural moments: close shift, resolve incident, approve event menu, complete event, manager coaching, service recovery close.
- Memory recall should appear inside the workflows that need it, not as a separate destination users must remember to inspect.
- Each memory write should answer: who uses this next, when, and what decision does it improve?

### 5. Missing Operational Memory

- The live memory model lacks:
  - source event id
  - source system
  - entity links
  - confidence level
  - sensitivity tier
  - fact/observation/inference classification
  - owner/reviewer
  - review or expiry date
  - contradiction/revocation path
  - outcome field
  - recall context
- The `hospitalityMemoryMap` is not wired into runtime.
- No recommendation feedback loop exists across Zohar, Cocktail Intelligence, Wine Academy, or Service School.

### 6. Recommended Improvements

- Introduce a structured memory candidate shape aligned with `hospitalityMemoryMap`:
  - `memoryType`
  - `entityType`
  - `entityId`
  - `summary`
  - `sourceEventType`
  - `sourceEventId`
  - `evidence`
  - `confidence`
  - `sensitivity`
  - `classification`
  - `requiresHumanReview`
  - `recommendedRecallMoment`
  - `outcome`
- Add a memory distillation step after incidents, events, menu approvals, service recovery, lesson completion, and shift close.
- Keep flat `business_memory` as backward-compatible display data, but add structured metadata for future retrieval and role-aware recall.
- Wire memory recall into Zohar, Event Architect, Cocktail Intelligence, Service School, and Wine Academy.
- Add privacy gates before surfacing guest accessibility, allergy, VIP, or recovery memory.

## Cross-System Gaps

### Hospitality Intelligence Gaps

- Arrival, welcome, farewell, and after-departure memory are underrepresented at runtime.
- Accessibility hospitality is mostly conceptual, not embedded in planning flows.
- Luxury is sometimes represented as premium styling or content, but not consistently as privacy, precision, restraint, anticipation, and calm confidence.
- Event-type DNA needs to expand beyond current runtime categories.
- Service recovery is present in employee incident flow but not deeply connected to trust rebuilding, follow-up, or guest memory.

### Product Judgment Gaps

- Some live screens still expose demo, module, future, investor, and AI-forward language.
- Several systems are strong as individual features but not yet closed loops.
- Workflow outputs need stronger role-aware handoffs.
- Operational tools should reduce mental load, not expose roadmap structure.

### Operational Memory Gaps

- Memory exists but is not yet the common substrate.
- Structured memory candidates are missing from most intelligence outputs.
- Memory recall is weak compared with memory capture.
- Confidence, provenance, sensitivity, and review status are the biggest safety gaps.

## Recommended Implementation Order

1. Add structured memory candidates to Zohar, Cocktail Intelligence, and service incidents without changing the visible UI first.
2. Extend Zohar with event hospitality DNA and guest journey intelligence.
3. Remove or isolate demo/investor/future-module surfaces from live operational workflows.
4. Add post-event debrief capture for Event Architect, Zohar, Cocktail, Food, and Wine outcomes.
5. Connect Service School to incidents and coaching memory.
6. Define the Wine Academy product role and connect it to event wine planning and guest confidence.
7. Add role-aware memory recall into pre-shift, event confirmation, guest arrival, menu generation, and service recovery.

## Final Assessment

HESTIA is directionally aligned with both skills, especially in architecture discipline, deterministic intelligence, and hospitality-native ambition. The core systems already avoid many generic SaaS failures.

The next leap is to make the new hospitality intelligence skill operational. That means runtime systems should not only calculate readiness or generate menus. They should understand guest emotion, protect the host, anticipate service pressure, preserve dignity, recover trust, and remember the lessons that make the next service better.

