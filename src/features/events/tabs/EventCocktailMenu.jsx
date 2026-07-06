import React, { useState, useEffect, useMemo, useRef } from 'react'
import '@fontsource/fraunces/600.css'
import '@fontsource/jetbrains-mono/400.css'
import EventBriefMenuGenerator from '../components/EventBriefMenuGenerator'
import { buildZoharBrief } from '../utils/zoharBriefOrchestrator'
import { buildDesignContext } from '../utils/eventDesignContext'
import { buildEventDesignBrief } from '../utils/zoharDesignBriefEngine'
import { buildEventMenuDNA } from '../utils/eventMenuDNA'
import { generateEventMenu } from '../../../services/eventCocktailMenuService'
import { fetchCocktailMenu, fetchCreativeImages, generateCreativeImages, saveProgrammeBrief } from '../../../services/api/eventsApi'
import { apiPost } from '../../../services/api/client'

// ── Constants ──────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS = {
  wedding:   'Wedding',
  corporate: 'Corporate Event',
  private:   'Private Party',
  bar_event: 'Bar Event',
  other:     'Event',
}

const PROGRAMME_LABELS = {
  wedding:   'Wedding Cocktail Programme',
  corporate: 'Event Drinks Programme',
  bar_event: 'Bar Programme',
  private:   'Evening Cocktail Menu',
  other:     'Event Cocktail Menu',
}

const SUB_TABS = [
  { id: 'programme',  label: 'Programme' },
  { id: 'production', label: 'Production' },
  { id: 'creative',   label: 'Creative', icon: '✦' },
]

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  gold:       '#C9A96E',
  goldMuted:  '#8B7355',
  goldBorder: 'rgba(201,169,110,0.18)',
  goldFaint:  'rgba(201,169,110,0.06)',
  bg:         '#0D0D0D',
  surface:    '#141414',
  border:     '#2A2A2A',
  borderEm:   '#3A3A3A',
  textPri:    '#F5F0E8',
  textSec:    '#9A9590',
  textTer:    '#5A5550',
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  } catch { return null }
}

