import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../Styles/App.css'

const GAMES_API = 'http://localhost:5000/api/juego'

export default function Biblioteca({ onOpenGame, onOpenResenas }) {
  const [games, setGames] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem('favorites')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [showOnlyFavs, setShowOnlyFavs] = useState(false)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      setLoading(true)
      const res = await axios.get(GAMES_API)
      setGames(res.data || [])
    } catch (err) {
      console.error('Error fetching games', err)
      setError('No se pudieron cargar los juegos')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const results = games.filter((g) =>
    g.titulo.toLowerCase().includes(query.trim().toLowerCase())
  )

  const visible = showOnlyFavs ? results.filter(g => favorites.includes(g._id)) : results

  const toggleFavorite = (id, e) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem('favorites', JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <div className="page active" style={{ textAlign: 'center' }}>
      <div>
        <h2 style={{ textAlign: 'center' }}>Biblioteca</h2>

        <div className="search-row">
          <input
            placeholder="Buscar juegos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label className="fav-toggle">
              <input className="fav-checkbox" type="checkbox" checked={showOnlyFavs} onChange={(e) => { setShowOnlyFavs(e.target.checked); try { localStorage.setItem('showOnlyFavs', JSON.stringify(e.target.checked)); } catch {} }} />
              <span className="fav-heart" aria-hidden="true"></span>
              <span className="fav-label">Solo favoritos</span>
            </label>
            <button onClick={() => onOpenResenas()} style={{ padding: '8px 14px' }}>
              Ver Reseñas
            </button>
          </div>
        </div>

        {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}
        {loading && <div>Cargando juegos...</div>}

        <div className="container">
          {visible.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No se encontraron juegos.</p>
          ) : (
            visible.map((g) => (
              <div key={g._id} className="gamecard fade-up" onClick={() => onOpenGame(g)}>
                {g.image && (
                  <div style={{ height: 160, overflow: 'hidden', borderRadius: 8 }}>
                    <img src={g.image} alt={g.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ marginTop: 12 }}>{g.titulo}</h3>
                    <button onClick={(e) => toggleFavorite(g._id, e)} className={`fav-btn ${favorites.includes(g._id) ? 'active' : ''}`} title="Marcar favorito">{favorites.includes(g._id) ? '♥' : '♡'}</button>
                  </div>
                  <p className="text-games">Plataforma: {g.plataforma}</p>
                  <p className="text-games">Género: {g.genero}</p>
                  <div className="game-meta" style={{ marginTop: 12 }}>
                    <span>⭐ {g.valoracion || '—'}</span>
                    <span>{g.tiempoJugado ? `${g.tiempoJugado} h` : '0 h'}</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button style={{ padding: '6px 10px', marginRight: 8 }} onClick={(e) => { e.stopPropagation(); onOpenGame(g) }}>Ver</button>
                    <button style={{ padding: '6px 10px' }} onClick={(e) => { e.stopPropagation(); toggleFavorite(g._id, e) }}>{favorites.includes(g._id) ? 'Quitar favorito' : 'Favorito'}</button>
                  </div>
                </div>
                {/* progress bar and percentage label */}
                <div style={{ padding: '0 12px 12px' }}>
                  {(() => {
                    const raw = g.completado
                    const pct = (typeof raw === 'number') ? raw : (raw ? 100 : 0)
                    const clamped = Math.min(100, Math.max(0, pct || 0))
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Completado</div>
                          <div className="progress-label">{clamped}%</div>
                        </div>
                        <div className="progress-wrap" aria-hidden>
                          <div className="progress-fill" style={{ width: `${clamped}%` }} />
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
