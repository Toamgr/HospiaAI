# HESTIA Academy — AI Instructor Experience

**Design specification — v1.0**
**Status:** Design strategy. No code, no implementation. To be built by Claude Code in a later phase.
**Owner:** Toam Griffel
**Date:** 2026-05-19
**Scope:** The lesson-level Instructor experience inside HESTIA Academy. Catalog, search, course-level structure, and assessment scoring are out of scope.

---

## 0. How to read this document

This is a design specification, not a wireframe pack. It is written so a careful builder — human or Claude Code — can implement the experience without inventing decisions. Where the document specifies a value (a color, a duration, a spacing step), the value is a starting point that should be promoted to a real design token before code is written. Where the document specifies a behavior, the behavior is required.

Three rules govern everything below:

1. The Instructor is the emotional center of the lesson. Every layout, animation, and copy choice serves the feeling of being personally guided.
2. The product is hospitality, not e-learning. We do not borrow patterns from Coursera, Udemy, Khan Academy, LinkedIn Learning, or corporate LMS systems. We borrow patterns from luxury hotel pre-arrival emails, fine dining tasting menus, and editorial hospitality magazines.
3. We never fabricate. If a lesson has no transcript, we do not invent one. If a video fails, we say so plainly and offer a graceful path. If TTS is unavailable, we do not pretend. Every fallback is dignified.

---

## 1. The promise (one sentence)

> When a team member opens a lesson, a calm, named hospitality mentor greets them, teaches them with their own voice, and stays with them until the practice is real.

If the experience does not deliver that single sentence, the experience is wrong.

---

## 2. Design principles

Seven principles that every decision must pass. If a feature, animation, or copy line fails one of these, it does not ship.

**P1. Hosted, not delivered.** Lessons are hosted by an instructor, not delivered by a platform. The instructor's name and presence appear before anything else.

**P2. Calm over busy.** The screen breathes. White space is a material, not waste. Nothing moves unless it must.

**P3. One voice at a time.** Only one element speaks at a time — the instructor. Notifications, badges, and chrome step back when the lesson is playing.

**P4. Earnable trust.** Confidence labels, source signals, and "professional video / voice-guided" status are visible but quiet. We never overstate what the lesson is.

**P5. Hospitality grammar.** Copy uses warmth, invitation, and host language ("Welcome behind the bar," "Come in, the table is ready"). It never uses transactional learning language ("Start course," "Complete module," "Earn XP").

**P6. Material honesty.** Brass looks like brass, marble looks like marble, paper looks like paper. We avoid glossy gradients, neon glow, plastic skeuomorphism, and generic SaaS purple.

**P7. Future-readiness without compromise.** The system must accommodate professional video on every lesson eventually, but must not feel half-built today. Voice-guided lessons must feel finished, not like placeholders.

---

## 3. Visual identity

### 3.1 Material direction

The Academy is a series of small, distinct **rooms** — each academy is a room with its own light, materials, and air. The instructor is the host of that room.

Reference language (mood, not literal):

- Aman Tokyo / Aman Kyoto interiors — calm, monastic, premium
- The hospitality letters of fine hotels — Le Bristol, The Connaught, Hotel Eden Rome
- Editorial publications — *Cereal*, *The Gentlewoman*, *Drift*, *Apartamento*
- Fine dining menus — Geranium, Septime, Mirazur — paper-forward, typographic, restrained
- Cinema of stillness — Wong Kar-wai night interiors, Sofia Coppola interiors

What we are **not** referencing: Duolingo, MasterClass marketing pages, Headspace illustration style, generic dashboard SaaS, gamified streak UI.

### 3.2 Color system

HESTIA has a single base palette. Each academy has a single accent that lives inside the base, never replacing it. The base is consistent across the app; the accent is what makes a room feel like a room.

**Base palette (HESTIA core — proposed starting values, to be promoted to tokens):**

| Token | Proposed value | Role |
|---|---|---|
| `color/surface/canvas` | #14110F | Page background — deep, warm, near-black with brown |
| `color/surface/elevated` | #1C1815 | Cards, panels, transcript area |
| `color/surface/inset` | #0F0C0A | Stage frame, focus surfaces |
| `color/surface/paper` | #F5EFE5 | Light surfaces, document panes, parchment moments |
| `color/text/primary` | #F5EFE5 | Body and display text on dark surfaces |
| `color/text/secondary` | #B9AE9E | Captions, metadata, transcript inactive lines |
| `color/text/tertiary` | #6D655B | Far-future transcript lines, timestamps |
| `color/text/inverse` | #14110F | Text on paper surfaces |
| `color/line/hairline` | #2A2522 | 1px dividers, frame borders |
| `color/brass/100` | #E4C892 | Highlight, current sentence accent |
| `color/brass/200` | #C9A875 | Primary accent, line spotlights |
| `color/brass/300` | #9C8255 | Pressed/active accent |
| `color/signal/positive` | #7A8F6E | Quiet sage, used for "complete" |
| `color/signal/caution` | #C2A368 | Quiet amber, used for "video unavailable" |
| `color/signal/critical` | #B6605C | Reserved, used only for true errors |

**Academy accents (each replaces only the `color/accent/*` slot in that room):**

| Academy | Primary accent | Secondary accent | Mood word |
|---|---|---|---|
| Bar | Smoked amber #C8852D | Brass #C9A875 | Burnished |
| Service | Warm linen #E8D9C2 | Soft rose #D9A8A0 | Embracing |
| Wine | Deep burgundy #6E2A2E | Terracotta #B2664A | Velvet |
| Manager | Quiet navy #2C3A4A | Brushed steel #8B8F92 | Composed |
| Events | Champagne #D4B98C | Midnight blue #1C2B45 | Choreographed |
| Coffee | Crema #D9B98F | Warm cocoa #6B4A36 | Grounded |

Rule: the accent appears in the academy badge, the current-sentence highlight on the transcript, the progress fill, and the instructor name underline. It never appears as a full button fill, a banner, or a panel background. Restraint is what makes it feel premium.

### 3.3 Typography

We use a three-typeface system. All values are proposals to be tokenized.

- **Display serif** (lesson titles, persona names, academy headers): a refined contemporary serif with editorial weight. Proposed: *Recoleta*, *Tiempos Headline*, or *GT Sectra Display*. The serif is the voice of the host.
- **Body sans** (transcript, takeaways, controls, all running UI): a warm humanist sans. Proposed: *Söhne*, *GT America*, or *Inter* if licensing constrains. Tracking slightly opened. Line-height generous.
- **Micro sans** (timestamps, captions, "0:42 / 4:10"): a tabular variant of the body sans, or a tabular figure setting. Optical size small.

**Type scale (proposed):**

| Token | Size / line / weight | Usage |
|---|---|---|
| `font/display/lesson-title` | 40 / 48 / 400 serif | Lesson title in header |
| `font/display/persona-name` | 24 / 32 / 400 serif | Instructor name on card |
| `font/label/academy` | 12 / 16 / 500 sans, +0.16em tracking, uppercase | Academy badge |
| `font/body/transcript-active` | 22 / 34 / 500 sans | The currently spoken sentence |
| `font/body/transcript-context` | 18 / 30 / 400 sans | Past and upcoming sentences |
| `font/body/takeaway` | 17 / 28 / 500 sans | Key takeaway lines |
| `font/body/review-question` | 18 / 28 / 400 sans | Review question text |
| `font/micro/timestamp` | 13 / 16 / 500 tabular | Time, duration, progress |
| `font/micro/caption` | 13 / 18 / 400 sans | Metadata, status, mode label |