function defaultCocktailCount(guestCount) {
  if (!guestCount) return 4
  if (guestCount < 40)  return 3
  if (guestCount < 120) return 4
  return 5
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRAMME TAB
// ═══════════════════════════════════════════════════════════════════════════════

const ATMOSPHERE_OPTIONS = [
  'Intimate & Warm', 'Festive & Celebratory', 'Sophisticated & Restrained',
  'Playful & Energetic', 'Romantic & Dreamy', 'Bold & Statement',
]

const LUXURY_OPTIONS = ['Accessible', 'Premium', 'Luxury', 'Ultra-Luxury']

const SPIRIT_OPTIONS = [
  'Gin', 'Whisky', 'Rum', 'Tequila / Mezcal',
  'Vodka', 'Champagne', 'Wine-Based', 'Spirit-Free',
]

const FLAVOR_OPTIONS = [
  'Citrus', 'Floral', 'Tropical', 'Herbal',
  'Spicy', 'Smoky', 'Sweet', 'Bitter', 'Earthy', 'Stone Fruit',
]

function initProgrammeForm(event, brief) {
  const cb = brief?.cocktailMenuBrief || {}
  return {
    atmosphere:          '',
    guestProfile:        '',
    styleDirection:      event?.aesthetic_subgenre?.replace(/_/g, ' ') || '',
    cocktailPreferences: '',
    spiritPreferences:   [],
    flavorPreferences:   [],
    avoidFlavors:        '',
    luxuryLevel:         'Luxury',
    signatureMoment:     event?.primary_impact_moment || '',
    welcomeDirection:    cb.welcomeDrinkNeed || '',
    zeroproofNotes:      '',
  }
}

// ── Programme sub-components ──────────────────────────────────────────────────

function PillToggle({ options, selected, onChange, multiSelect = true }) {
  function toggle(opt) {
    if (multiSelect) {
      onChange(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt])
    } else {
      onChange(selected === opt ? '' : opt)
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const active = multiSelect ? selected.includes(opt) : selected === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '5px 13px', borderRadius: 100, fontSize: 11,
              fontWeight: active ? 600 : 400, letterSpacing: '0.02em', cursor: 'pointer',
              border: active ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
              background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
              color: active ? T.gold : T.textTer,
              transition: 'all 150ms ease',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function BriefField({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: T.textTer, margin: 0,
        }}>
          {label}
        </p>
        {hint && (
          <p style={{ fontSize: 10, color: '#3A3A3A', margin: '2px 0 0', fontStyle: 'italic' }}>{hint}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function BriefText({ value, onChange, placeholder, multiline }) {
  const base = {
    width: '100%', background: '#0A0A0A', border: `1px solid ${T.border}`,
    borderRadius: 6, padding: '10px 14px', fontSize: 13, color: T.textPri,
    lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const handleFocus  = e => { e.target.style.borderColor = T.gold }
  const handleBlur   = e => { e.target.style.borderColor = T.border }
  if (multiline) {
    return (
      <textarea
        rows={2}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...base, resize: 'vertical', minHeight: 60 }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={base}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  )
}

function ProgrammeHero({ event }) {
  const typeLabel = EVENT_TYPE_LABELS[event.event_type] || 'Event'
  const dateLabel = formatDate(event.event_date)
  const guestLabel = event.expected_guests > 0 ? `${event.expected_guests} guests` : null

  return (
    <div style={{
      padding: '48px 40px 44px',
      background: T.bg,
      border: `1px solid ${T.goldBorder}`,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 65% 0%, rgba(201,169,110,0.07) 0%, transparent 55%)',
      }} />

      <div style={{ position: 'relative' }}>
        <p style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(201,169,110,0.38)', margin: '0 0 20px',
        }}>
          {typeLabel} · Beverage Vision
        </p>

        <h1 style={{
          fontFamily: '"Fraunces", "Georgia", serif',
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 600,
          color: T.textPri, margin: 0, lineHeight: 1.05, letterSpacing: '-0.01em',
        }}>
          {event.name}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16, alignItems: 'center' }}>
          {dateLabel && (
            <span style={{ fontSize: 12, color: T.textTer, letterSpacing: '0.04em' }}>{dateLabel}</span>
          )}
          {event.location && (
            <>
              <span style={{ fontSize: 10, color: '#2A2A2A' }}>·</span>
              <span style={{ fontSize: 12, color: T.textTer, fontStyle: 'italic' }}>{event.location}</span>
            </>
          )}
          {guestLabel && (
            <>
              <span style={{ fontSize: 10, color: '#2A2A2A' }}>·</span>
              <span style={{ fontSize: 12, color: T.textTer }}>{guestLabel}</span>
            </>
          )}
        </div>

        {event.single_sentence && (
          <div style={{ marginTop: 28 }}>
            <div style={{ height: 1, background: 'rgba(201,169,110,0.09)', marginBottom: 20 }} />
            <p style={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontSize: 18, fontWeight: 500, fontStyle: 'italic',
              color: '#E8DCC0', lineHeight: 1.8, letterSpacing: '0.01em',
              margin: 0, maxWidth: 600,
              paddingLeft: 18, borderLeft: `2px solid ${T.goldBorder}`,
            }}>
              "{event.single_sentence}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgrammeBriefForm({ form, setForm, onGenerate, onSave, generating, saving, saveStatus, hasChanges, hasDraft }) {
  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  const showSaveArea = (hasChanges || saveStatus !== null) && !generating

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden',
    }}>
      <div style={{
        padding: '22px 28px 20px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <p style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: T.textTer, margin: '0 0 6px',
          }}>
            Cocktail Programme Brief
          </p>
          <p style={{ fontSize: 12, color: '#4A4540', margin: 0, lineHeight: 1.6 }}>
            Define the vision for this event's beverage programme.
            {hasDraft ? ' Update inputs and regenerate to refine.' : ''}
          </p>
        </div>
        {showSaveArea && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {saveStatus === 'saved' && (
              <span style={{ fontSize: 9, color: '#6BAF80', letterSpacing: '0.06em' }}>Saved ✓</span>
            )}
            {saveStatus === 'error' && (
              <span style={{ fontSize: 9, color: '#C07070', letterSpacing: '0.06em' }}>Save failed</span>
            )}
            {hasChanges && (
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  padding: '5px 12px', background: 'transparent',
                  border: `1px solid ${T.border}`, borderRadius: 4,
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: saving ? T.textTer : T.textSec,
                  cursor: saving ? 'default' : 'pointer',
                  transition: 'border-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.color = T.textPri } }}
                onMouseLeave={e => { if (!saving) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec } }}
              >
                {saving ? 'Saving…' : 'Save Vision'}
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        <BriefField label="Desired atmosphere">
          <PillToggle
            options={ATMOSPHERE_OPTIONS}
            selected={form.atmosphere}
            onChange={v => set('atmosphere', v)}
            multiSelect={false}
          />
        </BriefField>

        <BriefField label="Guest profile" hint="Who is in the room?">
          <BriefText
            value={form.guestProfile}
            onChange={v => set('guestProfile', v)}
            placeholder="e.g. mixed international group, 30–55, appreciation for craft cocktails"
          />
        </BriefField>

        <BriefField label="Style direction">
          <BriefText
            value={form.styleDirection}
            onChange={v => set('styleDirection', v)}
            placeholder="e.g. garden elegance, modern minimalist, Mediterranean summer"
          />
        </BriefField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
          <BriefField label="Spirit preferences">
            <PillToggle
              options={SPIRIT_OPTIONS}
              selected={form.spiritPreferences}
              onChange={v => set('spiritPreferences', v)}
            />
          </BriefField>

          <BriefField label="Flavor preferences">
            <PillToggle
              options={FLAVOR_OPTIONS}
              selected={form.flavorPreferences}
              onChange={v => set('flavorPreferences', v)}
            />
          </BriefField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
          <BriefField label="Avoid flavors" hint="Optional">
            <BriefText
              value={form.avoidFlavors}
              onChange={v => set('avoidFlavors', v)}
              placeholder="e.g. bitter, anise, overly sweet"
            />
          </BriefField>

          <BriefField label="Luxury level">
            <PillToggle
              options={LUXURY_OPTIONS}
              selected={form.luxuryLevel}
              onChange={v => set('luxuryLevel', v)}
              multiSelect={false}
            />
          </BriefField>
        </div>

        <BriefField label="Cocktail preferences" hint="Optional">
          <BriefText
            value={form.cocktailPreferences}
            onChange={v => set('cocktailPreferences', v)}
            placeholder="e.g. include a champagne cocktail, avoid shots, focus on approachable classics"
            multiline
          />
        </BriefField>

        <BriefField label="Signature moment" hint="A key moment this programme should serve">
          <BriefText
            value={form.signatureMoment}
            onChange={v => set('signatureMoment', v)}
            placeholder="e.g. champagne toast at golden hour, arrival welcome under the pergola"
          />
        </BriefField>

        <BriefField label="Welcome cocktail direction" hint="Optional">
          <BriefText
            value={form.welcomeDirection}
            onChange={v => set('welcomeDirection', v)}
            placeholder="e.g. light and refreshing, garden-inspired, something memorable"
          />
        </BriefField>

        <BriefField label="Zero-proof expectations" hint="Optional">
          <BriefText
            value={form.zeroproofNotes}
            onChange={v => set('zeroproofNotes', v)}
            placeholder="e.g. full alternatives for all cocktails, 2–3 dedicated NA options"
          />
        </BriefField>

        {/* CTA */}
        <div style={{ paddingTop: 4 }}>
          <div style={{ height: 1, background: 'rgba(201,169,110,0.09)', marginBottom: 24 }} />
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 15, fontWeight: 600, color: T.textPri,
                margin: '0 0 4px', letterSpacing: '0.01em',
              }}>
                Generate Cocktail Programme
              </p>
              <p style={{ fontSize: 11, color: T.textTer, margin: 0 }}>
                Sends this vision to OMER F&B Director for programme creation.
              </p>
            </div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              style={{
                padding: '12px 30px',
                background: generating ? 'transparent' : T.gold,
                border: generating ? `1px solid ${T.goldBorder}` : 'none',
                borderRadius: 4,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
                color: generating ? T.gold : '#0D0D0D',
                cursor: generating ? 'default' : 'pointer',
                transition: 'background 150ms ease',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {generating ? 'Building…' : hasDraft ? 'Regenerate Programme' : 'Generate Cocktail Programme'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function ProgrammeApprovedBar({ menuName, cocktailCount, event }) {
  return (
    <div style={{
      padding: '18px 24px',
      background: 'rgba(201,169,110,0.03)',
      border: `1px solid ${T.goldBorder}`,
      borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div>
        <p style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(201,169,110,0.45)', margin: '0 0 6px',
        }}>
          {PROGRAMME_LABELS[event.event_type] || 'Cocktail Programme'}
        </p>
        {menuName && (
          <p style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 19, fontWeight: 600, color: T.textPri,
            letterSpacing: '0.01em', margin: 0, lineHeight: 1.2,
          }}>
            {menuName}
          </p>
        )}
        {cocktailCount > 0 && (
          <p style={{ fontSize: 11, color: T.textTer, margin: '4px 0 0' }}>
            {cocktailCount} cocktails
          </p>
        )}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 100,
        background: 'rgba(107,175,128,0.10)',
        border: '1px solid rgba(107,175,128,0.18)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, color: '#6BAF80' }}>✓</span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#6BAF80',
        }}>
          Approved
        </span>
      </div>
    </div>
  )
}

function ProgrammeCocktailCard({ cocktail, index }) {
  const isZeroProof = cocktail.zero_proof_alternative && cocktail.zero_proof_alternative !== 'null'
  return (
    <div style={{
      padding: '24px',
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'border-color 200ms ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorder}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    >
      {/* Image placeholder */}
      <div style={{
        height: 150, background: '#080808',
        border: '1px dashed #1A1A1A', borderRadius: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.20em',
          textTransform: 'uppercase', color: '#181818',
        }}>
          Visual · Coming
        </span>
      </div>

      <p style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: T.borderEm, margin: 0,
      }}>
        {String(index + 1).padStart(2, '0')}
      </p>

      <p style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 22, fontWeight: 600, color: T.textPri,
        margin: 0, lineHeight: 1.15, letterSpacing: '0.01em',
      }}>
        {cocktail.name}
      </p>

      {cocktail.tagline && (
        <p style={{
          fontSize: 12, color: T.textSec, fontStyle: 'italic',
          margin: 0, lineHeight: 1.65,
        }}>
          {cocktail.tagline}
        </p>
      )}

      {cocktail.flavor_notes && (
        <p style={{ fontSize: 11, color: T.textTer, margin: 0, lineHeight: 1.5 }}>
          {cocktail.flavor_notes}
        </p>
      )}

      {isZeroProof && (
        <span style={{
          alignSelf: 'flex-start',
          fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#6BA0CF', background: 'rgba(42,92,139,0.10)',
          border: '1px solid rgba(42,92,139,0.20)',
          borderRadius: 100, padding: '3px 10px',
        }}>
          Zero-proof available
        </span>
      )}
    </div>
  )
}

