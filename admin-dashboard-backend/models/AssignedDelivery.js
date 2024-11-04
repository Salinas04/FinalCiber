const mongoose = require('mongoose');

const AssignedDeliverySchema = new mongoose.Schema({
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    truckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    estimatedDeliveryDate: {
        type: Date,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('AssignedDelivery', AssignedDeliverySchema);