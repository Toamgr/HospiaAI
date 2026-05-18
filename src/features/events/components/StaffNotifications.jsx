import React from 'react'
import { Card, Label } from '../../../components/AppPrimitives'
import { STAFF_NOTIFICATIONS } from '../data/eventBrainDemoData'

export default function StaffNotifications() {
  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <Label>Staff Notifications</Label>
        <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#e8dcc0] opacity-30">
          Demo only
        </span>
      </div>
      <div className="mb-4 font-serif text-sm font-black tracking-tight text-[#f5f5f0]">
        Crew Brief
      </div>
      <div className="rounded-xl border border-[#6b705c]/15 bg-[#1a1a1a] p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0] opacity-50">
          Subject
        </div>
        <p className="mt-1 text-[11px] font-medium leading-snug text-[#f5f5f0]">
          You're booked — Cohen-Levi Wedding at Kahi · Sept 18, 2026
        </p>
        <ul className="mt-3 space-y-0">
          {STAFF_NOTIFICATIONS.map((s, i) => (
            <li
              key={i}
              className={`flex items-center justify-between py-2 text-[11px] ${
                i < STAFF_NOTIFICATIONS.length - 1
                  ? 'border-b border-[#6b705c]/15'
                  : ''
              }`}
            >
              <span>
                <span className="font-black text-[#f5f5f0]">{s.name}</span>
                <span className="text-[#e8dcc0] opacity-55"> · {s.role}</span>
              </span>
              <span className="text-[10px] text-[#e8dcc0] opacity-40">{s.assignment}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-[9px] italic text-[#e8dcc0] opacity-30">
        Demo only — no real messages are sent.
      </p>
    </Card>
  )
}
