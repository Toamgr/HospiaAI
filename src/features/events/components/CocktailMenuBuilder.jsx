import React, { useState, useEffect } from 'react'
import { apiPost, apiPatch } from '../../../services/api/client'
import { fetchCocktailMenu } from '../../../services/api/eventsApi'
import { buildKnowledgeContext } from '../../../domain/hospitality/bar/cocktailKnowledgeBase/index.js'
import { getPricingContextSummary } from '../../../domain/hospitality/bar/cocktailLabPricingAdapter.js'

const FLAVOR_PILLS = ['Citrus', 'Floral', 'Tropical', 'Herbal', 'Spicy', 'Smoky', 'Sweet', 'Bitter']
const RESTRICTION_PILLS = ['No Gluten', 'No Nuts', 'Low ABV', 'Alcohol-Free Option', 'Kosher']

const EVENT_TYPE_LABELS = {
  wedding: 'Wedding', corporate: 'Corporate Event', private: 'Private Party',
  bar_event: 'Bar Event', other: 'Event'
}

const COLOR_MAP = {
  campari: '#E8272A', aperol: '#FF6B35', 'blue curacao': '#0096FF',
  midori: '#4CAF50', espresso: '#2C1A0E', coffee: '#3E2723',
  rum: '#C8860A', bourbon: '#B5651D', whiskey: '#B5651D',
  gin: '#F0F0E8', vodka: '#F5F5F5', tequila: '#F5F5DC',
  mezcal: '#8D6E63', 'red wine': '#722F37', 'rosé': '#FFB7C5',
  'white wine': '#F0E68C', prosecco: '#F0E68C', champagne: '#F0E68C',
  amaretto: '#CC7722', kahlua: '#2C1A0E', baileys: '#C8A882',
  'blue butterfly': '#7B68EE', grenadine: '#C41E3A',
  'passion fruit': '#FF6B00', passionfruit: '#FF6B00', mango: '#FF8C00', strawberry: '#FF3333',
  raspberry: '#C21460', 'raspberry puree': '#C21460', 'raspberry syrup': '#C21460',
  blueberry: '#4169E1', watermelon: '#FC6C85',
  violet: '#7B68EE', 'violet liqueur': '#7B68EE', 'creme de violette': '#7B68EE',
  blackberry: '#4A0E4E', blackcurrant: '#4B0082',
  hibiscus: '#B5294E', 'butterfly pea': '#4B0096', dragonfruit: '#FF1493',
  lychee: '#FFB7C5', peach: '#FFCBA4',
  cucumber: '#90EE90', mint: '#98FF98', basil: '#4CAF50',
  matcha: '#8FBC8F', lavender: '#B57EDC', rose: '#FFB7C5',
  'cold brew': '#2C1A0E', coconut: '#F5F5DC', pineapple: '#FFD700',
  lime: '#32CD32', lemon: '#FFF44F', grapefruit: '#FF6347',
  orange: '#FF8C00', cranberry: '#DC143C', pomegranate: '#C41E3A',
}

const COLOR_PRIORITY = [
  'campari', 'aperol', 'blue curacao', 'midori', 'violet', 'violet liqueur',
  'creme de violette', 'blackberry', 'blackcurrant', 'raspberry', 'raspberry puree',
  'raspberry syrup', 'hibiscus', 'butterfly pea', 'dragonfruit', 'grenadine',
  'cranberry', 'pomegranate', 'strawberry', 'watermelon',
  'rum', 'whiskey', 'bourbon', 'espresso', 'coffee', 'kahlua', 'cold brew',
  'red wine', 'rosé', 'mezcal', 'amaretto',
  'blueberry', 'passion fruit', 'passionfruit', 'mango', 'grapefruit', 'orange',
  'lime', 'lemon', 'pineapple', 'matcha', 'lavender', 'cucumber', 'mint',
  'basil', 'peach', 'lychee', 'rose', 'baileys',
  'gin', 'vodka', 'tequila', 'white wine', 'prosecco', 'champagne', 'coconut',
]

// ─── Event Beverage Intelligence helpers ──────────────────────────────────────

const PRICING_SIGNAL_RE = /cost|price|budget|cheap|expensive|afford|margin|₪|\bnis\b/i

