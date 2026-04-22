const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (serviceAccount.projectId && serviceAccount.privateKey) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
