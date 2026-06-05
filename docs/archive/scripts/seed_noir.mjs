// seed_noir.mjs — Inserts Noir demo bar DNA + menu + cocktails for testing.
// Run once: node seed_noir.mjs
// Safe to re-run: checks for existing Noir menu before inserting.

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, 'data', 'hospia.sqlite');
const db        = new DatabaseSync(DB_PATH);

const VENUE_ID   = 'venue-main';
const CREATOR_ID = 1;           // toam (admin)
const NOW        = new Date().toISOString();

// ── Guard: skip if Noir menu already exists ───────────────────────────────────
const existing = db.prepare(
  "SELECT id FROM cocktail_menus WHERE name='Noir — Winter Edition' AND venue_id=?"
).get(VENUE_ID);

if (existing) {
  console.log(`Noir menu already exists (id=${existing.id}). Nothing inserted.`);
  console.log('To re-seed, delete the menu and its cocktails first, then re-run.');
  process.exit(0);
}

// ── 1. Bar DNA — Noir ─────────────────────────────────────────────────────────
// getCIDna() orders by updated_at DESC — this row becomes the active DNA.
// Your previous BROWN DNA row is preserved; Noir is the newest.
db.prepare(`
  INSERT INTO cocktail_intelligence_dna
    (venue_id, venue_name, venue_type, atmosphere, cuisine_style,
     audience_type, staff_skill, equipment_json, glassware_json,
     is_kosher, flavor_identity_json, price_range, service_pressure,
     hero_ingredient, created_at, updated_at, meta_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  VENUE_ID,
  'Noir',
  'bar',
  'intimate, dark amber, candlelight, vinyl crates, whiskey shelf',
  null,
  'locals, industry, cocktail enthusiasts, 25-45',
  'advanced',
  JSON.stringify(['jigger', 'mixing glass', 'boston shaker', 'coupe glasses', 'rocks glasses']),
  JSON.stringify(['Rocks', 'Nick & Nora', 'Coupe', 'Highball']),
  'no',
  JSON.stringify(['smoky', 'bitter', 'spirit-forward', 'umami', 'anise']),
  'Premium',
  'medium',
  'Bourbon, Arak, Scotch, Mezcal, Rye Whiskey',
  NOW, NOW,
  JSON.stringify({
    concept:         'A Tel Aviv speakeasy hidden inside a vintage record shop. Vinyl-era jazz, dark amber lighting, whiskey and arak riffs. Every drink is named after a song nobody remembers anymore.',
    signature_style: 'Vinyl speakeasy — track-list drinks, catalog number identity, groove-line service',
    spirit_focus:    'Bourbon, Arak, Scotch, Mezcal, Rye Whiskey',
    notes:           'DARK_LUXURY template. Identity word: forgotten. Conceptual sections: Side A / Deep Cuts / Standards.',
  })
);

const dnaId = db.prepare("SELECT id FROM cocktail_intelligence_dna WHERE venue_id=? ORDER BY updated_at DESC LIMIT 1").get(VENUE_ID)?.id;
console.log(`✓ Noir DNA inserted (id=${dnaId})`);

// ── 2. Menu record ────────────────────────────────────────────────────────────
db.prepare(`
  INSERT INTO cocktail_menus
    (venue_id, name, occasion, description, season, created_by, created_at, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  VENUE_ID,
  'Noir — Winter Edition',
  'regular_menu',
  'Speakeasy signatures named after forgotten songs. Dark, amber, vinyl.',
  'winter',
  CREATOR_ID,
  NOW,
  'active'
);

const menuId = db.prepare("SELECT id FROM cocktail_menus WHERE name='Noir — Winter Edition' AND venue_id=?").get(VENUE_ID)?.id;
console.log(`✓ Menu created (id=${menuId}): "Noir — Winter Edition"`);

// ── 3. Cocktail insert helper ─────────────────────────────────────────────────
function insertCocktail({ name, description, baseSpirit, glass, garnish, method, ingredients, tags, priceSuggested }) {
  db.prepare(`
    INSERT INTO cocktails
      (name, category, description, base_spirit, glass_type, garnish, method,
       tags_json, ingredients_text_json, is_active, created_by, created_at,
       source, menu_id, suggested_price_ils)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
  `).run(
    name,
    'ci_generated',
    description || null,
    baseSpirit  || null,
    glass       || null,
    garnish     || null,
    method      || null,
    JSON.stringify(tags || []),
    JSON.stringify(ingredients || []),
    CREATOR_ID,
    NOW,
    'ci_generated',
    menuId,
    priceSuggested ?? null
  );
  const id = db.prepare("SELECT id FROM cocktails WHERE name=? AND menu_id=? ORDER BY id DESC LIMIT 1").get(name, menuId)?.id;
  console.log(`  + cocktail "${name}" (id=${id}, price=${priceSuggested})`);
  return id;
}

// ── 4. Signature cocktails ────────────────────────────────────────────────────
console.log('\nSignature cocktails:');

insertCocktail({
  name:           'Side A',
  description:    'צד א — Smoked honey and walnut depth, bourbon and arak in rare agreement.',
  baseSpirit:     'Bourbon',
  glass:          'Rocks',
  garnish:        'Orange peel',
  method:         'Stirred',
  ingredients:    ['Bourbon', 'Arak', 'Smoked Honey', 'Walnut Bitters', 'Orange Oil'],
  tags:           [],
  priceSuggested: 65,
});

insertCocktail({
  name:           'Blue Note',
  description:    'בלו נוט — Scotch and sherry sharpened by zaatar, finished with saline brightness.',
  baseSpirit:     'Scotch',
  glass:          'Nick & Nora',
  garnish:        'Lemon twist',
  method:         'Stirred',
  ingredients:    ['Scotch', 'Dry Sherry', 'Zaatar Bitter', 'Lemon', 'Saline'],
  tags:           [],
  priceSuggested: 68,
});

insertCocktail({
  name:           'The Forgotten B-Side',
  description:    'Mezcal smoke meets amaro depth, lifted by egg white and bitter grapefruit.',
  baseSpirit:     'Mezcal',
  glass:          'Coupe',
  garnish:        'Grapefruit peel',
  method:         'Shaken',
  ingredients:    ['Mezcal', 'Amaro Montenegro', 'Grapefruit', 'Egg White'],
  tags:           [],
  priceSuggested: 62,
});

insertCocktail({
  name:           'Last Dance',
  description:    'ריקוד אחרון — Rye and vermouth deepened by mole bitters and bitter chocolate.',
  baseSpirit:     'Rye Whiskey',
  glass:          'Coupe',
  garnish:        'Chocolate ribbon',
  method:         'Stirred',
  ingredients:    ['Rye Whiskey', 'Sweet Vermouth', 'Mole Bitters', 'Chocolate'],
  tags:           [],
  priceSuggested: 66,
});

insertCocktail({
  name:           'Vinyl Rain',
  description:    'Gin and elderflower lifted by cucumber, lemon, and a long tonic finish.',
  baseSpirit:     'Gin',
  glass:          'Highball',
  garnish:        'Cucumber ribbon',
  method:         'Built',
  ingredients:    ['Gin', 'Elderflower', 'Cucumber', 'Lemon', 'Tonic'],
  tags:           [],
  priceSuggested: 58,
});

// ── 5. Non-alcoholic ──────────────────────────────────────────────────────────
console.log('\nNon-alcoholic:');

insertCocktail({
  name:           'Static',
  description:    'Grapefruit and rosemary over ginger heat, finished with soda.',
  baseSpirit:     null,
  glass:          'Highball',
  garnish:        'Rosemary sprig',
  method:         'Built',
  ingredients:    ['Grapefruit Cordial', 'Ginger', 'Rosemary', 'Soda'],
  tags:           ['non-alcoholic'],
  priceSuggested: 38,
});

// ── 6. Classics ───────────────────────────────────────────────────────────────
console.log('\nClassics:');

for (const [name, ings, price, spirit] of [
  ['Negroni',       ['Gin', 'Campari', 'Sweet Vermouth'],                          55, 'Gin'],
  ['Old Fashioned', ['Bourbon', 'Angostura Bitters', 'Sugar'],                     58, 'Bourbon'],
  ['Sazerac',       ['Rye Whiskey', "Peychaud's Bitters", 'Absinthe'],             60, 'Rye Whiskey'],
  ['Manhattan',     ['Rye Whiskey', 'Sweet Vermouth', 'Angostura Bitters'],        58, 'Rye Whiskey'],
]) {
  insertCocktail({
    name, ingredients: ings, priceSuggested: price, baseSpirit: spirit,
    tags: ['classic'], glass: null, garnish: null, method: null, description: null,
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────
const count = db.prepare("SELECT COUNT(*) AS n FROM cocktails WHERE menu_id=?").get(menuId)?.n;
console.log(`\n✓ Done. Menu id=${menuId} has ${count} cocktails total.`);
console.log('\nHow to access in the app:');
console.log('  1. Log in as any CI-role user (toam/tal/omer/peleg/saar)');
console.log('  2. Go to Cocktail Intelligence → Visual Menu Builder');
console.log(`  3. Select "Noir — Winter Edition" (menu id ${menuId})`);
console.log('  4. Click "Build Final Menu" to trigger the full design generation');
console.log('\nNote: Noir DNA is now the active DNA (most recently updated).');
console.log('      BROWN DNA is preserved — it will re-activate when you update it.');
