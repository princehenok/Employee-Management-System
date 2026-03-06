const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');

// Get all employees
router.get('/', async (req, res) => {
  const employees = await Employee.findAll();
  res.json(employees);
});

// Add a new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const newEmployee = await Employee.create({ name, email, role });
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee', error });
  }
});

// Optional: delete employee
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Employee.destroy({ where: { id } });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error });
  }
});

module.exports = router;
