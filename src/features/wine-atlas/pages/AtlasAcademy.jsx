import { useEffect, useState, useRef } from 'react'
import cellar from '../../../assets/wine-atlas/cellar.jpg'
import glass  from '../../../assets/wine-atlas/glass.jpg'
import { ACADEMY_CHAPTERS } from '../atlasData'

// ─── Design tokens (mirrors wine-atlas.css variables exactly) ──────────────
const C = {
  ivory:        '#f5f0e8',
  parchment:    '#ede6d5',
  foreground:   '#2a1c14',
  burgundy:     '#7a1818',
  burgundyDeep: '#3f0d0d',
  amber:        '#c4950a',
  border:       '#ccb898',
  mutedFg:      '#6b4e38',
  card:         '#f0e5cc',
}
const font = {
  display: 'Cormorant Garamond, Cormorant, serif',
  serif:   'Cormorant Garamond, serif',
  sans:    'Inter, Helvetica Neue, sans-serif',
  mono:    'JetBrains Mono, monospace',
}
const eyebrow = {
  fontFamily: font.sans, fontSize: '0.6875rem', fontWeight: 500,
  letterSpacing: '0.22em', textTransform: 'uppercase', color: C.burgundy,
}

// ─── WSET 2 & 3 curriculum data ────────────────────────────────────────────
const WSET2_MODULES = [
  {
    id: 'w2-01',
    number: '01',
    title: 'Palate Calibration',
    subtitle: 'The sensory instrument',
    duration: '90 min',
    topics: ['Structural variables', 'Acid / Tannin / Alcohol / Sweetness', 'Tasting protocol', 'Reference solutions'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Palate Calibration Science')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Palate Calibration Science')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Palate Calibration Science')?.editorialStory || '',
    tag: 'Foundation',
  },
  {
    id: 'w2-02',
    number: '02',
    title: 'Blind Tasting Logic',
    subtitle: 'Deductive reasoning systems',
    duration: '120 min',
    topics: ['SAT methodology', 'Evidence-based deduction', 'Anchoring & confirmation bias', 'Structural fingerprints'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Blind Tasting Reasoning Systems')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Blind Tasting Reasoning Systems')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Blind Tasting Reasoning Systems')?.editorialStory || '',
    tag: 'Core',
  },
  {
    id: 'w2-03',
    number: '03',
    title: 'Aroma Memory',
    subtitle: 'Architecture of scent',
    duration: '75 min',
    topics: ['Olfactory bulb pathway', 'Neuroplasticity of training', 'Primary / secondary / tertiary', 'Lexicon building'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Aroma Memory Architecture')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Aroma Memory Architecture')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Aroma Memory Architecture')?.editorialStory || '',
    tag: 'Sensory',
  },
  {
    id: 'w2-04',
    number: '04',
    title: 'The Major Regions',
    subtitle: 'Old World to New World',
    duration: '150 min',
    topics: ['France: Bordeaux, Burgundy, Rhône', 'Italy, Spain, Germany', 'New World: Chile, Argentina, Australia', 'Climate classification'],
    description: "A systematic survey of the world's most important wine regions through the lens of climate, geology, and structural fingerprints. Each region is taught as a cause-and-effect system — not a list of facts, but a logic to understand.",
    science: 'Regional structural profiles emerge from the intersection of macroclimate (Winkler Index, Huglin Index), soil CEC, and grape variety physiology. Continental climates produce high acid; maritime climates produce medium acid with greater body variation.',
    story: 'A map is not a list of names. A map is an argument — a claim about how heat, water, and stone conspire to produce a particular kind of beauty. To read it properly, you must learn to see the invisible forces underneath.',
    tag: 'Geography',
  },
  {
    id: 'w2-05',
    number: '05',
    title: 'The Grape Varieties',
    subtitle: 'Twelve varieties that shaped the world',
    duration: '120 min',
    topics: ['Cabernet Sauvignon', 'Pinot Noir', 'Chardonnay', 'Riesling', 'Syrah / Shiraz', 'Sauvignon Blanc', 'Nebbiolo & Xinomavro'],
    description: 'Each grape variety is a personality, a climate preference, and a structural fingerprint. Level 2 demands mastery of the core twelve: their structural profiles, natural habitats, and diagnostic indicators at blind tasting.',
    science: 'Grape skin thickness determines tannin concentration; cluster compactness determines botrytis susceptibility; ripening speed determines acid retention. Thin-skinned, high-acid = Pinot Noir; thick-skinned, methoxypyrazine-forward = Cabernet Sauvignon.',
    story: 'To know a grape is to know a geography, a history, and a temperament. Nebbiolo without limestone becomes formless. Riesling without cool slate becomes flat. The grape is not independent of its soil — it is a conversation.',
    tag: 'Varietals',
  },
  {
    id: 'w2-06',
    number: '06',
    title: 'Level 2 Examination',
    subtitle: 'Mock exam & SAT evaluation',
    duration: '60 min',
    topics: ['50 MCQ adaptive exam', 'Blind tasting note (SAT)', 'Weakness analysis', 'Exam strategy'],
    description: 'A full-length Level 2 mock examination using the WSET examination format: 50 multiple-choice questions weighted by syllabus importance, plus a structured tasting assessment using the SAT framework.',
    science: 'WSET Level 2 pass mark is 55%. Distinction at 85%+. The examination tests applied knowledge, not memorization — causal reasoning about climate, grape, and structure is rewarded.',
    story: 'The examination room is quiet. On the table: a single glass, a white evaluation sheet, and twelve words that will define the next hour. You have spent six weeks calibrating your palate. Now it speaks without you.',
    tag: 'Examination',
    isExam: true,
  },
]

