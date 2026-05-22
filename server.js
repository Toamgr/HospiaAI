import express from "express";
import dotenv from "dotenv";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { cocktailLibrary } from "./src/data/cocktails.js";
import { UNIVERSITY_MANIFEST } from "./src/data/academy/universityManifest.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "hospia.sqlite");

mkdirSync(DATA_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;
const MODEL = process.env.MODEL || "gemini-1.5-flash";
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

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  const origin = req.header("Origin");
  if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-HOSPIA-Role,X-HESTIA-User");

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

seedDatabase();
migrateAcademyExternalIds();
migrateUserCredentials();

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultVenueId() {
  return "venue-main";
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
      return res.status(403).json({ error: "Forbidden.", required: allowedRoles, received: session.role });
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

  const setUsername = db.prepare(
    "UPDATE auth_users SET username = ? WHERE id = ? AND (username IS NULL OR username = '')"
  );
  const writeHash = db.prepare(
    "UPDATE auth_users SET password_hash = ? WHERE id = ? AND password_hash IS NULL"
  );

  for (const u of seedAccounts) {
    setUsername.run(u.username, u.id);
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
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PASTE_KEY_HERE') {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  // In JSON mode the prompt already contains its own system context, so skip the
  // general SYSTEM preamble (which is conversational and conflicts with JSON-only output).
  const fullPrompt = jsonMode ? prompt : `${SYSTEM}\n\n${prompt}`;

  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }],
  };
  if (jsonMode) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    console.log("GEMINI ERROR:", data);
    throw new Error(data.error?.message || "Gemini request failed.");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (jsonMode && text) {
    // Validate the JSON is parseable; repair trailing commas if not.
    try {
      JSON.parse(text);
    } catch {
      const repaired = text.replace(/,(\s*[}\]])/g, '$1');
      try {
        JSON.parse(repaired);
        return repaired;
      } catch {
        // Return raw text and let the client parser handle it
        console.warn("GEMINI JSON MODE: response could not be repaired server-side.");
      }
    }
    return text;
  }

  return text || "No answer generated.";
}

app.post("/api/gemini", async (req, res) => {
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
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    token, user.id, nowIso(), expiresAt
  );
  res.json({ ok: true, token, user: { id: user.id, full_name: user.full_name, role: user.role } });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(authHeader.slice(7));
  }
  res.json({ ok: true });
});

app.get("/api/shift-reports", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM shift_reports
    WHERE venue_id = ?
    ORDER BY submitted_at DESC
    LIMIT 50
  `).all(defaultVenueId());

  res.json({ reports: rows.map(reportRow) });
});

app.post("/api/shift-reports", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const clientId = String(req.body.id || "").trim();
  const report = {
    id: clientId || id("eod"),
    venue_id: defaultVenueId(),
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
      defaultVenueId(),
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
    SELECT type, title, detail, event_date AS date, created_at
    FROM business_memory
    WHERE venue_id = ?
    ORDER BY created_at DESC
    LIMIT 80
  `).all(defaultVenueId());

  res.json({ memory: rows });
});

app.get("/api/actions", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT id, priority, title, owner, due, signal, page, done, created_at, updated_at
    FROM actions
    WHERE venue_id = ?
    ORDER BY done ASC, created_at DESC
  `).all(defaultVenueId());

  res.json({ actions: rows.map(actionRow) });
});

app.post("/api/actions", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const action = {
    id: req.body.id || id("action"),
    venue_id: defaultVenueId(),
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
      action.priority, action.title, action.owner, action.due, action.signal, action.page, action.done, nowIso(), action.id, defaultVenueId()
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
    defaultVenueId()
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
  `).all(defaultVenueId());
  res.json({ incidents: rows.map(r => ({ ...r, resolved: Boolean(r.resolved) })) });
});

