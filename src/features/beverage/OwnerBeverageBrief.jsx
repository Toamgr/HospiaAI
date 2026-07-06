// OwnerBeverageBrief — the owner's "Beverage Direction Brief" (Beverage Slice 1A).
//
// A calm, guided form where the OWNER states beverage direction in their own words and submits
// it to the F&B Director. Doctrine (BEVERAGE_UX_SYSTEM_OWNER_BRIEF_AND_REPORT_MEMORY_2026_07.md):
//   • Save draft / edit draft / submit — after submit the owner version is READ-ONLY, stated
//     plainly. No AI, no generation, no prefill, no sample content: every field starts empty
//     and empty fields stay visibly empty.
//   • Uses ONLY the Slice 1A owner routes via beverageBriefApi. No Venue DNA contact.
//   • OWNER-ONLY surface: refuses to render for any role that is not exactly 'owner' (the
//     backend enforces this too — the UI gate is honesty, not security).
//   • Honest states: load errors are shown as errors; there is no fake success.
//
// Palette A (Operational Dark) — operational screen, per skills/user/hestia-ui-design.
// Primary action: "Submit to the F&B Director".

import { useCallback, useEffect, useState } from 'react'
import {
  createBeverageBrief, updateBeverageBrief, submitBeverageBrief, listBeverageBriefs,
} from '../../services/api/beverageBriefApi'

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
}

// The eleven brief fields, in the order the owner reads them. multiline picks the control;
// hint is guidance about what the field MEANS — never example content.
const FIELD_DEFS = [
  { key: 'venue_type', label: 'Venue type', hint: 'What kind of place this is, in your words.' },
  { key: 'service_style', label: 'Service style', hint: 'How service feels here — pace, formality, table or bar.' },
  { key: 'intent_statement', label: 'Intent', hint: 'What you want the beverage program to say about the venue.', multiline: true },
  { key: 'guest_profile', label: 'Guest profile', hint: 'Who you are pouring for.', multiline: true },
  { key: 'flavor_direction', label: 'Flavor direction', hint: 'Where the flavors should lean.', multiline: true },
  { key: 'cocktail_count', label: 'Cocktail count', hint: 'How many cocktails the list should carry (a whole number).', numeric: true },
  { key: 'zero_proof_stance', label: 'Zero-proof stance', hint: 'How seriously the program treats non-alcoholic guests.' },
  { key: 'constraints', label: 'Constraints', hint: 'Hard limits — equipment, ingredients, kosher, anything non-negotiable.', multiline: true },
  { key: 'price_range', label: 'Price range', hint: 'Where cocktail pricing should sit.' },
  { key: 'staff_capability_note', label: 'Staff capability', hint: 'What the team behind the bar can honestly execute.', multiline: true },
  { key: 'season_context', label: 'Season context', hint: 'The season or moment this direction is for.' },
]

const EMPTY_FIELDS = Object.fromEntries(FIELD_DEFS.map(f => [f.key, '']))

const FOCUS_RING = 'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(201,169,110,0.14)]'

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: C.goldMuted }}>
      {children}
    </div>
  )
}

// Map an API brief (nullable values) into form state (strings for inputs).
function briefToForm(brief) {
  const out = { ...EMPTY_FIELDS }
  for (const def of FIELD_DEFS) {
    const v = brief?.fields?.[def.key]
    out[def.key] = v === null || v === undefined ? '' : String(v)
  }
  return out
}

// Map form state back to the API payload: blank → null (an empty field stays empty).
function formToFields(form) {
  const out = {}
  for (const def of FIELD_DEFS) {
    const raw = form[def.key]
    if (typeof raw !== 'string' || raw.trim().length === 0) { out[def.key] = null; continue }
    out[def.key] = def.numeric ? Number(raw) : raw
  }
  return out
}

