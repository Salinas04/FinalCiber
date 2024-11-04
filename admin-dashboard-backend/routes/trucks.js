const express = require('express');
const Truck = require('../models/Truck');
const auth = require('../middleware/auth');
const isDriver = require('../middleware/isDriver');
const router = express.Router();

router.get('/getTruck', auth, async (req, res) => {
    try {
        const { driverId } = req.query;

        let filter = {};
        if (req.user.role !== 'admin') {
            filter.driver = driverId || req.user.userId;
        } else if (driverId) {
            filter.driver = driverId;
        }

        const trucks = await Truck.find(filter).populate('driver', 'email');
        console.log('Trucks Data:', trucks);
        res.json(trucks);
    } catch (error) {
        console.error('Error al obtener camiones:', error);
        res.status(400).json({ error: 'Error al obtener camiones' });
    }
});

router.post('/postTruck', auth, isDriver, async (req, res) => {
    try {
        const { driverId, ...truckData } = req.body;
        const driver = req.user.role === 'admin' ? driverId : req.user.userId;
        const truck = new Truck({ ...truckData, driver });
        await truck.save();
        res.status(201).json(truck);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error al registrar camión' });
    }
});

module.exports = router;
