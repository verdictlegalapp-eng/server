const { User, Lawyer, VerificationRequest, PushToken, NotificationLog } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Verdict@2026';

// Store admin tokens in memory for simplicity (resets on restart)
let adminTokens = new Set();

exports.login = async (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return errorResponse(res, 401, 'Invalid admin password');
    }
    const token = crypto.randomBytes(32).toString('hex');
    adminTokens.add(token);
    return successResponse(res, { token });
};

exports.validateToken = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || !adminTokens.has(token)) {
        return errorResponse(res, 401, 'Unauthorized');
    }
    next();
};

exports.getStats = async (req, res) => {
    try {
        const userCount = await User.count({ where: { role: 'user' } });
        const lawyerCount = await Lawyer.count();
        const pendingVerifications = await VerificationRequest.count({ where: { status: 'pending' } });
        const pushTokens = await PushToken.count();

        return successResponse(res, {
            totalClients: userCount,
            totalAttorneys: lawyerCount,
            pendingVerifications,
            pushSubscribers: pushTokens,
            revenue: userCount * 10 // Placeholder for revenue logic
        });
    } catch (error) {
        return errorResponse(res, 500, 'Failed to fetch stats', error);
    }
};

exports.getVerifications = async (req, res) => {
    try {
        const data = await VerificationRequest.findAll({
            order: [['createdAt', 'DESC']]
        });
        return successResponse(res, data);
    } catch (error) {
        return errorResponse(res, 500, 'Failed to fetch verifications', error);
    }
};

exports.resolveVerification = async (req, res) => {
    try {
        const { id, action } = req.params; // action: 'approve' or 'reject'
        const request = await VerificationRequest.findByPk(id);
        if (!request) return errorResponse(res, 404, 'Request not found');

        request.status = action === 'approve' ? 'approved' : 'rejected';
        request.reviewedAt = new Date();
        await request.save();

        // If approved, update Lawyer profile with a badge or status
        if (action === 'approve') {
            const lawyer = await Lawyer.findOne({ where: { userId: request.userId } });
            if (lawyer) {
                // You could add a 'isVerified' column to Lawyer table if needed
                // For now, let's just log it
                console.log(`✅ Lawyer ${lawyer.id} verified`);
            }
        }

        return successResponse(res, request, `Verification ${action}d successfully`);
    } catch (error) {
        return errorResponse(res, 500, 'Action failed', error);
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await User.findAll({
            where: { role: 'user' },
            limit: 100,
            order: [['createdAt', 'DESC']]
        });
        return successResponse(res, clients);
    } catch (error) {
        return errorResponse(res, 500, 'Failed to fetch clients', error);
    }
};

exports.getAttorneys = async (req, res) => {
    try {
        const attorneys = await User.findAll({
            where: { role: 'lawyer' },
            include: [{ model: Lawyer, as: 'lawyerProfile' }],
            limit: 100,
            order: [['createdAt', 'DESC']]
        });
        return successResponse(res, attorneys);
    } catch (error) {
        return errorResponse(res, 500, 'Failed to fetch attorneys', error);
    }
};

exports.syncDatabase = async (req, res) => {
    try {
        const { sequelize } = require('../config/db');
        require('../models'); // Ensure all models are loaded
        await sequelize.sync({ alter: true });
        return successResponse(res, null, 'Database synchronized successfully');
    } catch (error) {
        console.error('Sync error:', error);
        return errorResponse(res, 500, 'Sync failed', error);
    }
};
