import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../../services/api/client'

const STATUS_BADGE = {
  draft: { label: 'Draft', cls: 'border-[#6b705c]/30 text-[#6b705c]' },
  pending_approval: { label: 'Pending Approval', cls: 'border-amber-500/30 text-amber-400' },
  approved: { label: 'Approved', cls: 'border-blue-500/30 text-blue-400' },
  published: { label: 'Published', cls: 'border-emerald-500/30 text-emerald-400' },
}

function Badge({ status }) {
  const b = STATUS_BADGE[status] || STATUS_BADGE.draft
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${b.cls}`}>
      {b.label}
    </span>
  )
}

function DishRow({ dish, editable, onPriceChange }) {
  const pct = dish.food_cost_percent != null ? Math.round(dish.food_cost_percent) : null
  const pctColor = pct == null ? 'text-[#6b705c]' : pct <= 32 ? 'text-emerald-400' : pct <= 40 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="grid grid-cols-[1fr_80px_80px_70px_70px] gap-3 px-4 py-3 border-b border-[#6b705c]/10 items-center last:border-0">
      <div>
        <p className="text-sm font-semibold text-[#f5f5f0]">{dish.name}</p>
        <p className="text-xs text-[#6b705c] mt-0.5">{dish.category} {dish.allergens ? `· ${dish.allergens}` : ''}</p>
        {dish.description && <p className="text-[11px] text-[#e8dcc0]/50 mt-0.5 line-clamp-1">{dish.description}</p>}
      </div>
      {editable ? (
        <input
          type="number"
          min="0"
          step="1"
          value={dish.price_ils || ''}
          onChange={e => onPriceChange(dish.id, parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-[#6b705c]/25 bg-[#0d0c09]/60 px-2 py-1.5 text-sm text-[#f5f5f0] text-right tabular-nums focus:border-[#c9a96e]/50 focus:outline-none"
        />
      ) : (
        <div className="text-sm text-[#e8dcc0] tabular-nums text-right">
          {dish.price_ils ? `₪${dish.price_ils}` : '—'}
        </div>
      )}
      <div className="text-sm text-[#e8dcc0] tabular-nums text-right">
        {dish.food_cost_ils ? `₪${dish.food_cost_ils}` : '—'}
      </div>
      <div className={`text-sm tabular-nums text-right font-semibold ${pctColor}`}>
        {pct != null ? `${pct}%` : '—'}
      </div>
      <div className="text-xs text-[#6b705c] text-right">{dish.category}</div>
    </div>
  )
}

export default function ChefDashboard({ currentUser }) {
  const role = currentUser?.role
  const isChef = role === 'chef'
  const isApprover = role === 'fb_director' || role === 'owner' || role === 'admin'

  const [tab, setTab] = useState(isChef ? 'generate' : 'pending')
  const [menus, setMenus] = useState([])
  const [loadingMenus, setLoadingMenus] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showNotifModal, setShowNotifModal] = useState(false)

  // Generate form state
  const [form, setForm] = useState({ menuName: '', menuType: 'regular', season: '', occasion: '', notes: '' })
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)
  const [editedDishes, setEditedDishes] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [genError, setGenError] = useState(null)

  const loadMenus = useCallback(async () => {
    setLoadingMenus(true)
    try {
      const data = await apiGet('/api/chef/menus')
      setMenus(data.menus || [])
    } catch { /* silent */ }
    finally { setLoadingMenus(false) }
  }, [])

  useEffect(() => { loadMenus() }, [loadMenus])

  useEffect(() => {
    if (!isApprover) return
    apiGet('/api/chef/notifications').then(d => {
      const notifs = d.notifications || []
      setNotifications(notifs)
      if (notifs.length) setShowNotifModal(true)
    }).catch(() => {})
  }, [isApprover])

  async function handleGenerate(e) {
    e.preventDefault()
    setGenerating(true)
    setGenError(null)
    setGenerated(null)
    try {
      const data = await apiPost('/api/chef/generate-menu', form)
      setGenerated(data)
      setEditedDishes(data.dishes || [])
    } catch (err) {
      setGenError(err.message || 'Generation failed.')
    } finally { setGenerating(false) }
  }

  function handlePriceChange(dishId, price) {
    setEditedDishes(prev => prev.map(d => d.id === dishId ? { ...d, price_ils: price } : d))
  }

  async function handleSaveSubmit() {
    if (!generated) return
    setSubmitting(true)
    try {
      await apiPost(`/api/chef/save-menu/${generated.menu.id}`, {})
      setGenerated(null)
      setEditedDishes([])
      setForm({ menuName: '', menuType: 'regular', season: '', occasion: '', notes: '' })
      await loadMenus()
      setTab('menus')
    } catch (err) {
      setGenError(err.message || 'Save failed.')
    } finally { setSubmitting(false) }
  }

  async function handleApprove(menuId) {
    try {
      await apiPost(`/api/chef/approve-menu/${menuId}`, {})
      await loadMenus()
    } catch { /* silent */ }
  }

  async function handleToggleVisible(menuId, current) {
    try {
      await apiPost(`/api/chef/menus/${menuId}/visible`, { visible_to_staff: !current })
      await loadMenus()
    } catch { /* silent */ }
  }

  const pendingMenus = menus.filter(m => m.status === 'pending_approval')
  const publishedMenus = menus.filter(m => m.status === 'published')
  const myMenus = isChef ? menus : menus.filter(m => m.status !== 'draft' || isApprover)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Notification modal */}
      {showNotifModal && notifications.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-2xl border border-amber-500/30 bg-[#1a1a1a] p-8 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-lg font-bold text-[#f5f5f0]">Pending Approval</h2>
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="flex items-center gap-3 rounded-xl border border-[#6b705c]/20 bg-[#0d0c09]/60 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#f5f5f0]">Food menu #{n.reference_id}</p>
                    <p className="text-xs text-[#6b705c]">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNotifModal(false); setTab('pending') }}
                className="flex-1 rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-4 py-2.5 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/20 transition"
              >
                Review now
              </button>
              <button
                onClick={() => setShowNotifModal(false)}
                className="flex-1 rounded-xl border border-[#6b705c]/25 px-4 py-2.5 text-sm font-bold text-[#e8dcc0]/60 hover:border-[#6b705c]/50 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#f5f5f0]">Kitchen Intelligence</h1>
        <p className="text-sm text-[#6b705c] mt-1">AI food menu creation and approval</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 p-1">
        {isChef && (
          <button onClick={() => setTab('generate')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${tab === 'generate' ? 'bg-[#c9a96e]/15 text-[#c9a96e]' : 'text-[#6b705c] hover:text-[#e8dcc0]'}`}>
            Generate Menu
          </button>
        )}
        {isChef && (
          <button onClick={() => setTab('menus')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${tab === 'menus' ? 'bg-[#c9a96e]/15 text-[#c9a96e]' : 'text-[#6b705c] hover:text-[#e8dcc0]'}`}>
            My Menus
          </button>
        )}
        {isApprover && (
          <button onClick={() => setTab('pending')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition relative ${tab === 'pending' ? 'bg-[#c9a96e]/15 text-[#c9a96e]' : 'text-[#6b705c] hover:text-[#e8dcc0]'}`}>
            Pending Approvals
            {pendingMenus.length > 0 && <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-black">{pendingMenus.length}</span>}
          </button>
        )}
        {isApprover && (
          <button onClick={() => setTab('published')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${tab === 'published' ? 'bg-[#c9a96e]/15 text-[#c9a96e]' : 'text-[#6b705c] hover:text-[#e8dcc0]'}`}>
            Published Menus
          </button>
        )}
      </div>

      {/* Generate tab */}
      {tab === 'generate' && (
        <div className="space-y-6">
          {!generated ? (
            <form onSubmit={handleGenerate} className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/60 p-6 space-y-5">
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#6b705c]">New Food Menu</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#e8dcc0]/60 mb-1.5">Menu Name</label>
                  <input value={form.menuName} onChange={e => setForm(f => ({ ...f, menuName: e.target.value }))}
                    placeholder="e.g. Spring Dinner Menu"
                    className="w-full rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2.5 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8dcc0]/60 mb-1.5">Menu Type</label>
                  <select value={form.menuType} onChange={e => setForm(f => ({ ...f, menuType: e.target.value }))}
                    className="w-full rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2.5 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none">
                    <option value="regular">Regular</option>
                    <option value="event">Event</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8dcc0]/60 mb-1.5">Season</label>
                  <input value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))}
                    placeholder="e.g. Spring, Summer..."
                    className="w-full rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2.5 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8dcc0]/60 mb-1.5">Occasion / Notes</label>
                  <input value={form.occasion} onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))}
                    placeholder="e.g. Romantic dinner, weekend..."
                    className="w-full rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2.5 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#e8dcc0]/60 mb-1.5">Additional Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                  placeholder="Any special requirements, dietary focus, theme..."
                  className="w-full rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2.5 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none resize-none" />
              </div>
              {genError && <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">{genError}</div>}
              <button type="submit" disabled={generating}
                className="w-full rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-3 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/20 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {generating ? 'Generating with AI…' : 'Generate with AI'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#c9a96e]/20 bg-[#1a1a1a]/60 p-6">
                <h2 className="text-xl font-black text-[#f5f5f0]">{generated.menu.name}</h2>
                {generated.menu.story && <p className="text-sm text-[#e8dcc0]/60 mt-2 italic">{generated.menu.story}</p>}
              </div>
              <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/60 overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_80px_70px_70px] gap-3 px-4 py-3 border-b border-[#6b705c]/20">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c]">Dish</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Price ₪</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Cost ₪</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Cost%</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Cat</div>
                </div>
                {editedDishes.map(d => (
                  <DishRow key={d.id} dish={d} editable={true} onPriceChange={handlePriceChange} />
                ))}
              </div>
              {genError && <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">{genError}</div>}
              <div className="flex gap-3">
                <button onClick={() => { setGenerated(null); setEditedDishes([]) }}
                  className="rounded-xl border border-[#6b705c]/25 px-5 py-2.5 text-sm font-bold text-[#e8dcc0]/60 hover:border-[#6b705c]/50 transition">
                  Discard
                </button>
                <button onClick={handleSaveSubmit} disabled={submitting}
                  className="flex-1 rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-5 py-2.5 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/20 transition disabled:opacity-40">
                  {submitting ? 'Submitting…' : 'Save & Submit for Approval'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Menus tab */}
      {tab === 'menus' && (
        <div className="space-y-3">
          {loadingMenus ? (
            <div className="py-16 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
          ) : myMenus.length === 0 ? (
            <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 py-14 text-center">
              <p className="text-sm text-[#6b705c]">No menus yet. Generate your first menu above.</p>
            </div>
          ) : (
            myMenus.map(m => (
              <div key={m.id} className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold text-[#f5f5f0]">{m.name}</p>
                    <p className="text-xs text-[#6b705c] mt-0.5">{m.menu_type} · {new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge status={m.status} />
                </div>
                {m.story && <p className="text-xs text-[#e8dcc0]/50 italic mb-3">{m.story}</p>}
                <p className="text-xs text-[#6b705c]">{(m.dishes || []).length} dishes</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Approvals tab */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {loadingMenus ? (
            <div className="py-16 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
          ) : pendingMenus.length === 0 ? (
            <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 py-14 text-center">
              <p className="text-sm text-[#6b705c]">No menus pending approval.</p>
            </div>
          ) : (
            pendingMenus.map(m => {
              const fbDone = Boolean(m.fb_approved_at)
              const ownerDone = Boolean(m.owner_approved_at)
              return (
                <div key={m.id} className="rounded-2xl border border-amber-500/20 bg-[#1a1a1a]/60 p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-[#f5f5f0]">{m.name}</p>
                      <p className="text-xs text-[#6b705c] mt-0.5">{m.menu_type} · Created {new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge status={m.status} />
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className={fbDone ? 'text-emerald-400' : 'text-[#6b705c]'}>
                      {fbDone ? '✓' : '○'} F&B Director
                    </span>
                    <span className={ownerDone ? 'text-emerald-400' : 'text-[#6b705c]'}>
                      {ownerDone ? '✓' : '○'} Owner
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#6b705c]/15 bg-[#0d0c09]/40 overflow-hidden">
                    <div className="grid grid-cols-[1fr_70px_70px_60px] gap-3 px-4 py-2 border-b border-[#6b705c]/10">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c]">Dish</div>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Price ₪</div>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Cost ₪</div>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Cat</div>
                    </div>
                    {(m.dishes || []).map(d => (
                      <div key={d.id} className="grid grid-cols-[1fr_70px_70px_60px] gap-3 px-4 py-2.5 border-b border-[#6b705c]/10 last:border-0">
                        <div>
                          <p className="text-sm text-[#f5f5f0]">{d.name}</p>
                          {d.description && <p className="text-[11px] text-[#6b705c] line-clamp-1">{d.description}</p>}
                        </div>
                        <p className="text-sm text-[#e8dcc0] text-right tabular-nums">{d.price_ils ? `₪${d.price_ils}` : '—'}</p>
                        <p className="text-sm text-[#e8dcc0] text-right tabular-nums">{d.food_cost_ils ? `₪${d.food_cost_ils}` : '—'}</p>
                        <p className="text-xs text-[#6b705c] text-right">{d.category}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleApprove(m.id)}
                    className="w-full rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-2.5 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/20 transition">
                    Approve
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Published Menus tab */}
      {tab === 'published' && (
        <div className="space-y-4">
          {loadingMenus ? (
            <div className="py-16 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
          ) : publishedMenus.length === 0 ? (
            <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 py-14 text-center">
              <p className="text-sm text-[#6b705c]">No published menus yet.</p>
            </div>
          ) : (
            publishedMenus.map(m => (
              <div key={m.id} className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-[#f5f5f0]">{m.name}</p>
                    <p className="text-xs text-[#6b705c] mt-0.5">{m.menu_type} · {new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={m.status} />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-[#6b705c]">Visible to staff</span>
                      <div
                        onClick={() => handleToggleVisible(m.id, m.visible_to_staff)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${m.visible_to_staff ? 'bg-emerald-500/70' : 'bg-[#6b705c]/30'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${m.visible_to_staff ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                    </label>
                  </div>
                </div>
                <div className="rounded-xl border border-[#6b705c]/15 bg-[#0d0c09]/40 overflow-hidden">
                  {(m.dishes || []).map(d => (
                    <div key={d.id} className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-[#6b705c]/10 last:border-0">
                      <div>
                        <p className="text-sm text-[#f5f5f0]">{d.name}</p>
                        <p className="text-[11px] text-[#6b705c]">{d.category}{d.allergens ? ` · ${d.allergens}` : ''}</p>
                      </div>
                      <p className="text-sm text-[#e8dcc0] tabular-nums shrink-0">{d.price_ils ? `₪${d.price_ils}` : '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
