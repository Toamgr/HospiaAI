> Research archive note: This document is supporting research for HESTIA Venue Intelligence. It is not canonical product doctrine and should not be implemented directly without passing HESTIA's provenance, confidence, role-access, venue-boundary, and human-approval guardrails.
> Automation and AI-agent ideas in this document are research direction only. They are not current production behavior, require real evidence, and must not create fake operational truth or bypass human approval for high-impact decisions.

# HESTIA — Venue Decision Intelligence Framework

**Document type:** Strategic research — first-principles hospitality decision architecture
**Epistemic status:** Mix of operator evidence (labeled), domain inference (labeled), and open hypotheses (labeled). No claim is presented as proven that is not grounded in observed operator practice.
**Author context:** Written from the combined perspectives of luxury hotel GM, F&B Director, restaurant founder, service psychologist, and systems architect — filtered for HESTIA's specific product context.
**HESTIA relevance:** This document is the research foundation for `docs/intelligence/` — the validated knowledge architecture layer. Nothing in this document becomes a product decision until validated against real operational behavior.

---

## Preface: Why Hospitality Decision-Making Is Different

Most business software is built around a false model of decision-making: that decisions are discrete, sequential, data-rich, and rationally optimized by whoever is formally responsible.

Hospitality decisions are almost nothing like this.

**What is actually true about hospitality decisions (operator-observed):**

1. Most consequential decisions are made in seconds, under physical pressure, in loud environments, with incomplete information.
2. The people best positioned to make the right call are often the least empowered to make it.
3. The same decision made correctly in one venue at one time will be wrong in another venue or another moment.
4. The most expensive decisions are not made — they are delayed until they become crises.
5. The best operators do not make more decisions than mediocre ones. They make fewer, better, faster, and they remember the outcome.
6. Hospitality decisions are emotionally loaded in ways that purely operational decisions are not. A staffing cut affects the team's trust. A menu change affects the chef's identity. A pricing increase affects the guest's sense of worth.
7. Bad decisions in hospitality are rarely caused by lack of information. They are caused by wrong framing, cultural pressure, ego, and habit.

**The practical implication for HESTIA:**

HESTIA's job is not to replace hospitality judgment. It is to:
- Surface the right signal at the right moment to the right person
- Remove the cognitive load of remembering what already happened
- Make the cost of a decision visible before it is made
- Record what was decided and why, so the next decision is better

This framework is the map of what HESTIA needs to understand, track, support, challenge, recommend, and remember.

---

## Part 1: Decision Taxonomy

Before categorizing decisions by time horizon or domain, every hospitality decision falls into one of five classes. HESTIA must understand which class a decision belongs to before determining how to engage with it.

### Class 1: Operational Decisions
Made by the person running the room, right now. Reversible or recoverable in real time. Speed matters more than optimization.

*Examples: 86 an item, move a table, adjust a comp, call in a late employee.*

*HESTIA role: pre-load context, capture outcome, carry forward unresolved.*

### Class 2: Tactical Decisions
Made by managers, looking one to four weeks ahead. Based on patterns, not individual incidents. Mostly reversible. Optimization matters more than speed.

*Examples: schedule next week's shifts, adjust menu pricing, reorder a slow-moving product.*

*HESTIA role: pattern detection, cost modeling, recommendation with confidence level.*

### Class 3: Strategic Decisions
Made by owners and F&B directors, looking months to years ahead. Partially irreversible. Require analysis, experimentation, and judgment. Cannot be automated.

*Examples: change the concept, hire a head chef, enter catering events, add a tasting menu.*

*HESTIA role: surface historical evidence, model trade-offs, flag risks — never recommend unilaterally.*

### Class 4: Cultural Decisions
Made by founders and senior operators, shaping who the venue IS rather than what it does. Almost never explicit. Often invisible until something goes wrong. Cannot be tracked with metrics alone.

*Examples: whether the team laughs during service. Whether mistakes are punished or learned from. Whether regulars are treated like guests or like family.*

*HESTIA role: detect drift from stated culture through incident patterns, staff behavior signals, guest feedback clusters.*

### Class 5: Crisis Decisions
Made under pressure with potentially irreversible consequences. Need to be made fast, at the right level of authority, with clear escalation paths.

*Examples: a guest injury, a food safety incident, a staff walkout before service, a viral negative review.*

*HESTIA role: escalation protocol, decision tree, memory of what was done last time and what the outcome was.*

---

## Part 2: Decision Architecture by Time Horizon

### Shift-Level Decisions (Minutes to Hours)

**Who makes them:** Shift manager, bartender, floor supervisor, server captain.

**What decisions exist:**

- Station assignment adjustments mid-shift
- Cover flow decisions (who takes the walk-in, when to close the wait list)
- Comp and void decisions (when and how much, with what reason code)
- 86 decisions (remove an item from service tonight)
- Prep calls (reorder prep mid-shift for items running low)
- Staff performance interventions (pull someone off a station, redirect a team member)
- Guest recovery decisions in the moment (upgrade, comp, personal visit from manager)
- Pacing decisions (hold a course, speed up a table, delay a dessert)
- Upsell and table management decisions

**What data is needed:** Current reservations, walk-in rate, inventory snapshot, staffing reality, event overrides, allergen alerts, VIP flags.

**Weak signals that matter:**
- A table that has been sitting for 8 minutes without being greeted
- Two consecutive comps for the same reason (not a coincidence — a pattern)
- A staff member who has gone quiet on the floor
- A prep item running at double expected pace before 8 PM
- A regular guest who hasn't been acknowledged

