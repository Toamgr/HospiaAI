// BeverageBriefInboxContainer — owns all state, effects, and API calls for the F&B Director's
// Beverage Brief Inbox (Beverage Slice 1A). The presentational component
// (../BeverageBriefInbox) receives everything as props and imports no hooks.

import { useCallback, useEffect, useState } from 'react'
import {
  listBriefInbox, getInboxBrief, createBriefReview, updateBriefReview,
} from '../../../services/api/beverageBriefApi'
import BeverageBriefInbox from '../BeverageBriefInbox'

export default function BeverageBriefInboxContainer({ currentUser }) {
  const role = currentUser?.role
  const allowed = role === 'fb_director'

  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [loadError, setLoadError] = useState(null)
  const [briefs, setBriefs] = useState([])

  const [openId, setOpenId] = useState(null)
  const [detail, setDetail] = useState(null)            // { brief, review, events }
  const [detailState, setDetailState] = useState('idle')// idle | loading | ready | error
  const [detailError, setDetailError] = useState(null)

  const [notesDraft, setNotesDraft] = useState('')
  const [adjustmentDrafts, setAdjustmentDrafts] = useState({})
  const [busy, setBusy] = useState(null)                // 'opening' | 'saving' | 'deciding' | null
  const [actionError, setActionError] = useState(null)
  const [savedNote, setSavedNote] = useState(null)

  const load = useCallback(async () => {
    setLoadState('loading'); setLoadError(null)
    try {
      const res = await listBriefInbox()
      setBriefs(Array.isArray(res.briefs) ? res.briefs : [])
      setLoadState('ready')
    } catch (err) {
      setLoadError(err.message || 'We couldn’t reach the brief inbox.')
      setLoadState('error')
    }
  }, [])

  useEffect(() => { if (allowed) load() }, [allowed, load])

  const openBrief = async (briefId) => {
    setOpenId(briefId); setDetailState('loading'); setDetailError(null)
    setActionError(null); setSavedNote(null); setAdjustmentDrafts({})
    try {
      const res = await getInboxBrief(briefId)
      setDetail(res)
      setNotesDraft(res.review?.notes || '')
      setDetailState('ready')
    } catch (err) {
      setDetailError(err.message || 'Could not open this brief.')
      setDetailState('error')
    }
  }

  const closeBrief = () => {
    setOpenId(null); setDetail(null); setDetailState('idle')
    setNotesDraft(''); setAdjustmentDrafts({}); setActionError(null); setSavedNote(null)
    load()
  }

  const onOpenReview = async () => {
    setBusy('opening'); setActionError(null); setSavedNote(null)
    try {
      const res = await createBriefReview(detail.brief.id)
      setDetail(prev => ({ ...prev, review: res.review }))
    } catch (err) {
      setActionError(err.message || 'Could not open the review.')
    } finally { setBusy(null) }
  }

  // Collect non-blank adjustment drafts into the PATCH payload shape.
  const pendingAdjustments = () =>
    Object.entries(adjustmentDrafts)
      .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
      .map(([field, adjusted_value]) => ({ field, adjusted_value }))

  const patchReview = async (payload, busyKind, note) => {
    setBusy(busyKind); setActionError(null); setSavedNote(null)
    try {
      const res = await updateBriefReview(detail.review.id, payload)
      setDetail(prev => ({ ...prev, review: res.review }))
      setAdjustmentDrafts({})
      if (note) setSavedNote(note)
    } catch (err) {
      setActionError(err.message || 'Could not update the review.')
    } finally { setBusy(null) }
  }

  const onSaveReviewWork = () =>
    patchReview({ notes: notesDraft, adjustments: pendingAdjustments() }, 'saving', 'Review notes saved.')

  const onDecide = (status) =>
    patchReview({ notes: notesDraft, adjustments: pendingAdjustments(), status }, 'deciding')

  const onDraftChange = (field, value) => {
    setAdjustmentDrafts(prev => ({ ...prev, [field]: value }))
    setSavedNote(null)
  }

  const onNotesChange = (value) => {
    setNotesDraft(value)
    setSavedNote(null)
  }

  return (
    <BeverageBriefInbox
      allowed={allowed}
      loadState={loadState}
      loadError={loadError}
      onRetryLoad={load}
      briefs={briefs}
      openId={openId}
      onOpenBrief={openBrief}
      onCloseBrief={closeBrief}
      detail={detail}
      detailState={detailState}
      detailError={detailError}
      notesDraft={notesDraft}
      onNotesChange={onNotesChange}
      adjustmentDrafts={adjustmentDrafts}
      onDraftChange={onDraftChange}
      busy={busy}
      actionError={actionError}
      savedNote={savedNote}
      onOpenReview={onOpenReview}
      onSaveReviewWork={onSaveReviewWork}
      onDecide={onDecide}
    />
  )
}
