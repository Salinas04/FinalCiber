const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
    licensePlate: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    capacity: { type: Number, required: true },
    year: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
});

module.exports = mongoose.model('Truck', truckSchema);