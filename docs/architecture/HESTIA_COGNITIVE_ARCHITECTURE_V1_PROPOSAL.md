# HESTIA Cognitive Architecture V1 Proposal

Status: Proposal only  
Date: 2026-06-22  
Purpose: Safe future architecture for HESTIA Cognitive Core, specialist intelligences, strategic opportunities, and human-approved persistence

> **Note:** This document is a proposal / architecture exploration, not the approved implementation roadmap. The CTO roadmap and current repo state remain the sequencing authority.

## Executive Recommendation

HESTIA should build Cognitive Core as a read-only orchestration layer first.

It should read from Venue Memory, Venue Intelligence, Venue DNA, and specialist intelligence modules. It should synthesize a unified answer with evidence and confidence. It should not own raw facts. It should not write Venue DNA. It should not create actions, plans, menus, campaigns, or memory facts until a human approval workflow exists.

The correct architecture is:

```text
Venue Memory
-> Venue Intelligence
-> Venue DNA
-> HESTIA Cognitive Core
-> Specialist Intelligences
-> Strategic Opportunity Engine
-> Human Approval
-> Persistent Plans / Actions
```

## 1. Recommended Architecture

### Venue Memory

Role:

- The raw institutional record of a venue.
- Includes events, incidents, shift reports, business memory, decisions, owner conversation, guest preferences, menu history, Academy progress, and approved plans.

Future contract:

- Append-only where possible.
- Every record should carry provenance, role, evidence, confidence, status, and approval state.
- Raw records should not be rewritten by specialists.

Current reality:

- Memory is distributed across multiple tables and local fallback stores.
- `business_memory` is useful but not rich enough to become the only memory substrate.

Recommendation:

- Do not replace existing stores immediately.
- Introduce a documented `MemoryEntry` contract first.
- Add a future memory index or view only after source contracts are stable.

### Venue Intelligence

Role:

- Interprets Venue Memory and owner conversation.
- Produces structured understanding and specialist-ready context.

Current source:

- `venue_intelligence`
- `venue_briefs`
- `venue_dna_enrichment`
- `venue_intelligence_candidates`
- `src/services/venueBridge/*`

Recommendation:

- Keep Venue Intelligence as the interpreter.
- Keep `venue_briefs` derived and regenerable.
- Keep candidates isolated from DNA.
- Avoid adding new direct writers until Venue DNA snapshotting and promotion audit exist.

### Venue DNA

Role:

- Confidence-calibrated interpretation of venue identity, owner intent, guest promise, service philosophy, pressure points, and strategic direction.

Canonical store:

- `venue_intelligence.venue_dna_json`

Recommendation:

- Treat it as read-only to Cognitive Core and specialists.
- Current canonical writer remains the owner Venue Intelligence flow.
- Future promotion into Venue DNA must require evidence, snapshot, rollback path, approval, and audit trail.

### HESTIA Cognitive Core

Role:

- Read shared context.
- Call specialists.
- Compare specialist outputs.
- Synthesize one unified answer.
- Explain what is known, inferred, recommended, creative, or missing.

Non-role:

- It is not a new memory store.
- It is not a chatbot persona with private facts.
- It is not the owner of Venue DNA.
- It is not an automatic action engine.

Initial behavior:

- Read-only.
- No database writes.
- No route mutations.
- No plan creation.
- No memory creation.
- No Venue DNA mutation.

### Specialist Intelligences

Role:

- Bounded experts that read shared context and return domain-specific analysis.

Specialists:

- Shift Intelligence.
- Event Intelligence.
- F&B/Menu Intelligence.
- Creative and Cultural Intelligence.
- Academy Intelligence.
- Owner Intelligence.
- Venue Intelligence.

Required specialist response shape:

```js
{
  specialist: "fnb_menu",
  scope: "venue",
  facts: [],
  interpretations: [],
  recommendations: [],
  creativeIdeas: [],
  missingData: [],
  evidence: [],
  confidenceLevel: "low | medium | high",
  rationale: "",
  writesRequested: []
}
```

The `writesRequested` field should be empty in early phases. Later it can describe proposed writes for approval, not execute them.

### Strategic Opportunity Engine

Role:

- Converts specialist signals into opportunity drafts.
- Produces menu refresh recommendations, event ideas, creative campaigns, seasonal opportunities, owner briefings, and operational warnings.

Non-role:

