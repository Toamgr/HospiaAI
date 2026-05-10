// HOSPIA AI - extracted static data. Values moved from App.jsx without behavior changes.

export const EVENT_TIERS = {
  standard: { label: 'Standard', cocktailRate: 1.2, defaultPrice: 420, accent: 'text-[#e8dcc0]' },
  premium: { label: 'Premium', cocktailRate: 1.6, defaultPrice: 620, accent: 'text-[#c9a96e]' },
  luxury: { label: 'Luxury / Michelin', cocktailRate: 2.1, defaultPrice: 920, accent: 'text-emerald-300' }
}

export const EVENT_LABOR_HOURLY_RATE = 60

export const EVENT_COGS_PERCENT = 27

export const INITIAL_FUTURE_EVENTS = [
  { id: 'event-seed-1', name: 'Cohen Wedding Dinner', eventDate: '2026-05-16', contactPerson: 'Maya Cohen', phone: '052-555-1818', budget: 148000, summary: 'Luxury wedding reception with plated dinner and premium cocktail opening.', guests: 220, fnbBreakdown: 'Reception cocktails, four-course dinner, premium wine, late-night coffee bar.', specialRequests: 'Kosher wine list, vegan safety net, no nuts on dessert station.', staffingNotes: 'Assign two VIP-capable captains and dedicated bar lead.', status: 'Deposit Paid', projected_revenue: 148000, projected_profit: 56200, projected_margin: 38, created_at: '2026-05-04T12:00:00.000Z' }
]
