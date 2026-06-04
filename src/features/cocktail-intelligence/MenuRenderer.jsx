// HESTIA MenuRenderer — Layer 2: deterministic React template engine.
// Receives a design spec from the AI (Layer 1) and renders the menu in DOM.
// No AI calls. No HTML strings. No iframe. Pure React + inline styles.
//
// Supported templates: DARK_LUXURY | MEDITERRANEAN | MODERN_GRID | EDITORIAL | GRAPHIC_BOLD
//
// Changes vs initial version:
//   - FlavorChart: max-width 220px container, 44px label, 130px track, 8px dot, 4px row gap
//   - All templates: ingredients render ALL items, wrap naturally, Inter 300 11px ls 0.02em
//   - MEDITERRANEAN: Anchor 1 (terracotta dividers), Anchor 2 (accent rect section header),
//     Anchor 3 (price as 28px accent CG element), typography hierarchy per skill spec
//   - DARK_LUXURY: cover rule line, exact typography values, spacing
//   - All covers: 10px uppercase ls 0.25em venue label, accent rule at cover bottom

// ── Shared helpers ────────────────────────────────────────────────────────────

function gf(name) {
  return name || 'Georgia, serif'
}

function buildCocktailMap(cocktails = []) {
  const map = {}
  cocktails.forEach(c => { if (c?.name) map[c.name] = c })
  return map
}

function sectionCocktails(section, cocktailMap) {
  return (section.cocktails || []).map(name => cocktailMap[name]).filter(Boolean)
}

// Build the final sections array for rendering:
//   1. Strip any AI section whose label is STANDARDS/CLASSICS (renderer handles classics itself).
//   2. Detect signature cocktails that ended up in no section (AI mis-assigned them)
//      and append them in a catch-all "ALSO PLAYING" section so nothing is silently dropped.
function buildRenderSections(sections = [], cocktails = []) {
  const filtered = sections.filter(s => !/standard|classic/i.test(s.label || ''))

  const assignedNames = new Set(filtered.flatMap(s => s.cocktails || []))
  const orphaned = (cocktails || []).filter(c => c?.name && !assignedNames.has(c.name))

  if (orphaned.length > 0) {
    filtered.push({
      id:          'also_playing',
      label:       'ALSO PLAYING',
      descriptor:  '',
      cocktails:   orphaned.map(c => c.name),
    })
  }

  return filtered
}

// ── FlavorChart ───────────────────────────────────────────────────────────────
// Problem 2 fix: max-width 220px container, label 44px, track 130px fixed,
// 8px dot with 1.5px background-color border, 4px row gap.

