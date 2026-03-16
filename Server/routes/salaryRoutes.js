const express = require('express')
const router = express.Router()
const {
  getEmployeeSalaryHistory,
  addSalaryRecord,
  markAsPaid,
  getPayroll,
  processPayroll
} = require('../controllers/salaryController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')
const Employee = require('../models/Employee')
const SalaryHistory = require('../models/SalaryHistory')

router.use(protect)

router.get('/payroll', authorizeRoles('admin', 'hr_manager'), getPayroll)
router.post('/process', authorizeRoles('admin'), processPayroll)
router.post('/reset', authorizeRoles('admin'), async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'Active' })

    for (const employee of employees) {
      await SalaryHistory.create({
        employee: employee._id,
        amount: employee.salary,
        previousAmount: employee.salary,
        reason: 'Monthly Payroll',
        status: 'Pending',
        note: `Manual reset for ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
      })
    }

    res.status(200).json({ message: `✅ Payroll reset — ${employees.length} records created` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.get('/:employeeId', getEmployeeSalaryHistory)
router.post('/', authorizeRoles('admin', 'hr_manager'), addSalaryRecord)
router.put('/:id/paid', authorizeRoles('admin'), markAsPaid)

module.exports = router