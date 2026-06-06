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

// ── My Shifts removed from Employee top-level nav (accessible via Daily Work) ──
{
  const topNav = read('src/features/shell/TopNav.jsx') || ''
  const present = topNav.includes("'myShifts'") && topNav.includes("'My Shifts'")
  row(
    present ? WARN : PASS,
    present
      ? "Employee TopNav: 'My Shifts' still a top-level item — should be accessed via Daily Work"
      : "Employee TopNav: 'My Shifts' removed from top-level (accessible via Daily Work)"
  )
}

// ── Requests removed from Employee top-level nav (accessible via Daily Work) ───
{
  const topNav = read('src/features/shell/TopNav.jsx') || ''
  const present = topNav.includes("'employeeRequests'") && topNav.includes("'Requests'")
  row(
    present ? WARN : PASS,
    present
      ? "Employee TopNav: 'Requests' (employeeRequests) still a top-level item — should be accessed via Daily Work"
      : "Employee TopNav: 'Requests' (employeeRequests) removed from top-level (accessible via Daily Work)"
  )
}

// ── Issue H: Bar World — component, routing, and content ──────────────────────
{
  const barWorldContent = read('src/features/employee/BarWorld.jsx') || ''
  const componentExists = exists('src/features/employee/BarWorld.jsx')
  const hasRoute    = fileContains('src/config/routes.js', 'barWorld')
  const hasPageMeta = fileContains('src/config/navigationConfig.js', /barWorld\s*:/)
  const inNav       = fileContains('src/features/shell/TopNav.jsx', "'barWorld'") ||
                      fileContains('src/features/employee/EmployeeNavRail.jsx', "'barWorld'")
  const hasBarCourse = barWorldContent.includes('Bar Course')
  const hasMagazine  = barWorldContent.includes('cocktailsMagazine') || barWorldContent.includes('Classic Cocktails')

  if (componentExists && hasRoute && hasPageMeta && inNav && hasBarCourse && hasMagazine) {
    row(PASS, 'Bar World — component, route, PAGE_META, nav entry, Bar Course and Classic Cocktails all present')
  } else if (componentExists && hasRoute && hasPageMeta && inNav) {
    row(WARN, 'Bar World — present but Bar Course or Classic Cocktails Magazine entry missing in BarWorld.jsx')
  } else if (!componentExists || !hasRoute || !hasPageMeta) {
    row(WARN, 'Bar World — missing component, route, or PAGE_META')
  } else {
    row(WARN, 'Bar World — nav entry not found in TopNav or EmployeeNavRail')
  }
}

// ── Issue I: Daily Work page ───────────────────────────────────────────────
{
  const componentExists = exists('src/features/employee/DailyWork.jsx')
  const hasRoute   = fileContains('src/config/routes.js', 'dailyWork')
  const hasPageMeta = fileContains('src/config/navigationConfig.js', /dailyWork\s*:/)
  const inNav      = fileContains('src/features/shell/TopNav.jsx', "'dailyWork'")

  if (componentExists && hasRoute && hasPageMeta && inNav) {
    row(PASS, 'Daily Work — component, route, PAGE_META, and nav entry all present')
  } else if (componentExists || hasRoute || hasPageMeta) {
    row(WARN, 'Daily Work — partially implemented (check component, route, PAGE_META, and nav)')
  } else {
    row(NOPE, 'Daily Work area [NOT IMPLEMENTED YET]')
  }
}

// ── Issue J: Employee Requests — new request type model ──────────────────────
{
  const reqFile = read('src/features/employee/EmployeeRequests.jsx') || ''
  const hasNewTypes = reqFile.includes('EMPLOYEE_REQUEST_TYPES') || reqFile.includes('Shift Swap')
  const hasOldCategories = reqFile.includes('REQUEST_CATEGORIES') || reqFile.includes('Bar Supply')

  if (hasNewTypes && !hasOldCategories) {
    row(PASS, 'EmployeeRequests — new request type model (Shift Swap, Day Off, etc.); old categories removed')
  } else if (hasOldCategories) {
    row(WARN, 'EmployeeRequests — old request categories (Bar Supply etc.) still present; Phase 4 incomplete')
  } else {
    row(NOPE, 'EmployeeRequests — request type model not yet updated [Phase 4]')
  }
}

