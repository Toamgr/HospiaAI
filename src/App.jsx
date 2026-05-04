import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  AlertTriangle,
  BadgePercent,
  Beer,
  Calculator,
  CalendarDays,
  ChefHat,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  GlassWater,
  Sparkles,
  Thermometer,
  Timer,
  Users,
  Utensils,
  Wine
} from 'lucide-react'

const STORAGE = {
  role: 'hospia.role',
  lang: 'hospia.lang',
  area: 'hospia.area',
  page: 'hospia.page',
  collapsed: 'hospia.sideCollapsed',
  reportArchive: 'hospia.endOfDayArchive'
}

const ACCESS_CODES = {
  EMP123: 'employee',
  MNG123: 'manager',
  OWN123: 'owner'
}

const EMAILJS = {
  serviceId: 'service_3aynt1u',
  templateId: 'template_edomb6l',
  publicKey: '9_nvy4wxBfxekXdkC',
  scriptUrl: 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

const NAV_GROUPS = {
  command: {
    roles: ['owner', 'manager'],
    pages: ['commandCenter']
  },
  operations: {
    roles: ['manager'],
    pages: ['actionBoard', 'eventOrchestrator', 'staffReadiness', 'serviceRecovery', 'endOfDay', 'operationalNotes', 'simulation']
  },
  academy: {
    roles: ['manager', 'employee'],
    pages: ['courses', 'lessonPlayer', 'sopSheets', 'knowledgeLibrary', 'learningProgress']
  },
  ownerIntelligence: {
    roles: ['owner'],
    pages: ['executiveOverview', 'businessMRI', 'profitLeaks', 'ownerReport', 'businessMemory', 'strategicRecommendations']
  },
  system: {
    roles: ['owner', 'manager', 'employee'],
    pages: ['settings']
  }
}

const PAGE_META = {
  commandCenter: { area: 'command', roles: ['owner', 'manager'], code: 'CC' },
  actionBoard: { area: 'operations', roles: ['manager'], code: 'AB' },
  eventOrchestrator: { area: 'operations', roles: ['manager'], code: 'EV' },
  staffReadiness: { area: 'operations', roles: ['manager'], code: 'SR' },
  serviceRecovery: { area: 'operations', roles: ['manager'], code: 'RC' },
  endOfDay: { area: 'operations', roles: ['manager'], code: 'ED' },
  operationalNotes: { area: 'operations', roles: ['manager'], code: 'ON' },
  simulation: { area: 'operations', roles: ['manager'], code: 'GS' },
  courses: { area: 'academy', roles: ['manager', 'employee'], code: 'CR' },
  lessonPlayer: { area: 'academy', roles: ['manager', 'employee'], code: 'LP' },
  sopSheets: { area: 'academy', roles: ['manager', 'employee'], code: 'SP' },
  knowledgeLibrary: { area: 'academy', roles: ['manager', 'employee'], code: 'KL' },
  learningProgress: { area: 'academy', roles: ['manager', 'employee'], code: 'LG' },
  executiveOverview: { area: 'ownerIntelligence', roles: ['owner'], code: 'EO' },
  businessMRI: { area: 'ownerIntelligence', roles: ['owner'], code: 'MR' },
  profitLeaks: { area: 'ownerIntelligence', roles: ['owner'], code: 'PL' },
  ownerReport: { area: 'ownerIntelligence', roles: ['owner'], code: 'OR' },
  businessMemory: { area: 'ownerIntelligence', roles: ['owner'], code: 'BM' },
  strategicRecommendations: { area: 'ownerIntelligence', roles: ['owner'], code: 'ST' },
  settings: { area: 'system', roles: ['owner', 'manager', 'employee'], code: 'SY' }
}

const TEXT = {
  en: {
    app: {
      name: 'HOSPIA',
      suffix: 'AI',
      tagline: 'Hospitality Intelligence OS',
      secureAccess: 'Secure Access',
      accessTitle: 'Enter your access code',
      accessBody: 'A role-based AI operating system for owners, managers, and hospitality teams.',
      codePlaceholder: 'EMP123 / MNG123 / OWN123',
      enter: 'Enter Platform',
      invalid: 'Invalid access code. Use EMP123, MNG123, or OWN123.',
      employee: 'Employee',
      manager: 'Manager',
      owner: 'Owner',
      language: 'Language',
      english: 'English',
      hebrew: 'Hebrew',
      logout: 'Logout',
      today: 'Today',
      valueIdentified: 'Value Identified'
    },
    areas: {
      command: 'Command Center',
      operations: 'Operations',
      academy: 'Academy',
      ownerIntelligence: 'Owner Intelligence',
      system: 'System'
    },
    areaDescriptions: {
      command: 'Live service and business command view',
      operations: 'Floor execution, recovery, and reporting',
      academy: 'Training, standards, SOPs, and knowledge',
      ownerIntelligence: 'Profit, leaks, memory, and strategy',
      system: 'Language, access, and preferences'
    },
    pages: {
      commandCenter: 'Command Center',
      actionBoard: 'Action Board',
      eventOrchestrator: 'Event Orchestrator',
      staffReadiness: 'Staff Readiness',
      serviceRecovery: 'Service Recovery',
      endOfDay: 'End Of Day Reports',
      operationalNotes: 'Operational Notes',
      simulation: 'Guest Simulation',
      courses: 'Courses',
      lessonPlayer: 'Lesson Player',
      sopSheets: 'SOP Sheets',
      knowledgeLibrary: 'Knowledge Library',
      learningProgress: 'Learning Progress',
      executiveOverview: 'Executive Overview',
      businessMRI: 'Business MRI',
      profitLeaks: 'Profit Leaks',
      ownerReport: 'Owner Report',
      businessMemory: 'Business Memory',
      strategicRecommendations: 'Strategic Recommendations',
      settings: 'Settings'
    },
    ui: {
      collapsePanel: 'Collapse panel',
      openPanel: 'Open panel',
      selectSection: 'Current Area',
      submitForm: 'Submit Form',
      submitting: 'Submitting...',
      reportSent: 'End Of Day Report sent successfully.',
      reportError: 'Could not send the report. Check EmailJS settings and try again.',
      continue: 'Continue',
      practice: 'Practice',
      quickQuiz: 'Quick Quiz',
      askCoach: 'Ask Coach',
      save: 'Save Settings'
    },
    fields: {
      shiftDate: 'Shift Date',
      managerName: 'Manager Name',
      shiftSummary: 'Shift Summary',
      complaints: 'Complaints',
      serviceRecovery: 'Service Recovery',
      staffIssues: 'Staff Issues',
      salesNotes: 'Sales Notes',
      urgentItems: 'Urgent Items'
    },
    copy: {
      commandTitle: 'Your venue needs attention in three areas before tonight.',
      commandBody: 'HOSPIA turns service signals into operational action before they become revenue loss.',
      ownerTitle: 'Executive business intelligence for hidden leaks.',
      managerTitle: 'Daily execution intelligence for the floor.',
      academyTitle: 'Curated hospitality standards for every role.',
      endOfDayBody: 'Submit a structured shift report directly through EmailJS.',
      settingsBody: 'Manage language, access, and local preferences.',
      doctrine: 'Hospitality is not a department. It is a standard of attention.',
      recommendedAction: 'Recommended Action',
      recentSignals: 'Recent Signals',
      aiRecommendations: 'AI Recommendations'
    }
  },
  he: {
    app: {
      name: 'HOSPIA',
      suffix: 'AI',
      tagline: 'מערכת בינה תפעולית לעולם האירוח',
      secureAccess: 'כניסה מאובטחת',
      accessTitle: 'הזן קוד גישה',
      accessBody: 'מערכת AI לפי הרשאות לבעלים, מנהלים וצוותי אירוח.',
      codePlaceholder: 'EMP123 / MNG123 / OWN123',
      enter: 'כניסה למערכת',
      invalid: 'קוד גישה שגוי. ניתן להשתמש ב-EMP123, MNG123 או OWN123.',
      employee: 'עובד',
      manager: 'מנהל',
      owner: 'בעלים',
      language: 'שפה',
      english: 'אנגלית',
      hebrew: 'עברית',
      logout: 'התנתקות',
      today: 'היום',
      valueIdentified: 'ערך מזוהה'
    },
    areas: {
      command: 'מרכז שליטה',
      operations: 'תפעול',
      academy: 'אקדמיה',
      ownerIntelligence: 'מודיעין בעלים',
      system: 'מערכת'
    },
    areaDescriptions: {
      command: 'תמונת מצב חיה של שירות ועסק',
      operations: 'ביצוע רצפה, שחזור ודיווח',
      academy: 'הכשרה, סטנדרטים, נהלים וידע',
      ownerIntelligence: 'רווח, דליפות, זיכרון ואסטרטגיה',
      system: 'שפה, גישה והעדפות'
    },
    pages: {
      commandCenter: 'מרכז שליטה',
      actionBoard: 'לוח פעולות',
      eventOrchestrator: 'תזמור אירועים',
      staffReadiness: 'מוכנות צוות',
      serviceRecovery: 'שחזור חוויית אורח',
      endOfDay: 'דוחות סוף יום',
      operationalNotes: 'הערות תפעוליות',
      simulation: 'סימולציית אורח',
      courses: 'קורסים',
      lessonPlayer: 'נגן שיעור',
      sopSheets: 'דפי נהלים',
      knowledgeLibrary: 'ספריית ידע',
      learningProgress: 'התקדמות למידה',
      executiveOverview: 'סקירת בעלים',
      businessMRI: 'MRI עסקי',
      profitLeaks: 'דליפות רווח',
      ownerReport: 'דוח בעלים',
      businessMemory: 'זיכרון עסקי',
      strategicRecommendations: 'המלצות אסטרטגיות',
      settings: 'הגדרות'
    },
    ui: {
      collapsePanel: 'סגירת תפריט',
      openPanel: 'פתיחת תפריט',
      selectSection: 'אזור נוכחי',
      submitForm: 'שליחת טופס',
      submitting: 'שולח...',
      reportSent: 'דוח סוף היום נשלח בהצלחה.',
      reportError: 'לא ניתן היה לשלוח את הדוח. בדוק את הגדרות EmailJS ונסה שוב.',
      continue: 'המשך',
      practice: 'תרגול',
      quickQuiz: 'בוחן קצר',
      askCoach: 'שאל את המאמן',
      save: 'שמירת הגדרות'
    },
    fields: {
      shiftDate: 'תאריך משמרת',
      managerName: 'שם מנהל',
      shiftSummary: 'סיכום משמרת',
      complaints: 'תלונות',
      serviceRecovery: 'שחזור שירות',
      staffIssues: 'בעיות צוות',
      salesNotes: 'הערות מכירה',
      urgentItems: 'נושאים דחופים'
    },
    copy: {
      commandTitle: 'העסק צריך תשומת לב בשלושה אזורים לפני הערב.',
      commandBody: 'HOSPIA מתרגמת איתותי שירות לפעולה תפעולית לפני שהם הופכים לאובדן הכנסה.',
      ownerTitle: 'מודיעין עסקי לבעלים שמזהה דליפות נסתרות.',
      managerTitle: 'מודיעין ביצוע יומי לרצפת השירות.',
      academyTitle: 'סטנדרטים מקצועיים לכל תפקיד במערכת.',
      endOfDayBody: 'שליחת דוח משמרת מובנה דרך EmailJS.',
      settingsBody: 'ניהול שפה, גישה והעדפות מקומיות.',
      doctrine: 'אירוח אינו מחלקה. אירוח הוא סטנדרט של תשומת לב.',
      recommendedAction: 'פעולה מומלצת',
      recentSignals: 'איתותים אחרונים',
      aiRecommendations: 'המלצות AI'
    }
  }
}

const COURSES = [
  {
    id: 1,
    progress: 72,
    title: { en: 'Guest Entrance & First Impression', he: 'כניסת אורח ורושם ראשוני' },
    category: { en: 'Service Excellence', he: 'מצוינות שירות' },
    desc: {
      en: 'Master the first ten seconds that shape the guest journey.',
      he: 'שליטה בעשר השניות הראשונות שמעצבות את חוויית האורח.'
    }
  },
  {
    id: 2,
    progress: 48,
    title: { en: 'Communication During Delays', he: 'תקשורת בזמן עיכובים' },
    category: { en: 'Delay Handling', he: 'ניהול עיכובים' },
    desc: {
      en: 'Turn waiting time into trust through proactive updates.',
      he: 'הפיכת זמן המתנה לאמון באמצעות עדכונים יזומים.'
    }
  },
  {
    id: 3,
    progress: 31,
    title: { en: 'Complaint Recovery', he: 'שחזור חוויית אורח' },
    category: { en: 'Guest Psychology', he: 'פסיכולוגיית אורח' },
    desc: {
      en: 'Repair trust when a service moment breaks.',
      he: 'תיקון אמון כשהחוויה נשברת.'
    }
  },
  {
    id: 4,
    progress: 86,
    title: { en: 'Natural Upselling', he: 'המלצה טבעית שמגדילה הכנסה' },
    category: { en: 'Revenue Through Care', he: 'הכנסה דרך אכפתיות' },
    desc: {
      en: 'Increase revenue without pressure by advising like a host.',
      he: 'הגדלת הכנסה בלי לחץ דרך המלצה של מארח מקצועי.'
    }
  }
]

const STAFF = [
  { name: 'Noa B.', role: 'Senior Server', progress: 95, simulation: 89, status: 'Certified', strong: 'Complaint Recovery', weak: 'Menu Depth', nextAction: 'Mentor Dana on recovery language' },
  { name: 'Yoav S.', role: 'Server', progress: 78, simulation: 81, status: 'Active', strong: 'First Impression', weak: 'Natural Upselling', nextAction: 'Complete beverage recommendation drill' },
  { name: 'Oren L.', role: 'Server', progress: 45, simulation: 63, status: 'Needs Coaching', strong: 'Delay Handling', weak: 'Complaint Recovery', nextAction: 'Run recovery simulation before Friday' },
  { name: 'Dana P.', role: 'New Hire', progress: 31, simulation: 55, status: 'At Risk', strong: 'Guest Greeting', weak: 'Complaint Recovery', nextAction: 'Manager one-on-one and SOP review' }
]

const ACTION_BOARD_ITEMS = [
  { id: 1, priority: 'urgent', title: 'Brief floor team on delay communication before dinner service', owner: 'Manager', due: 'Today 17:00', signal: 'Kitchen delays triggered 3 guest complaints last Friday', page: 'serviceRecovery', done: false },
  { id: 2, priority: 'urgent', title: 'Open coaching plan for Dana P. - At Risk status', owner: 'Manager', due: 'Today', signal: '31% academy progress and 55% simulation score', page: 'staffReadiness', done: false },
  { id: 3, priority: 'high', title: 'Run complaint recovery simulation with Oren and Dana', owner: 'Shift Lead', due: 'Tomorrow', signal: 'Recovery score below 70% for both staff members', page: 'simulation', done: false },
  { id: 4, priority: 'high', title: 'Submit End Of Day report with urgent items carried forward', owner: 'Closing Manager', due: 'Tonight', signal: 'Owner report depends on consistent shift memory', page: 'endOfDay', done: false },
  { id: 5, priority: 'normal', title: 'Assign Natural Upselling module to bar and floor team', owner: 'Manager', due: 'This week', signal: 'Beverage upsell leak estimated at NIS 6.2k per month', page: 'courses', done: true }
]

const PROFIT_LEAKS = [
  { category: 'Compensation before recovery script', monthly: 8400, weekly: 1960, risk: 'high', trend: '+12%', note: 'Staff comping items before attempting structured service recovery. This hides the operational issue and trains guests to expect financial resolution first.' },
  { category: 'Missed beverage upsell opportunities', monthly: 6200, weekly: 1440, risk: 'high', trend: '+8%', note: 'Most tables are not offered a second drink or pairing. Natural recommendation training can recover value without cheap sales pressure.' },
  { category: 'Kitchen delay unmanaged by floor', monthly: 4800, weekly: 1120, risk: 'medium', trend: '-4%', note: 'Guests tolerate delays better when informed early. Silent waiting converts into complaints, early departures, and dessert loss.' },
  { category: 'No farewell or return invitation', monthly: 3100, weekly: 720, risk: 'medium', trend: '+2%', note: 'Payment ends the transaction, but the farewell creates return intention. Generic checkout is a measurable loyalty leak.' },
  { category: 'Peak shift readiness below 70%', monthly: 2600, weekly: 605, risk: 'medium', trend: 'stable', note: 'Weekend shifts with undertrained staff create higher complaint rates and lower recovery quality.' },
  { category: 'Owner escalation without manager resolution', monthly: 1800, weekly: 420, risk: 'low', trend: '-6%', note: 'Improving, but each owner escalation erodes authority on the floor and increases compensation pressure.' }
]

const BUSINESS_MEMORY = [
  { date: '2026-05-03', type: 'alert', title: 'Delay communication failure - dinner service', detail: 'Three tables waited 35+ minutes without proactive update. Estimated preventable loss: NIS 420.' },
  { date: '2026-05-02', type: 'win', title: 'Noa completed full recovery certification', detail: 'Noa reached 95% course progress and 89% simulation score. Use as peer mentor for at-risk staff.' },
  { date: '2026-04-30', type: 'note', title: 'Beverage upsell conversion improved after training', detail: 'Second-drink recommendations rose after Natural Upselling module. Repeat briefing before weekend.' },
  { date: '2026-04-28', type: 'alert', title: 'Complaint escalated to owner', detail: 'Manager did not resolve a kitchen delay before owner intervention. Full meal comped.' },
  { date: '2026-04-27', type: 'note', title: 'End Of Day reporting streak reached 7 shifts', detail: 'Consistent reporting now gives enough signal to detect weekly operational patterns.' }
]

const SOP_SHEETS = [
  { id: 'arrival', code: 'SOP-01', title: 'Guest Arrival And Seating Protocol', category: 'Front Of House', standard: 'HOSPIA Standard 01', updated: '2026-05-01', steps: ['Acknowledge every entering guest within 10 seconds with eye contact and a calm welcome.', 'If occupied, signal acknowledgment immediately: "Welcome, I will be right with you."', 'Ask for the reservation name with hospitality language, not interrogation.', 'Escort guests at their pace and never abandon the handoff.', 'Open the first service moment before leaving the table.'], managerNote: 'The first impression determines emotional tolerance for the rest of the meal.' },
  { id: 'delay', code: 'SOP-02', title: 'Delay Communication Protocol', category: 'Service Recovery', standard: 'HOSPIA Standard 04', updated: '2026-05-01', steps: ['Update before the guest asks.', 'Give a specific time estimate when possible.', 'Own the experience without blaming the kitchen.', 'Offer comfort while they wait.', 'Return when promised, even if the update is not perfect.'], managerNote: 'A proactive update turns waiting into care. Silence turns waiting into resentment.' },
  { id: 'recovery', code: 'SOP-03', title: 'Complaint Recovery - Acknowledge, Own, Act', category: 'Recovery', standard: 'HOSPIA Standard 09', updated: '2026-05-02', steps: ['Listen fully without defense.', 'Acknowledge the emotion first.', 'Take ownership on behalf of the venue.', 'Offer a specific immediate solution.', 'Follow up within five minutes and log the event.'], managerNote: 'Compensation is not the first move. Trust repair is the first move.' },
  { id: 'upsell', code: 'SOP-04', title: 'Natural Upselling And Menu Guidance', category: 'Revenue Through Care', standard: 'HOSPIA Revenue Protocol', updated: '2026-04-29', steps: ['Know three personal recommendations per category.', 'Recommend with confidence and context.', 'Pair suggestions to guest preference, not price pressure.', 'Offer dessert with a concrete image, not a generic question.', 'Accept declines warmly and move on.'], managerNote: 'The best upsell feels like expert guidance from a host.' },
  { id: 'farewell', code: 'SOP-05', title: 'Farewell And Return Intention', category: 'Guest Loyalty', standard: 'HOSPIA Standard 11', updated: '2026-04-26', steps: ['Return payment with calm attention.', 'Thank the guest specifically, by name if known.', 'Create one warm final sentence.', 'Invite return with specificity.', 'Ensure the final physical impression is not rushed.'], managerNote: 'The final thirty seconds decide whether the guest remembers the evening.' }
]

const SIMULATION_SCENARIOS = [
  { id: 1, difficulty: 'Foundation', title: 'Unacknowledged Table', context: 'A couple has been seated for eight minutes and no one has approached them.', guest: 'Excuse me - has anyone been assigned to our table? We have not been acknowledged yet.', ideal: 'I sincerely apologize. That is not the experience we want for you. My name is [name], and I will take care of you this evening. May I start you with water while you settle in?' },
  { id: 2, difficulty: 'Intermediate', title: 'Long Kitchen Delay', context: 'Table 7 has waited 38 minutes for mains and the kitchen is backed up.', guest: 'We have been waiting almost 40 minutes. This is completely unacceptable. Where is our food?', ideal: 'You are completely right, and I am truly sorry. There has been a kitchen delay and your dishes are approximately five minutes away. While you wait, please allow me to bring something to the table so this is not just empty waiting.' },
  { id: 3, difficulty: 'Advanced', title: 'Dish Returned', context: 'A steak ordered medium-rare arrived well done. The guest pushed the plate away.', guest: 'I ordered medium-rare. This is completely overcooked. I cannot eat this.', ideal: 'I am very sorry. That is not acceptable, and I take responsibility for fixing it. I am having a new steak prepared at the correct temperature now, and I will personally follow up with you in a few minutes.' }
]

const COCKTAIL_FILTERS = ['All', 'Spirits Masterclass', 'Cocktail Families', 'Technique Academy', 'Bartender Rituals', 'Guest Scripts', 'Spirit-forward', 'Bitter', 'Citrus', 'Refreshing', 'Sour', 'Tropical', 'Sparkling', 'Creamy', 'Herbal']

const cocktailLibrary = [
  { name: 'Old Fashioned', family: 'Classic Whiskey', origin: 'United States, early 1800s', era: 'Pre-Prohibition', story: 'The Old Fashioned is one of the earliest named cocktail formats, built from spirit, sugar, bitters, and water. It became associated with American whiskey culture and remained a benchmark for serious bar programs. The drink became globally successful because it is simple, elegant, and exposes the quality of the base spirit. Its signature identity is warm, aromatic, gently sweet, and deeply spirit-forward.', ingredients: ['60 ml bourbon or rye whiskey', '7.5 ml rich simple syrup or 1 sugar cube', '2 dashes Angostura bitters', '1 dash orange bitters optional'], method: 'Build and stir in the glass until chilled and lightly diluted.', glassware: 'Rocks glass', ice: 'One large clear cube or large block ice', garnish: 'Orange twist', serviceNote: 'Ask whether the guest prefers bourbon softness or rye spice. Avoid muddled fruit in a premium setting unless it is the house style.', tags: ['Spirit-forward', 'Bitter', 'Aromatic'] },
  { name: 'Negroni', family: 'Italian Aperitivo', origin: 'Florence, Italy, 1919', era: 'Aperitivo Classic', story: 'The Negroni is commonly traced to Count Camillo Negroni, who requested a stronger Americano with gin replacing soda. It became famous in Italian aperitivo culture before becoming a global symbol of bitter sophistication. Its success comes from the perfect equal-parts structure that bartenders can remember and guests can trust. The flavor identity is bitter, herbal, citrus-led, and firmly adult.', ingredients: ['30 ml gin', '30 ml Campari', '30 ml sweet vermouth'], method: 'Stir with ice until cold and properly diluted.', glassware: 'Rocks glass', ice: 'Large cube or quality cubed ice', garnish: 'Orange slice or orange twist', serviceNote: 'Confirm the guest enjoys bitterness. For a softer profile, choose a rounder vermouth and avoid over-dilution.', tags: ['Bitter', 'Spirit-forward', 'Herbal'] },
  { name: 'Martini', family: 'Classic Gin', origin: 'United States, late 1800s', era: 'Hotel Bar Classic', story: 'The Martini evolved from nineteenth-century gin and vermouth drinks and became a symbol of hotel bar precision. Its exact creator is debated, but its fame grew through American and European cocktail culture. The drink succeeded globally because it is ritualistic, customizable, and brutally revealing of technique. Its identity is dry, cold, aromatic, and intensely spirit-forward.', ingredients: ['60 ml London dry gin', '10 ml dry vermouth', '1 dash orange bitters optional'], method: 'Stir with ice until very cold, then strain.', glassware: 'Chilled Martini glass or Nick and Nora', ice: 'Fresh hard cubed ice for stirring', garnish: 'Lemon twist or olive', serviceNote: 'Always ask gin or vodka, dry preference, and olive or twist. A Martini is personal, not generic.', tags: ['Spirit-forward', 'Dry', 'Aromatic'] },
  { name: 'Daiquiri', family: 'Rum Sour', origin: 'Cuba, around 1898', era: 'Caribbean Classic', story: 'The Daiquiri is commonly associated with the mining town of Daiquiri in Cuba. It became famous through Cuban bars and later through American cocktail culture. The drink became globally successful because it demonstrates perfect balance with only rum, lime, and sugar. Its identity is bright, clean, citrus-forward, and refreshing.', ingredients: ['60 ml white rum', '25 ml fresh lime juice', '20 ml simple syrup'], method: 'Shake hard with ice and fine strain.', glassware: 'Chilled coupe', ice: 'Cubed ice for shaking, served up', garnish: 'Lime wheel optional', serviceNote: 'Use fresh lime only. The Daiquiri should feel crisp and alive, never syrupy.', tags: ['Citrus', 'Refreshing', 'Sour'] },
  { name: 'Margarita', family: 'Tequila Sour', origin: 'Mexico or US border region, mid-1900s', era: 'Modern Classic', story: 'The Margarita has several origin claims from Mexico and the US border cocktail scene. It became famous as tequila grew from regional spirit to global icon. Its success comes from the universal appeal of tequila, lime, orange liqueur, and salt. Its identity is citrusy, saline, bright, and energetic.', ingredients: ['50 ml blanco tequila', '25 ml fresh lime juice', '20 ml Cointreau or triple sec', '5 ml agave syrup optional'], method: 'Shake with ice and strain.', glassware: 'Coupe or rocks glass', ice: 'Served up or on fresh rocks', garnish: 'Half salt rim and lime wheel', serviceNote: 'Ask up or on the rocks and whether the guest wants salt. This question makes the drink feel tailored.', tags: ['Citrus', 'Refreshing', 'Sour'] },
  { name: 'Mojito', family: 'Rum Highball', origin: 'Cuba, early 1900s', era: 'Caribbean Highball', story: 'The Mojito grew from Cuban rum, lime, mint, sugar, and soda traditions. It became internationally famous through Havana bar culture and warm-weather drinking. The drink became globally successful because it is aromatic, cooling, and easy to understand. Its identity is minty, citrusy, sparkling, and refreshing.', ingredients: ['50 ml white rum', '25 ml fresh lime juice', '20 ml simple syrup', '8 to 10 mint leaves', 'Top with soda water'], method: 'Gently press mint with syrup and lime, add rum and ice, churn, then top with soda.', glassware: 'Highball', ice: 'Crushed or quality cubed ice', garnish: 'Mint bouquet and lime wedge', serviceNote: 'Do not shred the mint. Bruise it gently so the drink smells fresh rather than grassy.', tags: ['Refreshing', 'Citrus', 'Herbal', 'Sparkling'] },
  { name: 'Whiskey Sour', family: 'Classic Sour', origin: 'United States, 1800s', era: 'Sour Family', story: 'The Whiskey Sour belongs to the historic sour family: spirit, citrus, and sugar. It became a staple in American bars because it made whiskey bright, approachable, and structured. The drink became globally successful because it balances depth with freshness. Its identity is citrusy, rounded, lightly sweet, and optionally silky with egg white.', ingredients: ['60 ml bourbon or rye whiskey', '25 ml fresh lemon juice', '20 ml simple syrup', '15 ml egg white optional', '2 dashes Angostura bitters optional'], method: 'If using egg white, dry shake first, then shake again with ice. Otherwise shake with ice and strain.', glassware: 'Rocks glass or coupe', ice: 'Fresh rocks or served up', garnish: 'Angostura drops or lemon twist', serviceNote: 'When a guest orders a sour, ask if they prefer it up or on the rocks. Ask about egg white before using it.', tags: ['Sour', 'Citrus', 'Creamy'] },
  { name: 'Pisco Sour', family: 'Classic Sour', origin: 'Peru, early 1900s', era: 'South American Classic', story: 'The Pisco Sour is most often linked to early twentieth-century Lima cocktail culture. It became famous as Peru elevated pisco as a national spirit. Its global success comes from the contrast of grape brandy, lime, sweetness, foam, and bitters. Its identity is bright, silky, aromatic, and elegant.', ingredients: ['60 ml pisco', '25 ml fresh lime juice', '20 ml simple syrup', '20 ml egg white', '3 drops Angostura bitters'], method: 'Dry shake without ice, then shake hard with ice and strain.', glassware: 'Small coupe or sour glass', ice: 'Cubed ice for shaking, served up', garnish: 'Angostura bitters on foam', serviceNote: 'The foam is part of the classic texture. Always confirm egg white with the guest.', tags: ['Sour', 'Citrus', 'Creamy', 'Aromatic'] },
  { name: 'Espresso Martini', family: 'Modern Classic', origin: 'London, 1980s', era: 'Modern Icon', story: 'The Espresso Martini is widely credited to Dick Bradsell in London during the 1980s. It became famous in late-night bar culture because it combined coffee energy with cocktail polish. Its global success comes from its clear promise: wakefulness, elegance, and indulgence. Its identity is coffee-led, lightly sweet, creamy in texture, and polished.', ingredients: ['50 ml vodka', '30 ml fresh espresso', '20 ml coffee liqueur', '10 ml simple syrup optional'], method: 'Shake very hard with ice to build foam, then fine strain.', glassware: 'Chilled coupe or Martini glass', ice: 'Cubed ice for shaking, served up', garnish: 'Three coffee beans', serviceNote: 'Use fresh espresso and shake hard. Weak foam makes the drink feel careless.', tags: ['Creamy', 'Sweet', 'Modern'] },
  { name: 'Manhattan', family: 'Classic Whiskey', origin: 'New York, late 1800s', era: 'Pre-Prohibition', story: 'The Manhattan is one of the defining whiskey cocktails of nineteenth-century New York. Its creator is debated, but its association with Manhattan social drinking made it iconic. The drink became globally successful because it is rich, elegant, and adaptable with rye or bourbon. Its identity is spirit-forward, bittersweet, smooth, and aromatic.', ingredients: ['60 ml rye whiskey or bourbon', '30 ml sweet vermouth', '2 dashes Angostura bitters'], method: 'Stir with ice until cold and strain.', glassware: 'Chilled coupe or Nick and Nora', ice: 'Cubed ice for stirring, served up', garnish: 'Brandied cherry', serviceNote: 'Ask rye or bourbon if the bar offers both. Rye gives structure, bourbon gives roundness.', tags: ['Spirit-forward', 'Bitter', 'Aromatic'] },
  { name: 'Cosmopolitan', family: 'Vodka Sour', origin: 'United States, 1980s', era: 'Modern Classic', story: 'The Cosmopolitan emerged from American cocktail culture in the 1980s and became a 1990s icon. Its rise was tied to vodka, cranberry, citrus, and the visual power of a pink coupe drink. It became globally successful because it looks elegant and tastes crisp, tart, and accessible. Its identity is citrusy, lightly fruity, clean, and stylish.', ingredients: ['40 ml citron vodka', '15 ml Cointreau', '15 ml fresh lime juice', '30 ml cranberry juice'], method: 'Shake with ice and fine strain.', glassware: 'Chilled coupe', ice: 'Cubed ice for shaking, served up', garnish: 'Orange twist', serviceNote: 'Keep it tart and bright. A Cosmopolitan should not taste like sweet cranberry juice.', tags: ['Citrus', 'Refreshing', 'Fruity'] },
  { name: 'Mai Tai', family: 'Tiki Classic', origin: 'California, 1940s', era: 'Tiki', story: 'The Mai Tai is most often associated with Trader Vic and the rise of mid-century tiki culture. It became famous because it showcased good rum with lime, orange curacao, and orgeat. The drink became globally successful because it feels exotic without losing cocktail structure. Its identity is nutty, citrusy, rum-forward, and tropical.', ingredients: ['45 ml aged rum', '15 ml Jamaican rum optional', '25 ml fresh lime juice', '15 ml orange curacao', '15 ml orgeat syrup', '7.5 ml simple syrup optional'], method: 'Shake with crushed ice and pour without straining.', glassware: 'Double rocks', ice: 'Crushed ice', garnish: 'Mint bouquet and lime shell', serviceNote: 'Do not bury the rum under juice. A premium Mai Tai should taste like rum architecture.', tags: ['Tropical', 'Citrus', 'Nutty'] },
  { name: 'Pina Colada', family: 'Tropical', origin: 'Puerto Rico, 1950s', era: 'Resort Classic', story: 'The Pina Colada is strongly associated with Puerto Rico and mid-century hotel bar culture. Its exact creator is debated among San Juan bartenders, but its fame is undisputed. It became globally successful because it tastes like vacation in a glass. Its identity is creamy, pineapple-rich, coconut-led, and generous.', ingredients: ['50 ml white or lightly aged rum', '90 ml pineapple juice', '30 ml coconut cream', '15 ml fresh lime juice optional'], method: 'Blend with ice until smooth, or shake hard for a lighter version.', glassware: 'Hurricane or large goblet', ice: 'Crushed or blended ice', garnish: 'Pineapple wedge and cherry', serviceNote: 'Balance the coconut cream with acidity. A premium Pina Colada should feel lush, not heavy.', tags: ['Tropical', 'Creamy', 'Sweet'] },
  { name: 'Paloma', family: 'Tequila Highball', origin: 'Mexico, mid-1900s', era: 'Highball Classic', story: 'The Paloma became famous in Mexico as a bright tequila and grapefruit highball. Its exact creator is uncertain, but its popularity grew through casual drinking culture. It became globally successful because it is simpler, lighter, and more refreshing than many tequila sours. Its identity is grapefruit-led, sparkling, saline, and refreshing.', ingredients: ['50 ml blanco tequila', '15 ml fresh lime juice', '10 ml agave syrup optional', 'Top with grapefruit soda or fresh grapefruit and soda'], method: 'Build over ice and gently stir.', glassware: 'Highball', ice: 'Quality cubed ice', garnish: 'Salt rim and grapefruit wedge', serviceNote: 'A pinch of salt sharpens the grapefruit. Ask about salt rim if serving a premium version.', tags: ['Refreshing', 'Citrus', 'Sparkling'] },
  { name: 'Aperol Spritz', family: 'Aperitivo Spritz', origin: 'Northern Italy, twentieth century', era: 'Aperitivo', story: 'The Spritz format grew in northern Italy, while Aperol made the orange aperitivo version globally recognizable. It became famous through Italian aperitivo rituals and outdoor social drinking. Its global success comes from low alcohol, bright color, and easy refreshment. Its identity is bittersweet, sparkling, orange-led, and social.', ingredients: ['90 ml prosecco', '60 ml Aperol', '30 ml soda water'], method: 'Build over ice and stir gently.', glassware: 'Large wine glass', ice: 'Large cubed ice', garnish: 'Orange slice', serviceNote: 'Build prosecco first to preserve lift. Keep it cold, bright, and not over-stirred.', tags: ['Sparkling', 'Bitter', 'Refreshing'] },
  { name: 'Gimlet', family: 'Gin Sour', origin: 'British naval tradition, late 1800s', era: 'Classic Sour', story: 'The Gimlet is tied to British naval lime cordial and gin traditions. It became famous as a compact, bracing cocktail that needed few ingredients. Its success comes from the clean partnership of gin and lime. Its identity is sharp, citrusy, minimal, and refreshing.', ingredients: ['60 ml gin', '25 ml fresh lime juice', '20 ml simple syrup or quality lime cordial'], method: 'Shake with ice and strain, or stir if using cordial only.', glassware: 'Chilled coupe', ice: 'Cubed ice for shaking, served up', garnish: 'Lime wheel', serviceNote: 'Clarify whether your house style uses fresh lime or cordial. The guest experience changes significantly.', tags: ['Citrus', 'Refreshing', 'Sour'] },
  { name: 'Sidecar', family: 'Brandy Sour', origin: 'Paris or London, early 1900s', era: 'European Classic', story: 'The Sidecar is commonly linked to post-World War I hotel bar culture in Paris and London. Its creator is debated, but its structure made cognac more agile and citrus-led. It became globally successful because it is luxurious yet sharp. Its identity is brandy-rich, orange-accented, citrusy, and elegant.', ingredients: ['50 ml cognac', '20 ml Cointreau', '20 ml fresh lemon juice'], method: 'Shake with ice and strain.', glassware: 'Chilled coupe', ice: 'Cubed ice for shaking, served up', garnish: 'Orange twist, sugar rim optional', serviceNote: 'Use a restrained sugar rim if requested. Too much sugar hides the cognac.', tags: ['Citrus', 'Sour', 'Spirit-forward'] },
  { name: 'Boulevardier', family: 'Whiskey Aperitivo', origin: 'Paris, 1920s', era: 'Prohibition Expat Classic', story: 'The Boulevardier is associated with Harry McElhone and American expatriate cocktail culture in Paris. It became famous as a whiskey cousin to the Negroni. Its success comes from the way whiskey gives bitter aperitivo structure warmth and depth. Its identity is bittersweet, rich, warming, and spirit-forward.', ingredients: ['45 ml bourbon or rye whiskey', '30 ml Campari', '30 ml sweet vermouth'], method: 'Stir with ice until cold and strain.', glassware: 'Rocks glass or coupe', ice: 'Large cube if served on the rocks, otherwise served up', garnish: 'Orange twist', serviceNote: 'Recommend this to Negroni drinkers who want more weight and warmth.', tags: ['Bitter', 'Spirit-forward', 'Aromatic'] },
  { name: 'Sazerac', family: 'New Orleans Classic', origin: 'New Orleans, 1800s', era: 'Pre-Prohibition', story: 'The Sazerac is one of the great New Orleans cocktails and was originally associated with cognac before rye became common. It became famous through the citys unique cocktail culture, absinthe tradition, and Peychauds bitters. Its global success comes from ritual: rinse, stir, scent, and serve without ice. Its identity is spicy, aromatic, intense, and historic.', ingredients: ['60 ml rye whiskey or cognac', '7.5 ml simple syrup', '3 dashes Peychauds bitters', '1 dash Angostura bitters optional', 'Absinthe rinse'], method: 'Rinse chilled glass with absinthe, stir remaining ingredients with ice, then strain into the rinsed glass.', glassware: 'Chilled rocks glass', ice: 'Stirred with ice, served without ice', garnish: 'Lemon peel expressed and usually discarded', serviceNote: 'This is a ritual drink. Execute it calmly and precisely in front of the guest when possible.', tags: ['Spirit-forward', 'Bitter', 'Aromatic'] },
  { name: 'Tom Collins', family: 'Gin Collins', origin: 'United States or England, 1800s', era: 'Collins Family', story: 'The Tom Collins grew from the Collins family of long, sparkling sours. It became famous through nineteenth-century bar manuals and warm-weather drinking. Its global success comes from being bright, tall, easy, and refreshing. Its identity is lemony, sparkling, light, and highly approachable.', ingredients: ['50 ml Old Tom gin or London dry gin', '25 ml fresh lemon juice', '20 ml simple syrup', 'Top with soda water'], method: 'Shake gin, lemon, and syrup with ice, strain over fresh ice, then top with soda.', glassware: 'Collins glass', ice: 'Quality cubed ice', garnish: 'Lemon wheel and cherry', serviceNote: 'Keep the soda lively. Flat Collins drinks feel tired immediately.', tags: ['Refreshing', 'Citrus', 'Sparkling'] },
  { name: 'Moscow Mule', family: 'Vodka Highball', origin: 'United States, 1940s', era: 'Highball Classic', story: 'The Moscow Mule was created in the United States as vodka and ginger beer were promoted to a wider audience. It became famous through its copper mug presentation and easy-drinking profile. Its global success comes from spicy ginger, lime, and strong visual identity. Its identity is gingery, citrusy, cold, and refreshing.', ingredients: ['50 ml vodka', '15 ml fresh lime juice', 'Top with ginger beer'], method: 'Build over ice and stir gently.', glassware: 'Copper mug or highball', ice: 'Cubed ice', garnish: 'Lime wedge and mint optional', serviceNote: 'Use a ginger beer with real spice. The drink should have snap, not soda sweetness.', tags: ['Refreshing', 'Citrus', 'Sparkling'] },
  { name: 'French 75', family: 'Champagne Cocktail', origin: 'France or London, early 1900s', era: 'Sparkling Classic', story: 'The French 75 is associated with World War I era drinking and later famous hotel bars. It became famous because gin, lemon, sugar, and Champagne create a celebratory but structured drink. Its name references the power of a French field gun, suggesting elegance with impact. Its identity is sparkling, citrusy, dry, and festive.', ingredients: ['30 ml gin', '15 ml fresh lemon juice', '10 ml simple syrup', 'Top with Champagne or dry sparkling wine'], method: 'Shake gin, lemon, and syrup with ice, strain into glass, then top with sparkling wine.', glassware: 'Champagne flute or coupe', ice: 'Shaken with cubed ice, served without ice', garnish: 'Lemon twist', serviceNote: 'Use dry sparkling wine and avoid excess syrup. The drink should be lifted, not lemonade-like.', tags: ['Sparkling', 'Citrus', 'Refreshing'] },
  { name: 'Clover Club', family: 'Gin Sour', origin: 'Philadelphia, late 1800s', era: 'Pre-Prohibition', story: 'The Clover Club is named after a Philadelphia gentlemen club where it became a signature drink. It was famous before Prohibition and later revived by modern craft cocktail bars. Its global success comes from its beautiful foam, raspberry color, and elegant sour structure. Its identity is silky, berry-led, citrusy, and refined.', ingredients: ['50 ml gin', '25 ml fresh lemon juice', '20 ml raspberry syrup', '20 ml egg white'], method: 'Dry shake without ice, then shake hard with ice and fine strain.', glassware: 'Chilled coupe', ice: 'Cubed ice for shaking, served up', garnish: 'Fresh raspberry or no garnish', serviceNote: 'Confirm egg white. Dry shake and double shake are essential for proper foam.', tags: ['Sour', 'Creamy', 'Citrus', 'Fruity'] },
  { name: 'Aviation', family: 'Gin Sour', origin: 'United States, early 1900s', era: 'Pre-Prohibition', story: 'The Aviation appeared in early twentieth-century cocktail literature and became known for its pale sky-like color. It became famous again during the craft cocktail revival as creme de violette returned to bars. Its global success comes from its unusual floral identity and delicate structure. Its identity is floral, citrusy, lightly sweet, and elegant.', ingredients: ['50 ml gin', '15 ml maraschino liqueur', '15 ml fresh lemon juice', '5 ml creme de violette'], method: 'Shake with ice and fine strain.', glassware: 'Chilled coupe', ice: 'Cubed ice for shaking, served up', garnish: 'Brandied cherry', serviceNote: 'Use violette carefully. Too much makes the drink perfumed and heavy.', tags: ['Citrus', 'Floral', 'Sour'] },
  { name: 'Caipirinha', family: 'Cachaca Classic', origin: 'Brazil, early 1900s', era: 'National Classic', story: 'The Caipirinha is Brazils defining cocktail and is built around cachaca, lime, and sugar. It became famous through Brazilian drinking culture before becoming an international classic. Its global success comes from freshness, simplicity, and the grassy character of cachaca. Its identity is rustic, lime-forward, sweet-tart, and refreshing.', ingredients: ['60 ml cachaca', '1 fresh lime cut into wedges', '2 bar spoons white sugar'], method: 'Muddle lime and sugar gently, add cachaca and ice, then churn.', glassware: 'Rocks glass', ice: 'Crushed or cracked ice', garnish: 'No garnish or lime wheel', serviceNote: 'Do not pulverize the lime peel. Excess pressure extracts bitterness.', tags: ['Refreshing', 'Citrus', 'Sweet'] }
]

const ATLAS_MASTERCLASSES = [
  { id: 'gin', title: 'The Gin Botanicum', desc: 'From London Dry to Old Tom. Mastering juniper profiles and tonic pairings.', level: 'Advanced' },
  { id: 'vodka', title: 'The Vodka Purity', desc: 'Texture, raw material influence, and the art of the frozen martini.', level: 'Intermediate' },
  { id: 'rum', title: 'Sugar & Oak', desc: 'Agricultural vs. Molasses. Navigation through Caribbean terroir and aging.', level: 'Expert' },
  { id: 'tequila', title: 'Agave Architecture', desc: 'The science of Blue Weber agave, roasting methods, and salinity.', level: 'Advanced' },
  { id: 'mezcal', title: 'Smoke & Earth', desc: 'Ancestral distillation and the complexity of wild agave varieties.', level: 'Expert' },
  { id: 'whisky', title: 'Grain & Peat', desc: 'Scotch, Bourbon, and Rye. Understanding mash bills and barrel chemistry.', level: 'Mastery' },
  { id: 'brandy', title: 'Grape & Copper', desc: 'The elegance of Cognac and Armagnac. History in a snifter.', level: 'Intermediate' },
  { id: 'liqueurs', title: 'Botanical Modifiers', desc: 'Mastering the supporting cast: Amari, Chartreuse, and Vermouth.', level: 'Advanced' }
]

const ATLAS_TECHNIQUES = [
  { title: 'The Hard Shake', category: 'Aeration', detail: 'Creating texture through three-dimensional movement.', icon: 'Sparkles' },
  { title: 'Japanese Stirring', category: 'Dilution', detail: 'Minimal friction stirring for crystal clear spirit-forward drinks.', icon: 'Timer' },
  { title: 'Batching Science', category: 'Efficiency', detail: 'Calculated dilution for high-volume consistency.', icon: 'Calculator' },
  { title: 'Milk Clarification', category: 'Chemistry', detail: 'Stripping tannins and adding silkiness via protein filtration.', icon: 'GlassWater' },
  { title: 'Fat Washing', category: 'Infusion', detail: 'Integrating savory lipids into spirits through temperature control.', icon: 'Thermometer' },
  { title: 'Pressure Infusion', category: 'Flavor', detail: 'Using N2O for rapid extraction of delicate botanicals.', icon: 'Zap' },
  { title: 'Ice Carving', category: 'Ritual', detail: 'Hand-cut clear ice for optimal thermal mass management.', icon: 'Scissors' },
  { title: 'Dilution Curves', category: 'Theory', detail: 'Measuring temperature vs. water content for the perfect pour.', icon: 'TrendingUp' }
]

const ATLAS_TRAINING_CARDS = [
  { title: 'The 10-Second Rule', objective: 'First Impression', action: 'Eye contact, vocal welcome, and seating priority.' },
  { title: 'The Check-Back', objective: 'Service Quality', action: 'Two bites or two sips in. Ask specifically, not generally.' },
  { title: 'Glassware Polish', objective: 'Visual Standard', action: 'Using steam and microfiber. No fingerprints, no lint.' },
  { title: 'Silent Service', objective: 'Luxury Floor', action: 'Anticipating needs without interrupting guest conversation.' },
  { title: 'Trolley Ritual', objective: 'Experience', action: 'The theater of table-side preparation and presentation.' }
]

const ATLAS_PROFIT_INSIGHTS = [
  { title: 'The Second Drink Leak', impact: 'NIS 4,200/mo', solution: 'Proactive offer when glass is 20% full.' },
  { title: 'Silent Over-Pouring', impact: '12% Margin Loss', solution: 'Mandatory jigger use and brix calibration.' },
  { title: 'Garnish Waste', impact: 'NIS 850/mo', solution: 'Prep-to-order for high-cost berries and exotic citrus.' },
  { title: 'Premium Upsell Path', impact: '+18% Average Check', solution: 'Recommend by spirit story, not by price tag.' }
]

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function getInitialLang() {
  const saved = localStorage.getItem(STORAGE.lang)
  if (saved === 'he' || saved === 'en') return saved
  return navigator.language?.toLowerCase().startsWith('he') ? 'he' : 'en'
}

function getInitialRole() {
  const saved = localStorage.getItem(STORAGE.role)
  return ['owner', 'manager', 'employee'].includes(saved) ? saved : ''
}

function getInitialReportArchive() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.reportArchive) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function firstAllowedArea(role) {
  return Object.entries(NAV_GROUPS).find(([, group]) => group.roles.includes(role))?.[0] || 'system'
}

