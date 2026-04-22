const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    firebaseUid: { type: DataTypes.STRING, allowNull: false, unique: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    fullName: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'lawyer', 'admin'), defaultValue: 'user' },
}, { timestamps: true });

module.exports = User;
