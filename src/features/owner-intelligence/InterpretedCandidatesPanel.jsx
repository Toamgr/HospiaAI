// InterpretedCandidatesPanel — New Venue Discovery, Interpreted Candidates (EAE Slice 3D-B).
//
// READ-ONLY view over the venue's Interpreted Intelligence Candidates. It renders the output of
// ONE existing read-only route (GET /api/discovery-interpreted-candidates) and nothing more.
// It WRITES NOTHING, re-aggregates nothing, scores nothing, re-classifies nothing, and never
// touches Venue DNA.
//
// CRITICAL PRODUCT TRUTH — stated plainly in the UI, non-removable:
//   • These are interpreted candidates only — evidence-bound signals, NOT confirmed Venue DNA.
//   • Evidence suggests; it does not prove. HESTIA cannot self-confirm its own interpretation.
//   • Contradictions and missing data are preserved here, never resolved or averaged.
//   • Confidence is a plain word band only (low, or "not captured") — never a number, meter, or bar.
//   • There is NO confirm / approve / promote / edit control here, for any role. No confirmation
//     action exists in this slice.
//
// Design doc (binding): docs/architecture/NEW_VENUE_DISCOVERY_INTERPRETED_CANDIDATES_UI_DESIGN.md
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

// Mandatory, non-removable honesty framing — present in every non-loading state.
const FRAMING_LINE =
  'Interpreted candidates — read-only signals, not confirmed Venue DNA. These are HESTIA’s ' +
  'evidence-bound suspicions about what your saved reviews may mean. Evidence suggests; it does not ' +
  'prove. Contradictions and missing data are preserved here, never resolved. HESTIA cannot confirm ' +
  'any of this on its own — only a human ever confirms Venue DNA, and there is no confirmation ' +
  'action in this view.'

// Neutral, textual labels for the two real candidate types (no themed classification).
const TYPE_BADGE = {
  contradiction_signal: 'Contradiction found',
  missing_data_signal:  'Missing evidence',
}

// Humane chips for the real statuses. Confirmation is unexpressible by construction.
const STATUS_CHIP = {
  contradicted:               'Contradiction — unresolved',
  insufficient_evidence:      'Not enough evidence yet',
  needs_owner_clarification:  'Needs owner clarification',
  proposed:                   'Possible signal',
}

// Human labels for the saved fidelity actions on each evidence ref.
const ACTION_LABEL = {
  captured: 'Captured as meant',
  edited:   'Edited',
  held:     'Held',
  rejected: 'Rejected',
}

const CONFIDENCE_CAPTION = 'Evidence strength (word band) — not certainty, not confirmation.'

function formatDate(value) {
  if (!value) return null
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') + 'Z' : value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

// Evidence strength as a plain WORD only — never a meter, bar, ring, or number. Absent → "not captured".
function EvidenceStrength({ band }) {
  return (
    <span className="text-[12px]" style={{ color: band ? C.text2 : C.text3 }} title={CONFIDENCE_CAPTION}>
      {band ? `${band} (evidence strength)` : 'not captured'}
    </span>
  )
}

// One saved-review evidence ref, rendered from endpoint fields only. Nothing fabricated.
function EvidenceRef({ refItem }) {
  const action = ACTION_LABEL[refItem && refItem.review_action] || (refItem && refItem.review_action) || 'saved review'
  const date = formatDate(refItem && refItem.created_at)
  const band = refItem && refItem.confidence_band
  const idFragment = String((refItem && refItem.review_id) || '').slice(-6)
  return (
    <li className="rounded-lg px-3 py-2" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-medium" style={{ color: C.text }}>{action}</span>
        <span className="shrink-0 text-[10px]" style={{ color: C.text3 }}>id …{idFragment}</span>
      </div>
      {refItem && refItem.snapshot_signal && (
        <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: C.text2 }}>“{refItem.snapshot_signal}”</p>
      )}
      <p className="mt-0.5 text-[10px]" style={{ color: C.text3 }}>
        {band ? `${band} (evidence strength)` : 'strength not captured'}{date ? ` · saved ${date}` : ''}
      </p>
    </li>
  )
}

// A plain bullet list of endpoint strings (missing_evidence / uncertainty_notes). Always visible.
function NoteList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <ul className="mt-1 space-y-0.5">
      {items.map((line, i) => (
        <li key={i} className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>• {line}</li>
      ))}
    </ul>
  )
}