function firstAllowedPage(role, area = firstAllowedArea(role)) {
  const group = NAV_GROUPS[area]
  if (!group || !group.roles.includes(role)) return firstAllowedPage(role, firstAllowedArea(role))
  return group.pages.find(page => PAGE_META[page]?.roles.includes(role)) || 'settings'
}

function isAllowed(role, area, page) {
  return Boolean(
    role &&
    NAV_GROUPS[area]?.roles.includes(role) &&
    NAV_GROUPS[area]?.pages.includes(page) &&
    PAGE_META[page]?.roles.includes(role)
  )
}

function isAllowedPage(role, page) {
  const area = PAGE_META[page]?.area
  return Boolean(area && isAllowed(role, area, page))
}

function localize(value, lang) {
  if (typeof value === 'string') return value
  return value?.[lang] || value?.en || ''
}

function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      window.emailjs.init(EMAILJS.publicKey)
      resolve(window.emailjs)
      return
    }

    const existing = document.querySelector(`script[src="${EMAILJS.scriptUrl}"]`)
    if (existing) {
      existing.addEventListener('load', () => {
        window.emailjs.init(EMAILJS.publicKey)
        resolve(window.emailjs)
      })
      existing.addEventListener('error', () => reject(new Error('EmailJS failed to load')))
      return
    }

    const script = document.createElement('script')
    script.src = EMAILJS.scriptUrl
    script.async = true
    script.onload = () => {
      window.emailjs.init(EMAILJS.publicKey)
      resolve(window.emailjs)
    }
    script.onerror = () => reject(new Error('EmailJS failed to load'))
    document.body.appendChild(script)
  })
}

