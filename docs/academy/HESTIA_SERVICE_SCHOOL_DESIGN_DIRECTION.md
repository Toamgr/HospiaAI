# HESTIA Service School — Design Direction

**Status:** Planning Phase — UI Not Yet Built  
**Date:** 2026-06-06  
**Phase:** Pre-Phase 11C  
**Classification:** Design Authority Document — Mandatory Reference Before Any Implementation

---

## A. Design Thesis

HESTIA Service School is not a training platform. It is a professional formation environment.

When an employee opens Service School, they should feel something before they see anything. They should feel:

> *I am entering somewhere serious. Somewhere that takes my work seriously. Somewhere that treats me as a professional, not as a compliance checkbox.*

The visual experience must communicate this without saying it. The typography carries authority. The spacing breathes. The color palette is warm but not casual. There is no gamification, no badges for clicking through, no progress bars that fill with excitement. There is only the work — and the school that helps you do it better.

The design ambition: if a Michelin-starred restaurant had a staff school, this is what it would look like. Editorial. Quiet. Expert. Warm.

If at any point the design looks like:
- A generic LMS
- A Notion clone
- A company intranet portal
- A SaaS onboarding flow

— it has failed. Reject it and redesign.

---

## B. Visual References and Extracted Principles

**Research source not found in repo:** Formal MasterClass UX/design analysis. The following principles are extracted from general knowledge of these reference worlds. A formal research document should be attached before Phase 11C implementation begins.

### MasterClass — What to Extract

MasterClass succeeds because it makes the learner feel like they are sitting with someone extraordinary. The design does not interrupt that feeling.

**Principles to extract:**
- **Cinematic typographic hierarchy** — large, confident display type that occupies space without apology
- **Near-black backgrounds with warm white text** — depth without harshness
- **Module cards as editorial portraits** — instructors are the visual anchor, not category icons
- **No percentage bars** — progress is shown as "3 of 5 lessons" in small, honest type
- **No noise** — minimal chrome, maximum content
- **Chapter structure feels intentional** — 5–10 lessons, each complete in itself

**What to NOT copy from MasterClass:**
- Celebrity instructor dependency (HESTIA uses hospitality personas, not famous faces)
- Dark background throughout (HESTIA Service School uses Palette B — Editorial Light)
- The exact full-bleed chapter photo style (HESTIA has its own editorial language)

---

### The World's 50 Best — What to Extract

The 50 Best communicates the global hierarchy of excellence in hospitality without condescension. Every listing feels like an honor, not a ranking.

**Principles to extract:**
- **Ranked structure as editorial** — numbered sequences feel intentional, not bureaucratic
- **Minimal color, maximum typography** — the headline carries all the weight
- **The editorial voice** — precise, considered, never promotional
- **Premium whitespace** — content breathes; nothing is crowded
- **Photography as atmosphere, not illustration** — images serve the editorial tone, not decoration

**What to NOT copy from 50 Best:**
- Rankings or leaderboard framing (no "top employee" mechanics)
- Restaurant/chef photography (different domain)
- The specific editorial typographic style (HESTIA has its own)

---

### Michelin Guide — What to Extract

Michelin communicates absolute authority with economy. The red cover. The star. The single sentence review. Nothing wasted.

**Principles to extract:**
- **Economy of judgment** — one sentence can carry the full assessment
- **The star as signal, not decoration** — achievement markers are reserved and earned
- **Warmth within formality** — reviews are written with care for the restaurants they describe
- **Hierarchy without hierarchy markers** — you feel the levels without seeing numbered bars

