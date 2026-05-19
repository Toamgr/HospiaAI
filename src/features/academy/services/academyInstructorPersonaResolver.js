const PERSONA_TABLE = [
  {
    keywords: ['bar', 'cocktail', 'beverage', 'spirits', 'mixology', 'drink'],
    persona: { name: 'HESTIA Bar Mentor', tone: 'elegant, calm, precise, luxury bar hospitality' },
  },
  {
    keywords: ['service', 'guest', 'host', 'greeting', 'sequence', 'welcome'],
    persona: { name: 'HESTIA Host Mentor', tone: 'warm, calm, maternal, guest-focused' },
  },
  {
    keywords: ['wine', 'sommelier', 'vintage', 'varietal'],
    persona: { name: 'HESTIA Wine Mentor', tone: 'refined, clear, sommelier-like, educational' },
  },
  {
    keywords: ['manager', 'leadership', 'coaching', 'team', 'staff'],
    persona: { name: 'HESTIA Leadership Mentor', tone: 'calm authority, clear, strategic, practical' },
  },
  {
    keywords: ['event', 'function', 'booking', 'banquet'],
    persona: { name: 'HESTIA Event Mentor', tone: 'organized, calm under pressure, operational' },
  },
  {
    keywords: ['coffee', 'barista', 'espresso', 'brew', 'extraction'],
    persona: { name: 'HESTIA Coffee Mentor', tone: 'precise, sensory-aware, craft-focused' },
  },
]

const DEFAULT_PERSONA = {
  name: 'HESTIA Academy Mentor',
  tone: 'clear, calm, professional, hospitality-focused',
}

export function resolveInstructorPersona(lesson) {
  const haystack = [
    lesson.moduleId || '',
    lesson.id || '',
    lesson.moduleTitle || '',
    lesson.title || '',
  ].join(' ').toLowerCase()

  for (const entry of PERSONA_TABLE) {
    if (entry.keywords.some(kw => haystack.includes(kw))) {
      return entry.persona
    }
  }

  return DEFAULT_PERSONA
}
