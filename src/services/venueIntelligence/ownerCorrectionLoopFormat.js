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
 * Output contract only: no DB, no persistence, no canonical Venue DNA mutation, no
 * approval flow. It rewrites the candidate bucket's free-text presentation, nothing else.
 */

const VALID_CONFIDENCE = ['low', 'medium', 'high'];
const VALID_STATUS = ['candidate only', 'needs owner confirmation', 'too early'];
// Canonical casing for the seven destinations a candidate may be routed toward.
const VALID_DESTINATION = ['Venue DNA', 'Venue Memory', 'Bar Intelligence', 'Service', 'Academy', 'Events', 'F&B'];

const DEFAULT_CONFIDENCE = 'low';
const DEFAULT_STATUS = 'candidate only';
const DEFAULT_DESTINATION = 'Venue DNA';
const DEFAULT_EVIDENCE = 'Raised in the concept conversation; specific supporting detail not yet captured.';

const FIELD_LABELS = ['signal', 'evidence', 'confidence', 'status', 'suggested destination'];

const CANDIDATE_HEADING_RE = /candidate venue dna signals/i;
// Boundaries that close the candidate bucket: bucket 7 or the protect/never-become block.
const SECTION_END_RE = /(not ready for venue dna yet|what the venue must (protect|never become))/i;
const BULLET_RE = /^\s*(?:[-*•]|\d+[).])\s+/;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pull the value for a single labelled field out of one candidate's raw text. The
// value runs until the next known field label or end of text. Returns null when the
// label is absent. Never fabricates — only reads what the model wrote.
function readField(raw, label) {
  const others = FIELD_LABELS.filter((l) => l !== label).map(escapeRegExp);
  const re = new RegExp(
    `\\b${escapeRegExp(label)}\\s*:\\s*([\\s\\S]*?)(?=\\s*(?:${others.join('|')})\\s*:|$)`,
    'i',
  );
  const m = raw.match(re);
  if (!m) return null;
  const value = m[1].replace(/^[\s\-–—]+/, '').replace(/[\s;,]+$/, '').trim();
  return value || null;
}

function normalizeConfidence(value) {
  if (!value) return null;
  const hit = VALID_CONFIDENCE.find((c) => new RegExp(`\\b${c}\\b`, 'i').test(value));
  return hit || null;
}

function normalizeStatus(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  const hit = VALID_STATUS.find((s) => lower.includes(s));
  return hit || null;
}

function normalizeDestination(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  // Longest match first so "Venue Memory" is not shadowed by "Venue DNA" etc.
  const ordered = [...VALID_DESTINATION].sort((a, b) => b.length - a.length);
  const hit = ordered.find((d) => lower.includes(d.toLowerCase()));
  return hit || null;
}

// Locate the candidate bucket inside an Owner Correction Loop reply. Returns the line
// indices and the raw candidate-entry blocks, or null when the bucket is absent.
function locateCandidateSection(reply) {
  const lines = String(reply || '').split('\n');
  const headingIdx = lines.findIndex((l) => CANDIDATE_HEADING_RE.test(l));
  if (headingIdx === -1) return null;

  let endIdx = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (SECTION_END_RE.test(lines[i])) { endIdx = i; break; }
  }

  // Capture any inline content after the heading colon, plus the body lines, grouping
  // continuation lines under the bullet that started them.
  const entries = [];
  const headingRemainder = lines[headingIdx].replace(/^.*candidate venue dna signals\s*:?/i, '').trim();
  if (headingRemainder) entries.push(headingRemainder);

  for (let i = headingIdx + 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (BULLET_RE.test(line)) {
      entries.push(line.replace(BULLET_RE, '').trim());
    } else if (entries.length > 0) {
      entries[entries.length - 1] += ` ${line.trim()}`;
    } else {
      entries.push(line.trim());
    }
  }

  return { lines, headingIdx, endIdx, entries };
}

// True only when the candidate bucket exists, has at least one entry, and EVERY entry
// already carries all five fields with valid Confidence/Status/Destination values.
export function candidateSignalsAreStructured(reply) {
  const section = locateCandidateSection(reply);
  if (!section || section.entries.length === 0) return false;
  return section.entries.every((raw) => {
    const signal = readField(raw, 'signal');
    const evidence = readField(raw, 'evidence');
    const confidence = normalizeConfidence(readField(raw, 'confidence'));
    const status = normalizeStatus(readField(raw, 'status'));
    const destination = normalizeDestination(readField(raw, 'suggested destination'));
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
  const confidence = normalizeConfidence(readField(raw, 'confidence')) || DEFAULT_CONFIDENCE;
  const status = normalizeStatus(readField(raw, 'status')) || DEFAULT_STATUS;
  const destination = normalizeDestination(readField(raw, 'suggested destination')) || DEFAULT_DESTINATION;
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
  normalizeConfidence,
  normalizeStatus,
  normalizeDestination,
  locateCandidateSection,
  rebuildEntry,
  VALID_CONFIDENCE,
  VALID_STATUS,
  VALID_DESTINATION,
};
