const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { otpRateLimiter } = require('../middleware/rateLimit');

router.post('/request-otp', otpRateLimiter, authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/verify', authController.verifyToken); // Keep for legacy
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/notifications', authMiddleware, authController.getNotifications);
router.delete('/delete-account', authMiddleware, authController.deleteAccount);
router.get('/user/:id', authMiddleware, authController.getUserById);

module.exports = router;

