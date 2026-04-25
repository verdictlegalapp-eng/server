const User = require('./User');
const Lawyer = require('./Lawyer');
const Otp = require('./Otp');
const Message = require('./Message');

User.hasOne(Lawyer, { foreignKey: 'userId', as: 'lawyerProfile' });
Lawyer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = { User, Lawyer, Otp, Message };