function ProgrammeView({ menuInfo, event, brief, designContext, onMenuStatusChange, savedBrief, onSaveBrief, onBriefUpdated }) {
  const [form, setForm] = useState(() => {
    const base = initProgrammeForm(event, brief)
    return savedBrief ? { ...base, ...savedBrief } : base
  })
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saved' | 'error' | null
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const briefLoadedRef = useRef(!!savedBrief)

  // Wrapped setter — any user edit marks the form as changed
  function handleFormChange(updater) {
    setForm(updater)
    setHasChanges(true)
  }

  // Populate form when savedBrief arrives asynchronously (after the GET resolves)
  useEffect(() => {
    if (savedBrief && !briefLoadedRef.current) {
      briefLoadedRef.current = true
      setForm(prev => ({ ...prev, ...savedBrief }))
      setHasChanges(false)
    }
  }, [savedBrief])

  const { menuDNA } = useMemo(
    () => buildEventMenuDNA({ event, brief, designContext }),
    [event, brief, designContext]
  )

  const displayCocktails = menuInfo.status === 'approved' ? menuInfo.cocktails : null
  const hasApproved = menuInfo.status === 'approved'
  const hasCocktails = displayCocktails && displayCocktails.length > 0
  const hasDraft = menuInfo.status === 'draft' || menuInfo.status === 'approved'

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setSaveStatus(null)

    const generationForm = {
      cocktailCount: defaultCocktailCount(event?.expected_guests),
      flavors: form.flavorPreferences.length > 0 ? form.flavorPreferences : ['Citrus'],
      restrictions: form.zeroproofNotes ? ['Alcohol-Free Option'] : [],
      vibe: [form.atmosphere, form.styleDirection, form.luxuryLevel].filter(Boolean).join(', '),
      notes: [
        form.guestProfile        && `Guests: ${form.guestProfile}`,
        form.cocktailPreferences,
        form.signatureMoment     && `Signature moment: ${form.signatureMoment}`,
        form.welcomeDirection    && `Welcome drink: ${form.welcomeDirection}`,
        form.avoidFlavors        && `Avoid: ${form.avoidFlavors}`,
        form.zeroproofNotes      && `Zero-proof: ${form.zeroproofNotes}`,
      ].filter(Boolean).join('. '),
    }

    try {
      const { menu: generatedMenu } = await generateEventMenu({
        event, form: generationForm, designContext, menuDNA,
      })

      const saved = await apiPost(`/api/events/${event.id}/cocktail-menu`, {
        menu_name: generatedMenu.menu_name,
        cocktails: generatedMenu.cocktails,
        programme_brief: form,
      })
      // Brief is now server-persisted — update parent state and clear local cache
      onBriefUpdated?.(form)
      try { localStorage.removeItem(`hestia.programme_brief.${event.id}`) } catch {}
      briefLoadedRef.current = true
      setHasChanges(false)
      onMenuStatusChange?.({
        status: 'draft',
        menuName: saved.menu.menu_name || null,
        cocktails: null,
      })
    } catch (err) {
      setError(err.message || 'AI generation unavailable. No menu was created. Try again, or check back shortly.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveBrief() {
    setSaving(true)
    setSaveStatus(null)
    try {
      if (hasDraft && onSaveBrief) {
        // Menu row exists — persist to backend via PATCH
        await onSaveBrief(form)
      } else {
        // No menu row yet — persist locally until first generate
        try { localStorage.setItem(`hestia.programme_brief.${event.id}`, JSON.stringify(form)) } catch {}
        onBriefUpdated?.(form)
      }
      briefLoadedRef.current = true
      setHasChanges(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2500)
    } catch (err) {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ProgrammeHero event={event} />

      {generating && (
        <div style={{
          padding: '40px 28px', textAlign: 'center',
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: T.gold,
          }} />
          <p style={{ fontSize: 13, color: T.textSec, margin: 0, lineHeight: 1.7 }}>
            OMER F&B Director is building your cocktail programme…
          </p>
          <p style={{ fontSize: 10, color: T.textTer, margin: 0 }}>
            Usually 15–20 seconds
          </p>
        </div>
      )}

      {error && !generating && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(139,58,58,0.08)',
          border: '1px solid rgba(139,58,58,0.20)',
          borderRadius: 6, fontSize: 12, color: '#C07070', lineHeight: 1.6,
        }}>
          {error}
        </div>
      )}

      {hasApproved && !generating && (
        <ProgrammeApprovedBar
          menuName={menuInfo.menuName}
          cocktailCount={menuInfo.cocktails?.length || 0}
          event={event}
        />
      )}

      {hasCocktails && !generating && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
        }}>
          {displayCocktails.map((c, i) => (
            <ProgrammeCocktailCard key={c.id || i} cocktail={c} index={i} />
          ))}
        </div>
      )}

      <ProgrammeBriefForm
        form={form}
        setForm={handleFormChange}
        onGenerate={handleGenerate}
        onSave={handleSaveBrief}
        generating={generating}
        saving={saving}
        saveStatus={saveStatus}
        hasChanges={hasChanges}
        hasDraft={hasDraft}
        event={event}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATIVE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function CreativeHero({ event, heroUrl, onGenerate, generating }) {
  const typeLabel = EVENT_TYPE_LABELS[event.event_type] || 'Event'
  const dateLabel = formatDate(event.event_date)
  const guestLabel = event.expected_guests > 0 ? `${event.expected_guests} guests` : null

  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.goldBorder}`,
      borderRadius: 8, overflow: 'hidden', position: 'relative',
    }}>
      {/* Ambient */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.07) 0%, transparent 50%)',
      }} />

      {/* Cinematic image zone */}
      <div style={{
        position: 'relative', height: 280, background: '#070707',
        borderBottom: 'rgba(201,169,110,0.07) 1px solid',
        overflow: 'hidden',
      }}>
        <p style={{
          position: 'absolute', top: 20, left: 28, zIndex: 2,
          fontSize: 8, fontWeight: 700, letterSpacing: '0.26em',
          textTransform: 'uppercase', color: 'rgba(201,169,110,0.35)', margin: 0,
        }}>
          HESTIA · Event Creative
        </p>

        {heroUrl ? (
          <>
            <img
              src={heroUrl}
              alt={event.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                filter: 'brightness(0.88) contrast(1.05)',
              }}
            />
            {/* Regenerate button overlay */}
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              style={{
                position: 'absolute', bottom: 16, right: 20, zIndex: 2,
                padding: '5px 14px', background: 'rgba(0,0,0,0.72)',
                border: `1px solid rgba(201,169,110,0.20)`, borderRadius: 100,
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(201,169,110,0.55)', cursor: generating ? 'default' : 'pointer',
                opacity: generating ? 0.4 : 1,
              }}
            >
              {generating ? 'Regenerating…' : '↺ Regenerate'}
            </button>
          </>
        ) : generating ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
            <GeneratingPulse />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.35)', margin: 0 }}>
              Generating event imagery…
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2A2A2A', margin: 0 }}>
              Event imagery not yet generated
            </p>
            {onGenerate && (
              <button
                type="button"
                onClick={onGenerate}
                style={{
                  padding: '9px 22px', background: 'transparent',
                  border: `1px solid rgba(201,169,110,0.28)`, borderRadius: 100,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: T.gold, cursor: 'pointer',
                }}
              >
                Generate Event Imagery
              </button>
            )}
          </div>
        )}
      </div>

      {/* Text content */}
      <div style={{ padding: '44px 44px 48px', position: 'relative' }}>
        <p style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(201,169,110,0.38)', margin: '0 0 16px',
        }}>
          {typeLabel}
        </p>
        <h1 style={{
          fontFamily: '"Fraunces", "Georgia", serif',
          fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 600,
          color: T.textPri, margin: 0, lineHeight: 1.0, letterSpacing: '-0.015em',
        }}>
          {event.name}
        </h1>

        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {dateLabel && (
            <span style={{ fontSize: 12, color: T.textTer, letterSpacing: '0.04em' }}>{dateLabel}</span>
          )}
          {event.location && (
            <>
              <span style={{ fontSize: 10, color: '#2A2A2A' }}>·</span>
              <span style={{ fontSize: 12, color: T.textTer, fontStyle: 'italic' }}>{event.location}</span>
            </>
          )}
          {guestLabel && (
            <>
              <span style={{ fontSize: 10, color: '#2A2A2A' }}>·</span>
              <span style={{ fontSize: 12, color: T.textTer }}>{guestLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function GeneratingPulse() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'rgba(201,169,110,0.40)',
            animation: `pulse 1.4s ease-in-out ${i * 0.22}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )
}

