const connectMongo = require('../config/mongo');
const MongoConversation = require('../models/MongoConversation');
const MongoMessage = require('../models/MongoMessage');

async function testMongo() {
    try {
        await connectMongo();
        
        const user1Id = '4bb24524-f84a-4b14-a7fc-67b188127a78';
        const user2Id = 'a6b17982-49a0-43de-9383-3546c3ed64c2';
        
        let conversation = await MongoConversation.findOne({ user1Id, user2Id });
        if (!conversation) {
            conversation = await MongoConversation.create({ user1Id, user2Id });
        }
        
        const message = await MongoMessage.create({
            conversationId: conversation._id,
            senderId: user1Id,
            text: 'Hello from MongoDB test script'
        });
        
        console.log('Test success!', message);
        process.exit(0);
    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}

testMongo();
