import React, { useState, useMemo } from 'react'
import { cx, formatMoney } from '../../utils/format'
import { Card, Button, TextArea, SmallReportFact } from '../../components/AppPrimitives'
import { EVENT_TIERS, EVENT_COGS_PERCENT, EVENT_LABOR_HOURLY_RATE } from '../../data/events'
import { generateExecutiveEventSummary } from '../../prompts/eventPrompts'
import {
  AlertTriangle,
  Beer,
  CalendarDays,
  ChefHat,
  CircleDollarSign,
  ClipboardCheck,
  GlassWater,
  Sparkles,
  Users,
  Utensils,
  Wine
} from 'lucide-react'

function calculateEventDurationHours(startTime, endTime) {
  const start = parseClockMinutes(startTime)
  const end = parseClockMinutes(endTime)
  if (start === null || end === null) return 1
  const minutes = end > start ? end - start : end + 1440 - start
  return Math.max(0.25, Math.round((minutes / 60) * 100) / 100)
}

function parseClockMinutes(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

function generateEventFnbBreakdown(config, calculations, tier) {
  return [
    `Bar supply: ${calculations.cocktails} welcome/signature cocktails, ${calculations.wineBottles} wine bottles, ${calculations.spiritBottles} spirit bottles, ${calculations.beerUnits} beer units, ${calculations.glasswareUnits} glassware turns.`,
    `Food plan: ${calculations.proteinKg.toFixed(1)} kg protein, ${calculations.starchKg.toFixed(1)} kg starch, ${calculations.vegetableKg.toFixed(1)} kg vegetables, ${calculations.sauceKg.toFixed(1)} kg sauce, plus ${calculations.dietaryBufferGuests} dietary buffer guests.`,
    `Financial assumptions: ${EVENT_COGS_PERCENT}% culinary COGS and ${formatMoney(EVENT_LABOR_HOURLY_RATE)} hourly labor are applied automatically. ${tier.label} service tier remains stored for future intelligence.`
  ].join('\n')
}

function NumberInput({ label, value, onChange, min, max, step = '1', type = 'number' }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">{label}</label>
      <input id={id} type={type} value={value} min={min} max={max} step={step} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">{label}</label>
      <select id={id} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20">
        {options.map(option => {
          const normalized = typeof option === 'string' ? { value: option, label: option } : option
          return <option key={normalized.value} value={normalized.value}>{normalized.label}</option>
        })}
      </select>
    </div>
  )
}

function EventMiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <div className="mt-1 break-words font-serif text-2xl font-black text-[#f5f5f0]">{value}</div>
    </div>
  )
}

function EventReportMetric({ label, value, accent = false }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <div className={cx('mt-2 break-words font-serif text-2xl font-black leading-7 sm:text-3xl', accent ? 'text-[#c9a96e]' : 'text-[#f5f5f0]')}>{value}</div>
    </div>
  )
}

function EventMetric({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]"><Icon className="h-5 w-5" aria-hidden="true" /></div>
      <div className="break-words font-serif text-3xl font-black text-[#f5f5f0]">{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <p className="mt-2 text-xs leading-5 text-[#e8dcc0]">{sub}</p>
    </div>
  )
}

function FinanceRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={cx('text-sm', strong ? 'font-black text-[#f5f5f0]' : 'text-[#e8dcc0]')}>{label}</span>
      <span className={cx('text-sm font-black', strong ? 'text-[#c9a96e]' : 'text-[#e8dcc0]')}>{value}</span>
    </div>
  )
}

function ProTip({ icon: Icon, children }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-4 text-sm leading-7 text-[#e8dcc0]">
      <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#c9a96e]"><Icon className="h-4 w-4" aria-hidden="true" /> Pro Tip</div>
      {children}
    </div>
  )
}