const WSET3_MODULES = [
  {
    id: 'w3-01',
    number: '01',
    title: 'Terroir Biophysics',
    subtitle: 'Geology to glass',
    duration: '135 min',
    topics: ['CEC & mycorrhizal networks', 'Aquaporins & ABA stress response', 'UV-B & anthocyanin synthesis', 'Volcanic vs. limestone fingerprints'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Terroir Biophysics')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Terroir Biophysics')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Terroir Biophysics')?.editorialStory || '',
    tag: 'Advanced',
  },
  {
    id: 'w3-02',
    number: '02',
    title: 'Wine Chemistry',
    subtitle: 'Volatile compounds & structure',
    duration: '150 min',
    topics: ['Esters, thiols, pyrazines, terpenes', 'Rotundone & rotundone detection', 'Tannin-anthocyanin polymerization', 'Fault identification (Brett, TCA, reduction)'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Advanced Wine Chemistry')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Advanced Wine Chemistry')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Advanced Wine Chemistry')?.editorialStory || '',
    tag: 'Chemistry',
  },
  {
    id: 'w3-03',
    number: '03',
    title: 'Vintage Architecture',
    subtitle: 'Climate & growing season',
    duration: '120 min',
    topics: ['Winkler Index & Huglin Index', 'Frost events & bud damage', 'Diurnal range & acid retention', 'Vintage evaluation logic'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Vintage & Climate Architecture')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Vintage & Climate Architecture')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Vintage & Climate Architecture')?.editorialStory || '',
    tag: 'Climate',
  },
  {
    id: 'w3-04',
    number: '04',
    title: 'Food & Wine Science',
    subtitle: 'Molecular harmony',
    duration: '120 min',
    topics: ['Tannin-protein binding (Camembert Effect)', 'Capsaicin & alcohol amplification', 'Umami & bitterness interaction', 'Eugenol molecular synergy'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Food & Wine Interaction Science')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Food & Wine Interaction Science')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Food & Wine Interaction Science')?.editorialStory || '',
    tag: 'Pairing',
  },
  {
    id: 'w3-05',
    number: '05',
    title: 'Service Psychology',
    subtitle: 'Sommelier at the table',
    duration: '90 min',
    topics: ['Guest profiling & behavioral reading', 'Decanting: sediment & oxygen management', 'Glass engineering & varietal selection', 'Managing collector vs. novice simultaneously'],
    description: ACADEMY_CHAPTERS.find(c => c.title === 'Sommelier Service Psychology')?.body || '',
    science: ACADEMY_CHAPTERS.find(c => c.title === 'Sommelier Service Psychology')?.science || '',
    story: ACADEMY_CHAPTERS.find(c => c.title === 'Sommelier Service Psychology')?.editorialStory || '',
    tag: 'Service',
  },
  {
    id: 'w3-06',
    number: '06',
    title: 'Advanced Regions Deep-Dive',
    subtitle: 'Appellation causality',
    duration: '180 min',
    topics: ['Burgundy Grand Cru hierarchy (cause-effect)', 'Barolo & the Nebbiolo structure', 'Champagne dosage & secondary fermentation', 'Douro Valley schist and root depth'],
    description: "The Level 3 approach to regions is fundamentally different from Level 2: you are not learning facts about appellations, you are learning why each appellation produces the specific structural profile it does. Climate + soil + variety + viticulture + winemaking = wine.",
    science: "Grand Cru Burgundy: Comblanchien limestone at Vosne-Romanée yields maximum minerality; Bâtard-Montrachet's chalk contributes unique textural weight. Each sub-appellation is a distinct geological argument, not a tier of quality.",
    story: "To taste a Gevrey-Chambertin beside a Chambolle-Musigny is to understand the argument of the Côte de Nuits. Gevrey is power and iron. Chambolle is silk and rose petal. Same grape, two kilometers apart, two completely different conversations with the stone.",
    tag: 'Advanced',
  },
  {
    id: 'w3-07',
    number: '07',
    title: 'Level 3 Theory Exam',
    subtitle: 'Essay + short answer',
    duration: '90 min',
    topics: ['Essay evaluation on set topics', 'Short answer questions', 'Tasting note assessed (SAT)', 'Confidence scoring & readiness'],
    description: 'The Level 3 theory examination requires essay-format responses demonstrating causal reasoning — not facts, but the logic connecting climate to grape to wine. Two essays and a full SAT structured tasting note.',
    science: 'WSET Level 3 pass mark is 55%. Distinction at 85%+. The marking scheme rewards demonstrated understanding of WHY, not WHAT. A student who can explain the causal chain from schist to Touriga Nacional structural profile will outscore a student who has memorized appellation names.',
    story: 'The paper is blank. The question asks: "Explain how the geology of the Douro Valley influences the structural profile of Touriga Nacional." You have forty-five minutes. You close your eyes and see the schist — fractured, glittering, vertical — and the roots drilling fifteen meters down through rock to find water. You begin to write.',
    tag: 'Examination',
    isExam: true,
  },
]

