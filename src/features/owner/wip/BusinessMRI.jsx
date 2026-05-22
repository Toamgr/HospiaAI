import WipPageTemplate from './WipPageTemplate'

export default function BusinessMRI() {
  return (
    <WipPageTemplate
      eyebrow="Owner Intelligence"
      title="Business MRI"
      description="A cross-dimensional health scan of your venue — service quality, team readiness, financial efficiency, and guest recovery rate combined into a single owner view."
      willShow={[
        'Service quality score derived from guest recovery incidents and resolution rate',
        'Team readiness index from staff progression, Academy completion, and coaching flags',
        'Financial efficiency signals from event margin, carry-forward task cost, and leakage proxies',
        'Guest recovery rate compared against prior 30-day baseline',
        'Dimension-by-dimension drill-down with source attribution',
      ]}
      requires={[
        '30+ closed shifts with consistent End-of-Day submissions',
        'Service recovery incidents tracked via the Service Recovery module',
        'Staff Progression module in active use with at least one full training cycle',
        'Event revenue data from Event Orchestrator (minimum 3 events)',
      ]}
    />
  )
}
