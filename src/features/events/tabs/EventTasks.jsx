import React, { useState } from 'react'

const PRIORITY_COLORS = { low: 'text-zinc-500', medium: 'text-sky-400', high: 'text-amber-400', critical: 'text-red-400' }

function TaskRow({ task, event, onUpdate, goToPage, onGoToOverview }) {
  const isDone = task.status === 'done'
  const isCocktailMenuTask = task.title?.startsWith('Build cocktail menu')

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-zinc-800 last:border-0">
      <button
        type="button"
        onClick={() => onUpdate(task.id, { status: isDone ? 'pending' : 'done' })}
        className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
          isDone ? 'bg-emerald-600 border-emerald-500' : 'border-zinc-600 hover:border-amber-500'
        }`}
      >
        {isDone && <span className="text-white text-xs">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm ${isDone ? 'line-through text-zinc-500 opacity-50' : 'text-zinc-200'}`}>{task.title}</p>
          {isCocktailMenuTask && !isDone && (
            <button
              type="button"
              onClick={() => goToPage?.('cocktailLab', { eventId: event.id, taskId: task.id, eventName: event.name })}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium shrink-0"
            >
              → Open Cocktail Lab
            </button>
          )}
          {isCocktailMenuTask && isDone && (
            <button
              type="button"
              onClick={() => onGoToOverview?.()}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium shrink-0"
            >
              ✓ Menu built — View in Overview
            </button>
          )}
        </div>
        <div className={`flex flex-wrap items-center gap-2 mt-0.5 ${isDone ? 'opacity-50' : ''}`}>
          {task.assigned_to && <span className="text-xs text-zinc-500">{task.assigned_to}</span>}
          {task.due_date && <span className="text-xs text-zinc-600">Due {task.due_date}</span>}
          {task.priority && <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] || 'text-zinc-500'}`}>{task.priority}</span>}
        </div>
      </div>
    </div>
  )
}

function AddTaskForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ title: '', assigned_to: '', due_date: '', priority: 'medium', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Task title is required'); return }
    setSaving(true)
    setError(null)
    try { await onAdd(form); onCancel() }
    catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-3">
      <p className="text-xs text-zinc-400 uppercase tracking-widest">Add task</p>
      <input
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
        placeholder="Task title *"
        value={form.title}
        onChange={e => set('title', e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        <input className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500" placeholder="Assigned to" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} />
        <input type="date" className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
        <select className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500" value={form.priority} onChange={e => set('priority', e.target.value)}>
          {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-xs font-medium">{saving ? 'Adding…' : 'Add task'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs">Cancel</button>
      </div>
    </form>
  )
}

export default function EventTasks({ event, tasks, onAddTask, onUpdateTask, goToPage, onGoToOverview }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const pending = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')
  const visible = filterStatus === 'done' ? done : filterStatus === 'all' ? tasks : pending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div><span className="text-lg font-light text-white">{pending.length}</span><span className="text-xs text-zinc-500 ml-1">pending</span></div>
          <div><span className="text-lg font-light text-emerald-400">{done.length}</span><span className="text-xs text-zinc-500 ml-1">done</span></div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="all">All</option>
          </select>
          <button type="button" onClick={() => setShowAddForm(v => !v)} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium">+ Add task</button>
        </div>
      </div>

      {showAddForm && (
        <AddTaskForm
          onAdd={data => onAddTask(event.id, data)}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {visible.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            {tasks.length === 0 ? '5 preparation tasks were auto-created. Add more tasks above.' : 'No tasks in this view.'}
          </div>
        ) : (
          visible.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              event={event}
              onUpdate={(id, patch) => onUpdateTask(event.id, id, patch)}
              goToPage={goToPage}
              onGoToOverview={onGoToOverview}
            />
          ))
        )}
      </div>
    </div>
  )
}
