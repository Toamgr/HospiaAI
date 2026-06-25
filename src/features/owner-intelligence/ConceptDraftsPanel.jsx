// ConceptDraftsPanel — New Venue Discovery, Concept Drafts Workspace (Slice 2a).
//
// READ-ONLY re-entry into saved concept drafts. It lists the concept drafts the owner already
// saved (derived from existing fidelity-review snapshots) and lets the owner/admin re-open one
// to view its saved review snapshots. It writes NOTHING — it only reads the two read-only
// routes (GET /api/discovery-concept-drafts and …/:conceptRef).
//
// CRITICAL PRODUCT TRUTH — stated plainly in the UI, non-removable:
//   • A saved concept draft is Memory / concept-draft understanding only — NOT confirmed Venue DNA.
//   • Re-opening a draft shows SAVED SNAPSHOTS — not the original chat thread, which is gone.
//   • Nothing here confirms, approves, promotes, or writes Venue DNA. There is no such control.
//   • Labels are derived from real saved data only — never a fabricated venue name.
//
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

// Mandatory, non-removable honesty lines.
const NOT_DNA_NOTE = 'Saved concept drafts are Memory — concept-draft understanding only. They are not confirmed Venue DNA.'
const SNAPSHOT_NOTE = 'Saved snapshot — not the original chat thread.'

const ACTION_LABEL = {
  captured: 'Captured as meant',
  edited:   'Edited',
  held:     'Held',
  rejected: 'Rejected',
}

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 }

function formatDate(value) {
  if (!value) return null
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') + 'Z' : value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function actionsSummaryText(summary) {
  if (!summary || typeof summary !== 'object') return null
  const parts = []
  for (const key of ['captured', 'edited', 'held', 'rejected']) {
    if (summary[key]) parts.push(`${summary[key]} ${key}`)
  }
  return parts.length ? parts.join(' · ') : null
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

// Coverage band as a plain word — never a percentage, never certainty.
function ConfidenceBand({ band }) {
  const level = CONFIDENCE_RANK[band] || 0
  return (
    <span className="inline-flex items-center gap-1.5" title="Confidence is evidence coverage from this conversation — not certainty, and not confirmation.">
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

// One saved review, rendered strictly read-only from its immutable snapshot (+ owner edit overlay).
function ReadonlyReviewCard({ review }) {
  const snap = (review && review.candidate_snapshot) || {}
  const edit = (review && review.owner_edit) || {}
  const signal = edit.signal ?? snap.signal
  const evidence = edit.evidence ?? snap.evidence
  const confidence = edit.confidence_band ?? snap.confidence_band
  const reviewedDate = formatDate(review && (review.snapshot_taken_at || review.reviewed_at))
  const actionLabel = ACTION_LABEL[review && review.review_action] || null

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: C.card,
        border: `1px solid ${C.borderSub}`,
        boxShadow: '0 1px 4px rgba(26,22,18,0.06)',
        opacity: review && review.review_action === 'rejected' ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-[15px] font-semibold leading-snug" style={{ color: C.text }}>
          {signal || 'Untitled signal'}
        </p>
        {actionLabel && (
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ border: `1px solid ${C.borderEmp}`, color: C.burgundy, background: C.inset }}
          >
            {actionLabel}
          </span>
        )}
      </div>

      <p className="mt-2 text-[11px] italic leading-relaxed" style={{ color: C.text3 }}>
        {SNAPSHOT_NOTE}{reviewedDate ? ` Reviewed ${reviewedDate}.` : ''}
      </p>

      <div className="mt-2.5">
        <Eyebrow>Evidence</Eyebrow>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: evidence ? C.text2 : C.text3 }}>
          {evidence || 'Supporting detail not captured in this conversation.'}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div>
          <Eyebrow>Confidence</Eyebrow>
          <div className="mt-1"><ConfidenceBand band={confidence} /></div>
        </div>
        <div>
          <Eyebrow>Destination</Eyebrow>
          <p className="mt-1 text-[12px]" style={{ color: review && review.chosen_destination ? C.text2 : C.text3 }}>
            {(review && review.chosen_destination) || '— not routed —'}
            {review && review.dna_earmarked ? ' (earmark only — not Venue DNA)' : ''}
          </p>
        </div>
        <div>
          <Eyebrow>Provenance</Eyebrow>
          <p className="mt-1 text-[11px] font-medium" style={{ color: C.text2 }}>
            {(review && review.provenance) || 'owner_conversation'}
          </p>
        </div>
      </div>
    </div>
  )
}

