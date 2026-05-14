import React from 'react'
import { Card, Label, Header } from '../../components/AppPrimitives'

export default function MissingPage({ page }) {
  return (
    <>
      <Header eyebrow="System" title="Page unavailable" body="This route is not available for the current product configuration." />
      <Card className="border-amber-900/40 bg-amber-950/10">
        <Label>Route Guard</Label>
        <p className="text-sm leading-7 text-[#e8dcc0]">The requested page key is <span className="font-mono text-[#c9a96e]">{page}</span>. If this appears during normal navigation, a page was added before its production component was implemented.</p>
      </Card>
    </>
  )
}
