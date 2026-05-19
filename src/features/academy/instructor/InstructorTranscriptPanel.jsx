import React, { useEffect, useRef, useState } from 'react'

export default function InstructorTranscriptPanel({
  transcript = [],
  keyTakeaways = [],
  reviewQuestions = [],
  currentSentenceIndex = -1,
  personaName = 'Rafael',
  showTranscript,
  showTakeaways,
  showQuestions,
}) {
  const [reflections, setReflections] = useState({})
  const activeRef = useRef(null)

  // Scroll active sentence into view when it changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [currentSentenceIndex])

  function handleReflection(index, value) {
    setReflections(prev => ({ ...prev, [index]: value }))
  }

  return (
    <section className="avi-panel avi-transcriptPanel">
      <div className="avi-panelHeader">
        <div>
          <span className="avi-kicker">With {personaName}</span>
          <h2>Guided Narration</h2>
        </div>
      </div>

      {/* Guided narration sentence list */}
      {showTranscript && (
        <div className="avi-section">
          <h3>Narration</h3>
          <div
            className="avi-sentenceList"
            role="list"
            aria-label="Guided narration sentences"
          >
            {transcript.length === 0 ? (
              <p style={{ color: 'rgba(232,220,192,0.45)', fontSize: 13, padding: '8px 0' }}>
                {personaName} will narrate this lesson when you press Play.
              </p>
            ) : (
              transcript.map((sentence, index) => {
                const isActive = index === currentSentenceIndex
                return (
                  <div
                    key={`${index}-${sentence.slice(0, 20)}`}
                    className={isActive ? 'isCurrent' : ''}
                    ref={isActive ? activeRef : null}
                    role="listitem"
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {sentence}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Key takeaways — sourced only from lesson structured fields */}
      {showTakeaways && (
        <div className="avi-section">
          <h3>Key Points</h3>
          {keyTakeaways.length === 0 ? (
            <p style={{ color: 'rgba(232,220,192,0.45)', fontSize: 13, lineHeight: 1.7 }}>
              {personaName} does not have takeaways prepared for this lesson yet.
            </p>
          ) : (
            <ul>
              {keyTakeaways.map((item, i) => (
                <li key={`takeaway-${i}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Review questions — reflective prompts only, no scoring */}
      {showQuestions && (
        <div className="avi-section">
          <h3>Reflect with {personaName}</h3>
          {reviewQuestions.length === 0 ? (
            <p style={{ color: 'rgba(232,220,192,0.45)', fontSize: 13, lineHeight: 1.7 }}>
              Take a moment. What from this lesson will you carry to the floor tonight?
            </p>
          ) : (
            <ol>
              {reviewQuestions.map((question, index) => (
                <li key={`question-${index}`} style={{ marginBottom: 16 }}>
                  {question}
                  <textarea
                    className="avi-reflectionPrompt"
                    placeholder="Your thoughts…"
                    value={reflections[index] || ''}
                    onChange={e => handleReflection(index, e.target.value)}
                    aria-label={`Reflection for: ${question}`}
                    rows={2}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}
