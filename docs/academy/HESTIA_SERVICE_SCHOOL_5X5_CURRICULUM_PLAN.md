# HESTIA Service School — 5×5 Curriculum Plan

**Status:** Planning Phase — Not Yet Implemented  
**Date:** 2026-06-06  
**Phase:** Pre-Phase 11B  
**Classification:** Product + Curriculum Decision Document

---

## 1. Executive Summary

HESTIA Courses is being redesigned from a general LMS into a focused, premium **Service School** — a cinematic, editorial-quality learning environment for front-of-house hospitality professionals.

The current system has 10 academies with 100 lessons. Most are structurally sound, but no employee can meaningfully engage with 100 lessons while working shifts. The experience lacks visual identity, editorial ambition, and a clear product philosophy.

This document defines the **5×5 curriculum**: five flagship academies, five flagship lessons each. Twenty-five total lessons that are real, practical, cinematic, and suitable for real video production.

Bar Academy belongs inside **Bar World**.  
Wine Academy belongs inside **Wine Atlas**.  
Employee Courses becomes **HESTIA Service School** — focused entirely on general hospitality excellence.

---

## 2. Product Philosophy

> Guests are not customers. Guests are people we host.

HESTIA Service School teaches employees not what to do, but **who to be** during service.

Every lesson is built around a moment that actually happens during a shift — a guest arriving, a table waiting, a complaint arriving, a farewell. Employees must be able to watch a lesson, recognize the scenario from their own work, and apply it within the next shift.

**This is not training. This is professional formation.**

The school should feel like the orientation at a Michelin-starred restaurant — warm, precise, personal, and deeply serious about hospitality. Not compliance. Not HR. Not a checklist.

---

## 3. Why HESTIA Service School Should Replace HESTIA University

"HESTIA University" communicates:
- Academic setting
- Long commitment
- Generic certification
- Distance from real work

"HESTIA Service School" communicates:
- Craft mastery
- Practical focus
- Professional pride
- Connection to the floor

The existing academy infrastructure (lesson player, progress tracking, sequential unlock, voice/video modes) is excellent. The content and identity need to match that ambition.

The rename is visual and copy-level only in Phase 11B. No routing, no progress keys, no data schemas change.

---

## 4. What Courses Should Become

- A premium editorial school environment, visually aligned with Bar World and Wine Atlas
- Five focused academies covering the non-bar, non-wine dimensions of hospitality excellence
- Five flagship lessons per academy — carefully chosen, real, practical, and video-ready
- A space employees actually want to open before service

---

## 5. What Courses Should Not Include

- Bar Academy content (belongs in Bar World)
- Wine Academy content (belongs in Wine Atlas)
- Manager-only academies (manager-academy, train-the-trainer remain on separate access paths)
- Generic HR training tone
- Fake progress metrics or invented completion data
- Generic gamified UI
- Lesson lists employees cannot realistically complete

---

## 6. Final Five Academies for HESTIA Service School

| # | Academy Name | Academy ID (existing) | Focus |
|---|---|---|---|
| 1 | Service Academy | `service-academy` | Floor service excellence, sequence, recovery |
| 2 | Arrival & Host Academy | `hostess-academy` | First contact, seating, handoff |
| 3 | Coffee Program | `coffee-program` | Hospitality coffee, barista intelligence |
| 4 | Culinary Intelligence | `culinary-intelligence` | Menu fluency, allergens, FOH-BOH |
| 5 | Hospitality Ethics & Privacy | `ethics-privacy` | Guest dignity, responsible service, data |

**Excluded from employee-facing Courses:**
- `bar-academy` → Bar World / Academy tab
- `wine-academy` → Wine Atlas
- `manager-academy` → Manager-only path (separate from Service School)
- `event-academy` → Not in Service School MVP (revisit in Phase 12+)
- `train-the-trainer` → Manager/admin only

---

## 7. The 25 Flagship Lessons

### Research sources used in this curriculum design:
- `docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md`
- `docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_IMPLEMENTATION_PACKAGE.md`
- `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`
- `docs/archive/prototypes/academy-video-instructor/ACADEMY_STRUCTURE_AUDIT.md`
- `src/data/academy/serviceDoctrine.js` — Michelin-level service markers
- `src/data/academy/hospitalityPhilosophy.js` — HESTIA 5-pillar doctrine
- `src/data/academy/coffeeDoctrine.js`, `culinaryDoctrine.js`, `ethicsDoctrine.js`

**Research source not found in repo:** MasterClass UX/design research — user should attach/paste before Phase 11C implementation.  
**Research source not found in repo:** 50 Best / Michelin editorial design analysis — user should attach/paste before Phase 11C implementation.  
**Research source not found in repo:** WSET audit (wine scope — not needed here, but note for Wine Atlas planning).

---

### Academy 1: Service Academy

**Academy ID:** `service-academy`  
**Instructor Persona:** Mira — Floor Director, Michelin Service Trainer  
**Palette:** Palette B (Editorial Light) — warm linen, soft rose accent  
**Emotional premise:** You are hosting a person. Every gesture, pause, and movement communicates.

---

#### Lesson SA-1 — The First 30 Seconds

| Field | Content |
|---|---|
| **Academy** | Service Academy |
| **Existing lesson ID** | `service-001` |
| **Proposed display ID** | SA-1 |
| **Title** | The First 30 Seconds |
| **Purpose** | Teach the kinetic greeting ritual — the physical and verbal protocol that sets a guest's entire experience. |
| **After this lesson, the employee can:** | Execute a confident, warm, non-robotic arrival greeting within 30 seconds of guest entry, adapting tone to solo, couple, or group arrival. |
| **Key topics** | Eye contact timing; movement toward the guest (not waiting); opening line construction; body language; guest categorization in 3 seconds |
| **Hospitality scenario** | A couple enters during a busy Friday service. The host is occupied. Three staff members see them arrive but continue their work. The couple waits 90 seconds before anyone acknowledges them — the damage is already done. |
| **Drill / simulation** | Roleplay: employee at the pass, colleague enters as a "guest." 10-second rule: acknowledge before the door closes. Variations: solo guest, large group, guest with visible hesitation. |
| **Common mistake this prevents** | The "I'll be right with you" freeze — staff see the guest, internally log it, but don't physically move or make eye contact |
| **Recommended instructor** | Mira (Service) |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `service-001` (First 30 Seconds and Kinetic Greeting Protocol) — existing lesson, very strong foundation, retain fully |
| **What to remove / avoid** | Do not mention scripts or robotic phrases; avoid making the lesson feel like a checklist drill |
| **Video status** | `video_ready` — Synthesia embed already exists (`service-001` mapped in `academyInstructorVideoMap.js`) |

---

#### Lesson SA-2 — Reading the Table

