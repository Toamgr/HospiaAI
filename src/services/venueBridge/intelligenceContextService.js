// Unified HESTIA Brain — Shared Intelligence Context Layer (Phase 7).
//
// Single source of truth for turning a venue intelligence "bundle" (loaded once,
// server-side) into whatever a given specialist needs. Every specialist consumes
// the same underlying understanding through these selectors — there is no second
// DNA reader, no duplicated prompt/context logic, and no module reaches across to
// another module's internals.
//
//   loadVenueIntelligenceBundle(venueId)  [server: reads raw sources ONCE]
//          │
//          ▼
//   ┌──────────────────────────── this module ────────────────────────────┐
//   selectOmerContext        → Omer / Cocktail Intelligence (briefs + meta)
//   selectAcademyContext     → Academy / Service School (capability signals)
//   selectOwnerIntelligence  → Owner Intelligence (full picture)
//   assembleUnifiedContext   → everything, for the unified read endpoint
//   └──────────────────────────────────────────────────────────────────────┘
//
// Each selector takes the bundle and reuses the existing pure specialist services.
// Pure and deterministic. Safe to import from server.js and the frontend.

import { buildOmerContextBlock } from './omerContextService.js'
import { buildAcademyContext } from './academyContextService.js'
import { buildOwnerLearnings } from './ownerIntelligenceService.js'

// Index briefs by type for selectors that want a specific specialist brief.
export function keyBriefs(briefs) {
  const byType = {}
  for (const b of Array.isArray(briefs) ? briefs : []) if (b && b.type) byType[b.type] = b
  return byType
}

// Omer / Cocktail Intelligence — needs only the briefs + venue metadata.
export function selectOmerContext(bundle = {}) {
  return buildOmerContextBlock(bundle.briefs || [], bundle.metadata || {})
}

// Academy / Service School — needs briefs + the academy manifest.
export function selectAcademyContext(bundle = {}, academies = []) {
  return buildAcademyContext({ briefs: bundle.briefs || [], academies })
}

// Owner Intelligence — needs the full picture (DNA, briefs, ops, enrichment, capability).
export function selectOwnerIntelligence(bundle = {}, academies = []) {
  const academyContext = selectAcademyContext(bundle, academies)
  return buildOwnerLearnings({
    venueDNA: bundle.venueDNA,
    briefs: bundle.briefs,
    signals: bundle.signals,
    enrichment: bundle.enrichment,
    academyContext
  })
}

// The complete unified context — every consumer's slice in one object. Used by the
// unified read endpoint and available to any future specialist so it never has to
// re-derive venue understanding.
export function assembleUnifiedContext(bundle = {}, academies = []) {
  const byType = keyBriefs(bundle.briefs)
  const academyContext = selectAcademyContext(bundle, academies)
  const ownerLearnings = buildOwnerLearnings({
    venueDNA: bundle.venueDNA,
    briefs: bundle.briefs,
    signals: bundle.signals,
    enrichment: bundle.enrichment,
    academyContext
  })
  const omer = selectOmerContext(bundle)

  return {
    venue: bundle.metadata || {},
    stage: bundle.stage || null,
    objective: bundle.objective || null,
    venueDNA: bundle.venueDNA || {},
    briefs: byType,
    capabilitySignals: academyContext.capabilitySignals,
    academyRecommendations: academyContext.recommendations,
    operationalSignals: bundle.signals || {},
    enrichment: bundle.enrichment || {},
    ownerLearnings,
    priorities: {
      owner: bundle.venueDNA?.ownerPriorities || [],
      training: byType.training?.priorities || [],
      service: byType.service?.priorities || [],
      fb: byType.fb?.priorities || []
    },
    omerContextActive: omer.active
  }
}
