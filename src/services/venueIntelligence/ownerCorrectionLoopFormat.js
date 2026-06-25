/**
 * Owner Correction Loop — deterministic candidate-signal structure backstop.
 *
 * The Owner Correction Loop's "Candidate Venue DNA signals" bucket must NOT collapse
 * to plain bullets. Every candidate signal must carry the five fields a future
 * approval/persistence step will depend on:
 *
 *   Signal               — the candidate signal itself
 *   Evidence             — the supporting detail from the conversation / Founder Brief
 *   Confidence           — low | medium | high
 *   Status               — candidate only | needs owner confirmation | too early
 *   Suggested destination— Venue DNA | Venue Memory | Bar Intelligence | Service |
 *                          Academy | Events | F&B
 *
 * This module is PURE and STATELESS. It parses ONLY what the model already produced
 * and reuses any fields the model supplied; it NEVER fabricates a signal and NEVER
 * invents specific evidence. Missing structured fields are filled with the most
 * CONSERVATIVE honest default (Confidence: low, Status: candidate only, Suggested
 * destination: Venue DNA, and an Evidence line that truthfully says the supporting
 * detail was not captured rather than inventing one).
 *
 * The read/parse/normalize primitives now live in the shared, dependency-free module
 * `candidateSignalFormat.js` so the client-side reader and this server-side writer can
 * never drift apart. This file owns only the WRITER concern: detecting whether the
 * bucket is already structured and rewriting it in place when it is not.
 *
 * Output contract only: no DB, no persistence, no canonical Venue DNA mutation, no
 * approval flow. It rewrites the candidate bucket's free-text presentation, nothing else.
 */

import {
  VALID_CONFIDENCE,
  VALID_STATUS,
  VALID_DESTINATION,
  DEFAULT_CONFIDENCE,
  DEFAULT_STATUS,
  DEFAULT_DESTINATION,
  DEFAULT_EVIDENCE,
  readField,
  normalizeCandidateConfidence,
  normalizeCandidateStatus,
  normalizeSuggestedDestination,
  locateCandidateSection,
} from './candidateSignalFormat.js';

// True only when the candidate bucket exists, has at least one entry, and EVERY entry
// already carries all five fields with valid Confidence/Status/Destination values.
export function candidateSignalsAreStructured(reply) {
  const section = locateCandidateSection(reply);
  if (!section || section.entries.length === 0) return false;
  return section.entries.every((raw) => {
    const signal = readField(raw, 'signal');
    const evidence = readField(raw, 'evidence');
    const confidence = normalizeCandidateConfidence(readField(raw, 'confidence'));
    const status = normalizeCandidateStatus(readField(raw, 'status'));
    const destination = normalizeSuggestedDestination(readField(raw, 'suggested destination'));
    return Boolean(signal && evidence && confidence && status && destination);
  });
}

// Build one canonical 5-field candidate line. Reuses every field the model supplied and
// fills only the genuinely missing ones with conservative, non-fabricated defaults. The
// signal text falls back to the whole raw entry when no explicit "Signal:" label exists.
function rebuildEntry(raw) {
  const explicitSignal = readField(raw, 'signal');
  const signal = (explicitSignal || raw.replace(/\b(evidence|confidence|status|suggested destination)\s*:[\s\S]*$/i, '').trim() || raw.trim())
    .replace(/[;.\s]+$/, '')
    .trim();
  const evidence = readField(raw, 'evidence') || DEFAULT_EVIDENCE;
  const confidence = normalizeCandidateConfidence(readField(raw, 'confidence')) || DEFAULT_CONFIDENCE;
  const status = normalizeCandidateStatus(readField(raw, 'status')) || DEFAULT_STATUS;
  const destination = normalizeSuggestedDestination(readField(raw, 'suggested destination')) || DEFAULT_DESTINATION;
  return `- Signal: ${signal}; Evidence: ${evidence}; Confidence: ${confidence}; Status: ${status}; Suggested destination: ${destination}`;
}

// Deterministically guarantee the candidate bucket uses the 5-field structure. No-op when
// the bucket is absent, empty (never fabricate signals), or already fully structured.
// Otherwise rewrites every candidate entry into the canonical 5-field line in place.
export function ensureStructuredCandidateSignals(reply) {
  const section = locateCandidateSection(reply);
  if (!section || section.entries.length === 0) return reply;
  if (candidateSignalsAreStructured(reply)) return reply;

  const { lines, headingIdx, endIdx, entries } = section;
  // Keep the heading prefix (e.g. "6. Candidate Venue DNA signals") and end it with a
  // single colon, dropping any inline content that was folded into the first entry.
  const headingMatch = lines[headingIdx].match(/^(.*?candidate venue dna signals)\b/i);
  const heading = headingMatch ? `${headingMatch[1]}:` : lines[headingIdx];
  const rebuilt = entries.map(rebuildEntry);
  const next = [...lines.slice(0, headingIdx), heading, ...rebuilt, ...lines.slice(endIdx)];
  return next.join('\n');
}

export const __testing = {
  readField,
  // Preserve the historical __testing names used by the existing test suite; these are
  // the same primitives, now sourced from the shared module.
  normalizeConfidence: normalizeCandidateConfidence,
  normalizeStatus: normalizeCandidateStatus,
  normalizeDestination: normalizeSuggestedDestination,
  locateCandidateSection,
  rebuildEntry,
  VALID_CONFIDENCE,
  VALID_STATUS,
  VALID_DESTINATION,
};
