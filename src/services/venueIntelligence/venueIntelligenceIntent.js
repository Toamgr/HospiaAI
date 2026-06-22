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
// CONVERSATION-LEVEL CONTINUITY (this is the key property)
// Exploration safety is NOT only per-message. The FIRST turn of a concept brief
// carries the explicit cues ("new place", "inspired by"), but continuation turns
// drop them ("focus on innovation", "8 cocktails, 5 methods", "cold infusions,
// sous vide …"). Those continuations must stay protected. The classifier therefore
// reads recent conversation context: if the session is in an active exploration
// thread and the current message continues that brief (menu / cocktail / method /
// audience / flavor / service / design / operational constraints), it stays in
// exploration mode and does NOT merge into canonical DNA — unless the owner
// explicitly says to apply it to the current venue.
//
// WHAT THIS IS / IS NOT
// - Pure and deterministic: no I/O, no AI, no DB. Easy to unit-test.
// - It does NOT assign Venue DNA statuses, does NOT confirm anything, and does
//   NOT promote candidates. It only answers one question: "may this turn's
//   signals be merged into the current venue's canonical Venue DNA?"
// - It is intentionally conservative: when a turn reads as exploration (directly or
//   as a continuation) and is not explicitly tied to the current venue, the safe
//   default is to NOT merge into canonical DNA.
// - It does NOT block ordinary current-venue discovery: a turn with no exploration
//   cue, in a non-exploration session, merges exactly as before.

