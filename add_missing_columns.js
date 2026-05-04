const { sequelize } = require('./config/db');

async function migrate() {
  console.log('🚀 Starting Database Sync...');
  try {
    // Add boostExpiresAt if it doesn't exist
    await sequelize.query(`
      ALTER TABLE Lawyers 
      ADD COLUMN IF NOT EXISTS boostExpiresAt DATETIME DEFAULT NULL;
    `);
    console.log('✅ Added boostExpiresAt column');

    // Add subscriptionTier if it doesn't exist
    await sequelize.query(`
      ALTER TABLE Lawyers 
      ADD COLUMN IF NOT EXISTS subscriptionTier ENUM('free', 'plus', 'gold', 'platinum') DEFAULT 'free';
    `);
    console.log('✅ Added subscriptionTier column');

    // Add subscriptionExpiresAt if it doesn't exist
    await sequelize.query(`
      ALTER TABLE Lawyers 
      ADD COLUMN IF NOT EXISTS subscriptionExpiresAt DATETIME DEFAULT NULL;
    `);
    console.log('✅ Added subscriptionExpiresAt column');

    console.log('🎉 Database is now up to date!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
