const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, chatController.sendMessage);
router.get('/conversations', authMiddleware, chatController.getConversations);
router.get('/:receiverId', authMiddleware, chatController.getMessages);

module.exports = router;