- It must not mutate core data.
- It must not create official actions automatically.
- It must not silently promote ideas into memory or DNA.

Minimum opportunity model:

```js
{
  id: "opportunity_id",
  venue_id: "venue_id",
  category: "menu_refresh | event_concept | creative_campaign | seasonal | owner_briefing | operational_warning",
  title: "",
  why_now: "",
  evidence: [],
  expected_business_impact: {
    type: "qualitative | quantified",
    value: "",
    assumptions: []
  },
  creative_direction: "",
  operational_requirements: [],
  risks: [],
  missing_data: [],
  confidence_level: "low | medium | high",
  rationale: "",
  source_specialists: [],
  status: "draft | approved | rejected | saved_for_later | promoted",
  approval: {
    required: true,
    approved_by: null,
    approved_at: null
  }
}
```

### Human Approval

Role:

- Converts recommendations into official plans, actions, memory candidates, or DNA promotion requests.

Required approval distinctions:

- Approve as action.
- Approve as event plan.
- Approve as menu project.
- Approve as creative brief.
- Approve as memory candidate.
- Approve for DNA review.
- Reject.
- Save for later.

Approval must preserve:

- Original recommendation.
- Evidence.
- Missing data.
- Approver.
- Timestamp.
- Target record created.
- Rollback state where applicable.

### Persistent Plans / Actions

Only approved outputs should become durable operational records:

- Actions.
- Event plans.
- Menu projects.
- Creative briefs.
- Academy tasks.
- Business memory entries.
- Venue DNA promotion candidates.

## 2. Suggested Folder and Module Structure

Do not move existing modules immediately. Add adapters only when implementation begins.

Suggested future structure:

```text
src/services/cognitiveCore/
  cognitiveCoreContextService.js
  cognitiveCoreOrchestrator.js
  cognitiveCoreContracts.js
  evidenceEnvelope.js
  specialistRegistry.js
  responseClassifier.js

src/services/specialistAdapters/
  shiftSpecialistAdapter.js
  eventSpecialistAdapter.js
  fnbMenuSpecialistAdapter.js
  creativeCulturalSpecialistAdapter.js
  academySpecialistAdapter.js
  ownerSpecialistAdapter.js
  venueIntelligenceSpecialistAdapter.js

src/services/opportunities/
  opportunityContracts.js
  opportunityGeneratorService.js
  opportunityEvidenceService.js
  opportunityApprovalService.js
  opportunityPromotionService.js

docs/architecture/contracts/
  COGNITIVE_CORE_CONTRACT.md
  SPECIALIST_INTELLIGENCE_RESPONSE_CONTRACT.md
  OPPORTUNITY_MODEL_CONTRACT.md
  HUMAN_APPROVAL_CONTRACT.md
  MEMORY_ENTRY_CONTRACT.md
```

Recommended service responsibilities:

- `cognitiveCoreContextService.js`: read-only assembly of approved context sources.
- `cognitiveCoreOrchestrator.js`: calls specialists and synthesizes response.
- `specialistRegistry.js`: lists available specialists and permissions.
- `evidenceEnvelope.js`: normalizes evidence, confidence, assumptions, and missing data.
- `opportunityGeneratorService.js`: converts synthesized signals into draft opportunities.
- `opportunityApprovalService.js`: later handles approval state only.
- `opportunityPromotionService.js`: later creates approved target records.

## 3. Suggested Data Models or Tables

These are future proposals, not current implementation requirements.

### `memory_entries`

Purpose:

- A normalized index of memory-like facts, decisions, and observations.

Do not create until:

- Existing memory sources are mapped.
- Migration and reconciliation rules are documented.

### `decision_ledger`

Purpose:

- Generalize the strong `fb_decisions` pattern across all specialists.

Recommended fields:

- `id`
- `venue_id`
- `source_specialist`
- `decision_type`
- `subject_ref`
- `decision_summary`
- `facts_json`
- `interpretations_json`
- `recommendations_json`
- `evidence_json`
- `assumptions_json`
- `missing_fields_json`
- `confidence`
- `human_review_status`
- `created_at`

### `strategic_opportunities`

Purpose:

- Store draft and approved opportunities.

Write permission:

- Opportunity Engine may create drafts only after Phase 3.
- Human Approval may change status.
- Promotion service may create target records after approval.

### `opportunity_evidence`

Purpose:

- Store structured evidence references for opportunity cards.

### `approval_queue`

Purpose:

