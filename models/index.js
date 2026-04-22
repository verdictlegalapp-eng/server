const User = require('./User');
const Lawyer = require('./Lawyer');

User.hasOne(Lawyer, { foreignKey: 'userId', as: 'lawyerProfile' });
Lawyer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Lawyer };
