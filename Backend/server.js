import express from 'express';
import mongoose from 'mongoose';
import juego from './models/juego.js';
import reseña from './models/reseña.js'; 
import cors from 'cors';

const app = express();

const MONGO_URI = 'mongodb+srv://beiker:test1234@cluster0.lcu5lul.mongodb.net/GameTracker?retryWrites=true&w=majority&appName=Cluster0';

app.use(cors());
// Increase JSON body size to allow small base64 image uploads (adjust as needed)
app.use(express.json({ limit: '10mb' }));

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// Rutas para juegos
app.post('/api/juego', async (req, res) => {
  try {
    // pick explicit fields to avoid unexpected properties
  const { titulo, plataforma, genero, image, sinopsis, valoracion, tiempoJugado, completado } = req.body;
  // coerce numeric fields to numbers to avoid storing strings or falsy 0 issues
  const valoracionNum = valoracion !== undefined && valoracion !== null && valoracion !== '' ? Number(valoracion) : undefined;
  const tiempoJugadoNum = tiempoJugado !== undefined && tiempoJugado !== null && tiempoJugado !== '' ? Number(tiempoJugado) : 0;
  // completado should be a number 0-100
  let completadoNum = 0;
  if (completado !== undefined && completado !== null && completado !== '') {
    completadoNum = Number(completado) || 0;
    if (completadoNum < 0) completadoNum = 0;
    if (completadoNum > 100) completadoNum = 100;
  }
  const nuevoJuego = new juego({ titulo, plataforma, genero, image, sinopsis, valoracion: valoracionNum, tiempoJugado: tiempoJugadoNum, completado: completadoNum });
    const juegoGuardado = await nuevoJuego.save();
    res.status(201).json(juegoGuardado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/juego', async (req, res) => {
  try {
    const juegos = await juego.find();
    res.json(juegos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/juego/:id', async (req, res) => {
  try {
  const { titulo, plataforma, genero, image, sinopsis, valoracion, tiempoJugado, completado } = req.body;
  const valoracionNum = valoracion !== undefined && valoracion !== null && valoracion !== '' ? Number(valoracion) : undefined;
  const tiempoJugadoNum = tiempoJugado !== undefined && tiempoJugado !== null && tiempoJugado !== '' ? Number(tiempoJugado) : 0;
  let completadoNum = 0;
  if (completado !== undefined && completado !== null && completado !== '') {
    completadoNum = Number(completado) || 0;
    if (completadoNum < 0) completadoNum = 0;
    if (completadoNum > 100) completadoNum = 100;
  }
  const update = { titulo, plataforma, genero, image, sinopsis, valoracion: valoracionNum, tiempoJugado: tiempoJugadoNum, completado: completadoNum };
    const juegoActualizado = await juego.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!juegoActualizado) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(juegoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/juego/:id', async (req, res) => {
  try {
    const juegoEliminado = await juego.findByIdAndDelete(req.params.id);
    res.json(juegoEliminado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rutas para reseñas
app.post('/api/formulario', async (req, res) => {
  try {
    const nuevaFormulario = new reseña(req.body);
    const formularioGuardado = await nuevaFormulario.save();
    res.status(201).json(formularioGuardado);
  } catch (err) {
    // Handle duplicate key (unique usuario) gracefully
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/formulario', async (req, res) => {
  try {
    // If a juegoId query param is provided, return only reviews for that game
    const { juegoId } = req.query;
    let filter = {};
    if (juegoId) {
      // validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(juegoId)) return res.status(400).json({ error: 'juegoId inválido' });
      filter = { juegoId };
    }
    const formularios = await reseña.find(filter).sort({ fecha: -1 });
    res.json(formularios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una reseña por id
app.delete('/api/formulario/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // optional: validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });

    const eliminado = await reseña.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(eliminado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ejecutandose en puerto: ${port}`);
});
