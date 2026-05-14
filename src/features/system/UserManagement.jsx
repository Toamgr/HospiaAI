import React, { useState } from 'react'
import { cx } from '../../utils/format'
import { USER_ROLES } from '../../services/userService'
import { Card, Button, Label, Header, Alert } from '../../components/AppPrimitives'

export default function UserManagement({ currentUser, users = [], onCreateUser, onUpdateUser, onDisableUser }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'employee',
    venue: 'Main Venue',
    team: 'Front of House',
    canManageCocktails: false
  })
  const [editingUser, setEditingUser] = useState(null)
  const [status, setStatus] = useState(null)
  const canManage = ['owner', 'admin'].includes(currentUser?.role)

  const updateField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'role' && value === 'bar_manager' ? { canManageCocktails: true } : {})
    }))
  }

  const resetForm = () => {
    setEditingUser(null)
    setForm({
      username: '',
      password: '',
      role: 'employee',
      venue: 'Main Venue',
      team: 'Front of House',
      canManageCocktails: false
    })
  }

  function submit(event) {
    event.preventDefault()
    if (!canManage) {
      setStatus({ type: 'error', message: 'Only owners and admins can manage users.' })
      return
    }

    try {
      const payload = {
        ...form,
        canManageCocktails: Boolean(form.canManageCocktails || form.role === 'bar_manager' || form.role === 'admin')
      }
      const saved = editingUser
        ? onUpdateUser?.(editingUser.username, payload)
        : onCreateUser?.(payload)
      setStatus({ type: 'success', message: `${saved.username} ${editingUser ? 'updated' : 'created'} successfully.` })
      resetForm()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save user.' })
    }
  }

  function startEdit(user) {
    setEditingUser(user)
    setForm({
      username: user.username,
      password: user.password || '',
      role: user.role || 'employee',
      venue: user.venue || 'Main Venue',
      team: user.team || user.venue || 'Front of House',
      canManageCocktails: Boolean(user.canManageCocktails || user.role === 'bar_manager' || user.role === 'admin')
    })
    setStatus(null)
  }

  function disable(username) {
    try {
      const disabled = onDisableUser?.(username)
      setStatus({ type: 'success', message: `${disabled.username} disabled. They can no longer log in.` })
      if (editingUser?.username === username) resetForm()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not disable user.' })
    }
  }

  return (
    <>
      <Header
        eyebrow="Workspace Access"
        title="User Management"
        body="Create team members, assign roles, connect them to a venue or team, and control access without changing code."
      />
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="h-fit border-[#c9a96e]/20">
          <Label>{editingUser ? 'Edit User' : 'Create User'}</Label>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Username</label>
              <input value={form.username} onChange={event => updateField('username', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Password</label>
              <input value={form.password} onChange={event => updateField('password', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Role</label>
                <select value={form.role} onChange={event => updateField('role', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]">
                  {USER_ROLES.map(roleName => <option key={roleName} value={roleName}>{roleName.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Team</label>
                <input value={form.team} onChange={event => updateField('team', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Venue</label>
              <input value={form.venue} onChange={event => updateField('venue', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-[#6b705c]/30 bg-[#10100e] p-3 text-sm text-[#e8dcc0]">
              <input type="checkbox" checked={form.canManageCocktails} onChange={event => updateField('canManageCocktails', event.target.checked)} />
              Can manage Cocktail Lab / menu requests
            </label>
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit">{editingUser ? 'Save User' : 'Create User'}</Button>
              {editingUser && <Button variant="secondary" onClick={resetForm}>Cancel Edit</Button>}
            </div>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Label>Workspace Users</Label>
              <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{users.length} team profiles</h2>
            </div>
            <span className="rounded-full border border-[#c9a96e]/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">Owner/Admin governed</span>
          </div>
          <div className="space-y-3">
            {users.map(user => (
              <article key={user.username} className={cx('rounded-2xl border p-4', user.disabled ? 'border-red-900/35 bg-red-950/10' : 'border-[#6b705c]/25 bg-[#10100e]')}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{user.username}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#e8dcc0]">{String(user.role || '').replace('_', ' ')} - {user.venue || 'Main Venue'} - {user.team || 'Team'}</p>
                    {user.canManageCocktails && <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">Cocktail Lab permission</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => startEdit(user)}>Edit</Button>
                    <Button variant="ghost" disabled={user.disabled || user.username === currentUser?.username} onClick={() => disable(user.username)}>
                      {user.disabled ? 'Disabled' : 'Disable'}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
