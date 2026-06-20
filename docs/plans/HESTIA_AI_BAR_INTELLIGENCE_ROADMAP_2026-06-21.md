# HESTIA Updated Product Roadmap — AI Bar Intelligence Platform

**Date:** 2026-06-21  
**Product:** HESTIA  
**Primary category:** AI Bar Intelligence for hospitality businesses  
**Long-term vision:** Venue Intelligence OS  
**Roadmap status:** Updated after product closure session

---

## 1. Core Product Definition

### Official product definition

**HESTIA is an AI Bar Intelligence platform for hospitality businesses.**

HESTIA learns the venue's DNA, creates tailored cocktail programmes, pricing, preparation logic and staff training briefs, and improves over time through real sales data such as Tabit reports.

### Product hierarchy

- **HESTIA** — the platform/company.
- **AI Bar Intelligence** — the primary product category and current market entry point.
- **Cocktail Intelligence** — the core engine inside AI Bar Intelligence.
- **Venue Intelligence OS** — the long-term strategic vision.
- **HESTIA AI** — the owner-facing intelligence/chat layer.
- **Venue DNA Brief** — the living business DNA brief generated from owner characterization and evidence.
- **F&B Director reasoning** — internal strategic reasoning layer inside AI Bar Intelligence, not a separate user-facing module.

---

## 2. Core Product Principle

HESTIA is not a generic dashboard, chatbot, POS, or LMS.

HESTIA is a role-based hospitality intelligence system that connects:

```text
Venue DNA
→ AI Bar Intelligence
→ Active Bar Programme
→ Recipe Book + Prep Library + Training Gantt
→ Manager / Bar Manager / Bartender execution
→ End Of Day + Tabit Upload
→ Owner Intelligence
→ Venue Memory
→ Better future recommendations
```

### Product rules

1. **The chat is the owner's home. Reports are depth layers.**
2. **Owner sees summary first, depth only on demand.**
3. **Save everything. Surface only what matters.**
4. **HESTIA remembers everything, but does not treat everything as current truth.**
5. **No evidence → no confident claim.**
6. **Completion is not capability.**
7. **Root cause is always a hypothesis until validated.**
8. **Venue DNA changes require owner/founder confirmation.**
9. **HESTIA recommends. Humans decide. HESTIA learns from outcomes.**
10. **Old menus are archived/hidden, not deleted.**

---

## 3. First-Run Owner Flow

### Rule

```text
If Baseline Venue DNA characterization is not complete:
    Owner lands on HESTIA AI setup conversation.

If Baseline Venue DNA characterization is complete:
    Owner lands on HESTIA AI full-screen owner experience,
    with access to Owner Reports, Decision Center, and Venue DNA.
```

### First-run screen

**Screen name:** HESTIA AI  
**Subtitle:** Venue DNA & Bar Intelligence

Purpose:

- Characterize the venue.
- Learn the owner/founder intent.
- Build the initial Venue DNA Brief.
- Identify missing business information.
- Prepare AI Bar Intelligence to build a bar programme.
- Unlock the returning-owner experience after baseline DNA readiness.

### Returning owner experience

The owner's home is still **HESTIA AI**, but no longer a setup-only flow.

The chat is full-screen and acts as:

- AI conversation layer.
- Smart navigation layer.
- Business intelligence layer.
- Route into reports, decisions, Venue DNA, bar programmes, staff performance, and service summaries.

Example commands:

- "Show me last service summary."
- "Take me to this month's profit report."
- "Show me staff performance."
- "Build a new bar programme."
- "What should I know before the weekend?"
- "What data are you missing?"

---

## 4. Owner Experience

### Owner navigation

Owner sees only:

```text
HESTIA AI
Owner Reports
Decision Center
Venue DNA
```

Settings/Admin can remain small and secondary.

### HESTIA AI

Full-screen chat-first interface.

Includes small quick navigation access to:

- Owner Reports
- Decision Center
- Venue DNA

The owner should not see the internal complexity of the system.

### Owner Reports

Owner Reports combines reporting layers that should not be separate heavy dashboard pages.

Includes:

1. **Bar Signals**
2. **Staff Performance & Learning**
3. **Last Service Summary**
4. Optional deep links to Tabit-derived analyses

### Decision Center

Minimal approval and decision hub.

Rules:

- Only business-changing decisions reach the owner.
- Show up to 3 important decisions on the main view.
- All others under "View all decisions."
- Every decision has context, evidence, confidence, recommended action, and status.
- Every decision is saved to Venue Memory.

Decision examples:

