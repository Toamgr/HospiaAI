export const INSTRUCTOR_VIDEO_MODES = Object.freeze({
  EMBEDDED: 'embedded',
  UPLOADED_VIDEO: 'uploaded-video',
  LOCAL_BROWSER_AVATAR: 'local-browser-avatar',
  SYNTHESIA_FUTURE_API: 'synthesia-future-api',
  HEYGEN_FUTURE_API: 'heygen-future-api',
  DID_FUTURE_API: 'did-future-api',
  NONE: 'none',
})

export const INSTRUCTOR_VIDEO_PROVIDERS = Object.freeze({
  SYNTHESIA_EMBED: 'synthesia-embed',
  UPLOADED_VIDEO: 'uploaded-video',
  LOCAL_BROWSER_AVATAR: 'local-browser-avatar',
  SYNTHESIA_FUTURE_API: 'synthesia-future-api',
  HEYGEN_FUTURE_API: 'heygen-future-api',
  DID_FUTURE_API: 'did-future-api',
  NONE: 'none',
})

const TRUSTED_EMBED_PREFIXES = Object.freeze({
  [INSTRUCTOR_VIDEO_PROVIDERS.SYNTHESIA_EMBED]: 'https://share.synthesia.io/embeds/videos/',
})

export function isTrustedInstructorEmbedUrl(embedUrl, provider) {
  if (!embedUrl || typeof embedUrl !== 'string') return false
  const trustedPrefix = TRUSTED_EMBED_PREFIXES[provider]
  if (!trustedPrefix) return false

  try {
    const parsedUrl = new URL(embedUrl)
    const parsedPrefix = new URL(trustedPrefix)
    return parsedUrl.protocol === 'https:' &&
      parsedUrl.origin === parsedPrefix.origin &&
      parsedUrl.pathname.startsWith(parsedPrefix.pathname)
  } catch {
    return false
  }
}

export const FUTURE_PROVIDER_NOTES = Object.freeze([
  'Uploaded MP4 should use a controlled video component with file metadata, not iframe HTML.',
  'Local browser avatar mode can read lesson data with browser TTS or a local adapter.',
  'Future Synthesia, HeyGen, or D-ID integrations should live behind provider adapters with no lesson-level API keys.',
])
