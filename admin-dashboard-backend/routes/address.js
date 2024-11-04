const express = require('express');
const Address = require('../models/Address');
const auth = require('../middleware/auth');
const isClient = require('../middleware/isClient');
const router = express.Router();

// Crear una nueva dirección
router.post('/createAddress', auth, async (req, res) => {
    try {
        const userId = req.user.role === 'admin' && req.body.userId ? req.body.userId : req.user.userId;
        const address = new Address({ ...req.body, userId });
        await address.save();
        res.status(201).json(address);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener todas las direcciones del usuario logueado
router.get('/getAddress', auth, async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        const addresses = await Address.find(filter);
        res.status(200).json(addresses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/getAddress/:id', auth, async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/deleteAddress/:id', auth, async (req, res) => {
    try {
        const address = await Address.findByIdAndDelete(req.params.id);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;