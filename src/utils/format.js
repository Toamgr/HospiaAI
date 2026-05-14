export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatMoney(value) {
  return `NIS ${Math.round(value).toLocaleString()}`
}

export function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .slice(0, 3)
    .join(' ')
}

export function formatCocktailIngredientLine(item) {
  if (item && typeof item === 'object') {
    const amount = item.amountMl ?? item.amount_ml ?? item.ml ?? item.amount
    const ingredient = item.ingredient || item.ingredientName || item.name || item.label
    const role = item.role || item.purpose || item.description || item.note
    if (!ingredient) {
      console.warn('Cocktail ingredient render mismatch', { item, reason: 'missing ingredient name' })
    }
    return [
      amount ? `${amount} ml` : '',
      ingredient || 'Ingredient missing',
      role || ''
    ].filter(Boolean).join(' - ')
  }

  const value = String(item || '').trim()
  if (/^\d+(?:\.\d+)?\s*ml$/i.test(value)) {
    console.warn('Cocktail ingredient render mismatch', { item, reason: 'amount-only ingredient line' })
  }
  return value
}
