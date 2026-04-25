const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user1Id: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    user2Id: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    lastMessage: { type: DataTypes.TEXT, allowNull: true },
    lastMessageAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { 
    timestamps: true,
    indexes: [
        { unique: true, fields: ['user1Id', 'user2Id'] }
    ]
});

module.exports = Conversation;
