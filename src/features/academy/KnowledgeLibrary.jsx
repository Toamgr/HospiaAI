import React, { useState, useMemo, useEffect } from 'react'
import { cx } from '../../utils/format'
import { cocktailLibrary as STATIC_COCKTAIL_LIBRARY, ATLAS_MASTERCLASSES, ATLAS_TECHNIQUES, ATLAS_TRAINING_CARDS, ATLAS_PROFIT_INSIGHTS } from '../../data/cocktails'
import { apiGet } from '../../services/api/client'
import { Card, Button, Label } from '../../components/AppPrimitives'

export default function KnowledgeLibrary({ t, lang, goToPage }) {
  const [activeTab, setActiveTab] = useState('classics')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedCocktail, setSelectedCocktail] = useState(null)
  const [cocktailLibrary, setCocktailLibrary] = useState(STATIC_COCKTAIL_LIBRARY)

  useEffect(() => {
    apiGet('/api/cocktails').then(data => {
      if (Array.isArray(data.cocktails) && data.cocktails.length) {
        const normalized = data.cocktails.map(c => ({
          ...c,
          family: c.category,
          story: c.description,
          glassware: c.glass_type,
          tags: c.tags || [],
          ingredients: c.ingredients || []
        }))
        setCocktailLibrary(normalized)
      }
    }).catch(() => {})
  }, [])

  const atlasTabs = [
    { id: 'classics', label: 'Classics', subtitle: 'Cocktail canon' },
    { id: 'masterclass', label: 'Spirits', subtitle: 'Base-spirit fluency' },
    { id: 'techniques', label: 'Techniques', subtitle: 'Execution standards' },
    { id: 'training', label: 'Training Cards', subtitle: 'Pre-shift drills' },
    { id: 'profit', label: 'Costing & Profit', subtitle: 'Margin discipline' }
  ]

  const flavorTags = useMemo(() => {
    const tags = new Set(cocktailLibrary.flatMap(cocktail => cocktail.tags || []))
    return ['All', ...Array.from(tags).sort()]
  }, [cocktailLibrary])

  const filteredCocktails = useMemo(() => {
    const q = query.toLowerCase().trim()
    return cocktailLibrary.filter(cocktail => {
      const matchesFilter = activeFilter === 'All' || cocktail.tags.includes(activeFilter)
      const searchable = [
        cocktail.name,
        cocktail.family,
        cocktail.origin,
        cocktail.era,
        cocktail.story,
        cocktail.method,
        cocktail.glassware,
        cocktail.ice,
        cocktail.garnish,
        cocktail.serviceNote,
        ...cocktail.ingredients,
        ...cocktail.tags
      ].join(' ').toLowerCase()

      return matchesFilter && (!q || searchable.includes(q))
    })
  }, [activeFilter, query])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#c9a96e]/25 bg-[radial-gradient(circle_at_80%_10%,rgba(201,169,110,0.16),transparent_34%),linear-gradient(135deg,#171612,#0f0f0e_72%)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#c9a96e]">The Grand Bar Atlas</span>
              <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">Academy / World of Bar</span>
            </div>
            <h1 className="max-w-5xl font-serif text-4xl font-black tracking-tight text-[#f5f5f0] sm:text-5xl lg:text-6xl">
              A structured bar masterclass for luxury hospitality teams.
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-[#e8dcc0]">
              Learn cocktails, spirits, technique, guest language, and bar economics in a course flow. Open cocktail dossiers only when you need detail.
            </p>
            <Button className="mt-6" variant="secondary" onClick={() => goToPage?.('courses')}>Back to Courses</Button>
          </div>
          <div className="grid gap-3">
            <AtlasStat value={cocktailLibrary.length} label="classic cocktails" />
            <AtlasStat value={ATLAS_MASTERCLASSES.length} label="spirit modules" />
            <AtlasStat value={ATLAS_TECHNIQUES.length} label="technique drills" />
          </div>
        </div>
      </section>

      <Card className="border-[#c9a96e]/15 bg-[#0f0f0e]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <label className="sr-only" htmlFor="bar-atlas-search">Search The Grand Bar Atlas</label>
          <input
            id="bar-atlas-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search cocktails, spirits, techniques, scripts, costing..."
            className="min-h-12 w-full rounded-2xl border border-[#6b705c]/30 bg-[#11100d] px-5 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/55 focus:border-[#c9a96e] focus:ring-4 focus:ring-[#c9a96e]/10"
          />
          <div className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-4 py-2 text-center text-xs font-black text-[#c9a96e]">
            {activeTab === 'classics' ? `${filteredCocktails.length} cocktails` : 'Course module'}
          </div>
        </div>

        <nav className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5" aria-label="Grand Bar Atlas course modules">
          {atlasTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setQuery('') }}
              className={cx(
                'rounded-2xl border p-4 text-left transition',
                activeTab === tab.id
                  ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]'
                  : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/30 hover:text-[#f5f5f0]'
              )}
            >
              <span className="block text-xs font-black uppercase tracking-[0.14em]">{tab.label}</span>
              <span className="mt-1 block text-xs leading-5 text-[#e8dcc0] opacity-65">{tab.subtitle}</span>
            </button>
          ))}
        </nav>

        {activeTab === 'classics' && (
          <div className="mt-5 flex flex-wrap gap-2">
            {flavorTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveFilter(tag)}
                className={cx(
                  'min-h-10 rounded-full border px-3 text-xs font-bold transition',
                  activeFilter === tag
                    ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]'
                    : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/35 hover:text-[#f5f5f0]'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </Card>

      {activeTab === 'classics' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-[#c9a96e]">Cocktail Canon</div>
              <h2 className="mt-2 font-serif text-4xl font-black text-[#f5f5f0]">Classics taught as operating standards.</h2>
            </div>
          </div>
          {filteredCocktails.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCocktails.map(cocktail => (
                <BarAtlasCocktailCard key={cocktail.name} cocktail={cocktail} onOpen={() => setSelectedCocktail(cocktail)} />
              ))}
            </div>
          ) : (
            <AtlasEmptyState onClear={() => { setQuery(''); setActiveFilter('All') }} />
          )}
        </section>
      )}

      {activeTab === 'masterclass' && (
        <AtlasModuleGrid title="Spirits as guest preference, not bottle trivia.">
          {ATLAS_MASTERCLASSES.map(module => <AtlasModuleCard key={module.id} eyebrow={module.level} title={module.title} body={module.desc} />)}
        </AtlasModuleGrid>
      )}

      {activeTab === 'techniques' && (
        <AtlasModuleGrid title="Technique standards that change taste, speed, and consistency.">
          {ATLAS_TECHNIQUES.map(module => <AtlasModuleCard key={module.title} eyebrow={module.category} title={module.title} body={module.detail} />)}
        </AtlasModuleGrid>
      )}

      {activeTab === 'training' && (
        <AtlasModuleGrid title="Micro-training cards for pre-shift lineup.">
          {ATLAS_TRAINING_CARDS.map(card => <AtlasModuleCard key={card.title} eyebrow={card.objective} title={card.title} body={card.action} />)}
        </AtlasModuleGrid>
      )}

      {activeTab === 'profit' && (
        <AtlasModuleGrid title="Bar economics that protect premium service margins.">
          {ATLAS_PROFIT_INSIGHTS.map(item => <AtlasModuleCard key={item.title} eyebrow={item.impact} title={item.title} body={item.solution} />)}
        </AtlasModuleGrid>
      )}

      {selectedCocktail && (
        <BarAtlasCocktailModal cocktail={selectedCocktail} onClose={() => setSelectedCocktail(null)} />
      )}
    </div>
  )
}

function AtlasStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">
      <div className="font-serif text-3xl font-black text-[#c9a96e]">{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
    </div>
  )
}

function AtlasModuleGrid({ title, children }) {
  return (
    <section>
      <h2 className="mb-5 max-w-4xl font-serif text-4xl font-black text-[#f5f5f0]">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  )
}

function AtlasModuleCard({ eyebrow, title, body }) {
  return (
    <Card className="border-[#6b705c]/30 bg-[#0f0f0e]">
      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{eyebrow}</div>
      <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">{body}</p>
    </Card>
  )
}

function BarAtlasCocktailCard({ cocktail, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-[320px] flex-col justify-between rounded-[1.75rem] border border-[#6b705c]/30 bg-gradient-to-br from-[#1a1a1a] to-[#11100d] p-6 text-left shadow-[0_20px_70px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-[#c9a96e]/45"
    >
      <div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{cocktail.family}</div>
            <div className="mt-1 text-xs font-bold text-[#e8dcc0] opacity-70">{cocktail.era}</div>
          </div>
          <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">{cocktail.origin.split(',')[0]}</span>
        </div>
        <h3 className="font-serif text-3xl font-black leading-none text-[#f5f5f0] transition group-hover:text-[#c9a96e]">{cocktail.name}</h3>
        <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#e8dcc0]">{cocktail.story}</p>
      </div>
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {cocktail.tags.slice(0, 4).map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
        <div className="border-t border-[#6b705c]/30 pt-4 text-sm font-black text-[#c9a96e]">Open dossier</div>
      </div>
    </button>
  )
}

function BarAtlasCocktailModal({ cocktail, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close cocktail dossier" />
      <article className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-[#c9a96e]/25 bg-[#0f0f0e] shadow-[0_30px_120px_rgba(0,0,0,0.58)]">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#6b705c]/30 bg-[#0f0f0e]/95 px-5 py-4 backdrop-blur">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Cocktail Dossier</div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#6b705c]/30 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0] transition hover:border-[#c9a96e] hover:text-[#c9a96e]">Close</button>
        </div>
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c9a96e]">{cocktail.family} / {cocktail.era}</div>
              <h2 className="mt-2 font-serif text-4xl font-black leading-none text-[#f5f5f0] sm:text-6xl">{cocktail.name}</h2>
            </div>
            <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">{cocktail.origin}</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-5">
              <AtlasDossierBlock label="Origin Story">
                <p className="font-serif text-xl leading-9 text-[#f5f5f0]">{cocktail.story}</p>
              </AtlasDossierBlock>
              <AtlasDossierBlock label="Service Note">
                <p className="text-sm leading-7 text-[#e8dcc0]">{cocktail.serviceNote}</p>
              </AtlasDossierBlock>
              <AtlasDossierBlock label="Guest Recommendation Script">
                <p className="font-serif text-lg italic leading-8 text-[#f5f5f0]">"If you enjoy a {cocktail.tags[0].toLowerCase()} profile, I would guide you toward the {cocktail.name}. It is classic, structured, and gives you a clear sense of {cocktail.family.toLowerCase()}."</p>
              </AtlasDossierBlock>
              <AtlasDossierBlock label="Bartender Mistake To Avoid" danger>
                <p className="text-sm leading-7 text-red-100">{getAtlasMistake(cocktail)}</p>
              </AtlasDossierBlock>
            </section>

            <section className="space-y-5">
              <AtlasDossierBlock label="Ingredients">
                <div className="space-y-2">
                  {cocktail.ingredients.map(ingredient => (
                    <div key={ingredient} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-[#f5f5f0]">{ingredient}</div>
                  ))}
                </div>
              </AtlasDossierBlock>
              <div className="grid gap-3 sm:grid-cols-2">
                <ArticleSpec label="Method" value={cocktail.method} />
                <ArticleSpec label="Glassware" value={cocktail.glassware} />
                <ArticleSpec label="Ice" value={cocktail.ice} />
                <ArticleSpec label="Garnish" value={cocktail.garnish} />
              </div>
              <AtlasDossierBlock label="Flavor Profile">
                <div className="flex flex-wrap gap-2">{cocktail.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
              </AtlasDossierBlock>
            </section>
          </div>
        </div>
      </article>
    </div>
  )
}

function AtlasDossierBlock({ label, children, danger = false }) {
  return (
    <section className={cx('rounded-2xl border p-4', danger ? 'border-red-900/45 bg-red-950/20' : 'border-[#6b705c]/30 bg-[#1a1a1a]')}>
      <Label>{label}</Label>
      {children}
    </section>
  )
}

function AtlasEmptyState({ onClear }) {
  return (
    <Card className="border-[#c9a96e]/20 bg-[#0f0f0e]">
      <Label>No Results</Label>
      <p className="text-sm leading-7 text-[#e8dcc0]">No Bar Atlas entries match this search. Clear the query or choose a broader flavor tag.</p>
      <Button className="mt-4" variant="secondary" onClick={onClear}>Clear search</Button>
    </Card>
  )
}

function getAtlasMistake(cocktail) {
  const text = [cocktail.name, cocktail.family, cocktail.method, cocktail.serviceNote, ...cocktail.ingredients, ...cocktail.tags].join(' ').toLowerCase()
  if (text.includes('egg white') || text.includes('sour')) return 'Do not skip the up/on-the-rocks question or egg white confirmation. Texture must be intentional and consent-based.'
  if (text.includes('sparkling') || text.includes('soda') || text.includes('prosecco')) return 'Do not kill carbonation with aggressive stirring or warm glassware. Sparkling drinks must arrive alive.'
  if (text.includes('stir') || text.includes('spirit-forward')) return 'Do not under-dilute or over-dilute. A spirit-forward cocktail should arrive cold, integrated, and still structured.'
  if (text.includes('mint')) return 'Do not shred the mint. Bruised herbs should smell fresh, not bitter or grassy.'
  return 'Do not describe the drink generically. Connect origin, flavor, and service format so the guest feels guided.'
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">
      {children}
    </span>
  )
}

function ArticleSpec({ label, value }) {
  return (
    <div className="group rounded-2xl border border-[#6b705c]/20 bg-[#0d0c09] p-6 transition-colors hover:border-[#c9a96e]/40">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-2">{label}</div>
      <div className="text-lg font-bold text-[#f5f5f0]">{value}</div>
    </div>
  )
}
