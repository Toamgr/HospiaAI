export function calculateStaff(guests, barType, format, accessibility) {
  const eventManager = 1
  const waiters = Math.ceil(guests / 15)
  const bartenders = barType === 'Open Bar'
    ? Math.max(2, Math.ceil(guests / 40))
    : Math.max(1, Math.ceil(guests / 60))
  const kitchen = Math.ceil(guests / 18)
  const accessHost = (accessibility?.wheelchairs > 0) ? 1 : 0
  const concierge = (format || '').includes('24-hour') ? 2 : 0
  const total = eventManager + waiters + bartenders + kitchen + accessHost + concierge
  return { eventManager, waiters, bartenders, kitchen, accessHost, concierge, total }
}

export function calculateFood(guests) {
  return {
    tastings: guests * 4,
    mainKg: (guests * 350 / 1000).toFixed(1),
    sidesKg: (guests * 200 / 1000).toFixed(1),
    dessertKg: (guests * 150 / 1000).toFixed(1),
    bread: guests * 2
  }
}

export function calculateBeverage(guests) {
  return {
    softLitres: (guests * 1.5).toFixed(0),
    waterLitres: guests,
    wineBottles: Math.ceil(guests * 0.5),
    beerCans: Math.ceil(guests * 1.5),
    iceKg: (guests * 0.5).toFixed(0)
  }
}

export function calculateBudget(guests, budgetPerPerson) {
  const total = guests * budgetPerPerson
  return {
    total,
    food: Math.round(total * 0.45),
    beverage: Math.round(total * 0.25),
    staff: Math.round(total * 0.20),
    equipment: Math.round(total * 0.10)
  }
}

export function formatCurrency(amount, currency = '₪') {
  return `${currency}${amount.toLocaleString()}`
}
