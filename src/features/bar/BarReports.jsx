import { useMemo } from 'react'

function avg(arr) {
  if (!arr.length) return 0
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10
}

export default function BarReports({ approvedCocktails = [], cocktailDrafts = [], archivedCocktails = [] }) {
  const stats = useMemo(() => {
    const allDrafts = cocktailDrafts
    return {
      approved: approvedCocktails.length,
      draft: allDrafts.filter(d => d.status === 'draft').length,
      pending: allDrafts.filter(d => d.status === 'awaitingApproval').length,
      archived: archivedCocktails.length,
      avgPracticality: avg(approvedCocktails.map(c => c.practicalityScore || 0).filter(Boolean)),
      avgComplexity: avg(approvedCocktails.map(c => c.complexityScore || 0).filter(Boolean)),
    }
  }, [approvedCocktails, cocktailDrafts, archivedCocktails])

  const recentApproved = useMemo(() => [...approvedCocktails].sort((a, b) => new Date(b.approved_at || b.created_at || 0) - new Date(a.approved_at || a.created_at || 0)).slice(0, 5), [approvedCocktails])

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c9a96e]">Bar Management</div>
        <h1 className="mt-3 font-serif text-6xl font-black leading-none tracking-tight text-[#f5f5f0] sm:text-7xl">Bar Reports</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#e8dcc0]/70">Cocktail program performance metrics and development pipeline overview.</p>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {[['Approved Menu', stats.approved, 'Live cocktails'], ['In Development', stats.draft, 'Active drafts'], ['Awaiting Review', stats.pending, 'Pending approval'], ['Archived', stats.archived, 'Retired routes']].map(([label, value, sub]) => (
          <div key={label} className="rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#13120f,#090907)] p-5">
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">{label}</div>
            <div className="mt-3 font-serif text-5xl font-black text-[#c9a96e]">{value}</div>
            <div className="mt-2 text-[10px] text-[#e8dcc0]/40">{sub}</div>
          </div>
        ))}
      </div>

      {/* Score Metrics */}
      {(stats.avgPracticality > 0 || stats.avgComplexity > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {[['Avg Practicality Score', stats.avgPracticality, 'Higher = easier to execute'], ['Avg Complexity Score', stats.avgComplexity, 'Lower = faster in service']].map(([label, value, sub]) => (
            <div key={label} className="rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#12110e,#090907)] p-5">
              <div className="text-[9px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">{label}</div>
              <div className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">{value}/10</div>
              <div className="mt-3 h-1.5 rounded-full bg-[#6b705c]/20">
                <div className="h-full rounded-full bg-[#c9a96e]" style={{ width: `${value * 10}%` }} />
              </div>
              <p className="mt-2 text-[10px] text-[#e8dcc0]/40">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Approved */}
      {recentApproved.length > 0 && (
        <div className="rounded-[2.5rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#12110e,#090907)] p-6">
          <div className="mb-5 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Recently Approved</div>
          <div className="space-y-0 divide-y divide-[#c9a96e]/06">
            {recentApproved.map(c => (
              <div key={c.id} className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-lg font-black text-[#f5f5f0]">{c.name}</div>
                  <div className="text-xs text-[#e8dcc0]/45">{c.menuRole || '—'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right text-xs shrink-0">
                  {c.practicalityScore > 0 && (
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">Practicality</div>
                      <div className="mt-0.5 font-black text-[#c9a96e]">{c.practicalityScore}/10</div>
                    </div>
                  )}
                  {c.complexityScore > 0 && (
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">Complexity</div>
                      <div className="mt-0.5 font-black text-[#e8dcc0]">{c.complexityScore}/10</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.approved === 0 && (
        <div className="py-16 text-center">
          <div className="font-serif text-[6rem] font-black leading-none text-[#c9a96e]/[0.05]">RPT</div>
          <p className="-mt-6 text-sm text-[#e8dcc0]/30">Reports will populate as cocktails are approved. Start in the Cocktail Lab.</p>
        </div>
      )}
    </div>
  )
}
