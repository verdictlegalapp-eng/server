const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
    if (serviceAccount.projectId && serviceAccount.privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized');
    } else {
        console.warn('⚠️ Firebase credentials missing in .env');
    }
} catch (error) {
    console.error('❌ Firebase Init Error:', error.message);
}

module.exports = admin;
