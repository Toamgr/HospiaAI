// Venue Intelligence — owner-message intent classifier (P1 safety guard).
//
// WHY THIS EXISTS
// The Venue Intelligence chat is the only path that writes a venue's working
// Venue DNA (via mergeVenueDna). A QA finding showed that an owner exploring a
// NEW concept ("a new place inspired by Paradiso / SIPS …") had that concept
// silently merged into the EXISTING venue's canonical DNA. Concept exploration,
// benchmarks, "inspired by" prompts, and hypotheticals must be treated as
// draft/exploration — they must not rewrite the current venue's Venue DNA unless
// the owner explicitly says to update THIS venue.
//
// WHAT THIS IS / IS NOT
// - Pure and deterministic: no I/O, no AI, no DB. Easy to unit-test.
// - It does NOT assign Venue DNA statuses, does NOT confirm anything, and does
//   NOT promote candidates. It only answers one question: "may this turn's
//   signals be merged into the current venue's canonical Venue DNA?"
// - It is intentionally conservative: when a message clearly reads as new-concept
//   exploration and does not explicitly tie itself to the current venue, the safe
//   default is to NOT merge into canonical DNA.
//
// LIMITATION (documented on purpose): classification is per-message. A follow-up
// turn that drops the exploration cues is treated as current-venue discovery.
// Persisting an exploration "mode" across turns would require session storage and
// is intentionally out of scope for this narrow fix.

export const VENUE_INTELLIGENCE_INTENT_MODES = Object.freeze({
  CURRENT_VENUE: 'current_venue_discovery',
  EXPLORATION: 'concept_exploration',
});

// New-concept / inspiration / benchmark / hypothetical cues (English + Hebrew).
// Phrased specifically enough that ordinary venue discovery ("we never say no to
// a guest", "my bar gets slammed on Saturdays") does NOT match.
const EXPLORATION_SIGNALS = [
  // English
  'new place', 'new venue', 'new bar', 'new spot', 'new concept', 'a concept',
  'the concept', 'concept for a', 'inspired by', 'in the spirit of', 'benchmark',
  'hypothetical', 'what if', 'imagine a', 'imagine if', 'brainstorm', 'from scratch',
  'open a new', 'opening a new', 'thinking of opening', 'want to build a place',
  'build a new', 'design a new', 'a place that feels like', 'exploration',
  // Hebrew
  'מקום חדש', 'בר חדש', 'קונספט חדש', 'קונספט', 'בהשראת', 'בהשראה', 'תרחיש',
  'לפתוח מקום', 'להקים מקום', 'דמיין', 'מקום שמרגיש', 'בנה לי מקום', 'רעיון למקום',
];

// Explicit "this is the current venue / update my DNA" overrides. If present, an
// exploration-flavoured message is still allowed to update canonical DNA because
// the owner explicitly tied it to their venue.
const CURRENT_VENUE_OVERRIDES = [
  // English
  'my venue', 'our venue', 'my bar', 'our bar', 'this venue', 'this bar',
  'this is my', 'update my', 'update the venue', 'update our', 'add to my',
  'my current', 'for my place', 'to my dna', 'update my dna', 'update our dna',
  'my place', 'our place',
  // Hebrew
  'המקום שלי', 'הבר שלי', 'המקום שלנו', 'הבר שלנו', 'עדכן את', 'עדכן ל',
  'הוסף ל', 'זה המקום שלי', 'ל-dna שלי', 'ל-dna של המקום', 'המקום הקיים',
];

// Artifact/deliverable nouns the owner can explicitly ask HESTIA to produce.
const ARTIFACT_NOUNS = [
  // English
  'venue dna', 'concept brief', 'service line', 'service lines', 'cocktail menu',
  'cocktail', 'cocktails', 'operational risk', 'menu direction', 'menu style',
  // Hebrew
  'venue dna', 'בריף', 'קונספט', 'קווי שירות', 'תפריט', 'קוקטייל', 'קוקטיילים',
  'סיכונים', 'סיכונים תפעוליים',
];

// Verbs that signal "produce this for me".
const BUILD_VERBS = [
  // English
  'build', 'create', 'generate', 'give me', 'make me', 'produce', 'draft',
  'help me build', 'design', 'put together', 'lay out',
  // Hebrew
  'בנה', 'תבנה', 'צור', 'תייצר', 'תן לי', 'עזור לי לבנות', 'תכין', 'הכן',
];

function normalize(input) {
  return String(input == null ? '' : input).toLowerCase();
}

function containsAny(haystack, needles) {
  return needles.some((n) => haystack.includes(n));
}

function countMatches(haystack, needles) {
  let n = 0;
  for (const needle of needles) if (haystack.includes(needle)) n++;
  return n;
}

/**
 * Classify a single owner message.
 *
 * @param {string} message - the owner's latest message text.
 * @returns {{
 *   mode: string,                 // one of VENUE_INTELLIGENCE_INTENT_MODES
 *   isExploration: boolean,       // reads as a new/inspirational/hypothetical concept
 *   isExplicitBrief: boolean,     // owner explicitly asked for produced artifacts
 *   wantsCurrentVenueUpdate: boolean, // owner explicitly tied it to the current venue
 *   mergeIntoCanonicalDna: boolean,   // SAFE GATE: may this turn write canonical DNA?
 *   reason: string                // short, human-readable explanation
 * }}
 */
export function classifyVenueIntelligenceIntent(message) {
  const text = normalize(message);

  const isExploration = containsAny(text, EXPLORATION_SIGNALS);
  const wantsCurrentVenueUpdate = containsAny(text, CURRENT_VENUE_OVERRIDES);

  // "Explicit brief" = the owner is clearly asking HESTIA to PRODUCE deliverables.
  // Require either two distinct artifact nouns, or a build-verb paired with an
  // artifact noun, or an explicit Venue DNA / concept-brief request. This avoids
  // firing on a passing mention of "cocktails" during normal discovery.
  const artifactNounHits = countMatches(text, ARTIFACT_NOUNS);
  const hasBuildVerb = containsAny(text, BUILD_VERBS);
  const asksForVenueDna = text.includes('venue dna') ||
    (text.includes('dna') && (hasBuildVerb || isExploration));
  const isExplicitBrief = Boolean(
    asksForVenueDna ||
    artifactNounHits >= 2 ||
    (hasBuildVerb && artifactNounHits >= 1)
  );

  // SAFE GATE. Default is to merge (ordinary current-venue discovery). The only
  // case we withhold the canonical write is genuine concept exploration that the
  // owner did NOT explicitly tie to their current venue.
  const mergeIntoCanonicalDna = !(isExploration && !wantsCurrentVenueUpdate);

  const mode = mergeIntoCanonicalDna
    ? VENUE_INTELLIGENCE_INTENT_MODES.CURRENT_VENUE
    : VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION;

  let reason;
  if (!mergeIntoCanonicalDna) {
    reason = 'concept exploration / inspiration — not merged into the current venue DNA';
  } else if (isExploration && wantsCurrentVenueUpdate) {
    reason = 'exploration explicitly tied to the current venue — merge allowed';
  } else {
    reason = 'current-venue discovery — merge allowed';
  }

  return {
    mode,
    isExploration,
    isExplicitBrief,
    wantsCurrentVenueUpdate,
    mergeIntoCanonicalDna,
    reason,
  };
}

export default classifyVenueIntelligenceIntent;
