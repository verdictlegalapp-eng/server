const { sequelize } = require('../config/db');
const { User, Lawyer, Conversation, Message } = require('../models');

async function testChat() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        
        console.log('Finding a lawyer...');
        const lawyer = await Lawyer.findOne();
        if (!lawyer) throw new Error('No lawyers found');
        console.log(`Lawyer ID: ${lawyer.userId}`);
        
        console.log('Creating a test user...');
        const user = await User.create({
            email: `test_${Date.now()}@test.com`,
            name: 'Test Client',
            role: 'user'
        });
        console.log(`User ID: ${user.id}`);
        
        console.log('Simulating sending a message...');
        const [conversation] = await Conversation.findOrCreate({
            where: { user1Id: [user.id, lawyer.userId].sort()[0], user2Id: [user.id, lawyer.userId].sort()[1] }
        });
        
        await Message.create({
            conversationId: conversation.id,
            senderId: user.id,
            text: 'Hello from test script'
        });
        
        console.log('Fetching messages...');
        const messages = await Message.findAll({ where: { conversationId: conversation.id } });
        console.log('Messages:', messages.map(m => m.text));
        
        console.log('Success!');
        process.exit(0);
    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
}

testChat();