const FLAVOR_TO_SPIRIT_HINT = {
  Citrus: ['gin', 'vodka', 'tequila'],
  Floral: ['gin', 'elderflower'],
  Tropical: ['rum', 'tequila'],
  Herbal: ['gin', 'vermouth'],
  Spicy: ['tequila', 'mezcal'],
  Smoky: ['mezcal', 'whisky'],
  Sweet: ['rum', 'liqueur'],
  Bitter: ['campari', 'aperol'],
}

function inferEventPricingHints(flavors = []) {
  const hints = new Set()
  for (const f of flavors) for (const h of (FLAVOR_TO_SPIRIT_HINT[f] || [])) hints.add(h)
  return [...hints]
}

function buildEventMenuPrompt({ event, form, knowledgeContext, pricingContext }) {
  const eventType = EVENT_TYPE_LABELS[event.event_type] || event.event_type || 'Event'
  const guestCount = event.expected_guests
  const flavorStr = form.flavors.length ? form.flavors.join(', ') : 'No strong preference'
  const restrictionStr = form.restrictions.length ? form.restrictions.join(', ') : 'None'
  const isHighVolume = guestCount >= 50
  const isKosher = form.restrictions.includes('Kosher')
  const hasLowABV = form.restrictions.includes('Low ABV') || form.restrictions.includes('Alcohol-Free Option')

  const parts = [
    'You are an elite Beverage Director creating an event cocktail menu for a serious hospitality operation.',
    'Think across: flavor balance and differentiation, batchability, service speed, guest diversity,',
    'perceived value, and zero-proof inclusion where needed. Do not produce generic or repetitive menus.',
    'Return strict JSON only.',
    '',
    knowledgeContext || null,
    knowledgeContext ? '' : null,
    pricingContext || null,
    pricingContext ? '' : null,
    `Event: "${event.name}"`,
    `Event type: ${eventType}`,
    guestCount ? `Guest count: ${guestCount}` : null,
    `Cocktails to create: ${form.cocktailCount}`,
    `Flavor profile: ${flavorStr}`,
    `Dietary restrictions / requirements: ${restrictionStr}`,
    `Event vibe: ${form.vibe || 'Not specified'}`,
    `Special notes: ${form.notes || 'None'}`,
    '',
    isHighVolume ? `HIGH-VOLUME SERVICE (${guestCount} guests): prioritize batchability, build time under 30 seconds per cocktail, pre-batch all non-citrus components, garnish must be pre-portionable. No fragile prep.` : null,
    isHighVolume ? '' : null,
    isKosher ? 'KOSHER REQUIRED: avoid wine-based vermouth/sherry unless kosher-certified, avoid cream liqueurs unless kosher-certified dairy, confirm bitters certification with supervising authority.' : null,
    isKosher ? '' : null,
    hasLowABV ? 'INCLUDE LOW-ABV / ZERO-PROOF: design at least one genuine low-ABV or zero-proof option with the same creativity as full-ABV cocktails. Use sherry, vermouth, fortified wine, or a split base. Do not use the word "mocktail".' : null,
    hasLowABV ? '' : null,
    'For liquid_color_hex use the dominant ingredient: Campari=#E8272A, Aperol=#FF6B35, Blue Curacao=#0096FF, Midori=#4CAF50, Espresso/Coffee=#2C1A0E, Rum=#C8860A, Whiskey/Bourbon=#B5651D, Gin/Vodka/Tequila=#F5F5DC, Red wine=#722F37, Rosé=#FFB7C5, White wine/Prosecco/Champagne=#F0E68C.',
    '',
    'Return ONLY valid JSON, no markdown, no code blocks:',
    `{
  "menu_name": "creative name for this cocktail menu",
  "cocktails": [
    {
      "number": 1,
      "name": "cocktail name",
      "tagline": "one evocative sentence",
      "base_spirit": "main spirit",
      "ingredients": [{ "name": "ingredient name", "amount_ml": 45, "unit": "ml" }],
      "method": "shaken or stirred or built or blended",
      "garnish": "garnish description",
      "glassware": "e.g. Coupe, Rocks, Highball, Nick & Nora, Collins, Shot",
      "flavor_map": { "sweet": 5, "sour": 6, "bitter": 3, "salty": 1, "smoky": 0, "spicy": 0, "creamy": 1, "savory": 0 },
      "flavor_notes": "2-3 flavor descriptors",
      "allergen_notes": "any allergen info or null",
      "pour_cost_estimate": "e.g. ₪18-22",
      "liquid_color_hex": "#F5A623",
      "batch_notes": "e.g. Pre-batch base + syrup, add citrus and shake per order — ~20 sec build",
      "service_speed": "fast",
      "operational_difficulty": 2,
      "why_fits_event": "brief note on why this suits the event format",
      "zero_proof_alternative": "suggested NA version or null",
      "cost_confidence": "medium"
    }
  ]
}`,
  ]

  return parts.filter(p => p !== null).join('\n')
}

