const express = require('express');
const routes = express.Router();
const Reseña = require('../models/reseña');

// Crear una nueva reseña
routes.post('/reseña', async (req, res) => {
    try {
        const nuevaReseña = new Reseña(req.body);
        const reseñaGuardada = await nuevaReseña.save();
        res.status(201).json(reseñaGuardada);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

});

// Obtener todas las reseñas
routes.get('/reseña', async (req, res) => {
    try {
        const reseñas = await Reseña.find();
        res.json(reseñas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
routes.get('/reseña/:id', async (req, res) => {
    try {
        const reseñaEncontrada = await Reseña.findById(req.params.id);
        res.json(reseñaEncontrada);
    } catch (err) {
        res.status(404).json({ error: 'Reseña no encontrada' });
    }
});
routes.put('/reseña/:id', async (req, res) => {
    try {
        const reseñaActualizada = await Reseña.findByIdAndUpdate
        (req.params.id, req.body, {
            new: true
        });
        res.json(reseñaActualizada);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
routes.delete('/reseña/:id', async (req, res) => {
    try {
        const reseñaEliminada = await Reseña.findByIdAndDelete(req.params.id);
        res.json(reseñaEliminada);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
module.exports = routes;