async function apiRequest(path, { method = 'GET', role, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(role ? { 'X-HOSPIA-Role': role } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${response.status}`)
  }
  return data
}

export default function App() {
  const [lang, setLang] = useState(getInitialLang)
  const t = TEXT[lang]

  const [role, setRole] = useState(getInitialRole)
  const [area, setAreaState] = useState(() => localStorage.getItem(STORAGE.area) || firstAllowedArea(getInitialRole() || 'employee'))
  const [page, setPageState] = useState(() => localStorage.getItem(STORAGE.page) || firstAllowedPage(getInitialRole() || 'employee'))
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE.collapsed)
    if (saved !== null) return saved === 'true'
    return window.innerWidth < 1024
  })
  const [reportArchive, setReportArchive] = useState(getInitialReportArchive)
  const [eventPlans, setEventPlans] = useState([])
  const [businessMemory, setBusinessMemory] = useState(BUSINESS_MEMORY)

  useEffect(() => {
    localStorage.setItem(STORAGE.lang, lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  }, [lang])

  useEffect(() => {
    localStorage.setItem(STORAGE.collapsed, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    localStorage.setItem(STORAGE.reportArchive, JSON.stringify(reportArchive))
  }, [reportArchive])

  useEffect(() => {
    let active = true
    if (!['manager', 'owner'].includes(role)) return undefined

    Promise.allSettled([
      apiRequest('/api/shift-reports', { role }),
      apiRequest('/api/event-plans', { role }),
      apiRequest('/api/business-memory', { role })
    ])
      .then(([reportsResult, plansResult, memoryResult]) => {
        if (!active) return
        if (reportsResult.status === 'fulfilled' && Array.isArray(reportsResult.value.reports)) {
          setReportArchive(reportsResult.value.reports)
        }
        if (plansResult.status === 'fulfilled' && Array.isArray(plansResult.value.eventPlans)) {
          setEventPlans(plansResult.value.eventPlans)
        }
        if (memoryResult.status === 'fulfilled' && Array.isArray(memoryResult.value.memory)) {
          setBusinessMemory(memoryResult.value.memory)
        }
      })
      .catch(error => {
        console.warn('HOSPIA backend archive APIs unavailable; using local data.', error)
      })

    return () => {
      active = false
    }
  }, [role])

  useEffect(() => {
    if (!role) return

    if (!isAllowed(role, area, page)) {
      const nextArea = firstAllowedArea(role)
      const nextPage = firstAllowedPage(role, nextArea)
      setAreaState(nextArea)
      setPageState(nextPage)
      localStorage.setItem(STORAGE.area, nextArea)
      localStorage.setItem(STORAGE.page, nextPage)
    }
  }, [role, area, page])

  async function login(nextRole, accessCode) {
    try {
      const data = await apiRequest('/api/session/login', {
        method: 'POST',
        body: { code: accessCode }
      })
      if (data.role && data.role !== nextRole) {
        throw new Error('Backend role mismatch.')
      }
    } catch (error) {
      console.warn('HOSPIA login API unavailable; using local access-code fallback.', error)
    }

    const nextArea = firstAllowedArea(nextRole)
    const nextPage = firstAllowedPage(nextRole, nextArea)

    setRole(nextRole)
    setAreaState(nextArea)
    setPageState(nextPage)

    localStorage.setItem(STORAGE.role, nextRole)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }

  function logout() {
    localStorage.removeItem(STORAGE.role)
    localStorage.removeItem(STORAGE.area)
    localStorage.removeItem(STORAGE.page)
    setRole('')
  }

  function goToArea(nextArea) {
    if (!NAV_GROUPS[nextArea]?.roles.includes(role)) return
    const nextPage = firstAllowedPage(role, nextArea)
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }

  function goToPage(nextPage) {
    if (!isAllowedPage(role, nextPage)) return
    const nextArea = PAGE_META[nextPage].area
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }

  const archiveEndOfDayReport = useCallback(async report => {
    let archived

    try {
      const data = await apiRequest('/api/shift-reports', {
        method: 'POST',
        role: 'manager',
        body: report
      })
      archived = data.report
    } catch (error) {
      console.warn('HOSPIA report archive API save failed; using local archive.', error)
      archived = {
        ...report,
        id: `eod-local-${Date.now()}`,
        submitted_at: new Date().toISOString()
      }
    }

    setReportArchive(prev => [archived, ...prev].slice(0, 50))
    return archived
  }, [])

  const saveEventPlan = useCallback(async ({ name, config, calculations }) => {
    let eventPlan

    try {
      const data = await apiRequest('/api/event-plans', {
        method: 'POST',
        role: 'manager',
        body: { name, config, calculations }
      })
      eventPlan = data.eventPlan
    } catch (error) {
      console.warn('HOSPIA event plan API save failed; using local plan fallback.', error)
      eventPlan = {
        id: `event-local-${Date.now()}`,
        name,
        config,
        calculations,
        projected_revenue: calculations.revenue || 0,
        projected_profit: calculations.grossProfit || 0,
        projected_margin: calculations.margin || 0,
        created_at: new Date().toISOString()
      }
    }

    setEventPlans(prev => [eventPlan, ...prev.filter(item => item.id !== eventPlan.id)].slice(0, 30))
    setBusinessMemory(prev => [{
      type: 'event',
      date: eventPlan.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      title: `Event plan saved: ${eventPlan.name}`,
      detail: `Projected revenue: ${formatMoney(eventPlan.projected_revenue)}. Projected profit: ${formatMoney(eventPlan.projected_profit)}. Margin: ${Number(eventPlan.projected_margin || 0).toFixed(1)}%.`
    }, ...prev].slice(0, 80))
    return eventPlan
  }, [])

  if (!role) {
    return <LoginScreen t={t} lang={lang} setLang={setLang} onLogin={login} />
  }

  return (
    <div className="min-h-screen bg-[#0d0c09] text-[#f5f5f0]">
      <TopNav
        t={t}
        role={role}
        area={area}
        goToArea={goToArea}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-[calc(100vh-5rem)]">
        <SidePanel
          t={t}
          role={role}
          area={area}
          page={page}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          goToPage={goToPage}
          lang={lang}
          setLang={setLang}
          logout={logout}
        />

        {!collapsed && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setCollapsed(true)}
            aria-label={t.ui.collapsePanel}
          />
        )}

        <main className="min-w-0 flex-1 p-8 sm:p-12 lg:p-20 xl:p-32 2xl:p-40">
          <PageRenderer
            t={t}
            lang={lang}
          role={role}
          page={page}
          goToPage={goToPage}
          reportArchive={reportArchive}
          onReportArchived={archiveEndOfDayReport}
          eventPlans={eventPlans}
          businessMemory={businessMemory}
          onEventPlanSaved={saveEventPlan}
          />
        </main>
      </div>
    </div>
  )
}

function LoginScreen({ t, lang, setLang, onLogin }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const normalizedCode = code.trim().toUpperCase()
    const role = ACCESS_CODES[normalizedCode]
    if (!role) {
      setError(t.app.invalid)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onLogin(role, normalizedCode)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#0d0c09] text-[#f5f5f0] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex items-end overflow-hidden border-b border-[#6b705c]/30 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.2),transparent_34%),linear-gradient(135deg,#181611,#0d0c09)] p-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-12">
        <div className="max-w-3xl">
          <div className="mb-6 text-sm font-black uppercase tracking-[0.28em] text-[#c9a96e]">
            {t.app.secureAccess}
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight text-[#f5f5f0] sm:text-7xl">
            {t.app.name} <span className="text-[#c9a96e]">{t.app.suffix}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#e8dcc0]">{t.app.accessBody}</p>

          <div className="mt-10 grid gap-3 text-sm text-[#e8dcc0] sm:grid-cols-3">
            <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">EMP123 - {t.app.employee}</div>
            <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">MNG123 - {t.app.manager}</div>
            <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">OWN123 - {t.app.owner}</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-[1.75rem] border border-[#6b705c]/30 bg-[#14130f] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c9a96e]">
                {t.app.secureAccess}
              </div>
              <h2 className="mt-3 font-serif text-3xl font-black tracking-tight text-[#f5f5f0]">
                {t.app.accessTitle}
              </h2>
            </div>
            <LanguageSwitcher t={t} lang={lang} setLang={setLang} />
          </div>

          <input
            value={code}
            onChange={event => setCode(event.target.value)}
            placeholder={t.app.codePlaceholder}
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0] focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
          />

          {error && <Alert type="error">{error}</Alert>}

          <Button type="submit" className="mt-4 w-full" disabled={submitting}>{submitting ? 'Entering...' : t.app.enter}</Button>
        </form>
      </section>
    </main>
  )
}

function TopNav({ t, role, area, goToArea, collapsed, setCollapsed }) {
  const areas = Object.entries(NAV_GROUPS)
    .filter(([, group]) => group.roles.includes(role))
    .map(([key]) => key)

  return (
    <header className="sticky top-0 z-40 border-b border-[#6b705c]/20 bg-[#0d0c09]/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center gap-8 px-8 sm:px-12 lg:px-16">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] text-[#e8dcc0] transition hover:border-[#c9a96e] hover:text-[#c9a96e]"
          aria-label={collapsed ? t.ui.openPanel : t.ui.collapsePanel}
        >
          <span className="block w-4">
            <span className="mb-1 block h-0.5 rounded bg-current" />
            <span className="mb-1 block h-0.5 rounded bg-current" />
            <span className="block h-0.5 rounded bg-current" />
          </span>
        </button>

        <div className="min-w-fit">
          <div className="font-serif text-2xl font-black tracking-[0.06em] text-[#c9a96e]">
            {t.app.name} <span className="text-[#f5f5f0]">{t.app.suffix}</span>
          </div>
          <div className="hidden text-[9px] font-black uppercase tracking-[0.3em] text-[#e8dcc0] opacity-60 sm:block">
            {t.app.tagline}
          </div>
        </div>

        <nav className="flex flex-1 gap-4 overflow-x-auto px-4" aria-label="Primary navigation">
          {areas.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => goToArea(item)}
              className={cx(
                'min-h-12 shrink-0 rounded-2xl border px-6 py-2 text-left transition-all duration-300',
                area === item
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e] shadow-lg shadow-[#c9a96e]/5'
                  : 'border-transparent text-[#e8dcc0] hover:bg-[#6b705c]/10 hover:text-[#f5f5f0]'
              )}
            >
              <span className="block text-xs font-black uppercase tracking-widest">{t.areas[item]}</span>
              <span className="hidden text-[10px] leading-4 text-[#e8dcc0] opacity-50 xl:block">
                {t.areaDescriptions[item]}
              </span>
            </button>
          ))}
        </nav>

        <div className="hidden rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#c9a96e] lg:block">
          {t.app[role]}
        </div>
      </div>
    </header>
  )
}

function SidePanel({ t, role, area, page, collapsed, setCollapsed, goToPage, lang, setLang, logout }) {
  const pages = NAV_GROUPS[area]?.pages.filter(item => PAGE_META[item].roles.includes(role)) || []

  return (
    <aside className={cx(
      'fixed inset-y-20 z-30 border-r border-[#6b705c]/10 bg-[#0d0c09] transition-all duration-500 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]',
      collapsed ? 'w-0 -translate-x-full overflow-hidden lg:w-[88px] lg:translate-x-0' : 'w-[280px] translate-x-0'
    )}>
      {!collapsed ? (
        <div className="flex h-full flex-col">
          <div className="border-b border-[#6b705c]/10 p-8">
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#e8dcc0] opacity-50">
              {t.ui.selectSection}
            </div>
            <h2 className="mt-4 font-serif text-3xl font-black text-[#f5f5f0]">{t.areas[area]}</h2>
            <p className="mt-3 text-xs leading-6 text-[#e8dcc0] opacity-70 italic">{t.areaDescriptions[area]}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-6" aria-label="Secondary navigation">
            <div className="space-y-3">
              {pages.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  className={cx(
                    'w-full rounded-[1.5rem] border p-5 text-left transition-all duration-300',
                    page === item
                      ? 'border-[#c9a96e]/20 bg-[#c9a96e]/5 text-[#c9a96e]'
                      : 'border-transparent text-[#e8dcc0] hover:bg-white/[0.03] hover:text-[#f5f5f0]'
                  )}
                >
                  <span className="block text-[13px] font-black leading-5 uppercase tracking-wider">{t.pages[item]}</span>
                  <span className="mt-1 block text-[10px] leading-5 text-[#e8dcc0] opacity-40 font-mono">{PAGE_META[item].code}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-[#6b705c]/10 p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e8dcc0] opacity-40">
                {t.app.language}
              </span>
              <LanguageSwitcher t={t} lang={lang} setLang={setLang} />
            </div>
            <Button variant="secondary" onClick={logout} className="w-full">{t.app.logout}</Button>
          </div>
        </div>
      ) : (
        <div className="hidden h-full flex-col items-center gap-3 p-3 lg:flex">
          {pages.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              title={t.pages[item]}
              className={cx(
                'flex h-12 w-12 items-center justify-center rounded-2xl border text-[10px] font-black transition-all duration-300',
                page === item
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e]'
                  : 'border-[#6b705c]/20 text-[#e8dcc0] hover:bg-white/5 hover:text-[#f5f5f0]'
              )}
            >
              {PAGE_META[item].code}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}

function PageRenderer({ t, lang, role, page, goToPage, reportArchive, onReportArchived, eventPlans, businessMemory, onEventPlanSaved }) {
  const pages = {
    commandCenter: <CommandCenter t={t} role={role} goToPage={goToPage} />,
    actionBoard: <ActionBoard t={t} role={role} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} />,
    eventOrchestrator: <EventOrchestrator t={t} eventPlans={eventPlans} onEventPlanSaved={onEventPlanSaved} />,
    staffReadiness: <StaffReadiness t={t} goToPage={goToPage} />,
    serviceRecovery: <ServiceRecovery t={t} goToPage={goToPage} />,
    endOfDay: <EndOfDayReports t={t} reportArchive={reportArchive} onReportArchived={onReportArchived} />,
    operationalNotes: <OperationalNotes t={t} />,
    simulation: <Simulation t={t} goToPage={goToPage} />,
    courses: <Courses t={t} lang={lang} goToPage={goToPage} />,
    lessonPlayer: <LessonPlayer t={t} lang={lang} goToPage={goToPage} />,
    sopSheets: <SOPSheets t={t} goToPage={goToPage} />,
    knowledgeLibrary: <KnowledgeLibrary t={t} lang={lang} />,
    learningProgress: <LearningProgress t={t} />,
    executiveOverview: <ExecutiveOverview t={t} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} />,
    businessMRI: <BusinessMRI t={t} />,
    profitLeaks: <ProfitLeaks t={t} goToPage={goToPage} />,
    ownerReport: <OwnerReport t={t} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} />,
    businessMemory: <BusinessMemoryPage t={t} reportArchive={reportArchive} businessMemory={businessMemory} />,
    strategicRecommendations: <StrategicRecommendations t={t} />,
    settings: <Settings t={t} />
  }

  return pages[page] || <MissingPage t={t} page={page} />
}

function CommandCenter({ t, role, goToPage }) {
  const isOwner = role === 'owner'

  return (
    <>
      <Header
        eyebrow={t.areas.command}
        title={isOwner ? t.copy.ownerTitle : t.copy.managerTitle}
        body={t.copy.commandBody}
      />

      <div className="space-y-20">
        <Card className="bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_40%),linear-gradient(135deg,#191812,#0d0c09)] p-12 lg:p-20">
          <div className="grid gap-16 xl:grid-cols-[1fr_420px] xl:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">
                {t.app.today}
              </div>
              <h2 className="mt-6 max-w-4xl font-serif text-5xl font-black leading-[1.05] tracking-tight text-[#f5f5f0] sm:text-7xl">
                {t.copy.commandTitle}
              </h2>
              <p className="mt-10 max-w-2xl text-xl leading-relaxed text-[#e8dcc0] opacity-80 italic">{t.copy.commandBody}</p>
              <div className="mt-12 flex flex-col gap-5 sm:flex-row">
                <Button onClick={() => goToPage(isOwner ? 'businessMRI' : 'actionBoard')}>
                  {isOwner ? t.pages.businessMRI : t.pages.actionBoard}
                </Button>
                <Button variant="secondary" onClick={() => goToPage(isOwner ? 'ownerReport' : 'endOfDay')}>
                  {isOwner ? t.pages.ownerReport : t.pages.endOfDay}
                </Button>
              </div>
            </div>
            <Metric label={t.app.valueIdentified} value="NIS 12.9k" sub={t.copy.recommendedAction} large />
          </div>
        </Card>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Metric label="Hospitality Score" value="87" sub="+4 points" />
          <Metric label="Revenue Risk" value="NIS 4.8k" sub="Prev. Exposure" />
          <Metric label="Open Actions" value="7" sub="Due Tonight" />
          <Metric label="Staff Readiness" value="74%" sub="Academy Target" />
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <Card>
            <Label>{t.copy.recentSignals}</Label>
            <List items={[
              'Kitchen delay risk increased during dinner service.',
              'Three staff members need recovery simulation.',
              'Natural upselling improved in the bar team.'
            ]} />
          </Card>
          <Card>
            <Label>{t.copy.aiRecommendations}</Label>
            <List items={[
              'Run a 7-minute delay communication briefing.',
              'Assign complaint recovery practice before the weekend.',
              'Review compensation decisions with owner logic.'
            ]} />
          </Card>
        </div>
      </div>
    </>
  )
}

function ActionBoard({ t, role, goToPage, reportArchive = [], eventPlans = [] }) {
  const [items, setItems] = useState(ACTION_BOARD_ITEMS)
  const open = items.filter(item => !item.done)
  const completed = items.filter(item => item.done)
  const urgent = open.filter(item => item.priority === 'urgent').length
  const latestReport = reportArchive[0]
  const latestEvent = eventPlans[0]
  const priorityClass = {
    urgent: 'border-red-800/50 bg-red-950/25 text-red-200',
    high: 'border-amber-800/50 bg-amber-950/25 text-amber-200',
    normal: 'border-[#6b705c]/30 bg-[#6b705c]/10 text-[#e8dcc0]'
  }

  useEffect(() => {
    let active = true
    apiRequest('/api/actions', { role })
      .then(data => {
        if (active && Array.isArray(data.actions)) {
          setItems(data.actions)
        }
      })
      .catch(error => {
        console.warn('HOSPIA actions API unavailable; using local action board.', error)
      })

    return () => {
      active = false
    }
  }, [role])

  async function toggle(id) {
    const target = items.find(item => item.id === id)
    if (!target) return

    const nextDone = !target.done
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: nextDone } : item))

    try {
      const data = await apiRequest(`/api/actions/${id}`, {
        method: 'PATCH',
        role,
        body: { done: nextDone }
      })
      setItems(prev => prev.map(item => item.id === id ? data.action : item))
    } catch (error) {
      console.warn('HOSPIA action API update failed; keeping local state.', error)
    }
  }

  return (
    <>
      <Header eyebrow={t.pages.actionBoard} title="Today's Operational Action Board" body="A manager-first daily loop: what must happen before service, who owns it, and which product signal created the action." />
      <PreShiftBriefing openActions={open} latestReport={latestReport} latestEvent={latestEvent} goToPage={goToPage} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Open Actions" value={String(open.length)} sub={`${urgent} urgent`} />
        <Metric label="Completed" value={String(completed.length)} sub="This shift" />
        <Metric label="Execution Rate" value={`${items.length ? Math.round((completed.length / items.length) * 100) : 0}%`} sub="Live manager rhythm" />
        <Metric label="Risk Prevented" value="NIS 4.2k" sub="Estimated weekly exposure" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map(item => (
            <article key={item.id} className={cx('rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 transition hover:border-[#c9a96e]/40 hover:bg-[#c9a96e]/5', item.done && 'opacity-55')}>
              <div className="flex items-start gap-4">
                <button type="button" onClick={() => toggle(item.id)} className={cx('mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition', item.done ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 hover:border-[#c9a96e]')}>
                  {item.done ? 'OK' : ''}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]', priorityClass[item.priority])}>{item.priority}</span>
                    <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{item.due}</span>
                  </div>
                  <h2 className="text-sm font-black leading-6 text-[#f5f5f0]">{item.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-[#e8dcc0]">{item.signal}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[#e8dcc0]">Owner: {item.owner}</span>
                    <Button variant="ghost" onClick={() => goToPage(item.page)}>Open Module</Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <Card className="h-fit border-[#c9a96e]/20 bg-[#1a1a1a]">
          <Label>Manager Command Logic</Label>
          <p className="text-sm leading-7 text-[#e8dcc0]">This board converts training gaps, service recovery failures, and End Of Day patterns into work that can be completed before the next shift. It is the daily habit loop that makes HOSPIA operational, not decorative.</p>
        </Card>
      </div>
    </>
  )
}

function PreShiftBriefing({ openActions, latestReport, latestEvent, goToPage }) {
  const urgentActions = openActions.filter(item => item.priority === 'urgent')
  const briefingItems = [
    urgentActions[0]?.title || 'Confirm floor readiness before doors open.',
    latestReport?.urgent_items || latestReport?.shift_summary || 'No archived End Of Day handoff yet. Closing reports should feed tomorrow briefing.',
    latestEvent ? `Event plan active: ${latestEvent.name} with projected profit ${formatMoney(latestEvent.projected_profit || latestEvent.calculations?.grossProfit || 0)}.` : 'No saved event plan in the current briefing stack.'
  ]

  return (
    <section className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_35%),#1a1a1a]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Live Shift Briefing
            </div>
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Before service, align the room on the few things that matter.</h2>
          </div>
          <span className="rounded-full border border-red-800/50 bg-red-950/25 px-3 py-1 text-xs font-black text-red-200">{urgentActions.length} urgent</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {briefingItems.map((item, index) => (
            <div key={item} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
              <div className="mb-2 font-serif text-3xl font-black text-[#6b705c]">0{index + 1}</div>
              <p className="text-sm leading-7 text-[#e8dcc0]">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#c9a96e]/15">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Pre-Shift Micro Training
        </div>
        <p className="mb-4 text-sm leading-7 text-[#e8dcc0]">The correct training unit for today is not a full course. It is the smallest drill that reduces tonight's highest risk.</p>
        <div className="space-y-3">
          <button type="button" onClick={() => goToPage('serviceRecovery')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Run 5-minute recovery language calibration</button>
          <button type="button" onClick={() => goToPage('simulation')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Score one pressure scenario before lineup</button>
          <button type="button" onClick={() => goToPage('sopSheets')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Review delay SOP with exact guest language</button>
        </div>
      </Card>
    </section>
  )
}

const EVENT_TIERS = {
  standard: { label: 'Standard', cocktailRate: 1.2, defaultPrice: 420, defaultCogs: 28, accent: 'text-[#e8dcc0]' },
  premium: { label: 'Premium', cocktailRate: 1.6, defaultPrice: 620, defaultCogs: 26, accent: 'text-[#c9a96e]' },
  luxury: { label: 'Luxury / Michelin', cocktailRate: 2.1, defaultPrice: 920, defaultCogs: 24, accent: 'text-emerald-300' }
}

function EventOrchestrator({ t, eventPlans = [], onEventPlanSaved }) {
  const [config, setConfig] = useState({
    guests: 180,
    duration: 6,
    tier: 'premium',
    pricePerGuest: EVENT_TIERS.premium.defaultPrice,
    cogsPercent: EVENT_TIERS.premium.defaultCogs,
    hourlyRate: 72
  })
  const [saveStatus, setSaveStatus] = useState(null)

  const tier = EVENT_TIERS[config.tier]
  const calculations = useMemo(() => {
    const guests = Math.max(1, Number(config.guests) || 1)
    const duration = Math.max(1, Number(config.duration) || 1)
    const price = Math.max(0, Number(config.pricePerGuest) || 0)
    const cogsPercent = Math.max(0, Number(config.cogsPercent) || 0)
    const hourlyRate = Math.max(0, Number(config.hourlyRate) || 0)

    const cocktails = Math.ceil(guests * tier.cocktailRate)
    const wineBottles = Math.ceil(guests / 3.5)
    const wineGlasses = wineBottles * 4
    const spiritBottles = Math.ceil((guests * duration * 0.35) / 16)
    const beerUnits = Math.ceil(guests * 1.2)
    const glasswareUnits = Math.ceil(guests * 3)
    const proteinKg = guests * 0.2
    const foodMassKg = guests * 0.75
    const dietaryBufferGuests = Math.ceil(guests * 0.05)
    const dietaryBufferKg = dietaryBufferGuests * 0.75
    const revenue = guests * price
    const cogs = revenue * (cogsPercent / 100)
    const waiters = Math.ceil(guests / 15)
    const bartenders = Math.ceil(guests / 50)
    const laborHours = (waiters + bartenders) * duration
    const laborCost = laborHours * hourlyRate
    const grossProfit = revenue - cogs - laborCost
    const margin = revenue ? (grossProfit / revenue) * 100 : 0

    return {
      guests,
      duration,
      price,
      cogsPercent,
      hourlyRate,
      cocktails,
      wineBottles,
      wineGlasses,
      spiritBottles,
      beerUnits,
      glasswareUnits,
      proteinKg,
      foodMassKg,
      dietaryBufferGuests,
      dietaryBufferKg,
      revenue,
      cogs,
      waiters,
      bartenders,
      laborHours,
      laborCost,
      grossProfit,
      margin
    }
  }, [config, tier])

  function updateConfig(field, value) {
    setConfig(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'tier') {
        next.pricePerGuest = EVENT_TIERS[value].defaultPrice
        next.cogsPercent = EVENT_TIERS[value].defaultCogs
      }
      return next
    })
  }

  async function saveEventPlan() {
    setSaveStatus({ type: 'loading', message: 'Saving event plan...' })
    try {
      const savedPlan = await onEventPlanSaved?.({
        name: `${tier.label} event - ${calculations.guests} guests`,
        config,
        calculations
      })
      setSaveStatus({ type: 'success', message: `${savedPlan?.name || 'Event plan'} saved and visible in Saved Event Reports.` })
    } catch (error) {
      console.warn('Event plan save failed:', error)
      setSaveStatus({ type: 'error', message: 'Could not save event plan. Backend may be offline.' })
    }
  }

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_78%_10%,rgba(201,169,110,0.16),transparent_35%),linear-gradient(135deg,#1b1914,#0f0f0e_72%)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-[#c9a96e]">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Event Orchestrator
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-[#f5f5f0] sm:text-6xl">Wedding and event execution, calculated to the glass.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#e8dcc0]">A manager command tab for premium events: bar planning, culinary safety, staffing economics, and run-of-show discipline in one Michelin-grade control surface.</p>
          </div>
          <div className="grid min-w-[280px] gap-3 rounded-2xl border border-[#6b705c]/30 bg-[#c9a96e]/10 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Gross Profit Projection</div>
            <div className="font-serif text-5xl font-black text-[#c9a96e]">{formatMoney(calculations.grossProfit)}</div>
            <div className={cx('text-sm font-black', calculations.margin >= 45 ? 'text-emerald-300' : calculations.margin >= 32 ? 'text-[#c9a96e]' : 'text-red-300')}>{calculations.margin.toFixed(1)}% margin</div>
            <Button onClick={saveEventPlan} disabled={saveStatus?.type === 'loading'}>{saveStatus?.type === 'loading' ? 'Saving...' : 'Save Event Plan'}</Button>
            {saveStatus && saveStatus.type !== 'loading' && <div className={cx('text-xs font-bold leading-5', saveStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300')}>{saveStatus.message}</div>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <EventConfiguration config={config} calculations={calculations} updateConfig={updateConfig} />
        <div className="space-y-6">
          <BarIntelligence calculations={calculations} tier={tier} />
          <div className="grid gap-6 xl:grid-cols-2">
            <CulinaryMatrix calculations={calculations} />
            <ROIEngine calculations={calculations} />
          </div>
          <SavedEventReports eventPlans={eventPlans} />
          <RunOfShow />
        </div>
      </div>
    </>
  )
}

function SavedEventReports({ eventPlans = [] }) {
  return (
    <Card className="border-[#c9a96e]/20">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Saved Event Reports</div>
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Persisted event plans from the backend database.</h2>
        </div>
        <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">{eventPlans.length} saved</span>
      </div>

      {eventPlans.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {eventPlans.slice(0, 6).map(plan => {
            const calculations = plan.calculations || {}
            const config = plan.config || {}
            return (
              <article key={plan.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{plan.created_at?.slice(0, 10) || 'Saved plan'}</div>
                    <h3 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">{plan.name}</h3>
                  </div>
                  <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">{config.tier || 'event'}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniFact label="Guests" value={calculations.guests || config.guests || 0} />
                  <MiniFact label="Revenue" value={formatMoney(plan.projected_revenue ?? calculations.revenue ?? 0)} />
                  <MiniFact label="Profit" value={formatMoney(plan.projected_profit ?? calculations.grossProfit ?? 0)} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <SmallReportFact label="Cocktails" value={calculations.cocktails || 0} />
                  <SmallReportFact label="Wine" value={`${calculations.wineBottles || 0} btls`} />
                  <SmallReportFact label="Waiters" value={calculations.waiters || 0} />
                  <SmallReportFact label="Margin" value={`${Number(plan.projected_margin ?? calculations.margin ?? 0).toFixed(1)}%`} />
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-5 text-sm leading-7 text-[#e8dcc0]">
          No saved event reports yet. Click <span className="font-black text-[#c9a96e]">Save Event Plan</span> after configuring the event.
        </div>
      )}
    </Card>
  )
}

function SmallReportFact({ label, value }) {
  return (
    <div className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <div className="mt-1 text-sm font-black text-[#f5f5f0]">{value}</div>
    </div>
  )
}

function EventConfiguration({ config, calculations, updateConfig }) {
  return (
    <aside className="space-y-5">
      <Card className="sticky top-24 border-[#c9a96e]/20">
        <Label>Global Configuration</Label>
        <div className="space-y-4">
          <NumberInput label="Guest Count" value={config.guests} min="1" onChange={value => updateConfig('guests', value)} />
          <NumberInput label="Event Duration (hours)" value={config.duration} min="1" step="0.5" onChange={value => updateConfig('duration', value)} />
          <div>
            <label htmlFor="event-tier" className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Service Tier</label>
            <select id="event-tier" value={config.tier} onChange={event => updateConfig('tier', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20">
              {Object.entries(EVENT_TIERS).map(([key, tier]) => <option key={key} value={key}>{tier.label}</option>)}
            </select>
          </div>
          <NumberInput label="Price Per Guest (NIS)" value={config.pricePerGuest} min="0" onChange={value => updateConfig('pricePerGuest', value)} />
          <NumberInput label="COGS Target (%)" value={config.cogsPercent} min="0" max="100" step="0.5" onChange={value => updateConfig('cogsPercent', value)} />
          <NumberInput label="Hourly Labor Rate (NIS)" value={config.hourlyRate} min="0" onChange={value => updateConfig('hourlyRate', value)} />
        </div>
      </Card>
      <Card className="border-[#c9a96e]/15 bg-[#1a1a1a]">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><Sparkles className="h-4 w-4" aria-hidden="true" /> Executive Snapshot</div>
        <div className="grid gap-3">
          <MiniFact label="Waiters Required" value={calculations.waiters} />
          <MiniFact label="Bartenders Required" value={calculations.bartenders} />
          <MiniFact label="Total Labor Hours" value={calculations.laborHours.toFixed(1)} />
        </div>
      </Card>
    </aside>
  )
}

function BarIntelligence({ calculations, tier }) {
  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><Wine className="h-4 w-4" aria-hidden="true" /> Alcohol And Bar Intelligence</div>
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Reception, cellar, spirits, beer and glassware turnover.</h2>
        </div>
        <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">{tier.label}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <EventMetric icon={GlassWater} label="Cocktails" value={calculations.cocktails} sub={`${tier.cocktailRate} drinks / guest`} />
        <EventMetric icon={Wine} label="Wine Bottles" value={calculations.wineBottles} sub={`${calculations.wineGlasses} glasses planned`} />
        <EventMetric icon={Sparkles} label="Spirit Bottles" value={calculations.spiritBottles} sub="750 ml / 16 pours" />
        <EventMetric icon={Beer} label="Beer Units" value={calculations.beerUnits} sub="1.2 units / guest" />
        <EventMetric icon={ClipboardCheck} label="Glassware" value={calculations.glasswareUnits} sub="3:1 high-end turnover" />
      </div>
      <ProTip icon={GlassWater}>Use large format ice for signature cocktails to reduce dilution, preserve texture, and lower silent over-pouring cost.</ProTip>
    </Card>
  )
}

function CulinaryMatrix({ calculations }) {
  return (
    <Card>
      <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><ChefHat className="h-4 w-4" aria-hidden="true" /> Culinary And Dietary Matrix</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <EventMetric icon={Utensils} label="Protein For Mains" value={`${calculations.proteinKg.toFixed(1)} kg`} sub="200g per guest" />
        <EventMetric icon={ChefHat} label="Total Food Mass" value={`${calculations.foodMassKg.toFixed(1)} kg`} sub="750g per guest" />
        <EventMetric icon={Users} label="Dietary Buffer" value={calculations.dietaryBufferGuests} sub="5% vegan / GF safety net" />
        <EventMetric icon={ClipboardCheck} label="Buffer Food Mass" value={`${calculations.dietaryBufferKg.toFixed(1)} kg`} sub="Social choice protection" />
      </div>
      <ProTip icon={ChefHat}>For luxury weddings, dietary meals should be plated with equal visual prestige. A safety net is operational insurance, not an afterthought.</ProTip>
    </Card>
  )
}

function ROIEngine({ calculations }) {
  const cogsStatus = calculations.cogsPercent > 30 ? 'critical' : calculations.cogsPercent > 28 ? 'watch' : 'healthy'
  const cogsClass = cogsStatus === 'critical' ? 'border-red-800/60 bg-red-950/25 text-red-200' : cogsStatus === 'watch' ? 'border-amber-800/60 bg-amber-950/25 text-amber-200' : 'border-emerald-800/60 bg-emerald-950/25 text-emerald-200'

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><CircleDollarSign className="h-4 w-4" aria-hidden="true" /> Financial ROI Engine</div>
      <div className="space-y-3">
        <FinanceRow label="Revenue" value={formatMoney(calculations.revenue)} />
        <FinanceRow label={`COGS (${calculations.cogsPercent}%)`} value={formatMoney(calculations.cogs)} />
        <FinanceRow label={`Labor (${calculations.waiters} waiters, ${calculations.bartenders} bartenders)`} value={formatMoney(calculations.laborCost)} />
        <div className="my-4 border-t border-[#6b705c]/30" />
        <FinanceRow label="Gross Profit" value={formatMoney(calculations.grossProfit)} strong />
        <FinanceRow label="Gross Margin" value={`${calculations.margin.toFixed(1)}%`} strong />
      </div>
      <div className={cx('mt-5 rounded-2xl border p-4 text-sm leading-7', cogsClass)}>
        <div className="mb-1 flex items-center gap-2 font-black"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> COGS Discipline</div>
        {cogsStatus === 'critical' ? 'COGS exceeds 30%. Reprice, reduce waste, renegotiate package costs, or adjust portion strategy before confirming the event.' : cogsStatus === 'watch' ? 'COGS is above the 22-28% target band. Watch premium garnish, seafood, and open-bar leakage.' : 'COGS is inside the target 22-28% band for high-end hospitality.'}
      </div>
    </Card>
  )
}

function RunOfShow() {
  const items = [
    { time: 'T-Minus 4h', title: 'Wine Cooling', detail: 'White, rose, sparkling and reception bottles must reach 7C before first pour.', icon: Thermometer },
    { time: 'T-Minus 1h', title: 'Brix Check', detail: 'Batched cocktails checked for sugar-acid balance and dilution before service.', icon: BadgePercent },
    { time: 'T-Plus 0', title: 'The Transition', detail: 'Move guests from reception to dinner without dead air, crowding, or visible staff confusion.', icon: Users },
    { time: 'EOD', title: 'Waste Audit And Bottle Count', detail: 'Record opened bottles, full bottles, broken glassware, food waste and recovery notes.', icon: ClipboardCheck }
  ]

  return (
    <Card>
      <div className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><Clock3 className="h-4 w-4" aria-hidden="true" /> Operational Run Of Show</div>
      <div className="relative space-y-5 ps-6">
        <div className="absolute bottom-0 start-2 top-0 w-px bg-[#6b705c]/30" />
        {items.map(item => {
          const Icon = item.icon
          return (
            <article key={item.time} className="relative rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-5">
              <div className="absolute -start-[1.95rem] top-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#11100d] text-[#c9a96e]"><Icon className="h-4 w-4" aria-hidden="true" /></div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{item.time}</div>
              <h3 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{item.detail}</p>
            </article>
          )
        })}
      </div>
      <ProTip icon={Timer}>Assign one manager to transitions only. Luxury events fail most often in the invisible handoffs, not the visible ceremony.</ProTip>
    </Card>
  )
}

function EventMetric({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]"><Icon className="h-5 w-5" aria-hidden="true" /></div>
      <div className="font-serif text-3xl font-black text-[#f5f5f0]">{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <p className="mt-2 text-xs leading-5 text-[#e8dcc0]">{sub}</p>
    </div>
  )
}

function NumberInput({ label, value, onChange, min, max, step = '1' }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">{label}</label>
      <input id={id} type="number" value={value} min={min} max={max} step={step} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20" />
    </div>
  )
}

function MiniFact({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#6b705c]/30 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-bold text-[#e8dcc0]">{label}</span>
      <span className="font-serif text-2xl font-black text-[#f5f5f0]">{value}</span>
    </div>
  )
}

function FinanceRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={cx('text-sm', strong ? 'font-black text-[#f5f5f0]' : 'text-[#e8dcc0]')}>{label}</span>
      <span className={cx('text-sm font-black', strong ? 'text-[#c9a96e]' : 'text-[#e8dcc0]')}>{value}</span>
    </div>
  )
}

function ProTip({ icon: Icon, children }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-4 text-sm leading-7 text-[#e8dcc0]">
      <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#c9a96e]"><Icon className="h-4 w-4" aria-hidden="true" /> Pro Tip</div>
      {children}
    </div>
  )
}

function formatMoney(value) {
  return `NIS ${Math.round(value).toLocaleString()}`
}

function Courses({ t, lang, goToPage }) {
  return (
    <>
      <Header eyebrow={t.areas.academy} title={t.copy.academyTitle} body={t.areaDescriptions.academy} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {COURSES.map(course => (
          <Card key={course.id} className="flex min-h-72 flex-col justify-between transition-all duration-300 hover:border-[#c9a96e]/50 hover:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c9a96e]">
                {localize(course.category, lang)}
              </div>
              <h2 className="mt-5 font-serif text-2xl font-black text-[#f5f5f0]">
                {localize(course.title, lang)}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#e8dcc0]">{localize(course.desc, lang)}</p>
            </div>
            <div>
              <Progress value={course.progress} label={localize(course.title, lang)} />
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-black text-[#e8dcc0]">{course.progress}%</span>
                <Button variant="ghost" onClick={() => goToPage('lessonPlayer')}>{t.ui.continue}</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

function LessonPlayer({ t, goToPage }) {
  return (
    <>
      <Header eyebrow={t.pages.lessonPlayer} title={t.pages.lessonPlayer} body={t.copy.academyTitle} />
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <Card className="border-[#c9a96e]/20">
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-[#6b705c]/30 bg-[#1b1a15]">
              <button className="flex h-24 w-24 items-center justify-center rounded-full bg-[#c9a96e] text-3xl font-black text-[#1a1a1a] transition hover:scale-105">
                ▶
              </button>
            </div>
          </Card>
          <Card className="border-l-4 border-l-[#c9a96e] bg-gradient-to-r from-[#c9a96e]/5 to-transparent">
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">HOSPIA Doctrine</h2>
            <p className="mt-4 font-serif text-xl italic leading-10 text-[#f5f5f0]">
              “{t.copy.doctrine}”
            </p>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <Label>Key Takeaways</Label>
            <List items={[
              'Acknowledge the guest before solving the technical problem.',
              'Use exact, calm language during delay moments.',
              'Protect trust before offering compensation.'
            ]} />
          </Card>

          <Card>
            <Label>Suggested Language</Label>
            <div className="rounded-2xl border-l-4 border-[#c9a96e] bg-[#1b1a15] p-5 font-serif text-lg italic leading-8 text-[#f5f5f0]">
              “I completely understand, and I will take care of this immediately.”
            </div>
          </Card>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => goToPage('knowledgeLibrary')}>{t.ui.askCoach}</Button>
            <Button variant="secondary" onClick={() => goToPage('simulation')}>{t.ui.practice}</Button>
            <Button variant="secondary">{t.ui.quickQuiz}</Button>
          </div>
        </div>
      </div>
    </>
  )
}

function EndOfDayReports({ t, reportArchive = [], onReportArchived }) {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)
  const [formData, setFormData] = useState({
    shift_date: new Date().toISOString().slice(0, 10),
    manager_name: '',
    shift_summary: '',
    complaints: '',
    service_recovery: '',
    staff_issues: '',
    sales_notes: '',
    urgent_items: ''
  })

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  async function sendEndOfDayReport(event) {
    event.preventDefault()
    setStatus(null)
    setSending(true)

    try {
      const emailjs = await loadEmailJS()

      await emailjs.send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          shift_date: formData.shift_date,
          manager_name: formData.manager_name,
          shift_summary: formData.shift_summary,
          complaints: formData.complaints,
          service_recovery: formData.service_recovery,
          staff_issues: formData.staff_issues,
          sales_notes: formData.sales_notes,
          urgent_items: formData.urgent_items
        },
        EMAILJS.publicKey
      )

      await onReportArchived?.({ ...formData })
      setStatus({ type: 'success', message: t.ui.reportSent })
      setFormData({
        shift_date: new Date().toISOString().slice(0, 10),
        manager_name: '',
        shift_summary: '',
        complaints: '',
        service_recovery: '',
        staff_issues: '',
        sales_notes: '',
        urgent_items: ''
      })
    } catch (error) {
      console.error('EmailJS failed:', error)
      setStatus({ type: 'error', message: t.ui.reportError })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Header eyebrow={t.pages.endOfDay} title={t.pages.endOfDay} body={t.copy.endOfDayBody} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <form onSubmit={sendEndOfDayReport} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="shift_date" label={t.fields.shiftDate} type="date" value={formData.shift_date} onChange={value => updateField('shift_date', value)} />
              <Field id="manager_name" label={t.fields.managerName} value={formData.manager_name} onChange={value => updateField('manager_name', value)} />
            </div>
            <TextArea id="shift_summary" label={t.fields.shiftSummary} value={formData.shift_summary} onChange={value => updateField('shift_summary', value)} />
            <TextArea id="complaints" label={t.fields.complaints} value={formData.complaints} onChange={value => updateField('complaints', value)} />
            <TextArea id="service_recovery" label={t.fields.serviceRecovery} value={formData.service_recovery} onChange={value => updateField('service_recovery', value)} />
            <TextArea id="staff_issues" label={t.fields.staffIssues} value={formData.staff_issues} onChange={value => updateField('staff_issues', value)} />
            <TextArea id="sales_notes" label={t.fields.salesNotes} value={formData.sales_notes} onChange={value => updateField('sales_notes', value)} />
            <TextArea id="urgent_items" label={t.fields.urgentItems} value={formData.urgent_items} onChange={value => updateField('urgent_items', value)} />

            {status && <Alert type={status.type}>{status.message}</Alert>}

            <Button type="submit" disabled={sending}>
              {sending ? t.ui.submitting : t.ui.submitForm}
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
            <Label>Report Archive</Label>
            <div className="font-serif text-5xl font-black text-[#c9a96e]">{reportArchive.length}</div>
            <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">Successful EmailJS submissions are preserved locally as shift memory. This is the future database-backed archive.</p>
          </Card>
          <Card>
            <Label>Latest Reports</Label>
            {reportArchive.length ? (
              <div className="space-y-3">
                {reportArchive.slice(0, 5).map(report => (
                  <article key={report.id} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-[#e8dcc0]">{report.shift_date}</span>
                      <span className="text-xs text-[#e8dcc0]">{report.manager_name || 'Manager'}</span>
                    </div>
                    <p className="line-clamp-3 text-xs leading-6 text-[#e8dcc0]">{report.urgent_items || report.shift_summary || 'Report submitted without urgent items.'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[#e8dcc0]">No submitted reports archived yet.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

function StaffReadiness({ t }) {
  const [serviceContext, setServiceContext] = useState('standard')
  const avgProgress = Math.round(STAFF.reduce((sum, item) => sum + item.progress, 0) / STAFF.length)
  const avgSimulation = Math.round(STAFF.reduce((sum, item) => sum + item.simulation, 0) / STAFF.length)
  const coachingCount = STAFF.filter(item => item.status === 'Needs Coaching' || item.status === 'At Risk').length

  const serviceRequirements = {
    standard: { label: 'Standard Shift', minSim: 70, weight: 'Balanced' },
    highVolume: { label: 'High Volume / Peak', minSim: 80, weight: 'Efficiency' },
    vipEvent: { label: 'VIP / Fine Dining', minSim: 85, weight: 'Recovery & Language' }
  }

  const deploymentMetrics = useMemo(() => {
    const req = serviceRequirements[serviceContext]
    const readyStaff = STAFF.filter(s => s.simulation >= req.minSim).length
    const teamScore = Math.round((readyStaff / STAFF.length) * 100)
    return { readyStaff, teamScore, req }
  }, [serviceContext])

  const statusClass = {
    Certified: 'border-emerald-800/50 bg-emerald-950/25 text-emerald-200',
    Active: 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]',
    'Needs Coaching': 'border-amber-800/50 bg-amber-950/25 text-amber-200',
    'At Risk': 'border-red-800/50 bg-red-950/25 text-red-200'
  }

  return (
    <>
      <Header eyebrow={t.pages.staffReadiness} title="Team Deployment Optimizer" body="Move beyond tracking progress. Optimize your floor plan based on actual simulation scores and tonight's service requirements." />
      
      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_350px]">
        <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Label>Tonight's Service Context</Label>
              <div className="flex gap-2">
                {Object.entries(serviceRequirements).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setServiceContext(key)}
                    className={cx(
                      'rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition',
                      serviceContext === key ? 'border-[#c9a96e] bg-[#c9a96e] text-[#0d0c09]' : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/50'
                    )}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#6b705c]/30 p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0] mb-2">Team Readiness Score</div>
              <div className={cx('font-serif text-5xl font-black', deploymentMetrics.teamScore > 80 ? 'text-emerald-400' : 'text-[#c9a96e]')}>
                {deploymentMetrics.teamScore}%
              </div>
              <p className="mt-2 text-xs text-[#e8dcc0]">Based on {deploymentMetrics.req.minSim}% simulation threshold</p>
            </div>
            <div className="rounded-2xl border border-[#6b705c]/30 p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0] mb-2">Deployment Strategy</div>
              <div className="text-lg font-bold text-[#f5f5f0]">{deploymentMetrics.readyStaff} of {STAFF.length} staff cleared</div>
              <p className="mt-2 text-xs text-[#e8dcc0]">Critical focus: {deploymentMetrics.req.weight}</p>
            </div>
          </div>
        </Card>
        <Card className="border-[#c9a96e]/20">
          <Label>AI Allocation Guidance</Label>
          <p className="text-sm leading-7 text-[#e8dcc0]">
            {deploymentMetrics.teamScore < 70 
              ? "Warning: Team technical depth is insufficient for this service level. Assign Noa B. to the primary VIP zone and mandate a 10-minute briefing for Dana and Oren."
              : "Team is healthy for standard operations. Leverage Yoav S. as shift lead for secondary zones."}
          </p>
        </Card>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Avg Training" value={`${avgProgress}%`} sub="Across active staff" />
        <Metric label="Avg Simulation" value={`${avgSimulation}%`} sub="Target: 85%" />
        <Metric label="Certified" value={String(STAFF.filter(item => item.status === 'Certified').length)} sub={`${STAFF.length} staff tracked`} />
        <Metric label="Coaching Required" value={String(coachingCount)} sub="Manager attention" />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#e8dcc0]">
                <th className="border-b border-[#6b705c]/30 p-3">Staff Member</th>
                <th className="border-b border-[#6b705c]/30 p-3">Academy</th>
                <th className="border-b border-[#6b705c]/30 p-3">Simulation</th>
                <th className="border-b border-[#6b705c]/30 p-3">Strongest Area</th>
                <th className="border-b border-[#6b705c]/30 p-3">Needs Work</th>
                <th className="border-b border-[#6b705c]/30 p-3">Status</th>
                <th className="border-b border-[#6b705c]/30 p-3">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {STAFF.map(item => (
                <tr key={item.name} className="text-sm transition hover:bg-[#6b705c]/10">
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <div className="font-black text-[#f5f5f0]">{item.name}</div>
                    <div className="text-xs text-[#e8dcc0]">{item.role}</div>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-[90px] flex-1"><Progress value={item.progress} label={item.name} /></div>
                      <span className="w-9 text-xs font-black text-[#e8dcc0]">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <span className={cx('font-black', item.simulation >= 80 ? 'text-emerald-400' : item.simulation >= 65 ? 'text-[#c9a96e]' : 'text-red-400')}>{item.simulation}%</span>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">{item.strong}</td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">{item.weak}</td>
                  <td className="border-b border-[#6b705c]/30 p-3"><span className={cx('rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]', statusClass[item.status])}>{item.status}</span></td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs leading-5 text-[#e8dcc0]">{item.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="mt-5 border-amber-900/40 bg-amber-950/10">
        <Label>Highest Leverage Coaching Move</Label>
        <p className="text-sm leading-7 text-[#e8dcc0]">Do not wait for a guest complaint to discover readiness risk. Dana and Oren should complete one recovery simulation before the weekend, then be paired with Noa for live language calibration.</p>
      </Card>
    </>
  )
}

function ServiceRecovery({ t }) {
  const [activeStep, setActiveStep] = useState(0)
  const [isLogging, setIsLogging] = useState(false)
  const [incident, setIncident] = useState({ table: '', issue: '', recoveryCost: 0 })

  const steps = [
    { title: 'Acknowledge', label: 'Step 1', script: 'I completely understand, and I am truly sorry. That is not the experience we wanted for you tonight.', guidance: 'Listen without interrupting. Validate the emotion before explaining anything. The guest must feel heard before they can feel helped.' },
    { title: 'Own', label: 'Step 2', script: 'That is on us, and I take responsibility for fixing it.', guidance: 'Never blame the kitchen, the host stand, another server, or the guest. Ownership calms the room and gives the guest confidence.' },
    { title: 'Act', label: 'Step 3', script: 'Here is what I am going to do right now. I will personally follow up with you in five minutes.', guidance: 'Offer a specific action and a clear follow-up. Compensation can come later, but confidence and movement must come first.' }
  ]

  const logIncident = () => {
    // Logic to push to Business Memory would go here
    setIsLogging(false)
    setIncident({ table: '', issue: '', recoveryCost: 0 })
    alert("Incident Logged to Business Memory. ROI impact updated.")
  }

  return (
  <div className="space-y-8">
    <Header
  eyebrow={t.pages.serviceRecovery}
  title="Recovery Command Center"
  body="A live tactical tool for restoring guest trust, logging incidents, and protecting revenue."
/>
      
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Active Recovery Protocol</h2>
          <Button onClick={() => setIsLogging(true)} variant={isLogging ? 'ghost' : 'primary'}>
            {isLogging ? 'Cancel Log' : 'Log Live Incident'}
          </Button>
          
        </div>

        {isLogging && (
          <Card className="mb-8 border-[#c9a96e] bg-[#1a1a1a] animate-in slide-in-from-top-4 duration-300">
            <Label>Rapid Incident Documentation</Label>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Table #" value={incident.table} onChange={v => setIncident({...incident, table: v})} />
              <div className="md:col-span-2">
                <Field label="Primary Issue (Delay, Quality, Language)" value={incident.issue} onChange={v => setIncident({...incident, issue: v})} />
              </div>
              <Field label="Est. Recovery Cost (NIS)" type="number" value={incident.recoveryCost} onChange={v => setIncident({...incident, recoveryCost: v})} />
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={logIncident}>Commit to Memory</Button>
              <p className="text-xs text-[#e8dcc0] self-center italic">This will update the Business MRI and Profit Leak trackers instantly.</p>
            </div>
          </Card>
        )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <button key={step.title} type="button" onClick={() => setActiveStep(index)} className={cx('w-full rounded-2xl border p-5 text-left transition', activeStep === index ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]')}>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">{step.label}</div>
              <div className="mt-2 font-serif text-3xl font-black">{step.title}</div>
            </button>
          ))}
        </div>
        <Card className="border-[#c9a96e]/20">
          <Label>Exact Language</Label>
          <div className="rounded-2xl border-l-4 border-[#c9a96e] bg-[#1a1a1a] p-5">
            <p className="font-serif text-2xl italic leading-10 text-[#f5f5f0]">"{steps[activeStep].script}"</p>
          </div>
          <div className="mt-6">
            <Label>Execution Guidance</Label>
            <p className="text-sm leading-8 text-[#e8dcc0]">{steps[activeStep].guidance}</p>
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-red-900/40">
          <Label>Do Not Say</Label>
          <List items={['That is how it is supposed to be.', 'The kitchen is backed up.', 'I am sorry, but...', 'What do you want me to do?']} />
        </Card>
        <Card className="border-emerald-900/40">
          <Label>Recovery Paradox</Label>
          <p className="font-serif text-2xl italic leading-9 text-[#f5f5f0]">A guest recovered with excellence can become more loyal than a guest who never had a problem.</p>
        </Card>
        <Card>
          <Label>Compensation Rule</Label>
          <p className="text-sm leading-7 text-[#e8dcc0]">Compensation is a controlled tool, not the default apology. Attempt recovery first, document the event, and escalate only when needed.</p>
        </Card>
        </div>
              </section>
    </div>
  )
}

function Simulation({ t }) {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [result, setResult] = useState(null)
  const scenario = SIMULATION_SCENARIOS[scenarioIndex]

  function selectScenario(index) {
    setScenarioIndex(index)
    setResponse('')
    setResult(null)
  }

  function scoreResponse() {
    const text = response.trim()
    if (!text) return

    const hasEmpathy = /sorry|understand|apologize|apologise|right/i.test(text)
    const hasOwnership = /i will|i am|on us|responsibility|personally|take care/i.test(text)
    const hasSpecificAction = /minutes|bring|replace|fix|check|right now|immediately|follow up/i.test(text)
    const hasHospitality = /you|your|tonight|experience|guest|comfortable/i.test(text)
    const lengthBonus = Math.min(18, Math.floor(text.length / 18))

    const empathy = Math.min(100, 42 + (hasEmpathy ? 28 : 0) + lengthBonus)
    const professionalism = Math.min(100, 45 + (hasOwnership ? 25 : 0) + lengthBonus)
    const solution = Math.min(100, 40 + (hasSpecificAction ? 32 : 0) + lengthBonus)
    const hosting = Math.min(100, 42 + (hasHospitality ? 25 : 0) + lengthBonus)
    const revenue = Math.min(100, 38 + (hasSpecificAction ? 22 : 0) + (hasOwnership ? 12 : 0) + Math.floor(lengthBonus / 2))
    const overall = Math.round((empathy + professionalism + solution + hosting + revenue) / 5)

    setResult({ empathy, professionalism, solution, hosting, revenue, overall })
  }

  return (
    <>
      <Header eyebrow={t.pages.simulation} title="Guest Simulation Arena" body="Practice real guest moments and receive a structured score across empathy, ownership, solution quality, hosting presence, and revenue protection." />
      <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
        {SIMULATION_SCENARIOS.map((item, index) => (
          <button key={item.id} type="button" onClick={() => selectScenario(index)} className={cx('min-w-[190px] rounded-2xl border p-4 text-left transition', scenarioIndex === index ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]')}>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{item.difficulty}</div>
            <div className="mt-1 text-sm font-black">{item.title}</div>
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Card>
            <Label>Scenario</Label>
            <p className="mb-4 text-sm italic leading-7 text-[#e8dcc0]">{scenario.context}</p>
            <div className="rounded-2xl border-l-4 border-[#6b705c]/50 bg-[#1a1a1a] p-5">
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">Guest says</div>
              <p className="font-serif text-2xl italic leading-10 text-[#f5f5f0]">"{scenario.guest}"</p>
            </div>
          </Card>
          <Card>
            <Label>Your Response</Label>
            <TextArea id="simulation-response" label="" value={response} onChange={setResponse} />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={scoreResponse} disabled={!response.trim()}>Score Response</Button>
              <Button variant="secondary" onClick={() => selectScenario(scenarioIndex)}>Reset</Button>
            </div>
          </Card>
          {result && (
            <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
              <Label>Ideal HOSPIA Response</Label>
              <p className="font-serif text-xl italic leading-9 text-[#f5f5f0]">"{scenario.ideal}"</p>
            </Card>
          )}
        </div>
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <Label>Score Dimensions</Label>
            {result && <div className={cx('font-serif text-5xl font-black', result.overall >= 80 ? 'text-emerald-400' : result.overall >= 65 ? 'text-[#c9a96e]' : 'text-red-400')}>{result.overall}%</div>}
          </div>
          {result ? (
            <>
              <ProgressBlock label="Empathy" value={result.empathy} />
              <ProgressBlock label="Professionalism" value={result.professionalism} />
              <ProgressBlock label="Solution Quality" value={result.solution} />
              <ProgressBlock label="Hosting Presence" value={result.hosting} />
              <ProgressBlock label="Revenue Protection" value={result.revenue} />
            </>
          ) : (
            <List items={['Empathy: acknowledges emotion before explaining.', 'Ownership: speaks as a host with authority.', 'Solution quality: gives a specific next move.', 'Revenue protection: preserves trust and return intent.']} />
          )}
        </Card>
      </div>
    </>
  )
}

function KnowledgeLibrary({ t, lang }) {
  const [activeTab, setActiveTab] = useState('classics')
  const [query, setQuery] = useState('')
  const [selectedCocktail, setSelectedCocktail] = useState(null)

  const atlasTabs = [
    { id: 'classics', label: { en: 'Classics', he: 'קלאסיקות' }, icon: Wine },
    { id: 'masterclass', label: { en: 'Spirits', he: 'תזקיקים' }, icon: GlassWater },
    { id: 'techniques', label: { en: 'Techniques', he: 'טכניקות' }, icon: Sparkles },
    { id: 'training', label: { en: 'Training', he: 'הדרכה' }, icon: ClipboardCheck },
    { id: 'profit', label: { en: 'Profit', he: 'רווח' }, icon: CircleDollarSign }
  ]

  const filteredCocktails = useMemo(() => {
    const q = query.toLowerCase().trim()
    return cocktailLibrary.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.family.toLowerCase().includes(q) || 
      c.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="space-y-12">
      {/* FLAGSHIP HERO */}
      <section className="relative overflow-hidden rounded-[3rem] border border-[#c9a96e]/30 bg-[radial-gradient(circle_at_80%_20%,rgba(201,169,110,0.2),transparent_40%),linear-gradient(135deg,#1c1b17,#0a0a08)] p-8 sm:p-12 lg:p-20 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="absolute right-0 top-0 hidden lg:block opacity-5 pointer-events-none select-none">
          <Wine size={600} strokeWidth={0.5} color="#c9a96e" />
        </div>
        <div className="relative max-w-5xl">
          <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-[#c9a96e]">
            <div className="h-px w-12 bg-[#c9a96e]" />
            The Grand Bar Atlas
          </div>
          <h1 className="font-serif text-6xl font-black tracking-tight text-[#f5f5f0] sm:text-8xl lg:text-9xl leading-[0.95]">
            Luxury Bar <span className="text-[#c9a96e]">Intelligence</span>
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-10 text-[#e8dcc0] font-light italic">
            "Mixology is the science. Hospitality is the alchemy. The Atlas is your roadmap to Michelin-grade service execution."
          </p>
          <div className="mt-12 flex flex-wrap gap-8 border-t border-[#6b705c]/20 pt-12">
            <EditorialStat value={cocktailLibrary.length} label="Cocktail Canon" />
            <EditorialStat value={ATLAS_MASTERCLASSES.length} label="Spirit Modules" />
            <EditorialStat value={ATLAS_TECHNIQUES.length} label="Technique Drills" />
          </div>
        </div>
      </section>

      {/* PREMIUM CATEGORY NAVIGATION */}
      <nav className="sticky top-20 z-30 flex flex-wrap gap-2 rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a]/90 p-2 backdrop-blur-xl">
        {atlasTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setQuery(''); }}
              className={cx(
                'flex flex-1 min-w-[140px] items-center justify-center gap-3 rounded-xl py-4 text-xs font-black uppercase tracking-widest transition-all duration-300',
                activeTab === tab.id ? 'bg-[#c9a96e] text-[#0d0c09] shadow-lg scale-[1.02]' : 'text-[#e8dcc0] hover:bg-[#c9a96e]/10 hover:text-[#f5f5f0]'
              )}
            >
              <Icon size={16} />
              {localize(tab.label, lang)}
            </button>
          )
        })}
      </nav>

      {/* CONTENT SWITCHER */}
      <div className="min-h-[60vh]">
        {activeTab === 'classics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="font-serif text-5xl font-black text-[#f5f5f0]">World Cocktail Canon</h2>
              <div className="relative w-full max-w-md">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search the canon..."
                  className="w-full rounded-2xl border border-[#6b705c]/40 bg-[#11100d] px-6 py-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e] focus:ring-4 focus:ring-[#c9a96e]/10 transition-all"
                />
              </div>
            </div>
            {filteredCocktails.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCocktails.map(c => <CocktailCard key={c.name} cocktail={c} onOpen={() => setSelectedCocktail(c)} />)}
              </div>
            ) : (
              <div className="py-20 text-center rounded-[3rem] border border-dashed border-[#6b705c]/30">
                <p className="text-xl text-[#e8dcc0] font-serif italic">No masterpieces match your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'masterclass' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_MASTERCLASSES.map(m => (
              <Card key={m.id} className="group hover:border-[#c9a96e]/60 transition-all">
                <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">{m.level}</div>
                <h3 className="font-serif text-3xl font-black text-[#f5f5f0] mb-3 group-hover:text-[#c9a96e] transition-colors">{m.title}</h3>
                <p className="text-sm leading-7 text-[#e8dcc0]">{m.desc}</p>
                <Button variant="ghost" className="mt-6 w-full border border-[#6b705c]/30">Open Module</Button>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_TECHNIQUES.map(t => (
              <Card key={t.title} className="flex gap-6 items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20">
                  <Sparkles size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-1">{t.category}</div>
                  <h3 className="font-serif text-3xl font-black text-[#f5f5f0] mb-2">{t.title}</h3>
                  <p className="text-sm leading-7 text-[#e8dcc0]">{t.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'training' && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_TRAINING_CARDS.map(card => (
              <Card key={card.title} className="bg-gradient-to-r from-[#1c1b17] to-[#11100d] border-l-4 border-l-[#c9a96e]">
                <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">Protocol: {card.objective}</div>
                    <h3 className="font-serif text-3xl font-black text-[#f5f5f0]">{card.title}</h3>
                  </div>
                  <p className="text-xl font-serif italic text-[#e8dcc0] border-l border-[#6b705c]/30 pl-8">{card.action}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_PROFIT_INSIGHTS.map(item => (
              <Card key={item.title} className="border-[#c9a96e]/20 hover:border-[#c9a96e]/50">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{item.title}</h3>
                  <div className="text-right">
                    <div className="text-xs font-black text-[#c9a96e] uppercase tracking-tighter">Est. Leakage</div>
                    <div className="text-2xl font-serif font-black text-[#f5f5f0]">{item.impact}</div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#c9a96e]/5 border border-[#c9a96e]/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-1">Standard Solution</div>
                  <p className="text-sm font-bold text-[#e8dcc0]">{item.solution}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedCocktail && (
        <CocktailArticleModal cocktail={selectedCocktail} onClose={() => setSelectedCocktail(null)} />
      )}
    </div>
  )
}

function EditorialStat({ value, label }) {
  return (
    <div className="flex flex-col">
      <div className="font-serif text-5xl font-black text-[#c9a96e] leading-none mb-2">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8dcc0]">{label}</div>
    </div>
  )
}

function CocktailCard({ cocktail, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group relative flex h-[480px] flex-col justify-end overflow-hidden rounded-[2.5rem] border border-[#6b705c]/30 bg-[#11100d] p-8 text-left transition-all duration-500 hover:-translate-y-2 hover:border-[#c9a96e]/50 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c09] via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.1),transparent_50%)]" />
      
      <div className="relative z-10 translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">{cocktail.family}</span>
          <span className="text-[10px] font-bold text-[#e8dcc0]">{cocktail.origin.split(',')[0]}</span>
        </div>
        <h3 className="font-serif text-4xl font-black text-[#f5f5f0] mb-4 group-hover:text-[#c9a96e] transition-colors">{cocktail.name}</h3>
        <p className="line-clamp-2 text-sm leading-7 text-[#e8dcc0] mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{cocktail.story}</p>
        <div className="flex flex-wrap gap-2">
          {cocktail.tags.slice(0, 3).map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
      </div>
    </button>
  )
}

function CocktailArticleModal({ cocktail, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl animate-in fade-in duration-300">
      <button className="absolute right-8 top-8 text-[#e8dcc0] hover:text-[#f5f5f0] transition-colors" onClick={onClose}><span className="text-sm font-black uppercase tracking-widest">Close Atlas</span></button>
      <article className="h-full max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-[3rem] border border-[#c9a96e]/30 bg-[#0d0c09] shadow-2xl">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0">
          {/* LEFT COLUMN: Editorial Story */}
          <div className="p-8 sm:p-16 lg:border-r border-[#6b705c]/20">
            <div className="mb-8 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-[#c9a96e]">
              <div className="h-px w-8 bg-[#c9a96e]" />
              {cocktail.family} • {cocktail.era}
            </div>
            <h2 className="font-serif text-7xl sm:text-9xl font-black text-[#f5f5f0] leading-[0.85] tracking-tighter mb-12">{cocktail.name}</h2>
            
            <div className="space-y-12">
              <div>
                <Label>The Origin & Narrative</Label>
                <p className="font-serif text-3xl leading-relaxed text-[#f5f5f0] font-light">{cocktail.story}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-[#6b705c]/20">
                <div><Label>Service Note</Label><p className="text-sm leading-7 text-[#e8dcc0]">{cocktail.serviceNote}</p></div>
                <div><Label>Bartender Mistake</Label><p className="text-sm leading-7 text-red-300 font-bold">Never over-dilute or use wet ice. The architecture of {cocktail.name} depends on thermal precision.</p></div>
              </div>

              <div className="rounded-3xl bg-[#c9a96e]/10 p-8 border border-[#c9a96e]/20">
                <Label>Guest Recommendation Script</Label>
                <p className="font-serif text-2xl italic text-[#f5f5f0] leading-relaxed">
                  "If you appreciate a {cocktail.tags[0].toLowerCase()} profile with historical weight, the {cocktail.name} is exceptional. Would you prefer yours served precisely to the classic spec, or with a slight adjustment to the {cocktail.tags[1].toLowerCase()} notes?"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Execution Specs */}
          <div className="bg-[#11100d] p-8 sm:p-16 space-y-12">
            <div>
              <Label>Precise Formulation</Label>
              <div className="space-y-3">
                {cocktail.ingredients.map(ing => (
                  <div key={ing} className="flex items-center justify-between border-b border-[#6b705c]/20 pb-4 text-xl font-serif text-[#f5f5f0]">
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ArticleSpec label="Vessel" value={cocktail.glassware} />
              <ArticleSpec label="Methodology" value={cocktail.method} />
              <ArticleSpec label="Ice Ritual" value={cocktail.ice} />
              <ArticleSpec label="Final Touch" value={cocktail.garnish} />
            </div>

            <div className="pt-8 border-t border-[#6b705c]/20">
              <Label>Sensory Indicators</Label>
              <div className="flex flex-wrap gap-2">
                {cocktail.tags.map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">
      {children}
    </span>
  )
}

function ArticleSpec({ label, value }) {
  return (
    <div className="group rounded-2xl border border-[#6b705c]/20 bg-[#0d0c09] p-6 transition-colors hover:border-[#c9a96e]/40">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-2">{label}</div>
      <div className="text-lg font-bold text-[#f5f5f0]">{value}</div>
    </div>
  )
}


function OperationalNotes({ t }) {
  const [notes, setNotes] = useState([
    { id: 1, date: '2026-05-03', author: 'Manager', text: 'Dinner service delay pressure expected between 19:30 and 20:15. Brief floor team before doors.', pinned: true },
    { id: 2, date: '2026-05-02', author: 'Manager', text: 'Bar team improved second-drink recommendations after pre-shift role play.', pinned: false },
    { id: 3, date: '2026-04-30', author: 'Manager', text: 'Dana needs one-on-one recovery coaching before next weekend shift.', pinned: false }
  ])
  const [draft, setDraft] = useState('')

  function addNote() {
    if (!draft.trim()) return
    setNotes(prev => [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), author: 'Manager', text: draft.trim(), pinned: false }, ...prev])
    setDraft('')
  }

  return (
    <>
      <Header eyebrow={t.pages.operationalNotes} title="Operational Notes And Shift Memory" body="Capture manager observations that should not disappear after service. Pinned notes become the next-shift briefing layer." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {notes.map(note => (
            <article key={note.id} className={cx('rounded-2xl border bg-[#14130f] p-5', note.pinned ? 'border-[#c9a96e]/35' : 'border-[#6b705c]/30')}>
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {note.pinned && <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">Pinned</span>}
                  <span className="text-xs text-[#e8dcc0]">{note.date} - {note.author}</span>
                </div>
                <button type="button" onClick={() => setNotes(prev => prev.map(item => item.id === note.id ? { ...item, pinned: !item.pinned } : item))} className="text-xs font-bold text-[#e8dcc0] transition hover:text-[#c9a96e]">{note.pinned ? 'Unpin' : 'Pin'}</button>
              </div>
              <p className="text-sm leading-7 text-[#e8dcc0]">{note.text}</p>
            </article>
          ))}
        </div>
        <Card className="h-fit">
          <Label>Add Operational Note</Label>
          <TextArea id="new-operational-note" label="" value={draft} onChange={setDraft} rows={5} />
          <Button className="mt-3 w-full" onClick={addNote}>Add Note</Button>
          <p className="mt-4 text-xs leading-6 text-[#e8dcc0]">Use this for patterns, staff concerns, VIP context, recovery follow-up, or anything ownership should remember later.</p>
        </Card>
      </div>
    </>
  )
}

function SOPSheets({ t }) {
  const [activeId, setActiveId] = useState(SOP_SHEETS[0].id)
  const active = SOP_SHEETS.find(item => item.id === activeId) || SOP_SHEETS[0]

  return (
    <>
      <Header eyebrow={t.pages.sopSheets} title="Service Standard Operating Procedures" body="Fast, precise SOP sheets for the moments that create or destroy guest trust." />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {SOP_SHEETS.map(sheet => (
            <button key={sheet.id} type="button" onClick={() => setActiveId(sheet.id)} className={cx('w-full rounded-2xl border p-4 text-left transition', activeId === sheet.id ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]')}>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{sheet.code}</div>
              <div className="mt-1 text-sm font-black leading-5">{sheet.title}</div>
              <div className="mt-1 text-xs text-[#e8dcc0]">{sheet.category}</div>
            </button>
          ))}
        </div>
        <div className="space-y-5">
          <Card className="border-[#c9a96e]/20">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{active.code} - {active.category}</div>
                <h2 className="mt-2 font-serif text-4xl font-black text-[#f5f5f0]">{active.title}</h2>
              </div>
              <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{active.standard}</span>
            </div>
            <div className="space-y-3">
              {active.steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <span className="w-8 shrink-0 font-serif text-2xl font-black text-[#c9a96e]">{index + 1}</span>
                  <p className="text-sm leading-7 text-[#e8dcc0]">{step}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-[#c9a96e]/15 bg-[#1a1a1a]">
            <Label>Manager Note</Label>
            <p className="text-sm leading-7 text-[#e8dcc0]">{active.managerNote}</p>
          </Card>
        </div>
      </div>
    </>
  )
}

function LearningProgress({ t }) {
  const totalLessons = COURSES.reduce((sum, course) => sum + course.lessons, 0)
  const completedLessons = Math.round(COURSES.reduce((sum, course) => sum + course.lessons * (course.progress / 100), 0))
  const average = Math.round(COURSES.reduce((sum, course) => sum + course.progress, 0) / COURSES.length)

  return (
    <>
      <Header eyebrow={t.pages.learningProgress} title="Learning Progress And Certification Path" body="A focused employee view of what has been completed, what is next, and which service standard should be practiced before the next shift." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Overall Progress" value={`${average}%`} sub="Across academy" />
        <Metric label="Lessons Complete" value={String(completedLessons)} sub={`of ${totalLessons}`} />
        <Metric label="Active Courses" value={String(COURSES.filter(course => course.progress > 0 && course.progress < 100).length)} sub="In progress" />
        <Metric label="Next Certification" value="Recovery" sub="Recommended" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {COURSES.map(course => (
          <Card key={course.id}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">Course {course.id}</div>
                <h2 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">{course.title.en}</h2>
              </div>
              <span className="font-serif text-3xl font-black text-[#c9a96e]">{course.progress}%</span>
            </div>
            <Progress value={course.progress} label={course.title.en} />
            <p className="mt-3 text-xs leading-6 text-[#e8dcc0]">{course.lessons} lessons - {course.desc.en}</p>
          </Card>
        ))}
      </div>
    </>
  )
}

function ExecutiveOverview({ t, reportArchive = [], eventPlans = [] }) {
  const latestReport = reportArchive[0]
  const latestEvent = eventPlans[0]

  return (
    <>
      <Header eyebrow={t.areas.ownerIntelligence} title="Executive Overview" body="Owner-grade business intelligence: profit exposure, readiness risk, and the highest leverage decisions for this week." />
      <Card className="mb-6 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.18),transparent_35%),linear-gradient(135deg,#191812,#11100d)] p-7">
        <div className="max-w-4xl">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c9a96e]">Weekly Command Summary</div>
          <h2 className="mt-3 font-serif text-4xl font-black tracking-tight text-[#f5f5f0]">HOSPIA identified NIS 27.1k in monthly leakage and NIS 12.9k recoverable within 30 days.</h2>
          <p className="mt-4 text-sm leading-8 text-[#e8dcc0]">The strongest drivers are compensation before recovery, missed beverage upsells, and unmanaged kitchen delays. The next move is not more data - it is manager execution.</p>
        </div>
      </Card>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Monthly Leakage" value="NIS 27.1k" sub="Identified" />
        <Metric label="Recoverable Now" value="NIS 12.9k" sub="30-day target" />
        <Metric label="Hospitality Score" value="87" sub="+4 this week" />
        <Metric label="EOD Archive" value={String(reportArchive.length)} sub={latestReport ? `Latest: ${latestReport.shift_date}` : 'No reports yet'} />
        <Metric label="Saved Events" value={String(eventPlans.length)} sub={latestEvent ? formatMoney(latestEvent.projected_profit || 0) : 'No event plans yet'} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Label>Top Owner Priorities</Label><List items={['Enforce recovery-first compensation policy.', 'Mandate beverage recommendation training for floor and bar.', 'Resolve Dana P. readiness risk before weekend.', 'Review Friday delay pattern with manager and kitchen lead.']} /></Card>
        <Card><Label>{latestReport ? 'Latest End Of Day Signal' : t.copy.aiRecommendations}</Label><List items={latestReport ? [
          latestReport.shift_summary || 'No shift summary entered.',
          latestReport.complaints ? `Complaints: ${latestReport.complaints}` : 'No complaint detail entered.',
          latestReport.urgent_items ? `Urgent: ${latestReport.urgent_items}` : 'No urgent owner items entered.'
        ] : ['Treat service recovery as financial governance, not soft skills.', 'Use End Of Day consistency to build a defensible business memory layer.', 'Convert Knowledge Library usage into staff readiness signals in production.']} /></Card>
      </div>
    </>
  )
}

function BusinessMRI({ t }) {
  const dimensions = [
    ['First Impression', 84, 'good'],
    ['Delay Communication', 61, 'warning'],
    ['Complaint Recovery', 67, 'warning'],
    ['Natural Upselling', 52, 'critical'],
    ['Farewell And Return Intent', 91, 'good'],
    ['Staff Readiness', 74, 'warning'],
    ['Beverage Service', 83, 'good']
  ]
  const score = Math.round(dimensions.reduce((sum, item) => sum + item[1], 0) / dimensions.length)
  const colors = { good: 'bg-emerald-500 text-emerald-300', warning: 'bg-amber-500 text-amber-300', critical: 'bg-red-500 text-red-300' }

  return (
    <>
      <Header eyebrow={t.pages.businessMRI} title="Business MRI" body="A diagnostic scan of the service dimensions that influence revenue, guest trust, and management focus." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center gap-6">
          <div><div className="font-serif text-7xl font-black text-[#c9a96e]">{score}</div><div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">Overall MRI Score</div></div>
          <p className="max-w-2xl font-serif text-2xl leading-10 text-[#f5f5f0]">Two weak points are currently dragging operational value: Natural Upselling and Delay Communication.</p>
        </div>
      </Card>
      <Card>
        <Label>Dimension Scan</Label>
        <div className="space-y-4">
          {dimensions.map(([label, value, status]) => (
            <div key={label} className="grid gap-3 sm:grid-cols-[220px_1fr_60px] sm:items-center">
              <div className="text-sm font-bold text-[#e8dcc0]">{label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/30"><div className={cx('h-full rounded-full', colors[status].split(' ')[0])} style={{ width: `${value}%` }} /></div>
              <div className={cx('text-sm font-black sm:text-right', colors[status].split(' ')[1])}>{value}%</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

function ProfitLeaks({ t }) {
  const [leakFixRate, setLeakFixRate] = useState(30) // Slider for "How much can we fix?"
  const total = PROFIT_LEAKS.reduce((sum, leak) => sum + leak.monthly, 0)
  const projectedRecovery = Math.round(total * (leakFixRate / 100))
  
  const riskClass = { high: 'border-red-800/50 bg-red-950/25 text-red-200', medium: 'border-amber-800/50 bg-amber-950/25 text-amber-200', low: 'border-[#6b705c]/50 bg-[#6b705c]/25 text-[#e8dcc0]' }

  return (
    <>
      <Header eyebrow={t.pages.profitLeaks} title="Profit Leak Intelligence" body="Revenue leaving the building through preventable execution failures. Use the calculator below to model your recovery ROI." />
      
      <section className="mb-12">
        <Card className="bg-gradient-to-br from-[#1c1b17] to-[#0a0a08] border-[#c9a96e]/30">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] items-center">
            <div>
              <Label>Leak Recovery Modeling</Label>
              <h2 className="font-serif text-4xl font-black text-[#f5f5f0] mb-6">
                If we improve execution by <span className="text-[#c9a96e]">{leakFixRate}%</span>...
              </h2>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={leakFixRate} 
                onChange={(e) => setLeakFixRate(e.target.value)}
                className="w-full h-2 bg-[#6b705c]/30 rounded-lg appearance-none cursor-pointer accent-[#c9a96e]"
              />
              <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]">
                <span>Incremental Fix</span>
                <span>Full Transformation</span>
              </div>
            </div>
            <div className="text-center p-6 rounded-3xl bg-[#c9a96e]/10 border border-[#c9a96e]/20">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">Est. Monthly Recovery</div>
              <div className="font-serif text-5xl font-black text-[#f5f5f0]">NIS {projectedRecovery.toLocaleString()}</div>
              <div className="mt-2 text-xs text-[#e8dcc0]">NIS {(projectedRecovery * 12).toLocaleString()} / year</div>
            </div>
          </div>
        </Card>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Total Monthly Leakage" value={`NIS ${total.toLocaleString()}`} sub="Detected exposure" />
        <Metric label="Recoverable In 30 Days" value="NIS 12.9k" sub="Targeted execution" />
        <Metric label="High Risk Leaks" value={String(PROFIT_LEAKS.filter(leak => leak.risk === 'high').length)} sub="Immediate action" />
      </div>
      <div className="space-y-4">
        {PROFIT_LEAKS.map(leak => (
          <Card key={leak.category} className={cx('border-l-4', leak.risk === 'high' ? 'border-l-red-700' : leak.risk === 'medium' ? 'border-l-amber-700' : 'border-l-[#6b705c]')}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
              <span className={cx('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]', riskClass[leak.risk])}>{leak.risk} risk - {leak.trend}</span>
              <div className="text-right"><div className="font-serif text-3xl font-black text-[#c9a96e]">NIS {leak.monthly.toLocaleString()}/mo</div><div className="text-xs text-[#e8dcc0]">NIS {leak.weekly.toLocaleString()}/week</div></div>
            </div>
            <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">{leak.category}</h2>
            <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{leak.note}</p>
          </Card>
        ))}
      </div>
    </>
  )
}

function OwnerReport({ t, reportArchive = [], eventPlans = [] }) {
  const latestReport = reportArchive[0]
  const latestEvent = eventPlans[0]
  const totalEventProfit = eventPlans.reduce((sum, plan) => sum + Number(plan.projected_profit || plan.calculations?.grossProfit || 0), 0)
  const reportSignals = reportArchive.filter(report => report.urgent_items || report.complaints).length

  return (
    <>
      <Header eyebrow={t.pages.ownerReport} title="Owner Weekly Report" body="A boardroom-ready summary created from End Of Day reports, readiness data, profit leak signals, and business memory." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#1a1a1a]">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c9a96e]">Executive Summary</div>
        <h2 className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">Hospitality Score: 87/100. Recoverable value this month: NIS 12.9k.</h2>
        <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">Performance improved in farewell and first impression. Drag remains in upselling and delay communication.</p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Label>Owner Actions Required</Label><List items={['Approve recovery-first compensation policy.', 'Review Dana P. readiness plan.', 'Confirm beverage upsell training mandate.', 'Review Friday delay pattern with management.']} /></Card>
        <Card><Label>Commercial Signals</Label><List items={['NIS 27.1k monthly leakage detected.', 'NIS 42.6k protected revenue tracked.', '7-shift reporting streak reached.', 'Two staff members create elevated weekend risk.']} /></Card>
      </div>
      <OwnerValueLedger totalEventProfit={totalEventProfit} reportSignals={reportSignals} eventPlans={eventPlans} reportArchive={reportArchive} />
      <Card className="mt-4 border-[#c9a96e]/20">
        <Label>Latest Submitted End Of Day Report</Label>
        {latestReport ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ReportFact label="Shift Date" value={latestReport.shift_date} />
            <ReportFact label="Manager" value={latestReport.manager_name || 'Manager'} />
            <ReportFact label="Shift Summary" value={latestReport.shift_summary || 'No summary entered'} />
            <ReportFact label="Urgent Items" value={latestReport.urgent_items || 'No urgent items entered'} />
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#e8dcc0]">No successful End Of Day submissions have been archived in this browser yet.</p>
        )}
      </Card>
      <Card className="mt-4 border-[#c9a96e]/20">
        <Label>Latest Saved Event Orchestrator Report</Label>
        {latestEvent ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ReportFact label="Event Plan" value={latestEvent.name} />
            <ReportFact label="Projected Revenue" value={formatMoney(latestEvent.projected_revenue || latestEvent.calculations?.revenue || 0)} />
            <ReportFact label="Projected Profit" value={formatMoney(latestEvent.projected_profit || latestEvent.calculations?.grossProfit || 0)} />
            <ReportFact label="Projected Margin" value={`${Number(latestEvent.projected_margin || latestEvent.calculations?.margin || 0).toFixed(1)}%`} />
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#e8dcc0]">No saved Event Orchestrator plans yet.</p>
        )}
      </Card>
    </>
  )
}

function OwnerValueLedger({ totalEventProfit, reportSignals, eventPlans, reportArchive }) {
  const ledger = [
    { label: 'Projected event profit pipeline', value: formatMoney(totalEventProfit), detail: `${eventPlans.length} saved Event Orchestrator plans` },
    { label: 'Operational risk signals captured', value: String(reportSignals), detail: `${reportArchive.length} End Of Day reports archived` },
    { label: 'Recoverable service leakage', value: 'NIS 12.9k', detail: 'Current modeled monthly opportunity' },
    { label: 'Training risk under management', value: '2 staff', detail: 'At Risk / Needs Coaching status' }
  ]

  return (
    <Card className="mt-4 border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.1),transparent_36%),#14130f]">
      <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
        <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
        Owner Value Ledger
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ledger.map(item => (
          <div key={item.label} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
            <div className="font-serif text-3xl font-black text-[#c9a96e]">{item.value}</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{item.label}</div>
            <p className="mt-2 text-xs leading-5 text-[#e8dcc0]">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ReportFact({ label, value }) {
  return (
    <div className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{label}</div>
      <p className="text-sm leading-7 text-[#f5f5f0]">{value}</p>
    </div>
  )
}

function BusinessMemoryPage({ t, reportArchive = [], businessMemory = BUSINESS_MEMORY }) {
  const hasBackendReportMemory = businessMemory.some(event => event.type === 'report' || event.title?.startsWith('End Of Day'))
  const reportEvents = hasBackendReportMemory ? [] : reportArchive.slice(0, 8).map(report => ({
    date: report.shift_date || report.submitted_at?.slice(0, 10) || 'Recent',
    type: 'report',
    title: `End Of Day submitted by ${report.manager_name || 'Manager'}`,
    detail: report.urgent_items || report.shift_summary || 'Shift report submitted successfully through EmailJS.'
  }))
  const normalizedMemory = businessMemory.map(event => ({
    date: event.date || event.event_date || event.created_at?.slice(0, 10) || 'Recent',
    type: event.type || 'note',
    title: event.title,
    detail: event.detail
  }))
  const memoryEvents = [...reportEvents, ...normalizedMemory]
  const style = {
    alert: 'border-red-900/40',
    win: 'border-emerald-900/40',
    note: 'border-[#6b705c]/30',
    report: 'border-[#c9a96e]/25',
    event: 'border-[#c9a96e]/30 bg-[#1a1a1a]'
  }

  return (
    <>
      <Header eyebrow={t.pages.businessMemory} title="Business Memory" body="A persistent record of operational events, wins, risks, and patterns. This is the layer that makes HOSPIA more valuable every shift." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Memory Events" value={String(memoryEvents.length)} sub={`${reportArchive.length} archived reports`} />
        <Metric label="Recurring Pattern" value="Friday" sub="Delay pressure" />
        <Metric label="Open Human Risk" value="Dana P." sub="At Risk status" />
      </div>
      <div className="relative space-y-4 ps-6">
        <div className="absolute bottom-0 start-2 top-0 w-px bg-[#6b705c]/30" />
        {memoryEvents.map(event => (
          <article key={`${event.date}-${event.title}`} className="relative">
            <div className={cx('absolute -start-5 top-6 h-3 w-3 rounded-full border-2 border-[#0d0c09]', event.type === 'alert' ? 'bg-red-500' : event.type === 'win' ? 'bg-emerald-500' : 'bg-[#c9a96e]')} />
            <Card className={style[event.type] || style.note}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{event.type}</span>
                <span className="text-xs text-[#e8dcc0]">{event.date}</span>
              </div>
              <h2 className="font-serif text-xl font-black text-[#f5f5f0]">{event.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{event.detail}</p>
            </Card>
          </article>
        ))}
      </div>
    </>
  )
}

function StrategicRecommendations({ t }) {
  const recs = [
    ['7 days', 'Issue recovery-first script mandate', 'NIS 8.4k monthly comp exposure', 'Require a documented recovery attempt before any compensation.'],
    ['14 days', 'Run beverage upsell training for floor and bar', 'NIS 6.2k monthly recoverable', 'Use Knowledge Library and Natural Upselling course as the training path.'],
    ['This week', 'Resolve Dana P. At Risk status', 'Training investment protection', 'Create a coaching plan or role adjustment before norms decay.'],
    ['30 days', 'Adjust Friday kitchen and floor briefing', 'NIS 4.8k delay leak prevention', 'Move briefing earlier and monitor delay incidents over two weekends.']
  ]

  return (
    <>
      <Header eyebrow={t.pages.strategicRecommendations} title="Strategic Recommendations" body="Prioritized decisions that connect service execution to owner-level value." />
      <div className="space-y-4">
        {recs.map(([horizon, title, impact, detail], index) => (
          <Card key={title} className={cx('border-l-4', index === 0 ? 'border-l-red-700' : index === 1 ? 'border-l-amber-700' : 'border-l-[#c9a96e]')}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="font-serif text-5xl font-black leading-none text-[#6b705c]">0{index + 1}</span>
                <div>
                  <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{horizon}</span>
                  <h2 className="mt-2 font-serif text-2xl font-black text-[#f5f5f0]">{title}</h2>
                </div>
              </div>
              <div className="text-right text-sm font-black text-[#c9a96e]">{impact}</div>
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{detail}</p>
          </Card>
        ))}
      </div>
    </>
  )
}

function MissingPage({ page }) {
  return (
    <>
      <Header eyebrow="System" title="Page unavailable" body="This route is not available for the current product configuration." />
      <Card className="border-amber-900/40 bg-amber-950/10">
        <Label>Route Guard</Label>
        <p className="text-sm leading-7 text-[#e8dcc0]">The requested page key is <span className="font-mono text-[#c9a96e]">{page}</span>. If this appears during normal navigation, a page was added before its production component was implemented.</p>
      </Card>
    </>
  )
}

function Settings({ t }) {
  return (
    <>
      <Header eyebrow={t.pages.settings} title={t.pages.settings} body={t.copy.settingsBody} />
      <Card>
        <Label>{t.app.language}</Label>
        <p className="mb-4 text-sm leading-7 text-[#e8dcc0]">
          Use the language switcher in the side panel to change interface language.
        </p>
        <Button>{t.ui.save}</Button>
      </Card>
    </>
  )
}

function Card({ children, className = '' }) {
  return (
    <section className={cx('rounded-[2.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] p-10 lg:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.4)] transition-all duration-700 hover:shadow-[0_60px_150px_rgba(0,0,0,0.6)]', className)}>
      {children}
    </section>
  )
}

function Button({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) {
  const styles = {
    primary: 'bg-[#c9a96e] text-[#0d0c09] hover:bg-[#dfc497] shadow-xl shadow-[#c9a96e]/10',
    secondary: 'border border-[#6b705c]/30 bg-transparent text-[#f5f5f0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]',
    ghost: 'text-[#e8dcc0] hover:bg-[#6b705c]/20 hover:text-[#f5f5f0]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex min-h-14 items-center justify-center rounded-2xl px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  )
}

function Label({ children }) {
  return (
    <div className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">
      {children}
    </div>
  )
}

function Header({ eyebrow, title, body }) {
  return (
    <header className="mb-24 lg:mb-32">
      <div className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">{eyebrow}</div>
      <h1 className="max-w-5xl font-serif text-6xl font-black leading-[1] tracking-tighter text-[#f5f5f0] sm:text-8xl lg:text-9xl">{title}</h1>
      <p className="mt-12 max-w-3xl text-xl font-light leading-relaxed text-[#e8dcc0] opacity-80 italic">{body}</p>
    </header>
  )
}

function Field({ id, label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
      />
    </div>
  )
}

function TextArea({ id, label, value, onChange, rows = 5 }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full resize-y rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
      />
    </div>
  )
}

function Progress({ value, label }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
      <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/30">
        <div className="h-full rounded-full bg-[#c9a96e]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

function ProgressBlock({ label, value }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-black text-[#c9a96e]">{value}%</span>
      </div>
      <Progress value={value} label={label} />
    </div>
  )
}

function Metric({ label, value, sub, large = false }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-[#c9a96e]/5" />
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e] opacity-60">{label}</div>
      <div className={cx('mt-6 font-serif font-black tracking-tighter text-[#f5f5f0]', large ? 'text-8xl' : 'text-6xl')}>{value}</div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-[#e8dcc0] opacity-40">{sub}</p>
    </Card>
  )
}

function List({ items }) {
  return (
    <div className="grid gap-6">
      {items.map(item => (
        <div key={item} className="rounded-3xl border border-[#6b705c]/10 bg-white/[0.02] p-8 text-sm leading-relaxed text-[#e8dcc0]">
          {item}
        </div>
      ))}
    </div>
  )
}

function Alert({ type, children }) {
  return (
    <div className={cx(
      'mt-4 rounded-xl border p-4 text-sm font-bold',
      type === 'success'
        ? 'border-emerald-400/30 bg-emerald-950/20 text-emerald-200'
        : 'border-red-400/30 bg-red-950/20 text-red-100'
    )}>
      {children}
    </div>
  )
}

function LanguageSwitcher({ t, lang, setLang }) {
  return (
    <div className="flex shrink-0 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-1">
      {[
        ['en', t.app.english],
        ['he', t.app.hebrew]
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setLang(key)}
          className={cx(
            'rounded-lg px-3 py-1.5 text-xs font-black transition',
            lang === key ? 'bg-[#c9a96e] text-[#11100d]' : 'text-[#e8dcc0] hover:text-[#f5f5f0]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