**Risks:** Under-recovery (too slow), over-compensation (comping becomes habitual), missed escalation (a guest issue gets worse because it wasn't flagged to the manager).

**Trade-offs:** Speed vs. quality, guest satisfaction vs. table turn, staff dignity vs. performance correction.

**What AI can recommend:** Based on booking density and historical patterns — likely 86 items before the rush, recommended cover target per hour, expected high-demand cocktails tonight.

**What AI should only warn about:** An unusual comp pattern building across the shift. A staff member generating incident flags. A service time exceeding venue average.

**What should be remembered afterward:** Which items ran out and at what time. What the comp reason was and who approved it. What the table recovery decision was and whether the guest returned.

---

### Daily Decisions (Before/After Service)

**Who makes them:** Shift manager, bar manager, kitchen manager.

**What decisions exist:**

- Daily prep quantities (for kitchen and bar)
- Staffing confirmation and last-minute adjustments
- Specials decision (what's on, how to price it, how to sell it)
- VIP briefing (who is coming, what do we know, what do we prepare)
- Inventory spot check (what is actually on hand vs. what should be there)
- Opening decision (is the venue ready to open, what is outstanding)
- Event readiness check (if there is a private event tonight, is everything confirmed)
- End-of-day summary and carry-forward decisions (what must the next shift know)
- Reservation pacing (how to spread covers, how to protect key hours)

**What data is needed:** Reservation log, event calendar, prep sheets, inventory snapshot from previous night, staff schedule, any incidents from the previous shift.

**Weak signals that matter:**
- A reservation block with multiple dietary restrictions that haven't been briefed to the kitchen
- A staffing gap in a high-demand station with no backup plan
- A product running low with no reorder placed
- Repeat incidents from the previous two shifts that haven't been addressed
- A VIP with a past incident record (who was never briefed to the manager on duty)

**Risks:** Silent failure — the shift opens without the manager knowing what is broken. Guest surprises that should have been anticipated.

**Trade-offs:** Thoroughness vs. speed of brief. Prep accuracy vs. waste. VIP personalization vs. operational bandwidth.

**What AI can recommend:** Prep quantities based on tonight's booking density and historical throughput. Expected high-velocity items. Allergen conflict alerts based on reservations. VIP briefing assembled from historical notes.

**What AI should only warn about:** Patterns from previous nights that predict tonight's risk. Staff attendance patterns that suggest a no-show risk. Inventory shortfalls that will cause problems during service.

**What should be remembered afterward:** What the actual cover count was vs. projected. What 86'd and at what time. What the guest mix was (occasion bookings, regulars, new guests). What carry-forward items exist.

---

### Weekly Decisions (Planning Horizon: 1–2 Weeks Out)

**Who makes them:** Manager, F&B Director, bar manager, events manager.

**What decisions exist:**

**Staffing and scheduling:**
- Who works which shifts next week
- Who is being evaluated or coached this week
- Whether to bring in a temp or cross-train someone
- Overtime risk assessment

**Purchasing and inventory:**
- What to order from which suppliers
- Whether to accept a supplier substitution or hold
- Which slow-moving products to 86 or feature more heavily
- Waste review (what did we over-order and why)

**Menu and program:**
- What specials to run next week
- Whether any cocktail is consistently underperforming and should be pulled
- Whether a new item from the kitchen or bar is ready to add
- What to feature on social media or in-house communication

**Events and bookings:**
- Which private event inquiries to pursue
- Whether to take a large booking that affects the floor
- Event staffing decisions for the next week's events

**Guest relationships:**
- Which regulars haven't been seen in a while (follow-up opportunity)
- Which guest incidents require a follow-up gesture
- Which new guests should be flagged for recognition next visit

**What data is needed:** Last week's incident log, waste report, labor vs. sales ratio, cover count vs. previous week, event calendar for next 14 days, supplier availability and pricing updates, training completion status.

**Weak signals that matter:**
- A menu item that is being comped at a higher rate than others (execution problem, not just guest preference)
- Labor creep over three consecutive weeks without a revenue explanation
- A supplier who has missed delivery windows twice in a row
- A staff member who hasn't had a performance conversation in 60+ days
- A regular who used to come every week and hasn't been in for three

**Risks:** Ordering wrong quantities (too much → waste, too little → 86s). Scheduling conflicts nobody caught. Missing a training window because it was never tracked.

**Trade-offs:** Labor cost vs. coverage quality. Specials creativity vs. execution complexity. Pushing regulars vs. respecting their space.

**What AI can recommend:** Predicted cover volume based on historical weekly pattern and current bookings. Reorder quantities based on usage rate and lead time. Staff efficiency comparison (revenue per labor hour by role).

**What AI should only warn about:** A staff member who is showing a pattern of performance issues (human conversation required). A supplier whose fill rate is declining. A repeat guest who hasn't returned after an incident.

**What should be remembered afterward:** What was ordered and what the variance was. Which specials sold and which didn't. Which staff decisions led to what outcomes.

---

### Monthly Decisions (Optimization Horizon)

**Who makes them:** Owner, F&B Director, general manager, bar manager together.

**What decisions exist:**

**Financial performance:**
- COGS vs. target review
- Labor cost vs. revenue ratio analysis
- Revenue per seat, per cover, per hour
- Whether current pricing structure is working
- Comp and void rate review (is it too high? too low? concentrated?)

**Menu engineering:**
- Which items are high margin / high volume (Stars) — feature and protect
- Which items are high margin / low volume (Puzzles) — investigate and potentially reposition
- Which items are low margin / high volume (Plowhorses) — reduce cost or phase out
- Which items are low margin / low volume (Dogs) — remove

**Staff development:**
- Who is ready to be promoted or take on more responsibility
- Who needs a performance conversation before the 90-day window passes
- Whether the team has the skills needed for the next operational level
- Training investment decisions for the next quarter

**Supplier relationships:**
- Renegotiation triggers (if a supplier has had issues)
- Reviewing whether price changes from suppliers require menu adjustments
- Evaluating new supplier relationships that were trialed

**Guest experience:**
- Review of repeat visit rate and what is driving or preventing return
- Which service failures had lasting impact (guest never returned)
- Whether the service standard is consistent with the brand intent

**What data is needed:** Full month P&L, menu item performance, labor hours by role, comp/void register, cover count and revenue by day and hour, supplier invoices, incident log summary, staff training completion, repeat guest frequency data.

**Weak signals that matter:**
- A 3% creep in COGS that hasn't been investigated — it compounds
- A server or bartender whose average check has been declining for six weeks
- A supplier whose invoices are creeping higher by small amounts that nobody questions
- Three consecutive weeks of lower Friday covers — is it seasonal or structural?
- A positive review that consistently mentions a specific staff member (opportunity for recognition and retention)

**Risks:** Month-close tunnel vision (fixing last month's numbers instead of building next month's position). Over-pruning a menu (killing items guests actually love but don't show up in margin math). Under-pruning (loyalty to failing items for ego reasons).

**Trade-offs:** Removing a low-margin item vs. keeping a guest signature. Promoting someone vs. keeping them in a role where they are excellent. Renegotiating a supplier vs. risking a relationship.

**What AI can recommend:** Menu engineering matrix with confidence-level labels. Labor efficiency benchmarks by role and shift. Predicted cover density for next month based on seasonality + current bookings.

**What AI should only warn about:** Staff member performance trends (framing only — manager must decide). COGS creep beyond threshold. Guest return rate declining vs. previous period.

**What should be remembered afterward:** Every menu change and the date it happened. Every pricing change and the effect. Every staffing decision and the outcome. Every supplier change and why.

---

### Strategic Decisions (Quarterly to Annual)

**Who makes them:** Owner, founder, F&B Director, general manager. Often with external consultation.

**What decisions exist:**

- Concept evolution or refresh (is the brand still right for this market?)
- Pricing strategy reset (moving upmarket or downmarket, changing value proposition)
- Major staffing restructuring (new senior hire, team restructuring)
- Menu overhaul (seasonal reset, full redesign, concept pivot)
- Physical space investment (renovation, equipment, atmosphere refresh)
- Technology investment decisions (new POS, reservation system, HESTIA itself)
- Events and private dining strategy (whether to grow it, focus it, or pull back)
- Marketing and brand visibility investment
- Potential expansion decision (second location? catering? wholesale?)
- Supplier strategy (exclusive relationships, local sourcing commitments, portfolio changes)

**What data is needed:** Twelve months of operational data, market context (competitor moves, neighborhood changes, guest demographic shifts), staff capability assessment, capital position, brand sentiment analysis.

**Weak signals that matter:**
- Guest age demographic has been shifting for 18 months without the team noticing
- A competitive venue has opened nearby and is hiring away staff
- The head chef's creative enthusiasm has been declining — probably six months before it becomes visible
- Positive word-of-mouth is concentrated in one corner of the experience and not spreading to others
- Staff retention has been improving but for the wrong reason (nobody is leaving because the culture is comfortable, not because it is excellent)

**Risks:** Acting on lag data (deciding based on what happened 12 months ago, not what is beginning now). Confusing cyclical decline with structural decline. Strategic incoherence (moving upmarket in service while cutting menu costs).

**Trade-offs:** Identity preservation vs. market adaptation. Short-term profitability vs. long-term positioning. Founder vision vs. market reality.

**What AI can recommend:** Historical trend analysis with confidence bounds. Scenario modeling for pricing or menu changes. Benchmarking against known operational patterns.

**What AI should only warn about:** Strategic drift from stated positioning. Revenue concentration risk (too dependent on one revenue stream). Talent risk (key person dependency).

**What should be remembered afterward:** What the strategic decision was, what the hypothesis was, what the timeline for evaluation was, and what actually happened. This is institutional memory.

---

### Founder-Level Decisions (Non-Delegable)

These decisions cannot be delegated, cannot be automated, and should never be made by consensus alone. They define what the venue is.

**What decisions exist:**

- Who the head chef or head bartender is (the creative identity of the place)
- What the venue's core philosophy is (and what it is NOT)
- Whether to expand — and how
- Who the investors or partners are
- Whether to sell or transfer the business
- What is non-negotiable about the guest experience, even if it costs money
- What the venue will never do, even under financial pressure
- Whether to close, reposition, or pivot

**Critical principle (operator-observed):** The most dangerous founder decisions are the ones made slowly without realizing they are being made. A venue drifts from its identity one compromise at a time. HESTIA's job is to make drift visible before it becomes irreversible.

**What AI should never do here:** Recommend. The role is to surface evidence and make the cost of the decision visible — not to make it.

**What should be remembered:** Every founder-level decision with its stated rationale. So that three years later, when reviewing whether the decision worked, the reasoning is preserved.

---

## Part 3: Decision Architecture by Domain

### F&B Decisions — Menu

**What decisions exist:** What is on the menu. What is coming off. What is priced at what. What is featured. What is the seasonal or conceptual direction.

**Who usually makes them:** Chef (food), bar manager/beverage director (bar), with F&B director or owner override on strategy.

**What data is needed:** Item-level sales volume, margin per item, waste per item, guest feedback by item, preparation complexity, execution consistency, staff capability.

**Weak signals that matter:**
- Staff apologize for an item when they sell it (they know it's not right)
- An item has been on the menu for three seasons without being the best version of itself
- Guests are ordering a specific item together and they never ordered it alone
- An item generates more waste on slow nights than it earns on busy ones

**What AI can recommend:** Menu engineering matrix. Prep quantity optimization based on predicted cover mix. Price elasticity modeling based on historical data.

**What AI should only warn about:** An item's margin falling below threshold. Waste concentration on specific items. Consistency issues detected through incident or comp patterns.

**What should be remembered:** Every menu change, the date, the reason, the effect on covers and revenue.

---

### F&B Decisions — Beverage Program (Bar & Wine)

**What decisions exist:** Which spirits to stock. Which wines to carry by the glass vs. bottle. What the cocktail menu says about the venue. How to price. When to rotate and when to preserve.

**Who usually makes them:** Bar manager or beverage director, with owner override on major investment (premium whisky stock, wine cellar investment).

**What data is needed:** Spirit/wine velocity, pour cost by product, cocktail margin, seasonal demand patterns, competitor drink programs, staff training capacity (some programs require skills the team doesn't have).

**Weak signals that matter:**
- A cocktail that staff are ashamed to make because they can't make it consistently
- A wine-by-the-glass that has been open for too long too many times
- A premium spirit that guests request but the venue doesn't carry (demand signal)
- A cocktail that guests order once and never order again (poor concept-to-palate match)

**What AI can recommend:** Reorder timing based on velocity and lead time. Par level optimization. Cocktail engineering matrix (volume vs. margin vs. prep complexity).

**What AI should only warn about:** Pour cost creeping above threshold. A product with declining velocity suggesting approaching the end of its venue relevance.

**What should be remembered:** Every menu rotation decision. Every new product added and its velocity from Day 1. The cocktail lifecycle (inception, adoption, maturity, retirement) for every drink.

---

### Staffing Decisions

**What decisions exist:** Who to hire. Who to promote. Who to develop. Who to let go. How to schedule. How to reward.

**Who usually makes them:** Manager (scheduling), owner or GM (hiring/firing), F&B Director (program-level talent strategy).

**What data is needed:** Revenue per labor hour. Cover count by shift and section. Incident frequency by staff member. Training completion. Guest feedback attribution. Staff-reported issues.

**Weak signals that matter:**
- A high-performing staff member who has stopped asking questions (disengagement is early)
- Two strong staff members who are rarely scheduled together (manager bias or conflict avoidance)
- A staff member whose check average has dropped for three consecutive weeks
- A new hire who asks operational questions nobody can answer (onboarding gap)
- A Friday night where the same position is understaffed every week for four weeks

**Risks:** Keeping a weak performer too long because confrontation is uncomfortable. Losing a strong performer because recognition was delayed. Promoting the wrong person because seniority was confused with excellence.

**Trade-offs:** Stability vs. growth. Loyalty vs. performance. Speed of hire vs. culture fit.

**What AI can recommend:** Scheduling optimization based on historical revenue pattern and confirmed bookings. Training completion gaps matched to upcoming shifts. Labor cost projection for next week.

**What AI should only warn about:** Individual performance patterns (for human follow-up only). Labor cost drift. Repeated staffing gaps in the same role or shift.

**What should be remembered:** Every hire with start date and onboarding status. Every promotion and the criteria. Every departure with the stated reason. Every training milestone.

---

### Guest Experience Decisions

**What decisions exist:** How to treat a regular differently from a new guest. When to comp. When to upgrade. How to recover from a service failure. What personalization touches to apply. How to handle a difficult guest without losing other guests.

**Who usually makes them:** Frontline staff in the moment, manager for recovery decisions, owner for VIP decisions.

**Critical operator insight (Danny Meyer / Will Guidara):** The best guest experience decisions are not made by policy. They are made by a team that has internalized the values so deeply that policy feels redundant. The Ritz-Carlton $2,000 rule is not about the money — it is about the training, the trust, and the culture that makes $2,000 feel like the natural response.

**What data is needed:** Guest history (visits, preferences, past incidents, notes from previous staff), tonight's occasion context, party composition, booking source, any pre-arrival requests.

**Weak signals that matter:**
- A returning guest who hasn't been recognized after two visits (they will not come a third time feeling invisible)
- A guest who mentioned a dietary restriction in a reservation note that hasn't been briefed to the kitchen
- A table that is celebrating something and hasn't been acknowledged by the staff
- A complaint that was "resolved" but the guest's body language said it wasn't

**What AI can recommend:** VIP briefing assembled from guest history and notes before service. Allergen conflict alerts. Occasion reminders.

**What AI should only warn about:** A guest with a past service failure who is returning (must be flagged to the manager, not auto-handled).

**What AI should never automate:** The recovery decision itself. Guest-facing personalization without staff review. Any guest communication without a human reading it first.

**What should be remembered:** Every guest interaction note. Every recovery decision and the guest's subsequent behavior. Every preference shared. Every occasion celebrated.

---

### Event Decisions

**What decisions exist:** Whether to take a private event. How to price it. How to staff it. What the menu will be. How to run the operational brief. How to recover if something goes wrong during the event. What to capture afterward.

**Who usually makes them:** Events manager (intake and execution), F&B Director (menu and pricing), owner (final approval on large or complex events).

**What data is needed:** Venue capacity, staffing availability, equipment, event calendar conflicts, historical event profitability, kitchen and bar capability for the requested style, deposit terms.

**Weak signals that matter:**
- An event contract that has been negotiated for longer than usual (the client is testing the venue's firmness)
- A guest count that keeps changing downward (the event may be in trouble)
- An event brief that hasn't been distributed to kitchen and bar 72 hours before the event
- A similar event last season that had a specific operational failure that hasn't been documented

**What AI can recommend:** Event staffing requirements based on guest count, menu type, and historical patterns. Timeline construction for the event brief. Prep quantities.

**What AI should only warn about:** Conflicts with the existing calendar. Staffing gaps for the event date. An event that structurally resembles a past event with a documented failure.

**What should be remembered:** Every event, what happened, what went right, what went wrong, what the guest count vs. confirmed was, what the final revenue was vs. projected, and any operational notes for next time.

---

### Pricing Decisions

**What decisions exist:** Base menu pricing. Promotional pricing. Event pricing. Dynamic pricing (weekend premium, etc.). When to raise prices. How to raise prices without losing regulars.

**Who usually makes them:** Owner or F&B Director, with manager and chef input on cost reality.

**Critical principle:** Pricing decisions in hospitality are identity decisions. Price too low and the venue signals low quality. Price too high and it signals arrogance. The right price is not the highest price the market will bear — it is the price that makes the guest feel the experience was worth it.

**What data is needed:** Full COGS by item, labor cost allocation, competitor pricing, guest perception data (are they leaving without dessert because they're full or because they're startled by the bill?), reservation rate by price tier.

**Weak signals that matter:**
- A price increase that coincided with a 10% cover drop the following month
- Guests who order one less course than the menu suggests (budget constraint signal)
- A cocktail that sells at 3x the rate of others despite being slightly more expensive (willingness to pay signal)
- Staff who are apologizing for the price when they present the bill (they've internalized a guest objection that hasn't surfaced yet)

**What AI can recommend:** Cost modeling for pricing changes with margin projections. Price-volume sensitivity modeling based on historical data. Comparable item benchmarking.

**What AI should only warn about:** A pricing change that moves COGS threshold without a corresponding menu change to compensate.

**What should be remembered:** Every pricing change, the date, the reason, the effect on cover count and revenue per cover for the 90 days following.

---

### Supplier Decisions

**What decisions exist:** Which suppliers to use. Whether to renegotiate. Whether to change a supplier. Whether to accept a substitution. Whether to go exclusive with a key product.

**Who usually makes them:** Bar manager, kitchen manager, purchasing manager (if the venue has one), with F&B Director for strategic supplier relationships.

**What data is needed:** Fill rate by supplier, price variance over time, delivery accuracy, quality consistency, lead times, alternatives available.

**Weak signals that matter:**
- A supplier who has started offering unsolid substitutions (their supply chain is weakening)
- A price increase on a key product that arrives without conversation (they are testing the relationship)
- A delivery that arrives late twice in three months (usually the beginning of a pattern, not an anomaly)
- A new supplier product that one staff member champions — could be the next menu anchor or could be waste

**What AI can recommend:** Reorder timing based on usage rate and lead time. Price variance alerts by supplier. Alternative supplier options when a fill rate drops.

**What AI should only warn about:** A supplier relationship that is underperforming against historical benchmarks.

**What should be remembered:** Every supplier issue, every substitution accepted, every price negotiation, every supplier change and the reason.

---

### Brand Decisions

**What decisions exist:** How the venue presents itself publicly. What the social media voice is. Whether to participate in press or awards. Whether to host media events. What the venue's visual identity says. What the name means.

**Who usually makes them:** Owner or founder. Often the hardest decisions to make because they feel simultaneously obvious and impossible to articulate.

**What data is needed:** Guest perception feedback, press mentions, social media engagement, what types of guests are sharing content, what guests say about the venue when they recommend it to friends.

**Weak signals that matter:**
- Guests are describing the venue differently than the venue describes itself (misalignment between stated and perceived brand)
- A specific visual element or dish is generating all the social sharing, but it's not the element the team is most proud of
- Press coverage is focusing on one aspect of the venue that the team considers secondary

**What AI should only warn about:** Brand drift detected through language analysis of guest reviews. Content performance gaps between what the venue posts and what guests share.

**What should be remembered:** Every brand decision with the rationale. So that three years later the venue can trace back how it became what it is.

---

### Crisis Decisions

**What decisions exist:** How to respond to a food safety incident. How to handle a guest injury. How to manage a viral negative review. How to respond to a staff walkout before service. How to handle a supplier failure on a busy night. How to respond to a public health event affecting the venue.

**Who usually makes them:** Owner or GM immediately. With legal and PR input for anything that escalates beyond the venue.

**Critical principle:** Crisis decisions made well become stories of how the team handled adversity. Crisis decisions made badly become the permanent reputation of the venue. The goal is not to minimize damage — it is to do the right thing in a way that the team, the guests, and the public can respect.

**Reference model (Ritz-Carlton):** Every Ritz-Carlton employee knows they have authority to spend up to $2,000 to resolve a guest problem without management approval. This is not a policy — it is a culture signal. It says: we trust you, and we trust the guest.

**Reference model (Will Guidara):** At Eleven Madison Park, the "unreasonable hospitality" principle was the pre-crisis crisis plan. Because the team had been trained to surprise and delight at every turn, when something went wrong, they had both the instinct and the permission to recover in an extraordinary way.

**What data is needed:** Incident record, guest identity and history, operational log, current staffing availability, any prior incidents of a similar type.

**What AI can recommend:** Decision tree for common crisis types. Contact list for escalation. Prior incident records for the same issue type.

**What AI should only warn about:** A pattern of similar incidents that suggests a structural problem, not a one-off.

**What should be remembered:** Every crisis, what was decided, by whom, what the outcome was, and what the follow-up protocol was.

---

### Employee Decisions

**What decisions exist:** Hiring. Onboarding. Coaching. Rewarding. Promoting. Correcting. Separating. Creating a culture where people want to stay and grow.

**Critical principle (Danny Meyer, USHG):** Meyer's "hospitality quotient" identifies that technical skills can be trained but emotional intelligence cannot be reliably trained after a certain age. Hiring decisions should optimize for emotional skills first and technical skills second. Most hospitality operators do the opposite.

**Reference model (Aman Resorts):** Aman's staff-to-guest ratio approaches 3:1 at some properties. This is not luxury waste — it is a decision that the experience depends on depth of attention, not efficiency of service. The hiring decision is the experience decision.

**What data is needed:** Performance history, training completion, incident attribution, check average trends, peer feedback (informal), guest mentions.

**What AI can recommend:** Training path recommendations based on identified skill gaps. Scheduling optimization that accounts for staff development goals (pairing a developing bartender with a senior one).

**What AI should only warn about:** Performance trend deterioration over multiple periods. Training completion gaps for required certifications.

**What AI should never automate:** Any decision about a person's role, status, or employment.

**What should be remembered:** Every hire, every promotion, every training milestone, every meaningful performance conversation.

---

### Growth Decisions

**What decisions exist:** Whether to open a second location. Whether to add a new revenue stream (events, catering, wholesale, retail). Whether to franchise or license. Whether to raise investment. Whether to expand the physical space.

**Who usually makes them:** Founder, with F&B director and GM input.

**Critical principle:** Most growth decisions fail in hospitality not because the concept doesn't translate but because the culture doesn't. A venue's second location is not a replication problem — it is a culture transmission problem.

**What AI can recommend:** Financial modeling for growth scenarios. Operational capacity analysis. Sensitivity to key personnel risk in expansion.

**What AI should only warn about:** Concentration risk (if the venue's success is dependent on one or two key people who haven't committed to the expansion). Operational readiness gaps.

**What should be remembered:** The rationale for every growth decision. The hypothesis about what would make it succeed. The actual outcome.

---

### Repositioning Decisions

**What decisions exist:** Whether the current concept needs to change. How to change without losing what made the venue successful. How to communicate a change to existing guests. Whether to close temporarily for a repositioning. How to bring staff on the journey.

**Critical principle:** Repositioning fails when it is driven by financial panic rather than honest diagnosis. A venue that is declining because its concept no longer fits the market needs a different intervention than a venue that is declining because its execution has deteriorated. These are often confused.

**What AI should do here:** Provide honest historical analysis. Surface the pattern of when the decline began and what preceded it. Distinguish between execution-based decline and concept-based decline through data.

**What should be remembered:** The repositioning decision, the diagnosis it was based on, and the outcome.

---

## Part 4: How Great Operators Make Decisions Differently

### Four Seasons / Ritz-Carlton: The System That Enables Judgment

**Observed approach:** Both Four Seasons and Ritz-Carlton are often misunderstood as policy-heavy institutions. They are actually the opposite. Their systems exist to give frontline staff the *confidence* to use judgment.

The Ritz-Carlton "Gold Standards" — the Credo, the Motto, the Three Steps of Service, the 12 Service Values, the 6th Diamond — are not rules. They are a decision architecture. A Ritz-Carlton employee who encounters a situation not covered by any procedure knows exactly what the answer looks like because they know what the brand feels like.

**Decision-making insight for HESTIA:** The most powerful thing a hospitality operating system can do is not automate more decisions — it is ensure that the people making decisions know exactly what the organization values, in the moment when it matters.

*Application: HESTIA's Service Culture module and Academy are more strategically important than any analytics dashboard.*

---

### Danny Meyer / USHG: The Emotional Architecture of Hospitality

**Observed approach:** Meyer's framework from "Setting the Table" establishes a priority hierarchy: Employees, then Guests, then Community, then Suppliers, then Investors. This is not a mission statement — it is a decision algorithm. When a decision involves a tension between guest satisfaction and employee dignity, the algorithm says: protect the employee first.

This produces counterintuitive decisions: a manager who comps a table because a guest was rude to a server, rather than rewarding the rude behavior with appeasement.

**Decision-making insight for HESTIA:** Great hospitality decisions are not just about optimizing for guest satisfaction. They are about maintaining the integrity of the system — which means protecting the culture that produces great guest experiences.

*Application: HESTIA's incident capture and escalation system needs a way to flag guest behavior, not just staff performance. The system should remember difficult guests as clearly as it remembers loyal ones.*

---

### Will Guidara / Eleven Madison Park: The Pre-Decided Decision

**Observed approach:** Guidara's "unreasonable hospitality" is often misread as improvisation. It is actually hyper-prepared improvisation. EMP's team ran what they called "tours" — detailed reconnaissance of every table during service, building guest profiles in real time, sharing information across the floor.

The famous hot dog story (Guidara runs outside in the rain to buy a New York hot dog for a table of European guests spending their last night in the city) was not a spontaneous act. It was the output of a culture where every person had been trained to find the moment that would make this particular guest's evening unforgettable, and had been given the permission and the means to act on it.

**Decision-making insight for HESTIA:** The pre-shift VIP briefing, the guest profile, and the permission structure for floor staff are not features — they are the foundation of this kind of service. What made EMP great was not data. It was that the data created shared awareness, and the culture created permission to act.

*Application: HESTIA's guest intelligence and VIP briefing features are preparing the conditions for Guidara-style decisions. The platform's job is to make the team's shared awareness as high as possible before the shift begins.*

---

### Aman Resorts: The Designed Absence of Policy

**Observed approach (hypothesis, not fully evidenced):** Aman does not run on procedure in the way that a Marriott or a Hilton does. The experience is intimate precisely because the staff are empowered to treat each guest as an individual, not as a category.

What this requires is a staff selection process so rigorous and a culture so thoroughly internalized that policy is redundant. The decision architecture at Aman is: hire someone who already understands what this means, and then give them the environment to express it.

**Decision-making insight for HESTIA:** Not all venues can operate like Aman. But every premium venue should ask: which decisions are we over-systematizing because we don't trust our team? And which decisions are we under-systematizing because we haven't given our team a framework?

---

### The Connaught Bar / Claridge's: Institutional Memory as Competitive Advantage

**Observed approach:** The Connaught Bar under Agostino Perrone has become one of the world's great bar programs not because it is innovative (it is) but because it has depth. The Martini trolley is a theatrical memory system — it remembers what you like and makes the ritual of remembering visible and beautiful.

Claridge's carries guest notes that span decades. The competitive advantage is not the Art Deco decor or the Champagne list. It is that you cannot replicate 30 years of knowing who prefers what room and who always orders what aperitif.

**Decision-making insight for HESTIA:** The most defensible asset in premium hospitality is not the menu or the design. It is the accumulated knowledge of the guest, expressed through consistent, personalized service. HESTIA's memory layer — guest profiles, historical notes, behavioral patterns — is the digital version of what Claridge's does with paper.

---

### Disney Hospitality: The Experience Is the System

**Observed approach:** Disney's hospitality model is built on one insight: the guest's experience is the aggregate of thousands of small correct decisions made by people who are "on stage." Every decision — from cast member body language to the color of the trash cans in the park — is a deliberate choice.

Disney's pre-shift briefing model (the park-wide cast member alignment before opening) is a daily culture reinforcement ritual, not an information transfer.

**Decision-making insight for HESTIA:** Daily briefings are not about information. They are about alignment. The information is the mechanism. The alignment is the outcome.

---

### Steve Wynn: The Physical Environment as a Decision

**Observed approach (evidenced):** Wynn walked his properties personally and regularly. He made decisions about furniture placement, lighting temperature, and carpet patterns that would never appear in a management meeting because they were treated as aesthetic preferences, not operational decisions.

But they were operational decisions. The environment in which service happens determines the ceiling of the service experience. A beautiful guest dining room tells the team that the ownership cares. That signal — that somebody is paying attention — is the invisible input to thousands of small service decisions made every hour.

**Decision-making insight for HESTIA:** Physical environment decisions are hospitality decisions. HESTIA should support the documentation of design and atmosphere intentions alongside operational data — so that new managers inherit not just the procedures but the sensibility.

---

## Part 5: How Decisions Change by Venue Lifecycle

### Pre-Opening

Every decision is a hypothesis. Nothing is confirmed. The founding documents (concept, menu, service standards) are not operations — they are untested beliefs.

**Critical pre-opening decisions that are commonly made too late:**
- Finalization of service standards before staff hire (most venues train standards after hiring, making it reactive)
- Par levels and supplier relationships before the first service
- Reservation strategy and pacing before the first week of service
- VIP and press strategy before the opening night

**What HESTIA can do here:** Pre-operational data seeding. The concept brief. The service standards document. The initial menu and beverage program. All the things that should be decided before Day 1 so that Day 1 is not chaos.

---

### Launch (First 30 Days)

Every signal is noise until it becomes a pattern. The launch period produces a flood of data that is genuinely ambiguous.

**Critical mistakes made in this phase:**
- Making permanent decisions based on launch-period data (first two weeks are not representative)
- Over-correcting on negative early feedback before patterns are clear
- Under-correcting on operational failures because the team is tired and overwhelmed
- Not capturing what happened before it's forgotten

**What HESTIA can do here:** Systematic incident capture. Daily briefing consistency. Carry-forward discipline. Pattern detection that requires a minimum data threshold before flagging trends.

---

### First 90 Days (Learning Phase)

The critical window for product-market fit verification. By Day 90, most venues know whether their concept is working. The operators who succeed in this period are usually the ones who listen more carefully and move faster on evidence.

**Critical decisions in this phase:**
- Which menu items are outperforming expectation (protect and amplify)
- Which items are consistently underperforming (address before guests form opinions)
- Which staff are performing above their role and which are dragging the team
- What the cover pattern actually looks like vs. what was planned

**What HESTIA can do here:** First trend signals. Item performance comparison. Staff reliability patterns. Cover count vs. projection.

---

### Growth Phase

The decisions that were instinctual in the early days need to become systematic. This is where most hospitality operations leak.

**The growth phase decision trap:** Operators who succeed in the launch phase often succeed because of the founder's personal presence and judgment. In the growth phase, they try to scale the outcome (more covers, more revenue) without scaling the system (the processes that produce the outcome). The result is inconsistency.

**What HESTIA can do here:** Systematize what was instinctual. Capture the standards. Build the checklists. Create training from what the best team members actually do.

---

### Maturity Phase

The hardest decisions are: what to preserve, what to evolve, and how to stay relevant without losing what made the venue great.

**Decision traps in maturity:**
- Confusing loyalty with retention (regulars who have stopped being surprised but haven't left yet)
- Protecting underperforming menu items because they have history
- Avoiding staff conversations because the team has been together for years

**What HESTIA can do here:** Pattern drift detection. Guest return frequency analysis. Staff performance trends over multi-year windows.

---

### Decline Phase

The most dangerous phase for decision-making because the signals are ambiguous and the emotional stakes are very high.

**The decline decision question that matters most:** Is this venue declining because the concept is no longer right, or because the execution has deteriorated? These require completely different responses. Execution problems can be fixed. Concept misalignment requires repositioning.

**What HESTIA can do here:** Historical data integrity. Honest trend analysis. Distinguish between metric decline in specific areas (execution) vs. systemic decline across all indicators (concept).

---

## Part 6: AI Role Architecture

### Decisions AI Should Proactively Recommend

These are decisions where the cost of delay is high, the pattern is clear, the data is sufficient, and the human expert's judgment is not structurally required for the core recommendation (only for final approval).

- Prep quantities for tonight based on booking density and historical patterns
- Reorder timing and quantity for high-velocity products
- Schedule optimization based on historical revenue pattern and confirmed bookings
- Allergen conflict alerts based on reservation notes vs. menu items
- VIP briefing assembly from historical guest notes
- Menu engineering matrix (Stars, Puzzles, Plowhorses, Dogs) with confidence labels
- Labor cost projection for next week based on scheduled hours vs. historical revenue
- Incident classification for triage (severity level, type)
- Carry-forward item prioritization for next shift

---

### Decisions AI Should Only Flag and Never Recommend

These are decisions where the data can be surface-visible but the right answer depends on human judgment, context, or relationship nuance that AI cannot assess.

- Whether to have a performance conversation with a specific staff member
- Whether a guest who complained is likely to return
- Whether a supplier relationship should be terminated
- Whether a menu item should be removed (AI can show the data; the chef must decide)
- Whether a price increase is right given the current guest relationship
- Whether a pattern of comps indicates a product problem or a staff problem
- Whether a staff member should be promoted

---

### Decisions AI Should Never Touch

These decisions belong entirely to humans. Not because AI couldn't technically generate a recommendation, but because the act of automating them would damage the cultural and relational fabric that makes hospitality work.

- Firing or separating any team member
- Any guest-facing communication without a human reviewing it
- Service recovery decisions in the moment (these require empathy that must be human)
- Pricing strategy (data support yes, decision no)
- Concept or identity decisions
- Hiring decisions
- Decisions about how to handle a guest who has behaved abusively toward staff
- Any decision where being wrong damages a person's dignity

---

## Part 7: HESTIA Decision Intelligence Model

This is the operational schema for how HESTIA understands, tracks, and supports decisions. Each dimension is a data field — or should become one.

### Decision Intelligence Schema

```
DECISION
├── id                          — unique identifier
├── decision_type               — operational / tactical / strategic / cultural / crisis
├── domain                      — menu / beverage / staffing / guest / event / pricing /
│                                  supplier / brand / growth / repositioning
├── decision_owner              — staff / manager / F&B_director / owner / founder
├── decision_frequency          — shift / daily / weekly / monthly / quarterly / annual / ad_hoc
├── required_inputs             — [list of data sources needed before deciding]
├── weak_signals                — [list of early warning patterns that precede this decision]
├── risk_level                  — low / medium / high / critical
├── confidence_level            — high / medium / low / insufficient_data
├── ai_role                     — recommend / flag_only / never
├── human_approval_required     — none / manager / owner / founder
├── memory_impact               — ephemeral / shift_record / operational_memory / institutional
├── follow_up_review_date       — [date or interval]
├── success_evaluation          — [how will we know if this decision was right?]
└── actual_outcome              — [filled in retrospectively]
```

---

### Core Decision Templates

**TEMPLATE 1: Menu Item Removal**

| Field | Value |
|---|---|
| Decision type | Tactical |
| Domain | Menu / F&B |
| Decision owner | Bar manager or Chef (recommendation), F&B Director / Owner (approval) |
| Frequency | Monthly (scheduled), Ad hoc (triggered) |
| Required inputs | Item velocity last 30 days, Margin, Waste rate, Comp rate, Staff sentiment (can they execute it well?), Guest mentions |
| Weak signals | Staff apologizing for the item. Item comped more than sold. Prep waste above 30%. Item never mentioned positively in guest feedback. |
| Risk level | Medium |
| Confidence level | High (if full data present) |
| AI role | Recommend (show matrix and flag threshold breach), then flag for human decision |
| Human approval required | Manager minimum; owner if the item is a signature |
| Memory impact | Operational memory — date removed, reason, replacement |
| Follow-up review date | 30 days post-removal (did covers change? did related complaints change?) |
| Success evaluation | No meaningful cover decline. Staff less stressed. Waste reduced. |

---

**TEMPLATE 2: Staff Scheduling Decision**

| Field | Value |
|---|---|
| Decision type | Operational/Tactical |
| Domain | Staffing |
| Decision owner | Manager |
| Frequency | Weekly (planning), Daily (adjustment) |
| Required inputs | Next week's cover forecast, Confirmed bookings, Staff availability, Training status, Last week's performance incidents |
| Weak signals | Same position short-staffed two weeks in a row. A new hire scheduled alone without a senior partner. A staff member with an unresolved performance flag being scheduled for a high-visibility shift. |
| Risk level | Medium |
| Confidence level | High (scheduling logic) / Low (performance prediction) |
| AI role | Recommend schedule. Flag risk positions. Never decide who to terminate or discipline. |
| Human approval required | Manager |
| Memory impact | Shift record — who worked, what happened |
| Follow-up review date | After the shift |
| Success evaluation | No critical gaps. No unexpected staff incidents. Revenue per labor hour within target. |

---

**TEMPLATE 3: Guest Recovery Decision**

| Field | Value |
|---|---|
| Decision type | Operational / Crisis |
| Domain | Guest Experience |
| Decision owner | Floor manager or senior staff (immediate), Owner (if escalation required) |
| Frequency | Ad hoc |
| Required inputs | Guest history, Nature of the failure, Stage of service, Guest emotional state, Available recovery options (comp, upgrade, gesture, visit from manager) |
| Weak signals | A server who mentions a table is "a bit unhappy" — this is always an early signal. A table that hasn't ordered a second round when all nearby tables have. A guest who has been looking for a staff member and not been approached. |
| Risk level | High (a mishandled recovery creates lasting reputation damage) |
| Confidence level | Low (context-dependent; AI cannot assess) |
| AI role | Flag: guest history retrieved and shown. Suggest recovery options based on type of failure. Never decide. |
| Human approval required | Manager (minimum for any comp above threshold) |
| Memory impact | Institutional memory — what happened, what the recovery was, whether the guest returned |
| Follow-up review date | Next visit (was the relationship preserved?) |
| Success evaluation | Guest returns. Guest mentions recovery positively. |

---

**TEMPLATE 4: Pricing Adjustment Decision**

| Field | Value |
|---|---|
| Decision type | Tactical / Strategic |
| Domain | Pricing |
| Decision owner | Owner / F&B Director |
| Frequency | Quarterly minimum, ad hoc on trigger |
| Required inputs | Full COGS current vs. previous period, Cover count trend, Revenue per cover trend, Competitor pricing (where known), Staff feedback on guest price sensitivity signals |
| Weak signals | Three consecutive months of COGS above target. Staff reporting that guests are consistently skipping one course. A competitor has raised prices and not lost covers. |
| Risk level | High |
| Confidence level | Medium (cost modeling is reliable; guest sensitivity prediction is uncertain) |
| AI role | Model cost scenarios. Show revenue impact projections. Flag when COGS threshold breach is structural. Never recommend specific price points. |
| Human approval required | Owner |
| Memory impact | Institutional — date, amount, rationale, and 90-day outcome |
| Follow-up review date | 90 days |
| Success evaluation | COGS returns to target. Revenue per cover stable or improved. No meaningful cover decline attributable to pricing. |

---

**TEMPLATE 5: Supplier Change Decision**

| Field | Value |
|---|---|
| Decision type | Tactical |
| Domain | Supplier |
| Decision owner | Bar manager or Kitchen manager (recommendation), F&B Director / Owner (final) |
| Frequency | Ad hoc (triggered by performance threshold) |
| Required inputs | Fill rate history, Price variance, Delivery accuracy, Quality consistency, Available alternatives, Relationship length and strategic value |
| Weak signals | Two consecutive delivery issues. A price increase without conversation. A substitution that affected guest experience. |
| Risk level | Medium |
| Confidence level | Medium |
| AI role | Surface fill rate and price history. Flag threshold breaches. List available alternatives. Never recommend changing a relationship without human evaluation. |
| Human approval required | F&B Director or Owner (for strategic supplier relationships) |
| Memory impact | Institutional — every supplier change, the reason, and the outcome |
| Follow-up review date | 60 days after change |
| Success evaluation | Fill rate improved. Price position improved or neutral. Product quality maintained. |

---

**TEMPLATE 6: Event Acceptance Decision**

| Field | Value |
|---|---|
| Decision type | Tactical / Strategic |
| Domain | Events |
| Decision owner | Events manager (intake), F&B Director (approval), Owner (final on large or complex events) |
| Frequency | Ad hoc |
| Required inputs | Available date, Staffing capacity, Menu feasibility, Guest count, Budget and pricing, Historical profitability for similar event types, Operational load on adjacent dates |
| Weak signals | A date already at high venue utilization. A guest count that has changed multiple times during negotiation. An event type the venue has failed on before (undocumented). |
| Risk level | Medium–High |
| Confidence level | Medium |
| AI role | Check calendar conflicts. Model staffing needs. Surface historical profitability for similar events. Never approve or decline independently. |
| Human approval required | Owner or F&B Director |
| Memory impact | Operational + Institutional — every event, its actual performance vs. projected, and operational notes |
| Follow-up review date | Post-event debrief |
| Success evaluation | Event profitability at or above projection. No operational failures. Guest and client satisfaction confirmed. |

---

**TEMPLATE 7: Strategic Concept Decision**

| Field | Value |
|---|---|
| Decision type | Strategic / Cultural |
| Domain | Brand / Repositioning |
| Decision owner | Founder |
| Frequency | Annual minimum, ad hoc on trigger |
| Required inputs | 12-month operational trend (all domains), Guest demographic and perception data, Competitive context, Staff capability assessment, Capital position |
| Weak signals | Three consecutive months of cover decline that doesn't respond to tactical intervention. Staff who are no longer proud to tell people where they work. A founder who is no longer exd to visit the venue. Guest feedback that is positive but no longer enthusiastic. |
| Risk level | Critical |
| Confidence level | Low (AI cannot predict concept success) |
| AI role | Surface historical trend data. Distinguish execution-based decline from concept-based decline. Model financial scenarios for repositioning options. Never recommend the direction. |
| Human approval required | Founder — non-delegable |
| Memory impact | Institutional — the single most important thing HESTIA should remember |
| Follow-up review date | 6 months, 12 months |
| Success evaluation | Defined in advance by the founder before the decision is made. |

---

## Part 8: What HESTIA Should Ultimately Remember

The Decision Intelligence Layer is only as valuable as what it remembers. Memory is the moat. Not the algorithms, not the interface — the accumulated record of what was decided, what happened, and what was learned.

**HESTIA should remember:**

1. Every shift, what happened, what didn't happen, and what carried forward.
2. Every menu item from the day it was added to the day it was removed, with velocity, margin, and the reason for removal.
3. Every guest, what they care about, what went wrong, what recovered them, whether they returned.
4. Every staff member's professional journey through the venue — hire, training, growth, milestones, departure.
5. Every supplier issue and every supplier change.
6. Every pricing decision and its 90-day aftermath.
7. Every event, its projected and actual performance, and what the team learned.
8. Every crisis decision, what was decided, what the outcome was.
9. Every strategic and founder-level decision, with the stated rationale, so that years later the logic can be evaluated.
10. Every weak signal that preceded a problem — so the next time it appears, the system can recognize it earlier.

**The architecture principle:**

Memory is not a database of facts. It is a record of causation — what happened, why, who decided, what changed, and whether it worked. HESTIA's memory layer should be designed not just for retrieval but for pattern recognition: connecting what is happening now to what happened before under similar conditions.

This is what no other hospitality software does. This is the moat.

---

## Closing: The Question HESTIA Is Really Answering

The research question underlying all of this is: *"What is the most valuable layer of hospitality expertise that current software fails to capture, preserve, compound, or distribute?"*

Based on this framework, the answer — still a **hypothesis** — is:

**It is the decision record: the accumulated, structured memory of what was decided, why, by whom, and what happened as a result.**

This is not a report. It is not an insight. It is not a dashboard.

It is the institutional knowledge that currently lives in the heads of the people who run the venue — and leaves with them when they go.

HESTIA's job is to make that knowledge stay.

---

*Document status: Research-grade hypothesis. No claim in this document should be treated as confirmed operational fact until validated against real venue behavior. All operator references are based on publicly documented practices and operator accounts — not primary interviews.*

*Place in: `docs/intelligence/HESTIA_VENUE_DECISION_INTELLIGENCE_FRAMEWORK.md` upon validation.*