export const VENUE_INTELLIGENCE_INTENT_MODES = Object.freeze({
  CURRENT_VENUE: 'current_venue_discovery',
  EXPLORATION: 'concept_exploration',
  EXPLORATION_CONTINUATION: 'concept_exploration_continuation',
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
// the owner explicitly tied it to their venue. Also EXITS exploration mode for the
// rest of the session (until a new exploration cue appears).
const CURRENT_VENUE_OVERRIDES = [
  // English
  'my venue', 'our venue', 'my bar', 'our bar', 'this venue', 'this bar',
  'this is my', 'update my', 'update the venue', 'update our', 'add to my',
  'my current', 'current venue', 'for my place', 'to my dna', 'into the venue dna',
  'into venue dna', 'save this into', 'save to venue dna', 'apply this to',
  'apply to the current', 'update the current', 'update my dna', 'update our dna',
  'my place', 'our place',
  // Hebrew
  'המקום שלי', 'הבר שלי', 'המקום שלנו', 'הבר שלנו', 'עדכן את', 'עדכן ל',
  'תעדכן את', 'הוסף ל', 'זה המקום שלי', 'ל-dna שלי', 'ל-dna של המקום',
  'המקום הקיים', 'המקום הנוכחי', 'שמור ל', 'תשמור ל', 'תחיל על',
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

// Topical cues that mark a message as CONTINUING a concept brief — menu / cocktail /
// method / audience / flavor / service / design / operational details. Used only to
// decide whether a turn inside an active exploration session is a continuation.
// Ordinary current-venue operational talk that lacks these cues is NOT protected and
// still merges (e.g. "my staff keep forgetting the closing checklist").
const CONTINUATION_CUES = [
  // English — beverage / menu / method
  'cocktail', 'cocktails', 'menu', 'drink', 'drinks', 'method', 'methods', 'technique',
  'techniques', 'infusion', 'infusions', 'sous vide', 'sous-vide', 'nitrogen', 'foam',
  'foams', 'cloud', 'clouds', 'temperature', 'smoke', 'smoking', 'clarif', 'spheric',
  'carbonat', 'fat wash', 'fat-wash', 'distill', 'garnish', 'glassware', 'ingredient',
  'presentation',
  // English — flavor profiles
  'flavor', 'flavour', 'savory', 'savoury', 'spicy', 'sweet', 'bitter', 'sour', 'umami',
  // English — audience / experience / design
  'guest', 'guests', 'audience', 'crowd', 'enthusiast', 'service', 'design', 'atmosphere',
  'ambiance', 'ambience', 'vibe', 'innovation', 'innovative', 'complex', 'experience',
  'profile', 'profiles',
  // Hebrew
  'קוקטייל', 'קוקטיילים', 'תפריט', 'משקה', 'שיטה', 'שיטות', 'טכניק', 'חליטה', 'חליטות',
  'קצף', 'ענן', 'טמפרטורה', 'עשן', 'טעם', 'טעמים', 'מתוק', 'חמוץ', 'מר', 'חריף', 'מלוח',
  'אורח', 'אורחים', 'קהל', 'שירות', 'עיצוב', 'אווירה', 'חדשנות', 'חוויה', 'פרופיל',
];

// Preparation-method vocabulary, surfaced as metadata when present.
const METHOD_CUES = [
  'cold infusion', 'infusion', 'sous vide', 'sous-vide', 'nitrogen', 'foam', 'cloud',
  'temperature', 'smoke', 'smoking', 'clarification', 'clarif', 'spherification',
  'spheric', 'carbonation', 'carbonat', 'fat wash', 'fat-wash', 'distillation', 'centrifuge',
  'חליטה', 'קצף', 'ענן', 'טמפרטורה', 'עשן',
];

// ── Beverage Development / Bar Intelligence routing ──────────────────────────
// When the owner crosses from understanding the venue (Venue DNA) into deep cocktail
// R&D — preparation quality, recipe development, named techniques, beverage menu
// depth, explicit flavor-role frameworks — Venue Intelligence should NOT invent a
// shallow generic cocktail list. It should produce a Bar Intelligence handoff brief
// and hand the deep work to the bar/cocktail specialist layer. These cues classify
// that crossing; they do NOT change canonical-DNA merge behavior (that stays gated by
// the exploration guard above) — they only change the OUTPUT contract for the turn.

// Direct "preparation/recipe quality" concern — the owner doubts the depth/quality of
// the preparations themselves (e.g. "the best preparations recipe", "recipe quality").
const PREPARATION_QUALITY_CONCERN_CUES = [
  // English
  'best preparation', 'best preparations', 'preparations recipe', 'preparation recipe',
  'preparations recipes', 'preparation quality', 'recipe quality', 'best recipe',
  'best recipes', 'proper recipe', 'real recipe', 'right recipe', 'good recipe',
  'write the best', 'not write the best', 'will not write', "won't write", 'wont write',
  'prep quality', 'best prep', 'quality of the preparation', 'quality preparations',
  // Hebrew
  'מתכון הכי טוב', 'מתכון טוב', 'איכות המתכון', 'הכנה הכי טובה', 'מתכוני הכנה',
  'איכות ההכנה',
];

// Recipe-development / R&D vocabulary. Only a beverage-development signal when paired
// with a beverage context (cocktail / drink / menu), so it does not fire on ordinary
// food or operations talk.
const RECIPE_DEVELOPMENT_CUES = [
  'recipe', 'recipes', 'preparation', 'preparations', 'prep spec', 'prep specs',
  'spec sheet', 'build spec', 'batching', 'batch', 'r&d', 'menu depth', 'develop the menu',
  'method', 'methods', 'technique', 'techniques',
  'מתכון', 'מתכונים', 'הכנה', 'שיטה', 'שיטות', 'טכניק', 'באטצ',
];

// Beverage context anchors — used to qualify recipe-development cues.
const BEVERAGE_CONTEXT_CUES = [
  'cocktail', 'cocktails', 'drink', 'drinks', 'beverage', 'beverages', 'menu',
  'קוקטייל', 'קוקטיילים', 'משקה', 'משקאות', 'תפריט',
];

// ── Normal-night synthesis routing ───────────────────────────────────────────
// After enough venue concept signals exist, the owner often asks HESTIA to RENDER the
// experience ("how does this play out on a normal night?", "what does this feel like in
// practice?", "show me the experience", "turn this into a working brief") — or offers a
// low-value "let me sit with that"-style turn where another broad discovery question would
// not help. On those turns HESTIA must SYNTHESIZE a working interpretation from existing
// signals instead of asking the owner to describe the whole experience. These cues mark
// that crossing; like the beverage-development gate they change only the OUTPUT contract
// for the turn — they do NOT change the canonical-DNA merge gate.
const SYNTHESIS_REQUEST_CUES = [
  // English — render the experience / normal night
  'normal night', 'a normal night', 'typical night', 'a typical night', 'an average night',
  'how does this play out', 'how this plays out', 'how that plays out', 'how it plays out',
  'how does it play out', 'plays out on a', 'play out on a',
  'what does this feel like', 'what it feels like', 'how it feels', 'feel like in practice',
  'in practice', 'feels in practice', 'show me the experience', 'show me the night',
  'show me what', 'walk me through the night', 'walk me through a night', 'walk me through the experience',
  'paint the picture', 'paint me a picture', 'what would a night look like', 'what does a night look like',
  'how would a night go', 'a night look like', 'the night look like',
  'turn this into a working brief', 'turn this into a brief', 'make this a working brief',
  'make this into a brief', 'working interpretation', 'working read', 'your read on this',
  'let me sit with that', 'sit with that', 'sit with it', 'let me sit with this',
  // Hebrew
  'לילה רגיל', 'ערב רגיל', 'איך זה נראה בפועל', 'איך זה מרגיש בפועל', 'בפועל',
  'תאר לי את החוויה', 'תאר את הערב', 'איך נראה ערב', 'איך עובר ערב', 'תהפוך את זה לבריף',
  'תהפוך לבריף', 'הפוך את זה לבריף',
];

// ── Founder Brief v0.1 routing ───────────────────────────────────────────────
// When the owner asks HESTIA to STOP discovery and synthesize a founder-level concept
// brief from everything gathered so far, HESTIA must produce a structured Founder Brief
// v0.1 — not keep interviewing and not collapse to a one-line fallback. These cues mark
// that request; like the other synthesis gates this changes only the OUTPUT contract for
// the turn — it does NOT change the canonical-DNA merge gate.
const FOUNDER_BRIEF_REQUEST_CUES = [
  // English
  'founder brief', 'founders brief', "founder's brief", 'founder brief v0.1', 'founder-brief',
  'founder level brief', 'founder-level brief', 'create a founder brief', 'create a brief',
  'make a brief', 'make me a brief', 'build me a brief', 'build a brief', 'write me a brief',
  'turn this into a founder', 'turn this into a brief', 'into a founder-level brief',
  'stop the discovery flow', 'stop discovery', 'stop the discovery', 'pause discovery',
  'based on everything we have built', 'based on everything we built', 'based on everything so far',
  'based on everything we have so far', 'summarize the concept', 'summarise the concept',
  'sum up the concept', 'concept brief',
  // Hebrew
  'בריף מייסד', 'בריף ראשוני', 'תעצור את הדיסקברי', 'עצור את הדיסקברי', 'תבנה לי בריף',
  'תבנה בריף', 'בנה לי בריף', 'תסכם את הקונספט', 'סכם את הקונספט', 'בריף קונספט',
];

// ── Owner Correction Loop routing ────────────────────────────────────────────
// After a Founder Brief (or once enough concept signal exists) the owner does not want
// more discovery — they want to CORRECT what feels wrong, too strong, missing, or too
// early, and to see which signals are candidate Venue DNA (candidates only, never
// confirmed). These cues mark that request; like the other synthesis gates this changes
// only the OUTPUT contract for the turn — it does NOT change the canonical-DNA merge gate.
const OWNER_CORRECTION_LOOP_REQUEST_CUES = [
  // English
  'owner correction loop', 'correction loop', 'create an owner correction loop',
  'create a correction loop', 'run the correction loop', 'separate the brief',
  'split the brief', 'what feels wrong', 'feels wrong, too strong', 'too strong, or missing',
  'too strong or missing', 'what feels wrong, too strong, or missing',
  'do not continue discovery', "don't continue discovery", 'dont continue discovery',
  'do not ask more questions', "don't ask more questions", 'dont ask more questions',
  'no more questions', 'stop asking questions', 'turn this into candidate dna',
  'candidate dna', 'candidate venue dna', 'dna signals', 'signals for dna',
  'correct what feels wrong',
  // Hebrew
  'לולאת תיקון בעלים', 'לולאת תיקון', 'מה לא נכון', 'מה חזק מדי', 'מה חסר',
  'אל תמשיך דיסקברי', 'אל תמשיך בדיסקברי', 'תפריד את הבריף', 'תפצל את הבריף',
  'סיגנלים ל-dna', 'סיגנלים ל dna', 'אל תשאל עוד שאלות', 'תפסיק לשאול',
];

// Broad venue-concept vocabulary used only to decide whether ENOUGH concept signal has
// accumulated across the conversation to synthesize a working interpretation. Deliberately
// wide: identity/positioning, atmosphere/feeling, guest, service, F&B role, emotional
// register. We require several DISTINCT cues so HESTIA does not synthesize from nothing.
const CONCEPT_SIGNAL_CUES = [
  // identity / positioning
  'venue', 'bar', 'lounge', 'salon', 'apartment', 'restaurant', 'club', 'speakeasy', 'place',
  'premium', 'luxury', 'elegant', 'hidden', 'intimate', 'hybrid', 'upscale', 'refined', 'boutique',
  // atmosphere / feeling
  'atmosphere', 'feeling', 'feel', 'mood', 'mysterious', 'warm', 'quiet', 'discreet', 'discovery',
  'intelligent', 'experience', 'vibe', 'ambiance', 'ambience', 'guided', 'precise',
  // guest / service
  'guest', 'guests', 'regular', 'regulars', 'service', 'host', 'hospitality', 'staff',
  // f&b role
  'cocktail', 'cocktails', 'drink', 'drinks', 'food', 'menu', 'wine', 'programme', 'program',
  // Hebrew
  'מקום', 'בר', 'סלון', 'אלגנטי', 'יוקרתי', 'אינטימי', 'אווירה', 'תחושה', 'מסתורי',
  'חמים', 'אורח', 'אורחים', 'שירות', 'קוקטייל', 'חוויה', 'דיסקרטי', 'גילוי',
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

// Parse an explicitly requested cocktail count (1–20) when the owner names one,
// e.g. "8 cocktails", "8 קוקטיילים", "make me 6 drinks". Returns null when absent.
function parseRequestedCocktailCount(text) {
  const patterns = [
    /(\d{1,2})\s*(?:original\s+|new\s+)?(?:cocktail|drinks?|קוקטייל)/,
    /(?:cocktail|drinks?|קוקטייל)\w*\D{0,6}(\d{1,2})/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n >= 1 && n <= 20) return n;
    }
  }
  return null;
}

// Parse an explicitly requested method/technique count (1–20), e.g. "at least 5
// different new methods", "5 techniques", "6 שיטות". Returns null when absent.
function parseRequestedMethodCount(text) {
  const patterns = [
    /(\d{1,2})\s*(?:different\s+)?(?:new\s+)?(?:cocktail\s+)?(?:methods?|techniques?|שיטות|טכניק)/,
    /(?:methods?|techniques?|שיטות)\D{0,8}(\d{1,2})/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n >= 1 && n <= 20) return n;
    }
  }
  return null;
}

