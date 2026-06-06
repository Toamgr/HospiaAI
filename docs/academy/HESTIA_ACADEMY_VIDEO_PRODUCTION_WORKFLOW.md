# HESTIA Academy — Video Production Workflow

**Status:** Planning Phase — Not Yet Implemented  
**Date:** 2026-06-06  
**Phase:** Pre-Phase 11E  
**Classification:** Production Process + Technical Contract Document

---

## Purpose

This document defines the lifecycle of a HESTIA lesson video from concept to final embed — ensuring that:
- No fake video is ever shown to an employee
- Every lesson has a correct fallback (Reading / Voice) until a real video exists
- The technical mapping between lesson IDs and video URLs is safe, maintainable, and source-backed
- The production team, developers, and content team share a common language

---

## 1. The Honesty Rule

> A lesson must never claim to have a video unless a real, reviewed, playable video URL is mapped to its lesson ID in `academyInstructorVideoMap.js`.

**Until then:** the lesson shows Reading Mode or Voice Mode only. No "video coming soon" badge. No video player UI. No placeholder.

**Currently `video_ready` lessons (as of 2026-06-06):**
- `service-001` — Luxury Bar Hospitality: The Art of Welcoming Guests
- `bar-001` — Ice Systems, Dilution, and Thermal Control
- `bar-002` — Shaking Mechanics, Aeration, and Emulsification

All other lessons are `needs_video` or unset.

**Important note:** The `service-001` video was produced under an earlier title. Before marking it as the flagship SA-1 lesson, confirm the video content matches the SA-1 lesson direction in the curriculum plan. If it does not, the lesson remains `needs_video` until a new video is produced.

---

## 2. Video Status Lifecycle

Every lesson has exactly one video status at any given time. The status lives in `academyInstructorVideoMap.js`.

```
needs_script → script_ready → in_production → video_ready
```

### Status Definitions

| Status | Meaning | UI behavior |
|---|---|---|
| `needs_script` | No script exists yet. Lesson content is defined in the manifest but no narration script has been written. | Reading mode only. No voice mode for video. |
| `script_ready` | Final narration script written, reviewed, and approved. Ready to submit to Synthesia or avatar production. | Reading mode + Voice mode (TTS from script). No video player. |
| `in_production` | Script submitted to video production. Avatar/video is being rendered. | Reading mode + Voice mode. Optional: subtle "Video in production" metadata note (not prominent). |
| `video_ready` | Real video exists, embed URL is confirmed and tested, quality review passed. | Reading + Voice + Video mode tabs visible. Default mode: Video. |

### What status does NOT trigger
- `needs_script` does not mean the lesson is incomplete — it means video production has not started
- `script_ready` does not unlock video mode
- `in_production` does not unlock video mode
- Only `video_ready` with a real embed URL unlocks video mode

---

## 3. Script Lifecycle

### Stage 1 — Lesson Outline
Before any script is written, the lesson must have:
- Academy ID
- Lesson ID
- Lesson title
- Purpose statement
- Key topics
- Practical scenario
- Instructor persona
- Estimated video length

These are defined in the curriculum plan (`HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md`) and must match the lesson object in `universityManifest.js` / `universityExpansion.js`.

### Stage 2 — Narration Script (final)
A narration script is the instructor's spoken words, written exactly as they will be delivered on video. It is not a content summary.

**Narration script requirements:**
- Written in the instructor persona's voice (Mira / Theo / Daniel / Noa — per persona specs in `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`)
- Must match the lesson duration target (5–9 minutes = approximately 750–1,350 words at a natural spoken pace)
- Structured as: Opening → Core teaching → Scenario → Drill setup → Close
- Every sentence must be speakable — no complex clauses that are awkward to deliver aloud
- No academic language; hospitality tone throughout
- Reviewed by at least one hospitality professional before submitting to production

**Script status check before production submission:**
- [ ] Voice-tested aloud (not just read silently)
- [ ] Duration confirmed in range
- [ ] Persona voice consistent throughout
- [ ] Scenario matches curriculum plan
- [ ] Drill instruction is clear and practical
- [ ] No invented facts, fake statistics, or placeholder text

### Stage 3 — Production Script
A production script is the narration script expanded with video production direction.

**Production script additions:**
- Speaker name and persona
- Scene/visual direction (what should appear on screen at each moment)
- B-roll or overlay notes (e.g., "cut to: floor service sequence")
- Emphasis markers for avatar delivery
- On-screen text markers (key terms, lesson number, section headers)
- Timing markers per section

