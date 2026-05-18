import { useState, useEffect, useCallback } from 'react'
import { Card, Header, Button } from '../../components/AppPrimitives'
import { cx } from '../../utils/format'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../../services/api/client'

const ROLES = ['admin', 'owner', 'bar_manager', 'manager', 'employee']
const ROLE_LABEL = {
  admin: 'Admin',
  owner: 'Owner',
  bar_manager: 'Bar Manager',
  manager: 'Manager',
  employee: 'Employee',
}

function blankForm() {
  return { full_name: '', role: 'employee', username: '', password: '', is_active: true }
}

function UserForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial)
  const field = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="rounded-2xl border border-[#c9a96e]/20 bg-[#111] p-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">
            Full Name
          </label>
          <input
            value={form.full_name}
            onChange={e => field('full_name', e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 text-sm text-[#f5f5f0] placeholder-[#e8dcc0]/20 focus:border-[#c9a96e]/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">
            Username
          </label>
          <input
            value={form.username}
            onChange={e => field('username', e.target.value.toLowerCase())}
            placeholder="e.g. toam"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 font-mono text-sm text-[#c9a96e] placeholder-[#e8dcc0]/20 focus:border-[#c9a96e]/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">
            Password
          </label>
          <input
            value={form.password}
            onChange={e => field('password', e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 text-sm text-[#f5f5f0] placeholder-[#e8dcc0]/20 focus:border-[#c9a96e]/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">
            Role
          </label>
          <select
            value={form.role}
            onChange={e => field('role', e.target.value)}
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none"
          >
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </div>

        <div className="flex items-end pb-0.5">
          <button
            type="button"
            onClick={() => field('is_active', !form.is_active)}
            className="flex items-center gap-3"
          >
            <div className={cx(
              'relative h-6 w-11 rounded-full border transition-colors',
              form.is_active ? 'border-[#c9a96e]/40 bg-[#c9a96e]/20' : 'border-[#6b705c]/30 bg-[#0d0c09]'
            )}>
              <span className={cx(
                'absolute top-0.5 h-5 w-5 rounded-full border transition-all',
                form.is_active
                  ? 'left-[22px] border-[#c9a96e]/60 bg-[#c9a96e]'
                  : 'left-0.5 border-[#6b705c]/40 bg-[#6b705c]/30'
              )} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </button>
        </div>

      </div>

      {error && <p className="text-xs text-red-300/75">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadErr, setLoadErr] = useState(null)
  const [editId, setEditId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(() => {
    setStatus('loading')
    setLoadErr(null)
    apiGet('/api/admin/users')
      .then(d => { setUsers(d.users || []); setStatus('ready') })
      .catch(e => { setLoadErr(e.message || 'Failed to load users.'); setStatus('error') })
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(user) {
    setEditId(user.id)
    setAdding(false)
    setFormErr(null)
  }

  function startAdd() {
    setAdding(true)
    setEditId(null)
    setFormErr(null)
  }

  function cancel() {
    setAdding(false)
    setEditId(null)
    setFormErr(null)
  }

  async function saveNew(form) {
    setSaving(true)
    setFormErr(null)
    try {
      const data = await apiPost('/api/admin/users', form)
      setUsers(prev => [...prev, data.user])
      setAdding(false)
    } catch (e) {
      setFormErr(e.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit(id, form) {
    setSaving(true)
    setFormErr(null)
    try {
      const data = await apiPut(`/api/admin/users/${id}`, form)
      setUsers(prev => prev.map(u => u.id === id ? data.user : u))
      setEditId(null)
    } catch (e) {
      setFormErr(e.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function toggle(user) {
    try {
      const data = await apiPatch(`/api/admin/users/${user.id}/toggle`, {})
      setUsers(prev => prev.map(u => u.id === user.id ? data.user : u))
    } catch (e) {
      setFormErr(e.message || 'Toggle failed.')
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete ${user.full_name}? This cannot be undone.`)) return
    setDeletingId(user.id)
    try {
      await apiDelete(`/api/admin/users/${user.id}`)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (e) {
      setFormErr(e.message || 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Header
        eyebrow="System"
        title="Settings"
        body="Manage user accounts and credentials. Admin only."
      />

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60">
            User Management
          </p>
          {!adding && !editId && (
            <Button onClick={startAdd}>+ Add User</Button>
          )}
        </div>

        {adding && (
          <div className="mb-5">
            <UserForm
              initial={blankForm()}
              onSave={saveNew}
              onCancel={cancel}
              saving={saving}
              error={formErr}
            />
          </div>
        )}

        {status === 'loading' && (
          <p className="py-8 text-center text-sm text-[#e8dcc0]/35">Loading…</p>
        )}
        {status === 'error' && (
          <p className="py-8 text-center text-sm text-red-300/65">{loadErr}</p>
        )}

        {status === 'ready' && (
          <div className="space-y-2">

            <div className="hidden sm:grid grid-cols-[1fr_120px_110px_110px_68px_120px] gap-3 px-3 pb-1">
              {['Name', 'Role', 'Username', 'Password', 'Status', ''].map((h, i) => (
                <div key={i} className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/25">{h}</div>
              ))}
            </div>

            {users.map(user => (
              <div key={user.id}>
                {editId === user.id ? (
                  <div className="mb-1">
                    <UserForm
                      initial={{
                        full_name: user.full_name,
                        role: user.role,
                        username: user.username || '',
                        password: user.password || '',
                        is_active: user.is_active,
                      }}
                      onSave={form => saveEdit(user.id, form)}
                      onCancel={cancel}
                      saving={saving}
                      error={formErr}
                    />
                  </div>
                ) : (
                  <div className={cx(
                    'grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_110px_110px_68px_120px] gap-3 items-center rounded-xl border px-3 py-2.5 transition-opacity',
                    user.is_active ? 'border-[#6b705c]/15 bg-[#14130f]' : 'border-[#6b705c]/10 bg-[#0d0c09] opacity-50'
                  )}>

                    <div className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#f5f5f0]">
                        {user.full_name}
                      </span>
                      <span className="block sm:hidden text-[10px] text-[#e8dcc0]/40 mt-0.5">
                        {ROLE_LABEL[user.role] || user.role}
                      </span>
                    </div>

                    <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/50">
                      {ROLE_LABEL[user.role] || user.role}
                    </span>

                    <span className="hidden sm:block font-mono text-[11px] text-[#c9a96e]">
                      {user.username || '—'}
                    </span>

                    <span className="hidden sm:block font-mono text-[11px] text-[#e8dcc0]/40">
                      {user.password || '—'}
                    </span>

                    <span className={cx(
                      'hidden sm:block rounded-full border px-2 py-0.5 text-center text-[9px] font-black uppercase tracking-widest',
                      user.is_active
                        ? 'border-emerald-700/30 text-emerald-400/65'
                        : 'border-[#6b705c]/20 text-[#e8dcc0]/25'
                    )}>
                      {user.is_active ? 'Active' : 'Off'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="rounded-lg border border-[#6b705c]/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/50 transition hover:border-[#c9a96e]/30 hover:text-[#c9a96e]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggle(user)}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                        className={cx(
                          'rounded-lg border px-2 py-1 text-[10px] font-black transition',
                          user.is_active
                            ? 'border-[#6b705c]/15 text-[#e8dcc0]/25 hover:border-red-800/30 hover:text-red-300/60'
                            : 'border-emerald-800/20 text-emerald-400/35 hover:border-emerald-700/40 hover:text-emerald-400/65'
                        )}
                      >
                        {user.is_active ? '●' : '○'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user)}
                        disabled={deletingId === user.id}
                        title="Delete user"
                        className="rounded-lg border border-[#6b705c]/15 px-2 py-1 text-[10px] font-black text-[#e8dcc0]/25 transition hover:border-red-800/40 hover:text-red-300/70 disabled:opacity-40"
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <p className="py-8 text-center text-sm text-[#e8dcc0]/35">No users found.</p>
            )}

          </div>
        )}
      </Card>
    </>
  )
}
