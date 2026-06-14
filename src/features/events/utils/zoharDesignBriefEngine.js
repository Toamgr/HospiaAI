/**
 * ZOHAR Design Brief Engine — deterministic design intelligence for HESTIA events.
 *
 * Creative input priority (Phase 1 Finalization):
 *   1. Creative direction inputs (aesthetic_subgenre, single_sentence, anti_reference,
 *      venue_character, primary_impact_moment, confirmed_mood_keywords) — highest weight
 *   2. OMER cocktail programme signal — supporting creative overlay
 *   3. Event metadata (type, subtype, location, guest count) — supporting context
 *
 * Pure and deterministic. No AI calls. No invented data. Null-safe.
 * All fields derived exclusively from real event data and the Zohar/OMER briefs.
 *
 * Creative Studio contract: schemaVersion "2.0" is stable.
 * New sections: creativePhilosophy, hospitalityVision.
 */

// ── Subtype resolution ─────────────────────────────────────────────────────────

function resolveSubtype(brief, event) {
  const fromBrief = brief?.hospitalityDNA?.subtype?.subtype
  if (fromBrief) return fromBrief
  return event?.event_type || 'other'
}

// ── CREATIVE INPUT SIGNAL TABLES ──────────────────────────────────────────────
// These override subtype-based fallbacks when aesthetic_subgenre is set.

const SUBGENRE_COLOR_PALETTES = {
  quiet_sanctuary: [
    { name: 'Linen White',    hex: '#F5F2EC' },
    { name: 'Warm Parchment', hex: '#EDE4D0' },
    { name: 'Sage',           hex: '#8FA882' },
    { name: 'Wet Stone',      hex: '#9A9890' },
    { name: 'Aged Brass',     hex: '#B8954A' },
    { name: 'Deep Umber',     hex: '#2E2820' },
  ],
  cinematic_narrative: [
    { name: 'Aged Film',      hex: '#1A1512' },
    { name: 'Warm Ivory',     hex: '#F5EDD8' },
    { name: 'Copper Grain',   hex: '#C9813E' },
    { name: 'Terracotta',     hex: '#B05A38' },
    { name: 'Dust Gold',      hex: '#C9A96E' },
    { name: 'Deep Slate',     hex: '#2A2A2A' },
  ],
  theatrical_mystique: [
    { name: 'Void Black',     hex: '#0A0806' },
    { name: 'Deep Charcoal',  hex: '#1A1814' },
    { name: 'Ember Gold',     hex: '#C97B2E' },
    { name: 'Ash',            hex: '#3A3530' },
    { name: 'Pale Ivory',     hex: '#F0EAE0' },
    { name: 'Crimson Ember',  hex: '#8B1A2A' },
  ],
}

const SUBGENRE_TYPOGRAPHY = {
  quiet_sanctuary:   'Understated serif. Fraunces or Cormorant Garamond — warmth without ornamentation. Generous leading and tracking. Body text breathes. Nothing competes for attention. The hierarchy communicates quality through what it refuses to do.',
  cinematic_narrative: 'Story-forward editorial typography. The event name is the title card — deliberate weight contrast between headline and supporting text. Hierarchy is cinematic: a lead and a supporting cast. Never decorative; always in service of narrative.',
  theatrical_mystique: 'High-contrast luxury typography. Bold serif in near-white or aged gold against near-black. Minimal body text — every word earns its place in the darkness. Wide tracking at small sizes, compressed at display. The letterform is atmospheric.',
}

const SUBGENRE_LAYOUT = {
  quiet_sanctuary:   'Spacious, unhurried layout. Wide margins — the white space is not empty, it is calm. Single-column hierarchy with natural breathing between elements. Nothing crowds. The absence of decoration is the design decision.',
  cinematic_narrative: 'Editorial, scene-like composition. The event name is the establishing shot. Supporting information arranged as narrative context — not a bullet list. Asymmetric or offset grid with deliberate framing. The layout makes the reader feel they have entered a story.',
  theatrical_mystique: 'Dark atmospheric layout. Maximum negative space reads as darkness. Sparse elements at extreme contrast. The layout withholds as much as it reveals. The dominant element commands the frame; everything else recedes.',
}

const SUBGENRE_PHOTOGRAPHY = {
  quiet_sanctuary:   'Natural, diffused light photography. No harsh shadows — light wraps rather than cuts. Organic textures: linen, stone, aged wood, fresh botanicals. Close-crop detail. The frame holds the viewer rather than commanding them.',
  cinematic_narrative: 'Directional, film-like photography. Deep shadows with deliberate highlights. The cocktail is framed like a film still — the angle is a point of view, not a documentation. Environmental context tells the story: surfaces, light falling across a table, a hand at rest.',
  theatrical_mystique: 'Dark studio still life. Single-source dramatic light. Near-black background. The cocktail is the only subject — the darkness is the rest of the narrative. High contrast. Mood before product. The image should be uncomfortable to look away from.',
}

const SUBGENRE_VISUAL_DNA = {
  quiet_sanctuary: [
    'Quiet luxury fashion editorial — The Row, Loro Piana, Brunello Cucinelli',
    'Organic Scandinavian hospitality — Noma, Geranium, Fäviken aesthetic',
    'Natural material architecture — Ilse Crawford interiors, Axel Vervoordt',
    'Still life photography — light and negative space as primary subjects',
    'Japanese minimalism — wabi-sabi, considered imperfection, material honesty',
  ],
  cinematic_narrative: [
    'Auteur film production design — Paolo Sorrentino, Luca Guadagnino aesthetic',
    'Venue-as-character restaurants — Osteria Francescana, Mugaritz, Il Pellicano',
    'Narrative still photography — Mario Testino, Peter Lindbergh, Helmut Newton',
    'Luxury hotel editorial — Aman, The Connaught, Borgo Egnazia',
    'Italian cinema visual language — colour, light, texture as emotional instruments',
  ],
  theatrical_mystique: [
    'Dark luxury fashion — Ann Demeulemeester, Rick Owens, Yohji Yamamoto campaigns',
    'Atmospheric bar design — Nightjar London, Dante NYC, Dead Rabbit NYC',
    'Theatre and opera set design — black box performance space, Bayreuth Festspielhaus',
    'Luxury perfume editorial — Chanel No. 5, Le Labo, Byredo campaign aesthetic',
    'Dark editorial photography — Tim Walker, Craig McDean, Nick Knight',
  ],
}

