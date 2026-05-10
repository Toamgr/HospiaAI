export const SERVICE_DOCTRINE = {
  name: 'Michelin-Level Service Doctrine',
  markers: [
    { id: 'personalized-greeting', standard: 'Warm greeting, host identified, guest name used when known, natural pause respected.' },
    { id: 'tailored-pacing', standard: 'Business, leisure, celebration, and family tables receive different pacing decisions.' },
    { id: 'table-maintenance', standard: 'Crumbs, empty glassware, cutlery, linen, and plate timing are maintained without interrupting conversation.' },
    { id: 'discreet-service', standard: 'Service is visible when needed and invisible when the guest is engaged.' },
    { id: 'farewell', standard: 'The last thirty seconds include gratitude, specificity, and return invitation.' }
  ],
  serviceAudit: [
    'Was the guest acknowledged before they searched for help?',
    'Was the table maintained before it looked neglected?',
    'Did staff interrupt or wait for a natural beat?',
    'Was the farewell specific enough to create return intention?'
  ]
}
