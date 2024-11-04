const express = require('express');
const router = express.Router();
const AssignedDelivery = require('../models/AssignedDelivery');
const Package = require('../models/Package');
const auth = require('../middleware/auth');
const isDriver = require('../middleware/isDriver');

router.get('/getAssignedDeliveries', auth, isDriver, async (req, res) => {
    try {
        const { driverId } = req.query;
        const filter = req.user.role === 'admin' ? {} : { driverId: driverId || req.user.userId };
        const assignedDeliveries = await AssignedDelivery.find(filter)
            .populate('packageId truckId');
        res.status(200).json(assignedDeliveries);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', auth, isDriver, async (req, res) => {
    try {
        await AssignedDelivery.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Entrega asignada eliminada con éxito' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/deliverPackage/:id', auth, isDriver, async (req, res) => {
    try {
        const assignedDelivery = await AssignedDelivery.findById(req.params.id);
        if (!assignedDelivery) {
            return res.status(404).json({ message: 'Assigned delivery not found' });
        }

        // Update the package status to "entregado"
        const updatedPackage = await Package.findByIdAndUpdate(
            assignedDelivery.packageId,
            { status: 'entregado' },
            { new: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        await AssignedDelivery.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Package delivered and assigned delivery deleted successfully', updatedPackage });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;