| Field | Content |
|---|---|
| **Academy** | Service Academy |
| **Existing lesson ID** | `service-005` |
| **Proposed display ID** | SA-2 |
| **Title** | Reading the Table |
| **Purpose** | Train emotional intelligence — learning to read guest state (energy, mood, occasion, dynamic) without asking and without guessing. |
| **After this lesson, the employee can:** | Identify four guest archetypes (business, celebration, intimate, family) and adapt service pacing, tone, and visibility accordingly without being asked. |
| **Key topics** | Guest archetype reading; occasion recognition; pacing by energy level; adapting language register; anticipatory behavior |
| **Hospitality scenario** | A couple sits down. One partner is quiet, the other orders quickly. Standard service continues at a brisk pace. Midway through the meal, the server overhears: "It's actually our anniversary." The moment was missed in the first 90 seconds. |
| **Drill / simulation** | Three table scenarios presented (business lunch / anniversary dinner / family with young children). Employee identifies archetype from visual cues only. Discuss: what changes about your service for each? |
| **Common mistake this prevents** | One-speed service — treating every table with identical pacing and formality regardless of who is actually sitting there |
| **Recommended instructor** | Mira (Service) |
| **Estimated video length** | 7–8 minutes |
| **Source lesson to reuse** | `service-005` (Guest Reading, Emotional Intelligence, and Anticipation) — strong content, reduce scope to guest-reading only |
| **What to remove / avoid** | Do not include upselling in this lesson; this is observation, not commercial |
| **Video status** | `needs_script` |

---

#### Lesson SA-3 — The Art of Silence

| Field | Content |
|---|---|
| **Academy** | Service Academy |
| **Existing lesson ID** | `service-003` |
| **Proposed display ID** | SA-3 |
| **Title** | The Art of Silence |
| **Purpose** | Teach physical discipline — spatial awareness, body language management, and the practice of being present without being intrusive. |
| **After this lesson, the employee can:** | Maintain correct floor positioning, visible but not hovering; execute invisible service (clearing, pouring, table maintenance) without interrupting guest flow. |
| **Key topics** | Spatial zones (inside the table vs. peripheral); posture and stillness; the pour-without-interruption; clearing rhythm; the "ghost" service standard at Michelin-level |
| **Hospitality scenario** | A table is in deep conversation. The main course is ready. A server approaches directly, stands beside the table waiting to speak. The conversation stops. The guest says "sorry, yes?" The intrusion has already happened. |
| **Drill / simulation** | Silent service practice: without speaking, clear a mock table set for dessert while two colleagues roleplay conversation. No interruption threshold. |
| **Common mistake this prevents** | The verbal interrupt — addressing a table at the wrong moment because the server needs to complete a task, not because the guest has opened space |
| **Recommended instructor** | Mira (Service) |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `service-003` (Body Language, Spatial Awareness, and Silent Service) — reuse fully |
| **What to remove / avoid** | Avoid making this abstract; anchor every principle to a physical action |
| **Video status** | `needs_script` |

---

#### Lesson SA-4 — Recovery That Rebuilds

| Field | Content |
|---|---|
| **Academy** | Service Academy |
| **Existing lesson ID** | `service-008` |
| **Proposed display ID** | SA-4 |
| **Title** | Recovery That Rebuilds |
| **Purpose** | Teach the Acknowledge-Own-Act-Follow-Up complaint recovery framework, making service failures into loyalty moments. |
| **After this lesson, the employee can:** | Handle a guest complaint without defensiveness, escalating correctly, and closing the recovery so the guest leaves with a higher impression than before the failure. |
| **Key topics** | Acknowledge (say what happened); Own (no blame-shifting); Act (concrete fix, not apology loops); Follow-Up (return to the table after resolution); manager escalation threshold |
| **Hospitality scenario** | A steak arrives overcooked. The guest mentions it quietly, without drama. The server says "I'll let the kitchen know" and disappears. Twelve minutes pass. The steak returns replaced but the server does not check back. The guest does not complain again — and never returns. |
| **Drill / simulation** | Live roleplay: employee practices the four-step recovery framework on three complaint types (wrong dish, long wait, rude staff comment). Timer: each step must occur within defined seconds. |
| **Common mistake this prevents** | The apology loop — staff who say sorry repeatedly but take no concrete action, leaving the guest with nothing resolved |
| **Recommended instructor** | Mira (Service) |
| **Estimated video length** | 7–9 minutes |
| **Source lesson to reuse** | `service-008` (Complaint Recovery: Acknowledge, Own, Act, Follow Up) — strong existing lesson, reuse |
| **What to remove / avoid** | Avoid compensation discussion in base lesson (that belongs in manager track); focus on the four steps only |
| **Video status** | `needs_script` |

---

#### Lesson SA-5 — The Last 30 Seconds

| Field | Content |
|---|---|
| **Academy** | Service Academy |
| **Existing lesson ID** | `service-010` |
| **Proposed display ID** | SA-5 |
| **Title** | The Last 30 Seconds |
| **Purpose** | Teach the farewell ritual — the final touchpoint that determines whether a guest intends to return. |
| **After this lesson, the employee can:** | Execute a warm, specific, non-generic farewell that leaves the guest with a named memory of the evening and a reason to return. |
| **Key topics** | The farewell window (before coat, not at door); specificity in farewell language ("I hope the birthday dinner was everything you wanted"); avoiding robotic goodbyes ("Have a nice evening"); return intention planting; handoff to host if applicable |
| **Hospitality scenario** | A table celebrates a birthday. Beautiful meal. Staff remember the occasion. The farewell: "Goodnight, thanks for coming." The guest leaves feeling processed, not hosted. |
| **Drill / simulation** | Write a farewell script for three table scenarios (business dinner, birthday, first-time visitor from abroad). Peer review: does it feel generic or personal? |
| **Common mistake this prevents** | The transactional exit — staff who treat the farewell as operational (here is your coat, goodnight) rather than as the most memorable 30 seconds of the meal |
| **Recommended instructor** | Mira (Service) |
| **Estimated video length** | 5–6 minutes |
| **Source lesson to reuse** | `service-010` (Farewell Rituals and Return Intention) — reuse, tighten scope |
| **What to remove / avoid** | Do not make this a loyalty program lesson; pure hosting craft only |
| **Video status** | `needs_script` |

---

**Service Academy — lessons archived/hidden (not deleted):**  
`service-002`, `service-004`, `service-006`, `service-007`, `service-009`  
*(All retain their progress keys; not deleted; accessible via a future "Full curriculum" toggle)*

---

### Academy 2: Arrival & Host Academy

**Academy ID:** `hostess-academy`  
**Display name:** Arrival & Host Academy *(rename in UI copy only — ID unchanged)*  
**Instructor Persona:** Noa — Guest Flow and Reservations Director  
*(Note: per `HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`, Noa is listed as Events persona. For this academy, the persona should be the "host/front door authority" — either Noa or a dedicated Host persona TBD in Phase 11E.)*  
**Emotional premise:** The door is not an entrance. It is where the experience begins or fails.

---

#### Lesson HA-1 — Front Door Authority

