// Venue DNA → Target Taste Profile Mapping.
//
// Maps venue LANGUAGE (owner words, vibe, positioning) into target decimal taste
// profile RANGES on the canonical 0.0–5.0 scale, plus a beverage direction and an
// emotional register. This is the bridge between Venue Intelligence and Beverage
// Intelligence — but it only produces a target *range*, never a finished recipe,
// and only for archetypes the venue language actually matches.
//
// Ranges are deliberately WIDE and only set on the dimensions an archetype really
// implies; everything else stays null (unknown) so we never fabricate a target.
// A venue can match multiple archetypes (e.g. "high-end but accessible" + "warm
// Mediterranean"); resolveVenueTasteTarget merges them.
//
// Pure data + lookup. No AI. No fabricated venue data.

import { mergeTasteRanges, TASTE_DIMENSION_KEYS } from './tasteProfileSchema.js'

// r(min,max) — helper to keep the table readable. Values are 0.0–5.0.
const r = (min, max) => ({ min, max })

export const VENUE_TASTE_ARCHETYPES = Object.freeze({
  classic_luxury: {
    label: 'Classic luxury',
    keywords: ['classic luxury', 'luxury', 'luxurious', 'opulent', 'prestige', 'refined', 'timeless', 'old world', 'grand'],
    emotional_register: 'refined, deliberate, prestige',
    beverage_direction: 'Spirit-forward and stirred classics, impeccable execution, restraint over novelty. Premium pours, low gimmick.',
    target_taste_profile_range: {
      bitterness: r(1.0, 3.5), body: r(3.0, 4.5), finish_length: r(3.0, 4.5),
      alcohol_heat: r(2.5, 4.0), aroma_intensity: r(2.5, 4.0), sweetness: r(0.5, 2.5),
    },
  },
  warm_mediterranean: {
    label: 'Warm Mediterranean',
    keywords: ['mediterranean', 'levant', 'aperitivo', 'coastal', 'sun', 'tel aviv', 'jaffa', 'greek', 'italian', 'herbal', 'citrus grove'],
    emotional_register: 'sociable, sunlit, generous',
    beverage_direction: 'Bright citrus and herbal aperitivo profiles, spritzes and low-ABV social drinks, fresh produce, food-friendly.',
    target_taste_profile_range: {
      acidity: r(2.5, 4.0), bitterness: r(1.5, 3.0), aroma_intensity: r(2.5, 4.0),
      sweetness: r(1.5, 3.0), alcohol_heat: r(1.0, 2.8), texture: r(2.0, 3.5),
    },
  },
  young_nightlife: {
    label: 'Young nightlife',
    keywords: ['nightlife', 'club', 'party', 'late night', 'high energy', 'loud', 'dance', 'shots', 'crowd', 'buzzy'],
    emotional_register: 'high-energy, bold, fun',
    beverage_direction: 'Bold, recognizable, fast-build crowd-pleasers. Sweeter and punchier, photogenic, high throughput. Avoid subtle/slow drinks.',
    target_taste_profile_range: {
      sweetness: r(2.5, 4.0), acidity: r(2.0, 3.8), aroma_intensity: r(2.0, 3.8),
      alcohol_heat: r(2.0, 3.8), texture: r(2.0, 4.0),
    },
  },
  fine_dining: {
    label: 'Fine dining',
    keywords: ['fine dining', 'tasting menu', 'gastronomic', 'michelin', 'chef', 'pairing', 'degustation', 'haute'],
    emotional_register: 'precise, considered, food-led',
    beverage_direction: 'Precision and food-pairing logic; acid and bitterness to cut richness, umami/savoury frontier, restrained sweetness, elegant aromatics.',
    target_taste_profile_range: {
      acidity: r(2.0, 4.0), bitterness: r(1.5, 3.5), umami: r(0.5, 2.5),
      sweetness: r(0.5, 2.5), aroma_intensity: r(2.5, 4.5), finish_length: r(2.5, 4.0),
    },
  },
  event_wedding: {
    label: 'Event / wedding',
    keywords: ['event', 'wedding', 'banquet', 'reception', 'celebration', 'large group', 'catering', 'gala'],
    emotional_register: 'celebratory, inclusive, occasion',
    beverage_direction: 'Crowd-friendly, batchable, fast service. Broadly likable balance, moderate ABV, photogenic, zero-proof option. Avoid polarizing extremes.',
    target_taste_profile_range: {
      sweetness: r(2.0, 3.5), acidity: r(2.0, 3.5), bitterness: r(0.5, 2.0),
      alcohol_heat: r(1.5, 3.0), texture: r(2.0, 3.5),
    },
  },
  beach_bar: {
    label: 'Beach bar',
    keywords: ['beach', 'seaside', 'tropical', 'tiki', 'resort', 'poolside', 'sunset', 'holiday', 'vacation'],
    emotional_register: 'relaxed, tropical, easy',
    beverage_direction: 'Refreshing long serves and tropical builds, rum-led, fruit-forward, high refreshment. Heat tolerance: keep cold, effervescent, not heavy.',
    target_taste_profile_range: {
      acidity: r(2.5, 4.0), sweetness: r(2.5, 4.0), aroma_intensity: r(2.0, 3.8),
      texture: r(2.0, 4.0), alcohol_heat: r(1.0, 2.8), body: r(1.5, 3.5),
    },
  },
  hotel_bar: {
    label: 'Hotel bar',
    keywords: ['hotel', 'lobby', 'lounge', 'business', 'travel', 'concierge', 'boutique hotel'],
    emotional_register: 'polished, versatile, dependable',
    beverage_direction: 'Broad, reliable repertoire across the day — aperitivo through nightcap. Classic competence, consistent quality, a few signatures. All-rounder balance.',
    target_taste_profile_range: {
      acidity: r(1.5, 3.5), sweetness: r(1.5, 3.0), bitterness: r(1.0, 3.0),
      body: r(2.0, 4.0), aroma_intensity: r(2.0, 3.8), finish_length: r(2.0, 3.8),
    },
  },
  premium_neighborhood_bar: {
    label: 'Premium neighborhood bar',
    keywords: ['neighborhood', 'local', 'regulars', 'community', 'corner bar', 'home bar', 'familiar', 'everyday premium'],
    emotional_register: 'warm, familiar, quietly excellent',
    beverage_direction: 'Approachable craft — classics done very well plus a few signatures. Comfortable, repeatable, not intimidating, fair value-for-quality.',
    target_taste_profile_range: {
      acidity: r(2.0, 3.8), sweetness: r(1.5, 3.0), bitterness: r(1.0, 3.0),
      body: r(2.0, 3.8), aroma_intensity: r(2.0, 3.5),
    },
  },
  not_pretentious: {
    label: 'Not pretentious',
    keywords: ['not pretentious', 'unpretentious', 'no fuss', 'down to earth', 'approachable', 'honest', 'no gimmicks', 'no nonsense'],
    emotional_register: 'honest, easy, welcoming',
    beverage_direction: 'Clear, recognizable drinks with honest names; avoid theatre and obscure ingredients. Quality without ceremony. Easy to order and explain.',
    target_taste_profile_range: {
      sweetness: r(1.5, 3.5), acidity: r(2.0, 3.8), bitterness: r(0.5, 2.5),
      aroma_intensity: r(1.5, 3.2),
    },
  },
  high_end_accessible: {
    label: 'High-end but accessible',
    keywords: ['high-end but accessible', 'high end but accessible', 'accessible luxury', 'elevated but approachable', 'premium but approachable', 'refined but friendly'],
    emotional_register: 'elevated yet welcoming',
    beverage_direction: 'Premium ingredients and craft, framed in approachable language. Recognizable structures elevated by quality and one signature touch — never alienating.',
    target_taste_profile_range: {
      acidity: r(2.0, 3.8), sweetness: r(1.5, 3.2), bitterness: r(1.0, 3.0),
      body: r(2.0, 4.0), aroma_intensity: r(2.5, 4.0), finish_length: r(2.0, 3.8),
    },
  },
})

