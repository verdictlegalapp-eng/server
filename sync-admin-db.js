const { sequelize } = require('./config/db');
require('./models');

async function syncDB() {
    try {
        console.log('📡 Syncing database tables...');
        // Using alter: true to add new tables/columns without deleting data
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncDB();
