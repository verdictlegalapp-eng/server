const { sequelize } = require('../config/db');
require('../models'); // Import all models to ensure they are registered with sequelize

const syncDB = async () => {
    try {
        console.log('📡 Starting Database Sync...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database Sync Failed:', error);
        process.exit(1);
    }
};

syncDB();