- Approve Venue DNA Brief.
- Approve first bar programme.
- Approve pricing logic.
- Confirm staff training focus.
- Confirm pivot.
- Archive old menu.
- Review important Tabit/void pattern.

### Venue DNA

A dedicated depth layer.

Includes:

- Current Venue DNA Brief.
- DNA status/readiness.
- Missing information.
- Owner-confirmed fields.
- DNA update candidates.
- Previous DNA versions.
- Pivot history.

DNA updates require owner/founder confirmation.

---

## 5. AI Bar Intelligence

### Role

AI Bar Intelligence is the main product engine.

It receives the Venue DNA Brief and creates a bar programme that can actually be executed.

### F&B Director reasoning

F&B Director is an internal reasoning layer inside AI Bar Intelligence.

It interprets:

- Venue DNA
- Guest profile
- Price position
- Operational constraints
- Staff capability
- Menu balance
- Sales evidence
- Prep complexity
- Training needs

It is not a separate page/module in the current MVP.

### Primary action

Use:

**Build Bar Programme**

Not just:

"Generate Cocktail Menu."

HESTIA builds a full bar programme, not just drink names.

---

## 6. Active Bar Programme

### Definition

**Active Bar Programme** is the central object created by AI Bar Intelligence.

It includes:

1. Guest Cocktail Menu
2. Recipe Book content
3. Prep Recipes / Prep Library links
4. Pricing & Costing
5. Training Outputs
6. Prep Planning Lite

### Status model

```text
Draft
→ Owner Approved
→ Ready for Training
→ Active
→ Archived / Hidden
```

### Archive rule

Menus are never hard-deleted from memory.

```text
Delete in UI = Archive / Hide
Not hard delete
```

Past menus remain in Venue Memory for:

- Historical learning
- Sales comparison
- Menu performance analysis
- Training history
- Prep history
- Future recommendations

Rule:

**HESTIA never forgets past menus. It only hides them from active work views.**

---

## 7. Guest Cocktail Menu

The guest-facing cocktail menu includes:

- Cocktail name
- Guest-facing description
- Flavor profile
- Base spirit if useful
- Price
- Tags such as signature / low-ABV / zero-proof when relevant

It does not include:

- Internal quantities
- Costing
- Prep logic
- Training notes
- Margin logic

---

## 8. Recipe Book

### Audience

Bartenders / employees.

### Rule

**Recipe Book is for bartenders. Prep Library is for the Bar Manager.**

Bartenders do not see the full Prep Library.

### Recipe Book includes:

- Cocktail Recipes
- Linked Prep Recipes
- Quantities
- Method
- Glassware
- Ice
- Garnish
- Service notes
- One-sentence guest explanation
- Assigned recipe/training tasks

### Cocktail recipe example

```text
Mediterranean Collins

Ingredients:
- Gin — 50 ml
- Citrus Cordial — 30 ml
- Soda — top

Method:
Build over ice, stir lightly, garnish.

Guest explanation:
Light, citrus-forward and refreshing.

Linked Prep:
View Citrus Cordial Prep Recipe
```

### Prep Recipes inside Recipe Book

Prep recipes are visible to bartenders only when relevant to cocktail execution or assigned tasks.

They should be part of the same recipe experience, not a separate complex page.

---

## 9. Prep Library

### Audience

Bar Manager.

### Role

Prep Library is the management layer for prep.

It includes:

- Prep Planning Lite
- Prep Recipes
- Active Batches
- Low / Expired prep
- Mark Prepared
- Assign prep task
- View Prep Recipe
- Prep status

### Prep Planning Lite

Displays:

- What to prepare
- How much to prepare
- Which cocktails use it
- Whether something is low
- Whether something expired
- View Recipe
- Mark Prepared

If there is nothing to prepare:

```text
NO PREP FOR TODAY
```

At the bottom:

```text
* PREP GANTT INTELLIGENCE - TBA
```

### Mark Prepared should record:

- Quantity prepared
- Prepared by
- Prepared at
- Shelf life
- Expiry date
- Batch status

### Future capability

**Prep Gantt Intelligence — TBA**

Future intelligent prep forecasting will calculate usage across multiple cocktails sharing the same prep item, shelf life, theoretical depletion from sales, and next-shift demand.

For now, implement **Prep Planning Lite** only.

---

## 10. Training Gantt

### Definition

Training Gantt is the mechanism that turns HESTIA recommendations into role-based training assignments.

### Core rule

```text
HESTIA identifies need.
Bar Manager / Manager assigns.
Employee learns or executes.
HESTIA tracks status and outcome.
```

### Training Gantt users

