const connectMongo = require('../config/mongo');
const { connectDB } = require('../config/db');
const { User } = require('../models');
const MongoConversation = require('../models/MongoConversation');
const MongoMessage = require('../models/MongoMessage');

async function testNoufal() {
    try {
        await connectDB();
        await connectMongo();

        const userId = '4bb24524-f84a-4b14-a7fc-67b188127a78'; // Noufal
        console.log('Testing for user:', userId);

        const conversations = await MongoConversation.find({
            $or: [{ user1Id: userId }, { user2Id: userId }]
        }).sort({ lastMessageAt: -1 });

        console.log('Conversations:', conversations.length);

        const formatted = [];
        for (const conv of conversations) {
            console.log('Processing conv:', conv._id, 'lastMessageAt:', conv.lastMessageAt);
            const partnerId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            const partner = await User.findByPk(partnerId, { attributes: ['id', 'name', 'image'] });
            
            if (partner) {
                formatted.push({
                    id: partner.id,
                    lawyerName: partner.name,
                    lastMessage: conv.lastMessage,
                    time: conv.lastMessageAt ? conv.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No Date',
                    image: partner.image,
                    unread: false
                });
            } else {
                console.log('Partner not found for id:', partnerId);
            }
        }
        
        console.log('Formatted inbox:', formatted);

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

testNoufal();