// ── Issue K: Food Menu MVP dietary tags ───────────────────────────────────────
{
  const serverContent  = read('server.js') || ''
  const menuViewContent = read('src/features/chef/FoodMenuView.jsx') || ''

  const hasMigration   = serverContent.includes('ALTER TABLE food_dishes ADD COLUMN tags_json TEXT')
  const hasAllowedTags = serverContent.includes("ALLOWED_FOOD_TAGS = ['vegetarian', 'vegan', 'gluten_free']")
  const hasBroaderAllergens = /ALLOWED_FOOD_TAGS.*nuts|ALLOWED_FOOD_TAGS.*dairy|ALLOWED_FOOD_TAGS.*sesame/i.test(serverContent)
  const viewShowsTags  = menuViewContent.includes('dish.tags') && menuViewContent.includes('Gluten Free')

  if (hasMigration && hasAllowedTags && viewShowsTags && !hasBroaderAllergens) {
    row(PASS, 'Food Menu MVP tags — migration, allowed-tag guard, and FoodMenuView display present; no broader allergen list')
  } else if (!hasMigration) {
    row(WARN, 'Food Menu tags — food_dishes tags_json migration not found; Phase 5 incomplete')
  } else if (!hasAllowedTags) {
    row(WARN, 'Food Menu tags — ALLOWED_FOOD_TAGS guard missing; Phase 5 incomplete')
  } else if (!viewShowsTags) {
    row(WARN, 'Food Menu tags — FoodMenuView does not yet display tags; Phase 5 incomplete')
  } else if (hasBroaderAllergens) {
    row(WARN, 'Food Menu tags — broader allergen tags detected in ALLOWED_FOOD_TAGS; Phase 5 scope exceeded')
  } else {
    row(WARN, 'Food Menu tags — partial implementation; check migration, guard, and display')
  }
}

// ── Issue L: Employee published cocktail menu ─────────────────────────────────
{
  const componentExists = exists('src/features/employee/EmployeeCocktailMenu.jsx')
  const hasRoute        = fileContains('src/config/routes.js', 'employeeCocktailMenu')
  const dailyWorkFixed  = fileContains('src/features/employee/DailyWork.jsx', 'employeeCocktailMenu') &&
                          !fileContains('src/features/employee/DailyWork.jsx', "'approvedCocktails', sub: 'Approved bar programme'")
  const serverEndpoint  = fileContains('server.js', '/api/ci/menus/published')

  if (componentExists && hasRoute && dailyWorkFixed && serverEndpoint) {
    row(PASS, 'Employee cocktail menu — component, route, server endpoint, and Daily Work routing all present')
  } else if (!componentExists) {
    row(WARN, 'Employee cocktail menu — EmployeeCocktailMenu component not found; Phase 6 incomplete')
  } else if (!serverEndpoint) {
    row(WARN, 'Employee cocktail menu — /api/ci/menus/published endpoint not found; Phase 6 incomplete')
  } else if (!dailyWorkFixed) {
    row(WARN, 'Employee cocktail menu — Daily Work still routes Cocktail Menu to approvedCocktails placeholder; Phase 6 incomplete')
  } else {
    row(WARN, 'Employee cocktail menu — partially implemented; check component, route, server endpoint, and Daily Work')
  }
}

