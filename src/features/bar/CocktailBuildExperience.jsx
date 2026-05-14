import { useState, useMemo, useRef, useEffect, Fragment } from 'react'
import {
  normalizeCocktailBuildData,
  inferBuildCompleteness,
  buildStepSequence,
  getBuildWarnings,
} from './cocktailBuildExperienceUtils.js'

// ─── Visual helpers (display-only — not pricing) ──────────────────────────────

function ingredientDisplayColor(name = '') {
  const n = name.toLowerCase()
  if (/gin|vodka|rum|tequila|mezcal|whisky|whiskey|brandy|cognac|pisco|arak/.test(n)) return '#c9a96e'
  if (/lime|lemon|yuzu/.test(n)) return '#b8c830'
  if (/grapefruit|orange juice|pineapple|mango|passion/.test(n)) return '#e06820'
  if (/syrup|honey|agave|sugar|cordial|grenadine/.test(n)) return '#a04820'
  if (/vermouth/.test(n)) return '#c0a870'
  if (/aperol/.test(n)) return '#e04000'
  if (/campari/.test(n)) return '#900000'
  if (/liqueur|triple.?sec|cointreau|amaro|chartreuse|coffee liqueur/.test(n)) return '#7a2800'
  if (/soda|tonic|ginger.?beer|club soda|water|carbonat/.test(n)) return '#7890a0'
  if (/cream|egg.?white|milk|coconut/.test(n)) return '#d8c8a0'
  if (/bitter/.test(n)) return '#3a1400'
  if (/juice/.test(n)) return '#a0b840'
  return '#9a7850'
}

function glassShapeFor(glassware = '') {
  const g = (glassware || '').toLowerCase()
  if (/highball|collins|tall/.test(g)) return 'highball'
  if (/rocks|old.?fashion|lowball/.test(g)) return 'rocks'
  if (/martini|nick.?nora/.test(g)) return 'martini'
  return 'coupe'
}

// Glass definitions — coordinates in a 120×200 viewBox.
// clip: SVG polygon points for the bowl interior (fill is clipped to this).
// fillBottom / fillHeight: fill starts at fillBottom and grows upward.
// Outline rendered as separate decorative SVG paths.
const GLASS_DEFS = {
  coupe: {
    clip: '15,36 105,36 68,124 52,124',
    fillBottom: 124, fillHeight: 88,
  },
  highball: {
    clip: '29,22 91,22 91,174 29,174',
    fillBottom: 174, fillHeight: 152,
  },
  rocks: {
    clip: '18,74 102,74 102,166 18,166',
    fillBottom: 166, fillHeight: 92,
  },
  martini: {
    clip: '10,36 110,36 66,124 54,124',
    fillBottom: 124, fillHeight: 88,
  },
}

function GlassOutline({ shape }) {
  const stroke = 'rgba(201,169,110,0.32)'
  const w = '1.5'
  const cap = 'round'
  const join = 'round'
  if (shape === 'highball') return (
    <>
      <path d="M29,22 L29,176 L91,176 L91,22" stroke={stroke} strokeWidth={w} fill="none" strokeLinecap={cap} strokeLinejoin={join} />
      <line x1="29" y1="22" x2="91" y2="22" stroke={stroke} strokeWidth="1" strokeLinecap={cap} opacity="0.5" />
    </>
  )
  if (shape === 'rocks') return (
    <>
      <path d="M18,74 L18,168 L102,168 L102,74" stroke={stroke} strokeWidth={w} fill="none" strokeLinecap={cap} strokeLinejoin={join} />
      <line x1="18" y1="74" x2="102" y2="74" stroke={stroke} strokeWidth="1" strokeLinecap={cap} opacity="0.5" />
    </>
  )
  if (shape === 'martini') return (
    <>
      <path d="M54,122 L10,36 L110,36 L66,122" stroke={stroke} strokeWidth={w} fill="none" strokeLinecap={cap} strokeLinejoin={join} />
      <line x1="60" y1="122" x2="60" y2="162" stroke={stroke} strokeWidth="2" strokeLinecap={cap} opacity="0.7" />
      <line x1="42" y1="162" x2="78" y2="162" stroke={stroke} strokeWidth="2" strokeLinecap={cap} opacity="0.7" />
    </>
  )
  // coupe (default)
  return (
    <>
      <path d="M52,124 L15,36 L105,36 L68,124" stroke={stroke} strokeWidth={w} fill="none" strokeLinecap={cap} strokeLinejoin={join} />
      <line x1="60" y1="124" x2="60" y2="162" stroke={stroke} strokeWidth="2" strokeLinecap={cap} opacity="0.6" />
      <line x1="42" y1="162" x2="78" y2="162" stroke={stroke} strokeWidth="2" strokeLinecap={cap} opacity="0.6" />
    </>
  )
}