const SUBGENRE_CREATIVE_PHILOSOPHY = {
  quiet_sanctuary:   'This event holds rather than impresses. Visual intelligence is expressed through restraint — in the space between elements, in the quality of materials, in the absence of noise. The guest does not notice the design; they simply feel at ease. Every creative decision removes something unnecessary.',
  cinematic_narrative: 'This event tells a story, and the venue is the protagonist. Every visual element is cast with intention — there are no accidents, no filler. The design brief is not an instruction sheet; it is a screenplay. The guest does not observe the event; they enter it and become part of the narrative.',
  theatrical_mystique: 'This event creates a world. The threshold between outside and inside is a transformation — guests cross it and become part of something enclosed, heightened, and atmospheric. Visual contrast is the engine of emotion. What is withheld is as powerful as what is shown.',
}

// ── SUBTYPE FALLBACK TABLES (unchanged from v1) ────────────────────────────────

const NARRATIVE_MOOD = {
  wedding:        'warm, celebratory, and emotionally precise',
  luxury_wedding: 'opulent, seamlessly choreographed, and discreetly personal',
  corporate:      'professional, clean, and brand-confident',
  executive_event:'discreet, disciplined, and quietly premium',
  brand_launch:   'dynamic, memorable, and boldly curated',
  charity_gala:   'generous, purposeful, and elegantly warm',
  private:        'intimate, personal, and relaxed',
  vip_event:      'exclusive, curated, and effortlessly considered',
  private_dinner: 'intimate, gastronomic, and considered',
  desert_event:   'dramatic, natural, and experiential',
  resort_event:   'sun-warmed, relaxed, and naturally luxurious',
  hotel_event:    'polished, grand, and classically hospitable',
  bar_event:      'craft-forward, editorial, and immersive',
  wine_event:     'contemplative, refined, and sensory',
  cocktail_event: 'artisanal, atmospheric, and visually curated',
  other:          'refined, considered, and hospitality-first',
}

const NARRATIVE_QUALITY = {
  wedding:        'timeless elegance, personal warmth, and emotional service precision',
  luxury_wedding: 'seamless luxury, invisible precision, and bespoke personal care',
  corporate:      'professional service, dietary inclusion, and agenda-aware hospitality',
  executive_event:'complete discretion, time discipline, and executive-grade reliability',
  brand_launch:   'bold visual identity, premium reveals, and brand-safe design',
  charity_gala:   'guest generosity, cause-led atmosphere, and elegant entertainment',
  private:        'host personality, guest intimacy, and curated personal details',
  vip_event:      'personalised access, premium care, and invisible luxury',
  private_dinner: 'gastronomic precision, intimate conversation, and considered service pace',
  desert_event:   'natural textures, open-air drama, and experiential atmosphere',
  resort_event:   'natural light, relaxed luxury, and holiday spirit',
  hotel_event:    'classic grand hospitality, polished service, and venue majesty',
  bar_event:      'cocktail craft, editorial composition, and immersive bar environment',
  wine_event:     'viticultural knowledge, sensory refinement, and contemplative pace',
  cocktail_event: 'artisanal cocktails, editorial design language, and curated bar storytelling',
  other:          'premium hospitality, considered design, and guest comfort',
}

const TYPE_LABELS = {
  wedding:        'A wedding celebration',
  luxury_wedding: 'A luxury wedding',
  corporate:      'A corporate event',
  executive_event:'An executive gathering',
  brand_launch:   'A brand launch event',
  charity_gala:   'A charity gala',
  private:        'A private celebration',
  vip_event:      'An exclusive event',
  private_dinner: 'An intimate private dinner',
  desert_event:   'An outdoor celebration',
  resort_event:   'A resort event',
  hotel_event:    'A formal event',
  bar_event:      'A cocktail event',
  wine_event:     'A wine and spirits evening',
  cocktail_event: 'A cocktail event',
  other:          'A special event',
}

const BASE_KEYWORDS = {
  wedding:        ['Celebratory', 'Warm', 'Elegant', 'Timeless', 'Intimate'],
  luxury_wedding: ['Opulent', 'Seamless', 'Curated', 'Luminous', 'Private'],
  corporate:      ['Professional', 'Clean', 'Premium', 'Structured', 'Confident'],
  executive_event:['Exclusive', 'Refined', 'Discreet', 'Authoritative', 'Elevated'],
  brand_launch:   ['Bold', 'Dynamic', 'Memorable', 'Premium', 'Curated'],
  charity_gala:   ['Generous', 'Purposeful', 'Warm', 'Elegant', 'Impactful'],
  private:        ['Intimate', 'Personal', 'Warm', 'Relaxed', 'Curated'],
  vip_event:      ['Exclusive', 'Curated', 'Premium', 'Effortless', 'Considered'],
  private_dinner: ['Intimate', 'Gastronomic', 'Considered', 'Refined', 'Quiet'],
  desert_event:   ['Natural', 'Dramatic', 'Warm', 'Experiential', 'Raw'],
  resort_event:   ['Relaxed', 'Sun-Warmed', 'Natural', 'Luxurious', 'Open'],
  hotel_event:    ['Grand', 'Polished', 'Classic', 'Formal', 'Majestic'],
  bar_event:      ['Craft', 'Editorial', 'Atmospheric', 'Bold', 'Immersive'],
  wine_event:     ['Contemplative', 'Refined', 'Sensory', 'Knowledgeable', 'Premium'],
  cocktail_event: ['Artisanal', 'Curated', 'Atmospheric', 'Editorial', 'Bold'],
  other:          ['Refined', 'Considered', 'Welcoming', 'Premium', 'Warm'],
}

