import React, { useState, useEffect, useMemo } from 'react'
import { fetchCocktailMenu } from '../../../services/api/eventsApi'
import { buildZoharBrief } from '../utils/zoharBriefOrchestrator'
import { buildDesignContext } from '../utils/eventDesignContext'
import { computeSeatingIntelligence } from '../utils/seatingIntelligence'
import { computeRiskAssessment } from '../utils/zoharRiskEngine'
import { computeCoordination } from '../utils/zoharCoordinationEngine'
import { computeTimelineIntelligence } from '../utils/zoharTimelineEngine'
import EventBriefMenuGenerator from '../components/EventBriefMenuGenerator'
import {
  ZoharBriefHeader,
  ZoharReadinessSummary,
  ZoharHospitalityDNA,
  ZoharRiskSummary,
  ZoharMissingInputs,
  ZoharNextActions,
  ZoharDepartmentBriefs,
} from '../zohar'

const ARCHITECT_ROLES = ['events_manager', 'manager', 'owner', 'admin']

export default function EventZohar({
  event, guests, tables, tasks, timeline,
  currentUser, goToPage, onAddTask, onUpdateTask, refreshDetail,
}) {
  const [cocktailMenuStatus, setCocktailMenuStatus] = useState(null)
  const [loadingMenu, setLoadingMenu]               = useState(true)
  const [creatingTask, setCreatingTask]             = useState(false)
  const [taskCreated, setTaskCreated]               = useState(false)
  const [taskError, setTaskError]                   = useState(null)
  const [showGenerator, setShowGenerator]           = useState(false)

  useEffect(() => {
    setLoadingMenu(true)
    setCocktailMenuStatus(null)
    fetchCocktailMenu(event.id)
      .then(data => setCocktailMenuStatus(data.menu?.status ?? null))
      .catch(() => setCocktailMenuStatus(null))
      .finally(() => setLoadingMenu(false))
  }, [event.id])

  useEffect(() => {
    setTaskCreated(false)
    setTaskError(null)
    setShowGenerator(false)
  }, [event.id])

  const brief = useMemo(
    () => buildZoharBrief({ event, guests: guests ?? [], tables: tables ?? [], tasks: tasks ?? [], timeline: timeline ?? [] }),
    [event, guests, tables, tasks, timeline]
  )

  const designContext = useMemo(
    () => buildDesignContext({ event, brief }),
    [event, brief]
  )

  const seatingIntelligence = useMemo(
    () => computeSeatingIntelligence(guests ?? [], tables ?? []),
    [guests, tables]
  )

  const riskAssessment = useMemo(
    () => computeRiskAssessment({ event, guests: guests ?? [], tables: tables ?? [], tasks: tasks ?? [], timeline: timeline ?? [], seatingIntelligence, cocktailMenuStatus, zoharBrief: brief }),
    [event, guests, tables, tasks, timeline, seatingIntelligence, cocktailMenuStatus, brief]
  )

  const coordinationAssessment = useMemo(
    () => computeCoordination({ event, guests: guests ?? [], tables: tables ?? [], tasks: tasks ?? [], seatingIntelligence, riskAssessment, zoharBrief: brief, cocktailMenuStatus }),
    [event, guests, tables, tasks, seatingIntelligence, riskAssessment, brief, cocktailMenuStatus]
  )

  const timelineIntelligence = useMemo(
    () => computeTimelineIntelligence({ event, guests: guests ?? [], tables: tables ?? [], tasks: tasks ?? [], timeline: timeline ?? [], seatingIntelligence, coordinationAssessment, riskAssessment }),
    [event, guests, tables, tasks, timeline, seatingIntelligence, coordinationAssessment, riskAssessment]
  )

  if (!brief) {
    return <div style={{ padding: 24, color: '#5A5550', fontSize: 11 }}>Unable to generate brief — event data unavailable.</div>
  }

  const canAccessArchitect = ARCHITECT_ROLES.includes(currentUser?.role)

  async function handleCreateCocktailTask() {
    setCreatingTask(true)
    setTaskError(null)
    try {
      await onAddTask(event.id, {
        title:       `Build cocktail menu for ${event.name}`,
        assigned_to: 'Bar Manager',
        priority:    'high',
        notes:       brief.cocktailMenuBrief.outputRequestText,
      })
      setTaskCreated(true)
    } catch (err) {
      setTaskError(err?.message || 'Failed to create task. Please try again.')
    } finally {
      setCreatingTask(false)
    }
  }

  function openArchitect() {
    try { sessionStorage.setItem('hestia.architect.linkId', String(event.id)) } catch {}
    goToPage('eventBrain', { eventId: event.id })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <ZoharBriefHeader
        eventName={brief.eventName}
        eventTypeLabel={brief.eventTypeLabel}
        daysUntil={brief.daysUntil}
      />

      <ZoharReadinessSummary
        brief={brief}
        riskAssessment={riskAssessment}
      />

      <ZoharHospitalityDNA
        hospitalityDNA={brief.hospitalityDNA}
      />

      <ZoharRiskSummary riskAssessment={riskAssessment} />

      <ZoharMissingInputs items={brief.missingInputs} />

      <ZoharNextActions
        brief={brief}
        riskAssessment={riskAssessment}
        coordinationAssessment={coordinationAssessment}
        canAccessArchitect={canAccessArchitect}
        onOpenArchitect={openArchitect}
      />

      <ZoharDepartmentBriefs
        brief={brief}
        seatingIntelligence={seatingIntelligence}
        coordinationAssessment={coordinationAssessment}
        timelineIntelligence={timelineIntelligence}
        loadingMenu={loadingMenu}
        cocktailMenuStatus={cocktailMenuStatus}
        taskCreated={taskCreated}
        taskError={taskError}
        creatingTask={creatingTask}
        onGenerateMenu={() => setShowGenerator(true)}
        onCreateTask={handleCreateCocktailTask}
        canAccessArchitect={canAccessArchitect}
        onOpenArchitect={openArchitect}
      />

      {showGenerator && (
        <EventBriefMenuGenerator
          event={event}
          brief={brief}
          designContext={designContext}
          tasks={tasks}
          currentUser={currentUser}
          onUpdateTask={onUpdateTask}
          onApproved={() => {
            setCocktailMenuStatus('approved')
            setShowGenerator(false)
            refreshDetail?.()
          }}
          onClose={() => setShowGenerator(false)}
        />
      )}

      <p style={{ fontSize: 9.5, color: '#3A3A3A', fontStyle: 'italic', textAlign: 'center', margin: '2px 0 6px' }}>
        Briefs are generated from real event data. Copy and share with your team.
      </p>
    </div>
  )
}