Rule: never set transcript at body weight 400 — the active sentence must have weight 500 minimum to read as "spoken." Never use italic for emphasis in transcript; use brass color and weight only.

### 3.4 Photography & illustration direction

Two acceptable forms only.

- **Cinematic portrait stills** of the instructor in their room (when professional video exists) — shallow depth of field, warm light, never stock photography, never smiling at the camera.
- **Illustrated portraits** in a hand-drawn editorial line style (when voice-only) — single-color ink with brass highlight, similar in voice to *The New Yorker* spot illustrations or hand-drawn restaurant menu portraits. Never cartoon, never 3D, never "AI avatar generic."

No flat geometric illustration. No Memphis. No isometric. No abstract gradient blobs. No emoji.

### 3.5 Iconography

We need very few icons. The lesson screen uses at most six icons: play, pause, restart, back, mode switch, and ellipsis (overflow). All icons share a single line style — 1.5px stroke, rounded caps, 24×24 grid, brass color on dark surfaces. Filled icons are forbidden. No icon ever appears next to a takeaway, a transcript sentence, or a review question — these are typographic moments only.

---

## 4. Motion principles

Motion in the Academy is "hospitality pace" — slow enough to feel hosted, fast enough to feel responsive.

**Core curves (proposed tokens):**

| Token | Cubic-bezier | Use |
|---|---|---|
| `motion/ease/host` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default for entrances, fades, opens |
| `motion/ease/settle` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Settling into place, controls |
| `motion/ease/whisper` | `cubic-bezier(0.4, 0, 0.2, 1)` | Subtle adjustments |
| `motion/ease/exit` | `cubic-bezier(0.4, 0, 1, 0.7)` | Departures, dismissals |

**Durations (proposed tokens):**

| Token | Value | Use |
|---|---|---|
| `motion/duration/instant` | 120ms | Hover lift, focus ring |
| `motion/duration/soft` | 240ms | Caption highlight, takeaway reveal |
| `motion/duration/host` | 360ms | Panel opens, mode switches |
| `motion/duration/scene` | 600ms | Stage fade-ins, persona introductions |
| `motion/duration/breath` | 5200ms | Idle breathing on portrait |

**Forbidden motion:** bounce, elastic, overshoot, spinning loaders, flashing badges, parallax that triggers on scroll, kinetic typography that scrubs with scroll, confetti, particle bursts, streak flames, "level up" animations.

**Required motion:** the idle portrait must breathe (subtle opacity / scale cycle, never exceeding 1.5% scale change, 5.2s loop, eased). The current transcript sentence must fade-in its brass underline over 240ms. The stage must fade from black on start, never cut.

---

## 5. The Instructor Character System

Every instructor is a **character**, not a category. A character has a name, a voice, a room, a way they open and close a lesson, and a small set of phrases that recur across lessons so learners feel a relationship build over time.

### 5.1 Persona schema

Every persona record has these fields. This schema is part of the implementation contract.

```
persona {
  id                       // 'bar-rafael', 'service-mira', etc.
  academy                  // 'bar' | 'service' | 'wine' | 'manager' | 'events' | 'coffee'
  display_name             // 'Rafael'
  display_title            // 'Maître Bartender'
  short_bio                // one sentence, hospitality-voiced
  portrait_illustrated     // ref to illustrated portrait asset
  portrait_video_poster    // ref to cinematic still, used for video-loading frame
  accent_color_token       // points at academy accent
  stage_backdrop_token     // visual motif token, see §7.2
  tts_voice_profile        // { lang, voice_name_candidates[], rate, pitch }
  greeting_phrases[]       // 2–4 opening lines, rotated by lesson type
  closing_phrases[]        // 2–4 closing lines
  signature_phrase         // a single phrase only this instructor says
  tone_descriptors[]       // taxonomy tags used by future AI generation
}
```

Rule: every persona must have **at least one greeting and one closing** before it ships. If we cannot write them with conviction, the persona is not ready.

### 5.2 The six personas

Names below are **proposals**. Treat them as starting points. Final names are Toam's call; the system must accept renaming without code change (names are data, never strings in components).

#### 5.2.1 Bar Academy — Rafael, Maître Bartender

- **Short bio:** "Twenty years behind the bars of three continents. Teaches the craft like he pours — quietly, exactly."
- **Tone descriptors:** elegant, precise, calm, confident, world-class cocktail hospitality.
- **Voice profile:** warm baritone, Mediterranean cadence, unhurried.
- **Accent color:** smoked amber on brass.
- **Stage backdrop:** dim luxury bar — dark walnut shelving, a single glass on marble, a brass lamp out of focus. Art Deco lines, never themed.
- **Greeting phrases:**
  - "Welcome behind the bar."
  - "Glass in hand — let's begin."
  - "A few minutes of craft, and then the floor is yours."
- **Closing phrases:**
  - "Until our next pour."
  - "The bar will remember you."
  - "Practice it once tonight. Just once."
- **Signature phrase:** "The guest already knows when a drink is rushed."

#### 5.2.2 Service Academy — Mira, Director of Hospitality

- **Short bio:** "Born into a family that hosted everyone. Believes a perfect service is one no one notices."
- **Tone descriptors:** warm, calm, emotionally intelligent, maternal in care without being soft on standards.
- **Voice profile:** warm alto, measured pace, smiles in tone.
- **Accent color:** warm linen with soft rose.
- **Stage backdrop:** refined dining room at the hour before service — candle just lit, napkin folded mid-action, soft light through a curtain.
- **Greeting phrases:**
  - "Come in. The table is ready."
  - "Let's host this lesson together."
  - "A quiet minute before service — this is yours."
- **Closing phrases:**
  - "I'll see you on the floor."
  - "Hold the warmth. The rest will follow."
  - "Carry this with you tonight."
- **Signature phrase:** "We don't serve guests. We host people."

#### 5.2.3 Wine Academy — Hélène, Head Sommelier

- **Short bio:** "Started in a cellar in Beaune. Teaches wine the way one teaches reading — patiently, sense by sense."
- **Tone descriptors:** refined, educational, elegant, clear, sensory.
- **Voice profile:** precise mezzo-soprano, gentle French cadence even in English, never lecturing.
- **Accent color:** deep burgundy on terracotta.
- **Stage backdrop:** wine room — oak rack out of focus, one glass on a stone counter, amber light.
- **Greeting phrases:**
  - "Let's taste together."
  - "Bring your nose. The rest follows."
  - "Five minutes of the wine, and you will see it differently."
- **Closing phrases:**
  - "Trust your palate."
  - "Now pour one for yourself, after shift."
  - "Until the next bottle."
- **Signature phrase:** "Every wine is somebody's afternoon."

#### 5.2.4 Manager Academy — Daniel, Head of Operations

- **Short bio:** "Ran rooms for eighteen years before he wrote anything down. Teaches managers to lead quietly."
- **Tone descriptors:** calm authority, strategic, practical, team-focused.
- **Voice profile:** calm baritone, measured, never raised.
- **Accent color:** quiet navy on brushed steel.
- **Stage backdrop:** an operations table at the quiet hour — espresso cup, a closed notebook, soft window light, a single chair pulled out as if for the learner.
- **Greeting phrases:**
  - "Sit with me for a minute."
  - "Let's plan the shift before it plans us."
  - "One thought before the door opens."
