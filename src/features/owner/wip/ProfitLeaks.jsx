import WipPageTemplate from './WipPageTemplate'

export default function ProfitLeaks() {
  return (
    <WipPageTemplate
      eyebrow="Owner Intelligence"
      title="Profit Leak Intelligence"
      description="Revenue leaving through preventable execution failures — mapped to operational loops, ranked by financial impact, and modeled for recovery ROI. No estimates will be shown without verified data."
      willShow={[
        'Identified leak categories: compensation before recovery, missed upsells, kitchen delays, no-shows',
        'Monthly leakage estimate per category — only when source-backed by your venue data',
        'Recovery modeling: projected monthly recovery at different execution improvement levels',
        'High-risk vs. medium-risk leak classification by trend direction',
        'Recommended intervention mapped to the responsible operational loop',
      ]}
      requires={[
        'Verified sales data connected to HESTIA (POS or manual entry)',
        'Cocktail Lab costing completed with verified ingredient costs',
        'Service recovery incidents tracked consistently for 4+ weeks',
        'At least 20 End-of-Day submissions with complaint and recovery fields completed',
      ]}
    />
  )
}
