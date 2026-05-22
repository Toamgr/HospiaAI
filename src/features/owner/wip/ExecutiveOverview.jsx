import WipPageTemplate from './WipPageTemplate'

export default function ExecutiveOverview() {
  return (
    <WipPageTemplate
      eyebrow="Owner Intelligence"
      title="Executive Overview"
      description="A single-screen owner command view — shift health, event pipeline status, staff risk flags, and the highest-leverage decisions available right now."
      willShow={[
        'Shift health summary: resolved vs. carry-forward ratio across last 4 weeks',
        'Event revenue pipeline: confirmed, pending, and projected bookings',
        'Staff risk flags: coaching-flagged employees, progression stalls, incident exposure',
        'Recommended owner actions derived from live operational data',
        'Week-over-week change indicators for each dimension',
      ]}
      requires={[
        '4+ weeks of consistently closed shifts with End-of-Day submissions',
        'Event CRM in active use with at least 5 enquiries or bookings',
        'Budget request history across at least 2 billing periods',
        'Staff Progression module connected to at least 3 team members',
      ]}
    />
  )
}