#### Owner sees:
- Summary
- Staff Performance & Learning
- Business impact
- Whether training is completed / pending

#### Manager / Bar Manager sees:
- Recommended training
- Who should get it
- Why it matters
- Assign to bartender / shift team
- Mark completed / not relevant / needs follow-up

#### Employee sees:
- Assigned lessons
- Assigned practice
- Due date
- Training inside Academy / My Shift

### Example

HESTIA detects:

A high-margin cocktail is selling poorly.

Training Gantt recommends:

"Assign a 7-minute pre-shift training on explaining the new signature cocktail."

Bar Manager assigns it to the next shift team.

---

## 11. Academy

### Status

Academy is a real learning system already being built.

It is not a small helper feature.

### Academy includes:

- Bar Academy
- Service Academy
- Wine Academy / Wine Magazine
- Classic Cocktails Magazine

### Academy Intelligence

Academy Intelligence connects learning to performance.

It uses:

- Menu changes
- Tabit sales
- Employee sales
- Manager notes
- End Of Day reports
- Future reviews
- Training completion
- Manager validation

### Rule

```text
Academy = content and learning system.
Academy Intelligence = connects learning to performance.
Training Gantt = assigns learning according to business need.
```

### Capability rule

**Completion is not capability. Capability requires evidence.**

Lesson completion means the employee was exposed to content.

Capability requires evidence such as:

- Manager validation
- Performance in shift
- Improved sales
- Reduced errors
- Better service notes
- Repeated execution

---

## 12. Role-Based Workspaces

### Core rule

**Role first. Module second.**

The user only sees the workspace that matches their role.

### Owner

Navigation:

```text
HESTIA AI
Owner Reports
Decision Center
Venue DNA
```

Owner can:

- Speak freely with HESTIA AI
- Update Venue DNA
- Confirm pivot
- Approve bar programme
- Approve pricing / strategy
- View owner reports
- View decisions
- Ask HESTIA to navigate to reports or insights

### Manager

Navigation:

```text
Pre-Shift Brief
Open From Last Shift
Voids / Cancellations
End Of Day Report
```

Manager role:

- Runs the service loop.
- Does not manage live service through HESTIA yet.
- Does not speak freely with HESTIA AI.
- Submits End Of Day Report.
- Reviews open items from last shift.
- Reviews voids/cancellations/discounts.
- Feeds HESTIA with operational narrative.

### Bar Manager

Navigation:

```text
Bar Brief
Prep Library
Training Gantt
Recipe Book
Shift Tasks
```

Bar Manager role:

- Executes AI Bar Intelligence outputs.
- Assigns training.
- Assigns prep.
- Marks tasks completed.
- Validates bar execution.
- Does not change Venue DNA or speak freely with HESTIA AI.

### Employee / Bartender

Navigation:

```text
My Shift
Recipe Book
Academy
```

Employee sees:

- Assigned tasks
- Recipe Book
- Academy
- Pre-shift notes inside My Shift
- Assigned training
- Cocktail and prep recipes relevant to work

Employee does not see:

- Owner Intelligence
- Decision Center
- Owner Reports
- Full Venue DNA
- Profitability / costing
- Prep Library management
- Other employee sales comparisons

---

## 13. Manager Workspace

### Rule

HESTIA does not manage live service in real time for now.

Current loop:

```text
End of shift
→ HESTIA learns
→ Next shift brief
```

### Manager Workspace includes:

1. Pre-Shift Brief
2. Open From Last Shift
3. Voids / Cancellations / Discounts
4. End Of Day Report

### Pre-Shift Brief

Shows what the manager needs to know before service:

- Open items from yesterday
- Message from the closing manager
- Unfinished tasks
- Things to watch
- Events today
- HESTIA recommendations from previous evidence

### Open From Last Shift

Examples:

- Complaint not fully resolved.
- Prep not confirmed.
- Staff struggled explaining a cocktail.
- A recurring void pattern should be reviewed.

If empty:

```text
NOTHING OPEN FROM LAST SHIFT
```

### Voids / Cancellations / Discounts

Belongs to the regular Manager as well as the Bar Manager.

It can reflect:

- Service issues
- Staff mistakes
- Guest complaints
- Wrong orders
- Product problems
- Pricing issues
- Bar execution issues

If empty:

```text
NO VOIDS OR CANCELLATIONS TODAY
```

### End Of Day Report

Manager submits a short report at the end of service.

It creates:

- Last Service Summary for owner
- Open items for next shift
- Manager memory
- Bar signals if relevant
- Training Gantt recommendations if relevant
- Venue Memory evidence

