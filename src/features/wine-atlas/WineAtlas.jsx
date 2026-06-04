import { useState, useEffect } from 'react'
import './wine-atlas.css'
import AtlasHeader  from './AtlasHeader'
import AtlasFooter  from './AtlasFooter'
import AtlasHome    from './pages/AtlasHome'
import AtlasRegions from './pages/AtlasRegions'
import AtlasGrapes  from './pages/AtlasGrapes'
import AtlasStyles  from './pages/AtlasStyles'
import AtlasAcademy from './pages/AtlasAcademy'

export default function WineAtlas({ onExit }) {
  const [view, setView] = useState('home')

  // Scroll to top on view change (inner pages handle their own too, but this
  // covers the home page transition cleanly)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  function handleSetView(v) {
    setView(v)
  }

  return (
    <div className="wine-atlas-root" style={{ minHeight: '100vh' }}>
      <AtlasHeader view={view} setView={handleSetView} onExit={onExit} />

      {view === 'home'    && <AtlasHome    setView={handleSetView} />}
      {view === 'regions' && <AtlasRegions />}
      {view === 'grapes'  && <AtlasGrapes  />}
      {view === 'styles'  && <AtlasStyles  />}
      {view === 'academy' && <AtlasAcademy />}

      <AtlasFooter />
    </div>
  )
}
