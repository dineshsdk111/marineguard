const router = require('express').Router();
const { createVessel, getVessels, getVessel, updateVessel, updateVesselLocation, deleteVessel, getVesselStats } = require('../controllers/vesselController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, getVesselStats);
router.get('/', protect, getVessels);
router.get('/:id', protect, getVessel);
router.post('/', protect, authorize('marine_authority', 'cooperative_admin'), createVessel);
router.put('/:id', protect, updateVessel);
router.put('/:id/location', protect, updateVesselLocation);
router.delete('/:id', protect, authorize('marine_authority'), deleteVessel);

module.exports = router;
