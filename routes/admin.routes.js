const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.post('/login', adminController.login);

// Protected Routes
router.use(adminController.validateToken);

router.get('/stats', adminController.getStats);
router.get('/verifications', adminController.getVerifications);
router.post('/verifications/:id/:action', adminController.resolveVerification);
router.get('/clients', adminController.getClients);
router.get('/attorneys', adminController.getAttorneys);
router.post('/sync-db', adminController.syncDatabase);

module.exports = router;