function CreativeStorySection({ sections }) {
  const hasContent = sections.narrative || sections.moodKeywords?.length > 0 || sections.creativePhilosophy?.philosophy
  if (!hasContent) return null

  return (
    <div style={{
      padding: '44px 44px',
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
    }}>
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: T.textTer, margin: '0 0 32px',
      }}>
        Event Story
      </p>

      {sections.narrative && (
        <p style={{
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
          fontWeight: 500, fontStyle: 'italic',
          color: '#E8DCC0', lineHeight: 1.85, letterSpacing: '0.01em',
          margin: '0 0 28px', maxWidth: 680,
          paddingLeft: 20, borderLeft: `2px solid ${T.goldBorder}`,
        }}>
          {sections.narrative}
        </p>
      )}

      {sections.creativePhilosophy?.philosophy && (
        <p style={{
          fontSize: 13, color: T.textSec, lineHeight: 1.8,
          margin: '0 0 28px', maxWidth: 600,
        }}>
          {sections.creativePhilosophy.philosophy}
        </p>
      )}

      {sections.moodKeywords?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {sections.moodKeywords.map((kw, i) => (
            <span key={i} style={{
              padding: '5px 14px', borderRadius: 100, fontSize: 11,
              fontWeight: i === 0 ? 600 : 400, letterSpacing: '0.04em',
              background: i === 0 ? 'rgba(201,169,110,0.10)' : 'rgba(255,255,255,0.02)',
              border: i === 0 ? `1px solid rgba(201,169,110,0.28)` : `1px solid ${T.border}`,
              color: i === 0 ? T.gold : T.textSec,
            }}>
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ColorSwatch({ color, wide }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        height: wide ? 88 : 70,
        background: color.hex,
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.03)',
      }} />
      <div>
        <p style={{
          fontSize: 11, fontWeight: 600, color: T.textPri,
          margin: '0 0 2px', letterSpacing: '0.02em',
        }}>
          {color.name}
        </p>
        <p style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9, color: T.textTer, margin: 0, letterSpacing: '0.04em',
        }}>
          {color.hex}
        </p>
      </div>
    </div>
  )
}

