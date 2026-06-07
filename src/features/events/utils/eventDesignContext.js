/**
 * Deterministic design context builder for event cocktail menus.
 * Derives visual identity from the event brief — no AI, no invented data.
 * Used to drive menuTitle and visual direction for EventBriefMenuGenerator.
 */

function detectCoupleNames(eventName = '') {
  const match = eventName.match(/^(.+?)\s*(?:&|and|\+)\s*(.+?)(?:\s+(?:wedding|event|reception|celebration|חתונה))?$/i)
  if (!match) return null
  const a = match[1].trim()
  const b = match[2].trim()
  if (a.length > 30 || b.length > 30) return null
  return `${a} ♥ ${b}`
}

export function buildDesignContext({ event, brief }) {
  if (!event) return null

  const type       = event.event_type || 'other'
  const eventName  = event.name || 'This Event'
  const clientName = event.client_name || null

  switch (type) {
    case 'wedding': {
      const coupleTitle = detectCoupleNames(eventName) || detectCoupleNames(clientName || '')
      const menuTitle   = coupleTitle || clientName || eventName
      return {
        menuTitle,
        eventTitle:      eventName,
        eventType:       type,
        visualStyle:     'romantic, elegant, celebratory',
        headerTreatment: 'heart-framed title / delicate wedding crest',
        tone:            'festive and intimate',
        decorativeMotif: 'heart, floral, champagne linework',
        layoutDirection: 'premium wedding menu',
      }
    }

    case 'corporate': {
      const menuTitle = clientName || eventName
      return {
        menuTitle,
        eventTitle:      eventName,
        eventType:       type,
        visualStyle:     'clean, premium, professional',
        headerTreatment: 'minimal editorial header',
        tone:            'elegant and brand-safe',
        decorativeMotif: 'thin lines, geometric structure',
        layoutDirection: 'corporate cocktail menu',
      }
    }

    case 'private': {
      const menuTitle = clientName || eventName
      return {
        menuTitle,
        eventTitle:      eventName,
        eventType:       type,
        visualStyle:     'warm, personal, celebratory',
        headerTreatment: 'host-style title',
        tone:            'welcoming and intimate',
        decorativeMotif: 'soft hospitality details',
        layoutDirection: 'private celebration menu',
      }
    }

    case 'bar_event': {
      return {
        menuTitle:       eventName,
        eventTitle:      eventName,
        eventType:       type,
        visualStyle:     'bold, curated, bar-forward',
        headerTreatment: 'cocktail bar editorial header',
        tone:            'confident and craft-driven',
        decorativeMotif: 'bar tools, geometric, editorial',
        layoutDirection: 'signature cocktail bar menu',
      }
    }

    default: {
      const menuTitle = clientName || eventName
      return {
        menuTitle,
        eventTitle:      eventName,
        eventType:       type,
        visualStyle:     'refined, hospitality-grade',
        headerTreatment: 'clean event header',
        tone:            'professional and welcoming',
        decorativeMotif: 'minimal hospitality details',
        layoutDirection: 'event cocktail menu',
      }
    }
  }
}
