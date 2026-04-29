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

        request.status = action === 'approve' ? 'approved' : (action === 'revoke' ? 'rejected' : 'rejected');
        request.reviewedAt = new Date();
        await request.save();
 
        if (action === 'approve') {
            console.log(`[Admin] Approving verification request ${id} for user ${request.userId}`);
            const lawyer = await Lawyer.findOne({ where: { userId: request.userId } });
            
            if (lawyer) {
                console.log(`[Admin] Found lawyer profile for user ${request.userId}. Updating badges...`);
                let currentBadges = [];
                try {
                    currentBadges = typeof lawyer.badges === 'string' ? JSON.parse(lawyer.badges) : (Array.isArray(lawyer.badges) ? lawyer.badges : []);
                } catch (e) {
                    currentBadges = [];
                }
                
                if (!currentBadges.includes('Verified')) {
                    currentBadges.push('Verified');
                }
                
                await lawyer.update({ 
                    isVerified: true,
                    badges: currentBadges
                });
                console.log(`[Admin] Lawyer profile updated successfully with Verified badge.`);
            } else {
                console.warn(`[Admin] No lawyer profile found for user ${request.userId}. Badge not granted.`);
            }
        } else if (action === 'revoke') {
            console.log(`[Admin] Revoking verification for user ${request.userId}`);
            const lawyer = await Lawyer.findOne({ where: { userId: request.userId } });
            if (lawyer) {
                let currentBadges = [];
                try {
                    currentBadges = typeof lawyer.badges === 'string' ? JSON.parse(lawyer.badges) : (Array.isArray(lawyer.badges) ? lawyer.badges : []);
                } catch (e) {
                    currentBadges = [];
                }
                
                // Remove Verified badge
                currentBadges = currentBadges.filter(b => b.toLowerCase() !== 'verified');
                
                await lawyer.update({ 
                    isVerified: false,
                    badges: currentBadges
                });
                console.log(`[Admin] Verification revoked successfully.`);
            }
        }

        return successResponse(res, request, `Verification ${action}d successfully`);
    } catch (error) {
        return errorResponse(res, 500, 'Action failed', error);
    }
};

const { Expo } = require('expo-server-sdk');
let expo = new Expo();

exports.sendPushNotification = async (req, res) => {
    const { target, title, body, userId } = req.body;
    
    try {
        let tokens = [];
        if (target === 'individual' && userId) {
            const userTokens = await PushToken.findAll({ where: { userId } });
            tokens = userTokens.map(t => t.token);
        } else if (target === 'clients') {
            const clientTokens = await PushToken.findAll({ where: { role: 'client' } });
            tokens = clientTokens.map(t => t.token);
        } else if (target === 'attorneys') {
            const lawyerTokens = await PushToken.findAll({ where: { role: 'lawyer' } });
            tokens = lawyerTokens.map(t => t.token);
        } else { // 'all'
            const allTokens = await PushToken.findAll();
            tokens = allTokens.map(t => t.token);
        }

        if (tokens.length === 0) {
            return errorResponse(res, 404, 'No push tokens found for target');
        }

        let messages = [];
        for (let pushToken of tokens) {
            if (!Expo.isExpoPushToken(pushToken)) continue;
            messages.push({ to: pushToken, sound: 'default', title, body });
        }

        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }

        await NotificationLog.create({ title, body, audience: target, targetCount: tokens.length });

        return successResponse(res, null, `Notification sent to ${tokens.length} devices`);
    } catch (error) {
        return errorResponse(res, 500, 'Failed to send notification', error);
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

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, city, state } = req.body;
        const user = await User.findByPk(id);
        if (!user) return errorResponse(res, 404, 'User not found');
        
        await user.update({ name, email, role, city, state });
        return successResponse(res, user, 'User updated successfully');
    } catch (error) {
        return errorResponse(res, 500, 'Update failed', error);
    }
};

exports.syncDatabase = async (req, res) => {
    try {
        const { sequelize } = require('../config/db');
        require('../models');
        await sequelize.sync({ alter: true });
        return successResponse(res, null, 'Database synchronized successfully');
    } catch (error) {
        console.error('Sync error:', error);
        // Return a cleaner error message from the database
        const msg = error.original ? error.original.sqlMessage : error.message;
        return errorResponse(res, 500, `Sync failed: ${msg}`, error);
    }
};
