/**
 * Candidate Venue DNA signal format — shared PURE parser / normalizer primitives.
 *
 * This module is the single source of truth for the shape of an Owner Correction Loop
 * "Candidate Venue DNA signals" line:
 *
 *   Signal               — the candidate signal itself
 *   Evidence             — the supporting detail from the conversation / Founder Brief
 *   Confidence           — low | medium | high
 *   Status               — candidate only | needs owner confirmation | too early
 *   Suggested destination— Venue DNA | Venue Memory | Bar Intelligence | Service |
 *                          Academy | Events | F&B
 *
 * It is consumed by BOTH:
 *   • the server-side writer backstop (ownerCorrectionLoopFormat.js), which repairs the
 *     candidate bucket into the 5-field structure, and
 *   • the client-side reader (features/owner-intelligence/candidateSignalParser.js), which
 *     parses that structure back out to render the inline fidelity-review surface.
 *
 * Keeping the read/parse/normalize logic here prevents drift between writer and reader.
 *
 * CONSTRAINTS — this module is intentionally dependency-free and side-effect-free:
 *   • no DB, no server imports, no React, no routes, no auth, no browser APIs (window,
 *     document, localStorage), no network, no I/O.
 *   • it NEVER fabricates a signal and NEVER invents evidence; missing fields parse to null.
 */

export const VALID_CONFIDENCE = ['low', 'medium', 'high'];
export const VALID_STATUS = ['candidate only', 'needs owner confirmation', 'too early'];
// Canonical casing for the seven destinations a candidate may be routed toward.
export const VALID_DESTINATION = ['Venue DNA', 'Venue Memory', 'Bar Intelligence', 'Service', 'Academy', 'Events', 'F&B'];

// Conservative, non-fabricated defaults used ONLY by the writer backstop when a field is
// genuinely absent. The reader never applies these — it renders missing fields honestly.
export const DEFAULT_CONFIDENCE = 'low';
export const DEFAULT_STATUS = 'candidate only';
export const DEFAULT_DESTINATION = 'Venue DNA';
export const DEFAULT_EVIDENCE = 'Raised in the concept conversation; specific supporting detail not yet captured.';

export const FIELD_LABELS = ['signal', 'evidence', 'confidence', 'status', 'suggested destination'];

const CANDIDATE_HEADING_RE = /candidate venue dna signals/i;
// Boundaries that close the candidate bucket: bucket 7 or the protect/never-become block.
const SECTION_END_RE = /(not ready for venue dna yet|what the venue must (protect|never become))/i;
const BULLET_RE = /^\s*(?:[-*•]|\d+[).])\s+/;

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pull the value for a single labelled field out of one candidate's raw text. The
// value runs until the next known field label or end of text. Returns null when the
// label is absent. Never fabricates — only reads what was written.
export function readField(raw, label) {
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

export function normalizeCandidateConfidence(value) {
  if (!value) return null;
  const hit = VALID_CONFIDENCE.find((c) => new RegExp(`\\b${c}\\b`, 'i').test(value));
  return hit || null;
}

export function normalizeCandidateStatus(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  const hit = VALID_STATUS.find((s) => lower.includes(s));
  return hit || null;
}

export function normalizeSuggestedDestination(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  // Longest match first so "Venue Memory" is not shadowed by "Venue DNA" etc.
  const ordered = [...VALID_DESTINATION].sort((a, b) => b.length - a.length);
  const hit = ordered.find((d) => lower.includes(d.toLowerCase()));
  return hit || null;
}

// Locate the candidate bucket inside an Owner Correction Loop reply. Returns the line
// indices and the raw candidate-entry blocks, or null when the bucket is absent.
export function locateCandidateSection(reply) {
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

// Parse ONE raw candidate entry into the 5-field shape. Reuses every field present and
// leaves genuinely-missing fields as null (the reader renders those honestly; the writer
// applies its own conservative defaults separately). The signal text falls back to the
// whole raw entry when no explicit "Signal:" label exists. Never fabricates.
export function parseCandidateSignalLine(raw) {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;

  const explicitSignal = readField(text, 'signal');
  const signal = (explicitSignal
    || text.replace(/\b(evidence|confidence|status|suggested destination)\s*:[\s\S]*$/i, '').trim()
    || text)
    .replace(BULLET_RE, '')
    .replace(/[;.\s]+$/, '')
    .trim();

  return {
    signal: signal || null,
    evidence: readField(text, 'evidence'),
    confidence: normalizeCandidateConfidence(readField(text, 'confidence')),
    status: normalizeCandidateStatus(readField(text, 'status')),
    suggestedDestination: normalizeSuggestedDestination(readField(text, 'suggested destination')),
  };
}

// True only when a parsed candidate carries all five fields with valid, present values.
export function candidateSignalHasRequiredFields(candidate) {
  return Boolean(
    candidate
    && candidate.signal
    && candidate.evidence
    && candidate.confidence
    && candidate.status
    && candidate.suggestedDestination,
  );
}

// Parse every candidate signal out of a full reply's candidate bucket. Returns [] when the
// bucket is absent or empty — never invents entries. Malformed entries parse to whatever
// fields were recoverable (missing ones stay null), failing safely rather than throwing.
export function parseCandidateSignalsFromText(text) {
  const section = locateCandidateSection(text);
  if (!section || section.entries.length === 0) return [];
  return section.entries.map(parseCandidateSignalLine).filter(Boolean);
}
