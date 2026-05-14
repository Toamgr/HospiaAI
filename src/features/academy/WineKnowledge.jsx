import React from 'react'
import { WINE_ACADEMY_SECTIONS } from '../../data/operations'
import { Header, Metric, Card, Label, List } from '../../components/AppPrimitives'

export default function WineKnowledge() {
  const futureMap = [
    'Grape varieties',
    'Climate and terroir',
    'Old world vs new world',
    'Winemaking and maturation',
    'Wine styles',
    'Tasting method',
    'Acidity, tannin, body, alcohol, sweetness',
    'Food pairing',
    'Service temperature and glassware',
    'Storage and faults',
    'Sparkling and fortified wine',
    'Major wine regions',
    'Sales language and recommendation scripts'
  ]

  return (
    <>
      <Header eyebrow="Wine Academy" title="Wine Knowledge Foundation" body="A structured foundation for a future WSET Level 3 depth wine academy, designed for hospitality staff who need confident guest-facing language." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Knowledge Depth" value="WSET 3" sub="Future target" />
        <Metric label="Service Lens" value="Guest" sub="Hospitality language" />
        <Metric label="Build Mode" value="Foundation" sub="Sample sections only" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {WINE_ACADEMY_SECTIONS.map(section => (
            <Card key={section.title} className="border-[#c9a96e]/16">
              <Label>{section.focus}</Label>
              <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">{section.sample}</p>
              <div className="mt-5 space-y-2">
                {section.topics.map(topic => (
                  <div key={topic} className="rounded-xl border border-[#6b705c]/20 bg-black/18 px-3 py-2 text-xs leading-5 text-[#e8dcc0]">{topic}</div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <Label>Future Architecture</Label>
          <List items={futureMap} />
        </Card>
      </div>
    </>
  )
}
