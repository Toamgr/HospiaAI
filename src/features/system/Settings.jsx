import React, { useState } from 'react'
import { Card, Button, Label, Header } from '../../components/AppPrimitives'

export default function Settings({ t }) {
  const [saved, setSaved] = useState(false)

  return (
    <>
      <Header eyebrow={t.pages.settings} title={t.pages.settings} body={t.copy.settingsBody} />
      <Card>
        <Label>{t.app.language}</Label>
        <p className="mb-4 text-sm leading-7 text-[#e8dcc0]">
          Use the language switcher in the side panel to change interface language.
        </p>
        <Button onClick={() => {
          setSaved(true)
          window.setTimeout(() => setSaved(false), 1800)
        }}>
          {t.ui.save}
        </Button>
        {saved && <p className="mt-3 text-sm font-bold text-emerald-300">Preferences are already stored locally.</p>}
      </Card>
    </>
  )
}
