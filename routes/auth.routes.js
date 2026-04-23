const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/verify', authController.verifyToken);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
