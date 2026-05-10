// HOSPIA AI - extracted static data. Values moved from App.jsx without behavior changes.

export const ACTION_BOARD_ITEMS = [
  { id: 1, priority: 'urgent', title: 'Brief floor team on delay communication before dinner service', owner: 'Manager', due: 'Today 17:00', signal: 'Kitchen delays triggered 3 guest complaints last Friday', page: 'serviceRecovery', done: false },
  { id: 2, priority: 'urgent', title: 'Open coaching plan for Dana P. - At Risk status', owner: 'Manager', due: 'Today', signal: '31% academy progress and 55% simulation score', page: 'staffReadiness', done: false },
  { id: 3, priority: 'high', title: 'Run complaint recovery simulation with Oren and Dana', owner: 'Shift Lead', due: 'Tomorrow', signal: 'Recovery score below 70% for both staff members', page: 'simulation', done: false },
  { id: 4, priority: 'high', title: 'Submit End Of Day report with urgent items carried forward', owner: 'Closing Manager', due: 'Tonight', signal: 'Owner report depends on consistent shift memory', page: 'endOfDay', done: false },
  { id: 5, priority: 'normal', title: 'Assign Natural Upselling module to bar and floor team', owner: 'Manager', due: 'This week', signal: 'Beverage upsell leak estimated at NIS 6.2k per month', page: 'courses', done: true }
]


export const PROFIT_LEAKS = [
  { category: 'Compensation before recovery script', monthly: 8400, weekly: 1960, risk: 'high', trend: '+12%', note: 'Staff comping items before attempting structured service recovery. This hides the operational issue and trains guests to expect financial resolution first.' },
  { category: 'Missed beverage upsell opportunities', monthly: 6200, weekly: 1440, risk: 'high', trend: '+8%', note: 'Most tables are not offered a second drink or pairing. Natural recommendation training can recover value without cheap sales pressure.' },
  { category: 'Kitchen delay unmanaged by floor', monthly: 4800, weekly: 1120, risk: 'medium', trend: '-4%', note: 'Guests tolerate delays better when informed early. Silent waiting converts into complaints, early departures, and dessert loss.' },
  { category: 'No farewell or return invitation', monthly: 3100, weekly: 720, risk: 'medium', trend: '+2%', note: 'Payment ends the transaction, but the farewell creates return intention. Generic checkout is a measurable loyalty leak.' },
  { category: 'Peak shift readiness below 70%', monthly: 2600, weekly: 605, risk: 'medium', trend: 'stable', note: 'Weekend shifts with undertrained staff create higher complaint rates and lower recovery quality.' },
  { category: 'Owner escalation without manager resolution', monthly: 1800, weekly: 420, risk: 'low', trend: '-6%', note: 'Improving, but each owner escalation erodes authority on the floor and increases compensation pressure.' }
]


export const BUSINESS_MEMORY = [
  { date: '2026-05-03', type: 'alert', title: 'Delay communication failure - dinner service', detail: 'Three tables waited 35+ minutes without proactive update. Estimated preventable loss: NIS 420.' },
  { date: '2026-05-02', type: 'win', title: 'Noa completed full recovery certification', detail: 'Noa reached 95% course progress and 89% simulation score. Use as peer mentor for at-risk staff.' },
  { date: '2026-04-30', type: 'note', title: 'Beverage upsell conversion improved after training', detail: 'Second-drink recommendations rose after Natural Upselling module. Repeat briefing before weekend.' },
  { date: '2026-04-28', type: 'alert', title: 'Complaint escalated to owner', detail: 'Manager did not resolve a kitchen delay before owner intervention. Full meal comped.' },
  { date: '2026-04-27', type: 'note', title: 'End Of Day reporting streak reached 7 shifts', detail: 'Consistent reporting now gives enough signal to detect weekly operational patterns.' }
]

