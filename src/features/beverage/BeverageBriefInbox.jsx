// BeverageBriefInbox — the F&B Director's "Beverage Brief Inbox" (Beverage Slice 1A).
//
// Pure presentational component: all state, effects, and API calls live in
// containers/BeverageBriefInboxContainer.jsx, which passes data and handlers down as props.
//
// Lists SUBMITTED Owner Beverage Direction Briefs for the active venue and lets the F&B
// Director open one, read the owner's values verbatim, add review notes and per-field
// adjustments, and decide: approve / decline / request clarification.
//
// Doctrine (BEVERAGE_UX_SYSTEM_OWNER_BRIEF_AND_REPORT_MEMORY_2026_07.md):
//   • The owner's values are shown VERBATIM and are never edited here. An adjustment is a
//     DIFF stored on the review — the owner value stays visible beside it, always.
//   • Honest empty state: "No beverage briefs waiting." No sample briefs, no demo cards,
//     no fake data, no fake success states.
//   • Uses ONLY the Slice 1A F&B routes via beverageBriefApi (in the container). Zero AI, zero
//     generation, zero Venue DNA contact.
//   • F&B-DIRECTOR-ONLY surface: refuses to render unless the container resolves `allowed`
//     (role is fb_director), including admin (backend enforces this too — requireAuth('fb_director')
//     plus an explicit admin re-exclusion on every F&B route; admin must not see or access this
//     page at all).
//
// Palette A (Operational Dark). Primary action inside an open brief: the review decision.

const C = {
  ground: '#0D0D0D',
  card: '#141414',
  raised: '#1A1A1A',
  borderSub: '#2A2A2A',
  borderEmp: '#3A3A3A',
  gold: '#C9A96E',
  goldMuted: '#8B7355',
  text: '#F5F0E8',
  text2: '#9A9590',
  text3: '#5A5550',
  error: '#C07070',
  success: '#6BAF80',
}

const FOCUS_RING = 'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(201,169,110,0.14)]'

// Same field order and labels the owner sees — the director reads what the owner wrote.
const FIELD_DEFS = [
  { key: 'venue_type', label: 'Venue type' },
  { key: 'service_style', label: 'Service style' },
  { key: 'intent_statement', label: 'Intent' },
  { key: 'guest_profile', label: 'Guest profile' },
  { key: 'flavor_direction', label: 'Flavor direction' },
  { key: 'cocktail_count', label: 'Cocktail count' },
  { key: 'zero_proof_stance', label: 'Zero-proof stance' },
  { key: 'constraints', label: 'Constraints' },
  { key: 'price_range', label: 'Price range' },
  { key: 'staff_capability_note', label: 'Staff capability' },
  { key: 'season_context', label: 'Season context' },
]

const REVIEW_STATUS_LABEL = {
  in_review: 'In review',
  approved: 'Approved',
  declined: 'Declined',
  clarification_requested: 'Clarification requested',
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: C.goldMuted }}>
      {children}
    </div>
  )
}

// rounded-full chip on an 8px-grid: h-6 (24px) fixed height + items-center replaces vertical
// padding, px-2 (8px) horizontal — no half-grid px-2.5/py-0.5 values.
function StatusChip({ status }) {
  const decided = status && status !== 'in_review'
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[10px] font-medium uppercase tracking-[0.1em]"
      style={{
        border: `1px solid ${C.borderEmp}`,
        color: status ? (decided ? C.gold : C.text2) : C.text3,
        background: C.raised,
      }}>
      {status ? (REVIEW_STATUS_LABEL[status] || status) : 'Awaiting review'}
    </span>
  )
}

function shortId(id) {
  const s = String(id || '')
  return s.length > 8 ? `…${s.slice(-8)}` : s
}