const COLOR_PALETTES = {
  wedding: [
    { name: 'Ivory',          hex: '#F8F4ED' },
    { name: 'Champagne',      hex: '#F7E7CE' },
    { name: 'Blush',          hex: '#E8C4B8' },
    { name: 'Sage',           hex: '#87A87A' },
    { name: 'Antique Gold',   hex: '#C9A96E' },
  ],
  luxury_wedding: [
    { name: 'Ivory',          hex: '#F8F4ED' },
    { name: 'Deep Champagne', hex: '#E8D4B0' },
    { name: 'Dusty Rose',     hex: '#D4A0A0' },
    { name: 'Sage Green',     hex: '#7A9A70' },
    { name: 'Antique Gold',   hex: '#C9A96E' },
    { name: 'Deep Burgundy',  hex: '#6B2737' },
  ],
  corporate: [
    { name: 'Pearl White',    hex: '#F5F2EE' },
    { name: 'Slate',          hex: '#4A5568' },
    { name: 'Midnight',       hex: '#1A2744' },
    { name: 'Silver',         hex: '#B0B8C4' },
    { name: 'Warm Gold',      hex: '#C9A96E' },
  ],
  executive_event: [
    { name: 'Onyx',           hex: '#1A1A1A' },
    { name: 'Deep Navy',      hex: '#0F1C3A' },
    { name: 'Champagne',      hex: '#F7E7CE' },
    { name: 'Brushed Gold',   hex: '#B8902E' },
    { name: 'Ivory',          hex: '#F5F0E8' },
  ],
  brand_launch: [
    { name: 'Midnight Black', hex: '#0D0D0D' },
    { name: 'Electric Ivory', hex: '#F5F0E8' },
    { name: 'Warm Gold',      hex: '#C9A96E' },
    { name: 'Deep Charcoal',  hex: '#2A2A2A' },
    { name: 'Accent Copper',  hex: '#AD6F42' },
  ],
  charity_gala: [
    { name: 'Deep Burgundy',  hex: '#6B2737' },
    { name: 'Champagne',      hex: '#F7E7CE' },
    { name: 'Gold',           hex: '#C9A96E' },
    { name: 'Ivory',          hex: '#F8F4ED' },
    { name: 'Forest Sage',    hex: '#5A7A50' },
  ],
  private: [
    { name: 'Warm Ivory',     hex: '#F5EDD8' },
    { name: 'Terracotta',     hex: '#C4704A' },
    { name: 'Sage',           hex: '#87A87A' },
    { name: 'Warm Sand',      hex: '#D8C4A0' },
    { name: 'Copper',         hex: '#B87333' },
  ],
  vip_event: [
    { name: 'Deep Black',     hex: '#0A0A0A' },
    { name: 'Ivory',          hex: '#F5F0E8' },
    { name: 'Antique Gold',   hex: '#C9A96E' },
    { name: 'Midnight',       hex: '#141428' },
    { name: 'Rose Champagne', hex: '#E8C4B8' },
  ],
  private_dinner: [
    { name: 'Midnight',       hex: '#141414' },
    { name: 'Ivory',          hex: '#F5F0E8' },
    { name: 'Parchment',      hex: '#F2E8D0' },
    { name: 'Warm Gold',      hex: '#C9A96E' },
    { name: 'Deep Garnet',    hex: '#5A1828' },
  ],
  desert_event: [
    { name: 'Sand',           hex: '#D4B896' },
    { name: 'Dunes Gold',     hex: '#C9943A' },
    { name: 'Terracotta',     hex: '#C4704A' },
    { name: 'Warm Ivory',     hex: '#F5EDD8' },
    { name: 'Sunset Orange',  hex: '#E8824A' },
    { name: 'Desert Night',   hex: '#1A1210' },
  ],
  resort_event: [
    { name: 'Ocean Ivory',    hex: '#F0EDE6' },
    { name: 'Warm Sand',      hex: '#D8C4A0' },
    { name: 'Sea Glass',      hex: '#8AB4A8' },
    { name: 'Sunset Peach',   hex: '#E8B490' },
    { name: 'Natural Gold',   hex: '#C9A96E' },
  ],
  hotel_event: [
    { name: 'Grand Ivory',    hex: '#F8F4ED' },
    { name: 'Champagne',      hex: '#F7E7CE' },
    { name: 'Deep Charcoal',  hex: '#3A3A3A' },
    { name: 'Antique Gold',   hex: '#C9A96E' },
    { name: 'Midnight Navy',  hex: '#1A2744' },
  ],
  bar_event: [
    { name: 'Near Black',     hex: '#0D0D0D' },
    { name: 'Amber',          hex: '#C9813E' },
    { name: 'Brushed Copper', hex: '#AD6F42' },
    { name: 'Charcoal',       hex: '#2A2A2A' },
    { name: 'Cream',          hex: '#F5F0E8' },
  ],
  wine_event: [
    { name: 'Deep Garnet',    hex: '#5A1828' },
    { name: 'Burgundy',       hex: '#6B2737' },
    { name: 'Parchment',      hex: '#F2E8D0' },
    { name: 'Warm Gold',      hex: '#C9A96E' },
    { name: 'Sage',           hex: '#7A9A70' },
  ],
  cocktail_event: [
    { name: 'Near Black',     hex: '#0D0D0D' },
    { name: 'Amber Gold',     hex: '#C9813E' },
    { name: 'Ivory',          hex: '#F5F0E8' },
    { name: 'Charcoal',       hex: '#2A2A2A' },
    { name: 'Copper',         hex: '#B87333' },
  ],
  other: [
    { name: 'Ivory',          hex: '#F5F0E8' },
    { name: 'Warm Sand',      hex: '#D8C4A0' },
    { name: 'Sage',           hex: '#87A87A' },
    { name: 'Gold',           hex: '#C9A96E' },
    { name: 'Charcoal',       hex: '#3A3A3A' },
  ],
}