- One queue for approvals across opportunities, DNA promotion requests, plans, and memory candidates.

### `venue_dna_snapshots`

Purpose:

- Snapshot Venue DNA before any future approved mutation.

### `venue_dna_promotion_audit`

Purpose:

- Record every proposed, approved, rejected, or rolled-back DNA promotion.

### `external_cultural_signals`

Purpose:

- Store sourced cultural research with retrieval date and applicability notes.

## 4. Read and Write Permissions

### Cognitive Core

May read:

- Venue DNA.
- Venue briefs.
- Operational signals.
- Shift intelligence.
- Event intelligence.
- F&B/menu intelligence.
- Academy context.
- Owner intelligence.
- Approved creative/event briefs.

May call:

- Specialist adapters.

May write:

- Nothing in Phase 2.
- Draft opportunities only in Phase 3 or later.

Must not write:

- Venue DNA.
- Business Memory facts.
- Actions.
- Event plans.
- Menus.
- Academy assignments.
- Raw operational records.

### Specialist Intelligences

May read:

- Shared context relevant to domain.

May write:

- Their existing domain records.
- Future decision ledger entries.
- Future candidate signals.

Must not write:

- Venue DNA directly.
- Other specialists' raw records.
- Official plans outside approval flow.

### Opportunity Engine

May read:

- Cognitive Core synthesis and specialist outputs.

May write:

- Draft opportunities only, once persistence exists.

Must not write:

- Persistent plans or actions.
- Venue DNA.
- Business Memory facts.

### Human Approval

May write:

- Approval state.
- Approved target records through explicit promotion service.

Must preserve:

- Evidence, rationale, missing data, approver, timestamp, and target.

### Venue Intelligence

May write:

- Canonical Venue DNA through controlled owner conversation.
- Derived venue briefs.

Future writes:

- Approved DNA promotion only after snapshots, audit, and rollback exist.

## 5. What Should Remain Read-Only

Until the required contracts and approval flow exist, the following must remain read-only to Cognitive Core:

- `venue_intelligence.venue_dna_json`
- `venue_briefs`
- `venue_dna_enrichment`
- `venue_intelligence_candidates`
- `business_memory`
- `shift_reports`
- `incidents`
- `actions`
- Event CRM records
- Menu and cocktail records
- Academy progress records
- Creative/event brief artifacts
- LocalStorage fallback data
- External cultural research

## 6. What Should Be Deferred

Defer:

- Write-capable Cognitive Core.
- Candidate-to-Venue-DNA promotion.
- Automatic action creation.
- Automatic menu changes.
- Automatic event plan creation.
- Automatic Academy assignments.
- Automatic business memory fact creation.
- External research ingestion as fact.
- Full strategic dashboard.
- Schema migrations before contracts.
- UI implementation before the opportunity model and approval states are agreed.

## 7. Migration Plan

### Phase 0: Audit Only

Objective:

- Document readiness, risks, and future architecture.

Files likely touched:

- `docs/architecture/HESTIA_COGNITIVE_CORE_AUDIT.md`
- `docs/architecture/HESTIA_COGNITIVE_ARCHITECTURE_V1_PROPOSAL.md`

Risks:

- Audit becomes stale as architecture moves.

Tests needed:

- None. Documentation review only.

Rollback strategy:

- Revert or delete the two documentation files.

### Phase 1: Documentation and Contracts

Objective:

- Define Cognitive Core, specialist response, opportunity, memory, and approval contracts.

Files likely touched:

- `docs/architecture/contracts/COGNITIVE_CORE_CONTRACT.md`
- `docs/architecture/contracts/SPECIALIST_INTELLIGENCE_RESPONSE_CONTRACT.md`
- `docs/architecture/contracts/OPPORTUNITY_MODEL_CONTRACT.md`
- `docs/architecture/contracts/HUMAN_APPROVAL_CONTRACT.md`
- `docs/architecture/contracts/MEMORY_ENTRY_CONTRACT.md`

Risks:

- Over-designing abstractions before seeing implementation pressure.
- Contract names diverging from existing service behavior.

Tests needed:

- None required, but include acceptance checklists in the docs.

Rollback strategy:

- Revert documentation only.

### Phase 2: Read-Only Cognitive Core Prototype

Objective:

- Build a read-only service that assembles context, calls specialists, and returns one evidence-labeled synthesis.

Files likely touched:

- `src/services/cognitiveCore/cognitiveCoreContextService.js`
- `src/services/cognitiveCore/cognitiveCoreOrchestrator.js`
- `src/services/cognitiveCore/cognitiveCoreContracts.js`
- `src/services/cognitiveCore/specialistRegistry.js`
- Unit tests for read-only behavior.

Risks:

- Accidentally creating a new source of truth.
- Calling specialists inconsistently.
- Returning confident synthesis from incomplete inputs.

Tests needed:

- No writes occur.
- Missing data is explicit.
- Evidence is required.
- Specialists are called through adapters.
- Venue boundaries are respected.

Rollback strategy:

- Remove the new read-only service and tests.
- No data rollback should be required if Phase 2 is truly read-only.

### Phase 3: Read-Only Opportunity Generator

Objective:

- Generate ephemeral opportunity objects from Cognitive Core synthesis without persistence.

Files likely touched:

- `src/services/opportunities/opportunityContracts.js`
- `src/services/opportunities/opportunityGeneratorService.js`
- Tests for opportunity evidence, confidence, and no-write behavior.

Risks:

- Generic AI idea dumps.
- Opportunity cards without operational feasibility.
- Creative ideas mixed with facts.

Tests needed:

- Every opportunity has evidence.
- Every opportunity has confidence.
- Every opportunity has missing-data handling.
- No database writes.
- No official action creation.

Rollback strategy:

- Remove opportunity generator service and tests.

### Phase 4: Human Approval Workflow

Objective:

- Add approval states before anything becomes official.

Files likely touched:

- Future approval service.
- Future approval model/table.
- Future UI only after product design approval.

Risks:

- Approval becomes a cosmetic button rather than a real gate.
- Rejected recommendations remain active.
- Approved creative ideas become facts.

Tests needed:

- Approval required before promotion.
- Reject/snooze/save states work.
- Approver and timestamp are recorded.
- Permission checks by role.

Rollback strategy:

- Feature flag approval UI and services.
- Revert approval migrations if no production data exists.
- If production data exists, migrate statuses to archived/draft.

### Phase 5: Controlled Persistence

Objective:

- Persist approved opportunities, decision ledger entries, promotion requests, and official target records.

Files likely touched:

- Database migrations.
- Opportunity persistence service.
- Approval promotion service.
- Decision ledger generalization.
- Venue DNA snapshot/audit services.

Risks:

- Promotion service becomes a back door to Venue DNA.
- Duplicate memory records.
- No rollback for DNA changes.
- Source evidence lost during promotion.

Tests needed:

- Migration tests.
- Snapshot and rollback tests.
- No direct Venue DNA writes outside approved service.
- Evidence copied to target record.
- Duplicate detection.
- Venue isolation.

Rollback strategy:

- Use feature flags.
- Preserve snapshots.
- Soft-delete or archive draft opportunities.
- Roll back DNA through snapshot service if needed.

### Phase 6: UI Surfacing

Objective:

- Surface opportunities and Cognitive Core synthesis in HESTIA without dashboard bloat.

Files likely touched:

- Owner Home / Command Center feature files.
- Future Strategic Opportunities feature.
- Evidence Drawer component.
- Approval Queue component.

Risks:

- UI looks like a SaaS analytics dashboard.
- Users see too many ideas without action hierarchy.
- Confidence and evidence are hidden.
- Approval state is unclear.

Tests needed:

- Role-based visibility.
- Card states.
- Evidence drawer rendering.
- Approval flow.
- Mobile-first layout.
- No frontend writes before approval.

Rollback strategy:

- Hide behind feature flag.
- Keep opportunities service independent.
- Remove UI routes without deleting underlying records.

## 8. Future UI / Product Experience Recommendation

### Where This Should Live

MVP placement:

- Owner Home or Command Center as a compact "Strategic Opportunities" section.

Why:

- The owner is the approval authority.
- The experience belongs near strategic briefing, not inside operational workflows first.
- It avoids scattering recommendations across F&B, Events, Academy, and Venue Memory before the approval model is mature.

Later placements:

- Venue Memory: evidence and memory history.
- Event Manager: event-specific opportunities.
- F&B Intelligence: menu refresh and product opportunities.
- Academy: training opportunities from approved operational gaps.
- Dedicated Strategic Opportunities area: only after opportunity volume justifies an inbox.

### What the User Should See

The final experience should feel like a strategic briefing room and creative director desk.

Core surfaces:

