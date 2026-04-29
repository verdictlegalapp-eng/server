const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PushToken = sequelize.define('PushToken', {
    token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false // 'client' or 'lawyer'
    }
});

module.exports = PushToken;
