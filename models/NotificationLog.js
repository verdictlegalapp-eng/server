const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NotificationLog = sequelize.define('NotificationLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    audience: {
        type: DataTypes.STRING, // 'all', 'clients', 'attorneys'
        defaultValue: 'all'
    },
    targetCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = NotificationLog;
