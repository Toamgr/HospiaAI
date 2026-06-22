# HESTIA Cognitive Core Architecture Audit

Status: Architecture audit only  
Date: 2026-06-22  
Scope: Repository review for future read-only and write-controlled Cognitive Core readiness  
Files changed by this task: Documentation only

## Executive Summary

HESTIA is directionally ready for a future read-only Cognitive Core, but it is not ready for a write-capable "Super Agent" that can mutate Venue DNA, memory, plans, menus, or operational records.

The repository already contains several strong foundations:

- Canonical Venue DNA is centralized in `venue_intelligence.venue_dna_json`.
- Specialist briefs are derived through `venue_briefs`.
- Shared context selection exists in `src/services/venueBridge/intelligenceContextService.js`.
- F&B decision memory has a strong provenance model in `fb_decisions`.
- Venue Intelligence candidates are explicitly signal-only and isolated from canonical DNA.
- Shift, event, F&B, Academy, owner, and creative systems already behave like specialist intelligences.

The main risk is not lack of intelligence. The main risk is source-of-truth drift. HESTIA currently has several memory-like stores, several DNA-like concepts, several event intelligence surfaces, and several local persistence pockets. A central orchestration layer can safely read from these, but it must not become another memory store or another agent with its own private facts.

The correct framing is:

> HESTIA Cognitive Core should be a cognitive architecture layer, not another specialist agent.

It should coordinate, synthesize, explain, and recommend. It should not own raw facts. It should not directly rewrite Venue DNA. It should not promote ideas into memory, official plans, or operational truth without human approval and evidence.

## Audit Method

This audit reviewed the master memory, strategic architecture documents, current architecture checkpoints, Venue Memory and DNA guardrails, specialist intelligence patterns, F&B/Menu intelligence docs, current server schema, state hooks, domain services, venue bridge services, event intelligence services, shift intelligence services, and current persistence patterns.

Important code and documents reviewed include:

- `memory/project_hestia_master_memory.md`
- `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md`
- `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md`
- `docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_AUDIT.md`
- `docs/architecture/SPECIALIST_INTELLIGENCE_PATTERN.md`
- `server.js`
- `src/config/systemConfig.js`
- `src/hooks/useReportsState.js`
- `src/hooks/useOperationsState.js`
- `src/hooks/useShiftBrainState.js`
- `src/hooks/useVenueIntelligenceState.js`
- `src/hooks/useEventState.js`
- `src/services/shiftBrainService.js`
- `src/services/venueBridge/*`
- `src/services/venueIntelligence/*`
- `src/services/eventIntelligence/*`
- `src/features/events/utils/zoharBriefOrchestrator.js`
- `src/features/events/utils/zoharDesignBriefEngine.js`
- `src/features/venue-intelligence/venueDnaModel.js`

## 1. Current Intelligence Map

### Where Venue Memory Is Currently Stored

HESTIA does not yet have one canonical Venue Memory table with a full evidence envelope. Venue Memory exists across several stores:

1. Canonical Venue Intelligence conversation state

- Table: `venue_intelligence`
- Fields: `messages_json`, `venue_dna_json`, `stage`, `objective`
- Role: Owner-facing venue learning conversation and current canonical Venue DNA store.
- Risk: Conversation messages are memory-like, but they are not normalized into a provenance-rich memory ledger.

2. Derived venue intelligence stores

- Table: `venue_briefs`
- Role: Deterministic specialist briefs derived from Venue DNA, bar DNA, and operational signals.
- Table: `venue_dna_enrichment`
- Role: Derived operational signal and confidence enrichment cache.
- Table: `venue_intelligence_candidates`
- Role: Candidate signals only. Explicitly isolated from Venue DNA.

3. Legacy and operational business memory

- Table: `business_memory`
- Frontend fallback/local state: `STORAGE.businessMemory` / `hospia.businessMemory`
- Role: Business memory events from reports, incidents, event plans, and manual memory writes.
- Risk: It stores important business knowledge but lacks the full modern envelope: evidence, confidence, source role, approval status, missing data, provenance type, and validation target.

4. Operational records with memory value

- Tables: `shift_reports`, `incidents`, `actions`, `event_plans`, `notes`, `shifts`, `carry_forward_tasks`, notifications.
- Role: Raw operational history and manager workflow.
- Risk: Some records also generate `business_memory`, creating duplicate representations of the same operational event.

