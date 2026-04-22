const successResponse = (res, data, message = 'Success') => {
    return res.status(200).json({ success: true, message, data });
};

const errorResponse = (res, statusCode, message, error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error ? (error.message || error) : null
    });
};

module.exports = { successResponse, errorResponse };