function CreativeVisualIdentity({ sections }) {
  const palette = sections.colorPalette || []
  if (!palette.length) return null

  return (
    <div style={{
      padding: '44px 44px',
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
    }}>
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: T.textTer, margin: '0 0 8px',
      }}>
        Visual Identity
      </p>
      <p style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 22, fontWeight: 600, color: T.textPri,
        margin: '0 0 36px', letterSpacing: '0.01em',
      }}>
        Colour Palette
      </p>

      {/* Full-width stripe */}
      <div style={{ display: 'flex', height: 10, borderRadius: 4, overflow: 'hidden', marginBottom: 36 }}>
        {palette.map((c, i) => (
          <div key={i} style={{ flex: i === 0 ? 2 : 1, background: c.hex }} />
        ))}
      </div>

      {/* Swatches */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 18, marginBottom: 36,
      }}>
        {palette.map((c, i) => (
          <ColorSwatch key={i} color={c} wide={i === 0} />
        ))}
      </div>

      {/* Typography direction */}
      {sections.typographyDirection && (
        <div style={{ paddingTop: 28, borderTop: `1px solid ${T.border}` }}>
          <p style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase',
            color: T.textTer, margin: '0 0 10px',
          }}>
            Typography Direction
          </p>
          <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.8, margin: 0, maxWidth: 560 }}>
            {sections.typographyDirection}
          </p>
        </div>
      )}
    </div>
  )
}

