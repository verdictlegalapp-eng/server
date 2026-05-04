const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

router.post('/physical-request', verificationController.submitPhysicalRequest);
router.get('/status/:userId', verificationController.getStatus);
router.delete('/status/:userId', verificationController.removeVerification);

module.exports = router;
