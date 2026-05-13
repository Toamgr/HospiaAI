import React from 'react'
import { cx } from '../../utils/format'
import { NAV_GROUPS } from '../../config/navigationConfig'
import { allowedPagesForArea, canAccessPage } from '../../config/roleConfig'
import { getAreaLabel, getAreaDescription } from './shellUtils'

export default function TopNav({ t, currentUser, role, area, page, goToArea, goToPage, collapsed, setCollapsed, unreadCount = 0, onToggleNotifications, logout }) {
  const areas = Object.entries(NAV_GROUPS)
    .filter(([key]) => allowedPagesForArea(currentUser, key).length)
    .map(([key]) => key)
  const employeePages = [
    ['employeeHome', 'Home'],
    ['courses', 'Courses'],
    ['sopSheets', 'Service'],
    ['approvedCocktails', 'Cocktails'],
    ['wineKnowledge', 'Wine'],
    ['employeeRequests', 'Requests'],
    ['serviceRecovery', 'Report']
  ].filter(([key]) => canAccessPage(currentUser, key))

  if (role === 'employee') {
    return (
      <header className="sticky top-0 z-40 border-b border-[#6b705c]/10 bg-[#080806]/92 backdrop-blur-xl">
        <div className="flex min-h-14 flex-wrap items-center gap-2.5 px-4 py-1.5 sm:px-6 lg:px-9">
          <button type="button" onClick={() => goToPage?.('employeeHome')} className="shrink-0 text-left">
            <div className="font-serif text-lg font-black tracking-[0.06em] text-[#c9a96e]">
              {t.app.name} <span className="text-[#f5f5f0]">{t.app.suffix}</span>
            </div>
            <div className="hidden text-[7px] font-black uppercase tracking-[0.26em] text-[#e8dcc0]/42 sm:block">
              Employee Hospitality OS
            </div>
          </button>

          <nav className="order-3 flex w-full gap-1.5 overflow-x-auto pt-1 sm:order-none sm:w-auto sm:flex-1 sm:justify-center sm:pt-0" aria-label="Employee navigation">
            {employeePages.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => goToPage?.(key)}
                className={cx(
                  'min-h-8 shrink-0 rounded-full border px-3.5 text-[9px] font-black uppercase tracking-[0.13em] transition-all duration-300',
                  page === key
                    ? 'border-[#c9a96e]/24 bg-[#c9a96e]/8 text-[#c9a96e] shadow-[0_8px_26px_rgba(201,169,110,0.06)]'
                    : 'border-[#6b705c]/12 bg-white/[0.015] text-[#e8dcc0]/62 hover:border-[#c9a96e]/22 hover:text-[#f5f5f0]'
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onToggleNotifications}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6b705c]/14 bg-white/[0.022] text-[#e8dcc0]/62 transition hover:border-[#c9a96e]/32 hover:text-[#c9a96e]"
            aria-label="Open notifications"
          >
            <span className="text-xs leading-none">!</span>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9a96e] px-1 text-[9px] font-black text-[#11100d]">{unreadCount}</span>
            )}
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden rounded-full border border-[#c9a96e]/12 bg-[#c9a96e]/[0.04] px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-[#e8dcc0]/68 sm:block">
              {currentUser.username.toUpperCase()} - EMPLOYEE
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#e8dcc0]/50 transition hover:bg-white/[0.032] hover:text-[#c9a96e]"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#6b705c]/20 bg-[#0d0c09]/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center gap-8 px-8 sm:px-12 lg:px-16">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] text-[#e8dcc0] transition hover:border-[#c9a96e] hover:text-[#c9a96e]"
          aria-label={collapsed ? t.ui.openPanel : t.ui.collapsePanel}
        >
          <span className="block w-4">
            <span className="mb-1 block h-0.5 rounded bg-current" />
            <span className="mb-1 block h-0.5 rounded bg-current" />
            <span className="block h-0.5 rounded bg-current" />
          </span>
        </button>

        <div className="min-w-fit">
          <div className="font-serif text-2xl font-black tracking-[0.06em] text-[#c9a96e]">
            {t.app.name} <span className="text-[#f5f5f0]">{t.app.suffix}</span>
          </div>
          <div className="hidden text-[9px] font-black uppercase tracking-[0.3em] text-[#e8dcc0] opacity-60 sm:block">
            {t.app.tagline}
          </div>
        </div>

        <nav className="flex flex-1 gap-4 overflow-x-auto px-4" aria-label="Primary navigation">
          {areas.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => goToArea(item)}
              className={cx(
                'min-h-12 shrink-0 rounded-2xl border px-6 py-2 text-left transition-all duration-300',
                area === item
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e] shadow-lg shadow-[#c9a96e]/5'
                  : 'border-transparent text-[#e8dcc0] hover:bg-[#6b705c]/10 hover:text-[#f5f5f0]'
              )}
            >
              <span className="block text-xs font-black uppercase tracking-widest">{getAreaLabel(t, item)}</span>
              <span className="hidden text-[10px] leading-4 text-[#e8dcc0] opacity-50 xl:block">
                {getAreaDescription(t, item)}
              </span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={onToggleNotifications}
          className="relative hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e] lg:inline-flex"
          aria-label="Open notifications"
        >
          <span className="text-lg leading-none">!</span>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a96e] px-1 text-[10px] font-black text-[#11100d]">{unreadCount}</span>
          )}
        </button>

        <div className="hidden rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#c9a96e] lg:block">
          {currentUser.username} - {t.app[role] || role}
        </div>
      </div>
    </header>
  )
}