// Detect explicit flavor ROLES the owner names as a menu framework ("1 savory, 1
// spicy, 1 sweet, 1 bitter, 1 sour, 1 umami"). English uses word boundaries so
// "resource"/"source" never count as "sour". Returns canonical role names, deduped.
function detectFlavorRoles(text) {
  const enRoles = [
    ['savory', /\b(?:savory|savoury)\b/],
    ['spicy', /\bspicy\b/],
    ['sweet', /\bsweet\b/],
    ['bitter', /\bbitter\b/],
    ['sour', /\bsour\b/],
    ['umami', /\bumami\b/],
  ];
  const found = [];
  for (const [role, re] of enRoles) if (re.test(text)) found.push(role);
  // Hebrew — distinctive tokens only (short ambiguous words excluded; bitter uses מריר).
  const heRoles = [
    ['savory', 'מלוח'], ['spicy', 'חריף'], ['sweet', 'מתוק'],
    ['sour', 'חמוץ'], ['bitter', 'מריר'], ['umami', 'אומאמי'],
  ];
  for (const [role, tok] of heRoles) if (text.includes(tok) && !found.includes(role)) found.push(role);
  return found;
}

// Determine whether the recent conversation is in an active concept-exploration
// thread. Most-recent explicit mode signal wins: scanning the recent OWNER messages
// newest-first, the first one that names the current venue ends exploration; the
// first one with an exploration cue means exploration is active.
const EXPLORATION_WINDOW = 8; // recent owner messages to consider
function detectSessionExplorationMode(recentMessages) {
  if (!Array.isArray(recentMessages)) return false;
  const ownerMsgs = recentMessages
    .filter((m) => m && m.role === 'user' && typeof m.content === 'string')
    .slice(-EXPLORATION_WINDOW);
  for (let i = ownerMsgs.length - 1; i >= 0; i--) {
    const t = normalize(ownerMsgs[i].content);
    if (containsAny(t, CURRENT_VENUE_OVERRIDES)) return false;
    if (containsAny(t, EXPLORATION_SIGNALS)) return true;
  }
  return false;
}