**Production script format recommendation:**
```
[SCENE: Instructor at stand — service academy setting]
[DURATION: 0:00–0:30]

MIRA (warmly, direct):
"Before a guest says a word to you, they've already decided 
whether they feel welcome. In the first thirty seconds..."

[ON-SCREEN TEXT: "The First 30 Seconds"]
[B-ROLL: Service floor, host desk, guest arrival sequence]
```

### Stage 4 — Avatar / Video Production
Currently using Synthesia for avatar-based video production.

**Submission checklist:**
- [ ] Final narration script confirmed (not production script — Synthesia uses narration only)
- [ ] Avatar/persona selected in Synthesia dashboard
- [ ] Background scene selected (matching academy visual identity)
- [ ] Duration within platform limits
- [ ] Script encoding confirmed (no special characters that break TTS)
- [ ] Submitted to project workspace (not personal account)

**Export checklist from Synthesia:**
- [ ] Video renders completely (no broken segments)
- [ ] Avatar lip sync is acceptable (flag to team if not)
- [ ] Embed URL generated and tested in an incognito browser
- [ ] URL format matches expected pattern for `academyInstructorVideoMap.js`

### Stage 5 — Quality Review
Before a video is marked `video_ready`, it must pass quality review.

**Quality review checklist:**

**Content accuracy:**
- [ ] Lesson content matches the curriculum plan for this lesson
- [ ] No invented facts, statistics, or unverified claims
- [ ] Scenario matches what was written in the curriculum plan
- [ ] Drill instruction is deliverable (can actually be done in a shift context)
- [ ] Instructor persona voice is consistent (Mira sounds like Mira throughout)

**Technical quality:**
- [ ] Video plays without interruption
- [ ] Audio is clear and at correct volume
- [ ] No rendering artifacts or jump cuts
- [ ] Embed URL loads in an iframe without errors
- [ ] Embed URL does not require login to view
- [ ] Video is not auto-playing (must require user action to start)

**HESTIA standards:**
- [ ] No corporate language, no generic LMS tone
- [ ] No inappropriate framing (guests are people, not customers)
- [ ] No invented hospitality claims
- [ ] Lesson delivers exactly one clear skill — not a survey course
- [ ] Duration is within 5–9 minutes

**Acceptance gate:** All checklist items must pass. Any failure returns the video to `in_production` or script review as appropriate.

### Stage 6 — Final Video Mapping
After quality review passes, the video embed URL is added to `academyInstructorVideoMap.js`.

---

## 4. Recommended File Structure for Scripts

```
docs/
  academy/
    scripts/
      service-academy/
        SA-1_the-first-30-seconds_OUTLINE.md
        SA-1_the-first-30-seconds_NARRATION.md
        SA-1_the-first-30-seconds_PRODUCTION.md
      hostess-academy/
        HA-1_front-door-authority_NARRATION.md
        ...
      coffee-program/
        ...
      culinary-intelligence/
        ...
      ethics-privacy/
        ...
```

**File naming convention:**
`{display-id}_{lesson-slug}_{stage}.md`

Where stage is: `OUTLINE` / `NARRATION` / `PRODUCTION`

Only `NARRATION` scripts are submitted to Synthesia.  
`PRODUCTION` scripts are for internal video direction reference.  
`OUTLINE` documents are for curriculum planning review.

---

## 5. Lesson Video Metadata Shape

The video metadata object for each lesson in `academyInstructorVideoMap.js` should follow this shape:

```javascript
{
  // Lesson ID (must match exactly the ID in universityManifest.js / universityExpansion.js)
  lessonId: 'service-001',

  // Video status — one of: needs_script | script_ready | in_production | video_ready
  status: 'video_ready',

  // Only present when status === 'video_ready'
  // Must be a real, tested, playable embed URL
  embedUrl: 'https://share.synthesia.io/embeds/videos/[uuid]',

  // Provider — currently only 'synthesia-embed' supported
  provider: 'synthesia-embed',

  // Human-readable title (for logging/review only — not shown in UI)
  title: 'The First 30 Seconds',

  // Persona for this video
  persona: 'mira',

  // Confirmed video duration in minutes (null if not yet produced)
  durationMinutes: 7,

  // Date video was marked video_ready (ISO format)
  videoReadyDate: '2026-06-01',

  // Notes for internal use only (never shown in UI)
  notes: 'Quality review passed. Embed confirmed in incognito.'
}
```

**Fields that must not be fabricated:**
- `embedUrl` — never a placeholder, never a mock URL
- `status: 'video_ready'` — never set without a real URL
- `durationMinutes` — never estimated; must be confirmed from the actual video

