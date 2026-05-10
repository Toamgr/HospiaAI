export const COCKTAIL_LAB_INITIAL_FORM = {
  baseSpirit: 'Gin',
  secondarySpirit: 'Dry vermouth',
  flavorProfile: 'Citrus, herbal, elegant',
  sweetness: 4,
  acidity: 7,
  bitterness: 3,
  notes: 'Fresh lemon, basil, white peach',
  seasonality: 'Spring / summer',
  kosherRequirement: 'Kosher-friendly ingredients required',
  complexity: 'Intermediate',
  batchability: 'Batchable with fresh citrus added a la minute',
  shelfLife: '24 hours for batch without citrus',
  glassware: 'Chilled coupe',
  garnish: 'Expressed lemon twist and basil leaf',
  targetPrice: 64,
  targetCogs: 24,
  serviceContext: 'bar menu'
}

export const COCKTAIL_LAB_PROMPT_ONLY_FORM = {
  baseSpirit: '',
  secondarySpirit: '',
  flavorProfile: '',
  sweetness: 0,
  acidity: 0,
  bitterness: 0,
  notes: '',
  seasonality: '',
  kosherRequirement: '',
  complexity: '',
  batchability: '',
  shelfLife: '',
  glassware: '',
  garnish: '',
  targetPrice: '',
  targetCogs: '',
  serviceContext: ''
}

export const SERVICE_CONTEXTS = ['signature', 'event', 'low abv', 'crowd pleaser', 'premium', 'seasonal', 'mocktail']
export const COMPLEXITY_LEVELS = ['Low', 'Intermediate', 'Advanced']
export const KOSHER_OPTIONS = ['No special requirement', 'Kosher-friendly ingredients required', 'Strict kosher supervision required']