app.post("/api/incidents", requireAuth("manager", "bar_manager", "employee", "admin"), (req, res) => {
  const incident = {
    id: req.body.id || id("incident"),
    venue_id: defaultVenueId(),
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
    id("memory"), defaultVenueId(), "alert",
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
    ...values, req.params.id, defaultVenueId()
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
  const entry = {
    id: id("memory"),
    venue_id: defaultVenueId(),
    type: String(req.body.type || "note"),
    title: String(req.body.title || ""),
    detail: String(req.body.detail || ""),
    event_date: String(req.body.event_date || req.body.date || new Date().toISOString().slice(0, 10)),
    created_at: nowIso()
  };

  db.prepare("INSERT INTO business_memory (id, venue_id, type, title, detail, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    entry.id, entry.venue_id, entry.type, entry.title, entry.detail, entry.event_date, entry.created_at
  );

  res.status(201).json({ entry });
});

app.get("/api/notes", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM notes WHERE venue_id = ? AND archived = 0 ORDER BY pinned DESC, created_at DESC LIMIT 50
  `).all(defaultVenueId());
  res.json({ notes: rows.map(r => ({ ...r, pinned: Boolean(r.pinned), archived: Boolean(r.archived) })) });
});

app.post("/api/notes", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const note = {
    id: id("note"),
    venue_id: defaultVenueId(),
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

  db.prepare(`UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND venue_id = ?`).run(...values, req.params.id, defaultVenueId());

  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Note not found." });
  res.json({ note: { ...row, pinned: Boolean(row.pinned), archived: Boolean(row.archived) } });
});

// ─── Shift Lifecycle ──────────────────────────────────────────────────────────

app.post("/api/shifts", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const existing = db.prepare(
    "SELECT id FROM shifts WHERE venue_id = ? AND status = 'open'"
  ).get(defaultVenueId());
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
    venue_id:     defaultVenueId(),
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
  ).get(defaultVenueId());
  res.json({ shift: shift || null });
});

app.get("/api/shifts/last-handover", requireAuth("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const shift = db.prepare(
    "SELECT * FROM shifts WHERE venue_id = ? AND status = 'closed' ORDER BY closed_at DESC LIMIT 1"
  ).get(defaultVenueId());
  if (!shift) {
    return res.json({ shift: null, tasks: [], unresolvedIncidents: [] });
  }
  const tasks = db.prepare(
    "SELECT * FROM carry_forward_tasks WHERE venue_id = ? AND status = 'open' ORDER BY created_at ASC"
  ).all(defaultVenueId());
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
    .run(briefing, req.params.id, defaultVenueId());
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
  ).run(closed_at, summary, cover_count, req.params.id, defaultVenueId());

  const shift = db.prepare("SELECT * FROM shifts WHERE id = ?").get(req.params.id);
  if (!shift) return res.status(404).json({ error: "Shift not found." });
  res.json({ shift });
});

app.post("/api/shifts/:id/handover", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const message = String(req.body.message || "").trim();
  db.prepare("UPDATE shifts SET handover_notes = ? WHERE id = ? AND venue_id = ?")
    .run(message, req.params.id, defaultVenueId());
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
      ).all(defaultVenueId(), status)
    : db.prepare(
        "SELECT * FROM carry_forward_tasks WHERE venue_id = ? ORDER BY created_at DESC LIMIT 50"
      ).all(defaultVenueId());
  res.json({ tasks: rows });
});

app.post("/api/tasks", requireAuth("manager", "bar_manager", "admin"), (req, res) => {
  const content = String(req.body.content || "").trim();
  if (!content) return res.status(400).json({ error: "content is required." });

  const clientId = String(req.body.id || "").trim();
  const task = {
    id:               clientId || id("task"),
    venue_id:         defaultVenueId(),
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
    .run(...values, req.params.id, defaultVenueId());

  const row = db.prepare("SELECT * FROM carry_forward_tasks WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Task not found." });
  res.json({ task: row });
});

app.post("/api/event-plans", requireAuth("manager", "owner", "admin"), (req, res) => {
  const plan = {
    id: id("event"),
    venue_id: defaultVenueId(),
    name: String(req.body.name || "Untitled Event Plan"),
    config_json: JSON.stringify(req.body.config || {}),
    calculations_json: JSON.stringify(req.body.calculations || {}),
    projected_revenue: Number(req.body.calculations?.revenue || 0),
    projected_profit: Number(req.body.calculations?.grossProfit || 0),
    projected_margin: Number(req.body.calculations?.margin || 0),
    created_at: nowIso()
  };

  db.prepare(`
    INSERT INTO event_plans (
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
    defaultVenueId(),
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

app.get("/api/event-plans", requireAuth("manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM event_plans
    WHERE venue_id = ?
    ORDER BY created_at DESC
    LIMIT 30
  `).all(defaultVenueId());

  res.json({
    eventPlans: rows.map(row => ({
      id: row.id,
      name: row.name,
      config: JSON.parse(row.config_json),
      calculations: JSON.parse(row.calculations_json),
      projected_revenue: row.projected_revenue,
      projected_profit: row.projected_profit,
      projected_margin: row.projected_margin,
      created_at: row.created_at
    }))
  });
});

app.post("/api/coach", async (req, res) => {
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

app.post("/api/simulate", async (req, res) => {
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

const VALID_ROLES = ['owner', 'manager', 'bar_manager', 'employee', 'admin'];

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
  ).get(defaultVenueId()).count;

  const openShift = db.prepare(
    "SELECT id FROM shifts WHERE venue_id = ? AND status = 'open' LIMIT 1"
  ).get(defaultVenueId());

  const openTasks = db.prepare(
    "SELECT COUNT(*) as count FROM carry_forward_tasks WHERE venue_id = ? AND status = 'open'"
  ).get(defaultVenueId()).count;

  const unresolvedIncidents = db.prepare(
    "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND resolved = 0"
  ).get(defaultVenueId()).count;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const incidents30d = db.prepare(
    "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND created_at >= ?"
  ).get(defaultVenueId(), thirtyDaysAgo).count;

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
  ).get(defaultVenueId());

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
  `).all(defaultVenueId());

  const incidentRows = db.prepare(`
    SELECT
      shift_date,
      COUNT(*) as incident_count
    FROM incidents
    WHERE venue_id = ? AND shift_date >= date('now', '-30 days')
    GROUP BY shift_date
    ORDER BY shift_date ASC
  `).all(defaultVenueId());

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
  ).get(defaultVenueId());

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
    ).get(defaultVenueId()).count;
    const openTasks = db.prepare(
      "SELECT COUNT(*) as count FROM carry_forward_tasks WHERE venue_id = ? AND status = 'open'"
    ).get(defaultVenueId()).count;
    const unresolvedIncidents = db.prepare(
      "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND resolved = 0"
    ).get(defaultVenueId()).count;
    const incidents30d = db.prepare(
      "SELECT COUNT(*) as count FROM incidents WHERE venue_id = ? AND created_at >= date('now', '-30 days')"
    ).get(defaultVenueId()).count;
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
    ).run(defaultVenueId(), content, savedAt);

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
  `).all(defaultVenueId());

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
  ).get(product_id, defaultVenueId());

  let oldPriceNis = null;
  if (existing) {
    try { oldPriceNis = JSON.parse(existing.normalized_update_json).actual_venue_price_nis ?? null; } catch {}
  }

  const now = nowIso();
  db.prepare(`
    INSERT OR REPLACE INTO verified_price_overrides
      (product_id, venue_id, normalized_update_json, saved_by, saved_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(product_id, defaultVenueId(), json, String(savedBy || ""), now);

  db.prepare(`
    INSERT INTO verified_price_audit_log
      (id, product_id, venue_id, action, old_price_nis, new_price_nis, supplier_name, source_type, saved_by, saved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id('audit'), product_id, defaultVenueId(), 'save',
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
  ).get(product_id, defaultVenueId());

  let oldPriceNis = null;
  if (existing) {
    try { oldPriceNis = JSON.parse(existing.normalized_update_json).actual_venue_price_nis ?? null; } catch {}
  }

  db.prepare(`
    DELETE FROM verified_price_overrides WHERE product_id = ? AND venue_id = ?
  `).run(product_id, defaultVenueId());

  if (existing) {
    db.prepare(`
      INSERT INTO verified_price_audit_log
        (id, product_id, venue_id, action, old_price_nis, new_price_nis, supplier_name, source_type, saved_by, saved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id('audit'), product_id, defaultVenueId(), 'clear',
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
  `).all(productId, defaultVenueId(), limit);

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

// ── Events CRUD ──────────────────────────────────────────────────────────────

app.get('/api/events', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM events WHERE venue_id = ? ORDER BY event_date ASC
  `).all(defaultVenueId());
  res.json({ events: rows.map(eventRow) });
});

app.post('/api/events', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const b = req.body;
  const token = randomUUID();
  const now = nowIso();
  const evt = {
    id: id('evt'), venue_id: defaultVenueId(),
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
  };
  db.prepare(`
    INSERT INTO events (id,venue_id,name,event_type,event_date,start_time,end_time,status,
      client_name,client_phone,client_email,expected_guests,table_count,host_message,
      theme_color,plus_one_allowed,location,notes,portal_token,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(evt.id,evt.venue_id,evt.name,evt.event_type,evt.event_date,evt.start_time,evt.end_time,
    evt.status,evt.client_name,evt.client_phone,evt.client_email,evt.expected_guests,evt.table_count,
    evt.host_message,evt.theme_color,evt.plus_one_allowed,evt.location,evt.notes,
    evt.portal_token,evt.created_by,evt.created_at,evt.updated_at);

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
    insertTask.run(id('etask'), evt.id, defaultVenueId(), t.title, t.assigned_role, t.due_date, 'open', 1, now, now);
  }

  // Notify bar_manager about cocktail/bar prep tasks
  const barTask = tasks.find(t => t.assigned_role === 'bar_manager');
  if (barTask) {
    insertNotif.run(id('notif'), defaultVenueId(), 'bar_manager',
      'New event task assigned',
      `${barTask.title} — due ${barTask.due_date || 'TBD'}`,
      'event_task', 'eventCRM', now);
  }
  // Notify manager about the new event
  insertNotif.run(id('notif'), defaultVenueId(), 'manager',
    `New event created: ${evt.name}`,
    `${evt.name} on ${evt.event_date} for ${evt.expected_guests} guests`,
    'event', 'eventCRM', now);

  addTimeline(evt.id, req.user.full_name, req.user.role, 'event_created',
    `Event created: ${evt.name} on ${evt.event_date}`);

  res.status(201).json({ event: eventRow(evt) });
});

app.get('/api/events/:id', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const row = db.prepare('SELECT * FROM events WHERE id = ? AND venue_id = ?')
    .get(req.params.id, defaultVenueId());
  if (!row) return res.status(404).json({ error: 'Event not found.' });
  res.json({ event: eventRow(row) });
});

app.patch('/api/events/:id', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ? AND venue_id = ?')
    .get(req.params.id, defaultVenueId());
  if (!existing) return res.status(404).json({ error: 'Event not found.' });
  const b = req.body;
  const now = nowIso();
  const fields = [], vals = [];
  const allowed = ['name','event_type','event_date','start_time','end_time','status','client_name',
    'client_phone','client_email','expected_guests','table_count','host_message','theme_color',
    'plus_one_allowed','location','notes'];
  for (const f of allowed) {
    if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); }
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
    .get(req.params.id, defaultVenueId());
  if (!existing) return res.status(404).json({ error: 'Event not found.' });
  db.prepare(`UPDATE events SET status='cancelled', updated_at=? WHERE id=?`)
    .run(nowIso(), req.params.id);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'event_cancelled',
    `Event cancelled: ${existing.name}`);
  res.json({ ok: true });
});

// ── Guests ───────────────────────────────────────────────────────────────────

app.get('/api/events/:id/guests', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const rows = db.prepare('SELECT * FROM event_guests WHERE event_id=? ORDER BY name ASC')
    .all(req.params.id);
  res.json({ guests: rows.map(guestRow) });
});

app.post('/api/events/:id/guests', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const b = req.body;
  const now = nowIso();
  const g = {
    id: id('eg'), event_id: req.params.id, venue_id: defaultVenueId(),
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

app.post('/api/events/:id/guests/import', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
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
    const existing = db.prepare('SELECT id FROM event_guests WHERE event_id=? AND LOWER(name)=? AND (phone IS NULL OR phone=? OR ?=\'\')')
      .get(req.params.id, name.toLowerCase(), g.phone || '', g.phone || '');
    if (existing) { skipped.push(name); continue; }
    const newId = id('eg');
    insertG.run(newId, req.params.id, defaultVenueId(), name,
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

app.patch('/api/events/:id/guests/:guestId', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM event_guests WHERE id=? AND event_id=?')
    .get(req.params.guestId, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Guest not found.' });
  const b = req.body; const now = nowIso();
  const fields = [], vals = [];
  const allowed = ['name','phone','email','guest_group','rsvp_status','adult_count','children_count',
    'dietary_notes','transport_needed','personal_message','table_id','gift_amount','accessibility','vip'];
  for (const f of allowed) { if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); } }
  if (b.dietary_presets !== undefined) { fields.push('dietary_presets=?'); vals.push(JSON.stringify(b.dietary_presets)); }
  if (!fields.length) return res.status(400).json({ error: 'No fields to update.' });
  fields.push('updated_at=?'); vals.push(now);
  db.prepare(`UPDATE event_guests SET ${fields.join(',')} WHERE id=?`).run(...vals, req.params.guestId);
  if (b.rsvp_status && b.rsvp_status !== existing.rsvp_status) {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_rsvp',
      `${existing.name} RSVP updated: ${b.rsvp_status}`, { guest: existing.name, status: b.rsvp_status });
  }
  const updated = db.prepare('SELECT * FROM event_guests WHERE id=?').get(req.params.guestId);
  res.json({ guest: guestRow(updated) });
});

app.delete('/api/events/:id/guests/:guestId', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const g = db.prepare('SELECT id,name FROM event_guests WHERE id=? AND event_id=?')
    .get(req.params.guestId, req.params.id);
  if (!g) return res.status(404).json({ error: 'Guest not found.' });
  db.prepare('DELETE FROM event_guests WHERE id=?').run(req.params.guestId);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_removed', `Guest removed: ${g.name}`);
  res.json({ ok: true });
});

app.post('/api/events/:id/guests/:guestId/checkin', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const g = db.prepare('SELECT * FROM event_guests WHERE id=? AND event_id=?')
    .get(req.params.guestId, req.params.id);
  if (!g) return res.status(404).json({ error: 'Guest not found.' });
  const now = nowIso();
  db.prepare(`UPDATE event_guests SET checked_in=1, checked_in_at=?, updated_at=? WHERE id=?`)
    .run(now, now, req.params.guestId);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_checkin',
    `${g.name} checked in`, { guest_id: g.id });
  res.json({ ok: true, checked_in_at: now });
});

// ── Tables / Seating ─────────────────────────────────────────────────────────

app.get('/api/events/:id/tables', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const tables = db.prepare('SELECT * FROM event_tables WHERE event_id=? ORDER BY table_number ASC')
    .all(req.params.id);
  const guests = db.prepare('SELECT id,name,rsvp_status,table_id FROM event_guests WHERE event_id=?')
    .all(req.params.id);
  const result = tables.map(t => ({
    ...tableRow(t),
    guests: guests.filter(g => g.table_id === t.id).map(g => ({ id: g.id, name: g.name, rsvp_status: g.rsvp_status })),
  }));
  res.json({ tables: result });
});

app.post('/api/events/:id/tables', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const b = req.body; const now = nowIso();
  const t = {
    id: id('etbl'), event_id: req.params.id, venue_id: defaultVenueId(),
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

app.patch('/api/events/:id/tables/:tableId', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM event_tables WHERE id=? AND event_id=?')
    .get(req.params.tableId, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Table not found.' });
  const b = req.body; const fields = [], vals = [];
  for (const f of ['table_number','capacity','shape','label','position_x','position_y']) {
    if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); }
  }
  if (!fields.length) return res.status(400).json({ error: 'No fields to update.' });
  db.prepare(`UPDATE event_tables SET ${fields.join(',')} WHERE id=?`).run(...vals, req.params.tableId);
  const updated = db.prepare('SELECT * FROM event_tables WHERE id=?').get(req.params.tableId);
  res.json({ table: tableRow(updated) });
});

app.delete('/api/events/:id/tables/:tableId', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  if (!db.prepare('SELECT id FROM event_tables WHERE id=? AND event_id=?').get(req.params.tableId, req.params.id)) {
    return res.status(404).json({ error: 'Table not found.' });
  }
  db.prepare('UPDATE event_guests SET table_id=NULL WHERE table_id=?').run(req.params.tableId);
  db.prepare('DELETE FROM event_tables WHERE id=?').run(req.params.tableId);
  res.json({ ok: true });
});

app.post('/api/events/:id/tables/assign', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const { guest_id, table_id } = req.body;
  if (!guest_id) return res.status(400).json({ error: 'guest_id required.' });
  const g = db.prepare('SELECT * FROM event_guests WHERE id=? AND event_id=?')
    .get(guest_id, req.params.id);
  if (!g) return res.status(404).json({ error: 'Guest not found.' });
  const now = nowIso();
  db.prepare('UPDATE event_guests SET table_id=?, updated_at=? WHERE id=?').run(table_id || null, now, guest_id);
  if (table_id) {
    db.prepare(`INSERT INTO event_guest_table_assignments (id,event_id,guest_id,table_id,assigned_by,assigned_at) VALUES (?,?,?,?,?,?)`)
      .run(id('egta'), req.params.id, guest_id, table_id, req.user.full_name, now);
    const tbl = db.prepare('SELECT table_number FROM event_tables WHERE id=?').get(table_id);
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_seated',
      `${g.name} assigned to Table ${tbl?.table_number ?? '?'}`, { guest_id, table_id });
  } else {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'guest_unseated',
      `${g.name} removed from table`);
  }
  res.json({ ok: true });
});

// ── Tasks ────────────────────────────────────────────────────────────────────

app.get('/api/events/:id/tasks', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const rows = db.prepare('SELECT * FROM event_tasks WHERE event_id=? ORDER BY due_date ASC, created_at ASC')
    .all(req.params.id);
  res.json({ tasks: rows.map(taskRow) });
});

app.post('/api/events/:id/tasks', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const b = req.body; const now = nowIso();
  const t = {
    id: id('etask'), event_id: req.params.id, venue_id: defaultVenueId(),
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

app.patch('/api/events/:id/tasks/:taskId', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM event_tasks WHERE id=? AND event_id=?')
    .get(req.params.taskId, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found.' });
  const b = req.body; const now = nowIso(); const fields = [], vals = [];
  for (const f of ['title','assigned_role','due_date','status','notes']) {
    if (b[f] !== undefined) { fields.push(`${f}=?`); vals.push(b[f]); }
  }
  fields.push('updated_at=?'); vals.push(now);
  db.prepare(`UPDATE event_tasks SET ${fields.join(',')} WHERE id=?`).run(...vals, req.params.taskId);
  if (b.status === 'done' && existing.status !== 'done') {
    addTimeline(req.params.id, req.user.full_name, req.user.role, 'task_completed',
      `Task completed: ${existing.title}`);
  }
  const updated = db.prepare('SELECT * FROM event_tasks WHERE id=?').get(req.params.taskId);
  res.json({ task: taskRow(updated) });
});

// ── Timeline ─────────────────────────────────────────────────────────────────

app.get('/api/events/:id/timeline', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const rows = db.prepare('SELECT * FROM event_timeline WHERE event_id=? ORDER BY created_at ASC')
    .all(req.params.id);
  res.json({ timeline: rows.map(timelineRow) });
});

// ── Messages ─────────────────────────────────────────────────────────────────

app.get('/api/events/:id/messages', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const rows = db.prepare('SELECT * FROM event_messages WHERE event_id=? ORDER BY created_at DESC')
    .all(req.params.id);
  res.json({ messages: rows });
});

app.post('/api/events/:id/messages', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
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
      db.prepare('UPDATE event_guests SET invitation_sent_at=? WHERE id=?').run(now, r.guest_id);
    }
  }
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'message_sent',
    `${inserted.length} ${b.template_type || 'custom'} message(s) sent via ${b.channel || 'whatsapp'}`);
  res.status(201).json({ sent: inserted.length });
});

// ── Cocktail Menus ────────────────────────────────────────────────────────────

app.get('/api/events/:id/cocktail-menu', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const row = db.prepare('SELECT * FROM event_cocktail_menus WHERE event_id=?').get(req.params.id);
  if (!row) return res.json({ menu: null });
  res.json({ menu: { id: row.id, menu_name: row.menu_name, cocktails: JSON.parse(row.menu_json), status: row.status } });
});

app.post('/api/events/:id/cocktail-menu', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const { menu_name, cocktails } = req.body;
  if (!Array.isArray(cocktails) || !cocktails.length) return res.status(400).json({ error: 'cocktails array required.' });
  const now = nowIso();
  const existing = db.prepare('SELECT id FROM event_cocktail_menus WHERE event_id=?').get(req.params.id);
  const menuId = existing ? existing.id : id('ecm');
  db.prepare(`
    INSERT INTO event_cocktail_menus (id,event_id,venue_id,menu_name,menu_json,status,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,'draft',?,?,?)
    ON CONFLICT(event_id) DO UPDATE SET menu_name=excluded.menu_name, menu_json=excluded.menu_json, status='draft', updated_at=excluded.updated_at
  `).run(menuId, req.params.id, defaultVenueId(), menu_name || null, JSON.stringify(cocktails), req.user.full_name, now, now);
  const row = db.prepare('SELECT * FROM event_cocktail_menus WHERE event_id=?').get(req.params.id);
  res.status(201).json({ menu: { id: row.id, menu_name: row.menu_name, cocktails: JSON.parse(row.menu_json), status: row.status } });
});

app.patch('/api/events/:id/cocktail-menu/approve', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const existing = db.prepare('SELECT id FROM event_cocktail_menus WHERE event_id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No cocktail menu found for this event.' });
  const now = nowIso();
  db.prepare("UPDATE event_cocktail_menus SET status='approved', updated_at=? WHERE event_id=?").run(now, req.params.id);
  addTimeline(req.params.id, req.user.full_name, req.user.role, 'cocktail_menu_approved', 'Cocktail menu approved');
  res.json({ ok: true });
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

app.get('/api/notifications', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  const rows = db.prepare(
    `SELECT * FROM notifications WHERE venue_id=? AND target_role=? ORDER BY created_at DESC LIMIT 50`
  ).all(defaultVenueId(), req.user.role);
  res.json({ notifications: rows });
});

app.patch('/api/notifications/:id/read', requireAuth('manager', 'bar_manager', 'owner', 'admin'), (req, res) => {
  db.prepare('UPDATE notifications SET read=1 WHERE id=? AND venue_id=?').run(req.params.id, defaultVenueId());
  res.json({ ok: true });
});

// ── Guest portal SPA route (production) ──────────────────────────────────────
app.get('/event/:token/guest', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HESTIA backend running on http://localhost:${PORT}`);
  console.log(`HESTIA SQLite database: ${DB_PATH}`);
});
