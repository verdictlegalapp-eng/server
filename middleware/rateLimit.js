const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

/**
 * Rate limiter for OTP requests
 * Prevents spamming the email service
 */
const otpRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many OTP requests from this IP, please try again after an hour',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
        return errorResponse(res, 429, options.message.message);
    }
});

/**
 * General API rate limiter
 */
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return errorResponse(res, 429, 'Too many requests, please try again later');
    }
});

module.exports = {
    otpRateLimiter,
    apiRateLimiter
};