function CreativeCocktailCard({ cocktail, index, isLast, imageUrl, generating }) {
  const isZeroProof = cocktail.zero_proof_alternative && cocktail.zero_proof_alternative !== 'null'
  const cId = (cocktail.id || cocktail.name || '').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().slice(0, 40)

  return (
    <div style={{
      paddingTop: 40, paddingBottom: 40,
      borderBottom: isLast ? 'none' : '1px solid #151515',
    }}>
      {/* Image zone */}
      <div style={{
        height: 200, marginBottom: 24,
        background: '#080808', borderRadius: 6, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: imageUrl ? 'none' : '1px dashed #181818',
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={cocktail.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.92) contrast(1.04)' }}
          />
        ) : generating ? (
          <GeneratingPulse />
        ) : (
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#1C1C1C',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <p style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: '#2A2A2A', margin: '0 0 12px',
      }}>
        {String(index + 1).padStart(2, '0')}
      </p>

      <p style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 600, color: T.textPri,
        margin: 0, lineHeight: 1.1, letterSpacing: '0.005em',
      }}>
        {cocktail.name}
      </p>

      {cocktail.tagline && (
        <p style={{
          fontSize: 13, color: T.textSec, fontStyle: 'italic',
          margin: '10px 0 0', lineHeight: 1.65, maxWidth: 500,
        }}>
          {cocktail.tagline}
        </p>
      )}

      {cocktail.flavor_notes && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 16 }}>
          <span style={{
            fontSize: 9, color: T.goldMuted, letterSpacing: '0.07em', textTransform: 'uppercase',
            background: 'rgba(201,169,110,0.06)', border: `1px solid rgba(201,169,110,0.14)`,
            borderRadius: 100, padding: '4px 12px',
          }}>
            {cocktail.flavor_notes}
          </span>
          {isZeroProof && (
            <span style={{
              fontSize: 9, color: '#6BA0CF', letterSpacing: '0.06em', textTransform: 'uppercase',
              background: 'rgba(42,92,139,0.08)', border: '1px solid rgba(42,92,139,0.16)',
              borderRadius: 100, padding: '4px 12px',
            }}>
              Zero-proof available
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function CreativeCocktailCollection({ cocktails, menuName, cocktailImages, generating }) {
  if (!cocktails?.length) {
    return (
      <div style={{
        padding: '56px 44px', textAlign: 'center',
        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
      }}>
        <p style={{
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 20, fontWeight: 500, fontStyle: 'italic',
          color: '#2A2A2A', margin: '0 0 8px',
        }}>
          The cocktail collection awaits.
        </p>
        <p style={{ fontSize: 11, color: '#222', margin: 0 }}>
          Build and approve a programme in the Production tab.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      padding: '44px 44px',
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
    }}>
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: T.textTer, margin: '0 0 8px',
      }}>
        Cocktail Collection
      </p>
      {menuName && (
        <p style={{
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 22, fontWeight: 600, color: T.textPri,
          margin: 0, letterSpacing: '0.01em', lineHeight: 1.15,
        }}>
          {menuName}
        </p>
      )}
      <div style={{ height: 1, background: 'rgba(201,169,110,0.07)', margin: '28px 0 0' }} />
      {cocktails.map((c, i) => {
        const cId = (c.id || c.name || '').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().slice(0, 40)
        const imageUrl = cocktailImages?.[cId]?.url
        return (
          <CreativeCocktailCard
            key={c.id || i}
            cocktail={c}
            index={i}
            isLast={i === cocktails.length - 1}
            imageUrl={imageUrl}
            generating={generating && !imageUrl}
          />
        )
      })}
    </div>
  )
}

