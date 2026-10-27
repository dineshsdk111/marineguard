const router = require('express').Router();
const { createTrip, getTrips, getTrip, updateTrip, endTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTrips);
router.get('/:id', protect, getTrip);
router.post('/', protect, createTrip);
router.put('/:id', protect, updateTrip);
router.put('/:id/end', protect, endTrip);

module.exports = router;
