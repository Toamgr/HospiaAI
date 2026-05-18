import React from 'react'
import { cx } from '../../utils/format'
import { NAV_GROUPS, PAGE_META } from '../../config/navigationConfig'
import { canAccessPage } from '../../config/roleConfig'
import { Button } from '../../components/AppPrimitives'
import { getAreaLabel, getAreaDescription, getPageLabel, groupPagesBySection } from './shellUtils'

export default function SidePanel({ t, currentUser, role, area, page, collapsed, setCollapsed, goToPage, lang, setLang, logout }) {
  const pages = NAV_GROUPS[area]?.pages.filter(item => canAccessPage(currentUser, item) && !PAGE_META[item].hiddenInNav) || []
  const pageGroups = groupPagesBySection(pages)

  return (
    <aside className={cx(
      'fixed inset-y-20 z-30 border-r border-[#6b705c]/10 bg-[#0d0c09] transition-all duration-500 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]',
      collapsed ? 'w-0 -translate-x-full overflow-hidden lg:w-[72px] lg:translate-x-0' : cx(role === 'employee' ? 'w-[224px]' : 'w-[248px]', 'translate-x-0')
    )}>
      {!collapsed ? (
        <div className="flex h-full flex-col">
          <div className="border-b border-[#6b705c]/10 p-5">
            <div className="text-[8px] font-black uppercase tracking-[0.34em] text-[#e8dcc0] opacity-50">
              {t.ui.selectSection}
            </div>
            <h2 className="mt-3 font-serif text-2xl font-black leading-tight text-[#f5f5f0]">{getAreaLabel(t, area)}</h2>
            <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#e8dcc0] opacity-65">{getAreaDescription(t, area)}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4" aria-label="Secondary navigation">
            <div className="space-y-5">
              {pageGroups.map(group => (
                <section key={group.section}>
                  <div className="mb-2 px-2 text-[8px] font-black uppercase tracking-[0.24em] text-[#e8dcc0] opacity-35">{group.section}</div>
                  <div className="space-y-2">
                    {group.pages.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => goToPage(item)}
                        className={cx(
                          'w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300',
                          page === item
                            ? 'border-[#c9a96e]/20 bg-[#c9a96e]/5 text-[#c9a96e]'
                            : 'border-transparent text-[#e8dcc0] hover:bg-white/[0.03] hover:text-[#f5f5f0]'
                        )}
                      >
                        <span className="block text-[11px] font-black leading-4 uppercase tracking-[0.12em]">{getPageLabel(t, item)}</span>
                        <span className="mt-1 block line-clamp-2 text-[9px] leading-4 text-[#e8dcc0] opacity-55">{PAGE_META[item].description}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </nav>

          <div className="border-t border-[#6b705c]/10 p-4">
            <div className={cx(
              'rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] p-3',
              role === 'employee' && 'bg-black/16'
            )}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{currentUser.username}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/65">{t.app[role] || role}</div>
                </div>
                {role === 'employee' && (
                  <button type="button" onClick={logout} className="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/55 transition hover:bg-white/[0.03] hover:text-[#c9a96e]">
                    Log Out
                  </button>
                )}
              </div>
            </div>
            {role === 'admin' && (
              <button
                type="button"
                onClick={() => goToPage('settings')}
                className={cx(
                  'mt-3 w-full rounded-xl border px-4 py-2.5 text-left transition-all duration-300',
                  page === 'settings'
                    ? 'border-[#c9a96e]/20 bg-[#c9a96e]/5 text-[#c9a96e]'
                    : 'border-[#6b705c]/20 text-[#e8dcc0]/50 hover:border-[#6b705c]/35 hover:text-[#e8dcc0]/80'
                )}
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.14em]">⚙ Settings</span>
              </button>
            )}
            {role !== 'employee' && <Button variant="secondary" onClick={logout} className="mt-3 w-full">{t.app.logout}</Button>}
          </div>
        </div>
      ) : (
        <div className="hidden h-full flex-col items-center gap-2 p-2 lg:flex">
          {pages.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              title={getPageLabel(t, item)}
              className={cx(
                'flex h-10 w-10 items-center justify-center rounded-xl border text-[9px] font-black transition-all duration-300',
                page === item
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e]'
                  : 'border-[#6b705c]/20 text-[#e8dcc0] hover:bg-white/5 hover:text-[#f5f5f0]'
              )}
            >
              {PAGE_META[item].code}
            </button>
          ))}
          {role === 'admin' && (
            <button
              type="button"
              onClick={() => goToPage('settings')}
              title="Settings"
              className={cx(
                'mt-auto flex h-10 w-10 items-center justify-center rounded-xl border text-[10px] transition-all duration-300',
                page === 'settings'
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e]'
                  : 'border-[#6b705c]/20 text-[#e8dcc0]/50 hover:bg-white/5 hover:text-[#e8dcc0]/80'
              )}
            >
              ⚙
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
