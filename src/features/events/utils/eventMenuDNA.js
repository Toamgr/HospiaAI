/**
 * eventMenuDNA — Deterministic event menu identity builder.
 *
 * Pure utility. No React. No side effects. No AI calls.
 * Derives the menu's DNA — naming style, description voice, section structure,
 * emotional tone, and guest experience goal — from the event brief.
 *
 * This DNA is injected into the AI prompt so the generated menu feels created
 * specifically for this event, not themed over a generic cocktail menu.
 */

// ── DNA definitions per event type ───────────────────────────────────────────

const WEDDING_DNA = {
  eventType:            'wedding',
  menuIdentity:         'celebration',
  namingStyle:          'romantic',
  namingGuidance:
    'Name each cocktail as though it captures a moment in the couple\'s story. ' +
    'Use words that evoke love, light, beauty, and shared experience. ' +
    'Names should feel poetic and personal — not like standard bar menu items.',
  namingExamples:       ['First Kiss', 'Golden Hour', 'Forever Yours', 'Celebration Toast', 'The Promise', 'Borrowed Blue'],
  namingAvoid:          ['Margarita', 'Sour', 'Collins', 'Mule', 'Smash', 'generic cocktail bar names'],
  descriptionStyle:     'emotional',
  descriptionGuidance:
    'Write each tagline as a brief, evocative sentence that captures a feeling — ' +
    'not just a flavor list. Connect the drink to the occasion and the couple.',
  menuSections:         ['Welcome Toast', 'Signature Cocktails', 'Celebration Cocktails', 'Zero-Proof Selection'],
  welcomeDrinkPriority: true,
  emotionalTone:        'love, celebration, intimacy',
  guestExperienceGoal:  'shared celebration',
}

const CORPORATE_DNA = {
  eventType:            'corporate',
  menuIdentity:         'professional hospitality',
  namingStyle:          'refined',
  namingGuidance:
    'Name each cocktail with confidence and editorial clarity. ' +
    'Use elegant, professional language that feels premium without being pretentious. ' +
    'Names can reference setting, industry craft, or premium ingredients.',
  namingExamples:       ['Executive Collins', 'Networking Spritz', 'Signature Sour', 'Closing Bell', 'First Round', 'The Brief'],
  namingAvoid:          ['cutesy pun names', 'overly casual names', 'overly romantic or emotional names'],
  descriptionStyle:     'clean',
  descriptionGuidance:
    'Keep taglines concise and confident. Focus on quality and experience. ' +
    'Avoid florid or sentimental language. One clean, elegant sentence.',
  menuSections:         ['Welcome Drinks', 'Networking Cocktails', 'Premium Classics', 'Zero-Proof Selection'],
  welcomeDrinkPriority: false,
  emotionalTone:        'confidence and elegance',
  guestExperienceGoal:  'networking and comfort',
}

const PRIVATE_DNA = {
  eventType:            'private',
  menuIdentity:         'personal hosting',
  namingStyle:          'warm',
  namingGuidance:
    'Name each cocktail as though the host is welcoming close friends. ' +
    'Names can feel informal, warm, or story-driven. ' +
    'Draw from seasonal references, garden imagery, or the occasion itself.',
  namingExamples:       ['Family Table', 'Sunday Garden', 'Summer Memory', 'Citrus Toast', "The Host's Cup", 'Back Garden'],
  namingAvoid:          ['corporate names', 'overly formal names', 'impersonal standard cocktail names'],
  descriptionStyle:     'story-driven',
  descriptionGuidance:
    'Write taglines that feel personal and warm — like a note from the host. ' +
    'Reference the mood, the season, or the occasion without being overly sentimental.',
  menuSections:         ['House Favorites', 'Signature Cocktails', 'Family Celebration', 'Zero-Proof Selection'],
  welcomeDrinkPriority: null,
  emotionalTone:        'connection and familiarity',
  guestExperienceGoal:  'togetherness',
}

const BAR_EVENT_DNA = {
  eventType:            'bar_event',
  menuIdentity:         'craft showcase',
  namingStyle:          'bold',
  namingGuidance:
    'Name each cocktail with confidence and craft identity. ' +
    'Names can be punchy, reference technique or ingredient, or have an editorial feel. ' +
    'Avoid safe or derivative names. The menu should feel like it has a point of view.',
  namingExamples:       ['Smoke Signal', 'The Southside', 'Barrel No. 7', 'The Daily', 'House Original', 'Night Shift'],
  namingAvoid:          ['overly romantic names', 'corporate names', 'names that sound like chain-bar menu items'],
  descriptionStyle:     'confident',
  descriptionGuidance:
    'Keep taglines punchy and assured. Focus on technique, key ingredient, or the experience. ' +
    'Bar voice — not formal, not sentimental.',
  menuSections:         ['Bar Signatures', "Tonight's Selection", 'Classics Revisited', 'Zero-Proof Selection'],
  welcomeDrinkPriority: true,
  emotionalTone:        'craft, identity, bartender voice',
  guestExperienceGoal:  'discovery and appreciation',
}

const OTHER_DNA = {
  eventType:            'other',
  menuIdentity:         'event hospitality',
  namingStyle:          'classic',
  namingGuidance:
    'Name each cocktail with elegance and clarity. ' +
    'Avoid overly niche or obscure names. Focus on approachability with a hospitality-grade feel.',
  namingExamples:       ['Garden Spritz', 'Signature Collins', 'Evening Reserve', 'House Classic'],
  namingAvoid:          ['overly casual names', 'overly corporate names'],
  descriptionStyle:     'balanced',
  descriptionGuidance:
    'Write taglines that balance approachability and sophistication. ' +
    'One clear evocative sentence per cocktail.',
  menuSections:         ['Welcome Drinks', 'Signature Cocktails', 'House Selection', 'Zero-Proof Selection'],
  welcomeDrinkPriority: false,
  emotionalTone:        'welcoming and refined',
  guestExperienceGoal:  'comfortable celebration',
}

const DNA_BY_TYPE = {
  wedding:   WEDDING_DNA,
  corporate: CORPORATE_DNA,
  private:   PRIVATE_DNA,
  bar_event: BAR_EVENT_DNA,
  other:     OTHER_DNA,
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build the menu DNA from the event, brief, and design context.
 *
 * @param  {{ event, brief, designContext }} input
 * @returns {{ menuDNA }} Wrapped in an object per spec — destructure menuDNA at the call site.
 */
export function buildEventMenuDNA({ event, brief, designContext }) {
  if (!event) return { menuDNA: null }

  const type = event.event_type || 'other'
  const base = DNA_BY_TYPE[type] || OTHER_DNA

  // Kosher flag: prepend reminder to naming guidance if kosher is required
  const kosher = brief?.cocktailMenuBrief?.kosherRequirement || false
  const namingGuidance = kosher
    ? base.namingGuidance + ' Ensure all referenced spirits and ingredients are kosher-compatible.'
    : base.namingGuidance

  // Large-scale events: welcome drink section becomes critical regardless of default
  const guestCount       = event.expected_guests || 0
  const welcomeDrink     = base.welcomeDrinkPriority === null
    ? (guestCount >= 40)       // private: upgrade to true for larger groups
    : base.welcomeDrinkPriority

  const menuDNA = {
    ...base,
    namingGuidance,
    welcomeDrinkPriority: welcomeDrink,
  }

  return { menuDNA }
}
