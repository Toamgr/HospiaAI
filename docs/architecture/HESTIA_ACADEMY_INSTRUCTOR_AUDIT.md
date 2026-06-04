# HESTIA Academy — AI Instructor Experience
## Repo Audit Report

**Audit performed:** 2026-05-19  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Triggered by:** `HESTIA_ACADEMY_INSTRUCTOR_IMPLEMENTATION_PACKAGE.md`, Section 4  
**Status:** Audit only — no production code changed, no secrets touched  

---

## Files Inspected

| File | Purpose |
|---|---|
| `src/App.jsx` | Confirm composition-only pattern, PageRenderer wiring |
| `src/config/navigationConfig.js` | Academy routing, page keys |
| `src/config/systemConfig.js` | localStorage key conventions |
| `src/hooks/useStaffAcademyState.js` | Academy state and navigation |
| `src/utils/academy.js` | Academy utility functions |
| `src/data/academy/universityManifest.js` | Lesson data shape and all Bar/Service lessons |
| `src/data/academy/universityExpansion.js` | Expansion lesson factory |
| `src/features/academy/LessonPlayer.jsx` | Current lesson player component |
| `src/features/academy/LessonInstructorView.jsx` | Existing instructor view (integrated in LessonPlayer) |
| `src/features/academy/instructor/InstructorTalkingHead.jsx` | Existing TTS component |
| `src/features/academy/instructor/InstructorTranscriptPanel.jsx` | Existing transcript/takeaways/questions component |
| `src/features/academy/instructor/AcademyEmbeddedVideoPlayer.jsx` | Existing video embed component |
| `src/features/academy/instructor/instructorEmbedProviders.js` | Trusted URL allowlist |
| `src/features/academy/instructor/instructor.css` | Animation and layout styles |
| `src/features/academy/services/academyInstructorScriptService.js` | Existing script builder service |
| `src/features/academy/services/academyInstructorPersonaResolver.js` | Existing persona resolver |
| `src/features/academy/data/academyInstructorVideoMap.js` | Video metadata map |
| `src/prototypes/academyVideoInstructor/ACADEMY_STRUCTURE_AUDIT.md` | Prior prototype audit (2026-05-18) |
| `src/prototypes/academyVideoInstructor/instructorPrototypeData.js` | Prototype lesson/transcript data |
| `src/prototypes/academyVideoInstructor/LocalBrowserTalkingInstructor.jsx` | Prototype TTS component |
| `tailwind.config.js` | Design token system |
| `src/style.css` | Global styles |

---

## 1. Routing and Navigation

### 1.1 Academy route
**Finding: PRESENT**

The app uses a state-based routing system, not a URL router. `PageRenderer` in `App.jsx` (line 397) has an entry:

```js
lessonPlayer: <LessonPlayer t={t} ... selectedAcademyId={selectedAcademyId} selectedLessonId={selectedLessonId} ... />
```

`navigationConfig.js` registers `lessonPlayer` as an academy-area page with `hiddenInNav: true`. It is navigated to programmatically, not via a nav link.

### 1.2 Navigation flow from catalog to lesson
**Finding: PRESENT — state-based, single function**

`useStaffAcademyState.js::openUniversityLesson(academyId, lessonId)`:
1. Validates academy and lesson exist in the manifest.
2. Sets `selectedAcademyId` and `selectedLessonId` in state and localStorage.
3. Calls `goToPage('lessonPlayer')`.

The existing `Courses.jsx` page passes `onOpenLesson` to call this function when a lesson card is tapped.

### 1.3 Minimum-touch way to add new instructor screen
**Finding: Two viable options**

**Option A (Recommended):** Add `lessonInstructor` as a new page key in PageRenderer (one entry in the pages map, one import). `useStaffAcademyState` already stores `selectedAcademyId` and `selectedLessonId`, so the new screen receives them via the existing `academy` prop group. No hook changes required.

**Option B:** Render the new `AcademyLessonScreen` as a conditional inside the existing `lessonPlayer` page case, gated by a `hasInstructorMode(lesson)` check. Simpler but harder to isolate.

Option A follows the CLAUDE.md contract: new feature UI in `src/features/`, new page key in PageRenderer, `App.jsx` untouched.

---

## 2. Existing Lesson Player

### 2.1 Existing component
**Finding: PRESENT — and more built than the implementation package assumes**

`src/features/academy/LessonPlayer.jsx` exists and renders:
- A lesson path sidebar with locked/open/complete states
- Step-by-step lesson content (Introduction → Core Knowledge → Vocabulary → Common Failures → Service Application → Recovery & Standards → Manager Notes → Practice Prompt → Recap)
- A "Watch with AI Instructor" toggle button
- **The toggle renders `<LessonInstructorView ... />` marked `{/* DEV ONLY — remove before production */}`**

### 2.2 Existing instructor infrastructure (critical finding)
**Finding: SUBSTANTIAL EXISTING CODE — not mentioned in implementation package**

The following components already exist in production (or production-adjacent) code:

