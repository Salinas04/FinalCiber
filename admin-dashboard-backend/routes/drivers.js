const express = require('express');
const Driver = require('../models/Driver');
const router = express.Router();

// Obtener todos los transportistas
router.get('/', async (req, res) => {
    const drivers = await Driver.find();
    res.json(drivers);
});

// Registrar un nuevo transportista
router.post('/', async (req, res) => {
    const { name, phone } = req.body;
    try {
        const driver = new Driver({ name, phone });
        await driver.save();
        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar transportista' });
    }
});

module.exports = router;
