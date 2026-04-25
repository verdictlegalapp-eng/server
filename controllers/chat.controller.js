const { Message, Conversation, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, text } = req.body;

        if (!receiverId || !text) {
            return errorResponse(res, 400, 'Receiver ID and text are required');
        }

        // Find or create conversation
        const [user1Id, user2Id] = [senderId, receiverId].sort();
        let [conversation] = await Conversation.findOrCreate({
            where: { user1Id, user2Id }
        });

        const message = await Message.create({
            conversationId: conversation.id,
            senderId,
            text
        });

        // Update conversation last message
        await conversation.update({
            lastMessage: text,
            lastMessageAt: new Date()
        });

        return successResponse(res, message, 'Message sent');
    } catch (error) {
        console.error('Send Message Error:', error);
        return errorResponse(res, 500, 'Failed to send message', error);
    }
};

exports.getMessages = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;

        const [user1Id, user2Id] = [senderId, receiverId].sort();
        const conversation = await Conversation.findOne({
            where: { user1Id, user2Id }
        });

        if (!conversation) {
            return successResponse(res, [], 'No conversation found');
        }

        const messages = await Message.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'ASC']],
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'image'] }]
        });

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.senderId,
            senderImage: msg.sender?.image,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return successResponse(res, formattedMessages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        return errorResponse(res, 500, 'Failed to fetch messages', error);
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [{ user1Id: userId }, { user2Id: userId }]
            },
            order: [['lastMessageAt', 'DESC']],
            include: [
                { model: User, as: 'user1', attributes: ['id', 'name', 'image'] },
                { model: User, as: 'user2', attributes: ['id', 'name', 'image'] }
            ]
        });

        const formatted = conversations.map(conv => {
            const partner = conv.user1Id === userId ? conv.user2 : conv.user1;
            return {
                id: partner.id,
                lawyerName: partner.name,
                lastMessage: conv.lastMessage,
                time: new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                image: partner.image,
                unread: false // TODO: Implement unread logic
            };
        });

        return successResponse(res, formatted);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        return errorResponse(res, 500, 'Failed to fetch conversations', error);
    }
};
