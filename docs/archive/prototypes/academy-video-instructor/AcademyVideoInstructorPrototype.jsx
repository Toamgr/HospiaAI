import React, { useState } from 'react'
import AcademyEmbeddedVideoPlayer from './AcademyEmbeddedVideoPlayer'
import InstructorLessonControls from './InstructorLessonControls'
import InstructorTranscriptPanel from './InstructorTranscriptPanel'
import LocalBrowserAvatarPlaceholder from './LocalBrowserAvatarPlaceholder'
import LocalBrowserTalkingInstructor from './LocalBrowserTalkingInstructor'
import { academyVideoInstructorPrototypeLesson } from './instructorPrototypeData'
import './academyVideoInstructor.css'

export default function AcademyVideoInstructorPrototype({ lesson = academyVideoInstructorPrototypeLesson }) {
  const [instructorMode, setInstructorMode] = useState('embedded')
  const [started, setStarted] = useState(false)
  const [watched, setWatched] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)
  const [showTakeaways, setShowTakeaways] = useState(true)
  const [showQuestions, setShowQuestions] = useState(false)

  function resetProgress() {
    setStarted(false)
    setWatched(false)
    setShowTranscript(true)
    setShowTakeaways(true)
    setShowQuestions(false)
  }

  return (
    <main className="avi-root">
      <header className="avi-hero">
        <div>
          <span className="avi-kicker">{lesson.academy}</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.subtitle}</p>
        </div>
        <div className="avi-sourceCard" aria-label="Source lesson reference">
          <span>Source Lesson</span>
          <strong>{lesson.sourceLessonId}</strong>
          <small>{lesson.course}</small>
        </div>
      </header>

      <div className="avi-layout">
        <section className="avi-stage" aria-label="Instructor video stage">
          <div className="avi-stageHeader">
            <div>
              <span className="avi-kicker">Instructor Mode</span>
              <h2>{instructorMode === 'embedded' ? lesson.instructorVideoTitle : 'Local Browser Talking Instructor'}</h2>
            </div>
            <span className="avi-providerPill">
              {instructorMode === 'embedded' ? lesson.instructorVideoProvider : 'browser-tts'}
            </span>
          </div>

          <div className="avi-modeSwitch" aria-label="Instructor mode selector">
            <button
              type="button"
              className={instructorMode === 'embedded' ? 'isActive' : ''}
              onClick={() => setInstructorMode('embedded')}
            >
              Embedded Synthesia video
            </button>
            <button
              type="button"
              className={instructorMode === 'local-browser' ? 'isActive' : ''}
              onClick={() => setInstructorMode('local-browser')}
            >
              Local browser talking instructor
            </button>
          </div>

          {instructorMode === 'embedded' ? (
            <AcademyEmbeddedVideoPlayer
              embedUrl={lesson.instructorVideoEmbedUrl}
              publicUrl={lesson.instructorVideoPublicUrl}
              title={lesson.instructorVideoTitle}
              provider={lesson.instructorVideoProvider}
              allowFullscreen
            />
          ) : (
            <LocalBrowserTalkingInstructor
              transcript={lesson.transcript}
              title="HESTIA Local Browser Instructor"
            />
          )}
          <div className="avi-instructorCard">
            <div>
              <span className="avi-kicker">Instructor Identity</span>
              <h3>HESTIA Academy Video Instructor</h3>
            </div>
            <p>
              A provider-agnostic teaching layer mapped to the real Academy lesson structure.
              This demo uses a trusted Synthesia embed URL only.
            </p>
          </div>
        </section>

        <aside className="avi-sidebar">
          <InstructorLessonControls
            started={started}
            watched={watched}
            showTranscript={showTranscript}
            showTakeaways={showTakeaways}
            showQuestions={showQuestions}
            onStart={() => setStarted(true)}
            onMarkWatched={() => setWatched(true)}
            onToggleTranscript={() => setShowTranscript(value => !value)}
            onToggleTakeaways={() => setShowTakeaways(value => !value)}
            onToggleQuestions={() => setShowQuestions(value => !value)}
            onReset={resetProgress}
          />

          <section className="avi-panel">
            <span className="avi-kicker">Original Lesson Topics</span>
            <h2>Mapped Content</h2>
            <ul className="avi-topicList">
              {lesson.originalLessonTopics.map(topic => <li key={topic}>{topic}</li>)}
            </ul>
          </section>
        </aside>
      </div>

      <div className="avi-lowerGrid">
        <InstructorTranscriptPanel
          transcript={lesson.transcript}
          keyTakeaways={lesson.keyTakeaways}
          reviewQuestions={lesson.reviewQuestions}
          showTranscript={showTranscript}
          showTakeaways={showTakeaways}
          showQuestions={showQuestions}
          prototypeTranscriptOnly={lesson.prototypeTranscriptOnly}
        />

        <section className="avi-panel">
          <span className="avi-kicker">Production Mapping</span>
          <h2>Connection Notes</h2>
          <ul>
            {lesson.productionMappingNotes.map(note => <li key={note}>{note}</li>)}
          </ul>
        </section>

        <LocalBrowserAvatarPlaceholder />
      </div>
    </main>
  )
}
