// CandidateReviewPanel — inline FIDELITY review surface for Candidate Venue DNA signals.
//
// Rendered directly under an Owner Correction Loop assistant message in OwnerAIHome. It lets
// the owner triage what HESTIA *captured* from the conversation — accept-as-captured, revise,
// reject, hold, or re-route a candidate — with restraint and total honesty.
//
// CRITICAL PRODUCT DOCTRINE — fidelity, not identity:
//   • Accepting a candidate means "HESTIA captured what I meant," NOT "this is confirmed
//     Venue DNA." No control here confirms identity, promotes to DNA, or writes anything.
//   • All actions are LOCAL ONLY — component useState, reversible, refresh-discarded. There
//     is no network call, no persistence, no Venue DNA mutation anywhere in this file.
//   • Confidence may only be lowered, never raised — raising it would be a fabricated
//     evidence claim. Evidence is one conversation; the way to strengthen a signal is more
//     conversation, not a click.
//
// Palette B (Editorial Light) — matches the host OwnerAIHome surface (never mix palettes).

import { useState } from 'react'

// ── Palette B — Editorial Light tokens (mirrors OwnerAIHome) ───────────────────
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

const FRAMING_LINE =
  'Captured, not confirmed. These are candidate signals from this conversation, not approved Venue DNA.'
const LOCAL_NOTE =
  'Review choices are local in this first version and are not saved yet.'

// Foundation-first destination ordering (taxonomy posture); unrouted candidates land last.
const DESTINATION_ORDER = ['Venue DNA', 'Venue Memory', 'Bar Intelligence', 'Service', 'Academy', 'Events', 'F&B']
const ALL_DESTINATIONS = [...DESTINATION_ORDER]
const CONFIDENCE_ORDER = ['low', 'medium', 'high'] // index = coverage level
const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 }

const CONFIDENCE_TOOLTIP =
  'Confidence is evidence coverage from this conversation — not certainty, and not confirmation.'

// Restrained, explicitly-local action labels (no "Approved", no "Confirmed", no success green).
const ACTION_LABEL = {
  captured: 'Captured',
  edited:   'Edited locally',
  held:     'Held',
  rejected: 'Rejected locally',
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

// Coverage band: plain-language word + a 3-dot coverage meter. Never a percentage.
function ConfidenceBand({ band }) {
  const level = CONFIDENCE_RANK[band] || 0
  return (
    <span className="inline-flex items-center gap-1.5" title={CONFIDENCE_TOOLTIP}>
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

// A small, explicitly-local status tag. Tone is neutral — never celebratory.
function LocalTag({ kind, rerouted }) {
  const label = ACTION_LABEL[kind]
  if (!label && !rerouted) return null
  const tone =
    kind === 'rejected' ? { color: C.text3, border: C.borderSub }
      : kind === 'held' ? { color: C.amber, border: C.borderEmp }
        : { color: C.burgundy, border: C.borderEmp }
  return (
    <span className="inline-flex items-center gap-1.5">
      {label && (
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ border: `1px solid ${tone.border}`, color: tone.color, background: C.inset }}
        >
          {label}
        </span>
      )}
      {rerouted && (
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ border: `1px solid ${C.borderEmp}`, color: C.text2, background: C.inset }}
        >
          Re-routed locally
        </span>
      )}
      <span className="text-[10px]" style={{ color: C.text3 }}>· local, unsaved</span>
    </span>
  )
}

function GhostButton({ onClick, children, emphasis }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1 text-[11px] font-medium transition disabled:opacity-40"
      style={{
        border: `1px solid ${emphasis ? C.burgundy : C.borderSub}`,
        color: emphasis ? C.burgundy : C.text2,
        background: emphasis ? 'rgba(107,39,55,0.06)' : C.card,
      }}
    >
      {children}
    </button>
  )
}