const TYPOGRAPHY_DIRECTION = {
  wedding:        'Luxury editorial serif for programme titles. Elegant serif or refined script for cocktail names. Light, generous line spacing. Premium stationery aesthetic — warmth through letterform.',
  luxury_wedding: 'Bespoke luxury typography. Classic high-contrast serif — Cormorant Garamond or equivalent. Delicate hierarchy with exceptional whitespace. Custom lettering feel. Restrained and authoritative.',
  corporate:      'Clean, structured editorial typography. Bold sans-serif for headings, readable body. Professional hierarchy. Legible at distance for standing guests.',
  executive_event:'Minimal luxury typography. Refined editorial serif for primary text. Clean, tight sans-serif for supporting information. Authority through restraint.',
  brand_launch:   'Bold editorial typography with strong brand hierarchy. Contrasting weights and styles — headline-forward. Modern editorial feel, high visual impact.',
  charity_gala:   'Warm serif typography for emotional connection. Editorial hierarchy. Inclusive, readable letterforms.',
  private:        'Warm, personal typography. Serif-led for hospitality warmth. Personal stationery aesthetic — feels handcrafted without being rustic.',
  vip_event:      'Ultra-refined typography. Luxury editorial serif. Minimal supporting text — everything implicit, nothing stated.',
  private_dinner: 'Intimate fine-dining typography. Classic serif, generous spacing. Tasting menu aesthetic — each element given its own space.',
  desert_event:   'Earthy editorial typography. Warm serif with natural texture. Handcrafted feel without artifice.',
  resort_event:   'Light, airy typography. Editorial but relaxed. Resort stationery — professional warmth, not corporate rigidity.',
  hotel_event:    'Classic grand hotel typography. Formal serif, structured hierarchy. Timeless stationery tradition — dignified and welcoming.',
  bar_event:      'Bold cocktail bar typography. Strong display serif for cocktail names. Minimal supporting text. Confident and atmospheric.',
  wine_event:     'Refined wine label typography. Classic serif, restrained hierarchy. Tasting notes aesthetic.',
  cocktail_event: 'Cocktail bar editorial typography. Luxury serif for names, clean sans for descriptions. Premium menu design aesthetic.',
  other:          'Editorial serif for headings, clean sans for body. Professional hospitality hierarchy — warm, authoritative, clear.',
}

const LAYOUT_DIRECTION = {
  wedding:        'Magazine-inspired with generous whitespace. Asymmetric elegance. Event name and date as design anchors. Wedding stationery hierarchy — emotional before informational.',
  luxury_wedding: 'Ultra-premium layout. Maximum whitespace — every element breathes. Luxury expressed through what is absent, not what is present.',
  corporate:      'Clean, structured grid. Professional hierarchy. Information readable at a glance. No decorative excess.',
  executive_event:'Minimal, high-authority layout. Single-column or two-column focus with wide margins. Reserved premium — every element earns its place.',
  brand_launch:   'Editorial magazine layout. Strong visual hierarchy — dramatic scale contrast between headline and body.',
  charity_gala:   'Grand editorial layout. Bold headings, generous content areas. Warmth through composition.',
  private:        'Personal stationery layout. Intimate scale. Warm, approachable hierarchy — feels personal, not produced.',
  vip_event:      'Exclusive card design aesthetic. Minimum elements, maximum luxury.',
  private_dinner: 'Fine dining tasting menu layout. Centred, classical hierarchy. Generous spacing between each element.',
  desert_event:   'Raw, natural editorial layout. Asymmetric, textured feel. Space and dramatic contrast.',
  resort_event:   'Open, airy layout. Landscape-inspired composition. Light and natural.',
  hotel_event:    'Classic formal layout. Symmetrical hierarchy. Grand hotel stationery aesthetic.',
  bar_event:      'Bold editorial cocktail menu layout. Strong cocktail name hierarchy. Atmospheric — the layout creates atmosphere before the first sip.',
  wine_event:     'Wine list editorial layout. Restrained, precise. Classic wine publication aesthetic.',
  cocktail_event: 'Premium cocktail bar layout. Strong drink name hierarchy. Atmospheric editorial design.',
  other:          'Clean, hospitality-grade layout. Professional hierarchy with warmth.',
}

const PHOTOGRAPHY_DIRECTION = {
  wedding:        'Golden-hour portrait light for the cocktail programme. Hero cocktail photography with natural shadows. Intimate framing — florals as background context.',
  luxury_wedding: 'Luxury editorial still life. Premium glassware, champagne in motion. Negative space as luxury signal.',
  corporate:      'Clean, professional cocktail photography. Neutral backgrounds. Precise composition. Brand-safe presentation.',
  executive_event:'Premium editorial still life. Minimal styling — quality ingredients and glassware as the subject. Moody, directional lighting.',
  brand_launch:   'Bold, dramatic cocktail hero shots. Strong contrast. Editorial magazine style.',
  charity_gala:   'Warm, generous photography. Atmosphere-first — guests and cocktails in equal measure.',
  private:        'Warm, natural photography. Candid feeling with high-end styling. Personal and approachable.',
  vip_event:      'Premium still life photography. Dark, moody studio lighting. Glassware as hero.',
  private_dinner: 'Fine dining still life aesthetic. Close composition. Ingredient and texture detail.',
  desert_event:   'Natural, golden-light photography. Desert textures as context — sand, stone, fire.',
  resort_event:   'Natural daylight photography. Outdoor or poolside context. Fresh, vibrant, airy.',
  hotel_event:    'Grand, classical photography. Architectural context — the venue is part of the composition.',
  bar_event:      'Atmospheric dark studio photography. Dramatic directional light. Bold, editorial.',
  wine_event:     'Wine-focused editorial photography. Bottle detail, glass pour, cellar or vineyard context.',
  cocktail_event: 'Hero cocktail photography. Dark studio, dramatic directional light. Large negative space.',
  other:          'Hero cocktail photography. Natural shadows, large negative space. Elegant bar presentation.',
}