// Decide whether ENOUGH venue concept signal has been shared (across the recent owner
// turns plus the current message) to justify synthesizing a working interpretation
// instead of asking another broad question. Counts DISTINCT concept cues; a handful of
// distinct signals is enough. Conservative on purpose: a bare "let me sit with that" on
// turn one (no prior signal) does NOT cross the threshold, so HESTIA still gathers first.
const SYNTHESIS_CONTEXT_WINDOW = 12; // recent owner messages to consider
const SYNTHESIS_SIGNAL_THRESHOLD = 4; // distinct concept cues required to synthesize
function detectSufficientConceptContext(recentMessages, currentText) {
  const ownerTexts = (Array.isArray(recentMessages) ? recentMessages : [])
    .filter((m) => m && m.role === 'user' && typeof m.content === 'string')
    .slice(-SYNTHESIS_CONTEXT_WINDOW)
    .map((m) => normalize(m.content));
  if (currentText) ownerTexts.push(currentText);
  const seen = new Set();
  for (const t of ownerTexts) {
    for (const cue of CONCEPT_SIGNAL_CUES) {
      if (t.includes(cue)) seen.add(cue);
      if (seen.size >= SYNTHESIS_SIGNAL_THRESHOLD) return true;
    }
  }
  return seen.size >= SYNTHESIS_SIGNAL_THRESHOLD;
}

