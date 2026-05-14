import React from 'react'
import { cx } from '../../utils/format'
import { Button } from '../../components/AppPrimitives'

export default function NotificationPanel({ notifications = [], currentUser, onClose, onMarkRead, goToPage }) {
  const sorted = [...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  function openNotification(item) {
    if (item.page) goToPage(item.page)
    onMarkRead()
    onClose()
  }

  return (
    <div className="fixed right-6 top-24 z-50 w-[min(420px,calc(100vw-2rem))] rounded-[1.75rem] border border-[#c9a96e]/20 bg-[#11100d] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Notification Center</div>
          <h2 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">Role-filtered operating signals</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0] hover:border-[#c9a96e] hover:text-[#c9a96e]">Close</button>
      </div>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {sorted.length ? sorted.slice(0, 12).map(item => {
          const unread = !item.readBy?.includes(currentUser?.username)
          return (
            <button key={item.id} type="button" onClick={() => openNotification(item)} className={cx('w-full rounded-2xl border p-4 text-left transition hover:border-[#c9a96e]/40', unread ? 'border-[#c9a96e]/25 bg-[#c9a96e]/10' : 'border-[#6b705c]/20 bg-[#1a1a1a]')}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{item.type}</span>
                <span className="text-[10px] text-[#e8dcc0]/60">{item.created_at?.slice(0, 10)}</span>
              </div>
              <div className="text-sm font-black text-[#f5f5f0]">{item.title}</div>
              <p className="mt-1 text-xs leading-5 text-[#e8dcc0]">{item.body}</p>
            </button>
          )
        }) : (
          <p className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] p-4 text-sm text-[#e8dcc0]">No notifications for this role.</p>
        )}
      </div>
      <Button className="mt-4 w-full" variant="secondary" onClick={onMarkRead}>Mark Visible As Read</Button>
    </div>
  )
}