function formatDateTime(value) {
  if (!value) return null
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') + 'Z' : value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// One field of the owner's brief, verbatim, with the review adjustment (if any) shown as a
// separate layer BESIDE the owner value — never replacing it. While the review is open, the
// director can draft an adjustment for this field.
function BriefField({ def, ownerValue, adjustment, canAdjust, draft, onDraftChange }) {
  const has = ownerValue !== null && ownerValue !== undefined && String(ownerValue).trim().length > 0
  return (
    <div className="rounded-lg px-4 py-3" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
      <Eyebrow>{def.label}</Eyebrow>
      {has ? (
        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: C.text }}>
          {String(ownerValue)}
        </p>
      ) : (
        <p className="mt-1 text-[12px] italic" style={{ color: C.text3 }}>The owner left this empty.</p>
      )}

      {adjustment && (
        <div className="mt-2 rounded-md px-3 py-2" style={{ background: C.raised, border: `1px dashed ${C.borderEmp}` }}>
          <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: C.goldMuted }}>F&amp;B adjustment</p>
          <p className="mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed" style={{ color: C.text }}>
            {adjustment.adjusted_value}
          </p>
          {adjustment.note && (
            <p className="mt-0.5 text-[11px]" style={{ color: C.text2 }}>{adjustment.note}</p>
          )}
        </div>
      )}

      {canAdjust && (
        <div className="mt-2">
          <label htmlFor={`adj-${def.key}`} className="block text-[10px] uppercase tracking-[0.1em]" style={{ color: C.text3 }}>
            {adjustment ? 'Revise your adjustment' : 'Suggest an adjustment'}
          </label>
          <textarea id={`adj-${def.key}`} rows={2} value={draft || ''}
            onChange={e => onDraftChange(def.key, e.target.value)}
            className={`mt-1 w-full rounded-md px-3 py-2 text-[12px] leading-relaxed ${FOCUS_RING}`}
            style={{ background: C.ground, border: `1px solid ${C.borderSub}`, color: C.text }} />
        </div>
      )}
    </div>
  )
}

