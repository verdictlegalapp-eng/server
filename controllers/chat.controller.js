const { Message, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !text) {
            return errorResponse(res, 400, 'Receiver ID and text are required');
        }

        const message = await Message.create({
            senderId,
            receiverId,
            text
        });

        return successResponse(res, message, 'Message sent');
    } catch (error) {
        console.error('Send Message Error:', error);
        return errorResponse(res, 500, 'Failed to send message', error);
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'image'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'image'] }
            ]
        });

        return successResponse(res, messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        return errorResponse(res, 500, 'Failed to fetch messages', error);
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all messages where user is sender or receiver
        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }]
            },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'image'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'image'] }
            ]
        });

        // Group by conversation partner
        const conversations = [];
        const seenPartners = new Set();

        for (const msg of messages) {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!seenPartners.has(partner.id)) {
                seenPartners.add(partner.id);
                conversations.push({
                    id: partner.id,
                    lawyerName: partner.name,
                    lastMessage: msg.text,
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    image: partner.image,
                    unread: !msg.isRead && msg.receiverId === userId
                });
            }
        }

        return successResponse(res, conversations);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        return errorResponse(res, 500, 'Failed to fetch conversations', error);
    }
};