function DraftListItem({ draft, onOpen }) {
  const summary = actionsSummaryText(draft && draft.actions_summary)
  const lastDate = formatDate(draft && draft.last_reviewed_at)
  return (
    <button
      type="button"
      onClick={() => onOpen(draft.concept_ref)}
      className="w-full rounded-xl px-4 py-3 text-left transition hover:border-current"
      style={{ background: C.card, border: `1px solid ${C.borderSub}`, color: C.text2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-[14px] font-semibold leading-snug" style={{ color: C.text }}>
            {draft.label}
          </p>
          {draft.subtitle && (
            <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
              {draft.subtitle}
            </p>
          )}
          <p className="mt-1 text-[10px]" style={{ color: C.text3 }}>
            {summary || 'Saved review'}{lastDate ? ` · last reviewed ${lastDate}` : ''}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ border: `1px solid ${C.borderSub}`, color: C.text3, background: C.inset }}
        >
          Memory
        </span>
      </div>
    </button>
  )
}

export default function ConceptDraftsPanel() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [selected, setSelected] = useState(null) // concept_ref being viewed
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const loadDrafts = useCallback(() => {
    setLoading(true)
    setError(null)
    return apiGet('/api/discovery-concept-drafts')
      .then((res) => setDrafts(Array.isArray(res?.drafts) ? res.drafts : []))
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[ConceptDraftsPanel] GET /api/discovery-concept-drafts failed:', err)
        setError('HESTIA could not load your saved concept drafts right now. Nothing was changed.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadDrafts() }, [loadDrafts])

  const openDraft = useCallback((conceptRef) => {
    setSelected(conceptRef)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    apiGet(`/api/discovery-concept-drafts/${encodeURIComponent(conceptRef)}`)
      .then((res) => setDetail(res?.draft || null))
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[ConceptDraftsPanel] GET concept draft detail failed:', err)
        setDetailError('HESTIA could not open this concept draft. Nothing was changed.')
      })
      .finally(() => setDetailLoading(false))
  }, [])

  const closeDraft = useCallback(() => {
    setSelected(null)
    setDetail(null)
    setDetailError(null)
  }, [])

  return (
    <details className="mt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2"
        style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
          Your concept drafts
        </span>
        <span className="text-[11px]" style={{ color: C.text3 }}>
          {loading ? 'Loading…' : `${drafts.length} saved`}
        </span>
      </summary>

      <div className="mt-3 rounded-2xl p-5" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
        {/* Mandatory, non-removable honesty framing */}
        <Eyebrow>Concept drafts · re-entry</Eyebrow>
        <p className="mt-1.5 text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
          {NOT_DNA_NOTE}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
          Re-open a saved draft to review what HESTIA captured. This is re-entry into a saved concept draft —
          it does not restore the original chat, and it does not confirm Venue DNA.
        </p>

        {/* ── Detail (readback) view ── */}
        {selected ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={closeDraft}
              className="text-[11px] underline"
              style={{ color: C.text3 }}
            >
              ← back to all concept drafts
            </button>

            {detailLoading && (
              <p className="mt-3 text-[12px]" style={{ color: C.text3 }}>Reading the saved snapshots…</p>
            )}
            {detailError && (
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{detailError}</p>
            )}
            {!detailLoading && !detailError && detail && (
              <div className="mt-3">
                <p className="font-serif text-[15px] font-semibold" style={{ color: C.text }}>{detail.label}</p>
                {detail.subtitle && (
                  <p className="mt-0.5 text-[12px]" style={{ color: C.text2 }}>{detail.subtitle}</p>
                )}
                <p className="mt-1 text-[11px] italic leading-relaxed" style={{ color: C.text3 }}>
                  {SNAPSHOT_NOTE} These are the saved fidelity reviews for this draft concept — Memory, not confirmed Venue DNA.
                </p>
                <div className="mt-4 space-y-3">
                  {Array.isArray(detail.reviews) && detail.reviews.length > 0 ? (
                    detail.reviews.map((r) => <ReadonlyReviewCard key={r.id} review={r} />)
                  ) : (
                    <p className="text-[12px]" style={{ color: C.text3 }}>This draft has no saved reviews.</p>
                  )}
                </div>
              </div>
            )}
            {!detailLoading && !detailError && !detail && (
              <p className="mt-3 text-[12px]" style={{ color: C.text3 }}>This concept draft is no longer available.</p>
            )}
          </div>
        ) : (
          /* ── List view ── */
          <div className="mt-4">
            {loading ? (
              <p className="text-[12px]" style={{ color: C.text3 }}>Loading your saved concept drafts…</p>
            ) : error ? (
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>{error}</p>
            ) : drafts.length === 0 ? (
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                No saved concept drafts yet. When you review HESTIA’s candidate signals in a discovery
                conversation and save your choices, those saved reviews appear here so you can return to them.
              </p>
            ) : (
              <div className="space-y-3">
                {drafts.map((d) => (
                  <DraftListItem key={d.concept_ref} draft={d} onOpen={openDraft} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  )
}