| File | What it does | Quality |
|---|---|---|
| `LessonInstructorView.jsx` | Top-level instructor panel — renders video + talking head + transcript | Prototype quality, DEV ONLY tag |
| `InstructorTalkingHead.jsx` | TTS voice with CSS avatar face, play/pause/resume/stop/restart, sentence tracking, progress bar | Working, but anonymous avatar |
| `InstructorTranscriptPanel.jsx` | Transcript sentences, key takeaways, review questions | Working, no scroll-to-active |
| `AcademyEmbeddedVideoPlayer.jsx` | Synthesia iframe with trusted URL allowlist | Working, but does not hide provider chrome |
| `instructorEmbedProviders.js` | `isTrustedInstructorEmbedUrl()` with `synthesia-embed` prefix | Working |
| `academyInstructorScriptService.js` | `buildInstructorScript(lesson, persona)` from structured fields | Working, thin personas |
| `academyInstructorPersonaResolver.js` | Keyword-based persona resolution | Working, generic descriptor names |
| `academyInstructorVideoMap.js` | Video metadata keyed by lesson ID | Working, one entry |
| `instructor.css` | Animations (mouth, halo, speech waves), layout, transcript styles | Working |

**The `InstructorTalkingHead.jsx` already uses `window.speechSynthesis`.** This is confirmed live code, not a prototype.

### 2.3 Is it safe to leave LessonPlayer untouched?
**Finding: YES — with one caveat**

The new `AcademyLessonScreen` can live at `src/features/academy/instructor/AcademyLessonScreen.jsx` and be reached via a new `lessonInstructor` page key. `LessonPlayer` does not need to be modified.

**Caveat:** The "DEV ONLY" `LessonInstructorView` inside `LessonPlayer` will coexist with the new screen. The DEV ONLY section should be removed as part of the new screen's launch, or left in as a developer shortcut and explicitly documented. This is a Toam decision.

---

## 3. Lesson Data Shape

### 3.1 Where lesson records live
**Finding: STATIC FILE**

`src/data/academy/universityManifest.js` defines all lessons via a `lesson()` factory and `flattenAcademy()`. The factory places `objective` at the top level; all other teaching fields go into a `content` object. `flattenAcademy()` spreads `content` onto each lesson, so **all fields are flat on the final lesson object** consumed by components and services.

### 3.2 Actual lesson shape (example: bar-001)
```js
{
  id: 'bar-001',
  title: 'Ice Systems, Dilution, And Thermal Control',
  duration: '45 min',
  moduleId: 'bar-technique',
  moduleTitle: 'Technique, Ice, Balance, And Speed',
  objective: 'Use ice format as a controlled ingredient...',      // STRING
  technical_depth: 'Ice behavior is controlled by...',            // STRING
  taxonomy: [                                                      // ARRAY OF OBJECTS
    { type: 'Cube ice', usage: 'General shaking...' },
    ...
  ],
  terminology: ['thermal mass', 'surface area', ...],             // ARRAY OF STRINGS
  common_failures: ['Serving on shaking ice', ...],               // ARRAY OF STRINGS
  practical_execution: ['Drain ice wells regularly', ...],        // ARRAY OF STRINGS
  guest_application: 'Guests read clear large ice as care...',    // STRING
  drill: 'Build the same Old Fashioned on wet cube ice...',       // STRING
  assessment_questions: ['Why is shaking ice not serving ice?', ...], // ARRAY OF STRINGS (3)
  amateur_vs_pro: { amateur: '...', pro: '...' },                 // OBJECT
  professional_standard: '...',                                    // STRING
  real_service_context: '...',                                     // STRING
  manager_notes: '...',                                            // STRING
  doctrine: null,                                                   // NULL for bar lessons
  recovery_logic: null,                                             // NULL for bar lessons
  standards: []
}
```

### 3.3 `persona_id` field
**Finding: ABSENT**

No lesson in the manifest has a `persona_id` field. The existing `academyInstructorPersonaResolver.js` resolves persona by keyword-matching `moduleId`, `id`, `moduleTitle`, and `title`. For MVP, Rafael should be resolved by `academyId === 'bar-academy'` in the new persona resolver, not by lesson-level `persona_id`.

### 3.4 Video source field
**Finding: ABSENT from lesson schema — separate map file**

No lesson has a video source field. Video metadata is in `src/features/academy/data/academyInstructorVideoMap.js`, keyed by `lessonId`. This is a clean separation and aligns with the implementation package's architectural guidance.

---

## 4. service-001 Audit

### 4.1 Does service-001 exist?
**Finding: PRESENT**

`service-001` exists at `src/data/academy/universityManifest.js` line 621.  
**Academy:** Service Academy (`service-academy`)  
**Title:** "First 30 Seconds And Kinetic Greeting Protocol"  
**Module:** "Sequence, Awareness, And Guest Reading" (`service-sequence`)

### 4.2 Does it have a video embed?
**Finding: PRESENT — Synthesia embed configured**