// One interpreted candidate — cautious, evidence-bound, read-only. No decision control of any kind.
function CandidateCard({ candidate }) {
  const c = candidate || {}
  const badge = TYPE_BADGE[c.candidate_type] || 'Interpreted candidate'
  const chip = STATUS_CHIP[c.status] || (c.status ? String(c.status) : null)
  const supporting = Array.isArray(c.supporting_evidence_refs) ? c.supporting_evidence_refs : []
  const conflicting = Array.isArray(c.conflicting_evidence_refs) ? c.conflicting_evidence_refs : []
  const asOf = formatDate(
    typeof c.created_from_summary_version === 'string'
      ? c.created_from_summary_version.replace(/^derived-live@/, '')
      : null,
  )

  return (
    <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
      {/* Type badge + status chip — neutral, textual, never success-styled. */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ border: `1px solid ${C.borderEmp}`, color: C.burgundy, background: C.inset }}
        >
          {badge}
        </span>
        {chip && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            style={{ border: `1px solid ${C.borderSub}`, color: C.text3, background: C.card }}
          >
            {chip}
          </span>
        )}
        <span className="ml-auto text-[10px]" style={{ color: C.text3 }}>
          concept …{String(c.concept_ref || '').slice(-6)}
        </span>
      </div>

      {/* Title + summary (verbatim from the endpoint). */}
      {c.interpretation_title && (
        <p className="mt-2.5 font-serif text-[15px] font-semibold leading-snug" style={{ color: C.text }}>
          {c.interpretation_title}
        </p>
      )}
      {c.interpretation_summary && (
        <p className="mt-1 text-[13px] leading-relaxed" style={{ color: C.text2 }}>
          {c.interpretation_summary}
        </p>
      )}

      {/* Evidence strength — word only. */}
      <div className="mt-3">
        <Eyebrow>Evidence strength</Eyebrow>
        <div className="mt-1"><EvidenceStrength band={c.confidence_band} /></div>
      </div>

      {/* Supporting saved reviews — never "corroboration" / "independent evidence". */}
      {supporting.length > 0 && (
        <div className="mt-3">
          <Eyebrow>Supporting saved reviews · {supporting.length}</Eyebrow>
          <ul className="mt-1.5 space-y-1.5">
            {supporting.map((r, i) => <EvidenceRef key={(r && r.review_id) || i} refItem={r} />)}
          </ul>
        </div>
      )}

      {/* Conflicting saved reviews — equal weight, preserved, never resolved. */}
      {conflicting.length > 0 && (
        <div className="mt-3">
          <Eyebrow>Conflicting saved reviews · {conflicting.length} — preserved, not resolved</Eyebrow>
          <ul className="mt-1.5 space-y-1.5">
            {conflicting.map((r, i) => <EvidenceRef key={(r && r.review_id) || i} refItem={r} />)}
          </ul>
        </div>
      )}

      {/* Missing evidence — always visible when present. */}
      {Array.isArray(c.missing_evidence) && c.missing_evidence.length > 0 && (
        <div className="mt-3">
          <Eyebrow>What’s missing / why this isn’t settled</Eyebrow>
          <NoteList items={c.missing_evidence} />
        </div>
      )}

      {/* Uncertainty notes — always visible when present. */}
      {Array.isArray(c.uncertainty_notes) && c.uncertainty_notes.length > 0 && (
        <div className="mt-3">
          <Eyebrow>Uncertainty</Eyebrow>
          <NoteList items={c.uncertainty_notes} />
        </div>
      )}

      {/* Suggested owner question — DISPLAY ONLY. No input, no submit, no answer affordance. */}
      {c.suggested_owner_question && (
        <div className="mt-3 rounded-lg px-3 py-2" style={{ background: C.inset, border: `1px dashed ${C.borderEmp}` }}>
          <span className="text-[11px] font-semibold" style={{ color: C.burgundy }}>HESTIA would ask: </span>
          <span className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>{c.suggested_owner_question}</span>
        </div>
      )}

      {/* destination_hint — inert. Rendered ONLY if a value is ever present; never interactive. */}
      {c.destination_hint && (
        <p className="mt-2 text-[10px]" style={{ color: C.text3 }}>
          {String(c.destination_hint)} — owner attention only, not Venue DNA.
        </p>
      )}

      {asOf && (
        <p className="mt-2 text-[10px]" style={{ color: C.text3 }}>as of {asOf}</p>
      )}
    </div>
  )
}

export default function InterpretedCandidatesPanel() {
  const [candidates, setCandidates] = useState(null)
  const [note, setNote] = useState(null)
  const [limitations, setLimitations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // The ONLY network call this surface makes: one read-only GET. No writes, ever.
  const loadCandidates = useCallback(() => {
    setLoading(true)
    setError(null)
    return apiGet('/api/discovery-interpreted-candidates')
      .then((res) => {
        setCandidates(Array.isArray(res?.candidates) ? res.candidates : [])
        setNote(typeof res?.note === 'string' ? res.note : null)
        setLimitations(Array.isArray(res?.limitations) ? res.limitations : [])
      })
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[InterpretedCandidatesPanel] GET /api/discovery-interpreted-candidates failed:', err)
        setError('HESTIA could not load your interpreted candidates right now. Nothing was changed.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadCandidates() }, [loadCandidates])

  const list = Array.isArray(candidates) ? candidates : []
  const count = list.length

  return (
    <details className="mt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2"
        style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
          Interpreted candidates · read-only signals
        </span>
        <span className="text-[11px]" style={{ color: C.text3 }}>
          {loading ? 'Loading…' : `${count} ${count === 1 ? 'candidate' : 'candidates'}`}
        </span>
      </summary>

      <div className="mt-3 rounded-2xl p-5" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
        {/* Mandatory, non-removable honesty framing. */}
        <Eyebrow>Interpreted candidates · interpretation, not confirmation</Eyebrow>
        <p className="mt-1.5 text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
          {FRAMING_LINE}
        </p>

        {/* ── Loading ── */}
        {loading && (
          <p className="mt-4 text-[12px]" style={{ color: C.text3 }}>Reading HESTIA’s interpreted candidates…</p>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="mt-4">
            <p className="text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{error}</p>
            <button
              type="button"
              onClick={loadCandidates}
              className="mt-2 text-[11px] underline"
              style={{ color: C.text3 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty (zero candidates) — honest, no fabricated data ── */}
        {!loading && !error && candidates && count === 0 && (
          <p className="mt-4 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
            No interpreted candidates yet. HESTIA only raises a candidate when your reviewed evidence creates a
            contradiction (you kept and rejected meanings for one concept) or a missing-data signal (a kept
            meaning that can’t yet be corroborated). Until then, there is nothing to interpret here — and nothing
            here is Venue DNA.
          </p>
        )}

        {/* ── Populated — candidates in endpoint order; no client re-rank ── */}
        {!loading && !error && candidates && count > 0 && (
          <div className="mt-4 space-y-3">
            {list.map((c, i) => <CandidateCard key={(c && c.candidate_id) || i} candidate={c} />)}
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
