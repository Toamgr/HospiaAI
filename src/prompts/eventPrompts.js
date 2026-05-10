import { EVENT_LABOR_HOURLY_RATE, EVENT_TIERS } from '../data/events'

function formatEventMoney(value) {
  return `NIS ${Math.round(Number(value || 0)).toLocaleString()}`
}

export function generateExecutiveEventSummary(eventPlan, moneyFormatter = formatEventMoney) {
  const config = eventPlan.config || {}
  const calculations = eventPlan.calculations || {}
  const eventTime = calculations.eventTime || `${config.startTime || 'Time pending'} - ${config.endTime || 'Time pending'}`
  const serviceTier = EVENT_TIERS[config.tier]?.label || config.tier || 'Not specified'
  const revenue = eventPlan.projected_revenue || eventPlan.budget || calculations.revenue || 0
  const profit = eventPlan.projected_profit || calculations.grossProfit || 0
  const margin = Number(eventPlan.projected_margin ?? calculations.margin ?? 0)
  const barStations = Math.max(1, Number(calculations.bartenders || 0))

  return [
    `EVENT SUMMARY`,
    `- Event Name: ${eventPlan.name || 'Unnamed event'}`,
    `- Date: ${eventPlan.eventDate || config.eventDate || 'Date pending'}`,
    `- Time Range: ${eventTime}`,
    `- Guest Count: ${eventPlan.guests || calculations.guests || config.guests || 0}`,
    `- Event Type: ${eventPlan.eventType || config.eventType || 'Not specified'}`,
    `- Service Tier: ${serviceTier}`,
    ``,
    `FINANCIAL OVERVIEW`,
    `- Revenue: ${moneyFormatter(revenue)}`,
    `- Profit: ${moneyFormatter(profit)}`,
    `- Margin: ${margin.toFixed(1)}%`,
    ``,
    `F&B BREAKDOWN`,
    `- Cocktails: ${calculations.cocktails || 0}`,
    `- Wine Bottles: ${calculations.wineBottles || 0}`,
    `- Staffing: ${calculations.waiters || 0} waiters, ${calculations.bartenders || 0} bartenders, ${Number(calculations.laborHours || 0).toFixed(1)} labor hours at ${moneyFormatter(EVENT_LABOR_HOURLY_RATE)}/hour`,
    `- Bar Stations: ${barStations}`,
    `- Planning Notes: ${eventPlan.fnbBreakdown || config.fnbBreakdown || 'No F&B breakdown entered.'}`,
    ``,
    `MANAGER NOTES`,
    `- Contact: ${eventPlan.contactPerson || config.contactPerson || 'Not provided'}`,
    `- Phone: ${eventPlan.phone || config.phone || 'Not provided'}`,
    `- Special Requests: ${eventPlan.specialRequests || config.specialRequests || 'None entered.'}`,
    `- Staffing Notes: ${eventPlan.staffingNotes || config.staffingNotes || 'None entered.'}`,
    `- Saved Event Reference: ${eventPlan.id || 'Pending save'}`
  ].join('\n')
}