// ── Issue M: Chef menu type naming alignment ──────────────────────────────────
{
  const chefContent = read('src/features/chef/ChefDashboard.jsx') || ''
  const hasNewTypes        = chefContent.includes('daily_operations') && chefContent.includes('event_menu')
  const hasOldSelectOptions = /value="regular"|value="special"/.test(chefContent)
  const hasDisplayHelper   = chefContent.includes('displayMenuType')

  if (hasNewTypes && !hasOldSelectOptions && hasDisplayHelper) {
    row(PASS, 'Chef menu types — Daily Operations and Event Menu as creation options; legacy values handled by displayMenuType')
  } else if (!hasNewTypes) {
    row(WARN, 'Chef menu types — daily_operations / event_menu options not found in ChefDashboard; Phase 7 incomplete')
  } else if (hasOldSelectOptions) {
    row(WARN, 'Chef menu types — old option values (regular / special) still present as select options; Phase 7 incomplete')
  } else {
    row(WARN, 'Chef menu types — partial implementation; check option values and displayMenuType helper')
  }
}

// ── Issue N: Employee daily login popup ───────────────────────────────────────
{
  const componentContent  = read('src/features/employee/EmployeeDailyWelcome.jsx') || ''
  const appContent        = read('src/App.jsx') || ''
  const dailyWorkContent  = read('src/features/employee/DailyWork.jsx') || ''

  const componentExists    = exists('src/features/employee/EmployeeDailyWelcome.jsx')
  const checksEmployeeRole = componentContent.includes("role !== 'employee'") || componentContent.includes("role === 'employee'")
  const hasHestiaDay       = componentContent.includes('getHestiaDay') && componentContent.includes('getHours') && componentContent.includes('< 5')
  const usesStorage        = componentContent.includes('localStorage')
  // Phase 10 moved the popup from App.jsx into DailyWork.jsx — accept either location
  const wired              = appContent.includes('EmployeeDailyWelcome') || dailyWorkContent.includes('EmployeeDailyWelcome')

  if (componentExists && checksEmployeeRole && hasHestiaDay && usesStorage && wired) {
    row(PASS, 'Employee daily welcome popup — component present, role-gated, HESTIA day boundary, localStorage persistence')
  } else if (!componentExists) {
    row(NOPE, 'Employee daily welcome popup [NOT IMPLEMENTED YET — Phase 8]')
  } else if (!wired) {
    row(WARN, 'Employee daily welcome popup — component exists but not wired into App.jsx or DailyWork.jsx; Phase 8 incomplete')
  } else if (!checksEmployeeRole) {
    row(WARN, 'Employee daily welcome popup — missing employee role check; Phase 8 incomplete')
  } else if (!hasHestiaDay) {
    row(WARN, 'Employee daily welcome popup — HESTIA day 05:00 boundary not detected; Phase 8 incomplete')
  } else {
    row(WARN, 'Employee daily welcome popup — partial implementation; check role gate, day boundary, and localStorage')
  }
}

// ── Issue O: Employee Milestones / Rewards MVP ────────────────────────────────
{
  const achievementsContent = read('src/features/employee/EmployeeAchievements.jsx') || ''
  const dailyWorkContent    = read('src/features/employee/DailyWork.jsx') || ''

  const hasRewardTypes    = achievementsContent.includes('Free staff meal') &&
                            achievementsContent.includes('Shift preference') &&
                            achievementsContent.includes('Training certificate') &&
                            achievementsContent.includes('Bar tasting session') &&
                            achievementsContent.includes('Dinner')
  const hasMilestonesLabel = achievementsContent.includes("eyebrow=\"Milestones\"") ||
                             achievementsContent.includes("eyebrow='Milestones'")
  const noFakeFormula     = !achievementsContent.includes('* 0.58') &&
                            !achievementsContent.includes("'Reserve Ready'") &&
                            !achievementsContent.includes("'Floor Fluent'")
  const dailyWorkRoutes   = dailyWorkContent.includes('employeeAchievements')

  if (hasRewardTypes && hasMilestonesLabel && noFakeFormula && dailyWorkRoutes) {
    row(PASS, 'Employee Milestones — reward catalog present, Milestones label, no fake readiness formula, Daily Work routing intact')
  } else if (!hasRewardTypes) {
    row(WARN, 'Employee Milestones — approved reward types not found in EmployeeAchievements; Phase 9 incomplete')
  } else if (!hasMilestonesLabel) {
    row(WARN, 'Employee Milestones — Milestones eyebrow label missing; Phase 9 incomplete')
  } else if (!noFakeFormula) {
    row(WARN, 'Employee Milestones — fake readiness formula or invented level names still present; Phase 9 incomplete')
  } else {
    row(WARN, 'Employee Milestones — partial implementation; check reward types, label, and Daily Work routing')
  }
}

