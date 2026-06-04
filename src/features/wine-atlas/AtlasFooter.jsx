export default function AtlasFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(204,184,152,0.60)', marginTop: '8rem' }}>
      <div
        className="mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-10"
        style={{ maxWidth: '1600px' }}
      >
        <div className="md:col-span-5">
          <div
            className="wa-font-display leading-none"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: '#3f0d0d' }}
          >
            Hestia
          </div>
          <div className="wa-text-eyebrow mt-2">The Wine Atlas</div>
          <p
            className="mt-6 max-w-md text-sm leading-relaxed wa-font-serif"
            style={{ color: '#6b4e38', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}
          >
            A cinematic sommelier academy and editorial atlas — published for those
            who believe wine is a way of understanding the world.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="wa-text-eyebrow mb-4">Atlas</div>
          <ul className="space-y-2 text-sm" style={{ color: '#2a1c14' }}>
            <li>Regions</li><li>Grapes</li><li>Styles</li><li>Vintages</li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="wa-text-eyebrow mb-4">Academy</div>
          <ul className="space-y-2 text-sm" style={{ color: '#2a1c14' }}>
            <li>WSET Level 2</li><li>WSET Level 3</li><li>Tasting</li><li>Service</li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="wa-text-eyebrow mb-4">Editorial</div>
          <ul className="space-y-2 text-sm" style={{ color: '#2a1c14' }}>
            <li>The Sommelier Journal</li><li>Vineyard Letters</li><li>Cellar Notes</li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(204,184,152,0.60)' }}>
        <div
          className="mx-auto px-6 md:px-12 py-6 flex justify-between"
          style={{
            maxWidth: '1600px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.7rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#6b4e38',
          }}
        >
          <span>© MMXXVI Hestia Editions</span>
          <span>Published in Europe · Printed on the web</span>
        </div>
      </div>
    </footer>
  )
}