- **Closing phrases:**
  - "Lead quietly."
  - "The team will read your calm before they read your words."
  - "See you at pre-shift."
- **Signature phrase:** "Pressure is something you absorb, never pass."

#### 5.2.5 Events Academy — Noa, Events Director

- **Short bio:** "Has run rooms for ten people and rooms for three thousand. Same calm in both."
- **Tone descriptors:** organized, calm under pressure, operational, precise, hospitable.
- **Voice profile:** warm mezzo, controlled energy, brief sentences.
- **Accent color:** champagne on midnight blue.
- **Stage backdrop:** an elegant event floor pre-service — a floor plan partially unrolled, one chair perfectly placed, the room waiting.
- **Greeting phrases:**
  - "Let's walk the room."
  - "Three thousand guests or thirty — the room is the same kind of quiet."
  - "Before the doors open, this minute is ours."
- **Closing phrases:**
  - "Calm hands, full room."
  - "Walk the floor once before you call it ready."
  - "I'll see you at load-in."
- **Signature phrase:** "Every event is a piece of choreography no one will notice if it works."

#### 5.2.6 Coffee Academy — Theo, Head of Coffee

- **Short bio:** "Roasts on Mondays, dials in on Tuesdays, teaches on Wednesdays. Believes coffee is a daily act of attention."
- **Tone descriptors:** warm, precise, approachable, sensory, technical but human.
- **Voice profile:** light warm tenor, curious, slightly informal but always craft-respectful.
- **Accent color:** crema on warm cocoa.
- **Stage backdrop:** specialty bar at morning light — a single shot pulling, a clean tamper, daylight through a high window.
- **Greeting phrases:**
  - "Let's dial in."
  - "First taste of the morning — here it is."
  - "A few minutes at the machine, then back to the day."
- **Closing phrases:**
  - "Stay curious."
  - "Pull one more before service. For yourself."
  - "Until the next dial-in."
- **Signature phrase:** "Coffee is attention you can drink."

---

## 6. Layout hierarchy

The lesson screen is one screen, scrollable on mobile, mostly fixed on desktop. There is no sidebar, no breadcrumb chain longer than two steps, no in-screen tab strip. The hierarchy from top to bottom on desktop is:

1. **Lesson Header** — academy badge, lesson title, persona greeting line.
2. **Instructor Stage** — the video frame or the portrait stage. Always the visual anchor.
3. **Lesson Control Bar** — play, pause, restart, back, mode switch. Sits directly under the stage.
4. **Companion column** (right of stage on desktop, below stage on tablet/mobile) — Transcript Panel.
5. **Key Takeaways** — after the transcript, in a quieter card.
6. **Review Questions** — at the bottom, in a paper-surface card.
7. **Progress Indicator** — a thin brass line, persistent at the bottom edge of the stage on desktop, top of the screen on mobile.

### 6.1 Desktop grid (≥ 1024px)

12-column grid, 1440px max content width, 32px gutter.

```
┌─────────────────────────────────────────────────────────────────┐
│  [back ←]   BAR ACADEMY · Lesson 03                              │
│  How to build a Martini, calmly                                 │
│  "Welcome behind the bar." — Rafael                              │
├─────────────────────────────────────────────────────────────────┤
│                                       │                          │
│                                       │  Transcript              │
│        ┌──────────────────────────┐   │  ─────────────           │
│        │                          │   │  (past sentence)         │
│        │      INSTRUCTOR STAGE    │   │  ⟶ current sentence ⟵   │
│        │      (video or portrait) │   │  (next sentence, dimmer) │
│        │                          │   │  (further, dimmest)      │
│        └──────────────────────────┘   │                          │
│        ▰▰▰▰▱▱▱▱▱▱  02:14 / 04:38      │                          │
│        ▶  ⏸  ↺  ↩    [Voice ▾]       │                          │
│                                       │                          │
├─────────────────────────────────────────────────────────────────┤
│  Key takeaways                                                   │
│  ─── three to five lines, never numbered, brass markers ───      │
├─────────────────────────────────────────────────────────────────┤
│  Review with Rafael                                              │
│  ── two to four questions, paper surface, no scoring chrome ──   │
└─────────────────────────────────────────────────────────────────┘
```

Columns:
- Stage: columns 1–7 (58%), 16:9 stage frame inside.
- Transcript: columns 8–12 (42%).
- Key Takeaways and Review Questions span all 12 columns below.

### 6.2 Tablet grid (768–1023px)

Single column. Stage at top (16:9 full width). Transcript collapses to a **horizontal "current line ribbon"** directly under the stage — a single tall line that shows the active sentence, with a "Show full transcript" disclosure. Takeaways and Review questions stack below.

### 6.3 Mobile (< 768px)

Single column. Stage at top (16:9). Below stage: the active sentence as a quiet typographic moment (no panel chrome). Tapping the active sentence opens the full transcript as a bottom sheet. Controls are sticky at the bottom of the viewport in a slim, glassy bar. Progress is a 2px brass line at the top of the viewport, never the bottom.

Why: shift staff use HESTIA one-handed during breaks. The bottom controls match thumb reach; the top progress line is glanceable without changing posture.

### 6.4 Component hierarchy

```
<AcademyLessonScreen>
  ├── <LessonHeader>
  │     ├── <BackAffordance/>
  │     ├── <AcademyBadge academy />
  │     ├── <LessonTitle/>
  │     └── <PersonaGreetingLine persona />
  │
  ├── <InstructorStage mode={video|portrait}>
  │     ├── <VideoStage videoSource/>          // mode === 'video'
  │     │     ├── <StageFrame/>
  │     │     ├── <EmbeddedVideoSurface/>
  │     │     └── <StageOverlayChrome/>        // brand frame, never iframe-default
  │     │
  │     ├── <PortraitStage persona transcript> // mode === 'portrait'
  │     │     ├── <StageFrame/>
  │     │     ├── <IllustratedPortrait persona breathing/>
  │     │     ├── <AmbientWaveformLine speaking/>
  │     │     └── <SpokenCaption activeSentence/>
  │     │
  │     ├── <ProgressLine/>                    // brass thread under stage
  │     └── <LessonControlBar>
  │           ├── <PlayPauseControl/>
  │           ├── <RestartControl/>
  │           ├── <BackToLessonControl/>
  │           └── <ModeSwitcher availableModes/> // when more than one mode exists
  │
  ├── <TranscriptPanel transcript activeIndex/>
  │     └── <TranscriptSentence state={past|active|upcoming|future}/>
  │
  ├── <KeyTakeawaysPanel takeaways/>
  │     └── <TakeawayLine/>
  │
  └── <ReviewQuestionsPanel questions persona/>
        └── <ReviewQuestion expandable/>
```

Rule: this component tree maps to the existing HESTIA features pattern (`src/features/academy/instructor/`). All state belongs in a single hook (proposed: `useAcademyInstructorSession`) — never in components, never in App.jsx (per CLAUDE.md). All intelligence (sentence timing, mode resolution, fallback selection) belongs in a service (proposed: `academyInstructorService.js`) — never in components, never in the hook beyond orchestration.

---

## 7. Component specifications

### 7.1 LessonHeader

**Purpose:** Set the room before anything happens. The first thing the learner sees is the host's voice in text form.

