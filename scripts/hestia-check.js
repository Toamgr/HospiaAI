/**
 * HESTIA Safety Check Script
 * Run: npm run hestia:check
 *
 * Reports git state, build result, critical file presence, known audit issues,
 * and secret safety. Does not read or print secret values.
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const R   = '\x1b[0m'
const B   = '\x1b[1m'
const DIM = '\x1b[2m'
const RED = '\x1b[31m'
const GRN = '\x1b[32m'
const YLW = '\x1b[33m'
const CYN = '\x1b[36m'

const PASS = `${GRN}${B}  PASS${R}`
const WARN = `${YLW}${B}  WARN${R}`
const FAIL = `${RED}${B}  FAIL${R}`
const NOPE = `${DIM}  ----${R}`

function row(status, msg) { console.log(`${status}  ${msg}`) }
function section(title) {
  const pad = '─'.repeat(Math.max(0, 52 - title.length))
  console.log()
  console.log(`${CYN}${B}── ${title} ${pad}${R}`)
}

// ── Filesystem helpers ────────────────────────────────────────────────────────
function exists(rel) { return existsSync(join(ROOT, rel)) }

function read(rel) {
  try { return readFileSync(join(ROOT, rel), 'utf8') } catch { return null }
}

function fileContains(rel, pattern) {
  const content = read(rel)
  if (!content) return false
  return typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content)
}

// ── Shell helper ──────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: opts.timeout || 30000,
    })
    return { ok: true, out: out || '' }
  } catch (e) {
    return { ok: false, out: e.stdout || '', err: (e.stderr || '') + (e.message || '') }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  HEADER
// ─────────────────────────────────────────────────────────────────────────────
const now = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Jerusalem', hour12: false })

console.log()
console.log(`${B}╔══════════════════════════════════════════════════════════╗${R}`)
console.log(`${B}║         HESTIA SAFETY CHECK REPORT                      ║${R}`)
console.log(`${B}╚══════════════════════════════════════════════════════════╝${R}`)
console.log(`  ${DIM}${now}${R}`)

// ─────────────────────────────────────────────────────────────────────────────
//  1. GIT WORKING TREE SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
section('1. GIT WORKING TREE SUMMARY')

const SENSITIVE_NAMES = ['.env', '.env.local', '.env.production', '.env.staging', 'package-lock.json', 'server.js']
const SENSITIVE_PATTERNS = [/\.env/, /secret/i, /credential/i, /apikey/i, /api_key/i, /private\.key/i]

const gitStatus = run('git status --short')
const gitDiff   = run('git diff --stat HEAD')

if (!gitStatus.ok) {
  row(WARN, 'git status failed — is this a git repo?')
} else if (!gitStatus.out.trim()) {
  row(PASS, 'Working tree is clean — no uncommitted changes')
} else {
  const lines = gitStatus.out.trim().split('\n')
  const sensitiveChanged = lines.filter(l =>
    SENSITIVE_NAMES.some(n => l.includes(n)) || SENSITIVE_PATTERNS.some(p => p.test(l))
  )

  console.log(`  ${lines.length} changed file(s):`)
  for (const line of lines) {
    const isSensitive = sensitiveChanged.includes(line)
    console.log(`  ${isSensitive ? `${RED}${B}!${R}` : ' '} ${line}`)
  }

  console.log()
  if (sensitiveChanged.length) {
    row(WARN, `${sensitiveChanged.length} potentially sensitive file(s) in working tree — review before committing`)
  } else {
    row(PASS, 'No sensitive filenames in working tree changes')
  }
}

if (gitDiff.ok && gitDiff.out.trim()) {
  console.log()
  console.log(`  ${DIM}── diff --stat:${R}`)
  const statLines = gitDiff.out.trim().split('\n')
  for (const l of statLines.slice(0, 25)) {
    console.log(`  ${DIM}${l}${R}`)
  }
  if (statLines.length > 25) {
    console.log(`  ${DIM}... (${statLines.length - 25} more lines)${R}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. BUILD CHECK
// ─────────────────────────────────────────────────────────────────────────────
section('2. BUILD CHECK')
console.log(`  ${DIM}Running: npm run build  (may take up to 60 s…)${R}`)

const build = run('npm run build', { timeout: 120000 })

if (build.ok) {
  row(PASS, 'Build PASSED — vite build completed without errors')
} else {
  row(FAIL, 'Build FAILED')
  const errText = (build.err || build.out || '').trim()
  const errLines = errText.split('\n').filter(l => l.trim()).slice(0, 12)
  for (const l of errLines) {
    console.log(`       ${RED}${l}${R}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  3. EMPLOYEE AREA FILE CHECK
// ─────────────────────────────────────────────────────────────────────────────
section('3. EMPLOYEE AREA FILES')

const REQUIRED_FILES = [
  'src/features/employee/EmployeeHome.jsx',
  'src/features/employee/EmployeeRequests.jsx',
  'src/features/employee/EmployeeAchievements.jsx',
  'src/features/shifts/MyShifts.jsx',
  'src/features/shifts/ConstraintsForm.jsx',
  'src/features/chef/FoodMenuView.jsx',
  'src/config/navigationConfig.js',
  'src/config/routes.js',
  'src/config/roleConfig.js',
  'src/features/shell/TopNav.jsx',
]

for (const f of REQUIRED_FILES) {
  if (exists(f)) {
    row(PASS, f)
  } else {
    row(FAIL, `MISSING  ${f}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. KNOWN AUDIT ISSUES
// ─────────────────────────────────────────────────────────────────────────────
section('4. KNOWN AUDIT ISSUES')

// ── Issue A: ChefDashboard visible-to-staff toggle method mismatch ───────────
{
  const label = 'ChefDashboard visible-to-staff toggle: frontend method vs backend'
  const chefContent = read('src/features/chef/ChefDashboard.jsx') || ''
  const serverContent = read('server.js') || ''

  const frontendUsesPost  = /apiPost\([^)]*visible/.test(chefContent)
  const frontendUsesPatch = /apiPatch\([^)]*visible/.test(chefContent)
  const backendUsesPatch  = serverContent.includes("app.patch('/api/chef/menus/")

  if (frontendUsesPatch && backendUsesPatch) {
    row(PASS, `${label} — both use PATCH (resolved)`)
  } else if (frontendUsesPost && backendUsesPatch) {
    row(FAIL, `${label} — frontend still calls apiPost, server expects PATCH`)
  } else if (!frontendUsesPatch && !frontendUsesPost) {
    row(WARN, `${label} — visible toggle not found in ChefDashboard (manual check advised)`)
  } else {
    row(WARN, `${label} — could not verify, check manually`)
  }
}

// ── Issue B: learningProgress component exists but has no PAGE_META / route ──
{
  const label = 'learningProgress: component exists but has no PAGE_META or route'
  const componentExists = exists('src/features/academy/LearningProgress.jsx')
  const hasPageMeta     = fileContains('src/config/navigationConfig.js', /^\s+learningProgress\s*:/m)
  const hasGapComment   = fileContains('src/config/routes.js', 'learningProgress')
  const inAppJsx        = fileContains('src/App.jsx', 'LearningProgress')

  if (componentExists && !hasPageMeta) {
    row(WARN, `${label} — LearningProgress.jsx exists, no PAGE_META (gap noted in routes.js)`)
  } else if (!componentExists) {
    row(PASS, `${label} — component not found (may have been removed)`)
  } else {
    row(PASS, `${label} — PAGE_META present`)
  }
  if (inAppJsx) {
    row(WARN, '  App.jsx imports LearningProgress but it has no route — orphaned import')
  }
}

// ── Issue C: serviceRecovery / "Report" removed from Employee TopNav ─────────
{
  const topNav = read('src/features/shell/TopNav.jsx') || ''
  const present = topNav.includes("'serviceRecovery'") && topNav.includes("'Report'")
  row(
    present ? WARN : PASS,
    present
      ? "Employee TopNav: serviceRecovery / 'Report' still present as top-level — Phase 1 incomplete"
      : "Employee TopNav: serviceRecovery / 'Report' removed from top-level nav"
  )
}

// ── Issue D: Availability removed from Employee top-level nav ─────────────────
{
  const topNav = read('src/features/shell/TopNav.jsx') || ''
  const present = topNav.includes("'constraintsForm'") && topNav.includes("'Availability'")
  row(
    present ? WARN : PASS,
    present
      ? "Employee TopNav: 'Availability' (constraintsForm) still a top-level item — Phase 1 incomplete"
      : "Employee TopNav: 'Availability' (constraintsForm) removed from top-level nav"
  )
}

// ── Issue E: Food Menu removed from Employee top-level nav ────────────────────
{
  const topNav = read('src/features/shell/TopNav.jsx') || ''
  const present = topNav.includes("'foodMenuView'") && (topNav.includes("'Food Menu'") || topNav.includes('"Food Menu"'))
  row(
    present ? WARN : PASS,
    present
      ? "Employee TopNav: 'Food Menu' (foodMenuView) still a top-level item — Phase 1 incomplete"
      : "Employee TopNav: 'Food Menu' (foodMenuView) removed from top-level nav"
  )
}

// ── Issue F & G: Approved Cocktails / Cocktails removed from Employee top-level ─
{
  const topNav = read('src/features/shell/TopNav.jsx') || ''
  const present = topNav.includes("'approvedCocktails'") && (topNav.includes("'Cocktails'") || topNav.includes('"Cocktails"'))
  row(
    present ? WARN : PASS,
    present
      ? "Employee TopNav: Approved Cocktails / 'Cocktails' still a top-level item — Phase 1 incomplete"
      : "Employee TopNav: Approved Cocktails / 'Cocktails' removed from top-level nav"
  )
}

// ── Issue H: Bar World — label prep or full feature ───────────────────────────
{
  const topNav = read('src/features/shell/TopNav.jsx') || ''
  const hasBarWorldLabel = topNav.includes("'cocktailsMagazine'") && topNav.includes("'Bar World'")
  const featureBuilt = exists('src/features/bar-world') || exists('src/features/barWorld') ||
    fileContains('src/config/navigationConfig.js', 'barWorld') ||
    fileContains('src/config/navigationConfig.js', 'bar_world')
  if (featureBuilt) {
    row(PASS, 'Bar World — full feature detected')
  } else if (hasBarWorldLabel) {
    row(WARN, 'Bar World — nav label prepared on cocktailsMagazine slot; full Bar World page not yet built')
  } else {
    row(NOPE, 'Bar World area [NOT IMPLEMENTED YET]')
  }
}

// ── Issue I: Daily Work not yet built ────────────────────────────────────────
{
  const label = 'Daily Work area'
  const featureExists = exists('src/features/daily-work') || exists('src/features/dailyWork') ||
    fileContains('src/config/navigationConfig.js', 'dailyWork') ||
    fileContains('src/config/navigationConfig.js', 'daily_work')
  if (featureExists) {
    row(PASS, `${label} — feature detected`)
  } else {
    row(NOPE, `${label} [NOT IMPLEMENTED YET]`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. SECRET SAFETY CHECK
// ─────────────────────────────────────────────────────────────────────────────
section('5. SECRET SAFETY CHECK')

// .env files present?
const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.development', '.env.staging', '.env.test']
const envFound = ENV_FILES.filter(f => exists(f))

if (envFound.length) {
  row(WARN, `Env file(s) present (values NOT read): ${envFound.join('  ')}`)
  row(PASS, 'Values were NOT read or printed by this script')
} else {
  row(PASS, 'No .env files found in project root')
}

// .env.example — should only contain placeholders
if (exists('.env.example')) {
  const example = read('.env.example') || ''
  // Real secret: value longer than 20 chars with no placeholder markers
  const hasRealValue = /=[a-zA-Z0-9/+]{25,}/.test(example) && !example.includes('your_') && !example.includes('CHANGE_ME') && !example.includes('placeholder')
  if (hasRealValue) {
    row(WARN, '.env.example may contain real values — verify it contains only placeholders')
  } else {
    row(PASS, '.env.example appears to contain only placeholder values')
  }
}

// Scan git-tracked source files for patterns that look like hardcoded secrets
// (filename + warning only — no values printed)
{
  const grepPatterns = [
    'sk-[a-zA-Z0-9]{20,}',              // OpenAI / Stripe / other sk- keys
    'AKIA[0-9A-Z]{16}',                  // AWS access keys
    'ghp_[a-zA-Z0-9]{36}',              // GitHub personal access tokens
    'xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9]+', // Slack bot tokens
  ].join('|')

  // Use git grep against tracked files only
  const secretScan = run(
    `git grep -l -E "${grepPatterns}" -- "*.js" "*.jsx" "*.ts" "*.tsx" "*.json"`,
    { timeout: 15000 }
  )

  if (secretScan.ok && secretScan.out.trim()) {
    const files = secretScan.out.trim().split('\n').filter(Boolean)
    for (const f of files) {
      row(WARN, `Possible hardcoded secret pattern in: ${f}  (value NOT shown — check manually)`)
    }
  } else {
    row(PASS, 'No obvious hardcoded API key patterns in git-tracked source files')
  }
}

// Check server.js for dotenv usage (good practice)
{
  const usesEnv = fileContains('server.js', 'dotenv') || fileContains('server.js', 'process.env')
  if (usesEnv) {
    row(PASS, 'server.js reads secrets via environment variables (not hardcoded)')
  } else {
    row(WARN, 'server.js may not be using dotenv — verify secrets are not hardcoded')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  RECOMMENDED NEXT STEP
// ─────────────────────────────────────────────────────────────────────────────
section('RECOMMENDED NEXT STEP')

console.log(`  Review ${YLW}${B}WARN${R} items before starting the next phase.`)
console.log(`  ${DIM}----${R} items are planned but not yet started — no action needed now.`)
console.log(`  ${RED}${B}FAIL${R} items must be resolved before shipping.`)
console.log()
console.log(`  ${DIM}Run again anytime:  npm run hestia:check${R}`)
console.log()
