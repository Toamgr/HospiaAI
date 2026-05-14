import { EMAILJS } from '../config/systemConfig'

export function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      window.emailjs.init(EMAILJS.publicKey)
      resolve(window.emailjs)
      return
    }

    const existing = document.querySelector(`script[src="${EMAILJS.scriptUrl}"]`)
    if (existing) {
      existing.addEventListener('load', () => {
        window.emailjs.init(EMAILJS.publicKey)
        resolve(window.emailjs)
      })
      existing.addEventListener('error', () => reject(new Error('EmailJS failed to load')))
      return
    }

    const script = document.createElement('script')
    script.src = EMAILJS.scriptUrl
    script.async = true
    script.onload = () => {
      window.emailjs.init(EMAILJS.publicKey)
      resolve(window.emailjs)
    }
    script.onerror = () => reject(new Error('EmailJS failed to load'))
    document.body.appendChild(script)
  })
}