---

## 6. How to Map Finished Videos to Lesson IDs

1. Receive the completed video from Synthesia (or other provider)
2. Generate the embed URL from the Synthesia dashboard
3. Test the embed URL in an incognito browser window — confirm it loads, plays, and does not require login
4. Open `src/features/academy/data/academyInstructorVideoMap.js`
5. Find the existing entry for the lesson ID (or create a new entry)
6. Set `status: 'video_ready'`
7. Set `embedUrl` to the confirmed URL
8. Set `videoReadyDate` to today's date
9. Do NOT change any other academy data files (manifest, expansion, etc.)
10. Test in the app: open the lesson, confirm Video tab appears, confirm video plays
11. Commit the change with a message like: `feat(academy): mark service-001 video_ready`

---

## 7. How to Use `academyInstructorVideoMap.js` Safely

**Current location:** `src/features/academy/data/academyInstructorVideoMap.js`

**Rules:**
- This file is the **single source of truth** for video availability
- Never set `video_ready` without a real, tested embed URL
- Never set `embedUrl` to a placeholder, example, or localhost URL
- The lesson ID key must exactly match the ID in the manifest — no typos, no aliases
- If a video is removed or expires, set `status: 'needs_video'` and null the `embedUrl` immediately
- Do not cache this data in localStorage — always read from the module

**The video map is read-only from the component side.** Components read video status; they do not write it.

**Who can update the video map:**
- Developers after receiving a confirmed embed URL from production
- Never auto-populated from any AI generation or placeholder script

---

## 8. How to Keep Reading and Voice Fallback

Until a lesson has `video_ready` status, the LessonPlayer must show:

**Reading mode:** The lesson content (objective, doctrine, steps, drill) rendered as article text.  
**Voice mode:** TTS narration using browser speech synthesis (existing InstructorTalkingHead / TTS infrastructure).  
**No video tab:** The video tab must not appear in the UI.

**Anti-patterns to avoid:**
- A "Video" tab that says "Coming Soon"
- A video player that shows a loading state indefinitely
- Any reference to video production status in the employee UI (production status is internal only)
- A thumbnail or cover image that implies a video exists
- A placeholder iframe or blurred overlay suggesting video content

**The principle:** Reading and Voice modes are fully valid and premium experiences. They are not "less than" video. They are the standard until video is confirmed.

---

## 9. How to Mark Each Status

### Moving to `needs_script`
This is the default for new lessons. Nothing to do — if a lesson has no entry in the video map, it is treated as `needs_script`.

If adding an explicit entry: `status: 'needs_script'`, no `embedUrl`.

### Moving to `script_ready`
- Final narration script reviewed and approved
- Script file saved in `docs/academy/scripts/{academy}/{lesson}_NARRATION.md`
- Update video map entry: `status: 'script_ready'`
- Voice mode now reads from the approved script (if integrated) or from lesson content

### Moving to `in_production`
- Script submitted to Synthesia or video production
- Update video map entry: `status: 'in_production'`
- UI behavior: no change for employee (still Reading / Voice only)
- Optional internal note in `notes` field

### Moving to `video_ready`
- Real embed URL received and tested
- Quality review checklist completed (all items passed)
- Update video map entry: `status: 'video_ready'`, add `embedUrl`, `videoReadyDate`
- Video tab becomes available in LessonPlayer

---

## 10. Exporting Scripts for Synthesia-Style Production

When submitting a lesson script to Synthesia:

1. Use the `NARRATION.md` file only (not the `PRODUCTION.md`)
2. Confirm character encoding is UTF-8
3. Remove all markdown formatting from the script before submission (Synthesia reads plain text)
4. Note the exact persona/avatar ID from the Synthesia project
5. Select the correct background scene matching the academy palette
6. Set text overlays in the Synthesia editor using the `PRODUCTION.md` as reference
7. Before finalizing, preview the full video and confirm timing

**Script length guide for Synthesia:**
- 750 words → approximately 5–6 minutes
- 900 words → approximately 6–7 minutes
- 1,100 words → approximately 7–8 minutes
- 1,300 words → approximately 8–9 minutes

These are approximate. Always confirm actual duration from the rendered preview.

---

## 11. Quality Checklist for Every Video

Before any video is mapped as `video_ready`, the reviewer must sign off on all of the following:

