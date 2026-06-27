// EvidenceSummaryPanel — New Venue Discovery, Evidence Summary (EAE Slice 2).
//
// READ-ONLY memory mirror over the venue's saved concept-draft fidelity reviews. It renders the
// output of ONE existing read-only route (GET /api/discovery-evidence-summary) and nothing more.
// It WRITES NOTHING, re-aggregates nothing, scores nothing, and never touches Venue DNA.
//
// CRITICAL PRODUCT TRUTH — stated plainly in the UI, non-removable:
//   • This is Memory signals only — NOT confirmed Venue DNA. It does not prove venue identity.
//   • Counts reflect saved reviews, not independent corroboration.
//   • dna_earmark counts are owner ATTENTION only — never confirmation, never a DNA write.
//   • confidence_floor is the LOWEST coverage band present — coverage, not certainty, not confirmation.
//   • There is no confirm / approve / promote control here, for any role. HESTIA cannot self-confirm.
//
// Design doc (binding): docs/architecture/NEW_VENUE_DISCOVERY_EVIDENCE_SUMMARY_UI_DESIGN.md
// Palette B (Editorial Light) — matches the host OwnerAIHome surface (never mix palettes).

import { useEffect, useState, useCallback } from 'react'
import { apiGet } from '../../services/api/client'

const C = {
  card:      '#FFFFFF',
  inset:     '#F0EBE0',
  borderSub: '#E0D8CC',
  borderEmp: '#C8BFB0',
  burgundy:  '#6B2737',
  amber:     '#B8860B',
  text:      '#1A1612',
  text2:     '#5A524A',
  text3:     '#9A9088',
}

// Mandatory, non-removable honesty framing.
const FRAMING_LINE =
  'Evidence summary — Memory signals only. This is what HESTIA has saved across your concept drafts, ' +
  'with plain observations about those saves. It is not confirmed Venue DNA, it does not prove venue ' +
  'identity, and HESTIA cannot confirm it on its own.'

// Field-level cautions (used wherever the field appears).
const EARMARK_CAPTION = 'Earmarked for owner attention — not Venue DNA.'
const FLOOR_CAPTION = 'Lowest coverage band present — coverage, not certainty, and not confirmation.'

const ACTION_LABEL = {
  captured: 'Captured as meant',
  edited:   'Edited',
  held:     'Held',
  rejected: 'Rejected',
}
const ACTION_ORDER = ['captured', 'edited', 'held', 'rejected']

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 }

function formatDate(value) {
  if (!value) return null
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') + 'Z' : value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// A null/blank route arrives as the literal key 'Unrouted' from the endpoint — render it as "not routed".
function destinationLabel(destination) {
  if (!destination || destination === 'Unrouted') return 'not routed'
  return destination
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

// Coverage band as a plain word — never a percentage, never certainty. A FLOOR, never an aggregate.
function ConfidenceFloor({ band }) {
  const level = CONFIDENCE_RANK[band] || 0
  return (
    <span className="inline-flex items-center gap-1.5" title={FLOOR_CAPTION}>
      <span className="flex items-center gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: n <= level ? C.amber : 'transparent', border: `1px solid ${C.borderEmp}` }}
          />
        ))}
      </span>
      <span className="text-[11px]" style={{ color: band ? C.text2 : C.text3 }}>
        {band ? `${band} coverage` : 'not captured'}
      </span>
    </span>
  )
}

// A compact "3 Captured as meant · 1 Held" line from an action_mix object. Endpoint counts only.
function ActionMix({ mix }) {
  if (!mix || typeof mix !== 'object') return null
  const parts = []
  for (const key of ACTION_ORDER) {
    if (mix[key]) parts.push(`${mix[key]} ${ACTION_LABEL[key]}`)
  }
  if (!parts.length) return <span className="text-[12px]" style={{ color: C.text3 }}>No actions recorded</span>
  return <span className="text-[12px]" style={{ color: C.text2 }}>{parts.join(' · ')}</span>
}

