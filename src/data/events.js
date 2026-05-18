// HOSPIA AI - extracted static data. Values moved from App.jsx without behavior changes.

// AUDIT FLAG — defaultPrice values are illustrative calculator defaults. Replace with venue-confirmed per-head pricing before production.
export const EVENT_TIERS = {
  standard: { label: 'Standard', cocktailRate: 1.2, defaultPrice: 420, accent: 'text-[#e8dcc0]' }, // AUDIT FLAG — demo default
  premium: { label: 'Premium', cocktailRate: 1.6, defaultPrice: 620, accent: 'text-[#c9a96e]' },   // AUDIT FLAG — demo default
  luxury: { label: 'Luxury / Michelin', cocktailRate: 2.1, defaultPrice: 920, accent: 'text-emerald-300' } // AUDIT FLAG — demo default
}

// AUDIT FLAG — placeholder labor rate. Replace with venue's actual hourly labor cost before production.
export const EVENT_LABOR_HOURLY_RATE = 60

// AUDIT FLAG — placeholder COGS percentage. Replace with venue's verified food and beverage cost percentage before production.
export const EVENT_COGS_PERCENT = 27

export const INITIAL_FUTURE_EVENTS = []
