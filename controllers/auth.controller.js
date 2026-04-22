const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

exports.loginOrRegister = async (req, res) => {
    try {
        const { firebaseUid, phoneNumber, email, fullName } = req.body;
        if (!firebaseUid || !phoneNumber) return errorResponse(res, 400, 'Missing fields');
        
        let user = await User.findOne({ where: { firebaseUid } });
        if (!user) {
            user = await User.create({ firebaseUid, phoneNumber, email, fullName });
        }
        
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        return successResponse(res, { user, token });
    } catch (error) {
        return errorResponse(res, 500, 'Server Error', error);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { include: ['lawyerProfile'] });
        return successResponse(res, user);
    } catch (error) {
        return errorResponse(res, 500, 'Server Error', error);
    }
};
