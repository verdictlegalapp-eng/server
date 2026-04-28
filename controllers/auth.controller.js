const jwt = require('jsonwebtoken');
const { User, Lawyer, Otp } = require('../models');
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

        // Send Email
        const mailOptions = {
            from: `"Verdict Legal Support" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Verdict - Your Verification Code',
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 50px 0; color: #333; width: 100%;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <div style="background-color: #273951; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">VERDICT</h1>
                            <p style="color: #94A3B8; margin: 5px 0 0 0; font-size: 14px;">Secure Legal Access</p>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1E293B; margin-top: 0; font-size: 22px;">Verify Your Identity</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Hello,</p>
                            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Use the code below to complete your authentication process. This code is valid for <strong>10 minutes</strong>.</p>
                            
                            <div style="margin: 35px 0; text-align: center;">
                                <div style="display: inline-block; background-color: #F1F5F9; padding: 20px 40px; border-radius: 10px; border: 1px solid #E2E8F0;">
                                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #3B82F6;">${otpCode}</span>
                                </div>
                            </div>
                            
                            <p style="font-size: 14px; color: #64748B; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                        <div style="background-color: #F8FAFC; padding: 30px; text-align: center; border-top: 1px solid #F1F5F9;">
                            <p style="font-size: 12px; color: #94A3B8; margin: 0 0 10px 0;">&copy; 2024 Verdict Legal App. All rights reserved.</p>
                            <p style="font-size: 12px; color: #94A3B8; margin: 0 0 10px 0;">
                                123 Legal Plaza, Suite 100, City, State, ZIP <br>
                                <a href="https://verdict.sbs" style="color: #3B82F6; text-decoration: none;">Visit our website</a> | 
                                <a href="mailto:support@verdict.sbs" style="color: #3B82F6; text-decoration: none;">Contact Support</a>
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return successResponse(res, null, 'OTP sent to email');
    } catch (error) {
        console.error('Request OTP Error:', error);
        return errorResponse(res, 500, 'Failed to send OTP', error);
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, code, profile } = req.body;
        if (!email || !code) return errorResponse(res, 400, 'Email and code are required');

        // Check OTP in database
        const otpEntry = await Otp.findOne({
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
                experience: profile?.experience || 'Licensed Attorney',
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
                role: dbRole
            });
        } else {
            // Update existing user if needed
            await user.update({
                phoneNumber: phone_number || user.phoneNumber,
                email: email || user.email,
                name: name || user.name
            });
        }

        // If Lawyer, handle Lawyer profile
        if (dbRole === 'lawyer') {
            let lawyer = await Lawyer.findOne({ where: { userId: user.id } });
            const lawyerData = {
                practice: specialization || 'General',
                experience: profile?.experience || 'Licensed Attorney',
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

exports.updateProfile = async (req, res) => {
    try {
        const { image, name, city, state, legalNeed, bio, practice } = req.body;
        
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
                if (city !== undefined) lawyerUpdateData.city = city;
                if (state !== undefined) lawyerUpdateData.state = state;

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

