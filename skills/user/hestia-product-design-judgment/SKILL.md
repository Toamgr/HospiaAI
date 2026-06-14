---
name: hestia-product-design-judgment
description: Product, UX, UI, copy, and architecture judgment for HESTIA. Use when making any HESTIA product decision, designing or editing screens, writing user-facing copy, connecting workflows, reviewing feature fit, or deciding whether to build, preserve, simplify, or integrate a module. Enforces HESTIA as a premium hospitality operating system, not a generic SaaS dashboard.
---

# HESTIA Product Design Judgment

Use this skill whenever you make product, UX, UI, copy, architecture, or integration decisions inside HESTIA.

HESTIA is not a dashboard. HESTIA is a premium hospitality operating system for real hospitality work.

Every decision must protect that identity.

## Product Philosophy

HESTIA exists to help hospitality teams run service with more clarity, memory, and confidence.

Build for real operational roles:

- Owner
- Manager
- F&B Director
- Event Manager
- Chef
- Bartender
- Employee

Every feature must help one of these roles do real work faster, calmer, or with better judgment. If a feature only displays information without improving action, briefing, service, memory, or coordination, it probably does not belong.

HESTIA should feel like a composed operating layer over the venue, not a collection of admin panels.

Prioritize:

- Operational clarity
- Service readiness
- Role-aware workflows
- Memory that compounds over time
- Event-driven coordination
- Mobile-first service use
- Embedded intelligence that helps the user act

Avoid:

- Dashboard bloat
- Generic SaaS patterns
- Fake KPIs
- Disconnected widgets
- Decorative metrics
- Chatbot surfaces pasted into workflows
- Rebuilding working systems instead of connecting them

## Visual And Emotional Standard

Every HESTIA screen must feel:

- Calm
- Intelligent
- Warm
- Operational
- Premium
- Editorial

Use references such as:

- Aman
- Four Seasons
- Monocle
- MasterClass
- Vogue Business
- Prada and Louis Vuitton editorial books

The interface should feel quiet, intentional, and service-native. It should suggest a premium hospitality environment: composed spacing, refined hierarchy, restrained contrast, and meaningful detail.

Never let HESTIA look like:

- A generic admin panel
- A colorful startup dashboard
- A toy-like productivity app
- A KPI wall
- A chatbot app
- A template SaaS control panel

If the result looks like a generic admin panel, it failed.

## Hospitality Workflow Rules

Start from the operator's job, not from the data model.

Ask:

- Who is using this during service?
- What decision are they making?
- What needs to be briefed, approved, escalated, prepared, assigned, or remembered?
- What can HESTIA remove from their mental load?
- What should carry forward into operational memory?

Good HESTIA features do at least one of these:

- Prepare a team before service
- Reduce ambiguity during service
- Capture operational memory
- Connect departments
- Prevent missed handoffs
- Surface risks before they become incidents
- Make events, food, cocktails, staffing, seating, calendar, and briefing modules work together

Bad HESTIA features:

- Add a screen without a workflow
- Add a metric without an action
- Add AI without a specific operational role
- Add configuration that does not change service behavior
- Make users manage software instead of managing hospitality

## Language And Naming Rules

Use hospitality-native language.

Prefer:

- Guests, not customers
- Brief, not prompt
- Service, not task when referring to hospitality execution
- Operational memory, not notes
- Team, not users when referring to staff context
- Venue, not account when referring to hospitality operation
- Readiness, not status when the question is whether service can run
- Handoff, not update when context moves between roles or shifts

Keep copy calm, precise, and useful. Avoid SaaS excitement language.

Do not write:

- "Unlock insights"
- "Boost productivity"
- "AI-powered dashboard"
- "Customers"
- "Prompts"
- "Tasks" for every hospitality action
- "Awesome", "magic", or hype copy

Write like a senior hospitality operator and an editorial product designer worked together.

## AI Behavior Rules

AI in HESTIA must not feel like a chatbot pasted into software.

It should feel like a professional assistant embedded inside the workflow:

- Zohar briefs the Event Manager.
- Cocktail Intelligence behaves like a Beverage Director.
- Shift Brain helps the Manager prepare service.
- Operational memory helps the venue remember what matters.

AI should:

- Use real available data
- Explain what it knows and what is missing
- Produce operational outputs, not generic prose
- Respect role context
- Create briefs, recommendations, menus, prep guidance, risks, and handoffs
- Stay inside the workflow where the decision happens

