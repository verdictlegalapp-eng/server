const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('📧 Email Transporter Error:', error);
    } else {
        console.log('📧 Email Transporter is ready');
    }
});

module.exports = transporter;