const VISUAL_DNA = {
  wedding: [
    'Fine wedding stationery — letterpress and foil-stamped invitation design',
    'Luxury bridal editorial photography — Vogue, Harper\'s Bazaar',
    'Premium hospitality — The Ritz, Four Seasons wedding packages',
    'Fine dining tablescapes — Eleven Madison Park, Noma',
    'Natural floral editorial — Vera Wang, Monique Lhuillier campaign aesthetics',
  ],
  luxury_wedding: [
    'Ultra-luxury wedding editorial — Tatler, Town & Country',
    'Private estate hospitality — Claridge\'s, The Ritz, Gleneagles',
    'Couture fashion editorial — Valentino, Dior, Chanel campaign aesthetics',
    'Fine jewellery photography — Cartier, Tiffany, Van Cleef & Arpels brand design',
    'Premium beverage editorial — Dom Pérignon, Louis Roederer, Krug',
  ],
  corporate: [
    'Premium corporate design — Apple, LVMH event brand aesthetics',
    'Business hospitality editorial — Financial Times How To Spend It',
    'Luxury conference design — Davos, World Economic Forum brand language',
    'Premium venue hospitality — Soho House, Rosewood Hotels events',
  ],
  executive_event: [
    'Private banking hospitality — JP Morgan, Goldman Sachs client event aesthetic',
    'Executive retreat design — Aman Resorts, Four Seasons private event brand',
    'Premium corporate minimal design — authority through restraint',
  ],
  brand_launch: [
    'Luxury brand campaign design — Gucci, Balenciaga editorial aesthetic',
    'Product launch editorial — Apple, Hermès campaign design language',
    'Fashion week hospitality — Kering, LVMH event identity design',
  ],
  charity_gala: [
    'Grand gala design — MoMA, Met Gala aesthetic language',
    'Luxury charity campaign — BAFTA, BRIT Awards visual identity',
    'Grand event editorial — large-scale luxury hospitality design',
  ],
  private: [
    'Personal hospitality editorial — luxury lifestyle magazines',
    'Private villa entertaining — Mallorca, Côte d\'Azur, Tuscany aesthetic',
    'Premium home entertaining stationery — artisan invitation and menu design',
  ],
  vip_event: [
    'Exclusive private membership design — Annabel\'s, 5 Hertford Street',
    'VIP hospitality editorial — luxury sports, fashion, and cultural events',
    'Ultra-luxury card and invitation design — premium stationery brands',
  ],
  private_dinner: [
    'Fine dining editorial — Noma, El Celler de Can Roca, Le Gavroche',
    'Tasting menu design — The Ledbury, Core by Clare Smyth, Eleven Madison Park',
    'Intimate restaurant photography — moody, precise, ingredient-led',
  ],
  desert_event: [
    'Natural outdoor editorial — glamping and luxury camp aesthetic',
    'Desert art and architecture — land art, open-sky installations',
    'Raw material aesthetic — natural textures, firelight, sand and stone',
  ],
  resort_event: [
    'Resort hospitality editorial — Aman Resorts, Six Senses, One&Only brand',
    'Beach club design — Nikki Beach, Nammos Mykonos, La Guérite',
    'Outdoor luxury editorial — Wallpaper*, Condé Nast Traveller',
  ],
  hotel_event: [
    'Grand hotel hospitality — The Savoy, Claridge\'s, The Dorchester',
    'Classic hotel design language — Art Deco, Beaux Arts interior aesthetic',
    'Formal hospitality editorial — premium event and society magazines',
  ],
  bar_event: [
    'World\'s 50 Best Bars editorial — Tales of the Cocktail, Spirited Awards',
    'Premium cocktail bar design — Attaboy, Death & Co, Nightjar, Bar Benfiddich',
    'Cocktail photography editorial — Difford\'s Guide, CLASS Magazine',
    'Artisan spirits brand design — Hendrick\'s, Monkey 47, Mezcal Union',
  ],
  wine_event: [
    'Wine publication editorial — Decanter, Wine Spectator, Jancis Robinson',
    'Cellar and vineyard photography — Château Pétrus, DRC, Krug, Screaming Eagle',
    'Wine bar design — Brawn, Noble Rot, Sager + Wilde',
  ],
  cocktail_event: [
    'Cocktail editorial — 50 Best Bars, Difford\'s Guide',
    'Artisan bar design — premium cocktail bar brand aesthetics',
    'Spirits brand editorial — Tanqueray No. TEN, Belvedere, Grey Goose campaigns',
  ],
  other: [
    'Premium hospitality editorial — luxury lifestyle magazines',
    'Fine dining design language — careful, editorial, considered',
    'Bar and restaurant design — contemporary premium venue aesthetics',
  ],
}

// ── DELIVERABLES ───────────────────────────────────────────────────────────────

const DELIVERABLE_PRIORITY = {
  cocktail_menu:     { essential: ['wedding', 'luxury_wedding', 'bar_event', 'cocktail_event', 'private_dinner'], recommended: 'all' },
  welcome_sign:      { essential: ['wedding', 'luxury_wedding', 'bar_event'], recommended: 'all' },
  table_cards:       { essential: ['wedding', 'luxury_wedding', 'private_dinner'], recommended: ['corporate', 'executive_event', 'private', 'hotel_event'] },
  instagram_posts:   { essential: ['bar_event', 'cocktail_event', 'brand_launch'], recommended: ['wedding', 'private', 'resort_event'] },
  instagram_stories: { essential: ['bar_event', 'cocktail_event', 'brand_launch'], recommended: ['wedding', 'private', 'resort_event'] },
  brand_sheet:       { essential: ['brand_launch', 'corporate', 'vip_event'], recommended: 'all' },
}

function getPriority(type, subtype) {
  const check = DELIVERABLE_PRIORITY[type]
  if (!check) return 'optional'
  if (check.essential === 'all' || check.essential.includes(subtype)) return 'essential'
  if (check.recommended === 'all' || (Array.isArray(check.recommended) && check.recommended.includes(subtype))) return 'recommended'
  return 'optional'
}

// ── IMPACT MOMENT HOSPITALITY VISION ──────────────────────────────────────────