| Field | Content |
|---|---|
| **Academy** | Arrival & Host Academy |
| **Existing lesson ID** | `host-001` |
| **Proposed display ID** | HA-1 |
| **Title** | Front Door Authority |
| **Purpose** | Establish the host as a calm, confident director of guest flow — not a greeter, not a gatekeeper, but a welcome professional. |
| **After this lesson, the employee can:** | Open a service with confidence, project warmth from first visual contact, and set the right tone within 5 seconds of a guest arriving at the door. |
| **Key topics** | Posture at the host stand; eye contact across distance; the pre-arrival scan; vocal tone and register; what "authority" looks like in hospitality (not severity) |
| **Hospitality scenario** | Friday evening. Two groups arrive simultaneously: a reservation and a walk-in. The host is checking the list. Neither group is acknowledged for 20 seconds. One party leaves. |
| **Drill / simulation** | Timed arrival drill: colleague plays host, two others enter simultaneously. Practice: acknowledge both within 5 seconds, then sequence them without either group feeling neglected. |
| **Common mistake this prevents** | Eyes-down hosting — host absorbed in the reservation list or phone while guests arrive without acknowledgment |
| **Recommended instructor** | Noa / Host persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `host-001` (First Impression and Front-Door Authority) — reuse fully |
| **What to remove / avoid** | Do not conflate with receptionist or check-in desk behavior; this is hospitality-specific |
| **Video status** | `needs_script` |

---

#### Lesson HA-2 — Seating the Room

| Field | Content |
|---|---|
| **Academy** | Arrival & Host Academy |
| **Existing lesson ID** | `host-003` |
| **Proposed display ID** | HA-2 |
| **Title** | Seating the Room |
| **Purpose** | Teach strategic seating — not just filling tables, but pacing the room to protect service quality and guest experience simultaneously. |
| **After this lesson, the employee can:** | Make seating decisions that balance guest preferences, table capacity, server load, and room pacing — without revealing the commercial logic behind each choice. |
| **Key topics** | Table turn awareness; server section balancing; seating by party type and occasion; VIP table positioning; the "best in the house" standard; when to delay seating and how to do it gracefully |
| **Hospitality scenario** | A reservation for two arrives early. The restaurant is half-empty. The host seats them at the smallest, worst-positioned table "because it's available." Ten minutes later, two large parties arrive and the host must seat them at the better tables. The couple feels the comparison. |
| **Drill / simulation** | Floor map exercise: given a half-full restaurant and four arriving parties with different profiles, assign seats and justify each decision aloud. |
| **Common mistake this prevents** | Random seating — filling the nearest empty table instead of making intentional choices about room flow and guest dignity |
| **Recommended instructor** | Noa / Host persona TBD |
| **Estimated video length** | 7–8 minutes |
| **Source lesson to reuse** | `host-003` (Seating Strategy and Table Pacing) — reuse, expand with room pacing |
| **What to remove / avoid** | Do not teach revenue optimization framing; always frame as guest-first |
| **Video status** | `needs_script` |

---

#### Lesson HA-3 — The Honest Wait

| Field | Content |
|---|---|
| **Academy** | Arrival & Host Academy |
| **Existing lesson ID** | `host-004` |
| **Proposed display ID** | HA-3 |
| **Title** | The Honest Wait |
| **Purpose** | Teach waitlist and delay communication as an act of hospitality — honest, calm, and guest-dignifying rather than evasive or robotic. |
| **After this lesson, the employee can:** | Give a wait time with honesty, manage a waiting guest's experience actively, and turn a delay into a positive signal of quality. |
| **Key topics** | Accurate vs. optimistic wait time language; proactive update protocol; making waiting feel intentional; offering drinks or a space at the bar; the walk-in who waited and felt hosted vs. managed |
| **Hospitality scenario** | A walk-in is told "about 15 minutes." 25 minutes pass. The host has not re-approached. The guest finally approaches the stand again. |
| **Drill / simulation** | Three wait scenarios: 10 min / 25 min / 45+ min. For each, write the opening line (honest wait declaration), the midpoint update (at what point?), and the seating moment (language when the table is ready). |
| **Common mistake this prevents** | The hope-based wait — giving an unrealistic time to prevent the guest from leaving, which creates a worse outcome when the time passes |
| **Recommended instructor** | Noa / Host persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `host-004` (Waitlist Psychology and Delay Communication) — reuse, tighten to honesty framework |
| **What to remove / avoid** | Do not include queue management software features; behavior-only lesson |
| **Video status** | `needs_script` |

---

#### Lesson HA-4 — VIP Recognition Without Labels

| Field | Content |
|---|---|
| **Academy** | Arrival & Host Academy |
| **Existing lesson ID** | `host-007` |
| **Proposed display ID** | HA-4 |
| **Title** | VIP Recognition Without Labels |
| **Purpose** | Teach discreet recognition of high-value or return guests — without making other guests feel less valued, and without exposing operational notes. |
| **After this lesson, the employee can:** | Recognize a VIP or return guest from reservation notes, acknowledge them personally without drama, and pass that context to the service team invisibly. |
| **Key topics** | Reading reservation notes before service; remembering guest names correctly and using them naturally (not performatively); the handoff note (passing context to the server without a visible card exchange); discretion with "regular" vs. first-time language |
| **Hospitality scenario** | A long-standing regular arrives. The host has their notes. "Welcome back, Mr. Cohen — your usual table is ready." Said loudly. Three other tables hear. The regular wanted quiet recognition, not a public announcement. |
| **Drill / simulation** | Note reading exercise: given three different guest profiles (high-profile regular, anniversary guest, first-timer with dietary notes), demonstrate how to use the note in a greeting without quoting it verbatim. |
| **Common mistake this prevents** | Performative recognition — making a show of knowing the guest in ways that feel theatrical rather than sincere |
| **Recommended instructor** | Noa / Host persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `host-007` (VIP Recognition and Discreet Preference Handling) — reuse fully |
| **What to remove / avoid** | Do not conflate with loyalty programs or CRM dashboards; hospitality behavior only |
| **Video status** | `needs_script` |

---

#### Lesson HA-5 — The Invisible Handoff

| Field | Content |
|---|---|
| **Academy** | Arrival & Host Academy |
| **Existing lesson ID** | `host-008` |
| **Proposed display ID** | HA-5 |
| **Title** | The Invisible Handoff |
| **Purpose** | Teach the transition from host to server as a seamless, invisible thread — so the guest never feels "transferred" between two systems. |
| **After this lesson, the employee can:** | Execute a handoff that passes guest context, occasion notes, and any special requests to the server without a visible operational exchange in front of the guest. |
| **Key topics** | The warm handoff phrase; what information to pass (occasion, preferences, sensitivities); the physical moment of transition; when to delay the handoff; what the server should have read before the guest sits down |
| **Hospitality scenario** | A birthday party of six is seated. The host knows it's a birthday but doesn't tell the server. The server takes the order without knowing. Nobody mentions the occasion until the cake conversation becomes awkward. |
| **Drill / simulation** | Two-person roleplay: host seats a "guest" (colleague), passes context to incoming "server" (another colleague) without the guest overhearing the operational details. Evaluate: was the handoff invisible? |
| **Common mistake this prevents** | The hard reset — a guest who felt welcomed by the host suddenly feels like a new table when the server appears with no context |
| **Recommended instructor** | Noa / Host persona TBD |
| **Estimated video length** | 5–6 minutes |
| **Source lesson to reuse** | `host-008` (Handoff to Service Team) — reuse, expand with note-passing protocol |
| **What to remove / avoid** | Do not make this a digital system tutorial; physical and verbal behavior only |
| **Video status** | `needs_script` |

---

**Arrival & Host Academy — lessons archived/hidden (not deleted):**  
`host-002`, `host-005`, `host-006`, `host-009`, `host-010`

---

