# HESTIA Service School — Research Synthesis

**Status:** Planning Phase — Not Yet Implemented  
**Date:** 2026-06-06  
**Phase:** Pre-Phase 11B  
**Classification:** Research Analysis + Curriculum Authority Document  
**Source report:** `docs/academy/research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md`

---

## 1. Purpose of This Document

This document synthesizes the recommendations in the Gemini Academy Intelligence Report against the approved HESTIA architecture, curriculum rules, and design system. It does not replace any existing planning document. It supplements them by:

- Confirming which Gemini ideas are already reflected in the HESTIA plan
- Flagging which ideas require modification before use
- Formally rejecting ideas that conflict with HESTIA principles
- Marking ideas for future phases

All curriculum decisions remain governed by:
- `docs/academy/HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md`
- `docs/academy/HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md`
- `docs/academy/HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md`
- `skills/user/hestia-ui-design/SKILL.md`
- `CLAUDE.md` (HESTIA architecture rules)

---

## 2. Source Summary — Gemini Academy Intelligence Report

**File:** `docs/academy/research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md`  
**Classification:** Strong external curriculum and design source. Contains valuable drill concepts, scenario language, and visual metaphors. Must be filtered through approved HESTIA architecture before any use.

**What the report covers:**
- Anti-LMS critique of existing hospitality training programs
- Full 5-lesson curriculum proposals for:
  - Bar World / Bar Course (5 lessons)
  - Arrival / Host Academy (5 lessons)
  - Service Academy (5 lessons)
  - Coffee Program (4+ lessons read — some content not visible due to file format)
  - Culinary Intelligence and Ethics (implied by tree diagram; lesson detail not fully read)
- Visual world concepts per academy (materiality metaphors, palette references)
- Production status assignments per lesson (partially erroneous — see rejections below)
- Drill and simulation concepts (strong)
- Instructor persona concepts (different from established HESTIA personas)

**What the report does NOT contain:**
- Awareness of the existing HESTIA lesson ID system
- Awareness of established HESTIA persona names (Mira, Theo, Daniel, Noa)
- Awareness of existing Synthesia video embeds
- Awareness of the `hospia.progress.*` localStorage key format
- Awareness of HESTIA approved architecture rules in CLAUDE.md

The report treats HESTIA as a blank slate. It is not. All conflicts resolve in favor of established HESTIA rules.

---

## 3. Academy Intelligence Report — Accepted, Modified, Rejected

### 3.1 Anti-LMS Critique

**Status: ACCEPT**

The report correctly identifies the failure modes of standard hospitality training:
- Multiple-choice checkpoint as compliance exam (not real-world preparation)
- Flat linear "next → next → next" lesson flow
- Over-reliance on theory and history over practical floor behavior
- Generic UI card modules (identical rectangles with modified text)
- Progress bars and score indicators that infantilize staff

**How this is applied:**
All five of these are already rejected in the HESTIA curriculum plan and design direction. The Gemini critique validates decisions already made. No implementation change needed.

---

### 3.2 Five-World Curriculum Structure (5×5)

**Status: ACCEPT with HESTIA architecture applied**

The report proposes the same three top-level worlds:
- Bar World (with Bar Course inside)
- Service School (with 5 academies)
- Command Center (Event Operations, Manager Only)

This matches the approved HESTIA structure precisely. 

**Critical override:** The report names the academies differently from HESTIA's established IDs. HESTIA naming wins:
- Gemini "Arrival / Host Academy" → HESTIA "Arrival & Host Academy" (`hostess-academy`)
- Gemini "Service Academy" → HESTIA "Service Academy" (`service-academy`)
- Gemini "Coffee Program" → HESTIA "Coffee Program" (`coffee-program`)
- Gemini "Culinary Intelligence" → HESTIA "Culinary Intelligence" (`culinary-intelligence`)
- Gemini "Hospitality Ethics & Privacy" → implied by Gemini tree; HESTIA name preserved

---

### 3.3 Bar World Split (Bar Course inside Bar World, not general Courses)

**Status: ACCEPT**