**What to NOT copy from Michelin:**
- Stars or star-rating UI elements (gamification)
- Red as primary color (conflicts with HESTIA Palette B burgundy)
- The guide-book layout (doesn't translate to screen)

---

### Monocle — What to Extract

Monocle is the editorial gold standard for lifestyle-professional content. It treats its readers as intelligent adults who work in the world.

**Principles to extract:**
- **Editorial serif headlines** — Cormorant Garamond or equivalent; carries weight and warmth
- **The magazine within the product** — section headers feel like magazine covers
- **The eyebrow label** — small uppercase category label above every article establishes context
- **Column discipline** — content has maximum width; never stretches to fill the viewport
- **Photography + typography as partners** — neither dominates

**What to NOT copy from Monocle:**
- Print-to-web literal translation
- The specific color accent combinations
- Long-form article structure (HESTIA lessons are shorter)

---

### Aman / Four Seasons / Luxury Hospitality Websites — What to Extract

These brands communicate that you are already welcome before you arrive. The experience of using their website is itself a form of hospitality.

**Principles to extract:**
- **Generous whitespace as a signal of quality** — cheap things are crowded; luxurious things breathe
- **Typography at rest** — no animated headlines, no hovering text effects, no motion that isn't calm
- **Warm paper tones** — never pure white; always the warmth of good paper
- **Clarity of purpose** — you always know what to do next, and it never feels pushed
- **Service language** — copy reads like a concierge, not a product team

**What to NOT copy:**
- Hero video autoplay
- Luxury brand photography (aspirational travel, not hospitality operations)
- Booking flow UI patterns

---

### HESTIA Bar World and Classic Cocktails Magazine — Internal Reference

Bar World established the HESTIA editorial magazine pattern: dark shell, then an editorial world within it. Classic Cocktails Magazine set the standard for editorial warmth within that world.

**Principles to carry into Service School:**
- The in-world top navigation (horizontal tabs at 52px height, not sidebar)
- The eyebrow/masthead structure ("HESTIA · SERVICE SCHOOL")
- Module cards as editorial tiles, not progress widgets
- The "no percentage bars" rule — dots or counts only
- The academy-specific color identity within the shared Palette B framework

**What must be different from Bar World:**
- Bar World is cocktail-focused, technical, and spirit-forward. Service School is human, relational, and floor-focused.
- Bar World uses dark editorial tones. Service School uses Palette B (Editorial Light) as primary.
- Bar World has 5 tabs (Academy, Classics, Technique, Spirits, Service). Service School has 5 academies.
- The emotional register is different: Bar World is expertise and craft; Service School is formation and professional identity.

---

### HESTIA Wine Atlas — Internal Reference

Wine Atlas established the Palette B editorial experience in HESTIA: warm ivory, burgundy accents, Cormorant Garamond display type.

**Principles to carry into Service School:**
- Palette B color system exactly
- Cormorant Garamond for all major display text
- Inter for body text
- Fraunces for section headers / card titles
- The editorial card pattern (white card on ivory ground, subtle shadow, burgundy CTA)
- The pull quote pattern (Cormorant Garamond Italic, left border)

**What must be different from Wine Atlas:**
- Wine Atlas is geographic and terroir-focused. Service School is behavioral and practical.
- Wine Atlas uses deep burgundy as its primary identity color. Service School may need its own identity accent — **warm brass / amber** (#B8860B from Palette B) as the primary accent to distinguish it.
- Wine Atlas is content-dense and exploratory. Service School is structured and sequential.

---

## C. Relationship to Existing HESTIA Worlds

| World | Palette | Primary accent | Display font | Identity |
|---|---|---|---|---|
| Bar World | Palette A (dark) + editorial light inside | Gold #C9A96E | Playfair Display | Craft, expertise, technique |
| Classic Cocktails Magazine | Palette B | Amber #B8860B | Cormorant Garamond | Editorial warmth, depth |
| Wine Atlas | Palette B | Burgundy #6B2737 | Cormorant Garamond | Geography, terroir, connoisseurship |
| Service School | Palette B | **Warm brass #B8860B** | Cormorant Garamond | Formation, practice, professional identity |
| Daily Work | Palette A | Gold #C9A96E | Fraunces | Operational, functional, shift-driven |

**Service School sits closest to Wine Atlas** in visual language — both use Palette B, Cormorant Garamond, and the editorial card pattern. The distinction is accent color and emotional register.

**Service School is warmer and more behavioral** than Wine Atlas. Where Wine Atlas is contemplative and geographic, Service School is practical and human. The typography choices should reflect this — slightly larger body text, more generous line height, more space between lessons.

---

## D. Page Structure Recommendation

### The Service School Hub Page

This is the top-level Courses page, renamed HESTIA Service School.

---

**Section 1 — Masthead / Hero**

```
HESTIA · SERVICE SCHOOL
[eyebrow — DM Sans uppercase, 0.7rem, letter-spacing: 0.14em, color: amber]

The School Before the Shift
[Cormorant Garamond, 3–4rem, weight 600, color: #1A1612]

Short editorial statement (1–2 sentences only):
"Five disciplines. Five lessons each. Everything you need to be 
exceptional on the floor — nothing you don't."

[Inter, 1rem, color: #5A524A, max-width: 520px, line-height: 1.8]
```

**Rules:**
- No background photograph at launch (add only when real hospitality photography exists)
- Background: `#F7F3EC` (Palette B base) — the page is the environment
- No animated hero
- No CTA in the hero — the academies below are the primary action
- The hero is a statement, not a prompt

---

**Section 2 — Five Academies (Primary Content)**

Five editorial academy cards. Portrait orientation (3:4 ratio). Each card is a flagship module, not a progress widget.

**Card content (per academy):**
```
[EYEBROW: academy category — e.g., "SERVICE · 5 LESSONS"]
[DISPLAY: Academy title — Cormorant Garamond, 1.6rem]
[BODY: One emotional promise — Inter, 0.9rem, 2 lines max]
[DIVIDER: 1px solid #E0D8CC]
[PROGRESS: "0 of 5 lessons" or "3 of 5 lessons" — honest count only]
[CTA: "Begin" or "Continue" — burgundy ghost button]
```

**No fake progress.** If no progress exists: show nothing (no "0% complete"). Show "Begin this path" CTA only.

**Layout:** 2-column grid on desktop, 1-column on mobile. Academies in this order:
1. Service Academy
2. Arrival & Host Academy
3. Coffee Program
4. Culinary Intelligence
5. Hospitality Ethics & Privacy

---

**Section 3 — Continue Learning (conditional)**

This section appears **only if** the employee has real, non-zero lesson progress in any academy.

```
CONTINUE WHERE YOU LEFT OFF
[eyebrow label]

[Next lesson card — horizontal layout]
[Academy name] · [Lesson N of 5]
[Lesson title — Fraunces, 1.1rem]
[Short lesson purpose — Inter, 0.875rem]
[CTA: "Resume lesson"]
```

If no real progress exists: **this section does not render.** Do not show a placeholder.

---

**Section 4 — Philosophy Strip**

A brief editorial statement — a moment of breath between academy cards and the page close.

```
A NOTE ON WHAT THIS SCHOOL IS FOR
[eyebrow]

"Hospitality begins before the guest arrives. It exists in 
the arrangement of a glass, the pace of a greeting, the 
willingness to stay present when it would be easier not to. 
This school teaches the discipline behind that willingness."

[Cormorant Garamond Italic, 1.15rem, max-width: 600px, centered]
[color: #5A524A]
```

No CTA. No image. Just copy.

---

**What this page does NOT include:**
- Fake "75% of employees complete this path" statistics
- Any progress percentage displayed as a number
- Gamification elements (points, streaks, badges)
- A search bar for lessons
- Filter/sort controls
- Featured instructor carousel
- Auto-playing content
- Anything that is not grounded in real employee data

---

## E. Course / Academy Card Design Direction

Each academy card should feel like a premium editorial module cover — closer to a program brochure from a culinary school than a SaaS course card.

### Desktop Card Anatomy

```
┌─────────────────────────────┐
│ SERVICE · 5 LESSONS         │  [eyebrow — amber, 0.68rem uppercase]
│                             │
│ Service Academy             │  [Cormorant Garamond, 1.6rem, weight 600]
│                             │
│ The floor is where          │  [Inter, 0.9rem, 2 lines max, #5A524A]
│ hospitality lives.          │
│                             │
│ ─────────────────────────── │  [1px solid #E0D8CC]
│                             │
│ ○ ○ ○ ○ ○  3 of 5 lessons   │  [progress dots — 5 dots, filled/empty]
│                             │
│ [Continue →]                │  [Burgundy ghost button, 0.8rem]
└─────────────────────────────┘
```

**Card specifications (Editorial Card from SKILL.md):**
```css
background: #FFFFFF;
border-radius: 4px;
box-shadow: 0 1px 4px rgba(26,22,18,0.06);
padding: 32px;
min-height: 280px;
transition: box-shadow 200ms ease;

/* Hover */
box-shadow: 0 4px 16px rgba(26,22,18,0.10);
```

**Progress dots:**
- 5 dots, 8px diameter, 6px gap
- Completed: `background: #B8860B` (amber filled)
- Active: `background: #B8860B` + `box-shadow: 0 0 0 2px #B8860B` (amber ring)
- Remaining: `border: 1px solid #C8BFB0`, transparent background
- Never a percentage bar

**CTA behavior:**
- No progress: "Begin this path" → `background: #6B2737, color: #F7F3EC` (burgundy fill)
- Has progress: "Continue" → `border: 1px solid #6B2737, color: #6B2737` (ghost)
- Completed: "Review path" → `border: 1px solid #C8BFB0, color: #9A9088` (muted ghost)

---

## F. Lesson Card / Lesson List Design Direction

The 5-lesson view inside each academy should feel like a curated program — not a to-do list.

### Lesson Row Anatomy

```
  01  ○─────────────────────────────────────────────────
      The First 30 Seconds                    [Video] [7 min]
      Set the welcome before a word is spoken.
      Status: ✓ Completed
  
  02  ●─────────────────────────────────────────────────
      Reading the Table                        [Voice] [8 min]
      Learn to read a guest before they tell you anything.
      Status: In progress
  
  03  ─────────────────────────────────────────────────
      The Art of Silence                       [Reading] [7 min]  
      How to serve without interrupting.
      Status: Locked
```

**Lesson row specifications:**

```
Lesson number:    Fraunces, 0.75rem, color: #B8860B (amber)
Lesson title:     Fraunces, 1.05rem, weight 600, color: #1A1612
Short promise:    Inter, 0.875rem, color: #5A524A, line-height: 1.6
Format badge:     DM Sans uppercase, 0.65rem — "VIDEO" / "VOICE" / "READING"
                  No colored backgrounds — just subtle border pill
Duration:         Inter, 0.75rem, color: #9A9088
Status indicator: Dot icon (completed = amber filled, in-progress = amber ring, locked = empty)
```

**Format display rules:**
- Show "VIDEO" badge only when `status === 'video_ready'` and a real embedUrl exists
- Show "VOICE" when lesson has TTS narration support but no video
- Show "READING" as default
- Never show "VIDEO COMING SOON" or any production-status badge to employees

**Video status (internal, not shown to employees):**
The `needs_script / script_ready / in_production / video_ready` status is for the production team only. Employees see format options based on what is actually available.

**Lock/unlock state:**
- Locked lessons: `opacity: 0.5`, no hover effect, no CTA
- Unlocked lessons: full opacity, hover `border-color: #6B2737`
- Completed lessons: amber check mark (not an achievement badge — a quiet check)
- Active lesson: highlighted row, `border-left: 3px solid #B8860B`

---

## G. Typography Direction

### Display and Editorial
- **Academy name, hero headlines, lesson player titles:** Cormorant Garamond, weight 600–700, sizes 1.6rem–4rem
- **Card titles, section headers:** Fraunces, weight 500–600, sizes 1rem–1.4rem
- **Body text, descriptions, captions:** Inter, weight 400, 0.875rem–1rem, line-height 1.7–1.8
- **Eyebrow labels, format badges, status tags:** DM Sans (or Inter), uppercase, 0.65rem–0.7rem, letter-spacing 0.12–0.14em

### Rules
- Editorial serif (Cormorant Garamond) for display only — never body text
- Fraunces for card titles — warm but structured
- Inter for all body text — legible at service-floor reading conditions
- No fonts below 0.8rem for actionable text (buttons, labels)
- Minimum 1.7 line-height for all body text
- Maximum 680px content column width for lesson content
- Strong left alignment — never center-align body text

### Anti-patterns
- No Inter or Roboto as display fonts
- No uppercase body text
- No typography below 0.75rem for any visible label
- No mixing serif and sans in the same text block
- No color as the only hierarchy signal — size and weight must also differentiate

---

## H. Color and Material Direction

**Ground:** `#F7F3EC` — warm ivory, never pure white  
**Card surface:** `#FFFFFF` — white cards on ivory ground create natural depth  
**Border subtle:** `#E0D8CC` — hairline separators, card dividers  
**Border emphasis:** `#C8BFB0` — active states, focused elements  

**Primary text:** `#1A1612` — near-black with warmth (not pure black)  
**Secondary text:** `#5A524A` — descriptions, captions  
**Tertiary text:** `#9A9088` — disabled states, metadata  

**Accent — Service School identity:**  
`#B8860B` (Amber Gold from Palette B) — progress dots, active lesson borders, eyebrow labels, lesson numbers  
Rationale: Wine Atlas owns burgundy. Service School should carry amber as its identity accent, connecting it to Bar World's warmth without duplicating either world.

**Burgundy** (`#6B2737`) — CTAs (Begin, Continue, Resume) — shared with Palette B editorial standard  
**Burgundy muted** (`#8B4455`) — secondary accents, hover states  

**No neon.** No green/blue/purple gradients. No glassmorphism overlay patterns. No badge colors (gold, silver, bronze achievement palettes).

**Material feel:** The screen should feel like good paper. Warm, slightly textured (achieved through color tone, not CSS texture effects). Borders are hairlines. Shadows are breath, not drama.

---

## I. Motion and Interaction

**Entry animation:**
- Page load: sections fade up (translateY: 12px → 0, opacity: 0 → 1, duration: 300ms)
- Stagger between sections: 80ms delay
- Never bounce. Never spring. Never scale pop.

**Card hover:**
- `box-shadow: 0 4px 16px rgba(26,22,18,0.10)` — barely perceptible lift
- Duration: 200ms ease
- No scale transform. No border color flash.

**Tab/section switches:**
- Cross-fade (opacity transition). Never slide.
- Duration: 150ms.

**Lesson completion:**
- Dot transitions from empty → amber filled
- Subtle glow pulse on the amber dot: `box-shadow: 0 0 8px rgba(184,134,11,0.4)` for 600ms, then settles
- No confetti. No completion animation beyond the dot.

**Forbidden motions:**
- Parallax scrolling
- Rotation effects
- Progress bars that "fill" dramatically on load
- Entrance animations that draw attention to themselves
- Celebration animations beyond a single subtle glow

---

## J. Mobile Behavior

**Layout:**
- Single column. Academy cards stack vertically.
- No horizontal scroll. No tab overflow.
- Content column: 100% width minus 32px padding on each side

**Academy cards on mobile:**
- Full-width cards (not 3:4 portrait — adapt to horizontal on very narrow screens)
- Minimum touch target: 48px height for all interactive elements
- CTA buttons: full-width on screens below 480px

**Lesson list on mobile:**
- Full-width rows
- Lesson number + title on one line if possible
- Format badge and duration move to second line if needed
- Lock icon visible at right edge

**Progress dots on mobile:**
- Minimum 8px dot, 6px gap
- Never shrink below 6px

**Hero section on mobile:**
- Display headline: reduce to `clamp(2rem, 6vw, 3.5rem)` — never overflow viewport
- Deck text: max-width: 100%

**What must not exist on mobile:**
- Horizontal navigation with overflow/scroll (use a collapsed dropdown if needed)
- Floating action buttons over content
- Sidebar navigation of any kind
- Tooltips that require hover

---

## K. What to Protect

These are explicit constraints that must be honored in every phase of implementation:

1. **Do not break progress logic.** The `hospia.progress.{academyId}:{lessonId}` key format must not change. Any redesign works around existing progress, not through it.

2. **Do not fake videos.** The Video mode tab must not appear unless `status === 'video_ready'` with a real embed URL. No placeholder. No "coming soon."

3. **Do not fake completion.** Progress indicators must only reflect real employee progress from localStorage. Never show "75% of employees completed this" or similar invented social proof.

4. **Do not redesign LessonPlayer in Phase 11B–11D.** LessonPlayer visual polish is Phase 11F. The existing player continues to function during the shell and card redesign phases.

5. **Do not touch Bar World.** The Bar World feature and its Academy tab are independent. Service School redesign must not affect Bar World routing, components, or data.

6. **Do not touch Wine Atlas.** Same as Bar World. Independent feature, independent redesign.

7. **Do not re-add bar-academy or wine-academy to employee Courses.** These were deliberately removed. They belong in their respective worlds.

8. **Do not modify universityManifest.js during Phase 11B–11C.** The manifest is the source of truth for lesson data. Changes to the manifest require separate review.

9. **Do not modify TTS or instructor voice logic.** The existing InstructorTalkingHead and TTS infrastructure must be preserved. Phase 11E may polish the UI around it; the logic does not change.

---

## L. Implementation Translation

### Phase 11B — Courses Shell / Copy Refresh

**Files likely to change:**
- The Courses page component (rename visible copy to "HESTIA Service School")
- Any string literal that says "Courses" or "University" in the employee-facing UI
- Page title tag

**Files to protect:**
- `src/data/academy/universityManifest.js`
- `src/data/academy/universityExpansion.js`
- All lesson player components
- `src/features/academy/data/academyInstructorVideoMap.js`
- Progress hook and localStorage keys
- Routes (URL unchanged)

**Validation:** No routing changes. No data changes. Visual and copy changes only.

---

### Phase 11C — Premium Academy Card Redesign

**Target:** Replace generic course cards with editorial academy cards that match the design direction in Section E above.

**Files likely to change:**
- Academy card component (new visual treatment — do not modify data layer)
- Courses hub page layout (implement hero, 5-academy grid, philosophy strip)
- CSS/styling for Palette B variables if not already present

**Files to protect:**
- Progress logic (hook, localStorage)
- Manifest files
- LessonPlayer

**Validation:** Visual regression check against design direction. Confirm progress dots reflect real data. Confirm no fake stats appear.

---

### Phase 11D — 5-Lesson View Model

**Target:** Implement the 5-flagship-lesson display per academy in the employee-facing UI.

**Implementation approach:**
- Add `flagship: true` (or equivalent) to 5 chosen lessons per academy in manifest
- Academy view filters to flagship lessons by default
- Optional "Full curriculum" expander (hidden by default, low prominence)
- Lesson rows match design in Section F above

**Files likely to change:**
- `src/data/academy/universityManifest.js` or `universityExpansion.js` — add `flagship` flag
- Academy lesson list component — implement flagship filter
- Lesson row component — new visual treatment

**Files to protect:**
- Progress hook and localStorage keys
- Video map
- LessonPlayer

**Migration risk:** If `flagship` is added as a data field, the manifest change must not break existing lesson rendering for non-flagship lessons.

---

### Phase 11E — Video Production Metadata

**Target:** Implement video status metadata safely. Confirm Video tab only appears for `video_ready` lessons.

**Files likely to change:**
- `academyInstructorVideoMap.js` — update video status fields (extend to include `needs_script`, `script_ready`, `in_production`, `video_ready`)
- LessonPlayer mode selector — confirm Video tab conditional on `video_ready` + `embedUrl`

**Files to protect:**
- All video embed logic (do not break existing video_ready lessons)
- TTS/Voice mode logic
- Progress tracking

---

### Phase 11F — Lesson Player Visual Polish

**Target:** Apply editorial visual polish to LessonPlayer — typography, spacing, progress dots, instructor panel.

**Files likely to change:**
- LessonPlayer component and its children
- Instructor panel component
- Progress dot component

**Files to protect:**
- TTS logic
- Script generation
- Progress key format
- Video embed logic

**Constraint:** Do not change any behavior. Visual-only changes.

---

## M. Acceptance Criteria

The HESTIA Service School redesign is successful only if all of the following are true:

1. **Premium enough for Bar World and Wine Atlas.** Open all three in the same window. They should feel like siblings — same editorial language, different personalities. If Service School looks like a different product, reject and redesign.

2. **No LMS feel.** An employee who has never seen HESTIA before should not think "this looks like a training portal." They should think: "This looks like somewhere I want to spend time."

3. **3-second clarity.** An employee opens the page mid-shift with 3 minutes to spare. Within 3 seconds they know: what school this is, what the 5 paths are, and where their next lesson is. No reading required.

4. **No fake content.** Progress indicators reflect real data only. Video mode appears only for real videos. No invented statistics. No "N% of staff completed" social proof.

5. **Five academies feel distinct and valuable.** Each academy has a clear identity. An employee can describe the difference between Service Academy and Hospitality Ethics in one sentence.

6. **Typography is employee-readable.** This is not a design portfolio piece. It is used on a phone between prep and service. Body text is at least 0.9rem. Line height is at least 1.7. Nothing requires squinting.

7. **Amber accent is consistent and restrained.** Amber appears on: progress dots, active lesson borders, lesson numbers, eyebrow labels. Not on backgrounds. Not on body text. Not as a fill color for large surfaces.

8. **Burgundy CTAs are present, singular, and clear.** Each screen has one primary action. It has a burgundy CTA. Everything else is secondary or ghost.

---

## N. Self-Critique

Having written this design direction, here is an honest critique of its weaknesses:

**Does this still look too much like a course grid?**  
The 5-academy card grid risks looking like a standard LMS if the card treatment is not executed with sufficient ambition. The key is the editorial card proportion (3:4 portrait), the Cormorant Garamond title, and the extreme economy of information per card. If the cards feel like data widgets, the implementation failed.

**Is the design language premium enough?**  
The Palette B + Cormorant Garamond combination is genuinely editorial. The risk is in the details: if a developer defaults to `border-radius: 12px` or adds a colorful gradient background, it immediately feels like a consumer app. The specifications above must be followed exactly. No arbitrary rounding. No gradients on cards.

**Is the visual hierarchy strong enough?**  
The hero section (Cormorant Garamond headline, amber eyebrow, Inter deck) establishes hierarchy at the page level. The card-level hierarchy (eyebrow → title → promise → progress → CTA) is clear in the specification. The risk is the lesson list level — which currently specifies a Fraunces title with amber number and Inter promise. This needs to feel intentional, not like a simple list. Consider adding more generous padding between lesson rows.

**Is the typography employee-readable?**  
Inter at 0.875rem with 1.7 line-height should be readable. The risk is on mobile — Cormorant Garamond at large sizes can become difficult to read on low-quality screens. The `clamp()` sizing recommendation handles this partially. Confirm with real device testing in Phase 11C.

**Does it feel like HESTIA, not a copied MasterClass clone?**  
The choice of Palette B (light) rather than MasterClass's dark palette creates immediate differentiation. The amber accent (vs. MasterClass's white-on-black) adds warmth that MasterClass lacks. The absence of celebrity photography (replaced by editorial typography and card structure) makes it distinctly HESTIA. The risk is that the academy cards, if given background colors or photographs, might start to look like MasterClass chapter thumbnails. Keep cards white on ivory — editorial, not cinematic.

**Does it connect to Bar World and Wine Atlas without becoming identical?**  
Bar World is dark; Service School is light — already differentiated. The connection to Wine Atlas is stronger, since both use Palette B. The differentiation is: amber accent (Service School) vs. burgundy accent (Wine Atlas), and behavioral/practical content vs. geographic/connoisseur content. This differentiation should be sufficient. The most important connecting element is the shared editorial voice, not the visual appearance.

**What should be improved before implementation?**  
1. A real photography art direction brief should be written before Phase 11C. What does a Service School hero look like when we have real images? What kind of hospitality photography serves the brand? This prevents the common error of adding stock photography as a placeholder.  
2. The lesson row design should be prototyped in Figma or at minimum a high-fidelity mockup before development begins. The description above is clear but the execution requires visual judgment.  
3. The mobile version needs a dedicated design pass. The specification above addresses it but does not give it the same depth as the desktop layout.  
4. The "Continue Learning" section design needs more specificity — particularly how to handle a user who has progress in multiple academies simultaneously.

---

---

## O. Academy-Specific Visual Worlds

**Source:** Derived from `docs/academy/research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md`, filtered through HESTIA design system.  
**Integration date:** 2026-06-06

Each academy within Service School must feel like a distinct professional world — not just a differently-labeled card. The visual metaphor governs: the editorial cover tone, photographic art direction (when real images exist), the materiality language in lesson content, and any future interactive drill UI.

All academies use **Palette B (Editorial Light)** as the shared system. The differentiation is through materiality metaphor, accent application, and content tone — not through divergent palettes.

---

### Service Academy

**Visual metaphor:** The dining room as choreography stage.  
**Materiality:** Crisp white tablecloths fresh from the press. Fine porcelain catching soft overhead light. Polished silver cutlery. Low, warm ambient light that hides nothing and flatters everything.  
**Cover tone:** Near-dark dining room with a single table lit precisely. The stillness before service begins.  
**Accent expression:** Amber (#B8860B) used at moments of discipline — the progress dot that marks a difficult lesson completed, the lesson number on a particularly demanding drill.  
**Typography register:** Cormorant Garamond display, formal and precise. Inter body, legible at arm's length.  
**What to avoid:** Casual restaurant photography. Smiling waitstaff with menus. Bright cheerful tones. The visual must carry weight and seriousness — this is a world where excellence is expected, not celebrated noisily.

---

### Arrival & Host Academy

**Visual metaphor:** The threshold as a ritual space.  
**Materiality:** A hand-bound leather reservation ledger, still and authoritative. Clean architectural drawings of a dining room floor plan. Polished stone flooring catching indirect evening light. Warm brass fixtures, unhurried.  
**Cover tone:** The entrance hall before guests arrive. The host stand, unoccupied. Everything in place. Readiness without urgency.  
**Accent expression:** Amber used on the lesson number, the first dot (First Door Authority) — the start of the guest journey mapped visually as the start of the lesson sequence.  
**Typography register:** Cormorant Garamond for the academy name — "Arrival & Host Academy" should feel like a title in a hotel's staff handbook, elegant and serious. Fraunces for lesson card titles. Inter for body.  
**What to avoid:** Reservation software screenshots. Notification-style UI. Bright alert colors. Spreadsheet aesthetics. The anti-aesthetic here is "administrative call center."

---

### Coffee Program

**Visual metaphor:** The espresso machine as precision instrument.  
**Materiality:** Matte stainless steel commercial espresso machine under clean white light. Polished dark chrome grinder. The glossy brown surface of a crema just formed. Steam wand vapor caught mid-curl.  
**Cover tone:** Early morning prep light — cool, clear, focused. The coffee station before service opens.  
**Accent expression:** Amber expresses particularly well against the coffee program's materiality — the amber of crema, of dark roast, of morning light. Lesson progress dots feel earned because each lesson is a calibration step.  
**Typography register:** The Coffee Program has a slightly more technical typographic register than Service Academy — lesson titles should carry precision (CP-1 through CP-5 have a specificity to them). Fraunces for card titles, Inter for body.  
**What to avoid:** Cartoon coffee cup graphics. Bright color palettes. Lifestyle coffee photography (latte art on a marble table, flat lay Instagram aesthetics). The reference is a professional kitchen, not a specialty café Instagram feed.

---

### Culinary Intelligence

**Visual metaphor:** The pass as a translation point between worlds.  
**Materiality:** The service pass — that narrow counter between the kitchen's controlled chaos and the dining room's calm. White china plates. Clean blue steel. The moment a dish crosses from BOH to FOH.  
**Cover tone:** The pass illuminated from above. Clean, bright, purposeful. The kitchen in the background, suggestion only — not the full BOH world, but its presence.  
**Accent expression:** Amber on lesson numbers and progress dots. The culinary world connects to Bar World's warmth without being Bar World — amber is the right connective thread.  
**Typography register:** Daniel's persona (or the future dedicated culinary persona) should feel authoritative but approachable. The Culinary Intelligence lessons are about translation — turning kitchen knowledge into guest-facing language. Typography should reflect this: precise (Fraunces headers) but warm (Inter body at generous line height).  
**What to avoid:** Full BOH/kitchen aesthetics. Heavy industrial textures. Recipe-card layouts. Food photography that belongs on a menu, not in a professional school.

---

### Hospitality Ethics & Privacy

**Visual metaphor:** The quiet guardian — present, watching, invisible.  
**Materiality:** The space between tables. The peripheral vision of a skilled server. Not an object — a posture. A slight turn of the head. The dining room seen from the edge, never from the center.  
**Cover tone:** The dining room from a standing position at the edge of the room. Guests at tables, not the subject — the awareness of them is the subject. Warm, quiet, watchful.  
**Accent expression:** Amber used most sparingly here — Ethics & Privacy is the most understated academy. The accent appears only in the lesson number and the single active progress dot. Never as decoration.  
**Typography register:** Mira's persona (or the dedicated Ethics persona) speaks with calm authority and no performance. Typography should feel the same: Cormorant Garamond for the academy display name (carrying ethical weight), Inter for all lesson content (legible, plain, direct).  
**What to avoid:** Any HR-portal aesthetic. Legal compliance typography (dense paragraph blocks, numbered regulations, warning-colored tags). Bright status indicators. Any visual that communicates surveillance rather than care.

---

### Bar Course (inside Bar World)

**Visual metaphor:** The well as a workspace of craft.  
**Materiality:** Heavy crystal glassware backlit. Hand-cut clear ice blocks. Polished unlacquered brass bar rail. Single-source lighting casting long controlled shadows. The bar after close — clean, organized, authoritative.  
**Cover tone:** Bar World dark palette — Palette A (#0D0D0D base, #C9A96E gold accents). This is the only Service School-adjacent context that uses Palette A. Bar Course is inside Bar World, not Service School — it inherits Bar World's visual identity entirely.  
**Accent expression:** Gold (#C9A96E) — Bar World standard. Not amber. The distinction between amber (Service School) and gold (Bar World) must be maintained.  
**Typography register:** Playfair Display for Bar World cover/display. Fraunces for Bar Course lesson cards. DM Sans for body and UI. JetBrains Mono for spec data (ratios, temperatures, measurements).  
**What to avoid:** Vibrant neon colors. Flat clip-art cocktail illustrations. Corporate dashboard UI. Anything that looks like a training platform instead of a premium bar journal.

---

### Visual World Differentiation Matrix

| Academy | Palette | Primary Accent | Cover Tone | Materiality Anchor |
|---|---|---|---|---|
| Service Academy | B (Light) | Amber #B8860B | Dining room at rest | White tablecloths, porcelain, silver |
| Arrival & Host | B (Light) | Amber #B8860B | Entrance hall, pre-service | Leather ledger, stone floor, architectural plan |
| Coffee Program | B (Light) | Amber #B8860B | Morning prep light | Espresso machine, chrome grinder, crema |
| Culinary Intelligence | B (Light) | Amber #B8860B | The pass, mid-service | Blue steel, white china, kitchen light |
| Hospitality Ethics | B (Light) | Amber #B8860B (sparse) | Dining room edge | Peripheral awareness, quiet posture |
| Bar Course | A (Dark) | Gold #C9A96E | Bar after close | Crystal glass, brass rail, clear ice |

**Palette A vs Palette B is the hard line.** Service School = Palette B throughout. Bar World (including Bar Course) = Palette A throughout. Never mix.

---

*This document is a design authority document. All implementation decisions in Phases 11B–11F must reference it. If a design decision is not covered here, add it here before implementing. Do not invent visual decisions in code.*
