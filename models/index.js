const User = require('./User');
const Lawyer = require('./Lawyer');
const Otp = require('./Otp');
const Message = require('./Message');
const Conversation = require('./Conversation');
const VerificationRequest = require('./VerificationRequest');
const PushToken = require('./PushToken');
const NotificationLog = require('./NotificationLog');

// User - Lawyer
User.hasOne(Lawyer, { foreignKey: 'userId', as: 'lawyerProfile' });
Lawyer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Conversation associations
User.hasMany(Conversation, { foreignKey: 'user1Id', as: 'conversationsAsUser1' });
User.hasMany(Conversation, { foreignKey: 'user2Id', as: 'conversationsAsUser2' });
Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });

// Message associations
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// VerificationRequest associations
User.hasMany(VerificationRequest, { foreignKey: 'userId', as: 'verificationRequests' });
VerificationRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// PushToken associations
User.hasMany(PushToken, { foreignKey: 'userId', as: 'pushTokens' });
PushToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Lawyer, Otp, Message, Conversation, VerificationRequest, PushToken, NotificationLog };