function CollapsibleEventCube({ icon: Icon, label, title, summary, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-[#6b705c]/20 bg-[linear-gradient(135deg,#15140f,#0a0a08)] shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
      <button type="button" onClick={() => setOpen(prev => !prev)} className="flex w-full flex-col gap-4 p-6 text-left transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]"><Icon className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c9a96e]">{label}</div>
            <h3 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">{title}</h3>
            <p className="mt-1 break-words text-xs font-bold leading-5 text-[#e8dcc0]">{summary}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#c9a96e]/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{open ? 'Close' : 'Open'}</span>
      </button>
      {open && <div className="border-t border-[#6b705c]/20 p-6">{children}</div>}
    </section>
  )
}

function BarSupplyCube({ calculations, tier }) {
  return (
    <CollapsibleEventCube
      icon={Wine}
      label="Bar Supply"
      title="Beverage and bar supply components."
      summary={`${calculations.cocktails} cocktails / ${calculations.wineBottles} wine bottles / ${calculations.glasswareUnits} glassware turns`}
      defaultOpen={false}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <EventMetric icon={GlassWater} label="Cocktails" value={calculations.cocktails} sub={`${tier.cocktailRate} drinks / guest`} />
        <EventMetric icon={Wine} label="Wine Bottles" value={calculations.wineBottles} sub={`${calculations.wineGlasses} glasses planned`} />
        <EventMetric icon={Sparkles} label="Spirit Bottles" value={calculations.spiritBottles} sub="750 ml / 16 pours" />
        <EventMetric icon={Beer} label="Beer Units" value={calculations.beerUnits} sub="1.2 units / guest" />
        <EventMetric icon={ClipboardCheck} label="Glassware" value={calculations.glasswareUnits} sub="3:1 high-end turnover" />
      </div>
      <ProTip icon={GlassWater}>Use large format ice for signature cocktails to reduce dilution, preserve texture, and lower silent over-pouring cost.</ProTip>
    </CollapsibleEventCube>
  )
}

function MenuDietaryCube({ calculations }) {
  return (
    <CollapsibleEventCube
      icon={ChefHat}
      label="Menu & Dietary"
      title="Food composition and dietary handling."
      summary={`${calculations.proteinKg.toFixed(1)} kg protein / ${calculations.dietaryBufferGuests} dietary buffer guests`}
      defaultOpen={false}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EventMetric icon={Utensils} label="Protein" value={`${calculations.proteinKg.toFixed(1)} kg`} sub="200g per guest" />
        <EventMetric icon={ChefHat} label="Starch" value={`${calculations.starchKg.toFixed(1)} kg`} sub="180g per guest" />
        <EventMetric icon={Users} label="Vegetables" value={`${calculations.vegetableKg.toFixed(1)} kg`} sub="160g per guest" />
        <EventMetric icon={ClipboardCheck} label="Sauce" value={`${calculations.sauceKg.toFixed(1)} kg`} sub="60g per guest" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <EventMetric icon={Users} label="Dietary Buffer" value={calculations.dietaryBufferGuests} sub="5% vegan / GF safety net" />
        <EventMetric icon={ClipboardCheck} label="Buffer Food Mass" value={`${calculations.dietaryBufferKg.toFixed(1)} kg`} sub="Social choice protection" />
      </div>
      <ProTip icon={ChefHat}>For luxury events, dietary meals should be plated with equal visual prestige. A safety net is operational insurance, not an afterthought.</ProTip>
    </CollapsibleEventCube>
  )
}

