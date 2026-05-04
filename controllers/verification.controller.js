const { VerificationRequest, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

exports.submitPhysicalRequest = async (req, res) => {
    try {
        const { userId, name, firstName, lastName, email, barId, state, lawFirm, notes } = req.body;

        if (!userId || !barId) {
            return errorResponse(res, 400, 'User ID and Bar ID are required');
        }

        // Check if a pending request already exists
        const existing = await VerificationRequest.findOne({
            where: {
                userId,
                status: 'pending'
            }
        });

        if (existing) {
            return errorResponse(res, 400, 'You already have a pending verification request.');
        }

        // Create the request
        const request = await VerificationRequest.create({
            userId,
            name: name || `${firstName} ${lastName}`,
            email,
            barId,
            state,
            lawFirm,
            notes,
            status: 'pending'
        });

        return successResponse(res, request, 'Verification request submitted successfully');
    } catch (error) {
        console.error('Submit Physical Request Error:', error);
        return errorResponse(res, 500, 'Internal Server Error', error);
    }
};

exports.getStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const request = await VerificationRequest.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        if (!request) {
            return successResponse(res, { status: 'none', badges: [] });
        }

        // If approved, you might want to return badges too
        // For now just return the status
        return successResponse(res, { 
            status: request.status, 
            badges: request.status === 'approved' ? ['Verified'] : [] 
        });
    } catch (error) {
        console.error('Get Status Error:', error);
        return errorResponse(res, 500, 'Internal Server Error', error);
    }
};

exports.removeVerification = async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete all verification requests for this user
        await VerificationRequest.destroy({ where: { userId } });

        // Update User model to unverified
        await User.update({ isVerified: false }, { where: { id: userId } });

        return successResponse(res, null, 'Verification removed successfully');
    } catch (error) {
        console.error('Remove Verification Error:', error);
        return errorResponse(res, 500, 'Internal Server Error', error);
    }
};
