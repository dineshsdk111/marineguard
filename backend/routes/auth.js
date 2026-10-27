const router = require('express').Router();
const { register, login, getMe, getUsers, getUser, approveUser, rejectUser, updateUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('marine_authority', 'cooperative_admin'), getUsers);
router.get('/users/:id', protect, getUser);
router.put('/users/:id', protect, updateUser);
router.put('/users/:id/approve', protect, authorize('marine_authority', 'cooperative_admin'), approveUser);
router.put('/users/:id/reject', protect, authorize('marine_authority', 'cooperative_admin'), rejectUser);
router.delete('/users/:id', protect, authorize('marine_authority'), deleteUser);

module.exports = router;