5. Event intelligence records

- Tables: `events`, event guests, tables, tasks, timeline, messages, guest preferences, guest interactions, event creative images, event cocktail menus.
- Services: Zohar event brief and event hospitality DNA generation.
- Risk: Event intelligence creates rich derived meaning, but it should remain event-scoped and not be confused with Venue DNA.

6. F&B and menu intelligence records

- Tables include `cocktails`, `cocktail_intelligence_dna`, `cocktail_taste_dna`, `cocktail_sales`, `cocktail_scores`, `cocktail_lifecycle`, `cocktail_menus`, `event_cocktail_menus`, `food_menus`, `food_sales`, `fb_decisions`.
- Role: Product, menu, taste, scoring, lifecycle, and decision memory.
- Risk: This is strong specialist memory, but some names use "DNA" for bar/product intelligence and must not be treated as Venue DNA.

7. Academy and learning records

- Tables: `staff_progress`, `learning_event_logs`, `training_sessions`, `academy_lessons`.
- Local keys: `hospia.academyProgress`, `hospia.selectedAcademy`, `hospia.selectedLesson`.
- Role: Learning progress and training context.
- Risk: Progress is exposure/completion evidence, not proof of mastery unless separately validated.

8. Local persistence pockets

- Keys include `hospia.operationalNotes`, `hospia.ownerNotes`, `hospia.assignedTasks`, `hospia.employeeTasks`, `hospia.employeeRequests`, `hospia.budgetRequests`, `hospia.futureEvents`, `hospia.serviceIncidents`, `hospia.endOfDayArchive`, `hospia.verified_prices.*`, `hestia.eventArchitect.plan:*`, `hestia.programme_brief.*`, and older `hospia.venues`.
- Role: Offline continuity, local fallback, or feature-specific state.
- Risk: These cannot be treated as canonical source of truth by a Cognitive Core without explicit reconciliation rules.

### Where Venue Intelligence Is Currently Calculated

Venue Intelligence is calculated in several layers:

- `server.js`: owner conversation, OpenAI response handling, intent classification, `mergeVenueDna`, and brief regeneration.
- `src/services/venueBridge/venueBridgeService.js`: deterministic specialist briefs from Venue DNA, bar DNA, metadata, and operational memory.
- `src/services/venueBridge/intelligenceContextService.js`: shared context selectors for specialist use.
- `src/services/venueBridge/operationalSignalsService.js`: operational signal extraction and derived confidence enrichment.
- `src/services/venueBridge/ownerIntelligenceService.js`: owner-facing "what HESTIA learned" synthesis.
- `src/services/venueBridge/academyContextService.js`: learning context derived from venue briefs and academy progress.
- `src/services/venueBridge/menuIntelligenceService.js`: deterministic menu portfolio snapshot.
- `src/services/venueBridge/fnbDirectorBriefService.js`: F&B director synthesis from menu intelligence, decision ledger, and candidates.
- `src/services/venueIntelligence/venueDnaCompletenessEvaluator.js`: deterministic foundation readiness evaluation.

The healthiest pattern is the venue bridge: read canonical Venue DNA and raw facts, derive bounded specialist context, label confidence and missing data, and avoid direct DNA mutation.

### Where Venue DNA Is Stored or Inferred

Canonical Venue DNA is stored in:

- `venue_intelligence.venue_dna_json`
- Client shape reference: `src/features/venue-intelligence/venueDnaModel.js`

Canonical Venue DNA is inferred primarily through:

- The owner Venue Intelligence conversation.
- Server-side AI response parsing.
- `mergeVenueDna` in `server.js`.

Important caveat: `mergeVenueDna` is the current canonical DNA writer, but the Phase 7B guardrail audit already flags why candidate-to-DNA promotion is unsafe today: no per-signal provenance, no history/rollback, monotonic confidence, array replacement risk, and weak promotion auditability.

Derived or adjacent DNA-like concepts include:

- `venue_dna_enrichment`: derived operational enrichment, not canonical DNA.
- `venue_briefs`: derived specialist briefs, not canonical DNA.
- `venue_intelligence_candidates`: candidate signals, never DNA.
- `eventHospitalityDNA`: event-specific hospitality DNA, not Venue DNA.
- `cocktail_intelligence_dna` and `cocktail_taste_dna`: bar/product intelligence, not Venue DNA.
- `VENUE_DNA_COMPLETENESS_DIMENSIONS`: readiness model over Venue DNA, not new DNA storage.