export default function BeverageBriefInbox({
  allowed, loadState, loadError, onRetryLoad, briefs,
  openId, onOpenBrief, onCloseBrief, detail, detailState, detailError,
  notesDraft, onNotesChange, adjustmentDrafts, onDraftChange,
  busy, actionError, savedNote, onOpenReview, onSaveReviewWork, onDecide,
}) {
  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-[13px]" style={{ color: C.text2 }}>
          The Beverage Brief Inbox belongs to the F&amp;B Director.
        </p>
      </div>
    )
  }

  // ── List states ────────────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10" aria-busy="true">
        <div className="h-4 w-48 animate-pulse rounded" style={{ background: '#1E1E1E' }} />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map(n => <div key={n} className="h-20 animate-pulse rounded-lg" style={{ background: '#1E1E1E' }} />)}
        </div>
      </div>
    )
  }
  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-[13px]" style={{ color: C.error }} role="alert">{loadError}</p>
        <button type="button" onClick={onRetryLoad}
          className={`mt-4 rounded px-5 py-2 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
          style={{ border: `1px solid ${C.gold}`, color: C.gold, background: 'transparent' }}>
          Try again
        </button>
      </div>
    )
  }

  // ── Open brief (detail) ────────────────────────────────────────────────────────
  if (openId) {
    const review = detail?.review || null
    const reviewOpen = review && review.status === 'in_review'
    const decided = review && review.status !== 'in_review'
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <button type="button" onClick={onCloseBrief}
          className={`text-[12px] ${FOCUS_RING}`} style={{ color: C.text2, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          ← Back to the inbox
        </button>

        {detailState === 'loading' && (
          <div className="mt-6 space-y-3" aria-busy="true">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-16 animate-pulse rounded-lg" style={{ background: '#1E1E1E' }} />)}
          </div>
        )}
        {detailState === 'error' && (
          <p className="mt-6 text-[13px]" style={{ color: C.error }} role="alert">{detailError}</p>
        )}

        {detailState === 'ready' && detail?.brief && (
          <>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <Eyebrow>Owner Beverage Direction Brief</Eyebrow>
                <h1 className="mt-1 font-serif text-xl font-semibold" style={{ color: C.text }}>
                  Brief <span className="font-mono text-[14px]">{shortId(detail.brief.id)}</span>
                </h1>
                <p className="mt-1 text-[11px]" style={{ color: C.text3 }}>
                  Submitted {formatDateTime(detail.brief.submitted_at) || '—'} · the owner’s words, verbatim
                </p>
              </div>
              <StatusChip status={review?.status || null} />
            </div>

            <div className="mt-6 space-y-3">
              {FIELD_DEFS.map(def => (
                <BriefField key={def.key} def={def}
                  ownerValue={detail.brief.fields?.[def.key]}
                  adjustment={review?.field_adjustments?.[def.key] || null}
                  canAdjust={Boolean(reviewOpen)}
                  draft={adjustmentDrafts[def.key]}
                  onDraftChange={onDraftChange} />
              ))}
            </div>

            {/* ── Review layer ── */}
            <div className="mt-8 rounded-lg px-4 py-4" style={{ background: C.raised, border: `1px solid ${C.borderEmp}` }}>
              <Eyebrow>F&amp;B Review</Eyebrow>

              {!review && (
                <div className="mt-2">
                  <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                    No review yet. Opening one lets you add notes and adjustments — the owner’s
                    values stay untouched.
                  </p>
                  <button type="button" onClick={onOpenReview} disabled={busy !== null}
                    className={`mt-3 rounded px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
                    style={{ background: C.gold, color: C.ground, opacity: busy ? 0.6 : 1 }}>
                    {busy === 'opening' ? 'Opening…' : 'Open review'}
                  </button>
                </div>
              )}

              {reviewOpen && (
                <div className="mt-2">
                  <label htmlFor="review-notes" className="block text-[10px] uppercase tracking-[0.1em]" style={{ color: C.text3 }}>
                    Review notes
                  </label>
                  <textarea id="review-notes" rows={4} value={notesDraft}
                    onChange={e => onNotesChange(e.target.value)}
                    className={`mt-1 w-full rounded-md px-3.5 py-2.5 text-[13px] leading-relaxed ${FOCUS_RING}`}
                    style={{ background: C.ground, border: `1px solid ${C.borderSub}`, color: C.text }} />

                  {actionError && <p className="mt-3 text-[12px]" style={{ color: C.error }} role="alert">{actionError}</p>}
                  {savedNote && !actionError && <p className="mt-3 text-[12px]" style={{ color: C.text2 }} role="status">{savedNote}</p>}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => onDecide('approved')} disabled={busy !== null}
                      className={`rounded px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
                      style={{ background: C.gold, color: C.ground, opacity: busy ? 0.6 : 1 }}>
                      {busy === 'deciding' ? 'Recording…' : 'Approve'}
                    </button>
                    <button type="button" onClick={() => onDecide('declined')} disabled={busy !== null}
                      className={`rounded px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
                      style={{ border: `1px solid ${C.borderEmp}`, color: C.text2, background: 'transparent', opacity: busy ? 0.6 : 1 }}>
                      Decline
                    </button>
                    <button type="button" onClick={() => onDecide('clarification_requested')} disabled={busy !== null}
                      className={`rounded px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
                      style={{ border: `1px solid ${C.borderEmp}`, color: C.text2, background: 'transparent', opacity: busy ? 0.6 : 1 }}>
                      Request clarification
                    </button>
                    <button type="button" onClick={onSaveReviewWork} disabled={busy !== null}
                      className={`rounded px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] ${FOCUS_RING}`}
                      style={{ color: C.text3, background: 'transparent', border: 'none' }}>
                      {busy === 'saving' ? 'Saving…' : 'Save without deciding'}
                    </button>
                  </div>
                </div>
              )}

              {decided && (
                <div className="mt-2">
                  <p className="text-[13px]" style={{ color: C.text }}>
                    {REVIEW_STATUS_LABEL[review.status] || review.status}
                    <span className="text-[11px]" style={{ color: C.text3 }}>
                      {review.decided_at ? ` · ${formatDateTime(review.decided_at)}` : ''}
                    </span>
                  </p>
                  {review.notes && (
                    <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                      {review.notes}
                    </p>
                  )}
                  <p className="mt-2 text-[11px]" style={{ color: C.text3 }}>
                    This review is decided and closed. The owner’s original values remain unchanged above.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Inbox list ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Eyebrow>Beverage Program</Eyebrow>
      <h1 className="mt-1 font-serif text-2xl font-semibold" style={{ color: C.text }}>Beverage Brief Inbox</h1>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: C.text2 }}>
        Direction briefs the owner has submitted for your review. Your review is a layer — the
        owner’s words are never rewritten.
      </p>

      {briefs.length === 0 ? (
        <div className="mt-10 rounded-lg px-6 py-12 text-center" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
          <p className="font-serif text-[15px]" style={{ color: C.text2 }}>No beverage briefs waiting.</p>
          <p className="mt-1 text-[12px]" style={{ color: C.text3 }}>
            When the owner submits a Beverage Direction Brief, it appears here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {briefs.map(b => (
            <li key={b.id}>
              <button type="button" onClick={() => onOpenBrief(b.id)}
                aria-label={`Open beverage brief ${shortId(b.id)}`}
                className={`w-full rounded-lg px-4 py-3 text-left transition hover:border-[#C9A96E] ${FOCUS_RING}`}
                style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-[14px] font-semibold" style={{ color: C.text }}>
                      {b.fields?.intent_statement
                        ? String(b.fields.intent_statement).slice(0, 120)
                        : 'Direction brief (intent left empty)'}
                    </p>
                    <p className="mt-1 text-[10px]" style={{ color: C.text3 }}>
                      <span className="font-mono">{shortId(b.id)}</span>
                      {b.submitted_at ? ` · submitted ${formatDateTime(b.submitted_at)}` : ''}
                    </p>
                  </div>
                  <StatusChip status={b.review?.status || null} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