// Visual default for unknown quantities — only used to proportion the display, never shown as text.
const VISUAL_DEFAULT_ML = 30

function BuildGlassVisual({ steps, currentStepIndex, glassware }) {
  const clipId = useRef(`bgc-${Math.random().toString(36).slice(2, 8)}`).current
  const shape = glassShapeFor(glassware)
  const glassDef = GLASS_DEFS[shape]

  const ingSteps = steps.filter(s => s.type === 'ingredient')
  const totalMl = ingSteps.reduce((s, step) => s + (step.ingredient?.ml || VISUAL_DEFAULT_ML), 0) || 1

  const completedIng = steps.slice(0, currentStepIndex + 1).filter(s => s.type === 'ingredient')

  let currentY = glassDef.fillBottom
  const fillLayers = completedIng.map((step, i) => {
    const ml = step.ingredient?.ml || VISUAL_DEFAULT_ML
    const h = Math.max(1, (ml / totalMl) * glassDef.fillHeight)
    const y = currentY - h
    currentY = y
    return { key: i, y, h: h + 0.5, color: ingredientDisplayColor(step.ingredient?.name || '') }
  })

  const isEmpty = fillLayers.length === 0
  const isFull = completedIng.length === ingSteps.length && ingSteps.length > 0

  return (
    <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <defs>
        <clipPath id={clipId}>
          <polygon points={glassDef.clip} />
        </clipPath>
      </defs>

      {/* Glass interior tint */}
      <polygon points={glassDef.clip} fill="rgba(201,169,110,0.04)" />

      {/* Ingredient fill layers — clipped to bowl shape */}
      <g clipPath={`url(#${clipId})`}>
        {fillLayers.map(layer => (
          <rect key={layer.key} x="0" y={layer.y} width="120" height={layer.h}
            fill={layer.color} opacity="0.72" />
        ))}
        {/* Subtle shine stripe */}
        {!isEmpty && (
          <polygon points={glassDef.clip} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="8"
            strokeDasharray="4 200" />
        )}
      </g>

      {/* Glass outline on top of fill */}
      <GlassOutline shape={shape} />

      {/* "Full" shimmer indicator when all ingredients added */}
      {isFull && (
        <polygon points={glassDef.clip}
          fill="none" stroke="rgba(201,169,110,0.18)" strokeWidth="3" />
      )}

      {/* Empty state hint */}
      {isEmpty && (
        <text x="60" y="115" textAnchor="middle" fontSize="9"
          fill="rgba(232,220,192,0.18)" fontFamily="monospace">empty</text>
      )}
    </svg>
  )
}

// ─── Step timeline ─────────────────────────────────────────────────────────────

function StepTimeline({ steps, currentStepIndex }) {
  return (
    <div className="flex items-center gap-0.5 mb-5">
      {steps.map((step, i) => (
        <Fragment key={step.id}>
          <div className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
            i < currentStepIndex  ? 'bg-[#c9a96e]/60' :
            i === currentStepIndex ? 'bg-[#c9a96e] ring-2 ring-[#c9a96e]/25 ring-offset-1 ring-offset-black/80' :
            'bg-[#e8dcc0]/10'
          }`} />
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px transition-colors duration-300 ${
              i < currentStepIndex ? 'bg-[#c9a96e]/35' : 'bg-[#e8dcc0]/06'
            }`} />
          )}
        </Fragment>
      ))}
    </div>
  )
}

