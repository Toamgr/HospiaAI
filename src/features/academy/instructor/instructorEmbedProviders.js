const TRUSTED_EMBED_PREFIXES = Object.freeze({
  'synthesia-embed': 'https://share.synthesia.io/embeds/videos/',
})

export function isTrustedInstructorEmbedUrl(embedUrl, provider) {
  if (!embedUrl || typeof embedUrl !== 'string') return false
  const trustedPrefix = TRUSTED_EMBED_PREFIXES[provider]
  if (!trustedPrefix) return false
  try {
    const parsedUrl = new URL(embedUrl)
    const parsedPrefix = new URL(trustedPrefix)
    return (
      parsedUrl.protocol === 'https:' &&
      parsedUrl.origin === parsedPrefix.origin &&
      parsedUrl.pathname.startsWith(parsedPrefix.pathname)
    )
  } catch {
    return false
  }
}
