import { useState, useEffect, useRef, useCallback } from 'react'
import './magazine.css'
import MagazineCover from './MagazineCover'
import MagazineStories from './MagazineStories'
import MagazineCocktailDetail from './MagazineCocktailDetail'
import { GrainOverlay } from './MagazineEditorialPrimitives'

/*
 * ClassicCocktailsMagazine
 *
 * Top-level shell for the embedded editorial magazine.
 * Replaces TanStack Router with internal state-based navigation.
 * Applies negative margins to break out of HESTIA's main padding
 * so the magazine occupies the full content area.
 *
 * view: 'cover' | 'stories' | { slug: string }
 */
export default function ClassicCocktailsMagazine() {
  const [view, setView] = useState('cover')
  const [scrolled, setScrolled] = useState(false)
  const shellRef = useRef(null)
  const isFirstRender = useRef(true)

  // Track scroll of the parent window to style the internal nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll to top of magazine when view changes (skip initial mount)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    // Offset by HESTIA's sticky TopNav height (5rem = 80px)
    const top = (shellRef.current?.offsetTop ?? 0) - 80
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [view])

  const navigate = useCallback((target) => {
    setView(target)
  }, [])

  const currentSlug = typeof view === 'object' ? view.slug : null
  const isActive = (path) => {
    if (path === 'cover') return view === 'cover'
    if (path === 'stories') return view === 'stories' || currentSlug !== null
    return false
  }

  return (
    // Breakout: counteract HESTIA main's padding at every breakpoint
    <div
      className="-mx-5 sm:-mx-7 lg:-mx-10 xl:-mx-14 2xl:-mx-20 -mt-5 sm:-mt-7 lg:-mt-10 xl:-mt-14 2xl:-mt-20"
      ref={shellRef}
    >
      <div className="magazine-shell">
        <GrainOverlay />

        {/* Internal magazine nav — sticky within the shell */}
        <MagazineNav
          view={view}
          scrolled={scrolled}
          onNavigate={navigate}
          isActive={isActive}
          currentSlug={currentSlug}
        />

        {/* Page content */}
        <main>
          {view === 'cover' && <MagazineCover onNavigate={navigate} />}
          {view === 'stories' && <MagazineStories onNavigate={navigate} />}
          {currentSlug && <MagazineCocktailDetail slug={currentSlug} onNavigate={navigate} />}
        </main>

        {/* Magazine footer */}
        <MagazineFooter onNavigate={navigate} />
      </div>
    </div>
  )
}

/* ─── Internal Navigation ────────────────────────────────────────────────── */

function MagazineNav({ view, scrolled, onNavigate, isActive, currentSlug }) {
  return (
    <nav
      className={`mag-nav${scrolled ? ' scrolled' : ''}`}
      style={{ height: '3.5rem' }}
    >
      <div
        className="mx-auto max-w-[1480px] px-5 md:px-10 h-full flex items-center justify-between gap-6"
      >
        {/* Wordmark */}
        <button
          onClick={() => onNavigate('cover')}
          className="flex items-baseline gap-2"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span className="kicker text-amber">Hestia</span>
          <span className="meta text-muted-foreground hidden sm:inline">·</span>
          <span className="meta text-paper-dim hidden sm:inline">Classic Cocktails</span>
        </button>

        {/* Nav items */}
        <div className="flex items-center gap-5 md:gap-8">
          <NavItem label="Cover" active={isActive('cover')} onClick={() => onNavigate('cover')} />
          <NavItem label="Library" active={isActive('stories')} onClick={() => onNavigate('stories')} />
          {currentSlug && (
            <span className="meta text-amber hidden md:inline" style={{ opacity: 0.7 }}>
              · {currentSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          )}
        </div>

        <div className="hidden md:flex meta text-muted-foreground">Issue Nº 01 · MMXXVI</div>
      </div>
    </nav>
  )
}

function NavItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`meta reveal-link transition-colors${active ? ' text-paper' : ' text-muted-foreground'}`}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: active ? 'var(--mag-paper)' : undefined }}
    >
      {label}
    </button>
  )
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function MagazineFooter({ onNavigate }) {
  return (
    <footer style={{ marginTop: '8rem', borderTop: '1px solid oklch(0.55 0.08 70 / 0.4)', paddingTop: '4rem', paddingBottom: '3rem' }}>
      <div className="mx-auto max-w-[1480px] px-5 md:px-10 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="kicker text-amber">Hestia · Classic Cocktails</div>
          <h3 className="h-display mt-4 max-w-sm text-paper" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)' }}>
            A field guide to the drinks that have outlasted us.
          </h3>
        </div>
        <FooterColumn
          title="Sections"
          items={[
            ['Cover', 'cover'],
            ['Library', 'stories'],
          ]}
          onNavigate={onNavigate}
        />
        <FooterColumn
          title="The Library"
          items={[
            ['Negroni', { slug: 'negroni' }],
            ['Old Fashioned', { slug: 'old-fashioned' }],
            ['Martini', { slug: 'martini' }],
            ['Daiquiri', { slug: 'daiquiri' }],
            ['Sazerac', { slug: 'sazerac' }],
          ]}
          onNavigate={onNavigate}
        />
        <div>
          <div className="meta text-muted-foreground" style={{ marginBottom: '0.75rem' }}>Colophon</div>
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
            Set in Fraunces and Inter Tight. Printed on the open web.
            Published by Hestia, the hospitality intelligence platform.
          </p>
        </div>
      </div>
      <div
        className="mx-auto max-w-[1480px] px-5 md:px-10 flex flex-col md:flex-row justify-between gap-2"
        style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid oklch(0.55 0.08 70 / 0.3)' }}
      >
        <span className="meta text-muted-foreground">© MMXXVI Hestia. Drink with intention.</span>
        <span className="meta text-muted-foreground">Issue Nº 01 — Winter</span>
      </div>
    </footer>
  )
}

function FooterColumn({ title, items, onNavigate }) {
  return (
    <div>
      <div className="meta text-muted-foreground" style={{ marginBottom: '0.75rem' }}>{title}</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(([label, target]) => (
          <li key={label}>
            <button
              onClick={() => onNavigate(target)}
              className="text-paper-dim reveal-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--mag-font-sans)', fontSize: 'var(--mag-text-body)', transition: 'color 300ms', color: 'var(--mag-paper-dim)' }}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
