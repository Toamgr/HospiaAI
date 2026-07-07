// Shared field definitions + pure form/API mapping for the Owner Beverage Direction Brief
// (Beverage Slice 1A). Used by both the container (data shaping) and the presentational
// component (labels/hints/order) — kept here so neither has to duplicate the field list.

// The eleven brief fields, in the order the owner reads them. multiline picks the control;
// hint is guidance about what the field MEANS — never example content.
export const FIELD_DEFS = [
  { key: 'venue_type', label: 'Venue type', hint: 'What kind of place this is, in your words.' },
  { key: 'service_style', label: 'Service style', hint: 'How service feels here — pace, formality, table or bar.' },
  { key: 'intent_statement', label: 'Intent', hint: 'What you want the beverage program to say about the venue.', multiline: true },
  { key: 'guest_profile', label: 'Guest profile', hint: 'Who you are pouring for.', multiline: true },
  { key: 'flavor_direction', label: 'Flavor direction', hint: 'Where the flavors should lean.', multiline: true },
  { key: 'cocktail_count', label: 'Cocktail count', hint: 'How many cocktails the list should carry (a whole number).', numeric: true },
  { key: 'zero_proof_stance', label: 'Zero-proof stance', hint: 'How seriously the program treats non-alcoholic guests.' },
  { key: 'constraints', label: 'Constraints', hint: 'Hard limits — equipment, ingredients, kosher, anything non-negotiable.', multiline: true },
  { key: 'price_range', label: 'Price range', hint: 'Where cocktail pricing should sit.' },
  { key: 'staff_capability_note', label: 'Staff capability', hint: 'What the team behind the bar can honestly execute.', multiline: true },
  { key: 'season_context', label: 'Season context', hint: 'The season or moment this direction is for.' },
]

export const EMPTY_FIELDS = Object.fromEntries(FIELD_DEFS.map(f => [f.key, '']))

// Map an API brief (nullable values) into form state (strings for inputs).
export function briefToForm(brief) {
  const out = { ...EMPTY_FIELDS }
  for (const def of FIELD_DEFS) {
    const v = brief?.fields?.[def.key]
    out[def.key] = v === null || v === undefined ? '' : String(v)
  }
  return out
}

// Map form state back to the API payload: blank → null (an empty field stays empty).
export function formToFields(form) {
  const out = {}
  for (const def of FIELD_DEFS) {
    const raw = form[def.key]
    if (typeof raw !== 'string' || raw.trim().length === 0) { out[def.key] = null; continue }
    out[def.key] = def.numeric ? Number(raw) : raw
  }
  return out
}
