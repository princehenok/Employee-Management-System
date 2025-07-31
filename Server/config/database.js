const { Sequelize } = require('sequelize');

// Create Sequelize instance with your credentials
const sequelize = new Sequelize('EMS', 'root', 'henok@#23(28)', {
  host: 'localhost',
  dialect: 'mysql',
});

// Optional: Test the connection when this file runs
sequelize.authenticate()
  .then(() => console.log('✅ Connection to MySQL successful!'))
  .catch((err) => console.error('❌ Connection error:', err));

module.exports = sequelize;