export const VENUE_TASTE_ARCHETYPE_KEYS = Object.freeze(Object.keys(VENUE_TASTE_ARCHETYPES))

/**
 * Resolve venue language into a merged target taste range + matched archetypes.
 *
 * @param {string|string[]} venueLanguage - free text or array of phrases/signals.
 * @returns {{
 *   matched: Array<{ key, label, emotional_register, beverage_direction }>,
 *   target_taste_profile_range: object,   // per-dimension {min,max} or null
 *   beverage_directions: string[],
 *   matched_keywords: string[]
 * }}
 *
 * Returns empty matches (and all-null range) when nothing matches — honest miss,
 * never a fabricated default profile.
 */
export function resolveVenueTasteTarget(venueLanguage) {
  const text = (Array.isArray(venueLanguage) ? venueLanguage.join(' ') : String(venueLanguage || ''))
    .toLowerCase()

  if (!text.trim()) {
    return { matched: [], target_taste_profile_range: emptyRange(), beverage_directions: [], matched_keywords: [] }
  }

  const matched = []
  const matchedKeywords = []
  const ranges = []

  for (const key of VENUE_TASTE_ARCHETYPE_KEYS) {
    const arch = VENUE_TASTE_ARCHETYPES[key]
    const hitKw = arch.keywords.filter(kw => text.includes(kw))
    if (hitKw.length) {
      matched.push({
        key,
        label: arch.label,
        emotional_register: arch.emotional_register,
        beverage_direction: arch.beverage_direction,
      })
      matchedKeywords.push(...hitKw)
      ranges.push(arch.target_taste_profile_range)
    }
  }

  return {
    matched,
    target_taste_profile_range: ranges.length ? mergeTasteRanges(ranges) : emptyRange(),
    beverage_directions: matched.map(m => m.beverage_direction),
    matched_keywords: Array.from(new Set(matchedKeywords)),
  }
}

function emptyRange() {
  const out = {}
  for (const key of TASTE_DIMENSION_KEYS) out[key] = null
  return out
}

export { TASTE_DIMENSION_KEYS }
