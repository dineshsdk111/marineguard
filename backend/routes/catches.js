const router = require('express').Router();
const { createCatch, getCatches, getCatchStats, deleteCatch } = require('../controllers/catchController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getCatchStats);
router.get('/', protect, getCatches);
router.post('/', protect, createCatch);
router.delete('/:id', protect, deleteCatch);

module.exports = router;
