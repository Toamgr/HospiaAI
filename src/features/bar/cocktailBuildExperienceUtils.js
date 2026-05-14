// Pure utilities for CocktailBuildExperience — no side effects, no fake data.
// All functions accept a cocktail object and return derived data only.

// ─── Normalise ────────────────────────────────────────────────────────────────

export function normalizeCocktailBuildData(cocktail) {
  if (!cocktail || typeof cocktail !== 'object') {
    return { name: null, ingredients: [], method: null, glassware: null, garnish: null, description: null }
  }

  const rawIngs = cocktail.ingredientsMl || cocktail.ingredientObjects || []
  const ingredients = rawIngs
    .filter(i => i && (i.ingredient || i.ingredient_name))
    .map(i => ({
      name: i.ingredient || i.ingredient_name || null,
      ml: (typeof i.amountMl === 'number' && i.amountMl > 0) ? i.amountMl
        : (typeof i.pour_ml === 'number' && i.pour_ml > 0) ? i.pour_ml
        : null,
      quantityKnown:
        (typeof i.amountMl === 'number' && i.amountMl > 0) ||
        (typeof i.pour_ml === 'number' && i.pour_ml > 0),
    }))

  return {
    name: cocktail.name || null,
    ingredients,
    method: cocktail.method || null,
    glassware: cocktail.glassware || null,
    garnish: cocktail.garnish || null,
    description: cocktail.guestDescription || cocktail.conceptStory || null,
  }
}

// ─── Completeness ─────────────────────────────────────────────────────────────

export function inferBuildCompleteness(cocktail) {
  const d = normalizeCocktailBuildData(cocktail)
  const hasIngredients = d.ingredients.length > 0
  const hasMethod = !!d.method
  const hasGlassware = !!d.glassware
  const hasGarnish = !!d.garnish
  const allQuantitiesKnown = hasIngredients && d.ingredients.every(i => i.quantityKnown)
  const missingFields = [
    ...(!hasIngredients ? ['ingredients'] : []),
    ...(!hasMethod ? ['method'] : []),
    ...(!hasGlassware ? ['glassware'] : []),
  ]
  const level = !hasIngredients ? 'none'
    : hasIngredients && hasMethod && hasGlassware && allQuantitiesKnown ? 'full'
    : 'partial'
  return { level, hasIngredients, hasMethod, hasGlassware, hasGarnish, allQuantitiesKnown, missingFields }
}

// ─── Method token ─────────────────────────────────────────────────────────────

function methodToken(method) {
  if (!method) return null
  const m = method.toLowerCase()
  if (/\bshake\b/.test(m)) return 'shake'
  if (/\bstir\b/.test(m)) return 'stir'
  if (/\bbuild\b/.test(m)) return 'build'
  if (/\bblend\b/.test(m)) return 'blend'
  if (/\bthrow\b/.test(m)) return 'throw'
  return 'described'
}

// ─── Step sequence ────────────────────────────────────────────────────────────
// Produces steps from available data only.
// Does not infer specific technique when method is unknown.

