import express from "express";
import dotenv from "dotenv";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "hospia.sqlite");

mkdirSync(DATA_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;
const MODEL = process.env.MODEL || "gemini-1.5-flash";
const db = new DatabaseSync(DB_PATH);

const ACCESS_CODES = {
  EMP123: { role: "employee", name: "Employee User" },
  MNG123: { role: "manager", name: "Manager User" },
  OWN123: { role: "owner", name: "Owner User" }
};

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
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,X-HOSPIA-Role");

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

seedDatabase();

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
  const existingVenue = db.prepare("SELECT id FROM venues WHERE id = ?").get(defaultVenueId());
  if (!existingVenue) {
    db.prepare("INSERT INTO venues (id, name, venue_type, created_at) VALUES (?, ?, ?, ?)").run(
      defaultVenueId(),
      "HESTIA Flagship Venue",
      "premium-restaurant-events",
      nowIso()
    );
  }

  for (const [code, user] of Object.entries(ACCESS_CODES)) {
    const userId = `${user.role}-demo`;
    const existingUser = db.prepare("SELECT id FROM users WHERE access_code = ?").get(code);
    if (!existingUser) {
      db.prepare("INSERT INTO users (id, venue_id, name, role, access_code, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        userId,
        defaultVenueId(),
        user.name,
        user.role,
        code,
        nowIso()
      );
    }
  }

}

function roleFromRequest(req) {
  return req.header("X-HOSPIA-Role") || req.body?.role || req.query?.role || "";
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = roleFromRequest(req);
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: "Forbidden",
        required: allowedRoles,
        received: role || "none"
      });
    }
    req.hospiaRole = role;
    next();
  };
}

// Exact-user gate for verified price endpoints.
// Checks X-HESTIA-User header in addition to role.
// Frontend canAccessBottlePrices() (by username) is still the primary gate.
// This is still local-app trust only — the header is set by the frontend and is
// not cryptographically signed. Future real auth must verify identity server-side.
const VERIFIED_PRICE_ALLOWED_USERS = ['omer sadot', 'toam griffel', 'tal millo'];

function requireVerifiedPriceAccess(req, res, next) {
  const role = roleFromRequest(req);
  if (!['bar_manager', 'owner', 'admin'].includes(role)) {
    return res.status(403).json({ error: "Forbidden.", required: ['bar_manager', 'owner', 'admin'], received: role || 'none' });
  }
  const username = (req.header('X-HESTIA-User') || '').toLowerCase().trim();
  if (!username || !VERIFIED_PRICE_ALLOWED_USERS.includes(username)) {
    return res.status(403).json({ error: "Access denied. Verified price endpoints require authorized user identity.", received: username || 'none' });
  }
  req.hospiaRole = role;
  req.verifiedPriceUser = username;
  next();
}

function reportRow(row) {
  return {
    id: row.id,
    shift_date: row.shift_date,
    manager_name: row.manager_name || "",
    shift_summary: row.shift_summary || "",
    complaints: row.complaints || "",
    service_recovery: row.service_recovery || "",
    staff_issues: row.staff_issues || "",
    sales_notes: row.sales_notes || "",
    urgent_items: row.urgent_items || "",
    submitted_at: row.submitted_at
  };
}

function actionRow(row) {
  return {
    ...row,
    done: Boolean(row.done)
  };
}

async function askGemini(prompt) {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PASTE_KEY_HERE') {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM}\n\n${prompt}` }] }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.log("GEMINI ERROR:", data);
    throw new Error(data.error?.message || "Gemini request failed.");
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer generated.";
}

app.post("/api/gemini", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const answer = await askGemini(prompt);
    res.json({ answer });
  } catch (error) {
    console.log("GEMINI PROXY ERROR:", error);
    res.status(500).json({ error: error.message || "Gemini request failed." });
  }
});

app.post("/api/session/login", (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const user = db.prepare("SELECT id, name, role FROM users WHERE access_code = ?").get(code);

  if (!user) {
    return res.status(401).json({ error: "Invalid access code." });
  }

  res.json({
    ok: true,
    user,
    role: user.role
  });
});