The report explicitly and correctly places Bar Course inside Bar World, isolated from general employee courses. This matches HESTIA rule exactly: bar-academy belongs in Bar World, not Service School.

The report's Bar Course lesson concepts (spec ratios, ice science, glassware, sensory storytelling) are strong and directionally aligned with Bar World Academy content. They are evaluated as Bar World planning input, not Service School input.

---

### 3.4 Service School Structure

**Status: ACCEPT with curriculum plan taking precedence**

The report's 5-academy structure for Service School matches HESTIA's approved plan. However, the specific lesson titles differ.

**Gemini lesson proposals vs HESTIA established curriculum:**

| Academy | Gemini Title | HESTIA Title | Decision |
|---|---|---|---|
| Arrival/Host | The Threshold Ritual | Front Door Authority | HESTIA wins — more authoritative framing |
| Arrival/Host | Phone Choreography | (not in HESTIA 5) | FUTURE — strong concept, consider HA-bonus |
| Arrival/Host | Floor Geometry | Seating the Room | HESTIA wins — less technical label |
| Arrival/Host | Waitlist Management | The Honest Wait | HESTIA wins — "honesty" is the key principle |
| Arrival/Host | The Floor Handoff | The Invisible Handoff | HESTIA wins — "invisible" is the precise idea |
| Service | Silent Table Maintenance | The Art of Silence | HESTIA wins — broader applicability |
| Service | Reading Table Rhythms | Reading the Table | HESTIA wins — cleaner title |
| Service | Water & Fluid Choreography | (absorbed into SA-3) | ABSORBED — drill concept useful in SA-3 |
| Service | The Recovery Protocol | Recovery That Rebuilds | HESTIA wins — "rebuilds" is the key outcome |
| Service | The Final Second | The Last 30 Seconds | HESTIA wins — symmetry with SA-1 |
| Coffee | Espresso Metrics (barista) | Espresso Intelligence (FOH) | MODIFY — depth too barista-focused |
| Coffee | Milk Thermodynamics (barista) | Milk, Texture, and the Latte Standard | MODIFY — recognition vs. technique |

**Gemini concepts ABSORBED into HESTIA lesson drill/scenario descriptions:**
- Acoustic Coordination Challenge → strengthens SA-3 (Art of Silence) drill
- Pouring Angle Matrix → useful reference for SA-3 fluid management scenario
- Spatial Seating Puzzle → absorbed into HA-2 (Seating the Room) drill language
- Threshold Challenge (multiple arrivals) → absorbed into HA-1 (Front Door Authority) drill
- The Handoff Match Challenge → absorbed into HA-5 (Invisible Handoff) drill
- Branching Crisis Simulation → absorbed into SA-4 (Recovery That Rebuilds) drill concept
- Departure Flow Puzzle → absorbed into SA-5 (Last 30 Seconds) drill concept

---

### 3.5 Event Command Center Placement (Manager-Only)

**Status: ACCEPT**

The report places Event Operations under Command Center as Manager Only. This matches the approved HESTIA rule: Event Operations belongs under Event Manager / Command Center. Not in Service School. Not in employee-facing Courses MVP.

No action needed.

---

### 3.6 Manager-Only Placement

**Status: ACCEPT**

The report correctly segregates Manager/Shift Leadership as manager-only. No manager academies should appear in employee-facing Service School. This is already enforced in the HESTIA curriculum plan.

---

### 3.7 Visual World Strategy (Distinct Academy Environments)

**Status: ACCEPT — materiality metaphors absorbed into design direction**

The report provides excellent visual materiality concepts per academy. These are absorbed into `docs/academy/HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md` as the "Academy-Specific Visual Worlds" section.

Key absorptions:
- Arrival/Host: Hand-bound leather ledger books, clean architectural layouts, sandstone/gold palette → absorbed
- Service Academy: White tablecloths, fine porcelain, polished silver → absorbed
- Coffee Program: Commercial espresso machines, chrome grinders, crema textures → absorbed
- Bar Course: Crystal glassware, hand-cut ice, polished brass bar → absorbed (Bar World context)

