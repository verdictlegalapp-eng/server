const { Lawyer, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getAllLawyers = async (req, res) => {
    try {
        const { practiceArea, location } = req.query;
        let where = {};
        if (practiceArea) where.practiceArea = practiceArea;
        if (location) where.location = { [Op.like]: `%${location}%` };

        const lawyers = await Lawyer.findAll({
            where,
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['name', 'image'] 
            }]
        });
        return successResponse(res, lawyers);
    } catch (error) {
        return errorResponse(res, 500, 'Server Error', error);
    }
};

exports.getLawyerById = async (req, res) => {
    try {
        const lawyer = await Lawyer.findByPk(req.params.id, {
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