const IMPACT_MOMENT_VISION = {
  arrival: {
    label: 'Arrival',
    primaryInstruction: 'The arrival moment is where the world outside ceases to exist. This is the event\'s first word — it must be definitive. The guest should feel an immediate and unmistakeable shift in atmosphere the moment they cross the threshold.',
    guestExperience: 'The guest arrives and is transported. They do not need to understand the event concept; they feel it. The quality of the first visual impression, the temperature of the welcome, and the tone of the first human interaction set every expectation that follows.',
    creativeDirection: 'Invest maximum creative resource at the entrance: the first visual touchpoint, the welcome drink, and the initial spatial impression. Every other moment borrows authority from this one.',
  },
  social: {
    label: 'Social Hour',
    primaryInstruction: 'The social hour is where the event finds its character. Guests are at their most exploratory — circulating, discovering, forming their first real impressions of the night. The design should be legible and inviting at a conversational scale.',
    guestExperience: 'Guests should feel free to explore. The space should reward curiosity — a drink worth noticing, a surface worth touching, a light worth following. The design invites movement rather than anchoring guests to a single focal point.',
    creativeDirection: 'Prioritise visual detail at close range: cocktail presentation, table dressing, ambient lighting. The social hour is the event\'s second sentence — it deepens the first impression rather than contradicting it.',
  },
  signature: {
    label: 'Signature Moment',
    primaryInstruction: 'The signature moment is the event\'s singular peak. Everything before it is preparation; everything after it is resolution. Creative resources should build toward this moment and allow it to dominate the memory of the night.',
    guestExperience: 'Guests should feel the shift. The signature moment announces itself — through scale, through stillness, through a change in the environment. It asks for attention and rewards it. It is the frame the entire event hangs on.',
    creativeDirection: 'Design this moment first, then design everything else in service of it. The visual identity, colour palette, and hospitality direction should all carry the signature moment as their north star.',
  },
  dining: {
    label: 'Dining',
    primaryInstruction: 'The dining experience is the event\'s sustained centre. Guests are seated, unhurried, and fully present. The design must work at table scale: close-read menus, tablescapes, and the rhythm of a meal-length experience.',
    guestExperience: 'Guests should feel cared for at an intimate scale. The table is a world. Everything — the weight of the menu card, the quality of light, the rhythm of service — communicates intention. The guest is not consuming a product; they are being hosted.',
    creativeDirection: 'Invest in printed or digital table-scale materials: menu cards, cocktail programme presentation. Photography direction should work at close range — the detail of a glass, a garnish, a setting. Intimate, not grand.',
  },
  closing: {
    label: 'Closing',
    primaryInstruction: 'The closing is the event\'s final word — and its most lasting impression. Guests do not remember the beginning of their evening when they wake the next morning; they remember how they were sent home. The closing design should feel deliberate, not exhausted.',
    guestExperience: 'Guests should leave feeling complete rather than relieved. The closing is a gift, not a conclusion. A final drink, a parting detail, a moment of acknowledgement from the host — these convert an event into a memory.',
    creativeDirection: 'Design a closing ritual that is distinct from the rest of the evening. A signature final cocktail, a take-home element, a final visual moment. The brief should name the closing as a design intention, not a logistical endpoint.',
  },
}

// ── OMER COCKTAIL SIGNAL DETECTION ────────────────────────────────────────────

function detectOmerSignals(brief) {
  const cocktailBrief = brief?.cocktailMenuBrief
  if (!cocktailBrief) return null

  const moodText  = (cocktailBrief.cocktailMood  || '').toLowerCase()
  const styleText = (cocktailBrief.serviceStyle  || '').toLowerCase()
  const combined  = moodText + ' ' + styleText

  return {
    isMediterranean: /mediterranean|coastal|olive|citrus|herb|aperitivo|limoncello/i.test(combined),
    isTropical:      /tropical|hibiscus|passionfruit|mango|pineapple|rum|tiki/i.test(combined),
    isDarkSpirits:   /whisky|whiskey|bourbon|mezcal|smoky|smoke|aged|barrel|dark spirit/i.test(combined),
    isChampagne:     /champagne|sparkling|prosecco|crémant|bubbles|effervescent/i.test(combined),
    cocktailMood:    cocktailBrief.cocktailMood  || null,
    serviceStyle:    cocktailBrief.serviceStyle  || null,
  }
}

function getOmerPhotographyOverlay(omerSignals) {
  if (!omerSignals) return null
  if (omerSignals.isMediterranean) return 'The cocktail programme carries a Mediterranean character — lean toward warm coastal light. Natural surfaces: terracotta, ceramic, stone. Herb garnishes as texture.'
  if (omerSignals.isTropical)      return 'The cocktail programme has tropical character — vivid, vibrant photography. Bold colour, fresh botanicals, abundant garnish.'
  if (omerSignals.isDarkSpirits)   return 'The cocktail programme is led by dark and aged spirits — moody, amber-lit photography. Cut crystal, warm shadow. The drink is a study in patience.'
  if (omerSignals.isChampagne)     return 'The cocktail programme leads with sparkling — luminous, celebratory photography. Fine glassware, bubbles, soft highlights.'
  return null
}

function getOmerMoodKeywords(omerSignals) {
  if (!omerSignals) return []
  if (omerSignals.isMediterranean) return ['Mediterranean', 'Coastal']
  if (omerSignals.isTropical)      return ['Vibrant', 'Abundant']
  if (omerSignals.isDarkSpirits)   return ['Amber', 'Moody']
  if (omerSignals.isChampagne)     return ['Luminous', 'Celebratory']
  return []
}

function getOmerVisualDNAReference(omerSignals) {
  if (!omerSignals) return null
  if (omerSignals.isMediterranean) return 'Cocktail programme: Mediterranean influence — aperitivo culture, coastal bar design, citrus and herb visual language'
  if (omerSignals.isTropical)      return 'Cocktail programme: tropical influence — vibrant colour, bold botanical styling, festive service energy'
  if (omerSignals.isDarkSpirits)   return 'Cocktail programme: dark spirits influence — bar editorial, amber light, considered craft presentation'
  if (omerSignals.isChampagne)     return 'Cocktail programme: champagne influence — luminous glassware, celebratory setting, premium bar service design'
  return null
}

// ── SECTION BUILDERS (creative inputs as primary signal) ──────────────────────

