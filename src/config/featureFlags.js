export const FEATURE_FLAGS = {
  ownerCommandCenter: false,
  ownerBudgetApprovals: false,
  ownerOperationalRequests: false,
  ownerBusinessMRI: false,
  ownerExecutiveOverview: false,
  ownerStrategicRecommendations: false,
  ownerProfitLeaks: false,
  ownerWeeklySummary: false,
  ownerReport: false,
  ownerBusinessMemory: false,
  // Read-only Venue Beverage Context injection into the bar/restaurant Cocktail
  // Lab prompt. OFF by default. Can also be enabled at runtime via the env flag
  // ENABLE_VENUE_BEVERAGE_CONTEXT=true (see isVenueBeverageContextEnabled).
  venueBeverageContext: false,
  // Non-blocking F&B → Venue Intelligence candidate writes from the cocktail
  // rejection route only. OFF by default. Candidate-only (never confirmed Venue DNA).
  // Env flag: ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES=true (see helper below).
  fnbVenueFeedbackCandidates: false,
}

export function isEnabled(flagName) {
  return FEATURE_FLAGS[flagName] === true
}

// Reads an env-style boolean flag from whichever runtime is present, without
// throwing in either the browser (Vite) or Node (tests/CLI). Returns null when
// the flag is not set anywhere so the static default can take over.
function readEnvBoolean(name) {
  // 1. Explicit runtime override — primarily for tests and debugging.
  try {
    if (typeof globalThis !== 'undefined' && globalThis.__HESTIA_FLAGS__ && name in globalThis.__HESTIA_FLAGS__) {
      return globalThis.__HESTIA_FLAGS__[name] === true
    }
  } catch { /* ignore */ }
  // 2. Vite build-time env (frontend). import.meta.env is undefined in Node.
  try {
    const viteEnv = import.meta.env
    if (viteEnv && viteEnv[`VITE_${name}`] !== undefined) {
      return String(viteEnv[`VITE_${name}`]).toLowerCase() === 'true'
    }
  } catch { /* ignore */ }
  // 3. Node env (tests / server).
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name] !== undefined) {
      return String(process.env[name]).toLowerCase() === 'true'
    }
  } catch { /* ignore */ }
  return null
}

// Resolves the Venue Beverage Context flag: env override wins, else static flag.
export function isVenueBeverageContextEnabled() {
  const env = readEnvBoolean('ENABLE_VENUE_BEVERAGE_CONTEXT')
  if (env !== null) return env
  return FEATURE_FLAGS.venueBeverageContext === true
}

// Resolves the F&B → Venue Intelligence candidate-write flag: env override wins,
// else static flag. OFF by default (candidate writes are never auto-enabled).
export function isFnbVenueFeedbackCandidatesEnabled() {
  const env = readEnvBoolean('ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES')
  if (env !== null) return env
  return FEATURE_FLAGS.fnbVenueFeedbackCandidates === true
}
