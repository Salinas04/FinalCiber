const mongoose = require('mongoose');
const Address = require('./Address');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'driver', 'admin'], required: true }
});

userSchema.virtual('addresses', {
    ref: 'Address',
    localField: '_id',
    foreignField: 'userId'
});

module.exports = mongoose.model('User', userSchema);