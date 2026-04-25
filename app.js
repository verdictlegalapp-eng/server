const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const lawyerRoutes = require('./routes/lawyer.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Verdict API is live', website: 'verdict.sbs' });
});

// Debug Route
app.get('/debug-db', async (req, res) => {
    try {
        const { User, Lawyer, Conversation, Message } = require('./models');
        const userCount = await User.count();
        const lawyerCount = await Lawyer.count();
        const convCount = await Conversation.count();
        const msgCount = await Message.count();
        res.status(200).json({ users: userCount, lawyers: lawyerCount, conversations: convCount, messages: msgCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/chat', chatRoutes);

// Error Handling
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

const { Otp } = require('./models');
const { Op } = require('sequelize');

const startServer = async () => {
    await connectDB();
    
    // Start Cleanup Task (Every Hour)
    setInterval(async () => {
        try {
            const deleted = await Otp.destroy({
                where: { expiresAt: { [Op.lt]: new Date() } }
            });
            if (deleted > 0) console.log(`🧹 Cleaned up ${deleted} expired OTPs`);
        } catch (err) {
            console.error('❌ OTP Cleanup Error:', err);
        }
    }, 60 * 60 * 1000);

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app; // For Hostinger/Passenger
