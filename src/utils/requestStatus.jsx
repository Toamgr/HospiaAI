import React from 'react'
import { cx } from './format'

function formatRequestStatus(status = '') {
  return status.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export function RequestStatusChip({ status }) {
  const style = {
    pending_manager_review: 'border-amber-800/45 bg-amber-950/20 text-amber-200',
    rejected_by_manager: 'border-red-800/45 bg-red-950/20 text-red-200',
    approved_by_manager: 'border-[#c9a96e]/35 bg-[#c9a96e]/10 text-[#c9a96e]',
    pending_owner_review: 'border-[#c9a96e]/35 bg-[#c9a96e]/10 text-[#c9a96e]',
    approved_by_owner: 'border-emerald-800/45 bg-emerald-950/20 text-emerald-200',
    rejected_by_owner: 'border-red-800/45 bg-red-950/20 text-red-200'
  }

  return (
    <span className={cx('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]', style[status] || 'border-[#6b705c]/30 bg-black/20 text-[#e8dcc0]')}>
      {formatRequestStatus(status)}
    </span>
  )
}
