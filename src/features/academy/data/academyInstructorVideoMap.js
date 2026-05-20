// Video metadata map for Academy Instructor embedded mode.
// Entries must be keyed by exact lesson.id and only added when the video
// is confirmed to match that specific lesson. Do not invent entries.
// All other lessons fall back to voice or reader mode automatically.
const academyInstructorVideoMap = {
  'service-001': {
    provider: 'synthesia-embed',
    mode: 'embedded',
    title: 'HESTIA Bar Academy - Luxury Bar Hospitality: The Art Of Welcoming Guests',
    embedUrl: 'https://share.synthesia.io/embeds/videos/05d5dfcf-ad20-498b-8607-4045f1ff180b',
    publicUrl: 'https://share.synthesia.io/05d5dfcf-ad20-498b-8607-4045f1ff180b',
  },
}

export default academyInstructorVideoMap