/**
 * Classify a single owner message, optionally using recent conversation context to
 * keep a concept-exploration thread protected across continuation turns.
 *
 * @param {string} message - the owner's latest message text.
 * @param {{ recentMessages?: Array<{role:string, content:string}> }} [options]
 *        recentMessages: prior turns (chronological, oldest→newest), e.g. state.messages.
 * @returns {{
 *   mode: string,                 // one of VENUE_INTELLIGENCE_INTENT_MODES
 *   isExploration: boolean,       // current message has direct new/inspiration cues
 *   isExplorationContinuation: boolean, // protected as a continuation of an active brief
 *   sessionInExploration: boolean,// recent context is an active exploration thread
 *   isExplicitBrief: boolean,     // owner explicitly asked for produced artifacts
 *   wantsCurrentVenueUpdate: boolean, // owner explicitly tied it to the current venue
 *   mergeIntoCanonicalDna: boolean,   // SAFE GATE: may this turn write canonical DNA?
 *   requestedCocktailCount: number|null,
 *   requestedMethodCount: number|null,
 *   flavorRoles: string[],
 *   preparationQualityConcern: boolean, // owner doubts preparation/recipe quality
 *   isBeverageDevelopment: boolean,   // OUTPUT GATE: route to Bar Intelligence handoff
 *   wantsExperienceSynthesis: boolean, // owner asked to render the experience / normal night
 *   hasSufficientConceptContext: boolean, // enough concept signal to synthesize from
 *   isExperienceSynthesis: boolean,   // OUTPUT GATE: synthesize a normal-night working draft
 *   wantsFounderBrief: boolean,       // owner asked for a founder-level concept brief
 *   isFounderBrief: boolean,          // OUTPUT GATE: produce a full Founder Brief v0.1
 *   wantsOwnerCorrectionLoop: boolean,// owner asked to correct the brief, not continue discovery
 *   isOwnerCorrectionLoop: boolean,   // OUTPUT GATE: produce the Owner Correction Loop
 *   methods: string[],
 *   reason: string
 * }}
 */