function CandidateCard({ candidate }) {
  // All review state is component-local and reversible. Nothing here is persisted.
  const [action, setAction] = useState(null) // null | captured | edited | held | rejected
  const [chosenDestination, setChosenDestination] = useState(candidate.suggestedDestination || '')
  const [editedSignal, setEditedSignal] = useState(null)
  const [editedEvidence, setEditedEvidence] = useState(null)
  const [editedConfidence, setEditedConfidence] = useState(null)

  const [editing, setEditing] = useState(false)
  const [draftSignal, setDraftSignal] = useState(candidate.signal || '')
  const [draftEvidence, setDraftEvidence] = useState(candidate.evidence || '')
  const [draftConfidence, setDraftConfidence] = useState(candidate.confidence || '')

  const signal = editedSignal ?? candidate.signal
  const evidence = editedEvidence ?? candidate.evidence
  const confidence = editedConfidence ?? candidate.confidence
  const provenance = action === 'edited' ? 'owner_edit' : candidate.provenance
  const rerouted = Boolean(candidate.suggestedDestination) && chosenDestination !== candidate.suggestedDestination
  const isRejected = action === 'rejected'

  // Confidence may only stay the same or be LOWERED — never raised. Options are capped at
  // the original band; an uncaptured band offers nothing to raise from.
  const originalRank = CONFIDENCE_RANK[candidate.confidence] || 0
  const allowedConfidence = CONFIDENCE_ORDER.filter((b) => CONFIDENCE_RANK[b] <= (originalRank || 0))

  function openEdit() {
    setDraftSignal(signal || '')
    setDraftEvidence(evidence || '')
    setDraftConfidence(confidence || '')
    setEditing(true)
  }
  function saveEdit() {
    setEditedSignal(draftSignal.trim() || candidate.signal)
    setEditedEvidence(draftEvidence.trim() || candidate.evidence)
    // Guard: never let the draft raise confidence above the original band.
    const safeConfidence = (CONFIDENCE_RANK[draftConfidence] || 0) <= (originalRank || 0)
      ? (draftConfidence || null)
      : candidate.confidence
    setEditedConfidence(safeConfidence)
    setAction('edited')
    setEditing(false)
  }
  function resetReview() {
    setAction(null)
    setEditing(false)
  }

  return (
    <div
      className="rounded-xl p-4 transition"
      style={{
        background: C.card,
        border: `1px solid ${C.borderSub}`,
        boxShadow: '0 1px 4px rgba(26,22,18,0.06)',
        opacity: isRejected ? 0.6 : 1,
      }}
    >
      {/* Signal — the headline of the card */}
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-[15px] font-semibold leading-snug" style={{ color: C.text }}>
          {signal}
        </p>
        <LocalTag kind={action} rerouted={rerouted} />
      </div>

      {/* Evidence — verbatim; honest when not captured */}
      <div className="mt-2.5">
        <Eyebrow>Evidence</Eyebrow>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: evidence ? C.text2 : C.text3 }}>
          {evidence || 'Supporting detail not captured in this conversation.'}
        </p>
      </div>

      {/* Confidence · Status · Destination · Provenance */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div>
          <Eyebrow>Confidence</Eyebrow>
          <div className="mt-1"><ConfidenceBand band={confidence} /></div>
        </div>
        <div>
          <Eyebrow>Status</Eyebrow>
          <p className="mt-1 text-[12px]" style={{ color: candidate.status ? C.text2 : C.text3 }}>
            {candidate.status || 'not captured'}
          </p>
        </div>
        <div>
          <Eyebrow>Provenance</Eyebrow>
          <p className="mt-1 text-[11px] font-medium" style={{ color: C.text2 }}>{provenance}</p>
        </div>
      </div>

      {/* Re-route control — local only */}
      <div className="mt-3">
        <Eyebrow>Suggested destination</Eyebrow>
        <div className="mt-1 flex items-center gap-2">
          <select
            value={chosenDestination}
            onChange={(e) => setChosenDestination(e.target.value)}
            className="rounded-lg px-2.5 py-1 text-[12px] outline-none"
            style={{ border: `1px solid ${C.borderSub}`, background: C.inset, color: C.text }}
          >
            {!candidate.suggestedDestination && <option value="">— not captured —</option>}
            {ALL_DESTINATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {rerouted && (
            <button
              type="button"
              onClick={() => setChosenDestination(candidate.suggestedDestination || '')}
              className="text-[11px] underline"
              style={{ color: C.text3 }}
            >
              reset to suggested
            </button>
          )}
        </div>
      </div>

      {/* Inline editor — fidelity only; revises owner's own words */}
      {editing && (
        <div className="mt-3 rounded-lg p-3" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
          <Eyebrow>Revise — your words</Eyebrow>
          <textarea
            value={draftSignal}
            onChange={(e) => setDraftSignal(e.target.value)}
            rows={2}
            className="mt-1.5 w-full resize-none rounded-lg px-2.5 py-2 text-[13px] outline-none"
            style={{ border: `1px solid ${C.borderSub}`, background: C.card, color: C.text }}
            placeholder="The signal, in your words"
          />
          <textarea
            value={draftEvidence}
            onChange={(e) => setDraftEvidence(e.target.value)}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg px-2.5 py-2 text-[12px] outline-none"
            style={{ border: `1px solid ${C.borderSub}`, background: C.card, color: C.text2 }}
            placeholder="The supporting detail, in your words"
          />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px]" style={{ color: C.text3 }}>Confidence</span>
            <select
              value={draftConfidence}
              onChange={(e) => setDraftConfidence(e.target.value)}
              disabled={allowedConfidence.length === 0}
              className="rounded-lg px-2 py-1 text-[12px] outline-none disabled:opacity-50"
              style={{ border: `1px solid ${C.borderSub}`, background: C.card, color: C.text }}
            >
              {allowedConfidence.length === 0 && <option value="">not captured</option>}
              {allowedConfidence.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <span className="text-[10px]" style={{ color: C.text3 }}>can only be lowered</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <GhostButton onClick={saveEdit} emphasis>Save revision</GhostButton>
            <GhostButton onClick={() => setEditing(false)}>Never mind</GhostButton>
          </div>
        </div>
      )}

      {/* Action row — all local, all reversible */}
      {!editing && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: C.borderSub }}>
          {action ? (
            <>
              <span className="text-[11px]" style={{ color: C.text3 }}>
                Marked locally. Nothing has been saved or confirmed.
              </span>
              <GhostButton onClick={resetReview}>Undo</GhostButton>
            </>
          ) : (
            <>
              <GhostButton onClick={() => setAction('captured')} emphasis>Accept as captured</GhostButton>
              <GhostButton onClick={openEdit}>Revise</GhostButton>
              <GhostButton onClick={() => setAction('held')}>Hold — too early</GhostButton>
              <GhostButton onClick={() => setAction('rejected')}>Reject</GhostButton>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function CandidateReviewPanel({ candidates } = {}) {
  const list = Array.isArray(candidates) ? candidates.filter((c) => c && c.signal) : []
  if (list.length === 0) return null

  // Group by the candidate's ORIGINAL suggested destination (stable layout); re-routes are
  // shown inline on the card rather than reflowing groups mid-review.
  const groups = []
  const byDest = new Map()
  for (const c of list) {
    const key = c.suggestedDestination || '__unrouted__'
    if (!byDest.has(key)) { byDest.set(key, []); groups.push(key) }
    byDest.get(key).push(c)
  }
  const orderedKeys = [
    ...DESTINATION_ORDER.filter((d) => byDest.has(d)),
    ...groups.filter((k) => !DESTINATION_ORDER.includes(k) && k !== '__unrouted__'),
    ...(byDest.has('__unrouted__') ? ['__unrouted__'] : []),
  ]

  return (
    <div className="mt-2 ml-9 rounded-2xl p-5" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
      {/* Mandatory, non-removable honesty framing */}
      <Eyebrow>Candidate review · fidelity only</Eyebrow>
      <p className="mt-1.5 text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
        {FRAMING_LINE}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
        {LOCAL_NOTE}
      </p>

      <div className="mt-4 space-y-5">
        {orderedKeys.map((key) => {
          const cards = byDest.get(key)
          // Within a group, order by confidence coverage descending.
          const sorted = [...cards].sort(
            (a, b) => (CONFIDENCE_RANK[b.confidence] || 0) - (CONFIDENCE_RANK[a.confidence] || 0),
          )
          const heading = key === '__unrouted__' ? 'No suggested destination' : key
          return (
            <div key={key}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.text2 }}>
                  {heading}
                </span>
                <span className="h-px flex-1" style={{ background: C.borderSub }} />
                <span className="text-[10px]" style={{ color: C.text3 }}>
                  {sorted.length} {sorted.length === 1 ? 'signal' : 'signals'}
                </span>
              </div>
              <div className="space-y-3">
                {sorted.map((c, i) => (
                  <CandidateCard key={`${key}-${i}`} candidate={c} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