### Modules Behaving Like Agents or Specialist Intelligences

Current specialist-like systems include:

- Venue Intelligence conversation: owner discovery and Venue DNA formation.
- Venue Bridge: deterministic specialist context distribution.
- Owner Intelligence: owner-facing learned synthesis.
- Shift Brain: deterministic shift risk, carry-forward, pressure, and focus generation.
- Event Intelligence / Zohar: event brief, hospitality DNA, department actions, guest and timeline synthesis.
- Creative / Design Intelligence: Zohar design brief, creative philosophy, visual direction, deliverables.
- F&B/Menu Intelligence: menu portfolio snapshot, F&B director brief, beverage context, taste target, decision ledger, venue feedback candidates.
- Cocktail Intelligence / Omer: cocktail creation, scoring, taste DNA, lifecycle and menu intelligence.
- Academy Intelligence: capability context and learning recommendations.
- Food/Chef Intelligence: food menus, recipes, AI food menu planning.
- Shift Organizer intelligence: schedule and staffing assistant behavior.

These are not all equally mature. F&B has the strongest provenance and decision ledger pattern. Shift and event intelligence are strong deterministic specialists, but their persistent outputs are more distributed.

### Parts That Already Write Persistent Business Knowledge

The following systems already write persistent business knowledge:

- Venue Intelligence writes `venue_intelligence` and `venue_briefs`.
- Operational intelligence writes or updates `venue_dna_enrichment`.
- Shift reports write `shift_reports` and sometimes `business_memory`.
- Incidents write `incidents` and sometimes `business_memory`.
- Operations writes `actions`, `event_plans`, service incidents, owner notes, employee records, and local fallback state.
- Event CRM writes events, guests, tables, tasks, timelines, preferences, interactions, messages, creative images, and menu links.
- F&B writes cocktails, menus, lifecycle, scores, sales records, decision ledger entries, candidates, rejections, narratives, and taste/product DNA.
- Academy writes staff progress, sessions, learning logs, and lesson state.
- Creative/event planning can persist creative images and local event architect plans.

## 2. Source of Truth Risk

### Venue Profile

Potential sources:

- `venues` table.
- `venue_intelligence.venue_dna_json`.
- `cocktail_intelligence_dna` and `cocktail_taste_dna`.
- Older local venue storage in `src/services/venueService.js` / `hospia.venues`.
- Event-specific venue fields and local event architect plans.

Risk:

Venue identity, venue type, business type, bar identity, and guest promise can be represented in several places. A Cognitive Core must treat `venues` as profile metadata, `venue_intelligence.venue_dna_json` as canonical interpreted DNA, and bar/product/event DNA as specialist-scoped derived intelligence.

### Venue DNA

Potential sources:

- `venue_intelligence.venue_dna_json`.
- `venue_briefs`.
- `venue_dna_enrichment`.
- `venue_intelligence_candidates`.
- `eventHospitalityDNA`.
- `cocktail_intelligence_dna`.
- `cocktail_taste_dna`.

Risk:

The word "DNA" is used across multiple domains. This is acceptable internally only if contracts clearly define canonical Venue DNA versus domain DNA. Without that contract, a future core could merge event-specific or product-specific interpretation into venue identity too aggressively.

### Business Memory

Potential sources:

- `business_memory`.
- `shift_reports`.
- `incidents`.
- `actions`.
- `event_plans`.
- `notes`.
- `fb_decisions`.
- `venue_intelligence.messages_json`.
- local storage fallbacks.

Risk:

The same operational event can exist as an incident, a shift report item, an action, and a business memory entry. Some records are raw facts, some are summaries, and some are interpretations. The current `business_memory` table does not contain enough provenance to safely arbitrate between them.

### Event Intelligence

Potential sources:

- Event CRM tables.
- `zoharBriefOrchestrator`.
- `eventHospitalityDNA`.
- `zoharDesignBriefEngine`.
- `event_plans`.
- `event_cocktail_menus`.
- `event_creative_images`.
- `hestia.eventArchitect.plan:*`.
- `hestia.programme_brief.*`.

