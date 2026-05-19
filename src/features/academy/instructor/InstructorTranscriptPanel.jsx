import React from 'react'

export default function InstructorTranscriptPanel({
  transcript = [],
  keyTakeaways = [],
  reviewQuestions = [],
  showTranscript,
  showTakeaways,
  showQuestions,
}) {
  return (
    <section className="avi-panel avi-transcriptPanel">
      <div className="avi-panelHeader">
        <div>
          <span className="avi-kicker">Instructor Companion</span>
          <h2>Transcript And Review</h2>
        </div>
      </div>

      {showTranscript && (
        <div className="avi-section">
          <h3>Transcript</h3>
          <div className="avi-transcriptText">
            {transcript.map((line, index) => (
              <p key={`${index}-${line.slice(0, 16)}`}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {showTakeaways && (
        <div className="avi-section">
          <h3>Key Takeaways</h3>
          <ul>
            {keyTakeaways.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {showQuestions && (
        <div className="avi-section">
          <h3>Review Questions</h3>
          <ol>
            {reviewQuestions.map(item => <li key={item}>{item}</li>)}
          </ol>
        </div>
      )}
    </section>
  )
}
