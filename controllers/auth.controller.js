const jwt = require('jsonwebtoken');
const { User, Lawyer } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const admin = require('../config/firebase');

exports.verifyToken = async (req, res) => {
    try {
        const { idToken, profile } = req.body;
        if (!idToken) return errorResponse(res, 400, 'Missing ID Token');

        // Verify Firebase Token
        let decodedToken;
        if (idToken === 'mock-dev-token') {
            console.log('👷 Using Development Bypass Token');
            decodedToken = { 
                uid: 'dev-user-' + (profile?.phone || 'unknown'), 
                phone_number: profile?.phone || '+919999999999' 
            };
        } else {
            try {
                decodedToken = await admin.auth().verifyIdToken(idToken);
            } catch (authError) {
                return errorResponse(res, 401, 'Invalid or expired ID Token', authError);
            }
        }

        const { uid, phone_number } = decodedToken;
        const { name, email, role, state, city, specialization, barId } = profile || {};

        // Map roles: client -> user, attorney -> lawyer
        const dbRole = role === 'attorney' ? 'lawyer' : 'user';

        // Find or Create User
        let user = await User.findOne({ where: { firebaseUid: uid } });
        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                phoneNumber: phone_number || profile?.phone,
                email: email || null,
                fullName: name || null,
                role: dbRole
            });
        } else {
            // Update existing user if needed
            await user.update({
                phoneNumber: phone_number || user.phoneNumber,
                email: email || user.email,
                fullName: name || user.fullName
            });
        }

        // If Lawyer, handle Lawyer profile
        if (dbRole === 'lawyer') {
            let lawyer = await Lawyer.findOne({ where: { userId: user.id } });
            const lawyerData = {
                practiceArea: specialization || 'General',
                state: state || null,
                city: city || null,
                barId: barId || null,
                userId: user.id
            };

            if (!lawyer) {
                await Lawyer.create(lawyerData);
            } else {
                await lawyer.update(lawyerData);
            }
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'verdict_secret_2024',
            { expiresIn: '30d' }
        );

        return successResponse(res, { user, sessionToken: token }, 'Authentication successful');
    } catch (error) {
        console.error('Auth Error:', error);
        return errorResponse(res, 500, 'Internal Server Error', error);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { 
            include: [{ model: Lawyer, as: 'lawyerProfile' }] 
        });
        return successResponse(res, user);
    } catch (error) {
        return errorResponse(res, 500, 'Server Error', error);
    }
};
