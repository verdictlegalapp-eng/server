const MongoMessage = require('../models/MongoMessage');
const MongoConversation = require('../models/MongoConversation');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, text } = req.body;

        if (!receiverId || !text) {
            return errorResponse(res, 400, 'Receiver ID and text are required');
        }

        // Find or create conversation in MongoDB
        const [user1Id, user2Id] = [senderId, receiverId].sort();
        let conversation = await MongoConversation.findOne({ user1Id, user2Id });
        
        if (!conversation) {
            conversation = await MongoConversation.create({ user1Id, user2Id });
        }

        const message = await MongoMessage.create({
            conversationId: conversation._id,
            senderId,
            text
        });

        // Update conversation last message
        conversation.lastMessage = text;
        conversation.lastMessageAt = new Date();
        await conversation.save();

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
        const conversation = await MongoConversation.findOne({ user1Id, user2Id });

        if (!conversation) {
            return successResponse(res, [], 'No conversation found');
        }

        const messages = await MongoMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

        // Fetch user info for messages manually since they are in MySQL
        const senderInfoCache = {};
        const formattedMessages = [];
        
        for (const msg of messages) {
            let senderImage = null;
            if (!senderInfoCache[msg.senderId]) {
                const user = await User.findByPk(msg.senderId, { attributes: ['image'] });
                senderInfoCache[msg.senderId] = user ? user.image : null;
            }
            senderImage = senderInfoCache[msg.senderId];
            
            formattedMessages.push({
                id: msg._id,
                text: msg.text,
                sender: msg.senderId,
                senderImage: senderImage,
                time: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }

        return successResponse(res, formattedMessages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        return errorResponse(res, 500, 'Failed to fetch messages', error);
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await MongoConversation.find({
            $or: [{ user1Id: userId }, { user2Id: userId }]
        }).sort({ lastMessageAt: -1 });

        const formatted = [];
        for (const conv of conversations) {
            const partnerId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            const partner = await User.findByPk(partnerId, { attributes: ['id', 'name', 'image'] });
            
            if (partner) {
                formatted.push({
                    id: partner.id,
                    lawyerName: partner.name,
                    lastMessage: conv.lastMessage,
                    time: conv.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    image: partner.image,
                    unread: false
                });
            }
        }

        return successResponse(res, formatted);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        return errorResponse(res, 500, 'Failed to fetch conversations', error);
    }
};
