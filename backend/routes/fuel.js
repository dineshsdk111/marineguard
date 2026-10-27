const router = require('express').Router();
const { createFuelRecord, getFuelRecords, getFuelStats, deleteFuelRecord } = require('../controllers/fuelController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getFuelStats);
router.get('/', protect, getFuelRecords);
router.post('/', protect, createFuelRecord);
router.delete('/:id', protect, deleteFuelRecord);

module.exports = router;