export function classifyVenueIntelligenceIntent(message, options = {}) {
  const text = normalize(message);
  const recentMessages = options && Array.isArray(options.recentMessages) ? options.recentMessages : null;

  const isExploration = containsAny(text, EXPLORATION_SIGNALS);
  const wantsCurrentVenueUpdate = containsAny(text, CURRENT_VENUE_OVERRIDES);
  const sessionInExploration = detectSessionExplorationMode(recentMessages);
  const hasContinuationCue = containsAny(text, CONTINUATION_CUES);
  // A "render the experience" or "founder brief" request (computed early so they can
  // also count as continuation cues): inside an active exploration thread, asking to
  // render the EXPLORED concept or brief it must stay protected from the canonical-DNA
  // write too.
  const wantsExperienceSynthesis = containsAny(text, SYNTHESIS_REQUEST_CUES);
  const wantsFounderBrief = containsAny(text, FOUNDER_BRIEF_REQUEST_CUES);
  const wantsOwnerCorrectionLoop = containsAny(text, OWNER_CORRECTION_LOOP_REQUEST_CUES);

  // A continuation: the session is already exploring a concept, this turn continues
  // that brief (menu/cocktail/method/audience/flavor/service/design/operational, or a
  // request to render that concept's experience, a founder brief, or an owner correction
  // loop), and the owner did not explicitly redirect it to the current venue.
  const isExplorationContinuation = Boolean(
    sessionInExploration && (hasContinuationCue || wantsExperienceSynthesis || wantsFounderBrief || wantsOwnerCorrectionLoop) && !isExploration && !wantsCurrentVenueUpdate
  );

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

  // SAFE GATE. Withhold the canonical write whenever the turn is exploration —
  // directly OR as a continuation of an active exploration thread — and the owner
  // did NOT explicitly tie it to the current venue. Everything else merges as before.
  const effectiveExploration = (isExploration || isExplorationContinuation) && !wantsCurrentVenueUpdate;
  const mergeIntoCanonicalDna = !effectiveExploration;

  let mode;
  if (!mergeIntoCanonicalDna) {
    mode = isExploration
      ? VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION
      : VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION_CONTINUATION;
  } else {
    mode = VENUE_INTELLIGENCE_INTENT_MODES.CURRENT_VENUE;
  }

  let reason;
  if (mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION) {
    reason = 'concept exploration / inspiration — not merged into the current venue DNA';
  } else if (mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION_CONTINUATION) {
    reason = 'continuation of an active concept exploration — not merged into the current venue DNA';
  } else if ((isExploration || sessionInExploration) && wantsCurrentVenueUpdate) {
    reason = 'exploration explicitly applied to the current venue — merge allowed';
  } else {
    reason = 'current-venue discovery — merge allowed';
  }

  const methods = METHOD_CUES.filter((m) => text.includes(m));
  const requestedCocktailCount = parseRequestedCocktailCount(text);
  const requestedMethodCount = parseRequestedMethodCount(text);
  const flavorRoles = detectFlavorRoles(text);
  const preparationQualityConcern = containsAny(text, PREPARATION_QUALITY_CONCERN_CUES);

  // Beverage-development crossing — the OUTPUT gate (independent of the DNA-merge
  // gate). True when the owner has moved into deep cocktail R&D: a preparation/recipe
  // quality concern, an explicit flavor-role framework (3+ roles), several named
  // techniques, a requested method count, a cocktail count paired with technique/role
  // depth, or an explicit recipe-development ask in a beverage context. Conservative on
  // purpose so ordinary discovery ("our list leans on fresh citrus") never trips it.
  const mentionsBeverage = containsAny(text, BEVERAGE_CONTEXT_CUES);
  const wantsRecipeDevelopment = mentionsBeverage && containsAny(text, RECIPE_DEVELOPMENT_CUES);
  const isBeverageDevelopment = Boolean(
    preparationQualityConcern ||
    flavorRoles.length >= 3 ||
    methods.length >= 3 ||
    (requestedMethodCount != null && requestedMethodCount >= 3) ||
    (requestedCocktailCount != null &&
      (requestedMethodCount != null || flavorRoles.length >= 2 || methods.length >= 2)) ||
    (wantsRecipeDevelopment &&
      (requestedCocktailCount != null || methods.length >= 1 || flavorRoles.length >= 1 || requestedMethodCount != null))
  );

  // Normal-night synthesis crossing — an OUTPUT gate, orthogonal to the DNA-merge gate
  // and below beverage development in priority. True when the owner asks HESTIA to render
  // the experience (or offers a low-value "let me sit with that" turn) AND enough venue
  // concept signal has accumulated to synthesize from. When the cue is present but too
  // little has been shared, this stays false so HESTIA gathers a bit more first.
  const hasSufficientConceptContext = detectSufficientConceptContext(recentMessages, text);
  const isExperienceSynthesis = Boolean(wantsExperienceSynthesis && hasSufficientConceptContext);

  // Founder Brief crossing — an OUTPUT gate, orthogonal to the DNA-merge gate. True (full
  // brief) when the owner asks for a founder-level brief AND enough concept signal exists.
  // When the cue is present but too little has been shared, isFounderBrief stays false and
  // the handler instead returns an honest "not enough yet" working response (never a bare
  // one-line fallback). Founder Brief yields to beverage development (handled by the route).
  const isFounderBrief = Boolean(wantsFounderBrief && hasSufficientConceptContext);

  // Owner Correction Loop crossing — an OUTPUT gate, orthogonal to the DNA-merge gate.
  // True (full loop) when the owner asks to correct the brief (not continue discovery)
  // AND enough concept signal exists — which is always the case right after a Founder
  // Brief. When the cue is present but too little has been shared, isOwnerCorrectionLoop
  // stays false and the handler returns an honest "not enough yet" working response. The
  // candidate Venue DNA signals it surfaces are CANDIDATES ONLY — never confirmed DNA,
  // never merged. Like Founder Brief it yields to beverage development (handled by the route).
  const isOwnerCorrectionLoop = Boolean(wantsOwnerCorrectionLoop && hasSufficientConceptContext);

  return {
    mode,
    isExploration,
    isExplorationContinuation,
    sessionInExploration,
    isExplicitBrief,
    wantsCurrentVenueUpdate,
    mergeIntoCanonicalDna,
    requestedCocktailCount,
    requestedMethodCount,
    flavorRoles,
    preparationQualityConcern,
    isBeverageDevelopment,
    wantsExperienceSynthesis,
    hasSufficientConceptContext,
    isExperienceSynthesis,
    wantsFounderBrief,
    isFounderBrief,
    wantsOwnerCorrectionLoop,
    isOwnerCorrectionLoop,
    methods,
    reason,
  };
}

// Convenience predicate: does this turn (in context) require canonical Venue DNA to
// be protected from mutation? True for direct exploration and protected continuations.
export function shouldProtectCanonicalVenueDna(message, recentMessages) {
  return !classifyVenueIntelligenceIntent(message, { recentMessages }).mergeIntoCanonicalDna;
}

export default classifyVenueIntelligenceIntent;
