import WipPageTemplate from './WipPageTemplate'

export default function StrategicRecommendations() {
  return (
    <WipPageTemplate
      eyebrow="Owner Intelligence"
      title="Strategic Recommendations"
      description="AI-generated strategic priorities derived from pattern analysis across shifts, staff performance, event revenue, and guest recovery trends. Only surfaces when the data foundation is sufficient to support non-trivial inference."
      willShow={[
        'Top 3–5 owner-level priorities ranked by operational leverage',
        'Each recommendation: what pattern triggered it, what data supports it, what action it requires',
        'Trust classification: AI suggestion vs. deterministic rule, with source citation',
        'Estimated impact range (only when cost or revenue data is verified)',
        'Prior recommendations and their outcomes tracked over time',
      ]}
      requires={[
        '8+ weeks of closed shift data with consistent End-of-Day submissions',
        'Service Recovery module in active use across the full team',
        'Staff Progression data tracked for at least half the team',
        'At least one full event revenue cycle completed in Event Orchestrator',
        'Profit Leak Intelligence page active with verified cost data',
      ]}
    />
  )
}