// ─── AI Sommelier mock responses ───────────────────────────────────────────
const AI_RESPONSES = {
  default: [
    "An excellent question. Let me approach this from the molecular level first, then bring it back to what you'll experience in the glass.",
    "This is precisely the kind of causal thinking Level 3 rewards. The examiner wants to see the chain, not just the conclusion.",
    "Before I answer, a question for you: what would you expect the structural profile to be, given the geology you described? Let's build the logic together.",
    "In blind tasting, this is a critical diagnostic: when you encounter high acid paired with low-to-medium tannin and pale ruby color, your first structural hypothesis should always be Pinot Noir or Xinomavro. How do you distinguish them?",
  ],
  tasting: [
    "Your note captures the structural framework well. For a WSET-compliant assessment, I'd suggest being more specific about the acid intensity — 'high' versus 'medium-plus' changes the deductive pathway significantly.",
    "The 'mineral' descriptor you've used is common but imprecise. In WSET methodology, we trace minerality back to its chemical origin: is this saline bitterness (volcanic phenolics), or slate-like reduction (cool-climate Riesling reductive winemaking)?",
    "Strong observation on the tannin structure. Grain and dryness are distinct — both matter in the SAT framework. Fine-grained, coating tannins suggest cool-climate continental; coarser, drying tannins suggest extended maceration and warmer climate.",
  ],
  exam: [
    "For exam preparation: the most common Level 3 error is confusing correlation with causation. 'Burgundy is cool' is not enough. 'Burgundy's continental climate with cold winters and short growing seasons preserves tartaric acid and retards full phenolic ripeness' — that's the argument.",
    "The essay question will test your ability to move from general to specific. State the principle. Apply it to the case. Give one precise example. Conclude with the sensory outcome. Four steps, forty-five minutes.",
  ],
}

