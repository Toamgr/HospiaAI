import React, { useEffect, useMemo, useRef, useState } from 'react'

function splitIntoSentences(input = []) {
  const text = Array.isArray(input) ? input.join(' ') : String(input || '')
  const matches = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || []
  return matches.map(s => s.trim()).filter(Boolean)
}

export default function InstructorTalkingHead({
  transcript = [],
  personaName = 'Rafael',
  academyLabel = 'Bar Academy',
  voiceProfile = null,
  onSentenceChange = null,
  onSupportedChange = null,
}) {
  const sentences = useMemo(() => splitIntoSentences(transcript), [transcript])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [supported, setSupported] = useState(true)
  const activeIndexRef = useRef(0)
  const manualStopRef = useRef(false)

  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    setSupported(isSupported)
    onSupportedChange?.(isSupported)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      manualStopRef.current = true
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
    setPaused(false)
    setCurrentIndex(0)
    activeIndexRef.current = 0
  }, [transcript])

  useEffect(() => {
    onSentenceChange?.(currentIndex)
  }, [currentIndex, onSentenceChange])

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
        {/* Portrait placeholder — warm amber face with halo and speech indicator */}
        <div className={speaking ? 'avi-avatar isSpeaking' : 'avi-avatar'}>
          <div className="avi-avatarHalo" />
          <div className="avi-avatarFace">
            <div className="avi-avatarEyes">
              <span />
              <span />
            </div>
            <div className="avi-avatarMouth" />
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
