import { useState } from 'react'
import { cx } from '../../utils/format'
import ClassicCocktailsMagazine from './ClassicCocktailsMagazine'
import BusinessMenusTab from './BusinessMenusTab'

const TABS = [
  { id: 'magazine', label: 'Classic Cocktails' },
  { id: 'menus', label: 'Business Menus' },
]

export default function CocktailsTab({ approvedCocktails = [] }) {
  const [activeTab, setActiveTab] = useState('magazine')

  return (
    <div className="min-h-screen">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-1 border-b border-[#6b705c]/20 pb-0 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cx(
              'relative px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-colors',
              activeTab === tab.id
                ? 'text-[#c9a96e]'
                : 'text-[#e8dcc0]/50 hover:text-[#e8dcc0]/80'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c9a96e]"
                style={{ borderRadius: '2px 2px 0 0' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'magazine' && <ClassicCocktailsMagazine />}
      {activeTab === 'menus' && (
        <BusinessMenusTab approvedCocktails={approvedCocktails} />
      )}
    </div>
  )
}
