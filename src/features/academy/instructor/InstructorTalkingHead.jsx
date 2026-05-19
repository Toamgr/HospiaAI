import React, { useEffect, useMemo, useRef, useState } from 'react'

function splitIntoSentences(input = []) {
  const text = Array.isArray(input) ? input.join(' ') : String(input || '')
  const matches = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || []
  return matches.map(s => s.trim()).filter(Boolean)
}

function readResumeIndex(lessonId, maxIndex) {
  if (!lessonId) return 0
  try {
    const raw = localStorage.getItem(`hospia.academy.instructor.${lessonId}.v1.lastSentenceIndex`)
    if (raw === null) return 0
    const idx = parseInt(raw, 10)
    if (isNaN(idx) || idx < 0) return 0
    return Math.min(idx, maxIndex)
  } catch {
    return 0
  }
}

function writeResumeIndex(lessonId, index) {
  if (!lessonId) return
  try {
    localStorage.setItem(`hospia.academy.instructor.${lessonId}.v1.lastSentenceIndex`, String(index))
  } catch {
    // localStorage unavailable in this context
  }
}

function pickVoice(voices) {
  if (!voices.length) return null
  const en = voices.filter(v => v.lang.startsWith('en'))
  if (!en.length) return null
  // Prefer calm/male-name voices for bar persona; fall back to first English voice
  const preferred = en.find(v => /\b(david|mark|alex|arthur|james)\b/i.test(v.name))
  return preferred || en[0]
}

export default function InstructorTalkingHead({
  transcript = [],
  personaName = 'Rafael',
  academyLabel = 'Bar Academy',
  voiceProfile = null,
  lessonId = '',
  onSentenceChange = null,
  onSupportedChange = null,
}) {
  const sentences = useMemo(() => splitIntoSentences(transcript), [transcript])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState([])
  const activeIndexRef = useRef(0)
  const manualStopRef = useRef(false)

  // Mount: detect TTS support, load voice list, register voiceschanged
  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    setSupported(isSupported)
    onSupportedChange?.(isSupported)

    if (isSupported) {
      function loadVoices() {
        const v = window.speechSynthesis.getVoices()
        if (v.length) setVoices(v)
      }
      loadVoices()
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
        window.speechSynthesis.cancel()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lesson change: stop playback, restore resume position for this lesson
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      manualStopRef.current = true
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
    setPaused(false)
    const resumeIndex = readResumeIndex(lessonId, Math.max(sentences.length - 1, 0))
    setCurrentIndex(resumeIndex)
    activeIndexRef.current = resumeIndex
  }, [transcript, lessonId])

  // Sync active sentence to parent and persist position
  useEffect(() => {
    writeResumeIndex(lessonId, currentIndex)
    onSentenceChange?.(currentIndex)
  }, [currentIndex, lessonId, onSentenceChange])

  function speakAt(index) {
    if (!supported || !sentences.length) return
    const safeIndex = Math.min(Math.max(index, 0), sentences.length - 1)
    manualStopRef.current = false
    activeIndexRef.current = safeIndex
    setCurrentIndex(safeIndex)
    setPaused(false)
    setSpeaking(true)
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(sentences[safeIndex])
    utterance.rate = voiceProfile?.rate ?? 0.88
    utterance.pitch = voiceProfile?.pitch ?? 0.92
    utterance.volume = voiceProfile?.volume ?? 1

    const voice = pickVoice(voices)
    if (voice) utterance.voice = voice

    utterance.onend = () => {
      if (manualStopRef.current) return
      const nextIndex = activeIndexRef.current + 1
      if (nextIndex < sentences.length) {
        speakAt(nextIndex)
      } else {
        setSpeaking(false)
        setPaused(false)
      }
    }
    utterance.onerror = () => {
      setSpeaking(false)
      setPaused(false)
    }
    window.speechSynthesis.speak(utterance)
  }

  function play() { speakAt(currentIndex) }

  function pause() {
    if (!supported) return
    window.speechSynthesis.pause()
    setPaused(true)
    setSpeaking(false)
  }

  function resume() {
    if (!supported) return
    window.speechSynthesis.resume()
    setPaused(false)
    setSpeaking(true)
  }

  function stop() {
    if (!supported) return
    manualStopRef.current = true
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  function restart() {
    stop()
    setTimeout(() => speakAt(0), 60)
  }

  function goToSentence(index) {
    stop()
    const safeIndex = Math.min(Math.max(index, 0), Math.max(sentences.length - 1, 0))
    activeIndexRef.current = safeIndex
    setCurrentIndex(safeIndex)
  }

  const progress = sentences.length ? (currentIndex + 1) / sentences.length : 0
  const activeSentence = sentences[currentIndex] || ''

  return (
    <section className="avi-localInstructor" aria-label={`Voice with ${personaName}`}>
      <div className="avi-localInstructorStage">
        {/* Portrait — dignified dark silhouette with brass initial */}
        <div className={speaking ? 'avi-avatar isSpeaking' : 'avi-avatar'}>
          <div className="avi-avatarHalo" />
          <div className="avi-avatarFace">
            <div className="avi-avatarInitial">{personaName ? personaName[0] : '?'}</div>
          </div>
          <div className="avi-speechWaves">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="avi-localInstructorCopy">
          <div className="avi-personaAcademy">{academyLabel}</div>
          <h2 className="avi-personaName">{personaName}</h2>

          {/* Active sentence caption */}
          {supported ? (
            <div className={`avi-spokenCaption${activeSentence ? '' : ' isEmpty'}`}>
              {activeSentence || (speaking ? '…' : 'Press Play to begin.')}
            </div>
          ) : (
            <div className="avi-spokenCaption isEmpty">
              Reading with {personaName} today. Voice is not available in this browser.
            </div>
          )}
        </div>
      </div>

      {/* Controls — only shown when voice is available */}
      {supported && (
        <div className="avi-controls" aria-label="Playback controls">
          {!speaking && !paused && (
            <button
              type="button"
              className="avi-controlBtn isPrimary"
              onClick={play}
              disabled={!sentences.length}
            >
              Play
            </button>
          )}
          {speaking && (
            <button type="button" className="avi-controlBtn isPrimary" onClick={pause}>
              Pause
            </button>
          )}
          {paused && (
            <button type="button" className="avi-controlBtn isPrimary" onClick={resume}>
              Resume
            </button>
          )}
          <button
            type="button"
            className="avi-controlBtn"
            onClick={restart}
            disabled={!sentences.length}
          >
            Restart
          </button>
          <button
            type="button"
            className="avi-controlBtn"
            onClick={() => goToSentence(currentIndex - 1)}
            disabled={currentIndex === 0}
            aria-label="Previous sentence"
          >
            Back
          </button>
          <button
            type="button"
            className="avi-controlBtn"
            onClick={() => goToSentence(currentIndex + 1)}
            disabled={currentIndex >= sentences.length - 1}
            aria-label="Next sentence"
          >
            Forward
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="avi-progressBar" aria-label={`Narration progress ${Math.round(progress * 100)}%`}>
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="avi-progressMeta" aria-live="polite">
        {sentences.length ? `${currentIndex + 1} of ${sentences.length}` : '—'}
      </div>
    </section>
  )
}
