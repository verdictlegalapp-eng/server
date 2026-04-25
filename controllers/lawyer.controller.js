const { Lawyer, User } = require('../models');
const { sequelize } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getAllLawyers = async (req, res) => {
    try {
        const { practice, location, userCity, userState } = req.query;
        let where = {};
        
        if (practice) where.practice = practice;
        if (location) where.location = { [Op.like]: `%${location}%` };

        // Prioritize lawyers in the same city/state as the user
        const lawyers = await Lawyer.findAll({
            where,
            attributes: ['id', 'userId', 'practice', 'experience', 'state', 'city', 'location', 'bio', 'rating', 'badges'],
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['name', 'image'] 
            }],
            order: [
                // 1. Exact city match
                [sequelize.literal(`CASE WHEN Lawyer.city = ${sequelize.escape(userCity || '')} THEN 0 ELSE 1 END`), 'ASC'],
                // 2. State match
                [sequelize.literal(`CASE WHEN Lawyer.state = ${sequelize.escape(userState || '')} THEN 0 ELSE 1 END`), 'ASC'],
                // 3. Rating
                ['rating', 'DESC']
            ]
        });
        return successResponse(res, lawyers);
    } catch (error) {
        console.error('Fetch Lawyers Error:', error);
        return errorResponse(res, 500, 'Server Error', error);
    }
};

exports.getLawyerById = async (req, res) => {
    try {
        const lawyer = await Lawyer.findByPk(req.params.id, {
            attributes: ['id', 'userId', 'practice', 'experience', 'state', 'city', 'location', 'bio', 'rating', 'badges'],
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['name', 'image'] 
            }]
        });
        if (!lawyer) return errorResponse(res, 404, 'Lawyer not found');
        return successResponse(res, lawyer);
    } catch (error) {
        return errorResponse(res, 500, 'Server Error', error);
    }
};

exports.registerLawyer = async (req, res) => {
    try {
        const data = req.body;
        const lawyer = await Lawyer.create({ ...data, userId: req.user.id });
        await User.update({ role: 'lawyer' }, { where: { id: req.user.id } });
        return successResponse(res, lawyer);
    } catch (error) {
        return errorResponse(res, 500, 'Server Error', error);
    }
};
