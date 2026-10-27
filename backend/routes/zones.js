const router = require('express').Router();
const { createZone, getZones, getZone, updateZone, deleteZone } = require('../controllers/zoneController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getZones);
router.get('/:id', protect, getZone);
router.post('/', protect, authorize('marine_authority'), createZone);
router.put('/:id', protect, authorize('marine_authority'), updateZone);
router.delete('/:id', protect, authorize('marine_authority'), deleteZone);

module.exports = router;