function buildReplacementPrompt({ event, cocktail, index, otherNames, replaceInstruction, flavorStr, knowledgeContext }) {
  const eventType = EVENT_TYPE_LABELS[event.event_type] || event.event_type || 'Event'
  const guestCount = event.expected_guests
  const isHighVolume = guestCount >= 50

  const parts = [
    'You are an elite Beverage Director replacing one cocktail in an existing event cocktail menu.',
    '',
    `Event: "${event.name}" (${eventType}${guestCount ? `, ${guestCount} guests` : ''})`,
    `Cocktail being replaced: ${cocktail.name}`,
    `Remaining menu: ${otherNames || 'none'}`,
    `Replacement instruction: ${replaceInstruction}`,
    `Event flavor profile: ${flavorStr}`,
    '',
    isHighVolume ? `HIGH-VOLUME: keep service speed under 30 seconds, minimal garnish complexity.` : null,
    isHighVolume ? '' : null,
    knowledgeContext || null,
    knowledgeContext ? '' : null,
    'Design the replacement to be differentiated from existing menu cocktails, operationally practical, and suited to the event format.',
    'Return ONLY a single cocktail JSON object, no markdown:',
    '',
    `{
  "number": ${index + 1},
  "name": "new cocktail name",
  "tagline": "one evocative sentence",
  "base_spirit": "main spirit",
  "ingredients": [{ "name": "ingredient name", "amount_ml": 45, "unit": "ml" }],
  "method": "shaken or stirred or built or blended",
  "garnish": "garnish description",
  "glassware": "e.g. Coupe, Rocks, Highball, Nick & Nora, Collins, Shot",
  "flavor_map": { "sweet": 5, "sour": 6, "bitter": 3, "salty": 1, "smoky": 0, "spicy": 0, "creamy": 1, "savory": 0 },
  "flavor_notes": "2-3 flavor descriptors",
  "allergen_notes": "any allergen info or null",
  "pour_cost_estimate": "e.g. ₪18-22",
  "liquid_color_hex": "#F5A623",
  "batch_notes": null,
  "service_speed": "fast",
  "operational_difficulty": 2,
  "why_fits_event": null,
  "zero_proof_alternative": null,
  "cost_confidence": "medium"
}`,
  ]

  return parts.filter(p => p !== null).join('\n')
}

