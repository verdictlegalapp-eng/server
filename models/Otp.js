const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Otp = sequelize.define('Otp', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false }
}, { timestamps: true });

module.exports = Otp;