function getAIResponse(context) {
  const pool = context === 'tasting' ? AI_RESPONSES.tasting
              : context === 'exam'    ? AI_RESPONSES.exam
              : AI_RESPONSES.default
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Components ────────────────────────────────────────────────────────────

function TagBadge({ label }) {
  const colors = {
    Foundation:  { bg: 'rgba(122,24,24,0.10)', color: C.burgundy, border: 'rgba(122,24,24,0.25)' },
    Core:        { bg: 'rgba(196,149,10,0.12)', color: C.amber, border: 'rgba(196,149,10,0.30)' },
    Sensory:     { bg: 'rgba(72,96,42,0.10)', color: '#48602a', border: 'rgba(72,96,42,0.25)' },
    Geography:   { bg: 'rgba(63,13,13,0.08)', color: C.burgundyDeep, border: 'rgba(63,13,13,0.20)' },
    Varietals:   { bg: 'rgba(122,24,24,0.10)', color: C.burgundy, border: 'rgba(122,24,24,0.25)' },
    Examination: { bg: 'rgba(196,149,10,0.18)', color: '#8a6200', border: 'rgba(196,149,10,0.40)' },
    Advanced:    { bg: 'rgba(63,13,13,0.12)', color: C.burgundyDeep, border: 'rgba(63,13,13,0.30)' },
    Chemistry:   { bg: 'rgba(92,64,32,0.10)', color: '#5c4020', border: 'rgba(92,64,32,0.25)' },
    Climate:     { bg: 'rgba(72,96,42,0.10)', color: '#48602a', border: 'rgba(72,96,42,0.25)' },
    Pairing:     { bg: 'rgba(196,149,10,0.12)', color: C.amber, border: 'rgba(196,149,10,0.30)' },
    Service:     { bg: 'rgba(122,24,24,0.08)', color: C.burgundy, border: 'rgba(122,24,24,0.20)' },
  }
  const s = colors[label] || { bg: 'rgba(42,28,20,0.08)', color: C.foreground, border: 'rgba(42,28,20,0.20)' }
  return (
    <span style={{
      fontFamily: font.sans, fontSize: '0.6rem', fontWeight: 600,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '3px 10px', display: 'inline-block',
    }}>
      {label}
    </span>
  )
}

// ─── Lesson drawer ─────────────────────────────────────────────────────────
function LessonDrawer({ module, onClose }) {
  const [tab, setTab] = useState('overview')
  const [tastingNote, setTastingNote] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const drawerRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleTastingSubmit() {
    if (!tastingNote.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setAiResponse(getAIResponse('tasting'))
      setSubmitting(false)
    }, 900)
  }

  function handleAISubmit() {
    if (!aiInput.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setAiResponse(getAIResponse(module.isExam ? 'exam' : 'default'))
      setSubmitting(false)
      setAiInput('')
    }, 900)
  }

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'science',   label: 'Science' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'mentor',    label: 'AI Mentor' },
    ...(module.isExam ? [{ id: 'exam', label: 'Exam Prep' }] : [{ id: 'tasting', label: 'Tasting Lab' }]),
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(26,10,10,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', justifyContent: 'flex-end',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={drawerRef}
        style={{
          width: '100%', maxWidth: '760px',
          background: C.ivory,
          height: '100vh',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          animation: 'wa-slow-fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Drawer header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: C.burgundyDeep,
          padding: '2rem 2.5rem 1.5rem',
          borderBottom: `1px solid rgba(204,184,152,0.25)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: font.mono, fontSize: '0.7rem', color: 'rgba(245,240,232,0.45)' }}>
                  {module.number}
                </span>
                <TagBadge label={module.tag} />
                <span style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.40)' }}>
                  {module.duration}
                </span>
              </div>
              <h2 style={{ fontFamily: font.display, color: C.ivory, fontSize: 'clamp(1.75rem,4vw,3rem)', lineHeight: 1, fontWeight: 400, margin: 0 }}>
                {module.title}
              </h2>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.65)', fontSize: '1rem', marginTop: '0.5rem', marginBottom: 0 }}>
                {module.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.45)', fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0, marginTop: '0.25rem' }}
            >
              Close ×
            </button>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '0', marginTop: '1.5rem', borderTop: '1px solid rgba(204,184,152,0.15)', paddingTop: '1rem' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: tab === t.id ? C.amber : 'rgba(245,240,232,0.40)',
                  borderBottom: `2px solid ${tab === t.id ? C.amber : 'transparent'}`,
                  padding: '0.5rem 1.25rem 0.5rem 0',
                  marginRight: '0.5rem',
                  transition: 'color 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer content */}
        <div style={{ padding: '2.5rem', flex: 1 }}>

          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <p style={{ fontFamily: font.serif, fontSize: '1.2rem', color: C.foreground, lineHeight: 1.7, marginBottom: '2rem', fontStyle: 'italic' }}>
                {module.description}
              </p>
              <div style={{ ...eyebrow, marginBottom: '1.25rem' }}>Topics covered</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {module.topics.map((t, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'baseline', gap: '1rem',
                    padding: '0.75rem 0',
                    borderBottom: `1px solid ${C.border}`,
                    fontFamily: font.serif, fontSize: '1.1rem', color: C.burgundyDeep,
                  }}>
                    <span style={{ fontFamily: font.mono, fontSize: '0.65rem', color: C.mutedFg, flexShrink: 0 }}>{String(i+1).padStart(2,'0')}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Science */}
          {tab === 'science' && (
            <div>
              <div style={{ ...eyebrow, color: C.amber, marginBottom: '1.5rem' }}>Scientific foundation</div>
              <p style={{ fontFamily: font.serif, fontSize: '1.15rem', color: C.foreground, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {module.science}
              </p>
            </div>
          )}

          {/* Editorial */}
          {tab === 'editorial' && (
            <div>
              <div style={{ ...eyebrow, color: C.amber, marginBottom: '1.5rem' }}>From the journal</div>
              <div style={{
                borderLeft: `3px solid ${C.burgundy}`,
                paddingLeft: '1.75rem',
                marginBottom: '2rem',
              }}>
                <p style={{
                  fontFamily: font.serif, fontStyle: 'italic',
                  fontSize: 'clamp(1.1rem,2vw,1.35rem)',
                  color: C.burgundyDeep, lineHeight: 1.75,
                }}>
                  {module.story}
                </p>
              </div>
            </div>
          )}

          {/* AI Mentor */}
          {tab === 'mentor' && (
            <div>
              <div style={{ ...eyebrow, color: C.amber, marginBottom: '0.5rem' }}>AI Sommelier Mentor</div>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: C.mutedFg, fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Ask any question about this module. The mentor adapts to your reasoning level — ask for a simple explanation or a molecular-level breakdown.
              </p>

              {aiResponse && (
                <div style={{
                  background: C.burgundyDeep,
                  padding: '1.5rem 2rem',
                  marginBottom: '1.5rem',
                  borderLeft: `3px solid ${C.amber}`,
                }}>
                  <div style={{ ...eyebrow, color: C.amber, marginBottom: '0.75rem' }}>Mentor Response</div>
                  <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.90)', fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                    {aiResponse}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={`Ask about ${module.title.toLowerCase()}...`}
                  rows={4}
                  style={{
                    fontFamily: font.serif, fontStyle: 'italic',
                    fontSize: '1rem', color: C.foreground,
                    background: C.parchment,
                    border: `1px solid ${C.border}`,
                    padding: '1rem 1.25rem',
                    outline: 'none', resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
                <button
                  onClick={handleAISubmit}
                  disabled={submitting || !aiInput.trim()}
                  style={{
                    alignSelf: 'flex-start',
                    fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                    background: submitting ? C.border : C.burgundyDeep,
                    color: C.ivory, border: 'none', padding: '0.75rem 2rem',
                    cursor: submitting ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'Thinking...' : 'Ask the mentor'}
                </button>
              </div>

              {/* Starter prompts */}
              <div style={{ marginTop: '2rem' }}>
                <div style={{ ...eyebrow, marginBottom: '1rem' }}>Suggested questions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    `Explain the causal chain between ${module.topics[0]?.toLowerCase()} and wine structure`,
                    `What does a WSET examiner want to see on this topic?`,
                    `Give me the diagnostic indicators for a Level 3 blind tasting assessment`,
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setAiInput(q)}
                      style={{
                        background: 'none',
                        border: `1px solid ${C.border}`,
                        textAlign: 'left', cursor: 'pointer',
                        padding: '0.75rem 1rem',
                        fontFamily: font.serif, fontStyle: 'italic',
                        fontSize: '0.95rem', color: C.mutedFg,
                        transition: 'border-color 0.2s, color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.burgundy; e.currentTarget.style.color = C.burgundyDeep }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mutedFg }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tasting Lab */}
          {tab === 'tasting' && (
            <div>
              <div style={{ ...eyebrow, color: C.amber, marginBottom: '0.5rem' }}>Tasting Laboratory</div>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: C.mutedFg, fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Write a structured tasting note using the SAT framework. The AI mentor will evaluate your structural accuracy, WSET compliance, and sensory vocabulary.
              </p>

              {/* SAT framework guide */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: C.border, marginBottom: '2rem' }}>
                {[
                  { label: 'Appearance', items: ['Clarity', 'Intensity', 'Colour', 'Other observations'] },
                  { label: 'Nose', items: ['Condition', 'Intensity', 'Aroma characteristics', 'Development'] },
                  { label: 'Palate', items: ['Sweetness', 'Acidity', 'Tannin', 'Alcohol', 'Body', 'Flavour characteristics', 'Finish'] },
                ].map(col => (
                  <div key={col.label} style={{ background: C.parchment, padding: '1rem' }}>
                    <div style={{ ...eyebrow, color: C.burgundy, marginBottom: '0.75rem' }}>{col.label}</div>
                    {col.items.map(item => (
                      <div key={item} style={{ fontFamily: font.serif, fontSize: '0.85rem', color: C.mutedFg, paddingBottom: '0.35rem', borderBottom: `1px solid ${C.border}`, marginBottom: '0.35rem' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <textarea
                value={tastingNote}
                onChange={e => setTastingNote(e.target.value)}
                placeholder="Clear, pale ruby. Medium-minus intensity. Clean. Primary aromas: red cherry, raspberry, dried rose. Palate: dry, high acidity, medium-minus tannin (fine-grained), medium alcohol, medium body, medium+ finish..."
                rows={8}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontFamily: font.serif, fontStyle: 'italic',
                  fontSize: '1rem', color: C.foreground,
                  background: C.ivory,
                  border: `1px solid ${C.border}`,
                  padding: '1.25rem',
                  outline: 'none', resize: 'vertical', lineHeight: 1.7,
                  marginBottom: '1rem',
                }}
              />

              {aiResponse && tab === 'tasting' && (
                <div style={{
                  background: C.burgundyDeep,
                  padding: '1.5rem 2rem',
                  marginBottom: '1.5rem',
                  borderLeft: `3px solid ${C.amber}`,
                }}>
                  <div style={{ ...eyebrow, color: C.amber, marginBottom: '0.75rem' }}>Mentor Evaluation</div>
                  <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.90)', fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                    {aiResponse}
                  </p>
                </div>
              )}

              <button
                onClick={handleTastingSubmit}
                disabled={submitting || !tastingNote.trim()}
                style={{
                  fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                  background: submitting ? C.border : C.burgundyDeep,
                  color: C.ivory, border: 'none', padding: '0.875rem 2.5rem',
                  cursor: submitting ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {submitting ? 'Evaluating...' : 'Submit for evaluation'}
              </button>
            </div>
          )}

          {/* Exam Prep */}
          {tab === 'exam' && (
            <div>
              <div style={{ ...eyebrow, color: C.amber, marginBottom: '0.5rem' }}>Examination Preparation</div>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: C.mutedFg, fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                The AI mentor simulates exam conditions: essay coaching, marking criteria, weak-point detection, and confidence assessment.
              </p>

              {aiResponse && (
                <div style={{
                  background: C.burgundyDeep,
                  padding: '1.5rem 2rem',
                  marginBottom: '1.5rem',
                  borderLeft: `3px solid ${C.amber}`,
                }}>
                  <div style={{ ...eyebrow, color: C.amber, marginBottom: '0.75rem' }}>Exam Mentor</div>
                  <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.90)', fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
                    {aiResponse}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="Draft an exam answer or ask for guidance on a specific topic..."
                  rows={6}
                  style={{
                    fontFamily: font.serif, fontStyle: 'italic',
                    fontSize: '1rem', color: C.foreground,
                    background: C.parchment,
                    border: `1px solid ${C.border}`,
                    padding: '1rem 1.25rem',
                    outline: 'none', resize: 'vertical', lineHeight: 1.6,
                  }}
                />
                <button
                  onClick={handleAISubmit}
                  disabled={submitting || !aiInput.trim()}
                  style={{
                    alignSelf: 'flex-start',
                    fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                    background: submitting ? C.border : C.burgundyDeep,
                    color: C.ivory, border: 'none', padding: '0.75rem 2rem',
                    cursor: submitting ? 'default' : 'pointer',
                  }}
                >
                  {submitting ? 'Evaluating...' : 'Submit for feedback'}
                </button>
              </div>

              {/* Exam intel cards */}
              <div style={{ ...eyebrow, marginBottom: '1rem' }}>Examination intelligence</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: C.border }}>
                {[
                  { label: 'Pass mark', value: '55%' },
                  { label: 'Distinction', value: '85%+' },
                  { label: 'Format', value: 'Theory + Tasting' },
                  { label: 'What examiners reward', value: 'Causal reasoning, not facts' },
                ].map(item => (
                  <div key={item.label} style={{ background: C.parchment, padding: '1rem 1.25rem' }}>
                    <div style={{ ...eyebrow, color: C.mutedFg, marginBottom: '0.35rem' }}>{item.label}</div>
                    <div style={{ fontFamily: font.display, fontSize: '1.4rem', color: C.burgundyDeep }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Module row card ────────────────────────────────────────────────────────
function ModuleRow({ module, onOpen }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      onClick={() => onOpen(module)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '48px 1fr auto',
        alignItems: 'start', gap: '1.5rem',
        padding: '1.5rem 1rem',
        borderTop: `1px solid ${C.border}`,
        cursor: 'pointer',
        background: hovered ? `${C.parchment}88` : 'transparent',
        transition: 'background 0.3s',
      }}
    >
      <div style={{ fontFamily: font.mono, fontSize: '0.75rem', color: C.mutedFg, paddingTop: '0.2rem' }}>
        {module.number}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <TagBadge label={module.tag} />
          {module.isExam && (
            <span style={{ fontFamily: font.sans, fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.amber }}>
              ★ Examination
            </span>
          )}
        </div>
        <h3 style={{ fontFamily: font.display, fontSize: 'clamp(1.4rem,2.5vw,2.5rem)', color: C.burgundyDeep, lineHeight: 1.05, fontWeight: 400, margin: '0 0 0.4rem' }}>
          {module.title}
        </h3>
        <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: `${C.foreground}99`, fontSize: '0.95rem', margin: 0 }}>
          {module.subtitle}
        </p>
      </div>
      <div style={{
        fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase',
        color: hovered ? C.burgundy : C.mutedFg, paddingTop: '0.25rem',
        transition: 'color 0.25s', flexShrink: 0,
        textAlign: 'right',
      }}>
        <div>{module.duration}</div>
        <div style={{ marginTop: '0.4rem', color: hovered ? C.burgundy : 'transparent', transition: 'color 0.25s' }}>
          Open →
        </div>
      </div>
    </article>
  )
}

// ─── Main AtlasAcademy component ────────────────────────────────────────────
export default function AtlasAcademy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const [activeLevel, setActiveLevel] = useState(null) // null | 'wset2' | 'wset3'
  const [openModule, setOpenModule]   = useState(null)
  const [email, setEmail]             = useState('')

  return (
    <div style={{ backgroundColor: C.ivory, color: C.foreground }}>

      {/* ──────────────────────────────────────────────────────────────────
          HERO — unchanged from original AtlasAcademy design
      ────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: '80vh', minHeight: '560px', backgroundColor: C.burgundyDeep }}>
        <img src={cellar} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover wa-img-cinematic wa-anim-slow-zoom" style={{ opacity: 0.70 }} width={1600} height={1100} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(63,13,13,0.70) 0%, rgba(63,13,13,0.40) 40%, ${C.burgundyDeep} 100%)` }} />
        <div className="relative h-full mx-auto px-6 md:px-12 flex flex-col justify-end pb-20" style={{ maxWidth: '1600px' }}>
          <div style={{ fontFamily: font.sans, fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.amber }} className="wa-anim-fade-up">
            Folio IV
          </div>
          <h1 className="wa-anim-fade-up wa-anim-delay-1" style={{ fontFamily: font.display, color: C.ivory, fontSize: 'clamp(3.5rem,12vw,11rem)', lineHeight: 0.9, fontWeight: 400, marginTop: '1.5rem' }}>
            The <em style={{ color: C.amber }}>Academy</em>
          </h1>
          <p className="wa-anim-fade-up wa-anim-delay-2" style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '40rem', marginTop: '2rem' }}>
            A private sommelier institution in the European tradition — slow, rigorous,
            and unembarrassed about beauty. WSET Level 2 and Level 3 within the
            Hestia universe.
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          CERTIFICATION GATEWAY — two doors
      ────────────────────────────────────────────────────────────────── */}
      <section style={{ background: C.burgundyDeep }}>
        <div className="mx-auto px-6 md:px-12" style={{ maxWidth: '1600px', paddingBottom: '0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(204,184,152,0.20)' }}>

            {/* WSET 2 */}
            <div
              onClick={() => setActiveLevel(activeLevel === 'wset2' ? null : 'wset2')}
              style={{
                padding: 'clamp(2rem,5vw,4rem)',
                cursor: 'pointer',
                background: activeLevel === 'wset2' ? 'rgba(196,149,10,0.08)' : 'transparent',
                borderBottom: activeLevel === 'wset2' ? `3px solid ${C.amber}` : '3px solid transparent',
                transition: 'background 0.3s, border-color 0.3s',
              }}
              onMouseEnter={e => { if (activeLevel !== 'wset2') e.currentTarget.style.background = 'rgba(245,240,232,0.04)' }}
              onMouseLeave={e => { if (activeLevel !== 'wset2') e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: activeLevel === 'wset2' ? C.amber : 'rgba(245,240,232,0.40)', marginBottom: '1.5rem' }}>
                Certificate Level
              </div>
              <div style={{ fontFamily: font.display, fontSize: 'clamp(3rem,6vw,7rem)', color: C.ivory, lineHeight: 0.9, fontWeight: 400 }}>
                WSET<br /><em style={{ color: activeLevel === 'wset2' ? C.amber : 'rgba(245,240,232,0.6)' }}>Level 2</em>
              </div>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.60)', fontSize: '1rem', lineHeight: 1.6, marginTop: '1.5rem', maxWidth: '28rem' }}>
                Foundation certification. Six modules covering palate science, blind tasting methodology, grape varieties, and the world's major regions.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)' }}>
                  {WSET2_MODULES.length} modules · ~9 hours
                </span>
                <span style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: activeLevel === 'wset2' ? C.amber : 'rgba(245,240,232,0.35)' }}>
                  {activeLevel === 'wset2' ? '↑ Close' : '→ Open curriculum'}
                </span>
              </div>
            </div>

            {/* WSET 3 */}
            <div
              onClick={() => setActiveLevel(activeLevel === 'wset3' ? null : 'wset3')}
              style={{
                padding: 'clamp(2rem,5vw,4rem)',
                cursor: 'pointer',
                background: activeLevel === 'wset3' ? 'rgba(196,149,10,0.08)' : 'transparent',
                borderBottom: activeLevel === 'wset3' ? `3px solid ${C.amber}` : '3px solid transparent',
                transition: 'background 0.3s, border-color 0.3s',
              }}
              onMouseEnter={e => { if (activeLevel !== 'wset3') e.currentTarget.style.background = 'rgba(245,240,232,0.04)' }}
              onMouseLeave={e => { if (activeLevel !== 'wset3') e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: activeLevel === 'wset3' ? C.amber : 'rgba(245,240,232,0.40)', marginBottom: '1.5rem' }}>
                Advanced Diploma Level
              </div>
              <div style={{ fontFamily: font.display, fontSize: 'clamp(3rem,6vw,7rem)', color: C.ivory, lineHeight: 0.9, fontWeight: 400 }}>
                WSET<br /><em style={{ color: activeLevel === 'wset3' ? C.amber : 'rgba(245,240,232,0.6)' }}>Level 3</em>
              </div>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.60)', fontSize: '1rem', lineHeight: 1.6, marginTop: '1.5rem', maxWidth: '28rem' }}>
                Advanced certification. Seven modules in terroir biophysics, wine chemistry, climate architecture, and sommelier service psychology.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)' }}>
                  {WSET3_MODULES.length} modules · ~15 hours
                </span>
                <span style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: activeLevel === 'wset3' ? C.amber : 'rgba(245,240,232,0.35)' }}>
                  {activeLevel === 'wset3' ? '↑ Close' : '→ Open curriculum'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          EXPANDED CURRICULUM — slides open when level selected
      ────────────────────────────────────────────────────────────────── */}
      {activeLevel && (
        <section style={{ background: C.ivory }}>
          <div className="mx-auto px-6 md:px-12 py-16 md:py-20" style={{ maxWidth: '1600px' }}>

            {/* Level header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              alignItems: 'flex-end', gap: '2rem',
              paddingBottom: '2rem',
              borderBottom: `1px solid ${C.border}`,
              marginBottom: '0',
            }}>
              <div>
                <div style={{ ...eyebrow, color: C.amber, marginBottom: '0.75rem' }}>
                  {activeLevel === 'wset2' ? 'Certificate Level' : 'Advanced Diploma Level'}
                </div>
                <h2 style={{ fontFamily: font.display, fontSize: 'clamp(2rem,4vw,4.5rem)', color: C.burgundyDeep, lineHeight: 1, fontWeight: 400, margin: 0 }}>
                  {activeLevel === 'wset2' ? 'WSET Level 2 — Full Curriculum' : 'WSET Level 3 — Full Curriculum'}
                </h2>
              </div>
              <div style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.mutedFg, textAlign: 'right' }}>
                Click any module to open
              </div>
            </div>

            {/* Module list */}
            <div>
              {(activeLevel === 'wset2' ? WSET2_MODULES : WSET3_MODULES).map((mod, i) => (
                <ModuleRow key={mod.id} module={mod} index={i} onOpen={setOpenModule} />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          ORIGINAL CHAPTERS (when no level is open) — editorial list
      ────────────────────────────────────────────────────────────────── */}
      {!activeLevel && (
        <section className="mx-auto px-6 md:px-12 py-24 md:py-32" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-12 gap-8 mb-20">
            <div className="col-span-12 md:col-span-4">
              <div style={eyebrow}>Curriculum</div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <p style={{ fontFamily: font.display, fontSize: 'clamp(1.75rem,3.5vw,3.5rem)', color: C.burgundyDeep, lineHeight: 1.25, fontWeight: 400 }}>
                Eight chapters. Two terms. <em>A lifetime</em> of practice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
            {ACADEMY_CHAPTERS.map((c, i) => (
              <article
                key={c.title}
                className="group grid grid-cols-12 gap-4 py-10 -mx-3 px-3 transition-colors"
                style={{ borderTop: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = `${C.parchment}66`}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="col-span-2 pt-2" style={{ fontFamily: font.mono, fontSize: '0.75rem', color: C.mutedFg }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="col-span-10">
                  <div style={{ ...eyebrow, color: C.amber }}>{c.lvl}</div>
                  <h3 style={{ fontFamily: font.display, fontSize: 'clamp(1.5rem,3vw,3rem)', color: C.burgundyDeep, lineHeight: 1.1, fontWeight: 400, marginTop: '0.75rem' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: `${C.foreground}cc`, lineHeight: 1.6, maxWidth: '28rem', marginTop: '1rem' }}>
                    {c.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          ENROLLMENT SECTION — unchanged from original
      ────────────────────────────────────────────────────────────────── */}
      <section className="py-32 md:py-44" style={{ backgroundColor: C.burgundyDeep, color: C.ivory }}>
        <div className="mx-auto px-6 md:px-12 grid grid-cols-12 gap-8" style={{ maxWidth: '1400px' }}>
          <div className="col-span-12 md:col-span-6">
            <div className="overflow-hidden" style={{ aspectRatio: '4/5' }}>
              <img src={glass} alt="A crystal glass of wine in the academy library"
                loading="lazy" className="h-full w-full object-cover wa-img-cinematic"
                width={1200} height={1500} />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
            <div style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.amber }}>Enrollment</div>
            <h2 style={{ fontFamily: font.display, fontSize: 'clamp(3rem,6vw,6rem)', lineHeight: 0.95, fontWeight: 400, marginTop: '1.5rem' }}>
              Join the <em>Reading</em> Room
            </h2>
            <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', fontSize: '1.125rem', lineHeight: 1.6, marginTop: '2rem' }}>
              A new chapter of the Atlas is published each fortnight. Subscribers receive
              the editorial folio, a private tasting log, and access to the Academy's
              full curriculum.
            </p>
            <form className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@address.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="wa-input-email"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                style={{
                  fontFamily: font.sans, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                  border: '1px solid rgba(245,240,232,0.60)', padding: '0.75rem 1.5rem',
                  color: C.ivory, background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.amber; e.currentTarget.style.color = C.burgundyDeep; e.currentTarget.style.borderColor = C.amber }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.ivory; e.currentTarget.style.borderColor = 'rgba(245,240,232,0.60)' }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          LESSON DRAWER — modal overlay
      ────────────────────────────────────────────────────────────────── */}
      {openModule && (
        <LessonDrawer module={openModule} onClose={() => setOpenModule(null)} />
      )}

    </div>
  )
}
