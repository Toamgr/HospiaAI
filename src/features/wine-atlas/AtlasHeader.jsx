const NAV = [
  { id: 'regions',  label: 'Regions' },
  { id: 'grapes',   label: 'Grapes' },
  { id: 'styles',   label: 'Styles' },
  { id: 'academy',  label: 'Academy' },
]

export default function AtlasHeader({ view, setView, onExit }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-40">
      <div
        className="mx-auto px-6 py-6 flex items-center justify-between"
        style={{ maxWidth: '1600px' }}
      >
        {/* Logo */}
        <button
          onClick={() => setView('home')}
          className="flex items-baseline gap-3 group bg-transparent border-0 cursor-pointer p-0"
        >
          <span
            className="wa-font-display text-2xl tracking-tight mix-blend-difference"
            style={{ color: '#f5f0e8', fontFamily: 'Cormorant Garamond, serif' }}
          >
            Hestia
          </span>
          <span
            className="wa-text-eyebrow mix-blend-difference hidden sm:inline"
            style={{ color: 'rgba(245,240,232,0.80)', letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: '0.6875rem' }}
          >
            Wine Atlas
          </span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className="bg-transparent border-0 cursor-pointer transition-colors mix-blend-difference"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: view === n.id ? '#c4950a' : 'rgba(245,240,232,0.85)',
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Right side: volume tag + back to HESTIA */}
        <div className="hidden md:flex items-center gap-6">
          <span
            className="mix-blend-difference"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.70)',
            }}
          >
            Vol. I · MMXXVI
          </span>
          {onExit && (
            <button
              onClick={onExit}
              className="transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.50)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                mixBlendMode: 'difference',
              }}
              title="Back to HESTIA"
            >
              ← HESTIA
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
