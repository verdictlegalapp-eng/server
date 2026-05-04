const mongoose = require('mongoose');

const mongoMessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    deletedBy: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Message', mongoMessageSchema);