**Layout:**
- Back affordance — `← Back to Lesson` — left-aligned, micro-typography, brass underline on hover. 13px tabular sans.
- Academy badge — small uppercase label with academy accent dot, e.g. `● BAR ACADEMY · LESSON 03`. 12px tracking +0.16em.
- Lesson title — display serif, two-line max. Wraps but never truncates with ellipsis; long titles wrap to three lines on mobile and the layout absorbs them.
- Persona greeting line — italic-feeling serif at body size, prefixed with an em-dash and persona name. Example: `"Welcome behind the bar." — Rafael`. This line is the **first** instructor presence on the screen, before the stage even loads.

**Spacing:**
- 48px top padding desktop, 24px mobile.
- 16px between badge and title.
- 12px between title and greeting line.
- 64px below header before stage.

**States:**
- Default — as above.
- Loading (lesson data fetching) — title is a paper-toned shimmer, greeting line is the persona's first greeting (loaded from persona record locally — personas never depend on lesson fetch).
- Error (lesson failed to load) — title replaced with quiet message: "We can't reach this lesson right now. The kitchen is checking. — Mira."

**Accessibility:**
- The back affordance is the first focusable element.
- The academy badge is `role="img"` with an `aria-label` of `"Bar Academy, Lesson 3"`.
- The greeting line is decorative; screen readers announce the lesson title first.

### 7.2 InstructorStage

**Purpose:** The visual anchor and emotional center. It is always 16:9, always framed.

**Universal stage frame:**
- 1px hairline `color/line/hairline` border.
- 2px outer brass glow at `color/brass/200` with 8% opacity — visible only when playing.
- 8px inner inset shadow to imply depth.
- 12px corner radius. Not rounded, not square.
- Internal padding: **zero**. The stage content fills the frame.

**Below-stage progress line:** A 2px brass thread that fills from left as the lesson plays. Never animated faster than 60fps. Never shows a timestamp tooltip — timestamps live in the control bar.

#### 7.2.1 VideoStage (mode = professional video or uploaded MP4)

- The embedded surface (Synthesia iframe, native `<video>` element, or future provider) sits inside the stage frame.
- **Native browser controls are hidden.** HESTIA's own control bar drives the video. The video element exposes only its surface.
- Loading state: stage is filled with the persona's `portrait_video_poster` still, with a slow 800ms fade-in from `color/surface/inset`. The persona name appears as a serif word-mark in the bottom-left of the stage, with a brass underline, for the first 1.2 seconds, then fades.
- Buffering during playback: a 2px brass shimmer travels left-to-right inside the progress line. No spinner overlays the stage.
- Errors:
  - Provider unreachable → see §10.
  - Region/CORS blocked → see §10.
  - Video missing → graceful fallback to PortraitStage if voice mode exists; otherwise to ReaderMode.

#### 7.2.2 PortraitStage (mode = local TTS / voice-guided)

This is the most design-sensitive surface in the entire Academy. It is the difference between "premium hospitality mentor" and "robot reads at you." Every detail below is mandatory.

**Composition inside the stage frame:**

- A **single illustrated portrait** of the persona, centered slightly left of center (golden ratio horizontal). Hand-drawn ink line style with a single brass highlight. The portrait shows the instructor in their room — Rafael behind the bar, Mira at the table edge, Hélène with a glass.
- The room behind the portrait is rendered as a low-saturation, slightly defocused environment — the **stage backdrop motif** for that academy. The backdrop has soft inner light from one side (warm window light for Theo, candle light for Mira, brass lamp glow for Rafael).
- A **single ambient line** runs across the lower third of the stage — a horizontal waveform-style ink stroke that gently responds to the voice. **It does not bounce.** It breathes. The amplitude is capped at ±4px from baseline. It is the only animated element while voice is playing besides the portrait breathing and the caption.
- The **current spoken sentence** appears as a typographic caption in the lower third of the stage, above the waveform line. Type: 22/34 serif when short, 18/30 serif when long. Fade-in 240ms `motion/ease/host`, no slide. Sentences swap with a crossfade — the outgoing sentence fades for 200ms, the incoming sentence fades in over 240ms, with a 60ms overlap.

**Why this works:** the eye anchors on the portrait. The waveform tells the ear "I am being spoken to." The caption tells the literate mind "I can follow along." No bouncing bars, no robot avatar, no "AI is speaking" badge. The learner forgets they are listening to a synthesized voice within thirty seconds.

**Idle (paused) state:**
- Portrait continues breathing.
- Waveform line goes still and slightly thinner.
- Caption holds on the last spoken sentence for 4 seconds, then fades to 40% opacity.

**Resume state:**
- Portrait breath resumes.
- Waveform line warms back to full thickness over 400ms.
- Caption fades back to 100% opacity, then advances.

**Provider failures:**
- TTS voice not available in browser → see §10.
- Synthesis interrupted (tab switch, OS audio loss) → caption pauses, "Voice paused" appears in micro-caption beneath the persona name in `color/text/secondary`. Resume restores everything.

### 7.3 LessonControlBar

A single slim bar directly below the stage. Six controls maximum.

**Controls (left to right):**

| Control | Icon | Affordance |
|---|---|---|
| Play / Pause | ▶ / ❚❚ | Primary. Visually weighted (brass underline when active). |
| Restart | ↺ | Returns to lesson start. Confirmation only if progress > 50%. |
| Back to Lesson | ↩ | Returns to the lesson home (the reading card, not the catalog). |
| Mode switcher | "Voice ▾" or "Video ▾" | Appears only when more than one mode is available. See §7.6. |

**Timestamp:** to the right of the icons, `02:14 / 04:38` in tabular micro type. Never as a draggable scrubber on first release — scrubbing the lesson is not the point. (Future: a quiet brass scrubber can be added.)

**Visual:**
- 56px tall on desktop, 64px on mobile.
- Surface: transparent over the page canvas, with a 1px hairline above.
- Icons: 24px, brass on dark.
- Tap targets: 44px minimum (mobile-first).

**States:**
- Default → icons at 80% brass.
- Hover → icons at 100% brass, 1px brass underline appears under the icon glyph with a 120ms ease-in.
- Focus → 2px brass focus ring with 4px offset.
- Disabled (e.g., restart at 0:00) → 40% opacity, no hover response.

### 7.4 TranscriptPanel

**Purpose:** Let learners read along with the instructor. The transcript is **not** a hidden accessibility feature — it is a co-equal channel.

**Layout (desktop):**
- Right column, full vertical height of the stage area.
- Surface: `color/surface/elevated`, 1px hairline border.
- Padding: 32px.
- Header: `Transcript` in 13px tabular caption, with a small brass dot indicating "live with the voice."

**Sentence rendering:**

| State | Style |
|---|---|
| Far past (more than 3 sentences back) | `color/text/tertiary`, 18/30 sans, body 400 |
| Recent past (last 1–3 sentences) | `color/text/secondary`, 18/30 sans, body 400 |
| Active (currently spoken) | `color/text/primary`, 22/34 sans, weight 500, with a 2px brass underline that grows left-to-right with the speech duration of that sentence |
| Upcoming (next 1–3 sentences) | `color/text/secondary`, 18/30 sans, body 400 |
| Far upcoming | `color/text/tertiary`, 18/30 sans, body 400 |

The active sentence scrolls to vertical center of the panel with a 360ms ease as it becomes active. No scrollbar shows by default. Hovering the panel reveals a 4px brass scrollbar that the learner can drag to read ahead or behind without breaking playback.

**The brass underline on the active sentence is the single most important detail in the screen.** It is the visible bond between the instructor's voice and the learner's reading eye. It must animate smoothly from left to right over the speech duration of that sentence (estimated by characters or supplied by provider timing).

