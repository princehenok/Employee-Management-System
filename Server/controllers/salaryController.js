const SalaryHistory = require('../models/SalaryHistory')
const Employee = require('../models/Employee')

exports.getEmployeeSalaryHistory = async (req, res) => {
  try {
    const history = await SalaryHistory.find({ employee: req.params.employeeId })
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
    res.status(200).json(history)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addSalaryRecord = async (req, res) => {
  try {
    const { employeeId, amount, reason, note, effectiveDate } = req.body

    const employee = await Employee.findById(employeeId)
    if (!employee) return res.status(404).json({ message: 'Employee not found' })

    const record = await SalaryHistory.create({
      employee: employeeId,
      amount,
      previousAmount: employee.salary,
      reason: reason || 'Adjustment',
      note,
      effectiveDate: effectiveDate || Date.now(),
      processedBy: req.user._id,
      status: 'Pending'
    })

    employee.salary = amount
    await employee.save()

    res.status(201).json(record)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.markAsPaid = async (req, res) => {
  try {
    const record = await SalaryHistory.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid' },
      { new: true }
    )
    if (!record) return res.status(404).json({ message: 'Record not found' })
    res.status(200).json(record)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getPayroll = async (req, res) => {
  try {
    const employees = await Employee.find()
    const payroll = await Promise.all(employees.map(async (emp) => {
      const latest = await SalaryHistory.findOne({ employee: emp._id })
        .sort({ createdAt: -1 })
      return {
        employee: emp,
        latestRecord: latest
      }
    }))
    res.status(200).json(payroll)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.processPayroll = async (req, res) => {
  try {
    const employees = await Employee.find()
    let count = 0

    for (const emp of employees) {
      const latest = await SalaryHistory.findOne({ employee: emp._id })
        .sort({ createdAt: -1 })

      if (latest && latest.status === 'Pending') {
        latest.status = 'Paid'
        await latest.save()
        count++
      }
    }

    res.status(200).json({ message: `${count} records marked as paid` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}