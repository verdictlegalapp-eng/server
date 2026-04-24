const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyer.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', lawyerController.getAllLawyers);
router.get('/:id', lawyerController.getLawyerById);
router.post('/register', authMiddleware, lawyerController.registerLawyer);

module.exports = router;
