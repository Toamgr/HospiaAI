import React, { useState, useCallback } from 'react'
import { Button } from '../../components/AppPrimitives'
import InstructorTalkingHead from './instructor/InstructorTalkingHead'
import InstructorTranscriptPanel from './instructor/InstructorTranscriptPanel'
import './instructor/instructor.css'

function ReaderMode({ script }) {
  return (
    <div className="avi-readerMode" role="region" aria-label="Reading with Rafael today">
      <div className="avi-readerCaption">Reading with {script.instructorName} today</div>
      <div className="avi-readerContent">
        {script.segments
          .filter(s => s.type === 'source-derived' && s.text)
          .map((seg, i) => (
            <div key={`seg-${i}`} className="avi-readerSection">
              {seg.sourceField && (
                <div className="avi-readerSectionLabel">{seg.sourceField.replace(/_/g, ' ')}</div>
              )}
              <p className="avi-readerText">{seg.text}</p>
            </div>
          ))}
        {script.keyTakeaways.length > 0 && (
          <div className="avi-readerSection">
            <div className="avi-readerSectionLabel">Key points</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {script.keyTakeaways.map((t, i) => (
                <li key={i} className="avi-readerText">{t}</li>
              ))}
            </ul>
          </div>
        )}
        {script.reviewQuestions.length > 0 && (
          <div className="avi-readerSection">
            <div className="avi-readerSectionLabel">
              Reflect with {script.instructorName}
            </div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {script.reviewQuestions.map((q, i) => (
                <li key={i} className="avi-readerText">{q}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LessonInstructorView({ script }) {
  const [showTranscript, setShowTranscript] = useState(true)
  const [showTakeaways, setShowTakeaways] = useState(true)
  const [showQuestions, setShowQuestions] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [ttsSupported, setTtsSupported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  )

  const handleSentenceChange = useCallback((index) => {
    setCurrentSentenceIndex(index)
  }, [])

  const handleSupportedChange = useCallback((supported) => {
    setTtsSupported(supported)
  }, [])

  if (!script) return null

  // Editorial-needed state — lesson content is too thin for narration
  if (script.editorialNeeded) {
    return (
      <div className="avi-editorialState" role="status">
        <div className="avi-kicker" style={{ marginBottom: 10 }}>{script.instructorName}</div>
        <p>This lesson is still being prepared. Step back in when {script.instructorName} has more to teach.</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.06),transparent_50%),#0f0e0b] p-5 space-y-5"
      role="region"
      aria-label={`Voice with ${script.instructorName}`}
    >
      {/* Header */}
      <div className="avi-instructorHeader">
        <div>
          <div className="avi-personaBadge">{script.title}</div>
          <div className="avi-personaLabel">Voice with {script.instructorName}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setShowTranscript(v => !v)}>
            {showTranscript ? 'Hide narration' : 'Show narration'}
          </Button>
          <Button variant="ghost" onClick={() => setShowTakeaways(v => !v)}>
            {showTakeaways ? 'Hide key points' : 'Show key points'}
          </Button>
          <Button variant="ghost" onClick={() => setShowQuestions(v => !v)}>
            {showQuestions ? 'Hide reflection' : 'Reflect with ' + script.instructorName}
          </Button>
        </div>
      </div>

      {/* Stage: either voice or reader mode */}
      {ttsSupported ? (
        <InstructorTalkingHead
          transcript={script.sentences}
          personaName={script.instructorName}
          academyLabel={script.academyLabel || 'HESTIA Academy'}
          voiceProfile={null}
          onSentenceChange={handleSentenceChange}
          onSupportedChange={handleSupportedChange}
        />
      ) : (
        <ReaderMode script={script} />
      )}

      {/* Narration panel — only shown with voice */}
      {ttsSupported && (
        <InstructorTranscriptPanel
          transcript={script.sentences}
          keyTakeaways={script.keyTakeaways}
          reviewQuestions={script.reviewQuestions}
          currentSentenceIndex={currentSentenceIndex}
          personaName={script.instructorName}
          showTranscript={showTranscript}
          showTakeaways={showTakeaways}
          showQuestions={showQuestions}
        />
      )}

      {/* In reader mode, still show takeaways and reflection */}
      {!ttsSupported && (
        <InstructorTranscriptPanel
          transcript={[]}
          keyTakeaways={script.keyTakeaways}
          reviewQuestions={script.reviewQuestions}
          currentSentenceIndex={-1}
          personaName={script.instructorName}
          showTranscript={false}
          showTakeaways={showTakeaways}
          showQuestions={showQuestions}
        />
      )}
    </div>
  )
}