// Destination distribution — counts straight from the endpoint, with the inert earmark labelled.
function Destinations({ destinations }) {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    return <p className="mt-1 text-[12px]" style={{ color: C.text3 }}>None routed.</p>
  }
  return (
    <ul className="mt-1 space-y-1">
      {destinations.map((d) => {
        const earmark = d && (d.dna_earmarked === true || d.destination === 'Venue DNA')
        return (
          <li key={d.destination} className="text-[12px]" style={{ color: C.text2 }}>
            <span style={{ color: C.text }}>{destinationLabel(d.destination)}</span>
            <span style={{ color: C.text3 }}> · {d.count}</span>
            {earmark && (
              <span className="ml-1 text-[11px]" style={{ color: C.text3 }}>(earmark only — not Venue DNA)</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// One concept thread, read-only. Renders only endpoint-provided counts/bands/dates; no client scoring.
function ConceptRow({ concept }) {
  const lastDate = formatDate(concept && concept.latest_saved_at)
  return (
    <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-[14px] font-semibold leading-snug" style={{ color: C.text }}>
            Concept draft · {concept.saved_review_count} saved {concept.saved_review_count === 1 ? 'review' : 'reviews'}
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: C.text3 }}>
            id …{String(concept.concept_ref || '').slice(-6)}{lastDate ? ` · last saved ${lastDate}` : ''}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ border: `1px solid ${C.borderSub}`, color: C.text3, background: C.inset }}
        >
          Memory
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-3">
        <div>
          <Eyebrow>Actions</Eyebrow>
          <div className="mt-1"><ActionMix mix={concept.action_mix} /></div>
        </div>
        <div>
          <Eyebrow>Coverage floor</Eyebrow>
          <div className="mt-1"><ConfidenceFloor band={concept.confidence_floor} /></div>
        </div>
        {concept.dna_earmarked_count > 0 && (
          <div>
            <Eyebrow>Earmarked</Eyebrow>
            <p className="mt-1 text-[12px]" style={{ color: C.text2 }}>
              {concept.dna_earmarked_count} <span className="text-[11px]" style={{ color: C.text3 }}>· attention only</span>
            </p>
          </div>
        )}
      </div>

      {Array.isArray(concept.destinations) && concept.destinations.length > 0 && (
        <div className="mt-3">
          <Eyebrow>Destinations</Eyebrow>
          <Destinations destinations={concept.destinations} />
        </div>
      )}
    </div>
  )
}

// A single totals figure.
function Stat({ label, value, caption }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
      <p className="font-serif text-[22px] font-semibold leading-none" style={{ color: C.text }}>{value}</p>
      <p className="mt-1.5 text-[11px] font-medium" style={{ color: C.text2 }}>{label}</p>
      {caption && <p className="mt-0.5 text-[10px] leading-snug" style={{ color: C.text3 }}>{caption}</p>}
    </div>
  )
}

export default function EvidenceSummaryPanel() {
  const [summary, setSummary] = useState(null)
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadSummary = useCallback(() => {
    setLoading(true)
    setError(null)
    return apiGet('/api/discovery-evidence-summary')
      .then((res) => {
        setSummary(res?.summary || null)
        setNote(typeof res?.note === 'string' ? res.note : null)
      })
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[EvidenceSummaryPanel] GET /api/discovery-evidence-summary failed:', err)
        setError('HESTIA could not load your evidence summary right now. Nothing was changed.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadSummary() }, [loadSummary])

  const totals = (summary && summary.totals) || {}
  const savedReviews = totals.saved_reviews || 0
  const limitations = Array.isArray(summary && summary.limitations) ? summary.limitations : []

  return (
    <details className="mt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2"
        style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
          Evidence summary · memory signals
        </span>
        <span className="text-[11px]" style={{ color: C.text3 }}>
          {loading ? 'Loading…' : `${savedReviews} saved`}
        </span>
      </summary>

      <div className="mt-3 rounded-2xl p-5" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
        {/* Mandatory, non-removable honesty framing — present in every non-loading state. */}
        <Eyebrow>Evidence summary · memory mirror</Eyebrow>
        <p className="mt-1.5 text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
          {FRAMING_LINE}
        </p>

        {/* ── Loading ── */}
        {loading && (
          <p className="mt-4 text-[12px]" style={{ color: C.text3 }}>Reading your saved evidence…</p>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="mt-4">
            <p className="text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{error}</p>
            <button
              type="button"
              onClick={loadSummary}
              className="mt-2 text-[11px] underline"
              style={{ color: C.text3 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty (zero saved reviews) ── */}
        {!loading && !error && summary && savedReviews === 0 && (
          <p className="mt-4 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
            No saved evidence yet. When you review HESTIA’s candidate signals in a discovery conversation and
            save your choices, a memory summary of those saves appears here. Nothing here is Venue DNA.
          </p>
        )}

        {/* ── Populated ── */}
        {!loading && !error && summary && savedReviews > 0 && (
          <div className="mt-4">
            {/* Totals */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Saved reviews" value={totals.saved_reviews || 0} />
              <Stat label="Concept drafts" value={totals.concept_refs || 0} />
              <Stat label="Earmarked" value={totals.dna_earmarks || 0} caption={EARMARK_CAPTION} />
            </div>

            {/* Venue-wide action mix */}
            <div className="mt-4">
              <Eyebrow>Across all saved reviews</Eyebrow>
              <div className="mt-1"><ActionMix mix={summary.action_mix} /></div>
            </div>

            {/* Venue-wide destinations */}
            <div className="mt-4">
              <Eyebrow>Destinations</Eyebrow>
              <Destinations destinations={summary.destinations} />
            </div>

            {/* Venue-wide confidence floor (omitted when absent) */}
            {summary.confidence_floor && (
              <div className="mt-4">
                <Eyebrow>Coverage floor</Eyebrow>
                <div className="mt-1"><ConfidenceFloor band={summary.confidence_floor} /></div>
                <p className="mt-1 text-[10px] leading-snug" style={{ color: C.text3 }}>{FLOOR_CAPTION}</p>
              </div>
            )}

            {/* Per-concept rows — endpoint order (newest activity first); no client re-rank. */}
            {Array.isArray(summary.concepts) && summary.concepts.length > 0 && (
              <div className="mt-5">
                <Eyebrow>By concept draft</Eyebrow>
                <div className="mt-2 space-y-3">
                  {summary.concepts.map((c) => <ConceptRow key={c.concept_ref} concept={c} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── API note + limitations (rendered verbatim, non-removable, on every non-loading state) ── */}
        {!loading && (note || limitations.length > 0) && (
          <div className="mt-5 border-t pt-3" style={{ borderColor: C.borderSub }}>
            {note && (
              <p className="text-[11px] font-medium leading-relaxed" style={{ color: C.text2 }}>{note}</p>
            )}
            {limitations.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {limitations.map((line, i) => (
                  <li key={i} className="text-[11px] leading-relaxed" style={{ color: C.text3 }}>• {line}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </details>
  )
}
