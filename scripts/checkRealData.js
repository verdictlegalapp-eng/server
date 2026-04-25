const { sequelize } = require('../config/db');
const { User, Conversation, Message } = require('../models');

async function checkRealData() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        
        const users = await User.findAll({ attributes: ['id', 'email', 'role'], raw: true });
        console.log('Users:', users);
        
        const conversations = await Conversation.findAll({ raw: true });
        console.log('Conversations:', conversations);
        
        const messages = await Message.findAll({ raw: true });
        console.log('Messages:', messages);
        
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

checkRealData();