function ROIEngine({ calculations }) {
  const cogsStatus = calculations.margin < 30 ? 'critical' : calculations.margin < 42 ? 'watch' : 'healthy'
  const cogsClass = cogsStatus === 'critical' ? 'border-red-800/60 bg-red-950/25 text-red-200' : cogsStatus === 'watch' ? 'border-amber-800/60 bg-amber-950/25 text-amber-200' : 'border-emerald-800/60 bg-emerald-950/25 text-emerald-200'

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><CircleDollarSign className="h-4 w-4" aria-hidden="true" /> Financial ROI Engine</div>
      <div className="space-y-3">
        <FinanceRow label="Revenue" value={formatMoney(calculations.revenue)} />
        <FinanceRow label={`COGS (${calculations.cogsPercent}% fixed)`} value={formatMoney(calculations.cogs)} />
        <FinanceRow label={`Labor (${calculations.waiters} waiters, ${calculations.bartenders} bartenders at ${formatMoney(EVENT_LABOR_HOURLY_RATE)}/h)`} value={formatMoney(calculations.laborCost)} />
        <div className="my-4 border-t border-[#6b705c]/30" />
        <FinanceRow label="Gross Profit" value={formatMoney(calculations.grossProfit)} strong />
        <FinanceRow label="Gross Margin" value={`${calculations.margin.toFixed(1)}%`} strong />
      </div>
      <div className={cx('mt-5 rounded-2xl border p-4 text-sm leading-7', cogsClass)}>
        <div className="mb-1 flex items-center gap-2 font-black"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> Profit Discipline</div>
        {cogsStatus === 'critical' ? 'Margin is below the safe event target. Reprice, simplify package complexity, or reduce labor pressure before confirmation.' : cogsStatus === 'watch' ? 'Margin is acceptable but not premium. Watch bar volume, premium garnish, staffing creep, and open-bar leakage.' : 'Margin is healthy under the fixed 27% COGS and 60 NIS labor-hour model.'}
      </div>
    </Card>
  )
}

function EventConfiguration({ config, calculations, updateConfig }) {
  return (
    <section className="rounded-[2.5rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_88%_0%,rgba(201,169,110,0.10),transparent_32%),linear-gradient(135deg,#15140f,#090907)] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.42)] sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Event Input File</div>
          <h2 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Planning facts.</h2>
        </div>
        <span className="rounded-full border border-[#c9a96e]/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{calculations.duration.toFixed(2)} hours calculated</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <NumberInput label="Event Date" value={config.eventDate} type="date" onChange={value => updateConfig('eventDate', value)} />
        <NumberInput label="From Time" value={config.startTime} type="time" onChange={value => updateConfig('startTime', value)} />
        <NumberInput label="To Time" value={config.endTime} type="time" onChange={value => updateConfig('endTime', value)} />
        <NumberInput label="Contact Person" value={config.contactPerson} type="text" onChange={value => updateConfig('contactPerson', value)} />
        <NumberInput label="Phone Number" value={config.phone} type="text" onChange={value => updateConfig('phone', value)} />
        <NumberInput label="Event Budget" value={config.eventBudget} min="0" onChange={value => updateConfig('eventBudget', value)} />
        <SelectField label="Event Type" value={config.eventType} onChange={value => updateConfig('eventType', value)} options={['Business Event', 'Birthday', 'Wedding', 'Boutique Hotel Retreat']} />
        <SelectField label="Event Status" value={config.eventStatus} onChange={value => updateConfig('eventStatus', value)} options={['Inquiry', 'Approved', 'Operational Planning', 'Deposit Paid', 'Confirmed', 'Completed']} />
        <SelectField label="Service Tier" value={config.tier} onChange={value => updateConfig('tier', value)} options={Object.entries(EVENT_TIERS).map(([key, item]) => ({ value: key, label: item.label }))} />
        <NumberInput label="Guest Count" value={config.guests} min="1" onChange={value => updateConfig('guests', value)} />
        <NumberInput label="Price Per Guest (NIS)" value={config.pricePerGuest} min="0" onChange={value => updateConfig('pricePerGuest', value)} />
        <div className="rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">Internal Assumptions</div>
          <div className="text-sm font-bold leading-7 text-[#f5f5f0]">{EVENT_COGS_PERCENT}% COGS / {formatMoney(EVENT_LABOR_HOURLY_RATE)} labor hour</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextArea id="event-special-crm" label="Special Requests" rows={3} value={config.specialRequests} onChange={value => updateConfig('specialRequests', value)} />
        <TextArea id="event-staffing-crm" label="Staffing Notes" rows={3} value={config.staffingNotes} onChange={value => updateConfig('staffingNotes', value)} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <EventMiniStat label="Waiters" value={calculations.waiters} />
        <EventMiniStat label="Bartenders" value={calculations.bartenders} />
        <EventMiniStat label="Labor Hours" value={calculations.laborHours.toFixed(1)} />
      </div>
    </section>
  )
}