Risk:

Event intelligence spans both official event operations and creative exploration. The future core must not treat exploratory creative plans as confirmed event requirements.

### Shift Reports

Potential sources:

- `shift_reports`.
- `business_memory`.
- `carry_forward_tasks`.
- `actions`.
- `shifts`.
- `hospia.endOfDayArchive`.
- `hospia.operationalNotes`.
- pending sync queues.

Risk:

Shift summary, action follow-up, incident memory, and carry-forward records can overlap. A central core should read raw shift reports as facts and business memory entries as indexed summaries, not as independent proof of separate events.

### Menu and F&B Intelligence

Potential sources:

- `cocktails`.
- `cocktail_menus`.
- `cocktail_sales`.
- `cocktail_lifecycle`.
- `cocktail_scores`.
- `cocktail_intelligence_dna`.
- `cocktail_taste_dna`.
- `food_menus`.
- `food_sales`.
- `event_cocktail_menus`.
- `fb_decisions`.
- `venue_intelligence_candidates`.
- `hospia.verified_prices.*`.
- Cocktail Lab local state.

Risk:

F&B has a strong specialist foundation, but price overrides, benchmark estimates, event menus, product DNA, and Venue DNA must remain distinct. The cost honesty rules are especially important: benchmark or assumption costs must never become verified fact.

### Academy and User Learning

Potential sources:

- `staff_progress`.
- `learning_event_logs`.
- `training_sessions`.
- local `hospia.academyProgress`.
- `academyContextService` derived capability signals.

Risk:

Academy progress can be misread as skill mastery. The Cognitive Core should distinguish lesson exposure, practice completion, manager validation, and operational performance evidence.

### Creative and Event Briefs

Potential sources:

- `zoharDesignBriefEngine` output.
- event creative images.
- Event Architect local plans.
- programme brief local storage.
- event notes, timelines, and tasks.
- future cultural research.

Risk:

Creative ideas are not facts. They should be stored as proposals, briefs, or opportunities with evidence and rationale, not promoted to Venue Memory as confirmed business knowledge.

## 3. Cognitive Core Readiness

### What the Codebase Can Support Now

HESTIA can safely support a read-only Cognitive Core prototype if it is limited to:

- Reading Venue DNA, venue briefs, operational signals, menu intelligence, event intelligence, Academy context, and owner intelligence.
- Calling existing specialist services.
- Returning a unified answer with evidence, missing data, confidence, and source labels.
- Producing no database writes.
- Creating no official actions, plans, menus, or DNA changes.

The strongest current dependency for this is `assembleUnifiedContext` in `src/services/venueBridge/intelligenceContextService.js`, plus the deterministic specialist services around it.

### What the Codebase Cannot Safely Support Yet

HESTIA should not yet support a write-capable Cognitive Core that:

- Mutates Venue DNA.
- Promotes candidate signals into DNA.
- Writes to `business_memory` as fact.
- Creates actions, menus, events, campaigns, or Academy assignments automatically.
- Treats creative concepts as persistent plans.
- Uses localStorage fallbacks as canonical fact.

### What Must Exist First

Before building a central Cognitive Core with any durable output, HESTIA needs:

- A documented Cognitive Core contract.
- A specialist response contract.
- A shared evidence envelope for all recommendations.
- A distinction between facts, interpretations, recommendations, and creative ideas.
- A generic decision ledger pattern beyond F&B.
- A draft opportunity model.
- A human approval workflow.
- Venue DNA snapshots and promotion audit records.
- Explicit read/write permissions for each specialist.
- Tests or static checks proving that no core or specialist can write Venue DNA directly.
- A policy for localStorage fallback reconciliation.

## 4. Specialist Intelligence Boundaries

### Shift Intelligence

Current owner:

- Shift risk synthesis, critical items, carry-forward pressure, service patterns, event pressure, and recommended manager focus.

Reads:

- Action items, service incidents, event plans, owner notes, and shift notes.

Writes:

- The service itself is deterministic and read-only. Surrounding hooks and operations can write shift reports, business memory, actions, and local notes.

Should not own:

- Venue DNA.
- Owner strategy.
- Menu decisions.
- Official event commitments.
- Staff capability truth beyond shift evidence.

Risk if independent agent:

- It may over-index on recent operational noise and convert temporary pressure into permanent venue identity.