// ── Issue P: Employee Home two-world + left nav rail + popup trigger ──────────
{
  const homeContent      = read('src/features/employee/EmployeeHome.jsx') || ''
  const appContent       = read('src/App.jsx') || ''
  const dailyWorkContent = read('src/features/employee/DailyWork.jsx') || ''
  const railExists       = exists('src/features/employee/EmployeeNavRail.jsx')

  const hasAcademy             = homeContent.includes('Academy')
  const hasDailyWorkWorld      = homeContent.includes('Daily Work')
  const noReportAnIssue        = !homeContent.includes('Report An Issue')
  const noApprovedCocktailBubble = !homeContent.includes('Approved Cocktail Library')
  const noAchievementsBubble   = !homeContent.includes("label: 'Achievements'") && !homeContent.includes('label: "Achievements"')
  const popupNotInApp          = !appContent.includes('EmployeeDailyWelcome')
  const popupInDailyWork       = dailyWorkContent.includes('EmployeeDailyWelcome')

  const allPass = hasAcademy && hasDailyWorkWorld && noReportAnIssue &&
                  noApprovedCocktailBubble && noAchievementsBubble &&
                  popupNotInApp && popupInDailyWork && railExists

  if (allPass) {
    row(PASS, 'Employee Home — two-world structure, old bubbles removed, popup moved to Daily Work, nav rail present')
  } else if (!hasAcademy || !hasDailyWorkWorld) {
    row(WARN, 'Employee Home — two-world structure (Academy / Daily Work) not found; Phase 10 incomplete')
  } else if (!noReportAnIssue) {
    row(WARN, 'Employee Home — Report An Issue still present; Phase 10 incomplete')
  } else if (!noApprovedCocktailBubble) {
    row(WARN, 'Employee Home — Approved Cocktail Library bubble still present; Phase 10 incomplete')
  } else if (!popupNotInApp || !popupInDailyWork) {
    row(WARN, 'Employee Home — daily welcome popup not moved to Daily Work; Phase 10 incomplete')
  } else if (!railExists) {
    row(WARN, 'Employee Home — EmployeeNavRail not found; Phase 10 incomplete')
  } else {
    row(WARN, 'Employee Home — partial Phase 10 implementation; check structure, popup, and nav rail')
  }
}

// ── Issue Q: Employee Courses — bar/wine academy filter ───────────────────────
{
  const coursesContent = read('src/features/academy/Courses.jsx') || ''
  const hasBarFilter  = coursesContent.includes("'bar-academy'") && coursesContent.includes("'employee'")
  const hasWineFilter = coursesContent.includes("'wine-academy'") && coursesContent.includes("'employee'")

  if (hasBarFilter && hasWineFilter) {
    row(PASS, 'Employee Courses — bar-academy and wine-academy filtered for employee role (Bar World / Wine nav)')
  } else if (!hasBarFilter && !hasWineFilter) {
    row(WARN, 'Employee Courses — bar/wine academy employee filter not found in Courses.jsx; polish fix incomplete')
  } else {
    row(WARN, 'Employee Courses — partial filter; check both bar-academy and wine-academy exclusions for employee role')
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