// Ingredient reasoning matrix: global cocktail-world options scored against parsed intent and menu gaps.
export const MIXOLOGY_INTELLIGENCE = {
  spirits: [
    { key: 'gin', label: 'London dry gin', aliases: ['gin'], styles: ['herbal', 'floral', 'refreshing', 'stirred'], cost: 2 },
    { key: 'vodka', label: 'premium vodka', aliases: ['vodka'], styles: ['refreshing', 'fruit', 'crowd pleaser'], cost: 2 },
    { key: 'rum', label: 'aged rum', aliases: ['rum', 'rhum'], styles: ['tropical', 'spice', 'creamy'], cost: 2 },
    { key: 'tequila', label: 'blanco tequila', aliases: ['tequila'], styles: ['fresh', 'herbal', 'spice', 'tropical'], cost: 3 },
    { key: 'mezcal', label: 'espadin mezcal', aliases: ['mezcal'], styles: ['smoky', 'herbal', 'bitter', 'surprising'], cost: 4 },
    { key: 'whisky', label: 'rye whisky', aliases: ['whisky', 'whiskey', 'bourbon', 'rye'], styles: ['spirit-forward', 'stirred', 'spice', 'bitter'], cost: 3 },
    { key: 'brandy', label: 'cognac VSOP', aliases: ['brandy', 'cognac'], styles: ['premium', 'stirred', 'fruit', 'silky'], cost: 4 },
    { key: 'pisco', label: 'acholado pisco', aliases: ['pisco'], styles: ['floral', 'fresh', 'sour/citrus'], cost: 3 },
    { key: 'low abv', label: 'fino sherry', aliases: ['sherry', 'vermouth', 'low abv'], styles: ['low abv', 'bitter', 'herbal', 'stirred'], cost: 2 }
  ],
  modifiers: [
    { name: 'blanc vermouth', tags: ['floral', 'low abv', 'stirred', 'premium'], cost: 2 },
    { name: 'dry vermouth', tags: ['herbal', 'stirred', 'low abv'], cost: 2 },
    { name: 'amontillado sherry', tags: ['nutty', 'low abv', 'premium', 'stirred'], cost: 2 },
    { name: 'Campari', tags: ['bitter', 'premium', 'stirred'], cost: 2 },
    { name: 'Aperol', tags: ['bitter', 'refreshing', 'low abv'], cost: 2 },
    { name: 'green Chartreuse', tags: ['herbal', 'premium', 'surprising'], cost: 5 },
    { name: 'elderflower liqueur', tags: ['floral', 'fresh', 'crowd pleaser'], cost: 3 },
    { name: 'falernum', tags: ['spice', 'tropical', 'refreshing'], cost: 2 },
    { name: 'coffee liqueur', tags: ['creamy', 'premium', 'bitter'], cost: 2 },
    { name: 'coconut cordial', tags: ['tropical', 'creamy', 'crowd pleaser'], cost: 2 },
    { name: 'ginger liqueur', tags: ['spice', 'fresh', 'surprising'], cost: 3 }
  ],
  acids: [
    { name: 'fresh lime juice', tags: ['fresh', 'tropical', 'tequila', 'rum', 'refreshing'], cost: 1 },
    { name: 'fresh lemon juice', tags: ['fresh', 'gin', 'brandy', 'pisco', 'floral'], cost: 1 },
    { name: 'grapefruit acid blend', tags: ['bitter', 'refreshing', 'tequila', 'mezcal'], cost: 2 },
    { name: 'verjus', tags: ['premium', 'low abv', 'floral', 'soft'], cost: 3 },
    { name: 'yuzu juice', tags: ['premium', 'surprising', 'fresh'], cost: 5 }
  ],
  sweeteners: [
    { name: '1:1 cane syrup', tags: ['neutral', 'low cost', 'refreshing'], cost: 1 },
    { name: 'agave syrup', tags: ['tequila', 'mezcal', 'tropical'], cost: 2 },
    { name: 'honey syrup', tags: ['herbal', 'winter', 'silky'], cost: 2 },
    { name: 'demerara syrup', tags: ['rum', 'whisky', 'spice'], cost: 1 },
    { name: 'pineapple cordial', tags: ['tropical', 'crowd pleaser', 'premium'], cost: 2 },
    { name: 'white peach cordial', tags: ['fruit', 'floral', 'summer'], cost: 3 },
    { name: 'ginger syrup', tags: ['spice', 'fresh', 'surprising'], cost: 2 }
  ],
  bitters: [
    { name: 'orange bitters', tags: ['gin', 'vodka', 'stirred', 'floral'], cost: 1 },
    { name: 'aromatic bitters', tags: ['whisky', 'brandy', 'spice', 'stirred'], cost: 1 },
    { name: 'celery bitters', tags: ['herbal', 'refreshing', 'surprising'], cost: 2 },
    { name: 'grapefruit bitters', tags: ['bitter', 'fresh', 'tequila', 'mezcal'], cost: 2 },
    { name: 'mole bitters', tags: ['spice', 'smoky', 'premium'], cost: 2 }
  ],
  herbs: [
    { name: 'basil', tags: ['herbal', 'summer', 'fresh', 'tequila', 'gin'], cost: 1 },
    { name: 'mint', tags: ['refreshing', 'tropical', 'crowd pleaser'], cost: 1 },
    { name: 'rosemary', tags: ['herbal', 'winter', 'smoky'], cost: 1 },
    { name: 'sage', tags: ['herbal', 'premium', 'brandy', 'whisky'], cost: 2 },
    { name: 'shiso', tags: ['surprising', 'fresh', 'premium'], cost: 4 }
  ],
  spices: [
    { name: 'pink peppercorn', tags: ['spice', 'floral', 'premium'], cost: 2 },
    { name: 'black cardamom', tags: ['smoky', 'spice', 'surprising'], cost: 3 },
    { name: 'ginger', tags: ['spice', 'fresh', 'crowd pleaser'], cost: 1 },
    { name: 'cinnamon', tags: ['winter', 'rum', 'whisky', 'spice'], cost: 1 }
  ],
  fruits: [
    { name: 'white peach', tags: ['fruit', 'floral', 'summer', 'gin', 'vodka'], cost: 3 },
    { name: 'grapefruit', tags: ['bitter', 'fresh', 'tequila', 'mezcal'], cost: 2 },
    { name: 'pineapple', tags: ['tropical', 'rum', 'crowd pleaser'], cost: 2 },
    { name: 'green apple', tags: ['fresh', 'low cost', 'vodka', 'low abv'], cost: 1 },
    { name: 'blackberry', tags: ['fruit', 'premium', 'brandy', 'gin'], cost: 3 },
    { name: 'passion fruit', tags: ['tropical', 'premium', 'surprising'], cost: 4 }
  ],
  textureBuilders: [
    { name: 'chilled soda water', tags: ['refreshing', 'low abv', 'highball', 'lower cost'], cost: 1 },
    { name: 'egg white', tags: ['silky', 'sour/citrus', 'premium'], cost: 1 },
    { name: 'coconut cream', tags: ['creamy', 'tropical'], cost: 2 },
    { name: 'saline solution', tags: ['premium', 'fresh', 'bitter', 'low cost'], cost: 1 },
    { name: 'olive oil drops', tags: ['surprising', 'premium', 'stirred'], cost: 3 }
  ],
  glassware: [
    { name: 'Highball', tags: ['refreshing', 'low abv', 'crowd pleaser', 'event'] },
    { name: 'Chilled coupe', tags: ['premium', 'sour/citrus', 'floral', 'silky'] },
    { name: 'Rocks glass', tags: ['bitter', 'smoky', 'spirit-forward'] },
    { name: 'Nick and Nora', tags: ['stirred', 'premium', 'spirit-forward'] },
    { name: 'Large wine glass', tags: ['low abv', 'floral', 'refreshing'] }
  ],
  garnish: [
    { name: 'expressed grapefruit peel and basil leaf', tags: ['fresh', 'herbal', 'tequila', 'mezcal'] },
    { name: 'lemon coin and shiso leaf', tags: ['premium', 'fresh', 'surprising'] },
    { name: 'mint crown and dehydrated pineapple', tags: ['tropical', 'crowd pleaser'] },
    { name: 'orange twist and pink pepper dust', tags: ['bitter', 'premium', 'spice'] },
    { name: 'rosemary sprig clipped to glass', tags: ['smoky', 'herbal', 'winter'] },
    { name: 'edible flower and expressed lemon', tags: ['floral', 'premium'] },
    { name: 'thin apple fan and saline mist', tags: ['low abv', 'fresh', 'lower cost'] }
  ]
}

