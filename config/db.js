const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false
    }
);

console.log(`📡 Attempting DB Connection: ${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}`);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connected');
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.error('❌ DB Connection Error:', error.message);
        // Don't exit process in production if possible, or let Hostinger restart it
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

module.exports = { sequelize, connectDB };