function buildNarrative(event, brief, subtype, omerSignals) {
  const name          = event.name || 'This Event'
  const singleSentence = event.single_sentence  || null
  const aestheticSubgenre = event.aesthetic_subgenre || null
  const venueCharacter = event.venue_character  || null
  const location      = event.location          || null
  const guests        = event.expected_guests   || null

  const typeLabel   = TYPE_LABELS[subtype]    || TYPE_LABELS.other
  const guestStr    = guests   ? ` for ${guests} guests`                 : ''
  const settingStr  = venueCharacter
    ? ` — ${venueCharacter}`
    : location ? ` at ${location}` : ''

  const parts = []

  parts.push(`${name}: ${typeLabel}${guestStr}${settingStr}.`)

  if (aestheticSubgenre) {
    const philosophyLine = {
      quiet_sanctuary:   'Creative direction: quiet sanctuary — understated, restorative, held.',
      cinematic_narrative: 'Creative direction: cinematic narrative — story-driven, the venue as protagonist.',
      theatrical_mystique: 'Creative direction: theatrical mystique — enclosed, atmospheric, high-contrast.',
    }
    if (philosophyLine[aestheticSubgenre]) parts.push(philosophyLine[aestheticSubgenre])
  } else {
    const mood    = NARRATIVE_MOOD[subtype]    || NARRATIVE_MOOD.other
    const quality = NARRATIVE_QUALITY[subtype] || NARRATIVE_QUALITY.other
    parts.push(`The event should feel ${mood} in character, defined by ${quality}.`)
  }

  if (omerSignals?.cocktailMood) {
    parts.push(`The approved cocktail programme carries a ${omerSignals.cocktailMood} character, which informs the photographic and visual DNA of this brief.`)
  }

  if (singleSentence) {
    parts.push(`Creative north star: "${singleSentence}"`)
  }

  return parts.join(' ')
}

function buildMoodKeywords(event, brief, subtype, omerSignals) {
  const userKeywords = event.confirmed_mood_keywords

  if (Array.isArray(userKeywords) && userKeywords.length > 0) {
    const keywords = [...userKeywords]
    for (const kw of getOmerMoodKeywords(omerSignals)) {
      if (!keywords.some(k => k.toLowerCase() === kw.toLowerCase()) && keywords.length < 8) {
        keywords.push(kw)
      }
    }
    return keywords
  }

  const keywords = [...(BASE_KEYWORDS[subtype] || BASE_KEYWORDS.other)]
  const text = [event.name || '', event.notes || '', event.host_message || '', event.location || ''].join(' ').toLowerCase()
  if (/luxury|prestige|premium|exclusive/i.test(text) && !keywords.includes('Luxury')) keywords.push('Luxury')
  if (/outdoor|garden|terrace|rooftop|beach|open.air/i.test(text) && !keywords.includes('Al Fresco')) keywords.push('Al Fresco')
  if (/coastal|mediterranean|ocean|sea/i.test(text) && !keywords.includes('Coastal')) keywords.push('Coastal')
  if ((event.expected_guests || 0) > 150 && !keywords.includes('Grand')) keywords.push('Grand')
  if ((event.expected_guests || 0) > 0 && event.expected_guests < 25 && !keywords.includes('Intimate')) keywords.push('Intimate')
  for (const kw of getOmerMoodKeywords(omerSignals)) {
    if (!keywords.some(k => k.toLowerCase() === kw.toLowerCase()) && keywords.length < 8) keywords.push(kw)
  }
  return keywords.slice(0, 8)
}

function buildColorPalette(event, brief, subtype) {
  const aestheticSubgenre = event.aesthetic_subgenre
  const palette = aestheticSubgenre && SUBGENRE_COLOR_PALETTES[aestheticSubgenre]
    ? [...SUBGENRE_COLOR_PALETTES[aestheticSubgenre]]
    : [...(COLOR_PALETTES[subtype] || COLOR_PALETTES.other)]

  const themeColor = event.theme_color
  const defaultGold = '#c9a96e'
  if (
    themeColor &&
    themeColor.toLowerCase() !== defaultGold &&
    !palette.some(c => c.hex.toLowerCase() === themeColor.toLowerCase())
  ) {
    palette.unshift({ name: 'Event Accent', hex: themeColor })
    if (palette.length > 7) palette.splice(7)
  }
  return palette
}

function buildTypographyDirection(event, subtype) {
  const aestheticSubgenre = event.aesthetic_subgenre
  if (aestheticSubgenre && SUBGENRE_TYPOGRAPHY[aestheticSubgenre]) {
    return SUBGENRE_TYPOGRAPHY[aestheticSubgenre]
  }
  return TYPOGRAPHY_DIRECTION[subtype] || TYPOGRAPHY_DIRECTION.other
}

function buildLayoutDirection(event, subtype) {
  const aestheticSubgenre = event.aesthetic_subgenre
  if (aestheticSubgenre && SUBGENRE_LAYOUT[aestheticSubgenre]) {
    return SUBGENRE_LAYOUT[aestheticSubgenre]
  }
  return LAYOUT_DIRECTION[subtype] || LAYOUT_DIRECTION.other
}

function buildPhotographyDirection(event, subtype, omerSignals) {
  const aestheticSubgenre = event.aesthetic_subgenre
  let base = aestheticSubgenre && SUBGENRE_PHOTOGRAPHY[aestheticSubgenre]
    ? SUBGENRE_PHOTOGRAPHY[aestheticSubgenre]
    : PHOTOGRAPHY_DIRECTION[subtype] || PHOTOGRAPHY_DIRECTION.other

  const omerOverlay = getOmerPhotographyOverlay(omerSignals)
  if (omerOverlay) base = base + ' ' + omerOverlay
  return base
}

function buildVisualDNA(event, subtype, omerSignals) {
  const aestheticSubgenre = event.aesthetic_subgenre
  const references = aestheticSubgenre && SUBGENRE_VISUAL_DNA[aestheticSubgenre]
    ? [...SUBGENRE_VISUAL_DNA[aestheticSubgenre]]
    : [...(VISUAL_DNA[subtype] || VISUAL_DNA.other)]

  const omerRef = getOmerVisualDNAReference(omerSignals)
  if (omerRef) references.push(omerRef)
  return references
}