### Academy 3: Coffee Program

**Academy ID:** `coffee-program`  
**Instructor Persona:** Theo — Specialty Coffee Director and Hospitality Barista Trainer  
**Emotional premise:** Coffee is not the last course. It is the final impression. Every cup is a guest decision about whether to return.

---

#### Lesson CP-1 — Espresso Intelligence

| Field | Content |
|---|---|
| **Academy** | Coffee Program |
| **Existing lesson ID** | `coffee-004` |
| **Proposed display ID** | CP-1 |
| **Title** | Espresso Intelligence |
| **Purpose** | Teach the science and discipline of espresso — why a great shot happens, what goes wrong, and how to communicate coffee quality to guests. |
| **After this lesson, the employee can:** | Diagnose a basic espresso problem (over/under-extraction, channeling, temperature), articulate coffee quality in hospitality language, and describe your house espresso to a guest accurately. |
| **Key topics** | Dose, yield, and time (the brew ratio); what extraction means in practical terms; puck preparation; reading the shot; flavor language for guests |
| **Hospitality scenario** | A guest orders an espresso after dinner. It arrives sour and thin. The server doesn't know why and has no language to address it. The guest doesn't complain but mentally notes it. |
| **Drill / simulation** | Blind tasting: two espresso shots (correctly extracted vs. under-extracted). Employee identifies which and describes the difference in guest-facing language — not technical jargon. |
| **Common mistake this prevents** | The espresso black box — staff who serve coffee with no understanding of what makes it correct, leaving them unable to catch or explain quality failures |
| **Recommended instructor** | Theo (Coffee) |
| **Estimated video length** | 7–8 minutes |
| **Source lesson to reuse** | `coffee-004` (Espresso Science, Puck Prep, and Shot Diagnosis) — reuse, trim technical depth for service staff |
| **What to remove / avoid** | Do not require barista-level precision; this is for service staff awareness, not barista certification |
| **Video status** | `needs_script` |

---

#### Lesson CP-2 — Milk, Texture, and the Latte Standard

| Field | Content |
|---|---|
| **Academy** | Coffee Program |
| **Existing lesson ID** | `coffee-005` |
| **Proposed display ID** | CP-2 |
| **Title** | Milk, Texture, and the Latte Standard |
| **Purpose** | Teach the premium hospitality standard for milk-based coffee drinks — what correct microfoam looks, feels, and tastes like, and how to recognize it on service. |
| **After this lesson, the employee can:** | Visually identify correctly textured milk in a cappuccino or flat white, know the service standard (temperature, cup temperature, pour timing), and speak to guests about milk alternatives confidently. |
| **Key topics** | What microfoam is and why it matters; temperature range for milk texturing; common mistakes (scorched milk, dry foam, loose milk); milk alternatives and flavor behavior; latte art as an indicator of skill |
| **Hospitality scenario** | A guest orders a flat white. It arrives with stiff, dry foam on top. The guest stirs it in silence. The server checks: "Was everything OK?" "Yes, fine." It was not fine. |
| **Drill / simulation** | Texture test: compare three milk preparations at different temperatures and foam densities. Rank them by guest experience quality. Explain the difference verbally. |
| **Common mistake this prevents** | Serving milk coffee by appearance only — checking that it looks like a coffee drink, not that the texture and temperature meet a standard |
| **Recommended instructor** | Theo (Coffee) |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `coffee-005` (Milk Chemistry, Microfoam, and Luxury Beverage Texture) — reuse, trim chemistry depth |
| **What to remove / avoid** | Do not make this a barista training module; service staff need recognition skills, not steaming technique certification |
| **Video status** | `needs_script` |

---

#### Lesson CP-3 — Coffee in the Meal Arc

| Field | Content |
|---|---|
| **Academy** | Coffee Program |
| **Existing lesson ID** | `coffee-006` |
| **Proposed display ID** | CP-3 |
| **Title** | Coffee in the Meal Arc |
| **Purpose** | Teach the timing, placement, and hospitality role of coffee within a full dining experience — from post-meal rhythm to pairing with dessert. |
| **After this lesson, the employee can:** | Offer coffee at the right moment in the meal arc, make a confident recommendation between coffee options, and time the coffee delivery to support rather than interrupt the dessert course. |
| **Key topics** | When to offer coffee (not too early, not as a closing signal); pairing logic (espresso vs. long black vs. flat white with different desserts); the visual ritual of coffee service; reading guest readiness |
| **Hospitality scenario** | Desserts arrive. The server immediately asks "Coffee or tea?" The question closes the dessert experience before it has started. The guest feels rushed. |
| **Drill / simulation** | Sequence exercise: given three dessert course scenarios, identify the correct coffee offer timing and method for each. Discuss: how do you offer coffee without signaling "please leave"? |
| **Common mistake this prevents** | Coffee as a bill signal — bringing coffee too early or offering it in a way that implies the meal is being closed rather than extended |
| **Recommended instructor** | Theo (Coffee) |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `coffee-006` (Hospitality Coffee Service and Dessert Timing) — reuse fully |
| **What to remove / avoid** | Do not include coffee machine operation; service timing and hospitality framing only |
| **Video status** | `needs_script` |

---

#### Lesson CP-4 — Origins, Roasts, and Guest Language

| Field | Content |
|---|---|
| **Academy** | Coffee Program |
| **Existing lesson ID** | `coffee-001` / `coffee-002` (merge) |
| **Proposed display ID** | CP-4 |
| **Title** | Origins, Roasts, and Guest Language |
| **Purpose** | Give service staff enough coffee literacy to speak confidently about your coffee program without becoming a coffee bore — the right depth, the right language. |
| **After this lesson, the employee can:** | Describe your house coffee's origin and roast profile in 2–3 clear sentences, answer common guest questions about single origin vs. blend and light vs. dark roast, and recommend between espresso-based and filter options. |
| **Key topics** | Key origins (Ethiopia, Colombia, Brazil, Yemen — flavor archetypes); roast levels and how they affect flavor; single origin vs. blend and when to recommend each; words that work for guests (bright, round, rich, floral, earthy) vs. words that don't |
| **Hospitality scenario** | A guest asks: "What's the coffee like here?" The server replies: "It's good, from a local roaster." The guest, a coffee enthusiast, closes the conversation. The opportunity for a deeper connection — and a premium pour-over recommendation — was missed. |
| **Drill / simulation** | Two-sentence description exercise: write a guest-facing description of your house coffee using only what you know about origin and roast. Read it aloud. Does it sound like a person or a label? |
| **Common mistake this prevents** | The knowledge gap deflection — "It's just our house coffee" — when the guest was genuinely curious and ready to be guided |
| **Recommended instructor** | Theo (Coffee) |
| **Estimated video length** | 6–7 minutes |
| **Source lessons to merge** | `coffee-001` (Origin, Processing, Freshness) + `coffee-002` (Arabica, Robusta, Altitude, Roast Levels) — merge into one guest-facing language lesson |
| **What to remove / avoid** | Do not go deep into processing methods or varietals; guest-conversation fluency only |
| **Video status** | `needs_script` |

---

#### Lesson CP-5 — The Coffee Bar Standard

