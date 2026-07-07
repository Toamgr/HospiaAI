// OwnerBeverageBriefContainer — owns all state, effects, and API calls for the owner's
// Beverage Direction Brief (Beverage Slice 1A). The presentational component
// (../OwnerBeverageBrief) receives everything as props and imports no hooks.

import { useCallback, useEffect, useState } from 'react'
import {
  createBeverageBrief, updateBeverageBrief, submitBeverageBrief, listBeverageBriefs,
} from '../../../services/api/beverageBriefApi'
import { EMPTY_FIELDS, briefToForm, formToFields } from '../ownerBeverageBriefFields'
import OwnerBeverageBrief from '../OwnerBeverageBrief'

export default function OwnerBeverageBriefContainer({ currentUser }) {
  const role = currentUser?.role
  const allowed = role === 'owner'

  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [loadError, setLoadError] = useState(null)
  const [brief, setBrief] = useState(null)              // latest persisted brief (or null)
  const [form, setForm] = useState(EMPTY_FIELDS)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(null)                // 'saving' | 'submitting' | null
  const [actionError, setActionError] = useState(null)
  const [savedNote, setSavedNote] = useState(null)
  const [composingNew, setComposingNew] = useState(false)

  const load = useCallback(async () => {
    setLoadState('loading'); setLoadError(null)
    try {
      const res = await listBeverageBriefs()
      const latest = Array.isArray(res.briefs) && res.briefs.length > 0 ? res.briefs[0] : null
      setBrief(latest)
      setForm(latest && latest.status === 'draft' ? briefToForm(latest) : { ...EMPTY_FIELDS })
      setDirty(false)
      setComposingNew(false)
      setLoadState('ready')
    } catch (err) {
      setLoadError(err.message || 'We couldn’t reach the beverage brief data.')
      setLoadState('error')
    }
  }, [])

  useEffect(() => { if (allowed) load() }, [allowed, load])

  const onFieldChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setDirty(true)
    setSavedNote(null)
  }

  // Persist the current form: create on first save, update afterwards. Returns the saved brief.
  const persistDraft = async () => {
    const fields = formToFields(form)
    const editingDraft = brief && brief.status === 'draft' && !composingNew
    const res = editingDraft
      ? await updateBeverageBrief(brief.id, fields)
      : await createBeverageBrief(fields)
    setBrief(res.brief)
    setComposingNew(false)
    setDirty(false)
    return res.brief
  }

  const onSaveDraft = async () => {
    setBusy('saving'); setActionError(null); setSavedNote(null)
    try {
      await persistDraft()
      setSavedNote('Draft saved.')
    } catch (err) {
      setActionError(err.message || 'Could not save the draft.')
    } finally { setBusy(null) }
  }

  const onSubmit = async () => {
    setBusy('submitting'); setActionError(null); setSavedNote(null)
    try {
      const editingDraft = brief && brief.status === 'draft' && !composingNew
      const saved = dirty || !editingDraft ? await persistDraft() : brief
      const res = await submitBeverageBrief(saved.id)
      setBrief(res.brief)
      setDirty(false)
    } catch (err) {
      setActionError(err.message || 'Could not submit the brief.')
    } finally { setBusy(null) }
  }

  const onBeginNew = () => {
    setComposingNew(true)
    setForm({ ...EMPTY_FIELDS })
    setDirty(false)
    setActionError(null)
    setSavedNote(null)
  }

  return (
    <OwnerBeverageBrief
      allowed={allowed}
      loadState={loadState}
      loadError={loadError}
      onRetryLoad={load}
      brief={brief}
      form={form}
      composingNew={composingNew}
      busy={busy}
      actionError={actionError}
      savedNote={savedNote}
      onFieldChange={onFieldChange}
      onSaveDraft={onSaveDraft}
      onSubmit={onSubmit}
      onBeginNew={onBeginNew}
    />
  )
}
