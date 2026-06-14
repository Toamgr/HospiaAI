/**
 * ZoharCreativePreview — Guest-facing event menu concept preview.
 *
 * The visual bridge between ZOHAR's design intelligence and future Creative Studio output.
 * Renders an editorial, guest-facing interpretation of the approved cocktail programme
 * using real event data, palette, brief narrative, and cocktail names/descriptions.
 *
 * OMER separation: shows zero operational data.
 * No ml quantities, no batch instructions, no prep steps, no staffing, no cost data.
 * Only: name · poetic description · flavor/mood tags · zero-proof marker.
 */

import React, { useMemo } from 'react'

// ── Roman numerals ─────────────────────────────────────────────────────────────

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
function toRoman(n) { return ROMAN[n] ?? String(n + 1) }

// ── Color intelligence ─────────────────────────────────────────────────────────

function hexToHsl(hex) {
  if (!hex || hex.length < 7) return [0, 0, 50]
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function extractPalette(brief) {
  return brief?.sections?.colorPalette || []
}

// Finds the most visually prominent warm accent color (gold / amber / copper range)
function getPrimaryPaletteColor(palette) {
  if (!palette || palette.length === 0) return '#C9A96E'
  for (const color of palette) {
    if (!color.hex || !color.hex.startsWith('#')) continue
    try {
      const [h, s, l] = hexToHsl(color.hex)
      // Hue 20–62: gold/amber/copper. Saturation > 28. Lightness 30–76.
      if (h >= 20 && h <= 62 && s >= 28 && l >= 30 && l <= 76) return color.hex
    } catch { /* continue */ }
  }
  // Fallback: 5th entry (often the "Gold" or "Copper" slot), then 4th, then default
  return palette[4]?.hex || palette[3]?.hex || '#C9A96E'
}

// ── Event / brief data accessors ───────────────────────────────────────────────

const EVENT_TYPE_LABELS = {
  wedding:        'Wedding',
  luxury_wedding: 'Luxury Wedding',
  corporate:      'Corporate Event',
  executive_event:'Executive Event',
  brand_launch:   'Brand Launch',
  charity_gala:   'Charity Gala',
  private:        'Private Celebration',
  vip_event:      'VIP Event',
  private_dinner: 'Private Dinner',
  desert_event:   'Outdoor Celebration',
  resort_event:   'Resort Event',
  hotel_event:    'Hotel Event',
  bar_event:      'Cocktail Bar Event',
  wine_event:     'Wine Evening',
  cocktail_event: 'Cocktail Event',
  other:          'Special Event',
}

const PROGRAMME_LABELS = {
  wedding:        'Wedding Cocktail Programme',
  luxury_wedding: 'Cocktail Programme',
  corporate:      'Drinks Programme',
  executive_event:'Cocktail Programme',
  brand_launch:   'Bar Programme',
  charity_gala:   'Gala Cocktail Menu',
  private:        'Evening Cocktail Menu',
  vip_event:      'Exclusive Programme',
  private_dinner: 'Dinner Cocktail Menu',
  bar_event:      'Bar Programme',
  cocktail_event: 'Cocktail Programme',
  other:          'Event Cocktail Menu',
}

function formatEventDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  } catch { return null }
}

function getCocktails(approvedMenu) {
  return (approvedMenu?.cocktails || []).filter(c => c && c.name)
}

function getMoodKeywords(brief) {
  return brief?.sections?.moodKeywords?.slice(0, 5) || []
}