function EventExecutiveResults({ savedEvent, fallbackCalculations, tier }) {
  const calculations = savedEvent?.calculations || fallbackCalculations
  const config = savedEvent?.config

  if (!savedEvent) {
    return (
      <section className="rounded-[2.5rem] border border-dashed border-[#6b705c]/30 bg-[linear-gradient(135deg,#11100d,#090907)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
        <div className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Generated Outputs Locked</div>
        <h2 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Save the event to generate the executive event file.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#e8dcc0]">Event Summary, F&B intelligence, bar supply, menu planning, and financial readouts appear here only after the manager persists the event.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <EventMiniStat label="Revenue Preview" value={formatMoney(calculations.revenue)} />
          <EventMiniStat label="Margin Preview" value={`${calculations.margin.toFixed(1)}%`} />
          <EventMiniStat label="Duration" value={`${calculations.duration.toFixed(2)}h`} />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Card className="border-[#c9a96e]/20">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><Sparkles className="h-4 w-4" aria-hidden="true" /> Event Summary</div>
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Generated executive event brief.</h2>
          </div>
          <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">{config?.eventStatus || 'Saved'}</span>
        </div>
        <p className="text-sm leading-8 text-[#e8dcc0]">{config?.eventSummary}</p>
      </Card>

      <Card className="border-[#c9a96e]/20">
        <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Full F&B Breakdown</div>
        <div className="space-y-3">
          {String(config?.fnbBreakdown || '').split('\n').filter(Boolean).map(line => (
            <div key={line} className="rounded-2xl border border-[#6b705c]/25 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#e8dcc0]">{line}</div>
          ))}
        </div>
      </Card>

      <BarSupplyCube calculations={calculations} tier={EVENT_TIERS[config?.tier] || tier} />
      <MenuDietaryCube calculations={calculations} />
      <ROIEngine calculations={calculations} />
    </section>
  )
}

function SavedEventReports({ eventPlans = [] }) {
  return (
    <section className="rounded-[2.5rem] border border-[#c9a96e]/20 bg-[linear-gradient(135deg,#15140f,#090907)] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.4)] sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Saved Event Reports</div>
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Compact event intelligence snapshots.</h2>
        </div>
        <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">{eventPlans.length} saved</span>
      </div>

      {eventPlans.length ? (
        <div className="grid gap-4">
          {eventPlans.slice(0, 6).map(plan => {
            const calculations = plan.calculations || {}
            const config = plan.config || {}
            const margin = Number(plan.projected_margin ?? calculations.margin ?? 0)
            return (
              <article key={plan.id} className="overflow-hidden rounded-[2rem] border border-[#6b705c]/25 bg-[#10100e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{plan.eventDate || config.eventDate || plan.created_at?.slice(0, 10) || 'Saved plan'}</div>
                    <h3 className="mt-1 break-words font-serif text-2xl font-black leading-7 text-[#f5f5f0]">{plan.name}</h3>
                    <p className="mt-1 text-xs font-bold text-[#e8dcc0]">{config.eventType || plan.eventType || 'Event'} / {config.eventTime || calculations.eventTime || `${config.startTime || ''} - ${config.endTime || ''}`}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">{config.tier ? EVENT_TIERS[config.tier]?.label || config.tier : 'event'}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <EventReportMetric label="Guests" value={calculations.guests || config.guests || plan.guests || 0} />
                  <EventReportMetric label="Revenue" value={formatMoney(plan.projected_revenue ?? calculations.revenue ?? 0)} />
                  <EventReportMetric label="Profit" value={formatMoney(plan.projected_profit ?? calculations.grossProfit ?? 0)} accent />
                  <EventReportMetric label="Margin" value={`${margin.toFixed(1)}%`} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <SmallReportFact label="Cocktails" value={calculations.cocktails || 0} />
                  <SmallReportFact label="Wine" value={`${calculations.wineBottles || 0} btls`} />
                  <SmallReportFact label="Labor" value={`${Number(calculations.laborHours || 0).toFixed(1)}h`} />
                  <SmallReportFact label="Status" value={plan.status || config.eventStatus || 'Saved'} />
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-5 text-sm leading-7 text-[#e8dcc0]">
          No saved event reports yet. Click <span className="font-black text-[#c9a96e]">Save Event</span> after configuring the event.
        </div>
      )}
    </section>
  )
}

export default function EventOrchestrator({ t, eventPlans = [], onEventPlanSaved }) {
  const [config, setConfig] = useState({
    eventDate: new Date().toISOString().slice(0, 10),
    startTime: '14:30',
    endTime: '17:10',
    contactPerson: '',
    phone: '',
    eventBudget: 148000,
    eventType: 'Wedding',
    specialRequests: 'VIP table, dietary safety net, kosher wine review.',
    staffingNotes: 'Assign senior captain and dedicated bar lead.',
    eventStatus: 'Inquiry',
    guests: 180,
    tier: 'premium',
    pricePerGuest: EVENT_TIERS.premium.defaultPrice
  })
  const [saveStatus, setSaveStatus] = useState(null)
  const [lastSavedEvent, setLastSavedEvent] = useState(null)

  const tier = EVENT_TIERS[config.tier]
  const calculations = useMemo(() => {
    const guests = Math.max(1, Number(config.guests) || 1)
    const duration = calculateEventDurationHours(config.startTime, config.endTime)
    const price = Math.max(0, Number(config.pricePerGuest) || 0)
    const cogsPercent = EVENT_COGS_PERCENT
    const hourlyRate = EVENT_LABOR_HOURLY_RATE

    const cocktails = Math.ceil(guests * tier.cocktailRate)
    const wineBottles = Math.ceil(guests / 3.5)
    const wineGlasses = wineBottles * 4
    const spiritBottles = Math.ceil((guests * duration * 0.35) / 16)
    const beerUnits = Math.ceil(guests * 1.2)
    const glasswareUnits = Math.ceil(guests * 3)
    const proteinKg = guests * 0.2
    const starchKg = guests * 0.18
    const vegetableKg = guests * 0.16
    const sauceKg = guests * 0.06
    const foodMassKg = guests * 0.75
    const dietaryBufferGuests = Math.ceil(guests * 0.05)
    const dietaryBufferKg = dietaryBufferGuests * 0.75
    const revenue = guests * price
    const cogs = revenue * (cogsPercent / 100)
    const waiters = Math.ceil(guests / 15)
    const bartenders = Math.ceil(guests / 50)
    const laborHours = (waiters + bartenders) * duration
    const laborCost = laborHours * hourlyRate
    const grossProfit = revenue - cogs - laborCost
    const margin = revenue ? (grossProfit / revenue) * 100 : 0

    return {
      guests,
      duration,
      eventTime: `${config.startTime} - ${config.endTime}`,
      price,
      cogsPercent,
      hourlyRate,
      cocktails,
      wineBottles,
      wineGlasses,
      spiritBottles,
      beerUnits,
      glasswareUnits,
      proteinKg,
      starchKg,
      vegetableKg,
      sauceKg,
      foodMassKg,
      dietaryBufferGuests,
      dietaryBufferKg,
      revenue,
      cogs,
      waiters,
      bartenders,
      laborHours,
      laborCost,
      grossProfit,
      margin
    }
  }, [config, tier])

  function updateConfig(field, value) {
    setConfig(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'tier') {
        next.pricePerGuest = EVENT_TIERS[value].defaultPrice
      }
      return next
    })
  }

  async function saveEventPlan() {
    setSaveStatus({ type: 'loading', message: 'Saving event plan...' })
    const generatedFnbBreakdown = generateEventFnbBreakdown(config, calculations, tier)
    const summarySourceEvent = {
      id: 'Pending save',
      name: `${config.contactPerson || tier.label} event - ${calculations.guests} guests`,
      eventType: config.eventType,
      eventDate: config.eventDate,
      contactPerson: config.contactPerson,
      phone: config.phone,
      budget: Number(config.eventBudget) || calculations.revenue || 0,
      guests: calculations.guests,
      fnbBreakdown: generatedFnbBreakdown,
      specialRequests: config.specialRequests,
      staffingNotes: config.staffingNotes,
      status: config.eventStatus,
      config,
      calculations,
      projected_revenue: calculations.revenue || Number(config.eventBudget) || 0,
      projected_profit: calculations.grossProfit || 0,
      projected_margin: calculations.margin || 0
    }
    const generatedSummary = generateExecutiveEventSummary(summarySourceEvent)
    const persistedConfig = {
      ...config,
      eventSummary: generatedSummary,
      fnbBreakdown: generatedFnbBreakdown,
      cogsPercent: EVENT_COGS_PERCENT,
      hourlyRate: EVENT_LABOR_HOURLY_RATE
    }

    try {
      const savedPlan = await onEventPlanSaved?.({
        name: `${config.contactPerson || tier.label} event - ${calculations.guests} guests`,
        config: persistedConfig,
        calculations
      })
      setLastSavedEvent(savedPlan || { config: persistedConfig, calculations })
      setSaveStatus({ type: 'success', message: `${savedPlan?.name || 'Event plan'} saved. Executive outputs generated below.` })
    } catch (error) {
      console.warn('Event plan save failed:', error)
      setSaveStatus({ type: 'error', message: 'Could not save event plan. Backend may be offline.' })
    }
  }

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_78%_10%,rgba(201,169,110,0.16),transparent_35%),linear-gradient(135deg,#1b1914,#0f0f0e_72%)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-[#c9a96e]">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Event CRM
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-[#f5f5f0] sm:text-6xl">Plan first. Save once. Generate the event intelligence file.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#e8dcc0]">Managers enter the commercial and operational facts first. HESTIA generates the executive summary and F&B intelligence only after the event is saved into memory.</p>
          </div>
          <div className="grid min-w-[280px] gap-3 rounded-2xl border border-[#6b705c]/30 bg-[#c9a96e]/10 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Silent Calculation Preview</div>
            <div className="font-serif text-5xl font-black text-[#c9a96e]">{formatMoney(calculations.grossProfit)}</div>
            <div className={cx('text-sm font-black', calculations.margin >= 45 ? 'text-emerald-300' : calculations.margin >= 32 ? 'text-[#c9a96e]' : 'text-red-300')}>{calculations.margin.toFixed(1)}% projected margin</div>
            <Button onClick={saveEventPlan} disabled={saveStatus?.type === 'loading'}>{saveStatus?.type === 'loading' ? 'Saving...' : 'Save Event'}</Button>
            {saveStatus && saveStatus.type !== 'loading' && <div className={cx('text-xs font-bold leading-5', saveStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300')}>{saveStatus.message}</div>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.72fr)]">
        <EventConfiguration config={config} calculations={calculations} updateConfig={updateConfig} />
        <div className="space-y-6">
          <EventExecutiveResults savedEvent={lastSavedEvent} fallbackCalculations={calculations} tier={tier} />
          <SavedEventReports eventPlans={eventPlans} />
        </div>
      </div>
    </>
  )
}
