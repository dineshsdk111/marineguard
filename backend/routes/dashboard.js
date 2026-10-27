const router = require('express').Router();
const { getDashboardStats, sendEmergencySOS } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardStats);
router.post('/sos', protect, sendEmergencySOS);

module.exports = router;

