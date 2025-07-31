// Server/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');

router.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

module.exports = router;
