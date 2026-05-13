import React, { useState } from 'react'
import { cx } from '../../utils/format'
import { getVisibleAcademies, getUserLessonProgress, isLessonComplete, isLessonUnlocked, countUniversityLessons, countCompletedLessons } from '../../utils/academy'

function EmployeeHomeSignal({ label, value }) {
  return (
    <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#6b705c]/14 bg-white/[0.022] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#e8dcc0]/48">{label}</span>
      <span className="font-serif text-sm font-black text-[#c9a96e] sm:text-base">{value}</span>
    </div>
  )
}

function EmployeeOperatingMoment({ section, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group min-h-[88px] rounded-[1.25rem] border border-[#6b705c]/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(0,0,0,0.15))] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.022)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[#c9a96e]/24 hover:bg-[#c9a96e]/[0.035] hover:shadow-[0_16px_52px_rgba(0,0,0,0.24)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-base font-black leading-tight text-[#f5f5f0] transition group-hover:text-[#c9a96e]">{section.title}</h3>
        <span className="shrink-0 rounded-full border border-[#c9a96e]/14 bg-black/18 px-2 py-0.5 text-[9px] font-black text-[#c9a96e]">{section.value}</span>
      </div>
      <p className="mt-2 line-clamp-2 max-h-9 overflow-hidden text-[11px] leading-[1.1rem] text-[#e8dcc0]/64">{section.body}</p>
    </button>
  )
}

function EmployeeBubbleModule({ module, onOpen }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const sizeClass = {
    secondary: 'h-[140px] w-full max-w-[250px] sm:h-[150px] sm:max-w-[270px] xl:h-full xl:max-w-none',
    primary: 'h-[152px] w-full max-w-[280px] sm:h-[164px] sm:max-w-[300px] xl:h-full xl:max-w-none',
    hero: 'h-[172px] w-full max-w-[315px] sm:h-[184px] sm:max-w-[350px] xl:h-full xl:max-w-none'
  }[module.size] || 'h-[150px] w-full max-w-[270px]'
  const titleClass = {
    secondary: 'text-xl sm:text-2xl',
    primary: 'text-2xl sm:text-3xl',
    hero: 'text-3xl sm:text-4xl'
  }[module.size] || 'text-2xl'
  const resolvedTitleClass = module.titleClass || titleClass

  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -5
    setTilt({ x, y })
  }

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseMove={move}
      onMouseLeave={() => {
        setHovered(false)
        setTilt({ x: 0, y: 0 })
      }}
      onClick={onOpen}
      className={cx(
        'group relative flex shrink-0 items-center justify-center overflow-hidden rounded-[999px] border border-[#c9a96e]/13 bg-[radial-gradient(circle_at_32%_10%,rgba(255,255,255,0.07),transparent_27%),linear-gradient(145deg,rgba(201,169,110,0.105),rgba(18,17,13,0.82)_48%,rgba(0,0,0,0.52))] px-5 py-4 text-center shadow-[0_22px_70px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.045)] outline-none transition-[border-color,box-shadow,filter] duration-500 hover:border-[#c9a96e]/34 hover:shadow-[0_28px_86px_rgba(0,0,0,0.42),0_0_30px_rgba(201,169,110,0.08)] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/40',
        sizeClass,
        module.layout
      )}
      style={{ transform: `perspective(900px) translateY(${hovered ? -4 : 0}px) scale(${hovered ? 1.012 : 1}) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_78%,rgba(201,169,110,0.15),transparent_29%)] opacity-60 transition duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-[10px] rounded-[999px] border border-white/[0.032]" />
      <div className="pointer-events-none absolute left-1/2 top-7 h-2 w-2 -translate-x-1/2 rounded-full bg-[#c9a96e]/55 shadow-[0_0_24px_rgba(201,169,110,0.28)]" />

      <div className="relative z-10 flex h-full w-full max-w-[80%] min-w-0 flex-col items-center justify-center">
        <h2 className={cx('mx-auto max-w-[15rem] break-words font-serif font-black leading-[0.98] tracking-tight text-[#f5f5f0] transition duration-500 [text-wrap:balance] group-hover:text-[#c9a96e]', resolvedTitleClass)}>
          {module.label}
        </h2>
      </div>
    </button>
  )
}

export default function EmployeeHome({ t, currentUser, goToPage, academyProgress = {}, employeeTasks = [], employeeRequests = [], approvedCocktails = [], cocktailPractice = {} }) {
  const employeeName = currentUser?.username || 'Employee'
  const pendingTasks = employeeTasks.filter(task => task.status !== 'done')
  const practiced = Object.values(cocktailPractice[employeeName] || {}).filter(item => item?.practiced).length
  const practiceRate = approvedCocktails.length ? Math.round((practiced / approvedCocktails.length) * 100) : 0
  const visibleAcademies = getVisibleAcademies(currentUser)
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)
  const totalLessons = countUniversityLessons(visibleAcademies)
  const completedLessonCount = countCompletedLessons(completedLessons)
  const courseAverage = totalLessons ? Math.round((completedLessonCount / totalLessons) * 100) : 0
  const myRequests = employeeRequests.filter(request => request.submittedBy === employeeName)
  const todayLabel = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  const nextAcademy = visibleAcademies.find(academy => academy.lessons?.some((lesson, index) => (
    isLessonUnlocked(academy, index, completedLessons) && !isLessonComplete(completedLessons, academy.id, lesson.id)
  ))) || visibleAcademies[0]
  const nextLesson = nextAcademy?.lessons?.find((lesson, index) => (
    isLessonUnlocked(nextAcademy, index, completedLessons) && !isLessonComplete(completedLessons, nextAcademy.id, lesson.id)
  )) || nextAcademy?.lessons?.[0]
  const cocktailFocus = approvedCocktails[0]?.name || 'Reserve list pending'
  const experienceSections = [
    {
      title: 'Today Operations',
      value: pendingTasks.length ? `${pendingTasks.length} open` : 'Clear',
      body: pendingTasks[0]?.title || 'No urgent assigned work. Stay ready for live service signals.',
      page: pendingTasks.length ? 'serviceRecovery' : 'courses'
    },
    {
      title: 'Continue Learning',
      value: `${courseAverage}%`,
      body: `${nextLesson?.title || 'Academy lesson'} is the next active progression path.`,
      page: 'courses'
    },
    {
      title: 'Service Culture',
      value: 'Rituals',
      body: 'Guest language, sequence standards, floor conduct, and emotional hospitality.',
      page: 'sopSheets'
    },
    {
      title: 'Approved Cocktail Library',
      value: String(approvedCocktails.length),
      body: `${cocktailFocus}. Study approved flagship creations before service.`,
      page: 'approvedCocktails'
    },
    {
      title: 'Report An Issue',
      value: 'Fast',
      body: 'Protect service quality early with a safe operational report.',
      page: 'serviceRecovery'
    }
  ]
  const modules = [
    {
      id: 'courses',
      label: 'Continue Learning',
      page: 'courses',
      size: 'primary',
      layout: 'xl:col-start-1 xl:row-start-1'
    },
    {
      id: 'sopSheets',
      label: 'Service',
      page: 'sopSheets',
      size: 'hero',
      layout: 'xl:col-start-2 xl:row-start-1'
    },
    {
      id: 'approvedCocktails',
      label: 'Approved Cocktail Library',
      page: 'approvedCocktails',
      size: 'secondary',
      layout: 'xl:col-start-3 xl:row-start-1',
      titleClass: 'text-[1.2rem] sm:text-[1.4rem]'
    },
    {
      id: 'employeeRequests',
      label: 'Employee Requests',
      page: 'employeeRequests',
      size: 'secondary',
      layout: 'xl:col-start-1 xl:row-start-2'
    },
    {
      id: 'serviceRecovery',
      label: 'Report An Issue',
      page: 'serviceRecovery',
      size: 'primary',
      layout: 'xl:col-start-2 xl:row-start-2'
    },
    {
      id: 'employeeAchievements',
      label: 'Achievements',
      page: 'employeeAchievements',
      size: 'secondary',
      layout: 'xl:col-start-3 xl:row-start-2'
    }
  ]

  return (
    <section className="relative min-h-[calc(100vh-4.75rem)] overflow-hidden rounded-[2rem] border border-[#6b705c]/14 bg-[radial-gradient(circle_at_18%_12%,rgba(201,169,110,0.14),transparent_31%),radial-gradient(circle_at_82%_24%,rgba(232,220,192,0.07),transparent_28%),linear-gradient(135deg,#12110e,#070706_72%)] px-4 py-4 shadow-[0_28px_100px_rgba(0,0,0,0.36)] sm:px-6 lg:px-7">
      <div className="pointer-events-none absolute left-1/2 top-[55%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a96e]/[0.045]" />
      <div className="pointer-events-none absolute left-1/2 top-[55%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6b705c]/[0.06]" />
      <div className="relative mx-auto max-w-[1180px]">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-2 text-[8px] font-black uppercase tracking-[0.34em] text-[#c9a96e]">Employee Hospitality OS</div>
          <h1 className="font-serif text-[clamp(2.15rem,4.2vw,4.6rem)] font-black leading-[0.98] tracking-tight text-[#f5f5f0]">Own the shift.</h1>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-[#e8dcc0]/76 sm:text-sm">Training, service culture, bar knowledge, and issue reporting shaped into one calm operating surface.</p>
        </header>

        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          <EmployeeHomeSignal label="Today" value={todayLabel} />
          <EmployeeHomeSignal label="Assigned Work" value={`${pendingTasks.length} open`} />
          <EmployeeHomeSignal label="Cocktail Practice" value={`${practiceRate}%`} />
          <EmployeeHomeSignal label="Requests" value={String(myRequests.length)} />
        </div>

        <div className="mx-auto mt-3 grid max-w-6xl gap-2.5 md:grid-cols-2 xl:grid-cols-5">
          {experienceSections.map(section => (
            <EmployeeOperatingMoment key={section.title} section={section} onOpen={() => goToPage(section.page)} />
          ))}
        </div>

        <div className="mx-auto mt-5 grid max-w-[960px] grid-cols-1 place-items-center gap-3 pb-2 sm:grid-cols-2 sm:gap-4 xl:mt-6 xl:grid-cols-3 xl:grid-rows-[150px_150px] xl:items-center xl:gap-4">
          {modules.map(module => (
            <EmployeeBubbleModule key={module.id} module={module} onOpen={() => goToPage(module.page)} />
          ))}
        </div>
      </div>
    </section>
  )
}
