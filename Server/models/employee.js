const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define the Employee model
const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(100),
  },
  department: {
    type: DataTypes.STRING(100),
  },
}, {
  timestamps: true,          // Adds createdAt and updatedAt
  tableName: 'Employees',    // Explicit table name
});

module.exports = Employee;