app.get("/api/shift-reports", requireRole("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM shift_reports
    WHERE venue_id = ?
    ORDER BY submitted_at DESC
    LIMIT 50
  `).all(defaultVenueId());

  res.json({ reports: rows.map(reportRow) });
});

app.post("/api/shift-reports", requireRole("manager", "bar_manager", "admin"), (req, res) => {
  const report = {
    id: id("eod"),
    venue_id: defaultVenueId(),
    shift_date: String(req.body.shift_date || new Date().toISOString().slice(0, 10)),
    manager_name: String(req.body.manager_name || ""),
    shift_summary: String(req.body.shift_summary || ""),
    complaints: String(req.body.complaints || ""),
    service_recovery: String(req.body.service_recovery || ""),
    staff_issues: String(req.body.staff_issues || ""),
    sales_notes: String(req.body.sales_notes || ""),
    urgent_items: String(req.body.urgent_items || ""),
    submitted_at: nowIso()
  };

  db.prepare(`
    INSERT INTO shift_reports (
      id, venue_id, shift_date, manager_name, shift_summary, complaints,
      service_recovery, staff_issues, sales_notes, urgent_items, submitted_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    report.id,
    report.venue_id,
    report.shift_date,
    report.manager_name,
    report.shift_summary,
    report.complaints,
    report.service_recovery,
    report.staff_issues,
    report.sales_notes,
    report.urgent_items,
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

app.get("/api/business-memory", requireRole("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT type, title, detail, event_date AS date, created_at
    FROM business_memory
    WHERE venue_id = ?
    ORDER BY created_at DESC
    LIMIT 80
  `).all(defaultVenueId());

  res.json({ memory: rows });
});

app.get("/api/actions", requireRole("manager", "bar_manager", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT id, priority, title, owner, due, signal, page, done, created_at, updated_at
    FROM actions
    WHERE venue_id = ?
    ORDER BY done ASC, created_at DESC
  `).all(defaultVenueId());

  res.json({ actions: rows.map(actionRow) });
});

app.post("/api/actions", requireRole("manager", "bar_manager", "admin"), (req, res) => {
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

app.patch("/api/actions/:id", requireRole("manager", "bar_manager", "admin"), (req, res) => {
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

app.get("/api/incidents", requireRole("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT id, venue_id, type, description, table_number, resolved, resolution,
           compensation, reported_by, shift_date, created_at,
           severity, root_cause, resolved_at, updated_at, shift_id
    FROM incidents WHERE venue_id = ? ORDER BY created_at DESC LIMIT 100
  `).all(defaultVenueId());
  res.json({ incidents: rows.map(r => ({ ...r, resolved: Boolean(r.resolved) })) });
});

app.post("/api/incidents", requireRole("manager", "bar_manager", "employee", "admin"), (req, res) => {
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

app.patch("/api/incidents/:id", requireRole("manager", "bar_manager", "admin"), (req, res) => {
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

app.post("/api/business-memory", requireRole("manager", "bar_manager", "owner", "admin"), (req, res) => {
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

app.get("/api/notes", requireRole("manager", "bar_manager", "admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM notes WHERE venue_id = ? AND archived = 0 ORDER BY pinned DESC, created_at DESC LIMIT 50
  `).all(defaultVenueId());
  res.json({ notes: rows.map(r => ({ ...r, pinned: Boolean(r.pinned), archived: Boolean(r.archived) })) });
});

app.post("/api/notes", requireRole("manager", "bar_manager", "admin"), (req, res) => {
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

app.patch("/api/notes/:id", requireRole("manager", "bar_manager", "admin"), (req, res) => {
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

app.post("/api/event-plans", requireRole("manager", "owner", "admin"), (req, res) => {
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

app.get("/api/event-plans", requireRole("manager", "owner", "admin"), (req, res) => {
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

app.post("/api/analyze", requireRole("manager", "bar_manager", "owner", "admin"), async (req, res) => {
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

app.get("/api/users", requireRole("manager", "bar_manager", "owner", "admin"), (req, res) => {
  const rows = db.prepare("SELECT * FROM hospia_users ORDER BY created_at ASC").all();
  res.json({ users: rows.map(huspiaUserRow) });
});

app.post("/api/users", requireRole("owner", "admin"), (req, res) => {
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

app.patch("/api/users/:id", requireRole("owner", "admin"), (req, res) => {
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

  const now = nowIso();
  db.prepare(`
    INSERT OR REPLACE INTO verified_price_overrides
      (product_id, venue_id, normalized_update_json, saved_by, saved_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(product_id, defaultVenueId(), json, String(savedBy || ""), now);

  res.status(201).json({ ok: true, product_id, saved_at: now });
});

app.delete("/api/verified-price-overrides/:product_id", requireVerifiedPriceAccess, (req, res) => {
  const { product_id } = req.params;
  db.prepare(`
    DELETE FROM verified_price_overrides WHERE product_id = ? AND venue_id = ?
  `).run(product_id, defaultVenueId());
  res.json({ ok: true, product_id });
});

app.listen(PORT, () => {
  console.log(`HESTIA backend running on http://localhost:${PORT}`);
  console.log(`HESTIA SQLite database: ${DB_PATH}`);
});
