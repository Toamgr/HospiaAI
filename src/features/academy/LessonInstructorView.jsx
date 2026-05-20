import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Button } from '../../components/AppPrimitives'
import InstructorTalkingHead from './instructor/InstructorTalkingHead'
import InstructorTranscriptPanel from './instructor/InstructorTranscriptPanel'
import AcademyEmbeddedVideoPlayer from './instructor/AcademyEmbeddedVideoPlayer'
import './instructor/instructor.css'

function ReaderMode({ script }) {
  return (
    <div className="avi-readerMode" role="region" aria-label={`Reading with ${script.instructorName} today`}>
      <div className="avi-readerCaption">Reading with {script.instructorName} today.</div>
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

export default function LessonInstructorView({ script, lessonId = '', videoMeta = null }) {
  const [showTranscript, setShowTranscript] = useState(true)
  const [showTakeaways, setShowTakeaways] = useState(true)
  const [showQuestions, setShowQuestions] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [ttsSupported, setTtsSupported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  )

  const availableModes = useMemo(() => {
    const modes = ['reader']
    if (ttsSupported) modes.unshift('voice')
    if (videoMeta) modes.unshift('video')
    return modes
  }, [videoMeta, ttsSupported])

  const [mode, setMode] = useState(() => availableModes[0])

  // Reset to the highest-priority available mode on lesson change or mode availability change
  useEffect(() => {
    setMode(availableModes[0])
  }, [lessonId, availableModes])

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

  const modeLabel = mode === 'video' ? 'Video' : mode === 'voice' ? 'Voice' : 'Reading'

  return (
    <div
      className="rounded-2xl border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.06),transparent_50%),#0f0e0b] p-5 space-y-5"
      role="region"
      aria-label={`${modeLabel} with ${script.instructorName}`}
    >
      {/* Header */}
      <div className="avi-instructorHeader">
        <div>
          <div className="avi-personaBadge">{script.title}</div>
          <div className="avi-personaLabel">{modeLabel} with {script.instructorName}</div>
        </div>
        {/* Voice/reader toggle controls — suppressed in video mode */}
        {mode !== 'video' && (
          <div className="flex flex-wrap gap-2">
            {mode === 'voice' && (
              <Button variant="ghost" onClick={() => setShowTranscript(v => !v)}>
                {showTranscript ? 'Hide narration' : 'Show narration'}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setShowTakeaways(v => !v)}>
              {showTakeaways ? 'Hide key points' : 'Show key points'}
            </Button>
            <Button variant="ghost" onClick={() => setShowQuestions(v => !v)}>
              {showQuestions ? 'Hide reflection' : 'Reflect with ' + script.instructorName}
            </Button>
          </div>
        )}
      </div>

      {/* Mode switcher — only rendered when a video exists and multiple modes are available */}
      {videoMeta && availableModes.length > 1 && (
        <div className="avi-modeSwitcher" role="group" aria-label="Instructor mode">
          {availableModes.includes('video') && (
            <button
              type="button"
              className={`avi-modeBtn${mode === 'video' ? ' isActive' : ''}`}
              onClick={() => setMode('video')}
            >
              Video with {script.instructorName}
            </button>
          )}
          {availableModes.includes('voice') && (
            <button
              type="button"
              className={`avi-modeBtn${mode === 'voice' ? ' isActive' : ''}`}
              onClick={() => setMode('voice')}
            >
              Voice with {script.instructorName}
            </button>
          )}
          {availableModes.includes('reader') && (
            <button
              type="button"
              className={`avi-modeBtn${mode === 'reader' ? ' isActive' : ''}`}
              onClick={() => setMode('reader')}
            >
              Reading with {script.instructorName}
            </button>
          )}
        </div>
      )}

      {/* Stage */}
      {mode === 'video' && videoMeta && (
        <AcademyEmbeddedVideoPlayer
          embedUrl={videoMeta.embedUrl}
          title={videoMeta.title}
          provider={videoMeta.provider}
        />
      )}
      {mode === 'voice' && (
        <InstructorTalkingHead
          transcript={script.sentences}
          personaName={script.instructorName}
          academyLabel={script.academyLabel || 'HESTIA Academy'}
          instructorTitle={script.instructorTitle || ''}
          voiceProfile={script.voiceProfile}
          portraitSrc={script.portraitSrc || null}
          lessonId={lessonId}
          onSentenceChange={handleSentenceChange}
          onSupportedChange={handleSupportedChange}
        />
      )}
      {mode === 'reader' && (
        <ReaderMode script={script} />
      )}

      {/* Narration panel — voice mode only */}
      {mode === 'voice' && (
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

      {/* Reader panel — takeaways and reflection without transcript */}
      {mode === 'reader' && (
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
