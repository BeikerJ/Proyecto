import mongoose from 'mongoose';

const juegoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    plataforma: { type: String, required: true },
    genero: { type: String, required: true },
    image: { type: String },
    // breve sinopsis o descripción del juego
    sinopsis: { type: String },
    // valoracion: optional numeric score (1-5)
    valoracion: { type: Number, min: 1, max: 5 },
    // tiempoJugado: number of hours played (can be decimal)
    tiempoJugado: { type: Number, default: 0 },
    fecha: { type: Date, default: Date.now },
    // completado as percentage 0-100
    completado: { type: Number, min: 0, max: 100, default: 0 }
});

export default mongoose.model('juego', juegoSchema);