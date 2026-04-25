const mongoose = require('mongoose');

const mongoConversationSchema = new mongoose.Schema({
    user1Id: { type: String, required: true, index: true },
    user2Id: { type: String, required: true, index: true },
    lastMessage: { type: String, default: null },
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure uniqueness of a conversation between two specific users
mongoConversationSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', mongoConversationSchema);