function buildCreativePhilosophy(event, subtype) {
  const aestheticSubgenre = event.aesthetic_subgenre
  const singleSentence    = event.single_sentence
  const antiReference     = event.anti_reference
  const venueCharacter    = event.venue_character

  const FALLBACK_PHILOSOPHY = {
    wedding:        'This event celebrates a defining human moment. Every creative decision should honour the couple\'s identity, not a wedding aesthetic borrowed from a template. Warmth over opulence. Emotion over spectacle.',
    luxury_wedding: 'This event is defined by invisible precision. The luxury is in what cannot be seen: the quality of coordination, the seamlessness of transitions, the restraint in the design. Nothing is excessive; everything is exact.',
    corporate:      'This event represents the brand in three dimensions. Professional confidence, not corporate caution. The design should feel as premium as the product — trusted, considered, and human.',
    private:        'This event belongs to its host. The design should carry their personality, not a default party aesthetic. The guest should feel they have been invited somewhere real, not produced.',
    bar_event:      'This event is a statement about craft. The cocktail programme is the protagonist; the design amplifies it. Editorial, atmospheric, and confident — the bar speaks before a drink is poured.',
    other:          'This event deserves creative intention. The hospitality design should carry a single coherent point of view — not a collection of aesthetic references, but one clear creative decision made at every scale.',
  }

  let philosophy = aestheticSubgenre && SUBGENRE_CREATIVE_PHILOSOPHY[aestheticSubgenre]
    ? SUBGENRE_CREATIVE_PHILOSOPHY[aestheticSubgenre]
    : (FALLBACK_PHILOSOPHY[subtype] || FALLBACK_PHILOSOPHY.other)

  const notes = []
  if (singleSentence) notes.push({ label: 'North star', text: singleSentence })
  if (antiReference)  notes.push({ label: 'What this must not look like', text: antiReference })
  if (venueCharacter) notes.push({ label: 'Physical anchor', text: venueCharacter })

  return { philosophy, notes }
}

function buildHospitalityVision(event) {
  const primaryMoment = event.primary_impact_moment
  const moments = ['arrival', 'social', 'signature', 'dining', 'closing'].map(key => ({
    key,
    label:            IMPACT_MOMENT_VISION[key].label,
    isPrimary:        key === primaryMoment,
    instruction:      IMPACT_MOMENT_VISION[key].primaryInstruction,
    guestExperience:  IMPACT_MOMENT_VISION[key].guestExperience,
    creativeDirection:IMPACT_MOMENT_VISION[key].creativeDirection,
  }))

  const summary = primaryMoment
    ? `Creative investment is concentrated at the ${IMPACT_MOMENT_VISION[primaryMoment]?.label || primaryMoment} moment. All other impact moments support this peak.`
    : 'No primary impact moment designated. Consider identifying a single peak moment to sharpen the creative brief.'

  return { primaryMoment: primaryMoment || null, moments, summary }
}

function buildDeliverables(event, brief, subtype) {
  return [
    {
      type:        'Cocktail Menu',
      description: 'Premium printed or digital cocktail programme — designed to match the event visual identity. One-sided card, folded format, or digital display.',
      priority:    getPriority('cocktail_menu', subtype),
    },
    {
      type:        'Welcome Sign',
      description: 'Entry or bar sign welcoming guests and naming the cocktail programme. Consistent event branding at the first touchpoint.',
      priority:    getPriority('welcome_sign', subtype),
    },
    {
      type:        'Table Cards',
      description: 'Individual table cocktail identifiers or drink descriptions. Reduces staff load and supports self-service at the table.',
      priority:    getPriority('table_cards', subtype),
    },
    {
      type:        'Instagram Posts',
      description: 'Square format hero cocktail post for event social coverage. Editorial still life aligned to the event colour palette.',
      priority:    getPriority('instagram_posts', subtype),
    },
    {
      type:        'Instagram Stories',
      description: 'Story-format programme reveal or behind-the-scenes moment. Vertical 9:16 ratio, atmospheric and brand-consistent.',
      priority:    getPriority('instagram_stories', subtype),
    },
    {
      type:        'Event Brand Sheet',
      description: 'Full identity one-pager: event name, colour palette, typography direction, and programme overview. For internal use and vendor briefing.',
      priority:    getPriority('brand_sheet', subtype),
    },
  ]
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * buildEventDesignBrief — ZOHAR's design intelligence output.
 *
 * Creative inputs are the primary signals. Subtype provides fallbacks only.
 *
 * @param {{ event: object, brief: object, menuName?: string }} params
 * @returns {object} Structured design brief.
 */
export function buildEventDesignBrief({ event, brief, menuName = null }) {
  if (!event) return null

  const subtype     = resolveSubtype(brief, event)
  const omerSignals = detectOmerSignals(brief)

  return {
    schemaVersion:  '2.0',
    generatedBy:    'ZOHAR',
    eventId:        event.id,
    eventName:      event.name || 'This Event',
    eventType:      event.event_type || 'other',
    subtype,
    menuName:       menuName || null,
    // Creative inputs summary — surfaced for Creative Studio handoff
    creativeInputs: {
      aestheticSubgenre:     event.aesthetic_subgenre     || null,
      singleSentence:        event.single_sentence        || null,
      antiReference:         event.anti_reference         || null,
      venueCharacter:        event.venue_character        || null,
      primaryImpactMoment:   event.primary_impact_moment  || null,
      confirmedMoodKeywords: event.confirmed_mood_keywords || null,
    },
    sections: {
      narrative:           buildNarrative(event, brief, subtype, omerSignals),
      creativePhilosophy:  buildCreativePhilosophy(event, subtype),
      hospitalityVision:   buildHospitalityVision(event),
      moodKeywords:        buildMoodKeywords(event, brief, subtype, omerSignals),
      colorPalette:        buildColorPalette(event, brief, subtype),
      typographyDirection: buildTypographyDirection(event, subtype),
      layoutDirection:     buildLayoutDirection(event, subtype),
      photographyDirection:buildPhotographyDirection(event, subtype, omerSignals),
      visualDNA:           buildVisualDNA(event, subtype, omerSignals),
      deliverables:        buildDeliverables(event, brief, subtype),
    },
  }
}