const DELIVERABLES = [
  { id: 'cocktail_menu',   label: 'Cocktail Menu',     desc: 'Print-ready PDF cocktail menu for the event.' },
  { id: 'welcome_sign',    label: 'Welcome Sign',       desc: 'Branded welcome signage for the arrival experience.' },
  { id: 'instagram_story', label: 'Instagram Story',    desc: 'Branded story asset featuring the cocktail menu.' },
  { id: 'instagram_post',  label: 'Instagram Post',     desc: 'Square post showcasing the event cocktail concept.' },
  { id: 'brand_sheet',     label: 'Event Brand Sheet',  desc: 'Visual identity summary: palette, typography, DNA.' },
  { id: 'table_cards',     label: 'Table Menu Cards',   desc: 'Individual table cocktail cards for guest placement.' },
]

function EventDeliverables() {
  return (
    <div style={{
      padding: '44px 44px',
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
    }}>
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: T.textTer, margin: '0 0 8px',
      }}>
        Event Deliverables
      </p>
      <p style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 18, fontWeight: 500, fontStyle: 'italic', color: T.textSec,
        margin: '0 0 32px', lineHeight: 1.5,
      }}>
        Creative outputs generated from the approved programme.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {DELIVERABLES.map(d => (
          <div key={d.id} style={{
            padding: '18px 20px', background: T.bg,
            border: `1px solid ${T.border}`, borderRadius: 7, opacity: 0.55,
          }}>
            <p style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 13, fontWeight: 600, color: T.textPri,
              margin: '0 0 6px', letterSpacing: '0.01em',
            }}>
              {d.label}
            </p>
            <p style={{ fontSize: 11, color: T.textTer, margin: '0 0 14px', lineHeight: 1.55 }}>
              {d.desc}
            </p>
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.textTer, border: `1px solid ${T.border}`,
              borderRadius: 100, padding: '2px 9px',
            }}>
              In Preparation
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const EXPORT_ACTIONS = [
  'Generate Final Cocktail Menu',
  'Generate Welcome Sign',
  'Generate Instagram Story',
  'Generate Brand Sheet',
  'Generate Creative Package',
]

