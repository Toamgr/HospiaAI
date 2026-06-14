/**
 * ZoharDesignBrief — ZOHAR's Event Design Brief panel.
 *
 * Renders the structured design brief produced by zoharDesignBriefEngine v2.
 * Section order (luxury agency document):
 *   Narrative · Creative Philosophy · Hospitality Vision · Mood ·
 *   Color Palette · Typography · Photography · Visual DNA · Deliverables
 *
 * No AI calls. No image generation. No external APIs. Null-safe.
 */

import React, { useState, useMemo } from 'react'
import { buildEventDesignBrief } from '../utils/zoharDesignBriefEngine'

// ── Style tokens ───────────────────────────────────────────────────────────────

const S = {
  eyebrow: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(201,169,110,0.55)',
    margin: 0,
  },
  sectionEyebrow: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
    color: '#5A5550',
    margin: '0 0 10px',
  },
  card: {
    background: '#141414',
    border: '1px solid #2A2A2A',
    borderRadius: 8,
    padding: '20px 20px',
  },
  body: {
    fontSize: 12,
    color: '#9A9590',
    lineHeight: 1.7,
    margin: 0,
  },
}

function BriefSection({ label, children, accent }) {
  return (
    <div style={{
      ...S.card,
      ...(accent ? { borderColor: 'rgba(201,169,110,0.22)', background: 'rgba(201,169,110,0.02)' } : {}),
    }}>
      <p style={S.sectionEyebrow}>{label}</p>
      {children}
    </div>
  )
}

// ── Section A: Narrative ───────────────────────────────────────────────────────

function NarrativeSection({ narrative }) {
  return (
    <BriefSection label="Event Narrative">
      <p style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 16,
        fontWeight: 500,
        fontStyle: 'italic',
        color: '#E8DCC0',
        lineHeight: 1.65,
        letterSpacing: '0.01em',
        margin: 0,
        borderLeft: '2px solid rgba(201,169,110,0.30)',
        paddingLeft: 16,
      }}>
        {narrative}
      </p>
    </BriefSection>
  )
}

// ── Section B: Creative Philosophy ────────────────────────────────────────────

function CreativePhilosophySection({ creativePhilosophy }) {
  if (!creativePhilosophy) return null
  const { philosophy, notes } = creativePhilosophy

  return (
    <BriefSection label="Creative Philosophy" accent>
      <p style={{ ...S.body, fontSize: 13, color: '#B0A898', lineHeight: 1.75, marginBottom: notes.length > 0 ? 16 : 0 }}>
        {philosophy}
      </p>

      {notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map(({ label, text }) => (
            <div key={label} style={{
              padding: '11px 14px',
              background: '#0D0D0D',
              border: '1px solid #1E1E1E',
              borderRadius: 6,
            }}>
              <p style={{
                fontSize: 7,
                fontWeight: 700,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: 'rgba(201,169,110,0.40)',
                margin: '0 0 5px',
              }}>
                {label}
              </p>
              <p style={{
                fontSize: 12,
                color: '#C0B8A8',
                lineHeight: 1.65,
                fontStyle: 'italic',
                margin: 0,
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      )}
    </BriefSection>
  )
}

// ── Section C: Hospitality Vision ─────────────────────────────────────────────

function HospitalityVisionSection({ hospitalityVision }) {
  if (!hospitalityVision) return null
  const { moments, summary, primaryMoment } = hospitalityVision

  return (
    <BriefSection label="Hospitality Vision">
      {/* Summary statement */}
      <p style={{
        fontSize: 11,
        color: primaryMoment ? 'rgba(201,169,110,0.65)' : '#5A5550',
        lineHeight: 1.6,
        marginBottom: 16,
        fontStyle: primaryMoment ? 'italic' : 'normal',
      }}>
        {summary}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {moments.map(m => (
          <ImpactMomentRow key={m.key} moment={m} />
        ))}
      </div>
    </BriefSection>
  )
}

function ImpactMomentRow({ moment }) {
  const [expanded, setExpanded] = useState(moment.isPrimary)
  const { label, isPrimary, instruction, guestExperience, creativeDirection } = moment

  return (
    <div style={{
      background: isPrimary ? 'rgba(201,169,110,0.04)' : '#0D0D0D',
      border: isPrimary ? '1px solid rgba(201,169,110,0.22)' : '1px solid #1A1A1A',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          padding: '11px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isPrimary && (
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#C9A96E', flexShrink: 0,
            }} />
          )}
          <span style={{
            fontSize: 12,
            fontWeight: isPrimary ? 600 : 400,
            color: isPrimary ? '#F5F0E8' : '#6A6560',
            letterSpacing: '0.02em',
          }}>
            {label}
          </span>
          {isPrimary && (
            <span style={{
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(201,169,110,0.55)',
              padding: '2px 7px',
              background: 'rgba(201,169,110,0.08)',
              border: '1px solid rgba(201,169,110,0.18)',
              borderRadius: 100,
            }}>
              Primary
            </span>
          )}
        </div>
        <span style={{ color: '#3A3A3A', fontSize: 10, flexShrink: 0 }}>
          {expanded ? '↑' : '↓'}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: isPrimary ? '#A8A098' : '#6A6560', lineHeight: 1.65, margin: 0 }}>
            {instruction}
          </p>
          <div style={{
            padding: '10px 12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 4,
            borderLeft: isPrimary ? '2px solid rgba(201,169,110,0.25)' : '2px solid #1A1A1A',
          }}>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#3A3A3A', margin: '0 0 6px',
            }}>
              Creative Direction
            </p>
            <p style={{ fontSize: 11, color: '#5A5550', lineHeight: 1.6, margin: 0 }}>
              {creativeDirection}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section D: Mood Keywords ───────────────────────────────────────────────────

