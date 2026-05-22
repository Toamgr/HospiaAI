import WipPageTemplate from './WipPageTemplate'

export default function WeeklySummary() {
  return (
    <WipPageTemplate
      eyebrow="Owner Intelligence"
      title="Weekly Summary"
      description="A briefing-ready weekly view of operational patterns, staff trends, service quality signals, and forward-looking risk flags — compiled from the last 7 days of closed shifts."
      willShow={[
        'Weekly operational score: resolved rate, carry-forward rate, incident count vs. prior week',
        'Shift Brain signal summary: recurring patterns flagged by the deterministic engine',
        'Staff trend: who improved, who declined, who needs a coaching conversation',
        'Service quality trend: guest recovery actions, repeat complaint categories',
        'Forward risk flags: conditions that predict operational problems next week',
        'AI weekly brief: one-paragraph synthesis generated from live operational context',
      ]}
      requires={[
        '7+ consecutive days of closed shifts with End-of-Day submissions',
        'Action Board in consistent use with items properly categorised',
        'At least one full week of incident tracking in the Service Recovery module',
        'Shift Brain V1 receiving adequate input from manager activity',
      ]}
    />
  )
}
