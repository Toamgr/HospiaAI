import { useState, useEffect } from 'react'
import { apiGet } from '../../services/api/client'

export default function FoodMenuView() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/api/chef/menus')
      .then(d => setMenus(d.menus || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#f5f5f0]">Food Menu</h1>
        <p className="text-sm text-[#6b705c] mt-1">Published menus visible to staff</p>
      </div>

      {menus.length === 0 ? (
        <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 py-14 text-center">
          <p className="text-sm text-[#6b705c]">No published menus available yet.</p>
        </div>
      ) : (
        menus.map(menu => (
          <div key={menu.id} className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#6b705c]/10">
              <h2 className="text-base font-bold text-[#f5f5f0]">{menu.name}</h2>
              {menu.story && <p className="text-xs text-[#e8dcc0]/50 italic mt-1">{menu.story}</p>}
            </div>
            {(menu.dishes || []).map(dish => (
              <div key={dish.id} className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-[#6b705c]/8 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#f5f5f0]">{dish.name}</p>
                  {dish.description && <p className="text-xs text-[#e8dcc0]/60 mt-0.5 line-clamp-2">{dish.description}</p>}
                  {dish.allergens && (
                    <p className="text-[10px] text-amber-400/70 mt-0.5">Allergens: {dish.allergens}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {dish.price_ils && (
                    <p className="text-sm font-bold text-[#c9a96e]">₪{dish.price_ils}</p>
                  )}
                  <p className="text-[10px] text-[#6b705c] capitalize">{dish.category}</p>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
