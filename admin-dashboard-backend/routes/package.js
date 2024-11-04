const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const AssignedDelivery = require('../models/AssignedDelivery');
const auth = require('../middleware/auth');
const isClient = require('../middleware/isClient');
const isDriver = require('../middleware/isDriver');

router.post('/createPackage', auth, async (req, res) => {
    try {
        const userId = req.user.role === 'admin' && req.body.userId ? req.body.userId : req.user.userId;
        const newPackage = new Package({ ...req.body, userId });
        await newPackage.save();
        res.status(201).json(newPackage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/getPackages', auth, async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { clientId: req.user.userId };
        const packages = await Package.find(filter).populate('originAddress destinationAddress');
        res.status(200).json(packages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/getAllPackages', auth, isDriver, async (req, res) => {
    try {
        const packages = await Package.find().populate('originAddress destinationAddress');
        res.status(200).json(packages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/getAcceptedPackages', auth, isDriver, async (req, res) => {
    try {
        const acceptedPackages = await Package.find({ status: 'aceptado' }).populate('originAddress destinationAddress');
        res.status(200).json(acceptedPackages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/acceptPackage/:id', auth, isDriver, async (req, res) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            { status: 'aceptado' },
            { new: true }
        );
        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/unacceptPackage/:id', auth, isDriver, async (req, res) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            { status: 'pendiente' },
            { new: true }
        );
        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/canceledPackage/:id', auth, isDriver, async (req, res) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            { status: 'aceptado' },
            { new: true }
        );
        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/assignToTruck/:id', auth, isDriver, async (req, res) => {
    try {
        console.log(req.body);
        const { truckId, departureDate, estimatedDeliveryDate, driverId } = req.body;
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            { status: 'en tránsito' },
            { new: true }
        );

        const assignedDelivery = new AssignedDelivery({
            packageId: req.params.id,
            truckId,
            driverId: driverId,
            departureDate,
            estimatedDeliveryDate,
        });

        await assignedDelivery.save();

        res.status(200).json({ updatedPackage, assignedDelivery });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/deletePackage/:id', auth, isClient, async (req, res) => {
    try {
        const deletedPackage = await Package.findByIdAndDelete(req.params.id);
        if (!deletedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;