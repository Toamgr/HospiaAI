import React, { useEffect, useMemo, useRef, useState } from 'react'

function splitIntoSentences(transcript = []) {
  const text = Array.isArray(transcript) ? transcript.join(' ') : String(transcript || '')
  const matches = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || []
  return matches.map(sentence => sentence.trim()).filter(Boolean)
}

export default function LocalBrowserTalkingInstructor({ transcript = [], title = 'HESTIA Instructor' }) {
  const sentences = useMemo(() => splitIntoSentences(transcript), [transcript])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [supported, setSupported] = useState(true)
  const activeIndexRef = useRef(0)
  const manualStopRef = useRef(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
    utterance.rate = 0.9
    utterance.pitch = 0.92
    utterance.volume = 1
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

  function play() {
    speakAt(currentIndex)
  }

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
    speakAt(0)
  }

  function goToSentence(index) {
    stop()
    const safeIndex = Math.min(Math.max(index, 0), Math.max(sentences.length - 1, 0))
    activeIndexRef.current = safeIndex
    setCurrentIndex(safeIndex)
  }

  const progress = sentences.length ? Math.round(((currentIndex + 1) / sentences.length) * 100) : 0

  return (
    <section className="avi-localInstructor" aria-label="Browser TTS simulated speaking avatar">
      <div className="avi-localInstructorStage">
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
          <span className="avi-kicker">Browser TTS + simulated speaking avatar</span>
          <h2>{title}</h2>
          <p>
            This mode uses the browser Web Speech API to read the prototype transcript.
            The animation indicates speaking state only; it is not real lip-sync.
          </p>
          {!supported && (
            <div className="avi-ttsWarning" role="status">
              Speech synthesis is not available in this browser.
            </div>
          )}
        </div>
      </div>

      <div className="avi-ttsControls" aria-label="Browser speech controls">
        <button type="button" onClick={play} disabled={!supported || speaking || !sentences.length}>Play</button>
        <button type="button" onClick={pause} disabled={!supported || !speaking}>Pause</button>
        <button type="button" onClick={resume} disabled={!supported || !paused}>Resume</button>
        <button type="button" onClick={stop} disabled={!supported || (!speaking && !paused)}>Stop</button>
        <button type="button" onClick={restart} disabled={!supported || !sentences.length}>Restart</button>
        <button type="button" onClick={() => goToSentence(currentIndex - 1)} disabled={currentIndex === 0}>Previous sentence</button>
        <button type="button" onClick={() => goToSentence(currentIndex + 1)} disabled={currentIndex >= sentences.length - 1}>Next sentence</button>
      </div>

      <div className="avi-progressBar" aria-label={`Lesson speech progress ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="avi-progressMeta">
        Sentence {sentences.length ? currentIndex + 1 : 0} of {sentences.length}
      </div>

      <div className="avi-sentenceList">
        {sentences.map((sentence, index) => (
          <button
            key={`${index}-${sentence.slice(0, 24)}`}
            type="button"
            className={index === currentIndex ? 'isCurrent' : ''}
            onClick={() => goToSentence(index)}
          >
            {sentence}
          </button>
        ))}
      </div>
    </section>
  )
}
