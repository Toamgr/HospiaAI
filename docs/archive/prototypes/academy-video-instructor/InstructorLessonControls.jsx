import React from 'react'

export default function InstructorLessonControls({
  started,
  watched,
  showTranscript,
  showTakeaways,
  showQuestions,
  onStart,
  onMarkWatched,
  onToggleTranscript,
  onToggleTakeaways,
  onToggleQuestions,
  onReset,
}) {
  return (
    <section className="avi-panel avi-controls" aria-label="Instructor lesson controls">
      <div>
        <span className="avi-kicker">Local Prototype Controls</span>
        <h2>Lesson State</h2>
      </div>
      <div className="avi-controlGrid">
        <button type="button" className="avi-primaryButton" onClick={onStart} disabled={started}>
          {started ? 'Started' : 'Start lesson'}
        </button>
        <button type="button" onClick={onMarkWatched} disabled={watched}>
          {watched ? 'Watched' : 'Mark as watched'}
        </button>
        <button type="button" onClick={onToggleTranscript}>
          {showTranscript ? 'Hide transcript' : 'Show transcript'}
        </button>
        <button type="button" onClick={onToggleTakeaways}>
          {showTakeaways ? 'Hide key takeaways' : 'Show key takeaways'}
        </button>
        <button type="button" onClick={onToggleQuestions}>
          {showQuestions ? 'Hide review questions' : 'Show review questions'}
        </button>
        <button type="button" className="avi-quietButton" onClick={onReset}>
          Reset progress
        </button>
      </div>
      <div className="avi-stateRow">
        <span data-active={started}>Started</span>
        <span data-active={watched}>Watched</span>
        <span data-active={showTranscript}>Transcript</span>
      </div>
    </section>
  )
}
