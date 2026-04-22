const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lawyer = sequelize.define('Lawyer', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    practiceArea: { type: DataTypes.STRING, allowNull: false },
    experienceYears: { type: DataTypes.INTEGER, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, allowNull: true },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    badges: { type: DataTypes.JSON, defaultValue: [] },
}, { timestamps: true });

module.exports = Lawyer;