`src/features/academy/data/academyInstructorVideoMap.js`:
```js
'service-001': {
  provider: 'synthesia-embed',
  mode: 'embedded',
  title: 'HESTIA Bar Academy - Luxury Bar Hospitality: The Art Of Welcoming Guests',
  embedUrl: 'https://share.synthesia.io/embeds/videos/05d5dfcf-ad20-498b-8607-4045f1ff180b',
  publicUrl: 'https://share.synthesia.io/05d5dfcf-ad20-498b-8607-4045f1ff180b',
}
```

**Important discrepancy:** The video title says "HESTIA Bar Academy - Luxury Bar Hospitality" but the lesson is in Service Academy. The video content (based on the prototype transcript) is about welcoming guests at a bar context, but is mapped to a service lesson. This is an intentional cross-mapping from the prior prototype work (see `ACADEMY_STRUCTURE_AUDIT.md` from 2026-05-18).

### 4.3 Is it the only video-capable lesson?
**Finding: YES — only one entry in `academyInstructorVideoMap.js`**

`service-001` is the only lesson in the repo with any video embed configured. There is no Bar Academy lesson with a video source.

---

## 5. Structured Lesson Fields — Full Inventory

### 5.1 Fields present in Bar Academy (bar-001 through bar-010)
**ALL Bar Academy lessons have ALL the following fields populated:**

| Field | Type | Present in all Bar lessons? | Notes |
|---|---|---|---|
| `objective` | String | ✓ YES | Rich, single sentence |
| `technical_depth` | String | ✓ YES | 3–5 sentence paragraphs |
| `taxonomy` | Array of `{type, usage}` objects | ✓ YES | 4–6 items each |
| `terminology` | Array of strings | ✓ YES | 5–7 terms each |
| `common_failures` | Array of strings | ✓ YES | 4–6 items each |
| `practical_execution` | Array of strings | ✓ YES | 4–5 steps each |
| `guest_application` | String | ✓ YES | 1–2 sentences |
| `drill` | String | ✓ YES | Specific practice instruction |
| `assessment_questions` | Array of strings | ✓ YES | Exactly 3 questions each |
| `professional_standard` | String | ✓ YES | 1–2 sentences |
| `real_service_context` | String | ✓ YES | Short scenario |
| `manager_notes` | String | ✓ YES | 1–2 sentences |
| `doctrine` | null | — ABSENT | Null in all bar lessons |
| `recovery_logic` | null | — ABSENT | Null in all bar lessons |

**Finding: No thin Bar lessons.** Every bar lesson has all 9 narration-source fields populated. There is zero risk of `editorialNeeded: true` for any Bar Academy lesson.

### 5.2 Fields present in service-001
All the same fields are populated in `service-001`:
- `objective`, `technical_depth`, `taxonomy`, `terminology`, `common_failures`, `practical_execution`, `guest_application`, `drill`, `assessment_questions` — all populated.

### 5.3 Important shape notes for the narration layer

**`taxonomy` is objects, not strings.** Each item is `{ type: "...", usage: "..." }`. The narration service must handle this — it cannot join `lesson.taxonomy` as plain strings. Verbatim narration could be: `"[type]: [usage]"` or selectively used.

**`terminology` is strings.** Can be joined directly: `"Key terms: [term], [term], [term]."` Aligns with the implementation package's "A few words you'll hear..." pattern.

**`practical_execution` and `common_failures` are string arrays.** The existing `academyInstructorScriptService.js` already handles this with `join('. ')`. The narration service should do the same or narrate step-by-step.

**`doctrine` is null in all Bar lessons.** The implementation package does not list `doctrine` as a narration field. No impact. `LessonPlayer.jsx` uses it in the recap step; the new narration layer simply skips it.

---

## 6. Lessons Suitable for MVP

### 6.1 Best Bar lesson for voice-mode MVP
**Recommendation: `bar-001` — "Ice Systems, Dilution, And Thermal Control"**

Rationale:
- First lesson in the Bar Academy sequence (always unlocked)
- `terminology`: 7 items (rich vocabulary segment)
- `taxonomy`: 6 items with clear type/usage pairs
- `common_failures`: 5 items
- `practical_execution`: 4 actionable steps
- `guest_application`: Single clear sentence
- `drill`: Concrete A/B comparison exercise
- `assessment_questions`: 3 questions

Secondary candidates: `bar-002` (Shaking) or `bar-003` (Stirring) are equally rich. Any bar lesson will work.

**Note:** All 10 bar lessons meet the minimum threshold (≥3 `source-derived` segments). Bar Academy has zero editorial gap risk.

### 6.2 Most video-capable lesson
**Only option: `service-001`** — Service Academy, "First 30 Seconds And Kinetic Greeting Protocol" with Synthesia embed.

---

## 7. Bar/Rafael vs Service/Mira — Persona Recommendation

### 7.1 Arguments for Bar/Rafael (voice-first)
- All 10 Bar lessons are fully populated — zero data risk
- Bar Academy aligns with the HESTIA brand emphasis (Cocktail Lab, Bar Product Foundation, bar operations)
- Voice mode does not need `service-001`
- The implementation package's primary persona is Rafael (Bar) — building Mira (Service) first requires rewriting significant persona data
- Rafael can be voice-only MVP and add a video path later when Bar has its own video