**Content:**
- [ ] Lesson teaches exactly one skill (not a survey)
- [ ] Content matches the curriculum plan lesson definition
- [ ] No invented facts or statistics
- [ ] No placeholder language ("as we will discuss," "coming soon")
- [ ] Instructor persona voice is consistent and warm
- [ ] Hospitality philosophy honored (guests are people, not customers)
- [ ] Scenario is recognizable and real (not a corporate training cliché)
- [ ] Drill/simulation is practical and brief

**Technical:**
- [ ] Video plays without error
- [ ] Audio is clear, no distortion
- [ ] Duration within 5–9 minutes
- [ ] Embed URL works in incognito browser
- [ ] Embed URL works without login
- [ ] No auto-play (user must press play)
- [ ] No Synthesia watermark or branding visible (confirm licensing)

**Integration:**
- [ ] Lesson ID in video map matches lesson ID in manifest exactly
- [ ] LessonPlayer correctly shows Video tab after mapping
- [ ] Existing Reading and Voice modes still work after mapping
- [ ] No console errors when video mode is active

---

## 12. Acceptance Criteria Before a Lesson Can Show Video Mode

A lesson may only show a Video tab in the LessonPlayer if ALL of the following are true:

1. `academyInstructorVideoMap.js` has an entry for this lesson's ID
2. That entry has `status: 'video_ready'`
3. That entry has a non-null, non-empty `embedUrl`
4. The `embedUrl` is a real, tested, playable URL (not a placeholder)
5. The quality review checklist has been completed and passed
6. The video content matches the lesson definition in the curriculum plan

If any condition is false: the lesson shows Reading and Voice modes only.

---

## 13. Production Roadmap for the 25 Flagship Lessons

**Current status as of 2026-06-06:**

| Lesson | ID | Status |
|---|---|---|
| SA-1: The First 30 Seconds | `service-001` | `video_ready` (confirm content match before flagship use) |
| SA-2: Reading the Table | `service-005` | `needs_script` |
| SA-3: The Art of Silence | `service-003` | `needs_script` |
| SA-4: Recovery That Rebuilds | `service-008` | `needs_script` |
| SA-5: The Last 30 Seconds | `service-010` | `needs_script` |
| HA-1: Front Door Authority | `host-001` | `needs_script` |
| HA-2: Seating the Room | `host-003` | `needs_script` |
| HA-3: The Honest Wait | `host-004` | `needs_script` |
| HA-4: VIP Recognition Without Labels | `host-007` | `needs_script` |
| HA-5: The Invisible Handoff | `host-008` | `needs_script` |
| CP-1: Espresso Intelligence | `coffee-004` | `needs_script` |
| CP-2: Milk, Texture, and the Latte Standard | `coffee-005` | `needs_script` |
| CP-3: Coffee in the Meal Arc | `coffee-006` | `needs_script` |
| CP-4: Origins, Roasts, and Guest Language | `coffee-001` | `needs_script` |
| CP-5: The Coffee Bar Standard | `coffee-007` | `needs_script` |
| CI-1: Ingredient Literacy | `culinary-001` | `needs_script` |
| CI-2: Allergen Seriousness | `culinary-003` | `needs_script` |
| CI-3: How a Dish Works | `culinary-004` | `needs_script` |
| CI-4: The Confident Recommendation | `culinary-005` | `needs_script` |
| CI-5: The Kitchen Relationship | `culinary-006` | `needs_script` |
| EP-1: The Quiet Guardian Standard | `ethics-001` | `needs_script` |
| EP-2: Responsible Alcohol Service | `ethics-002` | `needs_script` |
| EP-3: VIP Privacy and Memory Ethics | `ethics-004` | `needs_script` |
| EP-4: De-Escalation With Dignity | `ethics-005` | `needs_script` |
| EP-5: The Ethics of Preference Memory | `ethics-007` | `needs_script` |

**Bar World videos (not Service School):**
- `bar-001`: `video_ready` — remains in Bar World Academy tab
- `bar-002`: `video_ready` — remains in Bar World Academy tab

---

---

## 14. Video Status Normalization Rules

**Source:** Derived from reviewing `docs/academy/research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md`  
**Integration date:** 2026-06-06  
**Purpose:** These rules exist because external curriculum sources (including AI-generated research reports) sometimes assign production statuses that are aspirational, estimated, or simply wrong. This section defines how to normalize any incoming status assignment.

---

### Rule 1: `video_ready` requires a real, live embed URL

A lesson status of `video_ready` is only valid when ALL of the following are true:
- A real embed URL exists in `academyInstructorVideoMap.js` for this lesson ID
- The URL was manually tested in an incognito browser within the last 30 days
- The video plays without login, without error, and within the 5–9 minute range
- Quality review checklist (Section 11) was completed and signed off