| Field | Content |
|---|---|
| **Academy** | Coffee Program |
| **Existing lesson ID** | `coffee-007` |
| **Proposed display ID** | CP-5 |
| **Title** | The Coffee Bar Standard |
| **Purpose** | Establish the professional discipline of coffee bar operation — cleanliness, calibration awareness, and the daily rituals that protect coffee quality during service. |
| **After this lesson, the employee can:** | Follow the daily coffee station opening and closing checklist, recognize signs that calibration is off (and who to tell), and maintain the coffee station to the standard a guest would expect from a premium venue. |
| **Key topics** | Daily purge and warm-up sequence; grinder and portafilter cleanliness; milk pitcher hygiene; detecting calibration drift; who owns the coffee quality call during service |
| **Hospitality scenario** | Late service. The grinder hasn't been checked since morning. Three espressos in a row are running long and tasting bitter. No one has noticed because no one has been tasting. The problem existed for two hours. |
| **Drill / simulation** | Walk-through checklist: employee narrates a 5-minute opening sequence for the coffee station. Peer checks against the correct procedure. |
| **Common mistake this prevents** | The "set it and forget it" station — coffee equipment that operates unmonitored throughout a full service day |
| **Recommended instructor** | Theo (Coffee) |
| **Estimated video length** | 5–6 minutes |
| **Source lesson to reuse** | `coffee-007` (Coffee Bar Workflow, Calibration, and Cleaning Doctrine) — reuse, adapt to service staff not barista |
| **What to remove / avoid** | Do not require technical calibration skills; recognition and escalation protocol only |
| **Video status** | `needs_script` |

---

**Coffee Program — lessons archived/hidden (not deleted):**  
`coffee-003`, `coffee-008`, `coffee-009`, `coffee-010`  
*(coffee-001 and coffee-002 are merged into CP-4; both IDs archived)*

---

### Academy 4: Culinary Intelligence

**Academy ID:** `culinary-intelligence`  
**Instructor Persona:** Daniel — Executive Chef Liaison and FOH Food Educator  
*(Note: Daniel is listed as Manager persona in design docs. A dedicated Culinary persona — "Chef's Voice" — may be more appropriate. TBD in Phase 11E.)*  
**Emotional premise:** You are the guest's only guide to the kitchen. If you don't know the food, the guest is dining blind.

---

#### Lesson CI-1 — Ingredient Literacy

| Field | Content |
|---|---|
| **Academy** | Culinary Intelligence |
| **Existing lesson ID** | `culinary-001` |
| **Proposed display ID** | CI-1 |
| **Title** | Ingredient Literacy |
| **Purpose** | Teach service staff to understand and tell the story of key ingredients — where they come from, why they matter, and how to convey that pride to a guest. |
| **After this lesson, the employee can:** | Describe three featured ingredients on the current menu with sourcing context, explain what makes them special, and use the story as a natural part of recommendation — not a recitation. |
| **Key topics** | The sourcing narrative (local, seasonal, artisan provenance); flavor vocabulary for key ingredients; how to learn an ingredient quickly; the difference between reciting specs and genuinely knowing a dish |
| **Hospitality scenario** | A guest asks about the lamb. The server says: "It's really good." The guest, who raised animals, was hoping for something more. The connection was possible. It didn't happen. |
| **Drill / simulation** | The 60-second ingredient story: given one featured ingredient from a sample menu, each employee builds a 60-second guest-facing story. Evaluated on: accuracy, warmth, natural delivery. |
| **Common mistake this prevents** | The clipboard answer — reading the menu description back to the guest instead of actually knowing the food |
| **Recommended instructor** | Daniel / Culinary persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `culinary-001` (Ingredient Literacy and Sourcing Narrative) — reuse fully |
| **What to remove / avoid** | Do not require supply chain depth; guest-facing narrative only |
| **Video status** | `needs_script` |

---

#### Lesson CI-2 — Allergen Seriousness

| Field | Content |
|---|---|
| **Academy** | Culinary Intelligence |
| **Existing lesson ID** | `culinary-003` |
| **Proposed display ID** | CI-2 |
| **Title** | Allergen Seriousness |
| **Purpose** | Establish allergen handling as an ethical and potentially life-saving responsibility — not a paperwork exercise. |
| **After this lesson, the employee can:** | Receive an allergen declaration from a guest, confirm it correctly (not minimizing or assuming), communicate it to the kitchen with appropriate urgency, and follow up before service. |
| **Key topics** | The 14 major allergens; the difference between intolerance and allergy; how to receive and confirm an allergen declaration; kitchen communication protocol; the follow-up return to the table |
| **Hospitality scenario** | A guest mentions a nut allergy casually while ordering. The server notes it mentally but forgets to communicate it at the pass. A dessert with almond flour arrives. The guest catches it before eating. No one said anything. |
| **Drill / simulation** | Order-taking simulation: colleague plays a guest who mentions a sesame allergy casually mid-order. Employee must correctly receive, confirm, and communicate the allergy — demonstrating the right language and escalation. |
| **Common mistake this prevents** | The informal acknowledgment — "I'll let the kitchen know" said lightly, with no written communication, no follow-up, and no confirmation |
| **Recommended instructor** | Daniel / Culinary persona TBD |
| **Estimated video length** | 7–8 minutes |
| **Source lesson to reuse** | `culinary-003` (Allergens, Dietary Restrictions, and Seriousness Protocol) — reuse, tighten to allergen focus |
| **What to remove / avoid** | Do not include dietary preference (vegan, etc.) in the same ethical frame as allergen; these are different stakes |
| **Video status** | `needs_script` |

---

#### Lesson CI-3 — How a Dish Works

| Field | Content |
|---|---|
| **Academy** | Culinary Intelligence |
| **Existing lesson ID** | `culinary-004` |
| **Proposed display ID** | CI-3 |
| **Title** | How a Dish Works |
| **Purpose** | Teach the basic flavor architecture of food — fat, acid, salt, heat, texture, and contrast — so staff can describe dishes meaningfully and recommend with confidence. |
| **After this lesson, the employee can:** | Explain why a dish tastes the way it does in guest-facing terms, anticipate which dishes suit which guests, and make a recommendation that sounds like genuine guidance, not marketing. |
| **Key topics** | Fat (richness, satisfaction); Acid (brightness, balance); Salt (depth, seasoning); Heat (warm/spice); Texture (crunch, silk, chew); Contrast (how dishes balance internally); flavor vs. taste language |
| **Hospitality scenario** | A guest says: "I don't want anything too heavy." The server says: "The fish is light." What does "light" mean? There are three fish dishes — one with a cream sauce. The guest orders it. It's not what they wanted. |
| **Drill / simulation** | Flavor mapping: take three dishes from a sample menu, identify the dominant flavor components (fat, acid, salt, texture), and categorize them as "rich," "bright," or "balanced." Discuss: how do you describe each to a guest who said "I want something fresh"? |
| **Common mistake this prevents** | The adjective answer — "it's delicious," "it's very popular," "it's rich" — without any structure that helps the guest make an actual decision |
| **Recommended instructor** | Daniel / Culinary persona TBD |
| **Estimated video length** | 7–8 minutes |
| **Source lesson to reuse** | `culinary-004` (Flavor Structure: Fat, Acid, Salt, Heat, Texture, and Umami) — reuse, adjust language for FOH |
| **What to remove / avoid** | Do not require culinary school depth; guest-decision language only |
| **Video status** | `needs_script` |

