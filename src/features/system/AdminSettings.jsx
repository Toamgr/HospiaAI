import { useState, useEffect, useCallback } from 'react'
import { Card, Header, Button } from '../../components/AppPrimitives'
import { cx } from '../../utils/format'
import { apiGet, apiPost, apiPut, apiPatch } from '../../services/api/client'

const ROLES = ['admin', 'owner', 'bar_manager', 'manager', 'employee']

const ROLE_LABEL = {
  admin: 'Admin',
  owner: 'Owner',
  bar_manager: 'Bar Manager',
  manager: 'Manager',
  employee: 'Employee'
}

function emptyForm() {
  return { full_name: '', role: 'employee', access_code: '', is_active: true }
}

function UserForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial)
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="rounded-2xl border border-[#c9a96e]/20 bg-[#1a1a1a] p-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/50">Full Name</label>
          <input
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 text-sm text-[#f5f5f0] placeholder-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/50">Access Code</label>
          <input
            value={form.access_code}
            onChange={e => set('access_code', e.target.value.toUpperCase())}
            placeholder="e.g. AB001"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 text-sm font-mono text-[#f5f5f0] placeholder-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/50">Role</label>
          <select
            value={form.role}
            onChange={e => set('role', e.target.value)}
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none"
          >
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-0.5">
          <button
            type="button"
            onClick={() => set('is_active', !form.is_active)}
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
            <span className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/50">
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-300/80">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    apiGet('/api/admin/users')
      .then(d => { setUsers(d.users || []); setLoading(false) })
      .catch(e => { setLoadError(e.message || 'Failed to load users.'); setLoading(false) })
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function copyCode(user) {
    navigator.clipboard?.writeText(user.access_code).catch(() => {})
    setCopiedId(user.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function openEdit(user) {
    setEditingId(user.id)
    setAddingNew(false)
    setFormError(null)
  }

  function openAddNew() {
    setAddingNew(true)
    setEditingId(null)
    setFormError(null)
  }

  function cancelForm() {
    setAddingNew(false)
    setEditingId(null)
    setFormError(null)
  }

  async function handleSaveNew(form) {
    setSaving(true)
    setFormError(null)
    try {
      const data = await apiPost('/api/admin/users', form)
      setUsers(prev => [...prev, data.user])
      setAddingNew(false)
    } catch (e) {
      setFormError(e.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit(id, form) {
    setSaving(true)
    setFormError(null)
    try {
      const data = await apiPut(`/api/admin/users/${id}`, form)
      setUsers(prev => prev.map(u => u.id === id ? data.user : u))
      setEditingId(null)
    } catch (e) {
      setFormError(e.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(user) {
    try {
      const data = await apiPatch(`/api/admin/users/${user.id}/toggle`, {})
      setUsers(prev => prev.map(u => u.id === user.id ? data.user : u))
    } catch (e) {
      setFormError(e.message || 'Toggle failed.')
    }
  }

  return (
    <>
      <Header
        eyebrow="System"
        title="Settings"
        body="User management and system configuration. Admin access only."
      />

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60">
            User Management
          </div>
          {!addingNew && !editingId && (
            <Button onClick={openAddNew}>+ Add User</Button>
          )}
        </div>

        {addingNew && (
          <div className="mb-5">
            <UserForm
              initial={emptyForm()}
              onSave={handleSaveNew}
              onCancel={cancelForm}
              saving={saving}
              error={formError}
            />
          </div>
        )}

        {loading && (
          <p className="py-6 text-center text-sm text-[#e8dcc0]/35">Loading users…</p>
        )}
        {loadError && (
          <p className="py-6 text-center text-sm text-red-300/70">{loadError}</p>
        )}

        {!loading && !loadError && (
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[1fr_120px_100px_64px_88px] gap-3 px-3 pb-1">
              {['Full Name', 'Role', 'Access Code', 'Status', ''].map((h, i) => (
                <div key={i} className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">{h}</div>
              ))}
            </div>

            {users.map(user => (
              <div key={user.id}>
                {editingId === user.id ? (
                  <div className="mb-1">
                    <UserForm
                      initial={{ full_name: user.full_name, role: user.role, access_code: user.access_code, is_active: user.is_active }}
                      onSave={form => handleSaveEdit(user.id, form)}
                      onCancel={cancelForm}
                      saving={saving}
                      error={formError}
                    />
                  </div>
                ) : (
                  <div className={cx(
                    'grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_64px_88px] gap-3 items-center rounded-xl border px-3 py-2.5',
                    user.is_active ? 'border-[#6b705c]/15 bg-[#14130f]' : 'border-[#6b705c]/10 bg-[#0d0c09] opacity-55'
                  )}>
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-[#f5f5f0] truncate">{user.full_name}</span>
                      <span className="block sm:hidden text-[10px] text-[#e8dcc0]/40 mt-0.5">{ROLE_LABEL[user.role] || user.role}</span>
                    </div>
                    <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/55">
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(user)}
                      className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#6b705c]/20 bg-[#0d0c09] px-2 py-1 font-mono text-[11px] text-[#c9a96e] transition hover:border-[#c9a96e]/30"
                      title="Click to copy"
                    >
                      {copiedId === user.id ? '✓ Copied' : user.access_code}
                    </button>
                    <span className={cx(
                      'hidden sm:block rounded-full border px-2 py-0.5 text-center text-[9px] font-black uppercase tracking-widest',
                      user.is_active
                        ? 'border-emerald-700/30 text-emerald-400/70'
                        : 'border-[#6b705c]/20 text-[#e8dcc0]/30'
                    )}>
                      {user.is_active ? 'Active' : 'Off'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="rounded-lg border border-[#6b705c]/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/55 transition hover:border-[#c9a96e]/30 hover:text-[#c9a96e]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(user)}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                        className={cx(
                          'rounded-lg border px-2 py-1 text-[9px] font-black transition',
                          user.is_active
                            ? 'border-[#6b705c]/15 text-[#e8dcc0]/30 hover:border-red-800/30 hover:text-red-300/60'
                            : 'border-emerald-800/20 text-emerald-400/40 hover:border-emerald-700/40 hover:text-emerald-400/70'
                        )}
                      >
                        {user.is_active ? '●' : '○'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <p className="py-6 text-center text-sm text-[#e8dcc0]/35">No users found.</p>
            )}
          </div>
        )}
      </Card>
    </>
  )
}
