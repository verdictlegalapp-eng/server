const connectMongo = require('../config/mongo');
const { connectDB } = require('../config/db');
const MongoConversation = require('../models/MongoConversation');
const { User } = require('../models');

async function testGetConversations() {
    try {
        await connectDB();
        await connectMongo();
        
        const userId = '4bb24524-f84a-4b14-a7fc-67b188127a78';
        console.log('Fetching for user', userId);

        const conversations = await MongoConversation.find({
            $or: [{ user1Id: userId }, { user2Id: userId }]
        }).sort({ lastMessageAt: -1 });
        
        console.log('Conversations found:', conversations.length);

        const formatted = [];
        for (const conv of conversations) {
            const partnerId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            const partner = await User.findByPk(partnerId, { attributes: ['id', 'name', 'image'] });
            
            if (partner) {
                formatted.push({
                    id: partner.id,
                    lawyerName: partner.name,
                    lastMessage: conv.lastMessage,
                    time: conv.lastMessageAt ? conv.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    image: partner.image,
                    unread: false
                });
            }
        }

        console.log('Formatted:', formatted);
        process.exit(0);
    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}

testGetConversations();
