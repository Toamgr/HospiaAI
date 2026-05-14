import React, { useMemo, useState } from 'react'
import { cx, formatCocktailIngredientLine } from '../../utils/format'
import { Card, Button, Label, Header, Metric } from '../../components/AppPrimitives'

function CocktailFact({ label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-[#6b705c]/20 bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/70">{label}</div>
      <p className="text-sm leading-7 text-[#f5f5f0]">{value || 'Not specified'}</p>
    </div>
  )
}

function ApprovedCocktailCard({ cocktail, practiced, onMarkPracticed }) {
  return (
    <article className="rounded-2xl border border-[#6b705c]/30 bg-gradient-to-br from-[#1a1a1a] to-[#11100d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{cocktail.context || 'bar menu'}</div>
          <h2 className="mt-2 font-serif text-3xl font-black text-[#f5f5f0]">{cocktail.name}</h2>
        </div>
        <span className={cx('rounded-full border px-3 py-1 text-xs font-black', practiced ? 'border-emerald-800/50 bg-emerald-950/25 text-emerald-200' : 'border-amber-800/50 bg-amber-950/25 text-amber-200')}>
          {practiced ? 'Practiced' : 'Needs Practice'}
        </span>
      </div>
      <p className="mb-5 text-sm leading-7 text-[#e8dcc0]">{cocktail.guestDescription}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <CocktailFact label="Ingredients" value={(cocktail.ingredientsMl || cocktail.ingredientObjects || cocktail.ingredients || []).map(formatCocktailIngredientLine).join(' / ')} />
        <CocktailFact label="Method" value={cocktail.method} />
        <CocktailFact label="Glassware / Ice" value={`${cocktail.glassware} - ${cocktail.ice}`} />
        <CocktailFact label="Garnish" value={cocktail.garnish} />
        <CocktailFact label="Kosher Notes" value={cocktail.kosherNotes} />
        <CocktailFact label="Allergens" value={cocktail.allergenNotes} />
      </div>
      <div className="mt-5 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-4">
        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">Service Script</div>
        <p className="font-serif text-lg italic leading-8 text-[#f5f5f0]">"{cocktail.serviceScript}"</p>
      </div>
      <div className="mt-5">
        <Button disabled={practiced} onClick={onMarkPracticed}>
          {practiced ? 'Practiced' : 'Mark As Practiced'}
        </Button>
      </div>
    </article>
  )
}

export default function ApprovedCocktailsTraining({ t, currentUser, approvedCocktails = [], cocktailPractice = {}, onMarkPracticed }) {
  const [query, setQuery] = useState('')
  const employeeName = currentUser?.username || 'Employee'
  const employeePractice = useMemo(() => cocktailPractice[employeeName] || {}, [cocktailPractice, employeeName])
  const filteredCocktails = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return approvedCocktails
    return approvedCocktails.filter(item => [
      item.name,
      item.guestDescription,
      item.method,
      item.glassware,
      item.garnish,
      item.kosherNotes,
      item.allergenNotes,
      ...(item.ingredientsMl || item.ingredientObjects || item.ingredients || []).map(formatCocktailIngredientLine)
    ].join(' ').toLowerCase().includes(needle))
  }, [approvedCocktails, query])

  const practiced = useMemo(
    () => approvedCocktails.filter(item => employeePractice[item.id]?.practiced).length,
    [approvedCocktails, employeePractice]
  )

  return (
    <>
      <Header
        eyebrow={t.pages.approvedCocktails || 'Approved Cocktails / Bar Menu Training'}
        title="Approved Cocktails / Bar Menu Training"
        body="A staff-facing training board for manager-approved cocktails, exact service scripts, and practice status."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Metric label="Approved Cocktails" value={String(approvedCocktails.length)} sub="Published by manager" />
        <Metric label="Practiced By You" value={String(practiced)} sub={employeeName} />
        <Metric label="Training Coverage" value={`${approvedCocktails.length ? Math.round((practiced / approvedCocktails.length) * 100) : 0}%`} sub="Current menu readiness" />
      </div>

      <Card className="mb-6 border-[#c9a96e]/20">
        <Label>Search Approved Bar Menu</Label>
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search by cocktail, ingredient, garnish, kosher note, or method..."
          className="min-h-12 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/60 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
        />
      </Card>

      {filteredCocktails.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredCocktails.map(cocktail => (
            <ApprovedCocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              practiced={Boolean(employeePractice[cocktail.id]?.practiced)}
              onMarkPracticed={() => onMarkPracticed?.(cocktail.id, employeeName)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Label>No Approved Cocktails Yet</Label>
          <p className="text-sm leading-7 text-[#e8dcc0]">When a manager approves a Cocktail Lab proposal, it will appear here for employee training.</p>
        </Card>
      )}
    </>
  )
}