---

## 14. Bar Manager Workspace

### Includes:

1. Today's Bar Brief
2. Prep Library
3. Training Gantt
4. Shift Execution Tasks

### Today's Bar Brief

Short operational brief for the next bar shift:

- What to focus on
- Which cocktails are in focus
- Prep issues
- Training focus
- Open bar items
- HESTIA recommendations

### Shift Execution Tasks

Tasks assigned to bartenders:

- Prepare Citrus Cordial
- Practice cocktail explanation
- Check garnish
- Review recipe
- Complete assigned academy module

Task statuses:

- Not started
- In progress
- Done
- Needs help
- Needs manager validation

---

## 15. Bartender / Employee Workspace

### Main screen

**My Shift**

Includes:

1. My Tasks
2. Recipe Book
3. Academy
4. Pre-Shift Notes as part of My Shift

### My Tasks

Examples:

- Prepare Citrus Cordial
- Review Mediterranean Collins recipe
- Practice one-sentence explanation
- Check garnish
- Complete assigned lesson

### Pre-Shift Notes

Short notes for the current shift:

- What is in focus
- What to remember
- Which cocktail to explain carefully
- Prep reminders
- Service reminders

---

## 16. Manual Tabit Upload / Shift Report Intelligence

### MVP upload reports

1. Item Sales Report
2. Employee Sales Report
3. Discounts / Voids / Cancellations

### Not now

- Payments / Revenue Report

### Rules

1. No report → no confident claim.
2. Every uploaded report becomes Venue Memory evidence.
3. One report is an early signal, not a trend.
4. Missing report means HESTIA must say what is missing.

### Item Sales Report enables:

- Cocktail performance
- Menu performance
- Bar signals
- Prep usage estimates
- Low-selling / high-margin analysis
- Training needs

### Employee Sales Report enables:

- Staff Performance & Learning
- Training Gantt
- Sales-by-employee insights
- Performance support signals

HESTIA must avoid punitive language.

### Voids / Cancellations / Discounts enables:

- Service issue detection
- Product issue detection
- Staff training signals
- Manager follow-up
- Bar Manager follow-up
- Future pattern detection

---

## 17. End Of Day / Last Service Summary

### End Of Day Report

Submitted by Manager at end of service.

### Last Service Summary

Generated by HESTIA from the End Of Day Report.

The owner sees it inside HESTIA / Owner Reports / HESTIA AI.

Examples:

- "View yesterday's service summary."
- "View tonight's service summary."

### Email delivery

Email is optional and configurable.

Rule:

**The software is the home. Email is a distribution channel.**

Possible settings:

- Show inside HESTIA → always.
- Send daily email summary → optional.
- Send email only when owner attention is needed → optional.

---

## 18. Venue Memory

### Rule

HESTIA saves almost everything, but does not treat everything as current truth.

Venue Memory stores:

- Venue DNA
- DNA versions
- Bar programmes
- Past menus
- Reports
- End Of Day reports
- Decisions
- Actions
- Outcomes
- Training assignments
- Training completions
- Manager validations
- Prep batches
- Recipe changes
- HESTIA outputs
- Signals
- Recommendations

### Memory rules

1. Save everything important.
2. Surface only what matters.
3. Archive/hide instead of hard delete.
4. Raw evidence is separate from AI interpretation.
5. Human-confirmed knowledge is stronger than inferred knowledge.
6. Old knowledge remains available but may lose relevance.
7. DNA updates require owner confirmation.

---

## 19. Evidence Lifecycle and Confidence

### Status

Closed research-backed, with simplified MVP implementation.

### Official Evidence Lifecycle

```text
Raw Event
→ Contextualized Event
→ Signal
→ Observation
→ Pattern Candidate
→ Root Cause Hypothesis
→ Recommendation
→ Action
→ Outcome
→ Confirmed Memory / Rejected Memory
→ DNA Update Candidate
```

### MVP implementation

Do not build the entire advanced research model immediately.

MVP should implement:

- Source tracking
- Evidence type
- Confidence level
- Human confirmation state
- Status
- Visibility
- Links to decisions/actions/outcomes
- Separation between raw evidence and interpretation
- No automatic DNA update

### Confidence rules

1. One report = early signal, not trend.
2. One review = evidence signal, not truth.
3. Manager note = evidence, not absolute truth.
4. Lesson completion = exposure, not capability.
5. Root cause = hypothesis until validated.
6. DNA update = owner-confirmed only.

---

## 20. Future / TBA

### Not in current MVP