---

#### Lesson CI-4 — The Confident Recommendation

| Field | Content |
|---|---|
| **Academy** | Culinary Intelligence |
| **Existing lesson ID** | `culinary-005` |
| **Proposed display ID** | CI-4 |
| **Title** | The Confident Recommendation |
| **Purpose** | Teach the art of menu recommendation — reading what a guest wants, selecting the right dish, and delivering the recommendation as guidance, not sales. |
| **After this lesson, the employee can:** | Make a menu recommendation that sounds personal and informed, handle "what would you choose?" from any guest, and guide decision-making without pressure. |
| **Key topics** | The guest-reading questions (what have they eaten here before? what did they mention wanting?); the structure of a good recommendation (name, one-sentence description, why I think you'd enjoy it); the "I wouldn't steer you wrong" standard |
| **Hospitality scenario** | A guest: "What do you recommend?" Server: "Everything is great, honestly." The guest stares at the menu for four more minutes and orders defensively. |
| **Drill / simulation** | Recommendation roleplay: given a guest profile (adventurous eater, light appetite, celebrating, unfamiliar with the cuisine), make one recommendation with a clear sentence of rationale. Evaluated: did it feel personal? |
| **Common mistake this prevents** | The non-recommendation — deferring back to the menu ("they're all good") instead of actually guiding the guest |
| **Recommended instructor** | Daniel / Culinary persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `culinary-005` (Menu Fluency and Confident Recommendation) — reuse fully |
| **What to remove / avoid** | Do not conflate with upselling; this is pure guidance, not commercial pressure |
| **Video status** | `needs_script` |

---

#### Lesson CI-5 — The Kitchen Relationship

| Field | Content |
|---|---|
| **Academy** | Culinary Intelligence |
| **Existing lesson ID** | `culinary-006` |
| **Proposed display ID** | CI-5 |
| **Title** | The Kitchen Relationship |
| **Purpose** | Teach the professional dynamics of FOH-BOH communication — how to interact with the kitchen under pressure without creating conflict or damaging service flow. |
| **After this lesson, the employee can:** | Communicate a guest request to the kitchen using correct framing (guest need vs. personal preference), escalate a course delay to the right person, and maintain the FOH-BOH relationship as a partnership. |
| **Key topics** | The pass as a negotiation zone; how to phrase a special request without putting chefs in an impossible position; the right person for each kind of kitchen conversation; the pre-service briefing as a relationship ritual |
| **Hospitality scenario** | A server has a guest with a special request (no garlic). They approach the pass during peak service and say "can you remake the risotto without garlic?" The chef is in the middle of a ticket. The exchange becomes terse. The kitchen atmosphere shifts. |
| **Drill / simulation** | Roleplay: two people (server and chef/manager). Server needs to communicate a course hold, a special dietary request, and a table complaint — each in 10 seconds or less, using correct framing. |
| **Common mistake this prevents** | The wrong-person escalation — a server interrupting the head chef directly for a request that should go to the sous chef or expeditor |
| **Recommended instructor** | Daniel / Culinary persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `culinary-006` (FOH and BOH Communication Under Pressure) — reuse fully |
| **What to remove / avoid** | Do not make this about kitchen hierarchy theory; practical communication in real service only |
| **Video status** | `needs_script` |

---

**Culinary Intelligence — lessons archived/hidden (not deleted):**  
`culinary-002`, `culinary-007`, `culinary-008`, `culinary-009`, `culinary-010`

---

### Academy 5: Hospitality Ethics & Privacy

**Academy ID:** `ethics-privacy`  
**Instructor Persona:** Mira (Service) or a dedicated Ethics persona — TBD in Phase 11E  
**Emotional premise:** The highest standard of hospitality is a guest who never had to ask for their dignity. You protected it without them knowing.

---

#### Lesson EP-1 — The Quiet Guardian Standard

| Field | Content |
|---|---|
| **Academy** | Hospitality Ethics & Privacy |
| **Existing lesson ID** | `ethics-001` |
| **Proposed display ID** | EP-1 |
| **Title** | The Quiet Guardian Standard |
| **Purpose** | Establish the foundational ethics of guest dignity — that every guest deserves protection, respect, and non-judgmental service regardless of how they arrive, what they order, or who they are. |
| **After this lesson, the employee can:** | Identify a moment where a guest's dignity is at risk (embarrassment, awkward situation, public discomfort) and intervene or redirect quietly, without drawing attention. |
| **Key topics** | Guest dignity as a professional responsibility; the invisible intervention; when to act without being asked; the "quiet guardian" posture; non-judgmental service language |
| **Hospitality scenario** | A guest spills a glass of wine. Before they can react, the server draws attention to it ("Oh! Are you OK?"), three nearby tables look over, and the guest's face flushes with embarrassment. The correct action — discreet, fast, calm — was not taken. |
| **Drill / simulation** | Scenario response: given five guest dignity moments (spill, argument, visible upset, decline of menu item, wardrobe issue), describe the quiet guardian response for each. What do you say? What do you not say? |
| **Common mistake this prevents** | The public rescue — drawing attention to a guest's moment of difficulty in an effort to help, which only amplifies the embarrassment |
| **Recommended instructor** | Mira / Ethics persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `ethics-001` (Guest Dignity and the Quiet Guardian Standard) — reuse fully |
| **What to remove / avoid** | Do not make this abstract or philosophical; anchor every principle to a specific service moment |
| **Video status** | `needs_script` |

---

#### Lesson EP-2 — Responsible Alcohol Service

| Field | Content |
|---|---|
| **Academy** | Hospitality Ethics & Privacy |
| **Existing lesson ID** | `ethics-002` |
| **Proposed display ID** | EP-2 |
| **Title** | Responsible Alcohol Service |
| **Purpose** | Teach the professional and ethical standards of alcohol service — recognizing intoxication signals, managing refusal with dignity, and knowing when to escalate. |
| **After this lesson, the employee can:** | Identify behavioral intoxication signals, apply a dignified refusal or slow-down technique, and escalate to a manager when needed — without creating a confrontation or public scene. |
| **Key topics** | Intoxication signal recognition (behavioral, verbal, physical); the legal dimension (brief, not preachy); the dignified slow-down technique; refusal language that doesn't escalate; manager escalation threshold; the duty of care standard |
| **Hospitality scenario** | A table of four has been drinking steadily for three hours. One guest is visibly affected. The server continues service because "they haven't ordered anything unusual" and nobody has asked them to stop. |
| **Drill / simulation** | Recognition test: describe three table scenarios with varying levels of intoxication signal. For each, identify: continue / slow / pause / escalate — and write the opening line. |
| **Common mistake this prevents** | The commercial override — continuing alcohol service because the guest is still ordering and there has been no visible incident, even when the signals are clearly present |
| **Recommended instructor** | Mira / Ethics persona TBD |
| **Estimated video length** | 7–8 minutes |
| **Source lesson to reuse** | `ethics-002` (Responsible Alcohol Service and Intoxication Signals) — reuse fully |
| **What to remove / avoid** | Do not make this a legal compliance lecture; behavior and judgment, not regulation list |
| **Video status** | `needs_script` |

---

#### Lesson EP-3 — VIP Privacy and Memory Ethics

| Field | Content |
|---|---|
| **Academy** | Hospitality Ethics & Privacy |
| **Existing lesson ID** | `ethics-004` |
| **Proposed display ID** | EP-3 |
| **Title** | VIP Privacy and Memory Ethics |
| **Purpose** | Teach the ethical dimension of guest memory — what to remember, what to record, how to use preference notes without making a guest feel watched or profiled. |
| **After this lesson, the employee can:** | Use guest preference notes as a hospitality tool (not a data display), apply them naturally in service, and recognize when using a note would feel intrusive rather than warm. |
| **Key topics** | The difference between hospitality memory and surveillance; what to note and what not to note; how to apply a preference naturally ("I remembered you prefer sparkling" vs. reading from a card); note confidentiality; situations where a preference note should not be used |
| **Hospitality scenario** | A regular guest returns with a new partner. The staff, eager to demonstrate their memory, greet the guest by mentioning their usual bottle and their last visit "with your family." The guest shifts uncomfortably. Context matters. |
| **Drill / simulation** | Note ethics review: given five guest preference note examples, identify which are appropriate to use and which would feel intrusive — and explain why. |
| **Common mistake this prevents** | The database greeting — reciting guest notes in ways that feel like profiling rather than hospitality, removing the warmth that memory is supposed to create |
| **Recommended instructor** | Mira / Ethics persona TBD |
| **Estimated video length** | 6–7 minutes |
| **Source lesson to reuse** | `ethics-004` (VIP Privacy, Guest Memory, and Confidential Notes) — reuse fully |
| **What to remove / avoid** | Do not include GDPR/legal specifics in this lesson (that belongs in EP-5); focus on behavioral ethics |
| **Video status** | `needs_script` |

---

#### Lesson EP-4 — De-Escalation With Dignity

| Field | Content |
|---|---|
| **Academy** | Hospitality Ethics & Privacy |
| **Existing lesson ID** | `ethics-005` |
| **Proposed display ID** | EP-4 |
| **Title** | De-Escalation With Dignity |
| **Purpose** | Teach a practical framework for managing difficult or escalating guest situations without hostility, public drama, or personal offense. |
| **After this lesson, the employee can:** | Apply a calm, authoritative de-escalation sequence for the three most common difficult guest scenarios, maintaining the guest's dignity while protecting the team and other guests. |
| **Key topics** | The de-escalation breathing moment (don't respond immediately); the calm acknowledgment (not agreement); redirection vs. confrontation; when to involve a manager (immediately vs. after a de-escalation attempt); protecting other guests from the scene |
| **Hospitality scenario** | A guest becomes loudly upset about a wait time in front of a full restaurant. The server responds defensively. The volume increases. Three other tables are watching. The situation is now worse than the original complaint. |
| **Drill / simulation** | Hot scenario roleplay: escalating complaint, impatient guest, inappropriate demand. Employee applies the de-escalation sequence in real time. Evaluated: did the volume go down? Was the guest's dignity preserved? Was the manager called at the right moment? |
| **Common mistake this prevents** | The mirror escalation — matching a guest's energy and tone, which transforms a complaint into a confrontation |
| **Recommended instructor** | Mira / Ethics persona TBD |
| **Estimated video length** | 7–8 minutes |
| **Source lesson to reuse** | `ethics-005` (Dignity-Preserving De-Escalation) — reuse fully |
| **What to remove / avoid** | Do not include physical confrontation scenarios; verbal and environmental de-escalation only |
| **Video status** | `needs_script` |

---

#### Lesson EP-5 — The Ethics of Preference Memory

| Field | Content |
|---|---|
| **Academy** | Hospitality Ethics & Privacy |
| **Existing lesson ID** | `ethics-007` |
| **Proposed display ID** | EP-5 |
| **Title** | The Ethics of Preference Memory |
| **Purpose** | Teach the professional standards for guest data — what HESTIA collects, how it should be used, what requires guest consent, and how to speak to guests about it honestly. |
| **After this lesson, the employee can:** | Explain what guest preference notes are, why they exist, and what rights a guest has regarding their information — in plain, hospitable language, not policy language. |
| **Key topics** | What preference memory is for (hospitality, not marketing); what data is captured (preference notes vs. payment data); the guest's right to ask what is recorded; how to respond if a guest asks "do you keep notes on me?"; why honesty here builds trust, not destroys it |
| **Hospitality scenario** | A guest asks: "Do you keep records on me?" The server, not knowing what to say, deflects: "I don't think so, you'd have to ask management." The guest leaves feeling uncertain about the restaurant. An honest, warm answer was possible. |
| **Drill / simulation** | Response practice: given four different guest questions about data ("do you remember our orders?" / "do you share this with anyone?" / "can I ask you to forget my details?"), write a clear, warm, honest answer for each. |
| **Common mistake this prevents** | The policy wall — responding to honest guest questions with deflection, jargon, or invisible authority, when a direct and warm answer would build trust |
| **Recommended instructor** | Mira / Ethics persona TBD |
| **Estimated video length** | 5–6 minutes |
| **Source lesson to reuse** | `ethics-007` (Data Privacy and Preference Memory Ethics) — reuse fully |
| **What to remove / avoid** | Do not make this a GDPR lecture; hospitality trust language only |
| **Video status** | `needs_script` |

---

**Hospitality Ethics & Privacy — lessons archived/hidden (not deleted):**  
`ethics-003`, `ethics-006`, `ethics-008`, `ethics-009`, `ethics-010`

---

## 8. What Happens to Old Lesson Structures

### The 10-Lesson Problem
Current academies have 10 lessons each, designed for comprehensive coverage. This was architecturally correct but humanly unachievable — employees working shifts do not complete 10-lesson academies.

### The 5-Lesson Solution
Each academy keeps 10 lessons in the data layer. Five are marked as `flagship: true` (or via a `featuredLessons` array). The employee-facing UI shows only the 5 flagship lessons by default. A "Full Curriculum" toggle (available but not prominent) reveals all 10.

### What this protects
- All existing lesson IDs remain unchanged
- All existing progress keys (`academyId:lessonId`) remain valid
- Employees who completed lessons 6–10 retain their progress
- The data schema does not change

### What this does NOT do yet
- Does not delete any lessons
- Does not rename any lesson IDs
- Does not change the progress key format
- Does not modify universityManifest.js or universityExpansion.js

---

## 9. Progress Preservation Strategy

**Existing progress key format:** `hospia.progress.{academyId}:{lessonId}`  
**Example:** `hospia.progress.service-academy:service-001`

This format must not change without a localStorage migration plan.

The 5×5 view is a **UI filter**, not a data change. Lessons 6–10 continue to exist, be playable, and track progress. The flagship selection is a display configuration only.

**Recommended implementation (Phase 11D):**
- Add a `flagship` boolean to each lesson object in the manifest
- The Courses UI filters to `flagship === true` by default
- An optional "See full curriculum" expander reveals non-flagship lessons
- Progress dots respect all completed lessons, not just flagship ones

---

## 10. What Not to Implement Yet

- Do not redesign LessonPlayer in Phase 11B or 11C
- Do not modify TTS or instructor voice logic
- Do not change academyInstructorVideoMap.js video URLs
- Do not change progress key formats
- Do not add new video URLs until real videos exist
- Do not rename academy IDs
- Do not touch Bar World or Wine Atlas
- Do not re-add bar-academy or wine-academy to employee Courses
- Do not modify universityManifest.js data without a plan
- Do not delete any lessons — archive by flagging, not by removing

---

## 11. Open Product Questions

1. **Instructor persona for Arrival & Host Academy:** Noa is listed as Events persona in design docs. A dedicated Host persona may be needed. Decide before Phase 11E.
2. **Culinary Intelligence persona:** Daniel is Manager persona. A dedicated culinary voice (chef-adjacent) may strengthen the academy identity. Decide before Phase 11E.
3. **Hospitality Ethics persona:** Currently assigned to Mira by default. An independent Ethics persona (neutral, authoritative, human) may serve better. Decide before Phase 11E.
4. **Flagship flagging method:** `flagship: true` field on lessons, or a separate `featuredLessons: []` array on the academy? Decide before Phase 11D.
5. **"Full Curriculum" toggle:** Should it exist in MVP, or should lessons 6–10 be fully hidden until Phase 12+? Decide with product before Phase 11D.
6. **event-academy fate:** Not included in Service School. Should it appear in a separate Events track, or remain manager/admin only? Open question.
7. **train-the-trainer fate:** Already manager-only. Confirm it does not appear anywhere in employee-facing Courses.
8. **Coffee-001 + Coffee-002 merge:** CP-4 merges these two lessons. The merged lesson ID needs a decision — reuse `coffee-001`? Create `coffee-001-merged`? Use a display alias only? Decide before Phase 11D.
9. **service-001 video:** Already video_ready (Synthesia embed). Confirm the video content matches the SA-1 lesson direction above before marking it as the flagship video.
10. **Courses page route:** Currently `/courses` or similar. When renamed to HESTIA Service School, does the URL change? Decide before Phase 11B to avoid broken navigation.

---

---

## 12. Gemini Intelligence Integration

**Source:** `docs/academy/research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md`  
**Analysis:** `docs/academy/HESTIA_SERVICE_SCHOOL_RESEARCH_SYNTHESIS.md`  
**Integration date:** 2026-06-06

This section documents what was absorbed from the Gemini Academy Intelligence Report into this curriculum plan. All HESTIA-specific decisions (lesson IDs, persona names, progress key format, production statuses) take precedence. The Gemini report is a strong supplementary source, not a replacement curriculum.

---

### Drill and Scenario Concepts Absorbed

The following Gemini drill/scenario concepts have been incorporated into HESTIA lesson descriptions:

| Gemini Concept | Absorbed Into | How Applied |
|---|---|---|
| Threshold Challenge (multi-party arrival) | HA-1: Front Door Authority | Scenario: two groups arriving simultaneously while host is checking the list |
| Spatial Seating Puzzle (interactive floor grid) | HA-2: Seating the Room | Drill: floor map exercise with four arriving parties |
| Pacing Delay Scenario (bar coordination) | HA-3: The Honest Wait | Drill: three wait scenarios (10/25/45+ min) with opening line, midpoint update, seating moment |
| Handoff Match Challenge | HA-5: The Invisible Handoff | Drill: two-person roleplay passing context to server without guest overhearing |
| Acoustic Coordination Challenge | SA-3: The Art of Silence | Drill: silent service practice — clear mock table while colleagues roleplay conversation |
| Branching Crisis Simulation | SA-4: Recovery That Rebuilds | Drill: four-step recovery framework on three complaint types |
| Departure Flow Puzzle | SA-5: The Last 30 Seconds | Drill: farewell script for three table scenarios (business, birthday, first-timer) |
| Copy Filter (removing generic adjectives) | CI-4: The Confident Recommendation | Drill vocabulary: "it's really good" vs. genuine flavor language |
| Sound Frequency Matcher concept | CP-2: Milk, Texture, and the Latte Standard | Scenario: guest receives dry foam in silence; server lacks language to address it |

---

### Gemini Lesson Titles Reviewed and Superseded

The Gemini report proposes alternative lesson titles for all five academies. HESTIA titles are preserved because they:
- Map to real existing lesson IDs
- Are calibrated for HESTIA's emotional register (formation, not compliance)
- Use HESTIA-established persona names
- Preserve the established progress key format

| Gemini Title | HESTIA Title | Reason HESTIA Wins |
|---|---|---|
| The Threshold Ritual | Front Door Authority | Authority framing is the lesson's core concept |
| Phone Choreography | (not in MVP 5) | Strong concept — reserved for future HA-bonus lesson |
| Floor Geometry: Strategic Guest Seating | Seating the Room | Less clinical; "room" is the relevant operational frame |
| Waitlist Management | The Honest Wait | "Honest" is the core principle, not "management" |
| The Floor Handoff | The Invisible Handoff | "Invisible" is the precision the lesson teaches |
| Silent Table Maintenance | The Art of Silence | Broader applicability beyond clearing |
| Reading Table Rhythms | Reading the Table | Cleaner; rhythm is a secondary concept |
| Water & Fluid Choreography | (absorbed into SA-3) | Drill concept absorbed; not a standalone lesson in MVP |
| The Recovery Protocol | Recovery That Rebuilds | "Rebuilds" is the outcome, not just the protocol |
| The Final Second | The Last 30 Seconds | Symmetry with SA-1 (The First 30 Seconds) |
| Espresso Metrics: Dialing In Extraction | Espresso Intelligence | Gemini version is barista-level; CP-1 is FOH awareness |
| Milk Thermodynamics: Microfoam Texture | Milk, Texture, and the Latte Standard | Recognition skills, not steaming technique |

---

### Production Status Corrections

The Gemini report falsely marks several lessons as `video_ready` or `in_production`. These statuses are rejected.

**All lessons in this plan default to `needs_script` unless a real confirmed video exists.**

Currently `video_ready` lessons with confirmed embed URLs:
- SA-1 (`service-001`) — Confirm content match before using as flagship video

All others: `needs_script` until real production is complete and embed URL is tested in `academyInstructorVideoMap.js`.

---

### Gemini Concept Reserved for Future Phases

**Phone Choreography (Gemini lesson 2.2):**  
A lesson on professional phone reservation management is a strong concept not covered in the current 5 flagship lessons for Arrival & Host Academy. This is reserved as a Phase 12+ candidate — either as a sixth lesson in the academy (behind the "Full Curriculum" toggle) or as a standalone module in a future Operations School.

**Interactive Drill Infrastructure (Gemini Phase 12+):**  
The following drill concepts require custom interactive UI components that do not exist yet:
- Structural Calibration Sliders (Bar Course)
- Sound Frequency Matcher (Coffee Program)
- Interactive Floor Grid with server workload visualization (Arrival/Host)
- Pouring Angle Matrix with bottle silhouette alignment (Service)

These are excellent Phase 12+ candidates. Do not build placeholder UI. Document the concepts here as future specifications.

---

*This document is a planning artifact. No source files were modified. Do not implement until design direction (HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md) and implementation plan (HESTIA_COURSES_REDESIGN_IMPLEMENTATION_PLAN.md) are reviewed and approved.*
