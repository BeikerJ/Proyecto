import './Styles/App.css'
import React, { useState } from 'react'
import Resenas from './components/Reseñas.jsx'
import Biblioteca from './components/Biblioteca.jsx'
import Juego from './components/Juego.jsx'
import GameDetail from './components/GameDetail.jsx'

export default function App() {
  const [route, setRoute] = useState('home') // 'home' | 'resenas' | 'juego'
  const [selectedGame, setSelectedGame] = useState(null)

  const navigate = (to, opts = {}) => {
    // set selectedGame when navigating to pages that need a game
    if (to === 'juego' || to === 'detalle') {
      if (opts.game) setSelectedGame(opts.game)
      else setSelectedGame(null)
    }
    setRoute(to)
  }

  return (
    <div>
      {/* Simple navigation header */}
      <header className="site-header">
        <div className="brand">
          <h1 style={{ textAlign: 'center' }}>GameTracker</h1>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home') }}>Inicio</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('resenas') }}>Reseñas</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('juego') }}>Juego</a></li>
          </ul>
        </nav>
      </header>

      <main>
        {route === 'home' && <Biblioteca onOpenGame={(game) => navigate('detalle', { game })} onOpenResenas={() => navigate('resenas')} />}
        {route === 'resenas' && <Resenas />}
        {route === 'juego' && <Juego game={selectedGame} onBack={() => navigate('home')} />}
        {route === 'detalle' && <GameDetail game={selectedGame} onBack={() => navigate('home')} onEdit={(g) => { setSelectedGame(g); navigate('juego', { game: g }) }} />}
      </main>
    </div>
  )
}