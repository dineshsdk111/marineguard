const router = require('express').Router();
const { createAlert, getAlerts, getAlert, updateAlert, deleteAlert, getLiveWeather, getMarineForecast, getWeatherAlerts } = require('../controllers/weatherController');
const { protect, authorize } = require('../middleware/auth');

router.get('/live', protect, getLiveWeather);
router.get('/forecast', protect, getMarineForecast);
router.get('/alerts', protect, getWeatherAlerts);
router.get('/', protect, getAlerts);
router.get('/:id', protect, getAlert);
router.post('/', protect, authorize('marine_authority', 'cooperative_admin'), createAlert);
router.put('/:id', protect, authorize('marine_authority', 'cooperative_admin'), updateAlert);
router.delete('/:id', protect, authorize('marine_authority'), deleteAlert);

module.exports = router;
