import React from 'react'
import ZoharCocktailBriefCard from './ZoharCocktailBriefCard'
import ZoharFoodBriefCard from './ZoharFoodBriefCard'
import ZoharOperationsBriefCard from './ZoharOperationsBriefCard'

// Renders the three department brief cards in a responsive grid.
// On mobile: stacked. On wider screens: 3-column.

export default function ZoharDepartmentBriefs({
  brief,
  seatingIntelligence,
  coordinationAssessment,
  timelineIntelligence,
  loadingMenu,
  cocktailMenuStatus,
  taskCreated,
  taskError,
  creatingTask,
  onGenerateMenu,
  onCreateTask,
  canAccessArchitect,
  onOpenArchitect,
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
      <ZoharCocktailBriefCard
        brief={brief}
        loadingMenu={loadingMenu}
        cocktailMenuStatus={cocktailMenuStatus}
        taskCreated={taskCreated}
        taskError={taskError}
        creatingTask={creatingTask}
        onGenerateMenu={onGenerateMenu}
        onCreateTask={onCreateTask}
      />
      <ZoharFoodBriefCard brief={brief} />
      <ZoharOperationsBriefCard
        brief={brief}
        seatingIntelligence={seatingIntelligence}
        coordinationAssessment={coordinationAssessment}
        timelineIntelligence={timelineIntelligence}
        canAccessArchitect={canAccessArchitect}
        onOpenArchitect={onOpenArchitect}
      />
    </div>
  )
}
