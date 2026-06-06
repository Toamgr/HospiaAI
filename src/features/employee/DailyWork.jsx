import React from 'react'

function ActionRow({ label, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[#6b705c]/12 bg-white/[0.016] px-4 py-3 text-left transition-all duration-300 hover:border-[#c9a96e]/22 hover:bg-[#c9a96e]/[0.032]"
    >
      <div className="min-w-0">
        <div className="text-[13px] font-semibold leading-tight text-[#f5f5f0] transition duration-300 group-hover:text-[#c9a96e]">
          {label}
        </div>
        {sub && (
          <div className="mt-0.5 text-[10px] leading-tight text-[#e8dcc0]/42">{sub}</div>
        )}
      </div>
      <span className="shrink-0 text-[10px] text-[#6b705c]/45 transition duration-300 group-hover:text-[#c9a96e]">
        →
      </span>
    </button>
  )
}

function DailyWorkSection({ eyebrow, title, description, actions, goToPage }) {
  return (
    <div className="rounded-[1.25rem] border border-[#6b705c]/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.028),rgba(0,0,0,0.14))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.022)]">
      <div className="mb-3.5">
        <div className="mb-1 text-[8px] font-black uppercase tracking-[0.26em] text-[#c9a96e]/75">
          {eyebrow}
        </div>
        <h2 className="font-serif text-[1.15rem] font-black leading-tight text-[#f5f5f0]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[11px] leading-relaxed text-[#e8dcc0]/50">{description}</p>
        )}
      </div>
      <div className="space-y-2">
        {actions.map(action => (
          <ActionRow
            key={action.page}
            label={action.label}
            sub={action.sub}
            onClick={() => goToPage(action.page)}
          />
        ))}
      </div>
    </div>
  )
}

export default function DailyWork({ currentUser, goToPage, employeeRequests = [], assignedTasks = [] }) {
  const name = currentUser?.username || 'Employee'

  const myRequests = employeeRequests.filter(r => r.submittedBy === name)
  const openTasks = assignedTasks.filter(t => {
    const byId   = currentUser?.id && t.assignedToIds?.includes(currentUser.id)
    const byName = t.assignedTo?.includes(name)
    return (byId || byName) && t.status !== 'done'
  })

  const sections = [
    {
      eyebrow: 'Shift Management',
      title: 'My Shifts',
      description: 'Schedule and availability for current and next week.',
      actions: [
        { label: 'Schedule',     page: 'myShifts',        sub: 'View published shifts' },
        { label: 'Availability', page: 'constraintsForm', sub: 'Submit weekly constraints' },
      ]
    },
    {
      eyebrow: 'Service Reference',
      title: 'Menus',
      description: 'Food and cocktail menus for shift preparation.',
      actions: [
        { label: 'Food Menu',     page: 'foodMenuView',      sub: 'Published kitchen menus' },
        // TODO (Phase 3+): Replace with a dedicated approved published cocktail menu endpoint.
        // Routing to approved cocktails training as the closest available employee-facing view.
        { label: 'Cocktail Menu', page: 'approvedCocktails', sub: 'Approved bar programme' },
      ]
    },
    {
      eyebrow: 'Operational',
      title: 'Requests',
      description: myRequests.length
        ? `${myRequests.length} request${myRequests.length !== 1 ? 's' : ''} on record.`
        : 'Submit supply, maintenance, or service requests.',
      actions: [
        { label: 'Requests', page: 'employeeRequests', sub: 'Submit or review your requests' },
      ]
    },
    {
      eyebrow: 'Progression',
      title: 'Milestones',
      description: 'Readiness, completed paths, and service growth.',
      actions: [
        { label: 'View Milestones', page: 'employeeAchievements', sub: 'Progress and readiness score' },
      ]
    }
  ]

  return (
    <section className="relative min-h-[calc(100vh-4.75rem)]">
      <div className="mx-auto max-w-3xl">

        <header className="mb-7 pt-1">
          <div className="mb-2 text-[8px] font-black uppercase tracking-[0.34em] text-[#c9a96e]">
            Daily Work
          </div>
          <h1 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-black leading-[0.97] tracking-tight text-[#f5f5f0]">
            Manage your shift.
          </h1>
          <p className="mt-2.5 max-w-lg text-sm leading-6 text-[#e8dcc0]/60">
            Shifts, menus, requests, and milestones — everything for today's service.
          </p>
          {openTasks.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-800/28 bg-amber-950/18 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
              <span className="text-[11px] font-semibold text-amber-300/80">
                {openTasks.length} task{openTasks.length !== 1 ? 's' : ''} assigned to you
              </span>
            </div>
          )}
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map(section => (
            <DailyWorkSection key={section.title} {...section} goToPage={goToPage} />
          ))}
        </div>

      </div>
    </section>
  )
}