- Morning briefing cards.
- Proactive opportunity cards.
- Creative concept previews.
- Menu refresh alerts.
- Event concept suggestions.
- Operational warning cards.
- Rationale and evidence panel.
- Confidence level.
- Missing data callouts.
- Required human approval state.
- Suggested next actions.

The screen should prioritize a few high-signal recommendations, not a feed of AI ideas.

### What an Opportunity Card Should Contain

Each opportunity card should include:

- Title.
- Category.
- Why now.
- Evidence.
- Expected business impact.
- Creative direction.
- Operational requirements.
- Risks.
- Confidence level.
- Missing data.
- Suggested actions.
- Approve.
- Reject.
- Save for later.

Recommended visual hierarchy:

- Title and category first.
- "Why now" as the main narrative.
- Confidence and approval state visible without opening detail.
- Evidence summary collapsed into an Evidence Drawer.
- Suggested action as one clear next step.

### What the Creative Intelligence UI Should Show

Creative concept experience:

- Event concept.
- Visual mood.
- Menu direction.
- Guest-facing copy.
- Staff briefing.
- Instagram/social asset direction.
- Owner rationale.
- Exportable creative brief.

The UI should separate:

- Confirmed venue facts.
- Creative assumptions.
- External references.
- Proposed guest experience.
- Operational requirements.

Creative Intelligence should feel editorial and tactile, not like a prompt output.

### What Should Not Be Shown

Do not show:

- Fake certainty.
- Generic AI idea dumps.
- Overwhelming dashboards.
- Automatic changes without approval.
- Raw facts mixed with creative assumptions.
- External trends without source and date.
- Revenue claims without real data.
- Staff capability claims without validation.
- "HESTIA knows" language when the system is inferring.

### Design Direction

Design feel:

- Premium hospitality.
- Editorial.
- Calm intelligence.
- Confident but not loud.
- Strategic briefing room.
- Creative director desk.
- Mobile-first.
- Evidence-rich but not cluttered.

Avoid:

- Generic SaaS dashboard density.
- KPI walls.
- Chatbot-first layout.
- Endless recommendation feeds.
- Neon AI styling.

### Suggested Future Screens and Components

Future screens:

- Strategic Opportunities Inbox.
- Opportunity Detail Page.
- Creative Concept Preview.
- Venue Evolution Timeline.
- Menu Refresh Radar.
- Cultural Calendar.
- Approval Queue.
- Evidence Drawer.
- Owner Morning Briefing.

Future components:

- Opportunity Card.
- Confidence Badge.
- Evidence Drawer.
- Missing Data Strip.
- Approval Action Bar.
- Creative Brief Export Panel.
- Rationale Panel.
- Source Specialist Chips.
- Venue DNA Impact Preview.

### Final UI Recommendation

The first UI surface should be an Owner Home / Command Center "Strategic Opportunities" module with three evidence-backed cards and an Evidence Drawer.

This is the safest MVP because:

- It keeps strategic intelligence close to the owner.
- It gives HESTIA a proactive product feel without granting write authority.
- It makes evidence and confidence visible from day one.
- It avoids dashboard bloat.
- It can later expand into a full Strategic Opportunities Inbox after approval and persistence are proven.

## 9. Final Recommendation

HESTIA should not build a write-capable Super Agent now.

HESTIA should build, in order:

1. Documentation and contracts.
2. A read-only Cognitive Core prototype.
3. A read-only Opportunity Generator.
4. A human approval workflow.
5. Controlled persistence.
6. UI surfacing.

What must be documented first:

- Cognitive Core read/write contract.
- Specialist response contract.
- Memory entry contract.
- Opportunity model.
- Human approval and promotion contract.
- Venue DNA promotion guardrails.

Safest first implementation step:

- Create a read-only Cognitive Core service that assembles context through existing venue bridge services and returns a source-labeled synthesis with no writes.

What could break the architecture if done too early:

- Direct Cognitive Core writes to Venue DNA.
- Automatic business memory creation from AI output.
- Automatic actions, menus, campaigns, or event plans.
- Treating creative concepts as facts.
- Treating localStorage fallback data as canonical.
- Merging event-specific DNA or bar/product DNA into Venue DNA.
- Building Cognitive Core as another agent with its own memory.

Final position:

HESTIA Cognitive Core should be considered a cognitive architecture layer, not another agent. It should coordinate the existing specialist intelligences and protect the source-of-truth boundaries that make HESTIA trustworthy.