function MoodSection({ keywords }) {
  return (
    <BriefSection label="Mood">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {keywords.map((kw, i) => (
          <span key={i} style={{
            display: 'inline-block',
            padding: '5px 14px',
            background: i === 0 ? 'rgba(201,169,110,0.10)' : 'rgba(255,255,255,0.03)',
            border: i === 0 ? '1px solid rgba(201,169,110,0.30)' : '1px solid #2A2A2A',
            borderRadius: 100,
            fontSize: 11,
            fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? '#C9A96E' : '#9A9590',
            letterSpacing: '0.04em',
          }}>
            {kw}
          </span>
        ))}
      </div>
    </BriefSection>
  )
}

// ── Section E: Color Palette ───────────────────────────────────────────────────

function ColorPaletteSection({ palette }) {
  return (
    <BriefSection label="Color Palette">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, height: 36 }}>
          {palette.map((color, i) => (
            <div key={i} title={`${color.name} — ${color.hex}`} style={{
              flex: i === 0 ? '2 1 0' : '1 1 0',
              background: color.hex,
              borderRadius: 5,
              minWidth: 28,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
          {palette.map((color, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color.hex, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#9A9590', letterSpacing: '0.02em' }}>{color.name}</span>
              <span style={{ fontSize: 9, color: '#3A3A3A', fontFamily: '"JetBrains Mono", monospace' }}>{color.hex}</span>
            </div>
          ))}
        </div>
      </div>
    </BriefSection>
  )
}

// ── Section F: Text-only sections ─────────────────────────────────────────────

function TextSection({ label, text }) {
  return (
    <BriefSection label={label}>
      <p style={S.body}>{text}</p>
    </BriefSection>
  )
}

// ── Section G: Visual DNA ──────────────────────────────────────────────────────

function VisualDNASection({ references }) {
  return (
    <BriefSection label="Visual DNA">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {references.map((ref, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: '#C9A96E', fontSize: 10, flexShrink: 0, marginTop: 2, opacity: 0.6 }}>—</span>
            <span style={{ fontSize: 11, color: '#9A9590', lineHeight: 1.55 }}>{ref}</span>
          </div>
        ))}
      </div>
    </BriefSection>
  )
}

// ── Section H: Deliverables ────────────────────────────────────────────────────

const PRIORITY_STYLE = {
  essential:   { background: 'rgba(201,169,110,0.10)', border: '1px solid rgba(201,169,110,0.25)', color: '#C9A96E', label: 'Essential' },
  recommended: { background: 'rgba(74,124,89,0.10)',   border: '1px solid rgba(74,124,89,0.22)',   color: '#6BAF80', label: 'Recommended' },
  optional:    { background: 'rgba(90,85,80,0.10)',    border: '1px solid #2A2A2A',                color: '#5A5550', label: 'Optional' },
}

function DeliverablesSection({ deliverables }) {
  return (
    <BriefSection label="Recommended Deliverables">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {deliverables.map((d, i) => {
          const ps = PRIORITY_STYLE[d.priority] || PRIORITY_STYLE.optional
          return (
            <div key={i} style={{
              background: '#0D0D0D',
              border: '1px solid #1E1E1E',
              borderRadius: 6,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: '"Fraunces", "Georgia", serif',
                  fontSize: 13, fontWeight: 600, color: '#F5F0E8', letterSpacing: '0.01em',
                }}>
                  {d.type}
                </span>
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 100, ...ps,
                }}>
                  {ps.label}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#6A6560', lineHeight: 1.6, margin: 0 }}>{d.description}</p>
            </div>
          )
        })}
      </div>
    </BriefSection>
  )
}

// ── Copy JSON action ───────────────────────────────────────────────────────────

