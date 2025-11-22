const express = require('express')
const routes = express.Router();
const juego = require('../models/juego');

// Crear un nuevo juego
routes.post('/juego', async (req, res) => {
  try {
    const nuevoJuego = new juego(req.body);
    const juegoGuardado = await nuevoJuego.save();
    res.status(201).json(juegoGuardado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener todos los juegos
routes.get('/juego', async (req, res) => {
  try {
    const juegos = await juego.find();
    res.json(juegos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

routes.get('/juego/:id', async (req, res) => {
  try {
    const juegoEncontrado = await juego.findById(req.params.id);
    res.json(juegoEncontrado);
  } catch (err) {
    res.status(404).json({ error: 'Juego no encontrado' });
  }
});

routes.put('/juego/:id', async (req, res) => {
  try {
    const juegoActualizado = await juego.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(juegoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

routes.delete('/juego/:id', async (req, res) => {
  try {
    const juegoEliminado = await juego.findByIdAndDelete(req.params.id);
    res.json(juegoEliminado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}); 

module.exports = routes;