### 7.2 Arguments for Service/Mira (video-first)
- `service-001` is the only lesson with a working video embed
- If Toam wants to demo video mode at all, it requires Service Academy or a cross-academy setup
- The prior prototype (`ACADEMY_STRUCTURE_AUDIT.md`, 2026-05-18) selected `service-001` as the prototype candidate for the video path

### 7.3 Arguments against cross-academy MVP
- Requires two personas (Rafael + Mira) simultaneously, breaking the "one persona in MVP" rule
- The implementation package §1.6 explicitly calls out multi-persona as too ambitious for MVP
- Doubles the persona record work

### 7.4 Recommendation
**Bar/Rafael voice-first.** Strongest data, aligned brand, cleanest scope. The existing video infrastructure (Synthesia embed, trusted URL allowlist) is already built and can be reused unchanged when a Bar video is eventually commissioned. If Toam needs to demo video in the MVP session, the cleanest approach is to use `service-001` as a second demonstration path under Rafael's screen (not a separate persona), with an explicit note that the content is a Service lesson shown as a cross-academy demo.

---

## 8. Design Token System

### 8.1 Token system
**Finding: TAILWIND-BASED — no separate `src/design/tokens.js`**

Tokens live in `tailwind.config.js`:

```js
colors: {
  hospia: {
    black:    '#080806',
    graphite: '#0d0c09',
    slate:    '#1a1a1a',
    card:     '#141311',
    border:   'rgba(107,112,92,0.2)',
    muted:    'rgba(232,220,192,0.55)',
    cream:    '#e8dcc0',
    white:    '#f5f5f0',
    gold:     '#c9a96e',       // ← THE BRASS TOKEN
    'gold-light': '#e8d0a0',
    'gold-dim':   'rgba(201,169,110,0.12)',
    danger, success, info
  }
}
fontFamily: { sans: ['Inter', ...] }
boxShadow: { hospia, hospia-lg, gold }
borderRadius: { hospia: '8px' }
```

