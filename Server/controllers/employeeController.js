const Employee = require('../models/Employee')
const SalaryHistory = require('../models/SalaryHistory')

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
    res.status(200).json(employees)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
    if (!employee) return res.status(404).json({ message: 'Employee not found' })
    res.status(200).json(employee)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body)

    // Auto record initial salary
    await SalaryHistory.create({
      employee: employee._id,
      amount: employee.salary,
      previousAmount: 0,
      reason: 'Initial',
      processedBy: req.user._id,
      status: 'Pending'
    })

    res.status(201).json(employee)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.updateEmployee = async (req, res) => {
  try {
    const existing = await Employee.findById(req.params.id)
    if (!existing) return res.status(404).json({ message: 'Employee not found' })

    // If salary changed, record it
    if (req.body.salary && req.body.salary !== existing.salary) {
      await SalaryHistory.create({
        employee: existing._id,
        amount: req.body.salary,
        previousAmount: existing.salary,
        reason: 'Adjustment',
        processedBy: req.user._id,
        status: 'Pending'
      })
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    res.status(200).json(employee)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id)
    if (!employee) return res.status(404).json({ message: 'Employee not found' })
    res.status(200).json({ message: 'Employee deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