**Override applied:** Gemini proposes dark tones for Service Academy (#121212). HESTIA overrides to Palette B (Editorial Light) for all Service School academies. The materiality metaphors are applied through color evocation and design language, not literal palette adoption.

---

### 3.8 Scenario Drills

**Status: ACCEPT (concepts) — MODIFY (interactivity depth)**

The report proposes technically sophisticated interactive drills:
- Structural Calibration Sliders (Bar)
- Spatial Seating Puzzle (interactive floor grid)
- Thermal Dilution Challenge (timed simulation)
- Sound Frequency Matcher (audio clips)
- Acoustic Coordination Challenge

These are excellent concepts for Phase 12+ when interactive drill infrastructure exists.

**For current phases (11B–11F):** Drills are described as role-play, discussion, and written exercises. They do not require custom interactive UI. The Gemini drill concepts are documented in the curriculum plan as "Drill / simulation" descriptions — the HESTIA versions simplify to what is immediately executable.

**Rejected for MVP:** Any drill requiring custom-built interactive components (sliders, audio matchers, grid puzzles) is Phase 12+ only. Do not build placeholder drill UI.

---

### 3.9 Progress Visualization

**Status: ACCEPT principles — REJECT implementation specifics**

The report correctly rejects:
- Linear progress bars
- Score indicators
- Childish metric tracking

This matches HESTIA exactly. Progress is shown as dots (N of 5 sessions) per the design skill.

**Rejected from Gemini:**
- Decibel-meter tracking in UI (childish gamification reframed as technical)
- Any interactive calibration slider as a progress element
- Any timeline simulation UI in MVP

---

### 3.10 Production Statuses — Gemini Assignments

**Status: REJECT — false statuses must not propagate**

The report assigns production statuses to lessons that are internally inconsistent and conflict with HESTIA video rules.

**Falsely assigned by Gemini:**

| Gemini Lesson | Status Assigned | HESTIA Decision |
|---|---|---|
| Threshold Ritual (2.1) | `video_ready` | REJECT — no real video URL exists for this lesson |
| Silent Table Maintenance (3.1) | `video_ready` | REJECT — no real video URL exists |
| Espresso Metrics (4.1) | `video_ready` | REJECT — no real video URL exists |
| Floor Geometry (2.3) | `in_production` | REJECT — no evidence of production underway |
| Reading Table Rhythms (3.2) | `in_production` | REJECT — no evidence of production underway |

**Rule:** `video_ready` requires a real, tested embed URL in `academyInstructorVideoMap.js`. `in_production` requires confirmed submission to Synthesia or equivalent. Neither condition is met for these lessons.

All Gemini lessons are reset to `needs_script` as per HESTIA default.

**Correctly assigned by Gemini (scripts actually exist in report):**
- Bar Course 1.1 (Spec Architecture): `script_ready` — the report contains detailed lesson content that approximates a narration outline. Treat as OUTLINE stage only, not final script.
- Bar Course 1.4 (Sensory Storytelling): `script_ready` — same qualifier

---

### 3.11 Milestones Language

**Status: REJECT invented titles — ACCEPT concept of earned recognition**

The report does not explicitly address Milestones language, but the risk of "gamified achievement titles" is a standing HESTIA rule.

**Rule preserved:** Milestones must not become invented titles ("Coffee Virtuoso," "Floor Guardian," etc.). Earned recognition in HESTIA uses honest language only. If the employee completed 5 lessons in the Coffee Program, they completed 5 lessons. The language acknowledges the work, not a fictional rank.

---

### 3.12 Video Concepts

**Status: ACCEPT as creative brief inputs — NOT as confirmed video deliverables**

The report contains high-quality video concept descriptions per lesson:
- Macro split-screen (balanced vs unbalanced drinks)
- Overhead time-lapse (bar station efficiency)
- High-speed macro photography (ice melting)
- First-person POV (distracted vs. present host)
- Continuous tracking shot (guest escort + handoff)
- Slow-motion macro (flawless pour)

These are valuable creative briefs. They should be treated as:
- Phase 12+ video production reference material
- Not confirmed production direction
- Not production scripts
- Not `script_ready` indicators

The report's video concept language is absorbed into the curriculum plan's "Video concept" fields where helpful.

---

### 3.13 UI/UX Concepts

**Status: MODIFY — strong concepts, re-expressed through HESTIA design system**

The report proposes several UI concepts:
- "Immersive bento module featuring structural sliders" — Phase 12+ interactive drill UI
- "Interactive top-down view grid" for bar station — Phase 12+ drill
- "Waveform interface featuring dialogue paths" — interesting for Coffee/Phone Choreography
- "Structural Calibration Slider adjusting color tones on vector glass silhouette" — visually interesting, Phase 12+

**Applied to design direction:**
These concepts inform the "visual world" descriptions per academy — particularly the materiality metaphors and the concept of what an interactive drill UI COULD look like. They are documented as future direction, not MVP implementation.

**Rejected for MVP:**
- Any custom-built interactive UI widget (sliders, audio matchers, grid puzzles, decibel meters)
- These belong in Phase 12+ interactive drill infrastructure

---

## 4. Summary Classification Table

| Concept | Status | Applied Where |
|---|---|---|
| Anti-LMS critique | ACCEPT | Already in curriculum plan + design direction |
| 5×5 structure | ACCEPT | Already in curriculum plan |
| Bar World isolation | ACCEPT | Already enforced in CLAUDE.md |
| Service School 5 academies | ACCEPT | Already in curriculum plan |
| Alternate lesson titles | MODIFY | HESTIA titles win; Gemini concepts absorbed into drills |
| Phone Choreography lesson | FUTURE | Strong idea; not in MVP 5 lessons |
| Event Command Center placement | ACCEPT | Already in CLAUDE.md |
| Manager-only placement | ACCEPT | Already enforced |
| Visual world materiality concepts | ACCEPT | Absorbed into design direction |
| Dark palette for Service Academy | REJECT | HESTIA Palette B (Editorial Light) is correct |
| Interactive drill infrastructure | FUTURE | Phase 12+ |
| Drill scenario concepts | ACCEPT | Absorbed as drill descriptions |
| False `video_ready` statuses | REJECT | All reset to `needs_script` per HESTIA rules |
| False `in_production` statuses | REJECT | No confirmed production evidence |
| Barista-level Coffee content | MODIFY | HESTIA Coffee Program is FOH awareness, not barista cert |
| Video creative brief concepts | ACCEPT | Phase 12+ production reference |
| Invented milestone titles | REJECT | HESTIA uses honest progress language |
| Progress percentage bars | REJECT | Already rejected in design direction |
| Cinematic video as confirmed deliverable | REJECT | Concepts only; `needs_script` default |
| Custom instructor personas (Gemini names) | REJECT | HESTIA uses Mira, Theo, Daniel, Noa |

---

## 5. What the Gemini Report Gets Right That We Should Double Down On

1. **The anti-LMS conviction is strong.** The report's language about eliminating "corporate compliance exam" energy from training is exactly aligned with HESTIA's philosophy. Use this language when briefing vendors, content writers, or developers on what Service School is NOT.

2. **The materiality metaphor approach to visual design** is excellent practice. Each academy should feel like a physical world, not a category. This is now formalized in the design direction.

3. **Scenario-first lesson design** is the right approach. Every Gemini lesson leads with a real-world scenario before the teaching point. HESTIA's curriculum plan follows the same pattern but this confirms the methodology is sound.

4. **Video concept thinking is valuable.** The precision of Gemini's video direction (macro shots, tracking shots, overhead time-lapses) shows that good hospitality video is distinctive and cinematic. This should inform production briefs when real video production begins.

5. **The rejection of generic adjectives in guest communication** (the "Copy Filter" drill) is an excellent teaching concept. This is absorbed into SA-2 (Reading the Table) and CI-4 (The Confident Recommendation) as flavor for the vocabulary dimension of those lessons.

---

*This document is a planning artifact. It does not change any source files. Do not implement until implementation readiness is confirmed in `HESTIA_SERVICE_SCHOOL_IMPLEMENTATION_READINESS.md`.*
