import React from 'react'
import '../Styles/App.css'

export default function GameDetail({ game, onBack, onEdit }) {
  if (!game) return (
    <div className="page" style={{ maxWidth: 900, margin: '20px auto' }}>
      <p>No hay juego seleccionado.</p>
      <button onClick={() => onBack && onBack()}>Volver</button>
    </div>
  )

  return (
    <div className="page game-detail" style={{ maxWidth: 1100, margin: '20px auto' }}>
      <div className="game-detail-content">
        <div className="game-info">
          <h1>{game.titulo}</h1>
          <p className="text-games">Plataforma: {game.plataforma}</p>
          <p className="text-games">Género: {game.genero}</p>
          <p style={{ marginTop: 12 }}>{game.sinopsis || 'Sin sinopsis disponible.'}</p>

          <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center' }}>
            <div>⭐ {game.valoracion || '—'}</div>
            <div>{game.tiempoJugado ? `${game.tiempoJugado} h` : '0 h'}</div>
            <div className="progress-label">{typeof game.completado === 'number' ? Math.min(100, Math.max(0, game.completado)) + '%' : (game.completado ? '100%' : '0%')}</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button onClick={() => onEdit && onEdit(game)} style={{ marginRight: 8 }}>Editar</button>
            <button onClick={() => onBack && onBack()} style={{ background: 'transparent' }}>Volver</button>
          </div>
        </div>

        <div className="game-image-wrap">
          {game.image ? (
            <img src={game.image} alt={game.titulo} className="game-detail-img" />
          ) : (
            <div className="game-detail-img placeholder">Sin imagen</div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '20px auto' }}>
        <h3 style={{ marginTop: 18 }}>Reseñas</h3>
        <GameReviews juegoId={game._id} />
      </div>
    </div>
  )
}


function GameReviews({ juegoId }) {
  const [reviews, setReviews] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const FORM_API = 'http://localhost:5000/api/formulario'

  React.useEffect(() => {
    if (!juegoId) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(`${FORM_API}?juegoId=${juegoId}`)
        if (!res.ok) throw new Error('Error fetching reviews')
        const data = await res.json()
        setReviews(data || [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las reseñas')
        setTimeout(() => setError(''), 3000)
      } finally {
        setLoading(false)
      }
    })()
  }, [juegoId])

  if (loading) return <div>Cargando reseñas...</div>
  if (error) return <div className="toast error">{error}</div>

  return (
    <div>
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No hay reseñas para este juego.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reviews.map(r => (
            <li key={r._id} style={{ border: '1px solid rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{r.usuario}</strong>
                <span style={{ color: 'var(--muted)' }}>⭐ {r.calificacion}</span>
              </div>
              <p style={{ marginTop: 8 }}>{r.comentario}</p>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(r.fecha).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
