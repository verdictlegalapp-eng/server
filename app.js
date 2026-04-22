const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const lawyerRoutes = require('./routes/lawyer.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Verdict API is live', website: 'verdict.sbs' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);

// Error Handling
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app; // For Hostinger/Passenger
