const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    firebaseUid: { type: DataTypes.STRING, allowNull: true, unique: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    name: { type: DataTypes.STRING, allowNull: true },
    image: { type: DataTypes.TEXT('long'), allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    legalNeed: { type: DataTypes.TEXT, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'lawyer', 'admin'), defaultValue: 'user' },
}, { timestamps: true });


module.exports = User;
