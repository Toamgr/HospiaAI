# HESTIA AI Roadmap

## MVP Scope

1. Stable role-based authentication with owner/admin user governance.
2. Shift Brain as the operating center: reports, incidents, actions, employee requests, venue memory.
3. Cocktail Lab as a real bar manager workflow with AI generation, fallback generation, draft review, approval, and employee training visibility.
4. HESTIA University as measurable progression, not static content.
5. Owner Intelligence as decision support based on real operational signals.

## Immediate Priorities

- Continue extracting `App.jsx` into feature modules without changing behavior.
- Migrate user management and operational requests to backend/SQLite.
- Create first-class Daily Shift Report page with structured fields and filtering.
- Normalize manager action board data shape around statuses, comments, source signals, and ownership.
- Connect Shift Brain snapshots to Owner Command Center and Manager Shift Operations.

## Operational Roadmap

- Pre-shift briefing builder.
- Shift start checklist.
- End-shift report and unresolved issue carry-forward.
- Incident pattern detection.
- Staff coaching notes and manager endorsements.
- Venue memory search.
- Weekly owner business brief generated from real data.

## Bar And Beverage Roadmap

- Cocktail request intake separated from proposal generation.
- Tasting notes, revision history, approval governance, and menu launch date.
- Cocktail cost model with ingredient pricing.
- Approved menu performance and staff practice completion.
- Wine and coffee academy assessments.

## Backend Roadmap

Target tables:

- users
- roles
- venues
- staff_members
- shift_reports
- tasks
- task_comments
- notifications
- cocktail_requests
- cocktail_drafts
- approved_cocktails
- academy_modules
- academy_progress
- owner_insights
- guest_experience_signals
- manager_actions
- incidents
- venue_memory

## Future Integrations

- POS revenue import.
- Reservation/VIP notes import.
- Email and notification providers.
- Calendar/event pipeline.
- Inventory and supplier systems.
- Learning certification exports.

## Investor-Grade Milestones

1. Daily active manager workflow: shift briefing, action board, incident follow-up.
2. Employee operating experience: learning, issue reporting, assigned tasks, approved bar menu.
3. Owner weekly brief: repeated issues, staff gaps, unresolved risks, event pipeline, profit opportunities.
4. Bar management workflow: AI R&D, approval, training, and menu governance.
5. Backend-backed venue memory across multiple venues.
