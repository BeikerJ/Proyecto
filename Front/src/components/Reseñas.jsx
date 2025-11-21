import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/App.css';

const FORM_API = 'http://localhost:5000/api/formulario';
const GAMES_API = 'http://localhost:5000/api/juego';

export default function Resenas() {
    const [resenas, setResenas] = useState([]);
    const [games, setGames] = useState([]);
    const [juegoId, setJuegoId] = useState('');
    const [usuario, setUsuario] = useState('');
    const [comentario, setComentario] = useState('');
    const [calificacion, setCalificacion] = useState(5);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [deleteMsg, setDeleteMsg] = useState('');
    const [usernames, setUsernames] = useState(new Set());
    const [isDuplicate, setIsDuplicate] = useState(false);

    useEffect(() => {
        fetchResenas();
        fetchGames();
    }, []);

    const fetchResenas = async () => {
        try {
            setLoading(true);
            const res = await axios.get(FORM_API);
            const list = res.data || [];
            setResenas(list);
            setUsernames(new Set(list.map(r => (r.usuario || '').toLowerCase())));
        } catch (err) {
            console.error('Error al obtener reseñas:', err);
            setErrorMsg('No se pudieron cargar las reseñas');
            setTimeout(() => setErrorMsg(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    const fetchGames = async () => {
        try {
            const res = await axios.get(GAMES_API);
            setGames(res.data || []);
        } catch (err) {
            console.error('Error al obtener juegos:', err);
            // no crítico; permitimos reseñas sin juego
        }
    };

    const validateForm = () => {
        if (!usuario || !comentario) return false;
        const c = Number(calificacion);
        if (!c || c < 1 || c > 5) return false;
        if (isDuplicate) return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            if (isDuplicate) {
                setErrorMsg('El nombre de usuario ya está en uso, elige otro');
            } else {
                setErrorMsg('Rellena usuario, comentario y una calificación entre 1 y 5');
            }
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }

        const nueva = {
            ...(juegoId ? { juegoId } : {}),
            usuario,
            comentario,
            calificacion: Number(calificacion),
        };

        try {
            setLoading(true);
            const res = await axios.post(FORM_API, nueva);
            if (res.data) {
                setResenas((prev) => [res.data, ...prev]);
                // update usernames set
                setUsernames(prev => new Set(prev).add((res.data.usuario || '').toLowerCase()));
                setSuccessMsg('Reseña enviada correctamente');
                setTimeout(() => setSuccessMsg(''), 3000);
            }
            // limpiar formulario
            setJuegoId('');
            setUsuario('');
            setComentario('');
            setCalificacion(5);
        } catch (err) {
            console.error('Error al enviar la reseña:', err);
            // If server returned duplicate key error, show friendly message
            const msg = err?.response?.data?.error || 'Error al enviar la reseña';
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    // Check username uniqueness on the fly
    useEffect(() => {
        const lower = (usuario || '').trim().toLowerCase();
        if (!lower) return setIsDuplicate(false);
        setIsDuplicate(usernames.has(lower));
    }, [usuario, usernames]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${FORM_API}/${id}`);
            setResenas((prev) => prev.filter((r) => r._id !== id));
            // show delete confirmation in bottom-right
            setDeleteMsg('Reseña borrada');
            setTimeout(() => setDeleteMsg(''), 3000);
        } catch (err) {
            console.error('Error al borrar la reseña:', err);
            setErrorMsg('Error al borrar la reseña');
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    return (
        <div className="resenas-container page">
            <h2 style={{ textAlign: 'center' }}>Reseñas</h2>

            {successMsg && <div className="toast success">{successMsg}</div>}
            {errorMsg && <div className="toast error">{errorMsg}</div>}
            {deleteMsg && <div className="toast success">{deleteMsg}</div>}

            {/* Centered form inside a card with animation */}
            <div className="gamecard form-card fade-up">
                <form onSubmit={handleSubmit} className="resena-form">
                    <label>
                        Juego (opcional):
                        <select value={juegoId} onChange={(e) => setJuegoId(e.target.value)}>
                            <option value="">General</option>
                            {games.map((g) => (
                                <option key={g._id} value={g._id}>
                                    {g.titulo}
                                </option>
                            ))}
                        </select>
                    </label>

                    <input
                        placeholder="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                    />

                    <textarea
                        placeholder="Comentario"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        required
                    />

                    <label>
                        Calificación:
                        <select value={calificacion} onChange={(e) => setCalificacion(e.target.value)}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                        </select>
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" disabled={loading} style={{ width: 220 }}>
                            {loading ? 'Enviando...' : 'Enviar reseña'}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ maxWidth: 1100, margin: '20px auto' }}>
                <h3 style={{ marginTop: 8 }}>Reseñas recientes</h3>
                {resenas.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>No hay reseñas todavía.</p>
                ) : (
                    <div className="reviews-grid">
                        {resenas.map((r) => {
                            const game = games.find(g => g._id === r.juegoId)
                            return (
                                <div key={r._id} className="gamecard fade-in">
                                    {game && game.image && (
                                        <div style={{ height: 120, overflow: 'hidden', borderRadius: 8 }}>
                                            <img src={game.image} alt={game.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ padding: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong>{game ? game.titulo : `Reseña de ${r.usuario}`}</strong>
                                            <span style={{ color: 'var(--muted)' }}>⭐ {r.calificacion}</span>
                                        </div>
                                        <p style={{ marginTop: 8 }}>{r.comentario}</p>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                                            <small style={{ color: 'var(--muted)' }}>Usuario: {r.usuario}</small>
                                            <small style={{ color: 'var(--muted)' }}>{r.fecha ? new Date(r.fecha).toLocaleString() : '—'}</small>
                                        </div>
                                        <div style={{ marginTop: 8 }}>
                                            <button style={{ padding: '6px 10px' }} onClick={() => handleDelete(r._id)}>Borrar</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}