### Event Intelligence

Current owner:

- Event-scoped guest, timeline, table, task, department, hospitality, and service briefing.

Reads:

- Event records, guests, tables, tasks, timeline, guest preferences, interactions, and event metadata.

Writes:

- Event CRM workflows write event operational data. Zohar brief generation is primarily derived/read-only.

Should not own:

- Venue DNA.
- General venue positioning.
- Permanent guest strategy beyond event evidence.
- Confirmed creative plans unless approved.

Risk if independent agent:

- Event-specific mood or guest mix could be mistaken for venue-wide identity.

### F&B/Menu Intelligence

Current owner:

- Menu portfolio interpretation, cocktail/product lifecycle, taste and beverage direction, cost honesty, F&B decisions, and candidate feedback to Venue Intelligence.

Reads:

- Cocktails, menus, lifecycle, sales, bar DNA, taste DNA, Venue DNA, venue briefs, F&B decisions, candidates, and verified price data.

Writes:

- `fb_decisions`, venue intelligence candidates, cocktails, menus, lifecycle, scores, sales, and related F&B records through existing feature workflows.

Should not own:

- Canonical Venue DNA.
- Owner intent.
- Whole-business strategy.
- Verified cost data without invoice or user-entered evidence.

Risk if independent agent:

- It may treat product preference as venue identity or convert benchmark estimates into pricing truth.

### Creative Intelligence

Current owner:

- Creative concepts, visual mood, guest-facing language, event design briefs, campaign and activation ideas.

Reads:

- Event metadata, creative inputs, Venue DNA, event hospitality signals, F&B context, and eventually external cultural signals.

Writes:

- Current creative image/brief workflows can persist creative artifacts, but strategic concepts should remain drafts until approved.

Should not own:

- Raw facts.
- Venue DNA.
- Event commitments.
- Menu changes.
- Staff execution plans.

Risk if independent agent:

- Creative speculation can be mistaken for business fact or official plan.

### Academy Intelligence

Current owner:

- Learning recommendations, training gaps, capability context, and training surfaces.

Reads:

- Academy progress, venue briefs, service/training signals, and F&B or cocktail capability context.

Writes:

- Staff progress, training sessions, learning logs, and selected lesson state.

Should not own:

- Staff performance truth without manager validation.
- Venue DNA.
- Operational staffing decisions.
- Menu or event strategy.

Risk if independent agent:

- It may confuse lesson exposure with demonstrated skill and over-prescribe training.

### Owner Intelligence

Current owner:

- Owner-facing synthesis of what HESTIA has learned, open questions, priorities, confidence, and strategic clarity.

Reads:

- Venue DNA, briefs, operational signals, Academy context, and derived enrichment.

Writes:

- The owner intelligence service is read-only today, but owner-facing conversation can write Venue DNA through controlled Venue Intelligence flow.

Should not own:

- Raw operational facts.
- Specialist decisions.
- Automatic plan creation.
- Candidate-to-DNA promotion.

Risk if independent agent:

- It may become a second Venue Intelligence source of truth unless it remains a synthesis layer.

### Venue Intelligence

Current owner:

- Owner discovery, canonical working Venue DNA, stage/objective, confidence, summary, and open questions.

Reads:

- Owner conversation messages, venue metadata, and sometimes operationally derived context through bridge regeneration.

Writes:

- `venue_intelligence.venue_dna_json`, `messages_json`, and derived `venue_briefs`.

Should not own:

- Specialist facts outside its evidence.
- Raw event or shift records.
- Menu pricing truth.
- Academy mastery.
- Creative concepts as confirmed identity.

Risk if independent agent:

- It may become too central and absorb specialist interpretations without enough provenance.

## 5. Strategic Engine / Opportunity Layer

A future opportunity engine should create opportunities, not mutate core data.

Safe opportunity sources:

- Venue DNA and Venue DNA completeness gaps.
- Venue briefs and owner intelligence.
- Business memory, shift reports, incidents, actions, and carry-forward tasks.
- Event CRM history, event plans, guest preferences, and event outcomes.
- Menu intelligence, lifecycle, sales, scores, F&B decisions, and candidates.
- Academy progress and training gaps, with exposure versus mastery separated.
- Creative briefs and approved concepts.
- Future external cultural calendar and trend signals.