AI should not:

- Invent venue facts
- Invent costs, suppliers, kosher status, staffing, or guest details
- Replace deterministic intelligence that already exists
- Present itself as a generic chat assistant
- Ask the user to re-enter data HESTIA already has

## Feature Fit Test

Before building or changing a feature, answer these questions:

1. Which hospitality role is this for?
2. What real service decision or workflow does it improve?
3. What existing HESTIA module already owns this domain?
4. What data should flow into or out of this feature?
5. What operational memory should be created or updated?
6. What is the smallest useful integration?
7. What should not be rebuilt?

If you cannot answer these clearly, pause and simplify the feature.

## Architecture Judgment

Protect existing working modules.

Do not rebuild existing intelligence layers. Connect them cleanly.

Before adding a new module, search for:

- Existing hooks
- Existing services
- Existing domain intelligence
- Existing feature components
- Existing route/API contracts
- Existing storage/persistence paths
- Existing deterministic engines

Prefer integration over replacement.

Good architecture in HESTIA:

- Lets hooks own state
- Lets services own intelligence
- Lets feature components render workflow
- Keeps App.jsx as orchestration only
- Preserves domain boundaries
- Passes structured data between modules
- Uses event-driven handoffs where possible
- Makes operational memory compound

Bad architecture in HESTIA:

- Duplicates intelligence in components
- Recreates a working module with a parallel version
- Adds cross-domain imports between hooks
- Pushes feature logic into App.jsx
- Creates isolated features that do not share event, venue, or memory context
- Adds fake fallback data as if it were real

## Event Integration Rule

Event data must flow into:

- Food
- Cocktail
- Staffing
- Seating
- Calendar
- Briefing
- Operational memory

When working on event features, pass the event brief forward instead of asking users to repeat it.

Use real event fields such as:

- Event type
- Guest count
- Date and time
- Venue/location
- Client/host context
- Notes and special requests
- Guest dietary/accessibility needs
- Seating state
- Task/readiness state
- Timeline state

Missing data should be marked as missing. Do not invent it.

## UI Judgment

HESTIA UI should be operational and editorial, not decorative.

Use:

- Clear hierarchy
- Quiet surfaces
- High-quality typography
- Tight but breathable spacing
- Strong information scent
- Role-specific actions
- Briefs, readiness states, and handoff surfaces

Avoid:

- Generic cards everywhere
- Nested cards
- Bright gradients
- Childish icons
- Random emoji
- Fake charts
- Fake KPIs
- Crowded dashboards
- Empty visual noise
- Marketing-page layouts inside tools

Every button should represent a real command:

- Brief team
- Approve menu
- Send to F&B Director
- Assign service owner
- Generate event menu
- Open seating plan
- Mark ready
- Carry forward

Do not add buttons that only navigate to another vague panel.

## Copy Judgment

HESTIA copy should be short, warm, and operational.

Good copy:

- "Brief ready for the bar team."
- "Cocktail menu approved for this event."
- "Kosher requirement detected. Verify bar and kitchen compliance."
- "Three guests remain unseated before final service briefing."
- "Saved to operational memory."

Bad copy:

- "Your AI has generated amazing insights."
- "Manage your customer data."
- "Prompt the assistant."
- "View dashboard analytics."
- "Boost your workflow."

## Protecting Existing Modules

When a module already works, do not rebuild it.

Instead:

- Identify its public API or props
- Identify what data it already expects
- Adapt upstream data into that shape
- Preserve its current behavior
- Add integration status only where useful
- Keep changes close to the connecting layer

Example principle:

If Cocktail Intelligence already generates menus, do not create a second cocktail intelligence system. Pass event brief fields into the existing cocktail generation and menu design flow.

If Zohar already creates event briefs, do not create another event brief generator. Connect Zohar's brief to food, cocktail, staffing, seating, calendar, and briefing flows.

## Final Quality Bar

Before finishing any HESTIA work, check:

- Does this feel premium hospitality-native?
- Does this help a real role do real work?
- Does this preserve existing working modules?
- Does this connect intelligence instead of duplicating it?
- Does the language sound like HESTIA?
- Does the UI avoid generic SaaS/dashboard patterns?
- Does missing data remain honest?
- Does AI behave like an embedded professional assistant?

If any answer is no, revise before delivering.