function FlavorChart({ chart, colors, variant = 'bars', bgColor }) {
  if (!chart) return null
  const entries = Object.entries(chart).filter(([, v]) => Number(v) > 0)
  if (entries.length === 0) return null

  const trackColor = colors.border    || 'rgba(128,128,128,0.2)'
  const barColor   = colors.accent    || '#C9853A'
  const labelColor = colors.textMuted || '#888'
  const dotBg      = bgColor || colors.background || '#ffffff'

  const labelStyle = {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: labelColor,
    width: 44,
    textAlign: 'right',
    flexShrink: 0,
    lineHeight: 1,
  }

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  }

  if (variant === 'bars') {
    return (
      <div style={{ marginTop: 12, maxWidth: 220 }}>
        {entries.map(([label, value]) => (
          <div key={label} style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <div style={{ width: 130, maxWidth: 130, height: 3, background: trackColor, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: barColor, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'notches') {
    // Mediterranean: 8px filled circle with 1.5px background-color border
    return (
      <div style={{ marginTop: 12, maxWidth: 220 }}>
        {entries.map(([label, value]) => (
          <div key={label} style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <div style={{ width: 130, maxWidth: 130, height: 1, background: trackColor, position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute',
                top: -3.5,
                left: `${Math.min(value, 96)}%`,
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: barColor,
                border: `1.5px solid ${dotBg}`,
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Dots — MODERN_GRID / EDITORIAL: 8px outlined circle
  return (
    <div style={{ marginTop: 12, maxWidth: 220 }}>
      {entries.map(([label, value]) => (
        <div key={label} style={rowStyle}>
          <span style={labelStyle}>{label}</span>
          <div style={{ width: 130, maxWidth: 130, height: 1, background: trackColor, position: 'relative', flexShrink: 0 }}>
            <div style={{
              position: 'absolute',
              top: -3.5,
              left: `${Math.min(value, 96)}%`,
              transform: 'translateX(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: barColor,
              border: `1.5px solid ${dotBg}`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── DARK_LUXURY template ───────────────────────────────────────────────────────

function DLCocktailEntry({ cocktail, index, colors, typography }) {
  if (!cocktail) return null
  const c        = colors
  const headFont = gf(typography?.headingFont)
  const bodyFont = gf(typography?.bodyFont)

  return (
    // Anchor 4: catalog number. Dividers via borderBottom accent in parent loop.
    <div style={{ paddingTop: 32, paddingBottom: 32, borderBottom: `1px solid ${c.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Catalog number — Anchor 4 */}
          <div style={{ fontFamily: bodyFont, fontSize: 9, letterSpacing: '0.3em', color: c.accent, opacity: 0.55, marginBottom: 6, textTransform: 'uppercase' }}>
            {String(index + 1).padStart(2, '0')}
          </div>
          {/* Name — 28px CG weight 400 */}
          <div style={{ fontFamily: headFont, fontSize: 29, fontWeight: 400, color: c.text, lineHeight: 1.05, marginBottom: cocktail.nameHe ? 4 : 8 }}>
            {cocktail.name}
          </div>
          {/* Hebrew name */}
          {cocktail.nameHe && (
            <div style={{ fontFamily: headFont, fontSize: 14, fontStyle: 'italic', color: c.textMuted, direction: 'rtl', marginBottom: 8 }}>
              {cocktail.nameHe}
            </div>
          )}
          {/* Description — 14px CG italic, lh 1.5 */}
          {cocktail.description && (
            <div style={{ fontFamily: headFont, fontSize: 14, fontStyle: 'italic', color: c.textMuted, lineHeight: 1.5, marginBottom: 8 }}>
              {cocktail.description}
            </div>
          )}
          {/* Ingredients — ALL items, no truncation. Inter 300 11px ls 0.02em, wraps naturally */}
          {/* DEBUG — remove after diagnosis */}
          {console.log(`[DL-INGREDIENTS] "${cocktail.name}": ${cocktail.ingredients?.length ?? 'undefined'} items →`, cocktail.ingredients)}
          {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
            <div style={{
              fontFamily: bodyFont,
              fontWeight: 300,
              fontSize: 11,
              color: c.textMuted,
              opacity: 0.75,
              letterSpacing: '0.02em',
              lineHeight: 1.6,
              marginTop: 8,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}>
              {cocktail.ingredients.join(' · ')}
            </div>
          )}
          {/* Flavor chart — bars, 12px gap from ingredients */}
          <FlavorChart chart={cocktail.flavorChart} colors={c} variant="bars" bgColor={c.background} />
        </div>
        {/* Price — 26px CG weight 300, accent */}
        {cocktail.price != null && (
          <div style={{
            fontFamily: headFont,
            fontSize: 26,
            fontWeight: 300,
            color: c.accent,
            flexShrink: 0,
            paddingTop: 32,
            minWidth: 36,
            textAlign: 'right',
          }}>
            {cocktail.price}
          </div>
        )}
      </div>
    </div>
  )
}

function DLSectionHeader({ section, colors, typography }) {
  const headFont = gf(typography?.headingFont)
  const bodyFont = gf(typography?.bodyFont)
  const c = colors
  return (
    <div style={{ paddingTop: 40, paddingBottom: 0, marginBottom: 24 }}>
      <div style={{ borderTop: `1px solid ${c.accent}`, paddingTop: 16 }}>
        {/* Section label — 11px Inter uppercase ls 0.25em */}
        <div style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 500, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase', marginBottom: 4 }}>
          {section.label}
        </div>
        {section.descriptor && (
          <div style={{ fontFamily: headFont, fontSize: 13, fontStyle: 'italic', color: c.textMuted }}>
            {section.descriptor}
          </div>
        )}
      </div>
    </div>
  )
}

function DarkLuxuryTemplate({ spec }) {
  const c        = { background: '#1a1410', surface: '#241e18', text: '#f0ebe0', textMuted: '#8a7a60', accent: '#C9853A', border: '#2a2218', ...spec.colorSystem }
  const ty       = spec.typography || {}
  const headFont = gf(ty.headingFont)
  const bodyFont = gf(ty.bodyFont)
  const cocktailMap = buildCocktailMap(spec.cocktails)

  const fontUrl = `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@300;400;500&display=swap`

  return (
    <div style={{ background: c.background, color: c.text, fontFamily: bodyFont, minHeight: '100vh' }}>
      <style>{`@import url('${fontUrl}'); * { box-sizing: border-box; }`}</style>

      {/* Cover — 48px+ padding, accent rule at bottom */}
      <div style={{ background: c.background, padding: '60px 56px 48px' }}>
        {/* Venue name top-left / year top-right — 10px uppercase ls 0.25em */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 56 }}>
          <span style={{ fontFamily: bodyFont, fontSize: 10, letterSpacing: '0.25em', color: c.textMuted, textTransform: 'uppercase' }}>
            {spec.venueName}
          </span>
          <span style={{ fontFamily: bodyFont, fontSize: 10, letterSpacing: '0.25em', color: c.textMuted, textTransform: 'uppercase', opacity: 0.6 }}>
            {new Date().getFullYear()}
          </span>
        </div>
        {/* Title — 68px CG weight 300, identityWord in italic accent */}
        <div style={{ fontFamily: headFont, fontSize: 68, fontWeight: 300, color: c.text, lineHeight: 1.0, marginBottom: 16, letterSpacing: '-0.01em' }}>
          {spec.identityWord
            ? <span style={{ color: c.accent, fontStyle: 'italic' }}>{spec.identityWord.charAt(0).toUpperCase() + spec.identityWord.slice(1)}</span>
            : spec.venueName
          }
        </div>
        {/* Sub-line — 15px italic CG muted */}
        {spec.coverSubline && (
          <div style={{ fontFamily: headFont, fontSize: 15, fontStyle: 'italic', color: c.textMuted, letterSpacing: '0.02em', marginBottom: 0 }}>
            {spec.coverSubline}
          </div>
        )}
        {/* Full-width accent rule at cover bottom */}
        <div style={{ height: 1, background: c.accent, marginTop: 40 }} />
      </div>

      {/* Sections */}
      <div style={{ padding: '0 56px' }}>
        {buildRenderSections(spec.sections, spec.cocktails).map(section => {
          const cts = sectionCocktails(section, cocktailMap)
          if (cts.length === 0) return null
          return (
            <div key={section.id}>
              <DLSectionHeader section={section} colors={c} typography={ty} />
              {cts.map((cocktail, i) => (
                <DLCocktailEntry key={cocktail.name} cocktail={cocktail} index={i} colors={c} typography={ty} />
              ))}
            </div>
          )
        })}

        {/* Non-alcoholic */}
        {Array.isArray(spec.nonAlcoholic) && spec.nonAlcoholic.length > 0 && (
          <div>
            <DLSectionHeader section={{ label: 'ZERO PROOF', descriptor: 'Non-alcoholic' }} colors={c} typography={ty} />
            {spec.nonAlcoholic.map(cocktail => (
              <div key={cocktail.name} style={{ paddingTop: 16, paddingBottom: 16, borderBottom: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: headFont, fontSize: 20, fontWeight: 300, color: c.text, marginBottom: 4 }}>{cocktail.name}</div>
                    {cocktail.description && (
                      <div style={{ fontFamily: headFont, fontSize: 13, fontStyle: 'italic', color: c.textMuted, marginBottom: 6 }}>{cocktail.description}</div>
                    )}
                    {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
                      <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, opacity: 0.65, letterSpacing: '0.02em', lineHeight: 1.6, whiteSpace: 'normal' }}>
                        {cocktail.ingredients.join(' · ')}
                      </div>
                    )}
                  </div>
                  {cocktail.price != null && (
                    <div style={{ fontFamily: headFont, fontSize: 20, fontWeight: 300, color: c.accent, flexShrink: 0 }}>{cocktail.price}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Classics */}
        {Array.isArray(spec.classics) && spec.classics.length > 0 && (
          <div>
            <DLSectionHeader section={{ label: 'STANDARDS', descriptor: 'The classics, as they should be' }} colors={c} typography={ty} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', paddingBottom: 40 }}>
              {spec.classics.map(cl => (
                <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontFamily: headFont, fontSize: 16, fontWeight: 300, color: c.text }}>{cl.name}</span>
                  {cl.price != null && (
                    <span style={{ fontFamily: bodyFont, fontSize: 13, color: c.textMuted }}>{cl.price}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: c.background, borderTop: `1px solid ${c.border}`, padding: '32px 56px', marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontFamily: headFont, fontSize: 22, fontWeight: 300, letterSpacing: '0.2em', color: c.text, textTransform: 'uppercase' }}>
          {spec.venueName}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 9, letterSpacing: '0.2em', color: c.accent, textTransform: 'uppercase' }}>
          Powered by HESTIA v5.2
        </div>
      </div>
    </div>
  )
}

// ── MEDITERRANEAN template ─────────────────────────────────────────────────────
// Anchor 1: terracotta rule lines between cocktails (accent color dividers)
// Anchor 2: filled 4×40px accent rect before section label
// Anchor 3: price 28px CG accent with "—" visual separator
// Typography: exact skill values throughout

function MediterraneanTemplate({ spec }) {
  const c  = {
    background: '#f2ede6', surface: '#ede7de', text: '#2c2219',
    textMuted: '#8a7560', accent: '#b56a3a', border: '#d4c9b8',
    ...spec.colorSystem,
  }
  const ty       = spec.typography || {}
  const headFont = gf(ty.headingFont || 'Cormorant Garamond, Georgia, serif')
  const bodyFont = gf(ty.bodyFont   || 'Inter, sans-serif')
  const cocktailMap = buildCocktailMap(spec.cocktails)

  return (
    <div style={{ background: c.background, color: c.text, fontFamily: bodyFont, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@300;400;500&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Cover — 48px+ padding */}
      <div style={{ padding: '56px 56px 48px' }}>
        {/* Venue name top-left / year top-right — 10px uppercase ls 0.25em */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48 }}>
          <span style={{ fontFamily: bodyFont, fontSize: 10, letterSpacing: '0.25em', color: c.textMuted, textTransform: 'uppercase' }}>
            {spec.venueName}
          </span>
          <span style={{ fontFamily: bodyFont, fontSize: 10, letterSpacing: '0.25em', color: c.textMuted, textTransform: 'uppercase', opacity: 0.7 }}>
            {new Date().getFullYear()}
          </span>
        </div>
        {/* Title — 66px CG weight 300, identityWord italic accent */}
        <div style={{ fontFamily: headFont, fontSize: 66, fontWeight: 300, color: c.text, lineHeight: 1.0, marginBottom: 14 }}>
          {spec.identityWord
            ? <span style={{ fontStyle: 'italic', color: c.accent }}>{spec.identityWord.charAt(0).toUpperCase() + spec.identityWord.slice(1)}</span>
            : spec.venueName
          }
        </div>
        {/* Sub-line — 15px italic CG muted */}
        {spec.coverSubline && (
          <div style={{ fontFamily: headFont, fontSize: 15, fontStyle: 'italic', color: c.textMuted, marginBottom: 0 }}>
            {spec.coverSubline}
          </div>
        )}
        {/* Full-width accent rule at cover bottom — Anchor 1 variant */}
        <div style={{ height: 1, background: c.accent, marginTop: 40 }} />
      </div>

      <div style={{ padding: '0 56px' }}>
        {buildRenderSections(spec.sections, spec.cocktails).map(section => {
          const cts = sectionCocktails(section, cocktailMap)
          if (cts.length === 0) return null
          return (
            <div key={section.id} style={{ marginTop: 40 }}>
              {/* Section header — Anchor 2: filled 4×40px accent rect before label */}
              <div style={{ marginBottom: 24 }}>
                {/* Accent block marker */}
                <div style={{ width: 40, height: 4, background: c.accent, marginBottom: 10 }} />
                {/* Section label — 11px Inter uppercase ls 0.25em */}
                <div style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 500, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase' }}>
                  {section.label}
                </div>
                {section.descriptor && (
                  <div style={{ fontFamily: headFont, fontSize: 13, fontStyle: 'italic', color: c.textMuted, marginTop: 3 }}>
                    {section.descriptor}
                  </div>
                )}
              </div>

              {cts.map(cocktail => (
                <div key={cocktail.name} style={{
                  paddingTop: 32,
                  paddingBottom: 32,
                  // Anchor 1: terracotta/accent rule between cocktails (not grey)
                  borderBottom: `1px solid ${c.accent}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name — 29px CG weight 400 */}
                      <div style={{ fontFamily: headFont, fontSize: 29, fontWeight: 400, color: c.text, lineHeight: 1.05, marginBottom: cocktail.nameHe ? 2 : 8 }}>
                        {cocktail.name}
                      </div>
                      {/* Hebrew name */}
                      {cocktail.nameHe && (
                        <div style={{ fontFamily: headFont, fontSize: 14, fontStyle: 'italic', color: c.textMuted, direction: 'rtl', marginBottom: 8 }}>
                          {cocktail.nameHe}
                        </div>
                      )}
                      {/* Description — 14px CG italic lh 1.5 */}
                      {cocktail.description && (
                        <div style={{ fontFamily: headFont, fontSize: 14, fontStyle: 'italic', color: c.textMuted, lineHeight: 1.5, marginBottom: 0 }}>
                          {cocktail.description}
                        </div>
                      )}
                      {/* Ingredients — ALL items, Inter 300 11px ls 0.02em, mt 8 */}
                      {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
                        <div style={{
                          fontFamily: bodyFont,
                          fontWeight: 300,
                          fontSize: 11,
                          color: c.textMuted,
                          opacity: 0.8,
                          letterSpacing: '0.02em',
                          lineHeight: 1.6,
                          marginTop: 8,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}>
                          {cocktail.ingredients.join(' · ')}
                        </div>
                      )}
                      {/* Flavor chart — notches, mt 12 */}
                      <FlavorChart chart={cocktail.flavorChart} colors={c} variant="notches" bgColor={c.background} />
                    </div>

                    {/* Price — Anchor 3: 28px CG weight 300, accent color, with muted "—" separator */}
                    {cocktail.price != null && (
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: 4 }}>
                        <span style={{ fontFamily: bodyFont, fontSize: 11, color: c.textMuted, opacity: 0.5, marginBottom: 2, letterSpacing: '0.1em' }}>—</span>
                        <span style={{ fontFamily: headFont, fontSize: 28, fontWeight: 300, color: c.accent, lineHeight: 1.0 }}>
                          {cocktail.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {/* Non-alcoholic */}
        {Array.isArray(spec.nonAlcoholic) && spec.nonAlcoholic.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 40, height: 4, background: c.accent, marginBottom: 10 }} />
              <div style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 500, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase' }}>
                ALCOHOL FREE
              </div>
            </div>
            {spec.nonAlcoholic.map(cl => (
              <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: `1px solid ${c.accent}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: headFont, fontSize: 18, fontWeight: 400, color: c.text }}>{cl.name}</div>
                  {cl.description && (
                    <div style={{ fontFamily: headFont, fontSize: 13, fontStyle: 'italic', color: c.textMuted, marginTop: 2 }}>{cl.description}</div>
                  )}
                  {Array.isArray(cl.ingredients) && cl.ingredients.length > 0 && (
                    <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, opacity: 0.75, letterSpacing: '0.02em', lineHeight: 1.6, marginTop: 4, whiteSpace: 'normal' }}>
                      {cl.ingredients.join(' · ')}
                    </div>
                  )}
                </div>
                {cl.price != null && (
                  <div style={{ fontFamily: headFont, fontSize: 22, fontWeight: 300, color: c.accent, flexShrink: 0 }}>{cl.price}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Classics */}
        {Array.isArray(spec.classics) && spec.classics.length > 0 && (
          <div style={{ marginTop: 40, paddingBottom: 40 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ width: 40, height: 4, background: c.accent, marginBottom: 10 }} />
              <div style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 500, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase' }}>
                CLASSICS
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              {spec.classics.map(cl => (
                <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontFamily: headFont, fontSize: 16, fontWeight: 400, color: c.text }}>{cl.name}</span>
                  {cl.price != null && (
                    <span style={{ fontFamily: headFont, fontSize: 16, fontWeight: 300, color: c.textMuted }}>{cl.price}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: c.text, padding: '28px 56px', marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: headFont, fontSize: 20, fontWeight: 300, letterSpacing: '0.15em', color: c.background, textTransform: 'uppercase' }}>
          {spec.venueName}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 9, letterSpacing: '0.2em', color: c.accent, textTransform: 'uppercase' }}>
          Powered by HESTIA v5.2
        </div>
      </div>
    </div>
  )
}

// ── MODERN_GRID template ───────────────────────────────────────────────────────

function ModernGridTemplate({ spec }) {
  const c = {
    background: '#f8f7f5', surface: '#ffffff', text: '#1a1a1a',
    textMuted: '#6b7280', accent: '#374151', border: '#e5e7eb',
    ...spec.colorSystem,
  }
  const ty       = spec.typography || {}
  const headFont = gf(ty.headingFont || 'Inter, sans-serif')
  const bodyFont = gf(ty.bodyFont   || 'Inter, sans-serif')
  const cocktailMap = buildCocktailMap(spec.cocktails)

  return (
    <div style={{ background: c.background, color: c.text, fontFamily: bodyFont, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Cover */}
      <div style={{ padding: '64px 64px 48px', background: c.text, color: c.background }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 60 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.6 }}>{spec.venueName}</span>
          <span style={{ fontSize: 10, letterSpacing: '0.2em', opacity: 0.4 }}>{new Date().getFullYear()}</span>
        </div>
        <div style={{ fontFamily: headFont, fontSize: 56, fontWeight: 700, lineHeight: 1.0, marginBottom: 12, letterSpacing: '-0.02em' }}>
          {spec.venueName}
        </div>
        {spec.coverSubline && (
          <div style={{ fontSize: 14, fontWeight: 300, letterSpacing: '0.05em', opacity: 0.6 }}>{spec.coverSubline}</div>
        )}
        <div style={{ height: 1, background: c.background, opacity: 0.25, marginTop: 40 }} />
      </div>

      <div style={{ padding: '0 64px' }}>
        {buildRenderSections(spec.sections, spec.cocktails).map(section => {
          const cts = sectionCocktails(section, cocktailMap)
          if (cts.length === 0) return null
          return (
            <div key={section.id} style={{ marginTop: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 8, borderBottom: `2px solid ${c.text}`, marginBottom: 24 }}>
                <div style={{ fontFamily: headFont, fontSize: 11, fontWeight: 600, letterSpacing: '0.25em', color: c.text, textTransform: 'uppercase' }}>{section.label}</div>
                {section.descriptor && <div style={{ fontSize: 12, color: c.textMuted }}>{section.descriptor}</div>}
              </div>
              {cts.map(cocktail => (
                <div key={cocktail.name} style={{ padding: '32px 0', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: headFont, fontSize: 22, fontWeight: 600, color: c.text, marginBottom: 6 }}>{cocktail.name}</div>
                    {cocktail.description && (
                      <div style={{ fontSize: 14, color: c.textMuted, marginBottom: 0, lineHeight: 1.5 }}>{cocktail.description}</div>
                    )}
                    {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
                      <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, opacity: 0.75, letterSpacing: '0.02em', lineHeight: 1.6, marginTop: 8, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {cocktail.ingredients.join(', ')}
                      </div>
                    )}
                    <FlavorChart chart={cocktail.flavorChart} colors={c} variant="dots" bgColor={c.background} />
                  </div>
                  {cocktail.price != null && (
                    <div style={{ fontFamily: headFont, fontSize: 26, fontWeight: 300, color: c.text, flexShrink: 0, paddingTop: 2 }}>{cocktail.price}</div>
                  )}
                </div>
              ))}
            </div>
          )
        })}

        {Array.isArray(spec.nonAlcoholic) && spec.nonAlcoholic.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ borderBottom: `2px solid ${c.text}`, paddingBottom: 8, marginBottom: 24 }}>
              <div style={{ fontFamily: headFont, fontSize: 11, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase' }}>ZERO</div>
            </div>
            {spec.nonAlcoholic.map(cl => (
              <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <div style={{ fontFamily: headFont, fontSize: 18, fontWeight: 500 }}>{cl.name}</div>
                  {Array.isArray(cl.ingredients) && cl.ingredients.length > 0 && (
                    <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, letterSpacing: '0.02em', lineHeight: 1.6, marginTop: 4, whiteSpace: 'normal' }}>
                      {cl.ingredients.join(', ')}
                    </div>
                  )}
                </div>
                {cl.price != null && <div style={{ fontFamily: headFont, fontSize: 20, fontWeight: 300 }}>{cl.price}</div>}
              </div>
            ))}
          </div>
        )}

        {Array.isArray(spec.classics) && spec.classics.length > 0 && (
          <div style={{ marginTop: 48, paddingBottom: 48 }}>
            <div style={{ borderBottom: `2px solid ${c.text}`, paddingBottom: 8, marginBottom: 24 }}>
              <div style={{ fontFamily: headFont, fontSize: 11, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase' }}>CLASSICS</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
              {spec.classics.map(cl => (
                <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 14 }}>{cl.name}</span>
                  {cl.price != null && <span style={{ fontSize: 14, color: c.textMuted }}>{cl.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: c.text, padding: '24px 64px', marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: headFont, fontSize: 14, fontWeight: 600, letterSpacing: '0.2em', color: c.background, textTransform: 'uppercase' }}>{spec.venueName}</div>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: c.accent || '#9ca3af', textTransform: 'uppercase' }}>Powered by HESTIA v5.2</div>
      </div>
    </div>
  )
}

// ── EDITORIAL template ─────────────────────────────────────────────────────────

function EditorialTemplate({ spec }) {
  const c = {
    background: '#f5f0e8', surface: '#ede8df', text: '#1c1814',
    textMuted: '#7a6e62', accent: '#8b6b52', border: '#d8d0c4',
    ...spec.colorSystem,
  }
  const ty       = spec.typography || {}
  const headFont = gf(ty.headingFont || 'Cormorant Garamond, Georgia, serif')
  const bodyFont = gf(ty.bodyFont   || 'Inter, sans-serif')
  const cocktailMap = buildCocktailMap(spec.cocktails)

  return (
    <div style={{ background: c.background, color: c.text, fontFamily: bodyFont, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@300;400;500&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Cover — asymmetric */}
      <div style={{ padding: '72px 64px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 64 }}>
          <span style={{ fontFamily: bodyFont, fontSize: 10, letterSpacing: '0.25em', color: c.textMuted, textTransform: 'uppercase' }}>{spec.venueName}</span>
          <span style={{ fontFamily: bodyFont, fontSize: 10, letterSpacing: '0.2em', color: c.textMuted, opacity: 0.6 }}>{new Date().getFullYear()}</span>
        </div>
        <div style={{ fontFamily: headFont, fontSize: 70, fontWeight: 300, color: c.text, lineHeight: 0.95, marginBottom: 20, letterSpacing: '-0.02em', maxWidth: 640 }}>
          {spec.identityWord ? <em style={{ color: c.accent }}>{spec.identityWord}</em> : spec.venueName}
        </div>
        {spec.coverSubline && (
          <div style={{ fontFamily: headFont, fontSize: 15, fontStyle: 'italic', color: c.textMuted, borderLeft: `2px solid ${c.accent}`, paddingLeft: 16, maxWidth: 440 }}>
            {spec.coverSubline}
          </div>
        )}
        <div style={{ height: 1, background: c.accent, marginTop: 40 }} />
      </div>

      <div style={{ padding: '0 64px' }}>
        {buildRenderSections(spec.sections, spec.cocktails).map(section => {
          const cts = sectionCocktails(section, cocktailMap)
          if (cts.length === 0) return null
          return (
            <div key={section.id} style={{ marginTop: 48 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: bodyFont, fontSize: 11, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase', marginBottom: 4 }}>{section.label}</div>
                {section.descriptor && <div style={{ fontFamily: headFont, fontSize: 13, fontStyle: 'italic', color: c.textMuted }}>{section.descriptor}</div>}
                <div style={{ height: 1, background: c.border, marginTop: 12 }} />
              </div>
              {cts.map(cocktail => (
                <div key={cocktail.name} style={{ padding: '32px 0', borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ fontFamily: headFont, fontSize: 30, fontWeight: 300, color: c.text, lineHeight: 1.0, marginBottom: cocktail.nameHe ? 3 : 8 }}>{cocktail.name}</div>
                  {cocktail.nameHe && <div style={{ fontFamily: headFont, fontSize: 14, fontStyle: 'italic', color: c.textMuted, direction: 'rtl', marginBottom: 8 }}>{cocktail.nameHe}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                    <div style={{ flex: 1 }}>
                      {cocktail.description && (
                        <div style={{ fontFamily: headFont, fontSize: 14, fontStyle: 'italic', color: c.textMuted, lineHeight: 1.5, marginBottom: 0 }}>{cocktail.description}</div>
                      )}
                      {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
                        <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, opacity: 0.75, letterSpacing: '0.02em', lineHeight: 1.6, marginTop: 8, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {cocktail.ingredients.join(', ')}
                        </div>
                      )}
                      <FlavorChart chart={cocktail.flavorChart} colors={c} variant="dots" bgColor={c.background} />
                    </div>
                    {cocktail.price != null && (
                      <div style={{ fontFamily: headFont, fontSize: 26, fontWeight: 300, fontStyle: 'italic', color: c.accent, flexShrink: 0 }}>{cocktail.price}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {Array.isArray(spec.nonAlcoholic) && spec.nonAlcoholic.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ fontFamily: bodyFont, fontSize: 11, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase', marginBottom: 12 }}>ALCOHOL FREE</div>
            {spec.nonAlcoholic.map(cl => (
              <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <div style={{ fontFamily: headFont, fontSize: 18, fontWeight: 300 }}>{cl.name}</div>
                  {Array.isArray(cl.ingredients) && cl.ingredients.length > 0 && (
                    <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, opacity: 0.7, letterSpacing: '0.02em', lineHeight: 1.6, marginTop: 4, whiteSpace: 'normal' }}>
                      {cl.ingredients.join(', ')}
                    </div>
                  )}
                </div>
                {cl.price != null && <div style={{ fontFamily: headFont, fontSize: 20, fontStyle: 'italic', color: c.accent }}>{cl.price}</div>}
              </div>
            ))}
          </div>
        )}

        {Array.isArray(spec.classics) && spec.classics.length > 0 && (
          <div style={{ marginTop: 48, paddingBottom: 48 }}>
            <div style={{ fontFamily: bodyFont, fontSize: 11, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase', marginBottom: 12 }}>CLASSICS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
              {spec.classics.map(cl => (
                <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontFamily: headFont, fontSize: 15 }}>{cl.name}</span>
                  {cl.price != null && <span style={{ fontFamily: bodyFont, fontSize: 13, color: c.textMuted }}>{cl.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: c.text, padding: '28px 64px', marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: headFont, fontSize: 20, fontWeight: 300, letterSpacing: '0.2em', color: c.background, textTransform: 'uppercase' }}>{spec.venueName}</div>
        <div style={{ fontFamily: bodyFont, fontSize: 9, letterSpacing: '0.2em', color: c.accent || '#9ca3af', textTransform: 'uppercase' }}>Powered by HESTIA v5.2</div>
      </div>
    </div>
  )
}

// ── GRAPHIC_BOLD template ──────────────────────────────────────────────────────

// Detect whether a hex color is perceptually light (luminance > 0.5).
// Used to override light AI-returned backgrounds for GRAPHIC_BOLD.
function _isLightHex(hex) {
  const h = (hex || '').replace('#', '')
  if (h.length < 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128
}

function GraphicBoldTemplate({ spec }) {
  // If the AI returned a light background for a GRAPHIC_BOLD bar, force dark.
  // GRAPHIC_BOLD must always be high-contrast — it should never look like MEDITERRANEAN.
  const specBg   = spec.colorSystem?.background
  const bgIsLight = _isLightHex(specBg)

  const c = {
    background: bgIsLight ? '#1a1612' : (specBg           || '#0d0d0d'),
    surface:    bgIsLight ? '#2a2420' : (spec.colorSystem?.surface  || '#1a1a1a'),
    text:       bgIsLight ? '#f0ebe0' : (spec.colorSystem?.text     || '#f5f5f5'),
    textMuted:  spec.colorSystem?.textMuted || '#888888',
    accent:     spec.colorSystem?.accent    || '#C9853A',
    border:     bgIsLight ? '#3a3028' : (spec.colorSystem?.border   || '#2a2a2a'),
  }
  const ty       = spec.typography || {}
  // Cover title always Inter (poster feel), not Cormorant
  const headFont = 'Inter, sans-serif'
  const bodyFont = gf(ty.bodyFont || 'Inter, sans-serif')
  const cocktailMap = buildCocktailMap(spec.cocktails)

  return (
    <div style={{ background: c.background, color: c.text, fontFamily: bodyFont, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Cover — poster-like, always dark */}
      <div style={{ padding: '64px 56px 56px', borderBottom: `3px solid ${c.accent}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48 }}>
          <span style={{ fontFamily: headFont, fontSize: 10, letterSpacing: '0.25em', color: c.textMuted, textTransform: 'uppercase' }}>{spec.venueName}</span>
          <span style={{ fontFamily: headFont, fontSize: 10, letterSpacing: '0.15em', color: c.textMuted, textTransform: 'uppercase' }}>{new Date().getFullYear()}</span>
        </div>
        {/* Title — Inter 800, 76px, uppercase, tight tracking */}
        <div style={{ fontFamily: headFont, fontSize: 76, fontWeight: 800, color: c.text, lineHeight: 0.9, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 18 }}>
          {spec.venueName}
        </div>
        {/* Sub-line — Inter light, 13px, uppercase, accent color, tracked */}
        {spec.coverSubline && (
          <div style={{ fontFamily: headFont, fontSize: 13, fontWeight: 300, color: c.accent, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{spec.coverSubline}</div>
        )}
      </div>

      <div style={{ padding: '0 56px' }}>
        {buildRenderSections(spec.sections, spec.cocktails).map(section => {
          const cts = sectionCocktails(section, cocktailMap)
          if (cts.length === 0) return null
          return (
            <div key={section.id} style={{ marginTop: 48 }}>
              {/* Section header — filled accent rect, Inter 700 10px uppercase ls 0.2em, dark text */}
              <div style={{ background: c.accent, display: 'inline-block', padding: '4px 12px', marginBottom: 24 }}>
                <span style={{ fontFamily: headFont, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: c.background, textTransform: 'uppercase' }}>{section.label}</span>
              </div>
              {cts.map(cocktail => (
                <div key={cocktail.name} style={{ padding: '32px 0', borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: headFont, fontSize: 26, fontWeight: 700, color: c.text, marginBottom: 6, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>{cocktail.name}</div>
                      {cocktail.description && (
                        <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 0, lineHeight: 1.5 }}>{cocktail.description}</div>
                      )}
                      {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
                        <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, opacity: 0.75, letterSpacing: '0.02em', lineHeight: 1.6, marginTop: 8, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {cocktail.ingredients.join(' / ')}
                        </div>
                      )}
                      <FlavorChart chart={cocktail.flavorChart} colors={c} variant="bars" bgColor={c.background} />
                    </div>
                    {cocktail.price != null && (
                      <div style={{ fontFamily: headFont, fontSize: 28, fontWeight: 900, color: c.accent, flexShrink: 0 }}>{cocktail.price}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {Array.isArray(spec.nonAlcoholic) && spec.nonAlcoholic.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ background: c.surface, display: 'inline-block', padding: '4px 12px', marginBottom: 16 }}>
              <span style={{ fontFamily: headFont, fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', color: c.accent, textTransform: 'uppercase' }}>ZERO</span>
            </div>
            {spec.nonAlcoholic.map(cl => (
              <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <div style={{ fontFamily: headFont, fontSize: 16, fontWeight: 600, color: c.text }}>{cl.name}</div>
                  {Array.isArray(cl.ingredients) && cl.ingredients.length > 0 && (
                    <div style={{ fontFamily: bodyFont, fontWeight: 300, fontSize: 11, color: c.textMuted, letterSpacing: '0.02em', lineHeight: 1.6, marginTop: 4, whiteSpace: 'normal' }}>
                      {cl.ingredients.join(' / ')}
                    </div>
                  )}
                </div>
                {cl.price != null && <div style={{ fontFamily: headFont, fontSize: 20, fontWeight: 700, color: c.accent }}>{cl.price}</div>}
              </div>
            ))}
          </div>
        )}

        {Array.isArray(spec.classics) && spec.classics.length > 0 && (
          <div style={{ marginTop: 48, paddingBottom: 48 }}>
            <div style={{ background: c.surface, display: 'inline-block', padding: '4px 12px', marginBottom: 16 }}>
              <span style={{ fontFamily: headFont, fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', color: c.textMuted, textTransform: 'uppercase' }}>CLASSICS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              {spec.classics.map(cl => (
                <div key={cl.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                  <span style={{ fontFamily: headFont, fontSize: 14, fontWeight: 500, color: c.text }}>{cl.name}</span>
                  {cl.price != null && <span style={{ fontFamily: bodyFont, fontSize: 14, color: c.textMuted }}>{cl.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: c.surface, borderTop: `3px solid ${c.accent}`, padding: '24px 56px', marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: headFont, fontSize: 16, fontWeight: 900, letterSpacing: '0.15em', color: c.text, textTransform: 'uppercase' }}>{spec.venueName}</div>
        <div style={{ fontFamily: bodyFont, fontSize: 9, letterSpacing: '0.2em', color: c.accent, textTransform: 'uppercase' }}>Powered by HESTIA v5.2</div>
      </div>
    </div>
  )
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function MenuRenderer({ spec }) {
  // DEBUG — remove after diagnosis
  console.log('[MENU-RENDERER] received spec:', spec)
  console.log('[MENU-RENDERER] templateBase:', spec?.templateBase)
  console.log('[MENU-RENDERER] sections count:', spec?.sections?.length)
  console.log('[MENU-RENDERER] cocktails count:', spec?.cocktails?.length)

  if (!spec?.templateBase && !spec?.venueName) return null

  switch (spec.templateBase) {
    case 'DARK_LUXURY':   return <DarkLuxuryTemplate   spec={spec} />
    case 'MEDITERRANEAN': return <MediterraneanTemplate spec={spec} />
    case 'MODERN_GRID':   return <ModernGridTemplate    spec={spec} />
    case 'EDITORIAL':     return <EditorialTemplate     spec={spec} />
    case 'GRAPHIC_BOLD':  return <GraphicBoldTemplate   spec={spec} />
    default:              return <DarkLuxuryTemplate    spec={spec} />
  }
}