function resolveColor(cocktail) {
  if (cocktail.liquid_color_hex) return cocktail.liquid_color_hex
  const matches = []
  for (const ing of (cocktail.ingredients || [])) {
    const name = (typeof ing === 'object' ? ing.name : ing)?.toLowerCase() || ''
    for (const [key, color] of Object.entries(COLOR_MAP)) {
      if (name.includes(key)) matches.push({ key, color })
    }
  }
  if (!matches.length) return '#C8A882'
  matches.sort((a, b) => {
    const ai = COLOR_PRIORITY.indexOf(a.key)
    const bi = COLOR_PRIORITY.indexOf(b.key)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
  return matches[0].color
}

function PillSelect({ options, selected, onChange }) {
  function toggle(pill) {
    onChange(selected.includes(pill) ? selected.filter(p => p !== pill) : [...selected, pill])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(pill => (
        <button
          key={pill}
          type="button"
          onClick={() => toggle(pill)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selected.includes(pill)
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
          }`}
        >
          {pill}
        </button>
      ))}
    </div>
  )
}

function glasswareEmoji(glassware) {
  if (!glassware) return '🍹'
  const g = glassware.toLowerCase()
  if (g.includes('coupe') || g.includes('nick') || g.includes('nora') || g.includes('martini')) return '🍸'
  if (g.includes('rocks') || g.includes('old fashioned') || g.includes('shot')) return '🥃'
  if (g.includes('highball') || g.includes('collins') || g.includes('tall')) return '🥤'
  if (g.includes('flute') || g.includes('champagne')) return '🥂'
  return '🍹'
}

function FlavorMapSVG({ scores }) {
  const AXES = ['sweet', 'sour', 'bitter', 'salty', 'smoky', 'spicy', 'creamy', 'savory']
  const LABELS = ['Sweet', 'Sour', 'Bitter', 'Salty', 'Smoky', 'Spicy', 'Creamy', 'Savory']
  const size = 160
  const center = 80
  const radius = 65
  const n = AXES.length

  function toXY(angle, r) {
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  const polygon = AXES.map((key, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const val = Math.min(10, Math.max(0, scores?.[key] || 0))
    const p = toXY(angle, (val / 10) * radius)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto">
      {[0.2, 0.4, 0.6, 0.8, 1].map(frac => {
        const pts = AXES.map((_, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2
          const p = toXY(angle, radius * frac)
          return `${p.x},${p.y}`
        }).join(' ')
        return <polygon key={frac} points={pts} fill="none" stroke="#3f3f46" strokeWidth="0.5" />
      })}
      {AXES.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const end = toXY(angle, radius)
        return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#3f3f46" strokeWidth="0.5" />
      })}
      <polygon points={polygon} fill="#C9A96E" fillOpacity="0.3" stroke="#C9A96E" strokeWidth="1.5" />
      {AXES.map((key, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const p = toXY(angle, radius + 12)
        return (
          <text key={key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#71717a">
            {LABELS[i]}
          </text>
        )
      })}
    </svg>
  )
}

function CocktailVisualSVG({ glassware, liquidColor, garnish, cocktailName, uid }) {
  const g = (glassware || '').toLowerCase()
  const hasBubbles = /soda|tonic|prosecco|champagne|sparkling/.test(
    ((garnish || '') + ' ' + (cocktailName || '')).toLowerCase()
  )

  let glassType = 'rocks'
  if (g.includes('coupe') || g.includes('nick') || g.includes('nora')) glassType = 'coupe'
  else if (g.includes('martini')) glassType = 'martini'
  else if (g.includes('highball') || g.includes('collins') || g.includes('tall')) glassType = 'highball'
  else if (g.includes('flute')) glassType = 'flute'
  else if (g.includes('shot')) glassType = 'shot'

  const GLASS = {
    rocks: {
      outline: 'M 22,42 L 98,42 L 93,115 L 27,115 Z',
      clipPath: 'M 25,46 L 95,46 L 90,111 L 30,111 Z',
      liquidRect: { x: 10, y: 63, width: 100, height: 48 },
      highlight: { cx: 38, cy: 72, rx: 8, ry: 4 },
      rimX: 88, rimY: 42,
    },
    coupe: {
      outline: 'M 18,38 Q 22,70 44,87 L 57,87 L 57,120 L 40,120 L 80,120 L 63,120 L 63,87 L 76,87 Q 98,70 102,38 Z',
      clipPath: 'M 22,41 Q 26,70 47,84 L 73,84 Q 94,70 98,41 Z',
      liquidRect: { x: 10, y: 52, width: 100, height: 32 },
      highlight: { cx: 34, cy: 60, rx: 9, ry: 4 },
      rimX: 94, rimY: 38,
    },
    highball: {
      outline: 'M 35,18 L 85,18 L 85,120 L 35,120 Z',
      clipPath: 'M 38,22 L 82,22 L 82,117 L 38,117 Z',
      liquidRect: { x: 38, y: 46, width: 44, height: 71 },
      highlight: { cx: 46, cy: 56, rx: 5, ry: 9 },
      rimX: 80, rimY: 18,
    },
    martini: {
      outline: 'M 15,30 L 60,90 L 105,30 Z M 57,90 L 57,118 M 63,90 L 63,118 M 42,118 L 78,118',
      clipPath: 'M 18,33 L 60,87 L 102,33 Z',
      liquidRect: { x: 10, y: 47, width: 100, height: 40 },
      highlight: { cx: 30, cy: 53, rx: 7, ry: 4 },
      rimX: 97, rimY: 30,
    },
    flute: {
      outline: 'M 45,20 L 75,20 L 70,120 L 50,120 Z',
      clipPath: 'M 48,24 L 72,24 L 67,117 L 53,117 Z',
      liquidRect: { x: 48, y: 47, width: 24, height: 70 },
      highlight: { cx: 55, cy: 57, rx: 3, ry: 8 },
      rimX: 72, rimY: 20,
    },
    shot: {
      outline: 'M 38,70 L 82,70 L 79,120 L 41,120 Z',
      clipPath: 'M 41,73 L 79,73 L 76,117 L 44,117 Z',
      liquidRect: { x: 41, y: 84, width: 38, height: 33 },
      highlight: { cx: 51, cy: 92, rx: 5, ry: 4 },
      rimX: 76, rimY: 70,
    },
  }

  const cfg = GLASS[glassType]
  const clipId = `cvsclip-${glassType}-${uid}`
  const garnishLower = (garnish || '').toLowerCase()

  let garnishEl = null
  if (garnishLower.includes('lime') || garnishLower.includes('lemon')) {
    const color = garnishLower.includes('lime') ? '#7AC74F' : '#FFF44F'
    garnishEl = (
      <g>
        <circle cx={cfg.rimX} cy={cfg.rimY - 5} r={5} fill={color} opacity={0.9} />
        <line x1={cfg.rimX - 4} y1={cfg.rimY - 5} x2={cfg.rimX + 4} y2={cfg.rimY - 5} stroke="#3a6e14" strokeWidth="0.5" />
      </g>
    )
  } else if (garnishLower.includes('orange')) {
    garnishEl = (
      <g>
        <path d={`M ${cfg.rimX - 5},${cfg.rimY - 2} A 5,5 0 0 1 ${cfg.rimX + 5},${cfg.rimY - 2} Z`} fill="#FF8C00" opacity={0.9} />
        <line x1={cfg.rimX} y1={cfg.rimY - 10} x2={cfg.rimX} y2={cfg.rimY - 2} stroke="#FF8C00" strokeWidth="1" />
      </g>
    )
  } else if (garnishLower.includes('cherry')) {
    garnishEl = (
      <g>
        <circle cx={cfg.rimX} cy={cfg.rimY - 8} r={4} fill="#C41E3A" opacity={0.9} />
        <line x1={cfg.rimX} y1={cfg.rimY - 4} x2={cfg.rimX - 3} y2={cfg.rimY + 2} stroke="#4CAF50" strokeWidth="1" />
      </g>
    )
  } else if (garnishLower.includes('mint')) {
    garnishEl = (
      <g>
        <ellipse cx={cfg.rimX - 2} cy={cfg.rimY - 7} rx={4} ry={2} fill="#4CAF50" opacity={0.85} transform={`rotate(-30 ${cfg.rimX - 2} ${cfg.rimY - 7})`} />
        <ellipse cx={cfg.rimX + 3} cy={cfg.rimY - 9} rx={3} ry={1.5} fill="#4CAF50" opacity={0.85} transform={`rotate(15 ${cfg.rimX + 3} ${cfg.rimY - 9})`} />
      </g>
    )
  } else if (garnishLower.includes('flower') || garnishLower.includes('edible')) {
    garnishEl = (
      <g>
        <circle cx={cfg.rimX} cy={cfg.rimY - 7} r={2.5} fill="#FFB7C5" opacity={0.9} />
        <circle cx={cfg.rimX - 4} cy={cfg.rimY - 9} r={1.5} fill="#FFB7C5" opacity={0.8} />
        <circle cx={cfg.rimX + 4} cy={cfg.rimY - 9} r={1.5} fill="#FFB7C5" opacity={0.8} />
      </g>
    )
  }

  return (
    <svg viewBox="0 0 120 140" width={120} height={140}>
      <defs>
        <clipPath id={clipId}>
          <path d={cfg.clipPath} />
        </clipPath>
      </defs>
      <rect
        x={cfg.liquidRect.x} y={cfg.liquidRect.y}
        width={cfg.liquidRect.width} height={cfg.liquidRect.height}
        fill={liquidColor} fillOpacity={0.80}
        clipPath={`url(#${clipId})`}
      />
      <ellipse
        cx={cfg.highlight.cx} cy={cfg.highlight.cy}
        rx={cfg.highlight.rx} ry={cfg.highlight.ry}
        fill="white" fillOpacity={0.15}
        clipPath={`url(#${clipId})`}
      />
      {hasBubbles && (
        <>
          <circle cx={52} cy={90} r={1.5} fill="white" fillOpacity={0.35} clipPath={`url(#${clipId})`} />
          <circle cx={65} cy={75} r={1} fill="white" fillOpacity={0.3} clipPath={`url(#${clipId})`} />
          <circle cx={58} cy={82} r={1.5} fill="white" fillOpacity={0.3} clipPath={`url(#${clipId})`} />
          <circle cx={72} cy={95} r={1} fill="white" fillOpacity={0.25} clipPath={`url(#${clipId})`} />
        </>
      )}
      <path d={cfg.outline} fill="none" stroke="#52525b" strokeWidth={1.5} strokeLinejoin="round" />
      {garnishEl}
    </svg>
  )
}

function CocktailCard({
  cocktail, index,
  isReplacing, replaceLoading, replaceInstruction, replaceError,
  onStartReplace, onCancelReplace, onInstructionChange, onSubmitReplace
}) {
  // View 1 — loading
  if (replaceLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-48 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-sm text-zinc-300">Building your replacement cocktail…</p>
        </div>
      </div>
    )
  }

  // View 2 — replace form
  if (isReplacing) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500/70">
          Replace Cocktail №{index + 1}
        </p>
        <p className="text-xs text-zinc-600">Replacing: {cocktail.name}</p>
        {replaceError && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">{replaceError}</p>
        )}
        <input
          type="text"
          autoFocus
          placeholder="e.g. something more bitter, less sweet, a gin-based option..."
          value={replaceInstruction}
          onChange={e => onInstructionChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSubmitReplace() } }}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSubmitReplace}
            disabled={!replaceInstruction.trim()}
            className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs font-medium transition-colors"
          >
            {replaceError ? 'Try again' : 'Generate'}
          </button>
          <button
            type="button"
            onClick={onCancelReplace}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // View 3 — normal card
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500/70">
          Cocktail №{index + 1}
        </p>
        <button
          type="button"
          onClick={onStartReplace}
          className="text-xs text-zinc-600 hover:text-amber-400 transition-colors"
        >
          Replace ↺
        </button>
      </div>
      <p className="text-2xl font-light text-white">{cocktail.name}</p>
      {cocktail.tagline && (
        <p className="text-sm italic text-zinc-400 mt-1">{cocktail.tagline}</p>
      )}
      <div className="border-t border-zinc-800 my-3" />
      {cocktail.base_spirit && (
        <span className="inline-block bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full mb-3">
          {cocktail.base_spirit}
        </span>
      )}
      {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
        <ul className="space-y-0.5 mb-3">
          {cocktail.ingredients.map((ing, i) => {
            const isObj = typeof ing === 'object' && ing !== null
            const label = isObj
              ? `${ing.name}${ing.amount_ml != null ? ` — ${ing.amount_ml}${ing.unit || 'ml'}` : ''}`
              : ing
            return (
              <li key={i} className="text-sm text-zinc-300 flex gap-2">
                <span className="text-zinc-600">·</span>{label}
              </li>
            )
          })}
        </ul>
      )}
      {(cocktail.method || cocktail.garnish) && (
        <p className="text-xs text-zinc-500 mt-2">
          {[cocktail.method, cocktail.garnish && `Garnish: ${cocktail.garnish}`].filter(Boolean).join(' — ')}
        </p>
      )}
      {cocktail.glassware && (
        <span className="inline-flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 rounded-full px-2 py-0.5 mt-2">
          {glasswareEmoji(cocktail.glassware)} {cocktail.glassware}
        </span>
      )}
      {cocktail.flavor_notes && (
        <p className="text-xs text-amber-300/80 mt-2">{cocktail.flavor_notes}</p>
      )}
      {(cocktail.glassware || cocktail.flavor_map) && (
        <div className="flex items-end justify-center gap-6 mt-4">
          {cocktail.glassware && (
            <CocktailVisualSVG
              glassware={cocktail.glassware}
              liquidColor={resolveColor(cocktail)}
              garnish={cocktail.garnish}
              cocktailName={cocktail.name}
              uid={index}
            />
          )}
          {cocktail.flavor_map && (
            <FlavorMapSVG scores={cocktail.flavor_map} />
          )}
        </div>
      )}
      {cocktail.allergen_notes && cocktail.allergen_notes !== 'null' && (
        <p className="text-xs text-red-300/70 mt-1">{cocktail.allergen_notes}</p>
      )}
      {cocktail.pour_cost_estimate && (
        <p className="text-xs text-zinc-500 text-right mt-2">{cocktail.pour_cost_estimate}</p>
      )}
      {cocktail.service_speed && (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 ${
          cocktail.service_speed === 'fast' ? 'bg-emerald-900/40 text-emerald-400' :
          cocktail.service_speed === 'slow' ? 'bg-red-900/40 text-red-400' :
          'bg-zinc-800 text-zinc-400'
        }`}>
          {cocktail.service_speed === 'fast' ? '⚡ Fast service' :
           cocktail.service_speed === 'slow' ? '⏳ Slow service' : '⏱ Medium service'}
        </span>
      )}
      {cocktail.batch_notes && cocktail.batch_notes !== 'null' && (
        <p className="text-xs text-zinc-500 mt-1">{cocktail.batch_notes}</p>
      )}
      {cocktail.why_fits_event && cocktail.why_fits_event !== 'null' && (
        <p className="text-xs text-zinc-500 italic mt-1">{cocktail.why_fits_event}</p>
      )}
      {cocktail.zero_proof_alternative && cocktail.zero_proof_alternative !== 'null' && (
        <p className="text-xs text-zinc-400 mt-1">Zero-proof: {cocktail.zero_proof_alternative}</p>
      )}
    </div>
  )
}

export default function CocktailMenuBuilder({ event, tasks, onUpdateTask }) {
  const [menu, setMenu] = useState(null)
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [form, setForm] = useState({ cocktailCount: 4, flavors: [], restrictions: [], vibe: '', notes: '' })
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState(null)
  const [replacingIndex, setReplacingIndex] = useState(null)
  const [replaceInstruction, setReplaceInstruction] = useState('')
  const [replacingLoading, setReplacingLoading] = useState(false)
  const [replaceError, setReplaceError] = useState(null)

  useEffect(() => {
    fetchCocktailMenu(event.id)
      .then(data => {
        if (data.menu) {
          setMenu(data.menu)
          setApproved(data.menu.status === 'approved')
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMenu(false))
  }, [event.id])

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setError(null)
    setGenerating(true)
    setShowForm(false)

    const combinedText = `${event.event_type || ''} event ${event.expected_guests || ''} guests ${form.flavors.join(' ')} ${form.restrictions.join(' ')} ${form.vibe || ''} ${form.notes || ''}`
    const knowledgeForm = { kosherRequirement: form.restrictions.includes('Kosher') ? 'kosher' : '', serviceContext: event.event_type }
    const knowledgeContext = buildKnowledgeContext(combinedText, knowledgeForm)
    const pricingContext = PRICING_SIGNAL_RE.test(combinedText)
      ? getPricingContextSummary(inferEventPricingHints(form.flavors))
      : ''

    const prompt = buildEventMenuPrompt({ event, form, knowledgeContext, pricingContext })

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'AI request failed')

      const rawText = data.answer || ''
      const cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
      const parsed = JSON.parse(cleaned)

      if (!parsed.cocktails || !Array.isArray(parsed.cocktails) || !parsed.cocktails.length) {
        throw new Error('AI returned an unexpected format. Please try again.')
      }

      const saved = await apiPost(`/api/events/${event.id}/cocktail-menu`, {
        menu_name: parsed.menu_name,
        cocktails: parsed.cocktails
      })
      setMenu(saved.menu)
    } catch (err) {
      setError(err.message || 'Failed to generate menu. Please try again.')
      setShowForm(true)
    } finally {
      setGenerating(false)
    }
  }

  async function handleApprove() {
    setApproving(true)
    setError(null)
    try {
      await apiPatch(`/api/events/${event.id}/cocktail-menu/approve`, {})
      const cocktailTask = tasks?.find(t => t.title?.startsWith('Build cocktail menu'))
      if (cocktailTask && onUpdateTask) {
        await onUpdateTask(event.id, cocktailTask.id, { status: 'done' })
      }
      setApproved(true)
    } catch (err) {
      setError(err.message || 'Failed to approve menu.')
    } finally {
      setApproving(false)
    }
  }

  async function handleSubmitReplace(index) {
    setReplacingLoading(true)
    setReplaceError(null)

    const cocktail = menu.cocktails[index]
    const otherNames = menu.cocktails
      .filter((_, i) => i !== index)
      .map(c => c.name)
      .join(', ')
    const flavorStr = form.flavors.length ? form.flavors.join(', ') : 'not specified'

    const replaceText = `event ${event.event_type || ''} ${replaceInstruction} ${flavorStr}`
    const replaceKnowledgeContext = buildKnowledgeContext(replaceText, { kosherRequirement: '' })

    const prompt = buildReplacementPrompt({ event, cocktail, index, otherNames, replaceInstruction, flavorStr, knowledgeContext: replaceKnowledgeContext })

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'AI request failed')

      const rawText = data.answer || ''
      const cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
      const newCocktail = JSON.parse(cleaned)

      const updatedCocktails = menu.cocktails.map((c, i) => i === index ? { ...newCocktail, number: index + 1 } : c)
      const saved = await apiPost(`/api/events/${event.id}/cocktail-menu`, {
        menu_name: menu.menu_name,
        cocktails: updatedCocktails
      })
      setMenu(saved.menu)
      setApproved(false)
      setReplacingIndex(null)
      setReplaceInstruction('')
    } catch (err) {
      setReplaceError(err.message || 'Failed to generate replacement. Try again.')
    } finally {
      setReplacingLoading(false)
    }
  }

  if (loadingMenu) return null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Cocktail Menu</p>
          {approved && (
            <span className="text-xs text-amber-400 font-medium">✓ Approved</span>
          )}
        </div>
        {menu && !generating && (
          <button
            type="button"
            onClick={() => { setMenu(null); setApproved(false); setShowForm(true); setError(null) }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Rebuild menu
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Generating state */}
        {generating && (
          <div className="text-center py-8 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-sm text-zinc-300">
                HESTIA AI is building your cocktail menu for{' '}
                <span className="text-white font-medium">{event.name}</span>…
              </p>
            </div>
            <p className="text-xs text-zinc-600">This usually takes 10–20 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && !generating && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-2">{error}</p>
        )}

        {/* No menu yet */}
        {!menu && !generating && (
          !showForm ? (
            <div className="text-center py-6">
              <p className="text-sm text-zinc-500 mb-4">
                No cocktail menu yet. Generate one based on this event's profile.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
              >
                Build Cocktail Menu
              </button>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Number of cocktails</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={form.cocktailCount}
                  onChange={e => setField('cocktailCount', Number(e.target.value))}
                  className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Flavor profile</label>
                <PillSelect options={FLAVOR_PILLS} selected={form.flavors} onChange={v => setField('flavors', v)} />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Dietary restrictions</label>
                <PillSelect options={RESTRICTION_PILLS} selected={form.restrictions} onChange={v => setField('restrictions', v)} />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Event vibe</label>
                <input
                  type="text"
                  placeholder="outdoor garden wedding, romantic, summer evening..."
                  value={form.vibe}
                  onChange={e => setField('vibe', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">
                  Special notes <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <textarea
                  placeholder="e.g. bride doesn't drink gin, they love floral cocktails..."
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
                >
                  Generate Menu
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )
        )}

        {/* Menu cards */}
        {menu && !generating && (
          <>
            {menu.menu_name && (
              <p className="text-xs text-zinc-500 uppercase tracking-widest">{menu.menu_name}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menu.cocktails.map((cocktail, i) => (
                <CocktailCard
                  key={i}
                  cocktail={cocktail}
                  index={i}
                  isReplacing={replacingIndex === i}
                  replaceLoading={replacingLoading && replacingIndex === i}
                  replaceInstruction={replacingIndex === i ? replaceInstruction : ''}
                  replaceError={replacingIndex === i ? replaceError : null}
                  onStartReplace={() => { setReplacingIndex(i); setReplaceInstruction(''); setReplaceError(null) }}
                  onCancelReplace={() => { setReplacingIndex(null); setReplaceInstruction(''); setReplaceError(null) }}
                  onInstructionChange={setReplaceInstruction}
                  onSubmitReplace={() => handleSubmitReplace(i)}
                />
              ))}
            </div>
            {approved ? (
              <p className="text-center text-sm text-emerald-400 font-medium py-2">
                Menu approved and saved to this event ✓
              </p>
            ) : (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-sm font-medium transition-colors"
              >
                {approving ? 'Approving…' : 'Approve Menu'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