function ExportZone() {
  return (
    <div style={{
      padding: '44px 44px',
      background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
    }}>
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: T.textTer, margin: '0 0 8px',
      }}>
        Export
      </p>
      <p style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 18, fontWeight: 500, fontStyle: 'italic', color: T.textSec,
        margin: '0 0 28px', lineHeight: 1.5,
      }}>
        Generate and export the complete event creative package.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {EXPORT_ACTIONS.map(label => (
          <button
            key={label}
            type="button"
            disabled
            style={{
              padding: '12px 20px', background: 'transparent',
              border: `1px solid ${T.border}`, borderRadius: 4,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
              color: T.textTer, cursor: 'default', textAlign: 'left', opacity: 0.45,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 10, color: '#252525', margin: '18px 0 0', fontStyle: 'italic' }}>
        Export features are coming in a future release.
      </p>
    </div>
  )
}

function CreativeClosing({ event }) {
  const keywords = event.confirmed_mood_keywords || []
  return (
    <div style={{
      padding: '36px 44px', textAlign: 'center',
      background: T.surface, border: `1px solid #161616`, borderRadius: 8,
    }}>
      <div style={{ height: 1, background: 'rgba(201,169,110,0.06)', marginBottom: 28 }} />
      <p style={{
        fontFamily: '"Fraunces", serif',
        fontSize: '0.9rem', fontWeight: 600, color: '#252525',
        margin: 0, letterSpacing: '0.06em',
      }}>
        {event.name}
      </p>
      {keywords.length > 0 && (
        <p style={{
          fontSize: 8, color: '#1C1C1C', letterSpacing: '0.14em',
          margin: '10px 0 0', textTransform: 'uppercase',
        }}>
          {keywords.slice(0, 5).join(' · ')}
        </p>
      )}
      <div style={{ height: 1, background: 'rgba(201,169,110,0.06)', marginTop: 28 }} />
    </div>
  )
}

function CreativeView({ event, brief, menuInfo }) {
  const [imgState, setImgState] = useState({ hero: null, cocktails: {}, loading: false, initialized: false })

  const designBrief = useMemo(
    () => buildEventDesignBrief({ event, brief, menuName: menuInfo.menuName }),
    [event, brief, menuInfo.menuName]
  )

  useEffect(() => {
    fetchCreativeImages(event.id)
      .then(data => setImgState({ hero: data.hero || null, cocktails: data.cocktails || {}, loading: false, initialized: true }))
      .catch(() => setImgState({ hero: null, cocktails: {}, loading: false, initialized: true }))
  }, [event.id])

  function handleGenerate() {
    if (imgState.loading) return
    setImgState(prev => ({ ...prev, loading: true }))
    const sections = designBrief?.sections || {}
    generateCreativeImages(event.id, {
      event,
      sections,
      cocktails: menuInfo.cocktails || [],
    })
      .then(data => setImgState({ hero: data.hero || null, cocktails: data.cocktails || {}, loading: false, initialized: true }))
      .catch(() => setImgState(prev => ({ ...prev, loading: false })))
  }

  if (!designBrief) return null
  const { sections } = designBrief

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CreativeHero
        event={event}
        heroUrl={imgState.hero?.url}
        onGenerate={handleGenerate}
        generating={imgState.loading}
      />
      <CreativeStorySection sections={sections} />
      <CreativeVisualIdentity sections={sections} />
      <CreativeCocktailCollection
        cocktails={menuInfo.cocktails}
        menuName={menuInfo.menuName}
        cocktailImages={imgState.cocktails}
        generating={imgState.loading}
      />
      <EventDeliverables />
      <ExportZone />
      <CreativeClosing event={event} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function EventCocktailMenu({
  event,
  guests,
  tables,
  tasks,
  timeline,
  currentUser,
  onUpdateTask,
  refreshDetail,
  onMenuStatusChange,
}) {
  const [activeTab, setActiveTab] = useState('programme')
  const [menuInfo, setMenuInfo] = useState({ status: null, menuName: null, cocktails: null })
  const [savedBrief, setSavedBrief] = useState(null)

  // Load menu status and saved programme brief on mount
  useEffect(() => {
    function loadLocalBrief() {
      try {
        const raw = localStorage.getItem(`hestia.programme_brief.${event.id}`)
        if (raw) setSavedBrief(JSON.parse(raw))
      } catch {}
    }

    fetchCocktailMenu(event.id)
      .then(data => {
        if (data.menu) {
          const isApproved = data.menu.status === 'approved'
          const info = {
            status:    isApproved ? 'approved' : 'draft',
            menuName:  data.menu.menu_name || null,
            cocktails: isApproved ? data.menu.cocktails || [] : null,
          }
          setMenuInfo(info)
          if (data.menu.programme_brief) {
            setSavedBrief(data.menu.programme_brief)
          } else {
            loadLocalBrief()
          }
          onMenuStatusChange?.(info)
        } else {
          loadLocalBrief()
          const info = { status: 'none', menuName: null, cocktails: null }
          setMenuInfo(info)
          onMenuStatusChange?.(info)
        }
      })
      .catch(() => {
        loadLocalBrief()
        const info = { status: 'none', menuName: null, cocktails: null }
        setMenuInfo(info)
        onMenuStatusChange?.(info)
      })
  }, [event.id])

  function handleMenuStatusChange(info) {
    setMenuInfo(info)
    onMenuStatusChange?.(info)
  }

  async function handleSaveBrief(brief) {
    await saveProgrammeBrief(event.id, brief)
    setSavedBrief(brief)
  }

  const brief = useMemo(
    () => buildZoharBrief({
      event,
      guests:   guests   ?? [],
      tables:   tables   ?? [],
      tasks:    tasks    ?? [],
      timeline: timeline ?? [],
    }),
    [event, guests, tables, tasks, timeline]
  )

  const designContext = useMemo(
    () => buildDesignContext({ event, brief }),
    [event, brief]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Sub-tab bar */}
      <div style={{
        display: 'flex', background: '#0A0A0A',
        border: `1px solid ${T.border}`, borderRadius: 8, padding: 3, gap: 2,
      }}>
        {SUB_TABS.map(({ id, label, icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1, padding: '9px 12px',
                background: isActive ? '#161616' : 'transparent',
                border: isActive ? `1px solid ${T.border}` : '1px solid transparent',
                borderRadius: 5, cursor: 'pointer',
                color: isActive ? T.textPri : T.textTer,
                fontSize: '0.72rem', fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.04em', transition: 'color 150ms ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {label}
              {icon && (
                <span style={{
                  fontSize: 7, lineHeight: 1,
                  color: isActive ? 'rgba(201,169,110,0.70)' : '#3A3A3A',
                }}>
                  {icon}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Programme */}
      {activeTab === 'programme' && (
        <ProgrammeView
          menuInfo={menuInfo}
          event={event}
          brief={brief}
          designContext={designContext}
          onMenuStatusChange={handleMenuStatusChange}
          savedBrief={savedBrief}
          onSaveBrief={handleSaveBrief}
          onBriefUpdated={setSavedBrief}
        />
      )}

      {/* Production */}
      {activeTab === 'production' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{
            padding: '12px 20px',
            background: T.bg, border: `1px solid ${T.border}`,
            borderRadius: '8px 8px 0 0', borderBottom: 'none',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.textTer, flexShrink: 0 }} />
            <p style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase',
              color: T.textTer, margin: 0,
            }}>
              Backstage · Production
            </p>
          </div>
          <div style={{ borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            <EventBriefMenuGenerator
              event={event}
              brief={brief}
              designContext={designContext}
              tasks={tasks}
              currentUser={currentUser}
              onUpdateTask={onUpdateTask}
              onApproved={() => refreshDetail?.()}
              onMenuStatusChange={handleMenuStatusChange}
            />
          </div>
        </div>
      )}

      {/* Creative */}
      {activeTab === 'creative' && (
        <CreativeView
          event={event}
          brief={brief}
          menuInfo={menuInfo}
        />
      )}

    </div>
  )
}
