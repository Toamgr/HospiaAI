import React from 'react'
import { isTrustedInstructorEmbedUrl } from './instructorEmbedProviders'

export default function AcademyEmbeddedVideoPlayer({
  embedUrl,
  publicUrl,
  title,
  provider,
  aspectRatio = '16 / 9',
  allowFullscreen = true,
}) {
  const trusted = isTrustedInstructorEmbedUrl(embedUrl, provider)

  if (!trusted) {
    return (
      <div className="avi-videoFallback" role="status">
        <span>Video unavailable</span>
        <p>This instructor embed URL is not on the trusted provider allowlist.</p>
      </div>
    )
  }

  return (
    <div className="avi-videoShell" style={{ aspectRatio }}>
      <iframe
        src={embedUrl}
        title={title || 'Academy instructor video'}
        loading="lazy"
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen={allowFullscreen}
        referrerPolicy="strict-origin-when-cross-origin"
      />
      {publicUrl && (
        <a className="avi-videoLink" href={publicUrl} target="_blank" rel="noreferrer">
          Open provider page
        </a>
      )}
    </div>
  )
}