export function buildStepSequence(cocktail) {
  const d = normalizeCocktailBuildData(cocktail)
  if (!d.ingredients.length) return []

  const token = methodToken(d.method)
  const steps = []

  // 1. Glassware prep
  steps.push({
    id: 'prepare',
    type: 'prepare',
    title: d.glassware ? `Prepare ${d.glassware}` : 'Prepare your glass',
    detail: d.glassware
      ? `Chill or rinse a ${d.glassware} and set it ready on your station.`
      : 'Set your glass ready. Glassware is not specified for this recipe.',
    dataNote: !d.glassware ? 'Glassware not specified — use venue-standard glass.' : null,
    ingredientIndex: null,
    ingredient: null,
  })

  // 2. Ice — only when method is known and implies it. Never inferred from an unknown method.
  const iceByToken = {
    shake: { title: 'Fill shaker with ice', detail: 'Fill your shaker two-thirds with fresh, hard ice.' },
    stir:  { title: 'Fill mixing glass with ice', detail: 'Fill your mixing glass with large, clear cubes.' },
    build: { title: 'Add ice to glass', detail: 'Fill the glass with ice appropriate for the serve.' },
    blend: { title: 'Add ice to blender', detail: 'Add a generous scoop of ice to the blender.' },
  }
  if (token && iceByToken[token]) {
    steps.push({ id: 'ice', type: 'ice', dataNote: null, ingredientIndex: null, ingredient: null, ...iceByToken[token] })
  }

  // 3. Ingredient steps
  const vessel = token === 'shake' ? 'the shaker'
    : token === 'stir' ? 'the mixing glass'
    : token === 'build' ? 'the glass'
    : token === 'blend' ? 'the blender'
    : 'your vessel'

  d.ingredients.forEach((ing, i) => {
    steps.push({
      id: `ingredient-${i}`,
      type: 'ingredient',
      title: `Add ${ing.name}`,
      detail: ing.quantityKnown
        ? `Measure ${ing.ml}ml of ${ing.name} and add to ${vessel}.`
        : `Add ${ing.name} to ${vessel}. Quantity is not specified for this recipe.`,
      dataNote: !ing.quantityKnown ? 'Quantity unavailable — use recipe judgement.' : null,
      ingredientIndex: i,
      ingredient: ing,
    })
  })

  // 4. Method step — only when method is known
  if (d.method) {
    const methodDetail = {
      shake: 'Seal the shaker and shake vigorously for 10–15 seconds until well chilled.',
      stir:  'Stir with a bar spoon for 20–30 seconds — smooth, even rotation.',
      build: 'Stir gently with a bar spoon to integrate without bruising.',
      blend: 'Blend until smooth. Adjust consistency with more ice if needed.',
      throw: 'Throw the cocktail between tins from height to aerate and chill.',
      described: d.method,
    }
    steps.push({
      id: 'method',
      type: 'method',
      title: token === 'described' ? 'Prepare' : token.charAt(0).toUpperCase() + token.slice(1),
      detail: methodDetail[token] || d.method,
      dataNote: null,
      ingredientIndex: null,
      ingredient: null,
    })

    const pourDetail = {
      shake: 'Double-strain through a fine mesh strainer into your prepared glass.',
      stir:  'Strain through a julep strainer into your prepared glass.',
      build: 'Your cocktail is ready in the glass.',
      blend: 'Pour from the blender into your prepared glass.',
      throw: 'Strain into your prepared glass.',
      described: 'Transfer to your prepared glass.',
    }
    steps.push({
      id: 'pour',
      type: 'pour',
      title: 'Pour',
      detail: pourDetail[token] || 'Transfer to your prepared glass.',
      dataNote: null,
      ingredientIndex: null,
      ingredient: null,
    })
  } else {
    steps.push({
      id: 'serve',
      type: 'pour',
      title: 'Combine and serve',
      detail: 'Combine all ingredients and transfer to your prepared glass.',
      dataNote: 'Preparation method not specified — technique is at bartender discretion.',
      ingredientIndex: null,
      ingredient: null,
    })
  }

  // 5. Garnish — only when specified
  if (d.garnish) {
    steps.push({
      id: 'garnish',
      type: 'garnish',
      title: 'Garnish',
      detail: `Finish with ${d.garnish} and present to the guest.`,
      dataNote: null,
      ingredientIndex: null,
      ingredient: null,
    })
  }

  return steps
}

// ─── Warnings ─────────────────────────────────────────────────────────────────

export function getBuildWarnings(cocktail) {
  const d = normalizeCocktailBuildData(cocktail)
  const warnings = []
  if (!d.ingredients.length) warnings.push('No ingredients available — build sequence cannot be generated.')
  if (!d.method) warnings.push('Preparation method not specified — technique steps are omitted.')
  if (!d.glassware) warnings.push('Glassware not specified — using generic guidance.')
  const noQty = d.ingredients.filter(i => !i.quantityKnown)
  if (noQty.length) {
    warnings.push(
      `${noQty.length} ingredient${noQty.length !== 1 ? 's have' : ' has'} no quantity: ${noQty.map(i => i.name).join(', ')}.`
    )
  }
  return warnings
}