**If any condition is false:** The status is `needs_script` until re-evaluated.

**Cinematic video concepts are not videos.** A detailed video concept description (camera angles, lighting, shot list) is a creative brief for future production, not a produced video. Writing "video_ready" next to a lesson concept is a false status.

---

### Rule 2: `script_ready` requires a completed narration document

A lesson status of `script_ready` is only valid when:
- A final narration script file exists at `docs/academy/scripts/{academy}/{lesson}_NARRATION.md`
- The script has been voice-tested aloud (not just read silently)
- The script duration is confirmed to fall within the lesson's target length
- The script has been reviewed by at least one hospitality professional

**If any condition is false:** The status is `needs_script`.

A detailed lesson outline (purpose, key topics, scenario, drill) is an **OUTLINE**, not a narration script. Outlines live at `{lesson}_OUTLINE.md` stage. Calling an outline `script_ready` is a false status.

---

### Rule 3: `in_production` requires confirmed submission to a production platform

A lesson status of `in_production` is only valid when:
- A `script_ready` narration script has been confirmed (Rule 2 satisfied)
- The script has been physically submitted to Synthesia or an equivalent production platform
- The submission is confirmed (project ID or reference number exists)

Expressing intent to produce a video is not `in_production`. Planning to produce is not `in_production`. Only confirmed submission is `in_production`.

---

### Rule 4: Default for all new and unverified lessons is `needs_script`

When a lesson is added to the curriculum plan, its default production status is `needs_script`.

When an external source assigns a higher status to a lesson that has not been through the HESTIA production workflow, the status is reset to `needs_script` until HESTIA's own verification process confirms the promotion.

---

### Rule 5: Reading and Voice modes are not inferior — do not suppress them

Until a lesson reaches `video_ready`:
- Reading mode is the standard, fully designed experience
- Voice mode (TTS) is the second mode — available when TTS infrastructure is connected
- No "coming soon" video placeholder
- No blurred video overlay
- No video player UI of any kind

The Reading mode and Voice mode of a lesson are not provisional states waiting to be replaced. They are designed, permanent modes that remain available even after a video is added. An employee who prefers reading does not need to see a video player they cannot use.

---

### Rule 6: Production status is internal — never shown to employees

The `needs_script / script_ready / in_production / video_ready` status system is for the production team, content team, and developers. It must never appear in the employee-facing UI.

Employees see:
- "Video" tab (when `video_ready` — real URL only)
- "Voice" tab (when TTS available)
- "Reading" tab (always)

They do not see:
- "Video coming soon"
- "In production"
- "Script pending"
- Any production status language whatsoever

---

### Status Normalization Quick Reference

| Claimed status | Valid if | Otherwise becomes |
|---|---|---|
| `video_ready` | Real embed URL in video map, quality review passed, URL tested | `needs_script` |
| `script_ready` | Narration file exists at correct path, voice-tested, reviewed | `needs_script` |
| `in_production` | Submitted to Synthesia, reference confirmed, `script_ready` verified | `needs_script` |
| `needs_script` | Always valid as default | — |

---

### Applied Correction: Gemini Report Status Assignments

The Gemini Academy Intelligence Report (2026-06-06) assigned the following incorrect statuses. All are corrected here:

| Lesson (Gemini name) | Gemini Status | Corrected Status | Reason |
|---|---|---|---|
| Threshold Ritual (Host 2.1) | `video_ready` | `needs_script` | No embed URL exists |
| Silent Table Maintenance (Service 3.1) | `video_ready` | `needs_script` | No embed URL exists |
| Espresso Metrics (Coffee 4.1) | `video_ready` | `needs_script` | No embed URL exists |
| Floor Geometry (Host 2.3) | `in_production` | `needs_script` | No confirmed Synthesia submission |
| Reading Table Rhythms (Service 3.2) | `in_production` | `needs_script` | No confirmed Synthesia submission |
| Spec Architecture (Bar 1.1) | `script_ready` | `needs_script` | Report contains an outline, not a final narration script |
| Sensory Storytelling (Bar 1.4) | `script_ready` | `needs_script` | Report contains an outline, not a final narration script |

These corrections apply to all HESTIA lesson planning. The corrected statuses are reflected in the Production Roadmap in Section 13.

---

*This document is a planning artifact. No source files were modified. The video production workflow must be reviewed by the product and content team before scripts are commissioned.*
