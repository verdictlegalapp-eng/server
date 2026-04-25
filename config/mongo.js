const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        const uri = 'mongodb+srv://verdictlegalapp_db_user:yRoKfRA99B5sjU6L@cluster0.ugwxpuc.mongodb.net/verdict?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectMongo;