// ─── Step type labels & accent colors ─────────────────────────────────────────

const STEP_TYPE_META = {
  prepare:    { label: 'Prepare',        accent: 'text-[#c9a96e]' },
  ice:        { label: 'Ice',            accent: 'text-sky-400/60' },
  ingredient: { label: 'Add Ingredient', accent: 'text-emerald-400/60' },
  method:     { label: 'Method',         accent: 'text-violet-400/60' },
  pour:       { label: 'Serve',          accent: 'text-[#c9a96e]' },
  garnish:    { label: 'Garnish',        accent: 'text-emerald-300/60' },
}

// ─── Guidance card ────────────────────────────────────────────────────────────

const METHOD_DETAIL_THRESHOLD = 120

function StepGuidanceCard({ step, stepNumber, totalSteps, completedIng }) {
  const meta = STEP_TYPE_META[step.type] || { label: step.type, accent: 'text-[#e8dcc0]/40' }
  const [detailExpanded, setDetailExpanded] = useState(false)

  const isLongMethodDetail = step.type === 'method' && step.detail.length > METHOD_DETAIL_THRESHOLD

  return (
    <div className="flex-1 space-y-3 min-w-0">
      {/* Step type + counter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[9px] font-black uppercase tracking-[0.24em] ${meta.accent}`}>{meta.label}</span>
        <span className="text-[#e8dcc0]/18">·</span>
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/28">
          {stepNumber} / {totalSteps}
        </span>
      </div>

      {/* Step title */}
      <div className="text-xl font-black leading-tight text-[#f5f5f0]">{step.title}</div>

      {/* Detail text — long method descriptions get expand/collapse */}
      {isLongMethodDetail ? (
        <div>
          <p className="text-sm leading-[1.8] text-[#e8dcc0]/65">
            {detailExpanded ? step.detail : step.detail.slice(0, METHOD_DETAIL_THRESHOLD).trimEnd() + '…'}
          </p>
          <button
            onClick={() => setDetailExpanded(v => !v)}
            className="mt-1 text-[10px] font-bold text-[#c9a96e]/55 transition hover:text-[#c9a96e]"
          >
            {detailExpanded ? 'Show less' : 'Show full'}
          </button>
        </div>
      ) : (
        <p className="text-sm leading-[1.8] text-[#e8dcc0]/65">{step.detail}</p>
      )}

      {/* Data note — shown when field is missing */}
      {step.dataNote && (
        <div className="flex items-start gap-2 rounded-lg border border-[#e8dcc0]/08 bg-black/25 px-3 py-2">
          <span className="mt-0.5 shrink-0 text-[10px] text-[#e8dcc0]/25">—</span>
          <span className="text-[10px] leading-relaxed text-[#e8dcc0]/32">{step.dataNote}</span>
        </div>
      )}

      {/* Ingredient chip for ingredient steps */}
      {step.type === 'ingredient' && step.ingredient && (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/06 px-3 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: ingredientDisplayColor(step.ingredient.name || '') }} />
          <span className="text-[11px] font-bold text-[#e8dcc0]">{step.ingredient.name}</span>
          <span className="font-mono text-[11px] text-[#e8dcc0]/40">
            {step.ingredient.quantityKnown ? `${step.ingredient.ml}ml` : 'qty unavailable'}
          </span>
        </div>
      )}

      {/* Accumulated ingredient chips */}
      {completedIng.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {completedIng.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dcc0]/08 bg-black/20 px-2 py-0.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: ingredientDisplayColor(s.ingredient?.name || '') }} />
              <span className="text-[9px] font-medium text-[#e8dcc0]/50">{s.ingredient?.name}</span>
              {s.ingredient?.quantityKnown && (
                <span className="font-mono text-[9px] text-[#e8dcc0]/28">{s.ingredient.ml}ml</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── No-recipe placeholder ────────────────────────────────────────────────────

function NoRecipeView() {
  return (
    <div className="py-8 text-center">
      <div className="mb-3 text-3xl text-[#e8dcc0]/15">◻</div>
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e8dcc0]/28">
        No Verified Build Sequence Yet
      </div>
      <p className="mt-2 max-w-xs mx-auto text-xs leading-6 text-[#e8dcc0]/22">
        Add ingredients to this recipe to generate a step-by-step build guide.
      </p>
    </div>
  )
}

// ─── Warnings strip ───────────────────────────────────────────────────────────

function BuildWarningsStrip({ warnings }) {
  if (!warnings.length) return null
  return (
    <div className="mt-4 space-y-1 border-t border-[#e8dcc0]/06 pt-3">
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-[10px] text-[#e8dcc0]/22">—</span>
          <span className="text-[10px] leading-relaxed text-[#e8dcc0]/28">{w}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CocktailBuildExperience({ cocktail }) {
  const [stepIndex, setStepIndex] = useState(0)

  const data        = useMemo(() => normalizeCocktailBuildData(cocktail), [cocktail])
  const completeness = useMemo(() => inferBuildCompleteness(cocktail), [cocktail])
  const steps       = useMemo(() => buildStepSequence(cocktail), [cocktail])
  const warnings    = useMemo(() => getBuildWarnings(cocktail), [cocktail])

  // Reset to step 0 when cocktail changes.
  useEffect(() => { setStepIndex(0) }, [cocktail])

  if (completeness.level === 'none') return <NoRecipeView />

  const currentStep = steps[stepIndex] || steps[0]
  const completedIng = steps.slice(0, stepIndex + 1).filter(s => s.type === 'ingredient')

  const goBack    = () => setStepIndex(i => Math.max(0, i - 1))
  const goForward = () => setStepIndex(i => Math.min(steps.length - 1, i + 1))
  const restart   = () => setStepIndex(0)

  return (
    <div className="mt-5 space-y-4">
      {/* Partial-recipe notice */}
      {completeness.level === 'partial' && (
        <div className="flex items-start gap-2 rounded-lg border border-[#e8dcc0]/08 bg-black/20 px-3 py-2">
          <span className="mt-0.5 shrink-0 text-[10px] text-[#e8dcc0]/30">—</span>
          <span className="text-[10px] leading-relaxed text-[#e8dcc0]/35">
            Partial recipe — some fields are missing. Steps shown for available data only.
          </span>
        </div>
      )}

      {/* Step timeline */}
      <StepTimeline steps={steps} currentStepIndex={stepIndex} />

      {/* Visual + guidance */}
      <div className="grid gap-5 md:grid-cols-[120px_1fr]">
        {/* Glass visual */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-36 w-24">
            <BuildGlassVisual
              steps={steps}
              currentStepIndex={stepIndex}
              glassware={data.glassware}
            />
          </div>
          {data.glassware && (
            <span className="text-[8px] font-black uppercase tracking-widest text-[#e8dcc0]/28 text-center">
              {data.glassware}
            </span>
          )}
        </div>

        {/* Guidance card — keyed to step ID so expanded state resets on navigation */}
        <StepGuidanceCard
          key={currentStep.id}
          step={currentStep}
          stepNumber={stepIndex + 1}
          totalSteps={steps.length}
          completedIng={completedIng}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#c9a96e]/08">
        <button
          onClick={goBack}
          disabled={stepIndex === 0}
          className="rounded-[1rem] border border-[#c9a96e]/20 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e] transition disabled:opacity-25 hover:enabled:bg-[#c9a96e]/10"
        >
          ← Back
        </button>

        <span className="flex-1 text-center text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/25">
          {stepIndex + 1} / {steps.length}
        </span>

        <button
          onClick={restart}
          className="rounded-[1rem] border border-[#e8dcc0]/08 bg-black/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/30 transition hover:text-[#e8dcc0]/55"
          title="Restart"
        >
          ↺
        </button>

        <button
          onClick={goForward}
          disabled={stepIndex === steps.length - 1}
          className="rounded-[1rem] bg-[#c9a96e] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#11100d] transition disabled:opacity-25 hover:enabled:bg-[#dfc497]"
        >
          Next →
        </button>
      </div>

      <BuildWarningsStrip warnings={warnings} />
    </div>
  )
}
