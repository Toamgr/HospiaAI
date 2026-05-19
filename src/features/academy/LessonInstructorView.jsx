import React, { useState } from 'react'
import { Button } from '../../components/AppPrimitives'
import InstructorTalkingHead from './instructor/InstructorTalkingHead'
import InstructorTranscriptPanel from './instructor/InstructorTranscriptPanel'
import AcademyEmbeddedVideoPlayer from './instructor/AcademyEmbeddedVideoPlayer'
import './instructor/instructor.css'

export default function LessonInstructorView({ script, videoMeta = null }) {
  const [showTranscript, setShowTranscript] = useState(true)
  const [showTakeaways, setShowTakeaways] = useState(true)
  const [showQuestions, setShowQuestions] = useState(false)

  if (!script) return null

  return (
    <div className="rounded-2xl border border-[#c9a96e]/25 bg-[#c9a96e]/5 p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c9a96e]">AI Instructor</div>
          <div className="mt-1 text-sm font-black text-[#f5f5f0]">{script.instructorName}</div>
          <div className="mt-0.5 text-xs text-[#e8dcc0]/55">{script.instructorTone}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setShowTranscript(v => !v)}>
            {showTranscript ? 'Hide transcript' : 'Show transcript'}
          </Button>
          <Button variant="ghost" onClick={() => setShowTakeaways(v => !v)}>
            {showTakeaways ? 'Hide takeaways' : 'Show takeaways'}
          </Button>
          <Button variant="ghost" onClick={() => setShowQuestions(v => !v)}>
            {showQuestions ? 'Hide questions' : 'Show questions'}
          </Button>
        </div>
      </div>

      {videoMeta && (
        <AcademyEmbeddedVideoPlayer
          embedUrl={videoMeta.embedUrl}
          publicUrl={videoMeta.publicUrl}
          title={videoMeta.title}
          provider={videoMeta.provider}
        />
      )}

      <InstructorTalkingHead
        transcript={script.sentences}
        title={script.instructorName}
      />

      <InstructorTranscriptPanel
        transcript={script.sentences}
        keyTakeaways={script.keyTakeaways}
        reviewQuestions={script.reviewQuestions}
        showTranscript={showTranscript}
        showTakeaways={showTakeaways}
        showQuestions={showQuestions}
      />
    </div>
  )
}
