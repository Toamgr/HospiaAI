import { cx } from '../../utils/format'
import { canAccessPage } from '../../config/roleConfig'

const RAIL_ITEMS = [
  { key: 'employeeHome',   label: 'Home' },
  { key: 'dailyWork',      label: 'Daily Work' },
  { key: 'courses',        label: 'Courses' },
  { key: 'barWorld',       label: 'Bar World' },
  { key: 'wineKnowledge',  label: 'Wine' },
]

export default function EmployeeNavRail({ page, goToPage, currentUser }) {
  const items = RAIL_ITEMS.filter(item => canAccessPage(currentUser, item.key))

  return (
    <aside
      className="hidden lg:flex w-44 shrink-0 flex-col border-r border-[#6b705c]/10 bg-[#080806]/70 py-7 px-3"
      aria-label="Employee navigation"
    >
      <nav className="flex flex-col gap-0.5">
        {items.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => goToPage(item.key)}
            className={cx(
              'w-full rounded-xl px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200',
              page === item.key
                ? 'border border-[#c9a96e]/18 bg-[#c9a96e]/10 text-[#c9a96e] shadow-[0_2px_12px_rgba(201,169,110,0.06)]'
                : 'border border-transparent text-[#e8dcc0]/50 hover:border-[#6b705c]/15 hover:bg-white/[0.03] hover:text-[#f5f5f0]'
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