// Extracts a short cover statement from the brief narrative.
// Prefers the "north star" or feel sentence; falls back to the final sentence.
function extractCoverStatement(brief) {
  const narrative = brief?.sections?.narrative
  if (!narrative) return null
  const sentences = narrative.split('. ').filter(Boolean)
  // Prefer a sentence containing the north star or single_sentence
  const northStar = sentences.find(s => s.includes('north star') || s.includes('"'))
  if (northStar) {
    // Strip the "Creative north star:" prefix and quotes
    const cleaned = northStar.replace(/^.*north star[^"]*"?/, '').replace(/['"]/g, '').trim()
    if (cleaned.length > 10 && cleaned.length < 160) return cleaned
  }
  // Prefer a "feel" sentence
  const feelSentence = sentences.find(s =>
    (s.includes('feel') || s.includes('character') || s.includes('defined by')) &&
    s.length > 20 && s.length < 200
  )
  if (feelSentence) return feelSentence.trim()
  // Last sentence often contains the most evocative direction
  const last = sentences[sentences.length - 1]
  if (last && last.length > 20 && last.length < 200) return last.trim()
  return null
}

// Selects the hospitality note for the editorial pull-quote.
// Uses the primary impact moment instruction if set, else the creative philosophy.
function getHospitalityNote(brief) {
  const hv = brief?.sections?.hospitalityVision
  if (hv?.primaryMoment && hv?.moments) {
    const primary = hv.moments.find(m => m.isPrimary)
    if (primary?.guestExperience && primary.guestExperience.length < 260) {
      return primary.guestExperience
    }
  }
  const cp = brief?.sections?.creativePhilosophy?.philosophy
  if (cp) {
    const sentences = cp.split('. ')
    const first = sentences[0]
    if (first && first.length > 20 && first.length < 220) return first + '.'
  }
  return null
}

// Parses flavor tags from a cocktail's flavor_notes string.
const FLAVOR_VOCAB = [
  'Citrus', 'Floral', 'Tropical', 'Herbal', 'Spicy', 'Smoky', 'Sweet',
  'Bitter', 'Fruity', 'Earthy', 'Fresh', 'Aromatic', 'Rich', 'Crisp',
  'Berry', 'Vanilla', 'Caramel', 'Coconut', 'Ginger', 'Mint',
  'Cucumber', 'Rose', 'Lavender', 'Yuzu', 'Lemon', 'Lime', 'Orange',
  'Stone Fruit', 'Passion Fruit', 'Dry', 'Oak', 'Warm', 'Cooling', 'Light',
]

function extractFlavorTags(flavorNotes) {
  if (!flavorNotes || typeof flavorNotes !== 'string') return []
  const lower = flavorNotes.toLowerCase()
  const found = []
  for (const word of FLAVOR_VOCAB) {
    if (lower.includes(word.toLowerCase()) && found.length < 4) {
      found.push(word)
    }
  }
  return found
}

// ── Style tokens ───────────────────────────────────────────────────────────────

const FONTS = {
  display: '"Cormorant Garamond", "Cormorant", Georgia, serif',
  ui:      '"DM Sans", "Inter", system-ui, sans-serif',
}

// ── Section: Editorial Cover ───────────────────────────────────────────────────

function CreativePreviewCover({ event, brief, menuDisplayName, palette, accentColor }) {
  const typeLabel     = EVENT_TYPE_LABELS[event?.event_type] || 'Special Event'
  const dateLabel     = formatEventDate(event?.event_date)
  const guestLabel    = (event?.expected_guests > 0) ? `${event.expected_guests} guests` : null
  const metaItems     = [typeLabel, dateLabel, guestLabel].filter(Boolean)
  const coverStatement = extractCoverStatement(brief)
  const moodKeywords  = getMoodKeywords(brief)

  return (
    <div style={{
      padding: '52px 44px 44px',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: `1px solid #181410`,
    }}>
      {/* Multi-point ambient palette wash */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: [
          `radial-gradient(ellipse 70% 60% at 4% 0%, ${accentColor}0A, transparent 60%)`,
          `radial-gradient(ellipse 50% 40% at 96% 100%, ${accentColor}05, transparent 55%)`,
        ].join(', '),
      }} />

      {/* Top eyebrow */}
      <p style={{
        fontFamily: FONTS.ui, fontSize: 7, fontWeight: 700, letterSpacing: '0.26em',
        textTransform: 'uppercase', color: `${accentColor}40`,
        margin: '0 0 22px', position: 'relative',
      }}>
        ZOHAR · Creative Preview
      </p>

      {/* Tapered gold rule */}
      <div aria-hidden="true" style={{
        height: 1, marginBottom: 36, position: 'relative',
        background: `linear-gradient(90deg, ${accentColor}35 0%, ${accentColor}10 40%, transparent 70%)`,
      }} />

      {/* Programme name — warm gold caps */}
      <p style={{
        fontFamily: FONTS.ui, fontSize: 8, fontWeight: 700, letterSpacing: '0.30em',
        textTransform: 'uppercase', color: accentColor, opacity: 0.82,
        margin: '0 0 14px', position: 'relative',
      }}>
        {menuDisplayName}
      </p>

      {/* Event name — large editorial display serif */}
      <h2 style={{
        fontFamily: FONTS.display,
        fontSize: 'clamp(30px, 4.5vw, 50px)',
        fontWeight: 600,
        color: '#F5F0E8',
        letterSpacing: '0.012em',
        lineHeight: 1.08,
        margin: '0 0 22px',
        position: 'relative',
      }}>
        {event?.name || 'This Event'}
      </h2>

      {/* Metadata row */}
      {metaItems.length > 0 && (
        <p style={{
          fontFamily: FONTS.ui, fontSize: 11, color: '#4A4540',
          letterSpacing: '0.06em', lineHeight: 1.5,
          margin: '0 0 28px', position: 'relative',
        }}>
          {metaItems.join(' · ')}
        </p>
      )}

      {/* Hospitality cover statement */}
      {coverStatement && (
        <p style={{
          fontFamily: FONTS.display, fontSize: 15, fontStyle: 'italic', fontWeight: 400,
          color: `${accentColor}60`,
          lineHeight: 1.7, margin: '0 0 28px', position: 'relative',
          maxWidth: 520,
        }}>
          {coverStatement}
        </p>
      )}

      {/* Mood keywords — horizontal pill strip */}
      {moodKeywords.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, position: 'relative',
        }}>
          {moodKeywords.map((kw, i) => (
            <span key={i} style={{
              fontFamily: FONTS.ui, fontSize: 8, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: i === 0 ? accentColor : '#3A3530',
              padding: '4px 12px',
              background: i === 0 ? `${accentColor}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${i === 0 ? `${accentColor}28` : '#222018'}`,
              borderRadius: 100,
            }}>
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section: Palette Strip ─────────────────────────────────────────────────────

function CreativePreviewPalette({ palette }) {
  if (!palette || palette.length === 0) return null

  return (
    <div style={{ borderBottom: '1px solid #181410' }}>

      {/* Full-width color architecture — no gaps, proportional widths */}
      <div style={{ display: 'flex', height: 44 }}>
        {palette.map((color, i) => (
          <div
            key={i}
            title={`${color.name} · ${color.hex}`}
            style={{
              flex: i === 0 ? '2.2 1 0' : i === 1 ? '1.4 1 0' : '1 1 0',
              background: color.hex,
              minWidth: 18,
              transition: 'flex 200ms ease',
            }}
          />
        ))}
      </div>

      {/* Color name labels */}
      <div style={{
        display: 'flex', padding: '10px 44px 18px',
        background: 'transparent',
      }}>
        {palette.map((color, i) => (
          <div key={i} style={{
            flex: i === 0 ? '2.2 1 0' : i === 1 ? '1.4 1 0' : '1 1 0',
            minWidth: 0,
          }}>
            <p style={{
              fontFamily: FONTS.ui, fontSize: 7, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#2A2520', margin: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {color.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Section: Single cocktail row ───────────────────────────────────────────────

function CreativePreviewMenuCard({ cocktail, index, accentColor, isLast }) {
  const tags = extractFlavorTags(cocktail.flavor_notes)
  const hasZeroProof = cocktail.zero_proof_alternative &&
    cocktail.zero_proof_alternative !== 'null' &&
    cocktail.zero_proof_alternative.trim().length > 0
  const description = cocktail.tagline || null

  return (
    <div style={{
      padding: '36px 44px',
      borderBottom: isLast ? 'none' : '1px solid #151210',
      position: 'relative',
    }}>
      {/* Subtle accent line — left edge, only on hover / always present but faint */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: 0, top: 20, bottom: 20, width: 2,
        background: `linear-gradient(180deg, transparent, ${accentColor}18, transparent)`,
        borderRadius: 1,
      }} />

      {/* Number + Name */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 0,
      }}>
        {/* Roman numeral */}
        <span style={{
          fontFamily: FONTS.display, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: `${accentColor}55`, flexShrink: 0, minWidth: 18,
          lineHeight: 1,
          position: 'relative', top: '-1px',
        }}>
          {toRoman(index)}.
        </span>

        {/* Cocktail name */}
        <h3 style={{
          fontFamily: FONTS.display,
          fontSize: 26, fontWeight: 600, letterSpacing: '0.008em',
          color: '#F2EDE4', margin: 0, lineHeight: 1.12, flex: 1,
        }}>
          {cocktail.name}
        </h3>
      </div>

      {/* Poetic description / tagline */}
      {description && (
        <p style={{
          fontFamily: FONTS.display,
          fontSize: 14, fontStyle: 'italic', fontWeight: 400,
          color: '#6A6258',
          lineHeight: 1.65, margin: '10px 0 0 38px',
        }}>
          {description}
        </p>
      )}

      {/* Tags */}
      {(tags.length > 0 || hasZeroProof) && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          marginTop: 16, marginLeft: 38,
        }}>
          {tags.map((tag, i) => (
            <span key={i} style={{
              fontFamily: FONTS.ui,
              padding: '3px 10px',
              background: `${accentColor}09`,
              border: `1px solid ${accentColor}1E`,
              borderRadius: 100,
              fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: `${accentColor}75`,
            }}>
              {tag}
            </span>
          ))}
          {hasZeroProof && (
            <span style={{
              fontFamily: FONTS.ui,
              padding: '3px 10px',
              background: 'rgba(74,124,89,0.07)',
              border: '1px solid rgba(74,124,89,0.18)',
              borderRadius: 100,
              fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(107,175,128,0.65)',
            }}>
              ○ Zero-proof
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Section: Programme divider (decorative rule with label) ────────────────────

function ProgrammeDivider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '28px 44px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: '#1A1612' }} />
      <p style={{
        fontFamily: FONTS.ui, fontSize: 7, fontWeight: 700,
        letterSpacing: '0.30em', textTransform: 'uppercase',
        color: '#2A2520', margin: 0, whiteSpace: 'nowrap',
      }}>
        {label}
      </p>
      <div style={{ flex: 1, height: 1, background: '#1A1612' }} />
    </div>
  )
}

// ── Section: Hospitality editorial note ───────────────────────────────────────

function CreativePreviewHospitalityNote({ brief, accentColor }) {
  const note = getHospitalityNote(brief)
  if (!note) return null

  const hv = brief?.sections?.hospitalityVision
  const primaryLabel = hv?.primaryMoment
    ? hv.moments?.find(m => m.isPrimary)?.label
    : null

  return (
    <div style={{
      padding: '40px 44px',
      borderTop: '1px solid #181410',
      background: 'rgba(0,0,0,0.18)',
    }}>
      <p style={{
        fontFamily: FONTS.ui, fontSize: 7, fontWeight: 700,
        letterSpacing: '0.24em', textTransform: 'uppercase',
        color: '#282420', margin: '0 0 20px',
      }}>
        {primaryLabel ? `${primaryLabel} · Hospitality Direction` : 'Hospitality Direction'}
      </p>

      <blockquote style={{
        margin: 0,
        paddingLeft: 20,
        borderLeft: `2px solid ${accentColor}28`,
      }}>
        <p style={{
          fontFamily: FONTS.display,
          fontSize: 16, fontStyle: 'italic', fontWeight: 400,
          color: '#5A5450',
          lineHeight: 1.72, margin: 0,
        }}>
          {note}
        </p>
      </blockquote>
    </div>
  )
}

// ── Section: Creative Studio footer ───────────────────────────────────────────

function CreativePreviewFooter({ accentColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 44px',
      borderTop: '1px solid #141210',
      flexWrap: 'wrap', gap: 8,
    }}>
      <span style={{
        fontFamily: FONTS.ui, fontSize: 7, fontWeight: 700,
        letterSpacing: '0.20em', textTransform: 'uppercase',
        color: `${accentColor}25`,
      }}>
        ZOHAR · HESTIA
      </span>
      <span style={{
        fontFamily: FONTS.ui, fontSize: 8, fontStyle: 'italic',
        color: '#252220', letterSpacing: '0.04em',
      }}>
        Preview only · Future Creative Studio output
      </span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ZoharCreativePreview({ brief, event, approvedMenu }) {
  const cocktails   = useMemo(() => getCocktails(approvedMenu), [approvedMenu])
  const palette     = useMemo(() => extractPalette(brief), [brief])
  const accentColor = useMemo(() => getPrimaryPaletteColor(palette), [palette])

  // Guard: requires both a design brief and at least one approved cocktail
  if (!brief || !approvedMenu || cocktails.length === 0) return null

  const menuDisplayName = approvedMenu.menu_name
    || PROGRAMME_LABELS[event?.event_type]
    || 'Cocktail Programme'

  return (
    <div style={{
      background: '#0C0A08',
      border: `1px solid ${accentColor}1E`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>

      {/* ── Cover ─────────────────────────────────────────────────────────── */}
      <CreativePreviewCover
        event={event}
        brief={brief}
        menuDisplayName={menuDisplayName}
        palette={palette}
        accentColor={accentColor}
      />

      {/* ── Palette Architecture ──────────────────────────────────────────── */}
      <CreativePreviewPalette palette={palette} />

      {/* ── Cocktail Programme ────────────────────────────────────────────── */}
      <ProgrammeDivider label="Cocktail Programme" />

      <div>
        {cocktails.map((cocktail, i) => (
          <CreativePreviewMenuCard
            key={i}
            cocktail={cocktail}
            index={i}
            accentColor={accentColor}
            isLast={i === cocktails.length - 1}
          />
        ))}
      </div>

      {/* ── Hospitality Note ──────────────────────────────────────────────── */}
      <CreativePreviewHospitalityNote brief={brief} accentColor={accentColor} />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <CreativePreviewFooter accentColor={accentColor} />

    </div>
  )
}
