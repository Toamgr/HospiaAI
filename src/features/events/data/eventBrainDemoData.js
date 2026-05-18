// DEMO ONLY — all data in this file is illustrative simulation content for the EventBrain training feature.
// Names (Cohen-Levi, Yael, Roni, Noa, Daniel, etc.), financial figures, and event details are fictional.
// Do not present this data as real venue operational records.

export const EVENT_BRIEF = {
  title: 'Cohen-Levi Wedding at Kahi',
  date: 'September 18, 2026',
  totalGuests: 186,
  budgetPerPerson: 680,
  currency: '₪',
  serviceStyle: 'Luxury Plated',
  barType: 'Open Bar',
  format: '24-hour resort',
  style: 'Israeli Resort',
  dietary: ['Kosher', 'Vegan options', 'Gluten-free'],
  specialRequests:
    'Garden chuppah, chef-led culinary experience, poolside reception, accessible family seating, premium late-night bar.',
  accessibility: {
    wheelchairs: 2,
    babyChairs: 3,
    elderly: 8,
    stepFree: true,
    quietFamilyZone: true
  }
}

export const DEFAULT_TABLES = [
  { id: 1,  shape: 'round', x: 148, y: 190, capacity: 10, guests: 10, waiter: 'Yael', zone: 'hall' },
  { id: 2,  shape: 'round', x: 262, y: 190, capacity: 10, guests: 10, waiter: 'Yael', zone: 'hall' },
  { id: 3,  shape: 'round', x: 400, y: 190, capacity: 12, guests: 12, waiter: 'Roni', zone: 'hall' },
  { id: 4,  shape: 'long',  x: 265, y: 270, capacity: 14, guests: 14, waiter: 'Noa',  zone: 'hall', babyChairs: 1 },
  { id: 5,  shape: 'round', x: 148, y: 345, capacity: 10, guests: 10, waiter: 'Roni', zone: 'hall' },
  { id: 6,  shape: 'round', x: 430, y: 345, capacity: 10, guests: 10, waiter: 'Tal',  zone: 'hall' },
  { id: 7,  shape: 'round', x: 262, y: 432, capacity: 10, guests: 9,  waiter: 'Noa',  zone: 'vip',    wheelchair: 1, babyChairs: 1, accessiblePriority: true, label: 'Family' },
  { id: 8,  shape: 'round', x: 155, y: 432, capacity: 8,  guests: 8,  waiter: 'Noa',  zone: 'vip',    wheelchair: 1, accessiblePriority: true },
  { id: 9,  shape: 'round', x: 618, y: 188, capacity: 10, guests: 10, waiter: 'Itai', zone: 'garden' },
  { id: 10, shape: 'round', x: 720, y: 188, capacity: 10, guests: 10, waiter: 'Itai', zone: 'garden' },
  { id: 11, shape: 'round', x: 822, y: 188, capacity: 10, guests: 10, waiter: 'Shir', zone: 'garden' },
  { id: 12, shape: 'round', x: 906, y: 188, capacity: 9,  guests: 9,  waiter: 'Shir', zone: 'garden' },
  { id: 13, shape: 'long',  x: 736, y: 284, capacity: 14, guests: 14, waiter: 'Yael', zone: 'pool' },
  { id: 14, shape: 'round', x: 604, y: 434, capacity: 10, guests: 9,  waiter: 'Shir', zone: 'pool' },
  { id: 15, shape: 'round', x: 820, y: 434, capacity: 10, guests: 9,  waiter: 'Shir', zone: 'pool' },
  { id: 16, shape: 'round', x: 376, y: 432, capacity: 10, guests: 10, waiter: 'Tal',  zone: 'vip' },
  { id: 17, shape: 'round', x: 470, y: 460, capacity: 10, guests: 10, waiter: 'Noa',  zone: 'vip' }
]

export const ZONE_LABELS = {
  hall: 'Main Hall',
  garden: 'Garden Terrace',
  pool: 'Pool Deck',
  vip: 'VIP / Family'
}

export const ZONE_NOTES = {
  hall: 'Indoor main hall seating — full service path access and direct kitchen connection.',
  garden: 'Garden terrace — open air, natural light, direct chuppah sightline.',
  vip: 'VIP family zone — quiet area, step-free access, dedicated waiter.',
  pool: 'Pool deck — premium poolside resort experience, best venue view.'
}

export const TABLE_NOTES = {
  7: 'Positioned near accessible route and close to family seating. Direct sightline to chuppah and step-free path to restroom.',
  8: 'Priority accessibility table — wheelchair space, quiet zone. Adjacent to accessible entrance path.',
  1: 'Front-of-hall seating with full service corridor access and direct sightline to the main stage.',
  13: 'Premium pool deck seating — iconic poolside resort experience and best cross-venue view.'
}

export const BAR_PROGRAMME = {
  cocktails: ['Kahi Spritz', 'Garden Arak Fizz', 'Poolside Paloma', 'Golden Hour Sour'],
  mocktails: ['Tropical Levanade', 'Pine & Citrus Cooler']
}

export const STAFF_NOTIFICATIONS = [
  { name: 'Noa',    role: 'Waiter',         assignment: 'VIP / family' },
  { name: 'Amir',   role: 'Bartender',      assignment: 'Main bar' },
  { name: 'Maya',   role: 'Access Host',    assignment: 'Guest care route' },
  { name: 'Daniel', role: 'Kitchen Runner', assignment: 'Chef → hall' }
]
