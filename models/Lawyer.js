const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lawyer = sequelize.define('Lawyer', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    practiceArea: { type: DataTypes.STRING, allowNull: false },
    experienceYears: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    state: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true }, // Keeping for backward compatibility
    barId: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    badges: { type: DataTypes.JSON, defaultValue: [] },
}, { timestamps: true });

module.exports = Lawyer;
