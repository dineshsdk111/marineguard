const router = require('express').Router();
const { createViolation, getViolations, getViolation, updateViolation, getViolationStats } = require('../controllers/violationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, getViolationStats);
router.get('/', protect, getViolations);
router.get('/:id', protect, getViolation);
router.post('/', protect, authorize('marine_authority', 'cooperative_admin'), createViolation);
router.put('/:id', protect, authorize('marine_authority', 'cooperative_admin'), updateViolation);
router.put('/:id/status', protect, authorize('marine_authority', 'cooperative_admin'), updateViolation);

module.exports = router;
