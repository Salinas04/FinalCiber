const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['pendiente', 'aceptado', 'en tránsito', 'entregado'] },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    weight: { type: Number, required: true },
    observations: { type: String },
    fragile: { type: Boolean, default: false },
    originAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    destinationAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', packageSchema);