import React from 'react'
import '../Styles/App.css'


export default function Juego({ game, onBack }) {
	const [titulo, setTitulo] = React.useState('')
	const [plataforma, setPlataforma] = React.useState('')
	const [genero, setGenero] = React.useState('')
	const [completado, setCompletado] = React.useState(0)
	const [imageUrl, setImageUrl] = React.useState('')
	const [imageFile, setImageFile] = React.useState(null)
	const [loading, setLoading] = React.useState(false)
	const [msg, setMsg] = React.useState('')
	const [error, setError] = React.useState('')
	const [valoracion, setValoracion] = React.useState(0) // Reinserting valoracion
	const [tiempoJugado, setTiempoJugado] = React.useState(0) // Reinserting tiempoJugado
	const [sinopsis, setSinopsis] = React.useState('') // Reinserting sinopsis

	// UI: tabs and games list for selecting which to update
	const [games, setGames] = React.useState([])
	const [activeTab, setActiveTab] = React.useState(game ? 'update' : 'add')
	const [selectedUpdateGameId, setSelectedUpdateGameId] = React.useState(game?._id || '')

	// if a game is provided, prefill fields for convenience
	React.useEffect(() => {
		if (game) {
			setActiveTab('update')
			setSelectedUpdateGameId(game._id)
			populateFormFromGame(game)
		}
	}, [game])

	React.useEffect(() => {
		// fetch games for update selector
		;(async () => {
			try {
				const res = await fetch('http://localhost:5000/api/juego')
				const data = await res.json()
				setGames(data || [])
			} catch (err) {
				console.error('Error fetching games', err)
			}
		})()
	}, [])

	const toBase64 = (file) => new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result)
		reader.onerror = (err) => reject(err)
	})

	const handleFile = (e) => {
		const f = e.target.files && e.target.files[0]
		setImageFile(f)
		// clear imageUrl when a local file is chosen
		if (f) setImageUrl('')
	}


	const populateFormFromGame = (g) => {
		setTitulo(g.titulo || '')
		setPlataforma(g.plataforma || '')
		setGenero(g.genero || '')
		setCompletado(typeof g.completado === 'number' ? g.completado : (g.completado ? 100 : 0))
		setImageUrl(g.image || '')
		setValoracion(g.valoracion || 0)
		setTiempoJugado(g.tiempoJugado || 0)
		setSinopsis(g.sinopsis || '')
		setImageFile(null)
	}

	// Reviews for this game
	const [reviews, setReviews] = React.useState([])
	const [loadingReviews, setLoadingReviews] = React.useState(false)
	const [reviewsError, setReviewsError] = React.useState('')

	const FORM_API = 'http://localhost:5000/api/formulario'

	const fetchReviewsForGame = async (gameId) => {
		if (!gameId) {
			setReviews([])
			return
		}
		try {
			setLoadingReviews(true)
			const res = await fetch(`${FORM_API}?juegoId=${gameId}`)
			if (!res.ok) throw new Error('Error fetching reviews')
			const data = await res.json()
			setReviews(data || [])
		} catch (err) {
			console.error('Error loading reviews', err)
			setReviewsError('No se pudieron cargar las reseñas')
			setTimeout(() => setReviewsError(''), 3000)
		} finally {
			setLoadingReviews(false)
		}
	}

	// Fetch reviews when the selected game changes
	React.useEffect(() => {
		const idToUse = selectedUpdateGameId || (game && game._id)
		if (idToUse) fetchReviewsForGame(idToUse)
	}, [selectedUpdateGameId, game])

	const handleSubmit = async (e) => {
		e.preventDefault()
		// validations per juego model
		if (!titulo.trim() || !plataforma.trim() || !genero.trim()) {
			setError('Titulo, plataforma y genero son obligatorios')
			setTimeout(() => setError(''), 3000)
			return
		}

		let imageData = imageUrl && imageUrl.trim() ? imageUrl.trim() : ''
		try {
			setLoading(true)
			if (imageFile && !imageData) {
				// convert to base64
				imageData = await toBase64(imageFile)
			}

			const payload = { titulo, plataforma, genero, completado: Number(completado) || 0, image: imageData, sinopsis, valoracion: Number(valoracion) || undefined, tiempoJugado: Number(tiempoJugado) || 0 }

			let res
			if (activeTab === 'update') {
				const idToUpdate = selectedUpdateGameId || (game && game._id)
				if (!idToUpdate) throw new Error('Selecciona un juego para actualizar')
				res = await fetch(`http://localhost:5000/api/juego/${idToUpdate}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				})
			} else {
				// create new
				res = await fetch('http://localhost:5000/api/juego', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				})
			}

			if (!res.ok) {
				const body = await res.json().catch(() => ({}))
				throw new Error(body.error || `HTTP ${res.status}`)
			}

			setMsg('Juego agregado correctamente')
			// if updated, message should reflect update
			if (game && game._id) setMsg('Juego actualizado correctamente')
			setTimeout(() => setMsg(''), 3000)
			// navigate back to biblioteca (parent will refetch)
			if (onBack) onBack()
		} catch (err) {
			console.error(err)
			setError(err.message || 'Error guardando juego')
			setTimeout(() => setError(''), 4000)
		} finally {
			setLoading(false)
		}
	}

	// If no game selected (we still show form to add) — also show preview if game provided
	return (
		<div className="page" style={{ maxWidth: 900, margin: '20px auto' }}>
			<div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
				<button onClick={() => { setActiveTab('add'); setSelectedUpdateGameId(''); /* clear form */ setTitulo(''); setPlataforma(''); setGenero(''); setCompletado(false); setImageUrl(''); setImageFile(null); setValoracion(0); setTiempoJugado(0); setSinopsis(''); }} style={{ padding: 8, borderRadius: 8, background: activeTab === 'add' ? 'var(--accent)' : 'transparent', color: activeTab === 'add' ? '#fff' : 'var(--muted)', border: 'none' }}>Agregar juego</button>
				<button onClick={() => { setActiveTab('update'); /* keep selection */ }} style={{ padding: 8, borderRadius: 8, background: activeTab === 'update' ? 'var(--accent)' : 'transparent', color: activeTab === 'update' ? '#fff' : 'var(--muted)', border: 'none' }}>Actualizar juego</button>
			</div>
			<h2 style={{ textAlign: 'center' }}>{activeTab === 'add' ? 'Agregar nuevo juego' : 'Actualizar juego'}</h2>

				{msg && <div className="toast success">{msg}</div>}
				{error && <div className="toast error">{error}</div>}

			<form className="game-form" onSubmit={handleSubmit}>
				{activeTab === 'update' && (
					<label>
						Seleccionar juego a editar:
						<select value={selectedUpdateGameId} onChange={(e) => {
							setSelectedUpdateGameId(e.target.value)
							const g = games.find(x => x._id === e.target.value)
							if (g) populateFormFromGame(g)
						}}>
							<option value="">-- selecciona --</option>
							{games.map(g => <option key={g._id} value={g._id}>{g.titulo}</option>)}
						</select>
					</label>
				)}
				<label>Título</label>
				<input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

				<label>Plataforma</label>
				<input value={plataforma} onChange={(e) => setPlataforma(e.target.value)} required />

				<label>Género</label>
				<input value={genero} onChange={(e) => setGenero(e.target.value)} required />

				<label>Valoración (1-5)</label>
				<select value={valoracion} onChange={(e) => setValoracion(Number(e.target.value))}>
					<option value={0}>Sin valorar</option>
					<option value={1}>1</option>
					<option value={2}>2</option>
					<option value={3}>3</option>
					<option value={4}>4</option>
					<option value={5}>5</option>
				</select>

				<label>Tiempo jugado (horas)</label>
				<input type="number" min="0" step="0.1" value={tiempoJugado} onChange={(e) => setTiempoJugado(parseFloat(e.target.value))} />

				<label>Sinopsis</label>
				<textarea value={sinopsis} onChange={(e) => setSinopsis(e.target.value)} rows={4} />

				<label>Imagen (URL)</label>
				<input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

				<label>O cargar imagen local</label>
				<input type="file" accept="image/*" onChange={handleFile} />

				<label>Completado (%)</label>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<input type="number" min="0" max="100" value={completado} onChange={(e) => {
						let v = parseInt(e.target.value || 0, 10);
						if (isNaN(v)) v = 0;
						if (v < 0) v = 0; if (v > 100) v = 100;
						setCompletado(v);
					}} style={{ width: 100 }} />
					<span style={{ color: 'var(--muted)' }}>{completado}%</span>
				</div>
				{/* optional slider for convenience */}
				<input type="range" min="0" max="100" value={completado} onChange={(e) => setCompletado(Number(e.target.value))} />

				<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
					<button type="submit" disabled={loading}>{loading ? 'Guardando...' : (activeTab === 'update' ? 'Actualizar' : 'Agregar juego')}</button>
					<button type="button" onClick={() => onBack && onBack()} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 8 }}>Volver</button>
					{activeTab === 'update' && (selectedUpdateGameId || (game && game._id)) && (
						<button type="button" onClick={async () => {
							const idToDelete = selectedUpdateGameId || (game && game._id)
							if (!idToDelete) return setError('Selecciona un juego para eliminar')
							if (!confirm('¿Eliminar este juego?')) return
							try {
								setLoading(true)
								const resp = await fetch(`http://localhost:5000/api/juego/${idToDelete}`, { method: 'DELETE' })
								if (!resp.ok) throw new Error('No se pudo eliminar')
								// refresh games list and clear selection
								;(async () => {
									try {
										const r = await fetch('http://localhost:5000/api/juego')
										const d = await r.json()
										setGames(d || [])
									} catch(_){}
								})()
								setSelectedUpdateGameId('')
								setTitulo('')
								setPlataforma('')
								setGenero('')
								setImageUrl('')
								setValoracion(0)
								setTiempoJugado(0)
								setSinopsis('')
								if (onBack) onBack()
							} catch (err) {
								console.error(err)
								setError('Error al eliminar el juego')
								setTimeout(() => setError(''), 3000)
							} finally { setLoading(false) }
						}} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,80,80,0.3)', padding: '8px 12px', borderRadius: 8 }}>Eliminar</button>
					)}
				</div>
			</form>

			{ (game || imageUrl || imageFile) && (
				<div style={{ maxWidth: 700, margin: '18px auto', textAlign: 'center' }}>
					<h3>Vista previa</h3>
								{imageFile ? (
									<img src={URL.createObjectURL(imageFile)} alt="preview" style={{ maxWidth: 360, maxHeight: 200, borderRadius: 8 }} />
								) : (imageUrl ? (
									<img src={imageUrl} alt="preview" style={{ maxWidth: 360, maxHeight: 200, borderRadius: 8 }} />
								) : (game && game.image ? (
									<img src={game.image} alt={game.titulo} style={{ maxWidth: 360, maxHeight: 200, borderRadius: 8 }} />
								) : null))}
				</div>
			) }

				{/* Reviews section for the selected game */}
				{ (selectedUpdateGameId || (game && game._id)) && (
					<div style={{ maxWidth: 700, margin: '18px auto' }}>
						<h3>Reseñas</h3>
						{reviewsError && <div className="toast error">{reviewsError}</div>}
						{loadingReviews ? (
							<div>Cargando reseñas...</div>
						) : (
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
								)
								}
							</div>
						)}
					</div>
				)}
		</div>
	)
}
