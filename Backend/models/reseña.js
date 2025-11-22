import mongoose from 'mongoose';

const reseñaSchema = new mongoose.Schema({
    // juegoId made optional so frontend can submit general reviews without referencing a Juego
    juegoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Juego' },
    // usuario should be unique across reviews (enforced at DB level)
    usuario: { type: String, required: true, unique: true },
    comentario: { type: String, required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    fecha: { type: Date, default: Date.now }
});

export default mongoose.model('reseña', reseñaSchema);