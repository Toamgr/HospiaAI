export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Cormorant', 'serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        // Wine Atlas editorial palette
        wa: {
          background: '#f5f0e8',
          foreground: '#2a1c14',
          ivory:      '#f5f0e8',
          parchment:  '#ede6d5',
          ink:        '#261512',
          burgundy:   '#7a1818',
          'burgundy-deep': '#3f0d0d',
          oak:        '#5c4020',
          amber:      '#c4950a',
          vine:       '#48602a',
          card:       '#f0e5cc',
          border:     '#ccb898',
          muted:      '#e5d5b5',
          'muted-fg': '#6b4e38',
        },
        hospia: {
          black:    '#080806',
          graphite: '#0d0c09',
          slate:    '#1a1a1a',
          card:     '#141311',
          border:   'rgba(107,112,92,0.2)',
          muted:    'rgba(232,220,192,0.55)',
          cream:    '#e8dcc0',
          white:    '#f5f5f0',
          gold:     '#c9a96e',
          'gold-light': '#e8d0a0',
          'gold-dim':   'rgba(201,169,110,0.12)',
          danger:   '#e53e3e',
          'danger-dim': 'rgba(229,62,62,0.15)',
          success:  '#48bb78',
          'success-dim': 'rgba(72,187,120,0.15)',
          info:     '#63b3ed',
        }
      },
      fontFamily: {
        sans: [
          'Inter', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'
        ]
      },
      boxShadow: {
        'hospia': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'hospia-lg': '0 4px 16px rgba(0,0,0,0.5)',
        'gold': '0 0 0 1px rgba(201,168,76,0.3)',
      },
      borderRadius: {
        'hospia': '8px',
      }
    }
  },
  plugins: []
}
