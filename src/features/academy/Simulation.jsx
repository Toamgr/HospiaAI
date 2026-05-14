import React, { useState } from 'react'
import { cx } from '../../utils/format'
import { Card, Button, Label, Header, TextArea, List, ProgressBlock } from '../../components/AppPrimitives'
import { SIMULATION_SCENARIOS } from '../../data/courses'

export default function Simulation({ t }) {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [result, setResult] = useState(null)
  const scenario = SIMULATION_SCENARIOS[scenarioIndex]

  function selectScenario(index) {
    setScenarioIndex(index)
    setResponse('')
    setResult(null)
  }

  function scoreResponse() {
    const text = response.trim()
    if (!text) return

    const hasEmpathy = /sorry|understand|apologize|apologise|right/i.test(text)
    const hasOwnership = /i will|i am|on us|responsibility|personally|take care/i.test(text)
    const hasSpecificAction = /minutes|bring|replace|fix|check|right now|immediately|follow up/i.test(text)
    const hasHospitality = /you|your|tonight|experience|guest|comfortable/i.test(text)
    const lengthBonus = Math.min(18, Math.floor(text.length / 18))

    const empathy = Math.min(100, 42 + (hasEmpathy ? 28 : 0) + lengthBonus)
    const professionalism = Math.min(100, 45 + (hasOwnership ? 25 : 0) + lengthBonus)
    const solution = Math.min(100, 40 + (hasSpecificAction ? 32 : 0) + lengthBonus)
    const hosting = Math.min(100, 42 + (hasHospitality ? 25 : 0) + lengthBonus)
    const revenue = Math.min(100, 38 + (hasSpecificAction ? 22 : 0) + (hasOwnership ? 12 : 0) + Math.floor(lengthBonus / 2))
    const overall = Math.round((empathy + professionalism + solution + hosting + revenue) / 5)

    setResult({ empathy, professionalism, solution, hosting, revenue, overall })
  }

  return (
    <>
      <Header eyebrow={t.pages.simulation} title="Guest Simulation Arena" body="Practice real guest moments and receive a structured score across empathy, ownership, solution quality, hosting presence, and revenue protection." />
      <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
        {SIMULATION_SCENARIOS.map((item, index) => (
          <button key={item.id} type="button" onClick={() => selectScenario(index)} className={cx('min-w-[190px] rounded-2xl border p-4 text-left transition', scenarioIndex === index ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]')}>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{item.difficulty}</div>
            <div className="mt-1 text-sm font-black">{item.title}</div>
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Card>
            <Label>Scenario</Label>
            <p className="mb-4 text-sm italic leading-7 text-[#e8dcc0]">{scenario.context}</p>
            <div className="rounded-2xl border-l-4 border-[#6b705c]/50 bg-[#1a1a1a] p-5">
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">Guest says</div>
              <p className="font-serif text-2xl italic leading-10 text-[#f5f5f0]">"{scenario.guest}"</p>
            </div>
          </Card>
          <Card>
            <Label>Your Response</Label>
            <TextArea id="simulation-response" label="" value={response} onChange={setResponse} />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={scoreResponse} disabled={!response.trim()}>Score Response</Button>
              <Button variant="secondary" onClick={() => selectScenario(scenarioIndex)}>Reset</Button>
            </div>
          </Card>
          {result && (
            <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
              <Label>Ideal HESTIA Response</Label>
              <p className="font-serif text-xl italic leading-9 text-[#f5f5f0]">"{scenario.ideal}"</p>
            </Card>
          )}
        </div>
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <Label>Score Dimensions</Label>
            {result && <div className={cx('font-serif text-5xl font-black', result.overall >= 80 ? 'text-emerald-400' : result.overall >= 65 ? 'text-[#c9a96e]' : 'text-red-400')}>{result.overall}%</div>}
          </div>
          {result ? (
            <>
              <ProgressBlock label="Empathy" value={result.empathy} />
              <ProgressBlock label="Professionalism" value={result.professionalism} />
              <ProgressBlock label="Solution Quality" value={result.solution} />
              <ProgressBlock label="Hosting Presence" value={result.hosting} />
              <ProgressBlock label="Revenue Protection" value={result.revenue} />
            </>
          ) : (
            <List items={['Empathy: acknowledges emotion before explaining.', 'Ownership: speaks as a host with authority.', 'Solution quality: gives a specific next move.', 'Revenue protection: preserves trust and return intent.']} />
          )}
        </Card>
      </div>
    </>
  )
}
