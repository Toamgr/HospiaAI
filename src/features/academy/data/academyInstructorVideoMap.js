// DEV — video metadata map for AI Instructor embedded mode.
// Add entries here when a lesson has a trusted embedded video.
// All other lessons fall back to local browser TTS automatically.
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
