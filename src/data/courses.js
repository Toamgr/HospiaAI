// HOSPIA AI - extracted static data. Values moved from App.jsx without behavior changes.

export const COURSES = [
  {
    id: 1,
    progress: 72,
    lessons: 4,
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
    lessons: 3,
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
    lessons: 5,
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
    lessons: 4,
    title: { en: 'Natural Upselling', he: 'המלצה טבעית שמגדילה הכנסה' },
    category: { en: 'Revenue Through Care', he: 'הכנסה דרך אכפתיות' },
    desc: {
      en: 'Increase revenue without pressure by advising like a host.',
      he: 'הגדלת הכנסה בלי לחץ דרך המלצה של מארח מקצועי.'
    }
  },
  {
    id: 'bar-masterclass',
    progress: 64,
    lessons: 7,
    page: 'knowledgeLibrary',
    badge: 'Flagship',
    title: { en: 'World of Bar / Bar Masterclass', he: 'World of Bar / Bar Masterclass' },
    category: { en: 'Beverage Academy', he: 'Beverage Academy' },
    desc: {
      en: 'Enter The Grand Bar Atlas: cocktails, spirits, technique, guest scripts, costing discipline, and pre-shift bar training.',
      he: 'Enter The Grand Bar Atlas: cocktails, spirits, technique, guest scripts, costing discipline, and pre-shift bar training.'
    }
  }
]


export const SOP_SHEETS = [
  { id: 'arrival', code: 'SOP-01', title: 'Guest Arrival And Seating Protocol', category: 'Front Of House', standard: 'HESTIA Standard 01', updated: '2026-05-01', steps: ['Acknowledge every entering guest within 10 seconds with eye contact and a calm welcome.', 'If occupied, signal acknowledgment immediately: "Welcome, I will be right with you."', 'Ask for the reservation name with hospitality language, not interrogation.', 'Escort guests at their pace and never abandon the handoff.', 'Open the first service moment before leaving the table.'], managerNote: 'The first impression determines emotional tolerance for the rest of the meal.' },
  { id: 'delay', code: 'SOP-02', title: 'Delay Communication Protocol', category: 'Service Recovery', standard: 'HESTIA Standard 04', updated: '2026-05-01', steps: ['Update before the guest asks.', 'Give a specific time estimate when possible.', 'Own the experience without blaming the kitchen.', 'Offer comfort while they wait.', 'Return when promised, even if the update is not perfect.'], managerNote: 'A proactive update turns waiting into care. Silence turns waiting into resentment.' },
  { id: 'recovery', code: 'SOP-03', title: 'Complaint Recovery - Acknowledge, Own, Act', category: 'Recovery', standard: 'HESTIA Standard 09', updated: '2026-05-02', steps: ['Listen fully without defense.', 'Acknowledge the emotion first.', 'Take ownership on behalf of the venue.', 'Offer a specific immediate solution.', 'Follow up within five minutes and log the event.'], managerNote: 'Compensation is not the first move. Trust repair is the first move.' },
  { id: 'upsell', code: 'SOP-04', title: 'Natural Upselling And Menu Guidance', category: 'Revenue Through Care', standard: 'HESTIA Revenue Protocol', updated: '2026-04-29', steps: ['Know three personal recommendations per category.', 'Recommend with confidence and context.', 'Pair suggestions to guest preference, not price pressure.', 'Offer dessert with a concrete image, not a generic question.', 'Accept declines warmly and move on.'], managerNote: 'The best upsell feels like expert guidance from a host.' },
  { id: 'farewell', code: 'SOP-05', title: 'Farewell And Return Intention', category: 'Guest Loyalty', standard: 'HESTIA Standard 11', updated: '2026-04-26', steps: ['Return payment with calm attention.', 'Thank the guest specifically, by name if known.', 'Create one warm final sentence.', 'Invite return with specificity.', 'Ensure the final physical impression is not rushed.'], managerNote: 'The final thirty seconds decide whether the guest remembers the evening.' }
]


export const SIMULATION_SCENARIOS = [
  { id: 1, difficulty: 'Foundation', title: 'Unacknowledged Table', context: 'A couple has been seated for eight minutes and no one has approached them.', guest: 'Excuse me - has anyone been assigned to our table? We have not been acknowledged yet.', ideal: 'I sincerely apologize. That is not the experience we want for you. My name is [name], and I will take care of you this evening. May I start you with water while you settle in?' },
  { id: 2, difficulty: 'Intermediate', title: 'Long Kitchen Delay', context: 'Table 7 has waited 38 minutes for mains and the kitchen is backed up.', guest: 'We have been waiting almost 40 minutes. This is completely unacceptable. Where is our food?', ideal: 'You are completely right, and I am truly sorry. There has been a kitchen delay and your dishes are approximately five minutes away. While you wait, please allow me to bring something to the table so this is not just empty waiting.' },
  { id: 3, difficulty: 'Advanced', title: 'Dish Returned', context: 'A steak ordered medium-rare arrived well done. The guest pushed the plate away.', guest: 'I ordered medium-rare. This is completely overcooked. I cannot eat this.', ideal: 'I am very sorry. That is not acceptable, and I take responsibility for fixing it. I am having a new steak prepared at the correct temperature now, and I will personally follow up with you in a few minutes.' }
]

