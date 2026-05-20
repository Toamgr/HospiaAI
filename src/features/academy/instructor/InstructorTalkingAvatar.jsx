import React, { useMemo } from 'react'

// Derives a 0–1 float from sentence text for per-sentence animation rhythm variation.
// Same sentence always produces the same seed — deterministic, no audio required.
function sentenceRhythmSeed(sentence) {
  if (!sentence) return 0.5
  let h = 0
  for (let i = 0; i < sentence.length; i++) {
    h = (h * 31 + sentence.charCodeAt(i)) | 0
  }
  return (Math.abs(h) % 1000) / 1000
}

function SilhouetteSvg({ speaking }) {
  return (
    <svg
      className={`avi-silhouetteSvg${speaking ? ' isSpeaking' : ''}`}
      viewBox="0 0 80 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="avi-headFill" cx="46%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#2c2118" />
          <stop offset="100%" stopColor="#100d09" />
        </radialGradient>
        <radialGradient id="avi-shoulderFill" cx="50%" cy="5%" r="85%">
          <stop offset="0%" stopColor="#201a11" />
          <stop offset="100%" stopColor="#0b0907" />
        </radialGradient>
        <linearGradient id="avi-rimRight" x1="100%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="rgba(201,169,110,0.28)" />
          <stop offset="60%" stopColor="rgba(201,169,110,0.08)" />
          <stop offset="100%" stopColor="rgba(201,169,110,0.02)" />
        </linearGradient>
        <linearGradient id="avi-shoulderRim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(201,169,110,0.22)" />
          <stop offset="50%" stopColor="rgba(201,169,110,0.06)" />
          <stop offset="100%" stopColor="rgba(201,169,110,0.18)" />
        </linearGradient>
      </defs>

      {/* Breathing group — all body parts move together */}
      <g className="avi-svgBreathGroup">

        {/* Shoulders */}
        <g className="avi-svgShoulders">
          <path
            d="M 0 112 C 0 86 13 70 28 67 L 52 67 C 67 70 80 86 80 112 Z"
            fill="url(#avi-shoulderFill)"
          />
          {/* Shoulder rim accent */}
          <path
            d="M 0 112 C 0 86 13 70 28 67"
            fill="none"
            stroke="url(#avi-shoulderRim)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <path
            d="M 52 67 C 67 70 80 86 80 112"
            fill="none"
            stroke="url(#avi-shoulderRim)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          {/* Collar / lapel hint */}
          <path
            d="M 36 67 L 40 78 L 44 67"
            fill="none"
            stroke="rgba(201,169,110,0.12)"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Neck */}
        <rect
          className="avi-svgNeck"
          x="34.5" y="56" width="11" height="13"
          rx="2.5"
          fill="#18140f"
        />

        {/* Head */}
        <ellipse
          cx="40" cy="36"
          rx="19" ry="22"
          fill="url(#avi-headFill)"
          stroke="rgba(201,169,110,0.16)"
          strokeWidth="0.5"
        />
        {/* Brass rim light — right side of head */}
        <ellipse
          cx="40" cy="36"
          rx="19" ry="22"
          fill="none"
          stroke="url(#avi-rimRight)"
          strokeWidth="1.4"
          strokeDasharray="32 100"
          strokeDashoffset="-4"
        />
        {/* Face plane axis — single horizontal, not two marks — reads as geometry, not eyes */}
        <line
          x1="24" y1="31" x2="56" y2="31"
          stroke="rgba(201,169,110,0.07)"
          strokeWidth="0.6"
          strokeLinecap="round"
        />

        {/* Speech indicator — single line, not a cartoon mouth */}
        <rect
          className="avi-svgMouth"
          x="36" y="42"
          width="8" height="1.2"
          rx="0.6"
          fill="rgba(201,169,110,0.28)"
        />

      </g>{/* /avi-svgBreathGroup */}
    </svg>
  )
}

export default function InstructorTalkingAvatar({
  speaking = false,
  portraitSrc = null,
  personaName = '',
  instructorTitle = '',
  academyLabel = '',
  activeSentence = '',
}) {
  const seed = useMemo(() => sentenceRhythmSeed(activeSentence), [activeSentence])

  // Per-sentence rhythm: mouth cycles between 0.52s and 0.97s, shoulder sway 2.1s–3.0s
  const cssVars = speaking ? {
    '--avi-mouth-dur': `${0.52 + seed * 0.45}s`,
    '--avi-shoulder-dur': `${2.1 + seed * 0.9}s`,
  } : {}

  return (
    <div className={`avi-avatar${speaking ? ' isSpeaking' : ''}`}>
      <div className="avi-avatarHalo" aria-hidden="true" />

      {portraitSrc ? (
        // ── Portrait mode ────────────────────────────────────────────────────
        <div className="avi-avatarFace" style={cssVars}>
          <img
            src={portraitSrc}
            alt={personaName}
            className="avi-portraitImage"
          />
          <div className="avi-speakGlow" aria-hidden="true" />
          <div className="avi-speechWaves" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
        </div>
      ) : (
        // ── Silhouette mode ──────────────────────────────────────────────────
        <div
          className="avi-avatarFace avi-silhouetteCard"
          style={cssVars}
          aria-label={`${personaName}${instructorTitle ? `, ${instructorTitle}` : ''}`}
        >
          <div className="avi-silhouetteStage">
            <SilhouetteSvg speaking={speaking} />
            <div className="avi-speechWaves" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>
          </div>
          <div className="avi-silhouetteIdentity">
            {instructorTitle && (
              <div className="avi-portraitKicker">{instructorTitle}</div>
            )}
            <div className="avi-portraitName">{personaName}</div>
            {academyLabel && (
              <div className="avi-portraitAcademy">{academyLabel}</div>
            )}
          </div>
          <div className="avi-speakGlow" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