**`hospia.gold` (#c9a96e) is the brass token.** Already used as the active/highlight color across all Academy components, the step dots, lesson header, and instructor CSS.

**Typography:** Inter (sans) is the primary font. `font-serif` (Tailwind default — Georgia/Times) is used in lesson headings within `LessonPlayer.jsx`. No custom serif font is configured.

**CSS approach:** Tailwind utility classes for all new components. Plus `instructor.css` for animation keyframes (which cannot be done in pure Tailwind).

### 8.2 For MVP
No new token file is needed. Extend `tailwind.config.js` with:
- `hospia.instructor-bg` or `hospia.stage-dark` for the instructor stage background
- Any motion duration tokens needed for the brass underline animation

The brass underline color is `hospia.gold`. The existing `avi-progressBar` in `instructor.css` already uses `#c9a96e` as its fill. The new brass underline should use the same value but via `transform: scaleX()` animation, not `width` transition (critical for jank-free animation).

---

## 9. LocalStorage Conventions

### 9.1 Existing `hospia.*` keys
```
hospia.users
hospia.currentUser
hospia.role
hospia.lang
hospia.area
hospia.page
hospia.sideCollapsed
hospia.endOfDayArchive
hospia.actionItems
hospia.budgetRequests
hospia.futureEvents
hospia.serviceIncidents
hospia.employeePerformance
hospia.employeeTasks
hospia.employeeRequests
hospia.notifications
hospia.cocktailDrafts
hospia.approvedCocktails
hospia.archivedCocktails
hospia.cocktailPractice
hospia.ownerNotes
hospia.assignedTasks
hospia.academyProgress       ← academy namespace begins here
hospia.selectedAcademy
hospia.selectedLesson
```

### 9.2 Existing `hospia.academy.*` keys
**Finding: NONE.** The existing keys use camelCase (e.g., `hospia.academyProgress`), not dot-namespaced. The `hospia.academy.*` namespace is completely free.

### 9.3 Collision check for proposed MVP keys
```
hospia.academy.instructor.{lessonId}.v1.lastSentenceIndex    ← NO COLLISION
hospia.academy.instructor.{lessonId}.reflected.{questionId}  ← NO COLLISION
hospia.academy.instructor.preferredMode                       ← NO COLLISION
```
All proposed keys are safe. The `hospia.academy.` prefix is a new sub-namespace that does not exist anywhere in the codebase.

---

## 10. Component and Hook Architecture

### 10.1 Hooks in `src/hooks/`
| Hook | Responsibility |
|---|---|
| `useSessionState.js` | Auth, user identity, language |
| `useNavigationState.js` | Area, page, collapsed state, navigation helpers |
| `useNotificationState.js` | Notification queue, read state, push |
| `useReportsState.js` | EOD report archive, business memory |
| `useShiftState.js` | Shift open/close, handover, carry-forward tasks |
| `useOperationsState.js` | Action items, events, budget, employee, incidents |
| `useCocktailPipeline.js` | Cocktail drafts, approvals, practice |
| `useStaffAcademyState.js` | Academy progress, lesson selection, navigation |
| `useShiftBrainState.js` | Shift intelligence from Shift Brain service |
| `useOwnerPulseState.js` | Owner pulse data, AI insight |
| `useBackendSync.js` | Backend data sync on mount |
| `useUserManagement.js` | User CRUD operations |
| `useEventState.js` | Event CRM state |

**Note:** CLAUDE.md says 10 hooks. The actual count is 13. Either 3 were added since the last CLAUDE.md update, or the count referred to a subset. This is not a blocker.

### 10.2 Feature folders in `src/features/`
`academy/`, `auth/`, `bar/`, `employee/`, `events/`, `operations/`, `owner/`, `settings/`, `shell/`, `shift-brain/`, `staff/`, `system/`

The `academy/instructor/` sub-folder **already exists** (from the existing prototype integration). This is where the new MVP components should live.

### 10.3 App.jsx confirmation
**Finding: COMPOSITION-ONLY — confirmed**

`App.jsx`:
- No `useState` directly in the App function (only `useCallback` for `archiveEndOfDayReport`)
- All state lives in the 13 hooks
- Renders `PageRenderer` with grouped domain prop objects: `session`, `reports`, `operations`, `cocktails`, `academy`, `notifications`, `events`
- No feature UI — only shell layout (TopNav, SidePanel, main container)
- Two cross-domain orchestration functions: `login()` and `archiveEndOfDayReport()`
- Architecture is intact and must remain untouched

---

## 11. Reduced Motion

### 11.1 Current state
**Finding: NOT IMPLEMENTED anywhere in the codebase**

`grep prefers-reduced-motion` returns zero hits in `src/`. No component, hook, or stylesheet currently handles `prefers-reduced-motion`.

### 11.2 For MVP
The implementation package requires `prefers-reduced-motion` support. It can be handled in two places:
1. **CSS:** `@media (prefers-reduced-motion: reduce)` in `instructor.css` — covers animations like the brass underline, mouth open/close, halo pulse, waveform bars
2. **JS:** `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — needed for controlling breathing animation timing and fades in React components

Since the entire codebase has no existing pattern, the MVP establishes the first pattern. Use CSS media queries as the primary mechanism (covers animations), and a single JS `usePrefersReducedMotion()` hook for any JS-driven animation.

---

## 12. Browser Speech Synthesis

### 12.1 Existing usage
**Finding: PRESENT — used in two files**

`speechSynthesis` is already used in production code:

1. `src/features/academy/instructor/InstructorTalkingHead.jsx` (production component, integrated in `LessonPlayer`)
   - Checks `'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window`
   - `cancel()` on unmount
   - `speak()`, `pause()`, `resume()`, `cancel()` implemented
   - Plays sentence-by-sentence via `utterance.onend` chain
   - Rate: 0.9, Pitch: 0.92, Volume: 1

2. `src/prototypes/academyVideoInstructor/LocalBrowserTalkingInstructor.jsx` (prototype, not wired to production)
   - Nearly identical implementation

### 12.2 Voice profile / persona profile gap
**Finding: ABSENT — no voice candidate selection exists**

The existing `InstructorTalkingHead.jsx` uses the browser's default voice — no voice selection, no persona-voice matching, no per-OS candidate list. The implementation package's `instructorVoiceProvider.js` adds:
- A voice candidate list per persona per OS
- `pickVoice()` that returns `null` when no candidate matches (triggering ReaderMode)
- Voice rate, pitch, and volume per persona

This is a meaningful new addition. The existing `SpeechSynthesisUtterance` setup provides the foundation; the new provider wraps it with persona intelligence.

---

## 13. Risks Before Implementation

### R1 — HIGH: The implementation package assumes building from scratch, but substantial code already exists
The `src/features/academy/instructor/` folder has 5 components, 1 CSS file, 2 services, and 1 data file that directly overlap with the implementation plan. The builder must choose:
- **Evolve** the existing components (rename, reshape, add missing pieces)
- **Create new files** alongside the existing ones and deprecate the old ones after MVP

If the builder creates `AcademyLessonScreen.jsx` and new services alongside the existing `LessonInstructorView.jsx` and `academyInstructorScriptService.js` without explicitly deprecating the old ones, the codebase will have two parallel instructor systems. This is a **Toam-level decision** that must be made before code begins.

**Recommendation:** Evolve in-place. Rename and extend the existing service rather than creating a parallel one. The `academyInstructorScriptService.js` is the right foundation for `instructorNarrationScriptService.js`; one replaces the other.

### R2 — HIGH: `taxonomy` field is `{type, usage}[]` not string[]
The implementation package's narration algorithm (§5.1) says `taxonomy` is "surfaced in ReaderMode as a definition list." The actual data shape is an array of `{ type: string, usage: string }` objects, which is exactly right for a definition list. BUT the algorithm in §6.5 calls `format(lesson.terminology)` for terminology as a narration segment — the narration layer must handle the object array shape for taxonomy, not join it as plain strings. The narration layer will break on taxonomy if it tries to `join(', ')` on objects.

### R3 — MEDIUM: The only video is service-001 (Service Academy) — mismatch with Bar/Rafael persona
If MVP includes a video path with Rafael (Bar persona), the only available video content is a Service Academy lesson. The video title itself says "HESTIA Bar Academy" which creates confusion. Options:
- Skip video path in Bar/Rafael voice-first MVP (safest)
- Use service-001 as a cross-academy demo with an explicit disclaimer in the audit
- Commission a Bar Academy video before MVP ships (longer timeline)

### R4 — MEDIUM: `LessonPlayer.jsx` has a "DEV ONLY" instructor block that coexists with the new screen
Lines 330–331 in `LessonPlayer.jsx`:
```jsx
{/* DEV ONLY — remove before production */}
{showInstructor && <LessonInstructorView script={instructorScript} videoMeta={videoMeta} />}
```
The new `AcademyLessonScreen` will exist at a different route. Unless the DEV ONLY block is explicitly removed, both instructor UIs will be accessible to developers on the `lessonPlayer` page. This is a low-impact but visible inconsistency that should be resolved before launch.

### R5 — MEDIUM: No `prefers-reduced-motion` pattern anywhere in the codebase
The MVP establishes the first reduced-motion pattern. If not done with care (CSS media queries first, then JS for React-driven animations), future components will have inconsistent patterns. Establish a `usePrefersReducedMotion()` hook in the same PR as the Academy instructor.

### R6 — MEDIUM: `persona_id` is absent from lesson data
The implementation package §3.6 says the new screen receives a `lessonId` and optionally `personaId`. Since no lesson has `personaId`, the new service must resolve persona from `academyId`. The mapping `bar-academy → bar-rafael` should live in the persona registry (`personas/index.js`), not be hardcoded per component.

### R7 — LOW: `doctrine` field exists in lesson schema but is absent from narration spec
Bar lessons have `doctrine: null` (it's populated in Coffee and Culinary lessons). The narration service should skip it gracefully. The `LessonPlayer` uses `doctrine` in its recap step — the narration service already handles this correctly by skipping null fields.

### R8 — LOW: Transition phrases (§6.6) use hospitality-native English that Toam should approve
The proposed Rafael transition phrases (`"Here is what is underneath."`, `"Here is where most pours go wrong."`, etc.) are written, not generated. They should be confirmed by Toam before they are committed to `barRafael.js`.

### R9 — LOW: `instructor.css` uses `width` transition on `.avi-progressBar span`
```css
.avi-progressBar span {
  transition: width 220ms ease;  ← layout thrash risk
}
```
The new brass underline must NOT use `width` transition. Use `transform: scaleX()` from the left edge. The existing `avi-progressBar` approach is a known anti-pattern for the brass underline animation specifically called out in the implementation package §1.3 risk 2.

### R10 — LOW: `AcademyEmbeddedVideoPlayer` exposes an "Open provider page" link
```jsx
{publicUrl && (
  <a className="avi-videoLink" href={publicUrl} target="_blank" rel="noreferrer">
    Open provider page
  </a>
)}
```
This leaks provider identity to the learner. The Synthesia public URL is visible. This must be removed in the new `VideoStage` to meet the "no provider branding" honesty rail.

---

## 14. Summary Tables

### Green Lights
Items that match the implementation plan's assumptions and unblock the build as-is.

| # | Item | Evidence |
|---|---|---|
| G1 | All Bar Academy lessons (bar-001 to bar-010) have all 9 narration-source fields fully populated | `universityManifest.js` lines 80–328 |
| G2 | `service-001` exists, has a Synthesia embed, and is the single video-capable lesson | `academyInstructorVideoMap.js` |
| G3 | `hospia.*` localStorage prefix is universal and consistent | `systemConfig.js` |
| G4 | All proposed MVP localStorage keys (`hospia.academy.instructor.*`) are collision-free | Confirmed absent from `systemConfig.js` |
| G5 | `window.speechSynthesis` is already used in production code — pattern established | `InstructorTalkingHead.jsx` |
| G6 | `App.jsx` is composition-only — zero state, zero feature UI | `App.jsx` lines 74–351 |
| G7 | PageRenderer uses grouped domain prop objects — adding `lessonInstructor` page is a one-entry change | `App.jsx` line 397 |
| G8 | Tailwind is the styling system — `hospia.gold` (#c9a96e) is already the brass token | `tailwind.config.js` |
| G9 | Trusted video embed infrastructure already exists with URL allowlist | `instructorEmbedProviders.js`, `AcademyEmbeddedVideoPlayer.jsx` |
| G10 | Script-building service already derives content from lesson fields without invention | `academyInstructorScriptService.js` |
| G11 | `lessonHasExpandedContent()` in `academy.js` confirms all lesson fields — the same utility can gate the instructor screen | `utils/academy.js` |
| G12 | `assessment_questions` exists as an array of strings in all bar lessons — Review Questions panel has real data | Every bar lesson in `universityManifest.js` |
| G13 | Prior prototype audit exists (2026-05-18) with compatible architecture decisions | `ACADEMY_STRUCTURE_AUDIT.md` |

### Yellow Lights
Items that require a minor adjustment but do not block.

| # | Item | Adjustment needed |
|---|---|---|
| Y1 | `taxonomy` is `{type, usage}[]`, not `string[]` — narration layer must handle object shape | Narration service formats as `"[type]: [usage]"` pairs, not `join(', ')` on raw objects |
| Y2 | No serif font configured — `font-serif` uses browser default (Georgia/Times) | Accept current serif default, or add a Google Font (`font-display: swap`) for the stage typography if desired |
| Y3 | `prefers-reduced-motion` has zero existing patterns — MVP establishes the first | Add `usePrefersReducedMotion()` hook; document it in CLAUDE.md after MVP |
| Y4 | `LessonPlayer` has a "DEV ONLY" instructor block that coexists with the new screen | Remove the DEV ONLY block and `showInstructor` toggle when the new screen ships — one targeted edit to `LessonPlayer.jsx` |
| Y5 | `AcademyEmbeddedVideoPlayer` exposes "Open provider page" link — breaks the no-provider-chrome rule | New `VideoStage` must omit `publicUrl` prop or the link entirely |
| Y6 | Persona is currently anonymous descriptor ("HESTIA Bar Mentor"), not a named character | New `barRafael.js` persona record with named greeting/transition/closing phrases replaces the descriptor |
| Y7 | 13 hooks exist, CLAUDE.md says 10 — minor doc inconsistency | Update CLAUDE.md hook count in the Academy checkpoint note |
| Y8 | `bar-academy → bar-rafael` mapping must live in the persona registry, not hardcoded | `personas/index.js` registry maps `academyId` to `personaId` |

### Red Lights
Items that contradict the plan and require a Toam decision before code begins.

| # | Item | Decision needed |
|---|---|---|
| R1 | **Substantial existing instructor code in `src/features/academy/instructor/`** — the implementation package assumes building from scratch. Parallel systems must not coexist after MVP ships. | **Toam must decide:** (a) Evolve the existing files in-place, renaming/extending them to match the MVP spec; OR (b) Create new files alongside the old ones, then delete old files in the same PR. Option (a) is recommended. |
| R2 | **Video is service-001 (Service Academy), not Bar Academy.** If MVP includes a video path with Rafael (Bar persona), the video content is a cross-academy lesson. | **Toam must decide (§11 Q3 from implementation package):** (a) Skip video path — MVP is Bar/Rafael voice-only. (b) Cross-academy MVP — service-001 video under a "cross-academy demo" label. (c) Persona becomes Mira/Service to match the video. |
| R3 | **Rafael transition phrases (§6.6) must be Toam-approved before commit** — they are written hospitality copy, not generated. | **Toam: approve or rewrite the six Rafael transition phrases before the `barRafael.js` record is committed.** |

---

## 15. Recommendation for First Vertical Slice

### Recommended path: **Bar/Rafael voice-first**

**Rationale:**
1. Zero data risk — all 10 Bar lessons are fully populated.
2. Cleanest scope — one persona, one academy, voice path only.
3. The implementation package's own MVP description §2.1 describes this as the primary path.
4. The existing TTS infrastructure in `InstructorTalkingHead.jsx` is a working foundation to evolve.
5. Video path (service-001) is available as a follow-on session without blocking MVP.
6. The "one room feels like a room" principle is fully achievable with voice + portrait + transcript + takeaways + review questions from any bar lesson.

**Voice lesson for MVP:** `bar-001` — "Ice Systems, Dilution, And Thermal Control" (first lesson, always unlocked, richest field set).

**Video path:** Deferred. Add as a second session once Bar/Rafael voice is excellent.

---

## 16. Recommended Next Implementation Prompt

The following prompt is recommended for the next Claude Code session. It assumes Toam has:
1. Reviewed this audit
2. Confirmed Bar/Rafael voice-first MVP
3. Confirmed "evolve existing files in-place" (Red Light R1 — Option A)
4. Confirmed the six Rafael transition phrases from §6.6 of the implementation package OR provided rewrites
5. Confirmed the DEV ONLY block in `LessonPlayer.jsx` will be removed as part of MVP

---

**Next session prompt (copy verbatim):**

```
You are Claude Code working inside the HESTIA repo.

The audit in docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md has been reviewed and all
red lights have been resolved:
- MVP path: Bar/Rafael voice-first (bar-001 as the MVP voice lesson)
- Existing instructor files will be evolved in-place (not new parallel files)
- Rafael transition phrases from §6.6 are approved as-is
- DEV ONLY block in LessonPlayer.jsx will be removed in this session

Read before building (in this order):
1. docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_IMPLEMENTATION_PACKAGE.md (sections 1–3 and 5–10)
2. docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md (this document — shape notes and risks)
3. CLAUDE.md

Then implement in this exact order (do not parallelize, do not skip steps):

Step 1: Persona record
- Create src/domain/academy/personas/barRafael.js with the persona record:
  id, name ("Rafael"), academy ("bar-academy"), greeting_phrases[], closing_phrases[],
  transitions{}, voice_profile{candidates[], rate, pitch, volume}, short_bio, signature_phrase
- Create src/domain/academy/personas/index.js — registry returning persona by academyId
- No fabricated bio. Use the persona data from §6.6 and §2.2 item 19 of the implementation package.

Step 2: Design tokens
- Extend tailwind.config.js with instructor-specific tokens only:
  instructor stage background, motion durations for brass underline and waveform
- Do not create a separate tokens.js file

Step 3: Narration script service
- Create src/services/instructorNarrationScriptService.js
  - Implement buildScript(lesson, persona) → segments[] per §6.5 algorithm
  - Handle taxonomy as {type, usage}[] objects (Yellow Light Y1 from audit)
  - Return editorialNeeded: true when < 3 source-derived segments
  - Sentence splitter for transcript panel (§6.9)
- Write unit tests: buildScript with full lesson, buildScript with thin lesson,
  editorialNeeded flag, sourceField traceability
- This file REPLACES academyInstructorScriptService.js (evolve in-place means
  rename the old one and write the new one in its place)

Step 4: Academy instructor service
- Create src/services/academyInstructorService.js
  - resolveMode(lesson, videoMap) → 'voice' | 'video' | 'reader'
  - selectTakeaways(lesson) → up to 5 takeaways from structured fields only
  - mapReviewQuestions(lesson) → up to 4 reflective prompts from assessment_questions only
- Unit tests for each function

Step 5: Voice provider
- Create src/services/instructorVoiceProvider.js
  - Wraps speechSynthesis behind speakSentence/pause/resume/cancel
  - pickVoice(personaVoiceProfile) returns first match or null
  - null triggers ReaderMode upstream
- This file REPLACES the speechSynthesis logic in InstructorTalkingHead.jsx

Step 6: Video provider  
- Create src/services/instructorVideoProvider.js
  - Wraps iframe behind mount/play/pause/destroy
  - Uses the existing isTrustedInstructorEmbedUrl from instructorEmbedProviders.js

Step 7: Hook
- Create src/hooks/useAcademyInstructorSession.js
  - Owns playback state, mode, currentSentenceIndex, resume persistence
  - Reads hospia.academy.instructor.{lessonId}.v1.lastSentenceIndex from localStorage
  - Calls voice/video providers through their interfaces
  - Does NOT import other hooks

Step 8: Components scaffold
- Create all files in src/features/academy/instructor/ per §3.1 folder map
  - AcademyLessonScreen.jsx, LessonHeader.jsx, InstructorStage.jsx, StageFrame.jsx,
    VideoStage.jsx, PortraitStage.jsx, AmbientWaveformLine.jsx, SpokenCaption.jsx,
    LessonControlBar.jsx, TranscriptPanel.jsx, TranscriptSentence.jsx,
    KeyTakeawaysPanel.jsx, ReviewQuestionsPanel.jsx, ProgressIndicator.jsx,
    ModeSwitcher.jsx (hidden in MVP), ReaderMode.jsx
- EVOLVE EXISTING: InstructorTalkingHead.jsx, InstructorTranscriptPanel.jsx,
  AcademyEmbeddedVideoPlayer.jsx — reshape or remove as each is superseded

Step 9: Visual frame first
- Build StageFrame, LessonHeader, ProgressIndicator
- The brass underline in ProgressIndicator uses transform: scaleX(), not width transition

Step 10: Video path
- Wire VideoStage with instructorVideoProvider
- Remove the "Open provider page" link (Yellow Light Y5 from audit)

Step 11: Voice path
- Wire PortraitStage with AmbientWaveformLine, SpokenCaption, instructorVoiceProvider

Step 12: Transcript
- Wire TranscriptPanel with scroll-to-active, brass underline on active sentence (CSS transform)

Step 13: Controls
- Wire LessonControlBar — play, pause, restart (with confirm), back (with confirm)

Step 14: Content panels
- Wire KeyTakeawaysPanel from academyInstructorService.selectTakeaways()
- Wire ReviewQuestionsPanel from academyInstructorService.mapReviewQuestions()

Step 15: ReaderMode fallback

Step 16: prefers-reduced-motion
- CSS media queries in instructor.css
- usePrefersReducedMotion() hook in src/hooks/

Step 17: Resume persistence

Step 18: Wire to navigation
- Add lessonInstructor page key to PageRenderer in App.jsx (one entry)
- Add lessonInstructor to navigationConfig.js (hiddenInNav: true)
- Add openInstructorLesson callback to useStaffAcademyState.js

Step 19: Remove DEV ONLY block from LessonPlayer.jsx

Step 20: Run manual smoke tests A, C, F, G, H, I, J from §7.1

Step 21: Update CLAUDE.md with a one-paragraph Academy Instructor MVP checkpoint.

Architecture rules (non-negotiable):
- App.jsx: one new entry in the pages map only. No state. No feature UI.
- All playback state in useAcademyInstructorSession.
- All intelligence in services.
- Components are stateless except ReviewQuestionsPanel (local reflection text only).
- No copy uses forbidden language (no TTS, AI voice, module, XP, earn, complete, !, emoji).
- No fabricated content — every narrated segment maps to a lesson field or persona phrase.
- taxonomy is {type, usage}[] — handle object shape in narration layer.
```

---

*Audit complete. No production code was changed. No secrets were touched. No components were created. No commits were made.*
