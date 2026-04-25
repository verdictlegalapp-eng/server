const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversationId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Conversations', key: 'id' } },
    senderId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    text: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = Message;
