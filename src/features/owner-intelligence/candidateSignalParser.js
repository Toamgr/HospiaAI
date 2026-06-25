// Candidate signal parser — the CLIENT read-side of the Owner Correction Loop output.
//
// Reads the "Candidate Venue DNA signals" bucket out of an assistant message so the inline
// fidelity-review surface can render it. It is a thin composition over the shared, pure
// `candidateSignalFormat` primitives — no parsing logic lives here, so writer and reader
// can never drift.
//
// Doctrine: this is FIDELITY review only ("HESTIA captured what I meant"), never identity
// confirmation ("this is confirmed Venue DNA"). The parser stamps every candidate with
// provenance `owner_conversation`; it reads existing text only — no network, no persistence,
// no Venue DNA mutation.

import { parseCandidateSignalsFromText } from '../../services/venueIntelligence/candidateSignalFormat.js';

// Parse candidate signals from one assistant message's content.
//
// Returns null when the message is not an Owner Correction Loop reply with a candidate
// bucket — ordinary chat turns, Founder Briefs, and normal-night synthesis all return null
// so the panel never renders for them. When a bucket exists, returns:
//
//   { candidates: [ { signal, evidence, confidence, status, suggestedDestination,
//                     provenance: 'owner_conversation' } ], framingNeeded: true }
//
// Missing fields are preserved as null (rendered honestly), never fabricated. A candidate
// with no recoverable signal is dropped (fail-safe), and a bucket that yields no usable
// candidate returns null.
export function parseCandidateSignals(messageContent) {
  if (typeof messageContent !== 'string' || !messageContent.trim()) return null;

  let parsed;
  try {
    parsed = parseCandidateSignalsFromText(messageContent);
  } catch {
    // Fail safe: never let a malformed message break the chat render.
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const candidates = parsed
    .filter((c) => c && c.signal) // never fabricate a signal that isn't there
    .map((c) => ({
      signal: c.signal,
      evidence: c.evidence ?? null,
      confidence: c.confidence ?? null,
      status: c.status ?? null,
      suggestedDestination: c.suggestedDestination ?? null,
      provenance: 'owner_conversation',
    }));

  if (candidates.length === 0) return null;
  return { candidates, framingNeeded: true };
}