function CopyBriefAction({ designBrief }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    try {
      navigator.clipboard.writeText(JSON.stringify(designBrief, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* Clipboard API not available */ }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', background: '#0A0A0A', border: '1px solid #1E1E1E',
      borderRadius: 8, flexWrap: 'wrap', gap: 12,
    }}>
      <div>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: '#3A3A3A', margin: '0 0 4px',
        }}>
          Creative Studio handoff
        </p>
        <p style={{ fontSize: 11, color: '#4A4540', margin: 0, lineHeight: 1.5 }}>
          Copy this brief as structured JSON for HESTIA Creative Studio — menu layouts, welcome signs, and event branding.
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          padding: '8px 18px',
          background: copied ? 'rgba(74,124,89,0.12)' : 'transparent',
          border: copied ? '1px solid rgba(74,124,89,0.30)' : '1px solid #2A2A2A',
          borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: copied ? '#6BAF80' : '#5A5550',
          cursor: 'pointer', transition: 'all 200ms ease', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {copied ? 'Copied' : 'Copy as JSON'}
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ZoharDesignBrief({ event, brief, menuName }) {
  const designBrief = useMemo(
    () => buildEventDesignBrief({ event, brief, menuName }),
    [event, brief, menuName]
  )

  if (!designBrief) return null

  const { sections, creativeInputs } = designBrief
  const hasCreativeInputs = creativeInputs && Object.values(creativeInputs).some(v =>
    v !== null && (!Array.isArray(v) || v.length > 0)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Document header */}
      <div style={{
        padding: '20px 20px 18px',
        background: '#0A0A0A',
        border: '1px solid rgba(201,169,110,0.14)',
        borderRadius: '8px 8px 0 0',
        borderBottom: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
          width: 200, height: 120,
          background: 'radial-gradient(ellipse at top right, rgba(201,169,110,0.05), transparent 70%)',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={S.eyebrow}>ZOHAR · Design Director</p>
            <div style={{ height: 8 }} />
            <p style={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontSize: 22, fontWeight: 600, color: '#F5F0E8',
              letterSpacing: '0.01em', lineHeight: 1.2, margin: 0,
            }}>
              Event Design Brief
            </p>
            <p style={{ fontSize: 11, color: '#5A5550', margin: '6px 0 0', letterSpacing: '0.02em' }}>
              {event.name}{menuName ? ` · ${menuName}` : ''}
            </p>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
          }}>
            <div style={{
              padding: '6px 12px',
              background: 'rgba(201,169,110,0.06)',
              border: '1px solid rgba(201,169,110,0.18)',
              borderRadius: 6,
            }}>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'rgba(201,169,110,0.60)',
              }}>
                Phase 1 · Design Intelligence
              </span>
            </div>
            {hasCreativeInputs && (
              <div style={{
                padding: '4px 10px',
                background: 'rgba(74,124,89,0.06)',
                border: '1px solid rgba(74,124,89,0.18)',
                borderRadius: 6,
              }}>
                <span style={{
                  fontSize: 7, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'rgba(74,124,89,0.65)',
                }}>
                  Creative Direction · Active
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(201,169,110,0.08)', marginTop: 18 }} />
      </div>

      {/* Sections */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 2,
        background: '#0D0D0D',
        border: '1px solid rgba(201,169,110,0.14)',
        borderTop: 'none', borderBottom: 'none',
        padding: '2px 0',
      }}>
        <div style={{ padding: '0 2px', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* A: Narrative */}
          <NarrativeSection narrative={sections.narrative} />

          {/* B: Creative Philosophy */}
          <CreativePhilosophySection creativePhilosophy={sections.creativePhilosophy} />

          {/* C: Hospitality Vision */}
          <HospitalityVisionSection hospitalityVision={sections.hospitalityVision} />

          {/* D: Mood */}
          <MoodSection keywords={sections.moodKeywords} />

          {/* E: Color Palette */}
          <ColorPaletteSection palette={sections.colorPalette} />

          {/* F: Typography + Layout — two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
            <TextSection label="Typography Direction"  text={sections.typographyDirection} />
            <TextSection label="Layout Direction"      text={sections.layoutDirection} />
          </div>

          {/* G: Photography */}
          <TextSection label="Photography Direction" text={sections.photographyDirection} />

          {/* H: Visual DNA */}
          <VisualDNASection references={sections.visualDNA} />

          {/* I: Deliverables */}
          <DeliverablesSection deliverables={sections.deliverables} />

        </div>
      </div>

      {/* Footer */}
      <div style={{
        border: '1px solid rgba(201,169,110,0.14)',
        borderTop: '1px solid #1A1A1A',
        borderRadius: '0 0 8px 8px',
        overflow: 'hidden',
      }}>
        <CopyBriefAction designBrief={designBrief} />
      </div>

    </div>
  )
}
