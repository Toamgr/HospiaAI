import React, { useState } from 'react'
import { Button, Alert } from '../../components/AppPrimitives'

export default function LoginScreen({ t, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Enter username and password.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onLogin({ username, password })
    } catch (loginError) {
      setError(loginError.message || t.app.invalid)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#0d0c09] text-[#f5f5f0] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex items-end overflow-hidden border-b border-[#6b705c]/30 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.2),transparent_34%),linear-gradient(135deg,#181611,#0d0c09)] p-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-12">
        <div className="max-w-3xl">
          <div className="mb-6 text-sm font-black uppercase tracking-[0.28em] text-[#c9a96e]">
            {t.app.secureAccess}
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight text-[#f5f5f0] sm:text-7xl">
            {t.app.name} <span className="text-[#c9a96e]">{t.app.suffix}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#e8dcc0]">{t.app.accessBody}</p>

          <div className="mt-10 grid gap-3 text-sm text-[#e8dcc0] sm:grid-cols-2">
            <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">Owner intelligence, budget approvals, and weekly summaries.</div>
            <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">Manager control tower, events, staff progression, and bar governance.</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-[1.75rem] border border-[#6b705c]/30 bg-[#14130f] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c9a96e]">
                {t.app.secureAccess}
              </div>
              <h2 className="mt-3 font-serif text-3xl font-black tracking-tight text-[#f5f5f0]">
                {t.app.accessTitle}
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <input
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/50 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
            />
            <input
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/50 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
            />
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <Button type="submit" className="mt-4 w-full" disabled={submitting}>{submitting ? 'Entering...' : t.app.enter}</Button>
        </form>
      </section>
    </main>
  )
}