function formatDateTime(value) {
  if (!value) return null
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') + 'Z' : value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// One read-only field row in the submitted view — an empty field is shown honestly as empty.
function ReadOnlyField({ def, value }) {
  const has = value !== null && value !== undefined && String(value).trim().length > 0
  return (
    <div className="rounded-lg px-4 py-3" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
      <Eyebrow>{def.label}</Eyebrow>
      {has ? (
        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: C.text }}>{String(value)}</p>
      ) : (
        <p className="mt-1 text-[12px] italic" style={{ color: C.text3 }}>Left empty</p>
      )}
    </div>
  )
}

export default function OwnerBeverageBrief({ currentUser }) {
  const role = currentUser?.role
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [loadError, setLoadError] = useState(null)
  const [brief, setBrief] = useState(null)              // latest persisted brief (or null)
  const [form, setForm] = useState(EMPTY_FIELDS)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(null)                // 'saving' | 'submitting' | null
  const [actionError, setActionError] = useState(null)
  const [savedNote, setSavedNote] = useState(null)
  const [composingNew, setComposingNew] = useState(false)

  const load = useCallback(async () => {
    setLoadState('loading'); setLoadError(null)
    try {
      const res = await listBeverageBriefs()
      const latest = Array.isArray(res.briefs) && res.briefs.length > 0 ? res.briefs[0] : null
      setBrief(latest)
      setForm(latest && latest.status === 'draft' ? briefToForm(latest) : { ...EMPTY_FIELDS })
      setDirty(false)
      setComposingNew(false)
      setLoadState('ready')
    } catch (err) {
      setLoadError(err.message || 'We couldn’t reach the beverage brief data.')
      setLoadState('error')
    }
  }, [])

  useEffect(() => { if (role === 'owner') load() }, [role, load])

  if (role !== 'owner') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-[13px]" style={{ color: C.text2 }}>
          The Beverage Direction Brief is written by the venue owner. This surface is owner-only.
        </p>
      </div>
    )
  }

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setDirty(true)
    setSavedNote(null)
  }

  // Persist the current form: create on first save, update afterwards. Returns the saved brief.
  const persistDraft = async () => {
    const fields = formToFields(form)
    const editingDraft = brief && brief.status === 'draft' && !composingNew
    const res = editingDraft
      ? await updateBeverageBrief(brief.id, fields)
      : await createBeverageBrief(fields)
    setBrief(res.brief)
    setComposingNew(false)
    setDirty(false)
    return res.brief
  }

  const onSaveDraft = async () => {
    setBusy('saving'); setActionError(null); setSavedNote(null)
    try {
      await persistDraft()
      setSavedNote('Draft saved.')
    } catch (err) {
      setActionError(err.message || 'Could not save the draft.')
    } finally { setBusy(null) }
  }

  const onSubmit = async () => {
    setBusy('submitting'); setActionError(null); setSavedNote(null)
    try {
      const editingDraft = brief && brief.status === 'draft' && !composingNew
      const saved = dirty || !editingDraft ? await persistDraft() : brief
      const res = await submitBeverageBrief(saved.id)
      setBrief(res.brief)
      setDirty(false)
    } catch (err) {
      setActionError(err.message || 'Could not submit the brief.')
    } finally { setBusy(null) }
  }

  const onBeginNew = () => {
    setComposingNew(true)
    setForm({ ...EMPTY_FIELDS })
    setDirty(false)
    setActionError(null)
    setSavedNote(null)
  }

  // ── Loading / error states (honest, no fake content) ─────────────────────────
  if (loadState === 'loading') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10" aria-busy="true">
        <div className="h-4 w-48 animate-pulse rounded" style={{ background: '#1E1E1E' }} />
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-16 animate-pulse rounded-lg" style={{ background: '#1E1E1E' }} />)}
        </div>
      </div>
    )
  }
  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-[13px]" style={{ color: C.error }} role="alert">{loadError}</p>
        <button type="button" onClick={load}
          className={`mt-4 rounded px-5 py-2 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
          style={{ border: `1px solid ${C.gold}`, color: C.gold, background: 'transparent' }}>
          Try again
        </button>
      </div>
    )
  }

  const submittedView = brief && brief.status === 'submitted' && !composingNew

  // ── Submitted (read-only) state ───────────────────────────────────────────────
  if (submittedView) {
    const when = formatDateTime(brief.submitted_at)
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Eyebrow>Beverage Program</Eyebrow>
        <h1 className="mt-1 font-serif text-2xl font-semibold" style={{ color: C.text }}>Beverage Direction Brief</h1>
        <div className="mt-4 rounded-lg px-4 py-3" style={{ background: C.raised, border: `1px solid ${C.borderEmp}` }}>
          <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }} role="status">
            Submitted to the F&amp;B Director{when ? ` on ${when}` : ''}. Your words are now read-only —
            the F&amp;B Director reviews them as a separate layer and never rewrites them.
          </p>
          {brief.review && (
            <p className="mt-1 text-[12px]" style={{ color: C.text2 }}>
              Review status: <span style={{ color: C.gold }}>{String(brief.review.status).replace(/_/g, ' ')}</span>
            </p>
          )}
        </div>
        <div className="mt-6 space-y-3">
          {FIELD_DEFS.map(def => <ReadOnlyField key={def.key} def={def} value={brief.fields?.[def.key]} />)}
        </div>
        <div className="mt-8">
          <button type="button" onClick={onBeginNew}
            className={`rounded px-5 py-2 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
            style={{ border: `1px solid ${C.borderEmp}`, color: C.text2, background: 'transparent' }}>
            Begin a new brief
          </button>
        </div>
      </div>
    )
  }

  // ── Draft form ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Eyebrow>Beverage Program</Eyebrow>
      <h1 className="mt-1 font-serif text-2xl font-semibold" style={{ color: C.text }}>Beverage Direction Brief</h1>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: C.text2 }}>
        Set the direction for the beverage program in your own words. Every field is optional —
        an empty field is honest, not a problem. When it says what you mean, submit it to the
        F&amp;B Director.
      </p>

      <div className="mt-8 space-y-5">
        {FIELD_DEFS.map(def => (
          <div key={def.key}>
            <label htmlFor={`bb-${def.key}`} className="block text-[10px] font-medium uppercase tracking-[0.1em]"
              style={{ color: C.text3 }}>
              {def.label}
            </label>
            <p className="mt-0.5 text-[11px]" style={{ color: C.text3 }}>{def.hint}</p>
            {def.multiline ? (
              <textarea id={`bb-${def.key}`} rows={3} value={form[def.key]}
                onChange={e => setField(def.key, e.target.value)}
                className={`mt-1.5 w-full rounded-md px-3.5 py-2.5 text-[13px] leading-relaxed ${FOCUS_RING}`}
                style={{ background: C.ground, border: `1px solid ${C.borderSub}`, color: C.text }} />
            ) : (
              <input id={`bb-${def.key}`} type={def.numeric ? 'number' : 'text'} value={form[def.key]}
                onChange={e => setField(def.key, e.target.value)}
                inputMode={def.numeric ? 'numeric' : undefined}
                className={`mt-1.5 w-full rounded-md px-3.5 py-2.5 text-[13px] ${FOCUS_RING}`}
                style={{ background: C.ground, border: `1px solid ${C.borderSub}`, color: C.text }} />
            )}
          </div>
        ))}
      </div>

      {actionError && (
        <p className="mt-5 text-[12px]" style={{ color: C.error }} role="alert">{actionError}</p>
      )}
      {savedNote && !actionError && (
        <p className="mt-5 text-[12px]" style={{ color: C.text2 }} role="status">{savedNote}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onSubmit} disabled={busy !== null}
          className={`rounded px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] transition ${FOCUS_RING}`}
          style={{ background: C.gold, color: C.ground, opacity: busy ? 0.6 : 1 }}>
          {busy === 'submitting' ? 'Submitting…' : 'Submit to the F&B Director'}
        </button>
        <button type="button" onClick={onSaveDraft} disabled={busy !== null}
          className={`rounded px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] ${FOCUS_RING}`}
          style={{ border: `1px solid ${C.gold}`, color: C.gold, background: 'transparent', opacity: busy ? 0.6 : 1 }}>
          {busy === 'saving' ? 'Saving…' : 'Save draft'}
        </button>
      </div>
    </div>
  )
}