1. Review Intelligence Agent
2. Prep Gantt Intelligence
3. Live Service Intelligence
4. WhatsApp notifications
5. Full POS API integration
6. Google Reviews API integration
7. Payments / Revenue Report
8. Autonomous DNA updates
9. Full financial P&L intelligence

### Review Intelligence Agent — TBA

Future connector.

Will eventually:

- Read Google Reviews through official integration.
- Detect new reviews.
- Convert reviews to evidence signals.
- Feed Bar Signals, Staff Performance & Learning, Service Academy, and Venue DNA update candidates.
- Never update DNA without owner confirmation.

### Prep Gantt Intelligence — TBA

Future evolution of Prep Library.

Will eventually:

- Track prep usage across multiple cocktails.
- Calculate theoretical depletion from sales.
- Account for shelf life.
- Forecast next-shift prep demand.
- Recommend when and how much to prepare.

### Live Service Intelligence — TBA

Future capability.

HESTIA will not currently manage service issues live during the shift.

Current loop remains:

```text
End Of Day → Next Pre-Shift Brief
```

---

## 21. Implementation Priorities

### Phase 1 — Navigation cleanup and role-based structure

- Replace generic module navigation with role-based navigation.
- Owner sees HESTIA AI, Owner Reports, Decision Center, Venue DNA.
- Manager sees Pre-Shift Brief, Open From Last Shift, Voids/Cancellations, End Of Day.
- Bar Manager sees Bar Brief, Prep Library, Training Gantt, Recipe Book, Shift Tasks.
- Employee sees My Shift, Recipe Book, Academy.

### Phase 2 — HESTIA AI owner experience

- Full-screen HESTIA AI.
- First-run DNA characterization flow.
- Returning-owner AI home.
- Small links to Owner Reports, Decision Center, Venue DNA.
- Smart navigation commands.

### Phase 3 — Active Bar Programme

- Build Bar Programme flow.
- Draft → Owner Approved → Ready for Training → Active → Archived/Hidden.
- Guest Cocktail Menu.
- Recipe Book content.
- Prep Recipes.
- Pricing & Costing confidence.
- Training Outputs.
- Prep Planning Lite.

### Phase 4 — Prep Library + Recipe Book

- Bar Manager Prep Library.
- Bartender Recipe Book.
- View Recipe.
- Mark Prepared.
- Active Batches basic.
- Low/Expired status.
- NO PREP FOR TODAY.
- Prep Gantt TBA note.

### Phase 5 — Training Gantt + Academy Intelligence

- Assign learning to employees.
- Link Academy content to business need.
- Manager/Bar Manager assignment flow.
- Employee completion.
- Manager validation.
- Owner summary.

### Phase 6 — Manager loop

- Pre-Shift Brief.
- Open From Last Shift.
- End Of Day Report.
- Last Service Summary.
- Optional email delivery.
- Voids/Cancellations/Discounts review.

### Phase 7 — Manual Tabit Upload

- Item Sales Report.
- Employee Sales Report.
- Discounts / Voids / Cancellations.
- Evidence-bound parsing.
- No invented insights.
- Save uploaded reports into Venue Memory.

### Phase 8 — Venue Memory + Evidence lifecycle MVP

- Store evidence, signals, recommendations, actions, outcomes.
- Track confidence and source.
- Archive/hide instead of delete.
- Prevent automatic DNA mutation.
- Link actions to outcomes.

---

## 22. Product Guardrails for Claude / Engineering

1. Do not create fake data.
2. Do not show fake analytics.
3. Do not invent missing Tabit fields.
4. Do not build Google Reviews now.
5. Do not build WhatsApp now.
6. Do not build Prep Gantt Intelligence now.
7. Do not build Live Service Intelligence now.
8. Do not hard-delete old menus.
9. Do not let non-owner roles edit Venue DNA.
10. Do not make managers chat freely with HESTIA AI.
11. Do not expose owner-level financials to employees.
12. Do not expose Prep Library management to bartenders.
13. Do not treat Academy completion as proven capability.
14. Do not treat one report as a trend.
15. Do not update Venue DNA without owner confirmation.
16. Keep owner UI minimal: chat first, depth on demand.
17. Keep role workspaces simple and execution-oriented.
18. Connect existing modules before creating new ones.

---

## 23. One-Sentence Roadmap Summary

**HESTIA MVP should become a role-based AI Bar Intelligence system where the owner speaks with HESTIA AI, AI Bar Intelligence builds and improves bar programmes, managers execute prep/training/service loops, bartenders use Recipe Book and Academy, and every report, decision, task, and outcome becomes evidence-bound Venue Memory.**
