// ─── HESTIA Academy Instructor Video Map ──────────────────────────────────────
//
// Maps lesson.id → video production entry.
// Only add an entry here when a real video exists or is actively in production.
// All absent lessons fall through to Voice mode automatically.
//
// ── Status values ─────────────────────────────────────────────────────────────
//   'needs_video'   — no video started; lesson uses Voice mode as fallback
//   'in_production' — video submitted to provider; not yet returned; still Voice mode
//   'video_ready'   — video confirmed and deployed; Video mode is the default
//
// ── How to ship a new video ───────────────────────────────────────────────────
//   Step 1: In DevTools on the dev server, run:
//             await window.__HESTIA_EXPORT_INSTRUCTOR_VIDEO_PACKAGE__('bar-001')
//           Copy the scriptText + productionNotes from the JSON output.
//
//   Step 2: Submit to Synthesia (or equivalent provider):
//           - Use scriptText verbatim — do not rewrite or paraphrase
//           - Set tone/pacing/visual from productionNotes
//           - Match the instructor persona (instructorName, instructorTitle)
//
//   Step 3: While waiting, add an in_production entry below (no embedUrl yet):
//             'bar-001': { status: 'in_production', provider: 'synthesia-embed', title: '...' }
//
//   Step 4: When the video is ready, get the embed URL from Synthesia:
//           Share link:   https://share.synthesia.io/<video-id>
//           Embed link:   https://share.synthesia.io/embeds/videos/<video-id>
//
//   Step 5: Update the entry to video_ready:
//             'bar-001': {
//               status: 'video_ready',
//               provider: 'synthesia-embed',
//               title: 'HESTIA Bar Academy — <lesson title>',
//               embedUrl: 'https://share.synthesia.io/embeds/videos/<video-id>',
//               publicUrl: 'https://share.synthesia.io/<video-id>',
//             }
//
//   Step 6: Validate in DevTools:
//             await window.__HESTIA_VALIDATE_VIDEO_ENTRY__('bar-001')
//
// ── Entry schema ──────────────────────────────────────────────────────────────
//   status:    'needs_video' | 'in_production' | 'video_ready'  (required)
//   provider:  'synthesia-embed'                                (required)
//   title:     human-readable label matching the lesson content (required)
//   embedUrl:  trusted embed URL from provider                  (required when video_ready)
//   publicUrl: shareable public URL from provider               (required when video_ready)
//
// ── Trust model ───────────────────────────────────────────────────────────────
//   Only entries with a trusted embedUrl (validated by instructorEmbedProviders.js)
//   are shown in Video mode. All others fall back to Voice mode automatically.
//   Do not add untrusted or placeholder URLs — leave embedUrl absent instead.

const academyInstructorVideoMap = {

  // service-001 — confirmed video_ready, Synthesia embed
  'service-001': {
    status: 'video_ready',
    provider: 'synthesia-embed',
    title: 'HESTIA Bar Academy - Luxury Bar Hospitality: The Art Of Welcoming Guests',
    embedUrl: 'https://share.synthesia.io/embeds/videos/05d5dfcf-ad20-498b-8607-4045f1ff180b',
    publicUrl: 'https://share.synthesia.io/05d5dfcf-ad20-498b-8607-4045f1ff180b',
  },

  // bar-001 — confirmed video_ready, Synthesia embed
  'bar-001': {
    status: 'video_ready',
    provider: 'synthesia-embed',
    mode: 'embedded',
    title: 'HESTIA Bar Academy — Ice Systems, Dilution, And Thermal Control',
    embedUrl: 'https://share.synthesia.io/embeds/videos/3e3f3fe7-7434-426b-b0a4-68079ef5307c',
    publicUrl: 'https://share.synthesia.io/3e3f3fe7-7434-426b-b0a4-68079ef5307c',
  },

  // bar-002 through bar-010 — not yet started
  // Add entries here as videos are submitted and returned from Synthesia.

}

export default academyInstructorVideoMap
