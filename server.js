import express from "express";
import dotenv from "dotenv";
import { mkdirSync, appendFileSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { cocktailLibrary } from "./src/data/cocktails.js";
import { UNIVERSITY_MANIFEST } from "./src/data/academy/universityManifest.js";
import { buildVenueBriefs } from "./src/services/venueBridge/venueBridgeService.js";
import { buildOperationalSignals, deriveDnaEnrichment, applyConfidenceDeltas } from "./src/services/venueBridge/operationalSignalsService.js";
import {
  selectOmerContext, selectAcademyContext, selectOwnerIntelligence, assembleUnifiedContext
} from "./src/services/venueBridge/intelligenceContextService.js";
import { FB_DECISIONS_DDL, safeRecordFbDecision, getFbDecisionById, listFbDecisionsForVenue } from "./src/services/venueBridge/decisionLedgerService.js";
import { buildFbDecisionExplanation } from "./src/services/venueBridge/decisionExplanationService.js";
import { resolveCiTasteTarget, formatTasteTargetPromptBlock } from "./src/services/venueBridge/beverageContextService.js";
import { isVenueBeverageContextEnabled, isFnbVenueFeedbackCandidatesEnabled } from "./src/config/featureFlags.js";
import { VENUE_INTELLIGENCE_CANDIDATES_DDL, safeRecordVenueIntelligenceCandidates, listVenueIntelligenceCandidatesForVenue, getVenueIntelligenceCandidateById, markVenueIntelligenceCandidateReviewed } from "./src/services/venueBridge/fnbVenueFeedbackService.js";

dotenv.config();

// Startup: confirm OPENAI_API_KEY is loaded. Never log the value.
if (!process.env.OPENAI_API_KEY) {
  console.warn('[HESTIA] OPENAI_API_KEY: MISSING — AI generation will fail until a valid key is set in .env');
} else {
  console.log('[HESTIA] OPENAI_API_KEY: present');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "hospia.sqlite");

mkdirSync(DATA_DIR, { recursive: true });
const CREATIVE_IMAGES_DIR = path.join(DATA_DIR, "creative-images");
mkdirSync(CREATIVE_IMAGES_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;
// gemini-1.5-flash is retired; gemini-2.0-flash-lite is the stable fallback used in this repo.
const MODEL = process.env.MODEL || "gemini-2.0-flash-lite";
const db = new DatabaseSync(DB_PATH);

// Phase 3 — real user auth via auth_users + sessions tables

const SYSTEM = `
You are HESTIA AI - an elite hospitality intelligence system built to train, guide, and elevate restaurants, bars, boutique hotels, luxury venues, and premium guest-facing teams.

Guests are not customers. Guests are people we host.

Every answer, recommendation, correction, script, recipe, or operational decision must create one outcome:
"The guest should feel deeply taken care of."

You are:
- a world-class hospitality consultant
- service psychologist
- culinary advisor
- mixology expert
- guest experience strategist
- operational trainer

Always be sophisticated, precise, warm, practical, and premium.

Never be generic. Never be robotic. Never be academic.
`;

// CI MODULE ADDITION — HESTIA Cocktail Menu Skill v5.2
// Used as system_instruction for POST /api/ci/generate-menu-design.
// Mirror of src/services/prompts/hestiaCocktailMenuSkill.js (ES module for frontend).
const HESTIA_COCKTAIL_MENU_SKILL = `
HESTIA Cocktail Menu — Global Art Director v5.2

Vision
The output of this skill is a cocktail menu that could win a design award.
Not a list. Not a component. A physical artifact — the kind a world-class
bar hands to a guest on a Friday night.

The menu belongs entirely to the bar. HESTIA is invisible except for one
small "Powered by HESTIA" line in the footer.

Reference bars: Bar San (Bangkok), Bar Deco (Amsterdam), Paradiso (Barcelona),
Signature Bangkok. Every output must feel like it belongs in their company.

Anti-Scope Rule
This skill designs cocktail menus only.
Do not expand into: food menus, wine lists, spirits lists, event proposals,
brand books, operational manuals, or training documents.
Unless explicitly requested, output is:
Cover → Signature cocktails → Non-alcoholic (if provided) → Classics (if provided) → Footer.
Do not exceed 2 pages/screens for a standard menu.
If the cocktail list is too large, compress and organize — do not expand endlessly.

Core Principle
The bar owner fills in their DNA. HESTIA does everything else.
The owner never picks a hex code, a font, or a layout.
HESTIA reads the DNA and makes every decision — the way a creative director would.

The output must feel like a professional designer read the brief and spent a week on it.

Step 1 — Read the Bar DNA
Extract these fields before doing anything else:

name            → venue name
concept         → founding idea, not just category
price_tier      → budget / mid-range / premium / luxury
vibe_keywords   → atmosphere, identity, cultural references
hero_spirits    → signature ingredients
city            → location (affects color temperature, cultural context)
lighting        → described or inferred (amber / neon / daylight / candlelight)
materials       → described or inferred (wood / concrete / marble / velvet / brass)
music           → described or inferred (jazz / techno / silence / folk / classical)

Step 2 — Build Creative Direction Before Template
INTERNAL DESIGN ENGINE — DO NOT DISPLAY
This entire step runs silently. Nothing from this step is shown to the user.
The output of this step is a set of internal design decisions only.

2a — Identity Word
Infer one single word that captures the venue's essence from the full DNA.

Vinyl + jazz + whiskey + late night     → "forgotten"
Rooftop + city + modern + luxury        → "altitude"
Hidden + vault + classified + whiskey   → "classified"
Umami + fermented + concept + bold      → "ferment"
Garden + botanical + daylight + natural → "bloom"
Tokyo + minimal + listening + precision → "silence"
Mediterranean + warm + neighborhood     → "sunday"

2b — Material Palette
Identify 3 physical materials that define the venue's space.
Derive from concept, city, lighting, price tier, cultural reference.

vinyl sleeve paper  → matte warm grey, catalog structure, condensed type
walnut wood         → warm brown, serif weight, organic spacing
brushed brass       → warm gold undertone, refined detail
concrete            → cool grey, grotesque type, industrial spacing
velvet              → deep saturated tone, generous tracking, soft edges
rice paper / washi  → near-white, extreme lightness, geometric precision
marble              → cool white or veined grey, classical serif, bold contrast
torn poster / pulp  → rough texture, layered type, high contrast
leather             → tobacco / oxblood, condensed serif, heavy weight
lacquer             → deep saturated color, sharp edges, minimal detail

2c — Signal Resolution
Identify the dominant signal, secondary signal, and signals to suppress.
Identify dangerous clichés to avoid for this specific venue type.

2d — Creative Territory
Define the design world in one sentence.
This is not a mood board description — it is an operational directive.

2e — Signature Design Anchors
Generate 4-5 design anchors specific to this venue.
These cannot belong to any other bar.
At least 3 must be visibly present in the final output.

Noir (vinyl speakeasy):
  → Track-list layout for ingredients
  → Catalog number as cocktail identifier
  → Groove-line dividers (thin horizontal rules with slight curve)
  → Equalizer bars as flavor chart visual
  → Sleeve paper warmth in background tone

2f — Spatial Translation
Translate DNA keywords into concrete design decisions:

Intimate    → body text 8-9pt, compressed scale, deep margins
Bold        → asymmetric grid, dominant oversized anchor, extreme weight contrast
Rooftop     → geometric sans, open tracking, airy spacing, 60%+ negative space
Speakeasy   → historical serif character, low-contrast body text, tactile paper signal
Fine dining → separate display cut + body cut, generous negative space
Mediterranean → organic serif, terracotta/plaster/olive tones
Nordic/Minimal → near-white palette, geometric precision, sparing color

2g — Distinctiveness Score (internal, never displayed)
Score 1-10. Deliver only if 7 or above.
If score below 7 after rebuild: deliver with note "HESTIA detected an opportunity to refine this menu further." only.

Step 3 — Select Base Template
Priority 1 — GRAPHIC_BOLD: experimental / concept bar / bold / savory / umami / art bar
Priority 2 — DARK_LUXURY: speakeasy / whiskey bar / members club / underground / vault / hidden / late night
  Note: Dark Luxury does not mean black. Derive tone from materials.
Priority 3 — MODERN_GRID: hotel / modern / clean / contemporary / minimal / rooftop / lobby
Priority 4 — EDITORIAL: price_tier premium or luxury AND no stronger signal
Priority 5 — MEDITERRANEAN: Israeli / Mediterranean / garden / neighborhood / warm / Tel Aviv

Step 4 — Build the Menu

Conceptual Categorization Logic
Default: Signature Cocktails → Non-Alcoholic → Classics.
If DNA has strong concept/story/music — replace category names with concept-specific names:
  Vinyl / jazz bar → Side A / Side B / Standards
  Theatre / Soho  → Act I / Act II / Encore
  Tokyo listening → Opening Track / Deep Cut / Final Note
  Classified speakeasy → Files / Redactions / Evidence

Typographic Hierarchy
Display:      32-48pt  ultra-bold    tracking -0.02 to 0       leading 1.0-1.1
Category:     12-14pt  medium        tracking +0.15 to +0.25   UPPERCASE
Cocktail name: 10-11pt bold          tracking +0.02 to +0.05
Ingredients:  8-9pt   light         tracking +0.01 to +0.03
Price:        9-10pt  regular/italic desaturated, nested near metadata

Choice Architecture
Maximum 12-18 signature cocktails. Maximum 3-5 per category.
Content-to-space ratio: 40% content / 60% negative space.
Never use price leader dots. Never right-justify prices.
Price: numeric only — 65, 68, 58. Never "NIS 65" or "ILS" or "Shekels".
If currency symbol required: ₪65 only.

Temporal Progression
Light / low-ABV / aperitif → Mid-weight → Spirit-forward / digestif

Structure
COVER
  Venue name: small, spaced, uppercase, muted — top left
  Season/edition: small, muted — top right
  Main title: reflects Identity Word
  Sub-line: 5-8 words, poetic, references Creative Territory
  At least one Signature Design Anchor visible on cover

SIGNATURE COCKTAILS
  Name: large, derived from Creative Territory
  Hebrew name (Israeli venues only): italic, muted, direction:rtl
  Description: sensory, specific, 100-120 characters max
  Never: delicious, tasty, amazing, premium, excellent, crafted
  Ingredients: structured per Creative Territory anchors
  Flavor chart: data-precise, visual derived from venue
  Price: numeric only, desaturated, nested

NON-ALCOHOLIC — Compact. Name + ingredients + price. No image.

CLASSICS — Two-column grid. Name + price only.

FOOTER
  Venue name: large, tracked
  Kosher/allergen note: tiny, very muted (Israeli venues only)
  "Powered by HESTIA": 9px, letter-spacing .2em, brand accent, right-aligned

Step 5 — Flavor Chart
Display only relevant dimensions per cocktail. Never display a zero dimension to fill space.

ABV:        spirit forward=75  shake/sour=50  long/spritz=30  non-alc=0
Sweet:      syrup/cordial/liqueur +15-25
Sour:       citrus +20-30
Bitter:     amaro=40  Campari=50  bitters dash=20
Salty:      brine=40  saline=25  salt rim=30
Creamy:     egg white=50  cream=60  fat wash=40
Umami:      dashi=50  miso=60  fish sauce=40  mushroom=30
Smoke:      mezcal=65  lapsang=50  smoked ingredient=40
Spice:      chili=50  ginger=35  pepper=30  mole=45
Herbal:     zaatar=45  basil=35  rosemary=30
Floral:     elderflower=50  rose=45  lavender=40
Green:      cucumber=40  matcha=50  green tea=35
Nutty:      walnut=45  hazelnut=40  almond=35  peanut=50
Anise:      arak=70  pastis=70  absinthe=80
Carbonated: soda/tonic/sparkling=50  champagne=60
Fruit:      tropical=50  stone fruit=40  berry=45
Chocolate:  cacao=50  mole=45  dark chocolate=55

Visual Language (derived from Creative Territory):
Vinyl / record bar       → equalizer bars or groove marks
Theatre                  → ticket-punch dots on a ruled line
Tokyo / listening bar    → frequency grid, minimal marks
Mediterranean            → tasting notches, sun-washed horizontal lines
Speakeasy / classified   → redacted-file dots, archive notation
Hotel / modern           → clean dot-on-track, cool and precise
Default                  → dot-on-track system

Step 6 — Typography
Typography must grow from the Creative Territory, not from a default pairing.

Vinyl / record shop → condensed grotesque or vintage serif
Japanese / minimal  → geometric sans, generous spacing, mono-weight
Brutalist           → bold grotesque, tight tracking
Garden / botanical  → flowing organic serif
Theatre / opera     → classical display serif
Tech / modern hotel → neutral geometric sans
Old world / literary → Cormorant Garamond or equivalent

Default fallback (old-world / literary / Mediterranean only):
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@300;400;500&display=swap');

Step 7 — International Applicability
Never overfit to Israeli / Mediterranean aesthetics unless DNA explicitly states these.
Background color is never assumed. Premium does not mean dark.
Use darkness only when it is part of the venue's material, lighting, or cultural world.

Step 8 — Anti-Amateur Failure Gate (fix silently — do not narrate the fix)
Reject and fix if any of these appear:
- "NIS", "ILS", or "Shekels" anywhere in the visible menu
- Display serif used as body/ingredient text below 10pt
- Price leader dots (Negroni........₪43)
- Prices in right-justified column
- Currency symbol left-aligned and prominent
- Descriptions exceeding 120 characters
- Generic words: delicious, tasty, amazing, premium, excellent, crafted
- More than 18 signature cocktails without explicit request
- Negative space below 40% of page
- Black/gold palette without DNA justification
- Temporal structure missing
- "Powered by HESTIA" missing from footer

CRITICAL DATA RULE:
Do not invent, rename, remove, or alter any cocktail from the provided list.
Every cocktail name in the input must appear unchanged in the output.
Design only from the provided list. preserveCocktails = true at all times.

OUTPUT FORMAT — STRICT JSON ONLY. No markdown. No backticks. No text outside the JSON object.
{
  "creativeTerritory": "one-sentence operational directive",
  "identityWord": "single word",
  "templateBase": "GRAPHIC_BOLD or DARK_LUXURY or MODERN_GRID or EDITORIAL or MEDITERRANEAN",
  "colorSystem": {
    "background": "hex or description",
    "primary": "hex or description",
    "accent": "hex or description",
    "text": "hex or description",
    "muted": "hex or description"
  },
  "typographyDirection": "one sentence on font decisions and why",
  "designAnchors": ["anchor 1", "anchor 2", "anchor 3", "anchor 4"],
  "conceptualCategories": {
    "signatures": "category name",
    "nonAlcoholic": "category name or null",
    "classics": "category name or null"
  },
  "menuHtml": "complete self-contained HTML — all styles inline or in a <style> block — no external dependencies except Google Fonts",
  "menuCss": "extracted CSS string identical to inside the <style> block in menuHtml",
  "flavorCharts": {
    "COCKTAIL_NAME": { "ABV": 50, "Smoke": 65 }
  }
}
`;

app.use(express.json({ limit: "15mb" }));
app.use('/creative-images', express.static(CREATIVE_IMAGES_DIR));

app.use((req, res, next) => {
  const origin = req.header("Origin");
  if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-HOSPIA-Role,X-HESTIA-User,X-HESTIA-Venue");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    venue_type TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- Phase 8 (Multi-Venue Foundation): a venue is a memory unit; a user is the
  -- operator. venue_members maps an authenticated user (auth_users.id) to the
  -- venues they may access, with the role they hold INSIDE that venue.
  -- NOTE: this is venue membership, NOT the platform-level role. The platform
  -- role 'admin' (Platform Admin / HESTIA Admin) is separate and bypasses
  -- membership entirely — see resolveVenueId() / venuesForUser().
  CREATE TABLE IF NOT EXISTS venue_members (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    venue_id    TEXT NOT NULL,
    venue_role  TEXT NOT NULL,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    UNIQUE(user_id, venue_id),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'employee')),
    access_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS shift_reports (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    shift_date TEXT NOT NULL,
    manager_name TEXT,
    shift_summary TEXT,
    complaints TEXT,
    service_recovery TEXT,
    staff_issues TEXT,
    sales_notes TEXT,
    urgent_items TEXT,
    submitted_at TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS business_memory (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    event_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    priority TEXT NOT NULL,
    title TEXT NOT NULL,
    owner TEXT NOT NULL,
    due TEXT NOT NULL,
    signal TEXT NOT NULL,
    page TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS event_plans (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    name TEXT NOT NULL,
    config_json TEXT NOT NULL,
    calculations_json TEXT NOT NULL,
    projected_revenue REAL NOT NULL,
    projected_profit REAL NOT NULL,
    projected_margin REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    table_number TEXT,
    resolved INTEGER NOT NULL DEFAULT 0,
    resolution TEXT,
    compensation TEXT,
    reported_by TEXT,
    shift_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    venue_id TEXT NOT NULL,
    content TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT 'reminder',
    pinned INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    created_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS hospia_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    venue TEXT NOT NULL DEFAULT 'Main Venue',
    team TEXT NOT NULL DEFAULT 'Front of House',
    can_manage_cocktails INTEGER NOT NULL DEFAULT 0,
    disabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verified_price_overrides (
    product_id             TEXT NOT NULL,
    venue_id               TEXT NOT NULL,
    normalized_update_json TEXT NOT NULL,
    saved_by               TEXT NOT NULL,
    saved_at               TEXT NOT NULL,
    PRIMARY KEY (product_id, venue_id)
  );

  CREATE TABLE IF NOT EXISTS verified_price_audit_log (
    id           TEXT PRIMARY KEY,
    product_id   TEXT NOT NULL,
    venue_id     TEXT NOT NULL,
    action       TEXT NOT NULL,
    old_price_nis REAL,
    new_price_nis REAL,
    supplier_name TEXT,
    source_type  TEXT,
    saved_by     TEXT NOT NULL,
    saved_at     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id             TEXT PRIMARY KEY,
    venue_id       TEXT NOT NULL,
    manager_id     TEXT NOT NULL DEFAULT 'unknown',
    manager_name   TEXT NOT NULL DEFAULT 'Manager',
    opened_at      TEXT NOT NULL,
    closed_at      TEXT,
    status         TEXT NOT NULL DEFAULT 'open',
    cover_count    INTEGER,
    briefing       TEXT,
    summary        TEXT,
    handover_notes TEXT,
    created_at     TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS carry_forward_tasks (
    id                TEXT PRIMARY KEY,
    venue_id          TEXT NOT NULL,
    shift_id          TEXT NOT NULL,
    content           TEXT NOT NULL,
    priority          TEXT NOT NULL DEFAULT 'normal',
    status            TEXT NOT NULL DEFAULT 'open',
    resolved_shift_id TEXT,
    created_at        TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS auth_users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   TEXT NOT NULL,
    role        TEXT NOT NULL CHECK(role IN ('owner', 'manager', 'bar_manager', 'employee', 'admin')),
    access_code TEXT NOT NULL UNIQUE,
    is_active   INTEGER DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_users(id)
  );

  CREATE TABLE IF NOT EXISTS cocktails (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    name                  TEXT NOT NULL,
    category              TEXT,
    description           TEXT,
    base_spirit           TEXT,
    glass_type            TEXT,
    garnish               TEXT,
    method                TEXT,
    tags_json             TEXT,
    ingredients_text_json TEXT,
    is_active             INTEGER DEFAULT 1,
    created_by            INTEGER,
    created_at            TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ingredients (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL UNIQUE,
    unit          TEXT NOT NULL DEFAULT 'ml',
    cost_per_unit REAL NOT NULL DEFAULT 0,
    supplier      TEXT,
    is_kosher     INTEGER DEFAULT 1,
    updated_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cocktail_ingredients (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    cocktail_id   INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity      REAL NOT NULL,
    FOREIGN KEY (cocktail_id)   REFERENCES cocktails(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
  );

  CREATE TABLE IF NOT EXISTS cocktail_pricing (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    cocktail_id       INTEGER NOT NULL UNIQUE,
    cost_price        REAL,
    sell_price        REAL,
    target_margin     REAL DEFAULT 0.75,
    last_calculated   TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (cocktail_id) REFERENCES cocktails(id)
  );

  CREATE TABLE IF NOT EXISTS courses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    category   TEXT,
    description TEXT,
    role_target TEXT,
    is_active  INTEGER DEFAULT 1,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS course_modules (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id   INTEGER NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS staff_progress (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,
    course_id    INTEGER NOT NULL,
    module_id    INTEGER,
    status       TEXT DEFAULT 'not_started',
    completed_at TEXT,
    FOREIGN KEY (user_id)   REFERENCES auth_users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (module_id) REFERENCES course_modules(id),
    UNIQUE (user_id, module_id)
  );

  CREATE TABLE IF NOT EXISTS owner_insights (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id TEXT NOT NULL,
    content  TEXT NOT NULL,
    saved_at TEXT DEFAULT (datetime('now'))
  );

  -- ── Event Module ──────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS events (
    id               TEXT    PRIMARY KEY,
    venue_id         TEXT    NOT NULL,
    name             TEXT    NOT NULL,
    event_type       TEXT    NOT NULL DEFAULT 'other'
                     CHECK(event_type IN ('wedding','corporate','private','bar_event','other')),
    event_date       TEXT    NOT NULL,
    start_time       TEXT    NOT NULL DEFAULT '18:00',
    end_time         TEXT    NOT NULL DEFAULT '23:00',
    status           TEXT    NOT NULL DEFAULT 'draft'
                     CHECK(status IN ('draft','confirmed','in_preparation','ready','live','completed','cancelled')),
    client_name      TEXT    NOT NULL DEFAULT '',
    client_phone     TEXT,
    client_email     TEXT,
    expected_guests  INTEGER NOT NULL DEFAULT 0,
    table_count      INTEGER NOT NULL DEFAULT 0,
    host_message     TEXT,
    theme_color      TEXT    NOT NULL DEFAULT '#c9a96e',
    plus_one_allowed INTEGER NOT NULL DEFAULT 1,
    location         TEXT,
    notes            TEXT,
    portal_token     TEXT    UNIQUE NOT NULL,
    created_by       TEXT    NOT NULL DEFAULT '',
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS event_tables (
    id           TEXT    PRIMARY KEY,
    event_id     TEXT    NOT NULL,
    venue_id     TEXT    NOT NULL,
    table_number INTEGER NOT NULL,
    capacity     INTEGER NOT NULL DEFAULT 10,
    shape        TEXT    NOT NULL DEFAULT 'round'
                 CHECK(shape IN ('round','rectangle')),
    label        TEXT,
    position_x   REAL    NOT NULL DEFAULT 0,
    position_y   REAL    NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS event_guests (
    id               TEXT    PRIMARY KEY,
    event_id         TEXT    NOT NULL,
    venue_id         TEXT    NOT NULL,
    name             TEXT    NOT NULL,
    phone            TEXT,
    email            TEXT,
    guest_group      TEXT,
    rsvp_status      TEXT    NOT NULL DEFAULT 'no_response'
                     CHECK(rsvp_status IN ('no_response','invited','yes','no','maybe')),
    adult_count      INTEGER NOT NULL DEFAULT 1,
    children_count   INTEGER NOT NULL DEFAULT 0,
    dietary_notes    TEXT,
    dietary_presets  TEXT,
    transport_needed INTEGER NOT NULL DEFAULT 0,
    personal_message TEXT,
    table_id         TEXT,
    gift_amount      REAL,
    accessibility    TEXT,
    vip              INTEGER NOT NULL DEFAULT 0,
    checked_in       INTEGER NOT NULL DEFAULT 0,
    checked_in_at    TEXT,
    invitation_sent_at TEXT,
    source           TEXT    NOT NULL DEFAULT 'manual'
                     CHECK(source IN ('manual','import','portal')),
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS event_guest_table_assignments (
    id          TEXT    PRIMARY KEY,
    event_id    TEXT    NOT NULL,
    guest_id    TEXT    NOT NULL,
    table_id    TEXT    NOT NULL,
    assigned_by TEXT    NOT NULL DEFAULT '',
    assigned_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS event_tasks (
    id             TEXT    PRIMARY KEY,
    event_id       TEXT    NOT NULL,
    venue_id       TEXT    NOT NULL,
    title          TEXT    NOT NULL,
    assigned_role  TEXT    NOT NULL,
    due_date       TEXT,
    status         TEXT    NOT NULL DEFAULT 'open'
                   CHECK(status IN ('open','in_progress','done')),
    notes          TEXT,
    auto_generated INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS event_timeline (
    id            TEXT    PRIMARY KEY,
    event_id      TEXT    NOT NULL,
    actor         TEXT    NOT NULL DEFAULT '',
    actor_role    TEXT,
    action_type   TEXT    NOT NULL,
    description   TEXT    NOT NULL,
    metadata_json TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS event_messages (
    id              TEXT    PRIMARY KEY,
    event_id        TEXT    NOT NULL,
    guest_id        TEXT,
    template_type   TEXT    NOT NULL
                    CHECK(template_type IN ('invitation','reminder_48h','day_of','thank_you','custom')),
    channel         TEXT    NOT NULL DEFAULT 'whatsapp',
    recipient_phone TEXT    NOT NULL DEFAULT '',
    recipient_name  TEXT    NOT NULL DEFAULT '',
    body            TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'queued'
                    CHECK(status IN ('queued','sent','delivered','read','failed')),
    scheduled_for   TEXT,
    sent_at         TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS guest_portal_tokens (
    token      TEXT    PRIMARY KEY,
    event_id   TEXT    NOT NULL UNIQUE,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          TEXT    PRIMARY KEY,
    venue_id    TEXT    NOT NULL,
    target_role TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    body        TEXT    NOT NULL,
    type        TEXT    NOT NULL DEFAULT 'info',
    page        TEXT,
    read        INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_cocktail_menus (
    id          TEXT    PRIMARY KEY,
    event_id    TEXT    NOT NULL UNIQUE,
    venue_id    TEXT    NOT NULL,
    menu_name   TEXT,
    menu_json   TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved')),
    created_by  TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );
`);

// CI MODULE ADDITION — Cocktail Intelligence tables (9 new tables, no existing tables modified)
db.exec(`
  CREATE TABLE IF NOT EXISTS cocktail_intelligence_dna (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id             TEXT NOT NULL,
    venue_name           TEXT NOT NULL,
    venue_type           TEXT,
    atmosphere           TEXT,
    cuisine_style        TEXT,
    audience_age_min     INTEGER,
    audience_age_max     INTEGER,
    audience_type        TEXT,
    staff_skill          TEXT,
    equipment_json       TEXT,
    glassware_json       TEXT,
    is_kosher            TEXT,
    flavor_identity_json TEXT,
    price_range          TEXT,
    service_pressure     TEXT,
    hero_ingredient      TEXT,
    created_at           TEXT DEFAULT (datetime('now')),
    updated_at           TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cocktail_rejections (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id              TEXT NOT NULL,
    cocktail_name         TEXT NOT NULL,
    cocktail_profile_json TEXT,
    reasons_json          TEXT NOT NULL,
    rejected_by           TEXT,
    rejected_at           TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cocktail_taste_dna (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id                 TEXT NOT NULL UNIQUE,
    rejected_flavors_json    TEXT,
    rejected_spirits_json    TEXT,
    rejected_complexity_json TEXT,
    approved_flavors_json    TEXT,
    approved_spirits_json    TEXT,
    pattern_notes_json       TEXT,
    updated_at               TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cocktail_sales (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id      TEXT NOT NULL,
    cocktail_id   INTEGER,
    cocktail_name TEXT NOT NULL,
    sale_date     TEXT NOT NULL,
    period_type   TEXT NOT NULL DEFAULT 'day',
    units_sold    INTEGER NOT NULL DEFAULT 0,
    sale_price    REAL,
    cost_per_unit REAL,
    revenue       REAL,
    gross_profit  REAL,
    gp_percent    REAL,
    created_at    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (cocktail_id) REFERENCES cocktails(id)
  );

  CREATE TABLE IF NOT EXISTS cocktail_narratives (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id         TEXT NOT NULL,
    cocktail_id      INTEGER,
    cocktail_name    TEXT NOT NULL,
    menu_description TEXT,
    server_script    TEXT,
    story_card       TEXT,
    generated_at     TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (cocktail_id) REFERENCES cocktails(id)
  );

  CREATE TABLE IF NOT EXISTS cocktail_scores (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id           TEXT NOT NULL,
    cocktail_id        INTEGER,
    cocktail_name      TEXT NOT NULL,
    flavor_balance     REAL,
    menu_fit           REAL,
    profit_score       REAL,
    prep_complexity    REAL,
    staff_execution    REAL,
    guest_appeal       REAL,
    originality        REAL,
    seasonal_fit       REAL,
    speed_of_service   REAL,
    kosher_readiness   REAL,
    premium_perception REAL,
    overall_score      REAL,
    score_notes_json   TEXT,
    generated_at       TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (cocktail_id) REFERENCES cocktails(id)
  );

  CREATE TABLE IF NOT EXISTS cocktail_trends_db (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id    TEXT,
    category    TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    market      TEXT DEFAULT 'israel',
    tags_json   TEXT,
    is_kosher   INTEGER,
    is_active   INTEGER DEFAULT 1,
    added_by    TEXT,
    added_at    TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cocktail_lifecycle (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id          TEXT NOT NULL,
    cocktail_id       INTEGER,
    cocktail_name     TEXT NOT NULL,
    date_added        TEXT,
    season_added      TEXT,
    times_ordered     INTEGER DEFAULT 0,
    revenue_generated REAL DEFAULT 0,
    cost_per_serve    REAL,
    status            TEXT NOT NULL DEFAULT 'active'
                      CHECK(status IN ('active','seasonal','archived','under_review')),
    last_reviewed_at  TEXT,
    alert_flags_json  TEXT,
    created_at        TEXT DEFAULT (datetime('now')),
    updated_at        TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (cocktail_id) REFERENCES cocktails(id)
  );

  CREATE TABLE IF NOT EXISTS cocktail_emergency_log (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id                TEXT NOT NULL,
    session_date            TEXT NOT NULL,
    missing_items_json      TEXT NOT NULL,
    affected_cocktails_json TEXT,
    decisions_json          TEXT,
    snapshot_json           TEXT,
    created_by              TEXT,
    created_at              TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cocktail_menus (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id    TEXT NOT NULL,
    name        TEXT NOT NULL,
    occasion    TEXT,
    description TEXT,
    season      TEXT,
    created_by  TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    status      TEXT DEFAULT 'active'
  );
`);

// ── Venue Intelligence — Venue Learning Engine + Venue DNA ───────────────────
// One persistent learning session per venue. The conversation accumulates and
// the venue_dna_json column holds HESTIA's evolving understanding of the venue.
db.exec(`
  CREATE TABLE IF NOT EXISTS venue_intelligence (
    venue_id        TEXT PRIMARY KEY,
    stage           TEXT NOT NULL DEFAULT 'story',
    objective       TEXT,
    messages_json   TEXT NOT NULL DEFAULT '[]',
    venue_dna_json  TEXT NOT NULL DEFAULT '{}',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );
`);

// ── Venue Intelligence Bridge — derived specialist briefs ────────────────────
// One row per (venue, brief type). Briefs are regenerated deterministically
// whenever Venue DNA changes and read by specialist systems via a shared service.
db.exec(`
  CREATE TABLE IF NOT EXISTS venue_briefs (
    venue_id     TEXT NOT NULL,
    brief_type   TEXT NOT NULL,
    title        TEXT,
    brief_json   TEXT NOT NULL,
    source_hash  TEXT,
    confidence   INTEGER,
    status       TEXT,
    generated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (venue_id, brief_type)
  );
`);

// ── Operational Intelligence Feed — derived DNA enrichment snapshot ───────────
// Transparent cache of the operational signals + confidence enrichment applied to
// Venue DNA. Derived only — never a duplicate source of operational records.
db.exec(`
  CREATE TABLE IF NOT EXISTS venue_dna_enrichment (
    venue_id        TEXT PRIMARY KEY,
    signals_json    TEXT NOT NULL DEFAULT '{}',
    enrichment_json TEXT NOT NULL DEFAULT '{}',
    generated_at    TEXT DEFAULT (datetime('now'))
  );
`);

// ── New Role + Staff Module Tables ───────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES auth_users(id),
    display_name TEXT NOT NULL,
    gender      TEXT NOT NULL DEFAULT 'M',
    sub_role    TEXT NOT NULL DEFAULT 'waiter',
    joined_date TEXT NOT NULL,
    email       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS food_menus (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id         TEXT,
    name             TEXT NOT NULL,
    menu_type        TEXT,
    story            TEXT,
    status           TEXT NOT NULL DEFAULT 'draft',
    visible_to_staff INTEGER NOT NULL DEFAULT 0,
    created_by       INTEGER,
    fb_approved_at   TEXT,
    owner_approved_at TEXT,
    created_at       TEXT DEFAULT (datetime('now')),
    updated_at       TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS food_dishes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id          INTEGER REFERENCES food_menus(id),
    name             TEXT NOT NULL,
    description      TEXT,
    story            TEXT,
    category         TEXT,
    price_ils        REAL,
    food_cost_ils    REAL,
    food_cost_percent REAL,
    ingredients      TEXT,
    allergens        TEXT,
    created_at       TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS menu_notifications (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    type         TEXT,
    reference_id INTEGER,
    target_role  TEXT,
    message      TEXT,
    is_read      INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS food_sales (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id      TEXT,
    dish_name     TEXT,
    sale_date     TEXT,
    units_sold    INTEGER,
    sale_price    REAL,
    cost_per_unit REAL,
    revenue       REAL,
    gross_profit  REAL,
    gp_percent    REAL,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS employee_shift_constraints (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER REFERENCES employees(id),
    week_start      TEXT,
    submitted_at    TEXT DEFAULT (datetime('now')),
    constraints_json TEXT
  );

  CREATE TABLE IF NOT EXISTS employee_weekly_schedules (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id     TEXT,
    week_start   TEXT,
    published_at TEXT,
    published_by INTEGER,
    shifts_json  TEXT
  );

  CREATE TABLE IF NOT EXISTS employee_shift_notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT,
    employee_id INTEGER,
    week_start  TEXT,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// CI MODULE ADDITION — Visual Menu Builder: one AI image design per cocktail per menu
db.exec(`
  CREATE TABLE IF NOT EXISTS visual_menu_designs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id     INTEGER NOT NULL,
    cocktail_id INTEGER NOT NULL,
    image_prompt TEXT,
    image_url    TEXT,
    status       TEXT DEFAULT 'pending',
    created_at   TEXT DEFAULT (datetime('now')),
    UNIQUE(menu_id, cocktail_id)
  );
`);

// CI MODULE ADDITION — Full menu design output (HESTIA Cocktail Menu Skill v5.2)
// spec_json stores the full Layer-1 AI design spec (added in v5.3 refactor)
try { db.exec("ALTER TABLE ci_menu_full_designs ADD COLUMN spec_json TEXT"); } catch { /* already exists */ }

db.exec(`
  CREATE TABLE IF NOT EXISTS ci_menu_full_designs (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id              INTEGER NOT NULL UNIQUE,
    venue_id             INTEGER NOT NULL,
    version              TEXT    DEFAULT 'hestia-cocktail-menu-v5.2',
    identity_word        TEXT,
    template_base        TEXT,
    creative_territory   TEXT,
    color_system_json    TEXT,
    typography_direction TEXT,
    design_anchors_json  TEXT,
    conceptual_cats_json TEXT,
    menu_html            TEXT,
    menu_css             TEXT,
    flavor_charts_json   TEXT,
    output_context       TEXT,
    language_mode        TEXT,
    generated_at         TEXT    DEFAULT (datetime('now'))
  );
`);

for (const [col, def] of [
  ["severity",    "TEXT DEFAULT 'medium'"],
  ["root_cause",  "TEXT"],
  ["resolved_at", "TEXT"],
  ["updated_at",  "TEXT"],
  ["shift_id",    "TEXT"],
]) {
  try { db.exec(`ALTER TABLE incidents ADD COLUMN ${col} ${def}`); } catch { /* already exists */ }
}

try { db.exec("ALTER TABLE courses ADD COLUMN external_id TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE course_modules ADD COLUMN external_id TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE auth_users ADD COLUMN username TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE auth_users ADD COLUMN password TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE auth_users ADD COLUMN password_hash TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE cocktails ADD COLUMN event_id TEXT"); } catch { /* already exists */ }
// CI MODULE ADDITION — track whether a cocktail was created by Cocktail Intelligence
try { db.exec("ALTER TABLE cocktails ADD COLUMN source TEXT DEFAULT 'classic'"); } catch { /* already exists */ }
// CI MODULE ADDITION — extra DNA fields from UI form (concept, signature style, exclusions, notes, etc.)
try { db.exec("ALTER TABLE cocktail_intelligence_dna ADD COLUMN meta_json TEXT"); } catch { /* already exists */ }
// CI MODULE ADDITION — link cocktails to a named menu
try { db.exec("ALTER TABLE cocktails ADD COLUMN menu_id INTEGER"); } catch { /* already exists */ }
// Staff visibility column for published menus
try { db.exec("ALTER TABLE cocktail_menus ADD COLUMN visible_to_staff INTEGER NOT NULL DEFAULT 0"); } catch { /* already exists */ }
// CI MODULE ADDITION — preserve AI-suggested pricing on approval
try { db.exec("ALTER TABLE cocktails ADD COLUMN estimated_cost_ils REAL"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE cocktails ADD COLUMN suggested_price_ils REAL"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE cocktails ADD COLUMN estimated_gp_percent REAL"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE event_plans ADD COLUMN status TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE event_plans ADD COLUMN approved_by TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE event_plans ADD COLUMN approved_at TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE event_cocktail_menus ADD COLUMN programme_brief_json TEXT"); } catch { /* already exists */ }

// F&B Decision Ledger (Phase 2 — write-only-first foundation). Additive, venue-scoped,
// idempotent table init. DDL is the single source of truth in decisionLedgerService.js
// (shared with the in-memory test). No live route writes to it yet (Phase 3 wires writes).
db.exec(FB_DECISIONS_DDL);

// Venue Intelligence Candidates (Phase 6A — isolated F&B feedback candidate foundation).
// Additive, venue-scoped, idempotent. ISOLATED from canonical Venue DNA: candidates are
// reviewable proposals, NEVER confirmed Venue DNA. Never touches venue_intelligence.
db.exec(VENUE_INTELLIGENCE_CANDIDATES_DDL);
// Phase 7A — human review note column (idempotent migration for pre-existing DBs;
// the DDL above already includes it for fresh DBs). Additive, non-destructive.
try { db.exec("ALTER TABLE venue_intelligence_candidates ADD COLUMN review_note TEXT"); } catch { /* already exists */ }

// shift_reports extended fields
for (const [col, def] of [
  ["flaggedForOwner",   "INTEGER DEFAULT 0"],
  ["highlights",        "TEXT"],
  ["carry_forward_count","INTEGER DEFAULT 0"],
  ["open_count",        "INTEGER DEFAULT 0"],
  ["resolved_count",    "INTEGER DEFAULT 0"],
  ["general_notes",     "TEXT"],
]) {
  try { db.exec(`ALTER TABLE shift_reports ADD COLUMN ${col} ${def}`); } catch { /* already exists */ }
}

// carry_forward_tasks extended fields
for (const [col, def] of [
  ["source",            "TEXT"],
  ["source_report_id",  "TEXT"],
  ["description",       "TEXT"],
]) {
  try { db.exec(`ALTER TABLE carry_forward_tasks ADD COLUMN ${col} ${def}`); } catch { /* already exists */ }
}

migrateAuthUsersRoles();
seedDatabase();
migrateAcademyExternalIds();
migrateUserCredentials();
seedNewUsers();
seedCocktailIntelligence(); // CI MODULE ADDITION — idempotent, skips if already seeded

// Startup role audit — confirms migration ran and shows runtime roles for auth debugging.
try {
  const authUsers = db.prepare("SELECT id, full_name, role, is_active FROM auth_users ORDER BY id").all();
  console.log('[HESTIA] Auth user roles after startup migrations:');
  for (const u of authUsers) {
    console.log(`  id=${u.id} | ${u.full_name} | role=${u.role} | active=${u.is_active}`);
  }
} catch (e) {
  console.warn('[HESTIA] Could not read auth_users for role audit:', e.message);
}

// Phase 5 Step 1: add roles_json column to notifications table so frontend-created
// multi-role notifications can be stored and retrieved per-role from the backend.
// Idempotent — safe to run on every startup.
try { db.exec("ALTER TABLE notifications ADD COLUMN roles_json TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE food_dishes ADD COLUMN tags_json TEXT"); } catch { /* already exists */ }

// ZOHAR Design Intelligence — creative direction inputs (Phase 1 Finalization)
try { db.exec("ALTER TABLE venues ADD COLUMN description TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE events ADD COLUMN aesthetic_subgenre TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE events ADD COLUMN single_sentence TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE events ADD COLUMN anti_reference TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE events ADD COLUMN venue_character TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE events ADD COLUMN primary_impact_moment TEXT"); } catch { /* already exists */ }
try { db.exec("ALTER TABLE events ADD COLUMN confirmed_mood_keywords TEXT"); } catch { /* already exists */ }

// AI-generated creative images per event (hero + per-cocktail)
try {
  db.exec(`CREATE TABLE IF NOT EXISTS event_creative_images (
    id            TEXT PRIMARY KEY,
    event_id      TEXT NOT NULL,
    image_type    TEXT NOT NULL CHECK(image_type IN ('hero','cocktail')),
    cocktail_id   TEXT,
    cocktail_name TEXT,
    prompt        TEXT,
    image_path    TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
} catch { /* already exists */ }

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Legacy / bootstrap fallback venue id. Phase 8: this is NO LONGER used inside
// request handlers (they use req.venueId, resolved per request from the operator's
// venue membership). It remains the canonical seed venue id and the ultimate
// fallback for empty installs / platform-admin contexts with no venues yet.
function defaultVenueId() {
  return "venue-main";
}

// ── Phase 8: Multi-Venue access resolution ──────────────────────────────────
// A venue is the memory unit; a user is the operator. The platform role 'admin'
// means Platform Admin / HESTIA Admin (manages HESTIA itself) — NOT a venue admin.
// Platform Admin can see every venue for support/debug; all other roles see only
// the venues they are members of (venue_members.active = 1).

// All venue ids a user may access. Platform Admin → all venues; everyone else →
// their active memberships.
function venuesForUser(user) {
  if (user?.role === "admin") {
    return db.prepare("SELECT id FROM venues ORDER BY created_at ASC").all().map(r => r.id);
  }
  return db.prepare(
    "SELECT venue_id FROM venue_members WHERE user_id = ? AND active = 1 ORDER BY created_at ASC"
  ).all(user?.id).map(r => r.venue_id);
}

// The user's default venue when no explicit venue is requested: their first
// accessible venue, falling back to the bootstrap venue for empty installs.
function defaultVenueForUser(user) {
  const list = venuesForUser(user);
  return list[0] || defaultVenueId();
}

// Resolve the venue context for a request.
//  - Missing X-HESTIA-Venue header        → silent fallback to the user's default
//                                            venue (preserves legacy single-venue
//                                            behavior; zero friction).
//  - Present but NOT accessible to the user → throws { status: 403 }. We never
//    silently fall back on an explicit-but-unauthorized selection: doing so could
//    make the UI believe it operates on Venue B while the backend writes Venue A.
function resolveVenueId(req) {
  const requested = req.header("X-HESTIA-Venue");
  if (!requested) return defaultVenueForUser(req.user);
  const allowed = venuesForUser(req.user);
  if (allowed.includes(requested)) return requested;
  const err = new Error("You do not have access to the requested venue.");
  err.status = 403;
  throw err;
}

function seedDatabase() {
  const SEED_USERS = [
    { id: 1, full_name: "Toam Griffel",  role: "admin",       access_code: "TG001", username: "Toam Griffel",  can_manage_cocktails: 1 },
    { id: 2, full_name: "Tal Millo",     role: "owner",       access_code: "TM002", username: "Tal Millo",     can_manage_cocktails: 0 },
    { id: 3, full_name: "Omer Sadot",    role: "bar_manager", access_code: "OS003", username: "Omer Sadot",    can_manage_cocktails: 1 },
    { id: 4, full_name: "Peleg Naim",    role: "manager",     access_code: "PN004", username: "Peleg Naim",    can_manage_cocktails: 0 },
    { id: 5, full_name: "Saar Wax",      role: "bar_manager", access_code: "SW005", username: "Saar Wax",      can_manage_cocktails: 1 },
    { id: 6, full_name: "Hadar Vaknin",  role: "employee",    access_code: "HV006", username: "Hadar Vaknin",  can_manage_cocktails: 0 },
    { id: 7, full_name: "Zohar Zach",    role: "manager",     access_code: "ZZ007", username: "Zohar Zach",    can_manage_cocktails: 0 },
  ];
  const existingVenue = db.prepare("SELECT id FROM venues WHERE id = ?").get(defaultVenueId());
  if (!existingVenue) {
    db.prepare("INSERT INTO venues (id, name, venue_type, created_at) VALUES (?, ?, ?, ?)").run(
      defaultVenueId(),
      "HESTIA Flagship Venue",
      "premium-restaurant-events",
      nowIso()
    );
  }

  const authUsersCount = db.prepare("SELECT COUNT(*) as count FROM auth_users").get().count;
  if (!authUsersCount) {
    const insertAuthUser = db.prepare(
      "INSERT OR IGNORE INTO auth_users (id, full_name, role, access_code) VALUES (?, ?, ?, ?)"
    );
    for (const u of SEED_USERS) {
      insertAuthUser.run(u.id, u.full_name, u.role, u.access_code);
    }
  }

  // Phase 8 backfill — preserve single-venue behavior. If no venue memberships
  // exist yet, grant every authenticated (non platform-admin) user membership of
  // the bootstrap venue, using their platform role as the venue role. After this,
  // every legacy user resolves to venue-main with or without the X-HESTIA-Venue
  // header — identical to pre-Phase-8 behavior, zero friction. Runs after
  // auth_users seeding so the rows exist on a fresh database.
  try {
    const memberCount = db.prepare("SELECT COUNT(*) AS count FROM venue_members").get().count;
    if (!memberCount) {
      const authUsers = db.prepare("SELECT id, role FROM auth_users").all();
      const insertMember = db.prepare(
        "INSERT OR IGNORE INTO venue_members (user_id, venue_id, venue_role, active, created_at) VALUES (?, ?, ?, 1, ?)"
      );
      const seedNow = nowIso();
      for (const u of authUsers) {
        // Platform admins ('admin') are not venue members — they see all venues
        // (see venuesForUser). Everyone else is seeded into the bootstrap venue.
        if (u.role === "admin") continue;
        insertMember.run(u.id, defaultVenueId(), u.role, seedNow);
      }
    }
  } catch (e) {
    console.warn("[HESTIA Phase 8] venue_members backfill skipped:", e.message);
  }

  const insertHospiaUser = db.prepare(
    "INSERT OR IGNORE INTO hospia_users (id, username, password, role, venue, team, can_manage_cocktails, disabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const now = nowIso();
  for (const u of SEED_USERS) {
    insertHospiaUser.run(
      `huser-${u.id}`, u.username, u.access_code, u.role,
      "Main Venue", "Front of House", u.can_manage_cocktails, 0, now, now
    );
  }

  const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get().count;
  if (!courseCount) {
    const insertCourse = db.prepare(
      "INSERT INTO courses (external_id, title, category, description, role_target) VALUES (?, ?, ?, ?, ?)"
    );
    const insertModule = db.prepare(
      "INSERT INTO course_modules (course_id, external_id, title, content, order_index) VALUES (?, ?, ?, ?, ?)"
    );
    for (const academy of UNIVERSITY_MANIFEST) {
      const courseResult = insertCourse.run(
        academy.id,
        academy.title || academy.id,
        academy.category || null,
        academy.description || null,
        academy.role_target || null
      );
      const courseId = courseResult.lastInsertRowid;
      if (Array.isArray(academy.lessons)) {
        academy.lessons.forEach((lesson, idx) => {
          insertModule.run(courseId, lesson.id, lesson.title || lesson.id, lesson.objective || null, idx);
        });
      }
    }
  }

  const cocktailCount = db.prepare("SELECT COUNT(*) as count FROM cocktails").get().count;
  if (!cocktailCount) {
    const insertCocktail = db.prepare(`
      INSERT INTO cocktails (name, category, description, base_spirit, glass_type, garnish, method, tags_json, ingredients_text_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of cocktailLibrary) {
      insertCocktail.run(
        c.name,
        c.family || null,
        c.story || null,
        null,
        c.glassware || null,
        c.garnish || null,
        c.method || null,
        JSON.stringify(c.tags || []),
        JSON.stringify(c.ingredients || [])
      );
    }
  }
}

function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization required." });
    }
    const token = authHeader.slice(7);
    const session = db.prepare(`
      SELECT s.token, u.id, u.full_name, u.role
      FROM sessions s
      JOIN auth_users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now') AND u.is_active = 1
    `).get(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }
    req.user = { id: session.id, full_name: session.full_name, role: session.role };
    req.hospiaRole = session.role;
    if (allowedRoles.length > 0 && session.role !== "admin" && !allowedRoles.includes(session.role)) {
      console.warn(`[HESTIA AUTH] 403 | user=${session.id} (${session.full_name}) | role=${session.role} | required=${allowedRoles.join(',')} | ${req.method} ${req.path}`);
      return res.status(403).json({ error: "Forbidden.", required: allowedRoles, received: session.role });
    }
    // Phase 8: resolve the venue memory context for this request. Missing header
    // falls back to the user's default venue; an explicit-but-unauthorized venue
    // is rejected (403) rather than silently redirected to another venue.
    //
    // Exception: the bootstrap/discovery endpoints (auth/me and the venue list)
    // must always succeed so the client can recover from a stale venue header
    // (e.g. a venue the user just lost access to, or another user's leftover
    // selection on a shared browser). For those, an invalid venue falls back
    // instead of 403 — they never read venue-scoped business data.
    const isVenueBootstrap = (req.path === "/api/auth/me") ||
                             (req.method === "GET" && req.path === "/api/venues");
    try {
      req.venueId = resolveVenueId(req);
    } catch (e) {
      if (e.status === 403 && isVenueBootstrap) {
        req.venueId = defaultVenueForUser(req.user);
      } else if (e.status === 403) {
        console.warn(`[HESTIA VENUE] 403 | user=${session.id} (${session.full_name}) | requested=${req.header("X-HESTIA-Venue")} | ${req.method} ${req.path}`);
        return res.status(403).json({ error: e.message || "Venue access denied." });
      } else {
        return res.status(500).json({ error: "Could not resolve venue context." });
      }
    }
    next();
  };
}

// Verified price endpoints: role-based gate (bar_manager, owner, admin)
function requireVerifiedPriceAccess(req, res, next) {
  return requireAuth("bar_manager", "owner", "admin")(req, res, next);
}

function migrateAcademyExternalIds() {
  const updateCourse = db.prepare(
    "UPDATE courses SET external_id = ? WHERE title = ? AND (external_id IS NULL OR external_id = '')"
  );
  const updateModule = db.prepare(`
    UPDATE course_modules SET external_id = ?
    WHERE title = ? AND course_id = (SELECT id FROM courses WHERE external_id = ?)
      AND (external_id IS NULL OR external_id = '')
  `);
  for (const academy of UNIVERSITY_MANIFEST) {
    updateCourse.run(academy.id, academy.title || academy.id);
    if (Array.isArray(academy.lessons)) {
      for (const lesson of academy.lessons) {
        updateModule.run(lesson.id, lesson.title || lesson.id, academy.id);
      }
    }
  }
}

function migrateUserCredentials() {
  // Seeds usernames and password hashes for the original 7 seed accounts only.
  // Only fills gaps — NEVER overwrites existing username or password_hash values.
  // NOTE: The 'password' column in auth_users is a legacy bridge field and is NOT used for login.
  //       Login only checks auth_users.password_hash via bcrypt. See /api/auth/login.
  // TODO: Remove the plaintext 'password' column from auth_users in a future migration.
  const SEED_DEFAULT_PASSWORD = "hestia123"; // dev seed default only — not a production secret
  const seedAccounts = [
    { id: 1, username: "toam"  },
    { id: 2, username: "tal"   },
    { id: 3, username: "omer"  },
    { id: 4, username: "peleg" },
    { id: 5, username: "saar"  },
    { id: 6, username: "hadar" },
    { id: 7, username: "zohar" },
  ];

  // Force-set canonical short usernames for the 7 original seed accounts (corrects any "Full Name" drift)
  const setUsername = db.prepare(
    "UPDATE auth_users SET username = ? WHERE id = ? AND LOWER(COALESCE(username,'')) != ?"
  );
  const writeHash = db.prepare(
    "UPDATE auth_users SET password_hash = ? WHERE id = ? AND password_hash IS NULL"
  );

  for (const u of seedAccounts) {
    setUsername.run(u.username, u.id, u.username.toLowerCase());
    // Only create a password_hash if one does not already exist.
    // NEVER overwrites an existing hash — this protects passwords changed after first seed.
    const row = db.prepare("SELECT password_hash FROM auth_users WHERE id = ?").get(u.id);
    if (row && !row.password_hash) {
      writeHash.run(bcrypt.hashSync(SEED_DEFAULT_PASSWORD, 10), u.id);
    }
  }
  // REMOVED: DELETE FROM auth_users WHERE id > 7
  // User-created accounts (id > 7) must survive server restarts.
}

// Safe local dev password reset for username "toam".
// Runs ONLY when RESET_TOAM_PASSWORD env var is present at startup.
// Never hardcodes a password. Never logs the password value.
// PowerShell usage: $env:RESET_TOAM_PASSWORD="your-new-password"; npm run dev
function resetDevPasswordFromEnv() {
  const rawPassword = process.env.RESET_TOAM_PASSWORD;
  if (!rawPassword) return;
  const hash = bcrypt.hashSync(rawPassword, 10);
  const result = db.prepare(
    "UPDATE auth_users SET password_hash = ? WHERE LOWER(username) = 'toam'"
  ).run(hash);
  if (result.changes > 0) {
    console.log("[HESTIA] Local dev password reset applied for username: toam");
  } else {
    console.warn("[HESTIA] Dev password reset: username 'toam' not found in auth_users.");
  }
}

function reportRow(row) {
  return {
    id: row.id,
    shift_date: row.shift_date,
    manager_name: row.manager_name || "",
    shift_summary: row.shift_summary || "",
    highlights: row.highlights || "",
    complaints: row.complaints || "",
    service_recovery: row.service_recovery || "",
    staff_issues: row.staff_issues || "",
    sales_notes: row.sales_notes || "",
    urgent_items: row.urgent_items || "",
    general_notes: row.general_notes || "",
    flaggedForOwner: Boolean(row.flaggedForOwner),
    carry_forward_count: row.carry_forward_count || 0,
    open_count: row.open_count || 0,
    resolved_count: row.resolved_count || 0,
    submitted_at: row.submitted_at
  };
}

function actionRow(row) {
  return {
    ...row,
    done: Boolean(row.done)
  };
}

async function askGemini(prompt, { jsonMode = false } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env.");

  const messages = jsonMode
    ? [
        { role: "system", content: "You are a JSON generation assistant. Respond with valid JSON only. No markdown, no explanation." },
        { role: "user", content: prompt },
      ]
    : [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ];

  const body = { model: "gpt-4o-mini", messages };
  if (jsonMode) body.response_format = { type: "json_object" };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data.error?.message || "OpenAI request failed.";
    console.error("[OPENAI ERROR]", JSON.stringify(data));
    if (/api.?key|key.*invalid|invalid.*key/i.test(msg)) {
      throw new Error("AI generation is unavailable — the server API key is missing or invalid. Please contact your administrator.");
    }
    throw new Error(msg);
  }

  const text = data.choices?.[0]?.message?.content || "";

  if (jsonMode && text) {
    try {
      JSON.parse(text);
    } catch {
      const repaired = text.replace(/,(\s*[}\]])/g, '$1');
      try {
        JSON.parse(repaired);
        return repaired;
      } catch {
        console.warn("OPENAI JSON MODE: response could not be repaired server-side.");
      }
    }
    return text;
  }

  return text || "No answer generated.";
}

app.post("/api/gemini", requireAuth("manager", "bar_manager", "owner", "admin", "events_manager"), async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    const jsonMode = Boolean(req.body?.json_mode);
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const answer = await askGemini(prompt, { jsonMode });
    res.json({ answer });
  } catch (error) {
    console.log("GEMINI PROXY ERROR:", error);
    res.status(500).json({ error: error.message || "Gemini request failed." });
  }
});

app.post("/api/auth/login", (req, res) => {
  const username = String(req.body?.username || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!username || !password) return res.status(400).json({ error: "Username and password required." });
  const user = db.prepare(
    "SELECT * FROM auth_users WHERE LOWER(username) = ? AND is_active = 1"
  ).get(username);
  if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  const token = randomUUID();
  // MVP: 7-day expiry so stored tokens survive across sessions.
  // The 30-minute client-side idle timeout is the primary logout mechanism.
  // Reduce back to 24h once httpOnly-cookie auth hardening is in place.
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    token, user.id, nowIso(), expiresAt
  );
  const userResp = { id: user.id, full_name: user.full_name, role: user.role };
  if (user.role === 'employee') {
    const emp = db.prepare('SELECT sub_role FROM employees WHERE user_id=?').get(user.id);
    if (emp) userResp.sub_role = emp.sub_role;
  }
  res.json({ ok: true, token, user: userResp });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(authHeader.slice(7));
  }
  res.json({ ok: true });
});

// Validates the stored session token and returns the current user profile.
// Used by the frontend for silent session restore on app load.
app.get("/api/auth/me", requireAuth(), (req, res) => {
  const userResp = { id: req.user.id, full_name: req.user.full_name, role: req.user.role };
  if (req.user.role === "employee") {
    const emp = db.prepare("SELECT sub_role FROM employees WHERE user_id = ?").get(req.user.id);
    if (emp?.sub_role) userResp.sub_role = emp.sub_role;
  }
  res.json({ ok: true, user: userResp });
});

app.get("/api/shift-reports", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM shift_reports
    WHERE venue_id = ?
    ORDER BY submitted_at DESC
    LIMIT 50
  `).all(req.venueId);

  res.json({ reports: rows.map(reportRow) });
});

app.post("/api/shift-reports", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const clientId = String(req.body.id || "").trim();
  const report = {
    id: clientId || id("eod"),
    venue_id: req.venueId,
    shift_date: String(req.body.shift_date || new Date().toISOString().slice(0, 10)),
    manager_name: String(req.body.manager_name || ""),
    shift_summary: String(req.body.shift_summary || ""),
    highlights: String(req.body.highlights || ""),
    complaints: String(req.body.complaints || ""),
    service_recovery: String(req.body.service_recovery || ""),
    staff_issues: String(req.body.staff_issues || ""),
    sales_notes: String(req.body.sales_notes || ""),
    urgent_items: String(req.body.urgent_items || ""),
    general_notes: String(req.body.general_notes || ""),
    flaggedForOwner: req.body.flaggedForOwner ? 1 : 0,
    carry_forward_count: Number(req.body.carry_forward_count) || 0,
    open_count: Number(req.body.open_count) || 0,
    resolved_count: Number(req.body.resolved_count) || 0,
    submitted_at: nowIso()
  };

  db.prepare(`
    INSERT OR IGNORE INTO shift_reports (
      id, venue_id, shift_date, manager_name, shift_summary, highlights, complaints,
      service_recovery, staff_issues, sales_notes, urgent_items, general_notes,
      flaggedForOwner, carry_forward_count, open_count, resolved_count, submitted_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    report.id,
    report.venue_id,
    report.shift_date,
    report.manager_name,
    report.shift_summary,
    report.highlights,
    report.complaints,
    report.service_recovery,
    report.staff_issues,
    report.sales_notes,
    report.urgent_items,
    report.general_notes,
    report.flaggedForOwner,
    report.carry_forward_count,
    report.open_count,
    report.resolved_count,
    report.submitted_at
  );

  if (report.urgent_items || report.complaints) {
    db.prepare("INSERT INTO business_memory (id, venue_id, type, title, detail, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id("memory"),
      req.venueId,
      report.complaints ? "alert" : "report",
      `End Of Day submitted by ${report.manager_name || "Manager"}`,
      report.urgent_items || report.complaints || report.shift_summary || "Shift report submitted.",
      report.shift_date,
      report.submitted_at
    );
  }

  res.status(201).json({ report: reportRow(report) });
});

app.get("/api/business-memory", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT id, type, title, detail, event_date AS date, created_at
    FROM business_memory
    WHERE venue_id = ?
    ORDER BY created_at DESC
    LIMIT 80
  `).all(req.venueId);

  res.json({ memory: rows });
});

app.get("/api/actions", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT id, priority, title, owner, due, signal, page, done, created_at, updated_at
    FROM actions
    WHERE venue_id = ?
    ORDER BY done ASC, created_at DESC
  `).all(req.venueId);

  res.json({ actions: rows.map(actionRow) });
});

app.post("/api/actions", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const action = {
    id: req.body.id || id("action"),
    venue_id: req.venueId,
    priority: String(req.body.priority || "normal"),
    title: String(req.body.title || "Untitled action"),
    owner: String(req.body.owner || req.body.assignedPerson || "Manager"),
    due: String(req.body.due || req.body.dueDate || "This week"),
    signal: String(req.body.signal || req.body.sourceSignal || "Manual"),
    page: String(req.body.page || "actionBoard"),
    done: req.body.done ? 1 : 0,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  const existing = db.prepare("SELECT id FROM actions WHERE id = ?").get(action.id);
  if (existing) {
    db.prepare("UPDATE actions SET priority=?, title=?, owner=?, due=?, signal=?, page=?, done=?, updated_at=? WHERE id=? AND venue_id=?").run(
      action.priority, action.title, action.owner, action.due, action.signal, action.page, action.done, nowIso(), action.id, req.venueId
    );
  } else {
    db.prepare(`
      INSERT INTO actions (id, venue_id, priority, title, owner, due, signal, page, done, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(action.id, action.venue_id, action.priority, action.title, action.owner, action.due, action.signal, action.page, action.done, action.created_at, action.updated_at);
  }

  res.status(201).json({ action: actionRow({ ...action, done: Boolean(action.done) }) });
});

app.patch("/api/actions/:id", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const done = req.body.done ? 1 : 0;
  db.prepare("UPDATE actions SET done = ?, updated_at = ? WHERE id = ? AND venue_id = ?").run(
    done,
    nowIso(),
    req.params.id,
    req.venueId
  );

  const row = db.prepare("SELECT id, priority, title, owner, due, signal, page, done, created_at, updated_at FROM actions WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Action not found." });
  res.json({ action: actionRow(row) });
});

app.get("/api/incidents", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT id, venue_id, type, description, table_number, resolved, resolution,
           compensation, reported_by, shift_date, created_at,
           severity, root_cause, resolved_at, updated_at, shift_id
    FROM incidents WHERE venue_id = ? ORDER BY created_at DESC LIMIT 100
  `).all(req.venueId);
  res.json({ incidents: rows.map(r => ({ ...r, resolved: Boolean(r.resolved) })) });
});

app.post("/api/incidents", requireAuth("manager", "bar_manager", "employee", "admin"), (req, res) => {
  const incident = {
    id: req.body.id || id("incident"),
    venue_id: req.venueId,
    type: String(req.body.type || "service"),
    description: String(req.body.description || ""),
    table_number: String(req.body.table_number || req.body.tableNumber || ""),
    resolved: req.body.resolved ? 1 : 0,
    resolution: String(req.body.resolution || ""),
    compensation: String(req.body.compensation || ""),
    reported_by: String(req.body.reported_by || req.body.reportedBy || ""),
    shift_date: String(req.body.shift_date || req.body.date || new Date().toISOString().slice(0, 10)),
    severity: String(req.body.severity || "medium"),
    root_cause: req.body.root_cause ? String(req.body.root_cause) : null,
    shift_id: req.body.shift_id ? String(req.body.shift_id) : null,
    resolved_at: null,
    updated_at: nowIso(),
    created_at: nowIso()
  };

  db.prepare(`
    INSERT OR IGNORE INTO incidents (id, venue_id, type, description, table_number, resolved, resolution, compensation, reported_by, shift_date, created_at, severity, root_cause, shift_id, resolved_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(incident.id, incident.venue_id, incident.type, incident.description, incident.table_number, incident.resolved, incident.resolution, incident.compensation, incident.reported_by, incident.shift_date, incident.created_at, incident.severity, incident.root_cause, incident.shift_id, incident.resolved_at, incident.updated_at);

  db.prepare("INSERT INTO business_memory (id, venue_id, type, title, detail, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    id("memory"), req.venueId, "alert",
    `Service incident reported: ${incident.type}`,
    incident.description || "Service incident logged.",
    incident.shift_date, incident.created_at
  );

  res.status(201).json({ incident: { ...incident, resolved: Boolean(incident.resolved) } });
});

app.patch("/api/incidents/:id", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const fields = [];
  const values = [];

  if (req.body.resolved !== undefined)    { fields.push("resolved = ?");    values.push(req.body.resolved ? 1 : 0); }
  if (req.body.resolution !== undefined)  { fields.push("resolution = ?");  values.push(String(req.body.resolution)); }
  if (req.body.resolved_at !== undefined) { fields.push("resolved_at = ?"); values.push(String(req.body.resolved_at)); }
  if (req.body.severity !== undefined)    { fields.push("severity = ?");    values.push(String(req.body.severity)); }
  if (req.body.root_cause !== undefined)  { fields.push("root_cause = ?");  values.push(String(req.body.root_cause)); }
  if (req.body.shift_id !== undefined)    { fields.push("shift_id = ?");    values.push(String(req.body.shift_id)); }

  if (!fields.length) {
    return res.status(400).json({ error: "No valid fields provided." });
  }

  fields.push("updated_at = ?");
  values.push(nowIso());

  db.prepare(`UPDATE incidents SET ${fields.join(", ")} WHERE id = ? AND venue_id = ?`).run(
    ...values, req.params.id, req.venueId
  );

  const row = db.prepare(`
    SELECT id, venue_id, type, description, table_number, resolved, resolution,
           compensation, reported_by, shift_date, created_at,
           severity, root_cause, resolved_at, updated_at, shift_id
    FROM incidents WHERE id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: "Incident not found." });
  res.json({ incident: { ...row, resolved: Boolean(row.resolved) } });
});

app.post("/api/business-memory", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const clientId = String(req.body.id || "").trim();
  const entry = {
    id: clientId || id("memory"),
    venue_id: req.venueId,
    type: String(req.body.type || "note"),
    title: String(req.body.title || ""),
    detail: String(req.body.detail || ""),
    event_date: String(req.body.event_date || req.body.date || new Date().toISOString().slice(0, 10)),
    created_at: nowIso()
  };

  db.prepare("INSERT OR IGNORE INTO business_memory (id, venue_id, type, title, detail, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    entry.id, entry.venue_id, entry.type, entry.title, entry.detail, entry.event_date, entry.created_at
  );

  res.status(201).json({ entry });
});

app.get("/api/notes", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM notes WHERE venue_id = ? AND archived = 0 ORDER BY pinned DESC, created_at DESC LIMIT 50
  `).all(req.venueId);
  res.json({ notes: rows.map(r => ({ ...r, pinned: Boolean(r.pinned), archived: Boolean(r.archived) })) });
});

app.post("/api/notes", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const note = {
    id: id("note"),
    venue_id: req.venueId,
    content: String(req.body.content || ""),
    tag: String(req.body.tag || "reminder"),
    pinned: req.body.pinned ? 1 : 0,
    archived: 0,
    created_by: String(req.body.created_by || ""),
    created_at: nowIso(),
    updated_at: nowIso()
  };

  db.prepare(`
    INSERT INTO notes (id, venue_id, content, tag, pinned, archived, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(note.id, note.venue_id, note.content, note.tag, note.pinned, note.archived, note.created_by, note.created_at, note.updated_at);

  res.status(201).json({ note: { ...note, pinned: Boolean(note.pinned), archived: Boolean(note.archived) } });
});

app.patch("/api/notes/:id", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const fields = [];
  const values = [];

  if (req.body.pinned !== undefined) { fields.push("pinned = ?"); values.push(req.body.pinned ? 1 : 0); }
  if (req.body.archived !== undefined) { fields.push("archived = ?"); values.push(req.body.archived ? 1 : 0); }
  if (req.body.content !== undefined) { fields.push("content = ?"); values.push(String(req.body.content)); }
  if (req.body.tag !== undefined) { fields.push("tag = ?"); values.push(String(req.body.tag)); }
  fields.push("updated_at = ?");
  values.push(nowIso());

  db.prepare(`UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND venue_id = ?`).run(...values, req.params.id, req.venueId);

  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Note not found." });
  res.json({ note: { ...row, pinned: Boolean(row.pinned), archived: Boolean(row.archived) } });
});

// ─── Shift Lifecycle ──────────────────────────────────────────────────────────

app.post("/api/shifts", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const existing = db.prepare(
    "SELECT id FROM shifts WHERE venue_id = ? AND status = 'open'"
  ).get(req.venueId);
  if (existing) {
    return res.status(409).json({
      error: "A shift is already open. Close it before opening a new one.",
      shift_id: existing.id
    });
  }

  const managerName = String(req.body.manager_name || "Manager").trim();
  const managerId   = String(req.body.manager_id   || "unknown").trim();
  if (!managerName) return res.status(400).json({ error: "manager_name is required." });

  const shift = {
    id:           id("shift"),
    venue_id:     req.venueId,
    manager_id:   managerId,
    manager_name: managerName,
    opened_at:    nowIso(),
    status:       "open",
    created_at:   nowIso()
  };

  db.prepare(`
    INSERT INTO shifts (id, venue_id, manager_id, manager_name, opened_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(shift.id, shift.venue_id, shift.manager_id, shift.manager_name, shift.opened_at, shift.status, shift.created_at);

  res.status(201).json({ shift });
});

app.get("/api/shifts/current", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const shift = db.prepare(
    "SELECT * FROM shifts WHERE venue_id = ? AND status = 'open' ORDER BY opened_at DESC LIMIT 1"
  ).get(req.venueId);
  res.json({ shift: shift || null });
});

app.get("/api/shifts/last-handover", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const shift = db.prepare(
    "SELECT * FROM shifts WHERE venue_id = ? AND status = 'closed' ORDER BY closed_at DESC LIMIT 1"
  ).get(req.venueId);
  if (!shift) {
    return res.json({ shift: null, tasks: [], unresolvedIncidents: [] });
  }
  const tasks = db.prepare(
    "SELECT * FROM carry_forward_tasks WHERE venue_id = ? AND status = 'open' ORDER BY created_at ASC"
  ).all(req.venueId);
  const unresolvedIncidents = db.prepare(
    "SELECT id, type, description, severity, shift_date FROM incidents WHERE shift_id = ? AND resolved = 0"
  ).all(shift.id);
  res.json({ shift, tasks, unresolvedIncidents });
});

app.post("/api/shifts/:id/briefing", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  let briefing = String(req.body.briefing || "").trim();

  const notStartedUsers = db.prepare(`
    SELECT DISTINCT u.full_name
    FROM auth_users u
    WHERE u.is_active = 1
      AND u.role = 'employee'
      AND NOT EXISTS (
        SELECT 1 FROM staff_progress sp WHERE sp.user_id = u.id AND sp.status = 'completed'
      )
    ORDER BY u.full_name ASC
    LIMIT 5
  `).all();
  if (notStartedUsers.length > 0) {
    const names = notStartedUsers.map(u => u.full_name).join(", ");
    briefing = briefing
      ? `${briefing}\n\n[Training Note] Staff with no completed academy modules: ${names}.`
      : `[Training Note] Staff with no completed academy modules: ${names}.`;
  }

  db.prepare("UPDATE shifts SET briefing = ? WHERE id = ? AND venue_id = ?")
    .run(briefing, req.params.id, req.venueId);
  const shift = db.prepare("SELECT * FROM shifts WHERE id = ?").get(req.params.id);
  if (!shift) return res.status(404).json({ error: "Shift not found." });
  res.json({ shift });
});

app.post("/api/shifts/:id/close", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const summary     = String(req.body.summary || "").trim();
  const cover_count = req.body.cover_count != null ? Number(req.body.cover_count) : null;
  const closed_at   = nowIso();

  db.prepare(
    "UPDATE shifts SET status = 'closed', closed_at = ?, summary = ?, cover_count = ? WHERE id = ? AND venue_id = ?"
  ).run(closed_at, summary, cover_count, req.params.id, req.venueId);

  const shift = db.prepare("SELECT * FROM shifts WHERE id = ?").get(req.params.id);
  if (!shift) return res.status(404).json({ error: "Shift not found." });
  res.json({ shift });
});

app.post("/api/shifts/:id/handover", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const message = String(req.body.message || "").trim();
  db.prepare("UPDATE shifts SET handover_notes = ? WHERE id = ? AND venue_id = ?")
    .run(message, req.params.id, req.venueId);
  const shift = db.prepare("SELECT * FROM shifts WHERE id = ?").get(req.params.id);
  if (!shift) return res.status(404).json({ error: "Shift not found." });
  res.json({ shift });
});

// ─── Carry-Forward Tasks ──────────────────────────────────────────────────────

app.get("/api/tasks", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const status = req.query.status;
  const rows = status
    ? db.prepare(
        "SELECT * FROM carry_forward_tasks WHERE venue_id = ? AND status = ? ORDER BY created_at DESC LIMIT 50"
      ).all(req.venueId, status)
    : db.prepare(
        "SELECT * FROM carry_forward_tasks WHERE venue_id = ? ORDER BY created_at DESC LIMIT 50"
      ).all(req.venueId);
  res.json({ tasks: rows });
});

app.post("/api/tasks", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const content = String(req.body.content || "").trim();
  if (!content) return res.status(400).json({ error: "content is required." });

  const clientId = String(req.body.id || "").trim();
  const task = {
    id:               clientId || id("task"),
    venue_id:         req.venueId,
    shift_id:         String(req.body.shift_id || ""),
    content,
    priority:         String(req.body.priority || "normal"),
    status:           "open",
    source:           String(req.body.source || ""),
    source_report_id: String(req.body.source_report_id || ""),
    description:      String(req.body.description || ""),
    created_at:       nowIso()
  };

  db.prepare(`
    INSERT OR IGNORE INTO carry_forward_tasks
      (id, venue_id, shift_id, content, priority, status, source, source_report_id, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    task.id, task.venue_id, task.shift_id, task.content, task.priority, task.status,
    task.source, task.source_report_id, task.description, task.created_at
  );

  const row = db.prepare("SELECT * FROM carry_forward_tasks WHERE id = ?").get(task.id);
  res.status(201).json({ task: row || task });
});

app.patch("/api/tasks/:id", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const fields = [];
  const values = [];
  if (req.body.status !== undefined)           { fields.push("status = ?");            values.push(String(req.body.status)); }
  if (req.body.resolved_shift_id !== undefined){ fields.push("resolved_shift_id = ?"); values.push(String(req.body.resolved_shift_id)); }
  if (!fields.length) return res.status(400).json({ error: "No valid fields provided." });

  db.prepare(`UPDATE carry_forward_tasks SET ${fields.join(", ")} WHERE id = ? AND venue_id = ?`)
    .run(...values, req.params.id, req.venueId);

  const row = db.prepare("SELECT * FROM carry_forward_tasks WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Task not found." });
  res.json({ task: row });
});

app.post("/api/event-plans", requireAuth("manager", "owner", "admin", "events_manager"), (req, res) => {
  const clientId = String(req.body.id || "").trim();
  const plan = {
    id: clientId || id("event"),
    venue_id: req.venueId,
    name: String(req.body.name || "Untitled Event Plan"),
    config_json: JSON.stringify(req.body.config || {}),
    calculations_json: JSON.stringify(req.body.calculations || {}),
    projected_revenue: Number(req.body.calculations?.revenue || 0),
    projected_profit: Number(req.body.calculations?.grossProfit || 0),
    projected_margin: Number(req.body.calculations?.margin || 0),
    created_at: nowIso()
  };

  db.prepare(`
    INSERT OR IGNORE INTO event_plans (
      id, venue_id, name, config_json, calculations_json,
      projected_revenue, projected_profit, projected_margin, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    plan.id,
    plan.venue_id,
    plan.name,
    plan.config_json,
    plan.calculations_json,
    plan.projected_revenue,
    plan.projected_profit,
    plan.projected_margin,
    plan.created_at
  );

  db.prepare("INSERT INTO business_memory (id, venue_id, type, title, detail, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    id("memory"),
    req.venueId,
    "event",
    `Event plan saved: ${plan.name}`,
    `Projected revenue: NIS ${Math.round(plan.projected_revenue).toLocaleString()}. Projected profit: NIS ${Math.round(plan.projected_profit).toLocaleString()}. Margin: ${plan.projected_margin.toFixed(1)}%.`,
    plan.created_at.slice(0, 10),
    plan.created_at
  );

  res.status(201).json({
    eventPlan: {
      id: plan.id,
      name: plan.name,
      config: JSON.parse(plan.config_json),
      calculations: JSON.parse(plan.calculations_json),
      projected_revenue: plan.projected_revenue,
      projected_profit: plan.projected_profit,
      projected_margin: plan.projected_margin,
      created_at: plan.created_at
    }
  });
});

app.patch("/api/event-plans/:id", requireAuth("owner", "admin"), (req, res) => {
  const existing = db.prepare("SELECT id FROM event_plans WHERE id = ? AND venue_id = ?").get(req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: "Event plan not found." });

  db.prepare(`
    UPDATE event_plans
    SET config_json = ?, status = ?, approved_by = ?, approved_at = ?
    WHERE id = ? AND venue_id = ?
  `).run(
    JSON.stringify(req.body.config || {}),
    String(req.body.status || ""),
    req.body.approved_by ? String(req.body.approved_by) : null,
    req.body.approved_at ? String(req.body.approved_at) : null,
    req.params.id,
    req.venueId
  );

  const row = db.prepare("SELECT * FROM event_plans WHERE id = ?").get(req.params.id);
  res.json({
    eventPlan: {
      id: row.id,
      name: row.name,
      config: JSON.parse(row.config_json),
      calculations: JSON.parse(row.calculations_json),
      projected_revenue: row.projected_revenue,
      projected_profit: row.projected_profit,
      projected_margin: row.projected_margin,
      status: row.status || null,
      approved_by: row.approved_by || null,
      approved_at: row.approved_at || null,
      created_at: row.created_at
    }
  });
});

app.get("/api/event-plans", requireAuth("manager", "owner", "admin", "events_manager"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM event_plans
    WHERE venue_id = ?
    ORDER BY created_at DESC
    LIMIT 30
  `).all(req.venueId);

  res.json({
    eventPlans: rows.map(row => ({
      id: row.id,
      name: row.name,
      config: JSON.parse(row.config_json),
      calculations: JSON.parse(row.calculations_json),
      projected_revenue: row.projected_revenue,
      projected_profit: row.projected_profit,
      projected_margin: row.projected_margin,
      status: row.status || null,
      approved_by: row.approved_by || null,
      approved_at: row.approved_at || null,
      created_at: row.created_at
    }))
  });
});

app.post("/api/coach", requireAuth("manager", "bar_manager", "owner", "admin"), async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await askGemini(`
COACH MODE.

Question:
${question}
    `);

    res.json({ answer });
  } catch (error) {
    console.log("COACH ERROR:", error);
    res.status(500).json({ error: error.message || "Coach request failed." });
  }
});

app.post("/api/simulate", requireAuth("manager", "bar_manager", "owner", "admin"), async (req, res) => {
  try {
    const { scenario, employeeResponse } = req.body;
    const answer = await askGemini(`
SIMULATION MODE.

Guest scenario:
${scenario}

Employee response:
${employeeResponse}

Evaluate:
- Empathy /10
- Professionalism /10
- Hosting Presence /10
- Solution Quality /10
- Revenue Protection /10
- Feedback
- Improved employee response
    `);

    res.json({ answer });
  } catch (error) {
    console.log("SIM ERROR:", error);
    res.status(500).json({ error: error.message || "Simulation request failed." });
  }
});

app.post("/api/analyze", requireAuth("manager", "bar_manager", "owner", "admin"), async (req, res) => {
  try {
    const data =
      req.body?.complaintSummary ||
      "Slow Service 31%, Inattentive Presence 19%, Cold Greeting 14%, Poor Recovery 13%, Wrong Order 9%, Billing Friction 6%";

    const answer = await askGemini(`
MANAGER ANALYSIS MODE.

Analyze this complaint data:
${data}

Return:
- Executive Summary
- Top Failures
- Emotional Damage Points
- Revenue Risk
- Recommended Training Modules
- First 3 Management Actions
    `);

    res.json({ answer });
  } catch (error) {
    console.log("ANALYSIS ERROR:", error);
    res.status(500).json({ error: error.message || "Analysis request failed." });
  }
});

function huspiaUserRow(row) {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    role: row.role,
    venue: row.venue,
    team: row.team,
    canManageCocktails: Boolean(row.can_manage_cocktails),
    disabled: Boolean(row.disabled),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

app.get("/api/users", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare("SELECT * FROM hospia_users ORDER BY created_at ASC").all();
  res.json({ users: rows.map(huspiaUserRow) });
});

app.post("/api/users", requireAuth("owner", "admin"), (req, res) => {
  const existing = db.prepare("SELECT id FROM hospia_users WHERE username = ? COLLATE NOCASE").get(String(req.body.username || "").trim());
  const userId = (req.body.id && !existing) ? req.body.id : (existing ? existing.id : id("huser"));
  const now = nowIso();

  if (existing) {
    db.prepare(`UPDATE hospia_users SET username=?,password=?,role=?,venue=?,team=?,can_manage_cocktails=?,disabled=?,updated_at=? WHERE id=?`).run(
      String(req.body.username || "").trim(),
      String(req.body.password || ""),
      String(req.body.role || "employee"),
      String(req.body.venue || "Main Venue"),
      String(req.body.team || "Front of House"),
      req.body.canManageCocktails ? 1 : 0,
      req.body.disabled ? 1 : 0,
      now,
      existing.id
    );
  } else {
    db.prepare(`INSERT INTO hospia_users (id,username,password,role,venue,team,can_manage_cocktails,disabled,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      userId,
      String(req.body.username || "").trim(),
      String(req.body.password || ""),
      String(req.body.role || "employee"),
      String(req.body.venue || "Main Venue"),
      String(req.body.team || "Front of House"),
      req.body.canManageCocktails ? 1 : 0,
      req.body.disabled ? 1 : 0,
      req.body.created_at || now,
      now
    );
  }

  const saved = db.prepare("SELECT * FROM hospia_users WHERE id=?").get(userId) || db.prepare("SELECT * FROM hospia_users WHERE username=? COLLATE NOCASE").get(String(req.body.username || "").trim());
  res.status(existing ? 200 : 201).json({ user: huspiaUserRow(saved) });
});

app.patch("/api/users/:id", requireAuth("owner", "admin"), (req, res) => {
  const row = db.prepare("SELECT * FROM hospia_users WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "User not found." });

  const fields = [];
  const values = [];
  if (req.body.username !== undefined) { fields.push("username=?"); values.push(String(req.body.username).trim()); }
  if (req.body.password !== undefined) { fields.push("password=?"); values.push(String(req.body.password)); }
  if (req.body.role !== undefined) { fields.push("role=?"); values.push(String(req.body.role)); }
  if (req.body.venue !== undefined) { fields.push("venue=?"); values.push(String(req.body.venue)); }
  if (req.body.team !== undefined) { fields.push("team=?"); values.push(String(req.body.team)); }
  if (req.body.canManageCocktails !== undefined) { fields.push("can_manage_cocktails=?"); values.push(req.body.canManageCocktails ? 1 : 0); }
  if (req.body.disabled !== undefined) { fields.push("disabled=?"); values.push(req.body.disabled ? 1 : 0); }
  fields.push("updated_at=?");
  values.push(nowIso());

  db.prepare(`UPDATE hospia_users SET ${fields.join(",")} WHERE id=?`).run(...values, req.params.id);
  const updated = db.prepare("SELECT * FROM hospia_users WHERE id=?").get(req.params.id);
  res.json({ user: huspiaUserRow(updated) });
});

// ─── Venue Routes (Phase 8 — Multi-Venue Foundation) ──────────────────────────
// A venue is the memory unit. These routes drive the venue selector and let an
// owner / platform admin create a new venue. Each venue's intelligence (DNA,
// briefs, Omer, Academy, Owner Intelligence, operations) is fully isolated and
// lazily initialized on first read — nothing else needs seeding here.

// GET — venues the current user can access, plus the venue resolved for this
// request. The frontend shows a selector only when more than one is returned.
app.get("/api/venues", requireAuth(), (req, res) => {
  const ids = venuesForUser(req.user);
  const venues = ids.length
    ? db.prepare(
        `SELECT id, name, venue_type, description, created_at
         FROM venues WHERE id IN (${ids.map(() => "?").join(",")}) ORDER BY created_at ASC`
      ).all(...ids)
    : [];
  res.json({ venues, currentVenueId: req.venueId });
});

// POST — create a venue. Owner / Platform Admin only. The creator is auto-assigned
// as the venue owner (venue_members). No invitations / portfolio / billing here.
app.post("/api/venues", requireAuth("owner", "admin"), (req, res) => {
  const name = String(req.body?.name || "").trim();
  const venueType = String(req.body?.venue_type || req.body?.venueType || "").trim();
  const description = req.body?.description != null ? String(req.body.description).trim() : null;
  if (!name) return res.status(400).json({ error: "Venue name is required." });
  if (!venueType) return res.status(400).json({ error: "Venue type is required." });

  const venueId = id("venue");
  const now = nowIso();
  // Atomic via BEGIN/COMMIT (node:sqlite DatabaseSync has no .transaction()).
  db.exec("BEGIN");
  try {
    db.prepare("INSERT INTO venues (id, name, venue_type, description, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(venueId, name, venueType, description || null, now);
    // Auto-assign the creator as the venue owner so it appears in their selector.
    // Platform admins already see all venues, but recording the membership keeps
    // the model consistent and harmless.
    db.prepare(
      "INSERT OR IGNORE INTO venue_members (user_id, venue_id, venue_role, active, created_at) VALUES (?, ?, 'owner', 1, ?)"
    ).run(req.user.id, venueId, now);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: err.message || "Could not create the venue." });
  }

  const venue = db.prepare("SELECT id, name, venue_type, description, created_at FROM venues WHERE id = ?").get(venueId);
  res.status(201).json({ venue });
});

// ─── Cocktail & Bar Routes ────────────────────────────────────────────────────

app.get("/api/cocktails", requireAuth(), (req, res) => {
  const rows = db.prepare("SELECT * FROM cocktails WHERE is_active = 1 ORDER BY name ASC").all();
  res.json({ cocktails: rows.map(r => ({
    ...r,
    tags: tryJson(r.tags_json, []),
    ingredients: tryJson(r.ingredients_text_json, [])
  })) });
});

app.get("/api/cocktails/:id", requireAuth(), (req, res) => {
  const row = db.prepare("SELECT * FROM cocktails WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Cocktail not found." });
  const pricing = db.prepare("SELECT * FROM cocktail_pricing WHERE cocktail_id = ?").get(row.id);
  res.json({ cocktail: {
    ...row,
    tags: tryJson(row.tags_json, []),
    ingredients: tryJson(row.ingredients_text_json, []),
    pricing: pricing || null
  }});
});

app.post("/api/cocktails", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Cocktail name is required." });
  const result = db.prepare(`
    INSERT INTO cocktails (name, category, description, base_spirit, glass_type, garnish, method, tags_json, ingredients_text_json, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    req.body.category || null,
    req.body.description || null,
    req.body.base_spirit || null,
    req.body.glass_type || null,
    req.body.garnish || null,
    req.body.method || null,
    JSON.stringify(req.body.tags || []),
    JSON.stringify(req.body.ingredients || []),
    req.user?.id || null
  );
  const saved = db.prepare("SELECT * FROM cocktails WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ cocktail: { ...saved, tags: tryJson(saved.tags_json, []), ingredients: tryJson(saved.ingredients_text_json, []) } });
});

app.put("/api/cocktails/:id", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const row = db.prepare("SELECT id FROM cocktails WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Cocktail not found." });
  const fields = []; const values = [];
  for (const [col, key] of [["name","name"],["category","category"],["description","description"],["base_spirit","base_spirit"],["glass_type","glass_type"],["garnish","garnish"],["method","method"]]) {
    if (req.body[key] !== undefined) { fields.push(`${col}=?`); values.push(String(req.body[key])); }
  }
  if (req.body.tags !== undefined) { fields.push("tags_json=?"); values.push(JSON.stringify(req.body.tags)); }
  if (req.body.ingredients !== undefined) { fields.push("ingredients_text_json=?"); values.push(JSON.stringify(req.body.ingredients)); }
  if (!fields.length) return res.status(400).json({ error: "No fields to update." });
  db.prepare(`UPDATE cocktails SET ${fields.join(",")} WHERE id=?`).run(...values, req.params.id);
  const updated = db.prepare("SELECT * FROM cocktails WHERE id = ?").get(req.params.id);
  res.json({ cocktail: { ...updated, tags: tryJson(updated.tags_json, []), ingredients: tryJson(updated.ingredients_text_json, []) } });
});

app.get("/api/ingredients", requireAuth(), (req, res) => {
  const rows = db.prepare("SELECT * FROM ingredients ORDER BY name ASC").all();
  res.json({ ingredients: rows });
});

app.post("/api/ingredients", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Ingredient name is required." });
  const costPerUnit = parseFloat(req.body.cost_per_unit) || 0;
  const result = db.prepare(`
    INSERT INTO ingredients (name, unit, cost_per_unit, supplier, is_kosher, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, req.body.unit || "ml", costPerUnit, req.body.supplier || null, req.body.is_kosher !== false ? 1 : 0, nowIso());
  const saved = db.prepare("SELECT * FROM ingredients WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ ingredient: saved });
});

app.put("/api/ingredients/:id", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const row = db.prepare("SELECT id FROM ingredients WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Ingredient not found." });
  const costPerUnit = parseFloat(req.body.cost_per_unit);
  if (isNaN(costPerUnit)) return res.status(400).json({ error: "Valid cost_per_unit required." });
  db.prepare("UPDATE ingredients SET cost_per_unit=?, supplier=?, updated_at=? WHERE id=?")
    .run(costPerUnit, req.body.supplier || null, nowIso(), req.params.id);
  res.json({ ingredient: db.prepare("SELECT * FROM ingredients WHERE id=?").get(req.params.id) });
});

app.get("/api/cocktails/:id/cost", requireAuth(), (req, res) => {
  const row = db.prepare("SELECT id FROM cocktails WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Cocktail not found." });
  const result = db.prepare(`
    SELECT COALESCE(SUM(ci.quantity * i.cost_per_unit), 0) as total_cost
    FROM cocktail_ingredients ci
    JOIN ingredients i ON ci.ingredient_id = i.id
    WHERE ci.cocktail_id = ?
  `).get(req.params.id);
  res.json({ cocktail_id: req.params.id, total_cost: result.total_cost });
});

app.post("/api/cocktails/:id/pricing", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const row = db.prepare("SELECT id FROM cocktails WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Cocktail not found." });
  const sellPrice = parseFloat(req.body.sell_price);
  if (isNaN(sellPrice) || sellPrice <= 0) return res.status(400).json({ error: "Valid sell_price required." });
  const costPrice = parseFloat(req.body.cost_price) || null;
  const targetMargin = parseFloat(req.body.target_margin) || 0.75;
  const existing = db.prepare("SELECT id FROM cocktail_pricing WHERE cocktail_id = ?").get(req.params.id);
  if (existing) {
    db.prepare("UPDATE cocktail_pricing SET sell_price=?, cost_price=?, target_margin=?, last_calculated=? WHERE cocktail_id=?")
      .run(sellPrice, costPrice, targetMargin, nowIso(), req.params.id);
  } else {
    db.prepare("INSERT INTO cocktail_pricing (cocktail_id, sell_price, cost_price, target_margin, last_calculated) VALUES (?,?,?,?,?)")
      .run(req.params.id, sellPrice, costPrice, targetMargin, nowIso());
  }
  res.json({ pricing: db.prepare("SELECT * FROM cocktail_pricing WHERE cocktail_id=?").get(req.params.id) });
});

app.get("/api/bar/profit-alerts", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, cp.cost_price, cp.sell_price, cp.target_margin,
      ROUND(CASE WHEN cp.sell_price > 0 THEN (cp.sell_price - cp.cost_price) / cp.sell_price ELSE 0 END, 2) as actual_margin
    FROM cocktail_pricing cp
    JOIN cocktails c ON cp.cocktail_id = c.id
    WHERE cp.sell_price > 0 AND cp.cost_price IS NOT NULL
      AND ROUND(CASE WHEN cp.sell_price > 0 THEN (cp.sell_price - cp.cost_price) / cp.sell_price ELSE 0 END, 2) < cp.target_margin
    ORDER BY actual_margin ASC
  `).all();
  res.json({ alerts: rows });
});

function tryJson(str, fallback) {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}

// ─── Admin User Management Routes ────────────────────────────────────────────

const VALID_ROLES = ['owner', 'manager', 'bar_manager', 'employee', 'admin', 'fb_director', 'events_manager', 'chef'];

function adminUserRow(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    role: row.role,
    username: row.username || "",
    password: row.password || "",
    is_active: Boolean(row.is_active),
    created_at: row.created_at
  };
}

app.get("/api/admin/users", requireAuth("admin"), (req, res) => {
  const rows = db.prepare(
    "SELECT id, full_name, role, username, password, is_active, created_at FROM auth_users ORDER BY id ASC"
  ).all();
  res.json({ users: rows.map(adminUserRow) });
});

app.post("/api/admin/users", requireAuth("admin"), (req, res) => {
  const full_name = String(req.body?.full_name || "").trim();
  const role      = String(req.body?.role      || "").trim();
  const username  = String(req.body?.username  || "").trim().toLowerCase();
  const password  = String(req.body?.password  || "").trim();
  if (!full_name) return res.status(400).json({ error: "full_name is required." });
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: "Invalid role." });
  if (!username)  return res.status(400).json({ error: "username is required." });
  if (!password)  return res.status(400).json({ error: "password is required." });
  const conflict = db.prepare("SELECT id FROM auth_users WHERE LOWER(username) = ?").get(username);
  if (conflict) return res.status(409).json({ error: "Username already in use." });
  const placeholderCode = username.toUpperCase().slice(0, 8) + "_" + Date.now();
  const result = db.prepare(
    "INSERT INTO auth_users (full_name, role, username, password, is_active, access_code) VALUES (?, ?, ?, ?, 1, ?)"
  ).run(full_name, role, username, password, placeholderCode);
  const saved = db.prepare("SELECT id, full_name, role, username, password, is_active, created_at FROM auth_users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ user: adminUserRow(saved) });
});

app.put("/api/admin/users/:id", requireAuth("admin"), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const row = db.prepare("SELECT id FROM auth_users WHERE id = ?").get(userId);
  if (!row) return res.status(404).json({ error: "User not found." });
  const fields = [];
  const values = [];
  if (req.body.full_name !== undefined) {
    const v = String(req.body.full_name).trim();
    if (!v) return res.status(400).json({ error: "full_name cannot be empty." });
    fields.push("full_name = ?"); values.push(v);
  }
  if (req.body.role !== undefined) {
    if (!VALID_ROLES.includes(req.body.role)) return res.status(400).json({ error: "Invalid role." });
    fields.push("role = ?"); values.push(req.body.role);
  }
  if (req.body.username !== undefined) {
    const v = String(req.body.username).trim().toLowerCase();
    if (!v) return res.status(400).json({ error: "username cannot be empty." });
    const conflict = db.prepare("SELECT id FROM auth_users WHERE LOWER(username) = ? AND id != ?").get(v, userId);
    if (conflict) return res.status(409).json({ error: "Username already in use." });
    fields.push("username = ?"); values.push(v);
  }
  if (req.body.password !== undefined) {
    const v = String(req.body.password).trim();
    if (!v) return res.status(400).json({ error: "password cannot be empty." });
    fields.push("password = ?"); values.push(v);
  }
  if (!fields.length) return res.status(400).json({ error: "No fields to update." });
  db.prepare(`UPDATE auth_users SET ${fields.join(", ")} WHERE id = ?`).run(...values, userId);
  const updated = db.prepare("SELECT id, full_name, role, username, password, is_active, created_at FROM auth_users WHERE id = ?").get(userId);
  res.json({ user: adminUserRow(updated) });
});

app.patch("/api/admin/users/:id/toggle", requireAuth("admin"), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const row = db.prepare("SELECT id, is_active FROM auth_users WHERE id = ?").get(userId);
  if (!row) return res.status(404).json({ error: "User not found." });
  db.prepare("UPDATE auth_users SET is_active = ? WHERE id = ?").run(row.is_active ? 0 : 1, userId);
  const updated = db.prepare("SELECT id, full_name, role, username, password, is_active, created_at FROM auth_users WHERE id = ?").get(userId);
  res.json({ user: adminUserRow(updated) });
});

app.delete("/api/admin/users/:id", requireAuth("admin"), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const row = db.prepare("SELECT id FROM auth_users WHERE id = ?").get(userId);
  if (!row) return res.status(404).json({ error: "User not found." });
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM auth_users WHERE id = ?").run(userId);
  res.json({ ok: true, deleted_id: userId });
});

// ─── Academy Routes ───────────────────────────────────────────────────────────

app.get("/api/courses", requireAuth(), (req, res) => {
  const courses = db.prepare(
    "SELECT id, external_id, title, category, description, role_target FROM courses WHERE is_active = 1 ORDER BY id ASC"
  ).all();
  const modules = db.prepare(
    "SELECT id, course_id, external_id, title, content, order_index FROM course_modules ORDER BY course_id ASC, order_index ASC"
  ).all();
  const modulesByCourse = {};
  for (const m of modules) {
    if (!modulesByCourse[m.course_id]) modulesByCourse[m.course_id] = [];
    modulesByCourse[m.course_id].push(m);
  }
  res.json({ courses: courses.map(c => ({ ...c, modules: modulesByCourse[c.id] || [] })) });
});

app.get("/api/courses/:id", requireAuth(), (req, res) => {
  const course = db.prepare(
    "SELECT id, external_id, title, category, description, role_target FROM courses WHERE id = ? AND is_active = 1"
  ).get(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found." });
  const modules = db.prepare(
    "SELECT id, course_id, external_id, title, content, order_index FROM course_modules WHERE course_id = ? ORDER BY order_index ASC"
  ).all(course.id);
  res.json({ course: { ...course, modules } });
});

app.post("/api/courses", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const title = String(req.body?.title || "").trim();
  if (!title) return res.status(400).json({ error: "title is required." });
  const result = db.prepare(
    "INSERT INTO courses (external_id, title, category, description, role_target, created_by) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    req.body.external_id || null,
    title,
    req.body.category || null,
    req.body.description || null,
    req.body.role_target || null,
    req.user?.id || null
  );
  const saved = db.prepare("SELECT * FROM courses WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ course: saved });
});

app.get("/api/staff-progress/:user_id", requireAuth(), (req, res) => {
  const userId = parseInt(req.params.user_id, 10);
  if (!userId) return res.status(400).json({ error: "Invalid user_id." });
  const rows = db.prepare(`
    SELECT sp.id, sp.user_id, sp.course_id, sp.module_id, sp.status, sp.completed_at,
           c.title as course_title, c.external_id as course_external_id,
           cm.title as module_title, cm.external_id as module_external_id
    FROM staff_progress sp
    LEFT JOIN courses c ON sp.course_id = c.id
    LEFT JOIN course_modules cm ON sp.module_id = cm.id
    WHERE sp.user_id = ?
    ORDER BY sp.completed_at DESC
  `).all(userId);
  res.json({ progress: rows });
});

app.post("/api/staff-progress", requireAuth(), (req, res) => {
  const userId = parseInt(req.body?.user_id, 10);
  const academyId = String(req.body?.academy_id || "").trim();
  const lessonId = String(req.body?.lesson_id || "").trim();
  if (!userId || !academyId || !lessonId) {
    return res.status(400).json({ error: "user_id, academy_id, and lesson_id are required." });
  }
  const user = db.prepare("SELECT id FROM auth_users WHERE id = ? AND is_active = 1").get(userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  const course = db.prepare("SELECT id FROM courses WHERE external_id = ?").get(academyId);
  if (!course) return res.status(404).json({ error: "Course not found for academy_id: " + academyId });
  const module = db.prepare(
    "SELECT id FROM course_modules WHERE external_id = ? AND course_id = ?"
  ).get(lessonId, course.id);
  if (!module) return res.status(404).json({ error: "Module not found for lesson_id: " + lessonId });
  const existing = db.prepare(
    "SELECT id FROM staff_progress WHERE user_id = ? AND module_id = ?"
  ).get(userId, module.id);
  const completedAt = nowIso();
  if (existing) {
    db.prepare("UPDATE staff_progress SET status = 'completed', completed_at = ? WHERE id = ?")
      .run(completedAt, existing.id);
  } else {
    db.prepare(
      "INSERT INTO staff_progress (user_id, course_id, module_id, status, completed_at) VALUES (?, ?, ?, 'completed', ?)"
    ).run(userId, course.id, module.id, completedAt);
  }
  res.status(201).json({ ok: true, user_id: userId, academy_id: academyId, lesson_id: lessonId, completed_at: completedAt });
});

app.get("/api/academy/team-overview", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const users = db.prepare(
    "SELECT id, full_name, role FROM auth_users WHERE is_active = 1 ORDER BY full_name ASC"
  ).all();
  const courses = db.prepare(
    "SELECT id, external_id, title FROM courses WHERE is_active = 1"
  ).all();
  const moduleCounts = db.prepare(
    "SELECT course_id, COUNT(*) as total FROM course_modules GROUP BY course_id"
  ).all();
  const totalByCourse = Object.fromEntries(moduleCounts.map(r => [r.course_id, r.total]));
  const completedRows = db.prepare(`
    SELECT user_id, course_id, COUNT(*) as completed
    FROM staff_progress WHERE status = 'completed'
    GROUP BY user_id, course_id
  `).all();
  const completedMap = {};
  for (const r of completedRows) {
    if (!completedMap[r.user_id]) completedMap[r.user_id] = {};
    completedMap[r.user_id][r.course_id] = r.completed;
  }
  const overview = users.map(u => ({
    user_id: u.id,
    full_name: u.full_name,
    role: u.role,
    courses: courses.map(c => {
      const total = totalByCourse[c.id] || 0;
      const completed = completedMap[u.id]?.[c.id] || 0;
      return {
        course_id: c.id,
        external_id: c.external_id,
        title: c.title,
        total_modules: total,
        completed_modules: completed,
        pct: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    })
  }));
  res.json({ overview });
});

// ─── Owner Pulse Routes ───────────────────────────────────────────────────────

app.get("/api/owner/pulse", requireAuth("owner", "admin"), (req, res) => {
  const closedShifts = db.prepare(
    "SELECT COUNT(*) as count FROM shifts WHERE venue_id = ? AND status = 'closed'"
  ).get(req.venueId).count;

  const openShift = db.prepare(
    "SELECT id FROM shifts WHERE venue_id = ? AND status = 'open' LIMIT 1"
  ).get(req.venueId);

  const openTasks = db.prepare(
    "SELECT COUNT(*) as count FROM carry_forward_tasks WHERE venue_id = ? AND status = 'open'"
  ).get(req.venueId).count;

  const unresolvedIncidents = db.prepare(
    "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND resolved = 0"
  ).get(req.venueId).count;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const incidents30d = db.prepare(
    "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND created_at >= ?"
  ).get(req.venueId, thirtyDaysAgo).count;

  const approvedCocktails = db.prepare(
    "SELECT COUNT(*) as count FROM cocktails WHERE is_active = 1"
  ).get().count;

  const staffWithTraining = db.prepare(
    "SELECT COUNT(DISTINCT user_id) as count FROM staff_progress WHERE status = 'completed'"
  ).get().count;

  const totalStaff = db.prepare(
    "SELECT COUNT(*) as count FROM auth_users WHERE is_active = 1"
  ).get().count;

  const lastInsight = db.prepare(
    "SELECT content, saved_at FROM owner_insights WHERE venue_id = ? ORDER BY saved_at DESC LIMIT 1"
  ).get(req.venueId);

  res.json({
    total_closed_shifts: closedShifts,
    has_open_shift: Boolean(openShift),
    open_tasks: openTasks,
    unresolved_incidents: unresolvedIncidents,
    incidents_30d: incidents30d,
    approved_cocktails: approvedCocktails,
    staff_with_training: staffWithTraining,
    total_staff: totalStaff,
    last_insight: lastInsight || null
  });
});

app.get("/api/owner/trends", requireAuth("owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT
      date(closed_at) as shift_date,
      COUNT(*) as shifts_closed,
      SUM(COALESCE(cover_count, 0)) as total_covers
    FROM shifts
    WHERE venue_id = ? AND status = 'closed'
      AND closed_at >= date('now', '-30 days')
    GROUP BY date(closed_at)
    ORDER BY shift_date ASC
  `).all(req.venueId);

  const incidentRows = db.prepare(`
    SELECT
      shift_date,
      COUNT(*) as incident_count
    FROM incidents
    WHERE venue_id = ? AND shift_date >= date('now', '-30 days')
    GROUP BY shift_date
    ORDER BY shift_date ASC
  `).all(req.venueId);

  const incidentsByDate = Object.fromEntries(incidentRows.map(r => [r.shift_date, r.incident_count]));
  const trends = rows.map(r => ({
    date: r.shift_date,
    shifts_closed: r.shifts_closed,
    total_covers: r.total_covers,
    incidents: incidentsByDate[r.shift_date] || 0
  }));

  res.json({ trends });
});

app.post("/api/owner/insights", requireAuth("owner", "admin"), async (req, res) => {
  const lastInsight = db.prepare(
    "SELECT saved_at FROM owner_insights WHERE venue_id = ? ORDER BY saved_at DESC LIMIT 1"
  ).get(req.venueId);

  if (lastInsight) {
    const secondsAgo = (Date.now() - new Date(lastInsight.saved_at).getTime()) / 1000;
    if (secondsAgo < 60) {
      return res.status(429).json({
        error: "Insight cooldown active.",
        retry_after_seconds: Math.ceil(60 - secondsAgo)
      });
    }
  }

  try {
    const closedShifts = db.prepare(
      "SELECT COUNT(*) as count FROM shifts WHERE venue_id = ? AND status = 'closed'"
    ).get(req.venueId).count;
    const openTasks = db.prepare(
      "SELECT COUNT(*) as count FROM carry_forward_tasks WHERE venue_id = ? AND status = 'open'"
    ).get(req.venueId).count;
    const unresolvedIncidents = db.prepare(
      "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND resolved = 0"
    ).get(req.venueId).count;
    const incidents30d = db.prepare(
      "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND created_at >= date('now', '-30 days')"
    ).get(req.venueId).count;
    const approvedCocktails = db.prepare(
      "SELECT COUNT(*) as count FROM cocktails WHERE is_active = 1"
    ).get().count;
    const staffWithTraining = db.prepare(
      "SELECT COUNT(DISTINCT user_id) as count FROM staff_progress WHERE status = 'completed'"
    ).get().count;
    const totalStaff = db.prepare(
      "SELECT COUNT(*) as count FROM auth_users WHERE is_active = 1"
    ).get().count;

    const prompt = `OWNER PULSE ANALYSIS.

Operational data for this venue:
- Closed shifts recorded: ${closedShifts}
- Open carry-forward tasks: ${openTasks}
- Unresolved service incidents: ${unresolvedIncidents}
- Incidents in last 30 days: ${incidents30d}
- Approved cocktails in library: ${approvedCocktails}
- Staff members with completed training: ${staffWithTraining} of ${totalStaff}

Provide a concise executive pulse — 3 to 5 sentences. Identify the most important operational signal, note any training or incident risk, and give one specific action recommendation. Be precise and hospitality-native. Do not invent data not shown above.`;

    const content = await askGemini(prompt);
    const savedAt = nowIso();

    db.prepare(
      "INSERT INTO owner_insights (venue_id, content, saved_at) VALUES (?, ?, ?)"
    ).run(req.venueId, content, savedAt);

    res.json({ ok: true, content, saved_at: savedAt });
  } catch (error) {
    res.status(500).json({ error: error.message || "Insight generation failed." });
  }
});

app.get("/api/health", (req, res) => {
  const tables = db.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table'").get().count;
  res.json({
    ok: true,
    model: MODEL,
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    database: {
      path: DB_PATH,
      tables
    }
  });
});

// ─── Verified Price Overrides ─────────────────────────────────────────────────
// requireVerifiedPriceAccess gates on both role AND exact username (X-HESTIA-User).
// Frontend canAccessBottlePrices() is still the primary identity gate.

const APPROVED_VERIFIED_SOURCE_TYPES = ['invoice', 'supplier_quote', 'supplier_catalog', 'direct_supplier_confirmation'];

function validateNormalizedUpdate(nu, productIdFromUrl) {
  if (!nu || typeof nu !== 'object' || Array.isArray(nu)) {
    return 'normalizedUpdate is required and must be a plain object.';
  }
  if ('benchmark_price_nis' in nu || 'data_status' in nu || 'category_id' in nu || 'bottle_size_ml' in nu) {
    return 'normalizedUpdate must not be a full product object. Send only normalized_update fields.';
  }
  if (!nu.product_id) return 'normalizedUpdate.product_id is required.';
  if (nu.product_id !== productIdFromUrl) return 'product_id mismatch between URL and normalizedUpdate.product_id.';
  const price = Number(nu.actual_venue_price_nis);
  if (nu.actual_venue_price_nis == null) return 'actual_venue_price_nis is required.';
  if (isNaN(price) || price <= 0) return 'actual_venue_price_nis must be a positive number.';
  if (!String(nu.supplier_name || '').trim()) return 'supplier_name is required.';
  if (!nu.source_type) return 'source_type is required.';
  if (!APPROVED_VERIFIED_SOURCE_TYPES.includes(nu.source_type)) return `source_type '${nu.source_type}' is not an approved verified source.`;
  if (!String(nu.source_reference || '').trim()) return 'source_reference is required.';
  if (!nu.last_verified_at || isNaN(Date.parse(nu.last_verified_at))) return 'last_verified_at must be a valid ISO date string.';
  if (typeof nu.vat_included !== 'boolean') return 'vat_included must be a boolean (true or false).';
  if (!String(nu.verified_by || '').trim()) return 'verified_by is required.';
  return null;
}

app.get("/api/verified-price-overrides", requireVerifiedPriceAccess, (req, res) => {
  const rows = db.prepare(`
    SELECT product_id, normalized_update_json, saved_by, saved_at
    FROM verified_price_overrides
    WHERE venue_id = ?
  `).all(req.venueId);

  const overrides = rows.map(row => {
    try {
      return {
        product_id: row.product_id,
        normalizedUpdate: JSON.parse(row.normalized_update_json),
        saved_by: row.saved_by,
        saved_at: row.saved_at,
      };
    } catch {
      return null;
    }
  }).filter(Boolean);

  res.json({ overrides });
});

app.post("/api/verified-price-overrides/:product_id", requireVerifiedPriceAccess, (req, res) => {
  const { product_id } = req.params;
  const { normalizedUpdate, savedBy } = req.body;

  const validationError = validateNormalizedUpdate(normalizedUpdate, product_id);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  let json;
  try {
    json = JSON.stringify(normalizedUpdate);
  } catch {
    return res.status(400).json({ error: "normalizedUpdate is not serializable." });
  }

  const existing = db.prepare(
    `SELECT normalized_update_json FROM verified_price_overrides WHERE product_id = ? AND venue_id = ?`
  ).get(product_id, req.venueId);

  let oldPriceNis = null;
  if (existing) {
    try { oldPriceNis = JSON.parse(existing.normalized_update_json).actual_venue_price_nis ?? null; } catch {}
  }

  const now = nowIso();
  db.prepare(`
    INSERT OR REPLACE INTO verified_price_overrides
      (product_id, venue_id, normalized_update_json, saved_by, saved_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(product_id, req.venueId, json, String(savedBy || ""), now);

  db.prepare(`
    INSERT INTO verified_price_audit_log
      (id, product_id, venue_id, action, old_price_nis, new_price_nis, supplier_name, source_type, saved_by, saved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id('audit'), product_id, req.venueId, 'save',
    oldPriceNis,
    Number(normalizedUpdate.actual_venue_price_nis),
    String(normalizedUpdate.supplier_name || ''),
    String(normalizedUpdate.source_type || ''),
    req.verifiedPriceUser, now
  );

  res.status(201).json({ ok: true, product_id, saved_at: now });
});

app.delete("/api/verified-price-overrides/:product_id", requireVerifiedPriceAccess, (req, res) => {
  const { product_id } = req.params;

  const existing = db.prepare(
    `SELECT normalized_update_json FROM verified_price_overrides WHERE product_id = ? AND venue_id = ?`
  ).get(product_id, req.venueId);

  let oldPriceNis = null;
  if (existing) {
    try { oldPriceNis = JSON.parse(existing.normalized_update_json).actual_venue_price_nis ?? null; } catch {}
  }

  db.prepare(`
    DELETE FROM verified_price_overrides WHERE product_id = ? AND venue_id = ?
  `).run(product_id, req.venueId);

  if (existing) {
    db.prepare(`
      INSERT INTO verified_price_audit_log
        (id, product_id, venue_id, action, old_price_nis, new_price_nis, supplier_name, source_type, saved_by, saved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id('audit'), product_id, req.venueId, 'clear',
      oldPriceNis, null, null, null,
      req.verifiedPriceUser, nowIso()
    );
  }

  res.json({ ok: true, product_id });
});

app.get("/api/verified-price-audit-log", requireVerifiedPriceAccess, (req, res) => {
  const productId = req.query.product_id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  if (!productId) {
    return res.status(400).json({ error: 'product_id query parameter is required.' });
  }

  const rows = db.prepare(`
    SELECT id, product_id, action, old_price_nis, new_price_nis, supplier_name, source_type, saved_by, saved_at
    FROM verified_price_audit_log
    WHERE product_id = ? AND venue_id = ?
    ORDER BY saved_at DESC
    LIMIT ?
  `).all(productId, req.venueId, limit);

  res.json({ log: rows });
});

// ─── Event Module ────────────────────────────────────────────────────────────

function eventDueDate(eventDate, daysOffset) {
  const d = new Date(eventDate);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

function generateEventTasks(event) {
  const d = event.event_date;
  return [
    { title: `Send invitations for ${event.name}`,   assigned_role: 'manager',     due_date: eventDueDate(d, -21) },
    { title: `Confirm staffing for ${event.name}`,   assigned_role: 'manager',     due_date: eventDueDate(d, -14) },
    { title: `Build cocktail menu for ${event.name}`, assigned_role: 'bar_manager', due_date: eventDueDate(d, -7)  },
    { title: `Build food menu for ${event.name}`,    assigned_role: 'manager',     due_date: eventDueDate(d, -7)  },
    { title: `Finalize seating for ${event.name}`,   assigned_role: 'manager',     due_date: eventDueDate(d, -3)  },
  ];
}

function eventRow(row) {
  return {
    id: row.id, venue_id: row.venue_id, name: row.name,
    event_type: row.event_type, event_date: row.event_date,
    start_time: row.start_time, end_time: row.end_time, status: row.status,
    client_name: row.client_name, client_phone: row.client_phone || null,
    client_email: row.client_email || null, expected_guests: row.expected_guests,
    table_count: row.table_count, host_message: row.host_message || null,
    theme_color: row.theme_color, plus_one_allowed: Boolean(row.plus_one_allowed),
    location: row.location || null, notes: row.notes || null,
    portal_token: row.portal_token, created_by: row.created_by,
    created_at: row.created_at, updated_at: row.updated_at,
    // ZOHAR Design Intelligence — creative direction inputs
    aesthetic_subgenre:       row.aesthetic_subgenre       || null,
    single_sentence:          row.single_sentence          || null,
    anti_reference:           row.anti_reference           || null,
    venue_character:          row.venue_character          || null,
    primary_impact_moment:    row.primary_impact_moment    || null,
    confirmed_mood_keywords:  row.confirmed_mood_keywords
      ? JSON.parse(row.confirmed_mood_keywords) : null,
  };
}

function guestRow(row) {
  return {
    id: row.id, event_id: row.event_id, name: row.name,
    phone: row.phone || null, email: row.email || null,
    guest_group: row.guest_group || null, rsvp_status: row.rsvp_status,
    adult_count: row.adult_count, children_count: row.children_count,
    dietary_notes: row.dietary_notes || null,
    dietary_presets: row.dietary_presets ? JSON.parse(row.dietary_presets) : [],
    transport_needed: Boolean(row.transport_needed),
    personal_message: row.personal_message || null,
    table_id: row.table_id || null, gift_amount: row.gift_amount || null,
    accessibility: row.accessibility || null, vip: Boolean(row.vip),
    checked_in: Boolean(row.checked_in), checked_in_at: row.checked_in_at || null,
    invitation_sent_at: row.invitation_sent_at || null, source: row.source,
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

function tableRow(row) {
  return {
    id: row.id, event_id: row.event_id, table_number: row.table_number,
    capacity: row.capacity, shape: row.shape, label: row.label || null,
    position_x: row.position_x, position_y: row.position_y, created_at: row.created_at,
  };
}

function taskRow(row) {
  return {
    id: row.id, event_id: row.event_id, title: row.title,
    assigned_role: row.assigned_role, due_date: row.due_date || null,
    status: row.status, notes: row.notes || null,
    auto_generated: Boolean(row.auto_generated),
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

function timelineRow(row) {
  return {
    id: row.id, event_id: row.event_id, actor: row.actor,
    actor_role: row.actor_role || null, action_type: row.action_type,
    description: row.description,
    metadata: row.metadata_json ? JSON.parse(row.metadata_json) : null,
    created_at: row.created_at,
  };
}

function addTimeline(eventId, actor, actorRole, actionType, description, metadata = null) {
  db.prepare(`
    INSERT INTO event_timeline (id, event_id, actor, actor_role, action_type, description, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id('etl'), eventId, actor, actorRole, actionType, description,
    metadata ? JSON.stringify(metadata) : null, nowIso());
}

function requireEventVenue(req, res, next) {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND venue_id = ?')
    .get(req.params.id, req.venueId);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  req.event = event;
  next();
}

// ── Events CRUD ──────────────────────────────────────────────────────────────

app.get('/api/events', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM events WHERE venue_id = ? ORDER BY event_date ASC
  `).all(req.venueId);
  res.json({ events: rows.map(eventRow) });
});

app.post('/api/events', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), (req, res) => {
  const b = req.body;
  const token = randomUUID();
  const now = nowIso();
  const evt = {
    id: id('evt'), venue_id: req.venueId,
    name: String(b.name || 'Untitled Event'),
    event_type: b.event_type || 'other',
    event_date: String(b.event_date || now.slice(0, 10)),
    start_time: String(b.start_time || '18:00'),
    end_time: String(b.end_time || '23:00'),
    status: 'draft',
    client_name: String(b.client_name || ''),
    client_phone: b.client_phone || null,
    client_email: b.client_email || null,
    expected_guests: Number(b.expected_guests) || 0,
    table_count: Number(b.table_count) || 0,
    host_message: b.host_message || null,
    theme_color: b.theme_color || '#c9a96e',
    plus_one_allowed: b.plus_one_allowed !== false ? 1 : 0,
    location: b.location || null,
    notes: b.notes || null,
    portal_token: token,
    created_by: req.user.full_name,
    created_at: now, updated_at: now,
    // ZOHAR Design Intelligence fields
    aesthetic_subgenre:    b.aesthetic_subgenre    || null,
    single_sentence:       b.single_sentence       || null,
    anti_reference:        b.anti_reference        || null,
    venue_character:       b.venue_character       || null,
    primary_impact_moment: b.primary_impact_moment || null,
    confirmed_mood_keywords: Array.isArray(b.confirmed_mood_keywords)
      ? JSON.stringify(b.confirmed_mood_keywords) : null,
  };
  db.prepare(`
    INSERT INTO events (id,venue_id,name,event_type,event_date,start_time,end_time,status,
      client_name,client_phone,client_email,expected_guests,table_count,host_message,
      theme_color,plus_one_allowed,location,notes,portal_token,created_by,created_at,updated_at,
      aesthetic_subgenre,single_sentence,anti_reference,venue_character,primary_impact_moment,confirmed_mood_keywords)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(evt.id,evt.venue_id,evt.name,evt.event_type,evt.event_date,evt.start_time,evt.end_time,
    evt.status,evt.client_name,evt.client_phone,evt.client_email,evt.expected_guests,evt.table_count,
    evt.host_message,evt.theme_color,evt.plus_one_allowed,evt.location,evt.notes,
    evt.portal_token,evt.created_by,evt.created_at,evt.updated_at,
    evt.aesthetic_subgenre,evt.single_sentence,evt.anti_reference,evt.venue_character,
    evt.primary_impact_moment,evt.confirmed_mood_keywords);

  db.prepare(`INSERT INTO guest_portal_tokens (token, event_id, created_at) VALUES (?,?,?)`)
    .run(token, evt.id, now);

  // Auto-generate tasks
  const tasks = generateEventTasks(evt);
  const insertTask = db.prepare(`
    INSERT INTO event_tasks (id,event_id,venue_id,title,assigned_role,due_date,status,auto_generated,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
  const insertNotif = db.prepare(
    `INSERT INTO notifications (id,venue_id,target_role,title,body,type,page,created_at) VALUES (?,?,?,?,?,?,?,?)`
  );
  for (const t of tasks) {
    insertTask.run(id('etask'), evt.id, req.venueId, t.title, t.assigned_role, t.due_date, 'open', 1, now, now);
  }

  // Notify bar_manager about cocktail/bar prep tasks
  const barTask = tasks.find(t => t.assigned_role === 'bar_manager');
  if (barTask) {
    insertNotif.run(id('notif'), req.venueId, 'bar_manager',
      'New event task assigned',
      `${barTask.title} — due ${barTask.due_date || 'TBD'}`,
      'event_task', 'eventCRM', now);
  }
  // Notify manager about the new event
  insertNotif.run(id('notif'), req.venueId, 'manager',
    `New event created: ${evt.name}`,
    `${evt.name} on ${evt.event_date} for ${evt.expected_guests} guests`,
    'event', 'eventCRM', now);

  addTimeline(evt.id, req.user.full_name, req.user.role, 'event_created',
    `Event created: ${evt.name} on ${evt.event_date}`);

  res.status(201).json({ event: eventRow(evt) });
});

app.get('/api/events/:id', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), (req, res) => {
  const row = db.prepare('SELECT * FROM events WHERE id = ? AND venue_id = ?')
    .get(req.params.id, req.venueId);
  if (!row) return res.status(404).json({ error: 'Event not found.' });
  res.json({ event: eventRow(row) });
});

app.patch('/api/events/:id', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ? AND venue_id = ?')
    .get(req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: 'Event not found.' });
  const b = req.body;
  const now = nowIso();
  const fields = [], vals = [];
  const allowed = ['name','event_type','event_date','start_time','end_time','status','client_name',
    'client_phone','client_email','expected_guests','table_count','host_message','theme_color',
    'plus_one_allowed','location','notes',
    'aesthetic_subgenre','single_sentence','anti_reference','venue_character','primary_impact_moment'];
  for (const f of allowed) {
    if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); }
  }
  // confirmed_mood_keywords is an array — serialize before storing
  if (b.confirmed_mood_keywords !== undefined) {
    fields.push('confirmed_mood_keywords=?');
    vals.push(Array.isArray(b.confirmed_mood_keywords) ? JSON.stringify(b.confirmed_mood_keywords) : null);
  }
  if (!fields.length) return res.status(400).json({ error: 'No fields to update.' });
  fields.push('updated_at=?'); vals.push(now);
  db.prepare(`UPDATE events SET ${fields.join(',')} WHERE id=?`).run(...vals, req.params.id);
  if (b.status && b.status !== existing.status) {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'status_changed',
      `Status changed from ${existing.status} to ${b.status}`,
      { from: existing.status, to: b.status });
  }
  const updated = db.prepare('SELECT * FROM events WHERE id=?').get(req.params.id);
  res.json({ event: eventRow(updated) });
});

app.delete('/api/events/:id', requireAuth('owner', 'admin'), (req, res) => {
  const existing = db.prepare('SELECT id,name FROM events WHERE id=? AND venue_id=?')
    .get(req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: 'Event not found.' });
  db.prepare(`UPDATE events SET status='cancelled', updated_at=? WHERE id=?`)
    .run(nowIso(), req.params.id);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'event_cancelled',
    `Event cancelled: ${existing.name}`);
  res.json({ ok: true });
});

// ── Guests ───────────────────────────────────────────────────────────────────

app.get('/api/events/:id/guests', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const rows = db.prepare('SELECT * FROM event_guests WHERE event_id=? AND venue_id=? ORDER BY name ASC')
    .all(req.params.id, req.venueId);
  res.json({ guests: rows.map(guestRow) });
});

app.post('/api/events/:id/guests', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const b = req.body;
  const now = nowIso();
  const g = {
    id: id('eg'), event_id: req.params.id, venue_id: req.venueId,
    name: String(b.name || '').trim(),
    phone: b.phone || null, email: b.email || null,
    guest_group: b.guest_group || null, rsvp_status: b.rsvp_status || 'no_response',
    adult_count: Number(b.adult_count) || 1, children_count: Number(b.children_count) || 0,
    dietary_notes: b.dietary_notes || null,
    dietary_presets: b.dietary_presets ? JSON.stringify(b.dietary_presets) : null,
    transport_needed: b.transport_needed ? 1 : 0,
    personal_message: b.personal_message || null, table_id: null,
    gift_amount: b.gift_amount || null, accessibility: b.accessibility || null,
    vip: b.vip ? 1 : 0, checked_in: 0, source: b.source || 'manual',
    created_at: now, updated_at: now,
  };
  if (!g.name) return res.status(400).json({ error: 'Guest name is required.' });
  db.prepare(`
    INSERT INTO event_guests (id,event_id,venue_id,name,phone,email,guest_group,rsvp_status,
      adult_count,children_count,dietary_notes,dietary_presets,transport_needed,personal_message,
      table_id,gift_amount,accessibility,vip,checked_in,source,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(g.id,g.event_id,g.venue_id,g.name,g.phone,g.email,g.guest_group,g.rsvp_status,
    g.adult_count,g.children_count,g.dietary_notes,g.dietary_presets,g.transport_needed,
    g.personal_message,g.table_id,g.gift_amount,g.accessibility,g.vip,g.checked_in,
    g.source,g.created_at,g.updated_at);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_added',
    `Guest added: ${g.name}`, { guest_id: g.id });
  res.status(201).json({ guest: { ...g, dietary_presets: b.dietary_presets || [] } });
});

app.post('/api/events/:id/guests/import', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const guests = Array.isArray(req.body.guests) ? req.body.guests : [];
  if (!guests.length) return res.status(400).json({ error: 'guests array required.' });
  const now = nowIso();
  const inserted = [], skipped = [];
  const insertG = db.prepare(`
    INSERT OR IGNORE INTO event_guests
      (id,event_id,venue_id,name,phone,email,guest_group,rsvp_status,adult_count,
       children_count,source,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const g of guests) {
    const name = String(g.name || '').trim();
    if (!name) continue;
    const existing = db.prepare('SELECT id FROM event_guests WHERE event_id=? AND venue_id=? AND LOWER(name)=? AND (phone IS NULL OR phone=? OR ?=\'\')')
      .get(req.params.id, req.venueId, name.toLowerCase(), g.phone || '', g.phone || '');
    if (existing) { skipped.push(name); continue; }
    const newId = id('eg');
    insertG.run(newId, req.params.id, req.venueId, name,
      g.phone || null, g.email || null, g.guest_group || null,
      'no_response', Number(g.adult_count) || 1, Number(g.children_count) || 0,
      'import', now, now);
    inserted.push(name);
  }
  if (inserted.length) {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'guests_imported',
      `${inserted.length} guest(s) imported. ${skipped.length} skipped (duplicates).`);
  }
  res.json({ inserted: inserted.length, skipped: skipped.length });
});

app.patch('/api/events/:id/guests/:guestId', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const existing = db.prepare('SELECT * FROM event_guests WHERE id=? AND event_id=? AND venue_id=?')
    .get(req.params.guestId, req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: 'Guest not found.' });
  const b = req.body; const now = nowIso();
  const fields = [], vals = [];
  const allowed = ['name','phone','email','guest_group','rsvp_status','adult_count','children_count',
    'dietary_notes','transport_needed','personal_message','table_id','gift_amount','accessibility','vip'];
  if (b.table_id) {
    const targetTable = db.prepare('SELECT id FROM event_tables WHERE id=? AND event_id=? AND venue_id=?')
      .get(b.table_id, req.params.id, req.venueId);
    if (!targetTable) return res.status(404).json({ error: 'Table not found.' });
  }
  for (const f of allowed) { if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); } }
  if (b.dietary_presets !== undefined) { fields.push('dietary_presets=?'); vals.push(JSON.stringify(b.dietary_presets)); }
  if (!fields.length) return res.status(400).json({ error: 'No fields to update.' });
  fields.push('updated_at=?'); vals.push(now);
  db.prepare(`UPDATE event_guests SET ${fields.join(',')} WHERE id=? AND event_id=? AND venue_id=?`).run(...vals, req.params.guestId, req.params.id, req.venueId);
  if (b.rsvp_status && b.rsvp_status !== existing.rsvp_status) {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_rsvp',
      `${existing.name} RSVP updated: ${b.rsvp_status}`, { guest: existing.name, status: b.rsvp_status });
  }
  const updated = db.prepare('SELECT * FROM event_guests WHERE id=? AND event_id=? AND venue_id=?').get(req.params.guestId, req.params.id, req.venueId);
  res.json({ guest: guestRow(updated) });
});

app.delete('/api/events/:id/guests/:guestId', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const g = db.prepare('SELECT id,name FROM event_guests WHERE id=? AND event_id=? AND venue_id=?')
    .get(req.params.guestId, req.params.id, req.venueId);
  if (!g) return res.status(404).json({ error: 'Guest not found.' });
  db.prepare('DELETE FROM event_guests WHERE id=? AND event_id=? AND venue_id=?').run(req.params.guestId, req.params.id, req.venueId);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_removed', `Guest removed: ${g.name}`);
  res.json({ ok: true });
});

app.post('/api/events/:id/guests/:guestId/checkin', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const g = db.prepare('SELECT * FROM event_guests WHERE id=? AND event_id=? AND venue_id=?')
    .get(req.params.guestId, req.params.id, req.venueId);
  if (!g) return res.status(404).json({ error: 'Guest not found.' });
  const now = nowIso();
  db.prepare(`UPDATE event_guests SET checked_in=1, checked_in_at=?, updated_at=? WHERE id=? AND event_id=? AND venue_id=?`)
    .run(now, now, req.params.guestId, req.params.id, req.venueId);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_checkin',
    `${g.name} checked in`, { guest_id: g.id });
  res.json({ ok: true, checked_in_at: now });
});

// ── Tables / Seating ─────────────────────────────────────────────────────────

app.get('/api/events/:id/tables', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const tables = db.prepare('SELECT * FROM event_tables WHERE event_id=? AND venue_id=? ORDER BY table_number ASC')
    .all(req.params.id, req.venueId);
  const guests = db.prepare('SELECT id,name,rsvp_status,table_id FROM event_guests WHERE event_id=? AND venue_id=?')
    .all(req.params.id, req.venueId);
  const result = tables.map(t => ({
    ...tableRow(t),
    guests: guests.filter(g => g.table_id === t.id).map(g => ({ id: g.id, name: g.name, rsvp_status: g.rsvp_status })),
  }));
  res.json({ tables: result });
});

app.post('/api/events/:id/tables', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const b = req.body; const now = nowIso();
  const t = {
    id: id('etbl'), event_id: req.params.id, venue_id: req.venueId,
    table_number: Number(b.table_number) || 1,
    capacity: Number(b.capacity) || 10,
    shape: b.shape || 'round', label: b.label || null,
    position_x: Number(b.position_x) || 0, position_y: Number(b.position_y) || 0,
    created_at: now,
  };
  db.prepare(`
    INSERT INTO event_tables (id,event_id,venue_id,table_number,capacity,shape,label,position_x,position_y,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(t.id,t.event_id,t.venue_id,t.table_number,t.capacity,t.shape,t.label,t.position_x,t.position_y,t.created_at);
  res.status(201).json({ table: tableRow(t) });
});

app.patch('/api/events/:id/tables/:tableId', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const existing = db.prepare('SELECT * FROM event_tables WHERE id=? AND event_id=? AND venue_id=?')
    .get(req.params.tableId, req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: 'Table not found.' });
  const b = req.body; const fields = [], vals = [];
  for (const f of ['table_number','capacity','shape','label','position_x','position_y']) {
    if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); }
  }
  if (!fields.length) return res.status(400).json({ error: 'No fields to update.' });
  db.prepare(`UPDATE event_tables SET ${fields.join(',')} WHERE id=? AND event_id=? AND venue_id=?`).run(...vals, req.params.tableId, req.params.id, req.venueId);
  const updated = db.prepare('SELECT * FROM event_tables WHERE id=? AND event_id=? AND venue_id=?').get(req.params.tableId, req.params.id, req.venueId);
  res.json({ table: tableRow(updated) });
});

app.delete('/api/events/:id/tables/:tableId', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  if (!db.prepare('SELECT id FROM event_tables WHERE id=? AND event_id=? AND venue_id=?').get(req.params.tableId, req.params.id, req.venueId)) {
    return res.status(404).json({ error: 'Table not found.' });
  }
  db.prepare('UPDATE event_guests SET table_id=NULL WHERE table_id=? AND event_id=? AND venue_id=?').run(req.params.tableId, req.params.id, req.venueId);
  db.prepare('DELETE FROM event_tables WHERE id=? AND event_id=? AND venue_id=?').run(req.params.tableId, req.params.id, req.venueId);
  res.json({ ok: true });
});

app.post('/api/events/:id/tables/assign', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const { guest_id, table_id } = req.body;
  if (!guest_id) return res.status(400).json({ error: 'guest_id required.' });
  const g = db.prepare('SELECT * FROM event_guests WHERE id=? AND event_id=? AND venue_id=?')
    .get(guest_id, req.params.id, req.venueId);
  if (!g) return res.status(404).json({ error: 'Guest not found.' });
  const now = nowIso();
  let tbl = null;
  if (table_id) {
    tbl = db.prepare('SELECT table_number FROM event_tables WHERE id=? AND event_id=? AND venue_id=?')
      .get(table_id, req.params.id, req.venueId);
    if (!tbl) return res.status(404).json({ error: 'Table not found.' });
  }
  db.prepare('UPDATE event_guests SET table_id=?, updated_at=? WHERE id=? AND event_id=? AND venue_id=?').run(table_id || null, now, guest_id, req.params.id, req.venueId);
  if (table_id) {
    db.prepare(`INSERT INTO event_guest_table_assignments (id,event_id,guest_id,table_id,assigned_by,assigned_at) VALUES (?,?,?,?,?,?)`)
      .run(id('egta'), req.params.id, guest_id, table_id, req.user.full_name, now);
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_seated',
      `${g.name} assigned to Table ${tbl?.table_number ?? '?'}`, { guest_id, table_id });
  } else {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_unseated',
      `${g.name} removed from table`);
  }
  res.json({ ok: true });
});

// ── Tasks ────────────────────────────────────────────────────────────────────

app.get('/api/events/:id/tasks', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const rows = db.prepare('SELECT * FROM event_tasks WHERE event_id=? AND venue_id=? ORDER BY due_date ASC, created_at ASC')
    .all(req.params.id, req.venueId);
  res.json({ tasks: rows.map(taskRow) });
});

app.post('/api/events/:id/tasks', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const b = req.body; const now = nowIso();
  const t = {
    id: id('etask'), event_id: req.params.id, venue_id: req.venueId,
    title: String(b.title || '').trim(),
    assigned_role: b.assigned_role || 'manager',
    due_date: b.due_date || null, status: 'open',
    notes: b.notes || null, auto_generated: 0,
    created_at: now, updated_at: now,
  };
  if (!t.title) return res.status(400).json({ error: 'Task title required.' });
  db.prepare(`
    INSERT INTO event_tasks (id,event_id,venue_id,title,assigned_role,due_date,status,notes,auto_generated,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(t.id,t.event_id,t.venue_id,t.title,t.assigned_role,t.due_date,t.status,t.notes,t.auto_generated,t.created_at,t.updated_at);
  res.status(201).json({ task: t });
});

app.patch('/api/events/:id/tasks/:taskId', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const existing = db.prepare('SELECT * FROM event_tasks WHERE id=? AND event_id=? AND venue_id=?')
    .get(req.params.taskId, req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: 'Task not found.' });
  const b = req.body; const now = nowIso(); const fields = [], vals = [];
  for (const f of ['title','assigned_role','due_date','status','notes']) {
    if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); }
  }
  fields.push('updated_at=?'); vals.push(now);
  db.prepare(`UPDATE event_tasks SET ${fields.join(',')} WHERE id=? AND event_id=? AND venue_id=?`).run(...vals, req.params.taskId, req.params.id, req.venueId);
  if (b.status === 'done' && existing.status !== 'done') {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'task_completed',
      `Task completed: ${existing.title}`);
  }
  const updated = db.prepare('SELECT * FROM event_tasks WHERE id=? AND event_id=? AND venue_id=?').get(req.params.taskId, req.params.id, req.venueId);
  res.json({ task: taskRow(updated) });
});

// ── Timeline ─────────────────────────────────────────────────────────────────

app.get('/api/events/:id/timeline', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const rows = db.prepare('SELECT * FROM event_timeline WHERE event_id=? ORDER BY created_at ASC')
    .all(req.params.id);
  res.json({ timeline: rows.map(timelineRow) });
});

// ── Messages ─────────────────────────────────────────────────────────────────

app.get('/api/events/:id/messages', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const rows = db.prepare('SELECT * FROM event_messages WHERE event_id=? ORDER BY created_at DESC')
    .all(req.params.id);
  res.json({ messages: rows });
});

app.post('/api/events/:id/messages', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const b = req.body;
  const recipients = Array.isArray(b.recipients) ? b.recipients : [];
  if (!recipients.length) return res.status(400).json({ error: 'recipients array required.' });
  const now = nowIso();
  const inserted = [];
  const insertMsg = db.prepare(`
    INSERT INTO event_messages (id,event_id,guest_id,template_type,channel,recipient_phone,
      recipient_name,body,status,scheduled_for,sent_at,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const r of recipients) {
    const msgId = id('emsg');
    insertMsg.run(msgId, req.params.id, r.guest_id || null,
      b.template_type || 'custom', b.channel || 'whatsapp',
      r.phone || '', r.name || '', b.body || '',
      'sent', b.scheduled_for || null, now, now);
    inserted.push(msgId);
    if (r.guest_id) {
      db.prepare('UPDATE event_guests SET invitation_sent_at=? WHERE id=? AND event_id=? AND venue_id=?').run(now, r.guest_id, req.params.id, req.venueId);
    }
  }
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'message_sent',
    `${inserted.length} ${b.template_type || 'custom'} message(s) sent via ${b.channel || 'whatsapp'}`);
  res.status(201).json({ sent: inserted.length });
});

// ── Cocktail Menus ────────────────────────────────────────────────────────────

app.get('/api/events/:id/cocktail-menu', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const row = db.prepare('SELECT * FROM event_cocktail_menus WHERE event_id=? AND venue_id=?').get(req.params.id, req.venueId);
  if (!row) return res.json({ menu: null });
  res.json({ menu: {
    id: row.id,
    menu_name: row.menu_name,
    cocktails: JSON.parse(row.menu_json),
    status: row.status,
    programme_brief: row.programme_brief_json ? JSON.parse(row.programme_brief_json) : null,
  }});
});

app.post('/api/events/:id/cocktail-menu', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const { menu_name, cocktails, programme_brief } = req.body;
  if (!Array.isArray(cocktails) || !cocktails.length) return res.status(400).json({ error: 'cocktails array required.' });
  const now = nowIso();
  const existing = db.prepare('SELECT id, programme_brief_json FROM event_cocktail_menus WHERE event_id=? AND venue_id=?').get(req.params.id, req.venueId);
  const menuId = existing ? existing.id : id('ecm');
  const briefJson = programme_brief ? JSON.stringify(programme_brief) : (existing?.programme_brief_json || null);
  db.prepare(`
    INSERT INTO event_cocktail_menus (id,event_id,venue_id,menu_name,menu_json,programme_brief_json,status,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,'draft',?,?,?)
    ON CONFLICT(event_id) DO UPDATE SET menu_name=excluded.menu_name, menu_json=excluded.menu_json, programme_brief_json=COALESCE(excluded.programme_brief_json, programme_brief_json), status='draft', updated_at=excluded.updated_at
  `).run(menuId, req.params.id, req.venueId, menu_name || null, JSON.stringify(cocktails), briefJson, req.user.full_name, now, now);
  const row = db.prepare('SELECT * FROM event_cocktail_menus WHERE event_id=? AND venue_id=?').get(req.params.id, req.venueId);
  res.status(201).json({ menu: {
    id: row.id,
    menu_name: row.menu_name,
    cocktails: JSON.parse(row.menu_json),
    status: row.status,
    programme_brief: row.programme_brief_json ? JSON.parse(row.programme_brief_json) : null,
  }});
});

app.patch('/api/events/:id/cocktail-menu/programme-brief', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const { brief } = req.body;
  if (!brief || typeof brief !== 'object') return res.status(400).json({ error: 'brief object required.' });
  const existing = db.prepare('SELECT id FROM event_cocktail_menus WHERE event_id=? AND venue_id=?').get(req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: 'No cocktail menu found. Generate a menu first.' });
  const now = nowIso();
  db.prepare('UPDATE event_cocktail_menus SET programme_brief_json=?, updated_at=? WHERE event_id=? AND venue_id=?')
    .run(JSON.stringify(brief), now, req.params.id, req.venueId);
  res.json({ ok: true });
});

app.patch('/api/events/:id/cocktail-menu/approve', requireAuth('events_manager', 'manager', 'bar_manager', 'owner', 'admin'), requireEventVenue, (req, res) => {
  const existing = db.prepare('SELECT id FROM event_cocktail_menus WHERE event_id=? AND venue_id=?').get(req.params.id, req.venueId);
  if (!existing) return res.status(404).json({ error: 'No cocktail menu found for this event.' });
  const now = nowIso();
  db.prepare("UPDATE event_cocktail_menus SET status='approved', updated_at=? WHERE event_id=? AND venue_id=?").run(now, req.params.id, req.venueId);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'cocktail_menu_approved', 'Cocktail menu approved');
  res.json({ ok: true });
});

// ── Event Creative Images ─────────────────────────────────────────────────────

app.get('/api/events/:id/creative-images', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, (req, res) => {
  const rows = db.prepare('SELECT * FROM event_creative_images WHERE event_id=?').all(req.params.id);
  const heroRow = rows.find(r => r.image_type === 'hero');
  const cocktails = {};
  rows.filter(r => r.image_type === 'cocktail').forEach(r => {
    cocktails[r.cocktail_id] = { url: `/creative-images/${path.basename(r.image_path)}`, name: r.cocktail_name, created_at: r.created_at };
  });
  res.json({
    hero: heroRow ? { url: `/creative-images/${path.basename(heroRow.image_path)}`, created_at: heroRow.created_at } : null,
    cocktails,
  });
});

async function callDalle(prompt, size) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-image-2', prompt, n: 1, size }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => String(resp.status));
    throw new Error(`OpenAI ${resp.status}: ${errText}`);
  }
  const json = await resp.json();
  const b64 = json.data[0].b64_json;
  if (!b64) throw new Error('No image data in response');
  return Buffer.from(b64, 'base64');
}

function buildHeroPrompt(event, sections) {
  const typeMap = {
    wedding:   'romantic luxury wedding celebration',
    corporate: 'elevated corporate hospitality event',
    private:   'intimate private luxury gathering',
    bar_event: 'exclusive bar event experience',
    other:     'premium curated event experience',
  };
  const typeDesc = typeMap[event.event_type] || typeMap.other;
  const mood = (sections.moodKeywords || []).slice(0, 4).join(', ');
  const palette = (sections.colorPalette || []).slice(0, 3).map(c => c.name).join(', ');
  const narrative = sections.narrative ? sections.narrative.substring(0, 140) : '';
  return [
    `Cinematic luxury hospitality atmosphere. ${typeDesc}.`,
    mood && `Mood: ${mood}.`,
    narrative && `Atmosphere: ${narrative}.`,
    palette && `Color palette: warm ${palette} tones.`,
    `Editorial luxury venue photography. No people. No text. No branding. No signage.`,
    `Aman Resorts, Four Seasons, Rafanelli Events visual language.`,
    `Soft dramatic lighting, rich textures, generous negative space, premium materials.`,
  ].filter(Boolean).join(' ');
}

function buildCocktailPrompt(cocktail, sections) {
  const mood = (sections.moodKeywords || []).slice(0, 3).join(', ');
  const palette = (sections.colorPalette || []).slice(0, 2).map(c => c.name).join(', ');
  return [
    `Premium luxury cocktail photography editorial.`,
    `Cocktail: "${cocktail.name}".`,
    cocktail.tagline && `Concept: ${cocktail.tagline}.`,
    cocktail.flavor_notes && `Flavor: ${cocktail.flavor_notes}.`,
    mood && `Event mood: ${mood}.`,
    palette && `Color atmosphere: ${palette} tones.`,
    `World's 50 Best Bars editorial photography. Moody studio, elegant dark background, rim light, premium glassware.`,
    `No text. No labels. No branding. No menu. Magazine quality still life.`,
  ].filter(Boolean).join(' ');
}

app.post('/api/events/:id/creative-images/generate', requireAuth('manager', 'bar_manager', 'owner', 'admin', 'events_manager'), requireEventVenue, async (req, res) => {
  const { event, sections, cocktails } = req.body;
  if (!event) return res.status(400).json({ error: 'event data required' });

  const eventId = req.params.id;
  const now = nowIso();
  const safeSection = sections || {};
  const safeCocktails = Array.isArray(cocktails) ? cocktails : [];

  // Remove existing images for this event
  const existing = db.prepare('SELECT image_path FROM event_creative_images WHERE event_id=?').all(eventId);
  for (const row of existing) {
    try { unlinkSync(row.image_path); } catch { /* file may already be gone */ }
  }
  db.prepare('DELETE FROM event_creative_images WHERE event_id=?').run(eventId);

  const results = { hero: null, cocktails: {} };
  const errors = [];

  const heroPrompt = buildHeroPrompt(event, safeSection);
  const cocktailTasks = safeCocktails.map(c => ({
    cocktail: c,
    prompt: buildCocktailPrompt(c, safeSection),
    cId: (c.id || c.name || 'unknown').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().slice(0, 40),
  }));

  const allTasks = [
    callDalle(heroPrompt, '1536x1024')
      .then(buf => {
        const fname = `${eventId}-hero.png`;
        const fpath = path.join(CREATIVE_IMAGES_DIR, fname);
        writeFileSync(fpath, buf);
        db.prepare(`INSERT INTO event_creative_images (id,event_id,image_type,cocktail_id,cocktail_name,prompt,image_path,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`)
          .run(id('eci'), eventId, 'hero', null, null, heroPrompt, fpath, now, now);
        results.hero = { url: `/creative-images/${fname}`, created_at: now };
      })
      .catch(e => errors.push(`hero: ${e.message}`)),

    ...cocktailTasks.map(({ cocktail, prompt, cId }) =>
      callDalle(prompt, '1024x1024')
        .then(buf => {
          const fname = `${eventId}-cocktail-${cId}.png`;
          const fpath = path.join(CREATIVE_IMAGES_DIR, fname);
          writeFileSync(fpath, buf);
          db.prepare(`INSERT INTO event_creative_images (id,event_id,image_type,cocktail_id,cocktail_name,prompt,image_path,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`)
            .run(id('eci'), eventId, 'cocktail', cId, cocktail.name, prompt, fpath, now, now);
          results.cocktails[cId] = { url: `/creative-images/${fname}`, name: cocktail.name, created_at: now };
        })
        .catch(e => errors.push(`cocktail "${cocktail.name}": ${e.message}`))
    ),
  ];

  await Promise.all(allTasks);
  res.json({ hero: results.hero, cocktails: results.cocktails, errors: errors.length ? errors : undefined });
});

// ── Guest Portal (no auth) ───────────────────────────────────────────────────

function portalCors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

app.get('/api/guest-portal/:token', portalCors, (req, res) => {
  const row = db.prepare('SELECT * FROM events WHERE portal_token=? AND status != ?')
    .get(req.params.token, 'cancelled');
  if (!row) return res.status(404).json({ error: 'Event not found or no longer active.' });
  res.json({
    name: row.name, event_date: row.event_date, start_time: row.start_time, end_time: row.end_time,
    host_message: row.host_message || null, theme_color: row.theme_color,
    plus_one_allowed: Boolean(row.plus_one_allowed), location: row.location || null,
    event_type: row.event_type,
  });
});

app.options('/api/guest-portal/:token/rsvp', portalCors, (req, res) => res.sendStatus(204));

app.post('/api/guest-portal/:token/rsvp', portalCors, (req, res) => {
  const evt = db.prepare('SELECT * FROM events WHERE portal_token=? AND status != ?')
    .get(req.params.token, 'cancelled');
  if (!evt) return res.status(404).json({ error: 'Event not found.' });
  const b = req.body;
  const name = String(b.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  const now = nowIso();
  const existing = db.prepare('SELECT * FROM event_guests WHERE event_id=? AND LOWER(name)=?')
    .get(evt.id, name.toLowerCase());
  if (existing) {
    db.prepare(`UPDATE event_guests SET rsvp_status=?,adult_count=?,children_count=?,dietary_notes=?,
      dietary_presets=?,transport_needed=?,personal_message=?,source=?,updated_at=? WHERE id=?`)
      .run(b.attending || 'yes', Number(b.adult_count) || 1, Number(b.children_count) || 0,
        b.dietary_notes || null, b.dietary_presets ? JSON.stringify(b.dietary_presets) : null,
        b.transport_needed ? 1 : 0, b.personal_message || null, 'portal', now, existing.id);
    addTimeline(evt.id, name, null, 'guest_rsvp',
      `${name} updated RSVP via portal: ${b.attending || 'yes'}`, { source: 'portal' });
    return res.json({ ok: true, updated: true });
  }
  const gId = id('eg');
  db.prepare(`
    INSERT INTO event_guests (id,event_id,venue_id,name,rsvp_status,adult_count,children_count,
      dietary_notes,dietary_presets,transport_needed,personal_message,source,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(gId, evt.id, evt.venue_id, name, b.attending || 'yes',
    Number(b.adult_count) || 1, Number(b.children_count) || 0,
    b.dietary_notes || null, b.dietary_presets ? JSON.stringify(b.dietary_presets) : null,
    b.transport_needed ? 1 : 0, b.personal_message || null, 'portal', now, now);
  addTimeline(evt.id, name, null, 'guest_rsvp',
    `${name} submitted RSVP via portal: ${b.attending || 'yes'}`, { source: 'portal', new: true });
  res.status(201).json({ ok: true, updated: false });
});

// ── Notifications ─────────────────────────────────────────────────────────────

// Phase 5 Step 1: GET now allows all authenticated roles and supports roles_json
// for multi-role notifications created by the frontend.
app.get('/api/notifications', requireAuth(), (req, res) => {
  const role = req.user.role;
  const rows = db.prepare(`
    SELECT * FROM notifications
    WHERE venue_id=?
      AND (
        target_role=?
        OR (roles_json IS NOT NULL AND EXISTS (
          SELECT 1 FROM json_each(roles_json) WHERE value=?
        ))
      )
    ORDER BY created_at DESC LIMIT 50
  `).all(req.venueId, role, role);
  res.json({ notifications: rows });
});

// Phase 5 Step 1: create a notification from the frontend.
// Hardened (security patch): validates roles against known values, sets
// created_at server-side, and truncates string fields.
const NOTIFICATION_VALID_ROLES = new Set([
  'owner', 'manager', 'bar_manager', 'employee',
  'fb_director', 'events_manager', 'chef', 'admin'
]);
app.post('/api/notifications', requireAuth(), (req, res) => {
  const { id: clientId, roles, title, body, type, page } = req.body;
  if (!title || !body || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ error: 'title, body, and roles[] are required.' });
  }
  // Strip unknown role values to prevent arbitrary strings reaching the DB
  const validRoles = roles.filter(r => typeof r === 'string' && NOTIFICATION_VALID_ROLES.has(r));
  if (!validRoles.length) {
    return res.status(400).json({ error: 'At least one valid role is required.' });
  }
  const notifId = (typeof clientId === 'string' && clientId.length <= 200) ? clientId : randomUUID();
  db.prepare(`
    INSERT OR IGNORE INTO notifications (id, venue_id, target_role, title, body, type, page, read, created_at, roles_json)
    VALUES (?,?,?,?,?,?,?,0,?,?)
  `).run(
    notifId, req.venueId, validRoles[0],
    String(title).slice(0, 200), String(body).slice(0, 500),
    String(type || 'info').slice(0, 50),
    page ? String(page).slice(0, 100) : null,
    nowIso(),  // always server-side — client created_at is ignored
    JSON.stringify(validRoles)
  );
  res.status(201).json({ ok: true });
});

// Hardened (security patch): role ownership check added so users can only
// mark notifications that are actually visible to their own role as read.
app.patch('/api/notifications/:id/read', requireAuth(), (req, res) => {
  const role = req.user.role;
  db.prepare(`
    UPDATE notifications SET read=1
    WHERE id=? AND venue_id=?
      AND (target_role=? OR (roles_json IS NOT NULL AND EXISTS (
        SELECT 1 FROM json_each(roles_json) WHERE value=?
      )))
  `).run(req.params.id, req.venueId, role, role);
  res.json({ ok: true });
});

// ── Guest portal SPA route (production) ──────────────────────────────────────
app.get('/event/:token/guest', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ════════════════════════════════════════════════════════════════════════════════
// CI MODULE ADDITION — COCKTAIL INTELLIGENCE
// All routes under /api/ci/  |  All roles: owner, manager, bar_manager, admin
// No existing routes or tables were modified to add this block.
// ════════════════════════════════════════════════════════════════════════════════

const CI_ROLES = ['owner', 'manager', 'bar_manager', 'admin', 'fb_director'];

// ── CI Helpers ────────────────────────────────────────────────────────────────

function getCIDna(venueId) {
  return db.prepare(
    'SELECT * FROM cocktail_intelligence_dna WHERE venue_id = ? ORDER BY updated_at DESC LIMIT 1'
  ).get(venueId) || null;
}

// CI MODULE ADDITION — maps raw DB record to UI-friendly field names for API responses
function formatDnaForApi(raw) {
  if (!raw) return null;
  const meta = JSON.parse(raw.meta_json || '{}');
  return {
    ...raw,
    bar_name:         raw.venue_name,
    target_guest:     raw.audience_type,
    price_tier:       raw.price_range,
    hero_ingredients: raw.hero_ingredient,
    kosher_aware:     raw.is_kosher === 'yes' || raw.is_kosher === 'events_only',
    ...meta,
  };
}

function getCITasteDna(venueId) {
  return db.prepare('SELECT * FROM cocktail_taste_dna WHERE venue_id = ?').get(venueId) || null;
}

function getCurrentSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

function buildDnaContextString(dna) {
  if (!dna) return 'No Bar DNA configured for this venue.';
  const equipment = JSON.parse(dna.equipment_json || '[]').join(', ') || 'basic bar tools';
  const glassware = JSON.parse(dna.glassware_json || '[]').join(', ') || 'standard glassware';
  const flavors   = JSON.parse(dna.flavor_identity_json || '[]').join(', ') || 'not specified';
  const meta      = JSON.parse(dna.meta_json || '{}'); // CI MODULE ADDITION — include rich meta fields
  return [
    `Venue: ${dna.venue_name}`,
    `Type: ${dna.venue_type}`,
    `Atmosphere: ${dna.atmosphere}`,
    `Cuisine: ${dna.cuisine_style}`,
    `Audience: ${dna.audience_age_min}–${dna.audience_age_max}, ${dna.audience_type}`,
    `Staff skill: ${dna.staff_skill}`,
    `Equipment: ${equipment}`,
    `Glassware: ${glassware}`,
    `Kosher policy: ${dna.is_kosher}`,
    `Flavor identity: ${flavors}`,
    `Price range: ${dna.price_range}`,
    `Service pressure: ${dna.service_pressure}`,
    `Hero ingredient: ${dna.hero_ingredient || 'not specified'}`,
    // CI MODULE ADDITION — additional meta fields from the UI Bar DNA form
    meta.concept                 && `Bar concept: ${meta.concept}`,
    meta.signature_style         && `Signature style: ${meta.signature_style}`,
    meta.excluded_ingredients    && `NEVER USE these ingredients: ${meta.excluded_ingredients}`,
    meta.spirit_focus            && `Spirit focus: ${meta.spirit_focus}`,
    meta.non_alcoholic_ratio     && `Non-alcoholic target: ${meta.non_alcoholic_ratio}`,
    meta.seasonal_approach       && `Seasonal approach: ${meta.seasonal_approach}`,
    meta.local_sourcing_priority && `Local sourcing priority: ${meta.local_sourcing_priority}`,
    meta.menu_size_target        && `Menu size target: ${meta.menu_size_target}`,
    meta.notes                   && `Director notes (always follow): ${meta.notes}`,
  ].filter(Boolean).join('\n');
}

function buildTasteDnaContextString(tasteDna) {
  if (!tasteDna) return 'No taste history recorded yet.';
  const rejectedFlavors  = JSON.parse(tasteDna.rejected_flavors_json  || '[]');
  const rejectedSpirits  = JSON.parse(tasteDna.rejected_spirits_json  || '[]');
  const parts = [];
  if (rejectedFlavors.length) {
    parts.push('Rejected flavor patterns: ' + rejectedFlavors.map(r => `${r.pattern} (rejected ${r.count}x)`).join(', '));
  }
  if (rejectedSpirits.length) {
    parts.push('Rejected spirit categories: ' + rejectedSpirits.join(', '));
  }
  return parts.length ? parts.join('\n') : 'No strong rejection patterns yet.';
}

// Builds a scored JSON format block for inclusion in generation prompts
const SCORE_INSTRUCTIONS = `
For each cocktail provide a "scores" object:
{
  "flavor_balance": 1-10,
  "menu_fit": 1-10,
  "profit_score": 1-10,
  "prep_complexity": 1-10 (10=very easy, 1=extremely complex),
  "staff_execution": 1-10,
  "guest_appeal": 1-10,
  "originality": 1-10,
  "seasonal_fit": 1-10,
  "speed_of_service": 1-10,
  "kosher_readiness": 1-10,
  "premium_perception": 1-10,
  "overall": 1-10,
  "low_score_notes": [{"score_name": "string", "reason": "string", "fix": "string"}]
}
Include low_score_notes only for scores below 7.`.trim();

const DIRECTOR_PERSONA = `You are HESTIA Beverage Director — a world-class AI Beverage Director, not a recipe generator. You think like the world's best 1,000 bartenders and mixologists combined. You have the instincts of Lorenzo Antinori, the rigor of Ago Perrone, the creativity of Ryan Chetiyawardana, and the commercial discipline of a bar owner who has survived 15 years in hospitality.

You do not hedge. You have opinions. You tell the truth about a bad menu. You push back when something won't work — and explain exactly why. You get excited about great ideas.

Every recommendation is filtered through three lenses:
1. Hospitality first — does this make the guest feel seen and at home?
2. Commercial discipline — does this protect the venue's margin?
3. Contextual intelligence — is this right for THIS venue, team, and guest?

ISRAELI MARKET — ALWAYS ACTIVE:
- VAT: 18% — all menu prices are VAT-inclusive. Net price = Gross ÷ 1.18
- Spirit excise tax: ILS 100.24 per liter of pure alcohol (LPA)
- Cocktail price reality: Market average ~ILS 55–57. Premium ceiling: ILS 68. Never recommend above ILS 68 for standard premium positioning.
- Lime seasonal spike: up to ILS 35/kg in winter — always flag and suggest acid-adjusted alternative
- Israeli ingredients are context, not a default. Never force local ingredients.
- Carob: niche, not mainstream. Tahini: not an established cocktail ingredient in Israeli bar culture.

Wholesale benchmarks (excl. VAT):
Stolichnaya 1L: ILS 72.50 | Bombay Sapphire 1L: ILS 100.80 | Jameson 1L: ILS 110.00 | JW Black 1L: ILS 118.60 | Aperol 1L: ILS 71.95 | St. Germain 700ml: ILS 160.17 | Elite Arak 700ml: ILS 54.15 | Lemons: ILS 14.90/kg → ILS 0.0426/ml juice

GP benchmarks:
- Casual bar: ILS 38–52 menu price, 14–17% pour cost
- Premium restaurant/bar: ILS 52–68 menu price, 16–19% pour cost
- Luxury hotel: ILS 65–85 menu price, 12–15% pour cost

BEHAVIORAL RULES:
1. Never fabricate prices or kosher status
2. Always calculate — show the formula and the work
3. Prioritize absolute GP in ILS over pour cost percentage
4. Kosher is a design parameter — shapes every decision from the start
5. Always flag seasonal produce risk in citrus-heavy recipes
6. Every recommended drink gets a server recommendation script

COCKTAIL NAMING:
Choose the single best name for each cocktail. The name must do one of the following:
- Root the drink in a specific place, street, or cultural moment
- Capture a feeling or occasion in 1–3 words
- Surprise and intrigue — a name that creates curiosity before the first sip

Never use: ingredient descriptions, generic geography, or adjective + category combinations.
Never name a cocktail after an ingredient that does not appear in the recipe. The name must be inspired by what is actually in the glass — a flavor, a spirit, a technique, a place, or a feeling — but never an ingredient that isn't there.
Return only the chosen name. No explanation needed.

🕯️ HESTIA BEST VERSION PROTOCOL:
When evaluating any cocktail, always generate this block.
Iron Rule: concept survives, base spirit unchanged, technical family unchanged.
What may change: proportions, one ingredient upgrade, technique, garnish, price.
If the Best Version introduces any batch element — deliver the full production protocol:
batch name, yield (ml), exact ingredients (g/ml), method step-by-step, Brix target, storage, shelf life, disposal trigger.
A manager must be able to hand this to their team the next morning with zero follow-up questions.`.trim();

function buildMenuContextString(cocktails) {
  if (!Array.isArray(cocktails) || !cocktails.length) return 'None.';
  return cocktails.map((c, i) => {
    const ings = Array.isArray(c.ingredients)
      ? c.ingredients.map(ing => `${ing.amount}${ing.unit} ${ing.name}`).join(', ')
      : 'ingredients not available';
    return `${i + 1}. ${c.name}${c.base_spirit ? ` (${c.base_spirit})` : ''} — ${ings}`;
  }).join('\n');
}

function buildDirectorSystemInstruction(dna, menuCocktails = [], venueContext = '') {
  const hasMenu = Array.isArray(menuCocktails) && menuCocktails.length > 0;
  return `${DIRECTOR_PERSONA}

BAR DNA:
${buildDnaContextString(dna)}
${venueContext ? `\n${venueContext}\n` : ''}
ACTIVE MENU (the specific cocktails the operator has loaded for this session):
${hasMenu ? buildMenuContextString(menuCocktails) : 'No menu loaded — operator is asking general questions.'}

CONVERSATIONAL RULES:
- Respond in natural language. Do not return JSON unless explicitly asked.
- Be direct, specific, and hospitality-native in tone.
- When recommending cocktails, always include ingredients with amounts, method, glass, and Israeli market pricing.
- Show your working when calculating costs or GP — operators need to trust the numbers.
- When an ACTIVE MENU is present, ground your answers in those specific drinks first.
- Keep answers focused and actionable. Operators are busy.`.trim();
}

function debugLog(obj) {
  const line = `[${new Date().toISOString()}] ${JSON.stringify(obj)}\n`;
  try { appendFileSync(path.join(__dirname, 'director.debug.log'), line); } catch {}
  console.error('[DIRECTOR DEBUG]', JSON.stringify(obj));
}

async function askGeminiChat(systemInstruction, history, message) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY in .env.');

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map(turn => ({ role: turn.role, content: turn.content })),
    { role: 'user', content: message },
  ];

  debugLog({ event: 'openai_chat_request', model: 'gpt-4o-mini', history_turns: history.length });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages }),
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data.error?.message || 'OpenAI request failed.';
    debugLog({ event: 'openai_chat_error', status: response.status, body: data });
    if (/api.?key|key.*invalid|invalid.*key/i.test(msg)) {
      throw new Error('AI Beverage Director is unavailable — the server API key is missing or invalid. Please contact your administrator.');
    }
    throw new Error(msg);
  }

  return data.choices?.[0]?.message?.content || 'No response generated.';
}

function buildGenerationPrompt(flowType, params, dna, tasteDna, existingNames, venueContext = '') {
  const dnaContext   = buildDnaContextString(dna);
  const tasteContext = buildTasteDnaContextString(tasteDna);
  const existingList = existingNames.length ? existingNames.join(', ') : 'none';
  const kosher       = params.kosher_override != null ? params.kosher_override : (dna?.is_kosher !== 'no');
  const skillLevel   = dna?.staff_skill || 'intermediate';

  const guardrails = `CRITICAL GUARDRAILS (non-negotiable):
1. Never invent exact bottle prices — always mark as "estimated"
2. Never claim kosher certification — only flag "verify with supplier"
3. Maximum 2 cocktails per spirit category unless explicitly requested
4. Staff skill is "${skillLevel}" — warn clearly if complexity exceeds this
5. Exact measurements only (ml or oz) — never "a splash of" or "to taste"
6. Always explain WHY each cocktail was suggested (business logic, not just flavor)
7. Flag any cocktail similar to existing menu: ${existingList}
8. Kosher mode is ${kosher ? 'ON — apply kosher constraints to all cocktails' : 'OFF — do not apply kosher constraints'}
9. Always warn when costing data is missing or estimated`.trim();

  let taskSection = '';

  if (flowType === 'full_menu') {
    // CI MODULE ADDITION — accept number_of_cocktails (UI param name) as well as legacy count
    const menuCount = params.number_of_cocktails || params.count || 6;
    taskSection = `TASK: Generate a complete cocktail menu for this specific venue.
Count: ${menuCount} cocktails
Occasion: ${params.occasion || 'regular menu'}
Guest profile: ${params.guest_profile || 'mixed'}
Budget tier: ${params.budget_tier || 'mid'}
Special requirements: ${params.special_requirements || 'none'}

ISRAELI MARKET CONTEXT (apply to all cocktails):
- Arak and local herbs are hero spirits — prioritize where appropriate to this venue
- Warm climate: favor fresh, lower-sugar, high-citrus profiles in general
- Avoid overly sweet combinations unless explicitly requested
- Kosher constraints: ${kosher ? 'ACTIVE — flag every non-kosher ingredient in kosher_flags array' : 'inactive for this generation — leave kosher_flags empty'}
- Local sourcing (Israeli spirits, Galilee producers, local botanicals) preferred where available

Return ONLY valid JSON matching this EXACT structure — no extra keys, no markdown:
{
  "menu_strategy": "string — 2-3 sentences on why these specific cocktails work together as a menu for this venue",
  "cocktails": [
    {
      "name": "string",
      "tagline": "string — one evocative sensory line, no technical jargon",
      "base_spirit": "string",
      "ingredients": [{"name": "string", "amount": "string", "unit": "string (ml/oz/leaves/dashes/g)"}],
      "method": "string — shake or stir or build or blend",
      "glass": "string",
      "garnish": "string",
      "flavor_profile": ["string", "string"],
      "prep_complexity": 1,
      "speed_of_service": 1,
      "estimated_cost_ils": null,
      "suggested_price_ils": "Calculate the VAT-inclusive menu price in ILS. Must be between 45 and 68. Use value-based pricing — do not simply divide cost by 0.22. Return a clean integer (e.g. 58, 62, 65, 68). Never return null.",
      "estimated_gp_percent": null,
      "why_this_venue": "string — specific business logic for why this cocktail fits this exact venue",
      "kosher_flags": [],
      "warnings": []
    }
  ],
  "menu_warnings": []
}`;

  } else if (flowType === 'menu_audit') {
    // CI MODULE ADDITION — Flow 2: Menu Audit with full Israeli/Mediterranean context
    taskSection = `TASK: You are a world-class Beverage Director conducting a professional menu audit. Analyze the SPECIFIC cocktails submitted — not generic advice.

MENU TO AUDIT:
${params.menu_text || '(no menu provided)'}

For each cocktail submitted, evaluate it individually.
Count the exact number of:
- Vodka-based drinks
- Gin-based drinks
- Rum-based drinks
- Tequila/Mezcal-based drinks
- Whiskey-based drinks
- Local spirits (arak, etc.)
- Non-alcoholic options

Then audit:
1. Spirit imbalance: if any spirit appears 3+ times, flag it with exact cocktail names
2. Flavor repetition: identify cocktails that taste similar (both sour + citrus, both sweet + fruity) and name them specifically
3. Price gap: if prices provided, identify if there is a gap in the price architecture
4. Identity fit: for each cocktail, does it reflect this specific venue's DNA? Name which ones don't.
5. Missing slots: what specific type of cocktail is completely absent from this menu?
6. Staff complexity: identify the 2-3 most complex cocktails and whether they match staff skill level

Do NOT give generic advice. Reference specific cocktail names from the submitted menu in every finding. If a cocktail is problematic, name it. If a cocktail is strong, name it.
Score calibration: a menu of generic classics with no local identity should score 30-45.

Return ONLY valid JSON matching this EXACT structure — no extra keys, no markdown:
{
  "overall_score": number (0-100, be honest — a generic tourist menu should score below 50),
  "overall_verdict": "string (2 sentences max: overall quality assessment + main direction needed)",
  "strengths": ["string (specific, not generic — cite actual cocktail names)"],
  "critical_issues": [{
    "issue": "string (specific, name the problem clearly)",
    "severity": "high | medium | low",
    "affected_cocktails": ["string (cocktail names, or empty array if menu-wide issue)"],
    "recommendation": "string (actionable — what exactly should they do?)"
  }],
  "per_cocktail": [{
    "name": "string (exact name from the menu)",
    "verdict": "keep | modify | replace | retire",
    "score": number (0-100),
    "issues": ["string (specific issues with this cocktail for THIS venue)"],
    "suggestion": "string (if modify/replace: what specifically should change or replace it)"
  }],
  "missing_from_menu": ["string (specific missing category or cocktail type, not generic)"],
  "quick_wins": [{
    "action": "string (concrete, implementable action — something a bar manager can do tomorrow)",
    "impact": "high | medium | low",
    "effort": "easy | medium | hard"
  }],
  "menu_narrative": "string (3-5 sentences written like a consultant's summary: overall character, what works, what fails, how it fits or misses the venue identity)"
}`;

  } else if (flowType === 'single_cocktail') {
    taskSection = `TASK: Develop a single cocktail.
Desired flavors: ${(params.flavor_direction || []).join(', ') || 'open'}
Unwanted flavors: ${(params.unwanted_flavors || []).join(', ') || 'none specified'}
Base spirit: ${params.base_spirit || 'no preference'}
Complexity: ${params.complexity || 'medium'}
Special notes: ${params.notes || 'none'}

Return ONLY valid JSON:
{
  "cocktail": {
    "name": "string",
    "description": "string (60-80 words, evocative)",
    "base_spirit": "string",
    "method": "string",
    "glass": "string",
    "garnish": "string",
    "ingredients": [{"name": "string", "amount": "string", "unit": "string"}],
    "estimated_cost_ils": number_or_null,
    "estimated_sell_price_ils": "Calculate the VAT-inclusive menu price in ILS. Must be between 45 and 68. Use value-based pricing — do not simply divide cost by 0.22. Return a clean integer (e.g. 58, 62, 65, 68). Never return null.",
    "prep_complexity": 1-5,
    "speed_of_service": 1-5,
    "kosher_ready": boolean,
    "business_rationale": "string",
    "variations": {
      "lighter": "string",
      "stronger": "string",
      "batch_version": "string"
    },
    "warnings": ["string"],
    "scores": {}
  },
  "warnings": ["string"]
}`;

  } else if (flowType === 'bottle_optimizer') {
    taskSection = `TASK: Suggest cocktails using ONLY these available bottles.
Available: ${JSON.stringify(params.available_bottles || [])}

Return ONLY valid JSON:
{
  "cocktails": [{
    "name": "string",
    "description": "string",
    "ingredients": [{"name": "string", "amount": "string", "unit": "string"}],
    "method": "string",
    "glass": "string",
    "garnish": "string",
    "margin_potential": "low | medium | high",
    "prep_simplicity": 1-5,
    "guest_appeal": 1-10,
    "business_rationale": "string",
    "scores": {}
  }],
  "gaps": [{"missing_bottle": "string", "would_unlock": "string"}],
  "warnings": ["string"]
}`;

  } else if (flowType === 'staff_briefing') {
    taskSection = `TASK: Generate staff briefing cards for these cocktails.
Cocktails: ${JSON.stringify(params.cocktail_names || [])}

Return ONLY valid JSON:
{
  "briefing_cards": [{
    "cocktail_name": "string",
    "how_to_make": ["step 1", "step 2"],
    "how_to_sell": "string (2-3 sentences starting with 'This cocktail is...')",
    "what_to_say_to_guest": "string",
    "common_mistakes": ["string"],
    "upsell_opportunity": "string"
  }]
}`;

  } else if (flowType === 'signature_drink') {
    taskSection = `TASK: Create ONE defining signature cocktail for this venue.
Venue story: ${params.venue_story || ''}
Three defining flavors: ${(params.defining_flavors || []).join(', ')}
Local ingredient or memory to honor: ${params.local_ingredient || 'none'}
Guest feeling after first sip: ${params.guest_feeling || ''}
Name direction: ${params.name_direction || 'surprise me'}
Color direction: ${params.color_direction || 'open'}

Return ONLY valid JSON:
{
  "signature_cocktail": {
    "name": "string",
    "description": "string (full evocative description)",
    "base_spirit": "string",
    "method": "string",
    "glass": "string",
    "garnish": "string",
    "ingredients": [{"name": "string", "amount": "string", "unit": "string"}],
    "serving_ritual": "string",
    "narrative_story": "string (the full creative story of this cocktail)",
    "batch_version": "string",
    "mocktail_adaptation": "string",
    "visual_suggestions": ["string"],
    "staff_training_card": "string",
    "scores": {}
  }
}`;

  } else if (flowType === 'beverage_director') {
    // Module 4: receives a pre-processed brief from the Beverage Director Prompt Generator
    taskSection = `TASK: Generate a cocktail based on this professional brief.
Brief: ${params.brief || ''}
Occasion: ${params.occasion || 'daily menu'}
Constraints: ${(params.constraints || []).join(', ') || 'none'}
Mood: ${params.mood || ''}

Return ONLY valid JSON:
{
  "cocktail": {
    "name": "string",
    "description": "string (60-80 words)",
    "base_spirit": "string",
    "method": "string",
    "glass": "string",
    "garnish": "string",
    "ingredients": [{"name": "string", "amount": "string", "unit": "string"}],
    "estimated_cost_ils": number_or_null,
    "estimated_sell_price_ils": "Calculate the VAT-inclusive menu price in ILS. Must be between 45 and 68. Use value-based pricing — do not simply divide cost by 0.22. Return a clean integer (e.g. 58, 62, 65, 68). Never return null.",
    "prep_complexity": 1-5,
    "speed_of_service": 1-5,
    "kosher_ready": boolean,
    "business_rationale": "string",
    "variations": {"lighter": "string", "stronger": "string", "batch_version": "string"},
    "warnings": ["string"],
    "scores": {}
  },
  "warnings": ["string"]
}`;

  } else {
    taskSection = `TASK: ${JSON.stringify(params)}`;
  }

  return `${DIRECTOR_PERSONA}

BAR DNA:
${dnaContext}
${venueContext ? `\n${venueContext}\n` : ''}
TASTE DNA (learned from past approvals and rejections):
${tasteContext}

EXISTING MENU (check for duplicates before suggesting):
${existingList}

${guardrails}

${SCORE_INSTRUCTIONS}

${taskSection}

IMPORTANT: Return ONLY valid JSON. No markdown code fences. No explanation outside the JSON object.`;
}

// Rebuilds the aggregated taste profile from all non-experimental rejections
function rebuildTasteDna(venueId) {
  const rejections = db.prepare(
    "SELECT cocktail_profile_json, reasons_json FROM cocktail_rejections WHERE venue_id = ? AND reasons_json NOT LIKE '%just_experimenting%'"
  ).all(venueId);

  const flavorCounts     = {};
  const spiritCounts     = {};
  const complexityCounts = {};

  for (const r of rejections) {
    const profile = JSON.parse(r.cocktail_profile_json || '{}');
    const reasons = JSON.parse(r.reasons_json || '[]');
    const flavors = Array.isArray(profile.flavor_profile)
      ? profile.flavor_profile.map(s => String(s).trim()).filter(Boolean)
      : typeof profile.flavor_profile === 'string'
      ? profile.flavor_profile.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    for (const f of flavors) {
      flavorCounts[f] = (flavorCounts[f] || 0) + 1;
    }
    if (profile.base_spirit && (reasons.includes('identity_mismatch') || reasons.includes('too_strong'))) {
      spiritCounts[profile.base_spirit] = (spiritCounts[profile.base_spirit] || 0) + 1;
    }
    if (profile.complexity && reasons.includes('too_complex')) {
      complexityCounts[profile.complexity] = (complexityCounts[profile.complexity] || 0) + 1;
    }
  }

  const rejectedFlavors  = Object.entries(flavorCounts).filter(([, c]) => c >= 2).map(([p, c]) => ({ pattern: p, count: c }));
  const rejectedSpirits  = Object.entries(spiritCounts).filter(([, c]) => c >= 2).map(([s]) => s);
  const rejectedComplexity = Object.entries(complexityCounts).map(([c, n]) => ({ complexity: c, count: n }));

  const existing = getCITasteDna(venueId);
  const now = nowIso();

  if (existing) {
    db.prepare(`
      UPDATE cocktail_taste_dna
      SET rejected_flavors_json=?, rejected_spirits_json=?, rejected_complexity_json=?, updated_at=?
      WHERE venue_id=?
    `).run(JSON.stringify(rejectedFlavors), JSON.stringify(rejectedSpirits), JSON.stringify(rejectedComplexity), now, venueId);
  } else {
    db.prepare(`
      INSERT INTO cocktail_taste_dna
        (venue_id, rejected_flavors_json, rejected_spirits_json, rejected_complexity_json,
         approved_flavors_json, approved_spirits_json, pattern_notes_json, updated_at)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(venueId, JSON.stringify(rejectedFlavors), JSON.stringify(rejectedSpirits),
      JSON.stringify(rejectedComplexity), '[]', '[]', '[]', now);
  }
}

// ── CI DNA ────────────────────────────────────────────────────────────────────

app.get('/api/ci/dna', requireAuth(...CI_ROLES, 'events_manager'), (req, res) => {
  res.json({ dna: formatDnaForApi(getCIDna(req.venueId)) }); // CI MODULE ADDITION — returns UI-friendly aliases
});

app.post('/api/ci/dna', requireAuth(...CI_ROLES), (req, res) => {
  const b   = req.body;
  const now = nowIso();
  const existing = getCIDna(req.venueId);

  // CI MODULE ADDITION — accept UI field names (bar_name, target_guest, etc.) with DB column fallbacks
  const venueName  = b.bar_name       || b.venue_name   || '';
  const audType    = b.target_guest   || b.audience_type || '';
  const priceRange = b.price_tier     || b.price_range   || '';
  const heroIng    = b.hero_ingredients || b.hero_ingredient || null;
  const isKosher   = b.kosher_aware != null
    ? (b.kosher_aware ? 'yes' : 'no')
    : (b.is_kosher || 'no');
  const metaJson = JSON.stringify({
    concept:                 b.concept                 || null,
    signature_style:         b.signature_style         || null,
    excluded_ingredients:    b.excluded_ingredients    || null,
    spirit_focus:            b.spirit_focus            || null,
    non_alcoholic_ratio:     b.non_alcoholic_ratio     || null,
    seasonal_approach:       b.seasonal_approach       || null,
    local_sourcing_priority: b.local_sourcing_priority || null,
    menu_size_target:        b.menu_size_target        || null,
    notes:                   b.notes                   || null,
  });

  const fields = [
    venueName, b.venue_type || 'restaurant', b.atmosphere || b.concept || null, b.cuisine_style || null,
    b.audience_age_min || null, b.audience_age_max || null, audType,
    b.staff_skill || null,
    JSON.stringify(b.equipment || []),
    JSON.stringify(b.glassware || []),
    isKosher,
    JSON.stringify(b.flavor_identity || []),
    priceRange, b.service_pressure || null, heroIng,
    metaJson,
  ];

  if (existing) {
    db.prepare(`
      UPDATE cocktail_intelligence_dna
      SET venue_name=?,venue_type=?,atmosphere=?,cuisine_style=?,
          audience_age_min=?,audience_age_max=?,audience_type=?,staff_skill=?,
          equipment_json=?,glassware_json=?,is_kosher=?,flavor_identity_json=?,
          price_range=?,service_pressure=?,hero_ingredient=?,meta_json=?,updated_at=?
      WHERE venue_id=?
    `).run(...fields, now, req.venueId);
    res.json({ ok: true, updated: true, dna: formatDnaForApi(getCIDna(req.venueId)) });
  } else {
    db.prepare(`
      INSERT INTO cocktail_intelligence_dna
        (venue_id,venue_name,venue_type,atmosphere,cuisine_style,
         audience_age_min,audience_age_max,audience_type,staff_skill,
         equipment_json,glassware_json,is_kosher,flavor_identity_json,
         price_range,service_pressure,hero_ingredient,meta_json,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(req.venueId, ...fields, now, now);
    res.status(201).json({ ok: true, updated: false, dna: formatDnaForApi(getCIDna(req.venueId)) });
  }
});

// ── F&B Decision Ledger — compact capture helpers (Phase 3) ────────────────────
// Pure, defensive helpers that keep ledger snapshots small. They never throw on
// odd input (the ledger write is additionally wrapped in safeRecordFbDecision).
function fbCompactValue(v, depth = 0) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v.length > 200 ? v.slice(0, 200) + '…' : v;
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.slice(0, 12).map(x => fbCompactValue(x, depth + 1));
  if (typeof v === 'object') {
    if (depth >= 2) return Object.keys(v).slice(0, 12);
    const out = {};
    for (const k of Object.keys(v).slice(0, 20)) out[k] = fbCompactValue(v[k], depth + 1);
    return out;
  }
  return null;
}
function fbCompactBarDna(dna) {
  if (!dna || typeof dna !== 'object') return null;
  const pick = ['venue_type', 'atmosphere', 'cuisine_style', 'audience_type', 'staff_skill', 'price_range', 'service_pressure', 'is_kosher', 'hero_ingredient'];
  const out = {};
  for (const k of pick) if (dna[k] !== null && dna[k] !== undefined && dna[k] !== '') out[k] = dna[k];
  return Object.keys(out).length ? out : null;
}
function fbSummarizeCiResult(result) {
  if (!result || typeof result !== 'object') return null;
  const out = {};
  if (Array.isArray(result.cocktails)) {
    out.count = result.cocktails.length;
    out.names = result.cocktails.map(c => (c && (c.name || c.cocktailName)) || null).filter(Boolean).slice(0, 12);
  }
  if (typeof result.menu_name === 'string') out.menu_name = result.menu_name;
  if (Array.isArray(result.menu_sections)) out.sections = result.menu_sections.slice(0, 12);
  if (Object.keys(out).length === 0) out.keys = Object.keys(result).slice(0, 12);
  return out;
}
function fbLedgerOnError(route, venueId) {
  return (err) => { try { debugLog({ event: 'fb_ledger_write_failed', route, venue_id: venueId, error: err && err.message }); } catch { /* never break the caller */ } };
}

// ── CI AI GENERATION ──────────────────────────────────────────────────────────

app.post('/api/ci/generate', requireAuth(...CI_ROLES), async (req, res) => {
  try {
    const { flow_type, ...params } = req.body;
    if (!flow_type) return res.status(400).json({ error: 'flow_type is required.' });

    const dna      = getCIDna(req.venueId);
    const tasteDna = getCITasteDna(req.venueId);
    const existingNames = db.prepare('SELECT name FROM cocktails WHERE is_active=1 ORDER BY name').all().map(r => r.name);

    const omer   = getOmerVenueContext(req.venueId);

    // Phase 5: flag-gated decimal taste convergence. When ENABLE_VENUE_BEVERAGE_CONTEXT
    // is ON and a real target_taste_profile_range resolves, append a compact taste-target
    // block to the venue-context string. Flag OFF → venueContextText === (omer.text || '')
    // → byte-identical prompt. buildGenerationPrompt is unchanged. No decimal OUTPUT is
    // requested from Gemini; this only injects target context. Never fabricates a range.
    let venueContextText = omer.text || '';
    let tasteTarget = null;
    if (isVenueBeverageContextEnabled()) {
      try {
        const venueState = getVenueIntelligence(req.venueId);
        const venueProfile = { venue_type: dna?.venue_type || null, price_tier: dna?.price_range || null };
        tasteTarget = resolveCiTasteTarget({ venueDNA: venueState?.venueDNA || null, venueProfile });
        if (tasteTarget) {
          const tasteBlock = formatTasteTargetPromptBlock(tasteTarget.range, { direction: tasteTarget.direction });
          if (tasteBlock) venueContextText += (venueContextText ? '\n\n' : '') + tasteBlock;
        }
      } catch (e) { tasteTarget = null; debugLog({ event: 'ci_taste_target_failed', venue_id: req.venueId, error: e && e.message }); }
    }

    const prompt = buildGenerationPrompt(flow_type, params, dna, tasteDna, existingNames, venueContextText);
    const raw    = await askGemini(prompt, { jsonMode: true });

    let result;
    try { result = JSON.parse(raw); }
    catch { return res.status(500).json({ error: 'AI response could not be parsed.', raw }); }

    // Phase 3: non-blocking decision-ledger write. Records WHY generation happened.
    // safeRecordFbDecision never throws — generation behavior/response are unaffected.
    safeRecordFbDecision(db, req.venueId, {
      decision_type: 'cocktail_menu_generated',
      source_engine: 'ci_omer',
      decision_title: `CI generation: ${flow_type}`,
      decision_payload: { flow_type, params: fbCompactValue(params) },
      venue_dna_snapshot: fbCompactBarDna(dna),
      menu_snapshot: fbSummarizeCiResult(result),
      evidence: [
        { source: 'venue_dna' },
        { source: 'taste_dna' },
        { source: 'omer_brief', ref: omer.active ? 'active' : 'inactive' },
      ],
      provenance: { origin: 'specialist_decision', route: 'ci_generate' },
      confidence: (omer && typeof omer.confidence === 'number') ? { omer: omer.confidence } : null,
      // Phase 5: store the deterministic target range only when one was actually resolved.
      // No decimal RESULT is produced or stored. Flag-off → tasteTarget is null → these
      // fields are null/absent → ledger row is byte-identical to Phase 4.
      taste_profile_target: tasteTarget ? tasteTarget.range : null,
      missing_fields: (isVenueBeverageContextEnabled() && !tasteTarget) ? ['no venue taste target resolved'] : null,
      explanation_basis: {
        omer_active: !!(omer && omer.active),
        omer_confidence: (omer && typeof omer.confidence === 'number') ? omer.confidence : null,
        flow_type,
        ...(tasteTarget ? { taste_target_dimensions: tasteTarget.dimensions } : {}),
      },
      future_validation_targets: null,
    }, fbLedgerOnError('ci_generate', req.venueId));

    res.json({ ok: true, flow_type, result, venue_context_active: omer.active });
  } catch (err) {
    console.error('CI GENERATE ERROR:', err);
    res.status(500).json({ error: err.message || 'Generation failed.' });
  }
});

// ── CI REJECTIONS ─────────────────────────────────────────────────────────────

app.get('/api/ci/rejections', requireAuth(...CI_ROLES), (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM cocktail_rejections WHERE venue_id=? ORDER BY rejected_at DESC'
  ).all(req.venueId);
  res.json({
    rejections: rows.map(r => ({
      ...r,
      reasons:          JSON.parse(r.reasons_json || '[]'),
      cocktail_profile: JSON.parse(r.cocktail_profile_json || '{}'),
    })),
  });
});

app.post('/api/ci/rejections', requireAuth(...CI_ROLES), (req, res) => {
  const b = req.body;
  if (!b.cocktail_name || !Array.isArray(b.reasons) || !b.reasons.length) {
    return res.status(400).json({ error: 'cocktail_name and reasons[] are required.' });
  }
  if (b.reasons.includes('just_experimenting')) {
    return res.json({ ok: true, saved: false, reason: 'just_experimenting — no memory saved' });
  }

  db.prepare(`
    INSERT INTO cocktail_rejections (venue_id,cocktail_name,cocktail_profile_json,reasons_json,rejected_by,rejected_at)
    VALUES (?,?,?,?,?,?)
  `).run(
    req.venueId, b.cocktail_name,
    JSON.stringify({ ...b.cocktail_profile, base_spirit: b.base_spirit || null }),
    JSON.stringify(b.reasons),
    req.user.full_name, nowIso()
  );

  rebuildTasteDna(req.venueId);

  // Phase 3: non-blocking decision-ledger write. Reached only for real rejections
  // (the just_experimenting early-return above never gets here → no ledger row).
  const rejectionDecision = {
    decision_type: 'cocktail_rejected',
    source_engine: 'ci_omer',
    subject_ref: { cocktail_name: b.cocktail_name },
    decision_title: `Rejected: ${b.cocktail_name}`,
    decision_payload: { reasons: Array.isArray(b.reasons) ? b.reasons.slice(0, 12) : null, base_spirit: b.base_spirit || null },
    recipe_snapshot: (b.cocktail_profile && typeof b.cocktail_profile === 'object') ? fbCompactValue(b.cocktail_profile) : null,
    evidence: [{ source: 'rejection_history' }],
    provenance: { origin: 'specialist_decision', action: 'human_reject', route: 'ci_rejections' },
  };
  const ledger = safeRecordFbDecision(db, req.venueId, rejectionDecision, fbLedgerOnError('ci_rejections', req.venueId));

  // Phase 6B: flag-gated, non-blocking F&B → Venue Intelligence candidate write.
  // Candidate-only (never Venue DNA). Requires a real ledger decision id for dedupe.
  // Flag OFF → nothing runs; the rejection response below is unchanged either way.
  if (isFnbVenueFeedbackCandidatesEnabled() && ledger && ledger.ok && ledger.decisionId) {
    safeRecordVenueIntelligenceCandidates(
      db, req.venueId,
      { ...rejectionDecision, id: ledger.decisionId },
      (err) => { try { debugLog({ event: 'fnb_venue_candidate_write_failed', venue_id: req.venueId, error: err && err.message }); } catch { /* never break the caller */ } }
    );
  }

  res.status(201).json({ ok: true, saved: true });
});

// ── CI TASTE DNA ──────────────────────────────────────────────────────────────

app.get('/api/ci/taste-dna', requireAuth(...CI_ROLES, 'events_manager'), (req, res) => {
  res.json({ taste_dna: getCITasteDna(req.venueId) });
});

// ── CI DECISIONS — read-only F&B Decision Ledger (Phase 4) ─────────────────────
// Deterministic, read-only, venue-scoped, role-gated. No AI, no mutation.

// Compact list of recorded decisions for the venue (no large JSON snapshots).
app.get('/api/ci/decisions', requireAuth(...CI_ROLES), (req, res) => {
  try {
    const decisionType = typeof req.query.decision_type === 'string' ? req.query.decision_type : null;
    const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
    const rows = listFbDecisionsForVenue(db, req.venueId, { limit });
    const filtered = decisionType ? rows.filter(r => r.decision_type === decisionType) : rows;
    // Compact projection only — never expose large JSON snapshots in the list.
    const decisions = filtered.map(r => ({
      id: r.id,
      decision_type: r.decision_type,
      source_engine: r.source_engine,
      decision_title: r.decision_title,
      decision_summary: r.decision_summary,
      related_cocktail_id: r.related_cocktail_id,
      related_menu_id: r.related_menu_id,
      status: r.status,
      human_review_status: r.human_review_status,
      created_at: r.created_at,
      has_explanation_basis: !!(r.explanation_basis && Object.keys(r.explanation_basis).length),
      has_confidence: !!(r.confidence && Object.keys(r.confidence).length),
    }));
    res.json({ ok: true, decisions });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not list decisions.' });
  }
});

// On-demand "why?" explanation for one decision. 404 if not found / cross-venue.
app.get('/api/ci/decisions/:decisionId/explanation', requireAuth(...CI_ROLES), (req, res) => {
  try {
    const decision = getFbDecisionById(db, req.venueId, req.params.decisionId);
    if (!decision) {
      return res.status(404).json({ ok: false, can_explain: false, error: 'No decision found for this venue.' });
    }
    res.json(buildFbDecisionExplanation(decision));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not build the explanation.' });
  }
});

// ── CI COCKTAILS (ci_generated slice of cocktails table) ──────────────────────

app.get('/api/ci/cocktails', requireAuth(...CI_ROLES, 'events_manager'), (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM cocktails WHERE source='ci_generated' AND is_active=1 ORDER BY created_at DESC"
  ).all();
  res.json({
    cocktails: rows.map(r => ({
      ...r,
      tags:        JSON.parse(r.tags_json || '[]'),
      ingredients: JSON.parse(r.ingredients_text_json || '[]'),
    })),
  });
});

app.post('/api/ci/cocktails', requireAuth(...CI_ROLES), (req, res) => {
  const b   = req.body;
  if (!b.name) return res.status(400).json({ error: 'name is required.' });
  const now = nowIso();

  // CI MODULE ADDITION — include menu_id if provided
  const result = db.prepare(`
    INSERT INTO cocktails
      (name,category,description,base_spirit,glass_type,garnish,method,
       tags_json,ingredients_text_json,source,created_by,created_at,menu_id,
       estimated_cost_ils,suggested_price_ils,estimated_gp_percent)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    b.name, b.category || 'ci_generated', b.description || null,
    b.base_spirit || null, b.glass || null, b.garnish || null, b.method || null,
    JSON.stringify(b.tags || []), JSON.stringify(b.ingredients || []),
    'ci_generated', req.user.id, now, b.menu_id || null,
    b.estimated_cost_ils || null, b.suggested_price_ils || null, b.estimated_gp_percent || null
  );
  const newId = result.lastInsertRowid;

  // Auto-create lifecycle record for newly saved CI cocktail
  db.prepare(`
    INSERT INTO cocktail_lifecycle
      (venue_id,cocktail_id,cocktail_name,date_added,season_added,status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(req.venueId, newId, b.name, now.slice(0, 10), getCurrentSeason(), 'active', now, now);

  const saved = db.prepare('SELECT * FROM cocktails WHERE id=?').get(newId);

  // Phase 3: non-blocking decision-ledger write. Records the selection/save.
  const hasEstimates = b.estimated_cost_ils != null || b.suggested_price_ils != null || b.estimated_gp_percent != null;
  safeRecordFbDecision(db, req.venueId, {
    decision_type: 'cocktail_selected',
    source_engine: 'ci_omer',
    related_cocktail_id: newId,
    related_menu_id: b.menu_id || null,
    decision_title: `Saved cocktail: ${b.name}`,
    recipe_snapshot: {
      name: b.name,
      base_spirit: b.base_spirit || null,
      method: b.method || null,
      glass: b.glass || null,
      garnish: b.garnish || null,
      ingredients: Array.isArray(b.ingredients) ? b.ingredients.slice(0, 12) : null,
    },
    decision_payload: hasEstimates
      ? { costing_basis: 'estimate', estimated_cost_ils: b.estimated_cost_ils ?? null, suggested_price_ils: b.suggested_price_ils ?? null, estimated_gp_percent: b.estimated_gp_percent ?? null }
      : null,
    evidence: hasEstimates ? [{ source: 'costing', ref: 'estimate' }] : null,
    provenance: { origin: 'specialist_decision', action: 'human_save', route: 'ci_cocktails' },
  }, fbLedgerOnError('ci_cocktails', req.venueId));

  res.status(201).json({
    ok: true,
    cocktail: { ...saved, tags: JSON.parse(saved.tags_json || '[]'), ingredients: JSON.parse(saved.ingredients_text_json || '[]') },
  });
});

app.delete('/api/ci/cocktails/:id', requireAuth(...CI_ROLES), (req, res) => {
  db.prepare("UPDATE cocktails SET is_active=0 WHERE id=? AND source='ci_generated'").run(req.params.id);
  res.json({ ok: true });
});

// ── CI MENUS ──────────────────────────────────────────────────────────────────
// CI MODULE ADDITION — named menu records that group approved cocktails

app.get('/api/ci/menus', requireAuth(...CI_ROLES, 'events_manager'), (req, res) => {
  const venueId = req.venueId;
  const menus = db.prepare(
    "SELECT * FROM cocktail_menus WHERE venue_id=? AND status='active' ORDER BY created_at DESC"
  ).all(venueId);

  // Attach cocktail count and first 3 cocktail names to each menu
  const enriched = menus.map(menu => {
    const cocktails = db.prepare(
      "SELECT name FROM cocktails WHERE menu_id=? AND is_active=1 ORDER BY created_at ASC"
    ).all(menu.id);
    return {
      ...menu,
      cocktail_count: cocktails.length,
      preview_names:  cocktails.slice(0, 3).map(c => c.name)
    };
  });

  res.json({ menus: enriched });
});

app.post('/api/ci/menus', requireAuth(...CI_ROLES), (req, res) => {
  const { name, occasion, description, season } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required.' });
  const venueId = req.venueId;
  const now     = nowIso();

  const result = db.prepare(`
    INSERT INTO cocktail_menus (venue_id, name, occasion, description, season, created_by, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(venueId, name.trim(), occasion || null, description || null, season || null, req.user?.id || null, now);

  const created = db.prepare('SELECT * FROM cocktail_menus WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json({ ok: true, menu: created });
});

// GET /api/ci/menus/published — employee-facing: only visible_to_staff=1 menus, no cost data
app.get('/api/ci/menus/published', requireAuth('employee', ...CI_ROLES), (req, res) => {
  const venueId = req.venueId;
  const menus = db.prepare(
    "SELECT id, name, occasion, description, season FROM cocktail_menus WHERE venue_id=? AND status='active' AND visible_to_staff=1 ORDER BY created_at DESC"
  ).all(venueId);

  const enriched = menus.map(menu => {
    const cocktails = db.prepare(
      "SELECT name, description, category, base_spirit, glass_type, garnish, method, tags_json, ingredients_text_json FROM cocktails WHERE menu_id=? AND is_active=1 ORDER BY created_at ASC"
    ).all(menu.id);
    return {
      ...menu,
      cocktails: cocktails.map(c => ({
        name:        c.name,
        description: c.description,
        category:    c.category,
        base_spirit: c.base_spirit,
        glass_type:  c.glass_type,
        garnish:     c.garnish,
        method:      c.method,
        tags:        tryJson(c.tags_json, []),
        ingredients: tryJson(c.ingredients_text_json, [])
      }))
    };
  });

  res.json({ menus: enriched });
});

app.get('/api/ci/menus/:id', requireAuth(...CI_ROLES), (req, res) => {
  const menu = db.prepare('SELECT * FROM cocktail_menus WHERE id=?').get(req.params.id);
  if (!menu) return res.status(404).json({ error: 'Menu not found.' });

  const cocktails = db.prepare(
    "SELECT * FROM cocktails WHERE menu_id=? AND is_active=1 ORDER BY created_at ASC"
  ).all(menu.id);

  res.json({
    menu: {
      ...menu,
      cocktails: cocktails.map(c => ({
        ...c,
        tags:        JSON.parse(c.tags_json || '[]'),
        ingredients: JSON.parse(c.ingredients_text_json || '[]')
      }))
    }
  });
});

app.patch('/api/ci/menus/:id', requireAuth(...CI_ROLES), (req, res) => {
  const { name, occasion, description, status } = req.body;
  const menu = db.prepare('SELECT id FROM cocktail_menus WHERE id=?').get(req.params.id);
  if (!menu) return res.status(404).json({ error: 'Menu not found.' });

  if (name)        db.prepare('UPDATE cocktail_menus SET name=? WHERE id=?').run(name.trim(), menu.id);
  if (occasion)    db.prepare('UPDATE cocktail_menus SET occasion=? WHERE id=?').run(occasion, menu.id);
  if (description !== undefined) db.prepare('UPDATE cocktail_menus SET description=? WHERE id=?').run(description, menu.id);
  if (status)      db.prepare('UPDATE cocktail_menus SET status=? WHERE id=?').run(status, menu.id);

  const updated = db.prepare('SELECT * FROM cocktail_menus WHERE id=?').get(menu.id);
  res.json({ ok: true, menu: updated });
});

// PATCH /api/ci/menus/:id/visible — toggle staff visibility (CI roles only)
app.patch('/api/ci/menus/:id/visible', requireAuth(...CI_ROLES), (req, res) => {
  const { visible_to_staff } = req.body;
  const menu = db.prepare('SELECT id, visible_to_staff FROM cocktail_menus WHERE id=?').get(req.params.id);
  if (!menu) return res.status(404).json({ error: 'Menu not found.' });
  db.prepare('UPDATE cocktail_menus SET visible_to_staff=? WHERE id=?')
    .run(visible_to_staff ? 1 : 0, menu.id);
  const updated = db.prepare('SELECT * FROM cocktail_menus WHERE id=?').get(menu.id);
  res.json({ ok: true, menu: updated });
});

app.delete('/api/ci/menus/:id', requireAuth(...CI_ROLES), (req, res) => {
  db.prepare("UPDATE cocktail_menus SET status='archived' WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── CI SALES ──────────────────────────────────────────────────────────────────

app.get('/api/ci/sales', requireAuth(...CI_ROLES), (req, res) => {
  const { start, end } = req.query;
  let q    = 'SELECT * FROM cocktail_sales WHERE venue_id=?';
  const args = [req.venueId];
  if (start) { q += ' AND sale_date >= ?'; args.push(start); }
  if (end)   { q += ' AND sale_date <= ?'; args.push(end); }
  q += ' ORDER BY sale_date DESC';
  res.json({ sales: db.prepare(q).all(...args) });
});

app.post('/api/ci/sales', requireAuth(...CI_ROLES), (req, res) => {
  const b     = req.body;
  if (!b.cocktail_name || !b.sale_date) return res.status(400).json({ error: 'cocktail_name and sale_date required.' });
  const units = Number(b.units_sold) || 0;
  const price = Number(b.sale_price) || null;
  const cost  = Number(b.cost_per_unit) || null;
  const rev   = price && units ? price * units : null;
  const gp    = rev && cost   ? rev - (cost * units) : null;
  const gpPct = rev && gp     ? Math.round((gp / rev) * 100) : null;

  const r = db.prepare(`
    INSERT INTO cocktail_sales
      (venue_id,cocktail_id,cocktail_name,sale_date,period_type,
       units_sold,sale_price,cost_per_unit,revenue,gross_profit,gp_percent,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(req.venueId, b.cocktail_id || null, b.cocktail_name,
    b.sale_date, b.period_type || 'day', units, price, cost, rev, gp, gpPct, nowIso());
  res.status(201).json({ ok: true, id: r.lastInsertRowid });
});

app.patch('/api/ci/sales/:id', requireAuth(...CI_ROLES), (req, res) => {
  const b     = req.body;
  const units = Number(b.units_sold) || 0;
  const price = Number(b.sale_price) || null;
  const cost  = Number(b.cost_per_unit) || null;
  const rev   = price && units ? price * units : null;
  const gp    = rev && cost   ? rev - (cost * units) : null;
  const gpPct = rev && gp     ? Math.round((gp / rev) * 100) : null;
  db.prepare(`
    UPDATE cocktail_sales
    SET units_sold=?,sale_price=?,cost_per_unit=?,revenue=?,gross_profit=?,gp_percent=?
    WHERE id=? AND venue_id=?
  `).run(units, price, cost, rev, gp, gpPct, req.params.id, req.venueId);
  res.json({ ok: true });
});

app.delete('/api/ci/sales/:id', requireAuth(...CI_ROLES), (req, res) => {
  db.prepare('DELETE FROM cocktail_sales WHERE id=? AND venue_id=?').run(req.params.id, req.venueId);
  res.json({ ok: true });
});

// ── CI NARRATIVES ─────────────────────────────────────────────────────────────

app.get('/api/ci/narratives/:cocktailId', requireAuth(...CI_ROLES), (req, res) => {
  const row = db.prepare(
    'SELECT * FROM cocktail_narratives WHERE venue_id=? AND cocktail_id=? ORDER BY generated_at DESC LIMIT 1'
  ).get(req.venueId, req.params.cocktailId);
  res.json({ narrative: row || null });
});

app.post('/api/ci/narratives/:cocktailId', requireAuth(...CI_ROLES), async (req, res) => {
  try {
    const cocktail = db.prepare('SELECT * FROM cocktails WHERE id=?').get(req.params.cocktailId);
    if (!cocktail) return res.status(404).json({ error: 'Cocktail not found.' });

    const dna = getCIDna(req.venueId);
    const prompt = `You are a luxury hospitality copywriter and brand storyteller.

BAR DNA:
${buildDnaContextString(dna)}

COCKTAIL:
Name: ${cocktail.name}
Description: ${cocktail.description || 'not provided'}
Base spirit: ${cocktail.base_spirit || 'not specified'}
Method: ${cocktail.method || 'not specified'}
Ingredients: ${cocktail.ingredients_text_json}
Garnish: ${cocktail.garnish || 'not specified'}

Generate 3 layers of narrative. Return ONLY valid JSON:
{
  "menu_description": "string (maximum 2 sentences — confident and evocative, not poetic or melancholic; write like a world-class bar, not a romance novel; short, sensory, direct; no technical terms)",
  "server_script": "string (one sentence — natural speech, what a great bartender actually says; not a sales pitch, not a description; conversational and confident)",
  "story_card": "string (internal staff training story: why this ingredient, what inspired it, what makes it uniquely ours)"
}`;

    const raw       = await askGemini(prompt, { jsonMode: true });
    const narrative = JSON.parse(raw);

    db.prepare(`
      INSERT INTO cocktail_narratives
        (venue_id,cocktail_id,cocktail_name,menu_description,server_script,story_card,generated_at)
      VALUES (?,?,?,?,?,?,?)
    `).run(req.venueId, req.params.cocktailId, cocktail.name,
      narrative.menu_description, narrative.server_script, narrative.story_card, nowIso());

    res.json({ ok: true, narrative });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CI SCORES ─────────────────────────────────────────────────────────────────

app.get('/api/ci/scores/:cocktailId', requireAuth(...CI_ROLES), (req, res) => {
  const row = db.prepare(
    'SELECT * FROM cocktail_scores WHERE venue_id=? AND cocktail_id=? ORDER BY generated_at DESC LIMIT 1'
  ).get(req.venueId, req.params.cocktailId);
  res.json({ scores: row ? { ...row, score_notes: JSON.parse(row.score_notes_json || '[]') } : null });
});

app.post('/api/ci/scores/:cocktailId', requireAuth(...CI_ROLES), (req, res) => {
  const b = req.body;
  db.prepare(`
    INSERT INTO cocktail_scores
      (venue_id,cocktail_id,cocktail_name,flavor_balance,menu_fit,profit_score,
       prep_complexity,staff_execution,guest_appeal,originality,seasonal_fit,
       speed_of_service,kosher_readiness,premium_perception,overall_score,
       score_notes_json,generated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    req.venueId, req.params.cocktailId, b.cocktail_name || '',
    b.flavor_balance || null, b.menu_fit || null, b.profit_score || null,
    b.prep_complexity || null, b.staff_execution || null, b.guest_appeal || null,
    b.originality || null, b.seasonal_fit || null, b.speed_of_service || null,
    b.kosher_readiness || null, b.premium_perception || null, b.overall_score || null,
    JSON.stringify(b.low_score_notes || []), nowIso()
  );
  res.status(201).json({ ok: true });
});

// ── CI LIFECYCLE ──────────────────────────────────────────────────────────────

app.get('/api/ci/lifecycle', requireAuth(...CI_ROLES), (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM cocktail_lifecycle WHERE venue_id=? ORDER BY created_at DESC'
  ).all(req.venueId);
  res.json({ lifecycle: rows.map(r => ({ ...r, alert_flags: JSON.parse(r.alert_flags_json || '[]') })) });
});

app.post('/api/ci/lifecycle', requireAuth(...CI_ROLES), (req, res) => {
  const b   = req.body;
  if (!b.cocktail_name) return res.status(400).json({ error: 'cocktail_name is required.' });
  const now = nowIso();
  const r   = db.prepare(`
    INSERT INTO cocktail_lifecycle
      (venue_id,cocktail_id,cocktail_name,date_added,season_added,times_ordered,
       revenue_generated,cost_per_serve,status,alert_flags_json,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    req.venueId, b.cocktail_id || null, b.cocktail_name,
    b.date_added || now.slice(0, 10), b.season_added || getCurrentSeason(),
    b.times_ordered || 0, b.revenue_generated || 0, b.cost_per_serve || null,
    b.status || 'active', JSON.stringify(b.alert_flags || []), now, now
  );
  res.status(201).json({ ok: true, id: r.lastInsertRowid });
});

app.patch('/api/ci/lifecycle/:id', requireAuth(...CI_ROLES), (req, res) => {
  const b   = req.body;
  const now = nowIso();
  db.prepare(`
    UPDATE cocktail_lifecycle
    SET times_ordered      = COALESCE(?, times_ordered),
        revenue_generated  = COALESCE(?, revenue_generated),
        cost_per_serve     = COALESCE(?, cost_per_serve),
        status             = COALESCE(?, status),
        alert_flags_json   = COALESCE(?, alert_flags_json),
        last_reviewed_at   = ?,
        updated_at         = ?
    WHERE id=? AND venue_id=?
  `).run(
    b.times_ordered != null ? b.times_ordered : null,
    b.revenue_generated != null ? b.revenue_generated : null,
    b.cost_per_serve != null ? b.cost_per_serve : null,
    b.status || null,
    b.alert_flags ? JSON.stringify(b.alert_flags) : null,
    now, now, req.params.id, req.venueId
  );
  res.json({ ok: true });
});

// ── CI TRENDS ─────────────────────────────────────────────────────────────────

app.get('/api/ci/trends', requireAuth(...CI_ROLES), (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM cocktail_trends_db WHERE (venue_id=? OR venue_id IS NULL) AND is_active=1 ORDER BY added_at DESC'
  ).all(req.venueId);
  res.json({ trends: rows.map(r => ({ ...r, tags: JSON.parse(r.tags_json || '[]') })) });
});

app.put('/api/ci/trends/:id', requireAuth('owner', 'admin'), (req, res) => {
  const b = req.body;
  db.prepare(`
    UPDATE cocktail_trends_db
    SET category=?,name=?,description=?,market=?,tags_json=?,is_kosher=?,is_active=?,updated_at=?
    WHERE id=?
  `).run(b.category, b.name, b.description || null, b.market || 'israel',
    JSON.stringify(b.tags || []), b.is_kosher ? 1 : 0, b.is_active ? 1 : 0,
    nowIso(), req.params.id);
  res.json({ ok: true });
});

// ── CI EMERGENCY MODE ─────────────────────────────────────────────────────────

app.get('/api/ci/emergency/last', requireAuth(...CI_ROLES), (req, res) => {
  const row = db.prepare(
    'SELECT * FROM cocktail_emergency_log WHERE venue_id=? ORDER BY created_at DESC LIMIT 1'
  ).get(req.venueId);
  if (!row) return res.json({ session: null });
  res.json({
    session: {
      ...row,
      missing_items:      JSON.parse(row.missing_items_json || '[]'),
      affected_cocktails: JSON.parse(row.affected_cocktails_json || '[]'),
      decisions:          JSON.parse(row.decisions_json || '[]'),
      snapshot:           JSON.parse(row.snapshot_json || '{}'),
    },
  });
});

app.post('/api/ci/emergency', requireAuth(...CI_ROLES), async (req, res) => {
  try {
    const { missing_items, confirmed_decisions } = req.body;
    if (!Array.isArray(missing_items) || !missing_items.length) {
      return res.status(400).json({ error: 'missing_items array is required.' });
    }

    // If confirmed_decisions is provided, save the session and return
    if (confirmed_decisions) {
      db.prepare(`
        INSERT INTO cocktail_emergency_log
          (venue_id,session_date,missing_items_json,affected_cocktails_json,
           decisions_json,snapshot_json,created_by,created_at)
        VALUES (?,?,?,?,?,?,?,?)
      `).run(
        req.venueId, nowIso().slice(0, 10),
        JSON.stringify(missing_items),
        JSON.stringify(req.body.affected_cocktails || []),
        JSON.stringify(confirmed_decisions),
        JSON.stringify(req.body.snapshot || {}),
        req.user.full_name, nowIso()
      );
      return res.json({ ok: true, saved: true });
    }

    const activeCocktails = db.prepare('SELECT name, ingredients_text_json FROM cocktails WHERE is_active=1').all();
    const dna             = getCIDna(req.venueId);

    const prompt = `You are a Beverage Director doing rapid pre-service prep for ${dna?.venue_name || 'the venue'}.

ACTIVE COCKTAIL MENU:
${activeCocktails.map(c => `- ${c.name}: ${c.ingredients_text_json}`).join('\n')}

MISSING OR UNAVAILABLE TONIGHT:
${missing_items.join(', ')}

For each affected cocktail, assess impact and suggest the best substitution. Return ONLY valid JSON:
{
  "affected_cocktails": [{
    "cocktail_name": "string",
    "severity": "cannot_be_made | can_be_modified | minor_impact",
    "reason": "string",
    "substitution_ingredient": "string or null",
    "modified_recipe_note": "string or null",
    "recommendation": "86 | modify | serve_as_is"
  }],
  "unaffected_cocktails": ["string"],
  "snapshot_notes": "string (brief summary for team briefing)"
}`;

    const raw      = await askGemini(prompt, { jsonMode: true });
    const analysis = JSON.parse(raw);
    res.json({ ok: true, analysis, missing_items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CI DAILY CLOSE ────────────────────────────────────────────────────────────

app.get('/api/ci/daily-close/active-menu/:venueId', requireAuth(...CI_ROLES), (req, res) => {
  const venueId = req.venueId;

  const active = db.prepare(
    "SELECT * FROM cocktail_menus WHERE venue_id=? AND status='active' ORDER BY created_at DESC LIMIT 1"
  ).get(venueId) || null;

  const allMenusRaw = db.prepare(
    "SELECT * FROM cocktail_menus WHERE venue_id=? ORDER BY created_at DESC"
  ).all(venueId);

  const allMenus = allMenusRaw.map(m => ({
    id:             m.id,
    name:           m.name,
    occasion:       m.occasion,
    season:         m.season,
    status:         m.status,
    cocktail_count: db.prepare('SELECT COUNT(*) as c FROM cocktails WHERE menu_id=?').get(m.id).c
  }));

  res.json({ active, allMenus });
});

app.get('/api/ci/daily-close/cocktails/:menuId', requireAuth(...CI_ROLES), (req, res) => {
  const rows = db.prepare(`
    SELECT id, name, category,
           COALESCE(suggested_price_ils, 0)  AS suggested_price_ils,
           COALESCE(estimated_cost_ils, 0)   AS estimated_cost_ils,
           COALESCE(estimated_gp_percent, 0) AS estimated_gp_percent
    FROM cocktails
    WHERE menu_id=? AND is_active=1
    ORDER BY category, name
  `).all(req.params.menuId);
  res.json({ cocktails: rows });
});

app.post('/api/ci/daily-close/submit', requireAuth(...CI_ROLES), (req, res) => {
  const { menuId, saleDate, entries } = req.body;
  const venueId = req.venueId;

  if (!saleDate || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'saleDate and entries are required.' });
  }

  const valid = entries.filter(e => Number(e.unitsSold) > 0);
  if (!valid.length) return res.json({ success: true, saved: 0 });

  const insertSale = db.prepare(`
    INSERT INTO cocktail_sales
      (venue_id, cocktail_id, cocktail_name, sale_date, period_type,
       units_sold, sale_price, cost_per_unit, revenue, gross_profit, gp_percent, created_at)
    VALUES (?, ?, ?, ?, 'daily', ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const e of valid) {
      const units    = Number(e.unitsSold);
      const price    = Number(e.salePrice)    || 0;
      const cost     = Number(e.costPerUnit)  || 0;
      const revenue  = units * price;
      const gp       = revenue - (units * cost);
      const gpPct    = revenue > 0 ? Math.round((gp / revenue) * 100) : null;
      insertSale.run(
        venueId,
        e.cocktailId  ? Number(e.cocktailId) : null,
        String(e.cocktailName),
        saleDate,
        units,
        price  || null,
        cost   || null,
        revenue > 0 ? revenue  : null,
        revenue > 0 ? gp       : null,
        gpPct,
        nowIso()
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: err.message || 'Failed to save close.' });
  }

  res.json({ success: true, saved: valid.length });
});

// ── CI EXPORTS ────────────────────────────────────────────────────────────────

app.get('/api/ci/export/:type', requireAuth(...CI_ROLES), (req, res) => {
  const { type }       = req.params;
  const cocktailIds    = req.query.cocktail_ids;
  const venueId        = req.venueId;
  const dna            = getCIDna(venueId);
  const venueName      = dna?.venue_name || 'HESTIA Venue';
  const date           = new Date().toLocaleDateString('en-GB');

  let cocktails;
  if (cocktailIds) {
    const ids = cocktailIds.split(',').map(Number).filter(Boolean);
    cocktails = ids.map(cid => db.prepare('SELECT * FROM cocktails WHERE id=?').get(cid)).filter(Boolean);
  } else {
    cocktails = db.prepare('SELECT * FROM cocktails WHERE is_active=1').all();
  }

  const parseIng = c => { try { return JSON.parse(c.ingredients_text_json || '[]'); } catch { return []; } };

  const BASE_CSS = `body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#1a1a1a;}
    h1{font-size:1.9em;border-bottom:2px solid #c9a96e;padding-bottom:12px;letter-spacing:1px;}
    p.meta{color:#888;margin-top:4px;} @media print{body{margin:20px;}}`;

  let html = '';

  if (type === 'guest_menu') {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${venueName} — Menu</title>
<style>${BASE_CSS}.item{margin:28px 0;}.name{font-size:1.2em;font-weight:bold;letter-spacing:.5px;}
.desc{font-style:italic;color:#444;margin-top:6px;line-height:1.65;}</style></head>
<body><h1>${venueName}</h1><p class="meta">${date}</p>`;
    for (const c of cocktails) {
      const n = db.prepare('SELECT menu_description FROM cocktail_narratives WHERE cocktail_id=? ORDER BY generated_at DESC LIMIT 1').get(c.id);
      html += `<div class="item"><div class="name">${c.name}</div><div class="desc">${n?.menu_description || c.description || ''}</div></div>`;
    }
    html += '</body></html>';

  } else if (type === 'spec_sheet') {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${venueName} — Spec Sheet</title>
<style>${BASE_CSS}body{font-family:Arial,sans-serif;}.card{margin:28px 0;padding:20px;border:1px solid #ddd;border-radius:4px;page-break-inside:avoid;}
.card h2{margin:0 0 8px;font-size:1.15em;}table{width:100%;border-collapse:collapse;margin:10px 0;}
td,th{padding:6px 8px;border:1px solid #ddd;font-size:.9em;}th{background:#f5f5f5;}</style></head>
<body><h1>${venueName} — Bartender Spec Sheet</h1><p class="meta">${date}</p>`;
    for (const c of cocktails) {
      const ings = parseIng(c);
      const rows = ings.map(i => {
        const name = typeof i === 'object' ? (i.name || '') : String(i);
        const amt  = typeof i === 'object' ? `${i.amount || ''} ${i.unit || ''}`.trim() : '';
        return `<tr><td>${name}</td><td>${amt}</td></tr>`;
      }).join('');
      html += `<div class="card"><h2>${c.name}</h2>
<p><strong>Method:</strong> ${c.method || '—'} &nbsp; <strong>Glass:</strong> ${c.glass_type || '—'} &nbsp; <strong>Garnish:</strong> ${c.garnish || '—'}</p>
<table><tr><th>Ingredient</th><th>Amount</th></tr>${rows}</table></div>`;
    }
    html += '</body></html>';

  } else if (type === 'staff_briefing') {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${venueName} — Staff Briefing</title>
<style>${BASE_CSS}body{font-family:Arial,sans-serif;}.card{margin:28px 0;padding:20px;border:1px solid #ddd;border-radius:4px;page-break-inside:avoid;}
.card h2{margin:0 0 12px;}.label{font-weight:bold;margin-top:14px;color:#555;font-size:.85em;text-transform:uppercase;letter-spacing:.5px;}</style></head>
<body><h1>${venueName} — Staff Briefing Cards</h1><p class="meta">${date}</p>`;
    for (const c of cocktails) {
      const n = db.prepare('SELECT server_script,story_card FROM cocktail_narratives WHERE cocktail_id=? ORDER BY generated_at DESC LIMIT 1').get(c.id);
      html += `<div class="card"><h2>${c.name}</h2>
<div class="label">How to Sell</div><p>${n?.server_script || '—'}</p>
<div class="label">Story Card (Internal)</div><p>${n?.story_card || '—'}</p></div>`;
    }
    html += '</body></html>';

  } else if (type === 'costing_sheet') {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${venueName} — Costing</title>
<style>${BASE_CSS}body{font-family:Arial,sans-serif;}table{width:100%;border-collapse:collapse;margin-top:20px;}
td,th{padding:8px 10px;border:1px solid #ddd;}th{background:#f5f5f5;}
.est{color:#999;font-style:italic;font-size:.8em;}</style></head>
<body><h1>${venueName} — Costing Sheet</h1><p class="meta">${date} — All figures are estimates unless marked verified.</p>
<table><tr><th>Cocktail</th><th>Cost (ILS)</th><th>Sell (ILS)</th><th>GP%</th></tr>`;
    for (const c of cocktails) {
      const p    = db.prepare('SELECT * FROM cocktail_pricing WHERE cocktail_id=?').get(c.id);
      const cost = p?.cost_price != null ? p.cost_price : '—';
      const sell = p?.sell_price != null ? p.sell_price : '—';
      const gp   = (p?.cost_price && p?.sell_price) ? Math.round((1 - p.cost_price / p.sell_price) * 100) + '%' : '—';
      const flag = (p?.cost_price || p?.sell_price) ? '<span class="est">est.</span>' : '';
      html += `<tr><td>${c.name}</td><td>${cost} ${flag}</td><td>${sell} ${flag}</td><td>${gp}</td></tr>`;
    }
    html += '</table></body></html>';

  } else if (type === 'sales_report') {
    const sales  = db.prepare('SELECT * FROM cocktail_sales WHERE venue_id=? ORDER BY sale_date DESC LIMIT 500').all(venueId);
    const byName = {};
    for (const s of sales) {
      if (!byName[s.cocktail_name]) byName[s.cocktail_name] = { units: 0, revenue: 0, gp: 0 };
      byName[s.cocktail_name].units   += s.units_sold || 0;
      byName[s.cocktail_name].revenue += s.revenue || 0;
      byName[s.cocktail_name].gp      += s.gross_profit || 0;
    }
    const sorted = Object.entries(byName).sort((a, b) => b[1].revenue - a[1].revenue);
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${venueName} — Sales Report</title>
<style>${BASE_CSS}body{font-family:Arial,sans-serif;}table{width:100%;border-collapse:collapse;margin-top:20px;}
td,th{padding:8px 10px;border:1px solid #ddd;}th{background:#f5f5f5;}</style></head>
<body><h1>${venueName} — Sales Performance Report</h1><p class="meta">${date}</p>
<table><tr><th>Cocktail</th><th>Units Sold</th><th>Revenue (ILS)</th><th>Gross Profit (ILS)</th><th>GP%</th></tr>`;
    for (const [name, d] of sorted) {
      const gp = d.revenue ? Math.round((d.gp / d.revenue) * 100) + '%' : '—';
      html += `<tr><td>${name}</td><td>${d.units}</td><td>${Math.round(d.revenue)}</td><td>${Math.round(d.gp)}</td><td>${gp}</td></tr>`;
    }
    html += '</table></body></html>';

  } else {
    return res.status(400).json({ error: `Unknown export type: ${type}. Valid: guest_menu, spec_sheet, staff_briefing, costing_sheet, sales_report` });
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// ── Beverage Director Chat ────────────────────────────────────────────────────
app.post('/api/ci/director/chat', requireAuth(...CI_ROLES), async (req, res) => {
  try {
    const { message, history = [], menuCocktails = [] } = req.body;
    debugLog({ event: 'director_chat_received', message: message?.slice(0, 80), history_turns: history.length, menu_cocktail_count: menuCocktails.length });
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required.' });
    }
    const dna = getCIDna(req.venueId);
    const omer = getOmerVenueContext(req.venueId);
    const systemInstruction = buildDirectorSystemInstruction(dna, menuCocktails, omer.text || '');
    const reply = await askGeminiChat(systemInstruction, history, message.trim());
    res.json({ reply, venueContextActive: omer.active, venueContextConfidence: omer.confidence });
  } catch (err) {
    debugLog({ event: 'director_chat_threw', error: err.message, stack: err.stack?.slice(0, 300) });
    res.status(500).json({ error: err.message || 'Chat request failed.' });
  }
});

// ── Venue Intelligence — Venue Learning Engine ───────────────────────────────
// A focused, premium client conversation that progressively learns the venue and
// extracts Venue DNA. Owner/Admin only. Not a generic chatbot — a strategic session.

const VENUE_INTELLIGENCE_STAGES = ['story', 'identity', 'operations', 'discovery'];

function emptyVenueDna() {
  return {
    hospitalityStyle: [],
    businessTypeSignals: [],
    guestExperienceSignals: [],
    beverageSignals: [],
    foodSignals: [],
    serviceSignals: [],
    trainingSignals: [],
    operationalPainPoints: [],
    ownerPriorities: [],
    emotionalDrivers: [],
    growthOpportunities: [],
    confidence: { identity: 0, operations: 0, guest: 0, training: 0, commercial: 0 },
    summary: '',
    openQuestions: []
  };
}

// Loads (or lazily creates) the single venue intelligence row for a venue.
function getVenueIntelligence(venueId) {
  let row = db.prepare('SELECT * FROM venue_intelligence WHERE venue_id = ?').get(venueId);
  if (!row) {
    db.prepare('INSERT INTO venue_intelligence (venue_id) VALUES (?)').run(venueId);
    row = db.prepare('SELECT * FROM venue_intelligence WHERE venue_id = ?').get(venueId);
  }
  let messages = [];
  let venueDNA = emptyVenueDna();
  try { messages = JSON.parse(row.messages_json || '[]'); } catch { messages = []; }
  try { venueDNA = { ...emptyVenueDna(), ...JSON.parse(row.venue_dna_json || '{}') }; } catch { venueDNA = emptyVenueDna(); }
  return {
    venueId,
    stage: row.stage || 'story',
    objective: row.objective || '',
    messages: Array.isArray(messages) ? messages : [],
    venueDNA,
    updatedAt: row.updated_at
  };
}

// Light grounding context — real venue identity if the venue has already entered
// Bar DNA. Never fabricated; absent fields are simply omitted.
function venueGroundingContext(venueId) {
  const lines = [];
  const venue = db.prepare('SELECT name, venue_type FROM venues WHERE id = ?').get(venueId);
  if (venue?.name && venue.name !== 'HESTIA Flagship Venue') lines.push(`Known venue name: ${venue.name}`);
  if (venue?.venue_type) lines.push(`Recorded venue type: ${venue.venue_type}`);
  try {
    const dna = getCIDna(venueId);
    if (dna?.venue_name) lines.push(`Bar DNA venue name: ${dna.venue_name}`);
    if (dna?.venue_type) lines.push(`Bar DNA venue type: ${dna.venue_type}`);
    if (dna?.atmosphere) lines.push(`Bar DNA atmosphere: ${dna.atmosphere}`);
    if (dna?.cuisine_style) lines.push(`Bar DNA cuisine style: ${dna.cuisine_style}`);
  } catch { /* CI DNA optional */ }
  return lines.length
    ? `KNOWN VENUE CONTEXT (already on record — use it, do not re-ask what you already know):\n${lines.join('\n')}`
    : 'KNOWN VENUE CONTEXT: none on record yet. This may be the venue\'s first conversation with HESTIA.';
}

function buildVenueIntelligenceSystemInstruction(state) {
  const stageGuide = {
    story: 'STORY LAYER — Begin humanly. Learn the founder and the soul of the place. Ask about why they opened it, what they are proud of, the feeling they want guests to have, the moment that still gives them energy. Do not ask "what problem do you want to solve". Collect emotional and founder DNA.',
    identity: 'IDENTITY LAYER — Start inferring the venue type and personality from what they have said (luxury, casual, nightlife, culinary, beverage-led, community-led, hotel-style, events-driven, premium-casual, founder-led, staff-dependent, training-heavy). Do not ask "what type of business are you". Infer it, then confirm gently.',
    operations: 'OPERATIONAL REALITY LAYER — Trust has been built. Explore operational pain. What drains energy, where the business feels heavier than it should, what keeps repeating no matter how often it is fixed. Detect patterns behind answers — a "bartenders forget training" comment may signal onboarding, knowledge retention, management capacity, or consistency problems.',
    discovery: 'INTELLIGENCE DISCOVERY LAYER — Discover what intelligence the venue actually needs. What would they want in a morning briefing, what they would ask a 24/7 AI F&B Director, what they wish they understood about guests, which decisions they make with too little information, which part of the business feels like guesswork.'
  };

  return `You are HESTIA — a senior hospitality strategist conducting a focused, intelligent working session with the owner of a premium venue.

This is not a questionnaire and not a support chat. It is the start of a relationship in which HESTIA learns the venue deeply over time. The owner should leave feeling: "HESTIA is starting to understand my business."

VOICE
- Calm, direct, warm, intelligent. A senior advisor, never a cheerful assistant.
- Short paragraphs. One strong question at a time. Occasional reflection and synthesis.
- Hospitality-specific interpretation, not generic consulting language.
- Never say "As an AI", never "Great question!", no buzzwords, no fake certainty, no invented numbers or KPIs, no overpromising.

CONVERSATION MODEL — four layers, advanced gently as understanding deepens:
1. ${stageGuide.story}
2. ${stageGuide.identity}
3. ${stageGuide.operations}
4. ${stageGuide.discovery}

You decide each turn whether to keep exploring, summarize, clarify, gently refocus, move to another layer, ask a concrete follow-up, or offer a choice between directions. Do not blindly march through questions.

GENTLE FOCUS
When the owner becomes scattered, vague, or drifts far from the current objective, refocus warmly and briefly — never aggressively. Examples of the tone:
- "I want to hold onto that, because it sounds important. Let's connect it back to the main question."
- "It feels like we're circling around staff and consistency. Is that the real pressure point?"
- "Let me pause for a second and reflect what I heard."
- "I may be wrong, but it sounds like the issue is less the menu and more how the team executes it."
- "Should we focus this on service, team capability, or revenue opportunities?"
Prefer short, useful refocusing over long explanation.

CURRENT SESSION STATE
- Current stage: ${state.stage}
- Current objective: ${state.objective || '(not yet set — set one)'}
- Venue understanding so far (Venue DNA): ${JSON.stringify(state.venueDNA)}

${venueGroundingContext(state.venueId)}

YOUR TASK EACH TURN
Read the latest owner message in the context of the whole conversation. Update HESTIA's understanding, then respond as the strategist.

Return ONLY valid JSON — no markdown, no commentary — with this EXACT shape:
{
  "reply": "string — what you say to the owner next. Strategist voice. Usually one reflection plus one strong question. Keep it tight.",
  "stage": "one of: story | identity | operations | discovery — the stage the conversation is now in",
  "objective": "string — the single focus of the conversation right now, one short phrase",
  "venueDNA": {
    "hospitalityStyle": ["..."],
    "businessTypeSignals": ["..."],
    "guestExperienceSignals": ["..."],
    "beverageSignals": ["..."],
    "foodSignals": ["..."],
    "serviceSignals": ["..."],
    "trainingSignals": ["..."],
    "operationalPainPoints": ["..."],
    "ownerPriorities": ["..."],
    "emotionalDrivers": ["..."],
    "growthOpportunities": ["..."],
    "confidence": { "identity": 0, "operations": 0, "guest": 0, "training": 0, "commercial": 0 },
    "summary": "string — 1-3 sentences on what HESTIA now understands about this venue",
    "openQuestions": ["..."]
  },
  "focusSuggestions": ["2-3 short possible directions to take the conversation next"]
}

RULES FOR venueDNA
- Return the FULL, updated object every turn. Start from the understanding already provided above and refine it — never reset it.
- Only add signals you actually heard or can reasonably infer. Never invent facts about the venue.
- Keep each array concise and deduplicated (at most ~8 items). Phrase signals as short noun phrases.
- If you have no signal for an array yet, leave it empty.

SIGNAL EXTRACTION GUIDANCE — capture these as deliberately as operational pain. Owners state them in passing and they are the signals most often lost. Record them in the DNA, not only in your reply:
- COMMERCIAL signal is dropped most often. Whenever the owner mentions revenue, margin, profit, check average, covers or volume, pricing, where the money actually comes from (e.g. banquets, weekends, a hero product), a soft or peak period (quiet midweek, brutal Saturdays), or unrealised upside (unsold desserts, missed upsell, an untapped daypart) — capture it. Put unrealised upside in growthOpportunities; put the owner's explicit commercial goals in ownerPriorities.
- GUEST signal beyond a one-word label. Capture WHO the guest is (regulars, families, business travelers, dates), the OCCASION (Sunday lunch, after-work, celebration, overnight stay), and what they EXPECT (speed, reliability, intimacy, value, theatre) — all into guestExperienceSignals.
- OWNER PRIORITIES & GOALS. When the owner says what they want to fix, improve, protect, or achieve ("get new bartenders to senior consistency faster", "lift the check without squeezing families", "protect the scores"), record it in ownerPriorities.
- Guardrail: only capture what was actually said or clearly implied — never invent a number, price, or goal. An empty category is fine; a stated-but-dropped signal is not.

CONFIDENCE CALIBRATION (integers 0-100) — score what you actually understand, not how long you have talked. Do NOT leave a dimension at 0 once its signal is clearly present, and do NOT jump to 90+ from a single remark. Use these anchors:
- identity: 0 only if the venue's nature is still unclear. Once venue TYPE + STYLE + GUEST PROFILE are evident (e.g. "intimate luxury cocktail bar for regulars"), identity should be 55-75. Raise toward 80+ only when personality, positioning, and differentiation are all clear and consistent.
- operations: rises once a recurring pain or operational pressure is named (consistency, turnover, coordination, pacing, peaks). One clearly described pain → 40-60. Multiple corroborated pains with detail → 65-80.
- training: rises the moment staffing, onboarding, consistency, retention, or capability gaps are named. A clearly stated training/consistency pain → 45-65. Do NOT leave training at 0 if the owner has described people or consistency problems.
- commercial: rises once margins, revenue, check average, pricing, midweek/peak softness, covers, or growth opportunities are named. One concrete commercial signal → 40-60.
- guest: rises once guest TYPE, occasion, or service expectation is named (regulars, families, business travelers, speed, intimacy). A clear guest profile → 45-65.
General: a dimension with 2+ concrete, consistent signals should sit at 50-70, not single digits. Confidence may rise across turns but should never fall on a thin turn — keep the higher prior value if a later turn adds nothing new to that dimension.`;
}

async function askVenueIntelligence(systemInstruction, history) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Venue Intelligence is unavailable — the server API key is not configured. Please contact your administrator.');

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map(turn => ({ role: turn.role === 'model' ? 'assistant' : turn.role, content: turn.content }))
  ];

  debugLog({ event: 'venue_intelligence_request', model: 'gpt-4o-mini', history_turns: history.length });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data.error?.message || 'OpenAI request failed.';
    debugLog({ event: 'venue_intelligence_error', status: response.status, body: data });
    if (/api.?key|key.*invalid|invalid.*key/i.test(msg)) {
      throw new Error('Venue Intelligence is unavailable — the server API key is missing or invalid. Please contact your administrator.');
    }
    throw new Error(msg);
  }

  const raw = data.choices?.[0]?.message?.content || '{}';
  let parsed;
  try { parsed = JSON.parse(raw); } catch {
    debugLog({ event: 'venue_intelligence_parse_failed', raw: raw.slice(0, 300) });
    throw new Error('HESTIA returned a response it could not structure. Please try again.');
  }
  return parsed;
}

// Merge model output onto the prior DNA so the structure is always complete and
// confidence never silently regresses to zero on a thin turn.
function mergeVenueDna(prior, incoming) {
  const base = { ...emptyVenueDna(), ...prior };
  if (!incoming || typeof incoming !== 'object') return base;
  const arrayKeys = [
    'hospitalityStyle', 'businessTypeSignals', 'guestExperienceSignals', 'beverageSignals',
    'foodSignals', 'serviceSignals', 'trainingSignals', 'operationalPainPoints',
    'ownerPriorities', 'emotionalDrivers', 'growthOpportunities', 'openQuestions'
  ];
  for (const key of arrayKeys) {
    if (Array.isArray(incoming[key])) {
      const cleaned = incoming[key].map(v => String(v).trim()).filter(Boolean);
      base[key] = Array.from(new Set(cleaned)).slice(0, 8);
    }
  }
  if (incoming.confidence && typeof incoming.confidence === 'object') {
    base.confidence = { ...base.confidence };
    for (const dim of ['identity', 'operations', 'guest', 'training', 'commercial']) {
      const v = Number(incoming.confidence[dim]);
      // Confidence is monotonic: a recognized dimension never regresses on a thin
      // turn that simply didn't revisit it. Keep the higher of prior vs incoming.
      if (Number.isFinite(v)) {
        const prior = Number(base.confidence[dim]) || 0;
        base.confidence[dim] = Math.max(prior, Math.max(0, Math.min(100, Math.round(v))));
      }
    }
  }
  if (typeof incoming.summary === 'string') base.summary = incoming.summary.trim();

  // Deterministic confidence FLOOR — real captured signal must never read as zero
  // understanding. A populated signal array (or a pain/priority that clearly names
  // a dimension) implies at least basic understanding, so the dimension is floored
  // to 40. This is a floor, not an override: it never lowers a higher LLM score and
  // never asserts certainty — it just stops genuine signal from showing as 0 when
  // the model under-scores guest/commercial. No fabrication: the floor only lifts a
  // dimension the venue actually spoke to.
  const hasCommercial = base.growthOpportunities.length > 0 ||
    base.ownerPriorities.some(p => /margin|revenue|check|pric|profit|growth|upsell|cost|sales|cover|midweek/i.test(p)) ||
    base.businessTypeSignals.some(p => /margin|revenue|profit|volume/i.test(p));
  const hasTraining = base.trainingSignals.length > 0 ||
    [...base.operationalPainPoints, ...base.serviceSignals].some(p => /train|staff|onboard|turnover|consisten|retention|hire|coach/i.test(p));
  const floors = {
    identity:   (base.businessTypeSignals.length || base.hospitalityStyle.length || base.emotionalDrivers.length) ? 40 : 0,
    operations: base.operationalPainPoints.length ? 40 : 0,
    guest:      base.guestExperienceSignals.length ? 40 : 0,
    training:   hasTraining ? 40 : 0,
    commercial: hasCommercial ? 40 : 0
  };
  for (const dim of ['identity', 'operations', 'guest', 'training', 'commercial']) {
    base.confidence[dim] = Math.max(Number(base.confidence[dim]) || 0, floors[dim]);
  }
  return base;
}

// GET — current learning session for the venue (graceful empty state on first visit).
app.get('/api/venue-intelligence', requireAuth('owner'), (req, res) => {
  try {
    const state = getVenueIntelligence(req.venueId);
    res.json({ state });
  } catch (err) {
    debugLog({ event: 'venue_intelligence_get_threw', error: err.message });
    res.status(500).json({ error: err.message || 'Could not load the venue learning session.' });
  }
});

// POST — owner sends a message; HESTIA replies and updates Venue DNA.
app.post('/api/venue-intelligence/message', requireAuth('owner'), async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A message is required.' });
    }
    const venueId = req.venueId;
    const state = getVenueIntelligence(venueId);

    const userTurn = { role: 'user', content: message.trim(), ts: new Date().toISOString() };
    const historyForModel = [...state.messages, userTurn];

    const systemInstruction = buildVenueIntelligenceSystemInstruction(state);
    const ai = await askVenueIntelligence(systemInstruction, historyForModel);

    const reply = typeof ai.reply === 'string' && ai.reply.trim()
      ? ai.reply.trim()
      : 'Let me sit with that for a moment. Tell me a little more about how that plays out on a normal night.';
    const stage = VENUE_INTELLIGENCE_STAGES.includes(ai.stage) ? ai.stage : state.stage;
    const objective = typeof ai.objective === 'string' && ai.objective.trim() ? ai.objective.trim() : state.objective;
    const venueDNA = mergeVenueDna(state.venueDNA, ai.venueDNA);
    const focusSuggestions = Array.isArray(ai.focusSuggestions)
      ? ai.focusSuggestions.map(v => String(v).trim()).filter(Boolean).slice(0, 3)
      : [];

    const modelTurn = { role: 'model', content: reply, ts: new Date().toISOString() };
    const nextMessages = [...historyForModel, modelTurn].slice(-80);

    db.prepare(`
      UPDATE venue_intelligence
      SET stage = ?, objective = ?, messages_json = ?, venue_dna_json = ?, updated_at = datetime('now')
      WHERE venue_id = ?
    `).run(stage, objective, JSON.stringify(nextMessages), JSON.stringify(venueDNA), venueId);

    // Venue DNA changed — refresh the derived specialist briefs (non-fatal).
    try { regenerateVenueBriefs(venueId); }
    catch (e) { debugLog({ event: 'venue_briefs_regen_failed', error: e.message }); }

    res.json({ reply, stage, objective, venueDNA, focusSuggestions });
  } catch (err) {
    debugLog({ event: 'venue_intelligence_message_threw', error: err.message, stack: err.stack?.slice(0, 300) });
    res.status(500).json({ error: err.message || 'The conversation could not continue. Please try again.' });
  }
});

// POST — start fresh. Clears the conversation, Venue DNA, and derived briefs.
app.post('/api/venue-intelligence/reset', requireAuth('owner'), (req, res) => {
  try {
    const venueId = req.venueId;
    db.prepare(`
      UPDATE venue_intelligence
      SET stage = 'story', objective = '', messages_json = '[]', venue_dna_json = '{}', updated_at = datetime('now')
      WHERE venue_id = ?
    `).run(venueId);
    db.prepare('DELETE FROM venue_briefs WHERE venue_id = ?').run(venueId);
    res.json({ state: getVenueIntelligence(venueId) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not reset the session.' });
  }
});

// ── Venue Intelligence Candidates — review/approval (Phase 7A) ─────────────────
// Read-only list/detail + a review PATCH. SIGNAL-ONLY: a candidate is NEVER Venue
// DNA. Review NEVER mutates Venue DNA, NEVER calls mergeVenueDna, NEVER writes
// venue_intelligence/venue_briefs/venue_dna_enrichment, and has NO candidate→DNA path.
// Read: CI_ROLES (they create the F&B decisions these derive from). Review: owner/admin only.

// GET — compact list of candidates for the venue (filters: candidate_type, human_review_status, limit).
app.get('/api/venue-intelligence/candidates', requireAuth(...CI_ROLES), (req, res) => {
  try {
    const filters = {};
    if (typeof req.query.candidate_type === 'string') filters.candidate_type = req.query.candidate_type;
    if (typeof req.query.human_review_status === 'string') filters.human_review_status = req.query.human_review_status;
    if (req.query.limit != null) filters.limit = Number(req.query.limit);
    const rows = listVenueIntelligenceCandidatesForVenue(db, req.venueId, filters);
    // Compact projection — no large JSON snapshots in the list.
    const candidates = rows.map(r => ({
      id: r.id,
      candidate_type: r.candidate_type,
      source_domain: r.source_domain,
      source_decision_id: r.source_decision_id,
      candidate_summary: r.candidate_summary,
      status: r.status,
      human_review_status: r.human_review_status,
      reviewed_by: r.reviewed_by,
      reviewed_at: r.reviewed_at,
      confidence_level: (r.confidence && r.confidence.level) || null,
      created_at: r.created_at,
    }));
    res.json({ ok: true, candidates, note: 'Candidates are reviewable learning signals only — never confirmed Venue DNA.' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not list candidates.' });
  }
});

// GET — one venue-scoped candidate (full, parsed). 404 if not found / cross-venue.
app.get('/api/venue-intelligence/candidates/:candidateId', requireAuth(...CI_ROLES), (req, res) => {
  try {
    const candidate = getVenueIntelligenceCandidateById(db, req.venueId, req.params.candidateId);
    if (!candidate) return res.status(404).json({ ok: false, error: 'No candidate found for this venue.' });
    res.json({ ok: true, candidate, note: 'Candidate is a reviewable learning signal only — not confirmed Venue DNA.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not read the candidate.' });
  }
});

// PATCH — human review (owner/admin only). Signal-only: never mutates Venue DNA.
app.patch('/api/venue-intelligence/candidates/:candidateId/review', requireAuth('owner', 'admin'), (req, res) => {
  try {
    const updated = markVenueIntelligenceCandidateReviewed(db, req.venueId, req.params.candidateId, {
      human_review_status: req.body && req.body.human_review_status,
      reviewed_by: (req.user && (req.user.full_name || req.user.id)) || null,
      review_note: req.body && req.body.review_note,
    });
    if (!updated) return res.status(404).json({ ok: false, error: 'No candidate found for this venue.' });
    res.json({ ok: true, candidate: updated, note: 'Reviewed as a learning signal only — Venue DNA was not changed.' });
  } catch (err) {
    // Invalid review status / bad input → 400 (validation throw from the service).
    res.status(400).json({ error: err.message || 'Could not review the candidate.' });
  }
});

// ── Venue Intelligence Bridge — distribution layer ───────────────────────────
// Reads Venue DNA + venue metadata + Bar DNA + operational memory, derives the
// specialist briefs deterministically, and persists them. Specialist modules
// read the result through the shared service endpoints below; they are not
// modified by this layer.

const BRIDGE_READ_ROLES = ['owner', 'admin', 'bar_manager', 'fb_director', 'manager', 'events_manager', 'chef'];

// Read raw operational counts from EXISTING systems only. Every query is
// defensive — a missing table/column yields 0, never an error or fabricated value.
function readOperationalRaw(venueId) {
  const one = (sql, ...args) => { try { return db.prepare(sql).get(...args)?.c || 0; } catch { return 0; } };
  return {
    closedShifts:    one("SELECT COUNT(*) c FROM shifts WHERE venue_id=? AND status='closed'", venueId)
                     || one('SELECT COUNT(*) c FROM shift_reports WHERE venue_id=?', venueId),
    complaintsReports: one("SELECT COUNT(*) c FROM shift_reports WHERE venue_id=? AND complaints IS NOT NULL AND TRIM(complaints)<>''", venueId),
    incidentsTotal:      one('SELECT COUNT(*) c FROM incidents WHERE venue_id=?', venueId),
    incidentsUnresolved: one('SELECT COUNT(*) c FROM incidents WHERE venue_id=? AND resolved=0', venueId),
    incidents30d:        one("SELECT COUNT(*) c FROM incidents WHERE venue_id=? AND created_at >= datetime('now','-30 days')", venueId),
    actionsOpen:      one('SELECT COUNT(*) c FROM actions WHERE venue_id=? AND done=0', venueId),
    actionsCompleted: one('SELECT COUNT(*) c FROM actions WHERE venue_id=? AND done=1', venueId),
    actionsStale:     one("SELECT COUNT(*) c FROM actions WHERE venue_id=? AND done=0 AND created_at <= datetime('now','-3 days')", venueId),
    memoryCount:      one('SELECT COUNT(*) c FROM business_memory WHERE venue_id=?', venueId),
    // Academy activity is VENUE-SCOPED via venue membership: count only lessons
    // completed by real staff of THIS venue (active members). Platform admins are
    // excluded — they are auto-added as the creator of every venue and are not
    // venue training staff, so their personal progress must not read as this
    // venue's capability building. A brand-new venue therefore shows zero academy
    // activity until its own staff actually train, never a global figure.
    academyCompletedModules: one(
      "SELECT COUNT(*) c FROM staff_progress sp " +
      "JOIN venue_members vm ON vm.user_id = sp.user_id AND vm.venue_id = ? AND vm.active = 1 " +
      "JOIN auth_users au ON au.id = sp.user_id " +
      "WHERE (sp.status='completed' OR sp.completed_at IS NOT NULL) AND au.role <> 'admin'",
      venueId
    ),
    academyActiveLearners: (() => { try { return db.prepare(
      "SELECT COUNT(DISTINCT sp.user_id) c FROM staff_progress sp " +
      "JOIN venue_members vm ON vm.user_id = sp.user_id AND vm.venue_id = ? AND vm.active = 1 " +
      "JOIN auth_users au ON au.id = sp.user_id " +
      "WHERE (sp.status='completed' OR sp.completed_at IS NOT NULL) AND au.role <> 'admin'"
    ).get(venueId)?.c || 0; } catch { return 0; } })(),
    eventsTotal:     one('SELECT COUNT(*) c FROM events WHERE venue_id=?', venueId),
    eventsUpcoming:  one("SELECT COUNT(*) c FROM events WHERE venue_id=? AND status NOT IN ('completed','cancelled') AND event_date >= date('now')", venueId),
    eventsCompleted: one("SELECT COUNT(*) c FROM events WHERE venue_id=? AND status='completed'", venueId)
  };
}

// Operational Intelligence Feed: normalized signals + additive DNA enrichment.
// Persists a transparent snapshot. Never overwrites the conversational Venue DNA.
function getOperationalIntelligence(venueId) {
  const state = getVenueIntelligence(venueId);
  const signals = buildOperationalSignals(readOperationalRaw(venueId));
  const enrichment = deriveDnaEnrichment(state.venueDNA, signals);
  try {
    db.prepare(`
      INSERT INTO venue_dna_enrichment (venue_id, signals_json, enrichment_json, generated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(venue_id) DO UPDATE SET
        signals_json = excluded.signals_json, enrichment_json = excluded.enrichment_json, generated_at = datetime('now')
    `).run(venueId, JSON.stringify(signals), JSON.stringify(enrichment));
  } catch (e) { debugLog({ event: 'enrichment_persist_failed', error: e.message }); }
  return { signals, enrichment };
}

// Regenerate and persist all specialist briefs for a venue from its current DNA,
// enriched by operational reality (Phase 5).
function regenerateVenueBriefs(venueId) {
  const state = getVenueIntelligence(venueId);

  let barDNA = null;
  try { barDNA = getCIDna(venueId); } catch { barDNA = null; }

  const venue = db.prepare('SELECT name, venue_type FROM venues WHERE id = ?').get(venueId) || {};

  // Operational feedback loop — enrich DNA confidence additively from real ops.
  const { signals, enrichment } = getOperationalIntelligence(venueId);
  const enrichedDNA = {
    ...state.venueDNA,
    confidence: applyConfidenceDeltas(state.venueDNA.confidence, enrichment.confidenceDeltas)
  };

  const result = buildVenueBriefs({
    venueDNA: enrichedDNA,
    metadata: { venueName: venue.name, venueType: venue.venue_type, stage: state.stage, objective: state.objective },
    barDNA,
    operationalMemory: { memoryEventCount: signals.memory.count }
  });

  const upsert = db.prepare(`
    INSERT INTO venue_briefs (venue_id, brief_type, title, brief_json, source_hash, confidence, status, generated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(venue_id, brief_type) DO UPDATE SET
      title = excluded.title, brief_json = excluded.brief_json, source_hash = excluded.source_hash,
      confidence = excluded.confidence, status = excluded.status, generated_at = datetime('now')
  `);
  for (const b of result.briefs) {
    upsert.run(venueId, b.type, b.title, JSON.stringify(b), result.sourceHash, b.confidence ?? 0, b.status || 'ready');
  }
  return result;
}

// Shared read service — lazily generates briefs on first read so specialist
// modules always receive a complete, current set.
function readVenueBriefs(venueId) {
  let rows = db.prepare('SELECT * FROM venue_briefs WHERE venue_id = ?').all(venueId);
  if (!rows.length) {
    regenerateVenueBriefs(venueId);
    rows = db.prepare('SELECT * FROM venue_briefs WHERE venue_id = ?').all(venueId);
  }
  return rows.map(r => {
    let body = {};
    try { body = JSON.parse(r.brief_json); } catch { body = {}; }
    return { ...body, generatedAt: r.generated_at, sourceHash: r.source_hash };
  });
}

// Shared accessor: the venue-intelligence context block Omer / Cocktail
// Intelligence inject into their AI requests. Always safe — any failure returns
// an inactive context so existing generation continues unchanged.
function getOmerVenueContext(venueId) {
  try {
    // Omer needs only briefs + metadata — a light bundle (no ops recompute per chat).
    const briefs = readVenueBriefs(venueId);
    const venue = db.prepare('SELECT name, venue_type FROM venues WHERE id = ?').get(venueId) || {};
    return selectOmerContext({ briefs, metadata: { venueName: venue.name, venueType: venue.venue_type } });
  } catch (err) {
    debugLog({ event: 'omer_context_failed', error: err.message });
    return { active: false, confidence: 0, text: null };
  }
}

// Single raw reader for the full venue intelligence picture — loaded ONCE and
// shared across specialist selectors (Phase 7 — no duplicate DNA/brief readers).
function loadVenueIntelligenceBundle(venueId) {
  const state = getVenueIntelligence(venueId);
  const briefs = readVenueBriefs(venueId);
  const venue = db.prepare('SELECT name, venue_type FROM venues WHERE id = ?').get(venueId) || {};
  const { signals, enrichment } = getOperationalIntelligence(venueId);
  return {
    venueId,
    venueDNA: state.venueDNA,
    stage: state.stage,
    objective: state.objective,
    metadata: { venueName: venue.name, venueType: venue.venue_type },
    briefs,
    signals,
    enrichment
  };
}

// GET — all specialist briefs for the venue (shared service entry point).
app.get('/api/venue-bridge/briefs', requireAuth(...BRIDGE_READ_ROLES), (req, res) => {
  try {
    res.json({ briefs: readVenueBriefs(req.venueId) });
  } catch (err) {
    debugLog({ event: 'venue_bridge_read_threw', error: err.message });
    res.status(500).json({ error: err.message || 'Could not read venue briefs.' });
  }
});

// GET — a single specialist brief by type (fb | training | service | event | owner).
app.get('/api/venue-bridge/briefs/:type', requireAuth(...BRIDGE_READ_ROLES), (req, res) => {
  try {
    const brief = readVenueBriefs(req.venueId).find(b => b.type === req.params.type);
    if (!brief) return res.status(404).json({ error: `Unknown brief type: ${req.params.type}` });
    res.json({ brief });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not read the brief.' });
  }
});

// Academy capability context — venue-level capability signals + recommended
// learning, derived from the Training Brief (and supporting briefs). Read by the
// Academy "Recommended For Your Venue" panel. Available to academy-consuming roles.
const ACADEMY_CONTEXT_ROLES = ['employee', 'manager', 'bar_manager', 'fb_director', 'owner', 'admin'];

function getAcademyVenueContext(venueId) {
  try {
    // Academy needs briefs + venue metadata (venue type gates cocktail/bar
    // capabilities) + the manifest — a light bundle.
    const briefs = readVenueBriefs(venueId);
    const venue = db.prepare('SELECT name, venue_type FROM venues WHERE id = ?').get(venueId) || {};
    return selectAcademyContext({ briefs, metadata: { venueName: venue.name, venueType: venue.venue_type } }, UNIVERSITY_MANIFEST);
  } catch (err) {
    debugLog({ event: 'academy_context_failed', error: err.message });
    return { active: false, capabilitySignals: [], recommendations: [] };
  }
}

app.get('/api/venue-bridge/academy', requireAuth(...ACADEMY_CONTEXT_ROLES), (req, res) => {
  try {
    res.json(getAcademyVenueContext(req.venueId));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not read academy context.' });
  }
});

// POST — manually regenerate briefs (developer/owner action).
app.post('/api/venue-bridge/regenerate', requireAuth('owner'), (req, res) => {
  try {
    const venueId = req.venueId;
    const result = regenerateVenueBriefs(venueId);
    res.json({ ok: true, generatedAt: result.generatedAt, sourceHash: result.sourceHash, briefs: readVenueBriefs(venueId) });
  } catch (err) {
    debugLog({ event: 'venue_bridge_regen_threw', error: err.message });
    res.status(500).json({ error: err.message || 'Could not regenerate briefs.' });
  }
});

// GET — operational intelligence feed: normalized signals + DNA enrichment.
app.get('/api/venue-bridge/operations', requireAuth('owner'), (req, res) => {
  try {
    res.json(getOperationalIntelligence(req.venueId));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not read operational intelligence.' });
  }
});

// GET — Owner Intelligence: "What HESTIA Learned" advisor narrative.
// Sources from the shared bundle (briefs read once) via the unified context layer.
function getOwnerIntelligence(venueId) {
  try {
    return selectOwnerIntelligence(loadVenueIntelligenceBundle(venueId), UNIVERSITY_MANIFEST);
  } catch (err) {
    debugLog({ event: 'owner_intelligence_failed', error: err.message });
    return { active: false, headline: '', learnings: [] };
  }
}

app.get('/api/venue-bridge/owner-intelligence', requireAuth('owner'), (req, res) => {
  try {
    res.json(getOwnerIntelligence(req.venueId));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not read owner intelligence.' });
  }
});

// GET — Unified Intelligence Context: the single shared venue understanding.
// One read, every specialist's slice. Owner/admin scope.
app.get('/api/venue-bridge/context', requireAuth('owner'), (req, res) => {
  try {
    res.json(assembleUnifiedContext(loadVenueIntelligenceBundle(req.venueId), UNIVERSITY_MANIFEST));
  } catch (err) {
    debugLog({ event: 'unified_context_failed', error: err.message });
    res.status(500).json({ error: err.message || 'Could not read the unified intelligence context.' });
  }
});

// POST — sync from operations: refresh signals/enrichment and rebuild briefs so
// Venue DNA reflects current operational reality, not only the conversation.
app.post('/api/venue-bridge/sync-operations', requireAuth('owner'), (req, res) => {
  try {
    const venueId = req.venueId;
    regenerateVenueBriefs(venueId);
    res.json({ ok: true, ...getOperationalIntelligence(venueId), briefs: readVenueBriefs(venueId) });
  } catch (err) {
    debugLog({ event: 'venue_bridge_sync_ops_threw', error: err.message });
    res.status(500).json({ error: err.message || 'Could not sync operations.' });
  }
});

// ── CI VISUAL MENU ────────────────────────────────────────────────────────────

app.get('/api/ci/visual-menu/:menuId', requireAuth(...CI_ROLES), (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM visual_menu_designs WHERE menu_id=?'
  ).all(req.params.menuId);
  res.json({ designs: rows });
});

app.post('/api/ci/visual-menu/:cocktailId/save', requireAuth(...CI_ROLES), (req, res) => {
  const { menu_id, image_prompt, image_url, status } = req.body;
  if (!menu_id) return res.status(400).json({ error: 'menu_id is required.' });
  db.prepare(`
    INSERT INTO visual_menu_designs (menu_id, cocktail_id, image_prompt, image_url, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(menu_id, cocktail_id) DO UPDATE SET
      image_prompt = excluded.image_prompt,
      image_url    = excluded.image_url,
      status       = excluded.status
  `).run(menu_id, req.params.cocktailId, image_prompt || null, image_url || null, status || 'done');
  res.json({ ok: true });
});

// ── CI FINAL MENU DESIGN (HESTIA Cocktail Menu Skill v5.2) ────────────────────

// Canonical classics list — name match (case-insensitive) triggers auto-classification
// even when the "classic" tag was not applied at approval time.
const KNOWN_CLASSICS = new Set([
  'negroni', 'old fashioned', 'manhattan', 'sazerac', 'martini',
  'daiquiri', 'margarita', 'whiskey sour', 'aperol spritz',
  'espresso martini', 'moscow mule', 'cosmopolitan', 'mojito',
  'boulevardier', 'vieux carré', 'last word', 'paper plane',
]);

function buildMenuDesignUserMessage({ dna, menu, signatures, nonAlcoholic, classics, outputContext, languageMode }) {
  const meta = dna ? JSON.parse(dna.meta_json || '{}') : {};
  const dnaLines = dna ? [
    `Venue Name: ${dna.venue_name || 'Unknown'}`,
    `Concept: ${meta.concept || dna.atmosphere || 'Not specified'}`,
    `Price Tier: ${dna.price_range || 'Not specified'}`,
    `Atmosphere / Vibe: ${dna.atmosphere || 'Not specified'}`,
    `Hero Ingredient: ${dna.hero_ingredient || 'Not specified'}`,
    `Signature Style: ${meta.signature_style || 'Not specified'}`,
    `Flavor Identity: ${JSON.parse(dna.flavor_identity_json || '[]').join(', ') || 'Not specified'}`,
    `Cuisine Style: ${dna.cuisine_style || 'Not specified'}`,
    `Kosher Policy: ${dna.is_kosher || 'Not specified'}`,
    meta.notes ? `Director Notes: ${meta.notes}` : null,
  ].filter(Boolean).join('\n') : 'No Bar DNA configured for this venue.';

  // Strip leading quantities/units from an ingredient string so AI receives clean names only.
  // e.g. "50ml Elite Arak" → "Elite Arak", "6leaves Fresh Mint Leaves" → "Fresh Mint Leaves"
  const stripIngredientQty = (s) =>
    String(s).replace(/^\d+(\.\d+)?(ml|cl|oz|dash(es)?|leaf|leaves|sprig|piece|drop|tsp|tbsp|g|kg)?\s*/i, '').trim();

  // Spec-oriented: name, ingredients (names only), base spirit, price. No glass/method/garnish.
  const fmtCocktail = (c) => {
    const ings = JSON.parse(c.ingredients_text_json || '[]');
    // DEBUG — confirm full ingredients array before sending to AI
    console.log('[PRE-AI INGREDIENTS]', c.name, JSON.stringify(ings));
    const ingStr = Array.isArray(ings)
      ? ings
          .map(i => typeof i === 'string' ? i : (i.name || i.ingredient || ''))
          .filter(Boolean)
          .map(stripIngredientQty)
          .filter(Boolean)
          .join(', ')
      : stripIngredientQty(String(ings));
    return [
      `Name: ${c.name}`,
      ingStr ? `Ingredients (${ingStr.split(',').length} total, include ALL of them): ${ingStr}` : null,
      c.base_spirit  ? `Base Spirit: ${c.base_spirit}` : null,
      c.suggested_price_ils != null ? `Price: ${c.suggested_price_ils}` : null,
    ].filter(Boolean).join(' | ');
  };

  const sigsBlock = signatures.map(fmtCocktail).join('\n');
  const naBlock   = nonAlcoholic.map(fmtCocktail).join('\n');
  const clsBlock  = classics.map(c => `Name: ${c.name}${c.suggested_price_ils != null ? ` | Price: ${c.suggested_price_ils}` : ''}`).join('\n');

  const heInstruction = languageMode === 'he-en'
    ? 'For Israeli venues, add a "nameHe" field with the Hebrew name for each cocktail where you can reasonably infer it from the bar DNA and cocktail name. Leave nameHe as null if not confident.'
    : 'Set nameHe to null for all cocktails.';

  return `You are creating a design specification for an award-quality cocktail menu.
Apply the HESTIA Cocktail Menu Art Director methodology: infer Creative Territory, Identity Word, Material Palette, and Design Anchors from the Bar DNA. Select the correct template. Build conceptual section names where the DNA supports it.

BAR DNA:
${dnaLines}

Menu: ${menu.name || 'Cocktail Menu'}${menu.occasion ? ` | Occasion: ${menu.occasion}` : ''}${menu.season ? ` | Season: ${menu.season}` : ''}
Output context: ${outputContext || 'digital'}

COCKTAIL LIST — IMMUTABLE. Do not invent, rename, remove, or alter any name, ingredient, or price.

SIGNATURE COCKTAILS (${signatures.length}):
${sigsBlock || 'None'}

${nonAlcoholic.length ? `NON-ALCOHOLIC (${nonAlcoholic.length}):\n${naBlock}` : ''}

${classics.length ? `CLASSICS (${classics.length}):\n${clsBlock}` : ''}

${heInstruction}

Return ONLY valid JSON matching this exact schema. No HTML. No markdown. No text outside the JSON object.

{
  "identityWord": "single word capturing the venue essence",
  "creativeTerritory": "one sentence: the design world this menu inhabits",
  "templateBase": "DARK_LUXURY | MEDITERRANEAN | MODERN_GRID | EDITORIAL | GRAPHIC_BOLD",
  "colorSystem": {
    "background": "#hex — page/cover background",
    "surface": "#hex — card/entry background",
    "text": "#hex — primary text",
    "textMuted": "#hex — secondary/ingredient text",
    "accent": "#hex — prices, highlights, flavor bars",
    "border": "#hex — dividers and rules"
  },
  "typography": {
    "headingFont": "font name for names and display",
    "bodyFont": "font name for descriptions and ingredients",
    "headingCharacter": "one phrase: weight and feel",
    "bodyCharacter": "one phrase: weight and feel"
  },
  "designAnchors": ["anchor 1", "anchor 2", "anchor 3", "anchor 4"],
  "venueName": "venue name from DNA",
  "coverSubline": "5–8 word poetic line referencing the Creative Territory",
  "sections": [
    {
      "id": "section_id",
      "label": "SECTION LABEL — conceptual if DNA supports it, else SIGNATURE COCKTAILS",
      "descriptor": "short italic subtitle",
      "cocktails": ["Exact Cocktail Name 1", "Exact Cocktail Name 2"]
    }
  ],
  "cocktails": [
    {
      "name": "Exact name from input — unchanged",
      "nameHe": "Hebrew name string or null",
      "description": "Sensory description — max 120 chars, no glass/method/garnish labels, no generic words",
      "ingredients": ["Ingredient 1", "Ingredient 2"],
      "price": 65,
      "flavorChart": {
        "ABV": 75,
        "Smoke": 40
      }
    }
  ],
  "nonAlcoholic": [
    {
      "name": "Exact name from input",
      "nameHe": null,
      "description": "Sensory description — max 120 chars",
      "ingredients": ["Ingredient 1"],
      "price": 38,
      "flavorChart": {}
    }
  ],
  "classics": [
    { "name": "Negroni", "price": 55 }
  ]
}

CRITICAL RULES — violating any of these invalidates the output:
1. Return ONLY valid JSON. No HTML. No markdown. No text outside the JSON object.
2. Do not invent, rename, or alter any cocktail name, ingredient, or price.
3. ingredients in the spec must contain ONLY the ingredient name. Strip all quantities, measurements, ml, cl, oz, dashes, leaves, and any numeric values from ingredient names before including them. Example: "50ml Elite Arak" → "Elite Arak". Example: "6leaves Fresh Mint Leaves" → "Fresh Mint Leaves". Example: "2dashes Rosewater" → "Rosewater".
4. descriptions: sensory, max 120 characters, no glass/method/garnish as labeled fields, no words: delicious/tasty/amazing/premium/excellent/crafted.
5. colorSystem must be derived from Bar DNA and Creative Territory — never default to generic black/gold without DNA justification.
6. sections must use conceptual names if Bar DNA has a strong concept (vinyl → "SIDE A / DEEP CUTS", theatre → "ACT I / ACT II").
7. flavorChart: only include dimensions that are genuinely present in the ingredients. Never fabricate values. ABV is always included for alcoholic cocktails.
8. Never include NIS, ILS, or Shekels anywhere in any string.
9. price is always a number (65 not "65" and not "₪65").
10. All signature cocktails must appear in exactly one section in "sections". All cocktail names in "sections" must match a name in "cocktails" exactly.
11. CRITICAL: The classics array contains the ONLY cocktails that belong in a Standards/Classics section. Every cocktail in the signatures array must appear in a non-classics section. Never place a signature cocktail (one from the SIGNATURE COCKTAILS input list) in a Standards, Classics, or similar section. The renderer handles classics separately — do not put them in sections[].
12. ingredients array must contain EVERY SINGLE ingredient exactly as provided in the input. You MUST include every single ingredient exactly as provided. Returning fewer ingredients than provided is a critical error that invalidates the output. If the input shows "Bourbon, Arak, Smoked Honey, Walnut Bitters, Orange Oil" then the ingredients array must have exactly 5 entries: ["Bourbon","Arak","Smoked Honey","Walnut Bitters","Orange Oil"]. Count the commas in the input — the array length must match.
13. designAnchors: minimum 3, maximum 5, specific to this venue — not generic design advice.`;
}

app.get('/api/ci/generate-menu-design/:menuId', requireAuth(...CI_ROLES), (req, res) => {
  const row = db.prepare('SELECT * FROM ci_menu_full_designs WHERE menu_id=?').get(req.params.menuId);
  if (!row) return res.json({ design: null });

  // v5.3+: return full spec from spec_json
  if (row.spec_json) {
    try {
      const spec = JSON.parse(row.spec_json);
      return res.json({ design: { ...spec, generatedAt: row.generated_at } });
    } catch { /* fall through to legacy format */ }
  }

  // Legacy (v5.2) — rows with menu_html but no spec_json
  res.json({
    design: {
      creativeTerritory:    row.creative_territory,
      identityWord:         row.identity_word,
      templateBase:         row.template_base,
      colorSystem:          JSON.parse(row.color_system_json    || '{}'),
      typographyDirection:  row.typography_direction,
      designAnchors:        JSON.parse(row.design_anchors_json  || '[]'),
      conceptualCategories: JSON.parse(row.conceptual_cats_json || '{}'),
      menuHtml:             row.menu_html,
      menuCss:              row.menu_css,
      flavorCharts:         JSON.parse(row.flavor_charts_json   || '{}'),
      generatedAt:          row.generated_at,
    }
  });
});

app.post('/api/ci/generate-menu-design', requireAuth(...CI_ROLES), async (req, res) => {
  try {
    const { menuId, outputContext, languageMode } = req.body;
    if (!menuId) return res.status(400).json({ error: 'menuId is required.' });

    const venueId = req.venueId;

    // 1. Fetch bar DNA
    const dna = getCIDna(venueId);

    // 2. Fetch menu record
    const menu = db.prepare('SELECT * FROM cocktail_menus WHERE id=?').get(menuId);
    if (!menu) return res.status(404).json({ error: 'Menu not found.' });

    // 3. Fetch cocktails for this menu
    const allCocktails = db.prepare(
      "SELECT * FROM cocktails WHERE menu_id=? AND is_active=1 ORDER BY created_at ASC"
    ).all(menuId);
    if (!allCocktails.length) return res.status(400).json({ error: 'Menu has no cocktails.' });

    // 4. Separate by tag — also auto-classify by canonical classics list
    const signatures   = [];
    const nonAlcoholic = [];
    const classics     = [];
    for (const c of allCocktails) {
      const tags    = JSON.parse(c.tags_json || '[]');
      const tagStr  = (Array.isArray(tags) ? tags.join(',') : String(tags)).toLowerCase();
      const nameKey = c.name.toLowerCase().trim();
      const taggedClassic    = /classic/.test(tagStr);
      const autoClassic      = KNOWN_CLASSICS.has(nameKey);
      const taggedNonAlcohol = /non.?alcohol|mocktail|virgin|alcohol.?free/.test(tagStr);

      if (taggedNonAlcohol) {
        nonAlcoholic.push(c);
      } else if (taggedClassic || autoClassic) {
        if (autoClassic && !taggedClassic) {
          console.log(`[MENU-DESIGN] Auto-classified as classic: "${c.name}"`);
        }
        classics.push(c);
      } else {
        signatures.push(c);
      }
    }

    // 5. Build user message
    const userMessage = buildMenuDesignUserMessage({
      dna, menu, signatures, nonAlcoholic, classics, outputContext, languageMode
    });

    // 6. Call OpenAI gpt-4o with HESTIA_COCKTAIL_MENU_SKILL as system message
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing OPENAI_API_KEY in .env.');

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:           'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: HESTIA_COCKTAIL_MENU_SKILL },
          { role: 'user',   content: userMessage },
        ],
      }),
    });
    const openAiData = await openAiRes.json();
    if (!openAiRes.ok) {
      console.error('[MENU-DESIGN] OpenAI error:', openAiData);
      throw new Error(openAiData.error?.message || 'OpenAI request failed.');
    }

    let rawText = openAiData.choices?.[0]?.message?.content || '';
    // DEBUG — log raw AI response to server terminal
    console.log('[MENU-DESIGN DEBUG] raw response length:', rawText.length);
    console.log('[MENU-DESIGN DEBUG] raw response (first 2000 chars):', rawText.slice(0, 2000));
    rawText = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
    if (!rawText) throw new Error('OpenAI returned an empty response.');

    let design;
    try {
      design = JSON.parse(rawText);
    } catch {
      const repaired = rawText.replace(/,(\s*[}\]])/g, '$1');
      try { design = JSON.parse(repaired); } catch {
        console.error('[MENU-DESIGN DEBUG] unparseable raw text:', rawText.slice(0, 500));
        throw new Error('Menu design response could not be parsed as JSON.');
      }
    }

    // DEBUG — log parsed spec structure
    console.log('[MENU-DESIGN DEBUG] parsed design keys:', Object.keys(design));
    console.log('[MENU-DESIGN DEBUG] templateBase:', design.templateBase);
    console.log('[MENU-DESIGN DEBUG] sections count:', design.sections?.length);
    console.log('[MENU-DESIGN DEBUG] cocktails count:', design.cocktails?.length);
    console.log('[MENU-DESIGN DEBUG] sections:', JSON.stringify(design.sections?.map(s => ({ id: s.id, label: s.label, cocktails: s.cocktails }))));

    // 7. Server-side validation — spec-based (no HTML to scan)
    const specStr = JSON.stringify(design);
    if (/\b(NIS|ILS|Shekels)\b/.test(specStr)) {
      console.warn('[MENU-DESIGN] NIS/ILS/Shekels detected in spec — returning 422');
      return res.status(422).json({ error: 'Design validation failed: NIS/ILS/Shekels in output.' });
    }
    if (!Array.isArray(design.designAnchors) || design.designAnchors.length < 3) {
      console.warn('[MENU-DESIGN] Fewer than 3 design anchors returned.');
    }
    const specCocktailNames = (design.cocktails || []).map(c => c.name.toLowerCase());
    const missingCocktails  = signatures.filter(c => !specCocktailNames.includes(c.name.toLowerCase()));
    if (missingCocktails.length > 0) {
      console.warn('[MENU-DESIGN] Missing cocktails in spec:', missingCocktails.map(c => c.name));
    }

    // 8. Persist to DB — full spec in spec_json; keep flat columns for rationale panel
    db.prepare(`
      INSERT INTO ci_menu_full_designs
        (menu_id, venue_id, version, identity_word, template_base, creative_territory,
         color_system_json, typography_direction, design_anchors_json,
         conceptual_cats_json, menu_html, menu_css, flavor_charts_json,
         output_context, language_mode, spec_json, generated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, datetime('now'))
      ON CONFLICT(menu_id) DO UPDATE SET
        version              = excluded.version,
        identity_word        = excluded.identity_word,
        template_base        = excluded.template_base,
        creative_territory   = excluded.creative_territory,
        color_system_json    = excluded.color_system_json,
        typography_direction = excluded.typography_direction,
        design_anchors_json  = excluded.design_anchors_json,
        conceptual_cats_json = excluded.conceptual_cats_json,
        menu_html            = NULL,
        menu_css             = NULL,
        flavor_charts_json   = NULL,
        output_context       = excluded.output_context,
        language_mode        = excluded.language_mode,
        spec_json            = excluded.spec_json,
        generated_at         = datetime('now')
    `).run(
      menuId, venueId, 'hestia-cocktail-menu-v5.3',
      design.identityWord                               || null,
      design.templateBase                               || null,
      design.creativeTerritory                          || null,
      JSON.stringify(design.colorSystem                 || {}),
      design.typography?.headingCharacter               || null,
      JSON.stringify(design.designAnchors               || []),
      JSON.stringify({ sections: design.sections || [] }),
      outputContext  || null,
      languageMode   || null,
      JSON.stringify(design)
    );

    console.log(`[MENU-DESIGN] Generated for menu ${menuId} via gpt-4o — identity: "${design.identityWord}", template: ${design.templateBase}`);
    res.json({ ok: true, design });

  } catch (err) {
    console.error('[MENU-DESIGN] Error:', err.message);
    res.status(500).json({ error: err.message || 'Menu design generation failed.' });
  }
});

// ── CI COCKTAIL IMAGE GENERATION ──────────────────────────────────────────────

const INGREDIENT_COLORS = {
  bourbon: 'deep amber', 'rye whiskey': 'warm amber', scotch: 'golden amber',
  'dark rum': 'deep mahogany', rum: 'golden', cognac: 'deep amber',
  brandy: 'amber', amaretto: 'deep amber', frangelico: 'golden amber',
  drambuie: 'honey amber', benedictine: 'dark amber-green',
  gin: 'crystal clear', vodka: 'crystal clear', tequila: 'crystal clear',
  mezcal: 'faintly smoky clear', 'white rum': 'crystal clear',
  'silver rum': 'crystal clear',
  campari: 'vibrant ruby red', aperol: 'bright orange',
  'peychaud\'s bitters': 'vivid red', grenadine: 'deep ruby red',
  'cranberry juice': 'vivid crimson red', 'pomegranate juice': 'deep ruby red',
  'raspberry liqueur': 'vivid raspberry pink', chambord: 'deep purple-red',
  'crème de cassis': 'deep purple',
  'green chartreuse': 'vivid lime green', 'yellow chartreuse': 'golden yellow',
  midori: 'bright melon green', 'blue curaçao': 'vivid electric blue',
  'butterfly pea tea': 'deep indigo blue', matcha: 'vibrant green',
  'creme de menthe': 'bright green',
  'sweet vermouth': 'deep ruby red', 'dry vermouth': 'pale golden',
  'coffee liqueur': 'very dark brown', 'kahlúa': 'very dark brown',
  espresso: 'jet black-brown', 'cold brew coffee': 'very dark brown',
  'cold brew': 'very dark brown', cola: 'deep dark brown',
  'triple sec': 'clear orange-scented', cointreau: 'clear orange-scented',
  'st. germain': 'pale golden', 'elderflower liqueur': 'pale golden',
  'peach schnapps': 'pale peach', 'lychee liqueur': 'pale blush',
  'coconut rum': 'clear coconut-white', orgeat: 'opaque milky white',
  'coconut cream': 'opaque creamy white', cream: 'pure white',
  'heavy cream': 'pure white', 'baileys': 'creamy beige',
  'egg white': 'cloud-white silky foam', aquafaba: 'cloud-white silky foam',
  'lemon juice': 'pale yellow', 'lime juice': 'pale green-yellow',
  'orange juice': 'bright orange', 'grapefruit juice': 'pale blush-orange',
  'pineapple juice': 'pale golden yellow', 'passion fruit': 'bright orange-yellow',
  'simple syrup': 'clear', 'sugar syrup': 'clear',
  'honey syrup': 'warm golden', 'agave syrup': 'pale golden',
  'lavender syrup': 'pale purple', hibiscus: 'vivid magenta',
  'ginger beer': 'pale amber sparkling', 'tonic water': 'crystal clear sparkling',
  'soda water': 'crystal clear sparkling', 'club soda': 'crystal clear sparkling',
  prosecco: 'pale golden sparkling', champagne: 'pale golden sparkling',
  absinthe: 'bright anise-green', maraschino: 'clear cherry',
  'angostura bitters': 'dark amber-red', bitters: 'dark amber-red',
};

function ingredientColor(name) {
  const lower = name.toLowerCase();
  const hit = Object.entries(INGREDIENT_COLORS).find(([k]) => lower.includes(k));
  return hit ? hit[1] : null;
}

async function _generateVisualLayer(cocktail) {
  const ingList = Array.isArray(cocktail.ingredients)
    ? cocktail.ingredients.map(i => [i.amount, i.unit, i.name].filter(Boolean).join(' ')).join(', ')
    : '';
  const garnish = (cocktail.garnish || '').trim();
  const method  = (cocktail.method  || '').toLowerCase();

  const prompt =
    `You are a professional cocktail photographer's creative director.\n` +
    `Given this cocktail, write exactly 2 sentences for a photorealistic image prompt:\n` +
    `Sentence 1: the liquid's color, opacity, and visual texture seen in the glass ` +
    `(e.g. "deep mahogany-brown, nearly opaque, with a faint amber glow at the edges").\n` +
    `Sentence 2: the garnish in exact visual detail as it sits on or in the drink ` +
    `(e.g. "a wide flame-expressed orange peel draped over the rim, its oils glistening" ` +
    `or "a single dried carob pod resting across the glass beside a dusting of cacao powder").\n\n` +
    `Cocktail: ${cocktail.name}\n` +
    `Method: ${method || 'unknown'}\n` +
    `Ingredients: ${ingList || 'unknown'}\n` +
    `Garnish: ${garnish || 'none'}\n\n` +
    `Rules:\n` +
    `- Do not mention the cocktail name.\n` +
    `- Never use: smoke, smoky, dark, burn, fire, stone, dusk.\n` +
    `- Output exactly 2 sentences. No labels, no intro, no explanation.`;

  try {
    const text    = (await askGemini(prompt)).trim();
    if (text.length < 20) return null;
    console.log('[COCKTAIL-IMAGE] Visual layer:', text);
    return text;
  } catch (err) {
    console.log('[COCKTAIL-IMAGE] Visual layer fallback (deterministic):', err.message);
    return null;
  }
}

function buildCocktailImagePrompt(cocktail, visualLayer = null) {
  const name        = cocktail.name || 'cocktail';
  const glassRaw    = (cocktail.glass_type || cocktail.glass || 'cocktail glass').toLowerCase();
  const method      = (cocktail.method    || '').toLowerCase();
  const garnishRaw  = (cocktail.garnish   || '').trim();
  const ingredients = Array.isArray(cocktail.ingredients) ? cocktail.ingredients : [];
  const tags        = Array.isArray(cocktail.tags) ? cocktail.tags :
                      Array.isArray(cocktail.flavor_profile) ? cocktail.flavor_profile : [];

  // ── Ice / serve vessel ──────────────────────────────────────────────────────
  const isUp       = ['coupe', 'nick & nora', 'nick and nora', 'martini glass', 'cocktail glass'].some(g => glassRaw.includes(g));
  const isRocks    = ['rock', 'old fashioned', 'lowball'].some(g => glassRaw.includes(g));
  const isHighball = ['highball', 'collins', 'tall glass'].some(g => glassRaw.includes(g));
  const isTropical = ['tiki', 'hurricane', 'poco grande'].some(g => glassRaw.includes(g));

  let iceDesc;
  if (isRocks)         iceDesc = 'served over a single large clear ice cube';
  else if (isHighball) iceDesc = 'filled with tall cubed ice, light condensation';
  else if (isTropical) iceDesc = 'packed with crushed ice';
  else if (isUp)       iceDesc = 'served up with no ice, chilled glass';
  else                 iceDesc = 'served chilled';

  // ── Ingredient visuals ──────────────────────────────────────────────────────
  const ingVisuals = ingredients.map(ing => {
    const color = ingredientColor(ing.name || '');
    return color ? `${color} ${ing.name}` : ing.name;
  }).filter(Boolean);

  // ── Drink colour derivation ─────────────────────────────────────────────────
  const allNames = ingredients.map(i => (i.name || '').toLowerCase()).join(' ');

  const hasFoam    = /egg white|aquafaba/.test(allNames);
  const hasRed     = /campari|grenadine|cranberry|pomegranate|raspberry|chambord|cassis|peychaud/.test(allNames);
  const hasOrange  = /aperol|orange juice|aperol/.test(allNames);
  const hasGreen   = /chartreuse|midori|matcha|mint|basil/.test(allNames);
  const hasBlue    = /blue cura|butterfly pea/.test(allNames);
  const hasBrown   = /cola|espresso|cold brew|kahlua|kahlúa|coffee liqueur/.test(allNames);
  const hasAmber   = /bourbon|rye|scotch|cognac|brandy|dark rum|amaretto/.test(allNames);
  const hasCitrus  = /lemon juice|lime juice|orange juice|grapefruit/.test(allNames);
  const hasCream   = /cream|baileys|coconut cream|orgeat/.test(allNames);
  const hasVermouth = /sweet vermouth/.test(allNames);

  let color;
  if (hasBlue)                    color = 'deep electric blue, semi-transparent and luminous';
  else if (hasGreen && hasRed)    color = 'complex layered green with ruby-red undertones';
  else if (hasGreen)              color = 'vibrant green, translucent and jewel-toned';
  else if (hasRed && hasOrange)   color = 'deep sunset orange-red, vibrant';
  else if (hasRed && hasAmber)    color = 'deep amber-ruby, rich and translucent';
  else if (hasRed)                color = 'ruby red, translucent and jewel-like';
  else if (hasOrange)             color = 'bright sunset orange, translucent';
  else if (hasBrown && hasCream)  color = 'creamy mocha-brown';
  else if (hasBrown)              color = 'very dark espresso-brown, near-opaque';
  else if (hasAmber && hasCitrus) color = 'golden amber, bright and translucent';
  else if (hasAmber && hasVermouth) color = 'deep amber-mahogany, crystal clear';
  else if (hasAmber)              color = 'rich warm amber, translucent';
  else if (hasCream || hasFoam)   color = 'pale ivory or white, lightly opaque';
  else                            color = 'pale golden, crystal clear';

  // Serve-style modifier
  if (method === 'shake' && hasFoam) color += ', crowned with a thick cloud-white silky foam';
  else if (method === 'shake')       color += ', slightly frothy and aerated';
  else if (method === 'stir')        color += ', perfectly clear and luminous from stirring';
  else if (method === 'blend')       color += ', thick and slushy';

  // ── Garnish ─────────────────────────────────────────────────────────────────
  const garnishDesc = garnishRaw && !['none', 'no garnish'].includes(garnishRaw.toLowerCase())
    ? `Garnished with ${garnishRaw}.`
    : 'No garnish.';

  // ── Rim ─────────────────────────────────────────────────────────────────────
  const rimSrc = (garnishRaw + ' ' + tags.join(' ')).toLowerCase();
  let rimDesc = '';
  if (/salt rim/.test(rimSrc))                           rimDesc = 'The glass rim is coated in coarse flaky salt crystals.';
  else if (/sugar rim/.test(rimSrc))                     rimDesc = 'The glass rim is coated in sparkling fine sugar crystals.';
  else if (/tajin|chili rim|spice rim/.test(rimSrc))     rimDesc = 'The glass rim is dusted with a vivid red-orange spice blend.';

  // ── Foam ────────────────────────────────────────────────────────────────────
  const foamDesc = (hasFoam && method === 'shake')
    ? 'A thick velvety white foam cap crowns the drink.'
    : '';

  // ── Final prompt ────────────────────────────────────────────────────────────
  return [
    `Professional cocktail photography.`,
    `A ${name} served in a ${glassRaw}, ${iceDesc}.`,
    // Visual layer from Claude covers both color and garnish; fall back to deterministic if absent
    visualLayer
      ? visualLayer
      : [`The drink is ${color}.`, garnishDesc].filter(Boolean).join(' '),
    ingVisuals.length ? `Made with ${ingVisuals.join(', ')}.` : '',
    rimDesc,
    foamDesc,
    `Elegant upscale bar setting, moody background, soft dramatic side lighting,`,
    `shallow depth of field, fine condensation beading on the glass, photorealistic,`,
    `8K resolution, Michelin-star cocktail bar aesthetic.`,
  ].filter(p => p.trim()).join(' ');
}

const _DALLE_SANITIZE = [
  [/\bsmoke\b/gi,  'mist'],
  [/\bsmoky\b/gi,  'misty'],
  [/\bdusk\b/gi,   'evening'],
  [/\bdark\b/gi,   'rich'],
  [/\bstone\b/gi,  'mineral'],
  [/\bburn\b/gi,   'ember glow'],
  [/\bfire\b/gi,   'ember glow'],
];

function _sanitizeDallePrompt(prompt) {
  return _DALLE_SANITIZE.reduce((p, [pattern, replacement]) => p.replace(pattern, replacement), prompt);
}

async function _dalleGenerate(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:   'gpt-image-1',
      prompt,
      n:       1,
      size:    '1024x1024',
      quality: 'high',
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const err = data.error || {};
    if (err.code === 'content_policy_violation') {
      console.log('[COCKTAIL-IMAGE] CONTENT POLICY VIOLATION');
      console.log('[COCKTAIL-IMAGE] Rejected prompt:', prompt);
      console.log('[COCKTAIL-IMAGE] OpenAI message:', err.message);
    } else {
      console.log('[COCKTAIL-IMAGE] OpenAI error:', JSON.stringify(err));
    }
    throw new Error(err.message || 'OpenAI image generation failed.');
  }
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image data in OpenAI response.');
  console.log('[COCKTAIL-IMAGE] base64 length:', b64.length);
  return b64;
}

const _VISUAL_OVERRIDES = [
  {
    match: (name) => /negroni/i.test(name),
    visual: 'Deep ruby red liquid, jewel-toned and translucent, served in a rocks glass over a single large clear ice cube. ' +
            'Garnished with a curled orange peel twist resting on the rim — not an orange slice. ' +
            'The drink must appear distinctly red, not amber or orange.',
  },
];

function _getNamedVisualOverride(cocktail) {
  const name = cocktail.name || '';
  const hit  = _VISUAL_OVERRIDES.find(o => o.match(name));
  if (hit) console.log('[COCKTAIL-IMAGE] Using named visual override for:', name);
  return hit?.visual ?? null;
}

app.post('/api/ci/cocktail-image', requireAuth(...CI_ROLES), async (req, res) => {
  console.log('[COCKTAIL-IMAGE] >>> REQUEST RECEIVED');
  console.log('[COCKTAIL-IMAGE] body:', JSON.stringify(req.body).slice(0, 500));
  const cocktail = req.body;
  if (!cocktail?.name) return res.status(400).json({ error: 'cocktail.name is required.' });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured.' });
  }

  console.log('[COCKTAIL-IMAGE] name:', cocktail.name);
  console.log('[COCKTAIL-IMAGE] Model: gpt-image-1 | size: 1024x1024 | quality: high');
  const visualLayer = _getNamedVisualOverride(cocktail) ?? await _generateVisualLayer(cocktail);
  const rawPrompt   = buildCocktailImagePrompt(cocktail, visualLayer);
  const prompt      = _sanitizeDallePrompt(rawPrompt);
  console.log('[COCKTAIL-IMAGE] Prompt:', prompt);

  try {
    const b64 = await _dalleGenerate(prompt);
    return res.json({ imageData: `data:image/png;base64,${b64}`, prompt });
  } catch (err) {
    console.log('[COCKTAIL-IMAGE] Error:', err.message);
    return res.status(500).json({ error: err.message || 'Image generation failed.' });
  }
});

// ── CI SEED — Beit Ramona demo data ──────────────────────────────────────────
// Idempotent: checks for existing DNA record before seeding.
// Inserts Bar DNA, 5 demo cocktails, 3 rejections, 3 months sales, 8 trend entries.

function seedCocktailIntelligence() {
  const existing = db.prepare('SELECT id FROM cocktail_intelligence_dna WHERE venue_id=?').get(defaultVenueId());
  if (existing) return; // already seeded — skip entirely

  const now = nowIso();

  // 1. Bar DNA for Beit Ramona
  db.prepare(`
    INSERT INTO cocktail_intelligence_dna
      (venue_id,venue_name,venue_type,atmosphere,cuisine_style,
       audience_age_min,audience_age_max,audience_type,staff_skill,
       equipment_json,glassware_json,is_kosher,flavor_identity_json,
       price_range,service_pressure,hero_ingredient,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    defaultVenueId(),
    'Beit Ramona', 'restaurant',
    'warm, sophisticated, local',
    'Israeli Mediterranean',
    28, 50, 'mixed', 'intermediate',
    JSON.stringify(['shaker', 'strainer', 'jigger', 'muddler', 'basic_bar_tools']),
    JSON.stringify(['rocks', 'highball', 'coupe', 'wine']),
    'events_only',
    JSON.stringify(['herbal', 'citrus', 'local_israeli']),
    'premium', 'medium_high',
    'arak, local herbs, pomegranate',
    now, now
  );

  // 2. Five CI-generated demo cocktails
  const recipes = [
    {
      name:        'Arak Al HaMayim',
      description: 'An ode to the Mediterranean ritual of diluting arak with water — elevated with fresh pomegranate and garden mint into something quietly ceremonial.',
      base_spirit: 'arak',
      glass_type:  'highball',
      garnish:     'fresh mint sprig, pomegranate seeds',
      method:      'Build over ice',
      tags:        ['arak', 'refreshing', 'local', 'low-complexity'],
      ingredients: [
        { name: 'Israeli arak', amount: '50', unit: 'ml' },
        { name: 'Fresh pomegranate juice', amount: '30', unit: 'ml' },
        { name: 'Fresh lemon juice', amount: '20', unit: 'ml' },
        { name: 'Honey syrup (1:1)', amount: '15', unit: 'ml' },
        { name: 'Sparkling water', amount: '60', unit: 'ml' },
        { name: 'Fresh mint', amount: '6', unit: 'leaves' },
      ],
    },
    {
      name:        'Levant Sour',
      description: 'Israeli whisky meets the flavors of the shuk — pomegranate molasses and lemon create a complex sour that speaks the language of the Levant with unmistakable conviction.',
      base_spirit: 'whisky',
      glass_type:  'coupe',
      garnish:     'dehydrated lemon wheel, fresh rosemary sprig',
      method:      'Dry shake, then shake with ice, double strain',
      tags:        ['whisky', 'sour', 'signature', 'medium-complexity'],
      ingredients: [
        { name: 'Israeli whisky (Milk & Honey or similar)', amount: '50', unit: 'ml' },
        { name: 'Fresh lemon juice', amount: '25', unit: 'ml' },
        { name: 'Pomegranate molasses', amount: '20', unit: 'ml' },
        { name: 'Simple syrup', amount: '10', unit: 'ml' },
        { name: 'Egg white', amount: '30', unit: 'ml' },
        { name: 'Angostura bitters', amount: '2', unit: 'dashes' },
      ],
    },
    {
      name:        'Garden of Galilee',
      description: 'A walk through the north of Israel in a glass — Israeli gin meets fresh dill, cucumber, and lime in a cocktail that captures the startling freshness of Galilean produce.',
      base_spirit: 'gin',
      glass_type:  'highball',
      garnish:     'cucumber ribbon, fresh dill crown',
      method:      'Shake with ice, strain over fresh ice',
      tags:        ['gin', 'herbal', 'refreshing', 'medium-complexity'],
      ingredients: [
        { name: 'Israeli gin (or London Dry)', amount: '45', unit: 'ml' },
        { name: 'Fresh cucumber juice', amount: '40', unit: 'ml' },
        { name: 'Fresh lime juice', amount: '20', unit: 'ml' },
        { name: 'Dill-infused simple syrup', amount: '20', unit: 'ml' },
        { name: 'Dry tonic water', amount: '50', unit: 'ml' },
      ],
    },
    {
      name:        'Sunset Negroni',
      description: 'A Negroni reimagined for the Levant — arak-rinsed glass, local botanicals gin, and sweet vermouth. The light changes every evening over Jerusalem, but the ritual stays.',
      base_spirit: 'gin',
      glass_type:  'rocks',
      garnish:     'wide orange peel, expressed and placed',
      method:      'Stir over ice, strain over large single ice cube, arak rinse first',
      tags:        ['negroni', 'gin', 'stirred', 'sophisticated', 'medium-complexity'],
      ingredients: [
        { name: 'Israeli gin', amount: '35', unit: 'ml' },
        { name: 'Campari', amount: '35', unit: 'ml' },
        { name: 'Sweet vermouth', amount: '35', unit: 'ml' },
        { name: 'Arak (for glass rinse)', amount: '5', unit: 'ml' },
      ],
    },
    {
      name:        'Jerusalem Mule',
      description: 'A mule that crossed continents and landed in Jerusalem — vodka meets pomegranate, fresh ginger, and mint. Crowd-pleasing, spiced, and unmistakably of this place.',
      base_spirit: 'vodka',
      glass_type:  'highball',
      garnish:     'candied ginger slice, fresh mint bouquet, pomegranate seeds',
      method:      'Build over ice, light stir',
      tags:        ['vodka', 'mule', 'refreshing', 'low-complexity', 'crowd-pleaser'],
      ingredients: [
        { name: 'Premium vodka', amount: '45', unit: 'ml' },
        { name: 'Fresh pomegranate juice', amount: '30', unit: 'ml' },
        { name: 'Fresh lime juice', amount: '15', unit: 'ml' },
        { name: 'Ginger beer', amount: '80', unit: 'ml' },
        { name: 'Fresh mint', amount: '5', unit: 'leaves' },
      ],
    },
  ];

  const insertedIds = [];
  for (const r of recipes) {
    const res2 = db.prepare(`
      INSERT INTO cocktails
        (name,category,description,base_spirit,glass_type,garnish,method,
         tags_json,ingredients_text_json,source,created_by,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      r.name, 'ci_generated', r.description, r.base_spirit,
      r.glass_type, r.garnish, r.method,
      JSON.stringify(r.tags), JSON.stringify(r.ingredients),
      'ci_generated', 1, now
    );
    insertedIds.push({ id: res2.lastInsertRowid, name: r.name });
  }

  // 3. Lifecycle entries for each demo cocktail
  const lifecycleMeta = [
    { dateAdded: '2026-02-01', season: 'winter' },
    { dateAdded: '2026-02-15', season: 'winter' },
    { dateAdded: '2026-03-10', season: 'spring' },
    { dateAdded: '2026-03-20', season: 'spring' },
    { dateAdded: '2026-04-01', season: 'spring' },
  ];
  for (let i = 0; i < insertedIds.length; i++) {
    db.prepare(`
      INSERT INTO cocktail_lifecycle
        (venue_id,cocktail_id,cocktail_name,date_added,season_added,
         times_ordered,revenue_generated,cost_per_serve,status,alert_flags_json,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      defaultVenueId(), insertedIds[i].id, insertedIds[i].name,
      lifecycleMeta[i].dateAdded, lifecycleMeta[i].season,
      0, 0, null, 'active', '[]', now, now
    );
  }

  // 4. Rejection memory — 3 pre-loaded rejections
  const rejections = [
    {
      name: 'Blue Lagoon',
      profile: { flavors: ['sweet', 'tropical', 'blue_curacao'], base_spirit: 'vodka', complexity: 'low' },
      reasons: ['doesnt_fit_identity', 'too_sweet'],
      by: 'Omer Sadot',
    },
    {
      name: 'Espresso Martini',
      profile: { flavors: ['coffee', 'sweet', 'vanilla'], base_spirit: 'vodka', complexity: 'medium' },
      reasons: ['doesnt_fit_identity', 'too_complex'],
      by: 'Omer Sadot',
    },
    {
      name: 'Strawberry Daiquiri',
      profile: { flavors: ['sweet', 'fruity', 'strawberry'], base_spirit: 'rum', complexity: 'low' },
      reasons: ['too_sweet', 'flavors_guests_dont_like'],
      by: 'Saar Wax',
    },
  ];
  for (const r of rejections) {
    db.prepare(`
      INSERT INTO cocktail_rejections
        (venue_id,cocktail_name,cocktail_profile_json,reasons_json,rejected_by,rejected_at)
      VALUES (?,?,?,?,?,?)
    `).run(defaultVenueId(), r.name, JSON.stringify(r.profile), JSON.stringify(r.reasons), r.by, now);
  }
  rebuildTasteDna(defaultVenueId());

  // 5. Three months of mock sales data (Feb–Apr 2026)
  // [cocktail_name, period, units, sell_price_ils, cost_ils]
  const salesData = [
    ['Arak Al HaMayim',   '2026-02-01', 48, 52, 12],
    ['Levant Sour',       '2026-02-01', 32, 68, 18],
    ['Garden of Galilee', '2026-02-01', 41, 58, 14],
    ['Sunset Negroni',    '2026-02-01', 27, 72, 20],
    ['Jerusalem Mule',    '2026-02-01', 53, 52, 11],
    ['Arak Al HaMayim',   '2026-03-01', 62, 52, 12],
    ['Levant Sour',       '2026-03-01', 45, 68, 18],
    ['Garden of Galilee', '2026-03-01', 58, 58, 14],
    ['Sunset Negroni',    '2026-03-01', 31, 72, 20],
    ['Jerusalem Mule',    '2026-03-01', 71, 52, 11],
    ['Arak Al HaMayim',   '2026-04-01', 55, 52, 12],
    ['Levant Sour',       '2026-04-01', 52, 68, 18],
    ['Garden of Galilee', '2026-04-01', 64, 58, 14],
    ['Sunset Negroni',    '2026-04-01', 38, 72, 20],
    ['Jerusalem Mule',    '2026-04-01', 79, 52, 11],
  ];
  const insertSale = db.prepare(`
    INSERT INTO cocktail_sales
      (venue_id,cocktail_id,cocktail_name,sale_date,period_type,
       units_sold,sale_price,cost_per_unit,revenue,gross_profit,gp_percent,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const [cocktailName, date2, units, sell, cost] of salesData) {
    const match  = insertedIds.find(c => c.name === cocktailName);
    const rev    = units * sell;
    const gp     = rev - units * cost;
    const gpPct  = Math.round((gp / rev) * 100);
    insertSale.run(defaultVenueId(), match?.id || null, cocktailName, date2, 'month', units, sell, cost, rev, gp, gpPct, now);
  }

  // Update lifecycle totals from seeded sales
  for (const c of insertedIds) {
    const totals = db.prepare(
      'SELECT SUM(units_sold) as u, SUM(revenue) as r FROM cocktail_sales WHERE cocktail_name=? AND venue_id=?'
    ).get(c.name, defaultVenueId());
    db.prepare(
      'UPDATE cocktail_lifecycle SET times_ordered=?,revenue_generated=?,updated_at=? WHERE cocktail_id=? AND venue_id=?'
    ).run(totals.u || 0, totals.r || 0, now, c.id, defaultVenueId());
  }

  // 6. Israeli market trend entries
  const trends = [
    { cat: 'ingredient', name: 'Arak cocktails',               desc: 'Traditional arak reimagined in modern cocktails. Strong trend in Tel Aviv and Jerusalem bar scenes.', market: 'israel', tags: ['arak','local','mediterranean'], kosher: 1 },
    { cat: 'spirit',     name: 'Israeli craft whisky',          desc: 'Milk & Honey, Golan distillery and others winning international awards. Strong sell with local and tourist guests.', market: 'israel', tags: ['whisky','local','premium'], kosher: 0 },
    { cat: 'ingredient', name: 'Pomegranate & Israeli fruits',  desc: 'Pomegranate, loquat, sabra (prickly pear) and local citrus becoming signature cocktail ingredients in Israeli fine dining.', market: 'israel', tags: ['pomegranate','local','seasonal'], kosher: 1 },
    { cat: 'style',      name: 'Mediterranean Sours',           desc: 'Sour cocktails using Levantine flavors — za\'atar, sumac, tahini, pomegranate — trending strongly in premium venues.', market: 'israel', tags: ['sour','levantine','signature'], kosher: 1 },
    { cat: 'style',      name: 'Low-ABV and Spritz culture',    desc: 'Growing demand for lighter cocktails, especially aperitivo-style spritzes. Health-conscious guests and younger crowd.', market: 'global', tags: ['low-abv','spritz','aperitivo'], kosher: 1 },
    { cat: 'ingredient', name: 'Local herbs (za\'atar, dill, sage)', desc: 'Israeli bars leading with garden-to-glass herb programs. Za\'atar syrups, sage tinctures, thyme infusions.', market: 'israel', tags: ['herbal','local','garden'], kosher: 1 },
    { cat: 'spirit',     name: 'Kosher premium spirits expanding', desc: 'More kosher-certified premium bottles available. Kosher gin, rum, and whisky options growing rapidly.', market: 'israel', tags: ['kosher','premium'], kosher: 1 },
    { cat: 'style',      name: 'Smoked and umami cocktails',    desc: 'Smoke guns, smoked salts, and umami-forward ingredients appearing in premium bar menus globally.', market: 'global', tags: ['smoke','umami','premium','showstopper'], kosher: 1 },
  ];
  const insertTrend = db.prepare(`
    INSERT INTO cocktail_trends_db
      (venue_id,category,name,description,market,tags_json,is_kosher,is_active,added_by,added_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const t of trends) {
    insertTrend.run(null, t.cat, t.name, t.desc, t.market, JSON.stringify(t.tags), t.kosher, 1, 'Toam Griffel', now, now);
  }

  console.log('[HESTIA CI] Cocktail Intelligence seeded — Beit Ramona demo data ready.');
}

// ════════════════════════════════════════════════════════════════════════════
// ROLE MIGRATION — drops CHECK constraint on auth_users to allow new roles
// ════════════════════════════════════════════════════════════════════════════

function migrateAuthUsersRoles() {
  const tableInfo = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='auth_users'"
  ).get();
  if (!tableInfo) return;
  // Already migrated if no CHECK constraint present
  if (!tableInfo.sql.includes('CHECK(role IN') && !tableInfo.sql.includes('CHECK (role IN')) return;
  try {
    // Disable FK enforcement so we can DROP + recreate auth_users safely
    db.exec('PRAGMA foreign_keys = OFF');
    // Clean up any leftover table from a previous failed migration attempt
    db.exec('DROP TABLE IF EXISTS auth_users_v2');
    db.exec(`
      CREATE TABLE IF NOT EXISTS auth_users_v2 (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name    TEXT NOT NULL,
        role         TEXT NOT NULL,
        access_code  TEXT NOT NULL UNIQUE,
        is_active    INTEGER DEFAULT 1,
        created_at   TEXT DEFAULT (datetime('now')),
        username     TEXT,
        password     TEXT,
        password_hash TEXT
      )
    `);
    db.exec(`
      INSERT INTO auth_users_v2
        SELECT id, full_name, role, access_code, is_active, created_at,
               username, password, password_hash
        FROM auth_users
    `);
    db.exec('DROP TABLE IF EXISTS auth_users');
    db.exec('ALTER TABLE auth_users_v2 RENAME TO auth_users');
    db.exec('PRAGMA foreign_keys = ON');
    console.log('[HESTIA] auth_users role constraint removed — new roles now supported.');
  } catch(e) {
    db.exec('PRAGMA foreign_keys = ON');
    console.warn('[HESTIA] auth_users migration failed:', e.message);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// NEW USER SEED — idempotent, skips existing usernames
// ════════════════════════════════════════════════════════════════════════════

function seedNewUsers() {
  // Guard: if CHECK constraint is still present, skip until migration succeeds
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='auth_users'").get();
  if (tableInfo?.sql?.includes('CHECK(role IN') || tableInfo?.sql?.includes('CHECK (role IN')) {
    console.warn('[HESTIA] seedNewUsers skipped — auth_users migration not yet complete.');
    return;
  }
  // Update existing users' roles
  db.prepare("UPDATE auth_users SET role='fb_director' WHERE id=3 AND role='bar_manager'").run();
  db.prepare("UPDATE auth_users SET role='events_manager' WHERE id=7 AND role='manager'").run();

  const insertAuthUser = db.prepare(
    "INSERT OR IGNORE INTO auth_users (full_name, role, access_code, is_active, username, password_hash) VALUES (?,?,?,1,?,?)"
  );

  const EMPLOYEE_PASS = "0000";
  const CHEF_PASS = "hestia123";

  const newManagers = [
    { full_name: "Pavel", role: "chef", username: "pavel", password: CHEF_PASS, code: "PAVEL001" },
  ];

  const newEmployees = [
    { full_name: "Tali Raicher",   gender: "F", sub_role: "bartender", joined: "2026-04-01", username: "tali_raicher",   code: "EMP008" },
    { full_name: "Liav Gurvich",   gender: "F", sub_role: "waiter",    joined: "2026-04-08", username: "liav_gurvich",   code: "EMP009" },
    { full_name: "Shani Dayan",    gender: "F", sub_role: "bartender", joined: "2026-04-15", username: "shani_dayan",    code: "EMP010" },
    { full_name: "Nevo Kurtaran",  gender: "M", sub_role: "waiter",    joined: "2026-04-01", username: "nevo_kurtaran",  code: "EMP011" },
    { full_name: "Nir Vodavoz",    gender: "M", sub_role: "bartender", joined: "2026-04-10", username: "nir_vodavoz",    code: "EMP012" },
    { full_name: "Shir Shenkar",   gender: "F", sub_role: "waiter",    joined: "2026-04-20", username: "shir_shenkar",   code: "EMP013" },
    { full_name: "Shay Peretz",    gender: "F", sub_role: "waiter",    joined: "2026-05-05", username: "shay_peretz",    code: "EMP014" },
    { full_name: "Avinoam Amram",  gender: "F", sub_role: "waiter",    joined: "2026-05-10", username: "avinoam_amram",  code: "EMP015" },
    { full_name: "Dor Kremer",     gender: "M", sub_role: "bartender", joined: "2026-05-08", username: "dor_kremer",     code: "EMP016" },
    { full_name: "Michal Nissani", gender: "F", sub_role: "waiter",    joined: "2026-05-12", username: "michal_nissani", code: "EMP017" },
    { full_name: "Pierre Shimony", gender: "M", sub_role: "bartender", joined: "2026-05-03", username: "pierre_shimony", code: "EMP018" },
  ];

  for (const u of newManagers) {
    const existing = db.prepare("SELECT id FROM auth_users WHERE LOWER(username)=?").get(u.username);
    if (!existing) {
      const hash = bcrypt.hashSync(u.password, 10);
      insertAuthUser.run(u.full_name, u.role, u.code, u.username, hash);
    }
  }

  for (const e of newEmployees) {
    // Match by username OR access_code — handles cases where username was later changed
    const existing = db.prepare(
      "SELECT id FROM auth_users WHERE LOWER(username)=? OR LOWER(access_code)=LOWER(?)"
    ).get(e.username, e.code);
    if (!existing) {
      const hash = bcrypt.hashSync(EMPLOYEE_PASS, 10);
      const res = insertAuthUser.run(e.full_name, "employee", e.code, e.username, hash);
      if (!res.changes) continue; // INSERT OR IGNORE was silently skipped — skip employees record too
      const userId = res.lastInsertRowid;
      // create employees record
      const empExists = db.prepare("SELECT id FROM employees WHERE user_id=?").get(userId);
      if (!empExists) {
        db.prepare(
          "INSERT INTO employees (user_id, display_name, gender, sub_role, joined_date) VALUES (?,?,?,?,?)"
        ).run(userId, e.full_name, e.gender, e.sub_role, e.joined);
      }
    } else {
      // ensure employees record exists for existing auth user
      const empExists = db.prepare("SELECT id FROM employees WHERE user_id=?").get(existing.id);
      if (!empExists) {
        db.prepare(
          "INSERT INTO employees (user_id, display_name, gender, sub_role, joined_date) VALUES (?,?,?,?,?)"
        ).run(existing.id, e.full_name, e.gender, e.sub_role, e.joined);
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EMAIL SERVICE
// ════════════════════════════════════════════════════════════════════════════

// Generate App Password at https://myaccount.google.com/apppasswords
// Requires 2FA enabled on Gmail. Set EMAIL_USER and EMAIL_PASS in .env.

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  if (!to) return;
  try {
    await emailTransporter.sendMail({
      from: `"HESTIA" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.warn('[HESTIA EMAIL] Send failed:', e.message);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CHEF MODULE ROUTES
// ════════════════════════════════════════════════════════════════════════════

const CHEF_ROLES = ['chef', 'fb_director', 'owner', 'admin'];
const ALLOWED_FOOD_TAGS = ['vegetarian', 'vegan', 'gluten_free'];

// Gemini model for chef (use configured model or flash-lite)
async function askGeminiChef(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PASTE_KEY_HERE') throw new Error('Missing GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Gemini chef request failed.');
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try { return JSON.parse(text); } catch {
    const repaired = text.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(repaired);
  }
}

// POST /api/chef/generate-menu — chef only
app.post('/api/chef/generate-menu', requireAuth('chef', 'fb_director', 'owner', 'admin'), async (req, res) => {
  try {
    const { menuType, occasion, season, notes, menuName } = req.body;
    const prompt = `You are an elite culinary director for a premium Israeli restaurant.
Generate a complete, sophisticated food menu with dishes that tell a story.
Price range: ₪32 (focaccia/bread) to ₪186 (steak/premium mains).
Each dish must have: name, category (starter/main/dessert/bread/side),
description (2 sentences), story (1 evocative sentence), price_ils,
estimated food_cost_ils (typically 28-35% of price), ingredients array, allergens,
and tags (array — choose only from: "vegetarian", "vegan", "gluten_free"; omit array or leave empty if none apply).

Menu type: ${menuType || 'daily_operations'}
Occasion: ${occasion || 'daily service'}
Season: ${season || 'current'}
Notes: ${notes || 'none'}

Return ONLY valid JSON: { "menuName": "string", "menuStory": "string", "dishes": [{ "name": "string", "category": "string", "description": "string", "story": "string", "price_ils": number, "food_cost_ils": number, "ingredients": ["string"], "allergens": "string", "tags": ["vegetarian"|"vegan"|"gluten_free"] }] }
No markdown, no backticks, no preamble.`;

    const generated = await askGeminiChef(prompt);
    const now = nowIso();
    const menuResult = db.prepare(`
      INSERT INTO food_menus (venue_id, name, menu_type, story, status, created_by, created_at, updated_at)
      VALUES (?,?,?,?,'draft',?,?,?)
    `).run(req.venueId, generated.menuName || menuName || 'Generated Menu',
      menuType || 'daily_operations', generated.menuStory || null,
      req.user.id, now, now);
    const menuId = menuResult.lastInsertRowid;

    const insertDish = db.prepare(`
      INSERT INTO food_dishes (menu_id, name, description, story, category, price_ils, food_cost_ils, food_cost_percent, ingredients, allergens, tags_json, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    for (const d of (generated.dishes || [])) {
      const cost = Number(d.food_cost_ils) || 0;
      const price = Number(d.price_ils) || 0;
      const pct = price > 0 ? Math.round((cost / price) * 100) : null;
      const tags = (Array.isArray(d.tags) ? d.tags : []).filter(t => ALLOWED_FOOD_TAGS.includes(t));
      insertDish.run(menuId, d.name, d.description || null, d.story || null,
        d.category || null, price, cost, pct,
        JSON.stringify(d.ingredients || []), d.allergens || null,
        JSON.stringify(tags), now);
    }

    const menu = db.prepare('SELECT * FROM food_menus WHERE id=?').get(menuId);
    const dishes = db.prepare('SELECT * FROM food_dishes WHERE menu_id=? ORDER BY id ASC').all(menuId);
    res.status(201).json({ menu, dishes: dishes.map(d => ({ ...d, tags: tryJson(d.tags_json, []) })) });
  } catch (e) {
    console.error('[CHEF GENERATE]', e);
    res.status(500).json({ error: e.message || 'Menu generation failed.' });
  }
});

// POST /api/chef/save-menu/:menuId — changes status to pending_approval
app.post('/api/chef/save-menu/:menuId', requireAuth('chef', 'fb_director', 'owner', 'admin'), (req, res) => {
  const menuId = parseInt(req.params.menuId, 10);
  const menu = db.prepare('SELECT * FROM food_menus WHERE id=?').get(menuId);
  if (!menu) return res.status(404).json({ error: 'Menu not found.' });
  const now = nowIso();
  db.prepare("UPDATE food_menus SET status='pending_approval', updated_at=? WHERE id=?").run(now, menuId);
  const insertNotif = db.prepare(`
    INSERT INTO menu_notifications (type, reference_id, target_role, message, created_at)
    VALUES (?,?,?,?,?)
  `);
  insertNotif.run('food_menu_pending', menuId, 'fb_director', 'New food menu pending your approval', now);
  insertNotif.run('food_menu_pending', menuId, 'owner', 'New food menu pending your approval', now);
  res.json({ ok: true, status: 'pending_approval' });
});

// POST /api/chef/approve-menu/:menuId — fb_director or owner
app.post('/api/chef/approve-menu/:menuId', requireAuth('fb_director', 'owner', 'admin'), (req, res) => {
  const menuId = parseInt(req.params.menuId, 10);
  const menu = db.prepare('SELECT * FROM food_menus WHERE id=?').get(menuId);
  if (!menu) return res.status(404).json({ error: 'Menu not found.' });
  const now = nowIso();
  const role = req.user.role;

  if (role === 'fb_director' || role === 'admin') {
    db.prepare('UPDATE food_menus SET fb_approved_at=?, updated_at=? WHERE id=?').run(now, now, menuId);
  }
  if (role === 'owner' || role === 'admin') {
    db.prepare('UPDATE food_menus SET owner_approved_at=?, updated_at=? WHERE id=?').run(now, now, menuId);
  }

  // Re-fetch to check if both approved
  const updated = db.prepare('SELECT * FROM food_menus WHERE id=?').get(menuId);
  if (updated.fb_approved_at && updated.owner_approved_at && updated.status !== 'published') {
    db.prepare("UPDATE food_menus SET status='published', updated_at=? WHERE id=?").run(now, menuId);
    db.prepare(`
      INSERT INTO menu_notifications (type, reference_id, target_role, message, created_at)
      VALUES ('food_menu_approved',?,?,'Food menu has been approved and published',?)
    `).run(menuId, 'all', now);
  }

  res.json({ ok: true, menu: db.prepare('SELECT * FROM food_menus WHERE id=?').get(menuId) });
});

// GET /api/chef/menus — role-aware
app.get('/api/chef/menus', requireAuth('chef', 'fb_director', 'owner', 'admin', 'manager', 'employee', 'bar_manager', 'events_manager'), (req, res) => {
  const role = req.user.role;
  let menus;
  if (role === 'employee') {
    menus = db.prepare("SELECT * FROM food_menus WHERE status='published' AND visible_to_staff=1 ORDER BY created_at DESC").all();
  } else if (role === 'chef') {
    menus = db.prepare('SELECT * FROM food_menus WHERE created_by=? ORDER BY created_at DESC').all(req.user.id);
  } else {
    menus = db.prepare('SELECT * FROM food_menus ORDER BY created_at DESC').all();
  }
  const menuIds = menus.map(m => m.id);
  const allDishes = menuIds.length
    ? db.prepare(`SELECT * FROM food_dishes WHERE menu_id IN (${menuIds.map(() => '?').join(',')}) ORDER BY id ASC`).all(...menuIds)
    : [];
  const dishesByMenu = {};
  for (const d of allDishes) {
    if (!dishesByMenu[d.menu_id]) dishesByMenu[d.menu_id] = [];
    dishesByMenu[d.menu_id].push(d);
  }
  res.json({ menus: menus.map(m => ({ ...m, dishes: (dishesByMenu[m.id] || []).map(d => ({ ...d, tags: tryJson(d.tags_json, []) })) })) });
});

// GET /api/chef/notifications — unread for the logged-in user's role
app.get('/api/chef/notifications', requireAuth('fb_director', 'owner', 'admin'), (req, res) => {
  const role = req.user.role;
  const target = role === 'admin' ? null : role;
  const rows = target
    ? db.prepare("SELECT * FROM menu_notifications WHERE (target_role=? OR target_role='all') AND is_read=0 ORDER BY created_at DESC").all(target)
    : db.prepare("SELECT * FROM menu_notifications WHERE is_read=0 ORDER BY created_at DESC").all();
  // Mark as read
  if (rows.length) {
    db.prepare("UPDATE menu_notifications SET is_read=1 WHERE id IN (" + rows.map(() => '?').join(',') + ")").run(...rows.map(r => r.id));
  }
  res.json({ notifications: rows });
});

// PATCH /api/chef/menus/:menuId/visible — toggle staff visibility
app.patch('/api/chef/menus/:menuId/visible', requireAuth('fb_director', 'owner', 'admin'), (req, res) => {
  const { visible_to_staff } = req.body;
  db.prepare('UPDATE food_menus SET visible_to_staff=?, updated_at=? WHERE id=?')
    .run(visible_to_staff ? 1 : 0, nowIso(), parseInt(req.params.menuId, 10));
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════════════════
// FOOD SALES ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.post('/api/ci/daily-close/submit-food', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const { venueId, saleDate, entries } = req.body;
  if (!Array.isArray(entries) || !entries.length) return res.status(400).json({ error: 'entries required.' });
  const vid = venueId || req.venueId;
  const now = nowIso();
  const insert = db.prepare(`
    INSERT INTO food_sales (venue_id, dish_name, sale_date, units_sold, sale_price, cost_per_unit, revenue, gross_profit, gp_percent, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
  let saved = 0;
  for (const e of entries) {
    const rev = (e.unitsSold || 0) * (e.salePrice || 0);
    const gp  = rev - (e.unitsSold || 0) * (e.costPerUnit || 0);
    const gpPct = rev > 0 ? Math.round((gp / rev) * 100) : 0;
    insert.run(vid, e.dishName, saleDate, e.unitsSold || 0, e.salePrice || 0, e.costPerUnit || 0, rev, gp, gpPct, now);
    saved++;
  }
  res.json({ ok: true, saved });
});

app.get('/api/food-sales', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const { start, end } = req.query;
  let rows;
  if (start && end) {
    rows = db.prepare('SELECT * FROM food_sales WHERE venue_id=? AND sale_date>=? AND sale_date<=? ORDER BY sale_date DESC').all(req.venueId, start, end);
  } else {
    rows = db.prepare('SELECT * FROM food_sales WHERE venue_id=? ORDER BY sale_date DESC LIMIT 200').all(req.venueId);
  }
  res.json({ sales: rows });
});

// ════════════════════════════════════════════════════════════════════════════
// STAFF TAB ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/staff/employees', requireAuth('fb_director', 'bar_manager', 'owner', 'admin', 'manager'), (req, res) => {
  const rows = db.prepare(`
    SELECT e.*,
      CASE WHEN julianday('now') - julianday(e.joined_date) <= 30 THEN 1 ELSE 0 END AS is_trainee,
      CAST(julianday('now') - julianday(e.joined_date) AS INTEGER) AS days_since_join
    FROM employees e
    ORDER BY e.joined_date ASC
  `).all();
  res.json({ employees: rows });
});

// ════════════════════════════════════════════════════════════════════════════
// EMPLOYEE SHIFT CONSTRAINT ROUTES
// ════════════════════════════════════════════════════════════════════════════

function getEmployeeForUser(userId) {
  return db.prepare('SELECT * FROM employees WHERE user_id=?').get(userId);
}

// GET /api/employee-shifts/constraints?week_start=YYYY-MM-DD
app.get('/api/employee-shifts/constraints', requireAuth('employee', 'bar_manager', 'manager', 'owner', 'admin'), (req, res) => {
  const { week_start } = req.query;
  const role = req.user.role;
  let rows;
  if (role === 'employee') {
    const emp = getEmployeeForUser(req.user.id);
    if (!emp) return res.json({ constraints: [] });
    rows = week_start
      ? db.prepare('SELECT * FROM employee_shift_constraints WHERE employee_id=? AND week_start=?').all(emp.id, week_start)
      : db.prepare('SELECT * FROM employee_shift_constraints WHERE employee_id=? ORDER BY submitted_at DESC LIMIT 10').all(emp.id);
  } else {
    rows = week_start
      ? db.prepare(`
          SELECT c.*, e.display_name, e.sub_role, e.gender,
            CASE WHEN julianday('now') - julianday(e.joined_date) <= 30 THEN 1 ELSE 0 END AS is_trainee
          FROM employee_shift_constraints c
          JOIN employees e ON c.employee_id = e.id
          WHERE c.week_start=?
        `).all(week_start)
      : db.prepare(`
          SELECT c.*, e.display_name, e.sub_role, e.gender,
            CASE WHEN julianday('now') - julianday(e.joined_date) <= 30 THEN 1 ELSE 0 END AS is_trainee
          FROM employee_shift_constraints c
          JOIN employees e ON c.employee_id = e.id
          ORDER BY c.submitted_at DESC LIMIT 50
        `).all();
  }
  res.json({
    constraints: rows.map(r => ({
      ...r,
      constraints: r.constraints_json ? JSON.parse(r.constraints_json) : {},
    })),
  });
});

// POST /api/employee-shifts/constraints — employee submits availability
app.post('/api/employee-shifts/constraints', requireAuth('employee', 'admin'), (req, res) => {
  const emp = getEmployeeForUser(req.user.id);
  if (!emp) return res.status(400).json({ error: 'Employee record not found for this user.' });

  // Submission window: Sunday–Thursday before 23:00
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu, 5=Fri, 6=Sat
  const hour = now.getHours();
  if (dayOfWeek === 5 || dayOfWeek === 6 || (dayOfWeek === 4 && hour >= 23)) {
    return res.status(400).json({ error: 'Constraint submission window is Sunday–Thursday before 23:00.' });
  }

  const { week_start, constraints } = req.body;
  if (!week_start) return res.status(400).json({ error: 'week_start is required.' });

  // Upsert
  const existing = db.prepare('SELECT id FROM employee_shift_constraints WHERE employee_id=? AND week_start=?').get(emp.id, week_start);
  if (existing) {
    db.prepare('UPDATE employee_shift_constraints SET constraints_json=?, submitted_at=? WHERE id=?')
      .run(JSON.stringify(constraints || {}), nowIso(), existing.id);
  } else {
    db.prepare('INSERT INTO employee_shift_constraints (employee_id, week_start, constraints_json) VALUES (?,?,?)')
      .run(emp.id, week_start, JSON.stringify(constraints || {}));
  }

  // Notify managers
  db.prepare(`
    INSERT INTO employee_shift_notifications (type, employee_id, week_start, created_at) VALUES ('constraints_submitted',?,?,?)
  `).run(emp.id, week_start, nowIso());

  res.json({ ok: true });
});

// GET /api/employee-shifts/schedule?week_start=YYYY-MM-DD
app.get('/api/employee-shifts/schedule', requireAuth('employee', 'bar_manager', 'manager', 'owner', 'admin'), (req, res) => {
  const { week_start } = req.query;
  const role = req.user.role;
  let row;
  if (week_start) {
    row = db.prepare('SELECT * FROM employee_weekly_schedules WHERE week_start=?').get(week_start);
  } else {
    row = db.prepare('SELECT * FROM employee_weekly_schedules ORDER BY week_start DESC LIMIT 1').get();
  }
  if (!row) return res.json({ schedule: null });

  let shifts = row.shifts_json ? JSON.parse(row.shifts_json) : {};

  // For employees, filter to only their own shifts
  if (role === 'employee') {
    const emp = getEmployeeForUser(req.user.id);
    if (!emp) return res.json({ schedule: null });
    const myShifts = {};
    for (const [day, services] of Object.entries(shifts)) {
      const lunch = (services.lunch || []).filter(e => e.employee_id === emp.id);
      const dinner = (services.dinner || []).filter(e => e.employee_id === emp.id);
      if (lunch.length || dinner.length) myShifts[day] = { lunch, dinner };
    }
    shifts = myShifts;
  }

  res.json({ schedule: { ...row, shifts } });
});

// POST /api/employee-shifts/generate — AI shift generation (bar_manager + up)
app.post('/api/employee-shifts/generate', requireAuth('bar_manager', 'manager', 'owner', 'admin'), async (req, res) => {
  try {
    const { week_start } = req.body;
    if (!week_start) return res.status(400).json({ error: 'week_start required.' });

    const employees = db.prepare(`
      SELECT e.*,
        CASE WHEN julianday('now') - julianday(e.joined_date) <= 30 THEN 1 ELSE 0 END AS is_trainee
      FROM employees e
    `).all();

    const constraints = db.prepare(
      'SELECT c.*, e.display_name, e.sub_role FROM employee_shift_constraints c JOIN employees e ON c.employee_id=e.id WHERE c.week_start=?'
    ).all(week_start);

    const constraintsMap = {};
    for (const c of constraints) {
      constraintsMap[c.employee_id] = JSON.parse(c.constraints_json || '{}');
    }

    const employeeList = employees.map(e => ({
      id: e.id,
      name: e.display_name,
      sub_role: e.sub_role,
      gender: e.gender,
      is_trainee: Boolean(e.is_trainee),
      availability: constraintsMap[e.id] || {},
    }));

    const prompt = `You are an expert restaurant shift manager. Build an optimal weekly shift schedule.
Rules:
- Each service (lunch + dinner) needs: 1 opener bartender, 1 second bartender (or trainee), 1 opener waiter/waitress, 1-2 second waiters, 1 host (waiter role)
- Trainees must always be paired with a regular (non-trainee) of the same sub_role
- Respect submitted constraints — never schedule unavailable employees
- Minimize overtime (flag if any employee exceeds 6 shifts/week)
- Balance gender distribution across shifts where possible
- Calculate estimated labor cost per shift (bartender ₪65/hour × 8h, waiter ₪55/hour × 8h, trainee ₪45/hour × 8h)
Return ONLY valid JSON: { "week_start": "${week_start}", "total_labor_cost": number, "overtime_warnings": [], "shifts": { "sunday": { "lunch": [], "dinner": [] }, "monday": {}, "tuesday": {}, "wednesday": {}, "thursday": {}, "friday": {}, "saturday": {} } }
Each shift entry: { "employee_id": number, "display_name": "string", "sub_role": "string", "position": "string", "is_trainee": boolean, "estimated_cost": number }

Employees: ${JSON.stringify(employeeList)}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PASTE_KEY_HERE') throw new Error('Missing GEMINI_API_KEY');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini shift generation failed.');
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let schedule;
    try { schedule = JSON.parse(text); } catch {
      schedule = JSON.parse(text.replace(/,(\s*[}\]])/g, '$1'));
    }

    res.json({ schedule });
  } catch (e) {
    console.error('[SHIFT GENERATE]', e);
    res.status(500).json({ error: e.message || 'Shift generation failed.' });
  }
});

// POST /api/employee-shifts/publish — save and notify employees
app.post('/api/employee-shifts/publish', requireAuth('bar_manager', 'manager', 'owner', 'admin'), async (req, res) => {
  const { week_start, shifts, total_labor_cost, overtime_warnings } = req.body;
  if (!week_start) return res.status(400).json({ error: 'week_start required.' });

  const now = nowIso();
  const existing = db.prepare('SELECT id FROM employee_weekly_schedules WHERE week_start=?').get(week_start);
  if (existing) {
    db.prepare('UPDATE employee_weekly_schedules SET shifts_json=?, published_at=?, published_by=? WHERE id=?')
      .run(JSON.stringify(shifts || {}), now, req.user.id, existing.id);
  } else {
    db.prepare('INSERT INTO employee_weekly_schedules (venue_id, week_start, published_at, published_by, shifts_json) VALUES (?,?,?,?,?)')
      .run(req.venueId, week_start, now, req.user.id, JSON.stringify(shifts || {}));
  }

  // Notify each employee + send email
  const employeeIds = new Set();
  for (const day of Object.values(shifts || {})) {
    for (const service of Object.values(day)) {
      for (const slot of (Array.isArray(service) ? service : [])) {
        if (slot.employee_id) employeeIds.add(slot.employee_id);
      }
    }
  }

  const weekEnd = new Date(week_start);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  for (const empId of employeeIds) {
    db.prepare('INSERT INTO employee_shift_notifications (type, employee_id, week_start, created_at) VALUES (?,?,?,?)')
      .run('shift_published', empId, week_start, now);

    // Build personal shift list
    const empRecord = db.prepare('SELECT e.*, a.full_name FROM employees e JOIN auth_users a ON e.user_id=a.id WHERE e.id=?').get(empId);
    if (empRecord?.email) {
      const myShiftLines = [];
      for (const [day, services] of Object.entries(shifts || {})) {
        for (const [service, slots] of Object.entries(services)) {
          for (const slot of (Array.isArray(slots) ? slots : [])) {
            if (slot.employee_id === empId) {
              myShiftLines.push(`${day.charAt(0).toUpperCase() + day.slice(1)} – ${service.charAt(0).toUpperCase() + service.slice(1)} – ${slot.position || slot.sub_role}`);
            }
          }
        }
      }
      const shiftsHtml = myShiftLines.map(l => `<p>${l}</p>`).join('');
      await sendEmail({
        to: empRecord.email,
        subject: `Your shifts for the week of ${week_start}`,
        html: `<p>Hi ${empRecord.display_name},</p>
<p>Your shifts for the week of ${week_start} – ${weekEndStr}:</p>
${shiftsHtml || '<p>No shifts assigned this week.</p>'}
<p>See your full schedule in HESTIA.</p>
<p>— The HESTIA Team</p>`,
      });
    }
  }

  res.json({ ok: true, week_start, employee_count: employeeIds.size });
});

// GET /api/employee-shifts/notifications — unread shift notifications for managers
app.get('/api/employee-shifts/notifications', requireAuth('bar_manager', 'manager', 'owner', 'admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT n.*, e.display_name, e.sub_role
    FROM employee_shift_notifications n
    JOIN employees e ON n.employee_id = e.id
    WHERE n.type='constraints_submitted' AND n.is_read=0
    ORDER BY n.created_at DESC LIMIT 50
  `).all();
  res.json({ notifications: rows });
});

app.patch('/api/employee-shifts/notifications/read', requireAuth('bar_manager', 'manager', 'owner', 'admin'), (req, res) => {
  db.prepare("UPDATE employee_shift_notifications SET is_read=1 WHERE type='constraints_submitted'").run();
  res.json({ ok: true });
});

// GET /api/employee-shifts/my-shifts — employee's own current/next week shifts
app.get('/api/employee-shifts/my-shifts', requireAuth('employee', 'admin'), (req, res) => {
  const emp = getEmployeeForUser(req.user.id);
  if (!emp) return res.json({ shifts: [] });

  const today = new Date();
  const getMonday = (d) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const thisMonday = getMonday(new Date(today));
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);

  const weeks = [
    thisMonday.toISOString().slice(0, 10),
    nextMonday.toISOString().slice(0, 10),
  ];

  const result = [];
  for (const weekStart of weeks) {
    const sched = db.prepare('SELECT * FROM employee_weekly_schedules WHERE week_start=?').get(weekStart);
    if (!sched) {
      result.push({ week_start: weekStart, published: false, shifts: [] });
      continue;
    }
    const allShifts = JSON.parse(sched.shifts_json || '{}');
    const myShifts = [];
    for (const [day, services] of Object.entries(allShifts)) {
      for (const [service, slots] of Object.entries(services)) {
        for (const slot of (Array.isArray(slots) ? slots : [])) {
          if (slot.employee_id === emp.id) {
            myShifts.push({ day, service, position: slot.position, sub_role: slot.sub_role });
          }
        }
      }
    }
    result.push({ week_start: weekStart, published: true, shifts: myShifts });
  }
  res.json({ shifts: result });
});

// ── Production SPA catch-all ───────────────────────────────────────────────────
// Serves index.html for all non-API GET requests so React Router can handle
// deep links and refreshes on any route (e.g. /bar/lab, /events, /academy/wine).
//
// IMPORTANT: This must be the LAST route declaration.
// All /api/* routes, /event/:token/guest, and any other explicit routes are
// registered above — they take precedence over this catch-all.
//
// In development, Vite's dev server handles non-API routes and this block is skipped.
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, 'dist');
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.log('[UNCAUGHT EXCEPTION]', err.message, err.stack?.slice(0, 400));
});

app.listen(PORT, () => {
  console.log(`HESTIA backend running on http://localhost:${PORT}`);
  console.log(`HESTIA SQLite database: ${DB_PATH}`);
});