export const ingredientReasoningMatrix = MIXOLOGY_INTELLIGENCE

function stableHash(value) {
  return String(value || '').split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)))
}

function detectKeywords(text, dictionary) {
  return dictionary.filter(item => {
    const aliases = item.aliases || [item.key, item.label, item.name]
    return aliases.some(alias => alias && text.includes(String(alias).toLowerCase()))
  })
}

function clampScore(value, fallback = 5) {
  const n = Number(value)
  if (Number.isFinite(n)) return Math.max(0, Math.min(10, n))
  return fallback
}

function inferScale(text, current, positiveTerms, negativeTerms) {
  let score = clampScore(current)
  if (promptIncludes(text, positiveTerms)) score = Math.max(score, 7)
  if (promptIncludes(text, negativeTerms)) score = Math.min(score, 3)
  return score
}

// Reasoning stage 1: translate the manager's free text plus form constraints into a structured beverage intent.

export const COCKTAIL_VARIATIONS = [
  'More premium',
  'Lower prep complexity',
  'More bitter',
  'More refreshing',
  'More surprising',
  'Better margin'
]

export const COCKTAIL_COMMAND_CHIPS = [
  {
    label: 'Dinner Signature',
    signal: 'High-margin menu role',
    prompt: 'Create a premium dinner-menu signature with strong margin discipline, elegant guest language, and fast repeatable service.'
  },
  {
    label: 'Event Welcome',
    signal: 'Batchable volume serve',
    prompt: 'Create a batchable event welcome cocktail for 200 guests with premium perception, minimal garnish labor, and kosher-friendly execution.'
  },
  {
    label: 'Aperitif Gap',
    signal: 'Low-ABV profit lever',
    prompt: 'Create a low-ABV aperitif that solves a menu gap, feels adult and premium, and protects cost through perceived value.'
  },
  {
    label: 'Rooftop Sunset',
    signal: 'Guest psychology seller',
    prompt: 'Create a rooftop sunset cocktail for a stylish crowd: photogenic, refreshing, not too sweet, premium but operationally fast.'
  },
  {
    label: 'Kosher Seasonal',
    signal: 'Constraint-aware build',
    prompt: 'Create a kosher-friendly seasonal cocktail with global cocktail intelligence, clean sourcing risk, and polished service notes.'
  }
]

export const COCKTAIL_STRATEGIC_ITERATIONS = [
  {
    label: 'Generate More Premium Version',
    signal: 'raise perceived value',
    prompt: 'Generate a more premium version. Increase perceived guest value, strengthen the concept story, and protect operational realism.'
  },
  {
    label: 'Improve Margin',
    signal: 'protect gross profit',
    prompt: 'Improve margin without making the drink feel cheaper. Shift value into aroma, temperature, story, garnish discipline, or modifier strategy.'
  },
  {
    label: 'Lower Prep Complexity',
    signal: 'faster service path',
    prompt: 'Lower prep complexity and station pressure while preserving premium perception and menu role.'
  },
  {
    label: 'More Guest Friendly',
    signal: 'increase orderability',
    prompt: 'Make this more guest friendly and easier to sell while keeping it sophisticated and not generic.'
  },
  {
    label: 'More Signature / Award Worthy',
    signal: 'stronger flagship route',
    prompt: 'Make this more signature and award-worthy. Increase differentiation, memorable tension, and beverage-list authority.'
  },
  {
    label: 'Generate Alternative Route',
    signal: 'new candidate path',
    prompt: 'Generate an alternative route from the same brief. Do not simply revise the current recipe; create a distinct candidate with a different strategic structure.'
  }
]

export const COCKTAIL_CONTEXT_ACTIONS = [
  ['Challenge this concept', 'Challenge this concept like a strict beverage director. If it is weak, replace the weak parts with a stronger route.'],
  ['Request stronger differentiation', 'Increase differentiation from the current approved menu and avoid predictable category repetition.'],
  ['Tighten costing', 'Tighten costing and margin logic while preserving premium guest perception.'],
  ['Simplify bartender execution', 'Simplify bartender execution for real service pressure without making the drink feel basic.'],
  ['Increase premium perception', 'Increase premium perception through story, aroma, texture, or serve architecture without unnecessary cost.'],
  ['Make more menu-safe', 'Make the cocktail more menu-safe, more repeatable, and less risky for staff execution.']
]

