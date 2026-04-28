const MongoMessage = require('../models/MongoMessage');
const MongoConversation = require('../models/MongoConversation');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const { getIo } = require('../utils/socket');

/** UUID strings must match Mongo regardless of JWT/MySQL casing */
function normUserId(id) {
    return String(id).trim().toLowerCase();
}

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Finds conversation by normalized pair; falls back to case-insensitive match for legacy Mongo rows */
async function findConversationForPair(senderRaw, recvRaw) {
    const senderId = normUserId(senderRaw);
    const recvNorm = normUserId(recvRaw);
    const [u1, u2] = [senderId, recvNorm].sort();
    let conversation = await MongoConversation.findOne({ user1Id: u1, user2Id: u2 });
    if (conversation) return conversation;

    const r1 = new RegExp(`^${escapeRegex(u1)}$`, 'i');
    const r2 = new RegExp(`^${escapeRegex(u2)}$`, 'i');
    conversation = await MongoConversation.findOne({
        $or: [
            { user1Id: r1, user2Id: r2 },
            { user1Id: r2, user2Id: r1 },
        ],
    });
    if (!conversation) return null;

    if (conversation.user1Id !== u1 || conversation.user2Id !== u2) {
        conversation.user1Id = u1;
        conversation.user2Id = u2;
        try {
            await conversation.save();
        } catch (e) {
            console.warn('Conversation id migrate skipped:', e.message);
        }
    }
    return conversation;
}

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;

        if (!receiverId || !text) {
            return errorResponse(res, 400, 'Receiver ID and text are required');
        }

        const senderId = normUserId(req.user.id);
        const recvNorm = normUserId(receiverId);
        const [user1Id, user2Id] = [senderId, recvNorm].sort();

        let conversation = await findConversationForPair(req.user.id, receiverId);

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

        // Emit socket event for real-time update
        const io = getIo();
        const convIdStr = conversation._id.toString();
        const formattedMsg = {
            id: message._id.toString(),
            text: message.text,
            sender: String(message.senderId),
            time: message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: message.createdAt
        };

        const payload = {
            ...formattedMsg,
            conversationId: convIdStr
        };

        // Emit to the conversation room
        io.to(convIdStr).emit('receive_message', formattedMsg);

        return successResponse(res, payload, 'Message sent');
    } catch (error) {
        console.error('Send Message Error:', error);
        return errorResponse(res, 500, 'Failed to send message', error);
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;

        const conversation = await findConversationForPair(req.user.id, receiverId);

        if (!conversation) {
            return successResponse(res, { messages: [], conversationId: null }, 'No conversation found');
        }

        const messages = await MongoMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

        // Fetch user info for messages manually since they are in MySQL
        const senderInfoCache = {};
        const formattedMessages = [];
        
        for (const msg of messages) {
            let senderImage = null;
            if (!senderInfoCache[msg.senderId]) {
                let user = await User.findByPk(msg.senderId, { attributes: ['image'] });
                if (!user) {
                    user = await User.findByPk(normUserId(msg.senderId), { attributes: ['image'] });
                }
                senderInfoCache[msg.senderId] = user ? user.image : null;
            }
            senderImage = senderInfoCache[msg.senderId];
            
            formattedMessages.push({
                id: msg._id.toString(),
                text: msg.text,
                sender: String(msg.senderId),
                senderImage: senderImage,
                time: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                conversationId: conversation._id.toString()
            });
        }

        return successResponse(res, {
            messages: formattedMessages,
            conversationId: conversation._id.toString()
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        return errorResponse(res, 500, 'Failed to fetch messages', error);
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userIdStr = normUserId(req.user.id);
        const uidRegex = new RegExp(`^${escapeRegex(userIdStr)}$`, 'i');

        const conversations = await MongoConversation.find({
            $or: [{ user1Id: uidRegex }, { user2Id: uidRegex }]
        }).sort({ lastMessageAt: -1 });

        const formatted = [];
        for (const conv of conversations) {
            const u1 = normUserId(conv.user1Id);
            const partnerMongoId = u1 === userIdStr ? conv.user2Id : conv.user1Id;
            let partner = await User.findByPk(partnerMongoId, { attributes: ['id', 'name', 'image', 'role'] });
            if (!partner) {
                partner = await User.findByPk(normUserId(partnerMongoId), { attributes: ['id', 'name', 'image', 'role'] });
            }

            if (conv.user1Id !== normUserId(conv.user1Id) || conv.user2Id !== normUserId(conv.user2Id)) {
                conv.user1Id = normUserId(conv.user1Id);
                conv.user2Id = normUserId(conv.user2Id);
                try {
                    await conv.save();
                } catch (e) {
                    console.warn('Conv row migrate:', e.message);
                }
            }
            
            if (partner && normUserId(partner.id) !== userIdStr) {
                formatted.push({
                    id: partner.id,
                    conversationId: conv._id,
                    name: partner.name,
                    role: partner.role,
                    lastMessage: conv.lastMessage,
                    time: conv.lastMessageAt ? conv.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
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
