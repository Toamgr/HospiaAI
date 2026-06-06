function WorldCard({ eyebrow, title, description, mainPage, mainLabel, quickLinks, goToPage }) {
  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.028),rgba(0,0,0,0.18))] p-5 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.022)]">

      <div className="mb-5">
        <div className="mb-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/65">{eyebrow}</div>
        <h2 className="font-serif text-[1.75rem] font-black leading-tight text-[#f5f5f0]">{title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#e8dcc0]/55">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => goToPage(mainPage)}
        className="mb-4 w-full rounded-xl border border-[#c9a96e]/24 bg-[#c9a96e]/8 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#c9a96e] transition-all duration-200 hover:border-[#c9a96e]/38 hover:bg-[#c9a96e]/14"
      >
        {mainLabel} →
      </button>

      <div className="space-y-1.5">
        {quickLinks.map(link => (
          <button
            key={link.page}
            type="button"
            onClick={() => goToPage(link.page)}
            className="group flex w-full items-center justify-between rounded-lg border border-[#6b705c]/10 bg-white/[0.012] px-3 py-2 text-left transition-all duration-200 hover:border-[#6b705c]/22 hover:bg-white/[0.025]"
          >
            <span className="text-[11px] font-semibold text-[#e8dcc0]/60 transition group-hover:text-[#f5f5f0]">{link.label}</span>
            <span className="text-[10px] text-[#6b705c]/45 transition group-hover:text-[#c9a96e]/60">→</span>
          </button>
        ))}
      </div>

    </div>
  )
}

export default function EmployeeHome({ currentUser, goToPage }) {
  return (
    <section className="relative min-h-[calc(100vh-4.75rem)]">
      <div className="mx-auto max-w-3xl">

        <header className="mb-8 pt-1">
          <div className="mb-2 text-[8px] font-black uppercase tracking-[0.34em] text-[#c9a96e]">
            HESTIA
          </div>
          <h1 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-black leading-[0.97] tracking-tight text-[#f5f5f0]">
            Where do you want to start?
          </h1>
          <p className="mt-2.5 max-w-md text-sm leading-6 text-[#e8dcc0]/55">
            Choose your area for today's session.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">

          <WorldCard
            eyebrow="Learn"
            title="Academy"
            description="Hospitality, service culture, wine, and bar knowledge."
            mainPage="courses"
            mainLabel="Open Academy"
            quickLinks={[
              { label: 'Service School', page: 'courses' },
              { label: 'Bar World', page: 'barWorld' },
              { label: 'Wine',      page: 'wineKnowledge' },
            ]}
            goToPage={goToPage}
          />

          <WorldCard
            eyebrow="Work"
            title="Daily Work"
            description="Your shifts, menus, requests, and milestones."
            mainPage="dailyWork"
            mainLabel="Open Daily Work"
            quickLinks={[
              { label: 'My Shifts',  page: 'myShifts' },
              { label: 'Menus',      page: 'foodMenuView' },
              { label: 'Requests',   page: 'employeeRequests' },
              { label: 'Milestones', page: 'employeeAchievements' },
            ]}
            goToPage={goToPage}
          />

        </div>

      </div>
    </section>
  )
}