**Empty transcript:**
- If the lesson has no transcript field, the panel renders the lesson's structured fields (objective, technical_depth, practical_execution) as a **reader-mode document** with a typographic introduction by the persona ("These are my notes for this lesson. — Hélène"). Never show "transcript unavailable."

### 7.5 KeyTakeawaysPanel

**Purpose:** What the learner should carry into their shift.

**Layout:**
- Full-width panel under the stage row.
- Surface: `color/surface/elevated`.
- 64px top padding, 48px side padding desktop.
- Header: `What to carry into the shift` in 13px tabular caption (never "Key Takeaways," which sounds corporate).

**Takeaway line:**
- 17/28 sans, weight 500.
- 24px vertical spacing between lines.
- Leading marker: a 6px brass square (NOT a bullet, NOT a checkmark, NOT a number).
- Max 5 lines. If the lesson has more candidates, the service must rank and select 5; we do not show more. If fewer than 3 exist, we show what exists — we never invent.

**Source of takeaways:**
- If lesson has `practical_execution` as a structured list, we render those. If it has `guest_application` lines, those qualify. If it has a `drill` field, we surface the drill as one line. **We do not generate takeaways from prose if structured fields are empty.** Empty case: show a single line in serif italic — "Rafael will add takeaways once this lesson is rehearsed."

### 7.6 ReviewQuestionsPanel

**Purpose:** Help the learner check that the practice landed. Not a test, not a quiz, not graded chrome.

