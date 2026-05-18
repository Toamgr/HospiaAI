import React from 'react'
import { Card, Label } from '../../../components/AppPrimitives'
import { ZONE_LABELS, ZONE_NOTES, TABLE_NOTES } from '../data/eventBrainDemoData'

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between border-b border-[#6b705c]/15 py-2 last:border-0">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0] opacity-50">{label}</span>
      <span className={`text-[11px] font-medium ${accent ? 'text-[#c9a96e]' : 'text-[#f5f5f0]'}`}>{value}</span>
    </div>
  )
}

export default function SelectedTablePanel({ table }) {
  if (!table) return null
  const zoneLabel = ZONE_LABELS[table.zone] || table.zone
  const note = TABLE_NOTES[table.id] || ZONE_NOTES[table.zone] || ''

  return (
    <Card>
      <Label>Selected Table</Label>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="font-serif text-base font-black tracking-tight text-[#f5f5f0]">
          Table {table.id}{table.label ? ` — ${table.label}` : ''}
        </span>
        <span className="shrink-0 rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/8 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#c9a96e]">
          {zoneLabel}
        </span>
      </div>
      <div>
        <Row label="Guests" value={`${table.guests} of ${table.capacity}`} />
        {table.babyChairs > 0 && (
          <Row label="Baby chairs" value={table.babyChairs} accent />
        )}
        <Row label="Waiter" value={table.waiter} />
        <Row label="Zone" value={zoneLabel} />
        <Row
          label="Accessibility"
          value={table.accessiblePriority ? 'Priority' : 'Standard'}
          accent={table.accessiblePriority}
        />
        <Row label="Type" value={table.shape === 'round' ? 'Round' : 'Long'} />
        {table.wheelchair > 0 && (
          <Row label="Wheelchair space" value={table.wheelchair} accent />
        )}
      </div>
      {note && (
        <p className="mt-3 text-[11px] font-light italic leading-relaxed text-[#e8dcc0] opacity-65">
          {note}
        </p>
      )}
    </Card>
  )
}