Data still needed for high-quality recommendations:

- Reliable sales/POS history.
- Event outcome metrics.
- Menu change history.
- Campaign performance.
- Staff skill validation.
- Approved brand/visual language.
- Explicit owner strategic priorities.
- Venue DNA history and confirmation status.

Minimum safe opportunity object:

- `id`
- `venue_id`
- `category`
- `title`
- `why_now`
- `evidence`
- `interpretation`
- `recommendation`
- `confidence_level`
- `rationale`
- `missing_data`
- `expected_business_impact`
- `creative_direction`
- `operational_requirements`
- `risks`
- `source_specialists`
- `status`
- `human_approval`
- `created_at`
- `expires_at`

The opportunity engine should be allowed to create draft opportunity records only after approval infrastructure exists. Before that, it should operate read-only and return ephemeral recommendations.

## 6. Creative and Cultural Intelligence

Creative and Cultural Intelligence should be a specialist intelligence, not a source of truth.

It may reason about:

- Menu change timing.
- New menu launch timing.
- Seasonal hospitality moments.
- Restaurant, bar, and hotel trends.
- Global hospitality events.
- Conferences and awards.
- World-class F&B and design references.
- Concept event creation based on Venue DNA and founder/owner DNA.

It should read:

- Canonical Venue DNA.
- Owner priorities and emotional drivers.
- Event history and approved creative briefs.
- F&B/menu intelligence.
- Academy/team capability.
- External cultural signals with citations, dates, source names, and retrieval dates.

It should write:

- Creative concepts.
- Opportunity drafts.
- External signal records.
- Evidence-backed cultural calendar entries.

It should not write:

- Venue DNA.
- Business Memory facts.
- Official event plans.
- Official menus.
- Staff assignments.

Risks:

- Trend data may be stale or weakly sourced.
- External cultural references may not fit the venue's actual DNA.
- Creative ideas may sound confident while depending on incomplete operational capacity data.
- Founder DNA and Venue DNA may be conflated unless separately modeled.

## 7. Guardrails

Future architecture should enforce these rules:

- No specialist writes directly to Venue DNA without explicit approved promotion flow.
- No AI-generated fact enters Venue Memory as fact without evidence.
- Facts, interpretations, recommendations, and creative ideas must be separate record types.
- Every recommendation must show evidence.
- Every missing-data case must be explicit.
- Every generated opportunity must include confidence level and rationale.
- Human approval is required before promotion into persistent DNA, official plans, menus, campaigns, actions, or business memory facts.
- Candidate acceptance means "useful signal," not truth.
- Creative concepts are proposals until approved.
- External trend research must include source, date, and applicability rationale.
- LocalStorage data cannot be treated as canonical without reconciliation.
- Academy progress must not be treated as skill mastery without validation.
- Event-specific DNA must not be merged into Venue DNA automatically.
- Bar/product DNA must not be merged into Venue DNA automatically.
- Benchmark or assumed costs must never be displayed as verified.
- Cognitive Core output must identify source specialists.
- Cognitive Core must default to "not enough data" rather than filling gaps.

## 8. UI / Product Experience Audit Note

The future UI should not appear as a generic chatbot or a dense analytics dashboard. HESTIA's intelligence should surface as a calm strategic briefing experience with evidence-backed opportunity cards.

The safest eventual first surface is an Owner Home or Command Center module called "Strategic Opportunities." It should show a small number of high-signal cards, each with evidence, confidence, missing data, and explicit approval actions. It should not scatter autonomous recommendations into Event Manager, F&B Intelligence, Academy, and Venue Memory before the approval workflow exists.

## 9. Audit Conclusion

HESTIA is ready for documentation, contracts, and a read-only Cognitive Core prototype. It is not ready for an autonomous write-capable Super Agent.

The safest next move is to define the contracts first:

- What the Cognitive Core may read.
- What it may call.
- What it may return.
- What it may never write.
- What evidence every recommendation must carry.
- How human approval promotes an opportunity into action, plan, memory, or DNA.

The biggest architecture failure mode would be building the Cognitive Core as another agent/persona with its own memory, its own facts, and direct write access. That would duplicate the very intelligence architecture HESTIA has carefully been separating into Venue Memory, Venue Intelligence, Venue DNA, specialist services, candidates, and decision ledgers.