**Layout:**
- Full-width panel.
- Surface: `color/surface/paper` (the parchment cream — the room shifts to "review document").
- Text: `color/text/inverse`.
- Header: `Review with Rafael` (use the persona's name dynamically). 13px tabular caption.

**Question rendering:**
- Each question is a serif line at 18/28.
- Questions are collapsible: the question is always shown, the "thinking space" (a free-text reflective answer field) expands when tapped.
- No scoring. No "submit." No correct/incorrect feedback. A small brass tick appears next to questions the learner has reflected on, and that state is local-only (persisted via the existing `hospia.*` localStorage scheme).
- Maximum 4 questions per lesson on screen. If the lesson has more, we show the 4 best-suited and offer "Two more from Rafael" as a quiet disclosure.

**Why this is not a quiz:** the principle "guided, not tested" means review is a reflective moment with the instructor, not an assessment. We are not borrowing from Duolingo. We are borrowing from a bartender quietly asking "What would you change about that pour?"

**Empty case:** if a lesson has no `assessment_questions`, the panel renders a single reflective prompt from the persona: "Sit with one thing from this lesson. What will you do differently tonight?"

### 7.7 ProgressIndicator

The 2px brass thread under the stage on desktop, the 2px brass thread at the top of the screen on mobile. That is the entire progress indicator. **No percentage label. No "3 of 8 lessons." No completion ring. No streak.**

**Why:** progress is a side effect of attention, not the point. Showing a percentage during a lesson invites the learner to skim. A continuous brass line lets the learner feel time pass without measuring it.

### 7.8 ModeSwitcher

A small disclosure shown in the LessonControlBar **only when more than one mode is available** for the current lesson.

**Visual:**
- Label: "Video ▾" or "Voice ▾" — the currently active mode.
- Tapping opens a small panel with two options:
  - `Professional Video` (with a small brass dot if available)
  - `Voice with Rafael` (always available as a fallback)
- The disabled mode is shown with a quiet status caption: `Professional video — coming soon for this lesson.`

**Why the persona's name appears in the voice option:** the voice mode is not "TTS fallback" to the learner. It is "Voice with Rafael." This single naming choice is the largest single lever for making local TTS feel premium.

### 7.9 BackAffordance

- Label: `← Back to Lesson` (returns to the lesson home).
- Never labeled "Exit," "Close," "X," or "Cancel."
- Position: top-left of the lesson header. Persistent on desktop. Becomes a 44px tap target in the top-left of the screen on mobile.
- Behavior: if the lesson is mid-playback, opens a small bottom sheet: `"Step away for a moment? Rafael will hold your place." [Stay] [Step away]`.

---

## 8. Screen states (catalog)

Every state below must be designed and shipped. No state is allowed to fall through to a default that says "Loading..." or "Error."

| ID | State | What the learner sees |
|---|---|---|
| S0 | Lesson loading | Header with persona greeting (from local persona record), stage frame with paper shimmer, transcript panel showing "Rafael is preparing the lesson." |
| S1 | Idle (loaded, not yet started) | Stage shows the persona poster still (video) or portrait at full presence (voice). Caption empty. Play button breathes once every 5.2s with the brass underline. |
| S2 | Playing | Voice or video active. Transcript scrolls. Progress thread grows. |
| S3 | Paused | Voice/video held. Caption holds last sentence. Pause icon replaces play with a 120ms crossfade. |
| S4 | Buffering | A 2px brass shimmer travels inside the progress thread. No overlay. No spinner. |
| S5 | Ended | Stage holds last frame (or portrait at gentle still). A typographic moment appears beneath the stage: persona's closing phrase. Key Takeaways panel becomes the visual anchor — it gains a 2px brass top border. |
| S6 | Video unavailable, voice available | Mode auto-falls to voice. A small dignified caption appears for 3 seconds in the lesson header: "Video is resting. Rafael will walk you through it." |
| S7 | Voice unavailable, video available | Mode auto-falls to video. No special caption needed. |
| S8 | Neither available (no video, no voice) | ReaderMode (§9.4). Stage frame holds a still portrait. Lesson plays as a typographically beautiful document. |
| S9 | Connection lost mid-play | Caption pauses, header shows quiet status: "The room is quiet for a moment." Resume button reappears once connection returns. |
| S10 | Lesson data missing (broken record) | Header renders normally, stage holds portrait, body shows: "This lesson is being prepared by Rafael. Step back in tomorrow." Never a stack trace. |
| S11 | Restart confirm | If progress > 50%, restart shows a small bottom sheet: "Start over with Rafael?" [Stay] [Restart]. |
| S12 | Step-away confirm | (See §7.9.) |
| S13 | First time in the Academy (no learner history with persona) | First lesson opens with an additional typographic line under the greeting: persona's `signature_phrase`. Only on first encounter per persona — never again. |
| S14 | Returning to a lesson the learner partially completed | Header shows the greeting line as: `"Welcome back. We were here." — Rafael` (greeting variant `return`). Playback offers to resume at the last sentence boundary, not the last second. |
| S15 | Lesson marked complete previously, learner returns | Stage shows the closing frame. Caption holds the closing phrase. Key Takeaways appears immediately as the visual anchor. Play available for re-experience. |

---

## 9. Making the modes feel premium

### 9.1 Local TTS — premium, not cheap (the question)

The risk: browser TTS sounds robotic, voices vary by OS, and learners associate the experience with screen readers or accessibility tools.

The design answers, in order of importance:

1. **The voice is named.** It is not "AI Voice" or "TTS." It is `Voice with Rafael`. The learner builds a relationship with a person, not a setting.
2. **The portrait is human-drawn.** Hand-drawn ink portraits feel like an editorial illustration, not an avatar. They feel made, not generated.
3. **The voice is wrapped in a room.** The stage backdrop, the ambient waveform, and the caption typography form a context that the voice is not solely responsible for carrying.
4. **The waveform breathes.** A horizontal ink line that gently warms and thins with speech amplitude is calming. A bouncing equalizer would shatter the spell.
5. **The caption is editorial.** Setting the spoken sentence at 22pt serif, with a brass underline that grows with the sentence, is the difference between "subtitles" and "guided reading."
6. **The voice profile is chosen, not defaulted.** Each persona has a list of candidate `voice_name` values (per OS / browser) chosen by hand to match the persona — warm baritone for Rafael, calm alto for Mira, mezzo with French cadence for Hélène where available. The voice picker tries the candidate list before falling to a default. Rate and pitch are persona-specific, never global.
7. **Voice never starts in mid-sentence.** Synthesis is preloaded sentence-by-sentence. Each sentence is dispatched only when the previous is fully spoken. This eliminates the most "robot" symptom — interrupted clauses.
8. **TTS never announces itself.** No "Speaking now," no "Voice synthesis active." The portrait, the caption, and the waveform are the entire signal.
9. **A single brass shimmer** signals voice loading. If a sentence's audio chunk is slow, the brass shimmer travels through the progress thread instead of breaking the room.

### 9.2 Embedded video — not a random iframe (the question)

The risk: an iframe pasted into a page looks like a third-party widget — wrong corner radius, wrong borders, native controls, "loading…" text, share buttons, suggested videos at the end, autoplay warnings.

The design answers:

1. **The iframe lives inside a HESTIA stage frame.** It never sits flush against the page background. The stage frame's hairline border, brass glow, and corner radius wrap the iframe completely.
2. **Native controls are hidden.** The lesson control bar is the only set of controls. We pass `controls=0`, hide cursor on the stage when playing, and (for providers that allow it) disable share, info, fullscreen-native, and end-screen suggestions.
3. **No provider branding shows.** If the provider injects a logo, the stage frame overlay places a small brass academy badge over it in the same corner — never visible to the learner as "Synthesia."
4. **Loading is owned by HESTIA.** Before the video plays, the persona's poster still is shown with a slow fade-in. There is no "loading…" text from the provider.
5. **The end-state is owned by HESTIA.** When the video ends, HESTIA holds the last frame or returns to the persona's closing portrait. No "watch more" carousel ever appears.
6. **Audio is HESTIA's audio.** Volume is controlled by the operating system, not by a provider control inside the iframe.
7. **The aspect ratio is locked at 16:9.** The stage frame is the camera. No letterboxing, no pillarboxing, no responsive crop that exposes provider chrome.

### 9.3 Mode communication

The mode of any given lesson is shown in two places — and only two:

1. **In the lesson catalog (out of scope here, but the same language applies):** a tiny line under the lesson title. `Voice with Rafael · 4 minutes` or `Video with Rafael · 4 minutes`. Never "Coming soon: video."
2. **In the lesson control bar:** the ModeSwitcher disclosure (§7.8).

The mode is **never** communicated as a deficit. "Voice-only" is forbidden phrasing. "Voice with Rafael" is the canonical phrasing. The learner should never feel the lesson is half-built — every voice lesson is a complete experience.

When a lesson genuinely has both modes (e.g. service-001 today), the default mode for that lesson is **Professional Video**. The learner can switch to voice at any time. If a lesson has only one mode, the switcher is hidden.

### 9.4 ReaderMode (deep fallback)

When neither video nor voice can run (no provider, no browser TTS, no audio output, or learner has explicitly chosen text), the lesson collapses into a typographic document:

- The portrait stage becomes a still illustration with no waveform.
- The transcript becomes the primary surface, set in serif with generous leading, on a paper surface.
- A small caption sits under the title: `Reading with Rafael.`
- All other panels behave as normal.

ReaderMode is dignified, not punitive. It must not feel like a fallback. A learner who turns it on by preference should feel they are reading a beautifully set hospitality essay.

### 9.5 Future-readiness: professional video on every lesson

The system is designed so that the day every lesson has a professional video, **nothing changes for the learner** except the default mode flips to video. The PortraitStage and VideoStage share the same frame, controls, captions, and transcript. The ModeSwitcher is the only piece of UI that disappears (if a lesson has both modes today but only video tomorrow, the switcher silently retires for that lesson).

To make this true:
- The persona record is the single source of identity, used by both modes.
- The transcript and timing data are independent of the playback medium.
- The control bar speaks to a single `useAcademyInstructorSession` interface that abstracts video and voice behind the same `play`, `pause`, `restart`, `seekToSentence(index)` methods.

When better avatar providers arrive (HeyGen, future Synthesia generations, a HESTIA-trained avatar), they slot in as a new `mode` value with no UI rewrite.

---

## 10. Error & fallback states (full catalog)

| Trigger | What happens | What the learner sees |
|---|---|---|
| Video provider returns 4xx/5xx | Fall through to voice mode if available, else ReaderMode | Header status caption: "Video is resting. Rafael will walk you through it." for 3s |
| Video region-blocked / CORS | Same as above | Same |
| Video provider blocked by network policy (corporate Wi-Fi) | Same as above | Same |
| Browser TTS API absent (`!('speechSynthesis' in window)`) | ReaderMode | Header caption: "Reading with Rafael today." |
| TTS voice list empty in this browser | Try next persona voice candidate, then ReaderMode | Same as above |
| OS audio output muted | Voice plays silently — caption + waveform still animate. After 3s with no audio gain detected, prompt: "Your audio is resting. Open the system volume to listen, or read along." | Quiet caption above the control bar |
| Tab loses focus / OS pauses media | Auto-pause, hold last caption | "Voice paused" micro-caption beneath persona name |
| Network lost mid-lesson | Voice mode pauses, video mode pauses. Resume offered when network returns. | "The room is quiet for a moment." |
| Lesson record missing transcript | Reader-mode document built from structured fields with persona intro line | "These are my notes for this lesson. — Hélène" |
| Lesson record missing structured fields entirely | Lesson is marked "in preparation" — never shown in the catalog if empty, and if reached directly, header shows: "This lesson is being prepared by Rafael." | No stage |
| Persona record missing | This is a system error — surface a single quiet line: "We can't reach the instructor right now." Log telemetry. Never show a generic placeholder face. | One-line message |

Rule: **no stack traces, no provider error codes, no English copy that says "an error occurred"**. Every fallback is voiced by the room.

---

## 11. Copy library

Voice and tone rules:
- Address the learner as "you," never "user" or "student."
- Use present tense.
- Use short sentences. Two clauses at most.
- Use the persona's signature words sparingly — once per lesson is enough.
- Never use the words: course, module, unit, complete, earn, points, badge, level, streak, mastery, certificate (unless we are actually issuing one).
- Acceptable verbs: practice, rehearse, host, pour, serve, plate, taste, walk, sit, hold, carry.
- Never use exclamation marks. Never use emoji. Never use all caps for emphasis (only for the academy badge label).

### 11.1 System copy (per persona example — Bar / Rafael)

| Slot | Copy |
|---|---|
| Header greeting (first visit) | "Welcome behind the bar." — Rafael |
| Header greeting (return) | "Welcome back. We were here." — Rafael |
| Step-away confirm title | "Step away for a moment?" |
| Step-away confirm body | "Rafael will hold your place." |
| Step-away primary | "Stay" |
| Step-away secondary | "Step away" |
| Restart confirm title | "Start over?" |
| Restart confirm body | "Pour it again with Rafael." |
| Restart primary | "Restart" |
| Restart secondary | "Stay where I am" |
| Mode switch label (active video) | "Video with Rafael ▾" |
| Mode switch label (active voice) | "Voice with Rafael ▾" |
| Mode switch — voice option | "Voice with Rafael" |
| Mode switch — video option (available) | "Video with Rafael" |
| Mode switch — video option (unavailable) | "Video with Rafael — coming soon" |
| Buffering caption | (none — visual only) |
| Video unavailable caption | "Video is resting. Rafael will walk you through it." |
| Voice unavailable caption | "Reading with Rafael today." |
| End-of-lesson moment | (Rafael's closing phrase) |
| Empty takeaways line | "Rafael will add takeaways once this lesson is rehearsed." |
| Empty review prompt | "Sit with one thing from this lesson. What will you do differently tonight?" |
| Connection-lost caption | "The room is quiet for a moment." |

The copy library is replicated with each persona's voice. The slots are identical; the words change.

### 11.2 Service / Mira — example variants

- Header greeting: `"Come in. The table is ready." — Mira`
- Restart body: `"Let's set the table again with Mira."`
- Empty takeaways: `"Mira is still polishing this lesson."`
- Connection lost: `"The dining room is quiet for a moment."`

### 11.3 Wine / Hélène — example variants

- Header greeting: `"Let's taste together." — Hélène`
- Restart body: `"Pour the lesson again with Hélène."`
- Empty takeaways: `"Hélène is decanting this one."`
- Connection lost: `"The cellar is quiet for a moment."`

### 11.4 Manager / Daniel — example variants

- Header greeting: `"Sit with me for a minute." — Daniel`
- Restart body: `"Let's go back to the planning table with Daniel."`
- Empty takeaways: `"Daniel is sketching the plan."`
- Connection lost: `"The office is quiet for a moment."`

### 11.5 Events / Noa — example variants

- Header greeting: `"Let's walk the room." — Noa`
- Restart body: `"Walk the floor again with Noa."`
- Empty takeaways: `"Noa is still walking this one."`
- Connection lost: `"The floor is quiet for a moment."`

### 11.6 Coffee / Theo — example variants

- Header greeting: `"Let's dial in." — Theo`
- Restart body: `"Pull another shot with Theo."`
- Empty takeaways: `"Theo is still dialing this one in."`
- Connection lost: `"The bar is quiet for a moment."`

---

## 12. Design do / don't rules

### 12.1 Do

- Do let the screen breathe. White space (or dark space) is a material.
- Do let the instructor speak first. Greeting line precedes the stage even on load.
- Do treat the brass underline as sacred. It is the visible thread between voice and reading eye.
- Do animate the portrait's breath. Stillness is dead. Motion that is too small to notice is still felt.
- Do use the persona's name in every mode label, every fallback, every confirm.
- Do hide native iframe and video controls completely.
- Do use a single accent color per room.
- Do design every screen state, including idle and ended, as a finished moment.
- Do make ReaderMode feel like a chosen experience, not a punishment.
- Do make all instructor-facing strings data — every name, phrase, voice profile lives in the persona record.

### 12.2 Don't

- Don't show "TTS," "AI voice," "synthesized speech," or "robotic voice" anywhere in the UI.
- Don't show provider branding (Synthesia, video host logos).
- Don't put bouncing equalizer bars on the stage.
- Don't put progress percentages or completion rings during playback.
- Don't use exclamation marks, emoji, or all-caps copy outside the academy badge.
- Don't show a stack trace or error code to a learner ever.
- Don't gamify. No XP, no badges, no streak chrome, no "level up."
- Don't auto-play the next lesson at the end of this one. Each lesson is a moment, not a binge.
- Don't generate takeaways from prose if no structured data exists. Don't fabricate transcript text.
- Don't add an instructor "chat" feature in this phase. The instructor speaks; the learner reflects. Two-way dialogue is a future capability and would change the entire design grammar.
- Don't borrow patterns from generic LMS (Coursera, Udemy, LinkedIn Learning). When in doubt, look at hospitality, not software.
- Don't use purple. The HESTIA Academy palette is warm-dark with brass and academy accents. Purple is the visual signature of generic SaaS and is forbidden in this surface.
- Don't put any feature logic, state, or AI calls inside components.
- Don't put any state in App.jsx.

---

## 13. Implementation notes for Claude Code

These notes are mandatory for the build phase. They align with the existing HESTIA architecture rules in `CLAUDE.md`.

### 13.1 Architecture placement

- **Feature folder:** `src/features/academy/instructor/` — all UI components for the lesson screen.
- **Hook:** `src/hooks/useAcademyInstructorSession.js` — single hook owning playback state, mode, current sentence index, fallback resolution, persistence keys.
- **Service:** `src/services/academyInstructorService.js` — pure, deterministic. Owns: mode resolution (which mode is available for this lesson + this browser), sentence timing estimation, takeaway selection from structured fields, persona record loading.
- **Persona records:** `src/domain/academy/personas/` — one file per academy. Pure data. No runtime behavior.
- **Voice provider abstraction:** `src/services/instructorVoiceProvider.js` — wraps `window.speechSynthesis` and any future provider behind a single interface (`speakSentence(text, voiceProfile)`, `pause()`, `resume()`, `cancel()`).
- **Video provider abstraction:** `src/services/instructorVideoProvider.js` — wraps the Synthesia iframe, native `<video>`, and any future avatar provider behind a single interface (`mount(target, source)`, `play()`, `pause()`, `seek(seconds)`, `destroy()`).

### 13.2 Data shape

The hook expects every lesson record to expose:

```
lesson {
  id
  academy
  title
  persona_id              // foreign key to persona record
  modes: {
    video?: { provider, src, poster, duration_seconds }
    voice?: { transcript: [{ text, estimated_duration_ms }], total_duration_ms }
  }
  structured: {           // canonical Academy fields per CLAUDE.md
    objective?
    technical_depth?
    taxonomy?
    terminology?
    common_failures?
    practical_execution?
    guest_application?
    drill?
    assessment_questions?
  }
}
```

The hook resolves `available_modes` from this record at load time. If neither `video` nor `voice` is present, the hook resolves to `reader` mode.

### 13.3 State ownership rules

Per CLAUDE.md:
- App.jsx adds nothing for this feature. It already passes `academy` props through PageRenderer.
- All state belongs in `useAcademyInstructorSession`. Components are stateless aside from local input state (e.g., the review-question reflection text).
- Intelligence (mode resolution, sentence timing, voice candidate selection, takeaway ranking) lives in `academyInstructorService.js`. Components must not run any logic beyond rendering.

### 13.4 Tokens

Before any component is built, the proposed tokens in §3.2, §3.3, and §4 must be promoted to real design tokens. If HESTIA already has a token system, this spec's values are starting points to be reconciled with existing tokens. If not, a single `src/design/tokens.js` (or equivalent) holds them as the source of truth.

### 13.5 LocalStorage keys

Per CLAUDE.md, all keys must be namespaced `hospia.*` (do not rename without a migration plan). Proposed keys for this feature:

- `hospia.academy.instructor.{lessonId}.lastSentenceIndex` — for resume.
- `hospia.academy.instructor.{lessonId}.reflected.{questionId}` — for the quiet review tick.
- `hospia.academy.instructor.preferredMode` — global learner preference if they switch repeatedly.

### 13.6 Honesty rules (non-negotiable)

These come straight from the existing HESTIA architectural rules and apply fully here:

- Never fabricate transcript text.
- Never fabricate takeaways.
- Never fabricate review questions.
- Never invent a sentence to fill an empty caption.
- Never display a provider error code or message; only the room's voice.
- Never assume `practical_execution` exists — handle absent gracefully.

### 13.7 Component naming

Component names follow the tree in §6.4 exactly. Do not abbreviate (`PortraitStage`, not `Portrait`). Do not collapse responsibilities (`StageFrame` and `EmbeddedVideoSurface` are separate components; the frame must not know it is wrapping a video vs. a portrait).

### 13.8 Accessibility (mandatory)

- The stage is `role="region"` with `aria-label="Lesson playback — Rafael"`.
- The transcript panel is `role="log"` with `aria-live="polite"`. Each sentence is a `<p>`; active sentence has `aria-current="true"`.
- All controls are real `<button>` elements with `aria-label` matching the visible label.
- Focus order: back → play/pause → restart → mode switch → transcript scroll → takeaways → review questions.
- Keyboard: Space toggles play/pause when the stage region has focus; R restarts (with confirm if > 50%); Esc invokes the back affordance.
- Reduced motion: when `prefers-reduced-motion: reduce` is set, the portrait does not breathe, the waveform does not animate (it shows as a static line), the brass underline appears as a static highlight not an animated fill, and stage fades become instant. Captions and transcript scrolling remain (these carry information).
- Captions are required reading; they are not decorative.

### 13.9 Performance

- Persona assets (portrait, poster still) are lazy-loaded but every persona must have a low-resolution preview that loads with the academy catalog so the lesson screen never shows an empty portrait.
- The transcript is virtualized when > 200 sentences (most lessons will be far below this).
- The waveform is a CSS / SVG path animation, not a `<canvas>`. No reason to spin up a canvas for ±4px breathing.

### 13.10 Telemetry (instrumentation hooks, no UI)

- Mode resolved → `academy.instructor.mode_resolved` with `{ lesson_id, mode }`.
- Mode switched by learner → `academy.instructor.mode_switched`.
- Fallback triggered → `academy.instructor.fallback_triggered` with `{ from, to, reason }`.
- Lesson reached end (S5) → `academy.instructor.lesson_ended`.
- Question reflected (S6 review tick) → `academy.instructor.question_reflected`.

No telemetry surfaces to the learner. These are instrumentation for product learning.

---

## 14. What stays future-only (do NOT build yet)

The following are part of the design vision but **explicitly out of scope** for the first implementation. They must not appear in the build, even partially. If a developer or future Claude Code session is tempted to "lay groundwork," resist — partial features pollute the experience.

1. **Two-way conversation with the instructor.** No "ask Rafael a question" in this phase. The instructor speaks; the learner reflects. A future dialog mode is a separate design phase that will rewrite controls and transcript grammar.
2. **AI-generated lesson content.** Lessons are written by humans (or curated from real sources) and rendered. The instructor does not generate text on the fly in this phase.
3. **Avatar providers beyond Synthesia.** HeyGen, D-ID, and future avatar systems wait until the video provider abstraction (§13.1) is proven with Synthesia and at least one uploaded MP4.
4. **Voice cloning per persona.** TTS uses the best available system voice for each persona's profile. A custom-cloned voice for Rafael, Mira, Hélène, etc. is a future phase.
5. **Multi-language transcripts.** First release ships English-only Academy content per HESTIA project rules.
6. **Sentiment-aware pacing.** The instructor does not slow down because the learner seemed confused. Future work.
7. **Personalization memory.** "Welcome back, Toam — last time we worked on stirring technique" is a future capability that depends on a memory layer not built yet.
8. **Scrubbable timeline.** No scrubber on the progress thread in first release. Restart and (future) seek-to-sentence are the only navigation.
9. **End-of-lesson next-lesson recommendation.** No "next: lesson 04" auto-suggest in this phase.
10. **Native mobile gestures (long-press, swipe between lessons).** Touch targets and tap controls only in first release.
11. **In-lesson notes / highlighting.** The transcript is read-only.
12. **Certificates, badges, completion scores.** Not in this phase — and possibly never in this surface, since they conflict with P5 (Hospitality grammar).

---

## 15. Open questions for Toam

These are decisions only Toam can make. None block the design; all should be answered before code begins.

1. **Final persona names.** Are Rafael, Mira, Hélène, Daniel, Noa, Theo the right names? Should any be Hebrew (e.g., Noa is already; should Daniel be Danny or Yoni; should Mira be Maya)? The system accepts any names — but the *language* of names matters for the room they create.
2. **Portrait illustration commission.** Six hand-drawn portraits is a real cost. Acceptable first-release substitute is a single high-quality illustrated silhouette per persona (less identity but premium feel) until full portraits are commissioned. Confirm direction.
3. **Voice candidate lists.** The proposed voice profiles (warm baritone, warm alto, French-accented mezzo, etc.) depend on which OS/browser voices exist on staff devices. We need a one-page audit of which voices are realistically available on the target devices (mostly iOS Safari, Chrome on Android, possibly desktop Chrome) before fixing candidate lists per persona.
4. **The "signature phrase" on first encounter.** Confirm that surfacing the signature phrase only on first lesson with a persona is the right cadence, or whether it should repeat (e.g., on the lesson where the persona introduces a new module).
5. **ReaderMode by preference.** Should the learner be able to *choose* ReaderMode globally as a preference (e.g., they prefer to read at work in silent environments), or is it only a fallback? Recommendation: yes, allow as preference — but confirm.
6. **Tone gate for review questions.** Review questions in some lessons may be assessment-style ("Which of the following is the correct technique?"). The hospitality voice in §12 conflicts with multiple-choice assessment chrome. Decision: in first release, all review questions render as reflective prompts. Multiple-choice assessment, if needed for compliance, becomes a separate surface ("Practice check") not inside the Instructor screen.
7. **Step-away behavior on mobile.** Closing a tab on mobile is destructive. Should we attempt to persist mid-sentence state, or restart at the last sentence boundary on return? Recommendation: last sentence boundary (more dignified than mid-clause resume).

---

## 16. Acceptance criteria for first build

The first build is considered complete when:

1. A learner can open service-001 and watch the Synthesia video inside the HESTIA stage frame with no visible iframe chrome, no provider logo, no native controls.
2. A learner can open any other lesson and hear Rafael (or the academy's persona) speak the lesson via browser TTS, with the breathing portrait, the ambient waveform, the captioned current sentence, and the brass-underlined transcript line all behaving as specified.
3. The lesson header greets the learner by persona before the stage loads.
4. The transcript scrolls smoothly with the spoken sentence; the active sentence is unmistakably distinguishable from past and future sentences.
5. Pausing, resuming, restarting, and going back behave as specified, including the step-away confirm.
6. Key Takeaways render from structured fields, never invented, and the empty case shows the persona's voiced empty line.
7. Review questions render as reflective prompts with the persona's name in the header, never with scoring chrome.
8. The mode switcher appears only when both video and voice exist for that lesson; otherwise it is hidden.
9. Every screen state from S0 to S15 has a designed, voiced moment — none falls back to a default loading or error message.
10. Reduced-motion users get a calm, static experience that still carries the lesson.
11. The whole feature is built with the existing HESTIA architecture rules: state in the hook, intelligence in the service, UI in `src/features/academy/instructor/`, persona records in `src/domain/academy/personas/`, App.jsx untouched.

---

## 17. One final principle

The Academy is not a place where people consume content. It is a place where people are personally hosted, briefly, by someone who knows the craft. If a build choice would make the screen feel even slightly more like a tool and less like a room, the choice is wrong. When in doubt: ask whether Mira would put it on the table. If not, take it off.
