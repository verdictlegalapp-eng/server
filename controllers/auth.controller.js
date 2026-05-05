const jwt = require('jsonwebtoken');
const { User, Lawyer, Otp, NotificationLog } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const admin = require('../config/firebase');
const transporter = require('../config/email');
const { Op } = require('sequelize');

exports.requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return errorResponse(res, 400, 'Email is required');

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        await Otp.create({ email, code: otpCode, expiresAt });

        // Transporter send removed as per request to use universal 123456 OTP
        console.log(`[Auth] OTP requested for ${email}. Universal code 123456 is active.`);
        
        return successResponse(res, null, 'OTP request received. Use universal code 123456.');
    } catch (error) {
        console.error('Request OTP Error:', error);
        return errorResponse(res, 500, 'Failed to send OTP', error);
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, code, profile } = req.body;
        if (!email || !code) return errorResponse(res, 400, 'Email and code are required');

        // Check OTP in database (123456 is universal code)
        let otpEntry = null;
        const inputCode = code ? code.toString().trim() : '';
        if (inputCode === '123456' || !inputCode) {
            // Universal bypass
            console.log(`[Auth] Universal code 123456 used for ${email}`);
        } else {
            otpEntry = await Otp.findOne({
                where: {
                    email,
                    code,
                    expiresAt: { [Op.gt]: new Date() }
                },
                order: [['createdAt', 'DESC']]
            });

            if (!otpEntry) {
                return errorResponse(res, 400, 'Invalid or expired OTP');
            }
            
            // OTP verified, delete it
            await otpEntry.destroy();
        }

        // Handle User creation/update
        const { name, role, state, city, specialization, barId, phone } = profile || {};
        const dbRole = role === 'attorney' ? 'lawyer' : 'user';

        let user = await User.findOne({ where: { email } });
        if (!user) {
            user = await User.create({
                email,
                phoneNumber: phone || null,
                name: name || null,
                city: city || null,
                state: state || null,
                legalNeed: profile?.legalNeed || null,
                role: dbRole
            });
        } else {
            await user.update({
                phoneNumber: phone || user.phoneNumber,
                name: name || user.name,
                city: city || user.city,
                state: state || user.state,
                legalNeed: profile?.legalNeed || user.legalNeed,
                role: dbRole
            });
        }

        // If Lawyer, handle Lawyer profile
        if (dbRole === 'lawyer') {
            let lawyer = await Lawyer.findOne({ where: { userId: user.id } });
            const lawyerData = {
                practice: specialization || 'General',
                experience: profile?.experience || '1 Year Experience',
                state: state || null,
                city: city || null,
                barId: barId || null,
                userId: user.id,
                facebook: profile?.facebook || null,
                instagram: profile?.instagram || null,
                linkedin: profile?.linkedin || null
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
        console.error('Verify OTP Error:', error);
        return errorResponse(res, 500, 'Verification failed', error);
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const { idToken, profile } = req.body;
        if (!idToken) return errorResponse(res, 400, 'Missing ID Token');

        // Verify Firebase Token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (authError) {
            return errorResponse(res, 401, 'Invalid or expired ID Token', authError);
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
                name: name || null,
                city: city || null,
                state: state || null,
                legalNeed: profile?.legalNeed || null,
                role: dbRole
            });
        } else {
            // Update existing user if needed
            await user.update({
                phoneNumber: phone_number || user.phoneNumber,
                email: email || user.email,
                name: name || user.name,
                city: city || user.city,
                state: state || user.state,
                legalNeed: profile?.legalNeed || user.legalNeed
            });
        }

        // If Lawyer, handle Lawyer profile
        if (dbRole === 'lawyer') {
            let lawyer = await Lawyer.findOne({ where: { userId: user.id } });
            const lawyerData = {
                practice: specialization || 'General',
                experience: profile?.experience || '1 Year Experience',
                state: state || null,
                city: city || null,
                barId: barId || null,
                userId: user.id,
                facebook: profile?.facebook || null,
                instagram: profile?.instagram || null,
                linkedin: profile?.linkedin || null
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

exports.updateProfile = async (req, res) => {
    try {
        const { image, name, city, state, legalNeed, bio, practice, experience, facebook, instagram, linkedin } = req.body;
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Update User table
        const userUpdateData = {};
        if (image !== undefined) userUpdateData.image = image;
        if (name !== undefined) userUpdateData.name = name;
        if (city !== undefined) userUpdateData.city = city;
        if (state !== undefined) userUpdateData.state = state;
        if (legalNeed !== undefined) userUpdateData.legalNeed = legalNeed;

        if (Object.keys(userUpdateData).length > 0) {
            await user.update(userUpdateData);
        }

        // Update Lawyer table if relevant
        if (user.role === 'lawyer') {
            const lawyer = await Lawyer.findOne({ where: { userId: user.id } });
            if (lawyer) {
                const lawyerUpdateData = {};
                if (bio !== undefined) lawyerUpdateData.bio = bio;
                if (practice !== undefined) lawyerUpdateData.practice = practice;
                if (experience !== undefined) lawyerUpdateData.experience = experience;
                if (city !== undefined) lawyerUpdateData.city = city;
                if (state !== undefined) lawyerUpdateData.state = state;
                if (facebook !== undefined) lawyerUpdateData.facebook = facebook;
                if (instagram !== undefined) lawyerUpdateData.instagram = instagram;
                if (linkedin !== undefined) lawyerUpdateData.linkedin = linkedin;

                if (Object.keys(lawyerUpdateData).length > 0) {
                    await lawyer.update(lawyerUpdateData);
                }
            }
        }

        // Return updated user with profile
        const updatedUser = await User.findByPk(user.id, {
            include: [{ model: Lawyer, as: 'lawyerProfile' }]
        });

        return successResponse(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
        console.error('Update Profile Error:', error);
        return errorResponse(res, 500, 'Failed to update profile', error);
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) return errorResponse(res, 404, 'User not found');

        // Delete associated profiles/data
        await Lawyer.destroy({ where: { userId } });
        
        // Push tokens (dynamic import in case it's not in index.js yet)
        const { PushToken } = require('../models');
        if (PushToken) {
            await PushToken.destroy({ where: { userId } });
        }

        // Final deletion
        await user.destroy();

        return successResponse(res, null, 'Account and all associated data deleted successfully');
    } catch (error) {
        console.error('Delete Account Error:', error);
        return errorResponse(res, 500, 'Failed to delete account', error);
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await NotificationLog.findAll({
            where: {
                [Op.or]: [
                    { recipientId: userId },
                    { type: 'all' }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        return successResponse(res, notifications);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        return errorResponse(res, 500, 'Failed to fetch notifications', error);
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'image', 'role']
        });
        if (!user) return errorResponse(res, 404, 'User not found');
        return successResponse(res, user);
    } catch (error) {
        return errorResponse(res, 500, 'Server Error', error);
    }
};

