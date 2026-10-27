const router = require('express').Router();
const { createCompliance, getCompliance, getComplianceStats, updateCompliance, deleteCompliance } = require('../controllers/complianceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, getComplianceStats);
router.get('/', protect, getCompliance);
router.post('/', protect, authorize('marine_authority', 'cooperative_admin'), createCompliance);
router.put('/:id', protect, authorize('marine_authority'), updateCompliance);
router.delete('/:id', protect, authorize('marine_authority'), deleteCompliance);

module.exports = router;
