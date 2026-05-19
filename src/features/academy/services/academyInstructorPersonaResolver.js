// Named persona records for HESTIA Academy instructors.
// Each persona has greeting phrases, transition phrases, closing phrases,
// and a voice profile. Phrases are fixed text, not generated.
// Add new personas here when a new academy ships.

export const BAR_RAFAEL = {
  id: 'bar-rafael',
  name: 'Rafael',
  academyId: 'bar-academy',
  academyLabel: 'Bar Academy',
  tone: 'elegant, calm, precise, luxury bar hospitality',
  short_bio: 'Bar craft instructor.',
  signature_phrase: 'Behind every great bar is a calm professional.',
  greeting_phrases: [
    'Welcome behind the bar.',
    'Good to have you here.',
    'Let us begin.',
  ],
  closing_phrases: [
    'That is what we have today. Take one thing to the floor tonight.',
    'Practice what we covered. The next shift is your proving ground.',
    'Until next time, stay precise.',
  ],
  transitions: {
    to_terminology: 'A few words before we begin.',
    to_depth: 'Here is what is underneath.',
    to_failures: 'Here is where most pours go wrong.',
    to_practice: 'Now, the part that matters.',
    to_guest: 'And from the guest\'s side—',
    to_drill: 'Tonight, practice it once. Just once.',
    to_taxonomy: 'These are the categories to know.',
  },
  voice_profile: {
    rate: 0.88,
    pitch: 0.92,
    volume: 1,
  },
}

// Fallback descriptor personas for academies that don't yet have a named persona.
// These are intentionally generic and will be replaced as each persona ships.
const PERSONA_TABLE = [
  {
    keywords: ['bar', 'cocktail', 'beverage', 'spirits', 'mixology', 'drink'],
    persona: BAR_RAFAEL,
  },
  {
    keywords: ['service', 'guest', 'host', 'greeting', 'sequence', 'welcome'],
    persona: {
      id: 'service-mira',
      name: 'Mira',
      academyLabel: 'Service Academy',
      tone: 'warm, calm, maternal, guest-focused',
      greeting_phrases: ['Welcome.', 'Good to have you here.'],
      closing_phrases: ['That is what we have for today.'],
      transitions: {
        to_terminology: 'A few terms before we begin.',
        to_depth: 'Here is the foundation.',
        to_failures: 'Here is where things often slip.',
        to_practice: 'Now, how to apply it.',
        to_guest: 'From the guest\'s perspective—',
        to_drill: 'Practice this before your next floor shift.',
        to_taxonomy: 'These are the categories to know.',
      },
      voice_profile: { rate: 0.88, pitch: 0.96, volume: 1 },
    },
  },
  {
    keywords: ['wine', 'sommelier', 'vintage', 'varietal'],
    persona: {
      id: 'wine-helene',
      name: 'Hélène',
      academyLabel: 'Wine Academy',
      tone: 'refined, clear, sommelier-like, educational',
      greeting_phrases: ['Welcome.', 'Let us begin.'],
      closing_phrases: ['That is what we have for today.'],
      transitions: {
        to_terminology: 'A few terms before we begin.',
        to_depth: 'Here is the foundation.',
        to_failures: 'Here is where errors occur.',
        to_practice: 'In practice—',
        to_guest: 'For the guest—',
        to_drill: 'Practice this tonight.',
        to_taxonomy: 'These are the categories.',
      },
      voice_profile: { rate: 0.88, pitch: 0.94, volume: 1 },
    },
  },
  {
    keywords: ['manager', 'leadership', 'coaching', 'team', 'staff'],
    persona: {
      id: 'manager-daniel',
      name: 'Daniel',
      academyLabel: 'Manager Academy',
      tone: 'calm authority, clear, strategic, practical',
      greeting_phrases: ['Welcome.', 'Let us begin.'],
      closing_phrases: ['That is what we have for today.'],
      transitions: {
        to_terminology: 'A few definitions first.',
        to_depth: 'Here is the foundation.',
        to_failures: 'Where this typically breaks down—',
        to_practice: 'In practice—',
        to_guest: 'The team perspective—',
        to_drill: 'Apply this before your next briefing.',
        to_taxonomy: 'These are the categories.',
      },
      voice_profile: { rate: 0.88, pitch: 0.90, volume: 1 },
    },
  },
  {
    keywords: ['event', 'function', 'booking', 'banquet'],
    persona: {
      id: 'events-noa',
      name: 'Noa',
      academyLabel: 'Event Academy',
      tone: 'organized, calm under pressure, operational',
      greeting_phrases: ['Welcome.', 'Let us begin.'],
      closing_phrases: ['That is what we have for today.'],
      transitions: {
        to_terminology: 'A few terms first.',
        to_depth: 'Here is the operational foundation.',
        to_failures: 'Where events commonly fail—',
        to_practice: 'Now, how to execute—',
        to_guest: 'From the client\'s side—',
        to_drill: 'Practice this for your next event.',
        to_taxonomy: 'These are the categories.',
      },
      voice_profile: { rate: 0.88, pitch: 0.93, volume: 1 },
    },
  },
  {
    keywords: ['coffee', 'barista', 'espresso', 'brew', 'extraction'],
    persona: {
      id: 'coffee-theo',
      name: 'Theo',
      academyLabel: 'Coffee Academy',
      tone: 'precise, sensory-aware, craft-focused',
      greeting_phrases: ['Welcome.', 'Let us begin.'],
      closing_phrases: ['That is what we have for today.'],
      transitions: {
        to_terminology: 'A few terms before we begin.',
        to_depth: 'Here is the science underneath.',
        to_failures: 'Here is where extraction fails.',
        to_practice: 'In practice—',
        to_guest: 'What the guest experiences—',
        to_drill: 'Practice this on your next shift.',
        to_taxonomy: 'These are the extraction categories.',
      },
      voice_profile: { rate: 0.88, pitch: 0.91, volume: 1 },
    },
  },
]

const DEFAULT_PERSONA = {
  id: 'default-mentor',
  name: 'Academy Mentor',
  academyLabel: 'HESTIA Academy',
  tone: 'clear, calm, professional, hospitality-focused',
  greeting_phrases: ['Welcome.', 'Let us begin.'],
  closing_phrases: ['That is what we have for today.'],
  transitions: {
    to_terminology: 'A few terms before we begin.',
    to_depth: 'Here is the foundation.',
    to_failures: 'Here is where things often go wrong.',
    to_practice: 'In practice—',
    to_guest: 'From the guest\'s side—',
    to_drill: 'Practice this.',
    to_taxonomy: 'These are the categories.',
  },
  voice_profile: { rate: 0.88, pitch: 0.92, volume: 1 },
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
